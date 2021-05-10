'use strict';
import mpath from 'mpath';
import { Schema, Query, Document } from 'mongoose';

export default function mongooseLeanDefaults(schema: Schema): void {
  const fn = attachDefaultsMiddleware(schema);
  schema.post('find', fn);
  schema.post('findOne', fn);
  schema.post('findOneAndUpdate', fn);
}

function attachDefaultsMiddleware(schema: Schema) {
  return function (this: Query<unknown, Document>, res: unknown) {
    attachDefaults.call(this, schema, res);
  };
}

interface DefaultInfo {
  path: string;
  default: unknown;
}

function attachDefaults(
  this: Query<unknown, Document>,
  schema: Schema,
  res: unknown,
  depth = 0,
) {
  if (res == null) {
    return;
  }

  if (this._mongooseOptions.lean && this._mongooseOptions.lean.defaults) {
    const projection: Record<string, unknown> = this.projection() || {};
    let projectionInclude: boolean | null = null;
    let projectedFields = Object.keys(projection).filter(
      (field) => field !== '_id',
    );
    if (depth > 0) {
      const depthProjectedFields: string[] = [];
      for (let index = 0; index < projectedFields.length; index++) {
        const field = projectedFields[index];
        const newProjectedField = field.split('.').slice(depth).join('.');
        if (newProjectedField.length > 0) {
          depthProjectedFields.push(newProjectedField);
        }
      }
      projectedFields = depthProjectedFields;
    }
    if (projectedFields.length > 0) {
      const definingProjection = projectedFields.find(
        (prop) =>
          projection[prop] != null && typeof projection[prop] !== 'object',
      );
      if (definingProjection != null) {
        projectionInclude = !!projection[definingProjection];
      }
    }

    const defaults: DefaultInfo[] = [];
    schema.eachPath(function (pathname, schemaType) {
      if (projectionInclude !== null) {
        const included = projectedFields.some(
          (path) =>
            pathname.indexOf(path) === 0 || path.indexOf(pathname) === 0,
        );
        if (projectionInclude && !included) {
          return;
        } else if (!projectionInclude && included) {
          return;
        }
      }
      // default in schema type
      if (
        // @ts-expect-error schemaType.options is a valid property
        schemaType.options &&
        // @ts-expect-error schemaType.options is a valid property
        Object.prototype.hasOwnProperty.call(schemaType.options, 'default')
      ) {
        // @ts-expect-error schemaType.options is a valid property
        defaults.push({ path: pathname, default: schemaType.options.default });
        // @ts-expect-error schemaType.defaultValue is a valid property
      } else if (schemaType.defaultValue !== undefined) {
        // default with SchemaType.default()
        // @ts-expect-error schemaType.defaultValue is a valid property
        defaults.push({ path: pathname, default: schemaType.defaultValue });
        // @ts-expect-error schemaType.instance is a valid property
      } else if (schemaType.instance === 'Array') {
        // arrays should default to an empty array
        defaults.push({ path: pathname, default: [] });
      } else if (pathname.includes('.')) {
        // create undefined nested defaults to create intermediate objects
        defaults.push({ path: pathname, default: undefined });
      }
    });

    let toApply = defaults;
    if (Array.isArray(this._mongooseOptions.lean.defaults)) {
      toApply = defaults.filter(({ path }) =>
        this._mongooseOptions.lean.defaults.includes(path),
      );
    }
    let _ret;
    if (Array.isArray(res)) {
      for (let i = 0; i < res.length; ++i) {
        attachDefaultsToDoc(schema, res[i], toApply);
      }
      _ret = res;
    } else {
      _ret = attachDefaultsToDoc(schema, res, toApply);
    }

    for (let i = 0; i < schema.childSchemas.length; ++i) {
      const _path = schema.childSchemas[i].model.path;
      const _schema = schema.childSchemas[i].schema;
      const _doc = mpath.get(_path, res);
      if (_doc == null) {
        continue;
      }
      attachDefaults.call(this, _schema, _doc, depth + 1);
    }

    return _ret;
  } else {
    return res;
  }
}

function attachDefaultsToDoc(
  schema: Schema,
  doc: unknown,
  defaults: DefaultInfo[],
) {
  if (doc == null) return;
  if (Array.isArray(doc)) {
    for (let i = 0; i < doc.length; ++i) {
      attachDefaultsToDoc(schema, doc[i], defaults);
    }
    return;
  }
  for (let i = 0; i < defaults.length; ++i) {
    const defaultToApply = defaults[i];
    if (!mpath.has(defaultToApply.path, doc)) {
      const pathSegments = defaultToApply.path.split('.');
      let cur = doc as Record<string, unknown>;
      for (let j = 0; j < pathSegments.length - 1; ++j) {
        cur[pathSegments[j]] = cur[pathSegments[j]] || {};
        cur = cur[pathSegments[j]] as Record<string, unknown>;
      }
      let _default = defaultToApply.default;
      if (typeof _default === 'function') {
        _default = _default.call(doc, doc);
      }
      cur[pathSegments[pathSegments.length - 1]] = _default;
    }
  }
}

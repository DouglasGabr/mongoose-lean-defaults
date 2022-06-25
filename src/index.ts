'use strict';
import mpath from 'mpath';
import mongoose, { Schema, Query, Document, SchemaType } from 'mongoose';

export interface MongooseLeanDefaultsOptions {
  defaults?: boolean;
}

export default function mongooseLeanDefaults(
  schema: Schema<any, any, any, any>,
  options?: MongooseLeanDefaultsOptions,
): void {
  const fn = attachDefaultsMiddleware(schema, options);
  schema.post('find', fn);
  schema.post('findOne', fn);
  schema.post('findOneAndUpdate', fn);
  schema.post('findOneAndRemove', fn);
  schema.post('findOneAndDelete', fn);
}

function attachDefaultsMiddleware(
  schema: Schema,
  options?: MongooseLeanDefaultsOptions,
) {
  return function (this: Query<unknown, Document>, res: unknown) {
    attachDefaults.call(this, schema, res, options);
  };
}

function attachDefaults(
  this: Query<unknown, Document>,
  schema: Schema,
  res: unknown,
  options?: MongooseLeanDefaultsOptions,
  prefix?: string,
) {
  if (res == null) {
    return res;
  }

  const shouldApplyDefaults: boolean =
    !!this._mongooseOptions.lean &&
    (this._mongooseOptions.lean.defaults ?? options?.defaults ?? false);

  if (shouldApplyDefaults) {
    if (Array.isArray(res)) {
      for (let i = 0; i < res.length; ++i) {
        attachDefaultsToDoc.call(this, schema, res[i], prefix);
      }
    } else {
      attachDefaultsToDoc.call(this, schema, res, prefix);
    }

    for (let i = 0; i < schema.childSchemas.length; ++i) {
      const _path = schema.childSchemas[i].model.path;
      const _schema = schema.childSchemas[i].schema;
      let _doc = mpath.get(_path, res);
      if (Array.isArray(_doc)) {
        _doc = _doc.flat();
        if (_doc.length === 0) {
          continue;
        }
      }
      if (_doc == null) {
        continue;
      }
      attachDefaults.call(
        this,
        _schema,
        _doc,
        options,
        prefix ? `${prefix}.${_path}` : _path,
      );
    }

    return res;
  } else {
    return res;
  }
}

function attachDefaultsToDoc(
  this: Query<unknown, Document>,
  schema: Schema,
  doc: unknown,
  prefix?: string,
) {
  if (doc == null) return;
  if (Array.isArray(doc)) {
    for (let i = 0; i < doc.length; ++i) {
      attachDefaultsToDoc.call(this, schema, doc[i], prefix);
    }
    return;
  }
  schema.eachPath((pathname, schemaType) => {
    if (pathname.endsWith('.$*')) {
      return;
    }
    if (this.selected()) {
      const fullPath = prefix ? `${prefix}.${pathname}` : pathname;
      // @ts-expect-error this._fields is private
      const fields: Record<string, unknown> | null = this._fields;
      if (fields) {
        const fieldKeys = Object.keys(fields);
        const matchedKey = fieldKeys.find(
          (key) => fullPath.startsWith(key) || key.startsWith(fullPath),
        );
        const included = matchedKey && fields[matchedKey] != null;
        if (this.selectedInclusively() && !included) {
          return;
        }
        if (this.selectedExclusively() && included) {
          return;
        }
      }
    }
    const pathSegments = pathname.split('.');
    let cur = doc as Record<string, unknown>;
    const lastIndex = pathSegments.length - 1;
    for (let j = 0; j < lastIndex; ++j) {
      cur[pathSegments[j]] = cur[pathSegments[j]] || {};
      cur = cur[pathSegments[j]] as Record<string, unknown>;
    }
    if (typeof cur[pathSegments[lastIndex]] === 'undefined') {
      let defaultValue = getDefault(schemaType, doc);
      if (typeof defaultValue === 'undefined') {
        return;
      }
      if (typeof defaultValue === 'function') {
        defaultValue = defaultValue.call(doc, doc);
      }
      cur[pathSegments[lastIndex]] = defaultValue;
    }
  });
}

function getDefault(schemaType: SchemaType, doc: unknown): unknown {
  // @ts-expect-error defaultValue is a valid prop
  if (typeof schemaType.defaultValue === 'function') {
    if (
      // @ts-expect-error defaultValue is a valid prop
      schemaType.defaultValue === Date.now ||
      // @ts-expect-error defaultValue is a valid prop
      schemaType.defaultValue === Array ||
      // @ts-expect-error defaultValue is a valid prop
      schemaType.defaultValue.name.toLowerCase() === 'objectid'
    ) {
      // @ts-expect-error defaultValue is a valid prop
      return schemaType.defaultValue.call(doc);
    } else {
      // @ts-expect-error defaultValue is a valid prop
      return schemaType.defaultValue.call(doc, doc);
    }
  } else if (
    Object.prototype.hasOwnProperty.call(schemaType.options, 'default')
  ) {
    return schemaType.options.default;
  } else if (
    ('Embedded' in mongoose.Schema.Types &&
      // @ts-expect-error Embedded exists in mongoose@5
      schemaType instanceof mongoose.Schema.Types.Embedded) ||
    ('Subdocument' in mongoose.Schema.Types &&
      schemaType instanceof mongoose.Schema.Types.Subdocument)
  ) {
    return {};
  } else {
    // @ts-expect-error defaultValue is a valid prop
    return schemaType.defaultValue;
  }
}

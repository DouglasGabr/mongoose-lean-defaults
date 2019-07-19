'use strict'

const mpath = require('mpath')

module.exports = function mongooseLeanDefaults(schema) {
  const fn = attachDefaultsMiddleware(schema)
  schema.pre('find', function () {
    if (typeof this.map === 'function') {
      this.map((res) => {
        fn.call(this, res)
        return res
      })
    } else {
      this.options.transform = (res) => {
        fn.call(this, res)
        return res
      }
    }
  })

  schema.post('find', fn)
  schema.post('findOne', fn)
  schema.post('findOneAndUpdate', fn)
}

function attachDefaultsMiddleware(schema) {
  return function (res) {
    attachDefaults.call(this, schema, res)
  }
}

function attachDefaults(schema, res) {
  const defaults = []
  schema.eachPath(function (pathname, schemaType) {
    if (schemaType.options && Object.prototype.hasOwnProperty.call(schemaType.options, 'default')) {
      defaults.push({ path: pathname, default: schemaType.options.default })
    } else if (schemaType.instance === 'Array') {
      defaults.push({ path: pathname, default: [] })
    }
  })

  if (res == null) {
    return
  }

  if (this._mongooseOptions.lean && this._mongooseOptions.lean.defaults) {
    let toApply = defaults
    if (Array.isArray(this._mongooseOptions.lean.defaults)) {
      toApply = defaults.filter(({ path }) => this._mongooseOptions.lean.defaults.includes(path))
    }
    let _ret
    if (Array.isArray(res)) {
      const len = res.length
      for (let i = 0; i < len; ++i) {
        attachDefaultsToDoc(schema, res[i], toApply)
      }
      _ret = res
    } else {
      _ret = attachDefaultsToDoc(schema, res, toApply)
    }

    for (let i = 0; i < schema.childSchemas.length; ++i) {
      const _path = schema.childSchemas[i].model.path
      const _schema = schema.childSchemas[i].schema
      const _doc = mpath.get(_path, res)
      if (_doc == null) {
        continue
      }
      attachDefaults.call(this, _schema, _doc)
    }

    return _ret
  } else {
    return res
  }
}

function attachDefaultsToDoc(schema, doc, defaults) {
  const numDefaults = defaults.length
  if (doc == null) return
  if (Array.isArray(doc)) {
    for (let i = 0; i < doc.length; ++i) {
      attachDefaultsToDoc(schema, doc[i], defaults)
    }
    return
  }
  for (let i = 0; i < numDefaults; ++i) {
    const toApply = defaults[i]
    if (!mpath.has(toApply.path, doc)) {
      const sp = toApply.path.split('.')
      let cur = doc
      for (let j = 0; j < sp.length - 1; ++j) {
        cur[sp[j]] = sp[j] in cur ? cur[sp[j]] : {}
        cur = cur[sp[j]]
      }
      cur[sp[sp.length - 1]] = toApply.default
    }
  }
}
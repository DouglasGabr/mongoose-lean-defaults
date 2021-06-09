# 2.0.1 / 2021-06-09

- Fixed: should work with typed Schema [#20](https://github.com/DouglasGabr/mongoose-lean-defaults/issues/20)

# 2.0.0 / 2021-05-12

- Fixed: should attach subdocument defaults when using projection [#18](https://github.com/DouglasGabr/mongoose-lean-defaults/issues/18) [#16](https://github.com/DouglasGabr/mongoose-lean-defaults/issues/16)
- Chore: migrate codebase to typescript
- BREAKING CHANGE: if using `require('mongoose-lean-defaults')`, you should update it to `require('mongoose-lean-defaults').default` (should not be a problem if using `import`)

# 1.0.1 / 2020-12-18

- Chore: add .npmignore to not bundle unnecessary files

# 1.0.0 / 2020-12-18

- Refactor: use Array#forEach() instead of Array#map() to improve memory usage [#14](https://github.com/DouglasGabr/mongoose-lean-defaults/pull/14) [Hafez](https://github.com/AbdelrahmanHafez)
- Fixed: handle `$slice` and `$elemMatch` projections [#12](https://github.com/DouglasGabr/mongoose-lean-defaults/pull/12) [Valeri Karpov](https://github.com/vkarpov15)
- Chore: bump version to 1.0.0, since there's no reason to keep it at 0.x, so future changes can be better represented by semver

# 0.4.1 / 2020-03-19

- Fixed: return defaults of fields which are nested inside projected object [#8](https://github.com/DouglasGabr/mongoose-lean-defaults/pull/8) [Vladimir Enchev](https://github.com/corsa1r)

# 0.4.0 / 2020-02-21

- Added: respect projection when attaching defaults

# 0.3.2 / 2020-01-02

- Fixed: old null values were breaking nested defaults

# 0.3.1 / 2019-09-28

- Added: support null value in SchemaType.default()

# 0.3.0 / 2019-09-28

- Added: support SchemaType.default() (Fixes: [#3](https://github.com/DouglasGabr/mongoose-lean-defaults/issues/3))
- Added: support nested objects without default values:
  ```javascript
  new Schema({
    obj: {
      prop: String,
    },
  });
  ```

# 0.2.0 / 2019-07-25

- Added: support default functions [#1](https://github.com/DouglasGabr/mongoose-lean-defaults/pull/1) [Valeri Karpov](https://github.com/vkarpov15)

# 0.1.1 / 2019-07-19

- Fixed: set default values in nested objects/schemas

0.4.0 / 2020-02-21
==================
 * Added: respect projection when attaching defaults

0.3.2 / 2020-01-02
==================
 * Fixed: old null values were breaking nested defaults

0.3.1 / 2019-09-28
==================
 * Added: support null value in SchemaType.default()

0.3.0 / 2019-09-28
==================
 * Added: support SchemaType.default() (Fixes: [#3](https://github.com/DouglasGabr/mongoose-lean-defaults/issues/3))
 * Added: support nested objects without default values:
    ```javascript
      new Schema({
        obj: {
          prop: String
        }
      })
    ```

0.2.0 / 2019-07-25
==================
 * Added: support default functions [#1](https://github.com/DouglasGabr/mongoose-lean-defaults/pull/1) [Valeri Karpov](https://github.com/vkarpov15)

0.1.1 / 2019-07-19
==================
 * Fixed: set default values in nested objects/schemas

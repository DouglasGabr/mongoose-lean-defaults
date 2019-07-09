# mongoose-lean-defaults

Attach defaults to the results of mongoose queries when using [`.lean()`](https://mongoosejs.com/docs/api.html#query_Query-lean).

## Usage

```javascript
const mongooseLeanDefaults = require('mongoose-lean-defaults');

const userSchema = new mongoose.Schema({ 
  name: {
    type: String,
    default: 'Bob'
  }
});
// documents will only have `name` field on database

// Later
const updatedUserSchema = new mongoose.Schema({ 
  name: {
    type: String,
    default: 'Bob'
  },
  country: {
    type: String,
    default: 'USA'
  }
});
// `.find().lean()` will return documents without `country` field

updatedUserSchema.plugin(mongooseLeanDefaults);

// You must pass `defaults: true` to `.lean()`
const bob = await UserModel.findOne().lean({ defaults: true });
/**
 * bob = {
 *    _id: ...,
 *    name: 'Bob',
 *    country: 'USA'
 * }
 */
```
import mongoose, { Model } from 'mongoose';
import mongooseLeanDefaults from '../../';

const { MONGO_URI = 'mongodb://localhost:27017/mongooseLeanDefaults' } =
  process.env;

const subSchema = new mongoose.Schema({
  subSchemaField: { subField1: { type: Boolean, default: false } },
});
const schema = new mongoose.Schema({
  schemaField: { type: subSchema, default: {} },
});
schema.plugin(mongooseLeanDefaults);

describe('Issue #26', () => {
  let MyModel: Model<any>;
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
    MyModel = mongoose.model('Test', schema);
  });

  beforeEach(async () => {
    await MyModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('populates default values', async () => {
    // Arrange
    await MyModel.collection.insertOne({});
    // Act
    const result = await MyModel.findOne({})
      .lean<any>({ defaults: true })
      .exec();
    // Assert
    expect(result.schemaField.subSchemaField.subField1).toBe(false);
  });
});

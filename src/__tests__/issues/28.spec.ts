import mongoose from 'mongoose';
import mongooseLeanDefaults from '../..';

const { MONGO_URI = 'mongodb://localhost:27017/mongooseLeanDefaults' } =
  process.env;

interface MySchema {
  name?: string | null;
}

const MySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Test',
    },
  },
  {
    collection: 'issues_28',
  },
);

MySchema.plugin(mongooseLeanDefaults, { defaults: true });

// https://github.com/DouglasGabr/mongoose-lean-defaults/issues/28
describe('Issue #28', () => {
  let MyModel: mongoose.Model<MySchema>;
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
    MyModel = mongoose.model('Test', MySchema);
  });

  beforeEach(async () => {
    await MyModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
  it('should work with global config turned on', async () => {
    await MyModel.collection.insertOne({});
    const result = await MyModel.findOne({}).lean().exec();
    expect(result?.name).toBe('Test');
  });
  it('should respect if false is forced in query', async () => {
    await MyModel.collection.insertOne({});
    const result = await MyModel.findOne({}).lean({ defaults: false }).exec();
    expect(result?.name).toBeUndefined();
  });
});

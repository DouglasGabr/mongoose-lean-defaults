import mongoose from 'mongoose';
import mongooseLeanDefaults from '../..';

const { MONGO_URI = 'mongodb://localhost:27017/mongooseLeanDefaults' } =
  process.env;

interface SubSchema {
  a: string | null | undefined;
}

interface MySchema {
  sub?: SubSchema | null;
}

const SubSchema = new mongoose.Schema({ a: String });

const MySchema = new mongoose.Schema(
  {
    sub: {
      type: SubSchema,
      default: undefined,
    },
  },
  {
    collection: 'issues_28',
  },
);

MySchema.plugin(mongooseLeanDefaults, { defaults: true });

// https://github.com/DouglasGabr/mongoose-lean-defaults/issues/29
describe('Issue #29', () => {
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
  it('should not apply defaults if lean is not used', async () => {
    await MyModel.collection.insertOne({});
    const result = await MyModel.findOne({}).exec();
    expect(result?.sub).toBeUndefined();
  });
});

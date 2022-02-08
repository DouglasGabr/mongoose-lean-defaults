import mongoose from 'mongoose';
import mongooseLeanDefaults from '../../';

const { MONGO_URI = 'mongodb://localhost:27017/mongooseLeanDefaults' } =
  process.env;

interface Doc {
  mapField?: Map<string, mongoose.Schema.Types.ObjectId> | null;
}

const MySchema = new mongoose.Schema({
  mapField: { type: Map, of: 'ObjectId' },
});

MySchema.plugin(mongooseLeanDefaults);

describe('Issue #24', () => {
  let MyModel: mongoose.Model<Doc>;
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
    MyModel = mongoose.model('SchemaWithMap', MySchema);
  });
  beforeEach(async () => {
    await MyModel.deleteMany({});
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });
  it('should not add any property in mapField', async () => {
    await MyModel.create({});
    const result = await MyModel.findOne({}).lean({ defaults: true }).exec();
    expect(result!.mapField).toBeUndefined();
  });
});

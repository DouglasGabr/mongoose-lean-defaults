import mongoose, { Model } from 'mongoose';
import mongooseLeanDefaults from '../../';

const { MONGO_URI = 'mongodb://localhost:27017/mongooseLeanDefaults' } =
  process.env;

interface MySchema {
  name?: string | null;
  subField: MySchema[];
}

const MySchema = new mongoose.Schema({
  name: String,
});

const Test = new mongoose.Schema({ subField: { type: [MySchema] } });
MySchema.add(Test);

MySchema.plugin(mongooseLeanDefaults);

describe('Issue #25', () => {
  let MyModel: Model<MySchema>;
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
    MyModel = mongoose.model('RecursiveSchema', MySchema);
  });

  beforeEach(async () => {
    await MyModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('does not fail with stack overflow for recursive schemas', async () => {
    // Arrange
    await MyModel.collection.insertOne({
      name: 'test',
      subField: [
        {
          subField: [
            {
              name: 'test',
            },
          ],
        },
      ],
    });
    // Act
    const result = await MyModel.findOne({}).lean({ defaults: true }).exec();
    // Assert
    expect(result!.subField[0].subField[0].subField).toHaveLength(0);
  });
});

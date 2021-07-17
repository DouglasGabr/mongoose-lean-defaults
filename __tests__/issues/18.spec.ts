import mongoose from 'mongoose';
import mongooseLeanDefaults from '../../src';

const { MONGO_URI = 'mongodb://localhost:27017/mongooseLeanDefaults' } =
  process.env;

interface Author {
  name: string;
  books?: Array<{
    title: string;
    chapters?: Array<{
      title: string;
      page: number;
    }>;
  }>;
}
const AuthorSchema = new mongoose.Schema(
  {
    name: String,
    books: {
      type: [
        {
          title: String,
          chapters: {
            type: [{ title: String, page: Number }],
            required: false,
            _id: false,
          },
        },
      ],
      required: false,
      _id: false,
    },
  },
  { collection: 'authors' },
);
AuthorSchema.plugin(mongooseLeanDefaults);

const _id = mongoose.Types.ObjectId('6089736a9a16b50a4bd6e26e');

// https://github.com/DouglasGabr/mongoose-lean-defaults/issues/18
describe('Issue #18', () => {
  let AuthorModel: mongoose.Model<Author & mongoose.Document>;

  beforeAll(async () => {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    AuthorModel = mongoose.model('Author', AuthorSchema);
  });

  beforeEach(async () => {
    await AuthorModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should attach subdocument defaults when using projection', async () => {
    // Arrange
    await AuthorModel.collection.insertOne({
      _id: _id,
      name: 'Robert Martin',
      books: [{ title: 'Clean Code' }], // chapters are missing on purpose
    });
    // Act
    const withoutProjection = await AuthorModel.findOne({ _id }).lean({
      defaults: true,
    });
    const withProjections = await AuthorModel.findOne(
      { _id },
      { name: 1, 'books.title': 1 },
    ).lean({ defaults: true });
    // Assert
    expect(withoutProjection!.books![0].chapters).toStrictEqual([]);
    expect(withProjections!.books![0].chapters).toStrictEqual([]);
  });
});

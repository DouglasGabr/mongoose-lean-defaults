import mongoose, { Model, Schema } from 'mongoose';
import mongooseLeanDefaults from '..';

interface IProjection {
  a: string;
  b: {
    a: string;
    b: string;
  };
  c: {
    a: {
      a: string;
      b: string;
    };
    b: {
      a: string;
      b: string;
    };
  };

  childA: {
    a: string;
    b: string;
  };
  childB: {
    a: {
      a: string;
      b: string;
    };
    b: {
      a: string;
      b: string;
    };
  };

  subChildA: Array<{
    a: {
      a: string;
      b: string;
    };
    b: {
      a: string;
      b: string;
    };
  }>;
}

const childSchema = new Schema({
  a: { type: String, default: 'a' },
  b: { type: String, default: 'b' },
});

const subChildSchema = new Schema({
  a: childSchema,
  b: childSchema,
});

const schema = new Schema<IProjection>(
  {
    a: { type: String, default: 'a' },
    b: {
      a: { type: String, default: 'a' },
      b: { type: String, default: 'b' },
    },
    c: {
      a: {
        a: { type: String, default: 'a' },
        b: { type: String, default: 'b' },
      },
      b: {
        a: { type: String, default: 'a' },
        b: { type: String, default: 'b' },
      },
    },
    childA: childSchema,
    childB: {
      a: childSchema,
      b: childSchema,
    },
    subChildA: [subChildSchema],
  },
  { collection: 'projection' },
);

schema.plugin(mongooseLeanDefaults);

const { MONGO_URI = 'mongodb://localhost:27017/mongooseLeanDefaults' } =
  process.env;
describe('projections', () => {
  let MyModel: Model<IProjection>;
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
    MyModel = mongoose.model('Projection', schema);
  });

  beforeEach(async () => {
    await MyModel.deleteMany({}).exec();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should respect projections', async () => {
    // arrange
    await MyModel.collection.insertOne({
      subChildA: [
        {
          b: { b: 'b' },
        },
      ],
    });
    // act
    const result = (await MyModel.findOne({})
      .select({
        a: 1,
        b: 1,
        'c.a': 1,
        'c.b.a': 1,
        childA: 1,
        'childB.a': 1,
        'childB.b.a': 1,
        'subChildA.a': 1,
        'subChildA.b.a': 1,
      })
      .lean({ defaults: true })
      .exec())!;
    // assert
    expect(result.a).toEqual('a');
    expect(result.b).toEqual(expect.objectContaining({ a: 'a', b: 'b' }));
    expect(result.c.a).toEqual(expect.objectContaining({ a: 'a', b: 'b' }));
    expect(result.c.b.a).toEqual('a');
    expect(result.c.b.b).toBeUndefined();
    expect(result.childA).toBeUndefined();
    expect(result.childB).toBeUndefined();
    expect(result.subChildA[0].a).toBeUndefined();
    expect(result.subChildA[0].b.a).toEqual('a');
    expect(result.subChildA[0].b.b).toBeUndefined();
  });

  it('should match Mongoose default behavior', async () => {
    // arrange
    await MyModel.collection.insertOne({
      subChildA: [
        {
          b: { b: 'b' },
        },
      ],
    });
    // act
    const selectQuery = {
      a: 1,
      b: 1,
      'c.a': 1,
      'c.b.a': 1,
      childA: 1,
      'childB.a': 1,
      'childB.b.a': 1,
      'subChildA.a': 1,
      'subChildA.b.a': 1,
    };
    const leanResult = (await MyModel.findOne({})
      .select(selectQuery)
      .lean({ defaults: true })
      .exec())!;
    const hydratedResult = (await MyModel.findOne({})
      .select(selectQuery)
      .exec())!;
    // assert
    expect(leanResult).toStrictEqual(hydratedResult.toObject());
  });
});

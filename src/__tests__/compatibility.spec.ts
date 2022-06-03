import mongoose from 'mongoose';
import mongooseLeanDefaults from '..';
import mongooseLeanGetters from 'mongoose-lean-getters';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

interface IComp {
  _id: mongoose.Types.ObjectId;
  id: string;
  a: string;
  withGet: any;
  old?: string;
  nested: {
    prop: boolean;
  };
}

const schema = new mongoose.Schema<IComp>(
  {
    a: String,
    withGet: {
      type: [
        {
          type: {
            type: String,
            enum: ['text', 'image', 'video'],
            default: 'text',
          },
          value: mongoose.Schema.Types.Mixed,
        },
      ],
      get(this: IComp, value: IComp['withGet']) {
        if ((value?.length ?? 0) === 0 && this.old) {
          return [
            {
              type: 'text',
              value: this.old,
            },
          ] as IComp['withGet'];
        }
        return value;
      },
    },
    nested: {
      prop: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    collection: 'compatibility',
    timestamps: true,
    versionKey: '_version',
    toJSON: {
      virtuals: true,
    },
  },
);

schema.plugin(mongooseLeanVirtuals);
schema.plugin(mongooseLeanDefaults);
schema.plugin(mongooseLeanGetters);

const { MONGO_URI = 'mongodb://localhost:27017/mongooseLeanDefaults' } =
  process.env;
describe('Compatibility test', () => {
  let MyModel: mongoose.Model<IComp>;
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
    MyModel = mongoose.model('Comp', schema);
  });

  beforeEach(async () => {
    await MyModel.deleteMany({}).exec();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should work with other lean libraries', async () => {
    // arrange
    const res = await MyModel.collection.insertOne({
      a: 'a',
      old: 'a',
      nested: {},
    });
    // act
    const [comp] = await MyModel.find({
      _id: res.insertedId,
    })
      .lean({ virtuals: true, defaults: true, getters: true })
      .exec();
    // assert
    expect(comp.nested.prop).toBe(true);
    expect(comp.id).toBe(res.insertedId.toHexString());
    expect(comp.withGet).toContainEqual(
      expect.objectContaining({ type: 'text', value: 'a' }),
    );
  });
});

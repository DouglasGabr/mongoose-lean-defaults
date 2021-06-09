import { Model, Schema, Document } from 'mongoose';
import mongooseLeanDefaults from '../../src/index';

describe('Issue #20', () => {
  it('works with typed Schema', () => {
    interface ITest {
      name: string;
    }

    const testSchema = new Schema<ITest & Document, Model<ITest & Document>>({
      name: {
        type: String,
        required: true,
        default: 'default',
      },
    });

    testSchema.plugin(mongooseLeanDefaults);
    expect.assertions(0);
  });
});

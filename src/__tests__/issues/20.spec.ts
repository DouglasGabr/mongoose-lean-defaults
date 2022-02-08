import { Model, Schema } from 'mongoose';
import mongooseLeanDefaults from '../../';

describe('Issue #20', () => {
  it('works with typed Schema', () => {
    interface ITest {
      name: string;
    }

    const testSchema = new Schema<ITest, Model<ITest>>({
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

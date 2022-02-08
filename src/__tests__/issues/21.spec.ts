import mongoose, { Model, Schema } from 'mongoose';
import mongooseLeanDefaults from '../../';

const { MONGO_URI = 'mongodb://localhost:27017/mongooseLeanDefaults' } =
  process.env;

const OperationSchema = new Schema(
  {
    name: {
      type: String,
      index: true,
      trim: true,
      required: [true, 'Name is required'],
    },
    status: {
      type: String,
      enum: ['new', 'active', 'deinstalled'],
      default: 'new',
      required: [true, 'Status is required'],
    },
    is_supported: {
      type: Boolean,
      default: false,
    },
    start_datetime: {
      type: Date,
      index: true,
      default: Date.now,
    },
    active_datetime: {
      type: Date,
    },
    end_datetime: {
      type: Date,
      index: true,
    },
    change_datetime: {
      type: Date,
    },
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },
    seller_id: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: [true, 'Seller is required'],
    },
    customer_venue_id: {
      type: String,
      trim: true,
      index: { sparse: true },
    },
    modules: {
      type: [String],
    },
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    zip: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
      default: 'Europe/Bratislava',
    },
    location: {
      type: Schema.Types.Mixed,
      index: '2dsphere',
    },
    is_closed_time_monitoring: {
      type: Boolean,
      default: true,
    },
    is_longer_timeout_monitoring: {
      type: Boolean,
      default: false,
    },
    is_outage_notification: {
      type: Boolean,
      default: true,
    },
    store_type: {
      type: String,
      enum: ['1', '2', '3'],
      trim: true,
    },
    industry: {
      type: String,
      enum: ['1', '2', '3', '4'],
      trim: true,
    },
  },
  {
    id: false,
  },
);

OperationSchema.plugin(mongooseLeanDefaults);

const existingDocumentInDB = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test venue',
  street: 'Street 18,',
  zip: '12345',
  country: 'sk',
  city: 'City',
  organization_id: new mongoose.Types.ObjectId(),
  location: {
    coordinates: [20, 50],
    type: 'Point',
  },
  timezone: 'Europe/Berlin',
  modules: ['module'],
  __v: 0,
  seller_id: new mongoose.Types.ObjectId(),
  start_datetime: new Date('2015-01-01T00:00:00.000Z'),
  is_closed_time_monitoring: false,
  is_longer_timeout_monitoring: false,
  is_outage_notification: false,
  status: 'active',
};

describe('Issue #21', () => {
  let OperationModel: Model<any>;
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
    OperationModel = mongoose.model('Operation', OperationSchema);
  });

  beforeEach(async () => {
    await OperationModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('populates default values', async () => {
    // Arrange
    await OperationModel.collection.insertOne(existingDocumentInDB);
    // Act
    const result = await mongoose
      .model('Operation')
      .findOne({})
      .lean<any>({ defaults: true })
      .exec();
    // Assert
    expect(result.is_supported).toBe(false);
  });
});

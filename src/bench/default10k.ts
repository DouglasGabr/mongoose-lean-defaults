import mongoose from 'mongoose';
import { attachDefaults } from '../index';
import { performance } from 'perf_hooks';

export function benchDefault10k() {
  const Schema = new mongoose.Schema(
    {
      prop1: { type: String, default: 'prop1' },
      prop2: {
        nestedProp1: {
          type: String,
          default: 'nestedProp1',
        },
        nestedProp2: {
          type: Boolean,
          default: true,
        },
        nestedProp3: String,
      },
      // Implementation should not traverse all of the below properties when applying defaults
      prop3: [
        {
          _id: false,
          nestedProp1: String,
          nestedProp2: Boolean,
          nestedProp3: Number,
          nestedProp4: String,
        },
      ],
      prop4: Number,
      prop5: String,
      prop6: Boolean,
      prop7: String,
      prop8: String,
      prop9: String,
      prop10: String,
      prop11: String,
      prop12: String,
      prop13: String,
      prop14: String,
      prop15: String,
    },
    { collection: 'bench' },
  );

  const Model = mongoose.model('Model', Schema);

  function makeData(count: number) {
    return Array.from({ length: count }, () => ({
      _id: new mongoose.Types.ObjectId(),
      prop3: [
        Array.from({ length: 10 }, () => ({
          nestedProp1: 'nestedProp1',
        })),
      ],
    }));
  }

  const query = Model.find().lean({ defaults: true });

  // Warmup 5x
  for (let i = 0; i < 5; i++) {
    attachDefaults.call(query, Schema, makeData(10000));
  }

  // Run
  const data = makeData(10000);
  const start = performance.now();
  attachDefaults.call(query, Schema, data);
  const end = performance.now();

  console.log(`default10k: applying defaults took ${end - start} ms`);
}

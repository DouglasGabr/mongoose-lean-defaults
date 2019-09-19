const mongoose = require('mongoose')
const mongooseLeanDefaults = require('../')

function validateRegularBob(bob) {
  expect(bob.country).toBeUndefined()
  expect(bob.aliases).toBeUndefined()
  expect(bob.arrayWithDefault).toBeUndefined()
  expect(bob.nested).toBeUndefined()
}
function validateBob(bob) {
  expect(bob.country).toBe('USA')
  expect(bob.aliases).toBeDefined()
  expect(bob.aliases).toHaveLength(0)
  expect(bob.arrayWithDefault).toBeUndefined()
  expect(bob.nested).toBeDefined()
  expect(bob.nested.prop).toBe('Default')
  expect(bob.nested.other).toBe(true)
  expect(bob.nested.noDefault).toBeUndefined()
  expect(bob.fnDefault).toBe('Bob')
}
function validateAlice(alice) {
  expect(alice.country).toBe('CA')
  expect(alice.aliases).toBeDefined()
  expect(alice.arrayWithDefault).toBeUndefined()
  expect(alice.nested).toBeDefined()
  expect(alice.nested.prop).toBe('Prop')
  expect(alice.nested.other).toBe(false)
  expect(alice.nested.noDefault).toBe('Test')
  expect(alice.fnDefault).toBe('Alice')
}

const bobId = '5d23fa87d7f8b00011fa25c5'
const aliceId = '5d23fa87d7f8b00011fa25c6'

const { MONGO_URI = 'mongodb://localhost:27017/mongooseLeanDefaults' } = process.env

describe('mongooseLeanDefaults', () => {
  let schema
  let User

  beforeAll(async done => {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true })
    const oldSchema = new mongoose.Schema({
      name: String
    }, { collection: 'users' })
    const OldUser = mongoose.model('OldUser', oldSchema)
    await OldUser.create({
      _id: bobId,
      name: 'Bob'
    })

    schema = new mongoose.Schema({
      name: String,
      country: { type: String, default: 'USA' },
      aliases: [String],
      arrayWithDefault: { type: [String], default: undefined },
      nested: {
        prop: {
          type: String,
          default: 'Default'
        },
        other: {
          type: Boolean,
          default: true
        },
        noDefault: String
      },
      fnDefault: { type: String, default: function() { return this.name; } }
    }, { collection: 'users' })
    schema.plugin(mongooseLeanDefaults)
    User = mongoose.model('User', schema)
    await User.create({
      _id: aliceId,
      name: 'Alice',
      country: 'CA',
      aliases: ['Ally'],
      nested: {
        prop: 'Prop',
        other: false,
        noDefault: 'Test'
      }
    })
    done()
  })

  it('should work with findOne()', async done => {
    validateRegularBob(await User.findOne({ name: 'Bob' }).lean())
    validateAlice(await User.findOne({ name: 'Alice' }).lean())

    validateBob(await User.findOne({ name: 'Bob' }).lean({ defaults: true }))
    validateAlice(await User.findOne({ name: 'Alice' }).lean({ defaults: true }))
    done()
  })

  it('should work with find()', async done => {
    const regularRes = await User.find().lean()
    validateRegularBob(regularRes.find(u => u.name === 'Bob'))
    validateAlice(regularRes.find(u => u.name === 'Alice'))

    const res = await User.find().lean({ defaults: true })
    validateBob(res.find(u => u.name === 'Bob'))
    validateAlice(res.find(u => u.name === 'Alice'))
    done()
  })

  it('should work with findById()', async done => {
    validateRegularBob(await User.findById(bobId).lean())
    validateAlice(await User.findById(aliceId).lean())

    validateBob(await User.findById(bobId).lean({ defaults: true }))
    validateAlice(await User.findById(aliceId).lean({ defaults: true }))
    done()
  })

  afterAll(async done => {
    await User.deleteMany()
    await mongoose.disconnect()
    done()
  })

})

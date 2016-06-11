const test = require('tape')
const union = require('../src/union')

const TestType = union({
  Zero: [],
  One: ['x'],
  Two: ['x', 'y'],
  Three: ['x', 'y', 'z']
})

test.only('instances and types', (t) => {
  t.throws(() => { TestType() }, TypeError, 'union type itself can not be used as a factory')
  t.throws(() => { new TestType() }, TypeError, 'union type itself can not be used with new')
  t.doesNotThrow(() => { new TestType.Zero() }, TypeError, 'one of union type factories can be used with new')
  t.doesNotThrow(() => { TestType.Zero() }, TypeError, 'one of union type factories should be used without new')
  console.log(TestType)
  console.log(TestType.prototype)
  console.log(TestType.Zero)
  console.log(TestType.Zero.prototype)
  console.log(TestType.Zero())
  console.log(TestType.Zero().constructor)
  t.equals(TestType.Zero().constructor, TestType.Zero, 'instance constructor is set correctly')
  t.equals(TestType.Zero().constructor.name, 'Zero', 'instance constructor.name is set correctly')
  t.ok(TestType.Zero() instanceof TestType.Zero, 'instance is instanceof constructor')
  t.ok(TestType.Zero() instanceof TestType, 'instance is instanceof base constructor')
  t.ok(TestType.Zero() instanceof Object, 'instance is instanceof Object as well')
  t.equals(typeof TestType, 'function', 'typeof base union type')
  t.equals(typeof TestType.Zero, 'function', 'typeof type factory')
  t.equals(typeof TestType.Zero(), 'object', 'typeof constructed object')
  t.end()
})

test('equality comparison', (t) => {
  t.deepEqual(TestType.Zero(), TestType.Zero())
  t.notDeepEqual(TestType.Zero(), {})

  t.deepEqual(TestType.One(1), TestType.One(1))
  t.deepEqual(TestType.One(1), TestType.One({ x: 1 }))
  t.deepEqual(TestType.One({ x: 1 }), TestType.One({ x: 1 }))
  t.notDeepEqual(TestType.One(1), TestType.One(2))
  t.notDeepEqual(TestType.One({ x: 1 }), TestType.One({ x: 2 }))
  t.notDeepEqual(TestType.One(1), { x: 1 })
  t.notDeepEqual(TestType.One({ x: 1 }), { x: 1 })

  t.deepEqual(TestType.Two(1, 2), TestType.Two({ x: 1, y: 2 }))
  t.notDeepEqual(TestType.Two({ x: 1, y: 2 }), TestType.Two({ x: 2, y: 1 }))
  t.end()
})

test('matching', (t) => {
  t.equals(TestType.Zero().match({ Zero: 1 }), 1)
  t.equals(TestType.Zero().match({ Zero: () => 1 }), 1)
  t.deepEqual(TestType.Zero().match({ Zero: (x) => x }), TestType.Zero())
  t.deepEqual(TestType.Zero().match({}), undefined)

  t.equals(TestType.One(1).match({ One: 2 }), 2)
  t.equals(TestType.One(1).match({ One: () => 2 }), 2)
  t.deepEqual(TestType.One(1).match({ One: (p) => p }), { x: 1 })
  t.equals(TestType.One(1).match({ One: ({ x }) => x }), 1)
  t.deepEqual(TestType.One(1).match({ _: (x) => x }), TestType.One(1))

  t.end()
})

// const Person = record({
//   firstName: String,
//   lastName: String,
//   contact: union({
//     Email: ['address'],
//     Phone: ['number']
//   })
// })
// const joe = Person({ firstName: 'Joe', lastName: 'Doe', contact: Person.contact.Email('joe@example.com') })

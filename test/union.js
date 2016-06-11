const test = require('tape')
const union = require('../src/union')

const TestType = union({
  Zero: [],
  One: ['x'],
  Two: ['x', 'y'],
  Three: ['x', 'y', 'z']
})

test('instances and types', (t) => {
  t.throws(() => { TestType() }, TypeError, 'union type itself can not be used as a factory')
  t.throws(() => { new TestType() }, TypeError, 'union type itself can not be used with new')
  t.doesNotThrow(() => { new TestType.Zero() }, TypeError, 'one of union type factories can be used with new')
  t.doesNotThrow(() => { TestType.Zero() }, TypeError, 'one of union type factories should be used without new')
  // console.log(TestType)
  // console.log(TestType.prototype)
  // console.log(TestType.Zero)
  // console.log(TestType.Zero.prototype)
  // console.log(TestType.Zero())
  // console.log(TestType.Zero().constructor)
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
  t.deepEqual(TestType.Zero(), TestType.Zero(), 'instances created with same constructor')
  t.notDeepEqual(TestType.Zero(), {}, 'instance and plain object')

  console.log(TestType.One({ x: 1 }), { x: 1 })
  t.deepEqual(TestType.One(1), TestType.One(1), 'instances created with same constructor and positional args')
  t.deepEqual(TestType.One({ x: 1 }), TestType.One({ x: 1 }), 'instances created with same constructor and object args')
  t.deepEqual(TestType.One(1), TestType.One({ x: 1 }), 'instances created with same constructor and positional args and object args')
  t.notDeepEqual(TestType.One(1), TestType.One(2), 'instances created with diff positional args')
  t.notDeepEqual(TestType.One({ x: 1 }), TestType.One({ x: 2 }), 'instances created with diff object args')
  t.notDeepEqual(TestType.One(1), { x: 1 }, 'instance created with positional args and plain object')
  t.notDeepEqual(TestType.One({ x: 1 }), { x: 1 }, 'instance and plain object')

  t.deepEqual(TestType.Two(1, 2), TestType.Two({ x: 1, y: 2 }), 'instances created with position args vs object args')
  t.end()
})

test('matching', (t) => {
  t.equals(TestType.Zero().match({ Zero: 1 }), 1, 'matches a value')
  t.equals(TestType.Zero().match({ Zero: () => 1 }), 1, 'matches a function returning value')
  t.deepEqual(TestType.Zero().match({ Zero: (x) => x }), {}, 'matches a identity function and returns args')
  t.equals(TestType.Zero().match({}), undefined, 'no match returns undefined value')

  t.deepEqual(TestType.One(1).match({ One: (p) => p }), { x: 1 }, 'matches an identity function 2 and returns args')
  t.equals(TestType.One(1).match({ One: ({ x }) => x }), 1, 'matches function and deconstructs args')
  t.deepEqual(TestType.One(1).match({ _: (x) => x }), { x: 1 }, 'matches a wildcard and returns args')

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

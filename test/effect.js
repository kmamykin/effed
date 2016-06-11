const test = require('tape')
const { isEffect, Effects } = require('../src/effect')

const effects = Effects({
  Zero: [],
  One: ['x'],
  Two: ['x', 'y'],
  Three: ['x', 'y', 'z']
})

test('instances and types', (t) => {
  t.deepEqual(typeof effects.Zero(), 'Zero', 'typeof returns the name of constructor')
  t.ok(effects.Zero() instanceof effects.Zero)
  t.end()
})

test('equality comparison', (t) => {
  t.deepEqual(effects.Zero(), effects.Zero())
  t.notDeepEqual(effects.Zero(), {})

  t.deepEqual(effects.One(1), effects.One(1))
  t.deepEqual(effects.One(1), effects.One({ x: 1 }))
  t.deepEqual(effects.One({ x: 1 }), effects.One({ x: 1 }))
  t.notDeepEqual(effects.One(1), effects.One(2))
  t.notDeepEqual(effects.One({ x: 1 }), effects.One({ x: 2 }))
  t.notDeepEqual(effects.One(1), { x: 1 })
  t.notDeepEqual(effects.One({ x: 1 }), { x: 1 })

  t.deepEqual(effects.Two(1, 2), effects.Two({ x: 1, y: 2 }))
  t.notDeepEqual(effects.Two({ x: 1, y: 2 }), effects.Two({ x: 2, y: 1 }))
  t.end()
})

test('matching', (t) => {
  t.equals(effects.Zero().match({ Zero: 1 }), 1)
  t.equals(effects.Zero().match({ Zero: () => 1 }), 1)
  t.deepEqual(effects.Zero().match({ Zero: (x) => x }), effects.Zero())
  t.deepEqual(effects.Zero().match({}), undefined)

  t.equals(effects.One(1).match({ One: 2 }), 2)
  t.equals(effects.One(1).match({ One: () => 2 }), 2)
  t.deepEqual(effects.One(1).match({ One: (p) => p }), { x: 1 })
  t.equals(effects.One(1).match({ One: ({ x }) => x }), 1)
  t.deepEqual(effects.One(1).match({ _: (x) => x }), effects.One(1))

  t.end()
})

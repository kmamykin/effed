const test = require('tape')
const { isEffect, Effects } = require('../src/effect')

const effects = Effects({
  Zero: [],
  One: ['x'],
  Two: ['x', 'y'],
  Three: ['x', 'y', 'z']
})

test('isEffect', (t) => {
  t.ok(isEffect(effects.Zero()))
})

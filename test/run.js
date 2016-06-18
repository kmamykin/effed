const test = require('tape')
const { createRunner } = require('../src/index')

test('run', (t) => {
  const echoRunner = (effects = []) => (next) => (effect) => {
    effects.push(effect)
    return Promise.resolve({ resultOf: effect })
  }

  t.test('accepts primitive and objects and returns then in a promise, but dos not run them', (tt) => {
    const sym = Symbol('symbol')
    const fn = () => {}
    const effects = []
    const run = createRunner(echoRunner(effects))
    Promise.all(['a string', 100, true, sym, { a: 1 }, fn].map(run)).then(result => {
      tt.deepEqual(result, ['a string', 100, true, sym, { a: 1 }, fn])
      tt.deepEqual(effects, [])
      tt.end()
    }).catch(tt.end)
  })
  t.test('accepts single effect')
  // accepting iterable is ambiguous, a string is iterable
  t.test('accepts iterator', (tt) => {
    const effect1 = { type: 'effect1' }
    const effect2 = { type: 'effect2' }
    const effects = []
    const run = createRunner(echoRunner(effects))
    run([effect1, effect2][Symbol.iterator]()).then(result => {
      tt.equals(result, undefined, 'iterators like an array yield { value: undefined, done: true } at the end')
      tt.deepEqual(effects, [effect1, effect2], 'all effects yielded by iterator are offered to runners')
      tt.end()
    }).catch(tt.end)
  })

  // result of gen func executed
  t.test('accepts generator', (tt) => {
    const effect = { type: 'effect' }
    const effects = []
    const run = createRunner(echoRunner(effects))
    const script = function * () {
      return yield effect
    }
    run(script()).then(result => {
      tt.deepEqual(result, { resultOf: effect })
      tt.deepEqual(effects, [effect])
      tt.end()
    }).catch(tt.end)
  })

  t.test('accepts generator function', (tt) => {
    // sometimes its just easier to run generator function
    // defined inline
    const effect = { type: 'effect' }
    const effects = []
    const run = createRunner(echoRunner(effects))
    run(function * () {
      return yield effect
    }).then(result => {
      tt.deepEqual(result, { resultOf: effect })
      tt.deepEqual(effects, [effect])
      tt.end()
    }).catch(tt.end)
  })
})

const { parallel, middleware } = require('../src/combinators')

// compose runners - sequential or parallel execution?
test('composing effects', (t) => {

  const echoRunner = () => (next) => (effect) => {
    return Promise.resolve({ resultOf: effect })
  }
  const run = createRunner(middleware, echoRunner())

  t.test('parallel composition of several effects', (tt) => {
    const effect1 = { type: 'effect1' }
    const effect2 = { type: 'effect2' }
    run(function * () {
      return yield parallel(effect1, effect2)
    }).then(result => {
      tt.deepEqual(result, [{ resultOf: effect1 }, { resultOf: effect2 }])
      tt.end()
    }).catch(tt.end)
  })
  t.test('parallel composition of array of effects', (tt) => {
    const effect1 = { type: 'effect1' }
    const effect2 = { type: 'effect2' }
    run(function * () {
      return yield parallel([effect1, effect2])
    }).then(result => {
      tt.deepEqual(result, [{ resultOf: effect1 }, { resultOf: effect2 }])
      tt.end()
    }).catch(tt.end)
  })
})
// higher order runners? (wrapping runners)

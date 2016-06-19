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

  t.test('throws an error if effect is unhandled by middleware', (tt) => {
    const effect = { type: 'effect' }
    const run = createRunner()
    run(function * () {
      return yield effect
    }).then(result => {
      tt.fail('should reject')
    }).catch(err => {
      tt.end()
    })
  })
})

const { parallel, race, timeout, middleware } = require('../src/combinators')

// compose runners - sequential or parallel execution?
test('high-level composition of effects', (t) => {

  const effect1 = { type: 'effect1' }
  const effect2 = { type: 'effect2' }
  const effect3 = { type: 'effect3' }

  const echoRunner = () => (next) => (effect) => {
    return Promise.resolve({ resultOf: effect })
  }
  const run = createRunner(middleware, echoRunner())

  t.test('parallel', (tt) => {
    tt.deepEqual(parallel(effect1, effect2), parallel([effect1, effect2]), 'takes multiple args or an array')
    run(function * () {
      return yield parallel(effect1, effect2)
    }).then(result => {
      tt.deepEqual(result, [{ resultOf: effect1 }, { resultOf: effect2 }], 'resolves with an array of results')
      tt.end()
    }).catch(tt.end)
  })

  t.test('race', (tt) => {
    tt.deepEqual(race(effect1, effect2), race([effect1, effect2]), 'takes multiple args or an array')
    run(function * () {
      return yield race(effect1, effect2)
    }).then(result => {
      tt.deepEqual(result, { resultOf: effect1 }, 'resolves with the result of an effect resolved first') // first effect will get resolved firsts. Is it deterministic enough for tests?
      tt.end()
    }).catch(tt.end)
  })

  // t.test('race of race', (tt) => {
  //   run(function * () {
  //     return yield race(race(effect1, effect2), effect3)
  //   }).then(result => {
  //     tt.deepEqual(result, { resultOf: effect1 }, 'resolves with the result of an effect resolved first') // first effect will get resolved firsts. Is it deterministic enough for tests?
  //     tt.end()
  //   }).catch(tt.end)
  // })

  t.test('timeout', (tt) => {
    run(function * () {
      return yield timeout(100)
    }).then(result => {
      tt.equals(result, undefined, 'resolves with undefined result')
      tt.end()
    }).catch(tt.end)
  })
})
// higher order runners? (wrapping runners)

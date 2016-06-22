const test = require('tape')
const { createRunner } = require('../src/index')
const { parallel, race, timeout, middleware } = require('../src/combinators')

const effect1 = { type: 'effect1' }
const effect2 = { type: 'effect2' }
const effect3 = { type: 'effect3' }

const echoRunner = () => (run) => (next) => (effect) => {
  return Promise.resolve({ resultOf: effect })
}
const run = createRunner(middleware, echoRunner())

test('run', (t) => {
  const loggingRunner = (effects = []) => (run) => (next) => (effect) => {
    effects.push(effect)
    return Promise.resolve({ resultOf: effect })
  }

  t.test('accepts primitive and objects and returns then in a promise, but dos not run them', (tt) => {
    const sym = Symbol('symbol')
    const fn = () => {}
    const effects = []
    const run = createRunner(loggingRunner(effects))
    Promise.all(['a string', 100, true, sym, { a: 1 }, fn].map(run)).then(result => {
      tt.deepEqual(effects, ['a string', 100, true, sym, { a: 1 }, fn])
    }).then(tt.end, tt.end)
  })
  t.test('accepts single effect', (tt) => {
    const effects = []
    const run = createRunner(loggingRunner(effects))
    run(effect1).then(result => {
      tt.deepEqual(result, {resultOf: effect1})
      tt.deepEqual(effects, [effect1])
    }).then(tt.end, tt.end)
  })
  // result of gen func executed
  t.test('accepts generator', (tt) => {
    const effects = []
    const run = createRunner(loggingRunner(effects))
    const script = function * () {
      return yield effect1
    }
    run(script()).then(result => {
      tt.deepEqual(result, { resultOf: effect1 })
      tt.deepEqual(effects, [effect1])
    }).then(tt.end, tt.end)
  })

  t.test('accepts generator function', (tt) => {
    // sometimes its just easier to run generator function
    // defined inline
    const effects = []
    const run = createRunner(loggingRunner(effects))
    run(function * () {
      return yield effect1
    }).then(result => {
      tt.deepEqual(result, { resultOf: effect1 })
      tt.deepEqual(effects, [effect1])
    }).then(tt.end, tt.end)
  })

  t.test('accepts generator function yielding another generator function', (tt) => {
    const effects = []
    const run = createRunner(loggingRunner(effects))
    run(function * () {
      return yield function * () {
        return yield effect1
      }
    }).then(result => {
      tt.deepEqual(result, { resultOf: effect1 })
      tt.deepEqual(effects, [effect1])
    }).then(tt.end, tt.end)
  })

  t.test('accepts generator function yielding another generator', (tt) => {
    const effects = []
    const run = createRunner(loggingRunner(effects))
    function * script() {
      return yield effect1
    }
    run(function * () {
      return yield script()
    }).then(result => {
      tt.deepEqual(result, { resultOf: effect1 })
      tt.deepEqual(effects, [effect1])
    }).then(tt.end, tt.end)
  })

  t.test('throws an error if effect is unhandled by middleware', (tt) => {
    const run = createRunner()
    run(function * () {
      return yield effect1
    }).then(result => {
      tt.fail('should be rejected')
    }).catch(err => {
      tt.end()
    })
  })
})


// compose runners - sequential or parallel execution?
test('high-level composition of effects', (t) => {

  t.test('parallel', (tt) => {
    tt.deepEqual(parallel(effect1), parallel([effect1]), 'takes multiple args or an array')
    tt.deepEqual(parallel(effect1, effect2), parallel([effect1, effect2]), 'takes multiple args or an array')
    run(function * () {
      return yield parallel(effect1, effect2)
    }).then(result => {
      tt.deepEqual(result, [{ resultOf: effect1 }, { resultOf: effect2 }], 'resolves with an array of results')
    }).then(tt.end, tt.end)
  })

  t.test('parallel run of scripts', (tt) => {
    function * script(effect) {
      return yield effect
    }
    run(function * () {
      return yield parallel(script(effect1), script(effect2))
    }).then(result => {
      tt.deepEqual(result, [{ resultOf: effect1 }, { resultOf: effect2 }], 'resolves with an array of results')
    }).then(tt.end, tt.end)
  })

  t.test('race', (tt) => {
    tt.deepEqual(race(effect1), race([effect1]), 'takes multiple args or an array')
    tt.deepEqual(race(effect1, effect2), race([effect1, effect2]), 'takes multiple args or an array')
    run(function * () {
      return yield race(effect1, effect2)
    }).then(result => {
      tt.deepEqual(result, { resultOf: effect1 }, 'resolves with the result of an effect resolved first') // first effect will get resolved firsts. Is it deterministic enough for tests?
    }).then(tt.end, tt.end)
  })

  t.test('race of race', (tt) => {
    run(function * () {
      return yield race(race(effect1, effect2), race(effect3))
    }).then(result => {
      tt.deepEqual(result, { resultOf: effect1 }, 'resolves with the result of an effect resolved first')
    }).then(tt.end, tt.end)
  })

  t.test('race of parallel', (tt) => {
    run(function * () {
      return yield race(parallel(effect1, effect2), parallel(effect1, effect3))
    }).then(result => {
      tt.deepEqual(result, [{ resultOf: effect1 }, { resultOf: effect2 }], 'resolves with the result of an effect resolved first')
    }).then(tt.end, tt.end)
  })

  t.test('parallel of race', (tt) => {
    run(function * () {
      return yield parallel(race(effect1, effect2), race(effect1, effect3))
    }).then(result => {
      tt.deepEqual(result, [{ resultOf: effect1 }, { resultOf: effect1 }], 'resolves with the result of an effect resolved first')
    }).then(tt.end, tt.end)
  })

  t.test('timeout', (tt) => {
    run(function * () {
      return yield timeout(100)
    }).then(result => {
      tt.equals(result, undefined, 'resolves with undefined result')
    }).then(tt.end, tt.end)
  })
})
// higher order runners? (wrapping runners)

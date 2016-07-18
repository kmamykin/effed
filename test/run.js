const test = require('tape')
const { createRunner, parallel, race, pipe } = require('../src/index')

const effect1 = { type: 'effect1' }
const effect2 = { type: 'effect2' }
const effect3 = { type: 'effect3' }

const echoRunner = () => (run) => (next) => (effect) => {
  if (effect === effect1 || effect === effect2 || effect === effect3) {
    return Promise.resolve({ resultOf: effect })
  } else {
    return next(effect)
  }
}

const loggingRunner = (yielded) => (run) => (next) => (effect) => {
  yielded.push(effect)
  return next(effect)
}

const yielded = []
const run = createRunner(loggingRunner(yielded), echoRunner())

test('run', (t) => {

  t.test('accepts single effect', (tt) => {
    yielded.length = 0
    run(effect1).then(result => {
      tt.deepEqual(result, {resultOf: effect1})
      tt.deepEqual(yielded, [effect1])
    }).then(tt.end, tt.end)
  })
  // result of gen func executed
  t.test('accepts generator', (tt) => {
    yielded.length = 0
    const script = function * () {
      return yield effect1
    }
    run(script()).then(result => {
      tt.deepEqual(result, { resultOf: effect1 })
      tt.deepEqual(yielded, [effect1])
    }).then(tt.end, tt.end)
  })

  t.test('accepts generator function', (tt) => {
    // sometimes its just easier to run generator function
    // defined inline
    yielded.length = 0
    run(function * () {
      return yield effect1
    }).then(result => {
      tt.deepEqual(result, { resultOf: effect1 })
      tt.deepEqual(yielded, [effect1])
    }).then(tt.end, tt.end)
  })

  t.test('accepts generator function yielding another generator function', (tt) => {
    yielded.length = 0
    run(function * () {
      return yield function * () {
        return yield effect1
      }
    }).then(result => {
      tt.deepEqual(result, { resultOf: effect1 })
      tt.deepEqual(yielded, [effect1])
    }).then(tt.end, tt.end)
  })

  t.test('accepts generator function yielding another generator', (tt) => {
    yielded.length = 0
    function * script() {
      return yield effect1
    }
    run(function * () {
      return yield script()
    }).then(result => {
      tt.deepEqual(result, { resultOf: effect1 })
      tt.deepEqual(yielded, [effect1])
    }).then(tt.end, tt.end)
  })

  t.test('throws an error if effect is unhandled by middleware', (tt) => {
    run({type: 'unknown'}).then(result => {
      tt.fail('should be rejected')
    }).catch(err => {
      tt.end()
    })
  })
  t.test('throws an error if yielded effect is unhandled by middleware', (tt) => {
    run(function * () {
      return yield {type: 'unknown'}
    }).then(result => {
      tt.fail('should be rejected')
    }).catch(err => {
      tt.end()
    })
  })
})


// compose runners - sequential or parallel execution?
test('high-level composition of yielded', (t) => {

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

  t.test('pipe of yielded', (tt) => {
    run(function * () {
      return yield pipe(effect1, (_) => effect2, (_) => effect3)
    }).then(result => {
      tt.deepEqual(result, { resultOf: effect3 })
    }).then(tt.end, tt.end)
  })
})
// higher order runners? (wrapping runners)

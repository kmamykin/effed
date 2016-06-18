const test = require('tape')
const { combineRunners, createRunner } = require('../src/index')

test('run', (t) => {
  const echoRunner = (effects = []) => (effect) => {
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

// compose runners - sequential or parallel execution?
// test('composing effects', (t) => {
//   const delayedRunner = (logs) => (effect) => {
//     logs.push({ effect, message: 'started' })
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         logs.push({ effect, message: 'finished' })
//         resolve({ resultOf: effect })
//       }, effect.delay || 5000)
//     })
//   }
//
//   const parallel = (effects) => ({ type: 'PARALLEL', effects })
//
//   t.test('parallel composition', (tt) => {
//     const effect = { type: 'effect' }
//     const logs = []
//     const run = createRunner(delayedRunner(logs))
//     run(function * () {
//       return yield parallel([{ delay: 300 }, { delay: 400 }])
//     }).then(result => {
//       tt.deepEqual(result, { resultOf: effect })
//       tt.deepEqual(effects, [effect])
//       tt.end()
//     }).catch(tt.end)
//
//   })
// })
// higher order runners? (wrapping runners)

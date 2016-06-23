const { createRunner } = require('../index')
const matches = require('tmatch')
const assert = require('assert')

const createStubMiddleware = (expectations) => {
  const middleware = (run) => (next) => (effect) => {
    const [nextEffect, nextResult] = expectations.shift()
    if (effectsMatch(effect, nextEffect)) {
      console.log(`Matched ${effect}, continuing with ${nextResult}`)
      return Promise.resolve(nextResult)
    } else {
      return next(effect)
    }
  }
  return middleware
}

const simulate = (script) => {
  const expectationsBuilder = (expectations, expectedReturn) => {
    return {
      yields: (effect) => expectationsBuilder([...expectations, [effect]], expectedReturn),
      continue: (result) => {
        const [effect] = expectations.pop()
        return expectationsBuilder([...expectations, [effect, result]], expectedReturn)
      },
      returns: (returnValue) => expectationsBuilder(expectations, returnValue),
      then: (onResolve, onReject) => {
        const mock = createStubMiddleware(expectations)
        const run = createRunner(mock)
        run(script).then(result => {
          assert.deepEqual(result, expectedReturn)
        }).then(onResolve, onReject)
      }
    }
  }
  return expectationsBuilder([], null)
}

const effectsMatch = (actual, expectedPattend) => {
  return matches(actual, expectedPattend)
}

const yieldExpectation = (effect, result) => (t, actual) => {
  console.log('Expected', effect)
  console.log('Actual', actual)
  t.deepEqual(actual, effect)
  return result
}

const returnsExpectation = (expectedReturn) => (t, actualReturn) => {
  console.log(expectedReturn)
  t.deepEqual(actualReturn, expectedReturn)
}

const noReturnsExpectation = () => (t, actualReturn) => {
  console.log(actualReturn)
}

// TODO: define spyMiddleware to be used on an existing chain of middleware, to later assert that a particular effect was run
module.exports = {
  createStubMiddleware,
  simulate
}

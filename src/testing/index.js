
const playByPlay = script => {
  const builder = (expectations, result) => ({
    expect: (effect, effectResult) => builder([...expectations, [effect, effectResult]], result),
    returns: r => builder(expectations, r),
    then: (onResolved, onRejected) => {
      yio(effect => {
        try {
          //          console.log('expectations', expectations)
          assert(expectations.length > 0, `No more expectations left and effect yielded: ${inspect(effect)}`)
          const [expectedEffect, expectedResult] = expectations.shift()
          //          console.log('ASSERT actual:', effect, 'expected:', expectedEffect)
          assert.deepEqual(effect, expectedEffect, 'Effects no match')
          return expectedResult instanceof Error ? Promise.reject(expectedResult) : Promise.resolve(expectedResult)
        } catch (err) {
          //          console.log('catch(err)', err)
          return Promise.reject(err)
        }
      }, script)
        .then(scriptResult => {
          //          console.log('in scriptResult check', scriptResult, expectations)
          assert(expectations.length === 0, `Some expectations left un-yielded: ${inspect(expectations)}`)
          assert.deepEqual(scriptResult, result, 'Results dont match')
          return scriptResult
        })
        .then(onResolved, onRejected)
    }
  })
  return builder([], undefined)
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

const createSumulator = (script, expectations, returnCheck) => {
  return {
    yields: (effect, result = undefined) => createSumulator(script, [...expectations, yieldExpectation(effect, result)], returnCheck),
    returns: (returnValue) => createSumulator(script, expectations, returnsExpectation(returnValue)),
    end: () => (t) => {
      let yielded = script.next()
      while(!yielded.done) {
        let expected = expectations.shift()
        yielded = script.next(expected(t, yielded.value))
      }
      // check return
      returnCheck(t, yielded.value)
      t.end()
    }
  }
}

module.exports = {
  simulate: (script) => createSumulator(script, [], noReturnsExpectation())
}


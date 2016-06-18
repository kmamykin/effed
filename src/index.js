const co = require('./co')
const {Effects, isEffect} = require('./effect')

// interpreter :: effect -> Promise
// script :: Iterator<effect>
const createRunner = interpreter => effect => {
  return co(interpreter, effect)
}

// combineInterpreters :: [interpreter] -> interpreter
const combineInterpreters = (...interpreters) => interpreters.reduce((combined, interpreter) => {
  return (effect) => combined(effect) || interpreter(effect)
})

const combineRunners = (...runners) => createRunner(combineInterpreters(...runners))

const simulate = (script, interpreter) => {
  let effects = []
  const result = yio(effect => {
    effects = [...effects, effect]
    return interpreter(effect)
  }, script)
  return result.then(r => ({effects, result: r}))
}


module.exports = {
  isEffect,
  Effects,
  createRunner,
  combineInterpreters,
  combineRunners,
  simulate
}

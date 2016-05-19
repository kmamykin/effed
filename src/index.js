const co = require('./co')
const {Effect, isEffect} = require('./effect')
// interpreter :: effect -> Promise
// script :: Iterator<effect>
const effects = interpreter => script => {
  return co(interpreter, script)
}

// combineInterpreters :: [interpreter] -> interpreter
const combineInterpreters = (...interpreters) => interpreters.reduce((combined, interpreter) => {
  return (effect) => combined(effect) || interpreter(effect)
})

const simulate = (script, interpreter) => {
  let effects = []
  const result = yio(effect => {
    effects = [...effects, effect]
    return interpreter(effect)
  }, script)
  return result.then(r => ({effects, result: r}))
}


module.exports = {
  effects,
  isEffect,
  Effect,
  combineInterpreters,
  simulate
}

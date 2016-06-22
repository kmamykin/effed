const {Effects, isEffect} = require('./effect')
const chainMiddleware = require('./chainMiddleware')
const generatorMiddleware = require('./effects/generators')
const {middleware: combinatorsMiddleware} = require('./effects/combinators')
// PONDER: is interpreter == dispatcher? are we interpreting effects or dispatching effects to be run or interpreted?
// interpreter :: effect -> Promise<result>
// middleware :: run -> next -> interpreter
// script :: Iterator<effect> || effect
const createRunner = (...middlewares) => {
  const finalChain = chainMiddleware([generatorMiddleware(), combinatorsMiddleware, ...middlewares])
  const run = finalChain((effect) => run(effect))(terminalNext)
  return run
}

const terminalNext = (effect) => Promise.reject(new Error(`Effect ${effect} can not be interpreted. Did you include the right middleware?`))


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
  chainMiddleware,
  simulate
}

const co = require('./co')
const {Effects, isEffect} = require('./effect')
const {argsAsArray} = require('./helpers')
// PONDER: is interpreter == dispatcher? are we interpreting effects or dispatching effects to be run or interpreted?
// interpreter :: effect -> Promise<result>
// middleware :: run -> next -> interpreter
// script :: Iterator<effect> || effect
const createRunner = (...middlewares) => (script) => {
  const interpreter = chainMiddleware(...middlewares)((effect) => interpreter(effect))(terminalInterpreter)
  return co(interpreter, script)
}

const terminalInterpreter = (effect) => Promise.reject(new Error(`Effect ${effect} can not be interpreted. Did you include the right middleware?`))

const passThroughMiddleware = (run) => (next) => (effect) => next(effect)

// chainMiddleware :: [middleware] -> middleware
const chainMiddleware = (...middlewares) => {
  // can be called with multiple args or one array
  // combined :: run -> next -> effect -> Promise
  // middleware :: run -> next -> effect -> Promise
  return argsAsArray(...middlewares).reduceRight((combined, middleware) => (run) => (next) => middleware(run)(combined(run)(next)), passThroughMiddleware)
}

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

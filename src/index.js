const co = require('./co')
const {Effects, isEffect} = require('./effect')
const {argsOrArray} = require('./helpers')
// PONDER: is interpreter == dispatcher? are we interpreting effects or dispatching effects to be run or interpreted?
// interpreter :: effect -> Promise<result>
// middleware :: next -> interpreter
// script :: Iterator<effect> || effect
const createRunner = (...middlewares) => (script) => {
  return co(createInterpreter(...middlewares), script)
}

const terminalInterpreter = (effect) => Promise.reject(new Error(`Effect ${effect} can not be interpreted. Did you include the right middleware?`))

// [middleware] -> interpreter
const createInterpreter = (...middlewares) => combineMiddleware(...middlewares)(terminalInterpreter)

const passThroughMiddleware = (next) => (effect) => next(effect)

// combineMiddleware :: [middleware] -> middleware
const combineMiddleware = (...middlewares) => {
  // can be called with multiple args or one array
  // combined :: next => effect => Promise
  // middleware :: next => effect => Promise
  return argsOrArray(...middlewares).reduceRight((combined, middleware) => (next) => middleware(combined(next)), passThroughMiddleware)
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
  combineMiddleware,
  createInterpreter,
  simulate
}

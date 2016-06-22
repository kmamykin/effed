const {Effects, isEffect} = require('./effect')
const {argsAsArray} = require('./helpers')
const generatorMiddleware = require('./effects/generators')
// PONDER: is interpreter == dispatcher? are we interpreting effects or dispatching effects to be run or interpreted?
// interpreter :: effect -> Promise<result>
// middleware :: run -> next -> interpreter
// script :: Iterator<effect> || effect
const createRunner = (...middlewares) => {
  const finalChain = chainMiddleware([generatorMiddleware(), ...middlewares])
  const run = finalChain((effect) => run(effect))(terminalNext)
  return run
}

const terminalNext = (effect) => Promise.reject(new Error(`Effect ${effect} can not be interpreted. Did you include the right middleware?`))

const passThroughMiddleware = (run) => (next) => (effect) => next(effect)

// chainMiddleware :: [middleware] -> middleware
// can be called with multiple args or one array
const chainMiddleware = (...args) => {
  const middlewares = argsAsArray(...args)
  // chaining could be expresses as a single reduceRight operation with passThrough as initialValue,
  // but we don't want to insert passThrough into each chain, so explicitly handle this case.
  if (middlewares.length === 0) return passThroughMiddleware
  // combined :: run -> next -> effect -> Promise
  // middleware :: run -> next -> effect -> Promise
  return middlewares.reduceRight((combined, middleware) => (run) => (next) => middleware(run)(combined(run)(next)))
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

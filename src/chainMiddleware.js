const {argsAsArray} = require('./helpers')

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

module.exports = chainMiddleware

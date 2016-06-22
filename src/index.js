const chainMiddleware = require('./chainMiddleware')
const generators = require('./effects/generators').default
const combinators = require('./effects/combinators').default

// interpreter :: effect -> Promise<result>
// middleware :: run -> next -> interpreter
const createRunner = (...middlewares) => {
  const finalChain = chainMiddleware([generators(), combinators(), ...middlewares])
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
  return result.then(r => ({ effects, result: r }))
}

module.exports = {
  createRunner,
  chainMiddleware,
  simulate
}

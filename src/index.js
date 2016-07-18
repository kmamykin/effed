const chainMiddleware = require('./chainMiddleware')
const generators = require('./effects/generators').default
const {'default': combinators, parallel, all, race, pipe} = require('./effects/combinators')

// interpreter :: effect -> Promise<result>
// middleware :: run -> next -> interpreter
const createRunner = (...middlewares) => {
  const finalChain = chainMiddleware([generators(), combinators(), ...middlewares])
  const run = finalChain((effect) => run(effect))(terminalNext)
  return run
}

const terminalNext = (effect) => Promise.reject(new Error(`Effect ${effect} can not be interpreted. Did you include the right middleware?`))

module.exports = {
  createRunner,
  parallel, all, race, pipe
}

const chainMiddleware = require('./../chainMiddleware')
const { argsAsArray } = require('./../helpers')

const TIMEOUT = Symbol('TIMEOUT')
const timeout = (milliseconds) => ({ type: TIMEOUT, milliseconds })
const timeoutMiddleware = (run) => (next) => (effect) => {
  if (effect.type === TIMEOUT && effect.milliseconds) {
    return new Promise((resolve) => {
      setTimeout(resolve, effect.milliseconds)
    })
  } else {
    return next(effect)
  }
}

const PARALLEL = Symbol('PARALLEL')
const parallel = (...effects) => ({ type: PARALLEL, effects: argsAsArray(...effects) })
const parallelMiddleware = (run) => (next) => (effect) => {
  if (effect.type === PARALLEL) {
    return Promise.all((effect.effects || []).map(e => run(e)))
  } else {
    return next(effect)
  }
}

const RACE = Symbol('RACE')
const race = (...effects) => ({ type: RACE, effects: argsAsArray(...effects) })
const raceMiddleware = (run) => (next) => (effect) => {
  if (effect.type === RACE) {
    return Promise.race((effect.effects || []).map(e => run(e)))
  } else {
    return next(effect)
  }
}

const PIPE = Symbol('PIPE')
const pipe = (first, ...fns) => ({ type: PIPE, first, fns: argsAsArray(...fns) })
const pipeMiddleware = (run) => (next) => (effect) => {
  if (effect.type === PIPE) {
    return effect.fns.reduce((chain, fn) => chain.then(result => run(fn(result))), run(effect.first))
  } else {
    return next(effect)
  }
}

const combinatorsMiddleware = () => chainMiddleware(parallelMiddleware, raceMiddleware, pipeMiddleware, timeoutMiddleware)

module.exports = {
  'default': combinatorsMiddleware,
  parallel,
  all: parallel,
  race,
  pipe,
  timeout
}

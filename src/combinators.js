const {chainMiddleware} = require('./index')
const {argsAsArray} = require('./helpers')

const TIMEOUT = Symbol('TIMEOUT')
const timeoutMiddleware = () => (next) => (effect) => {
  if (effect.type === TIMEOUT && effect.milliseconds) {
    return new Promise((resolve) => {
      setTimeout(resolve, effect.milliseconds)
    })
  } else {
    return next(effect)
  }
}

const PARALLEL = Symbol('PARALLEL')
const parallelMiddleware = () => (next) => (effect) => {
  if (effect.type === PARALLEL) {
    return Promise.all((effect.effects || []).map(e => next(e)))
  } else {
    return next(effect)
  }
}

const RACE = Symbol('RACE')
const raceMiddleware = () => (next) => (effect) => {
  if (effect.type === RACE) {
    return Promise.race((effect.effects || []).map(e => next(e)))
  } else {
    return next(effect)
  }
}

const parallel = (...effects) => ({ type: PARALLEL, effects: argsAsArray(...effects) })
const race = (...effects) => ({ type: RACE, effects: argsAsArray(...effects) })
const timeout = (milliseconds) => ({type: TIMEOUT, milliseconds})

module.exports = {
  parallel,
  all: parallel,
  race,
  timeout,
  middleware: chainMiddleware(parallelMiddleware(), raceMiddleware(), timeoutMiddleware())
}

const {combineMiddleware} = require('./index')
const {argsOrArray} = require('./helpers')

const delayedMiddleware = () => (next) => (effect) => {
  if (effect.type === 'DELAY' && effect.interval) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        next(effect).then(resolve, reject)
      }, effect.interval)
    })
  } else {
    return next(effect)
  }
}

const parallelMiddleware = () => (next) => (effect) => {
  if (effect.type === 'PARALLEL') {
    return Promise.all((effect.effects || []).map(e => next(e)))
  } else {
    return next(effect)
  }
}

const parallel = (...effects) => ({ type: 'PARALLEL', effects: argsOrArray(effects) })
const delay = (interval) => ({type: 'DELAY', interval})

module.exports = {
  parallel,
  all: parallel,
  delay,
  middleware: combineMiddleware(parallelMiddleware(), delayedMiddleware())
}

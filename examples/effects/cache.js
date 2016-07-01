const CACHE = Symbol('CACHE')

const asyncCacheMiddleware = ({ get, set }) => (run) => (next) => {
  const actions = {
    [CACHE]: ({ options, effect }) => {
      return get(options.key)
        .then(value => {
          if (value) {
            return value
          } else {
            return run(effect)
              .then(value => set(options.key, value).then(() => value))
          }
        })
    }
  }
  return (effect) => (actions[effect.type] || next)(effect)
}

const memoryCacheMiddleware = (map) => (run) => (next) => {
  const actions = {
    [CACHE]: ({ options, effect }) => new Promise((resolve, reject) => {
      if (map[options.key]) {
        resolve(map[options.key])
      } else {
        run(effect).then(value => {
          map[options.key] = value
          resolve(value)
        }, error => {
          // nothing set in the map
          reject(error)
        })
      }
    })
  }
  return (effect) => (actions[effect.type] || next)(effect)
}

module.exports = {
  asyncCacheMiddleware,
  memoryCacheMiddleware,
  cache: (options, effect) => ({ type: CACHE, options: (typeof options === 'string' ? { key: options } : options), effect })
}


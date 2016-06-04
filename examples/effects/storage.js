const { Effects } = require('../../src/index')

// es6 modules could be 
// export default const ...
const effects = Effects({
  getItem: ['key'],
  setItem: ['key', 'value'],
  removeItem: ['key'],
  clear: []
})

const runner = ({ storage }) => effect => {
  switch (effect.type) {
    case 'GET_ITEM':
      return Promise.resolve(storage.getItem(effect.key))
    case 'SET_ITEM':
      storage.setItem(effect.key, effect.value)
      return Promise.resolve()
    case 'REMOVE_ITEM':
      storage.removeItem(effect.key)
      return Promise.resolve()
    case 'CLEAR':
      storage.clear()
      return Promise.resolve()
  }
}

const mapRunner = map => effect => {
  console.log('Interpreting effect', effect, 'on', map)
  return effect.match({
    getItem: ({ key }) => {
      return Promise.resolve(map.get(key))
    },
    setItem: ({ key, value }) => {
      map.set(key, value)
      return Promise.resolve()
    },
    removeItem: ({ key }) => {
      map.delete(key)
      return Promise.resolve()
    },
    clear: () => {
      map.clear()
      return Promise.resolve()
    }
  })
}

module.exports = {
  'default': effects,
  runner,
  mapRunner
}

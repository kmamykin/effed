
const GET_ITEM = Symbol('GET_ITEM')
const SET_ITEM = Symbol('SET_ITEM')
const REMOVE_ITEM = Symbol('REMOVE_ITEM')
const CLEAR = Symbol('CLEAR')

const middleware = (map) => (run) => (next) => {
  const actions = {
    [GET_ITEM]: ({key}) => {
      return Promise.resolve(map.get(key))
    },
    [SET_ITEM]: ({key, value}) => {
      map.set(key, value)
      return Promise.resolve()
    },
    [REMOVE_ITEM]: ({key}) => {
      map.delete(key)
      return Promise.resolve()
    },
    [CLEAR]: () => {
      map.clear()
      return Promise.resolve()
    }
  }
  return (effect) => {
    console.log('Interpreting effect', effect, 'on', map)
    return (actions[effect.type] || next)(effect)
  }
}

module.exports = {
  'default': middleware,
  getItem: (key) => ({type: GET_ITEM, key}),
  setItem: (key, value) => ({type: SET_ITEM, key, value}),
  removeItem: (key) => ({type: REMOVE_ITEM, key}),
  clear: () => ({type: CLEAR})
}

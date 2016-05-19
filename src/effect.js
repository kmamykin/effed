const effectMarker = Symbol('effect')
const Effect = (props) => Object.assign({[effectMarker]: true}, props)
const isEffect = (effect) => effect[effectMarker] == true

module.exports = {
  Effect,
  isEffect
}

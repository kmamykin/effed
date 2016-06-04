const union = require('./union')
const effectMarker = Symbol('effect')

const isEffect = (effect) => effect && effect[effectMarker]
const Effects = (defs) => union(defs, {[effectMarker]: true})
module.exports = {
  Effects,
  isEffect
}

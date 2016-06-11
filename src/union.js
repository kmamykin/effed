// TODO: move union in a different npm module
const util = require('util')
const returnVoid = x => {}
const TAG = Symbol('TAG')
const TYPE = Symbol('TYPE')

function createUnionType (types) {
  return function UnionType() {
    throw TypeError(`Union type can not be used without concrete constructor. User ${types}`)
  }
}

function createClass (unionConstructor, typeName) {
  const F = function (...args) {
    if (this instanceof F) {
      this.args = args
      // console.log(this)
    } else {
      return new F(...args)
    }
  }
  F.prototype = Object.create(unionConstructor.prototype)
  F.prototype.constructor = F
  Object.defineProperty(F, 'name', {value: typeName, configurable: true})
  return F
}

const union = (types, mixins = {}) => {
  const parseConstructorParams = (typeName, ...args) => {
    if (args.length === 1 && typeof args[0] === 'object') {
      return args[0] // constructor called with an object, like constructor({x:1, y: 2})
    } else {
      return types[typeName].reduce((params, paramName, index) => {
        params[paramName] = args[index]
        return params
      }, {})
    }
  }
  const createTypeConstructor = (unionType, typeName) => {
    const Type = createClass(unionType, typeName)
    return Type

    // important to use function () ... not =>, so 'this' is not lexical, but the actual object instance
    const proto = {
      // toString: () => proto.inspect(),
      // inspect: function () {
      //   return `${typeName}(${util.inspect(Object.assign({}, this))})` // using Object.assign({}, this) so util.inspect does not infinitely recurse
      // },
      type: typeName,
      match: function (cases) {
        const { [typeName]: matchedCase, _: defaultCase = returnVoid } = cases
        return typeof matchedCase === 'function'
          ? matchedCase(this)
          : (typeof matchedCase === 'undefined' ? defaultCase(this) : matchedCase)
      }
    }
    return (...args) => {
      const params = parseConstructorParams(typeName, ...args)
      // These properties are hidden but will be used to in the prototype (deep)compare instances of types
      const properties = {
      }
      return Object.assign(Object.create(proto), properties, params, mixins)
    }
  }
  const createTypes = (types) => Object.keys(types).reduce((unionType, typeName) => {
    unionType[typeName] = createTypeConstructor(unionType, typeName)
    return unionType
  }, createUnionType(Object.keys(types)))
  return createTypes(types)
}

module.exports = union

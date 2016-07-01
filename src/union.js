// TODO: move union in a different npm module
// TODO: Read up on previous state of art for Algebraic Data Types in JavaScript
// e.g. http://w3future.com/weblog/stories/2008/06/16/adtinjs.xml
const util = require('util')
const returnVoid = x => {}

function createUnionType (types) {
  return function UnionType () {
    throw TypeError(`Union type can not be used without concrete constructor. Use ${types}`)
  }
}

function createClass (unionConstructor, typeName, argsParser) {
  const F = function (...args) {
    if (this instanceof F) {
      this.args = argsParser(...args)
    } else {
      return new F(...args)
    }
  }
  F.prototype = Object.create(unionConstructor.prototype)
  F.prototype.constructor = F
  F.prototype.match = function (cases) {
    const { [typeName]: matchedCase, _: defaultCase = returnVoid } = cases
    return typeof matchedCase === 'function'
      ? matchedCase(this.args)
      : (typeof matchedCase === 'undefined' ? defaultCase(this.args) : matchedCase)
  }

  Object.defineProperty(F, 'name', { value: typeName, configurable: true })
  return F
}

const union = (types, mixins = {}) => {
  const parseConstructorParams = (typeName) => (...args) => {
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
    const Type = createClass(unionType, typeName, parseConstructorParams(typeName))
    return Type

    const proto = {
      // toString: () => proto.inspect(),
      // inspect: function () {
      //   return `${typeName}(${util.inspect(Object.assign({}, this))})` // using Object.assign({}, this) so util.inspect does not infinitely recurse
      // },
    }
  }
  const createTypes = (types) => Object.keys(types).reduce((unionType, typeName) => {
    unionType[typeName] = createTypeConstructor(unionType, typeName)
    return unionType
  }, createUnionType(Object.keys(types)))
  return createTypes(types)
}

module.exports = union

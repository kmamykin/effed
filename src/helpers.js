module.exports = {
  argsOrArray: (...args) => (args.length === 1 && args[0] instanceof Array) ? args[0] : args
}

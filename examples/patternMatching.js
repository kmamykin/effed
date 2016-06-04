const union = require('../src/union')
// define
const effects = union({
  saveGame: ['x', 'y'],
  restoreGame: []
})

// create
const e = effects.saveGame({x: 2, y: 4})

// match
console.log(e)
e.match({
  saveGame: ({x, y}) => {},
  restoreGame: () => {},
  _: () => {}
})

const List = union({
  Nil: [],
  Cons: ['x', 'xs']
})

const l1 = List.Cons(2, List.Cons(3, List.Cons(4, List.Nil())))

const length = (list) => list.match({ 
  Nil: 0,
  Cons: ({x, xs}) => (1 + length(xs))
})
const sum = (list) => list.match({
  Nil: 0,
  Cons: ({x, xs}) => (x + sum(xs))
})
const product = (list) => list.match({
  Nil: 1,
  Cons: ({x, xs}) => (x * product(xs))
})

console.log(l1)
console.log(l1.toString())
console.log(Object.prototype.toString.call(l1)) // need to use this in toString impl to work?
console.log(length(l1))
console.log(sum(l1))
console.log(product(l1))


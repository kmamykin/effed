const union = require('../src/union')

// define
const List = union({
  Nil: [],
  Cons: ['x', 'xs']
})

// create
const l1 = List.Cons(2, List.Cons(3, List.Cons(4, List.Nil())))

// match
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
const head = (list) => list.match({
  Cons: ({x, xs}) => x,
  _: () => null
})
console.log(l1)
console.log(l1.toString())
console.log(Object.prototype.toString.call(l1)) // need to use this in toString impl to work?
console.log(length(l1))
console.log(sum(l1))
console.log(product(l1))
console.log(head(l1))

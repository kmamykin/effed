const assert = require('assert')
const util = require('util')
const storage = require('./effects/storage').default

function * transferAmount (from, to, amount) {
  assert(from && from.length > 0, 'from is empty')
  assert(to && to.length > 0, 'to is empty')
  assert(amount > 0, 'amount should be > 0')
  const fromBalance = yield storage.getItem(`accounts:${from}`)
  assert(typeof fromBalance !== 'undefined', 'from account not found')
  assert(fromBalance >= amount, 'from balance does not have enough funds')
  const toBalance = yield storage.getItem(`accounts:${to}`)
  assert(typeof toBalance !== 'undefined', 'to account not found')
  yield storage.setItem(`accounts:${from}`, fromBalance - amount)
  yield storage.setItem(`accounts:${to}`, toBalance + amount)
  return amount
}

function * setupAccount (number, initial) {
  return yield storage.setItem(`accounts:${number}`, initial)
}
function * transferThrough (from, through, to, amount) {
  yield * setupAccount(through, 0)
  yield * transferAmount(from, through, amount)
  yield * transferAmount(through, to, amount)
  return amount
}

const { createRunner } = require('../src/index')
const { mapRunner } = require('./effects/storage')

const map = new Map([['accounts:yours', 10000000], ['accounts:mine', 0]])
const run = createRunner(mapRunner(map))

// run examples sequentially
Promise.resolve().then(() =>
  run(transferAmount('yours', 'mine', 1000)).then(console.log, console.error).then(() => console.log(map))
).then(() =>
  run(transferThrough('yours', 'intermediary', 'mine', 1000)).then(console.log, console.error).then(() => console.log(map))
).then(() =>
  run(storage.getItem(`accounts:yours`)).then(console.log, console.error).then(() => console.log(map))
)
console.log(util.inspect(storage.getItem(`accounts:yours`), {showHidden: true}))
console.log(util.inspect(storage.getItem(`accounts:yours`), {showHidden: true}))
assert.deepEqual(storage.getItem(`accounts:yours`), storage.getItem(`accounts:yours`))

const test = require('tape')
const {simulate} = require('../src/testing')
test('transferAmount', simulate(transferAmount('yours', 'mine', 1000))
    .yields(storage.getItem(`accounts:yours`), 1000)
    .yields(storage.getItem(`accounts:mine`), 0)
    .yields(storage.setItem('accounts:yours', 0))
    .yields(storage.setItem('accounts:mine', 1000))
    .returns(1000)
    .end()
)


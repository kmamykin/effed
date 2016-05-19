const assert = require('assert')
const {effects: storage} = require('./effects/storage')

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
  yield storage.setItem(`accounts:${to}`, toBalance  + amount)
  return amount
}

function * setupAccount(number, initial) {
  return yield storage.setItem(`accounts:${number}`, initial)
}
function * transferThrough (from, through, to, amount) {
  yield * setupAccount(through, 0)
  yield * transferAmount(from, through, amount)
  yield * transferAmount(through, to, amount)
  return amount
}

const {createRunner} = require('../src/index')
const {mapRunner} = require('./effects/storage')

const map = new Map([['accounts:yours', 10000000], ['accounts:mine', 0]])
const run = createRunner(mapRunner(map))

run(transferAmount('yours', 'mine', 1000)).then(console.log, console.error).then(() => console.log(map))
run(transferThrough('yours', 'intermediary', 'mine', 1000)).then(console.log, console.error).then(() => console.log(map))

//playByPlay(transferAmount('yours', 'mine', 1000))
//  .expect(storage.getItem(`accounts:yours`), 1000)
//  .expect(storage.getItem(`accounts:mine`), 0)
//  .expect(storage.setItem('accounts:yours', 0))
//  .expect(storage.setItem('accounts:mine', 1000))
//  .returns(1000)
//  .then(console.log, console.error)

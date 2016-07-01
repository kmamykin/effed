// Github effects module
const {fetch} = require('./fetch')
const {all} = require('../../src/effects/combinators')

function * getUser (username) {
  const getUserUrl = `https://api.github.com/users/${username}`
  const response = yield fetch(getUserUrl)
  if (response.ok) {
    return response.body
  } else {
    throw new Error(response.statusText)
  }
}

function * getUsers (names) {
  return yield all(names.map(getUser))
}

function * getFollowers (userNameOrUrl) {

}

// Exports effect creators
module.exports = {
  getUser,
  getUsers,
  getFollowers
}

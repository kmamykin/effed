// How to make a Process Manager? e.g. Flight Booking Process. What are the effects? and can they be generic to be used in any process?
// How to deal with async nature and delayed (some time later) worker fulfilled tasks nature?

// EXAMPLE: Get and cache users from github

const { getUser } = require('./effects/github')
const { cache } = require('./effects/cache')
const { all } = require('../src/effects/combinators')
const R = require('ramda')
function * findPopularUsername (...usernames) {
  const users = yield all(usernames.map(username => cache({ key: `users:${username}` }, getUser(username))))
  return R.takeLast(1, R.sortBy(R.prop('followers'), users))
}

const { createRunner } = require('../src/index')
const fetchMiddleware = require('./effects/fetch').default
const { memoryCacheMiddleware } = require('./effects/cache')
const map = new Map()

const run = createRunner(memoryCacheMiddleware(map), fetchMiddleware({}))
run(findPopularUsername('kmamykin', 'hamin', 'mjording', 'Ocramius', 'brianchandotcom'))
  .then(console.log.bind(console, 'Most popular user'))
  // .then(_ => console.log(map))
  .catch(console.error)

// playByPlay(findPopularUsername('kmamykin', 'mojombo'))
//   .expect(storage.getItem('users:kmamykin'), null)
//   .expect(github.getUser('kmamykin'), {login: 'kmamykin', followers: 10})
//   .expect(storage.setItem('users:kmamykin', {login: 'kmamykin', followers: 10}))
//   .expect(storage.getItem('users:mojombo'), null)
//   .expect(github.getUser('mojombo'), {login: 'mojombo', followers: 1000})
//   .expect(storage.setItem('users:mojombo', {login: 'mojombo', followers: 1000}))
//   .returns('mojombo')
//   .then(console.log, console.error)



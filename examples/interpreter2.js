// How to make a Process Manager? e.g. Flight Booking Process. What are the effects? and can they be generic to be used in any process?
// How to deal with async nature and delayed (some time later) worker fulfilled tasks nature?

// EXAMPLE: Get and cache users from github

const { getUser } = require('./effects/github')
const { cache } = require('./effects/cache')
const { all } = require('../src/effects/combinators')
const R = require('ramda')
function * mostPopularUsername (usernames) {
  const users = yield all(usernames.map(username => cache({ key: `users:${username}` }, getUser(username))))
  return R.propOr('Unknown', 'login', R.last(R.sortBy(R.prop('followers'), users)))
}

const { createRunner } = require('../src/index')
const fetchMiddleware = require('./effects/fetch').default
const { memoryCacheMiddleware } = require('./effects/cache')
const map = new Map()

// const run = createRunner(memoryCacheMiddleware(map), fetchMiddleware({}))
// run(mostPopularUsername(['kmamykin', 'hamin', 'mjording', 'Ocramius', 'brianchandotcom']))
//   .then(console.log.bind(console, 'Most popular user'))
//   .catch(err => console.error('Failure:', err))

const test = require('tape')
const {simulate} = require('../src/testing')

test('mostPopularUsername', t => {
  simulate(mostPopularUsername(['kmamykin', 'mojombo']))
    .yields(cache('users:kmamykin', getUser('kmamykin'))).continue({login: 'kmamykin', followers: 10})
    .yields(cache('users:mojombo', getUser('mojombo'))).continue({login: 'mojombo', followers: 1000})
    .returns('mojombo')
    .then(t.end, t.end)
})

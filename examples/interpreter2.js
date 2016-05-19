import assert from 'assert'
import github, {runner as githubRunner} from './effects/github'
import storage, {runner as storageRunner, mapRunner} from './effects/storage'
import {combineRunners, run, simulate, playByPlay} from './effective'
import githubCache, {runner as githubCacheRunner} from './effects/githubCache'
import githubMostPopular from './githubMostPopular'

// How do we combine multiple effects?
// Option 1: Create larger effects, with its own creators and runners
// Option 2: Combine several low level effects using generators

// How to make a Process Manager? e.g. Flight Booking Process. What are the effects? and can they be generic to be used in any process?
// How to deal with async nature and delayed (some time later) worker fulfilled tasks nature?

// EXAMPLE: Get and cache users from github

function * getGithubUser (username) {
  const userKey = `users:${username}`
  const cachedUser = yield storage.getItem(userKey)
  if (cachedUser) return cachedUser
  const githubUser = yield github.getUser(username)
  yield storage.setItem(userKey, githubUser)
  return githubUser
}

function * findPopularUsername (...usernames) {
  const users = []
  for (let username of usernames){
    const githubUser = yield * getGithubUser(username)
    users.push(githubUser)
  }
  return githubMostPopular(users)
}

//const state2 = new Map()
//const runner = run(combineRunners(mapRunner(state2), githubRunner({})))
//runner(findPopularUsername('kmamykin', 'hamin', 'mjording', 'Ocramius', 'brianchandotcom'))
//  .then(console.log.bind(console, 'Most popular user'))
//  .then(_ => console.log(state2))

playByPlay(findPopularUsername('kmamykin', 'mojombo'))
  .expect(storage.getItem('users:kmamykin'), null)
  .expect(github.getUser('kmamykin'), {login: 'kmamykin', followers: 10})
  .expect(storage.setItem('users:kmamykin', {login: 'kmamykin', followers: 10}))
  .expect(storage.getItem('users:mojombo'), null)
  .expect(github.getUser('mojombo'), {login: 'mojombo', followers: 1000})
  .expect(storage.setItem('users:mojombo', {login: 'mojombo', followers: 1000}))
  .returns('mojombo')
  .then(console.log, console.error)



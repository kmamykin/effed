import assert from 'assert'
import github, {runner as githubRunner} from './effects/github'
import storage, {runner as storageRunner, mapRunner} from './effects/storage'
import {combineRunners, run, simulate, playByPlay} from './effective'
import githubMostPopular from './githubMostPopular'

function * fetchFollowers (username) {
  const user = yield github.getUser(username)
  const followers = yield github.getFollowers(user.followers_url)
  return followers.map(f => f.url)
}

//runner(fetchFollowers('kmamykin'), githubRunner({})).then(console.log, console.error)


import {zipWith, partition} from 'lodash'

function * awkwardGetMostPopularUsername (...usernames) {
  const cached = yield usernames.map(username => storage.getItem(`users:${username}`))
  const [cachedUsers, notCachedUsers] = partition(zipWith(usernames, cached, (username, followers) => ({
    username,
    followers
  })), u => u.followers)
  const githubUserResponses = yield notCachedUsers.map(u => github.getUser(u.username))
  const githubUsers = zipWith(notCachedUsers, githubUserResponses, (user, response) => ({
    username: user.username,
    followers: response.followers
  }))
  return githubMostPopular(cachedUsers.concat(githubUsers))
}

function * getMostPopularUsername (...usernames) {
  const users = []
  for (let username of usernames) {
    let followers = yield storage.getItem(`users:${username}`)
    if (!followers) {
      followers = (yield github.getUser(username)).followers
      yield storage.setItem(`users:${username}`, followers)
    }
    users.push({username, followers})
  }
  return githubMostPopular(users)
}

//playByPlay(awkwardGetMostPopularUsername())
//  .returns(null)
//  .then(console.log, console.error)
//
//playByPlay(awkwardGetMostPopularUsername('kmamykin'))
//  .expect(storage.getItem('users:kmamykin'), 10)
//  .returns('kmamykin')
//  .then(console.log, console.error)
//
//playByPlay(awkwardGetMostPopularUsername('kmamykin'))
//  .expect(storage.getItem('users:kmamykin'), null)
//  .expect(github.getUser('kmamykin'), {followers: 10})
//  .returns('kmamykin')
//  .then(console.log, console.error)
//
//playByPlay(awkwardGetMostPopularUsername('kmamykin', 'mojombo'))
//  .expect(storage.getItem('users:kmamykin'), null)
//  .expect(storage.getItem('users:mojombo'), null)
//  .expect(github.getUser('kmamykin'), {followers: 10})
//  .expect(github.getUser('mojombo'), {followers: 1000})
//  .returns('mojombo')
//  .then(console.log, console.error)
//
//playByPlay(awkwardGetMostPopularUsername('kmamykin', 'mojombo'))
//  .expect(storage.getItem('users:kmamykin'), 10)
//  .expect(storage.getItem('users:mojombo'), 1000)
//  .returns('mojombo')
//  .then(console.log, console.error)
//
//playByPlay(awkwardGetMostPopularUsername('kmamykin', 'mojombo'))
//  .expect(storage.getItem('users:kmamykin'), 10)
//  .expect(storage.getItem('users:mojombo'), null)
//  .expect(github.getUser('mojombo'), {followers: 1000})
//  .returns('mojombo')
//  .then(console.log, console.error)
//
playByPlay(getMostPopularUsername('kmamykin', 'mojombo'))
  .expect(storage.getItem('users:kmamykin'), 10)
  .expect(storage.getItem('users:mojombo'), null)
  .expect(github.getUser('mojombo'), {followers: 1000})
  .expect(storage.setItem('users:mojombo', 1000))
  .returns('mojombo')
  .then(console.log, console.error)

const state2 = new Map()
const myRun = run(combineRunners(mapRunner(state2), githubRunner({})))

myRun(getMostPopularUsername('kmamykin', 'hamin', 'mjording', 'Ocramius', 'brianchandotcom'))
  .then(console.log.bind(console, 'Most popular user'))
  .then(_ => console.log(state2))

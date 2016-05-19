// Github effects moduel.
// Exports effect creators and effect runner
import fetch from 'node-fetch'

export default {
  getUser: username => ({type: 'GET_USER', username}),
  getFollowers: url => ({type: 'GET_FOLLOWERS', url})
}

// runner :: config -> effect -> Promise
export const runner = config => effect => {
  switch (effect.type) {
    case 'GET_USER':
      const getUserUrl = `https://api.github.com/users/${effect.username}`
      console.log(`fetch(${getUserUrl})`)
      return fetch(getUserUrl).then(r => r.json())
    case 'GET_FOLLOWERS':
      const getFollowersUrl = effect.url
      console.log(`fetch(${getFollowersUrl})`)
      return fetch(getFollowersUrl).then(r => r.json())
  }
}


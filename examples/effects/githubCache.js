import github from './github'
import storage from './storage'

export default {
  getCachedUser: username => ({type: 'GET_CACHED_USER', username})
}

export const runner = ({storageRunner, githubRunner}) => effect => {
  switch (effect.type) {
    case 'GET_CACHED_USER':
      return storageRunner(storage.getItem(effect.username))
        .then(cachedUserOrNull => {
          if (cachedUserOrNull) {
            return cachedUserOrNull
          } else {
            return githubRunner(github.getUser(effect.username))
              .then(githubUser => {
                return storageRunner(storage.setItem(effect.username, githubUser))
                  .then(_ => githubUser)
              })
          }
        })
  }
}

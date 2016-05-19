import storage from './storage'

export default {
  fetch: (key, onMiss) => ({type: 'FETCH_CACHED', key, onMiss})
}

export const runner = ({storageRunner, githubRunner}) => effect => {
  switch (effect.type) {
    case 'FETCH_CACHED':
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

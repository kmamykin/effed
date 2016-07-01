const fetch = require('node-fetch')
const FETCH = Symbol('FETCH')

const headersToObject = headers => {
  const result = {}
  headers.forEach((value, name) => {
    result[name.toLowerCase()] = value.toString()
  })
  return result
}

const responseWithBody = response => body => ({
  headers: headersToObject(response.headers),
  ok: response.ok,
  // redirected: response.redirected,
  status: response.status,
  statusText: response.statusText,
  // type: response.type,
  url: response.url,
  body
})

const parseBody = response => {
  // TODO: this logic of mapping which parser to use based on the response headers needs to be bulked up
  if (response.headers.get('content-type') && response.headers.get('content-type').toLowerCase().indexOf('application/json') >= 0) {
    return response.json()
  } else {
    return response.text()
  }
}

const noop = () => {}

const middleware = ({ log = noop }) => (run) => (next) => {
  const actions = {
    [FETCH]: ({ url, options }) => {
      log('REQUEST:', url, options)
      return fetch(url, options).then(res => {
        return parseBody(res)
          .then(responseWithBody(res))
          .then(response => {
            log('RESPONSE:', response)
            return response
          }, error => {
            log('ERROR:', error)
            throw error
          })
      })
    }
  }
  return (effect) => (actions[effect.type] || next)(effect)
}

module.exports = {
  'default': middleware,
  fetch: (url, options = {}) => ({ type: FETCH, url, options })
}

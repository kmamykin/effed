# effed

JavaScript library that elevates side-effects to the front line.

Inspired by project like `redux` and `redux-saga` effed proposes that idea that the code/business logic can be
expressed as a generator yielding effects (which are plain objects) and the run function that interprets those effects.

## Quick example

```javascript

// inside fetch.js
import fetch from 'node-fetch'

// define middleware that will run fetch effects
export const fetchMiddleware = (run) => (next) => (effect) => {
    if (effect.type === 'fetch') {
        return fetch(effect.url, effect.options)
            .then(response => response.json())
    } else {
        return next(effect)
    }
}

// define effect creator function
export const fetch = (url, options = {}) => (type: 'fetch', url, options)


// inside index.js
import {createRunner} from 'effed'
import {fetchMiddleware, fetch) from './fetch'

// create the run function that is capable of running generators yielding fetch effects
const run = createRunner(fetchMiddleware)

// run a generator function
run(function * () {
    const content1 = yield fetch('http://url1')
    const content2 = yield fetch('http://url2')
    return [content1, content1]
}).then(console.log, console.error)
// => [{...}, {...}] contents of url2 and url2 are returned in a Promise

```

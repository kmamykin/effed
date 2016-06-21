# effed

JavaScript library that elevates side-effects to the front line.

Inspired by project like `redux` and `redux-saga` effed proposes that idea that the code/business logic can be
expressed as a generator yielding effects (which are plain objects) and the run function that interprets those effects.

While inspired by `redux` the proposed model of computation is generic enough to be used anywhere where generators
are supported, in the browser or in node.js environment.

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

## Concepts

*Effect* - a plain JavaScript object defining the side-effect requested. The "primitive" effects define some IO
 operation, e.g. fetch a url, read a file, query database. The "primitive" effects can be combined into higher level
 effects by either using combinators like `parallel`, `race`, `sequence`, or defining a generator that combines
 other effects and returns the result.

*run* - is a function that is able to drive passed in generator until it completes, using a chain of middleware.
Generally on a project, there will be one module that export such function, already created with all middleware
that a project uses.

`run :: Effect -> Promise<any>`

*middleware* - implements the logic of running an effect and returns a promise with the result of the effect.
Middlewares are passed to `createRunner` function, where they are chained internally into a pipeline and used
to run each effect. To write a middleware one simply needs to define a function with the following signature:

`middleware :: run -> next -> effect -> Promise<effect result>`

```javascript
// inside ./run.js
const myMiddleware = (config) => (run) => (next) => (effect) => {
    if (effectIsForMe(effect)) {
        // can use run function here to run a sub-effect if needed
        return Promise.resolve(someResult)
    } else {
        // continue the chain of processing
        return next(effect)
    }
}
const importedMiddleware from 'importedMiddleware'
export default createRunner(myMiddleware({}), importedMiddleware({}))
```

## Composition of effects

## Testing

The major benefit of expressing the logic as a generator emitting effects is the ease of testing.

The scripts themselves are synchronous generators, and the tests just need to verify that they emit correct sequence
of effects when fed predefined results of previous effects.

## FAQ

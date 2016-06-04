// Rethinking state machine in JavaScript
// event based definition
const StateMachine = (stateFactory, initialState) => {
  // console.log('StateMachine initialized', initialState)
  let currentState = createState(initialState)
  return proxyToCurrentState()

  function createState (state) {
    return stateFactory(state, function transition (newState) {
      // console.log('StateMachine transitioned', state, '=>', newState)
      currentState = createState(newState)
    })
  }

  function proxyToCurrentState () {
    if (typeof currentState === 'function') {
      return (...args) => currentState(...args)
    } else {
      return Object.keys(currentState).reduce((memo, key) => {
        memo[key] = function (...args) {
          return currentState[key](...args)
        }
        return memo
      }, {})
    }
  }
}

console.log('Traffic light example. red/yellow/green')

const trafficLight = StateMachine((state = 'red', transition) => ({
  change: () => {
    const nextState = state === 'green' ? 'yellow' : (state === 'yellow' ? 'red' : 'green')
    transition(nextState)
    return nextState
  }
}))

console.log(trafficLight.change())
console.log(trafficLight.change())
console.log(trafficLight.change())
console.log(trafficLight.change())

console.log('Manual transmission example')

const ManualTransmission = (maxGear, log) => StateMachine((gear = 1, transition) => {
  return {
    gearUp: () => {
      if (gear < maxGear) return transition(gear + 1)
    },
    gearDown: () => {
      if (gear > 1) return transition(gear - 1)
    }
  }
})

const manualTransmission = ManualTransmission(3)
manualTransmission.gearUp()
manualTransmission.gearUp()
manualTransmission.gearUp()
manualTransmission.gearUp()
manualTransmission.gearDown()
manualTransmission.gearUp()
manualTransmission.gearDown()
manualTransmission.gearUp()
manualTransmission.gearDown()
manualTransmission.gearDown()
manualTransmission.gearDown()
manualTransmission.gearDown()

console.log('Just like lodash/underscore once')
const once = (fn) => StateMachine((called = false, transition) => {
  return () => {
    if (!called) {
      transition(true)
      return fn()
    }
  }
})
const calledOnce = once(() => {
  console.log('I am called!')
})

calledOnce(calledOnce(calledOnce))
calledOnce()
calledOnce()
calledOnce()

console.log('Memoization of an expensive calculation')
const memoize = (fn) => StateMachine((next = fn, transition) => {
  return (...args) => {
    const result = next(...args)
    transition(() => result)
    return result
  }
})

const calc = memoize((x) => {
  console.log('Doing expensive calc!')
  return x * 2
})

console.log(calc(3))
console.log(calc(4))
console.log(calc(5))

console.log('Sequential ID generator')
const nextId = StateMachine((lastId = 0, transition) => {
  return () => {
    const next = lastId + 1
    transition(next)
    return next
  }
})

console.log(nextId())
console.log(nextId())
console.log(nextId())
console.log(nextId())
console.log(nextId())
console.log(nextId())

console.log('Fibonacci sequence generator')
const fibonacci = StateMachine((emitted, transition) => {
  return () => {
    const next = !emitted ? [0, 0] : (emitted[1] === 0 ? [0, 1] : [emitted[1], emitted[0] + emitted[1]])
    transition(next)
    return next[1]
  }
})

console.log(fibonacci())
console.log(fibonacci())
console.log(fibonacci())
console.log(fibonacci())
console.log(fibonacci())
console.log(fibonacci())
console.log(fibonacci())
console.log(fibonacci())

console.log('Actors')
const Actor = () => StateMachine((state = Promise.resolve(0), transition) => {
  return {
    receive: (message) => {
      console.log('Received', message)
      switch (message.type) {
        case 'increment':
          return transition(state.then((n) => {
            return n + message.amount
          }))
        case 'decrement':
          return transition(state.then((n) => {
            return n - message.amount
          }))
        case 'print':
          return transition(state.then((n) => {
            console.log('Accumulated so far', n)
            return n
          }))
        default:
          // noop
          return
      }
    }
  }
})

const alice = Actor()
alice.receive({ type: 'increment', amount: 10 })
alice.receive({ type: 'increment', amount: 20 })
alice.receive({ type: 'increment', amount: 30 })
alice.receive({ type: 'decrement', amount: 45 })
alice.receive({ type: 'print' })
alice.receive({ type: 'print' })

// import Download from './Download';
//
// var oDownload = new Download();
//
// $("#download_button").click(function() {
//   oDownload.download();
// });
// $("#pause_button").click(function() {
//   oDownload.pause();
// });
// $("#resume_button").click(function() {
//   oDownload.download();
// });

// import GumballMachine from './GumballMachine';
//
// var oGumballMachine = new GumballMachine();
//
// $("#insert_quarter_button").click(function() {
//   oGumballMachine.insertQuarter();
// });
// $("#release_quarter_button").click(function() {
//   oGumballMachine.ejectQuarter();
// });
// $("#turn_crank_button").click(function() {
//   oGumballMachine.turnCrank();
//   oGumballMachine.dispense();
// });

// timed transitions, timeouts
// async example with Promises and may be callbacks?
// compisition: hierarchical composition (whole/part, e.g. TV/button/channel selector/tuner/video), parallel substates
// Example: re-implement Promise with StateMachine
// For example, we need to decide how to represent simple, nested and parallel states, transitions, guards, and special nodes: initial, choice, junction, etc.
// The main criteria for selecting this or another mapping should be code readability, efficiency, and sometimes portability
// Calculator example from http://citeseerx.ist.psu.edu/viewdoc/download;jsessionid=C21370DA64D2C21D2420A654D4CB7210?doi=10.1.1.154.77&rep=rep1&type=pdf

// Example: E.8 Microwave Oven (https://www.w3.org/TR/2005/WD-scxml-20050705/#microwave-1)
//
// This example implements a simple microwave oven that can be in one of two states:
//
// On --- the oven is running
// Off --- the oven is turned off
//
// State on itself has two substates:
//   Cooking --- the oven is cooking
// Idle --- the oven is idle
//
// The oven responds to three external event sources:
//   Door open/close
// Timer that tracks cook-time
// Power button

// Example: Gumball machine (vending machine)
// https://github.com/bethrobson/Head-First-Design-Patterns/tree/master/src/headfirst/designpatterns/proxy/gumball

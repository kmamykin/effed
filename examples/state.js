const StateMachine = (stateFactory, initialState) => {
  console.log('StateMachine initialized', initialState)
  let currentState = createState(initialState)
  return proxy()

  function createState (state) {
    return stateFactory(state, function transition (newState) {
      console.log('StateMachine transitioned', state, '=>', newState)
      currentState = createState(newState)
    })
  }

  function proxy () {
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

const trafficLight = StateMachine((state = 'green', transition) => ({
  switch: () => {
    state === 'green' ? transition('red') : transition('green')
  }
}))

console.log(trafficLight)
trafficLight.switch()
trafficLight.switch()

// Rethinking state machine in JavaScript
// event based definition
const ManualTransmission = (maxGear) => StateMachine((gear = 1, transition) => ({
  gearUp: () => {
    if (gear < maxGear) return transition(gear + 1)
  },
  gearDown: () => {
    if (gear > 1) return transition(gear - 1)
  }
}))

const manualTransmission = ManualTransmission(3)
console.log(manualTransmission)
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

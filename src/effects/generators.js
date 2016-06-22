module.exports = () => (run) => (next) => (effect) => {
  if (isGeneratorFunction(effect)) {
    return drive(run, effect())
  } else if (isGenerator(effect)) {
    return drive(run, effect)
  } else {
    return next(effect)
  }
}

function drive(run, gen) {
  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  return new Promise(function (resolve, reject) {

    onFulfilled()

    function onFulfilled (res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
      return null;
    }

    function onRejected (err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    function next (ret) {
      // console.log(ret)
      if (ret.done) return resolve(ret.value); // interpret the last effect returned?
      var value = run(ret.value)
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  })
}

function isGeneratorFunction (obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  return ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName)
}

function isGenerator (obj) {
  return isIterator(obj) && isIterable(obj) && 'function' == typeof obj.throw;
}

function isIterator (obj) {
  return 'function' === typeof obj.next
}

function isIterable (obj) {
  return 'function' === typeof obj[Symbol.iterator]
}

function isPromise (obj) {
  return 'function' == typeof obj.then;
}


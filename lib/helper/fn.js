var Promise = require('promise');


export function bind(element, fn) {

  if (typeof fn === 'string') {
    fn = element[fn];
  }

  if (!fn) {
    throw new Error('fn required');
  }

  return fn.bind(element);
}

export function denodeify(element, fn, wrapper) {

  var promised = Promise.denodeify(bind(element, fn));

  if (wrapper) {
    return function() {
      return promised.apply(this, arguments).then(wrapper);
    };
  } else {
    return promised;
  }
}
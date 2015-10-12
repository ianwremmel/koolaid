import _ from 'lodash';
import {getTableForModel} from '../lib/routing-table';

export default function method(options) {
  options = options || {};

  if (!options.basePath) {
    throw new Error('`options.basePath` is required');
  }

  return function(target) {
    const table = getTableForModel(target);
    table.basePath = options.basePath;

    if (!target.$hasContext) {
      contextualize(target, target);
    }
  };
}

let ctx = {};
export function setContext(context) {
  ctx = context;
}

const contextualized = new WeakMap();
function contextualize(obj, target) {
  // Yep, the double negation here is kinda weird. Basically, it means "keep
  // going if obj is not its own constructor"; doing the negation this way
  // lets me write the next iteration as a tail call which, supposedly,
  // optimizes better.
  if (!(obj !== (obj && obj.constructor))) {
    return;
  }

  if (contextualized.has(obj)) {
    return;
  }

  contextualized.set(obj);

  decorateObject(obj, target);
  if (obj.prototype) {
    decorateObject(obj.prototype, target.prototype);
  }

  contextualize(Object.getPrototypeOf(obj), target);
}

function decorateObject(obj, target) {
  Object.getOwnPropertyNames(obj).forEach((name) => {
    if (!_.contains(['constructor', 'prototype', 'length'], name)) {
      decorateMethod(obj, name, target);
    }
  });
}

function decorateMethod(obj, name, target) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, name);
  const value = descriptor.value;
  if (typeof value === 'function' && (!target[name] || obj[name] === target[name])) {
    descriptor.value = _.wrap(value, function(fn, ...args) {
      return fn.call(this, ...args, (typeof ctx === 'function' ? ctx() : ctx));
    });
    Object.defineProperty(target, name, descriptor);
  }
}

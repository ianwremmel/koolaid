import _ from 'lodash';
import cls from 'continuation-local-storage';
import {getTableForModel} from '../lib/routing-table';
import {wrap as access} from './access';
import {wrap as param} from './param';

export default function method(options) {
  options = options || {};

  if (!options.basePath) {
    throw new Error(`\`options.basePath\` is required`);
  }

  return function(target) {
    const table = getTableForModel(target);
    table.basePath = options.basePath;

    if (!target.$hasContext) {
      contextualize(target, target);
    }
  };
}

const contextualized = new WeakMap();
function contextualize(obj, target) {
  // Make sure we stop before attemping to decorate the native Object
  if (obj === Reflect.getPrototypeOf(Object)) {
    return;
  }

  if (contextualized.has(obj)) {
    return;
  }

  contextualized.set(obj);

  contextualizeObject(obj, target);
  if (obj.prototype) {
    contextualizeObject(obj.prototype, target.prototype);
  }

  contextualize(Reflect.getPrototypeOf(obj), target);
}

function contextualizeObject(obj, target) {
  Object.getOwnPropertyNames(obj).forEach((name) => {
    if (!_.contains([`constructor`, `prototype`, `length`], name)) {
      contextualizeMethod(obj, name, target);
    }
  });
}

function contextualizeMethod(obj, name, target) {
  const descriptor = Reflect.getOwnPropertyDescriptor(obj, name);
  if (typeof descriptor.value === `function` && (!target[name] || obj[name] === target[name])) {

    // Reminder: wrappers are executed bottom to top.
    descriptor.value = _.wrap(descriptor.value, function(fn, ...args) {
      const ctx = cls.getNamespace(`ctx`);
      args.push(typeof ctx === `function` ? ctx() : ctx);
      return Reflect.apply(fn, this, args);
    });

    param(target, name, descriptor);
    access(target, name, descriptor);

    Reflect.defineProperty(target, name, descriptor);
  }
}

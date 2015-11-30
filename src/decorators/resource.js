import assert from 'assert';
import lodashWrap from 'lodash.wrap';
import cls from 'continuation-local-storage';
import {getTableForModel} from '../lib/routing-table';
import {wrap as access} from './access';
import {wrap as param} from './param';

/**
 * @name ATSIGNresource
 * @function
 * @param {Object} options Options object
 * @param {string} options.basePath The path at which to route the resource. All
 * of the resource's {@link method}s will be relative to this path.
 * @param {string} options.idParam The name of the resource property to search for
 * when looking up the model based on a route parak
 * @returns {undefined}
 */
export default function resource(options) {
  options = options || {};

  assert(options.basePath, `\`options.basePath\` is required`);

  return function _resource(target) {
    const table = getTableForModel(target);
    table.basePath = options.basePath;
    table.idParam = options.idParam || `id`;

    contextualize(target, target);
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
  // Reflect.getOwnPropertyNames doesn't exist, so need to disable
  // prefer-reflect here.
  /* eslint prefer-reflect: [0] */
  Object.getOwnPropertyNames(obj).forEach((name) => {
    if (![`constructor`, `prototype`, `length`].includes(name)) {
      contextualizeMethod(obj, name, target);
    }
  });
}

function contextualizeMethod(obj, name, target) {
  const descriptor = Reflect.getOwnPropertyDescriptor(obj, name);
  if (typeof descriptor.value === `function` && (!target[name] || obj[name] === target[name])) {

    // Reminder: wrappers are executed bottom to top.
    descriptor.value = lodashWrap(descriptor.value, function wrapper(fn, ...args) {
      const ctx = cls.getNamespace(`ctx`);
      args.push(typeof ctx === `function` ? ctx() : ctx);
      return Reflect.apply(fn, this, args);
    });

    param(target, name, descriptor);
    access(target, name, descriptor);

    // Guarantee that all methods return a Promise
    descriptor.value = lodashWrap(descriptor.value, async function wrapper(fn, ...args) {
      return await Reflect.apply(fn, this, args);
    });

    Reflect.defineProperty(target, name, descriptor);
  }
}

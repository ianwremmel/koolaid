import {finishCurrentMethod, getCurrentMethod} from '../lib/routing-table';

export default function method(options) {
  options = options || {};

  if (!options.verb) {
    throw new Error('`options.verb` is required');
  }

  if (!options.path) {
    throw new Error('`options.path` is required');
  }

  return function(target, name) {
    const method = getCurrentMethod(target, name);
    Object.assign(method, {
      path: options.path.toLowerCase(),
      verb: options.verb.toLowerCase()
    });
    finishCurrentMethod(target, name);
  };
}

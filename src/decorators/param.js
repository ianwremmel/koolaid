import {getCurrentMethod} from '../lib/routing-table';

export default function method(options) {
  options = options || {};

  if (!options.source) {
    throw new Error('`options.source` is required');
  }

  return function(target, name) {
    const method = getCurrentMethod(target, name);
    method.params = method.params || [];
    method.params.unshift(options);
  };
}

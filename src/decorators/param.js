import {getCurrentMethod} from '../lib/routing-table';

export default function method(options) {
  options = options || {};

  if (!options.source) {
    throw new Error('`options.source` is required');
  }

  return function(target, name) {
    const method = getCurrentMethod(target, name);
    let params = method.get('params');
    if (!params) {
      params = [];
      method.set('params', params);
    }
    params.unshift(options);
  };
}

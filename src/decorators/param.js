import _ from 'lodash';
import {BadRequest} from '../lib/http-error';
import {getCurrentMethod} from '../lib/routing-table';

export default function method(options) {
  options = options || {};

  if (!options.source) {
    throw new Error('`options.source` is required');
  }

  return function(target, name, descriptor) {
    const method = getCurrentMethod(target, name);
    let params = method.get('params');
    if (!params) {
      params = [];
      method.set('params', params);
    }
    params.unshift(options);

    // FIXME apply at leaf method
    const value = descriptor.value;
    descriptor.value = _.wrap(value, (fn, ...args) => {
      // add 1 to account for ctx
      if (args.length !== (params.length + 1)) {
        // TODO attempt to generate error string
        throw new BadRequest();
      }
      return fn(...args);
    });
  };
}

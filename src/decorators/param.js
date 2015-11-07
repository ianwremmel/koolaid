import _ from 'lodash';
import {BadRequest} from '../lib/http-error';
import {getCurrentMethod, getRoutingTable} from '../lib/routing-table';
import isStatic from '../lib/is-static';

export default function method(options) {
  options = options || {};

  if (!options.source) {
    throw new Error(`\`options.source\` is required`);
  }

  return function(target, name) {
    const method = getCurrentMethod(target, name);
    let params = method.get(`params`);
    if (!params) {
      params = [];
      method.set(`params`, params);
    }
    params.unshift(options);
  };
}

export function wrap(target, name, descriptor) {
  descriptor.value = _.wrap(descriptor.value, function(fn, ...args) {
    const method = getRoutingTable(target).methods[name];
    if (method) {
      const params = method[isStatic(target, name)][0].params;
      if (params && args.length !== params.length) {
        throw new BadRequest(`One or more required parameters are missing`);
      }
    }

    return Reflect.apply(fn, this, args);
  });
}

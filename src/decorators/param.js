import assert from 'assert';
import {BadRequest} from '../http-error';
import {getCurrentMethod, getRoutingTable} from '../lib/routing-table';
import isStatic from '../lib/is-static';
import {wrap as lodashWrap} from 'lodash';

/**
 * Use in conjuction with {@link ATSIGNmethod} to specify how methods get their
 * input values.
 * @name ATSIGNparam
 * @function
 * @param {Object} options Options object
 * @param {string} [options.name] Indicates the path to the paramater's value
 * e.g. if the source is `body`, a JSON object, then `name` would be a path
 * within the JSON object
 * @param {string} options.source part of the request from which to get the
 * parameter (`body`, `query`, `headers`, etc)
 * @returns {undefined}
 */
export default function param(options) {
  options = options || {};

  assert(options.source, `\`options.source\` is required`);

  return function _param(target, name) {
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
  descriptor.value = lodashWrap(descriptor.value, function wrapper(fn, ...args) {
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

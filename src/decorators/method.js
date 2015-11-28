import assert from 'assert';
import {finishCurrentMethod, getCurrentMethod} from '../lib/routing-table';

/**
 * Expose a {@link ATSIGNresource} method on an HTTP route. May be invoked
 * multiple times to expose the same method on multiple routes.
 * @name ATSIGNmethod
 * @function
 * @param {Object} options Options object
 * @param {string} options.verb The HTTP verb for required to invoke the method.
 * @param {string} options.path The path relative to the
 * {@link ATSIGNresource}'s basePath) at which to mount the method
 * @param {afterCallback} options.after invoked to transform the method's
 * response before sending it back to the client
 * @returns {undefined}
 */
export default function method(options) {
  options = options || {};

  assert(options.verb, `\`options.verb\` is required`);
  options.path = options.path || `/`;

  return function _method(target, name) {
    const method = getCurrentMethod(target, name);
    method.set(`path`, options.path.toLowerCase());
    method.set(`verb`, options.verb.toLowerCase());
    if (options.after) {
      method.set(`after`, options.after);
    }
    finishCurrentMethod(target, name);
  };
}

/**
 * Invoked after a model method completes but before the response is serialized
 * in order to transform it before sending it to the client.
 * @callback afterCallback
 * @param {Object} result the result of invoking the model method
 * @param {Object} ctx a continuation-local-storage namespace containing useful
 * things like `req`, `res`, `user`, `model`
 */

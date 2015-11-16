/* eslint-disable */
import _ from 'lodash';
import ACL from 'acl';
import cls from 'continuation-local-storage';
import {findOrCreateMap} from '../lib/map';
import {Forbidden} from '../lib/http-error';
import isStatic from '../lib/is-static';
import requireDir from 'require-dir';

let accessControlList, acl;
const aclMap = new Map();

const accessMap = new Map();

/**
 * Decorator. Use it to specify the accessType needed to interact with the method
 * or model being decorated.
 * @param {string} accessType one of `read` or `write`
 * @returns {function}
 */
export default function decorate(accessType) {
  if (!accessType) {
    throw new Error(`\`accessType\` is required`);
  }

  return function access(target, name) {
    setAccessForMethod(target, name, accessType);
  };
}

/**
 * Used by router to configure the @access decorator
 * @param {Object} options Options object
 * @param {string} options.acls path to a directory of acl files
 * @param {string} options.backend name of the acl backend to use (currently
 * only supports those backends strapped to acl, but will eventually accept a
 * function as well as a string)
 * @param {array} options.backendArguments array of arguments to pass to the
 * constructor specified by `options.backend`.
 * @returns {undefined}
 */
export function configure(options) {
  if (!options.acls) {
    throw new Error(`@access: \`options.acls\` is required`);
  }

  if (!options.backend) {
    options.backend = `memory`;
  }

  if (!options.backendArguments) {
    options.backendArguments = [];
  }

  acl = new ACL(new ACL[`${options.backend}Backend`](...options.backendArguments));
  acl.addUserRoles(`authenticated`, `$authenticated`);
  acl.addUserRoles(`unauthenticated`, `$unauthenticated`);
  acl.addRoleParents(`$authenticated`, `$everyone`);
  acl.addRoleParents(`$unauthenticated`, `$everyone`);

  const acls = requireDir(options.acls);
  accessControlList = Object.keys(acls).reduce((list, key) => {
    return list.concat(acls[key]);
  }, []);
  acl.allow(accessControlList);

  // const acls = requireDir(options.acls);
  // accessControlList = Object.keys(acls).reduce((map, key) => {
  //   const acl = acls[key];
  //   return acl.reduce((map, ace) => {
  //     const modelMap = findOrCreateMap(map, ace.model);
  //     const propertyMap = findOrCreateMap(modelMap, ace.property);
  //     const accessTypeMap = findOrCreateMap(propertyMap, ace.accessType);
  //
  //     accessTypeMap.set(ace.principalId, ace.permission);
  //     return map;
  //   }, map);
  // }, aclMap);
}

/**
 * Used by @resource to decorate the leaf implementation of each of the
 * model's methods
 * @param {Function} target
 * @param {string} name
 * @param {Object} descriptor
 * @returns {Object} descriptor
 */
export function wrap(target, name, descriptor) {
  descriptor.value = _.wrap(descriptor.value, async function accessWrapper(fn, ...args) {
    const access = await isAllowed(target, name);
    if (!access) {
      throw new Forbidden();
    }
    return Reflect.apply(fn, this, args);
  });
}

function isAllowed(target, name) {
  return new Promise((resolve, reject) => {
    const ctx = cls.getNamespace(`ctx`);
    const req = ctx.get(`req`);
    if (!req) {
      throw new Error(`Cannot use @access in non-http environments`);
    }
    const principal = req.headers.authorization || `unauthenticated`;
    const resourceName = (isStatic(target) ? target : target.constructor).name;
    const accessType = getAccessForMethod(target, name);

    ctx.run(() => {
      ctx.set('running', true);
      acl.isAllowed(principal, resourceName, accessType, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  });
}

function setAccessForMethod(target, name, accessType) {
  const methodIsStatic = isStatic(target);
  const key = methodIsStatic ? target : target.constructor;
  const staticMap = findOrCreateMap(accessMap, key);
  const map = findOrCreateMap(staticMap, methodIsStatic);
  map.set(name, accessType);
}

export function getAccessForMethod(target, name, methodIsStatic) {
  methodIsStatic = typeof methodIsStatic === `undefined` ? isStatic(target) : methodIsStatic;
  let key = methodIsStatic ? target : target.constructor;
  let staticMap;
  while (key !== (key && key.constructor) && !staticMap) {
    staticMap = accessMap.get(key);
    key = Reflect.getPrototypeOf(key);
  }
  if (!staticMap) {
    return;
  }
  const map = staticMap.get(methodIsStatic);
  if (!map) {
    return;
  }
  const accessType = map.get(name);
  if (!accessType) {
    const resourceName = (isStatic(target) ? target : target.constructor).name;
    throw new Error(`No accessType defined for ${resourceName}${isStatic(target) ? '.' : '#'}${name}`);
  }

  return accessType;
}

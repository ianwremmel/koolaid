/* eslint-disable */
import _ from 'lodash';
import ACL from 'acl';
import cls from 'continuation-local-storage';
import extendError from 'extend-error';
import {findOrCreateMap} from '../lib/map';
import {Forbidden} from '../lib/http-error';
import isStatic from '../lib/is-static';
import requireDir from 'require-dir';

let accessControlList, acl, principals;
const aclMap = new Map();

const accessMap = new Map();
const NoAccessSpecified = extendError({subTypeName: `NoAccessSpecified`});

/**
 * Decorator. Use it to specify the accessType needed to interact with the method
 * or model being decorated.
 * Reminder: @access cannot be a part of at @method; @method translates requests
 * to method calls while @access indicates whether or not the user is allowed to
 * make the call.
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

export function create(target, name, descriptor) {
  bindUserToModel(descriptor, function(userId) {
    return async function addUserRoles(model) {
      // TODO use idParam from @resource
      const modelId = `owner-${model.id}`;
      await acl.addUserRoles(userId, modelId);
      await acl.addRoleParents(modelId, `$authenticated`)
    };
  });

  return descriptor;
}

export function destroy(target, name, descriptor) {
  bindUserToModel(descriptor, function(userId) {
    return async function removeUserRoles(model) {
      // TODO use idParam from @resource
      const modelId = `owner-${model.id}`;
      await acl.removeUserRoles(userId, modelId);
    };
  });

  return descriptor;
}

function bindUserToModel(descriptor, func) {
  descriptor.value = _.wrap(descriptor.value, async function annotate(fn, ...args) {
    const ctx = cls.getNamespace(`ctx`);
    const user = ctx.get(`user`);
    const models = await fn(...args);
    if (!user) {
      return models;
    }
    // TODO user needs a configurable idParam
    const userId = user.id;

    const f = func(userId);

    if (_.isArray(models)) {
      await Promise.all(models.map(f));
    }
    else {
      await f(models);
    }
    return models;
  });
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
  // TODO is there a better way to set up the default roles?
  // TODO these should be `await`ed
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

async function isAllowed(target, name) {
  const ctx = cls.getNamespace(`ctx`);
  const req = ctx.get(`req`);
  if (!req) {
    throw new Error(`Cannot use @access in non-http environments`);
  }
  const principal = req.headers.authorization || `unauthenticated`;
  const resourceName = (isStatic(target) ? target : target.constructor).name;
  try {
    const accessType = getAccessForMethod(target, name);
    let access = await acl.isAllowed(principal, resourceName, accessType);
    if (!access) {
      const model = ctx.get(`model`);
      if (!model) {
        return access;
      }
      access = await acl.isAllowed(principal, `creator-${model.id}`, accessType);
    }
    return access;
  }
  catch (e) {
    if (e instanceof NoAccessSpecified) {
      return true;
    }
    throw e;
  }
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
    throw new NoAccessSpecified(`No accessType defined for ${resourceName}${isStatic(target) ? '.' : '#'}${name}`);
  }

  return accessType;
}

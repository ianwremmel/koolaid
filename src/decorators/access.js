import _ from 'lodash';
import {findOrCreateMap} from '../lib/map';
import {Forbidden} from '../lib/http-error';
import isStatic from '../lib/is-static';

const accessTable = new Map();

function defaultAccessCallback() {
  return true;
}

let accessCallback = defaultAccessCallback;

async function checkAccess(...args) {
  // TODO ...args needs to contain target, accessType, userId, and objectId (if
  // not static)
  return await accessCallback(...args);
}

export default function access(accessType) {
  if (!accessType) {
    throw new Error(`\`accessType\` is required`);
  }

  return function(target, name) {
    setAccessForMethod(target, name, accessType);
  };
}

export function wrap(target, name, descriptor) {
  const accessType = getAccessForMethod(target, name);
  if (!accessType) {
    return;
  }

  descriptor.value = _.wrap(descriptor.value, async function(fn, ...args) {
    const canAccess = await checkAccess(target, name, accessType);
    if (!canAccess) {
      throw new Forbidden();
    }

    return await Reflect.apply(fn, this, args);
  });

  return descriptor;
}

function setAccessForMethod(target, name, accessType) {
  const accessTableForTarget = findOrCreateMap(accessTable, target);
  const accessTableForMethod = findOrCreateMap(accessTableForTarget, name);
  accessTableForMethod.set(isStatic(target), accessType);
}

export function setAccessCallback(fn) {
  accessCallback = fn;
}

export function getAccessForMethod(target, name) {
  let t = target;
  while (t !== (t && t.constructor)) {
    const table = accessTable.get(t);
    if (table) {
      const accessTableForMethod = table.get(name);
      if (accessTableForMethod) {

        const access = accessTableForMethod.get(isStatic(target));
        if (access) {

          return access;
        }
      }
    }
    t = Reflect.getPrototypeOf(t);
  }
}

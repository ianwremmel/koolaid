import cls from 'continuation-local-storage';
import _ from 'lodash';
import {findOrCreateMap, findTargetInMap} from '../lib/map';
import {Forbidden} from '../lib/http-error';
import isStatic from '../lib/is-static';

export default function decorate(access) {
  if (_.isString(access)) {
    return setAccessType(access);
  }

  return setAccessFunction(access);
}

export function wrap(target, name, descriptor) {
  descriptor.value = _.wrap(descriptor.value, async function wrapper(fn, ...args) {
    const ctx = cls.getNamespace(`ctx`);

    const accessType = getAccessTypeForMethod(target, name);

    let accessFunction = getAccessFunctionForMethod(target, name);
    if (!accessFunction) {
      accessFunction = getAccessFunctionForClass(target);
    }

    // allow by default
    if (accessFunction) {
      const access = await accessFunction(ctx.get(`user`), ctx.get(`Model`), ctx.get(`model`), name, accessType);
      if (!access) {
        throw new Forbidden();
      }
    }

    return Reflect.apply(fn, this, args);
  });
}

const accessTypeMap = new Map();

function setAccessType(accessType) {
  return function _setAccessType(target, name) {
    const methodIsStatic = isStatic(target);
    const key = methodIsStatic ? target : target.constructor;
    const staticMap = findOrCreateMap(accessTypeMap, key);
    const map = findOrCreateMap(staticMap, methodIsStatic);
    map.set(name, accessType);
  };
}

function getAccessTypeForMethod(target, name) {
  const methodIsStatic = isStatic(target);
  let key = methodIsStatic ? target : target.constructor;
  while (key !== (key && key.constructor)) {
    const staticMap = accessTypeMap.get(key);
    if (staticMap) {
      const map = staticMap.get(methodIsStatic);
      if (map) {
        const accessType = map.get(name);
        if (accessType) {
          return accessType;
        }
      }
    }

    key = Reflect.getPrototypeOf(key);
  }
}

function setAccessFunction(fn) {
  return function _setAccessFunction(target, name, descriptor) {
    if (name) {
      return setAccessFunctionForMethod(fn, target, name, descriptor);
    }

    return setAccessFunctionForClass(fn, target);
  };
}

const classAccessFunctionMap = new Map();

function setAccessFunctionForClass(fn, target) {
  classAccessFunctionMap.set(target, fn);
}

function getAccessFunctionForClass(target) {
  return findTargetInMap(classAccessFunctionMap, target);
}

const methodAccessFunctionMap = new Map();

function setAccessFunctionForMethod(fn, target, name) {
  const classMap = findOrCreateMap(methodAccessFunctionMap, target);
  classMap.set(name, fn);
}

function getAccessFunctionForMethod(target, name) {
  const methodIsStatic = isStatic(target);
  let key = methodIsStatic ? target : target.constructor;
  while (key !== (key && key.constructor)) {
    const classMap = methodAccessFunctionMap.get(key);
    if (classMap) {
      const fn = classMap.get(name);
      if (fn) {
        return fn;
      }
    }

    key = Reflect.getPrototypeOf(key);
  }
}

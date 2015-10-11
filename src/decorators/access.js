import isStatic from '../lib/is-static';

const accessTable = new Map();

export default function access(accessType) {
  if (!accessType) {
    throw new Error('`accessType` is required');
  }

  return function(target, name, descriptor) {
    setAccessForMethod(target, name, accessType);
    //
    // const fn = descriptor.value
    // descriptor.value = function(...args) {
    //   // return denodeify(acl.isAllowed)(currentUser(), getResourceName(target), accessType)
    //   //   .then(() => {
    //   //     fn(...args)
    //   //   })
    //   fn(...args)
    // }
    //
    // return descriptor
  };
}

function findOrCreateMap(map, key) {
  let value = map.get(key);
  if (!value) {
    value = new Map();
    map.set(key, value);
  }
  return value;
}

function setAccessForMethod(target, name, accessType) {
  const accessTableForTarget = findOrCreateMap(accessTable, target);
  const accessTableForMethod = findOrCreateMap(accessTableForTarget, name);
  accessTableForMethod.set(isStatic(target), accessType);
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
    t = Object.getPrototypeOf(t);
  }
}

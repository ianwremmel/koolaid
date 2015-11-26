import isStatic from './is-static';
export function findOrCreateMap(map, key) {
  let value = map.get(key);
  if (!value) {
    value = new Map();
    map.set(key, value);
  }
  return value;
}

export function findTargetInMap(map, target) {
  let key = isStatic(target) ? target : target.constructor;
  let result;
  while (key !== (key && key.constructor) && !result) {
    result = map.get(key);
    key = Reflect.getPrototypeOf(key);
  }
  return result;
}

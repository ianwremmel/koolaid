export function findOrCreateMap(map, key) {
  let value = map.get(key);
  if (!value) {
    value = new Map();
    map.set(key, value);
  }
  return value;
}

export function findInMap(map, key) {
  const value = map.get(key);
  return value;
}

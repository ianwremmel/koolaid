export default function isStatic(target) {
  return Boolean(target.prototype);
}

export default function isStatic(target) {
  return !!target.prototype;
}

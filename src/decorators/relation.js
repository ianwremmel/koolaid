export default function method(options) {
  options = options || {};

  return function(target) {
    // TODO ensure target has a static `find` method
    // TODO ensure target has a static `findById` method (or possibly assign a
    // default one)
  };
}
// hasA and hasMany
// ownsOne and ownsMany
// belongsTo

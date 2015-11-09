// inspired by qs-numbers
export default function queryStringNumbers() {
  return function handler(req, res, next) {
    if (req.query) {
      parseNumbers(req.query);
    }

    next();
  };

  function parseNumbers(obj, refs) {
    refs = refs || [];
    const lookup = refs.indexOf(obj);
    if (lookup !== -1) {
      return;
    }

    refs.push(obj);

    // Reflect.getOwnPropertyNames doesn't exist, so need to disable
    // prefer-reflect here.
    /* eslint prefer-reflect: [0] */
    for (const p of Object.getOwnPropertyNames(obj)) {
      const val = obj[p];

      if (typeof val === `object`) {
        parseNumbers(val, refs);
        continue;
      }

      if (isNumber(val)) {
        obj[p] = parseFloat(val);
      }
    }
  }

  function isNumber(val) {
    return !Array.isArray(val) && (val - parseFloat(val) + 1) >= 0;
  }
}

import {getTableForModel} from '../lib/routing-table';

export default function method(options) {
  options = options || {};

  if (!options.basePath) {
    throw new Error('`options.basePath` is required');
  }

  return function(target) {
    const table = getTableForModel(target);
    table.basePath = options.basePath;
  };
}

import access from './decorators/access';
import method from './decorators/method';
import param from './decorators/param';
import relation from './decorators/relation';
import resource from './decorators/resource';

export default function loadModels(app, options) {
  if (!options.models) {
    throw new Error('`options.models` is required');
  }

  // TODO this is where we should register routes, not in @model
}

// Apparently, `import a from 'a'; export a;` doesn't work.
Object.assign(loadModels, {
  access,
  method,
  param,
  relation,
  resource
});

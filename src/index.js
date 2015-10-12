import access from './decorators/access';
import method from './decorators/method';
import {mount} from './decorators/resource';
import param from './decorators/param';
import relation from './decorators/relation';
import requireDir from 'require-dir';
import resource from './decorators/resource';
import express from 'express';

export default function loadModels(options) {
  if (!options.models) {
    throw new Error('`options.models` is required');
  }

  const models = requireDir(options.models);
  const router = express.Router();

  Object.keys(models).reduce((router, modelName) => {
    const model = models[modelName];
    router.use(mount(model));
  }, router);

  return router;
}

// Apparently, `import a from 'a'; export a;` doesn't work.
Object.assign(loadModels, {
  access,
  method,
  param,
  relation,
  resource
});

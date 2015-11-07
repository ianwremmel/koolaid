import _ from 'lodash';
import access from './decorators/access';
import cls from 'continuation-local-storage';
import express from 'express';
import {getFlatRoutingTable} from './lib/routing-table';
import {middleware as httpErrorHandler} from './lib/http-error';
import method from './decorators/method';
import param from './decorators/param';
import queryStringNumbers from './lib/query-string-numbers';
import requireDir from 'require-dir';
import resource from './decorators/resource';

/**
 * Main entry point
 * @param  {Object} options Options object
 * @param  {string} options.models (required) path directory of model
 * definitions
 * @param  {Function} options.context if defined, will be called at the start of
 * each request to inject extra context information
 * @param  {Object} options.idParam name of the route parameter to use as a
 * model's id
 * @return {express.Router} Router that will handle all koolaid requests.
 */
export default function fullKoolaid(options) {
  if (!options.models) {
    throw new Error(`\`options.models\` is required`);
  }

  const context = options.context;
  const models = requireDir(options.models);
  // TODO should idParam be a modle-specific value?
  const idParam = options.idParam || `id`;

  const router = express.Router();

  const ctx = cls.createNamespace(`ctx`);

  Object.keys(models).reduce((router, modelName) => {
    const model = models[modelName];
    router.use(queryStringNumbers());
    router.use(mount(model));
    router.use(httpErrorHandler());
    return router;
  }, router);

  return router;

  function mount(target) {
    let router;
    router = _(getFlatRoutingTable(target)).sortBy(`isStatic`).reverse().values().reduce((router, row) => {
      const {
        params,
        path,
        verb
      } = row;

      router[verb](path, (req, res, next) => {
        ctx.run(() => {
          new Promise((resolve) => {
            ctx.set(`Model`, target);
            ctx.set(`user`, req.user);
            if (_.isFunction(context)) {
              context(ctx, req);
            }

            let args = [];
            if (params) {
              args = params.reduce((args, param) => {
                const source = req[param.source];
                args.push(param.name ? _.get(source, param.name) : source);
                return args;
              }, args);
            }

            resolve((row.isStatic ? target : req.model)[row.methodName](...args));
          })
          .then((result) => {
            if (!result) {
              res.status(204);
            }
            else if (result instanceof target) {
              if (result.isNew()) {
                res.status(201);
              }
              else {
                res.status(200);
              }
            }
            else {
              res.status(200);
            }

            res.json(result);
          })
          .catch(next);
        });
      });

      return router;
    }, express.Router());

    router.param(idParam, (req, res, next, id) => {
      ctx.run(() => {
        ctx.set(`Model`, target);
        ctx.set(`user`, req.user);
        if (_.isFunction(context)) {
          context(ctx, req);
        }
        target.findById(id)
          .then((model) => {
            req.model = model;
            return next();
          })
          .catch(next);
      });
    });

    return router;
  }
}

// Apparently, `import a from 'a'; export a;` doesn`t work.
Object.assign(fullKoolaid, {
  access,
  method,
  param,
  resource
});

import _ from 'lodash';
import access from './decorators/access';
import assert from 'assert';
import cls from 'continuation-local-storage';
import express from 'express';
import {getFlatRoutingTable} from './lib/routing-table';
import {middleware as httpErrorHandler, NotFound} from './lib/http-error';
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
 * @returns {express.Router} Router that will handle all koolaid requests.
 */
export default function fullKoolaid(options) {
  if (!options.models) {
    throw new Error(`\`options.models\` is required`);
  }

  const context = options.context;
  const models = requireDir(options.models);
  // TODO idParam should be a model-specific value
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

    // Static methods need to be mounted first to ensure their path names don't
    // look like :id`s (e.g. /model/count needs to be mounted before /model/id).
    // Then, HEAD needs to come before GET because, aparently, express treats
    // GET as HEAD.
    router = _(getFlatRoutingTable(target))
      .sortByOrder([`isStatic`, `verb`], [`asc`, `asc`])
      .reverse()
      .values()
      .reduce((router, row) => {
        const {
          after,
          isStatic,
          methodName,
          params,
          path,
          verb
        } = row;

        router[verb](path, (req, res, next) => {
          assert.equal(verb, req.method.toLowerCase());

          ctx.run(() => {

            executeRequest()
              .then(postProcess)
              .then(setResponseStatusCode)
              .then(setResponseBody)
              .catch(next);

            /**
             * Executes the appropriate method for the identified RespoModel
             * @returns {Promise} Resolves on completion
             */
            function executeRequest() {
              return new Promise((resolve) => {
                ctx.set(`Model`, target);
                ctx.set(`user`, req.user);
                ctx.set(`req`, req);
                ctx.set(`res`, res);

                if (_.isFunction(context)) {
                  context(ctx, req);
                }

                let args = [];
                if (params) {
                  args = params.reduce((rargs, rparam) => {
                    const source = req[rparam.source];
                    rargs.push(rparam.name ? _.get(source, rparam.name) : source);
                    return rargs;
                  }, args);
                }

                resolve((isStatic ? target : req.model)[methodName](...args));
              });
            }

            /**
             * invokes `after()` if specified
             * @param {Object} result the result of the request
             * @returns {Object} returns `result`
             */
            function postProcess(result) {
              if (after) {
                return after(result, ctx);
              }
              return result;
            }

            /**
             * Determines the HTTP response code for `res`
             * @param {Object} result the result of the request
             * @returns {Object} returns `result`
             */
            function setResponseStatusCode(result) {
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

              return result;
            }

            /**
             * Sets the HTTP response body for `res`
             * @param {Object} result the result of the request
             * @returns {Object} returns `result`
             */
            function setResponseBody(result) {
              res.json(result);

              return result;
            }
          });
        });

        return router;
      }, express.Router());

    const table = getFlatRoutingTable(target);
    router.param(idParam, (req, res, next, id) => {
      ctx.run(() => {
        ctx.set(`Model`, target);
        ctx.set(`user`, req.user);
        ctx.set(`req`, req);
        ctx.set(`res`, res);
        if (_.isFunction(context)) {
          context(ctx, req);
        }
        target.findById(id)
          .then((model) => {
            req.model = model;
            ctx.set(`model`, model);
            return next();
          })
          .catch((reason) => {
            if (reason instanceof NotFound) {
              const query = {
                verb: req.method.toLowerCase(),
                path: req.route.path
              };

              const row = _.find(table, (r) => r.verb === query.verb && r.path === query.path);
              // Don't fail for static methods - they should work without a
              // model
              if (row.isStatic) {
                return next();
              }
            }

            next(reason);
          });
      });
    });

    return router;
  }
}

// Apparently, `import a from 'a'; export a;` doesn't work.
Object.assign(fullKoolaid, {
  access,
  method,
  param,
  resource
});

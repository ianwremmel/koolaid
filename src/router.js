import assert from 'assert';
import {find, get, orderBy} from 'lodash';
import cls from 'continuation-local-storage';
import express from 'express';
import {flattenRoutingTable, getRoutingTable} from './lib/routing-table';
import {middleware as httpErrorHandler, NotFound} from './http-error';
import queryStringNumbers from './lib/query-string-numbers';
import requireDir from 'require-dir';
import shimmer from 'shimmer';

/**
 * Main entry point
 * @param  {Object} options Options object
 * @param  {string} options.models (required) path directory of model
 * definitions
 * @param  {Function} options.context if defined, will be called at the start of
 * each request to inject extra context information
 * @returns {express.Router} Router that will handle all koolaid requests.
 */
export default function router(options) {
  assert(options.models, `\`options.models\` is required`);

  const context = options.context;
  const models = requireDir(options.models);
  const ctx = cls.createNamespace(`ctx`);

  function bind(fn) {
    if (fn) {
      return ctx.bind(fn);
    }
  }

  shimmer.wrap(Promise.prototype, `then`, (then) => {
    return function thenPrime(...args) {
      return Reflect.apply(then, this, args.map(bind));
    };
  });

  const router = express.Router();

  router.use(queryStringNumbers());
  router.use((req, res, next) => {
    ctx.run(() => {
      ctx.set(`user`, req.user);
      ctx.set(`req`, req);
      ctx.set(`res`, res);
      ctx.set(`logger`, console);
      if (typeof context === `function`) {
        context(ctx);
      }
      next();
    });
  });

  Object.keys(models).reduce((router, modelName) => {
    // try default because of es6 modules
    const model = models[modelName].default || models[modelName];

    router.use(mount(model));
    return router;
  }, router);

  router.use(httpErrorHandler());

  return router;

  function mount(target) {
    let router = express.Router();

    const routingTable = getRoutingTable(target);
    const flatRoutingTable = flattenRoutingTable(routingTable);
    const idParam = routingTable.idParam;

    router.use(`/${routingTable.basePath}`, (req, res, next) => {
      ctx.run(() => {
        assert(!ctx.get(`Model`), `\`ctx.Model\` cannot be set twice`);
        ctx.set(`Model`, target);
        next();
      });
    });


    // Static methods need to be mounted first to ensure their path names don't
    // look like :id`s (e.g. /model/count needs to be mounted before /model/id).
    // Then, HEAD needs to come before GET because, aparently, express treats
    // GET as HEAD.
    router = orderBy(flatRoutingTable, [`isStatic`, `verb`], [`asc`, `asc`])
      .reverse()
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

          executeRequest()
            .then(postProcess)
            .then(setResponseStatusCode)
            .then(setResponseBody)
            .catch(next);

          /**
           * Executes the appropriate method for the identified model
           * @private
           * @returns {Promise} Resolves on completion
           */
          function executeRequest() {
            return new Promise((resolve) => {
              let args = [];
              if (params) {
                args = params.reduce((rargs, rparam) => {
                  const source = req[rparam.source];
                  rargs.push(rparam.name ? get(source, rparam.name) : source);
                  return rargs;
                }, args);
              }
              const method = (isStatic ? target : req.model)[methodName];
              resolve(Reflect.apply(method, (isStatic ? target : req.model), args));
            });
          }

          /**
           * invokes `after()` if specified
           * @param {Object} result the result of the request
           * @private
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
           * @private
           * @returns {Object} returns `result`
           */
          function setResponseStatusCode(result) {
            if (!result) {
              res.status(204);
            }
            else if (result instanceof target) {
              // Note: At time of implementation, async/await made this function
              // non-referencable.
              return result.isNew()
                .then((isNew) => {
                  if (isNew) {
                    res.status(201);
                  }
                  else {
                    res.status(200);
                  }
                  return result;
                });
            }
            else {
              res.status(200);
            }

            return result;
          }

          /**
           * Sets the HTTP response body for `res`
           * @param {Object} result the result of the request
           * @private
           * @returns {Object} returns `result`
           */
          function setResponseBody(result) {
            res.json(result);

            return result;
          }
        });

        return router;
      }, router);

    router.param(idParam, (req, res, next, id) => {
      ctx.get(`model`);
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

            const row = find(flatRoutingTable, (r) => r.verb === query.verb && r.path === query.path);
            // Don't fail for static methods - they should work without a
            // model
            if (row.isStatic) {
              return next();
            }
          }

          return Promise.reject(reason);
        })
        .catch(next);
    });

    return router;
  }
}

import express from 'express';
import {getTableForModel, getFlatRoutingTable} from '../lib/routing-table';

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

export function mount(target) {
  const router = express.Router();
  const table = getFlatRoutingTable(target);
  table.reduce((router, row) => {
    router[row.verb](row.path, (req, res, next) => {
      new Promise((resolve) => {
        resolve((row.isStatic ? target : req.model)[row.methodName]());
      })
      .then((result) => {
        res.json(result);
      })
      .catch(next);
    });
  }, router);

  return router;
}

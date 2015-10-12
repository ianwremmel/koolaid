/* eslint no-unused-vars: [0] */
import _ from 'lodash';
import {access, method, param} from '../../..';

export default class RestModel {
  constructor(attrs) {
    Object.assign(this, attrs);
  }

  @method({verb: 'POST', path: '/'})
  @access('write')
  @param({source: 'body'})
  static create(data, ctx) {
    throw new Error('not implemented');
  }

  @method({verb: 'DELETE', path: '/'})
  @access('write')
  @param({source: 'query', name: 'filter'})
  static destroy(filter, ctx) {
    throw new Error('not implemented');
  }

  @method({verb: 'GET', path: '/'})
  @access('read')
  @param({source: 'query', name: 'filter'})
  static find(filter, ctx) {
    throw new Error('not implemented');
  }

  @access('read')
  static findById(ctx) {
    throw new Error('not implemented');
  }

  @method({verb: 'PUT', path: '/'})
  @access('write')
  @param({source: 'body'})
  static upsert(data, ctx) {
    throw new Error('not implemented');
  }

  @method({verb: 'GET', path: '/count'})
  @access('read')
  @param({source: 'query', name: 'filter'})
  static count(filter, ctx) {
    return ctx.get('Model').find(filter)
      .then((models) => {
        return {
          count: models.length
        };
      });
  }

  @method({verb: 'HEAD', path: '/:id'})
  @access('read')
  static exists(ctx) {
    throw new Error('not implemented');
  }

  @method({verb: 'POST', path: '/update'})
  @access('write')
  @param({source: 'body'})
  @param({source: 'query', name: 'filter'})
  static update(data, filter, ctx) {
    throw new Error('not implemented');
  }

  @method({verb: 'GET', path: '/:id'})
  @access('read')
  find(ctx) {
    throw new Error('not implemented');
  }

  @method({verb: 'DELETE', path: '/:id'})
  @access('write')
  destroy(ctx) {
    throw new Error('not implemented');
  }

  @method({verb: 'PUT', path: '/:id'})
  @access('write')
  @param({source: 'body'})
  update(data, ctx) {
    throw new Error('not implemented');
  }
}

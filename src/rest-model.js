/* eslint no-unused-vars: [0] */
import _ from 'lodash';
import {NotFound} from './lib/http-error';
import {default as access, create, destroy} from './decorators/access';
import method from './decorators/method';
import param from './decorators/param';

export default class RestModel {
  constructor(attrs) {
    Object.assign(this, attrs);
  }

  isNew() {
    throw new Error(`not implemented`);
  }

  @method({verb: `GET`, path: `/count`})
  @access(`read`)
  @param({source: `query`, name: `filter`})
  static async count(filter, ctx) {
    const models = await ctx.get(`Model`).find(filter);
    return {
      count: models.length
    };
  }

  @method({verb: `POST`, path: `/`})
  @access(`write`)
  @param({source: `body`})
  @create
  static create(data, ctx) {
    throw new Error(`not implemented`);
  }

  @method({verb: `DELETE`, path: `/`})
  @access(`write`)
  @param({source: `query`, name: `filter`})
  @destroy
  static destroy(filter, ctx) {
    throw new Error(`not implemented`);
  }

  @method({verb: `GET`, path: `/`})
  @access(`read`)
  @param({source: `query`, name: `filter`})
  static find(filter, ctx) {
    throw new Error(`not implemented`);
  }

  @access(`read`)
  static findById(ctx) {
    throw new Error(`not implemented`);
  }

  @method({verb: `POST`, path: `/update`})
  @access(`write`)
  @param({source: `body`})
  @param({source: `query`, name: `filter`})
  static update(data, filter, ctx) {
    throw new Error(`not implemented`);
  }

  @method({verb: `PUT`, path: `/`})
  @access(`write`)
  @param({source: `body`})
  static upsert(data, ctx) {
    throw new Error(`not implemented`);
  }

  @method({verb: `GET`, path: `/:id/exists`, after: (result, ctx) => {
    return {
      exists: result
    };
  }})
  @method({verb: `HEAD`, path: `/:id`, after: (result, ctx) => {
    if (result) {
      return null;
    }
    throw new NotFound();
  }})
  @access(`read`)
  static async exists(id, ctx) {
    if (!ctx) {
      ctx = id;
      id = undefined;
    }

    if (ctx.get(`model`)) {
      return true;
    }

    if (id && await ctx.get(`Model`).find({where: {id}})) {
      return true;
    }

    return false;
  }

  @method({verb: `DELETE`, path: `/:id`})
  @access(`write`)
  @destroy
  destroy(ctx) {
    throw new Error(`not implemented`);
  }

  @method({verb: `GET`, path: `/:id`})
  @access(`read`)
  find(ctx) {
    return this;
  }

  @method({verb: `PUT`, path: `/:id`})
  @access(`write`)
  @param({source: `body`})
  update(data, ctx) {
    throw new Error(`not implemented`);
  }
}

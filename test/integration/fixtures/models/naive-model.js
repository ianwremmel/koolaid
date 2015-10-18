import _ from 'lodash';
import {BadRequest, Conflict, NotFound} from '../../../../src/lib/http-error';
import {resource} from '../../../..';
import RestModel from '../../lib/rest-model';
import uuid from 'uuid';

let models = {};

@resource({basePath: 'naive-model'})
export default class NaiveModel extends RestModel {
  isNew(ctx) {
    return ctx.get('isNew');
  }

  static create(data, ctx) {
    if (models[data.id]) {
      throw new Conflict(`A NaiveModel with id ${data.id} already exists.`);
    }

    if (!data.id) {
      data.id = uuid.v4();
    }

    models[data.id] = data;
    ctx.set('isNew', true);
    return new (ctx.get('Model'))(data);
  }

  static destroy(filter) {
    if (filter && filter.where) {
      _(models)
        .values()
        .remove(filter.where)
        .pluck('id')
        .reduce((models, id) => {
          delete models[id];
          return models;
        }, models);
    }
    else {
      models = [];
    }
  }

  static find(filter, ctx) {
    if (!filter) {
      return _(models)
        .values()
        .filter()
        .value();
    }

    return _(models)
      // Aparently, _.where doesn't work correctly on Objects
      .values()
      .where(filter.where)
      .map((data) => new (ctx.get('Model'))(data))
      .filter()
      .value();
  }

  static async findById(id, ctx) {
    if (!id) {
      throw new BadRequest('`id` is required');
    }

    const models = await (ctx.get('Model')).find({where: {id}});
    if (models.length === 0) {
      throw new NotFound();
    }
    return models[0];
  }

  static async upsert(data, ctx) {
    if (!data.id) {
      throw new BadRequest('Cannot upsert without id field');
    }

    try {
      const model = await (ctx.get('Model')).findById(data.id);
      Object.assign(model, data);
      return model;
    }
    catch (e) {
      if (e instanceof NotFound) {
        ctx.set('isNew', true);
        return (ctx.get('Model')).create(data);
      }

      throw e;
    }

  }

  // Note: this implementation is really rest-only; it won't work if called
  // via NaiveModel.exists(id).
  static exists() {
    return null;
  }

  static async update(body, filter, ctx) {
    const localModels = await (ctx.get('Model')).find(filter);
    models = localModels.reduce((models, model) => {
      models[model.id] = Object.assign(model, body);
      return models;
    }, models);
  }

  find() {
    return this;
  }

  destroy(ctx) {
    (ctx.get('Model')).destroy({filter: {where: {id: this.id}}});
    return null;
  }

  update(body) {
    if (body.id !== this.id) {
      throw new BadRequest('Cannot change model id');
    }

    Object.assign(this, body);

    Object.assign(_(models[this.id]).pick('id', 'extraData'), body);
    return this;
  }
}

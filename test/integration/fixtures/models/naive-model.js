import _ from 'lodash';
import {BadRequest, Conflict, NotFound} from '../../../../src/lib/http-error';
import {resource} from '../../../..';
import RestModel from '../../lib/rest-model';
import uuid from 'uuid';

let models = {};

@resource({basePath: 'naive-model'})
export default class NaiveModel extends RestModel {
  static create(data, ctx) {
    if (models[data.id]) {
      throw new Conflict(`A NaiveModel with id ${data.id} already exists.`);
    }

    if (!data.id) {
      data.id = uuid.v4();
    }

    models[data.id] = data;
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
      return Promise.resolve(_(models)
        .values()
        .filter()
        .value());
    }

    return Promise.resolve(_(models)
      // Aparently, _.where doesn't work correctly on Objects
      .values()
      .where(filter.where)
      .map((data) => new (ctx.get('Model'))(data))
      .filter()
      .value());
  }

  static findById(id, ctx) {
    if (!id) {
      throw new BadRequest('`id` is required');
    }

    return (ctx.get('Model')).find({where: {id}})
      .then((models) => {
        if (models.length === 0) {
          throw new NotFound();
        }
        return models[0];
      });
  }

  static upsert(data, ctx) {
    if (!data.id) {
      throw new BadRequest('Cannot upsert without id field');
    }

    const model = models[data.id];
    if (model) {
      Object.assign(model, data);
      return model;
    }

    return (ctx.get('Model')).create(data);
  }

  // Note: this implementation is really rest-only; it won't work if called
  // via NaiveModel.exists(id).
  static exists() {
    return null;
  }

  static update(body, filter, ctx) {
    return (ctx.get('Model')).find(filter)
      .then((m) => {
        models = m.reduce((models, model) => {
          models[model.id] = Object.assign(model, body);
          return models;
        }, models);
      });
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

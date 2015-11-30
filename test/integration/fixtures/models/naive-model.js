import pick from 'lodash.pick';
import pluck from 'lodash.pluck';
import remove from 'lodash.remove';
import where from 'lodash.where';
import {access, HttpError, method, resource, RestModel} from '../../../..';
import uuid from 'uuid';

const {BadRequest, Conflict, NotFound} = HttpError;

let models = {};

@resource({basePath: `naive-model`})
@access((user, Model, model, methodName, accessType) => {
  /* eslint max-params: [0] */
  if (!user) {
    return !model && accessType === `read`;
  }

  if (!model) {
    return true;
  }

  if (model) {
    return accessType === `read` || model.creator === user.id;
  }
})
export default class NaiveModel extends RestModel {
  isNew(ctx) {
    return ctx.get(`isNew`);
  }

  static create(data, ctx) {
    if (models[data.id]) {
      throw new Conflict(`A NaiveModel with id ${data.id} already exists.`);
    }

    data.id = data.id || uuid.v4();
    data.creator = data.creator || ctx.get(`user`).id;

    models[data.id] = data;
    ctx.set(`isNew`, true);
    return new (ctx.get(`Model`))(data);
  }

  static destroy(filter) {
    if (filter && filter.where) {
      pluck(remove(Object.values(models), filter.where), `id`)
        .reduce((models, id) => {
          Reflect.deleteProperty(models, id);
          return models;
        }, models);
    }
    else {
      models = [];
    }
  }

  static find(filter, ctx) {
    if (!filter) {
      return Object.values(models)
        .filter((value) => Boolean(value));
    }

    // Aparently, _.where doesn`t work correctly on Objects
    return where(Object.values(models), filter.where)
      .map((data) => new (ctx.get(`Model`))(data))
      .filter((value) => Boolean(value));
  }

  static async findById(id, ctx) {
    if (!id) {
      throw new BadRequest(`\`id\` is required`);
    }

    const models = await (ctx.get(`Model`)).find({where: {id}});
    if (models.length === 0) {
      throw new NotFound();
    }
    return models[0];
  }

  static async upsert(data, ctx) {
    if (!data.id) {
      throw new BadRequest(`Cannot upsert without id field`);
    }

    try {
      const model = await (ctx.get(`Model`)).findById(data.id);
      Object.assign(model, data);
      return model;
    }
    catch (e) {
      if (e instanceof NotFound) {
        return (ctx.get(`Model`)).create(data);
      }

      throw e;
    }

  }

  static async update(body, filter, ctx) {
    const localModels = await (ctx.get(`Model`)).find(filter);
    models = localModels.reduce((models, model) => {
      models[model.id] = Object.assign(model, body);
      return models;
    }, models);
  }

  @method({path: `/count-all`, verb: `GET`})
  @access((user) => {
    return user.id === `Admin`;
  })
  static countAll() {
    return {
      count: Object.keys(models).length
    };
  }

  destroy(ctx) {
    (ctx.get(`Model`)).destroy({filter: {where: {id: this.id}}});
    return null;
  }

  update(body) {
    if (body.id !== this.id) {
      throw new BadRequest(`Cannot change model id`);
    }

    Object.assign(this, body);

    Object.assign(pick(models[this.id], `id`, `extraData`), body);
    return this;
  }
}

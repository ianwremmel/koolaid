import {access, method, param, resource} from '../../..';

@resource({basePath: `a`})
export default class A {
  @access(`write`)
  @method({verb: `POST`, path: `/`})
  @param({source: `body`})
  static create(data, ctx) {

  }

  @access(`write`)
  @method({verb: `POST`, path: `/`})
  @param({source: `body`})
  @param({source: `query`, name: `filter`})
  static update(data, filter, ctx) {

  }

  @access(`write`)
  @method({verb: `PUT`, path: `/:id`})
  @param({source: `body`})
  update(data, ctx) {

  }
}

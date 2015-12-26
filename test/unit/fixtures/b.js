import {access, method, resource} from '../../../src';

@resource({basePath: `b`})
export default class B {
  @access(`read`)
  @method({verb: `GET`, path: `/:id`})
  find(ctx) {

  }
}

import {access, method, resource} from '../../../src';

@resource({basePath: `c`})
export default class C {
  @access(`read`)
  @method({verb: `GET`, path: `/`})
  static find(ctx) {

  }
}

import {access, method, resource} from '../../../src';
import A from './a';

@resource({basePath: `aa`})
export default class AA extends A {
  @access(`read`)
  @method({verb: `HEAD`, path: `/:id`})
  @method({verb: `GET`, path: `/:id/exists`})
  static exists(ctx) {

  }
}

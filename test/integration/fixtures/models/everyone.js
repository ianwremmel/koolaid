import {access, create, method, resource} from '../../../..';

@resource({basePath: `everyone`})
export default class Everyone {
  @method({verb: `GET`, path: `/`})
  @access(`read`)
  static find() {
    return {};
  }

  @method({verb: `POST`, path: `/`})
  @access(`write`)
  @create
  static create() {
    return {};
  }
}

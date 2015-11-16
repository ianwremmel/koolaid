import {access, method, resource} from '../../../..';

@resource({basePath: `complicated-access`})
export default class ComplicatedAccess {
  @method({verb: `GET`, path: `/`})
  @access(`read`)
  static find() {
    return {};
  }

  @access(`read`)
  static findById() {
    return new ComplicatedAccess();
  }

  @method({verb: `POST`, path: `/`})
  @access(`write`)
  static create() {
    return {};
  }

  @method({verb: `PUT`, path: `/:id`})
  @access(`write`)
  update() {
    return {};
  }
}

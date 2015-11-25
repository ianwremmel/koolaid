import {access, create, method, resource} from '../../../..';

@resource({basePath: `complicated-access`})
export default class ComplicatedAccess {
  @method({verb: `GET`, path: `/`})
  @access(`read`)
  static find() {
    return {};
  }

  @access(`read`)
  static findById() {
    const ca = new ComplicatedAccess();
    ca.creator = 14;
    return ca;
  }

  @method({verb: `POST`, path: `/`})
  @access(`write`)
  @create
  static create() {
    const ca = new ComplicatedAccess();
    ca.isNew = function isNew() {
      return false;
    };
    return ca;
  }

  @method({verb: `PUT`, path: `/:id`})
  @access(`write`)
  update() {
    const ca = new ComplicatedAccess();
    ca.isNew = function isNew() {
      return false;
    };
    return ca;
  }
}

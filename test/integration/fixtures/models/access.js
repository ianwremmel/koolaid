import {access, method, resource} from '../../../..';

@resource({basePath: `access`})
export default class Access {
  @method({verb: `GET`, path: `/everyone`})
  @access(`read`)
  static everyoneRead() {
    return {};
  }

  @method({verb: `GET`, path: `/unauthenticated`})
  @access(`read`)
  static unauthenticatedRead() {
    return {};
  }

  @method({verb: `GET`, path: `/authenticated`})
  @access(`read`)
  static authenticatedRead() {
    return {};
  }

  @method({verb: `GET`, path: `/owner`})
  @access(`read`)
  static ownerRead() {
    return {};
  }

  @method({verb: `POST`, path: `/everyone`})
  @access(`write`)
  static everyoneWrite() {
    return {};
  }

  @method({verb: `POST`, path: `/unauthenticated`})
  @access(`write`)
  static unauthenticatedWrite() {
    return {};
  }

  @method({verb: `POST`, path: `/authenticated`})
  @access(`write`)
  static authenticatedWrite() {
    return {};
  }

  @method({verb: `POST`, path: `/owner`})
  @access(`write`)
  static ownerWrite() {
    return {};
  }
}

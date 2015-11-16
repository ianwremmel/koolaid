import {access, method, resource} from '../../../..';

@resource({basePath: `authenticated`})
export default class Authenticated {
  @method({verb: `GET`, path: `/`})
  @access(`read`)
  static find() {
    return {};
  }

  @method({verb: `POST`, path: `/`})
  @access(`write`)
  static create() {
    return {};
  }
}

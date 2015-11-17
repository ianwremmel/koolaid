import {access, method, resource} from '../../../..';

@resource({basePath: `ping`})
export default class Ping {
  @method({verb: `GET`})
  @access(`read`)
  static find() {
    return {
      success: true
    };
  }

  @access(`read`)
  static findOne() {
    return new Ping();
  }
}

import {method, resource} from '../../../..';

@resource({basePath: '/ping'})
export default class Ping {
  @method({verb: 'GET'})
  static find() {
    return {
      success: true
    };
  }

  static findOne() {
    return new Ping();
  }
}

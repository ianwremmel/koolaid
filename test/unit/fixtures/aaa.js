import {access} from '../../../src';
import AA from './aa';

export default class AAA extends AA {
  @access(`execute`)
  static exists(ctx) {

  }
}

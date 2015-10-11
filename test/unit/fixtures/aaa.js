import {access, relation} from '../.././..';
import AA from './aa';
import B from './b';
import C from './c';

@relation({name: 'b', class: B, type: 'hasOne'})
@relation({name: 'c', class: C, type: 'hasMany'})
export default class AAA extends AA {
  @access('execute')
  static exists(ctx) {

  }
}

import A from '../../fixtures/a';

import {assert} from 'chai';
import {BadRequest} from '../../../../src/lib/http-error';

describe('full-koolaid', () => {
  describe('@param', () => {

    it('ensures methods are called with params', () => {
      return Promise.all([
        assert.isRejected(A.create(), BadRequest),
        assert.isFulfilled(A.create({}))
      ]);
    });

  });
});

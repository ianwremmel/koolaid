import A from '../../fixtures/a';
import AA from '../../fixtures/aa';
import AAA from '../../fixtures/aaa';

import {assert} from 'chai';
import {getAccessForMethod} from '../../../../src/decorators/access';

describe('full-koolaid', () => {
  describe('@access', () => {
    it('indicates access level', () => {
      assert.equal(getAccessForMethod(A, 'create'), 'write');
      assert.equal(getAccessForMethod(A, 'update'), 'write');
      assert.equal(getAccessForMethod(A.prototype, 'update'), 'write');
    });

    it('indicates access level for derived classes', () => {
      assert.equal(getAccessForMethod(AA, 'create'), 'write');
      assert.equal(getAccessForMethod(AA, 'update'), 'write');
      assert.equal(getAccessForMethod(AA.prototype, 'update'), 'write');
      assert.equal(getAccessForMethod(AA, 'exists'), 'read');
    });

    it('allows overwriting access level in derived classes', () => {
      assert.equal(getAccessForMethod(AAA, 'create'), 'write');
      assert.equal(getAccessForMethod(AAA, 'update'), 'write');
      assert.equal(getAccessForMethod(AAA.prototype, 'update'), 'write');
      assert.equal(getAccessForMethod(AAA, 'exists'), 'execute');
    });
  });
});

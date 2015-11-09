/* eslint-disable */

import {assert} from 'chai'
import {access, method, param, resource} from '../../..'
import {getRoutingTable, getFlatRoutingTable} from '../../../src/lib/routing-table'
import A from '../fixtures/a';
import AA from '../fixtures/aa';
import AAA from '../fixtures/aaa';

describe('full-koolaid', () => {
  describe('@resource', () => {

    it('produces the correct routing table for a resource', () => {
      assert.deepEqual(getRoutingTable(A), {
        methods: {
          create: {
            true: [{
              params: [{
                source: 'body'
              }],
              accessType: 'write',
              after: undefined,
              path: '/',
              verb: 'post',
            }]
          },
          update: {
            true: [{
              params: [{
                source: 'body'
              }, {
                name: 'filter',
                source: 'query'
              }],
              accessType: 'write',
              after: undefined,
              path: '/',
              verb: 'post'
            }],
            false: [{
              params: [{
                source: 'body'
              }],
              accessType: 'write',
              after: undefined,
              path: '/:id',
              verb: 'put'
            }]
          }
        },
        basePath: 'a',
        idParam: 'id'
      });
    });

    it('produces the correct routing table for a derived resource', () => {
      assert.deepEqual(getRoutingTable(AA), {
        methods: {
          create: {
            true: [{
              params: [{
                source: 'body'
              }],
              accessType: 'write',
              after: undefined,
              path: '/',
              verb: 'post',
            }]
          },
          update: {
            true: [{
              params: [{
                source: 'body'
              }, {
                name: 'filter',
                source: 'query'
              }],
              accessType: 'write',
              after: undefined,
              path: '/',
              verb: 'post'
            }],
            false: [{
              params: [{
                source: 'body'
              }],
              accessType: 'write',
              after: undefined,
              path: '/:id',
              verb: 'put'
            }]
          },
          exists: {
            true: [{
              accessType: 'read',
              after: undefined,
              path: '/:id/exists',
              verb: 'get'
            }, {
              accessType: 'read',
              after: undefined,
              path: '/:id',
              verb: 'head'
            }]
          }
        },
        basePath: 'aa',
        idParam: 'id'
      });
    });

    describe('getFlatRoutingTable', () => {
      it('produces the correct routing table for a resource', () => {
        assert.deepEqual(getFlatRoutingTable(A), [{
          accessType: 'write',
          after: undefined,
          verb: 'put',
          path: '/a/:id',
          methodName: 'update',
          isStatic: false,
          params: [
            {source: 'body'}
          ]
        }, {
          accessType: 'write',
          after: undefined,
          verb: 'post',
          path: '/a/',
          methodName: 'update',
          isStatic: true,
          params: [
            {source: 'body'},
            {
              name: 'filter',
              source: 'query'
            }
          ]
        }, {
          accessType: 'write',
          after: undefined,
          verb: 'post',
          path: '/a/',
          methodName: 'create',
          isStatic: true,
          params: [
            {source: 'body'}
          ]
        }]);
      });
    });
  });
});

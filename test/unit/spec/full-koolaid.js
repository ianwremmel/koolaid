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
              path: '/',
              verb: 'post'
            }],
            false: [{
              params: [{
                source: 'body'
              }],
              accessType: 'write',
              path: '/:id',
              verb: 'put'
            }]
          }
        },
        basePath: 'a'
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
              path: '/',
              verb: 'post'
            }],
            false: [{
              params: [{
                source: 'body'
              }],
              accessType: 'write',
              path: '/:id',
              verb: 'put'
            }]
          },
          exists: {
            true: [{
              accessType: 'read',
              path: '/:id/exists',
              verb: 'get'
            }, {
              accessType: 'read',
              path: '/:id',
              verb: 'head'
            }]
          }
        },
        basePath: 'aa'
      });
    });

    describe('getFlatRoutingTable', () => {
      it('produces the correct routing table for a resource', () => {
        assert.deepEqual(getFlatRoutingTable(A), [{
          accessType: 'write',
          verb: 'put',
          path: '/a/:id',
          methodName: 'update',
          isStatic: false,
          params: [
            {source: 'body'}
          ]
        }, {
          accessType: 'write',
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

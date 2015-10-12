/* eslint-disable */

import {assert} from 'chai'
import {access, method, param, relation, resource} from '../../..'
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

    it.skip('produces the correct routing table for a derived resource with relations', () => {
      assert.deepEqual(getRoutingTable(AAA), {
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
              accessType: 'execute',
              path: '/:id',
              verb: 'head'
            }, {
              accessType: 'execute',
              path: '/:id/exists',
              verb: 'get'
            }]
          }
        },
        relations: {
          b: {
            type: 'hasOne',
            class: B,
            accessType: 'read'
          },
          c: {
            type: 'hasMany',
            class: C,
            accessType: 'read'
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
          path: 'a/:id',
          methodName: 'update',
          isStatic: false,
          params: [
            {source: 'body'}
          ]
        }, {
          accessType: 'write',
          verb: 'post',
          path: 'a/',
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
          path: 'a/',
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

// TODO consider a decorator that prevents base classes from getting routes.
// TODO consider `expose` property (prevents routing but setups up access,
// relations) on @resource
// TODO create a @document decorator (or `document` property on @resource) which
// generates RAML or Swagger
// TODO @resource should evaluate the routing table and confirm a minimal set of
// RESTful routes have been defined
// A
// POST /a/ A.create A:write [body]
// POST /a/ A.update A:write [body, query.filter]
// PUT /a/:id A#update A:id:write [body]
//
// AA
// POST /aa/ A.create AA:write [body]
// POST /aa/ A.update AA:write [body, query.filter]
// PUT /aa/:id A#update AA:id:write [body]
// HEAD /aa/:id AA.exists AA:id:read
// GET /aa/:id/exists AA.exists AA:id:read
//
// AAA
// POST /aa/ A.create AAA:write [body]
// POST /aa/ A.update AAA:write [body, query.filter]
// PUT /aa/:id A#update AAA:id:write [body]
// HEAD /aa/:id AA.exists AAA:id:execute
// GET /aa/:id/exists AA.exists AAA:id:execute
// GET /aa/:id/b/:id B#find AAA:id:read,B:id:read
// GET /aa/:id/c/ C.find AAA:id:read,C:read

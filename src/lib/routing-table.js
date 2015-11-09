import {findOrCreateMap} from './map';
import {getAccessForMethod} from '../decorators/access';
import isStatic from './is-static';
import path from 'path';

export function getRoutingTable(target) {
  const tables = {
    methods: {}
  };

  let key = target;
  while (key !== (key && key.constructor)) {
    const table = getTableForModel(key);
    tables.basePath = tables.basePath || table.basePath;
    tables.idParam = tables.idParam || table.idParam;
    merge(tables.methods, table);
    key = Reflect.getPrototypeOf(key);
  }

  return tables;

  function merge(dest, source) {
    source.forEach((value, methodName) => {
      dest[methodName] = dest[methodName] || {};
      value.forEach((value, isStatic) => {
        if (value.has(`methods`)) {
          const routes = dest[methodName][isStatic] = dest[methodName][isStatic] || [];
          value.get(`methods`).forEach((method) => {
            const route = {
              accessType: getAccessForMethod(target, methodName),
              after: method.get(`after`),
              path: method.get(`path`),
              verb: method.get(`verb`)
            };

            if (method.has(`params`)) {
              route.params = method.get(`params`);
            }
            routes.push(route);
          });
        }
      });
    });
  }
}

export function flattenRoutingTable(routingTable) {
  const table = [];
  const basePath = routingTable.basePath;
  Object.keys(routingTable.methods).forEach((methodName) => {
    Object.keys(routingTable.methods[methodName]).forEach((rowIsStatic) => {
      rowIsStatic = rowIsStatic === `true`;

      routingTable.methods[methodName][rowIsStatic].forEach((def) => {
        const row = Object.assign({}, def, {
          isStatic: rowIsStatic,
          methodName,
          path: path.join(`/`, basePath, def.path)
        });
        table.push(row);
      });
    });
  });

  return table;
}

export function getFlatRoutingTable(target) {
  const routingTable = getRoutingTable(target);
  return flattenRoutingTable(routingTable);
}

const tables = new Map();
export function getTableForModel(target) {
  return findOrCreateMap(tables, isStatic(target) ? target : target.constructor);
}

export function getTableForMethod(target, name) {
  const table = getTableForModel(target);
  const methodTable = findOrCreateMap(table, name);
  return findOrCreateMap(methodTable, isStatic(target));
}

const currentMethods = new Map();
export function getCurrentMethod(target, name) {
  const table = getTableForMethod(target, name);
  return findOrCreateMap(currentMethods, table);
}

export function finishCurrentMethod(target, name) {
  const table = getTableForMethod(target, name);
  const current = getCurrentMethod(target, name);
  currentMethods.delete(table);
  let methods = table.get(`methods`);
  if (!methods) {
    methods = [];
    table.set(`methods`, methods);
  }
  methods.push(current);
}

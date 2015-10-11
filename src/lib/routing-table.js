import _ from 'lodash';
import isStatic from './is-static';

const models = new WeakMap();
const currentMethods = new WeakMap();

export function getRoutingTable(target) {
  const tables = [];
  let key = target;
  while (key !== (key && key.constructor)) {
    const table = getTableForModel(key);
    key = Object.getPrototypeOf(key);
  }

  const table = {};// _.mergeAll(tables);
  while(tables.length) {
    _.merge(table, tables.pop());
  }
  return table;

  //
  // console.log(JSON.stringify(tables, null, 2));
  //
  // const routingTable = tables.reduce((routingTable, currentTable) => {
  //   routingTable.basePath = currentTable.basePath || routingTable.basePath;
  //   console.log(currentTable);
  //   if (currentTable.methods) {
  //     routingTable.methods = Object.keys(currentTable.methods).reduce((methods, methodName) => {
  //       methods[methodName] = methods[methodName] || {};
  //       [true, false].forEach((isStatic) => {
  //         if (currentTable.methods[methodName][isStatic]) {
  //           methods[methodName][isStatic] = methods[methodName][isStatic] || {};
  //
  //           ['access', 'param', 'path', 'verb'].forEach((key) => {
  //             console.log(methodName, isStatic, key, currentTable.methods[methodName][isStatic]);
  //             methods[methodName][isStatic][key] = currentTable.methods[methodName][isStatic][key] || methods[methodName][isStatic][key];
  //           });
  //         }
  //       });
  //       return methods;
  //     }, routingTable.methods || {});
  //   }
  //   return routingTable;
  //
  // }, {});

  // return routingTable;
}

export function getTableForModel(target) {
  const key = isStatic(target) ? target : target.constructor;
  let table = models.get(key);
  if (!table) {
    table = {};
    models.set(key, table);
  }
  return table;
}

function getTableForMethod(target, name) {
  const table = getTableForModel(target);

  table.methods = table.methods || {};
  table.methods[name] = table.methods[name] || {};

  const methodIsStatic = isStatic(target);
  table.methods[name][methodIsStatic] = table.methods[name][methodIsStatic] || [];
  return table.methods[name][methodIsStatic];
}

export function getCurrentMethod(target, name) {
  const table = getTableForMethod(target, name);
  let current = currentMethods.get(table);
  if (!current) {
    current = {};
    table.push(current);
    currentMethods.set(table, current);
  }

  return current;
}

export function finishCurrentMethod(target, name) {
  const table = getTableForMethod(target, name);
  currentMethods.delete(table);
}

/* eslint-disable */
require('babel-core/register');
var g6 = require('./Gruntfile.es6').default;

module.exports = function gruntConfig(grunt) {
  return g6(grunt);
};

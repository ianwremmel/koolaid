/* eslint-disable */
require('babel/register');
var g6 = require('./Gruntfile.es6');

module.exports = function gruntConfig(grunt) {
  return g6(grunt);
};

const APILogger = require('@tabdigital/api-logger');

const pkg = require('../package.json');

const log = new APILogger({
  level: process.env.LOG_LEVEL || 'info',
  name: pkg.name,
});

module.exports = log;

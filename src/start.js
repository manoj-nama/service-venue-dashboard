const mongoose = require('mongoose');

const server = require('./server');
const log = require('./log');
const pkg = require('../package.json');
const get = require('./config');

const start = async () => {
  const cfg = get();
  log.info('Connected to MongoDB', `${cfg.mongoose.url}${cfg.mongoose.dbName}`);

  try {
    mongoose.connect(`${cfg.mongoose.url}${cfg.mongoose.dbName}`).then(async () => {
      log.info('Connected to MongoDB', `${cfg.mongoose.url}${cfg.mongoose.dbName}`);
      const app = server();
      await app.start();
      log.info(`${pkg.name} listening at ${app.opts.port}`);
    }).catch((dbError) => {
      log.error(dbError, 'Error while connecting with DB');
      process.exit(1);
    }) ;
   
  } catch (e) {
    log.error(e, 'Error starting server');
    process.exit(1);
  }
};

module.exports = start;

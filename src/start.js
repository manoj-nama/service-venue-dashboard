const mongoose = require('mongoose');

const server = require('./server');
const log = require('./log');
const pkg = require('../package.json');
const get = require('./config');
const { initialiseKafkaTopics, shutdown } = require('./kafka');
const betStatsScheduler = require('./bet-stats-scheduler');
const redis = require('./redis');
const seeds = require('../seeds');

const start = async () => {
  const cfg = get();
  process.on('SIGTERM', () => {
    shutdown();
  });

  try {
    mongoose.connect(`${cfg.mongoose.url}${cfg.mongoose.dbName}?authMechanism=DEFAULT&authSource=admin`).then(async () => {
      log.info('Connected to MongoDB', `${cfg.mongoose.url}${cfg.mongoose.dbName}`);
      // Initialising Kafka topics
      initialiseKafkaTopics();
      const app = server();
      await app.start();
      // Redis
      redis.createRedis(cfg);
      // Scheduler for bets
      betStatsScheduler.run();
      // Run seed file
      seeds();

      log.info(`${pkg.name} listening at ${app.opts.port}`);
    }).catch((dbError) => {
      log.error(dbError, 'Error while connecting with DB');
      process.exit(1);
    });
  } catch (e) {
    log.error(e, 'Error starting server');
    process.exit(1);
  }
};

module.exports = start;

const ms = require('ms');
const newrelic = require('newrelic');
const util = require('util');

const Scheduler = require('@tabdigital/scheduler');

const config = require('../config');
const log = require('../log');
const { getBetsUsingCount } = require('../services/bet-stats');
const redis = require('../redis');
const { ListFormat } = require('typescript');

const scheduler = new Scheduler(newrelic);
const cfg = config();

// Log error
scheduler.on('jobError', (err, jobOpts) => log.error(err, jobOpts, 'Error while bet stats job'));

const schedulerMethod = async () => {
	try {
    log.info('Scheduler for live-bets');
		const liveBets = await getBetsUsingCount(cfg.liveBetsCount);
		await redis.getRedis().set('live-bets', liveBets);
    log.info('Added live bets in redis');
	} catch (e) {
    log.error(e, 'Error occured while running live bets scheduler');
	}
};

const run = () => {
  const { enabled, refreshInterval } = cfg.betStatsScheduler;
  if (enabled && refreshInterval) {
    scheduler.schedule(
      {
        interval: ms(refreshInterval),
        newrelicTransactionName: 'bet-stats:processing',
      },
      util.callbackify(schedulerMethod),
    );
  }
};

module.exports = { run };

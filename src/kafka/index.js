const log = require('../log');
const get = require('../config');

const BetsConsumer = require('./consumer/bets');
const VenueConsumer = require('./consumer/venue');

const betsMessageHandler = require('./message-handlers/bets-handler');
const venueMessageHandler = require('./message-handlers/venue-handler');

let betConsumer;

const initialiseKafkaTopics = () => {
	const cfg = get();
  betConsumer = new BetsConsumer(
    cfg.kafka.betsConsumer,
    betsMessageHandler,
    true
  );
  venueConsumer = new VenueConsumer(
    cfg.kafka.venueConsumer,
    venueMessageHandler,
    true
  );
  betConsumer.start();
  venueConsumer.start();
};

const shutdown = () => {
  betConsumer.stop();
  venueConsumer.stop();
};

module.exports = {
	initialiseKafkaTopics,
	shutdown
}


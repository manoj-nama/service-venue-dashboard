const { BatchMessageHandler } = require("@tabdigital/kafka-tcp-client");

const log = require('../../log');
const { createUserVenues } = require('../../services/user-venue');

module.exports = async (messages) => {
  log.info(
    `VenueConsumerMessageHandler :: Received ${messages.length} raw message(s).`
  );
  await createUserVenues(messages);
}

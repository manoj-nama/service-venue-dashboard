const { BatchMessageHandler } = require("@tabdigital/kafka-tcp-client");

const log = require('../../log');
const { createUser } = require('../../services/user-service');

module.exports = async (messages) => {
  log.info(
    `VenueConsumerMessageHandler :: Received ${messages.length} raw message(s).`
  );
  await createUser(messages);
}

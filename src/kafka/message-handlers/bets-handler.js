const { BatchMessageHandler } = require("@tabdigital/kafka-tcp-client");

const { createBets } = require('../../services/bet-stats-service');
const log = require('../../log');

const checkBetType = (message) => {
  log.debug(`Transaction type = ${message.tx_type}`);
  return 'SPORT_BET' === message.tx_type?.toUpperCase();
};

const requiredValuesFilter = (message) => {
  // const requiredValues = ["event_date", "bet_type", "tx_type"];
  // const missingRequiredValues = requiredValues.some((r) => {
  //   const isValueNil = !message[r];
  //   if (isValueNil) {
  //     log.info(
  //       `Missing/Invalid required value '${r}' (${message[r]}) in message`
  //     );
  //   }
  //   return isValueNil;
  // });
  const isSportsBet = checkBetType(message);
  return isSportsBet;
};

module.exports = async (messages) => {
  try {
    log.info(
      `PopularBetsMessageHandler :: Received ${messages.length} raw message(s).`
    );
    const vindicatedMessages = messages.filter(requiredValuesFilter);
    if (vindicatedMessages.length < 1) {
      log.info(
        `Exiting PopularBetsMessageHandler. No message passed requiredValuesFilter.`
      );
      return;
    }
    await createBets(vindicatedMessages);
  } catch (e) {
    log.error(e, 'Error in bet message handler - kafka');
  }
}

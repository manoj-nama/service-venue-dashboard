/* eslint-disable no-param-reassign */
const Bets = require('../models/bets.model');
const UserModel = require('../models/user.model');

module.exports = async (bet) => {
  const userInsideVenue = await UserModel.findOne({ accountNumber: bet.account_number, currentState: 1 });
  if (userInsideVenue) {
    bet.venueId = userInsideVenue.venueId;
    bet.venueName = userInsideVenue.venueName;
    bet.venueType = userInsideVenue.venueType;
    bet.venueState = userInsideVenue.venueState;
  } 
  const betDetail = new Bets(bet);
  return betDetail.save();
};

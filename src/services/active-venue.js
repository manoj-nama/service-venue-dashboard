const axios = require('axios');

const UserModel = require('../models/user.model');

module.exports.getActiveUsers = async () => {
  const activeUsers = await UserModel.find({ currentState: 1 });
  return activeUsers.length;
};

module.exports.getActiveVenues = async () => {
  const activeVenudata = await axios({
    method: 'get',
    url: 'https://api.congo.beta.tab.com.au/v1/invenue-service/public-venue-list',
  });

  const activeVenueArr = activeVenudata.data;
  // eslint-disable-next-line no-unused-vars
  const countVenues = activeVenueArr.reduce((count, venue) => count + (venue.status === 'Active' ? 1 : 0), 0);
  return countVenues;
};

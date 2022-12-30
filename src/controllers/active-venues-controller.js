const venueService = require('../services/active-venue');
const userService = require('../services/user-service');


const getActiveVenuesAndUser = async (req, res) => {
  const venueCount = await venueService.getActiveVenuesCount();
  const userCount = await userService.getActiveUsersCount();
  return res.send(200, { venueCount, userCount });
};

module.exports = getActiveVenuesAndUser;

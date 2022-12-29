const service = require('../services/active-venue');

const getActiveVenuesandUser = async (req, res) => {
  const venueCount = await service.getActiveVenues();
  const userCount = await service.getActiveUsers();
  return res.send(200, { venueCount, userCount });
};

module.exports = getActiveVenuesandUser;

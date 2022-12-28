const service = require('../services/active-venue');

const getActiveVenues = async (req, res) => {
  const venueCount = await service.getActiveVenues();
  return res.send(200, { venueCount });
};

module.exports = getActiveVenues;

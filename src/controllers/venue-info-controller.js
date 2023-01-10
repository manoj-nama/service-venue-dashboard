const { getVenueInfo } = require('../services/venue-info-service');
const venueService = require('../services/venue-info-service');
const userService = require('../services/user-service');


module.exports.getActiveVenuesAndUser = async (req, res) => {
  try {
    const { jurisdiction } = req.query;
    const venueCount = await venueService.getActiveVenuesCount(jurisdiction);
    const userCount = await userService.getActiveUsersCount(jurisdiction);
    return res.send(200, { venueCount, userCount });
  } catch (err) {
    throw err
  }
};

module.exports.getVenueInfo = async (req, res) => {
  try {
    const { venueId } = req.params;
    const result = await getVenueInfo(+venueId);
    return res.send(200, { data: result });
  } catch (err) {
    throw err
  }
};

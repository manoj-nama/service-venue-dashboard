const { getVenueInfo } = require('../services/venue-info-service');
const venueService = require('../services/venue-info-service');
const userService = require('../services/user-service');


module.exports.getActiveVenuesAndUser = async (req, res) => {
  try {
    const venueCount = await venueService.getActiveVenuesCount();
    const userCount = await userService.getActiveUsersCount();
    return res.send(200, { venueCount, userCount });
  } catch (err) {
    throw err;
  }
};

module.exports.getVenueInfo = async (req, res) => {
  try {
    const { venueId } = req.params;
    const result = await getVenueInfo(+venueId);
    console.log(result)
    return res.send(200, { data: result[0].venueInfo, venueDetails: { venueName: result[0].venueInfo[0]?.venueName, venueState: result[0].venueInfo[0]?.venueState, venueType: result[0].venueInfo[0]?.venueType, latitude: result[0].venueInfo[0]?.latitude, longitude: result[0].venueInfo[0]?.longitude }, active_users: result[0].activeUsers[0]?.active_users });
  } catch (err) {
    throw err;
  }
};

const { getVenueInfo } = require('../services/getVenueInfo');

module.exports.getVenueInfo = async (req, res) => {
  const { venueId } = req.params;
  const result = await getVenueInfo(+venueId);
  return res.send(200, { data: result });
};

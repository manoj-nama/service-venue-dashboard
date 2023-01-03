const isLatitude = (lat) => {
  // Latitude must be a number between -90 and 90
  return isFinite(lat) && Math.abs(lat) <= 90;
};

const isLongitude = (lng) => {
  // Longitude must a number between -180 and 180
  return isFinite(lng) && Math.abs(lng) <= 180;
};

const validateParam = async (req, res, next) => {
  const { jurisdiction, longitude, latitude } = req.query;

  if (!jurisdiction) throw 'jurisdiction is required';
  if (!longitude) throw 'longitude is required';
  if (!latitude) throw 'latitude is required';

  if (!isLongitude(longitude)) throw 'invalid longitude';
  if (!isLatitude(latitude)) throw 'invalid latitude';

  next();
};

module.exports = {
  validateParam,
};

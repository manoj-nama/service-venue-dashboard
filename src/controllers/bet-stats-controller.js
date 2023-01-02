const betStatsService = require('../services/bet-stats');

const getLiveBets = async (req, res) => {
  const response = await betStatsService.getLiveBetsFromRedis();
  return res.send(200, response);
};

const getBigBets = async (req, res) => {
  const response = await betStatsService.getLiveBets();
  return res.send(200, response);
};

const getHeatMapData = async (req, res) => {
  const response = await betStatsService.getLiveBets();
  return res.send(200, response);
};

const getBetsDistribution = async (req, res) => {
  const response = await betStatsService.getBetsDistribution(req);
  return res.send(200, response);
};

const addBetDetails = async (req, res) => {
  try {
    const { betDetails } = req.body;
    if (!betDetails) {
      res.send(400, 'payload is required');
      return;
    }
    const result = await betStatsService.createBets(betDetails);
    res.send(201, { message: 'Success', data: result });
  } catch (error) {
    console.log(' Error : ', error);
    res.send(400, error);
  }
};

const mostBetsPlacedPerVenue = async (req, res) => {
  try {
    let { limit, page } = req.query;
    limit = limit * 1 || 10;
    page = page * 1 || 1;
    const skip = (page - 1) * limit;
    const result = await betStatsService.mostBetsPlacedPerVenue(limit, skip);
    res.send(200, { data: result });
  } catch (err) {
    console.error(err);
  }
};

const mostAmountSpentPerVenue = async (req, res) => {
  try {
    let { limit, page } = req.query;
    limit = limit * 1 || 10;
    page = page * 1 || 1;
    const skip = (page - 1) * limit;
    const result = await betStatsService.mostAmountSpentPerVenue(limit, skip);
    res.send(200, { data: result });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getLiveBets,
  getBigBets,
  getHeatMapData,
  getBetsDistribution,
  addBetDetails,
  mostAmountSpentPerVenue,
  mostBetsPlacedPerVenue,
};

const betStatsService = require('../services/bet-stats-service');

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
    throw error
  }
};

const mostBetsPlacedPerVenue = async (req, res) => {
  try {
    let {
      limit, page, fromDateUTC, toDateUTC, sort
    } = req.query;
    const result = await betStatsService.mostBetsPlacedPerVenue(limit, page, fromDateUTC, toDateUTC, sort);
    res.send(200, { data: result });
  } catch (err) {
    throw err
  }
};

const mostAmountSpentPerVenue = async (req, res) => {
  try {
    let {
      limit, page, fromDateUTC, toDateUTC, sort
    } = req.query;
    const result = await betStatsService.mostAmountSpentPerVenue(limit, page, fromDateUTC, toDateUTC, sort);
    res.send(200, { data: result });
  } catch (err) {
    throw err
  }
};

const searchMostAmountSpentPerVenue = async (req, res) => {
  try {
    const { text } = req.query;
    const result = await betStatsService.searchMostAmountSpentPerVenue(text);
    res.send(200, { data: result });
  } catch (err) {
    throw err
  }
};

const searchMostBetsPlacedPerVenue = async (req, res) => {
  try {
    const { text } = req.query;
    const result = await betStatsService.searchMostBetsPlacedPerVenue(text);
    res.send(200, { data: result });
  } catch (err) {
    throw err
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
  searchMostAmountSpentPerVenue,
  searchMostBetsPlacedPerVenue,
};

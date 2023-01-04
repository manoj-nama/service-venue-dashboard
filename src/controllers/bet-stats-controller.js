const betStatsService = require('../services/bet-stats');

const createBet = async (req, res) => {
  const response = await betStatsService.createBetFromFE(req.body);
  return res.send(200, response);
};

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
    let {
      limit, page, fromDateUTC, toDateUTC, searchText,
    } = req.query;
    fromDateUTC = fromDateUTC * 1 || 0,
    toDateUTC = toDateUTC * 1 || Date.parse(new Date().toUTCString());
    limit = limit * 1 || 1000;
    page = page * 1 || 1;
    const skip = (page - 1) * limit;
    const result = await betStatsService.mostBetsPlacedPerVenue(limit, skip, fromDateUTC, toDateUTC);
    res.send(200, { data: result });
  } catch (err) {
    console.error(err);
  }
};

const mostAmountSpentPerVenue = async (req, res) => {
  try {
    let {
      limit, page, fromDateUTC, toDateUTC,
    } = req.query;
    fromDateUTC = fromDateUTC * 1 || 0,
    toDateUTC = toDateUTC * 1 || Date.parse(new Date().toUTCString());
    limit = limit * 1 || 1000;
    page = page * 1 || 1;
    const skip = (page - 1) * limit;
    const result = await betStatsService.mostAmountSpentPerVenue(limit, skip, fromDateUTC, toDateUTC);
    res.send(200, { data: result });
  } catch (err) {
    console.error(err);
  }
};

const searchMostAmountSpentPerVenue = async (req, res) => {
  try {
    const { text } = req.query;
    const result = await betStatsService.searchMostAmountSpentPerVenue(text);
    res.send(200, { data: result });
  } catch (err) {
    console.error(err);
  }
};

const searchMostBetsPlacedPerVenue = async (req, res) => {
  try {
    const { text } = req.query;
    const result = await betStatsService.searchMostBetsPlacedPerVenue(text);
    res.send(200, { data: result });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  createBet,
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

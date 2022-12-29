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

const getBetsEntireDistribution = async (req, res) => {
  const response = await betStatsService.getEntireDistribution();
  return res.send(200, response);
};

module.exports = {
  getLiveBets,
  getBigBets,
  getHeatMapData,
  getBetsEntireDistribution,
};

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

const addBetDetails = async (req,res) => {
    try {
      const { betDetails } = req.body;
      if (!betDetails) {
        res.send(400, 'payload is required');
        return;
     }
      const result = await betStatsService.createBets(betDetails)
      res.send(201, { message: 'Success', data: result });
    } catch (error) {
      console.log(' Error : ', error);
      res.send(400, error);
    }
  };

module.exports = {
  getLiveBets,
  getBigBets,
  getHeatMapData,
  getBetsEntireDistribution,
  addBetDetails
};
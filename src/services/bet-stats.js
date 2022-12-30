const { BetModel, UserModel } = require('../models');
const redis = require('../redis');
const {
  liveBetsFormatter,
  inputBetsFormatter,
  formatBetDistribution,
} = require('./formatter/bet-stats');

const makeBet = async (bet) => {
  const userInfo = await UserModel.findOne({ accountNumber: bet.account_number });
  if (userInfo) {
    bet.venueId = userInfo.venueId;
    bet.venueName = userInfo.venueName;
    bet.venueType = userInfo.venueType;
    bet.venueState = userInfo.venueState;
    bet.location = userInfo.location;
  }
  const betDetail = new BetModel(bet);
  return betDetail.save();
};

const createBets = async (betDetails) => {
  // const formattedBetsInput = inputBetsFormatter(bets);
  let i = 0;
  const promises = [];
  while (i < betDetails.length) { const promise = await makeBet(betDetails[i]); i += 1; promises.push(promise); }
  const result = await Promise.all(promises);
  return result;
};

const getBetsUsingCount = async (count) => {
  const bets = BetModel.find().limit(count);
  return bets;
};

const getLiveBetsFromRedis = async () => {
  const liveBets = await redis.getRedis().get('live-bets');
  return liveBetsFormatter(liveBets);
};

const getBigBets = async () => [];

const getHeatMapData = async () => [];

const getEntireDistribution = async () => {
  const liveBets = await getLiveBetsFromRedis();
  const bigBets = await getBigBets();
  const heatMap = await getHeatMapData();
  const response = formatBetDistribution({
    liveBets,
    bigBets,
    heatMap,
  });
  return response;
};

const mostBetsPlacedPerVenue = async (limit) => {
  let pipeline = [
    {
      $match: {
        venueId: {
          $ne: null,
        },
      },
    }, {
      $group: {
        _id: '$venueId',
        bets: {
          $push: '$$ROOT',
        },
        frequency_of_bets: {
          $sum: 1,
        },
      },
    }, {
      $project: {
        location: {
          $arrayElemAt: [
            '$bets', 0,
          ],
        },
        frequency_of_bets: '$frequency_of_bets',
      },
    }, {
      $project: {
        venueName: '$location.venueName',
        venueId: '$location.venueId',
        venueState: '$location.venueState',
        venueType: '$location.venueType',
        frequency_of_bets: '$frequency_of_bets',
        _id: 0,
      },
    },
    {
      $sort: {
        frequency_of_bets: -1,
        venueName: 1,
      },
    },
  ];
  if (limit) { pipeline = [...pipeline, { $limit: limit }]; }
  const result = await BetModel.aggregate(pipeline);
  return result;
};

const mostAmountSpentPerVenue = async (limit) => {
  let pipeline = [
    {
      $match: {
        venueId: {
          $ne: null,
        },
      },
    }, {
      $group: {
        _id: '$venueId',
        bets: {
          $push: '$$ROOT',
        },
        frequency_of_total_amount_spent: {
          $sum: '$price',
        },
      },
    }, {
      $project: {
        location: {
          $arrayElemAt: [
            '$bets', 0,
          ],
        },
        frequency_of_total_amount_spent: '$frequency_of_total_amount_spent',
      },
    }, {
      $project: {
        venueName: '$location.venueName',
        venueId: '$location.venueId',
        venueState: '$location.venueState',
        venueType: '$location.venueType',
        frequency_of_total_amount_spent: '$frequency_of_total_amount_spent',
        _id: 0,
      },
    },
    {
      $sort: {
        frequency_of_total_amount_spent: -1,
        venueName: 1,
      },
    },
  ];
  if (limit) { pipeline = [...pipeline, { $limit: limit }]; }
  const result = await BetModel.aggregate(pipeline);
  return result;
};

module.exports = {
  createBets,
  getBetsUsingCount,
  getLiveBetsFromRedis,
  getEntireDistribution,
  mostAmountSpentPerVenue,
  mostBetsPlacedPerVenue,
};

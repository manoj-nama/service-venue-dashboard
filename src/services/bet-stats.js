const Promise = require('bluebird');

const { BetModel, UserModel } = require('../models')
const redis = require('../redis');
const {
  liveBetsFormatter,
  inputBetsFormatter,
  formatBetDistribution,
  heatMapFormatter,
} = require('./formatter/bet-stats');
const { get } = require('../request');
const log = require('../log');
const { ListFormat } = require('typescript');
const config = require('../config');

// TODO: Move to constants
const DEFAULT_RADIUS = 10000000;

const getPropDetails = async (propIds) => {
	let propDetails = [];
	try {
		log.info('Fetching prop details for', propIds);
    const baseUrl = 'https://api.congo.beta.tab.com.au/v1/tab-info-service/search/proposition';
    const params = `?jurisdiction=nsw&details=true&${propIds.map((id) => `number=${id}`).join('&')}`;
		propDetails = await get(`${baseUrl}${params}`);
		propDetails = propDetails.propositions.filter(detail => detail.type === 'sport').map(d => ({
			proposition_name: d.propositionDetails.name,
			prop_id: d.propositionNumber,
			market_name: d.market.name,
			bet_option: d.market.betOption,
			market_unique_id: d.market.marketUniqueId,
			market_close_time: d.market.closeTime,
			match_id: d.match.id,
			match_name: d.match.name,
			matchStartTime: d.match.startTime,
			competition_id: d.competition.id,
			competition_name: d.competition.name,
			sport_name: d.sport.name,
			sport_id: d.sport.id,
		}));
	} catch(e) {
		log.error(e, 'Error while fetching prop details');
	}
  return propDetails;
};

const getBetWithLoc = async (bet) => {
	let betDetail;
	try {
    log.info(`Fetching location details for ${bet.account_number}`)
		const userInfo = await UserModel.findOne({ accountNumber: 1271223 });
		if (userInfo && userInfo.location) {
      log.info(`Found location for ${bet.account_number}`);
			betDetail = bet;
			betDetail.venueId = userInfo.venueId;
			betDetail.venueName = userInfo.venueName;
			betDetail.venueType = userInfo.venueType;
			betDetail.venueState = userInfo.venueState;
			betDetail.location = userInfo.location;
		}
	} catch(e) {
    betDetail = null;
		log.error(e, 'Error while fetching location details');
	}
  return betDetail;
};

const createBets = async (betDetails) => {
  let response = [];
	// const formattedBetsInput = inputBetsFormatter(bets);
  try {
    log.info('Bets creation process started');
    if (betDetails && betDetails.length) {
      response = await Promise.map(betDetails, async bet => {
        const updatedBetDetails = await getBetWithLoc(bet);
        // if (updatedBetDetails) {
        //   const propIds = bet?.propositions.map(prop => prop.prop_id);
        //   const propDetails = await getPropDetails(propIds);
        //   if (propDetails && propDetails.length) {
        //     log.info(`Inserting ${propDetails.length} bets`)
        //     const formattedBets = propDetails.map(p => ({ ...bet, ...p }));
        //     await BetModel.insertMany(formattedBets);
        //   } else {
        //     log.info(`No bets to create`);
        //   }
        // }
        if (updatedBetDetails) {
          log.info('Adding bet in db');
          return await BetModel.create(updatedBetDetails)
        }
      });
      response = response.filter(r => !!r);
    }
  } catch(e) {
    response = [];
    log.error(e, 'Error while creating bets', e);
  }
  return response;
};

const getBetsUsingCount = async (count) => {
  // TODO: Add sorting based on creation time
  const bets = BetModel.find().limit(count);
  return bets;
};

const getLiveBetsFromRedis = async () => {
  let response = [];
  try {
    const cfg = config();
    const liveBets = await redis.getRedis().get('live-bets');
    response = liveBetsFormatter({
      bets: liveBets,
      count: cfg.betStatsScheduler.liveBetsCount,
    });
  } catch (e) {
    log.error('Error fetching live bets from redis', e);
  }
  return response;
};

const getBigBets = async ({
  sportName,
  competitionName,
  tournamentName,
  matchName,
  sort
}) => {
  return [];
};

const getHeatMapData = async ({
  sportName,
  competitionName,
  tournamentName,
  matchName,
  radius = DEFAULT_RADIUS,
  longitude,
  latitude
}) => {
  const response =  await BetModel.find({
    location: {
      $near: {
        $maxDistance: radius,
        $geometry: {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)],
        },
      },
    },
  });
  return heatMapFormatter(response);
};

const getBetsDistribution = async ({ query, params }) => {
  const { sportName, competitionName, tournamentName, matchName } = params;
  const { sort, radius, longitude, latitude } = query;

  const liveBets = await getLiveBetsFromRedis({
    sportName,
    competitionName,
    tournamentName,
    matchName
  });
  const bigBets = await getBigBets({
    sportName,
    competitionName,
    tournamentName,
    matchName,
    sort
  });
  const heatMap = await getHeatMapData({
    sportName,
    competitionName,
    tournamentName,
    matchName,
    radius,
    longitude,
    latitude
  });
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
        frequency_of_bets: 1,
      },
    }, {
      $project: {
        venueName: '$location.venueName',
        venueId: '$location.venueId',
        venueState: '$location.venueState',
        venueType: '$location.venueType',
        frequency_of_bets: 1,
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
        frequency_of_total_amount_spent: 1,
      },
    }, {
      $project: {
        venueName: '$location.venueName',
        venueId: '$location.venueId',
        venueState: '$location.venueState',
        venueType: '$location.venueType',
        frequency_of_total_amount_spent: 1,
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
  getBetsDistribution,
  mostAmountSpentPerVenue,
  mostBetsPlacedPerVenue,
};

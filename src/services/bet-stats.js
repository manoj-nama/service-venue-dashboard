const Promise = require('bluebird');

const { BetModel, UserModel, PropositionModel } = require('../models')
const redis = require('../redis');
const {
  liveBetsFormatter,
  inputBetsFormatter,
  formatBetDistribution,
  heatMapFormatter,
  bigBetsFormatter,
  versusMapFormatter
} = require('./formatter/bet-stats');
const { get } = require('../request');
const log = require('../log');
const { ListFormat } = require('typescript');
const config = require('../config');

// TODO: Move to constants
const DEFAULT_RADIUS = 10000000;
const DEFAULT_LONGITUDE = '';
const DEFAULT_LATITUDE = '';

const getPropDetails = async (props) => {
  let propDetails = [];
  try {
    log.info('Fetching prop details for', props);
    const baseUrl = 'https://api.congo.beta.tab.com.au/v1/tab-info-service/search/proposition';
    const params = `?jurisdiction=nsw&details=true&${props.map((p) => `number=914396`).join('&')}`;
    propDetails = await get(`${baseUrl}${params}`);
    const contestants = [
      {
        isHome: true,
        position: 'Home',
        name: 'GEELONG'
      },
      {
        isHome: false,
        position: 'Away',
        name: 'Sydney'
      }
    ]
    propDetails = propDetails.propositions.filter(detail => detail.type === 'sport').map((d, i) => ({
      bet_type: d.type,
      bet_option: d.market?.betOption,
      market_name: d.market?.name,
      market_unique_id: `${d.market?.marketUniqueId}${i}`,
      market_close_time: d.market?.closeTime,
      sport_name: d.sport?.name,
      sport_id: d.sport?.id,
      match_id: d.match?.id,
      match_name: d.match?.name,
      match_start_time: d.match?.startTime,
      competition_id: d.competition?.id,
      competition_name: d.competition?.name,
      tournament_name: d?.tournament?.name,
      tournament_id: d.tournament?.id,
      proposition: {
        name: d.propositionDetails?.name,
        id: d.propositionNumber,
        returnWin: d.propositionDetails?.returnWin,
        returnPlace: d.propositionDetails?.returnPlace,
        differential: d.propositionDetails?.differential,
        bettingStatus: d.propositionDetails?.bettingStatus,
        allowPlace: d.propositionDetails?.allowPlace,
        isOpen: d.propositionDetails?.isOpen,
        number: d.propositionDetails?.number
      },
      contestants: d.match.contestants.reduce((acc, curr) => {
        const { image } = (curr.images || []).find(i => i.size === 'svg');
        delete curr.images;
        acc.push({
          ...curr, ...{ image }
        })
      }, [])
    }));
    propDetails.forEach(det => {
      const existingProp = props.find(p => Number(p.id) === det.proposition.id);
      if (existingProp) det.price = existingProp.price;
    });
  } catch (e) {
    propDetails = [];
    log.error(e, 'Error while fetching prop details');
  }
  return propDetails;
};

const getBetWithLoc = async (bet) => {
  let betDetail;
  try {
    log.info(`Fetching location details for ${bet.account_number}`)
    const userInfo = await UserModel.findOne({ accountNumber: bet.account_number });
    if (userInfo && userInfo.location) {
      log.info(`Found location for ${bet.account_number}`);
      betDetail = bet;
      betDetail.venueId = userInfo.venueId;
      betDetail.venueName = userInfo.venueName;
      betDetail.venueType = userInfo.venueType;
      betDetail.venueState = userInfo.venueState;
      betDetail.location = userInfo.location;
    }
  } catch (e) {
    betDetail = null;
    log.error(e, 'Error while fetching location details');
  }
  return betDetail;
};

const createPropDetailsForBet = async (bets) => {
  try {
    log.info('Processing propositions for bets');
    const propsToBeCreated = [];
    await Promise.map(bets, async b => {
      const propDetails = await getPropDetails(b.propositions);
      propDetails.forEach(p => p.bet = b._id);
      propsToBeCreated.push(...propDetails);
    });
    log.info(`Creating ${propsToBeCreated.length} propositions in database`);
    await PropositionModel.insertMany(propsToBeCreated);
  } catch (e) {
    log.error('Error while creating propositions in db', e);
  }
};

const createBets = async (betDetails) => {
  let response = [];
  try {
    log.info('Bets creation process started');
    if (betDetails && betDetails.length) {
      response = await Promise.map(betDetails, async bet => {
        const updatedBetDetails = await getBetWithLoc(bet);
        if (updatedBetDetails) {
          updatedBetDetails.propositions = bet.propositions.map(p => ({
            id: p.prop_id,
            price: Number(p.price?.string || 0),
          }));
          return updatedBetDetails;
        }
      });
      response = response.filter(r => !!r);
      if (response.length) {
        log.info(`Creating ${response.length} bets`)
        response = await BetModel.insertMany(response);
        await createPropDetailsForBet(response);
        log.info('Bets created');
      }
    }
  } catch (e) {
    response = [];
    log.error(e, 'Error while creating bets', e);
  }
  return response;
};

const getBetsUsingCount = async (count) => {
  const bets = PropositionModel.find().sort({ createdAt: -1 }).limit(count);
  return bets;
};

const getLiveBetsFromRedis = async () => {
  log.info('Fetching live bets');
  let response = [];
  try {
    const cfg = config();
    const liveBets = await redis.getRedis().get('live-bets');
    response = liveBetsFormatter({
      bets: liveBets,
      count: cfg.betStatsScheduler.liveBetsCount,
    });
  } catch (e) {
    response = [];
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
  log.info('Fetching big bets');
  let response = [];
  try {
    //TODO: Add sorting based on bet amount else what comes in sort param
    response = await PropositionModel.aggregate([
      {
        $group: {
          _id: '$market_unique_id',
          total_bet_amount: { $sum: "price" },
          count: { $sum: 1 },
          "match_name": { "$first": "$match_name" },
          "match_start_time": { "$first": "$match_start_time" },
          "market_name": { "$first": "$market_name" },
          "market_unique_id": { "$first": "$market_unique_id" },
        },
      },
    ]);
  } catch (e) {
    response = [];
    log.error('Error fetching big bets', e);
  }
  return bigBetsFormatter(response);
};

const getHeatMapData = async ({
  sportName,
  competitionName,
  tournamentName,
  matchName,
  radius = DEFAULT_RADIUS,
  longitude = DEFAULT_LONGITUDE,
  latitude = DEFAULT_LATITUDE
}) => {
  let response = [];
  try {
    log.info('Fetching heat map data');
    response = await PropositionModel.find()
      .populate({
        path: 'bet',
        select: 'location',
        match: {
          location: {
            $near: {
              $maxDistance: radius,
              $geometry: {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)],
              },
            },
          },
        }
      }).exec();
    return heatMapFormatter(response);
  } catch (e) {
    response = [];
    log.error(e, 'Error while fetching heat map data');
  }
  return heatMapFormatter(response);
};

const getVersusMapData = async ({
  sportName,
  competitionName,
  tournamentName,
  matchName,
  radius = DEFAULT_RADIUS,
  longitude = DEFAULT_LONGITUDE,
  latitude = DEFAULT_LATITUDE
}) => {
  let response = [];
  try {
    log.info('Fetching versus map data');
    response = await PropositionModel.aggregate([
      {
        $lookup:
        {
          from: 'Bet',
          localField: 'bet',
          foreignField: '_id',
          as: 'betInfo'
        }
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$betInfo", 0] }, "$$ROOT"] } }
      },
      { $project: { betInfo: 0 } },
      {
        $match: {
          sport_name : sportName,
          competition_name: competitionName,
          match_name: matchName,
          location: {
            $near: {
              $maxDistance: radius,
              $geometry: {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)],
              },
            },
          },
        }
      },
      {
        $unwind: "$contestants",
      },
      {
        $addFields: { result: { $regexMatch: { input: "$proposition.name", regex: '$contestants.name', options: "i" } } }
      },

      {
        $group: {
          _id: {
            'teamName': '$contestants.name',
            'imageUrl': '$contestants.image',
            'result': '$result'
          },
          props: {
            $push: '$$ROOT'
          },
        }
      },
      {
        $project: {
          _id: 0,
          teamName: '$_id.teamName',
          icon: {
            imageUrl: '$_id.imageUrl'
          },
          props: {
            $filter: {
              input: "$props",
              as: "prop",
              cond: { $eq: ["$$prop.result", true] }
            }
          },
        }
      },
      {
        $project: {
          teamName: 1,
          icon: 1,
          coordinates: {
            $map: {
              input: "$props",
              as: "prop",
              in: {
                longitude: { $arrayElemAt: ['$location.coordinates', 0] },
                latitude: { $arrayElemAt: ['$location.coordinates', 1] }
              }
            }
          },
          count: {
            $size: '$props'
          }
        }
      }
    ]);

    return versusMapFormatter(response);
  } catch (e) {
    response = [];
    log.error(e, 'Error while fetching versus map data');
  }
  return versusMapFormatter(response);
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

  let versusMap;
  // if(sportName & matchName){
  versusMap = await getVersusMapData({
    sportName,
    competitionName,
    tournamentName,
    matchName
  });
  // }

  const response = formatBetDistribution({
    liveBets,
    bigBets,
    heatMap,
    versusMap
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

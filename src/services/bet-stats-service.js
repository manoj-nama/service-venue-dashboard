const Promise = require('bluebird');

const { BetModel, UserModel, PropositionModel } = require('../models');
const { makeUser } = require('./user-service');
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
const DEFAULT_RADIUS = 100000000;
const DEFAULT_LONGITUDE = '';
const DEFAULT_LATITUDE = '';

const getPropDetails = async (props) => {
  let propDetails = [];
  try {
    log.info('Fetching prop details for', props);
    const baseUrl =
      'https://api.congo.beta.tab.com.au/v1/tab-info-service/search/proposition';
    const params = `?jurisdiction=nsw&details=true&${props
      .map((p) => `number=${Number(p.id)}`)
      .join('&')}`;

    // TODO: To be removed once correct data is there on env
    const contestants = [
      {
        "name": "Sydney",
        "position": "HOME",
        "isHome": true,
        "image": [
          {
            "size": "svg",
            "url": "https://metadata.beta.tab.com.au/icons/NBA%20logos/Milwaukee%20Bucks.svg"
          },
          {
            "size": "xxhdpi",
            "url": "https://metadata.beta.tab.com.au/icons/NBA%20logos/Milwaukee%20Bucks_xxhdpi.png"
          },
          {
            "size": "2x",
            "url": "https://metadata.beta.tab.com.au/icons/NBA%20logos/Milwaukee%20Bucks%402x.png"
          }
        ]
      },
      {
        "name": "MELBOURNE",
        "position": "AWAY",
        "isHome": false,
        "image": [
          {
            "size": "svg",
            "url": "https://metadata.beta.tab.com.au/icons/NBA%20logos/Washington%20Wizards.svg"
          },
          {
            "size": "xxhdpi",
            "url": "https://metadata.beta.tab.com.au/icons/NBA%20logos/Washington%20Wizards_xxhdpi.png"
          },
          {
            "size": "2x",
            "url": "https://metadata.beta.tab.com.au/icons/NBA%20logos/Washington%20Wizards%402x.png"
          }
        ]
      }
    ];
    propDetails = await get(`${baseUrl}${params}`);
    propDetails = propDetails.propositions.filter(detail => detail.type === 'sport').map((d, i) => ({
      bet_type: d.type,
      bet_option: d?.market?.betOption,
      market_name: d?.market?.name,
      market_unique_id: `${d?.market?.marketUniqueId}${i}`,
      market_close_time: d?.market?.closeTime,
      sport_name: d?.sport?.name,
      sport_id: d?.sport?.id,
      match_id: d?.match?.id,
      match_name: d?.match?.name,
      match_start_time: d.match?.startTime,
      competition_id: d?.competition?.id,
      competition_name: d?.competition?.name,
      tournament_name: d?.tournament?.name,
      tournament_id: d?.tournament?.id,
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
      contestants: ((d?.match?.contestants?.length && d?.match?.contestants) || contestants).map((item, i) => {
        // TODO: To be removed once correct data is there on env
        if (d.match?.contestants?.length && !d.match?.contestants[0].image) {
          d.match.contestants[0].image = contestants[0].image;
          d.match.contestants[1].image = contestants[1].image;
        }
        item.regex = Array.from(new Set(item.name.match(/\(|\)/g))).reduce((acc, curr) => {
          const regex = new RegExp(`\\${curr}`, 'g');
          return acc.replace(regex, `\\${curr}`);
        }, item.name);

        // TODO : Remove contestants and use api returned contestants
        return {
          imageUrl: item?.image[0]?.url || '',
          ...item
        };
      })
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
    log.info(`Fetching location details for ${bet.account_number}`);
    const userInfo = await UserModel.findOne({
      accountNumber: bet.account_number,
    });
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
    await Promise.map(bets, async (b) => {
      const propDetails = await getPropDetails(b.propositions);
      propDetails.forEach((p) => (p.bet = b._id));
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
      response = await Promise.map(betDetails, async (bet) => {
        bet = bet.value || bet;
        const updatedBetDetails = await getBetWithLoc(bet);
        if (updatedBetDetails) {
          updatedBetDetails.propositions = bet.propositions.map((p) => ({
            id: p.prop_id,
            price: Number(p.price?.string || 0),
          }));
          return updatedBetDetails;
        }
      });
      response = response.filter((r) => !!r);
      if (response.length) {
        log.info(`Creating ${response.length} bets`);
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

// TODO: To be removed once correct data is coming via kafka topic
const createBetFromFE = async ({ data = [] }) => {
  try {
    log.info('Creating bet details via front-end');
    let totalBetsToBeCreated = [];
    await Promise.map(data, async ({
      coordinates, accountNumber, customerNumber, bets, ticketCost, venueDetails = {},
    }) => {
      const betsToBeCreated = bets.map(bet => {
        const props = bet.legs.map(l => {
          return {
            id: `${l.propositionId}`,
            price: Number(bet.betCost),
          }
        })
        return {
          account_number: accountNumber,
          transaction_date_time: Date.now(bet.betSellTime),
          location: {
            type: 'Point',
            coordinates,
          },
          price: Number(ticketCost),
          bet_amount: ticketCost,
          currency: 'AUD',
          customer_number: customerNumber,
          number_of_legs: bet.legs?.length,
          propositions: props,
          ...venueDetails,
        };
      });
      totalBetsToBeCreated.push(...betsToBeCreated);
    });
    log.info(`Creating ${totalBetsToBeCreated.length} bets`);
    const betResponse = await BetModel.insertMany(totalBetsToBeCreated);
    await createPropDetailsForBet(betResponse);
    log.info('Bets created');
  } catch (e) {
    log.error(e, 'Error while creating bet from front end')
  }
};

const getBetsUsingCount = async (count) => {
  const bets = PropositionModel.find().sort({ createdAt: -1 }).limit(count);
  return bets;
};

const getLiveBetsFromRedis = async ({
  sportName,
  competitionName,
  tournamentName,
  matchName,
}) => {
  log.info('Fetching live bets');
  let response = [];

  try {
    const cfg = config();
    let newLiveBets = [];
    let betStringFindKey = 'global';

    const findOptions = {
      sport_name: sportName,
      competition_name: competitionName,
      tournament_name: tournamentName,
      match_name: matchName,
    };

    Object.keys(findOptions).forEach(
      (k) => !findOptions[k] && delete findOptions[k]
    );

    if (sportName && competitionName && tournamentName && matchName)
      betStringFindKey = `${sportName}:${competitionName}:${tournamentName}:${matchName}`;
    else if (sportName && competitionName && matchName)
      betStringFindKey = `${sportName}:${competitionName}:${matchName}`;

    const cachedBets = (await redis.getRedis().get(betStringFindKey)) || [];

    if (!cachedBets || cachedBets.length === 0) {
      newLiveBets = await PropositionModel.find(findOptions).sort({
        createdAt: -1,
      });
    } else if (cachedBets.length > 0) {
      newLiveBets = await PropositionModel.find({
        ...findOptions,
        createdAt: { $gt: cachedBets[0]?.createdAt },
      }).sort({
        createdAt: -1,
      });
    }

    response = [
      ...newLiveBets.map((r) => {
        r['new'] = true;
        return r;
      }),
      ...cachedBets.map((r) => {
        r['new'] = false;
        return r;
      }),
    ];

    await redis.getRedis().set(betStringFindKey, response);

    response = liveBetsFormatter({
      bets: response,
      count: cfg.betStatsScheduler.liveBetsCount,
    });
  } catch (e) {
    response = [];
    console.log(e.message);
    log.error('Error fetching live bets from redis', e);
  }
  return response;
};

const getBigBets = async ({
  sportName,
  competitionName,
  tournamentName,
  matchName,
  sort,
}) => {
  log.info('Fetching big bets');
  let response = [];
  // default sort on totalBetAmount
  let sortOptions = { totalBetAmount: -1 };
  if (sort === 'count') sortOptions = { count: -1 };

  try {
    const findOptions = {
      sport_name: sportName,
      competition_name: competitionName,
      tournament_name: tournamentName,
      match_name: matchName,
    };

    Object.keys(findOptions).forEach(
      (k) => !findOptions[k] && delete findOptions[k]
    );

    response = await PropositionModel.aggregate([
      { $match: findOptions },
      {
        $group: {
          _id: '$market_unique_id',
          total_bet_amount: { $sum: '$price' },
          count: { $sum: 1 },
          sport_name: { $first: '$sport_name' },
          match_name: { $first: '$match_name' },
          competition_name: { $first: '$competition_name' },
          tournament_name: { $first: '$tournament_name' },
          match_start_time: { $first: '$match_start_time' },
          market_name: { $first: '$market_name' },
          market_unique_id: { $first: '$market_unique_id' },
          bet_option: { $first: '$bet_option' },
        },
      },
      { $sort: sortOptions },
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
  latitude = DEFAULT_LATITUDE,
}) => {
  let response = [];
  try {
    log.info('Fetching heat map data');

    const findOptions = {
      sport_name: sportName,
      competition_name: competitionName,
      tournament_name: tournamentName,
      match_name: matchName,
    };

    Object.keys(findOptions).forEach(
      (k) => !findOptions[k] && delete findOptions[k]
    );

    response = await PropositionModel.find(findOptions)
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
        },
      })
      .exec();
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
  longitude = DEFAULT_LONGITUDE,
  latitude = DEFAULT_LATITUDE
}) => {
  let response = [];
  const DEFAULT_VERSUS_MAP_RADIUS = 50000;
  try {
    log.info('Fetching versus map data');
    const findOptions = {
      sport_name: sportName,
      competition_name: competitionName,
      tournament_name: tournamentName,
      match_name: matchName,
    };

    Object.keys(findOptions).forEach(
      (k) => !findOptions[k] && delete findOptions[k]
    );
    let nearByCordsBet = await BetModel.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)]
          },
          distanceField: "distance",
          maxDistance: Number(DEFAULT_VERSUS_MAP_RADIUS),
        }
      },
      {
        $project: {
          _id: 1
        }
      }
    ]);

    nearByCordsBet = nearByCordsBet.map(i => i._id);

    response = await PropositionModel.aggregate([
      {
        $lookup:
        {
          from: 'bets',
          localField: 'bet',
          foreignField: '_id',
          as: 'betInfo'
        },
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$betInfo", 0] }, "$$ROOT"] } }
      },
      { $project: { betInfo: 0 } },
      {
        $match: { bet: { $in: nearByCordsBet }, account_number: { $ne: null }, ...findOptions }
      },
      {
        $unwind: {
          path: "$contestants",
        },
      },
      {
        $addFields: {
          result: { $regexMatch: { input: "$proposition.name", regex: '$contestants.regex', options: "i" } },
        }
      },
      {
        $group: {
          _id: {
            'teamName': '$contestants.name',
            'imageUrl': '$contestants.imageUrl',
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
          props: 1,
          count: {
            $size: '$props'
          }
        }
      }
    ]);

    response = response.reduce((acc, curr) => {
      teamCount = response.filter(i => i.teamName === curr.teamName).length == 1;
      if (teamCount || curr.count) {
        acc.push(curr);
      }
      return acc;
    }, []);
    return versusMapFormatter({ response, sportName, competitionName, matchName });
  } catch (e) {
    response = [];
    log.error(e, 'Error while fetching versus map data');
  }
  return versusMapFormatter({ response, sportName, competitionName, matchName });
};

const getBetsDistribution = async ({ query, params }) => {
  const { sportName, competitionName, tournamentName, matchName } = params;
  const { sort, radius, longitude, latitude } = query;
  try {
    const liveBets = await getLiveBetsFromRedis({
      sportName,
      competitionName,
      tournamentName,
      matchName,
    });
    const bigBets = await getBigBets({
      sportName,
      competitionName,
      tournamentName,
      matchName,
      sort,
    });
    const heatMap = await getHeatMapData({
      sportName,
      competitionName,
      tournamentName,
      matchName,
      radius,
      longitude,
      latitude,
    });

    let versusMap;
    if (sportName && matchName) {
      versusMap = await getVersusMapData({
        sportName,
        competitionName,
        tournamentName,
        matchName,
        longitude,
        latitude,
      });
    }

    const response = formatBetDistribution({
      liveBets,
      bigBets,
      heatMap,
      versusMap
    });
    return response;
  } catch (err) {
    log.info(err, 'Controller error: ')
  }
};

const mostBetsPlacedPerVenue = async (
  limit,
  page,
  fromDateUTC,
  toDateUTC,
  sort,
  jurisdiction,
) => {
  fromDateUTC = fromDateUTC * 1 || 0,
    toDateUTC = toDateUTC * 1 || Date.parse(new Date().toUTCString());
  limit = limit * 1 || 1000;
  page = page * 1 || 1;
  const skip = (page - 1) * limit;
  sort = sort?.toLowerCase() === 'asc' ? 1 : -1;

  const $match = {
    venueId: {
      $ne: null,
    },
    transaction_date_time: {
      $gte: fromDateUTC,
      $lte: toDateUTC,
    },
  };

  if (jurisdiction && jurisdiction.toLowerCase() !== "all") {
    $match['venueState'] = jurisdiction.toUpperCase();
  }

  let pipeline = [
    { $match },
    {
      $group: {
        _id: '$venueId',
        bets: {
          $push: '$$ROOT',
        },
        frequency_of_bets: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        location: {
          $arrayElemAt: ['$bets', 0],
        },
        frequency_of_bets: 1,
      },
    },
    {
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
        frequency_of_bets: sort,
        venueName: 1,
      },
    },
    {
      $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ];
  const response = await BetModel.aggregate(pipeline);
  const { paginatedResults, totalCount } = response[0];
  return {
    data: paginatedResults,
    total_count: totalCount[0] && totalCount[0].count || 0,
  };
};

const searchMostBetsPlacedPerVenue = async (
  text = '.',
  limit,
  page,
  fromDateUTC,
  toDateUTC,
  sort,
  jurisdiction = "",
) => {
  fromDateUTC = fromDateUTC * 1 || 0,
    toDateUTC = toDateUTC * 1 || Date.parse(new Date().toUTCString());
  limit = limit * 1 || 1000;
  page = page * 1 || 1;
  const skip = (page - 1) * limit;
  sort = sort?.toLowerCase() === 'asc' ? 1 : -1;
  let pipeline = [
    {
      $match: {
        venueId: {
          $ne: null,
        },
        venueState: { $regex: new RegExp(jurisdiction, 'i') },
        $or: [
          { venueType: { $regex: new RegExp(text, 'i') } },
          { venueName: { $regex: new RegExp(text, 'i') } }
        ],
        transaction_date_time: {
          $gte: fromDateUTC,
          $lte: toDateUTC,
        },
      },
    },
    {
      $group: {
        _id: '$venueId',
        bets: {
          $push: '$$ROOT',
        },
        frequency_of_bets: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        location: {
          $arrayElemAt: ['$bets', 0],
        },
        frequency_of_bets: 1,
      },
    },
    {
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
        frequency_of_bets: sort,
        venueName: 1,
      },
    },
    {
      $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ];
  const response = await BetModel.aggregate(pipeline);
  const { paginatedResults, totalCount } = response[0];
  return {
    data: paginatedResults,
    total_count: totalCount[0] && totalCount[0].count || 0,
  };
};

const mostAmountSpentPerVenue = async (
  limit,
  page,
  fromDateUTC,
  toDateUTC,
  sort,
  jurisdiction,
) => {
  fromDateUTC = fromDateUTC * 1 || 0,
    toDateUTC = toDateUTC * 1 || Date.parse(new Date().toUTCString());
  limit = limit * 1 || 1000;
  page = page * 1 || 1;
  const skip = (page - 1) * limit;
  sort = sort?.toLowerCase() === 'asc' ? 1 : -1;

  const $match = {
    venueId: {
      $ne: null,
    },
    transaction_date_time: {
      $gte: fromDateUTC,
      $lte: toDateUTC,
    },
  };
  if (jurisdiction && jurisdiction.toLowerCase() !== "all") {
    $match['venueState'] = jurisdiction.toUpperCase();
  }

  let pipeline = [
    { $match },
    {
      $group: {
        _id: '$venueId',
        bets: {
          $push: '$$ROOT',
        },
        frequency_of_total_amount_spent: {
          $sum: '$bet_amount',
        },
      },
    },
    {
      $project: {
        location: {
          $arrayElemAt: ['$bets', 0],
        },
        frequency_of_total_amount_spent: 1,
      },
    },
    {
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
        frequency_of_total_amount_spent: sort,
        venueName: 1,
      },
    },
    {
      $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ];
  const response = await BetModel.aggregate(pipeline);
  const { paginatedResults, totalCount } = response[0];
  return {
    data: paginatedResults,
    total_count: totalCount[0] && totalCount[0].count || 0,
  };
};

const searchMostAmountSpentPerVenue = async (
  text = '.',
  limit,
  page,
  fromDateUTC,
  toDateUTC,
  sort,
  jurisdiction = "",
) => {
  fromDateUTC = fromDateUTC * 1 || 0;
  toDateUTC = toDateUTC * 1 || Date.parse(new Date().toUTCString());
  limit = limit * 1 || 1000;
  page = page * 1 || 1;
  const skip = (page - 1) * limit;
  sort = sort?.toLowerCase() === 'asc' ? 1 : -1;
  let pipeline = [
    {
      $match: {
        venueId: {
          $ne: null,
        },
        venueState: { $regex: new RegExp(jurisdiction, 'i') },
        $or: [
          { venueType: { $regex: new RegExp(text, 'i') } },
          { venueName: { $regex: new RegExp(text, 'i') } }
        ],
        transaction_date_time: {
          $gte: fromDateUTC,
          $lte: toDateUTC,
        },
      },
    },
    {
      $group: {
        _id: '$venueId',
        bets: {
          $push: '$$ROOT',
        },
        frequency_of_total_amount_spent: {
          $sum: '$bet_amount',
        },
      },
    },
    {
      $project: {
        location: {
          $arrayElemAt: ['$bets', 0],
        },
        frequency_of_total_amount_spent: 1,
      },
    },
    {
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
        frequency_of_total_amount_spent: sort,
        venueName: 1,
      },
    },
    {
      $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ];
  const response = await BetModel.aggregate(pipeline);
  const { paginatedResults, totalCount } = response[0];
  return {
    data: paginatedResults,
    total_count: totalCount[0] && totalCount[0].count || 0,
  };
};

module.exports = {
  createBets,
  createBetFromFE,
  getBetsUsingCount,
  getLiveBetsFromRedis,
  getBetsDistribution,
  mostAmountSpentPerVenue,
  mostBetsPlacedPerVenue,
  searchMostAmountSpentPerVenue,
  searchMostBetsPlacedPerVenue
};

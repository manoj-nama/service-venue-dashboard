const venueService = require('../services/venue-info-service');
const userService = require('../services/user-service');
const betStatsService = require('../services/bet-stats-service');

module.exports.dashboard = async (req, res) => {
  const { limit, page, sort, fromDateUTC, toDateUTC, jurisdiction } = req.query;

  const resp = await Promise.all([
    venueService.getActiveVenuesCount(jurisdiction),
    userService.getActiveUsersCount(jurisdiction),
    userService.getMostActiveUser(limit, page, sort, jurisdiction),
    betStatsService.mostBetsPlacedPerVenue(
      limit,
      page,
      fromDateUTC,
      toDateUTC,
      sort,
      jurisdiction,
    ),
    betStatsService.mostAmountSpentPerVenue(
      limit,
      page,
      fromDateUTC,
      toDateUTC,
      sort,
      jurisdiction,
    ),
  ]);

  const [venueCount, userCount, users, bets, amount] = resp;
  return res.json({
    venueCount,
    userCount,
    users,
    bets,
    amount
  });
};

module.exports.search = async (req, res) => {
  const {
    text,
    limit,
    page,
    sort,
    fromDateUTC,
    toDateUTC,
    jurisdiction = "",
    type = "",
  } = req.query;

  let result = {};
  switch (type.toLowerCase()) {
    case "bets": {
      result = await betStatsService.searchMostBetsPlacedPerVenue(
        text,
        limit,
        page,
        fromDateUTC,
        toDateUTC,
        sort,
        jurisdiction,
      );
      break;
    }
    case "amount": {
      result = await betStatsService.searchMostAmountSpentPerVenue(
        text,
        limit,
        page,
        fromDateUTC,
        toDateUTC,
        sort,
        jurisdiction,
      );
      break;
    }
    default: {
      result = await userService.searchMostActiveUser(
        text,
        limit,
        page,
        sort,
        jurisdiction,
      );
    }
  }
  return res.send(200, result);
};
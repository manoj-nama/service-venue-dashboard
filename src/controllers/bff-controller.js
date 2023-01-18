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
const venueService = require('../services/venue-info-service');
const userService = require('../services/user-service');
const betStatsService = require('../services/bet-stats-service');

module.exports.dashboard = async (req, res) => {
  const { limit, page, jusrisdiction } = req.query

  const resp = await Promise.all([
    venueService.getActiveVenuesCount(jusrisdiction),
    userService.getActiveUsersCount(jusrisdiction),
    userService.getMostActiveUser(limit, page, jusrisdiction),
    betStatsService.mostBetsPlacedPerVenue(limit, page, jusrisdiction),
    betStatsService.mostAmountSpentPerVenue(limit, page, jusrisdiction),
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
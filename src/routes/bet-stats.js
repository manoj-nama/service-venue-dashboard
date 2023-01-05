const apiRouter = require('@tabdigital/connect-router');

const betStatsController = require('../controllers/bet-stats-controller');
const betStatsMiddleware = require('../middlewares/bet-stats-middleware');

const router = apiRouter();

router.post({
  path: {
    name: 'bet-stats:create',
    discoveryName: 'bet-stats:create',
    path: '/v1/service-venue/bet-stats-fe',
  },
  handlers: [
    betStatsController.createBet,
  ],
}),

router.get({
  path: {
    name: 'bet-stats:live-bets-ticker',
    discoveryName: 'bet-stats:live-bets-ticker',
    path: '/v1/service-venue/bet-stats/live-bets-ticker',
  },
  handlers: [
    betStatsController.getLiveBets,
  ],
});

router.get({
  path: {
    name: 'bet-stats:big-bets',
    discoveryName: 'bet-stats:big-bets',
    path: '/v1/service-venue/bet-stats/big-bets',
  },
  handlers: [
    betStatsController.getBigBets,
  ],
});

router.get({
  path: {
    name: 'bet-stats:heat-map',
    discoveryName: 'bet-stats:heat-map',
    path: '/v1/service-venue/bet-stats/heat-map',
  },
  handlers: [
    betStatsController.getHeatMapData,
  ],
});

router.get({
  path: {
    name: 'bet-stats:distribution',
    discoveryName: 'bet-stats:distribution',
    path: '/v1/service-venue/bet-stats/distribution',
    query: {
      mandatory: ['jurisdiction', 'longitude', 'latitude'],
      optional: ['radius', 'sort'],
    },
  },
  handlers: [
    betStatsMiddleware.validateParam,
    betStatsController.getBetsDistribution,
  ],
});

router.get({
  path: {
    name: 'bet-stats:match:distribution',
    discoveryName: 'bet-stats:match:distribution',
    path: '/v1/service-venue/bet-stats/sports/:sportName/competitions/:competitionName/matches/:matchName/distribution',
    query: {
      mandatory: ['jurisdiction', 'longitude', 'latitude'],
      optional: ['radius', 'sort'],
    },
  },
  handlers: [
    betStatsMiddleware.validateParam,
    betStatsController.getBetsDistribution,
  ],
});

router.get({
  path: {
    name: 'bet-stats:tournament:match:distribution',
    discoveryName: 'bet-stats:tournament:match:distribution',
    path: '/v1/service-venue/bet-stats/sports/:sportName/competitions/:competitionName/tournaments/:tournamentName/matches/:matchName/distribution',
    query: {
      mandatory: ['jurisdiction', 'longitude', 'latitude'],
      optional: ['radius', 'sort'],
    },
  },
  handlers: [
    betStatsMiddleware.validateParam,
    betStatsController.getBetsDistribution,
  ],
});

router.post({
  path: {
    name: 'add-transactions',
    path: '/v1/service-venue/bet-stats',
  },
  handlers: [betStatsController.addBetDetails],
});

router.get({
  path: {
    name: 'bets-placed-per-venue',
    path: '/v1/service-venue/bet-stats/bets-placed',
  },
  handlers: [betStatsController.mostBetsPlacedPerVenue],
});

router.get({
  path: {
    name: 'amount-spent-per-venue',
    path: '/v1/service-venue/bet-stats/amount-spent',
  },
  handlers: [betStatsController.mostAmountSpentPerVenue],
});

router.get({
  path: {
    name: 'search-most-amount-spent-per-venue',
    path: '/v1/service-venue/bet-stats/amount-spent/search',
  },
  handlers: [betStatsController.searchMostAmountSpentPerVenue],
});

router.get({
  path: {
    name: 'search-most-bets-placed-per-venue',
    path: '/v1/service-venue/bet-stats/bets-placed/search',
  },
  handlers: [betStatsController.searchMostBetsPlacedPerVenue],
});

module.exports = router;

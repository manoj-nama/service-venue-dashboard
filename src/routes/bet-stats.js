const apiRouter = require('@tabdigital/connect-router');

const betStatsController = require('../controllers/bet-stats-controller');

const router = apiRouter();

router.get({
  path: {
    name: 'bet-stats:live-bets-ticker',
    discoveryName: 'bet-stats:live-bets-ticker',
    path: '/v1/service-venue/bet-stats/live-bets-ticker',
  },
  handlers: [
    betStatsController.getLiveBets
  ],
});

router.get({
  path: {
    name: 'bet-stats:big-bets',
    discoveryName: 'bet-stats:big-bets',
    path: '/v1/service-venue/bet-stats/big-bets',
  },
  handlers: [
    betStatsController.getBigBets
  ],
});

router.get({
  path: {
    name: 'bet-stats:heat-map',
    discoveryName: 'bet-stats:heat-map',
    path: '/v1/service-venue/bet-stats/heat-map',
  },
  handlers: [
    betStatsController.getHeatMapData
  ],
});

router.get({
  path: {
    name: 'bet-stats:distribution',
    discoveryName: 'bet-stats:distribution',
    path: '/v1/service-venue/bet-stats/distribution',
    query: {
      mandatory: ['jurisdiction'],
      optional: ['sportId', 'competitionId', 'tournamentId', 'matchId'],
    },
  },
  handlers: [
    betStatsController.getBetsEntireDistribution
  ],
});

module.exports = router;

const apiRouter = require('@tabdigital/connect-router');
const betStatsRoutes = require('./bet-stats');
const discovery = require('../controllers/discovery-controller');
const getActiveVenuesAndUser = require('../controllers/active-venues-controller');
const { createUser,getMostActiveUser } = require('../controllers/user-controller');
const { getVenueInfo } = require('../controllers/venue-info-controller')


// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const router = apiRouter();

  router.get({
    path: {
      name: "discovery",
      path: "/v1/service-venue",
    },
    handlers: [discovery],
  });

router.get({
  path: {
    name: 'getActiveVenuesAndUser',
    path: '/v1/service-venue/active-venues-users',
  },
  handlers: [getActiveVenuesAndUser],
});

router.get({
  path: {
    name: 'getMostActiveUser',
    path: '/v1/service-venue/most-active-users',
  },
  handlers: [getMostActiveUser],
});

  router.post({
    path: {
      name: 'createUser',
      path: '/v1/service-venue/add-users',
    },
    handlers: [createUser],
  });

router.get({
  path: {
    name: 'getVenueInfo',
    path: '/v1/venue-info/:venueId',
  },
  handlers: [getVenueInfo],
});

const mergedRoutes = () => apiRouter.merge(router, betStatsRoutes);

module.exports = mergedRoutes;

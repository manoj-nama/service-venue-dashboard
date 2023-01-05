const apiRouter = require('@tabdigital/connect-router');
const betStatsRoutes = require('./bet-stats');
const discovery = require('../controllers/discovery-controller');
const { getActiveVenuesAndUser } = require('../controllers/venue-info-controller');
const { getVenueInfo } = require('../controllers/venue-info-controller')
const { createUser, getMostActiveUser, searchMostActiveUser } = require('../controllers/user-controller');
const { signupUser, loginUser } = require('../controllers/admin-controller');
const { auth } = require('../middlewares/auth');


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

router.get({
  path: {
    name: 'getMostActiveUser',
    path: '/v1/service-venue/most-active-users/search',
  },
  handlers: [searchMostActiveUser],
});

router.post({
  path: {
    name: 'signupUser',
    path: '/v1/service-venue/signup-user',
  },
  handlers: [signupUser],
})

router.post({
  path: {
    name: 'loginUser',
    path: '/v1/service-venue/login-user',
  },
  handlers: [loginUser],
})

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
    path: '/v1/service-venue/venue-info/:venueId',
  },
  handlers: [getVenueInfo],
});

const mergedRoutes = () => apiRouter.merge(router, betStatsRoutes);

module.exports = mergedRoutes;

const apiRouter = require('@tabdigital/connect-router');

const betStatsRoutes = require('./bet-stats');
const schemas = require('./validation/message-schemas');
const discovery = require('../controllers/discovery-controller');
const getActiveVenuesAndUser = require('../controllers/active-venues-controller');
const { createUser } = require('../controllers/user-controller');

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const router = apiRouter();

  router.get({
    path: {
      name: "discovery",
      path: "/v1/service-venue",
    },
    handlers: [discovery],
  });

  router.post({
    path: {
      name: "scan-document",
      path: "/v1/service-venue/:id",
    },
    validate: {
      body: schemas.SCAN_DOCUMENT_REQ,
      params: schemas.DOCUMENT_TYPE,
    },
    handlers: [],
  });

  router.get({
    path: {
      name: 'getActiveVenuesAndUser',
      path: '/v1/active-venues-users',
    },
    handlers: [getActiveVenuesAndUser],
  });

  router.post({
    path: {
      name: 'createUser',
      path: '/v1/add-users',
    },
    handlers: [createUser],
  });


const mergedRoutes = () => apiRouter.merge(router, betStatsRoutes);

module.exports = mergedRoutes;

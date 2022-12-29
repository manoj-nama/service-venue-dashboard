const apiRouter = require('@tabdigital/connect-router');

const betStatsRoutes = require('./bet-stats');
const schemas = require('./validation/message-schemas');
const discovery = require('../controllers/discovery-controller');

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


const mergedRoutes = () => apiRouter.merge(router, betStatsRoutes);

module.exports = mergedRoutes;

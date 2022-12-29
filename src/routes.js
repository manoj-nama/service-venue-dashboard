const apiRouter = require('@tabdigital/connect-router');

const schemas = require('./validation/message-schemas');
const discovery = require('./controllers/discovery-controller');
const { createUser } = require('./controllers/user-controller');
const { getActiveUsersCount } = require('./controllers/getActiveUsersCount-controller');
const { addBetDetails } = require('./controllers/bets-controller');

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const routes = () => {
  const router = apiRouter();

  router.get({
    path: {
      name: 'discovery',
      path: '/v1/service-venue',
    },
    handlers: [discovery],
  });

  router.post({
    path: {
      name: 'scan-document',
      path: '/v1/service-venue/:id',
    },
    validate: {
      body: schemas.SCAN_DOCUMENT_REQ,
      params: schemas.DOCUMENT_TYPE,
    },
    handlers: [],
  });
  router.post({
    path: {
      name: 'add-transactions',
      path: '/v1/bets',
    },
    handlers: [addBetDetails],
  });
  router.get({
    path: {
      name: 'get-active-users',
      path: '/v1/active-users',
    },
    handlers: [getActiveUsersCount],
  });
  router.post({
    path: {
      name: 'createUser',
      path: '/v1/add-users',
    },
    handlers: [createUser],
  });

  return router;
};

module.exports = routes;

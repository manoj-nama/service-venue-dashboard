// eslint-disable-next-line import/no-extraneous-dependencies
const apiRouter = require('@tabdigital/connect-router');

const schemas = require('./validation/message-schemas');

const discovery = require('./controllers/discovery-controller');
const { createUser } = require('./controllers/user-controller');


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
      name: 'createUser',
      path: '/v1/add-users',
    },
    handlers: [createUser],
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

  return router;
};

module.exports = routes;

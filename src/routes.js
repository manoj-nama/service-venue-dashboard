/* eslint-disable import/no-extraneous-dependencies */
const apiRouter = require('@tabdigital/connect-router');

const schemas = require('./validation/message-schemas');


const getActiveVenues = require('./controllers/active-venues');


const routes = () => {
  const router = apiRouter();


  router.get({
    path: {
      name: 'getActiveVenues',
      path: '/v1/active-venues',
    },
    handlers: [getActiveVenues],
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

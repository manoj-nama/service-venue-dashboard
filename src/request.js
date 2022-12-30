const Promise = require('bluebird');

const { ApiClient, ApiAuthentication } = require('@tabdigital/api-client');

const log = require('./log');
const config = require('./config');

let client;

const getClient = (config) => {
  if (!client) {
    client = new ApiClient({
      authentication: config.identityService.enabled !== true
        ? null
        : new ApiAuthentication(config.identityService.url, {
          clientId: config.identityService.clientId,
          clientSecret: config.identityService.clientSecret,
          grantType: 'client_credentials',
        }),
      defaultRequestOpts: {
        forever: true,
      },
    });
  }
  return client;
};

const get = (url, urlParams, resolveResponse = false) => {
  const cfg = config();
  return Promise.resolve(getClient(cfg).get(url, {
    urlParams,
    resolveResponse,
  }).catch((err) => {
    log.error(err, { failRequest: { url, urlParams } });
    throw err;
  }))
};

module.exports = {
  get,
};

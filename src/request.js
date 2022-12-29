const Promise = require('bluebird');

const { ApiClient, ApiAuthentication } = require('@tabdigital/api-client');

const { log } = require('./log');

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

const get = (url, urlParams, resolveResponse = false) => Promise.resolve(getClient().get(url, {
    urlParams,
    resolveResponse,
  }).catch((err) => {
    log.error(err, { failRequest: { url, urlParams } });
    throw err;
  }));

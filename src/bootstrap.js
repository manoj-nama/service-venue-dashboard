/* eslint-disable @typescript-eslint/no-explicit-any */
const secrets = require('@tabdigital/secrets');
const log = require('./log');
const env = require('./env');
const start = require('./start');

secrets
  .load({
    service: "service-venue-dashbaord",
    env: env,
    skip: ["Dev"],
  })
  .then((response) => {
    log.info(response.message);
    start();
  })
  .catch((e) => {
    log.error(e, "Error getting the secrets");
  });

const jconfig = require('@tabdigital/json-config');
const { configSchema } = require('./schemas');

let cfg = null;
const env = process.env.APP_ENV || 'Dev';
const load = () => {
  cfg = jconfig.load({ path: `configs/${env}/config.json`, schema: configSchema });
};
const get = () => {
  if (!cfg) {
    load();
  }
  return cfg;
};

module.exports = get;
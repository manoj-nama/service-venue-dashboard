const env = process.env.APP_ENV || 'Dev';

process.env.CONFIG_PATH = `configs/${env}/config.json`;
process.env.NEW_RELIC_HOME = `configs/${env}`;

module.exports = env;

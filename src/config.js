const jconfig = require('@tabdigital/json-config');
const s = require('strummer');

const configSchema = new s.objectWithOnly({
  serverPort: new s.number(),
  publicUrl: new s.url(),
  basePath: new s.string(),
  mongoose: {
    url: new s.url(),
    dbName: new s.string(),
  },
  redis: {
    connectionString: new s.string(),
    prefix: new s.string(),
  },
  betStatsScheduler: {
    enabled: new s.boolean(),
    refreshInterval: new s.string(),
    liveBetsCount: new s.number(),
  },
  kafka: {
    brokerList: new s.string(),
    schemaRegistry: new s.string(),
    betsConsumer: {
      topic: new s.string(),
      clientIdPrefix: new s.string(),
      groupId: new s.string(),
      batchSize: new s.number(),
      pollingIntervalInMs: new s.number(),
      commitIntervalInMs: new s.number(),
    },
    venueConsumer: {
      topic: new s.string(),
      clientIdPrefix: new s.string(),
      groupId: new s.string(),
      batchSize: new s.number(),
      pollingIntervalInMs: new s.number(),
      commitIntervalInMs: new s.number(),
    }
  },
});

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

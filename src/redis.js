const redis = require('async-redis');

const log = require('./log');

let redisClient;

const normalizeKey = (key) => {
  let transformedKey;
  if (Array.isArray(key)) {
    transformedKey = key.map((k) => k.toString().toLowerCase());
  } else {
    transformedKey = key.toString().toLowerCase();
  }
  log.trace(`Key Received: ${JSON.stringify(key)}, Transformed to ${JSON.stringify(transformedKey)}`);
  return transformedKey;
};
class Redis {
  constructor(config) {
    const { redis: { prefix, connectionString } } = config;
    this.prefix = prefix;
    this.config = config;
    this.client = redis.createClient(connectionString);
  }

  async get(k) {
    let key;
    let value;
    try {
      key = normalizeKey(k);
      value = await this.client.get(`${this.prefix}${key}`);
      return JSON.parse(value);
    } catch (err) {
      log.error(err, `Error get key: ${key}`);
      return {};
    }
  }

  async set(k, value) {
    let key;
    try {
      key = normalizeKey(k);
      if (value) {
        log.trace(`Setting data in redis for <key>: ${key} <data>: ${JSON.stringify(value)}`);
        const str = JSON.stringify(value);
        await this.client.set(`${this.prefix}${key}`, str);
      } else {
        log.trace(`No value exist to set the data for <key>: ${key}`);
      }
    } catch (err) {
      log.error(err, `Error set key: ${key}, value ${value}`);
    }
  }

  async delete(k) {
    let keys;
    try {
      keys = normalizeKey(k);
      await this.client.del(keys);
    } catch (err) {
      log.error(err, `Error delete keys: ${keys}`);
    }
  }

  async exists(k) {
    let key;
    try {
      key = normalizeKey(k);
      return await this.client.exists(key);
    } catch (err) {
      log.error(err, `Error check exist key: ${key}`);
      return false;
    }
  }
}

const getRedis = () => redisClient;

const setRedis = (client) => { redisClient = client; };

const createRedis = (config) => {
  setRedis(new Redis(config));
};

module.exports = {
  createRedis,
  getRedis,
  setRedis,
};

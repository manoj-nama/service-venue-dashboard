const axios = require('axios');
const redis = require("../src/redis");

const VENUE_LIST_API = 'https://api.congo.beta.tab.com.au/v1/invenue-service/public-venue-list'

const seedVenues = async () => {
  console.log("Seeding venues");
  const redisClient = redis.getRedis();
  let venues = await redisClient.get('venues');
  if (venues.length) {
    console.log("Venues already seeded!");
    return;
  }

  venues = await axios({
    method: 'get',
    url: VENUE_LIST_API,
  });

  await redis.getRedis().set('venues', venues.data);
  console.log("Venues seeded!");
}

module.exports = seedVenues;
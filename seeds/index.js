const user = require('./user');
const seedBets = require('./bets');
const seedVenues = require('./venues');

const seeds = async () => {
	await user();
	await seedBets();
	await seedVenues();
}

module.exports = seeds;

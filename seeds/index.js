const user = require('./user');
const seedBets = require('./bets');

const seeds = async ()=>{
    await user();
    await seedBets();
}

module.exports = seeds;

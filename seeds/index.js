const user = require('./user');
const seedBets = require('./bets');

const seeds = async ()=>{
    await user();
}

module.exports = seeds;

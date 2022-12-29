const user = require('./user');


const seeds = async ()=>{
    await user();
}

module.exports = seeds;

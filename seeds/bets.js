const betData = require('./bet.json');
const { createBets } = require('../src/services/bet-stats');
const betModel = require('../src/models/bet');

const seedBets = async () =>{
    const len = await betModel.find().count();
    if(!len){
        const dataArr = [];
        for(let i=0;i<betData.length;i++){
            dataArr.push(betData[i].value);
        }
        const result = await createBets(dataArr);
        console.log('Added betsDataLength is',result.length);
    }
    else{
        console.log('we already have bets data');
    }
}

module.exports = seedBets;






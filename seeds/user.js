const userData = require('./userData.json');
const { createUser } = require('../src/services/user-service');
const userModel = require('../src/models/users');

const seedUser = async () =>{
    const len = await userModel.find().count();
    if(!len){
        const dataArr = [];
        for(let i=0;i<userData.length;i++){
            dataArr.push(userData[i].value.body);
        }
        const result = await createUser(dataArr);
        console.log('Added datalength is',result.length);
    }
    else{
        console.log('we already have user data');
    }
}

module.exports = seedUser;









const regex = require('strummer/lib/matchers/regex');
const UserModel = require('../models/users');
const { inputUserVenueFormatter } = require('./formatter/user-venue');

module.exports.getActiveUsersCount = async () => {
  const activeUsers = await UserModel.find({ currentState: 1 }).count();
  return activeUsers;
};

module.exports.createUser = async (userData) => {
  const formattedUsersData = inputUserVenueFormatter(userData);
  const promises = [];
  for (let i = 0; i < formattedUsersData.length; i++) {
    const promise = await makeUser(formattedUsersData[i]);
    promises.push(promise);
  }
  const result = await Promise.all(promises);
  return result;
};

const makeUser = async (userData) => {
    const userExist = await UserModel.findOne(
        { accountNumber: userData.accountNumber },
      );
      if (!userExist) {
        const user = new UserModel(userData);
        const data = await user.save();
        return data;
      }
    
      const updatedUser = await UserModel.updateOne({ accountNumber: userData.accountNumber },
        {
          $set:
            userData,
        }, { new: true });
    
      return updatedUser;
}

module.exports.getMostActiveUser = async (limit,skip,searchText) => {
  
  const ActiveUserInVenue = await UserModel.aggregate([
      {
        '$match': {
          'currentState': 1,
        }
      }, {
        '$group': {
          '_id': '$venueId', 
          'venues': {
            '$push': '$$ROOT'
          }, 
          'active_users': {
            '$sum': 1
          }
        }
      }, {
        '$project': {
          '_id': 0, 
          'active_users': 1, 
          'location': {
            '$arrayElemAt': [
              '$venues', 0
            ]
          }
        }
      }, {
        '$project': {
          'venueId': '$location.venueId', 
          'active_users': 1, 
          'venueName': '$location.venueName', 
          'venueType': '$location.venueType', 
          'venueState': '$location.venueState'
        }
      }, {
        '$sort': {
          'active_users': -1, 
          'venueName': 1
        }
      },
      {
        $skip:skip
      },
      {
        $limit:limit
      }
    ]);

  return ActiveUserInVenue;
}



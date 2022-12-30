const UserModel = require('../models/users');

module.exports.getMostActiveUser = async (limit) => {

    const ActiveUserInVenue = await UserModel.aggregate([
        {
          '$match': {
            'currentState': 1
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
            '$limit': limit
        }
      ]);

    return ActiveUserInVenue;
}
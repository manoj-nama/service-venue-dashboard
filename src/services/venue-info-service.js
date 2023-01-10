const { BetModel } = require('../models');
const redis = require("../redis");

module.exports.getActiveVenuesCount = async (jurisdiction) => {
  const venues = await redis.getRedis().get('venues');
  if (jurisdiction && jurisdiction.toLowerCase() !== "all") {
    return venues.filter(it => (
      it.status === 'Active' &&
      it.jurisdiction === jurisdiction.toUpperCase()
    )).length;
  }
  return venues.filter(it => (it.status === 'Active')).length;
};

module.exports.getVenueInfo = async (venueId) => {
 const venueInfo = await BetModel.aggregate([
  {
   '$match': {
    'venueId': venueId
   }
  }, {
   '$facet': {
    'activeUsers': [
     {
      '$group': {
       '_id': '$account_number'
      }
     }, {
      '$count': 'active_users'
     }
    ],
    'venueInfo': [
     {
      '$project': {
       '_id': {
        '$toString': '$_id'
       },
       'account_number': 1,
       'bet_type': 1,
       'transaction_date_time': 1,
       'venueName': 1,
       'venueType': 1,
       'venueState': 1,
       'longitude': {
        '$arrayElemAt': [
         '$location.coordinates', 0
        ]
       },
       'latitude': {
        '$arrayElemAt': [
         '$location.coordinates', 1
        ]
       }
      }
     }, {
      '$lookup': {
       'from': 'propositions',
       'let': {
        'id': '$_id'
       },
       'pipeline': [
        {
         '$project': {
          'bet': {
           '$toString': '$bet'
          },
          'sport_name': 1,
          'tournament_name': {
           '$toString': '$tournament_name'
          },
          'price': 1
         }
        }, {
         '$match': {
          '$expr': {
           '$eq': [
            '$$id', '$bet'
           ]
          }
         }
        }
       ],
       'as': 'propositions'
      }
     }, {
      '$unwind': {
       'path': '$propositions'
      }
     }, {
      '$project': {
       'sport_name': '$propositions.sport_name',
       'tournament_name': '$propositions.tournament_name',
       '_id': 0,
       'account_number': 1,
       'bet_amount': '$propositions.price',
       'bet_type': 1,
       'bet_date_and_time': '$transaction_date_time',
       'venueName': 1,
       'venueType': 1,
       'venueState': 1,
       'latitude': 1,
       'longitude': 1,
       'active_users': 1
      }
     }, {
      '$sort': {
       'account_number': 1
      }
     }
    ]
   }
  }
 ]);
  return venueInfo;
};

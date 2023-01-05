const axios = require('axios');

const { BetModel } = require('../models');

const VENUE_LIST_API = 'https://api.congo.beta.tab.com.au/v1/invenue-service/public-venue-list';

module.exports.getActiveVenuesCount = async () => {
  const activeVenudata = await axios({
    method: 'get',
    url: VENUE_LIST_API,
  });

  const activeVenueArr = activeVenudata.data;
  return activeVenueArr.reduce((count, venue) => count + (venue.status === 'Active' ? 1 : 0), 0);
};

module.exports.getVenueInfo = async (venueId) => {
  const venueInfo = await BetModel.aggregate([
    {
      $match: {
        venueId: {
          $eq: venueId,
        },
      },
    }, {
      $group: {
        _id: '$account_number',
        venues: {
          $push: '$$ROOT',
        },
        active_users: {
          $sum: 1,
        },
      },
    }, {
      $unwind: {
        path: '$venues',
      },
    }, {
      $project: {
        _id: {
          $toString: '$venues._id',
        },
        active_users: 1,
        account_number: '$venues.account_number',
        bet_type: '$venues.bet_type',
        transaction_date_time: '$venues.transaction_date_time',
        venueName: '$venues.venueName',
        venueType: '$venues.venueType',
        venueState: '$venues.venueState',
        longitude: {
          $arrayElemAt: [
            '$venues.location.coordinates', 0,
          ],
        },
        latitude: {
          $arrayElemAt: [
            '$venues.location.coordinates', 1,
          ],
        },
      },
    }, {
      $lookup: {
        from: 'propositions',
        let: {
          id: '$_id',
        },
        pipeline: [
          {
            $project: {
              bet: {
                $toString: '$bet',
              },
              sport_name: 1,
              tournament_name: {
                $toString: '$tournament_name',
              },
              price: 1,
            },
          }, {
            $match: {
              $expr: {
                $eq: [
                  '$$id', '$bet',
                ],
              },
            },
          },
        ],
        as: 'propositions',
      },
    }, {
      $unwind: {
        path: '$propositions',
      },
    }, {
      $project: {
        sport_name: '$propositions.sport_name',
        tournament_name: '$propositions.tournament_name',
        _id: 0,
        account_number: 1,
        bet_amount: '$propositions.price',
        bet_type: 1,
        bet_date_and_time: '$transaction_date_time',
        venueName: 1,
        venueType: 1,
        venueState: 1,
        latitude: 1,
        longitude: 1,
        active_users: 1,
      },
    }, {
      $sort: {
        account_number: 1,
      },
    },
  ]);
  return venueInfo;
};

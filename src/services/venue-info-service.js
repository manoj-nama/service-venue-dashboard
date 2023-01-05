const { BetModel } = require('../models');
const axios = require('axios');

const VENUE_LIST_API = 'https://api.congo.beta.tab.com.au/v1/invenue-service/public-venue-list'

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
      $project: {
        _id: {
          $toString: '$_id',
        },
        account_number: 1,
        bet_amount: 1,
        bet_type: 1,
        transaction_date_time: 1,
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
        bet_amount: 1,
        bet_type: 1,
        bet_date_and_time: '$transaction_date_time',
      },
    },
    {
      $sort: {
        account_number: 1,
      },
    },
  ]);
  return venueInfo;
};

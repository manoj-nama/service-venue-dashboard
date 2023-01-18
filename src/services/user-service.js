const UserModel = require('../models/users');
const { inputUserVenueFormatter } = require('./formatter/user-venue');

module.exports.getActiveUsersCount = async (jurisdiction) => {
  const params = { currentState: 1 };
  if (jurisdiction && jurisdiction.toLowerCase() !== "all") {
    params['venueState'] = jurisdiction.toUpperCase();
  }
  return await UserModel.find(params).count();
};

module.exports.createUser = async (userData) => {
  const formattedUsersData = inputUserVenueFormatter(userData);
  const promises = [];
  for (let i = 0; i < formattedUsersData.length; i++) {
    const promise = await makeUser(formattedUsersData[i]);
    promises.push(promise);
  }
  return await Promise.all(promises);
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
    { $set: userData }, { new: true });

  return updatedUser;
};

module.exports.getMostActiveUser = async (limit, page, sort, jurisdiction) => {
  limit = limit * 1 || 1000;
  page = page * 1 || 1;
  const skip = (page - 1) * limit;
  sort = sort?.toLowerCase() === 'asc' ? 1 : -1;
  try {
    const $match = { currentState: 1 };
    if (jurisdiction && jurisdiction.toLowerCase() !== "all") {
      $match['venueState'] = jurisdiction.toUpperCase();
    }
    const ActiveUserInVenue = await UserModel.aggregate([
      { $match },
      {
        $group: {
          _id: '$venueId',
          venues: {
            $push: '$$ROOT',
          },
          active_users: {
            $sum: 1,
          },
        },
      }, {
        $project: {
          _id: 0,
          active_users: 1,
          location: {
            $arrayElemAt: [
              '$venues', 0,
            ],
          },
        },
      }, {
        $project: {
          venueId: '$location.venueId',
          active_users: 1,
          venueName: '$location.venueName',
          venueType: '$location.venueType',
          venueState: '$location.venueState',
        },
      }, {
        $sort: {
          active_users: sort,
          venueName: 1,
        },
      },
      {
        $facet: {
          paginatedResults: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ]);

    const { paginatedResults, totalCount } = ActiveUserInVenue[0];
    return {
      data: paginatedResults,
      totalCount: totalCount[0] && totalCount[0].count || 0,
    };
  } catch (err) {
    console.log(err);
  }
};

module.exports.searchMostActiveUser = async (text = '.', limit, page, sort) => {
  limit = limit * 1 || 1000;
  page = page * 1 || 1;
  const skip = (page - 1) * limit;
  sort = sort?.toLowerCase() === 'asc' ? 1 : -1;
  const ActiveUserInVenue = await UserModel.aggregate([
    {
      $match: {
        currentState: 1,
        $or: [{ venueType: { $regex: new RegExp(text, 'i') } },
        { venueState: { $regex: new RegExp(text, 'i') } },
        { venueName: { $regex: new RegExp(text, 'i') } }],
      }
    }, {
      $group: {
        _id: '$venueId',
        venues: {
          $push: '$$ROOT',
        },
        active_users: {
          $sum: 1,
        },
      },
    }, {
      $project: {
        _id: 0,
        active_users: 1,
        location: {
          $arrayElemAt: [
            '$venues', 0,
          ],
        },
      },
    }, {
      $project: {
        venueId: '$location.venueId',
        active_users: 1,
        venueName: '$location.venueName',
        venueType: '$location.venueType',
        venueState: '$location.venueState',
      },
    }, {
      $sort: {
        active_users: sort,
        venueName: 1,
      },
    },
    {
      $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ]);

  const { paginatedResults, totalCount } = ActiveUserInVenue[0];
  return {
    data: paginatedResults,
    totalCount: totalCount[0] && totalCount[0].count || 0,
  };
};


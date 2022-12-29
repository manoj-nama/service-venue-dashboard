const UserModel = require('../models/user.model');

module.exports.getActiveUsers = async () => {
  const activeUsers = UserModel.find({ currentState: 1 });
  return activeUsers;
};

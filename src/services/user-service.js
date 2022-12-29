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
const UserModel = require('../models/user.model');

module.exports.createUser = async (userData) => {
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
};
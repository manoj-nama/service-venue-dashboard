const { getActiveUsers } = require('../services/getActiveUsers-service')

module.exports.getActiveUsersCount = async (req, res) => {
  try {
    const activeUsers = await getActiveUsers();
    const activeUsersCount = activeUsers.length;
    res.send(200, { activeUsersCount });
  } catch (error) {
    console.log(' Error : ', error);
  }
};

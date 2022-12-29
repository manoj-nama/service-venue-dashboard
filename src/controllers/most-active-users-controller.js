const mostActiveUsers = require('../services/mostActiveUsers');

const getMostActiveUser = async (req, res) => {
    const data = await mostActiveUsers.getMostActiveUser();
    return res.send(200, { active_users: data });
  };
  
  module.exports = getMostActiveUser;
  
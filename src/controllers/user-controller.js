const { createUser } = require('../services/user-service');
const mostActiveUsers = require('../services/mostActiveUsers');

module.exports.createUser = async (req, res) => {
  try {
    const { userData } = req.body;
    
    if (!userData) {
      res.send(400, { message: 'Required data is missing.' });
      return;
    }
    const result = await createUser(userData);
    res.send(201, { message: 'Successful', data: result });
  } catch (error) {
    console.log(' Error : ', error);
  }
};

module.exports.getMostActiveUser = async (req, res) => {
  const limit = +req.query.limit||1000;
  const data = await mostActiveUsers.getMostActiveUser(limit);
  return res.send(200, { active_users: data });
};



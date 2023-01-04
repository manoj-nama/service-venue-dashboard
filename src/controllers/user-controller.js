const { createUser, getMostActiveUser, searchMostActiveUser } = require('../services/user-service');


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
  const page = +req.query.page||1;
  const skip = (page - 1)*limit;
  const data = await getMostActiveUser(limit, skip);
  return res.send(200, { active_users: data });
};

module.exports.searchMostActiveUser = async (req, res) => {
 const { text } = req.query;
  const result = await searchMostActiveUser(text);
  return res.send(200, { data: result });
};
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
    throw error
  }
};

module.exports.getMostActiveUser = async (req, res) => {
  try {
    const { limit, page } = req.query
    const data = await getMostActiveUser(limit, page);
    return res.send(200, { active_users: data });
  } catch (err) {
    throw err
  }
};

module.exports.searchMostActiveUser = async (req, res) => {
  try {
    const { text } = req.query;
    const result = await searchMostActiveUser(text);
    return res.send(200, { data: result });
  } catch (err) {
    throw err
  }
};

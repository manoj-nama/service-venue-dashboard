const { createUser } = require('../services/user-service');

module.exports.createUser = async (req, res) => {
  try {
    const { userData } = req.body;
    const promises = [];
    if (!userData) {
      res.send(400, { message: 'Required data is missing.' });
      return;
    }
    for (let i = 0; i < userData.length; i++) {
      const promise = await createUser(userData[i]);
      promises.push(promise);
    }
    const result = await Promise.all(promises);
    res.send(201, { message: 'Successful', data: result });
  } catch (error) {
    console.log(' Error : ', error);
  }
};
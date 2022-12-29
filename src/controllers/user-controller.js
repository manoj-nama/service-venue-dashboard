const { createUser } = require('../services/user-service');

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
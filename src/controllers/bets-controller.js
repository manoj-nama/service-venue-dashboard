/* eslint-disable no-await-in-loop */
const addBetDetails = require('../services/bets-service');

module.exports.addBetDetails = async (req, res) => {
  try {
    let i = 0;
    const promises = [];
    const { betDetails } = req.body;
    if (!betDetails) {
      res.send(400, 'payload is required');
      return;
    }
    while (i < betDetails.length) { const promise = await addBetDetails(betDetails[i]); i += 1; promises.push(promise); }
    const result = await Promise.all(promises);
    res.send(201, { message: 'Success', data: result });
  } catch (error) {
    console.log(' Error : ', error);
    res.send(400, error);
  }
};

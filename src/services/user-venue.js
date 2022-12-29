const { UserVenueModel } = require('../models');
const { inputUserVenueFormatter } = require('./formatter/user-venue');

const createUserVenues = async (userVenues) => {
	const formattedUserVenueInput = inputUserVenueFormatter(userVenues);
	const response = await UserVenueModel.insertMany(formattedUserVenueInput);
};

module.exports = {
    createUserVenues,
};


const userData = require('./userData.json');
const { createUser } = require('../src/services/user-service');
const userModel = require('../src/models/users');

const seedUser = async () => {
	const len = await userModel.find().count();
	if (!len) {
		const result = await createUser(userData);
		console.log('Added datalength is', result.length);
	}
	else {
		console.log('we already have user data');
	}
}

module.exports = seedUser;

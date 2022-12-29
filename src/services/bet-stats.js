const { BetModel,UserModel } = require('../models')
const redis = require('../redis');
const {
	liveBetsFormatter,
	inputBetsFormatter,
	formatBetDistribution,
} = require('./formatter/bet-stats');

 const makeBet = async (bet) => {
	const userInfo = await UserModel.findOne({ accountNumber: bet.account_number });
	if (userInfo) {
		bet.venueId = userInfo.venueId;
		bet.venueName = userInfo.venueName;
		bet.venueType = userInfo.venueType;
		bet.venueState = userInfo.venueState;
		bet.location = userInfo.location
	}
	const betDetail = new BetModel(bet);
	return betDetail.save();
};

const createBets = async (betDetails) => {
	// const formattedBetsInput = inputBetsFormatter(bets);
	let i = 0;
	const promises = [];
	while (i < betDetails.length) { const promise = await makeBet(betDetails[i]); i += 1; promises.push(promise); }
	const result = await Promise.all(promises);
	return result
};

const getBetsUsingCount = async (count) => {
	const bets = BetModel.find().limit(count);
	return bets;
};

const getLiveBetsFromRedis = async () => {
	const liveBets = await redis.getRedis().get('live-bets');
	return liveBetsFormatter(liveBets);
};

const getBigBets = async () => {
	return [];
};

const getHeatMapData = async () => {
	return [];
};

const getEntireDistribution = async () => {
	const liveBets = await getLiveBetsFromRedis();
	const bigBets = await getBigBets();
	const heatMap = await getHeatMapData();
	const response = formatBetDistribution({
		liveBets,
		bigBets,
		heatMap
	});
	return response;
};

module.exports = {
	createBets,
	getBetsUsingCount,
	getLiveBetsFromRedis,
	getEntireDistribution,
}

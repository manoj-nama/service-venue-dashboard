const { BetModel } = require('../models')
const redis = require('../redis');
const {
	liveBetsFormatter,
	inputBetsFormatter,
	formatBetDistribution,
} = require('./formatter/bet-stats');

const createBets = async (bets) => {
	const formattedBetsInput = inputBetsFormatter(bets);
	const response = await BetModel.insertMany(formattedBetsInput);
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

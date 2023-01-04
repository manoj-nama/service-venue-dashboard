const liveBetsFormatter = ({
	bets, count
}) => {
	const formattedData = bets.map(b => (
		{
			betType: b.bet_type,
			betAmount: b.bet_amount,
			betDetails: {
				sportName: b.sport_name,
				competitionName: b.competition_name,
				tournamentName: b.tournament_name,
				matchName: b.match_name,
				matchStartTime: b.match_start_time,
				marketName: b.market_name,
				betOption: b.bet_option,
				proposition: { ...b.proposition, ...{ id: b.proposition.id.toString() } },
				icon: {
					imageUrl: (b.contestants.find(i => b.proposition.name.match(i.name)) || {}).image,
					hexCode: 'E92912'
				}
			}
		}
	)).splice(0, count);
	return formattedData;
};

const heatMapFormatter = (bets) => {
	let formattedData;
	formattedData = bets.reduce((acc, currBet) => {
		const key = `${currBet?._doc?.sport_name}:${currBet?._doc?.competition_name}:${currBet?._doc?.match_name}`;
		if (acc[key] && currBet?._doc?.bet) {
			acc[key]['coordinates'].push({
				longitude: currBet?._doc?.bet?.location?.coordinates[0],
				latitude: currBet?._doc?.bet?.location?.coordinates[1]
			});
		} else {
			acc[key] = {
				sportName: currBet?._doc?.sport_name,
				matchName: currBet?._doc?.match_name,
				marketName: currBet?._doc?.market_name,
				coordinates: currBet?._doc?.bet ? [{
					longitude: currBet?._doc?.bet?.location?.coordinates[0],
					latitude: currBet?._doc?.bet?.location?.coordinates[1]
				}] : [],
			}
		}
		return acc;
	}, {});
	return Object.values(formattedData);
};

const versusMapFormatter = (versusData = {}) => {
	let { response: teamInfo, sportName, matchName, competitionName } = versusData
	const DEFAULT_HEX_CODES = ['#24C4F0', '#E92912'];

	teamInfo = (teamInfo || []).map((item, i) => {
		item.coordinates = item.props.map(prop => ({ longitude: prop.location.coordinates[0], latitude: prop.location.coordinates[1] }));
		delete item.props;
		item.icon.hexCode = DEFAULT_HEX_CODES[Math.round(Math.random())];
		return item;
	});
	const formattedData = {
		sportName, matchName, competitionName,
		teams: teamInfo
	}
	return formattedData;
};
// Formatting bets for bulk insertion
const inputBetsFormatter = (bets) => {
	let formattedData = [];
	bets.map(b => {
		b.propositions.map(p => {
			formattedData.push({
				transaction_date_time: Date.parse(new Date(toString(b.transaction_date_time)).toUTCString()),
				proposition_id: p.prop_id,
				bet_description: p.description?.string,
				competition_id: b.competition?.int,
				tournament_id: b.tournament?.int,
				sport: b.sport?.string,
				match: b.match?.string,
				bet_amount: b.bet_amount,
				tx_type: b.tx_type,
				account_number: b.account_number
			})
		})
	});
	return formattedData;
};

const bigBetsFormatter = (bets) => {
	const formattedResponse = bets.map(b => ({
		count: b.count,
		sportName: b.sport_name,
		matchName: b.match_name,
		matchStartTime: b.match_start_time,
		marketName: b.market_name,
		marketUniqueId: b.market_unique_id,
		competitionName: b.competition_name,
		tournamentName: b.tournament_name,
		// TODO: Add discovery key and navigation to redirect to market screen
	}));
	return formattedResponse;
};

const formatBetDistribution = ({
	liveBets,
	bigBets,
	heatMap,
	versusMap
}) => {
	const formattedResponse = {
		type: "app.bets.distribution",
		data: [
			{
				type: "app.bets.distribution.liveBets",
				data: liveBets
			},
			{
				type: "app.bets.distribution.bigBets",
				data: bigBets
			},
			{
				type: "app.bets.distribution.heatMap",
				data: heatMap
			},
			...(
				versusMap && versusMap.length ? [{
					type: 'app.bets.distribution.versusMap',
					data: versusMap,
				}] : []
			)
		]
	};
	return formattedResponse;
};

module.exports = {
	liveBetsFormatter,
	inputBetsFormatter,
	formatBetDistribution,
	heatMapFormatter,
	bigBetsFormatter,
	versusMapFormatter
};

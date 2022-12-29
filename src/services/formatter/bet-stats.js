const liveBetsFormatter = (bets) => {
	const formattedData = bets.map(b => (
		{
			betType: "sport",
			betAmount: b.bet_amount,
			startTime: "",
			betDetails: {
				sportName: b.sport,
				competitionName: "",
				tournamentName: null,
				matchName: b.match,
				marketName: ""
			}
		}
	));
	return formattedData;
};

// Formatting bets for bulk insertion
const inputBetsFormatter = (bets) => {
	let formattedData = [];
	bets.map(b => {
		b.propositions.map(p => {
			formattedData.push({
				transaction_date_time: toString(b.transaction_date_time),
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

const formatBetDistribution = ({
	liveBets,
	bigBets,
	heatMap
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
		]
	};
	return formattedResponse;
};

module.exports = {
	liveBetsFormatter,
	inputBetsFormatter,
	formatBetDistribution,
};
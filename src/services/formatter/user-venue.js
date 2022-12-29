const inputUserVenueFormatter = (userVenues) => {
	const formattedInput = userVenues.map(v => ({
		customer_number: 1,
		account_number: 1,
		// timestamp: toString(v.body?.timestamp),
		event: v.body?.event,
		current_state: v.body?.currentState,
		// venue_id: v.body?.venueId,
		// venue_name: v.body?.venueName,
		// venue_state: v.body?.venueType,
		// venue_type: v.body?.venueState,
		location: {
			type: "Point",
			coordinates: [
				1, 2
			]
		},
		// geo_uncertainty: v.body?.geoUncertainty
	}));
	console.log(formattedInput, '>>>>>>>>>')
	return formattedInput;
};

module.exports = {
	inputUserVenueFormatter
}

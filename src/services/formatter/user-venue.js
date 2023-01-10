const inputUserVenueFormatter = (userVenues) => {
	const formattedInput = userVenues.map(({value:v}) => ({
	    ...v.body,
		venueId: v.body.venueId?.double || v.body.venueId,
        venueName: v.body.venueName?.string || v.body.venueName,
        venueType: v.body.venueType?.string || v.body.venueType,
        venueState: v.body.venueState?.string || v.body.venueState,
		location: {
			type: "Point",
			coordinates: [
				v.body.longitude, v.body.latitude
			]
		},
	}));
	return formattedInput;
};

module.exports = {
	inputUserVenueFormatter
}

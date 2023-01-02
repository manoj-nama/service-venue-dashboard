const inputUserVenueFormatter = (userVenues) => {
	const formattedInput = userVenues.map(v => ({
	    ...v.body,
		venueId: v.body.venueId?.double,
        venueName: v.body.venueName?.string,
        venueType: v.body.venueType?.string,
        venueState: v.body.venueState?.string,
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

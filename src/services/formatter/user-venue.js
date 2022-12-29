const inputUserVenueFormatter = (userVenues) => {
	const formattedInput = userVenues.map(v => ({
	    ...v,
		"venueId": v.venueId?.double,
        "venueName": v.venueName?.string,
        "venueType": v.venueType?.string,
        "venueState": v.venueState?.string,
		location: {
			type: "Point",
			coordinates: [
				v.longitude,v.latitude
			]
		},
	}));
	return formattedInput;
};

module.exports = {
	inputUserVenueFormatter
}

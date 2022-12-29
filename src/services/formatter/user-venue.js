const inputUserVenueFormatter = (userVenues) => {
	const formattedInput = userVenues.map(v => ({
	    ...v,
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

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const userVenueSchema = new Schema(
    {
      customer_number: {
        value: Number
      },
      account_number: {
        value: Number
      },
			// timestamp: Long,
			event: Number,
			current_state: Number,
			venue_id: Number,
			venue_name: String,
			venue_type: String,
			venue_state: Number,
			location: {
				type: pointSchema,
				required: true
			},
      updatedAt: {
        type: Date,
        default: null
      },
      geo_uncertainty: Number
});


const UserVenueModel = mongoose.model('UserVenue', userVenueSchema);

module.exports = UserVenueModel;

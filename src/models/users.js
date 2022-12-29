const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
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

const userSchema = new mongoose.Schema(
  {
    accountNumber: { type: Schema.Types.Long, required: true },
    customerNumber: { type: Schema.Types.Long, required: true },
    timestamp: { type: Number, required: true },
    event: { type: Number },
    currentState: { type: Number },
    venueId: { default: null, type: Schema.Types.Mixed },
    venueName: { default: null, type: Schema.Types.Mixed },
    venueType: { default: null, type: Schema.Types.Mixed },
    venueState: { default: null, type: Schema.Types.Mixed },
    location: {
      type: pointSchema,
      required: true
    },
    geoUncertainty: { type: Number },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);

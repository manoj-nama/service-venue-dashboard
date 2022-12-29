const mongoose = require('mongoose');
require('mongoose-long')(mongoose);

const userSchema = new mongoose.Schema(
  {
    accountNumber: { type: Number, required: true },
    customerNumber: { type: Number, required: true },
    timestamps: { type: Number, required: true },
    event: { type: Number, required: true },
    currentState: { type: Number, required: true },
    venueId: { default: null, type: Number },
    venueName: { default: null, type: String },
    venueType: { default: null, type: String },
    venueState: { default: null, type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    geoUncertainty: { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('UserData', userSchema);

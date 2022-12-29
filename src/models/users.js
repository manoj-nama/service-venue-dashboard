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
    accountNumber: { type: Number, required: true },
    customerNumber: { type: Number, required: true },
    timestamp: { type: Number, required: true },
    event: { type: Number },
    currentState: { type: Number },
    venueId: { default: null, type: Number },
    venueName: { default: null, type: String },
    venueType: { default: null, type: String },
    venueState: { default: null, type: String },
    location: {
      type: pointSchema,
      required: true
    },
    geoUncertainty: { type: Number },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);

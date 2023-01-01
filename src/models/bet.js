const mongoose = require('mongoose');
require('mongoose-long')(mongoose);

const SchemaTypes = mongoose.Schema.Types;

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

const betSchema = mongoose.Schema({
  transaction_date_time: {
    type: SchemaTypes.Long,
    required: true,
  },
  account_number: {
    type: SchemaTypes.Long,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: pointSchema,
    default: null
  },
  venueId: { type: Number, default: null },
  venueName: { type: String, default: null },
  venueType: { type: String, default: null },
  venueState: { type: String, default: null },
  event_date: Number,
  community: String,
  customer_session_number: Number,
  tx_type: String,
  currency: String,
  customer_number: Number,
  bet_amount: String,
  total_cost: String,
  // price: SchemaTypes.Mixed,
  bet_type: String,
  number_of_legs: Number,
  prop_type: String,
  propositions: [{ id: String, price: Number }],
  description: SchemaTypes.Mixed
});

betSchema.index({ location: '2dsphere' });

const Bets = mongoose.model('Bet', betSchema);
module.exports = Bets;

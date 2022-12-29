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
  original_bet_date_time: {
    type: SchemaTypes.Long,
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
    required: true,
    default: null
  },
  venueId: { type: Number, default: null },
  venueName: { type: String, default: null },
  venueType: { type: String, default: null },
  venueState: { type: String, default: null },
  event_date: Number,
  betstream_id: String,
  transaction_group: Number,
  version_number: Number,
  business_date: Number,
  hub: String,
  community: String,
  source: String,
  branch: String,
  window: Number,
  teller_number: Number,
  customer_session_number: Number,
  tx_type: String,
  serial_number: String,
  guest_id: String,
  retail_outlet_name: String,
  currency: String,
  outlet_number: Number,
  customer_number: Number,
  loyalty_number: Number,
  bet_amount: String,
  bet_liability: String,
  total_cost: String,
  surcharge: String,
  base_win_value: String,
  base_place_value: String,
  bet_type: String,
  number_of_legs: Number,
  bundle_number: mongoose.Mixed,
  prop_type: String,
  bundle_price: mongoose.Mixed,
  prop_id: String,
  start_combo_parlay: mongoose.Mixed,
  combo_base_value: mongoose.Mixed,
  win_place_combo_payout: mongoose.Mixed,
  description: mongoose.Mixed,
  runner_number: mongoose.Mixed,
  future_id: mongoose.Mixed,
  future_description: mongoose.Mixed,
  future_live_status: mongoose.Mixed,
  future_bet_type: mongoose.Mixed,
  sport: mongoose.Mixed,
  sport_name: mongoose.Mixed,
  match: mongoose.Mixed,
  match_name: mongoose.Mixed,
  match_time: mongoose.Mixed,
  competition: mongoose.Mixed,
  competition_name: mongoose.Mixed,
  tournament: mongoose.Mixed,
  tournament_name: mongoose.Mixed,
  formula_string: mongoose.Mixed,
  flexi_percent: mongoose.Mixed,
  combinations: mongoose.Mixed,
  reject_code: mongoose.Mixed,
  reject_message: mongoose.Mixed,
  risk_rating: mongoose.Mixed,
  promo_string: mongoose.Mixed,
});
const Bets = mongoose.model('Bet', betSchema);
module.exports = Bets;
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
    type: SchemaTypes.Long,
    required: true,
  },
  location: {
    type: pointSchema,
    default: null
  },
  venueId: { type: SchemaTypes.Long, default: null },
  venueName: { type: String, default: null },
  venueType: { type: String, default: null },
  venueState: { type: String, default: null },
  event_date: SchemaTypes.Long,
  betstream_id: SchemaTypes.Mixed,
  transaction_group: SchemaTypes.Long,
  version_number: SchemaTypes.Long,
  business_date: SchemaTypes.Long,
  hub: String,
  community: String,
  source: String,
  branch: String,
  window: SchemaTypes.Long,
  teller_number: SchemaTypes.Mixed,
  customer_session_number: SchemaTypes.Mixed,
  tx_type: String,
  serial_number: SchemaTypes.Mixed,
  guest_id: SchemaTypes.Mixed,
  retail_outlet_name: SchemaTypes.Mixed,
  currency: String,
  outlet_number: SchemaTypes.Long,
  customer_number: SchemaTypes.Long,
  loyalty_number: SchemaTypes.Long,
  bet_amount: SchemaTypes.Mixed,
  bet_liability: SchemaTypes.Mixed,
  total_cost: SchemaTypes.Mixed,
  surcharge: String,
  base_win_value: SchemaTypes.Mixed,
  base_place_value: SchemaTypes.Mixed,
  bet_type: String,
  number_of_legs: SchemaTypes.Long,
  bundle_number: SchemaTypes.Mixed,
  prop_type: String,
  bundle_price: SchemaTypes.Mixed,
  prop_id: String,
  start_combo_parlay: SchemaTypes.Mixed,
  combo_base_value: SchemaTypes.Mixed,
  win_place_combo_payout: SchemaTypes.Mixed,
  description: SchemaTypes.Mixed,
  runner_number: SchemaTypes.Mixed,
  future_id: SchemaTypes.Mixed,
  future_description: SchemaTypes.Mixed,
  future_live_status: SchemaTypes.Mixed,
  future_bet_type: SchemaTypes.Mixed,
  sport: SchemaTypes.Mixed,
  sport_name: SchemaTypes.Mixed,
  match: SchemaTypes.Mixed,
  match_name: SchemaTypes.Mixed,
  match_time: SchemaTypes.Mixed,
  competition: SchemaTypes.Mixed,
  competition_name: SchemaTypes.Mixed,
  tournament: SchemaTypes.Mixed,
  tournament_name: SchemaTypes.Mixed,
  formula_string: SchemaTypes.Mixed,
  flexi_percent: SchemaTypes.Mixed,
  combinations: SchemaTypes.Mixed,
  reject_code: SchemaTypes.Mixed,
  reject_message: SchemaTypes.Mixed,
  risk_rating: SchemaTypes.Mixed,
  promo_string: SchemaTypes.Mixed,
});
const Bets = mongoose.model('Bet', betSchema);
module.exports = Bets;
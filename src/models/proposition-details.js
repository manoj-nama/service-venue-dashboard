const mongoose = require('mongoose');

const { Schema } = mongoose;
const SchemaTypes = mongoose.Schema.Types;

const propositionSchema = new mongoose.Schema(
  {
    bet_type: String,
    bet_option: String,
    market_name: String,
    market_unique_id: String,
    market_close_time: { type: Date },
    sport_id: SchemaTypes.Mixed,
    sport_name: SchemaTypes.Mixed,
    match_id: SchemaTypes.Mixed,
    match_name: SchemaTypes.Mixed,
    match_start_time: { type: Date },
    competition_name: SchemaTypes.Mixed,
    competition_id: SchemaTypes.Mixed,
    tournament_name: SchemaTypes.Mixed,
    tournament_id: SchemaTypes.Mixed,
    price: Number,
    bet: { type: 'ObjectId', ref: 'Bet' },
    proposition: {
      id: Number,
      name: String,
      returnWin: Number,
      returnPlace: Number,
      differential: SchemaTypes.Mixed,
      bettingStatus: String,
      allowPlace: Boolean,
      number: Number,
      isOpen: Boolean,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Proposition', propositionSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const betSchema = new Schema(
    {
      proposition_id: Number,
      transaction_date_time: String,
      bet_description: String,
      competition_id: Number,
      tournament_id: Number,
      sport: String,
      match: String,
      bet_amount: Number,
      tx_type: String,
      account_number: {
        value: Number
      },
      updatedAt: {
        type: Date,
        default: null
      }
});


const BetModel = mongoose.model('Bet', betSchema);

module.exports = BetModel;

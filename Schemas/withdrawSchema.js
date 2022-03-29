const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const withdraws = "withdraws";
const withdrawSchema = new Schema({
  name: String,
  discordId: Number,
  donationAmount: Number,
  withdrawAmount: Number,
  approved: Boolean,
  messageId: Number,
});

const withdraw_model = mongoose.model(withdraws, withdrawSchema);

module.exports = withdraw_model;

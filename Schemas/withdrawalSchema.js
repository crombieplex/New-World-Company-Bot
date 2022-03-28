const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const withdrawals = "withdrawals";
const withdrawalSchema = new Schema({
  name: String,
  discordId: Number,
  withdrawalAmount: Number,
  approved: Boolean,
  messageId: Number,
});

const withdrawal_model = mongoose.model(withdrawals, withdrawalSchema);

module.exports = withdrawal_model;

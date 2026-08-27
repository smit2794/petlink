const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true },
  donorName: String,
  email: String,
  amount: Number,
  purpose: String,
  date: String
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
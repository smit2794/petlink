const mongoose = require('mongoose');

const shelterInventoryItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true },
  name: String,
  stock: Number,
  unit: String,
  threshold: Number,
  expiryDate: String
}, { timestamps: true });

module.exports = mongoose.model('ShelterInventoryItem', shelterInventoryItemSchema);
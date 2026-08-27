const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true },
  animalId: String,
  timestamp: String,
  location: String
}, { timestamps: true });

module.exports = mongoose.model('ScanLog', scanLogSchema);
const mongoose = require('mongoose');

const foundReportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true },
  animalId: String,
  reportedAt: String,
  finderLocation: String,
  finderPhoto: String,
  finderContact: String,
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Dismissed'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('FoundReport', foundReportSchema);
const mongoose = require('mongoose');

const foundReportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true },
  animalId: String,
  reportedAt: String,
  finderLocation: String,
  finderPhoto: String,
  finderContact: String,
  reportType: {
    type: String,
    enum: ['Lost Recovery', 'Community Sighting', 'Found / In Custody'],
    default: 'Community Sighting'
  },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Dismissed'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('FoundReport', foundReportSchema);
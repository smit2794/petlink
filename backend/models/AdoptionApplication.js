const mongoose = require('mongoose');

const adoptionApplicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true },
  animalId: String,
  animalName: String,
  animalPhoto: String,
  applicantName: String,
  applicantContact: String,
  notes: String,
  status: {
    type: String,
    enum: ['Applications Received', 'Applicant Verification', 'Approved', 'Follow-up Scheduled', 'Rejected'],
    default: 'Applications Received'
  },
  date: String,
  followUpDate: String,
  followUpInterval: String
}, { timestamps: true });

module.exports = mongoose.model('AdoptionApplication', adoptionApplicationSchema);
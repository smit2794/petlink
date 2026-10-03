const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true }, // matches frontend's mockId (e.g. PL-2026-1234)
  name: String,
  species: String,
  breed: String,
  gender: String,
  age: String,
  weight: String,
  photo: String,
  status: {
    type: String,
    enum: ['Rescued', 'Under Treatment', 'In Shelter', 'Available for Adoption', 'Adopted', 'Lost', 'Deceased'],
    default: 'Adopted'
  },
  custodian: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedVetId: String,
  lastUpdated: String,
  qrCode: String,
  timeline: [{ date: String, title: String, description: String }],
  healthSummary: {
    vaccinationStatus: String,
    sterilizationStatus: String,
    treatmentNotes: String
  },
  documents: [{ name: String, type: String, size: String }]
}, { timestamps: true });

module.exports = mongoose.model('Animal', animalSchema);
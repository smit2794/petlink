const mongoose = require('mongoose');

const vetAppointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true },
  petId: { type: String, required: true },
  petName: { type: String, default: '' },
  petPhoto: { type: String, default: '' },
  vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, default: '' },
  date: { type: String, required: true }, // canonical "when is this happening" — always up to date
  status: {
    type: String,
    enum: ['Pending', 'Upcoming', 'Completed', 'Declined'],
    default: 'Upcoming' // vet-created appointments skip Pending entirely, unchanged from Phase 1
  },
  // Fields for parent-initiated booking flow (Phase 2)
  requestedBy: { type: String, enum: ['vet', 'parent'], default: 'vet' },
  requestedDate: { type: String, default: '' }, // parent's original requested date, never mutated after creation
  vetProposedDate: { type: String, default: '' }, // set when vet accepts with a new time; audit/UI marker only — date field holds the actual confirmed date
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('VetAppointment', vetAppointmentSchema);

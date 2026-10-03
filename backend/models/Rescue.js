const mongoose = require('mongoose');

const rescueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true },
  animalType: String,
  condition: String,
  location: String,
  reportedBy: String,
  phone: String,
  status: {
    type: String,
    enum: ['New', 'Assigned', 'In Progress', 'Rescued'],
    default: 'New'
  },
  assignedVolunteer: { type: String, default: 'None' },
  date: String,
  x: Number,
  y: Number,
  photo: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timeline: [{ time: String, title: String, desc: String }]
}, { timestamps: true });

module.exports = mongoose.model('Rescue', rescueSchema);
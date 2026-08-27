const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: String,
  title: String,
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
}, { _id: false });

const volunteerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true },
  name: String,
  contact: String,
  role: String,
  assignedTaskCount: { type: Number, default: 0 },
  lastCheckIn: { type: String, default: new Date().toISOString() },
  tasks: [taskSchema]
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
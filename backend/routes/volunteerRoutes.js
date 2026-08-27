const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');

router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body.id) return res.status(400).json({ error: 'id is required' });
    const volunteer = await Volunteer.create(req.body);
    res.status(201).json(volunteer);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'A volunteer with this ID already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ id: req.params.id });
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    const { id, ...updates } = req.body;
    const updated = await Volunteer.findOneAndUpdate(
      { id: req.params.id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
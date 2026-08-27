const express = require('express');
const router = express.Router();
const Rescue = require('../models/Rescue');

// GET all rescues
router.get('/', async (req, res) => {
  try {
    const rescues = await Rescue.find().sort({ createdAt: -1 });
    res.json(rescues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new rescue
router.post('/', async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).json({ error: 'id is required' });
    }
    const rescue = await Rescue.create(req.body);
    res.status(201).json(rescue);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A rescue with this ID already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update an existing rescue (status changes, volunteer assignment, timeline additions)
router.put('/:id', async (req, res) => {
  try {
    const rescue = await Rescue.findOne({ id: req.params.id });
    if (!rescue) {
      return res.status(404).json({ error: 'Rescue not found' });
    }
    const { id, ...updates } = req.body;
    const updated = await Rescue.findOneAndUpdate(
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
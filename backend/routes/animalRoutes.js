const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');

// GET all animals
router.get('/', async (req, res) => {
  try {
    const animals = await Animal.find().sort({ createdAt: -1 });
    res.json(animals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new animal — accepts the exact shape the frontend already builds
router.post('/', async (req, res) => {
  try {
    if (!req.body.id || !req.body.species) {
      return res.status(400).json({ error: 'id and species are required' });
    }
    const animal = await Animal.create(req.body);
    res.status(201).json(animal);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'An animal with this ID already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update an existing animal (status changes, custodian changes, timeline additions, etc.)
router.put('/:id', async (req, res) => {
  try {
    const animal = await Animal.findOne({ id: req.params.id });
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Prevent id from ever being changed, even if accidentally sent in the body
    const { id, ...updates } = req.body;

    // Merge nested healthSummary instead of overwriting it wholesale
    if (updates.healthSummary) {
      updates.healthSummary = { ...animal.healthSummary?.toObject?.() ?? animal.healthSummary, ...updates.healthSummary };
    }

    const updated = await Animal.findOneAndUpdate(
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
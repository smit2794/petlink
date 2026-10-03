const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const { optionalAuthMiddleware } = require('../middleware/authMiddleware');

// GET animals — role-scoped per implementation plan
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    let query = {};

    // If caller is authenticated as a parent
    if (req.user && req.user.role === 'parent') {
      if (req.query.status === 'Available for Adoption' || req.query.adoptable === 'true') {
        query = { status: 'Available for Adoption' };
      } else {
        // Strict single real ownership model — only animals where ownerId matches parent
        query = { ownerId: req.user.id };
      }
    }
    // NGO, Vet, and unauthenticated (gov, public scan, public stats) receive full catalog
    // (or filtered if a specific status query is passed)
    else if (req.query.status) {
      query = { status: req.query.status };
    }

    const animals = await Animal.find(query).sort({ createdAt: -1 });
    res.json(animals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new animal
router.post('/', optionalAuthMiddleware, async (req, res) => {
  try {
    if (!req.body.id || !req.body.species) {
      return res.status(400).json({ error: 'id and species are required' });
    }

    const animalData = { ...req.body };

    // Attach creator and owner if authenticated
    if (req.user) {
      animalData.createdBy = req.user.id;
      if (req.user.role === 'parent') {
        animalData.ownerId = req.user.id;
        if (!animalData.custodian) {
          animalData.custodian = `${req.user.name} (Home)`;
        }
      } else if (req.user.role === 'ngo') {
        if (!animalData.custodian) {
          animalData.custodian = req.user.name;
        }
      }
    }

    const animal = await Animal.create(animalData);
    res.status(201).json(animal);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'An animal with this ID already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update an existing animal (status changes, custodian changes, timeline additions, etc.)
router.put('/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    const animal = await Animal.findOne({ id: req.params.id });
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Prevent id from ever being changed
    const { id, ...updates } = req.body;

    // Merge nested healthSummary instead of overwriting it wholesale
    if (updates.healthSummary) {
      updates.healthSummary = {
        ...animal.healthSummary?.toObject?.() ?? animal.healthSummary,
        ...updates.healthSummary
      };
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
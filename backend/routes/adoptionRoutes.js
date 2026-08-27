const express = require('express');
const router = express.Router();
const AdoptionApplication = require('../models/AdoptionApplication');
const Animal = require('../models/Animal');

// GET all adoption applications
router.get('/', async (req, res) => {
  try {
    const apps = await AdoptionApplication.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new application
router.post('/', async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).json({ error: 'id is required' });
    }
    const app = await AdoptionApplication.create(req.body);
    res.status(201).json(app);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'An application with this ID already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update an application's status/fields
// If status becomes "Approved", also transfers the animal's custody in the same request
router.put('/:id', async (req, res) => {
  try {
    const app = await AdoptionApplication.findOne({ id: req.params.id });
    if (!app) {
      return res.status(404).json({ error: 'Adoption application not found' });
    }

    const { id, ...updates } = req.body;

    const updatedApp = await AdoptionApplication.findOneAndUpdate(
      { id: req.params.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Custody transfer transaction — only fires when transitioning INTO "Approved"
    if (updates.status === 'Approved' && app.status !== 'Approved') {
      const animal = await Animal.findOne({ id: app.animalId });
      if (animal) {
        const timelineEntry = {
          date: new Date().toISOString().split('T')[0],
          title: 'Adopted',
          description: `Adoption approved. Transferred to ${app.applicantName}.`
        };
        await Animal.findOneAndUpdate(
          { id: app.animalId },
          {
            $set: {
              status: 'Adopted',
              custodian: `${app.applicantName} (Adoptive Parent)`,
              lastUpdated: 'Just now'
            },
            $push: { timeline: timelineEntry }
          }
        );
      }
    }

    res.json(updatedApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
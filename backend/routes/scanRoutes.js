const express = require('express');
const router = express.Router();
const ScanLog = require('../models/ScanLog');
const FoundReport = require('../models/FoundReport');
const Animal = require('../models/Animal');

// GET all scan logs
router.get('/scanlogs', async (req, res) => {
  try {
    const logs = await ScanLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST log a tag scan — public, no auth
router.post('/scanlogs', async (req, res) => {
  try {
    if (!req.body.id || !req.body.animalId) {
      return res.status(400).json({ error: 'id and animalId are required' });
    }
    const log = await ScanLog.create(req.body);

    // Append "Tag Scanned" event to the animal's timeline
    const animal = await Animal.findOne({ id: req.body.animalId });
    if (animal) {
      const timelineEntry = {
        date: new Date().toISOString().split('T')[0],
        title: 'Tag Scanned',
        description: `Collar tag scanned publicly. Location: ${req.body.location}. Time: ${req.body.timestamp}`
      };
      await Animal.findOneAndUpdate(
        { id: req.body.animalId },
        { $push: { timeline: timelineEntry }, $set: { lastUpdated: 'Just now' } }
      );
    }

    res.status(201).json(log);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'A scan log with this ID already exists' });
    res.status(500).json({ error: err.message });
  }
});

// GET all found reports
router.get('/foundreports', async (req, res) => {
  try {
    const reports = await FoundReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit a found report — public, no auth. Blocked server-side unless animal status is "Lost"
router.post('/foundreports', async (req, res) => {
  try {
    if (!req.body.id || !req.body.animalId) {
      return res.status(400).json({ error: 'id and animalId are required' });
    }
    const animal = await Animal.findOne({ id: req.body.animalId });
    if (!animal || animal.status !== 'Lost') {
      return res.status(400).json({ error: 'This animal is not currently marked as Lost — report blocked.' });
    }
    const report = await FoundReport.create(req.body);
    res.status(201).json(report);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'A found report with this ID already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT confirm or dismiss a found report
router.put('/foundreports/:id', async (req, res) => {
  try {
    const report = await FoundReport.findOne({ id: req.params.id });
    if (!report) return res.status(404).json({ error: 'Found report not found' });

    const { status } = req.body;
    const updated = await FoundReport.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status } },
      { new: true, runValidators: true }
    );

    // On confirm, revert the animal to its prior custody status — never leaves it in a "Found" state
    if (status === 'Confirmed') {
      const animal = await Animal.findOne({ id: report.animalId });
      if (animal) {
        const isParentOwned = (animal.custodian || '').toLowerCase().includes('home') || (animal.custodian || '').toLowerCase().includes('family');
        const targetStatus = isParentOwned ? 'Adopted' : 'In Shelter';
        const timelineEntry = {
          date: new Date().toISOString().split('T')[0],
          title: 'Reunion Confirmed',
          description: `Finder match confirmed. Pet returned to custodian custody (${animal.custodian}).`
        };
        await Animal.findOneAndUpdate(
          { id: report.animalId },
          { $set: { status: targetStatus, lastUpdated: 'Just now' }, $push: { timeline: timelineEntry } }
        );
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
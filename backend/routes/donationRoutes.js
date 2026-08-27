const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).json({ error: 'id is required' });
    }
    const donation = await Donation.create(req.body);
    res.status(201).json(donation);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A donation with this ID already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
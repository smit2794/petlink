const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

// GET /api/vets — returns public-safe vet profiles; requires any authenticated role
// Auth required to protect vet phone/address/location data from anonymous scrapers.
// All Parent Portal users are already logged in, so this costs them nothing.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { city } = req.query;

    const query = { role: 'vet' };

    // Optional city-based filtering using case-insensitive partial match
    if (city && city.trim()) {
      query.city = { $regex: city.trim(), $options: 'i' };
    }

    const vets = await User.find(query)
      .select('_id name city address phone vetProfile')  // never returns password or email
      .sort({ name: 1 });

    return res.json(vets);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

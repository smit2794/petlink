const express = require('express');
const router = express.Router();
const VetInventoryItem = require('../models/VetInventoryItem');

router.get('/', async (req, res) => {
    try {
        const items = await VetInventoryItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        if (!req.body.id) return res.status(400).json({ error: 'id is required' });
        const item = await VetInventoryItem.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'An item with this ID already exists' });
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const item = await VetInventoryItem.findOne({ id: req.params.id });
        if (!item) return res.status(404).json({ error: 'Vet inventory item not found' });
        const { id, ...updates } = req.body;
        const updated = await VetInventoryItem.findOneAndUpdate(
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

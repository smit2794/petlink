const mongoose = require('mongoose');

const vetInventoryItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, immutable: true },
    vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    stock: Number,
    unit: String,
    threshold: Number,
    expiryDate: String
}, { timestamps: true });

module.exports = mongoose.model('VetInventoryItem', vetInventoryItemSchema);
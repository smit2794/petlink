const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const QRToken = require('../models/QRToken');
const User = require('../models/User');
const Animal = require('../models/Animal');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const QRCode = require('qrcode');

// ─────────────────────────────────────────────────────────────
// Helpers: collision-proof IDs
// ─────────────────────────────────────────────────────────────
const generateTokenId = () =>
  `TKN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const generateBatchId = () =>
  `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES  (unauthenticated per phase 1 scope)
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/tokens/generate
 * Body: { count, assignedTo, assignedUserId, batchLabel? }
 * Generates N tokens and assigns them all to one user account with a shared batchId.
 * Generates and saves each token's QR code Data URL immediately.
 */
router.post('/tokens/generate', async (req, res) => {
  try {
    const { count = 1, assignedTo, assignedUserId, batchLabel = '' } = req.body;

    if (!assignedTo || !assignedUserId) {
      return res.status(400).json({ error: 'assignedTo and assignedUserId are required.' });
    }
    if (!['ngo', 'parent'].includes(assignedTo)) {
      return res.status(400).json({ error: 'assignedTo must be "ngo" or "parent".' });
    }
    if (count < 1 || count > 200) {
      return res.status(400).json({ error: 'count must be between 1 and 200.' });
    }

    // Verify the target user exists and has the right role
    const user = await User.findById(assignedUserId).select('name email role');
    if (!user) return res.status(404).json({ error: 'Target user not found.' });
    if (user.role !== assignedTo) {
      return res.status(400).json({ error: `User role (${user.role}) does not match assignedTo (${assignedTo}).` });
    }

    const publicBaseUrl = process.env.PUBLIC_URL || 'http://10.181.190.221:5173';
    const batchId = generateBatchId();
    const tokens = [];

    for (let i = 0; i < count; i++) {
      const tokenId = generateTokenId();
      const scanUrl = `${publicBaseUrl}/scan/${tokenId}`;
      let qrCodeDataUrl = '';
      try {
        qrCodeDataUrl = await QRCode.toDataURL(scanUrl, {
          margin: 1,
          width: 256,
          color: {
            dark: '#1D1311',
            light: '#FFFFFF'
          }
        });
      } catch (qrErr) {
        console.error('Failed generating QR code for token:', tokenId, qrErr);
      }

      tokens.push({
        tokenId,
        batchId,
        assignedTo,
        assignedUserId,
        assignedUserName: user.name,
        status: 'assigned',
        batchLabel,
        qrCodeDataUrl,
        physicallyReceived: false,
        receivedAt: null
      });
    }

    const created = await QRToken.insertMany(tokens);
    res.status(201).json({ created: created.length, batchId, tokens: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tokens/batches
 * Admin: returns summary of all batches (Type, Assigned User, Counts, Dates).
 */
router.get('/tokens/batches', async (req, res) => {
  try {
    const batches = await QRToken.aggregate([
      {
        $group: {
          _id: '$batchId',
          batchId: { $first: '$batchId' },
          batchLabel: { $first: '$batchLabel' },
          assignedTo: { $first: '$assignedTo' },
          assignedUserId: { $first: '$assignedUserId' },
          assignedUserName: { $first: '$assignedUserName' },
          totalCount: { $sum: 1 },
          claimedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] }
          },
          unclaimedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] }
          },
          physicallyReceivedCount: {
            $sum: { $cond: [{ $eq: ['$physicallyReceived', true] }, 1, 0] }
          },
          createdAt: { $min: '$createdAt' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tokens/batches/:batchId
 * Admin: returns all individual tokens belonging to one batch.
 */
router.get('/tokens/batches/:batchId', async (req, res) => {
  try {
    const tokens = await QRToken.find({ batchId: req.params.batchId }).sort({ createdAt: -1 });
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tokens
 * Admin: list all tokens, with optional filters:
 *   ?status=assigned|claimed
 *   ?assignedTo=ngo|parent
 *   ?userId=<mongoId>
 *   ?batchId=<batchId>
 *   ?physicallyReceived=true|false
 */
router.get('/tokens', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.userId) filter.assignedUserId = req.query.userId;
    if (req.query.batchId) filter.batchId = req.query.batchId;
    if (req.query.physicallyReceived !== undefined) {
      filter.physicallyReceived = req.query.physicallyReceived === 'true';
    }

    const tokens = await QRToken.find(filter).sort({ createdAt: -1 });
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/tokens/:tokenId/mark-received
 * NGO / Parent: marks a physical collar tag as received.
 * Verifies the token is assigned to the authenticated user.
 */
router.put('/tokens/:tokenId/mark-received', authMiddleware, requireRole('ngo', 'parent'), async (req, res) => {
  try {
    const token = await QRToken.findOne({ tokenId: req.params.tokenId });
    if (!token) return res.status(404).json({ error: 'Token not found.' });

    // Verify ownership
    if (token.assignedUserId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'This token is not assigned to your account.' });
    }

    token.physicallyReceived = true;
    token.receivedAt = new Date();
    await token.save();

    res.json({ message: 'Token marked as physically received.', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/tokens/:tokenId
 * Admin: delete an unclaimed token.
 */
router.delete('/tokens/:tokenId', async (req, res) => {
  try {
    const token = await QRToken.findOne({ tokenId: req.params.tokenId });
    if (!token) return res.status(404).json({ error: 'Token not found.' });
    if (token.status === 'claimed') {
      return res.status(400).json({ error: 'Cannot delete a claimed token — it is linked to a live pet.' });
    }
    await QRToken.deleteOne({ tokenId: req.params.tokenId });
    res.json({ message: 'Token deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tokens/users
 * Admin helper: list all NGO and Parent user accounts for the assignment dropdown.
 */
router.get('/tokens/users', async (req, res) => {
  try {
    const { role } = req.query; // optional filter: ?role=ngo or ?role=parent
    const filter = { role: { $in: ['ngo', 'parent'] } };
    if (role && ['ngo', 'parent'].includes(role)) filter.role = role;

    const users = await User.find(filter).select('_id name email role city');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// NGO / PARENT PORTAL ROUTES  (authenticated)
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/tokens/mine
 * NGO/Parent: returns batch-level summaries for batches assigned to the logged-in user.
 */
router.get('/tokens/mine', authMiddleware, requireRole('ngo', 'parent'), async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : req.user.id;

    const batches = await QRToken.aggregate([
      { $match: { assignedUserId: userId } },
      {
        $group: {
          _id: '$batchId',
          batchId: { $first: '$batchId' },
          batchLabel: { $first: '$batchLabel' },
          totalCount: { $sum: 1 },
          claimedCount: { $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] } },
          unclaimedCount: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
          physicallyReceivedCount: { $sum: { $cond: [{ $eq: ['$physicallyReceived', true] }, 1, 0] } },
          createdAt: { $min: '$createdAt' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tokens/mine/batches/:batchId
 * NGO/Parent: individual tokens for one of the logged-in user's batches.
 * 403 if the batch belongs to a different user.
 */
router.get('/tokens/mine/batches/:batchId', authMiddleware, requireRole('ngo', 'parent'), async (req, res) => {
  try {
    const tokens = await QRToken.find({
      batchId: req.params.batchId,
      assignedUserId: req.user.id
    }).sort({ createdAt: -1 });

    if (tokens.length === 0) {
      const anyToken = await QRToken.findOne({ batchId: req.params.batchId });
      if (anyToken) return res.status(403).json({ error: 'This batch does not belong to your account.' });
      return res.status(404).json({ error: 'Batch not found.' });
    }

    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/tokens/mine/batches/:batchId/mark-received
 * NGO/Parent: bulk-mark every token in the batch as physicallyReceived.
 * 403 if the batch belongs to a different user.
 */
router.put('/tokens/mine/batches/:batchId/mark-received', authMiddleware, requireRole('ngo', 'parent'), async (req, res) => {
  try {
    const sample = await QRToken.findOne({ batchId: req.params.batchId });
    if (!sample) return res.status(404).json({ error: 'Batch not found.' });
    if (sample.assignedUserId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'This batch does not belong to your account.' });
    }
    const result = await QRToken.updateMany(
      { batchId: req.params.batchId, assignedUserId: req.user.id, physicallyReceived: false },
      { $set: { physicallyReceived: true, receivedAt: new Date() } }
    );
    res.json({ updated: result.modifiedCount, batchId: req.params.batchId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PUBLIC ROUTE  (called during scan / pet registration claim)
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/tokens/lookup/:tokenId
 * Public: resolve a scanned tokenId.
 * Returns:
 *   - { type: 'token', token, animal } if it's a claimed QR token with linked animal
 *   - { type: 'token', token } if it's an unclaimed QR token
 *   - 404 if not found (caller should fall back to legacy animal-ID lookup)
 */
router.get('/tokens/lookup/:tokenId', async (req, res) => {
  try {
    const token = await QRToken.findOne({ tokenId: req.params.tokenId });
    if (!token) return res.status(404).json({ error: 'Token not found.' });

    if (token.status === 'claimed' && token.linkedAnimalId) {
      const animal = await Animal.findOne({ id: token.linkedAnimalId });
      return res.json({ type: 'token', token, animal: animal || null });
    }

    res.json({ type: 'token', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tokens/by-animal/:animalId
 * Public: find the claimed token linked to a given animal ID.
 * Returns: { tokenId } or 404 if no token is linked.
 * Used by PetQRCode to show the correct token-based QR on the Pet Profile page.
 */
router.get('/tokens/by-animal/:animalId', async (req, res) => {
  try {
    let token = await QRToken.findOne({
      linkedAnimalId: req.params.animalId,
      status: 'claimed'
    }).select('tokenId qrCodeDataUrl');

    if (!token) {
      const animal = await Animal.findOne({ id: req.params.animalId }).select('tokenId');
      if (animal && animal.tokenId) {
        token = await QRToken.findOne({ tokenId: animal.tokenId }).select('tokenId qrCodeDataUrl');
      }
    }

    if (!token) return res.status(404).json({ error: 'No token linked to this animal.' });
    res.json({ tokenId: token.tokenId, qrCodeDataUrl: token.qrCodeDataUrl || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/tokens/:tokenId/edit
 * Ownership-verified edit of the linked Animal record for a claimed token.
 * Requires auth (parent).
 * Body: { name, species, breed, gender, age, weight, photo, healthSummary }
 */
router.put('/tokens/:tokenId/edit', authMiddleware, requireRole('parent'), async (req, res) => {
  try {
    const token = await QRToken.findOne({ tokenId: req.params.tokenId });
    if (!token) return res.status(404).json({ error: 'Token not found.' });

    if (token.status !== 'claimed' || !token.linkedAnimalId) {
      return res.status(400).json({ error: 'This token is not yet claimed or linked to an animal.' });
    }

    // Ensure the editing user is the assigned owner
    if (!token.assignedUserId || token.assignedUserId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to edit this pet.' });
    }

    const animal = await Animal.findOne({ id: token.linkedAnimalId });
    if (!animal) {
      return res.status(404).json({ error: 'Linked animal not found.' });
    }

    // Prevent id and immutable system fields from changing
    const { id, _id, createdBy, ownerId, ...updates } = req.body;

    // Merge nested healthSummary if provided
    if (updates.healthSummary) {
      updates.healthSummary = {
        ...animal.healthSummary?.toObject?.() ?? animal.healthSummary,
        ...updates.healthSummary
      };
    }

    // Keep token linkedPetName in sync if name changed
    if (updates.name && updates.name !== token.linkedPetName) {
      token.linkedPetName = updates.name;
      await token.save();
    }

    const updatedAnimal = await Animal.findOneAndUpdate(
      { id: token.linkedAnimalId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(updatedAnimal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tokens/claim
 * Called by the pet-registration flow once an animal is created.
 * Body: { tokenId, animalId, petName }
 * Requires auth (ngo or parent).
 */
router.post('/tokens/claim', authMiddleware, async (req, res) => {
  try {
    const { tokenId, animalId, petName } = req.body;
    if (!tokenId || !animalId) {
      return res.status(400).json({ error: 'tokenId and animalId are required.' });
    }

    const token = await QRToken.findOne({ tokenId });
    if (!token) return res.status(404).json({ error: 'Token not found.' });
    if (token.status === 'claimed') {
      return res.status(400).json({ error: 'This token has already been claimed.' });
    }

    // Ensure the claiming user is the assigned owner
    if (token.assignedUserId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'This token is not assigned to your account.' });
    }

    const updated = await QRToken.findOneAndUpdate(
      { tokenId },
      {
        $set: {
          status: 'claimed',
          linkedAnimalId: animalId,
          linkedPetName: petName || null,
          claimedAt: new Date()
        }
      },
      { new: true }
    );

    // Also persist tokenId on the Animal record
    await Animal.findOneAndUpdate(
      { id: animalId },
      { $set: { tokenId: token.tokenId, qrCode: token.tokenId } }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN STATS ROUTE  (unauthenticated, consistent with Admin Portal scope)
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Returns platform overview: NGO/Parent counts, per-entity pet counts, token summary.
 */
router.get('/admin/stats', async (req, res) => {
  try {
    // User counts by role
    const [ngoCount, parentCount] = await Promise.all([
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'parent' })
    ]);

    // Per-NGO pet counts (aggregate on Animal.ownerId, join User name)
    const ngoPetBreakdown = await Animal.aggregate([
      { $group: { _id: '$ownerId', petCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $match: { 'user.role': 'ngo' } },
      { $project: { _id: 0, userId: '$_id', name: '$user.name', petCount: 1 } },
      { $sort: { petCount: -1 } }
    ]);

    // Per-Parent pet counts
    const parentPetBreakdown = await Animal.aggregate([
      { $group: { _id: '$ownerId', petCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $match: { 'user.role': 'parent' } },
      { $project: { _id: 0, userId: '$_id', name: '$user.name', petCount: 1 } },
      { $sort: { petCount: -1 } }
    ]);

    const totalNgoPets = ngoPetBreakdown.reduce((sum, e) => sum + e.petCount, 0);
    const totalParentPets = parentPetBreakdown.reduce((sum, e) => sum + e.petCount, 0);

    res.json({
      ngoCount,
      parentCount,
      totalNgoPets,
      totalParentPets,
      ngoPetBreakdown,
      parentPetBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

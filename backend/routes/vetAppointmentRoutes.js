const express = require('express');
const router = express.Router();
const VetAppointment = require('../models/VetAppointment');
const Animal = require('../models/Animal');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// =====================================================================
// IMPORTANT: /request and /:id/respond MUST be registered BEFORE
// the generic POST / and PUT /:id handlers, because Express matches
// routes in order — 'request' would otherwise be treated as an :id param.
// =====================================================================

// POST /api/vetappointments/request — parent submits a booking request
router.post('/request', authMiddleware, requireRole('parent'), async (req, res) => {
  try {
    const { petId, vetId, requestedDate, reason } = req.body;

    if (!petId || !vetId || !requestedDate || !reason) {
      return res.status(400).json({ error: 'petId, vetId, requestedDate, and reason are required' });
    }

    // Verify the pet actually belongs to the logged-in parent
    const animal = await Animal.findOne({ id: petId });
    if (!animal) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    if (!animal.ownerId || animal.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: This pet does not belong to your account' });
    }

    const newId = `APT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newAppointment = await VetAppointment.create({
      id: newId,
      petId,
      petName: animal.name || '',
      petPhoto: animal.photo || '',
      vetId,
      reason,
      date: requestedDate,          // canonical date starts as the parent's request
      requestedDate,                 // immutable audit copy of the parent's original request
      status: 'Pending',
      requestedBy: 'parent',
      parentId: req.user.id,
      vetProposedDate: ''
    });

    return res.status(201).json(newAppointment);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'An appointment with this ID already exists' });
    }
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/vetappointments/:id/respond — vet accepts / declines / proposes new time
router.put('/:id/respond', authMiddleware, requireRole('vet'), async (req, res) => {
  try {
    const appointment = await VetAppointment.findOne({ id: req.params.id });
    if (!appointment) {
      return res.status(404).json({ error: 'Vet appointment not found' });
    }

    // Verify this appointment belongs to the logged-in vet
    if (appointment.vetId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to respond to this appointment' });
    }

    // Can only respond to Pending requests
    if (appointment.status !== 'Pending') {
      return res.status(400).json({ error: 'Can only respond to Pending requests' });
    }

    const { action, proposedDate } = req.body;

    if (!action || !['accept', 'accept-with-new-time', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'action must be one of: accept, accept-with-new-time, decline' });
    }

    let updates = {};

    if (action === 'accept') {
      updates = { status: 'Upcoming' };
    } else if (action === 'accept-with-new-time') {
      if (!proposedDate) {
        return res.status(400).json({ error: 'proposedDate is required for accept-with-new-time' });
      }
      // date is updated to the vet's proposed date — single canonical source of truth
      // vetProposedDate is kept as a history/audit marker for the UI callout in ParentAppointments.jsx
      // MyPets.jsx calendar (and any other apt.date consumer) automatically shows correct date with no changes
      updates = {
        status: 'Upcoming',
        date: proposedDate,
        vetProposedDate: proposedDate
      };
    } else if (action === 'decline') {
      updates = { status: 'Declined' };
    }

    const updated = await VetAppointment.findOneAndUpdate(
      { id: req.params.id },
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    );

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/vetappointments — role-scoped for Vet vs. Parent callers
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'vet') {
      const appointments = await VetAppointment.find({ vetId: req.user.id }).sort({ date: 1, createdAt: -1 });
      return res.json(appointments);
    } else if (req.user.role === 'parent') {
      // Filter against owned pets in the Animal collection
      const myPets = await Animal.find({ ownerId: req.user.id }).select('id');
      const myPetIds = myPets.map(p => p.id);
      const appointments = await VetAppointment.find({ petId: { $in: myPetIds } }).sort({ date: 1, createdAt: -1 });
      return res.json(appointments);
    } else {
      // NGO and other roles do not manage clinical appointments
      return res.json([]);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/vetappointments — vet schedules a follow-up directly (Phase 1 flow, unchanged)
router.post('/', authMiddleware, requireRole('vet'), async (req, res) => {
  try {
    const { id, petId, reason, date, status } = req.body;
    let { petName, petPhoto } = req.body;

    if (!id || !petId || !date) {
      return res.status(400).json({ error: 'id, petId, and date are required' });
    }

    // Auto-populate petName/petPhoto if missing
    if (!petName || !petPhoto) {
      const animal = await Animal.findOne({ id: petId });
      if (animal) {
        if (!petName) petName = animal.name;
        if (!petPhoto) petPhoto = animal.photo;
      }
    }

    const newAppointment = await VetAppointment.create({
      id,
      petId,
      petName: petName || '',
      petPhoto: petPhoto || '',
      vetId: req.user.id,
      reason: reason || '',
      date,
      status: status || 'Upcoming', // vet-created → defaults straight to Upcoming, skipping Pending
      requestedBy: 'vet'
    });

    return res.status(201).json(newAppointment);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'An appointment with this ID already exists' });
    }
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/vetappointments/:id — vet updates date/status (reschedule and complete appointment flows)
router.put('/:id', authMiddleware, requireRole('vet'), async (req, res) => {
  try {
    let appointment = await VetAppointment.findOne({ id: req.params.id });

    // If appointment record does not yet exist in MongoDB (e.g. initial demo/mock catalog item), create it
    if (!appointment) {
      const { petId, petName, petPhoto, reason, date, status } = req.body;
      const created = await VetAppointment.create({
        id: req.params.id,
        petId: petId || 'UNKNOWN',
        petName: petName || '',
        petPhoto: petPhoto || '',
        vetId: req.user.id,
        reason: reason || '',
        date: date || new Date().toISOString().split('T')[0],
        status: status || 'Upcoming',
        requestedBy: 'vet'
      });
      return res.status(201).json(created);
    }

    // If appointment belongs to another mock or legacy vet ID, link to current vet
    if (appointment.vetId && appointment.vetId.toString() !== req.user.id) {
      appointment.vetId = req.user.id;
      await appointment.save();
    }

    const { id, vetId, createdAt, ...updates } = req.body;
    const updated = await VetAppointment.findOneAndUpdate(
      { id: req.params.id },
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    );

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

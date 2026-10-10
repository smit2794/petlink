const mongoose = require('mongoose');

const QRTokenSchema = new mongoose.Schema(
  {
    // Unique token identifier — printed on the physical collar tag
    tokenId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // Which portal this token is assigned to: 'ngo' or 'parent'
    assignedTo: {
      type: String,
      enum: ['ngo', 'parent'],
      required: true
    },

    // The MongoDB _id of the NGO or Parent user this token is assigned to
    assignedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Human-readable label for the assigned user (for Admin UI display)
    assignedUserName: {
      type: String,
      default: ''
    },

    // Status lifecycle: unassigned → assigned → claimed
    // 'assigned'  — generated and assigned to an account, not yet linked to a pet
    // 'claimed'   — successfully linked to a real animal record
    status: {
      type: String,
      enum: ['assigned', 'claimed'],
      default: 'assigned'
    },

    // The real animal ID this token gets linked to once claimed
    linkedAnimalId: {
      type: String,
      default: null
    },

    // Name of the pet (filled after claim, for display purposes)
    linkedPetName: {
      type: String,
      default: null
    },

    // When the claim happened
    claimedAt: {
      type: Date,
      default: null
    },

    // Shared batch ID linking all tokens generated in the same bulk call
    batchId: {
      type: String,
      required: true,
      index: true
    },

    // Optional batch label (e.g. "Batch-Oct-2026") for Admin tracking
    batchLabel: {
      type: String,
      default: ''
    },

    // Persistent QR code image as Base64 Data URL, generated at creation time
    qrCodeDataUrl: {
      type: String,
      default: ''
    },

    // Physical delivery tracking separate from digital claim status
    physicallyReceived: {
      type: Boolean,
      default: false
    },

    // Timestamp when tag was marked as physically received
    receivedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('QRToken', QRTokenSchema);

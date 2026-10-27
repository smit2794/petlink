/**
 * One-time migration: re-generate qrCodeDataUrl for ALL tokens
 * so the QR images stored in MongoDB encode the current PUBLIC_URL.
 *
 * Usage:  cd backend && node scripts/migrate-qr-urls.js
 */
const mongoose = require('mongoose');
require('dotenv').config();
const QRCode = require('qrcode');
const QRToken = require('../models/QRToken');

const PUBLIC_URL = process.env.PUBLIC_URL || 'https://petlink-pddx.onrender.com';

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  console.log(`Using PUBLIC_URL = ${PUBLIC_URL}\n`);

  const tokens = await QRToken.find({});
  console.log(`Found ${tokens.length} tokens to migrate.\n`);

  let updated = 0;
  let failed = 0;

  for (const token of tokens) {
    const scanUrl = `${PUBLIC_URL}/scan/${token.tokenId}`;
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(scanUrl, {
        margin: 1,
        width: 256,
        color: { dark: '#1D1311', light: '#FFFFFF' }
      });

      await QRToken.updateOne(
        { _id: token._id },
        { $set: { qrCodeDataUrl } }
      );

      updated++;
      process.stdout.write(`  ✅ ${token.tokenId} → ${scanUrl}\n`);
    } catch (err) {
      failed++;
      console.error(`  ❌ ${token.tokenId}: ${err.message}`);
    }
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});

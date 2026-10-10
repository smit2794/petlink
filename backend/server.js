require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const animalRoutes = require('./routes/animalRoutes');
const rescueRoutes = require('./routes/rescueRoutes');
const adoptionRoutes = require('./routes/adoptionRoutes');
const donationRoutes = require('./routes/donationRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const scanRoutes = require('./routes/scanRoutes');
const authRoutes = require('./routes/authRoutes');
const vetInventoryRoutes = require('./routes/vetInventoryRoutes');
const vetAppointmentRoutes = require('./routes/vetAppointmentRoutes');
const vetDirectoryRoutes = require('./routes/vetDirectoryRoutes');
const qrTokenRoutes = require('./routes/qrTokenRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/rescues', rescueRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api', scanRoutes);
app.use('/api/vetinventory', vetInventoryRoutes);
app.use('/api/vetappointments', vetAppointmentRoutes);
app.use('/api/vets', vetDirectoryRoutes);
app.use('/api', qrTokenRoutes);

app.get('/', (req, res) => res.send('PetLink API running'));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
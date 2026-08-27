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

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/animals', animalRoutes);
app.use('/api/rescues', rescueRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api', scanRoutes);

app.get('/', (req, res) => res.send('PetLink API running'));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
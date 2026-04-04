/**
 * Seed the logo setting into the database
 * Run: node server/scripts/seed-logo.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { mongoURI } = require('../config/keys');
const SiteSetting = require('../models/SiteSetting');

async function seed() {
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');

  // Store logo configuration
  const logoSetting = await SiteSetting.findOneAndUpdate(
    { key: 'site_logo' },
    {
      key: 'site_logo',
      value: {
        url: '/logo.svg',
        alt: 'AECC',
        description: 'Logo officiel de l\'AECC — Association des Étudiants Congolais en Chine'
      }
    },
    { upsert: true, new: true }
  );
  console.log('Logo setting saved:', logoSetting.value.url);

  // Store site name
  await SiteSetting.findOneAndUpdate(
    { key: 'site_name' },
    { key: 'site_name', value: 'AECC — Association des Étudiants Congolais en Chine' },
    { upsert: true, new: true }
  );
  console.log('Site name saved');

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(err => { console.error(err); process.exit(1); });

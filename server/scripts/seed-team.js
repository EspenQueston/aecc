/**
 * Seed team members into SiteSetting.team_members
 * Run: node server/scripts/seed-team.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { mongoURI } = require('../config/keys');
const SiteSetting = require('../models/SiteSetting');

const TEAM_VALUE = {
  bureau: [
    {
      slug: 'rinel',
      name: 'Rinel',
      role: 'Président',
      email: 'president@aecc.org'
    },
    {
      slug: 'cleve',
      name: 'Cleve',
      role: 'Secrétaire Général',
      email: 'secretariat@aecc.org'
    },
    {
      slug: 'mabiala',
      name: 'Roland Naguydem Mabiala',
      role: 'Secrétaire Socio-culturel',
      email: 'mabialaroland@hotmail.com'
    },
    {
      slug: 'exauce',
      name: 'Exauce',
      role: 'Trésorier Général',
      email: 'tresorerie@aecc.org'
    },
    {
      slug: 'cluivert',
      name: 'Cluivert Moukendi',
      role: 'Responsable Technique',
      email: 'cluivertmoukendi@gmail.com'
    }
  ],
  commission: [
    {
      slug: 'gloire',
      name: 'Gloire',
      role: 'Commissaire',
      email: 'discipline@aecc.org'
    },
    {
      slug: 'diba-grace',
      name: 'Diba Grace',
      role: 'Rapporteur',
      email: 'dibawang@hotmail.com',
      phone: '+18810511839',
      languages: ['Français', 'Anglais', 'Espagnol', 'Chinois'],
      education: {
        degree: 'Bachelor of Arts in International Chinese Education',
        university: 'Beijing Foreign Studies University',
        level: '3e année'
      }
    }
  ],
  updatedAt: new Date().toISOString()
};

async function seedTeam() {
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');

  const saved = await SiteSetting.findOneAndUpdate(
    { key: 'team_members' },
    { key: 'team_members', value: TEAM_VALUE },
    { upsert: true, new: true }
  );

  console.log('team_members setting saved with', saved.value?.commission?.length || 0, 'commission members');

  await mongoose.disconnect();
  console.log('Done!');
}

seedTeam().catch((err) => {
  console.error(err);
  process.exit(1);
});

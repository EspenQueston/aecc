const mongoose = require('mongoose');
const Resource = require('../models/Resource');

async function updateLinks() {
  await mongoose.connect('mongodb://127.0.0.1:27017/congolese-students-china');

  const updates = [
    {
      id: '69ce6d0ddfeec1494fd55ebd',
      externalUrl: 'https://www.travelchinaguide.com/essential/survival-guide.htm'
    },
    {
      id: '69ce6d0ddfeec1494fd55ebf',
      externalUrl: 'https://europass.cedefop.europa.eu/fr/create-europass-cv'
    },
    {
      id: '69ce6d0ddfeec1494fd55ec5',
      externalUrl: 'https://www.echinacities.com/jobs'
    },
    {
      id: '69ce6d0ddfeec1494fd55ec3',
      externalUrl: 'https://wise.com/fr/send-money/envoyer-argent-en-chine'
    },
    {
      id: '69ce6d0ddfeec1494fd55ec4',
      externalUrl: 'https://www.china-briefing.com/news/china-visa-types-requirements/'
    }
  ];

  for (const u of updates) {
    const res = await Resource.findByIdAndUpdate(u.id, { externalUrl: u.externalUrl }, { new: true });
    console.log(`Updated: ${res.title} -> ${res.externalUrl}`);
  }

  // Verify all resources now have real links
  const all = await Resource.find({}, 'title externalUrl fileUrl');
  console.log('\n--- All resources ---');
  all.forEach(r => {
    const url = r.externalUrl || r.fileUrl || 'NO LINK';
    const ok = url !== '#' && url !== 'NO LINK' ? 'OK' : 'MISSING';
    console.log(`[${ok}] ${r.title} -> ${url}`);
  });

  await mongoose.disconnect();
}

updateLinks().catch(console.error);

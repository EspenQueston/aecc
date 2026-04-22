const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://localhost:27017/congolese_students_dev');
  const result = await mongoose.connection.db.collection('learningresources').updateOne(
    { title: /ScholarQuest/i },
    { $set: { title: 'ScholarQuest', url: 'https://scholarquest.xyz' } }
  );
  console.log(result.modifiedCount, 'document(s) updated');
  await mongoose.disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });

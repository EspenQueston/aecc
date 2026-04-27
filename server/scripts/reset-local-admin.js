const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function main() {
  const hash = await bcrypt.hash('Admin@1234', 10);
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017/congolese_students_dev');
  const db = client.db();
  const result = await db.collection('users').updateOne(
    { email: 'cluivertmoukendi@gmail.com' },
    { $set: { password: hash, emailVerified: true } }
  );
  console.log('Password reset. Modified:', result.modifiedCount);
  client.close();
}

main().catch(console.error);

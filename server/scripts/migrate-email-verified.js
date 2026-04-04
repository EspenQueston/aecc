const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/congolese-students-china';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
    const result = await mongoose.connection.db.collection('users').updateMany(
      { isEmailVerified: { $exists: false } },
      { $set: { isEmailVerified: true } }
    );
    console.log(`Migrated ${result.modifiedCount} existing users to isEmailVerified: true`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

migrate();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/congolese-students-china';

async function resetAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    const User = require('../models/User');

    const email = process.env.ADMIN_EMAIL || 'cluivertmoukendi@gmail.com';
    const plainPassword = process.env.ADMIN_PASSWORD;

    if (!plainPassword) {
      console.error('❌ ADMIN_PASSWORD environment variable is required.');
      console.error('Usage: ADMIN_PASSWORD=YourSecurePass node server/scripts/reset-admin.js');
      process.exit(1);
    }

    // Delete existing admin to avoid password re-hash issues
    await User.deleteOne({ email });
    console.log(`Deleted existing user ${email} (if any)`);

    // Hash password manually to avoid any model hook issues
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Insert directly via collection to bypass all hooks
    const result = await User.collection.insertOne({
      firstName: 'Cluivert',
      lastName: 'Moukendi',
      secondName: '',
      email: email,
      password: hashedPassword,
      role: 'admin',
      dateOfBirth: new Date('1995-01-01'),
      gender: 'male',
      passportNumber: 'OA' + Math.floor(1000000 + Math.random() * 9000000),
      phoneNumber: '13800000000',
      wechatId: 'cluivert_aecc',
      province: 'Beijing',
      city: 'Beijing',
      lastEntryDate: new Date('2023-09-01'),
      university: 'Beijing University',
      fieldOfStudy: 'Computer Science',
      degreeLevel: 'master',
      yearOfAdmission: 2023,
      expectedGraduation: new Date('2026-06-30'),
      scholarshipStatus: 'yes',
      scholarshipType: 'Chinese Government Scholarship',
      studentId: 'ADMIN001',
      twoFactorEnabled: false,
      createdAt: new Date()
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('========================================');
    console.log(`Email:    ${email}`);
    console.log(`Role:     admin`);
    console.log('========================================');

    // Verify login works
    const user = await User.findOne({ email }).select('+password');
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    console.log(`\nPassword verification: ${isMatch ? '✅ PASS' : '❌ FAIL'}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

resetAdmin();

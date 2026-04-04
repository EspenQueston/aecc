const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// List of allowed admin emails
const allowedAdminEmails = [
  'cluivertmoukendi@gmail.com',
  'admin@aecc.org' // Default admin
];

// Generate a unique passport number
async function generateUniquePassportNumber() {
  const prefix = 'OA';
  let isUnique = false;
  let passportNumber;
  
  while (!isUnique) {
    const randomNum = Math.floor(1000000 + Math.random() * 9000000); // 7-digit number
    passportNumber = `${prefix}${randomNum}`;
    
    // Check if this passport number already exists
    const existingUser = await User.findOne({ passportNumber });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return passportNumber;
}

// Admin user data
async function getAdminData() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('❌ ADMIN_PASSWORD environment variable is required.');
    console.error('Usage: ADMIN_PASSWORD=YourSecurePass node server/scripts/create-admin.js');
    process.exit(1);
  }
  return {
    firstName: 'Admin',
    lastName: 'AECC',
    email: 'cluivertmoukendi@gmail.com',
    password: adminPassword,
    role: 'admin',
    // Required fields for the User model
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    passportNumber: await generateUniquePassportNumber(),
    phoneNumber: '12345678901',
    wechatId: '12345678901',
    lastEntryDate: new Date(),
    university: 'Admin University',
    fieldOfStudy: 'Administration',
    degreeLevel: 'master',
    expectedGraduation: new Date('2025-12-31'),
    scholarshipStatus: 'yes',
    scholarshipType: 'Chinese Government Scholarship'
  };
}

// Create or update admin user
async function createAdmin() {
  try {
    for (const adminEmail of allowedAdminEmails) {
      // Check if admin already exists
      let admin = await User.findOne({ email: adminEmail });

      if (admin) {
        console.log(`Admin user ${adminEmail} already exists. Updating role to admin...`);
        admin.role = 'admin';
        await admin.save();
        console.log(`Admin user ${adminEmail} updated successfully!`);
      } else {
        // Create new admin user
        const adminData = await getAdminData();
        adminData.email = adminEmail;
        admin = new User(adminData);
        await admin.save();
        console.log(`Admin user ${adminEmail} created successfully!`);
        console.log(`Email: ${adminData.email}`);
      }
    }

    // Disconnect from MongoDB
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();

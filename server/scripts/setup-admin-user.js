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

// Admin credentials — from environment variables
const adminEmail = process.env.ADMIN_EMAIL || 'cluivertmoukendi@gmail.com';
const newPassword = process.env.ADMIN_PASSWORD;

if (!newPassword) {
  console.error('❌ ADMIN_PASSWORD environment variable is required.');
  console.error('Usage: ADMIN_PASSWORD=YourSecurePass node server/scripts/setup-admin-user.js');
  process.exit(1);
}

async function updateAdminPassword() {
  try {
    console.log('Updating admin password...');
    
    // Find the admin user
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('Admin user not found. Creating new admin user...');
      
      // Generate a unique passport number
      const prefix = 'OA';
      let isUnique = false;
      let passportNumber;
      
      while (!isUnique) {
        const randomNum = Math.floor(1000000 + Math.random() * 9000000);
        passportNumber = `${prefix}${randomNum}`;
        
        const existingUser = await User.findOne({ passportNumber });
        if (!existingUser) {
          isUnique = true;
        }
      }
      
      // Create new admin user
      admin = new User({
        firstName: 'Cluivert',
        lastName: 'Moukendi',
        email: adminEmail,
        password: newPassword,
        role: 'admin',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        passportNumber: passportNumber,
        phoneNumber: '12345678901',
        wechatId: 'cluivert_admin',
        lastEntryDate: new Date(),
        university: 'Admin University',
        fieldOfStudy: 'Administration',
        degreeLevel: 'master',
        expectedGraduation: new Date('2025-12-31'),
        scholarshipStatus: 'yes',
        scholarshipType: 'Chinese Government Scholarship'
      });
      
      await admin.save();
      console.log('✅ New admin user created successfully!');
    } else {
      console.log('Admin user found. Updating password and role...');
      
      // Update password and ensure admin role
      admin.password = newPassword;
      admin.role = 'admin';
      
      // The password will be automatically hashed by the pre-save hook
      await admin.save();
      console.log('✅ Admin password and role updated successfully!');
    }
    
    console.log('\n=== ADMIN ACCOUNT READY ===');
    console.log(`Email: ${adminEmail}`);
    console.log(`Role: admin`);
    console.log('\n📝 Password was set from ADMIN_PASSWORD env variable.');
    console.log('🔗 Admin Panel URL: http://localhost:5000/admin/login.html');
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('\n✅ Script completed. Database connection closed.');
  }
}

updateAdminPassword();

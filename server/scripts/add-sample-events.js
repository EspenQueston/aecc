require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

const addSampleEvents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/congolese-students-china');
    console.log('MongoDB Connected');
    
    // Check if we have any users (for organizer reference)
    const users = await User.find({});
    if (users.length === 0) {
      console.log('❌ No users found. Creating a default admin user first...');
      
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@aecc.org',
        password: hashedPassword,
        role: 'admin',
        phoneNumber: '12345678901',
        wechatId: '12345678901',
        passportNumber: 'OA1234567',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        province: 'Beijing',
        city: 'beijing',
        lastEntryDate: new Date(),
        university: 'Beijing University',
        fieldOfStudy: 'Computer Science',
        degreeLevel: 'Bachelor',
        yearOfAdmission: 2020,
        expectedGraduation: new Date('2024-06-01'),
        scholarshipStatus: 'Yes',
        scholarshipType: 'Full Scholarship',
        studentId: 'STU001'
      });
      
      await adminUser.save();
      console.log('✅ Admin user created');
      users.push(adminUser);
    }
    
    const organizer = users[0];
    
    // Sample events data
    const sampleEvents = [
      {
        title: 'Welcome Ceremony for New Students 2025',
        description: 'Join us for a warm welcome ceremony to introduce new Congolese students to our community. This event will include orientation sessions, campus tours, and networking opportunities with current students and faculty.',
        location: 'Beijing University Main Hall',
        startDate: new Date('2025-07-15T14:00:00'),
        endDate: new Date('2025-07-15T17:00:00'),
        type: 'academic',
        organizer: organizer._id,
        image: '/uploads/events/welcome-ceremony.jpg'
      },
      {
        title: 'Cultural Exchange: Congolese Music and Dance Workshop',
        description: 'Experience the rich cultural heritage of Congo through traditional music and dance. Learn about different ethnic groups, their musical instruments, and participate in interactive dance sessions.',
        location: 'Shanghai Cultural Center',
        startDate: new Date('2025-07-20T18:00:00'),
        endDate: new Date('2025-07-20T21:00:00'),
        type: 'cultural',
        organizer: organizer._id,
        image: '/uploads/events/cultural-exchange.jpg'
      },
      {
        title: 'Career Development Seminar: Opportunities in China',
        description: 'Explore career opportunities for international students in China. This seminar will cover visa regulations, job search strategies, networking tips, and success stories from alumni.',
        location: 'Guangzhou Business District Conference Center',
        startDate: new Date('2025-07-25T10:00:00'),
        endDate: new Date('2025-07-25T16:00:00'),
        type: 'seminar',
        organizer: organizer._id,
        image: '/uploads/events/career-seminar.jpg'
      },
      {
        title: 'Study Group: Mandarin Language Exchange',
        description: 'Weekly Mandarin language practice sessions with native Chinese speakers. Improve your language skills while making new friends and learning about Chinese culture.',
        location: 'Online (Zoom)',
        startDate: new Date('2025-07-28T19:00:00'),
        endDate: new Date('2025-07-28T21:00:00'),
        type: 'academic',
        organizer: organizer._id,
        image: '/uploads/events/language-exchange.jpg'
      },
      {
        title: 'AECC Annual Networking Gala 2025',
        description: 'Our annual networking gala brings together Congolese students, professionals, and community leaders. Enjoy traditional Congolese cuisine, cultural performances, and valuable networking opportunities.',
        location: 'Beijing International Hotel',
        startDate: new Date('2025-08-05T18:30:00'),
        endDate: new Date('2025-08-05T23:00:00'),
        type: 'networking',
        organizer: organizer._id,
        image: '/uploads/events/networking-gala.jpg'
      },
      {
        title: 'Academic Writing Workshop for Graduate Students',
        description: 'Enhance your academic writing skills with this comprehensive workshop. Topics include research methodology, thesis writing, academic formatting, and publication strategies.',
        location: 'Tsinghua University Library',
        startDate: new Date('2025-08-10T09:00:00'),
        endDate: new Date('2025-08-10T17:00:00'),
        type: 'workshop',
        organizer: organizer._id,
        image: '/uploads/events/writing-workshop.jpg'
      }
    ];
    
    // Clear existing events
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing events');
    
    // Insert sample events
    const events = await Event.insertMany(sampleEvents);
    console.log(`✅ Added ${events.length} sample events to the database`);
    
    // Display the events
    console.log('\n📅 EVENTS ADDED:');
    console.log('================');
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. 📌 ${event.title}`);
      console.log(`   📍 ${event.location}`);
      console.log(`   📅 ${new Date(event.startDate).toLocaleDateString()} at ${new Date(event.startDate).toLocaleTimeString()}`);
      console.log(`   🏷️  ${event.type}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

addSampleEvents();

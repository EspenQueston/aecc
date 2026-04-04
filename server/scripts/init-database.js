const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Blog = require('../models/Blog');
const Event = require('../models/Event');
const Resource = require('../models/Resource');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

// Reset database function
const resetDatabase = async () => {
  try {
    console.log('🗄️  Resetting database...');
    
    // Drop all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`✅ Dropped collection: ${collection.name}`);
    }
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
  }
};

// Create indexes function
const createIndexes = async () => {
  try {
    console.log('📚 Creating database indexes...');
    
    // User indexes
    await User.createIndexes();
    console.log('✅ User indexes created');
    
    // Profile indexes
    await Profile.createIndexes();
    console.log('✅ Profile indexes created');
    
    // Blog indexes
    await Blog.createIndexes();
    console.log('✅ Blog indexes created');
    
    // Event indexes
    await Event.createIndexes();
    console.log('✅ Event indexes created');
    
    // Resource indexes
    await Resource.createIndexes();
    console.log('✅ Resource indexes created');
    
    // Additional custom indexes for better performance
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ passportNumber: 1 }, { unique: true });
    await User.collection.createIndex({ createdAt: -1 });
    
    await Blog.collection.createIndex({ category: 1 });
    await Blog.collection.createIndex({ createdAt: -1 });
    await Blog.collection.createIndex({ title: 'text', content: 'text' });
    
    await Event.collection.createIndex({ startDate: 1 });
    await Event.collection.createIndex({ location: 1 });
    
    await Resource.collection.createIndex({ type: 1 });
    await Resource.collection.createIndex({ category: 1 });
    
    console.log('✅ All indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

// Sample data creation
const createSampleData = async () => {
  try {
    console.log('🌱 Creating sample data...');
    
    // Create sample users
    const sampleUsers = [
      {
        firstName: 'Jean',
        lastName: 'Mukendi',
        secondName: 'Claude',
        dateOfBirth: new Date('1995-03-15'),
        gender: 'male',
        passportNumber: 'OA1234567',
        phoneNumber: '18612345678',
        wechatId: 'jean_mukendi',
        province: 'beijing',
        city: 'beijing',
        lastEntryDate: new Date('2023-09-01'),
        university: 'Beijing University',
        fieldOfStudy: 'Computer Science',
        degreeLevel: 'master',
        yearOfAdmission: 2023,
        expectedGraduation: new Date('2025-06-30'),
        scholarshipStatus: 'yes',
        scholarshipType: 'Chinese Government Scholarship',
        studentId: 'BU2023CS001',
        email: 'jean.mukendi@example.com',
        password: 'password123',
        role: 'admin'
      },
      {
        firstName: 'Marie',
        lastName: 'Kalonda',
        dateOfBirth: new Date('1997-07-22'),
        gender: 'female',
        passportNumber: 'OA2345678',
        phoneNumber: '13987654321',
        wechatId: 'marie_kalonda',
        province: 'shanghai',
        city: 'shanghai',
        lastEntryDate: new Date('2024-02-15'),
        university: 'Shanghai Jiao Tong University',
        fieldOfStudy: 'International Business',
        degreeLevel: 'bachelor',
        yearOfAdmission: 2024,
        expectedGraduation: new Date('2028-06-30'),
        scholarshipStatus: 'no',
        studentId: 'SJTU2024IB002',
        email: 'marie.kalonda@example.com',
        password: 'password123',
        role: 'student'
      },
      {
        firstName: 'Pierre',
        lastName: 'Mbuyi',
        dateOfBirth: new Date('1993-11-08'),
        gender: 'male',
        passportNumber: 'OA3456789',
        phoneNumber: '15123456789',
        wechatId: 'pierre_mbuyi',
        province: 'guangdong',
        city: 'guangzhou',
        lastEntryDate: new Date('2022-08-20'),
        university: 'Sun Yat-sen University',
        fieldOfStudy: 'Medicine',
        degreeLevel: 'phd',
        yearOfAdmission: 2022,
        expectedGraduation: new Date('2026-12-31'),
        scholarshipStatus: 'yes',
        scholarshipType: 'University Scholarship',
        studentId: 'SYSU2022MED003',
        email: 'pierre.mbuyi@example.com',
        password: 'password123',
        role: 'student'
      }
    ];
    
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
    }
    
    // Create sample profiles
    const sampleProfiles = [
      {
        user: users[0]._id,
        bio: 'Computer Science student passionate about AI and machine learning. Love exploring Chinese culture and making new friends.',
        university: 'Beijing University',
        fieldOfStudy: 'Computer Science',
        yearOfStudy: '2nd Year Master',
        province: 'Beijing',
        city: 'Beijing',
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB'],
        social: {
          wechat: 'jean_mukendi',
          linkedin: 'jean-mukendi'
        }
      },
      {
        user: users[1]._id,
        bio: 'International Business student interested in China-Africa trade relationships. Enjoys traveling and photography.',
        university: 'Shanghai Jiao Tong University',
        fieldOfStudy: 'International Business',
        yearOfStudy: '1st Year Bachelor',
        province: 'Shanghai',
        city: 'Shanghai',
        skills: ['Business Analysis', 'Market Research', 'Chinese Language', 'Photography'],
        social: {
          wechat: 'marie_kalonda',
          instagram: 'marie_kalonda_photo'
        }
      }
    ];
    
    for (const profileData of sampleProfiles) {
      const profile = new Profile(profileData);
      await profile.save();
      console.log(`✅ Created profile for user: ${profileData.user}`);
    }
    
    // Create sample blogs
    const sampleBlogs = [
      {
        title: 'My First Year in Beijing: A Journey of Discovery',
        content: `
          <p>When I first arrived in Beijing in September 2023, I was both excited and nervous about starting my Master's degree in Computer Science. The city seemed overwhelming at first, but it quickly became my second home.</p>
          
          <h3>Academic Life</h3>
          <p>Beijing University has provided me with incredible opportunities to learn from world-class professors and collaborate with brilliant classmates from around the world. The research facilities are state-of-the-art, and I'm currently working on a machine learning project that could have real-world applications.</p>
          
          <h3>Cultural Experiences</h3>
          <p>Living in Beijing has exposed me to rich Chinese culture. From visiting the Forbidden City to trying authentic Peking duck, every day brings new experiences. I've also learned to navigate the subway system like a pro!</p>
          
          <h3>Challenges and Growth</h3>
          <p>The language barrier was initially challenging, but taking Mandarin classes and practicing with local friends has helped tremendously. I've learned that stepping out of your comfort zone is essential for personal growth.</p>
          
          <p>To fellow Congolese students considering studying in China, I encourage you to take the leap. The experience is transformative!</p>
        `,
        category: 'Academic Life',
        featuredImage: 'beijing-university.jpg',
        user: users[0]._id
      },
      {
        title: 'Navigating Shanghai as an International Student',
        content: `
          <p>Shanghai is an incredible city that perfectly blends tradition and modernity. As a first-year International Business student, I've had the opportunity to experience this dynamic metropolis from a unique perspective.</p>
          
          <h3>The Business Hub</h3>
          <p>Being in Shanghai gives me front-row seats to China's economic powerhouse. The city's financial district and international companies provide excellent internship opportunities and real-world learning experiences.</p>
          
          <h3>Cultural Fusion</h3>
          <p>What I love most about Shanghai is its cosmopolitan nature. You can find authentic Congolese restaurants, international shopping centers, and traditional Chinese gardens all within the same district.</p>
          
          <h3>Student Life</h3>
          <p>Shanghai Jiao Tong University has an amazing international student community. We organize cultural exchange events where I get to share Congolese traditions while learning about other cultures.</p>
        `,
        category: 'Cultural Experiences',
        featuredImage: 'shanghai-skyline.jpg',
        user: users[1]._id
      }
    ];
    
    for (const blogData of sampleBlogs) {
      const blog = new Blog(blogData);
      await blog.save();
      console.log(`✅ Created blog: ${blog.title}`);
    }
    
    // Create sample events
    const sampleEvents = [
      {
        title: 'Congolese Cultural Night 2025',
        description: 'Join us for an evening celebrating Congolese culture with traditional music, dance, and food. Open to all students and faculty.',
        location: 'Beijing University Cultural Center',
        startDate: new Date('2025-07-15T18:00:00'),
        endDate: new Date('2025-07-15T22:00:00'),
        image: 'cultural-night.jpg',
        organizer: users[0]._id
      },
      {
        title: 'Career Fair: China-Africa Business Opportunities',
        description: 'Connect with leading companies operating between China and Africa. Network with professionals and explore career opportunities.',
        location: 'Shanghai International Convention Center',
        startDate: new Date('2025-08-20T09:00:00'),
        endDate: new Date('2025-08-20T17:00:00'),
        image: 'career-fair.jpg',
        organizer: users[1]._id
      },
      {
        title: 'Medical Research Symposium',
        description: 'Presentation of latest research in medical sciences with focus on tropical diseases and public health.',
        location: 'Sun Yat-sen University Medical School',
        startDate: new Date('2025-09-10T10:00:00'),
        endDate: new Date('2025-09-10T16:00:00'),
        image: 'medical-symposium.jpg',
        organizer: users[2]._id
      }
    ];
    
    for (const eventData of sampleEvents) {
      const event = new Event(eventData);
      await event.save();
      console.log(`✅ Created event: ${event.title}`);
    }
    
    // Create sample resources
    const sampleResources = [
      {
        title: 'Chinese Government Scholarship Application Guide',
        description: 'Comprehensive guide on how to apply for Chinese Government Scholarships, including requirements, deadlines, and tips for success.',
        type: 'Document',
        category: 'Scholarship',
        externalUrl: 'https://www.campuschina.org/',
        thumbnail: 'scholarship-guide.jpg',
        user: users[0]._id
      },
      {
        title: 'Visa Extension Procedures in China',
        description: 'Step-by-step guide on how to extend your student visa in China, including required documents and fees.',
        type: 'Document',
        category: 'Administrative',
        fileUrl: '/uploads/visa-extension-guide.pdf',
        thumbnail: 'visa-guide.jpg',
        user: users[0]._id
      },
      {
        title: 'Chinese Language Learning Resources',
        description: 'Collection of apps, websites, and books to help you learn Mandarin Chinese effectively.',
        type: 'Blog',
        category: 'Academic',
        externalUrl: 'https://www.hsk.academy/',
        thumbnail: 'chinese-learning.jpg',
        user: users[1]._id
      },
      {
        title: 'Congo Students WeChat Group',
        description: 'Join our official WeChat group to connect with other Congolese students across China.',
        type: 'Telegram',
        category: 'General',
        externalUrl: 'https://t.me/congolese_students_china',
        thumbnail: 'wechat-group.jpg',
        user: users[0]._id
      },
      {
        title: 'Job Search Guide for International Students',
        description: 'Tips and strategies for finding employment in China as an international student.',
        type: 'Tutorial',
        category: 'Career',
        fileUrl: '/uploads/job-search-guide.pdf',
        thumbnail: 'job-search.jpg',
        user: users[2]._id
      }
    ];
    
    for (const resourceData of sampleResources) {
      const resource = new Resource(resourceData);
      await resource.save();
      console.log(`✅ Created resource: ${resource.title}`);
    }
    
    console.log('🎉 Sample data creation completed successfully!');
    
    // Display summary
    console.log('\n📊 Database Summary:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`📄 Profiles: ${await Profile.countDocuments()}`);
    console.log(`📝 Blogs: ${await Blog.countDocuments()}`);
    console.log(`📅 Events: ${await Event.countDocuments()}`);
    console.log(`📚 Resources: ${await Resource.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  }
};

// Main initialization function
const initializeDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Connect to database
    await connectDB();
    
    // Reset database (drop all collections)
    await resetDatabase();
    
    // Create indexes
    await createIndexes();
    
    // Create sample data
    await createSampleData();
    
    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📋 Default Admin Credentials:');
    console.log('   Email: jean.mukendi@example.com');
    console.log('   Password: password123');
    console.log('\n📋 Sample Student Credentials:');
    console.log('   Email: marie.kalonda@example.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed.');
    process.exit(0);
  }
};

// Run the initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = {
  initializeDatabase,
  resetDatabase,
  createIndexes,
  createSampleData
};

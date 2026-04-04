const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Event = require('../models/Event');
const Resource = require('../models/Resource');
// WordPress models
const Post = require('../models/wordpress/Post');
const PostMeta = require('../models/wordpress/PostMeta');
const Term = require('../models/wordpress/Term');
const TermTaxonomy = require('../models/wordpress/TermTaxonomy');
const TermRelationship = require('../models/wordpress/TermRelationship');
const Comment = require('../models/wordpress/Comment');
const CommentMeta = require('../models/wordpress/CommentMeta');

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

// Database information
const getDatabaseInfo = async () => {
  try {
    await connectDB();
    
    console.log('\n🗄️  DATABASE INFORMATION');
    console.log('=' .repeat(50));
    
    // Database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Database Name: ${dbName}`);
    console.log(`🔗 Connection URI: ${process.env.MONGO_URI}`);
    
    // Collections information
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📁 Collections (${collections.length}):`);
    
    for (const collection of collections) {
      const stats = await mongoose.connection.db.collection(collection.name).stats();
      console.log(`   • ${collection.name}:`);
      console.log(`     - Documents: ${stats.count || 0}`);
      console.log(`     - Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`     - Indexes: ${stats.nindexes || 0}`);
    }
    
    // Models statistics
    console.log('\n📈 Model Statistics:');
    const userCount = await User.countDocuments();
    const profileCount = await Profile.countDocuments();
    const postCount = await Post.countDocuments();
    const eventCount = await Event.countDocuments();
    const resourceCount = await Resource.countDocuments();
    const commentCount = await Comment.countDocuments();
    const termCount = await Term.countDocuments();
    
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   📄 Profiles: ${profileCount}`);
    console.log(`   📝 Blog Posts: ${postCount}`);
    console.log(`   📅 Events: ${eventCount}`);
    console.log(`   📚 Resources: ${resourceCount}`);
    console.log(`   💬 Comments: ${commentCount}`);
    console.log(`   🏷️  Terms (Categories/Tags): ${termCount}`);
    
    // Schema information
    console.log('\n🏗️  Schema Information:');
    console.log('   User Schema Fields:');
    const userFields = Object.keys(User.schema.paths);
    userFields.forEach(field => {
      if (!field.startsWith('_')) {
        const fieldInfo = User.schema.paths[field];
        console.log(`     • ${field}: ${fieldInfo.instance || 'Mixed'}`);
      }
    });
    
    // Indexes information
    console.log('\n📇 Indexes:');
    for (const model of [User, Profile, Blog, Event, Resource]) {
      const indexes = await model.collection.getIndexes();
      console.log(`   ${model.modelName}:`);
      Object.keys(indexes).forEach(indexName => {
        console.log(`     • ${indexName}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting database info:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

// Clear specific collection
const clearCollection = async (collectionName) => {
  try {
    await connectDB();
    
    const validCollections = ['users', 'profiles', 'posts', 'postmetas', 'terms', 'termtaxonomies', 'termrelationships', 'comments', 'commentmetas', 'events', 'resources'];
    
    if (!validCollections.includes(collectionName)) {
      console.log(`❌ Invalid collection name. Valid options: ${validCollections.join(', ')}`);
      return;
    }
    
    // Map collection names to actual MongoDB collection names
    const collectionMap = {
      'posts': 'posts',
      'blogs': 'posts', // For backward compatibility
      'postmetas': 'postmetas',
      'terms': 'terms',
      'termtaxonomies': 'termtaxonomies', 
      'termrelationships': 'termrelationships',
      'comments': 'comments',
      'commentmetas': 'commentmetas'
    };
    
    const actualCollectionName = collectionMap[collectionName] || collectionName;
    
    await mongoose.connection.db.collection(actualCollectionName).deleteMany({});
    console.log(`✅ Cleared collection: ${actualCollectionName}`);
    
  } catch (error) {
    console.error('❌ Error clearing collection:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

// Reset password for a user
const resetUserPassword = async (email, newPassword = 'password123') => {
  try {
    await connectDB();
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      return;
    }
    
    user.password = newPassword;
    await user.save();
    
    console.log(`✅ Password reset for user: ${user.firstName} ${user.lastName}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    await connectDB();
    
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      passportNumber: 'OA0000000',
      phoneNumber: '10000000000',
      wechatId: 'admin_user',
      province: 'beijing',
      city: 'beijing',
      lastEntryDate: new Date(),
      university: 'Administrative',
      fieldOfStudy: 'Administration',
      degreeLevel: 'other',
      yearOfAdmission: new Date().getFullYear(),
      expectedGraduation: new Date(),
      scholarshipStatus: 'no',
      studentId: 'ADMIN001',
      email: 'admin@congolese-students.org',
      password: 'admin123456',
      role: 'admin'
    };
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log(`📧 Email: ${adminData.email}`);
      return;
    }
    
    const admin = new User(adminData);
    await admin.save();
    
    console.log('✅ Admin user created successfully');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

// List all users
const listUsers = async () => {
  try {
    await connectDB();
    
    const users = await User.find({}, 'firstName lastName email role createdAt').sort({ createdAt: -1 });
    
    console.log(`\n👥 All Users (${users.length}):`);
    console.log('=' .repeat(70));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👑 Role: ${user.role}`);
      console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

const showHelp = () => {
  console.log(`
🗄️  Congolese Students China - Database Management Tool

Usage: node scripts/db-manager.js [command] [options]

Commands:
  info                     Show database information and statistics
  clear <collection>       Clear specific collection (users, profiles, blogs, events, resources)
  reset-password <email>   Reset user password to default (password123)
  create-admin            Create admin user
  list-users              List all users
  help                    Show this help message

Examples:
  node scripts/db-manager.js info
  node scripts/db-manager.js clear users
  node scripts/db-manager.js reset-password marie.kalonda@example.com
  node scripts/db-manager.js create-admin
  node scripts/db-manager.js list-users
  `);
};

// Main execution
const main = async () => {
  switch (command) {
    case 'info':
      await getDatabaseInfo();
      break;
    case 'clear':
      if (args[1]) {
        await clearCollection(args[1]);
      } else {
        console.log('❌ Please specify collection name');
        showHelp();
      }
      break;
    case 'reset-password':
      if (args[1]) {
        await resetUserPassword(args[1], args[2]);
      } else {
        console.log('❌ Please specify email address');
        showHelp();
      }
      break;
    case 'create-admin':
      await createAdminUser();
      break;
    case 'list-users':
      await listUsers();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
};

if (require.main === module) {
  main();
}

module.exports = {
  getDatabaseInfo,
  clearCollection,
  resetUserPassword,
  createAdminUser,
  listUsers
};

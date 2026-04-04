const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

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

// Create backup directory
const createBackupDir = () => {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
};

// Backup database
const backupDatabase = async () => {
  try {
    console.log('🔄 Starting database backup...');
    await connectDB();
    
    const backupDir = createBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    
    // Fetch all data
    const [users, profiles, blogs, events, resources] = await Promise.all([
      User.find({}).lean(),
      Profile.find({}).lean(),
      Blog.find({}).lean(),
      Event.find({}).lean(),
      Resource.find({}).lean()
    ]);
    
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: mongoose.connection.db.databaseName,
        collections: {
          users: users.length,
          profiles: profiles.length,
          blogs: blogs.length,
          events: events.length,
          resources: resources.length
        }
      },
      data: {
        users,
        profiles,
        blogs,
        events,
        resources
      }
    };
    
    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log('✅ Database backup completed successfully!');
    console.log(`📁 Backup file: ${backupFile}`);
    console.log(`📊 Backup size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);
    console.log('\n📈 Backup Statistics:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📄 Profiles: ${profiles.length}`);
    console.log(`   📝 Blogs: ${blogs.length}`);
    console.log(`   📅 Events: ${events.length}`);
    console.log(`   📚 Resources: ${resources.length}`);
    
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

// Restore database
const restoreDatabase = async (backupFile) => {
  try {
    console.log('🔄 Starting database restoration...');
    
    if (!fs.existsSync(backupFile)) {
      console.log('❌ Backup file not found');
      return;
    }
    
    await connectDB();
    
    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log('📄 Backup Information:');
    console.log(`   📅 Created: ${backupData.metadata.timestamp}`);
    console.log(`   🗄️  Database: ${backupData.metadata.database}`);
    console.log(`   📊 Collections: ${Object.entries(backupData.metadata.collections).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
    
    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Blog.deleteMany({}),
      Event.deleteMany({}),
      Resource.deleteMany({})
    ]);
    
    // Restore data
    console.log('📥 Restoring data...');
    const { users, profiles, blogs, events, resources } = backupData.data;
    
    if (users.length > 0) {
      await User.insertMany(users);
      console.log(`✅ Restored ${users.length} users`);
    }
    
    if (profiles.length > 0) {
      await Profile.insertMany(profiles);
      console.log(`✅ Restored ${profiles.length} profiles`);
    }
    
    if (blogs.length > 0) {
      await Blog.insertMany(blogs);
      console.log(`✅ Restored ${blogs.length} blogs`);
    }
    
    if (events.length > 0) {
      await Event.insertMany(events);
      console.log(`✅ Restored ${events.length} events`);
    }
    
    if (resources.length > 0) {
      await Resource.insertMany(resources);
      console.log(`✅ Restored ${resources.length} resources`);
    }
    
    console.log('\n🎉 Database restoration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error restoring database:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

// List available backups
const listBackups = () => {
  const backupDir = path.join(__dirname, '..', 'backups');
  
  if (!fs.existsSync(backupDir)) {
    console.log('📁 No backup directory found');
    return;
  }
  
  const backupFiles = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
    .sort()
    .reverse();
  
  if (backupFiles.length === 0) {
    console.log('📁 No backup files found');
    return;
  }
  
  console.log(`\n📦 Available Backups (${backupFiles.length}):`);
  console.log('=' .repeat(60));
  
  backupFiles.forEach((file, index) => {
    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);
    const timestamp = file.replace('backup-', '').replace('.json', '').replace(/-/g, ':');
    
    console.log(`${index + 1}. ${file}`);
    console.log(`   📅 Created: ${stats.birthtime.toLocaleString()}`);
    console.log(`   📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   📁 Path: ${filePath}`);
    console.log('');
  });
};

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

const showHelp = () => {
  console.log(`
💾 Congolese Students China - Database Backup & Restore Tool

Usage: node scripts/backup-restore.js [command] [options]

Commands:
  backup                   Create a backup of the entire database
  restore <backup-file>    Restore database from backup file
  list                     List available backup files
  help                     Show this help message

Examples:
  node scripts/backup-restore.js backup
  node scripts/backup-restore.js restore backups/backup-2025-06-25T10-30-00.json
  node scripts/backup-restore.js list

Notes:
  - Backups are stored in the 'backups' directory
  - Backup files are named with timestamp: backup-YYYY-MM-DDTHH-MM-SS.json
  - Restore operation will clear existing data before importing backup
  `);
};

// Main execution
const main = async () => {
  switch (command) {
    case 'backup':
      await backupDatabase();
      break;
    case 'restore':
      if (args[1]) {
        await restoreDatabase(args[1]);
      } else {
        console.log('❌ Please specify backup file path');
        showHelp();
      }
      break;
    case 'list':
      listBackups();
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
  backupDatabase,
  restoreDatabase,
  listBackups
};

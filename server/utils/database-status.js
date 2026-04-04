const mongoose = require('mongoose');

// Simple database health check
const checkDatabaseHealth = async () => {
  try {
    // Check if we can connect to the database
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    // Check if we can perform a simple query
    const adminDb = conn.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    
    // Get basic statistics
    const stats = await conn.connection.db.stats();
    
    return {
      status: 'healthy',
      connected: true,
      database: conn.connection.name,
      host: conn.connection.host,
      port: conn.connection.port,
      mongoVersion: serverStatus.version,
      uptime: serverStatus.uptime,
      collections: stats.collections,
      dataSize: Math.round(stats.dataSize / 1024), // Convert to KB
      storageSize: Math.round(stats.storageSize / 1024), // Convert to KB
      indexes: stats.indexes,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Get collection counts
const getCollectionCounts = async () => {
  try {
    const User = require('../models/User');
    const Profile = require('../models/Profile');
    const Blog = require('../models/Blog');
    const Event = require('../models/Event');
    const Resource = require('../models/Resource');

    const [userCount, profileCount, blogCount, eventCount, resourceCount] = await Promise.all([
      User.countDocuments(),
      Profile.countDocuments(),
      Blog.countDocuments(),
      Event.countDocuments(),
      Resource.countDocuments()
    ]);

    return {
      users: userCount,
      profiles: profileCount,
      blogs: blogCount,
      events: eventCount,
      resources: resourceCount,
      total: userCount + profileCount + blogCount + eventCount + resourceCount
    };
  } catch (error) {
    throw new Error(`Failed to get collection counts: ${error.message}`);
  }
};

// Database status for monitoring
const getDatabaseStatus = async () => {
  try {
    const health = await checkDatabaseHealth();
    
    if (health.connected) {
      const counts = await getCollectionCounts();
      return {
        ...health,
        collections: counts
      };
    } else {
      return health;
    }
  } catch (error) {
    return {
      status: 'error',
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

module.exports = {
  checkDatabaseHealth,
  getCollectionCounts,
  getDatabaseStatus
};

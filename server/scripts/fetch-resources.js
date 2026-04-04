const mongoose = require('mongoose');
const config = require('config');
const Resource = require('../models/Resource');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = config.get('mongoURI');
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected...');
    
    // Fetch all resources
    const resources = await Resource.find().sort({ createdAt: -1 });
    console.log(JSON.stringify(resources, null, 2));
    
    mongoose.connection.close();
    console.log('MongoDB Connection Closed');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Blog = require('../models/Blog');
const User = require('../models/User');

const addTestBlog = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get the first user to assign as author
    const user = await User.findOne();
    
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }
    
    // Create a new test blog
    const testBlog = new Blog({
      title: 'Life as a Student in Guangzhou: A Medical Student\'s Perspective',
      content: `
        <p>Studying medicine in Guangzhou has been one of the most challenging yet rewarding experiences of my life. As a Congolese student at Sun Yat-sen University, I've had the opportunity to learn from some of the best medical professionals in China.</p>
        
        <h3>Academic Excellence</h3>
        <p>The medical program here is rigorous and comprehensive. We spend countless hours in laboratories, attending lectures, and practicing clinical skills. The university provides excellent resources including state-of-the-art simulation labs and access to teaching hospitals.</p>
        
        <h3>Cultural Integration</h3>
        <p>Living in Guangzhou has exposed me to Cantonese culture, which is distinct from other parts of China. The food scene is incredible, and I've learned to appreciate dim sum and traditional Cantonese dishes alongside familiar African cuisine available in the city.</p>
        
        <h3>Clinical Experience</h3>
        <p>The clinical rotations have been invaluable. Working with Chinese doctors and patients has improved my Mandarin significantly and given me insights into healthcare practices that I can potentially bring back to Congo.</p>
        
        <p>For aspiring medical students considering China, I highly recommend it. The education quality is world-class, and the cultural experience is unmatched.</p>
      `,
      category: 'Academic Life',
      featuredImage: 'guangzhou-medical.jpg',
      user: user._id
    });
    
    await testBlog.save();
    console.log('✅ Test blog added successfully:');
    console.log(`   Title: ${testBlog.title}`);
    console.log(`   Category: ${testBlog.category}`);
    console.log(`   Author: ${user.firstName} ${user.lastName}`);
    console.log(`   ID: ${testBlog._id}`);
    
  } catch (error) {
    console.error('❌ Error adding test blog:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

addTestBlog();

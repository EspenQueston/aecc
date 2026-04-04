const mongoose = require('mongoose');
const config = require('config');
const Event = require('../models/Event');

const showEvents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.get('mongoURI') || 'mongodb://127.0.0.1:27017/congolese-students-china');
    console.log('MongoDB Connected');
    
    // Get all events
    const events = await Event.find({}).populate('organizer', ['firstName', 'lastName']);
    
    console.log('\n📅 CURRENT EVENTS IN DATABASE');
    console.log('========================================');
    
    if (events.length === 0) {
      console.log('❌ No events found in database');
    } else {
      events.forEach((event, index) => {
        console.log(`\n${index + 1}. 📌 ${event.title}`);
        console.log(`   📍 Location: ${event.location}`);
        console.log(`   📅 Start: ${new Date(event.startDate).toLocaleDateString()} ${new Date(event.startDate).toLocaleTimeString()}`);
        console.log(`   📅 End: ${new Date(event.endDate).toLocaleDateString()} ${new Date(event.endDate).toLocaleTimeString()}`);
        console.log(`   👤 Organizer: ${event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'Unknown'}`);
        console.log(`   📝 Description: ${event.description.substring(0, 80)}...`);
        console.log(`   🏷️  Type: ${event.type || 'general'}`);
        console.log(`   🆔 ID: ${event._id}`);
      });
    }
    
    console.log(`\n✅ Total events: ${events.length}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

showEvents();

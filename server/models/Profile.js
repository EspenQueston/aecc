const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bio: {
    type: String
  },
  // university, fieldOfStudy, province, city are read from User model via populate
  yearOfStudy: {
    type: String
  },
  skills: {
    type: [String]
  },
  social: {
    wechat: {
      type: String
    },
    whatsapp: {
      type: String
    },
    telegram: {
      type: String
    },
    facebook: {
      type: String
    },
    twitter: {
      type: String
    },
    instagram: {
      type: String
    },
    linkedin: {
      type: String
    }
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);

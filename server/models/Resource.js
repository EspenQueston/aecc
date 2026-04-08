const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  type: {
    type: String,
    required: [true, 'Please specify resource type'],
    enum: [
      'Document',
      'Video',
      'Blog',
      'Tutorial',
      'Course',
      'Telegram',
      'Scholarship',
      'External Link'
    ]
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Academic',
      'Administrative',
      'Cultural',
      'Career',
      'Employment',
      'Scholarship',
      'General'
    ]
  },
  fileUrl: {
    type: String
  },
  externalUrl: {
    type: String
  },
  thumbnail: {
    type: String,
    default: 'no-image.jpg'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure either fileUrl or externalUrl is provided
ResourceSchema.pre('save', function(next) {
  if (!this.fileUrl && !this.externalUrl) {
    return next(new Error('Please provide either a file or an external URL'));
  }
  next();
});

// Production indexes
ResourceSchema.index({ type: 1, category: 1 });
ResourceSchema.index({ user: 1 });
ResourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Resource', ResourceSchema);

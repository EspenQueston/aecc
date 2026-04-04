const mongoose = require('mongoose');

// WordPress-inspired Post model (equivalent to wp_posts table)
const PostSchema = new mongoose.Schema({
  // Post identification
  post_author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  post_date: {
    type: Date,
    default: Date.now
  },
  post_date_gmt: {
    type: Date,
    default: Date.now
  },
  post_content: {
    type: String,
    required: [true, 'Post content is required']
  },
  post_title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  post_excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot be more than 500 characters']
  },
  post_status: {
    type: String,
    enum: ['publish', 'draft', 'private', 'pending', 'trash'],
    default: 'draft'
  },
  comment_status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  ping_status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  post_password: {
    type: String,
    default: ''
  },
  post_name: {  // slug
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  to_ping: {
    type: String,
    default: ''
  },
  pinged: {
    type: String,
    default: ''
  },
  post_modified: {
    type: Date,
    default: Date.now
  },
  post_modified_gmt: {
    type: Date,
    default: Date.now
  },
  post_content_filtered: {
    type: String,
    default: ''
  },
  post_parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    default: null
  },
  guid: {
    type: String,
    unique: true
  },
  menu_order: {
    type: Number,
    default: 0
  },
  post_type: {
    type: String,
    enum: ['post', 'page', 'attachment', 'revision', 'nav_menu_item'],
    default: 'post'
  },
  post_mime_type: {
    type: String,
    default: ''
  },
  comment_count: {
    type: Number,
    default: 0
  },
  // Additional fields for enhanced functionality
  featured_image: {
    type: String,
    default: 'no-image.jpg'
  },
  view_count: {
    type: Number,
    default: 0
  },
  like_count: {
    type: Number,
    default: 0
  }
});

// Indexes for better performance
PostSchema.index({ post_type: 1, post_status: 1, post_date: -1 });
PostSchema.index({ post_author: 1 });
PostSchema.index({ post_name: 1 });
PostSchema.index({ post_parent: 1 });
PostSchema.index({ post_date: -1 });

// Pre-save middleware to generate slug and GUID
PostSchema.pre('save', function(next) {
  if (!this.post_name && this.post_title) {
    this.post_name = this.post_title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  if (!this.guid) {
    this.guid = `${process.env.SITE_URL || 'http://localhost:3000'}/?p=${this._id}`;
  }
  
  // Auto-generate excerpt if not provided
  if (!this.post_excerpt && this.post_content) {
    const textContent = this.post_content.replace(/<[^>]*>/g, '');
    this.post_excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
  }
  
  this.post_modified = new Date();
  this.post_modified_gmt = new Date();
  
  next();
});

// Virtual for formatted date
PostSchema.virtual('formatted_date').get(function() {
  return this.post_date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for reading time
PostSchema.virtual('reading_time').get(function() {
  const wordsPerMinute = 200;
  const textContent = this.post_content.replace(/<[^>]*>/g, '');
  const words = textContent.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
});

module.exports = mongoose.model('Post', PostSchema);

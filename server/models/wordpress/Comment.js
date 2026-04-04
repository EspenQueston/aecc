const mongoose = require('mongoose');

// WordPress-inspired Comments model (equivalent to wp_comments table)
const CommentSchema = new mongoose.Schema({
  comment_post_ID: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: true
  },
  comment_author: {
    type: String,
    required: [true, 'Comment author name is required'],
    trim: true,
    maxlength: [245, 'Author name cannot be more than 245 characters']
  },
  comment_author_email: {
    type: String,
    required: [true, 'Comment author email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  comment_author_url: {
    type: String,
    default: '',
    trim: true
  },
  comment_author_IP: {
    type: String,
    default: '',
    trim: true
  },
  comment_date: {
    type: Date,
    default: Date.now
  },
  comment_date_gmt: {
    type: Date,
    default: Date.now
  },
  comment_content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true
  },
  comment_karma: {
    type: Number,
    default: 0
  },
  comment_approved: {
    type: String,
    enum: ['0', '1', 'spam', 'trash'],
    default: '1' // 1 = approved, 0 = pending
  },
  comment_agent: {
    type: String,
    default: ''
  },
  comment_type: {
    type: String,
    enum: ['comment', 'trackback', 'pingback'],
    default: 'comment'
  },
  comment_parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
    default: null
  },
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  // Additional fields for enhanced functionality
  like_count: {
    type: Number,
    default: 0
  },
  reply_count: {
    type: Number,
    default: 0
  }
});

// Indexes
CommentSchema.index({ comment_post_ID: 1, comment_approved: 1, comment_date: -1 });
CommentSchema.index({ comment_parent: 1 });
CommentSchema.index({ user_id: 1 });
CommentSchema.index({ comment_author_email: 1 });

// Virtual for formatted date
CommentSchema.virtual('formatted_date').get(function() {
  return this.comment_date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to get approved comments for a post
CommentSchema.statics.getApprovedComments = async function(postId, options = {}) {
  const { limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;
  
  return await this.find({
    comment_post_ID: postId,
    comment_approved: '1',
    comment_parent: null
  })
  .populate('user_id', 'firstName lastName avatar')
  .sort({ comment_date: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to get comment replies
CommentSchema.statics.getCommentReplies = async function(commentId) {
  return await this.find({
    comment_parent: commentId,
    comment_approved: '1'
  })
  .populate('user_id', 'firstName lastName avatar')
  .sort({ comment_date: 1 });
};

// Static method to get comment count for a post
CommentSchema.statics.getCommentCount = async function(postId) {
  return await this.countDocuments({
    comment_post_ID: postId,
    comment_approved: '1'
  });
};

// Method to approve comment
CommentSchema.methods.approve = async function() {
  this.comment_approved = '1';
  return await this.save();
};

// Method to reject comment
CommentSchema.methods.reject = async function() {
  this.comment_approved = '0';
  return await this.save();
};

// Method to mark as spam
CommentSchema.methods.markAsSpam = async function() {
  this.comment_approved = 'spam';
  return await this.save();
};

// Method to move to trash
CommentSchema.methods.moveToTrash = async function() {
  this.comment_approved = 'trash';
  return await this.save();
};

// Pre-save middleware to update reply count for parent comment
CommentSchema.pre('save', async function(next) {
  if (this.isNew && this.comment_parent) {
    await this.constructor.updateOne(
      { _id: this.comment_parent },
      { $inc: { reply_count: 1 } }
    );
  }
  next();
});

// Pre-remove middleware to update reply count for parent comment
CommentSchema.pre('deleteOne', async function(next) {
  const comment = await this.model.findOne(this.getQuery());
  if (comment && comment.comment_parent) {
    await this.model.updateOne(
      { _id: comment.comment_parent },
      { $inc: { reply_count: -1 } }
    );
  }
  next();
});

module.exports = mongoose.model('Comment', CommentSchema);

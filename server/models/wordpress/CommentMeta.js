const mongoose = require('mongoose');

// WordPress-inspired Comment Meta model (equivalent to wp_commentmeta table)
const CommentMetaSchema = new mongoose.Schema({
  meta_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  comment_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
    required: true
  },
  meta_key: {
    type: String,
    required: true,
    trim: true
  },
  meta_value: {
    type: mongoose.Schema.Types.Mixed, // Can store any type of data
    default: ''
  }
});

// Indexes for better performance
CommentMetaSchema.index({ comment_id: 1 });
CommentMetaSchema.index({ meta_key: 1 });
CommentMetaSchema.index({ comment_id: 1, meta_key: 1 });

// Static method to get meta value
CommentMetaSchema.statics.getMetaValue = async function(commentId, metaKey) {
  const meta = await this.findOne({ comment_id: commentId, meta_key: metaKey });
  return meta ? meta.meta_value : null;
};

// Static method to set meta value
CommentMetaSchema.statics.setMetaValue = async function(commentId, metaKey, metaValue) {
  return await this.findOneAndUpdate(
    { comment_id: commentId, meta_key: metaKey },
    { meta_value: metaValue },
    { upsert: true, new: true }
  );
};

// Static method to delete meta
CommentMetaSchema.statics.deleteMeta = async function(commentId, metaKey) {
  return await this.deleteOne({ comment_id: commentId, meta_key: metaKey });
};

// Static method to get all meta for a comment
CommentMetaSchema.statics.getCommentMeta = async function(commentId) {
  const metas = await this.find({ comment_id: commentId });
  const result = {};
  metas.forEach(meta => {
    result[meta.meta_key] = meta.meta_value;
  });
  return result;
};

module.exports = mongoose.model('CommentMeta', CommentMetaSchema);

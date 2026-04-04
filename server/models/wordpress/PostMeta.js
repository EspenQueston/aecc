const mongoose = require('mongoose');

// WordPress-inspired Post Meta model (equivalent to wp_postmeta table)
const PostMetaSchema = new mongoose.Schema({
  meta_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  post_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
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
PostMetaSchema.index({ post_id: 1 });
PostMetaSchema.index({ meta_key: 1 });
PostMetaSchema.index({ post_id: 1, meta_key: 1 });

// Static method to get meta value
PostMetaSchema.statics.getMetaValue = async function(postId, metaKey) {
  const meta = await this.findOne({ post_id: postId, meta_key: metaKey });
  return meta ? meta.meta_value : null;
};

// Static method to set meta value
PostMetaSchema.statics.setMetaValue = async function(postId, metaKey, metaValue) {
  return await this.findOneAndUpdate(
    { post_id: postId, meta_key: metaKey },
    { meta_value: metaValue },
    { upsert: true, new: true }
  );
};

// Static method to delete meta
PostMetaSchema.statics.deleteMeta = async function(postId, metaKey) {
  return await this.deleteOne({ post_id: postId, meta_key: metaKey });
};

// Static method to get all meta for a post
PostMetaSchema.statics.getPostMeta = async function(postId) {
  const metas = await this.find({ post_id: postId });
  const result = {};
  metas.forEach(meta => {
    result[meta.meta_key] = meta.meta_value;
  });
  return result;
};

module.exports = mongoose.model('PostMeta', PostMetaSchema);

const mongoose = require('mongoose');

// WordPress-inspired Term Relationships model (equivalent to wp_term_relationships table)
// This links posts to their categories and tags
const TermRelationshipSchema = new mongoose.Schema({
  object_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: true
  },
  term_taxonomy_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'TermTaxonomy',
    required: true
  },
  term_order: {
    type: Number,
    default: 0
  }
});

// Indexes
TermRelationshipSchema.index({ object_id: 1 });
TermRelationshipSchema.index({ term_taxonomy_id: 1 });
TermRelationshipSchema.index({ object_id: 1, term_taxonomy_id: 1 }, { unique: true });

// Static method to get post categories
TermRelationshipSchema.statics.getPostCategories = async function(postId) {
  return await this.find({ object_id: postId })
    .populate({
      path: 'term_taxonomy_id',
      match: { taxonomy: 'category' },
      populate: { path: 'term_id' }
    })
    .then(results => results.filter(r => r.term_taxonomy_id).map(r => r.term_taxonomy_id));
};

// Static method to get post tags
TermRelationshipSchema.statics.getPostTags = async function(postId) {
  return await this.find({ object_id: postId })
    .populate({
      path: 'term_taxonomy_id',
      match: { taxonomy: 'post_tag' },
      populate: { path: 'term_id' }
    })
    .then(results => results.filter(r => r.term_taxonomy_id).map(r => r.term_taxonomy_id));
};

// Static method to assign category to post
TermRelationshipSchema.statics.assignCategoryToPost = async function(postId, termTaxonomyId) {
  const existing = await this.findOne({ object_id: postId, term_taxonomy_id: termTaxonomyId });
  if (!existing) {
    const relationship = new this({ object_id: postId, term_taxonomy_id: termTaxonomyId });
    await relationship.save();
    
    // Increment count in term taxonomy
    const TermTaxonomy = mongoose.model('TermTaxonomy');
    const termTaxonomy = await TermTaxonomy.findById(termTaxonomyId);
    if (termTaxonomy) {
      await termTaxonomy.incrementCount();
    }
    
    return relationship;
  }
  return existing;
};

// Static method to remove category from post
TermRelationshipSchema.statics.removeCategoryFromPost = async function(postId, termTaxonomyId) {
  const result = await this.deleteOne({ object_id: postId, term_taxonomy_id: termTaxonomyId });
  
  if (result.deletedCount > 0) {
    // Decrement count in term taxonomy
    const TermTaxonomy = mongoose.model('TermTaxonomy');
    const termTaxonomy = await TermTaxonomy.findById(termTaxonomyId);
    if (termTaxonomy) {
      await termTaxonomy.decrementCount();
    }
  }
  
  return result;
};

// Static method to get posts by category
TermRelationshipSchema.statics.getPostsByCategory = async function(termTaxonomyId, options = {}) {
  const { limit = 10, page = 1, sort = { post_date: -1 } } = options;
  const skip = (page - 1) * limit;
  
  return await this.find({ term_taxonomy_id: termTaxonomyId })
    .populate({
      path: 'object_id',
      match: { post_status: 'publish', post_type: 'post' },
      options: { sort, limit, skip }
    })
    .then(results => results.filter(r => r.object_id).map(r => r.object_id));
};

module.exports = mongoose.model('TermRelationship', TermRelationshipSchema);

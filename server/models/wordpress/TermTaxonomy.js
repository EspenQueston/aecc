const mongoose = require('mongoose');

// WordPress-inspired Term Taxonomy model (equivalent to wp_term_taxonomy table)
const TermTaxonomySchema = new mongoose.Schema({
  term_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Term',
    required: true
  },
  taxonomy: {
    type: String,
    required: true,
    enum: ['category', 'post_tag', 'nav_menu', 'link_category', 'post_format'],
    default: 'category'
  },
  description: {
    type: String,
    default: ''
  },
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'TermTaxonomy',
    default: null
  },
  count: {
    type: Number,
    default: 0
  }
});

// Indexes
TermTaxonomySchema.index({ term_id: 1 });
TermTaxonomySchema.index({ taxonomy: 1 });
TermTaxonomySchema.index({ parent: 1 });

// Ensure unique combination of term_id and taxonomy
TermTaxonomySchema.index({ term_id: 1, taxonomy: 1 }, { unique: true });

// Static method to get categories
TermTaxonomySchema.statics.getCategories = async function() {
  return await this.find({ taxonomy: 'category' })
    .populate('term_id')
    .populate('parent');
};

// Static method to get tags
TermTaxonomySchema.statics.getTags = async function() {
  return await this.find({ taxonomy: 'post_tag' })
    .populate('term_id');
};

// Method to increment count
TermTaxonomySchema.methods.incrementCount = async function() {
  this.count += 1;
  return await this.save();
};

// Method to decrement count
TermTaxonomySchema.methods.decrementCount = async function() {
  this.count = Math.max(0, this.count - 1);
  return await this.save();
};

module.exports = mongoose.model('TermTaxonomy', TermTaxonomySchema);

const mongoose = require('mongoose');

// WordPress-inspired Terms model (equivalent to wp_terms table)
// This handles categories, tags, and any custom taxonomies
const TermSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Term name is required'],
    trim: true,
    maxlength: [200, 'Term name cannot be more than 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  term_group: {
    type: Number,
    default: 0
  }
});

// Indexes
TermSchema.index({ slug: 1 });
TermSchema.index({ name: 1 });

// Pre-save middleware to generate slug
TermSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Term', TermSchema);

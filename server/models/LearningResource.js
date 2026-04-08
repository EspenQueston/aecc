const mongoose = require('mongoose');

const LearningResourceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['formation', 'youtube', 'useful-link']
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  // Detail page content
  longDescription: { type: String, trim: true, default: '' },
  advantages: [{ type: String, trim: true }],
  disadvantages: [{ type: String, trim: true }],
  details: [{ type: String, trim: true }],
  // Resource can be a URL or an uploaded file
  url: { type: String, trim: true },
  filePath: { type: String, trim: true },
  fileName: { type: String, trim: true },
  // Visual
  icon: { type: String, default: 'fas fa-book' },
  color: { type: String, default: '#2563eb' },
  // Formation-specific
  level: {
    type: String,
    enum: ['tous-niveaux', 'debutant', 'intermediaire', 'avance', ''],
    default: ''
  },
  slug: { type: String, trim: true },
  // Link-specific
  highlight: { type: Boolean, default: false },
  // General
  featured: { type: Boolean, default: false },
  status: { type: String, default: 'active', enum: ['active', 'inactive'] },
  order: { type: Number, default: 0 }
}, { timestamps: true });

LearningResourceSchema.index({ type: 1, status: 1 });
LearningResourceSchema.index({ title: 'text', description: 'text' });
LearningResourceSchema.index({ slug: 1 }, { unique: true, sparse: true });
LearningResourceSchema.index({ featured: 1, status: 1 });

module.exports = mongoose.model('LearningResource', LearningResourceSchema);

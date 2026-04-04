const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: 300
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['general', 'membership', 'scholarships', 'events', 'academic', 'administrative'],
    default: 'general'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

FAQSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('FAQ', FAQSchema);

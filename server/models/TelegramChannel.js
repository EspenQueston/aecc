const mongoose = require('mongoose');

const TelegramChannelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: [
      'finances-economie',
      'computer-science',
      'droit-law',
      'business-commerce',
      'agriculture-elevage',
      'marketing-communication',
      'cryptomonnaie',
      'sciences-physique',
      'sciences-chimie',
      'sciences-biologie',
      'sciences-mathematiques',
      'sciences-medecine',
      'sciences-ingenierie',
      'langues',
      'art-culture',
      'developpement-personnel',
      'aecc',
      'autre'
    ]
  },
  icon: { type: String, default: 'fab fa-telegram-plane' },
  subscribers: { type: Number, default: 0 },
  language: { type: String, default: 'fr', enum: ['fr', 'en', 'zh', 'multi'] },
  featured: { type: Boolean, default: false },
  status: { type: String, default: 'active', enum: ['active', 'inactive'] }
}, { timestamps: true });

// Production indexes
TelegramChannelSchema.index({ category: 1, status: 1 });
TelegramChannelSchema.index({ featured: 1 });
TelegramChannelSchema.index({ language: 1 });

module.exports = mongoose.model('TelegramChannel', TelegramChannelSchema);

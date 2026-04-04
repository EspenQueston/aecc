const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'admin', 'bot'], required: true },
  message: { type: String, required: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now }
});

const ChatConversationSchema = new mongoose.Schema({
  visitorName: { type: String, default: 'Visiteur', trim: true, maxlength: 100 },
  visitorEmail: { type: String, default: '', trim: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  messages: [ChatMessageSchema],
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

ChatConversationSchema.index({ status: 1, lastMessageAt: -1 });

module.exports = mongoose.model('ChatConversation', ChatConversationSchema);

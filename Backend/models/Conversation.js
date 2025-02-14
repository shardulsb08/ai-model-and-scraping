const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: String,
  role: String, // 'user' or 'assistant'
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Conversation', conversationSchema);

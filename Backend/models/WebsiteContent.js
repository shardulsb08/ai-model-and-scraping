const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true }, 
  content: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WebsiteContent', websiteContentSchema);

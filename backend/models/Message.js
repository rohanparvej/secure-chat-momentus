const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  content: { type: String, required: true }, // This will be the E2EE gibberish
  sender: { type: String, required: true },
  // TTL Index: This record will delete itself 1 hour after 'createdAt'
  createdAt: { type: Date, default: Date.now, expires: 300 } //currently 2 min
});

module.exports = mongoose.model('Message', MessageSchema);
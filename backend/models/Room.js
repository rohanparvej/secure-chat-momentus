const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  ownerSocketId: { type: String, required: true },
  // TTL Index: Deletes the document 10 minutes after creation
  createdAt: { type: Date, default: Date.now, expires: 300 } //currently 2 min
});

module.exports = mongoose.model('Room', RoomSchema);
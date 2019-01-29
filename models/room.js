const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  }
});

module.exports = mongoose.model('Room', RoomSchema);

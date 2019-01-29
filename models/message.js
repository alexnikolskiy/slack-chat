const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type : Date,
    default: Date.now,
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    default: null,
  },
  automated: {
    type: Boolean,
    default: false,
  },
},
{
  timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);

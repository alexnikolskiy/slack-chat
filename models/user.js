const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
  },
  online: {
    type: Boolean,
    default: false,
  },
  socket: {
    type: String,
  },
});

UserSchema.methods.generateHash = async (password) => (
  await bcrypt.hash(password, 10)
);

UserSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password)
};

module.exports = mongoose.model('User', UserSchema);

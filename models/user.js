const mongoose = require('mongoose');

const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

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
  avatar: {
    type: String,
  },
});

UserSchema.methods.generateHash = async password => {
  const hash = await bcrypt.hash(password, 10);

  return hash;
};

UserSchema.methods.validatePassword = async function validate(password) {
  const isValid = await bcrypt.compare(password, this.password);

  return isValid;
};

module.exports = mongoose.model('User', UserSchema);

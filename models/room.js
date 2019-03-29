const mongoose = require('mongoose');

const { Schema } = mongoose;

const RoomSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
});

RoomSchema.methods.toJSONFor = function toJSONFor() {
  return {
    id: this._id,
    name: this.name,
  };
};

module.exports = mongoose.model('Room', RoomSchema);

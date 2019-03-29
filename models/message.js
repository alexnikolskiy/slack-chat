const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
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
      type: Date,
      default: Date.now,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
    },
    automated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

MessageSchema.methods.toJSONFor = function toJSONFor() {
  return {
    id: this._id,
    sender: this.sender.toJSONFor(this.room),
    receiver: this.receiver ? this.receiver.toJSONFor(this.room) : null,
    room: this.room.toJSONFor(),
    text: this.text,
    timestamp: this.timestamp,
    automated: this.automated,
    edited: this.createdAt.getTime() !== this.updatedAt.getTime(),
  };
};

MessageSchema.methods.toSocketJSONFor = function toSocketJSONFor() {
  return {
    id: this._id,
    text: this.text,
  };
};

module.exports = mongoose.model('Message', MessageSchema);

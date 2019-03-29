require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const { log } = require('debug');
const Room = require('../models/room');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const dbUrl = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${
  process.env.DB_HOST
}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

let roomName = '';

rl.question('Room name: ', answer => {
  roomName = answer;
  rl.close();
});

rl.on('close', async () => {
  if (roomName.length < 2) {
    log('Incorrect room name!');
    process.exit();
  }

  const room = await Room.findOne({ name: roomName });

  if (room) {
    log('Room already exists!');
    process.exit();
  }

  const newRoom = new Room({ name: roomName });
  await newRoom.save();

  log('ok!');
  process.exit(0);
});

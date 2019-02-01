const mongoose = require('mongoose');
const readline = require('readline');
const Room = require('../models/room');
const config = require('../config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const dbUrl = `mongodb://${config.db.user}:${config.db.password}@${config.db.host}:${
  config.db.port
}/${config.db.name}`;

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
    console.log('Incorrect room name!');
    process.exit();
  }

  const room = await Room.findOne({ name: roomName });

  if (room) {
    console.log('Room already exists!');
    process.exit();
  }

  const newRoom = new Room({ name: roomName });
  await newRoom.save();

  console.log('ok!');
  process.exit(0);
});

const Room = require('./models/room');
const User = require('./models/user');
const Message = require('./models/message');

module.exports = io => {
  const typingUsers = {};

  async function joinRoom(socket) {
    const message = new Message({
      sender: socket.user._id,
      text: `joined #${socket.user.room.name}`,
      room: socket.user.room._id,
      automated: true,
    });

    await message.save();

    const sendMsg = {
      message: message.toSocketJSONFor(),
      user: socket.user.toJSONFor(),
      room: socket.user.room.toJSONFor(),
    };

    socket.in(`room:${socket.user.room.name}`).emit('room:join', sendMsg);
  }

  function init() {
    io.use(async (socket, next) => {
      if (!socket.request.session.user) return next();

      try {
        socket.user = await User.findById(socket.request.session.user).populate('room');

        if (!socket.user.room) {
          socket.user.room = await Room.findOne({});
          await socket.user.save();

          await joinRoom(socket);
        }

        return next();
      } catch (err) {
        return next(new Error(err.message));
      }
    });

    io.on('connection', async socket => {
      if (!socket.user) {
        return;
      }

      socket.join(`room:${socket.user.room.name}`, async () => {
        socket.user.online = true;
        socket.user.socket = socket.id;
        await socket.user.save();

        socket.emit('login', socket.user.toJSONFor());
        socket.to(`room:${socket.user.room.name}`).emit('online', socket.user.toJSONFor());
      });

      socket.on('room:join', async roomId => {
        try {
          const previousRoom = socket.user.room;
          const newRoom = await Room.findById(roomId);

          socket.user.room = newRoom;
          await socket.user.save();

          socket.join(`room:${newRoom.name}`, async () => {
            await joinRoom(socket);
          });

          Object.keys(socket.rooms)
            .filter(room => room.includes('room:') && !room.includes(socket.user.room.name))
            .forEach(room =>
              socket.leave(room, async () => {
                const message = new Message({
                  sender: socket.user._id,
                  text: `left #${previousRoom.name}`,
                  room: previousRoom._id,
                  automated: true,
                });

                await message.save();

                socket.to(room).emit('room:leave', {
                  message: message.toSocketJSONFor(),
                  user: socket.user.toJSONFor(),
                  room: previousRoom.toJSONFor(),
                });
              }),
            );
        } catch (err) {
          throw new Error(err.message);
        }
      });

      socket.on('message:add', async (text, receiver = null) => {
        let message = new Message({
          sender: socket.user._id,
          receiver: receiver ? receiver.id : null,
          text,
          room: socket.user.room._id,
        });

        message = await message.save();
        message = await message
          .populate('sender')
          .populate('receiver')
          .populate('room')
          .execPopulate();

        const sendMsg = message.toJSONFor();

        if (!receiver) {
          io.in(`room:${socket.user.room.name}`).emit('message:add', sendMsg);
        } else {
          const { socket: receiverSocket } = await User.findById(receiver.id);

          if (socket.user.username !== receiver.username) {
            socket.emit('message:add', sendMsg);
          }

          io.to(receiverSocket).emit('message:add', sendMsg);
        }
      });

      socket.on('editor:typing', async (receiver = null) => {
        const key = receiver
          ? `${socket.user.username}-${receiver.username}`
          : socket.user.room.name;

        if (!typingUsers[key]) {
          typingUsers[key] = new Set();
        }

        typingUsers[key].add(socket.user.username);
        const users = [...typingUsers[key]];

        if (receiver) {
          const { socket: receiverSocket } = await User.findById(receiver.id);
          io.to(receiverSocket).emit('editor:typing', users, true);
        } else {
          io.in(`room:${socket.user.room.name}`).emit('editor:typing', users, false);
        }
      });

      socket.on('editor:stop-typing', async (receiver = null) => {
        const key = receiver
          ? `${socket.user.username}-${receiver.username}`
          : socket.user.room.name;

        if (!typingUsers[key]) {
          return;
        }

        typingUsers[key].delete(socket.user.username);
        const users = [...typingUsers[key]];

        if (receiver) {
          const { socket: receiverSocket } = await User.findById(receiver.id);
          io.to(receiverSocket).emit('editor:typing', users, true);
        } else {
          io.in(`room:${socket.user.room.name}`).emit('editor:typing', users, false);
        }
      });

      socket.on('message:edit', async msg => {
        const message = await Message.findByIdAndUpdate(msg.id, { text: msg.text });
        socket.to(`room:${socket.user.room.name}`).emit('message:edit', message.toSocketJSONFor());
      });

      socket.on('message:delete', async id => {
        await Message.findByIdAndDelete(id);
        socket.to(`room:${socket.user.room.name}`).emit('message:delete', id);
      });

      socket.on('member:edit', member => {
        io.in(`room:${socket.user.room.name}`).emit('member:edit', member);
      });

      socket.on('disconnect', async () => {
        socket.user.online = false;
        await socket.user.save();

        io.in(`room:${socket.user.room.name}`).emit('offline', socket.user.toJSONFor());
      });
    });
  }

  return {
    init,
  };
};

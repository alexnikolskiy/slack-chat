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

    socket.to(`room:${socket.user.room.name}`).emit('room:join', {
      message: {
        id: message._id,
        text: `joined #${socket.user.room.name}`,
      },
      user: {
        id: socket.user._id,
        username: socket.user.username,
        avatar: socket.user.avatar,
        online: socket.user.online,
      },
      room: {
        id: socket.user.room._id,
        name: socket.user.room.name,
      },
    });
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
          socket.emit('member:join', socket.user.room._id);
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

        const user = {
          id: socket.user._id,
          username: socket.user.username,
          online: socket.user.online,
          room: socket.user.room._id,
          avatar: socket.user.avatar,
          socket: socket.user.socket,
        };

        socket.emit('login', user);
        socket.to(`room:${socket.user.room.name}`).emit('online', user);
      });

      socket.on('room:join', async roomId => {
        try {
          const previousRoom = socket.user.room;
          const newRoom = await Room.findById(roomId);

          socket.user.room = newRoom;
          await socket.user.save();

          socket.join(`room:${newRoom.name}`, async () => {
            await joinRoom(socket);
            socket.emit('member:join', newRoom._id);
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
                  message: {
                    id: message._id,
                    text: `left #${previousRoom.name}`,
                  },
                  user: {
                    id: socket.user._id,
                    username: socket.user.username,
                    avatar: socket.user.avatar,
                    online: socket.user.online,
                  },
                  room: {
                    id: previousRoom._id,
                    name: previousRoom.name,
                  },
                });
              }),
            );
        } catch (err) {
          throw new Error(err.message);
        }
      });

      socket.on('message:add', async (text, receiver = null) => {
        const message = new Message({
          sender: socket.user._id,
          // sender: sender.id,
          text,
          room: socket.user.room._id,
          // room: sender.room,
          receiver: receiver ? receiver.id : null,
        });

        await message.save();

        const sendMsg = {
          id: message._id,
          sender: socket.user.username,
          // sender: sender.username,
          avatar: socket.user.avatar,
          // avatar: sender.avatar,
          receiver: receiver ? receiver.username : null,
          text,
          timestamp: message.timestamp,
          room: socket.user.room._id,
          // room: sender.room,
        };

        if (!receiver) {
          io.in(`room:${socket.user.room.name}`).emit('message:add', sendMsg);
        } else {
          let receiverUser = socket.user;

          if (socket.user.username !== receiver.username) {
            // receiverUser = await User.findById(receiver.id);
            receiverUser = receiver;
            socket.emit('message:add', sendMsg);
          }

          // const receiverUser = await User.findById(receiver.id);
          io.to(receiverUser.socket).emit('message:add', sendMsg);
        }
      });

      socket.on('editor:typing', (receiver = null) => {
        const key = receiver
          ? `${socket.user.username}-${receiver.username}`
          : socket.user.room.name;
        let users;

        if (!typingUsers[key]) {
          typingUsers[key] = new Set();
        }

        typingUsers[key].add(socket.user.username);

        if (receiver) {
          users = [...typingUsers[`${socket.user.username}-${receiver.username}`]];
          io.to(receiver.socket).emit(
            'editor:typing',
            users,
            socket.user.username,
            receiver.username,
          );
        } else {
          users = [...typingUsers[socket.user.room.name]];
          io.in(`room:${socket.user.room.name}`).emit('editor:typing', users, socket.user.username);
        }
      });

      socket.on('editor:stop-typing', (receiver = null) => {
        const key = receiver
          ? `${socket.user.username}-${receiver.username}`
          : socket.user.room.name;
        let users;

        typingUsers[key].delete(socket.user.username);

        if (receiver) {
          users = [...typingUsers[`${socket.user.username}-${receiver.username}`]];
          io.to(receiver.socket).emit(
            'editor:typing',
            users,
            socket.user.username,
            receiver.username,
          );
        } else {
          users = [...typingUsers[socket.user.room.name]];
          io.in(`room:${socket.user.room.name}`).emit('editor:typing', users, socket.user.username);
        }
      });

      socket.on('message:edit', async message => {
        await Message.findByIdAndUpdate(message.id, { text: message.text });
        socket.to(`room:${socket.user.room.name}`).emit('message:edit', {
          id: message.id,
          text: message.text,
        });
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

        io.in(`room:${socket.user.room.name}`).emit('offline', {
          id: socket.user._id,
          username: socket.user.username,
          online: socket.user.online,
          room: {
            id: socket.user.room._id,
            name: socket.user.room.name,
          },
        });
      });
    });
  }

  return {
    init,
  };
};

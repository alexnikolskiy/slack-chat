const Room = require('./models/room');
const User = require('./models/user');
const Message = require('./models/message');

module.exports = (io) => {
  let typingUsers = {};

  function init() {
    io.use(async (socket, next) => {
      if (!socket.request.session.user) return next();

      try {
        socket.user = await User.findById(socket.request.session.user).populate('room');

        if (!socket.user.room) {
          socket.user.room = await Room.findOne({});
          await socket.user.save();
        }

        next();
      } catch (err) {
        next(new Error(err.message));
      }
    });

    io.on('connection', async (socket) => {
      socket.join(`room:${socket.user.room.name}`);

      socket.user.online = true;
      socket.user.socket = socket.id;
      await socket.user.save();

      const user = {
        id: socket.user._id,
        username: socket.user.username,
        online: socket.user.online,
        room: socket.user.room._id,
        socket: socket.user.socket,
      };

      socket.emit('login', user);

      socket.to(`room:${socket.user.room.name}`).emit('online', user);

      socket.on('room:join', async (roomId) => {
        try {
          const previousRoom = socket.user.room;
          const room = await Room.findById(roomId);

          socket.join(`room:${room.name}`);
          socket.user.room = room;
          await socket.user.save();

          const message = new Message({
            sender: socket.user._id,
            text: `joined #${room.name}`,
            room: room._id,
            automated: true,
          });
          await message.save();

          Object.keys(socket.rooms)
            .filter(room => room.includes('room:') && !room.includes(socket.user.room.name))
            .forEach(room => socket.leave(room, async () => {
              const message = new Message({
                sender: socket.user._id,
                text: `left #${previousRoom.name}`,
                room: previousRoom._id,
                automated: true,
              });

              await message.save();

              socket.to(room).emit('room:leave', {
                id: socket.user._id,
                username: socket.user.username,
                online: socket.user.online,
                room: {
                  id: previousRoom._id,
                  name: previousRoom.name,
                },
                message: message._id,
                socket: socket.user.socket,
              });
            }));

          socket.to(`room:${room.name}`).emit('room:join', {
            id: socket.user._id,
            username: socket.user.username,
            online: socket.user.online,
            room: {
              id: socket.user.room._id,
              name: socket.user.room.name,
            },
            message: message._id,
            socket: socket.user.socket,
          });
          socket.emit('member:join', {
            id: room._id,
            name: room.name,
          });
        } catch (err) {
          throw new Error(err.message);
        }
      });

      socket.on('message:add', async (text, sender = null, receiver = null) => {
        const message = new Message({
          sender: sender ? sender.id : socket.user._id,
          text: text,
          room: socket.user.room._id,
          receiver: receiver ? receiver.id : null,
        });

        await message.save();

        const sendMsg = {
          id: message._id,
          sender: sender ? sender.username : socket.user.username,
          text: text,
          timestamp: message.timestamp,
          room: socket.user.room._id,
        };

        if (!receiver) {
          io.in(`room:${socket.user.room.name}`).emit('message:add', sendMsg, false);
        } else {
          if (receiver.username !== sender.username) {
            socket.emit('message:add', sendMsg, true);
          }
          io.to(receiver.socket).emit('message:add', sendMsg, true);
        }
      });

      socket.on('editor:typing', (receiver = null) => {
        let users;
        const key = receiver ? `${socket.user.username}-${receiver.username}` : socket.user.room.name;

        if (!typingUsers[key]) {
          typingUsers[key] = new Set();
        }

        typingUsers[key].add(socket.user.username);

        if (receiver) {
          users = [...typingUsers[`${socket.user.username}-${receiver.username}`]];
          io.to(receiver.socket).emit('editor:typing', users, socket.user.username, receiver.username);
        } else {
          users = [...typingUsers[socket.user.room.name]];
          io.in(`room:${socket.user.room.name}`).emit('editor:typing', users, socket.user.username);
        }
      });

      socket.on('editor:stop-typing', (receiver = null) => {
        const key = receiver ? `${socket.user.username}-${receiver.username}` : socket.user.room.name;
        let users;

        typingUsers[key].delete(socket.user.username);

        if (receiver) {
          users = [...typingUsers[`${socket.user.username}-${receiver.username}`]];
          io.to(receiver.socket).emit('editor:typing', users, socket.user.username, receiver.username);
        } else {
          users = [...typingUsers[socket.user.room.name]];
          io.in(`room:${socket.user.room.name}`).emit('editor:typing', users, socket.user.username);
        }
      });

      socket.on('message:edit', async (message) => {
        await Message.findByIdAndUpdate(message.id, { text: message.text });
        socket.to(`room:${socket.user.room.name}`).emit('message:edit', {
          id: message.id,
          text: message.text,
        });
      });

      socket.on('message:delete', async (id) => {
        await Message.findByIdAndDelete(id);
        socket.to(`room:${socket.user.room.name}`).emit('message:delete', id);
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
    init
  }
};

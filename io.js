const io = require('socket.io');
const socketInit = require('./socket');
const { app, sessionMiddleware } = require('./app');

module.exports = http => {
  const ioServer = io(http);
  const socketio = socketInit(ioServer);

  ioServer.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
  });
  socketio.init();
  app.set('io', ioServer);

  return ioServer;
};

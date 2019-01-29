module.exports = {
  http: {
    host: 'localhost',
    port: 3000,
    devPort: 3001,
  },
  secret: 'secret',
  db: {
    host: 'localhost',
    port: '27018',
    name: 'dbname',
    user: 'dbuser',
    password: 'dbpassword',
    options: '',
  },
  socket: {
    url: 'localhost:3000',
    options: {
      path: '/socket.io',
    },
  },
};

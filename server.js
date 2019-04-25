const http = require('http');
const { app } = require('./app');

module.exports = http.Server(app);

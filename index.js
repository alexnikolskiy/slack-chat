require('dotenv').config();
const { log } = require('debug');
const http = require('./server');
require('./io')(http);

http.listen(process.env.HTTP_PORT, process.env.HTTP_HOST, () => {
  log('Express server started on %s:%s', process.env.HTTP_HOST, process.env.HTTP_PORT);
});

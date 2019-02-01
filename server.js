const express = require('express');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const cors = require('cors');

const config = require('./config');
const { isAuth } = require('./middlewares/auth');
const loadUser = require('./middlewares/loadUser');
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const socketio = require('./socket')(io);

let dbUrl = `mongodb://${config.db.user}:${config.db.password}@${config.db.host}:${
  config.db.port
}/${config.db.name}`;

if (config.db.options) {
  dbUrl += `?${config.db.options}`;
}

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(morgan('dev'));

app.use(
  cors({
    origin: [
      `http://${config.http.host}:${config.http.port}`,
      `http://${config.http.host}:${config.http.devPort}`,
    ],
    credentials: true,
  }),
);

const sessionMiddleware = session({
  key: 'chat.sid',
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: null,
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
  }),
});

app.use(sessionMiddleware);

app.use(express.static(path.join(__dirname, 'build'), { index: false }));

app.get('/', isAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(loadUser);
app.use('/auth', authRouter);
app.use('/api', apiRouter);

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next);
});
socketio.init();

http.listen(config.http.port, config.http.host, () => {
  console.log('Express server started on %s:%s', config.http.host, config.http.port);
});

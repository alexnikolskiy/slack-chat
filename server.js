require('dotenv').config();
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
const { log } = require('debug');

const loadUser = require('./middlewares/loadUser');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const socketio = require('./socket')(io);

const dbUrl = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${
  process.env.DB_HOST
}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

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

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  cors({
    origin: [
      `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`,
      `http://${process.env.HTTP_HOST}:${process.env.HTTP_DEV_PORT}`,
    ],
    credentials: true,
  }),
);

const sessionMiddleware = session({
  key: 'chat.sid',
  secret: process.env.SECRET,
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
app.use('/avatars', express.static(path.join(__dirname, 'uploads')));

app.use(loadUser);
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/api', apiRouter);

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next);
});
socketio.init();
app.set('io', io);

http.listen(process.env.HTTP_PORT, process.env.HTTP_HOST, () => {
  log('Express server started on %s:%s', process.env.HTTP_HOST, process.env.HTTP_PORT);
});

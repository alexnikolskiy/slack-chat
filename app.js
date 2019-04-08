require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const loadUser = require('./middlewares/loadUser');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

const dbUrl = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${
  process.env.DB_HOST
}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

if (!isProduction) {
  app.use(morgan('dev'));
}

app.set('trust proxy', true);

const sessionMiddleware = session({
  key: process.env.SES_KEY,
  secret: process.env.SES_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: null,
    secure: isProduction,
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

module.exports = { app, sessionMiddleware };

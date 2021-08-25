/* eslint-disable @typescript-eslint/no-var-requires */
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
// import dot from 'dotenv'
// import mgStore from 'connect-mongodb-session'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dotenv   = require("dotenv").config();
const MongoDBStore = require('connect-mongodb-session')(session);
import mongoose from 'mongoose';
import config  from 'config';
import flash from 'connect-flash'

const indexRouter = require('./routes/index');

const app = express();

//Setting Database Sessions
const store = new MongoDBStore({
  uri : process.env.MONGODB_URL as string,
  collection : "sessions"
})

app.use(session({
	cookie : {
		maxAge : 864e5
	} ,
	secret : process.env.SESSION_SECRET as string,
  resave : false ,
  store : store ,
	saveUninitialized : true ,
	unset : "destroy" ,
	genid : (req) => {
		return req.url
	}
}))

//Database connection
const dbConfig: string = process.env.MONGODB_URL as string
mongoose
  .connect(dbConfig, {
    useNewUrlParser : true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connected.')
  })

// view engine setup
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');
//utilising flash messages
app.use(flash())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (
  err: createError.HttpError,
  req: express.Request,
  res: express.Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: express.NextFunction
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
})

export default app;

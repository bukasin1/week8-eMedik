"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const express_session_1 = __importDefault(require("express-session"));
// import dot from 'dotenv'
// import mgStore from 'connect-mongodb-session'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dotenv = require('dotenv').config();
const MongoDBStore = require('connect-mongodb-session')(express_session_1.default);
const mongoose_1 = __importDefault(require("mongoose"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const indexRouter = require('./routes/index');
const app = express_1.default();
//Setting Database Sessions
const store = new MongoDBStore({
    uri: process.env.MONGODB_URL,
    collection: 'sessions',
});
app.use(express_session_1.default({
    cookie: {
        maxAge: 864e5,
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    store: store,
    saveUninitialized: true,
    unset: 'destroy',
    genid: (req) => {
        return req.url;
    },
}));
//Database connection
const dbConfig = process.env.MONGODB_URL;
mongoose_1.default
    .connect(dbConfig, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    dbName: 'e-medik',
})
    .then(() => {
    console.log('Database connected.');
});
// view engine setup
app.set('views', path_1.default.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');
//utilising flash messages
app.use(connect_flash_1.default());
app.use(morgan_1.default('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookie_parser_1.default());
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.use('/', indexRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(http_errors_1.default(404));
});
// error handler
app.use(function (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
exports.default = app;
//# sourceMappingURL=app.js.map
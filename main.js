const express = require('express');
const app = express();
const port = 3000;

//// 미들웨어 설정
const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var flash = require('connect-flash');
const mysql = require('mysql2');

// DB 연결
const db = mysql.createConnection({
  host: 'localhost',
  user: 'node',
  password: 'zxasqw12!@',
  database: 'opentutorials'
});

//서버 구동 시, middleware가 자동실행
app.use(express.static('public'));
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new FileStore({ path: './sessions/' })
}));
app.use(flash());

//passport.js
//session 다음에 적어야 함.
var passport = require('./lib/passport')(app);

//get 요청에 대해서만 미들웨어를 작동
// app.get('*', function (req, res, next) {
//   fs.readdir('./data', function (error, filelist) {
//     req.list = filelist;
//     next();
//   });
// });
app.get('*', function (req, res, next) {
  db.query(
    'SELECT * FROM topic',
    function (err, topics) {
      req.list = topics;
      next();      
    }
  );

  // fs.readdir('./data', function (error, filelist) {
  //   req.list = filelist;
  //   next();
  // });
});

//// 라우팅 설정
var topicRouter = require('./routes/topic')(db);
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth')(passport);


app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use(function (req, res, next) {
  res.status(404).send('Sorry cannot find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(port, function () {
  console.log(`App listening at http://localhost:${port}`);
});
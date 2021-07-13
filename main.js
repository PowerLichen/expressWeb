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

//서버 구동 시, middleware가 자동실행
app.use(express.static('public'));
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));
app.use(flash());
app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash('msg', 'Flash is back!');
  res.send('flash')
});

app.get('/flash_display', function(req, res){
  // Get an array of flash messages by passing the key to req.flash()
  var fmsg = req.flash();
  console.log(fmsg);
  res.send(fmsg)
});

//passport.js
//session 다음에 적어야 함.
var authData = {
  email: '1234@naver.com',
  password: '1111',
  nickname: 'Guest'
}

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());

//로그인 시 호출되어, 세션에 데이터를 저장
passport.serializeUser(function(user, done) {
  console.log('serializeUser: ', user);
  done(null, user.email);
});

//페이지 이동 시, 데이터를 제공
//done으로 전달된 데이터는 req.user를 통하여 호출 가능.
passport.deserializeUser(function(id, done) {
  console.log('deserializeUser: ', id)
  done(null, authData);
});

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'pwd'
  },
  function (username, password, done) {
    console.log('LocalStrategy', username, password)
    if (username === authData.email) {
      console.log('email OK')
      if (password === authData.password) {
        console.log('password OK')
        return done(null, authData);
      } else {
        console.log('password ERROR')
        return done(null, false, { message: 'Incorrect password.' });
      }
    } else {
      console.log('email ERROR')
      return done(null, false, { message: 'Incorrect email.' });
    }
  }
));

app.post('/auth/login_process',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
    successFlash: 'Hello!'
  }));

//get 요청에 대해서만 미들웨어를 작동
app.get('*', function (req, res, next) {
  fs.readdir('./data', function (error, filelist) {
    req.list = filelist;
    next();
  });
});

//// 라우팅 설정
var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');


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
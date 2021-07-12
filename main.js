const express = require('express');
const app = express();
const port = 3000;

const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');

var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index');

//서버 구동 시, middleware가 자동실행
app.use(express.static('public'));
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
//get 요청에 대해서만 미들웨어를 작동
app.get('*', function (req, res, next) {
  fs.readdir('./data', function (error, filelist) {
    req.list = filelist;
    next();
  });
});

app.use('/', indexRouter);

app.use('/topic', topicRouter);

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
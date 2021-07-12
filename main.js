const express = require('express')
const app = express()
const port = 3000

var fs = require('fs');
var path = require('path');
var qs = require('qs');
var bodyParser = require('body-parser')
var compression = require('compression')
var sanitizeHtml = require('sanitize-html')
var template = require('./lib/template.js')
var topicRouter = require('./routes/topic') 

//서버 구동 시, middleware가 자동실행
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
//get 요청에 대해서만 미들웨어를 작동
app.get('*', function (req, res, next) {
  fs.readdir('./data', function (error, filelist) {
    req.list = filelist;
    next();
  });
});

//route main page
app.get('/', function (req, res) {
  var title = 'Welcome';
  var description = "HELLO! Welcome my page!";
  var list = template.list(req.list);
  var html = template.HTML(title, list,
    `
    <h2>${title}</h2><p>${description}</p>
    <img src="/images/hello.jpg" style = "width:300px; display:block; margin-top:10px;">
    `,
    '<a href="/topic/create">create</a>'
  );
  res.send(html);
});

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
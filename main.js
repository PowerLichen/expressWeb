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
    '<a href="/create">create</a>'
  );
  res.send(html);
});

app.get('/page/:pageId/', function (req, res, next) {
  var filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
    if (err) {
      next(err);
    } else {
      var title = req.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ['h1']
      });
      var list = template.list(req.list)
      var html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
        ` <a href="/create">create</a>
          <a href="/update/${sanitizedTitle}">update</a>
          <form action='/delete_process' method='post'>
            <input type='hidden' name='id' value='${sanitizedTitle}'>
            <input type='submit' value='delete'>
          </form>
          `
      );
      res.send(html);
    }
  });
});

app.get('/create', function (req, res) {
  var title = 'WEB - create'
  var list = template.list(req.list)
  var html = template.HTML(title, list, `
    <form action="/create_process" method="POST">
        <p><input type="text" name='title' placeholder='title'></p>
        <p>
            <textarea name='description' placeholder='description'></textarea>
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    `, '');
  res.send(html);
});

app.post('/create_process', function (req, res) {
  var post = req.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
    res.redirect(`/page/${title}`);
  });
});

app.get('/update/:pageId', function (req, res) {
  var filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
    var title = req.params.pageId;
    var list = template.list(req.list)
    var html = template.HTML(title, list,
      `
        <form action="/update_process" method="POST">
            <input type='hidden' name='id' value='${title}'>
            <p><input type="text" name='title' placeholder='title', value='${title}'></p>
            <p>
                <textarea name='description' placeholder='description'>${description}</textarea>
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
        `,
      `<a href="/create">create</a> <a href="/update/${title}">update</a>`
    );
    res.send(html);
  });
});

app.post('/update_process', function (req, res) {
  var post = req.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${filteredId}`, `data/${title}`, function (err) {
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
      res.redirect(`/page/${title}`);
    });
  });
});

app.post('/delete_process', function (req, res) {
  var post = req.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function (err) {
    res.redirect('/');
  });
});

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
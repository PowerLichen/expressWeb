const express = require('express')
const app = express()
const port = 3000

var fs = require('fs');
var path = require('path');
var qs = require('qs');
var sanitizeHtml = require('sanitize-html')
var template = require('./lib/template.js')

//route main page
app.get('/', function (req, res) {
  fs.readdir('./data', function (error, filelist) {
    var title = 'Welcome';
    var description = "HELLO! Welcome my page!";
    var list = template.list(filelist);
    var html = template.HTML(title, list,
      `<h2>${title}</h2><p>${description}</p>`,
      '<a href="/create">create</a>'
    );
    res.send(html);
  });
});

app.get('/page/:pageId/', function (req, res) {
  fs.readdir('./data/', function (err, filelist) {
    var filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
      var title = req.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ['h1']
      });
      var list = template.list(filelist)
      var html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
        `
        <a href="/create">create</a>
        <a href="/update/${sanitizedTitle}">update</a>
        <form action='/delete_process' method='post'>
          <input type='hidden' name='id' value='${sanitizedTitle}'>
          <input type='submit' value='delete'>
        </form>
        `
      );
      res.send(html);
    });
  });
});

app.get('/create', function (req, res) {
  fs.readdir('./data/', function (err, filelist) {
    // console.log(filelist);
    var title = 'WEB - create'
    var list = template.list(filelist)
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
});

app.post('/create_process', function (req, res) {
  var body = '';
  req.on('data', function (data) {
    body = body + data;
  });
  req.on('end', function () {
    var post = qs.parse(body);
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
      res.redirect(`/page/${title}`)
    });
  });
})

app.get('/update/:pageId', function (req, res) {
  fs.readdir('./data/', function (err, filelist) {
    var filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
      var title = req.params.pageId;
      var list = template.list(filelist)
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
});

app.post('/update_process', function (req, res) {
  var body = '';
  req.on('data', function (data) {
    body = body + data;
  });
  req.on('end', function () {
    var post = qs.parse(body);
    var id = post.id;
    var filteredId = path.parse(id).base;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${filteredId}`, `data/${title}`, function (err) {
      fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        res.redirect(`/page/${title}`);
      });
    })
  });
});

app.post('/delete_process', function (req, res) {
  var body = '';
  req.on('data', function (data) {
    body = body + data;
  });
  req.on('end', function () {
    var post = qs.parse(body);
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (err) {
      res.redirect('/');
    });
  });
})


app.listen(port, function () {
  console.log(`App listening at http://localhost:${port}`);
});
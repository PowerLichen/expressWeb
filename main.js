const express = require('express')
const app = express()
const port = 3000

var fs = require('fs');
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

app.listen(port, function () {
  console.log(`App listening at http://localhost:${port}`);
});
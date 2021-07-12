const express = require('express')
var router = express.Router()


var template = require('../lib/template.js');

//route main page
router.get('/', function (req, res) {
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

module.exports = router;
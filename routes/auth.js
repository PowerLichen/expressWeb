const express = require('express')
var router = express.Router()

var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html')
var template = require('../lib/template.js')



router.get('/login', function (req, res) {
  var title = 'WEB - login'
  var list = template.list(req.list)
  var html = template.HTML(title, list, `
      <form action="/auth/login_process" method="POST">
        <p><input type="text" name='email' placeholder='email'></p>
        <p><input type="password" name='pwd' placeholder='password'></p>
          <p>
              <input type="submit" value="login">
          </p>
      </form>
      `, '');
  res.send(html);
});
/*
router.post('/login_process', function (req, res) {
  var post = req.body;
  var email = post.email;
  var password = post.pwd;
  if (email === authData.email && password === authData.password) {
    req.session.isLogined = true;
    console.log(req.session.isLogined)
    req.session.nickname = authData.nickname;
    req.session.save(function () {
      res.redirect(`/`);
    });
  } else {
    res.send("Who?");
  }
});
*/
router.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});

module.exports = router;
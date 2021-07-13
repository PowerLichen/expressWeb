const express = require('express')
var router = express.Router()

var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html')
var template = require('../lib/template.js')



router.get('/login', function (req, res) {
  var fmsg = req.flash();
  var feedback = '';
  if (fmsg.error){
    feedback=fmsg.error[0];
  }
  console.log(fmsg);
  var title = 'WEB - login'
  var list = template.list(req.list)
  var html = template.HTML(title, list, `
      <div style="color:red;">${feedback}</div>
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
  req.logout();
  // req.session.destroy(function(err){
  //   res.redirect('/');
  // })
  req.session.save(function(err){
    res.redirect('/');
  })
});

module.exports = router;
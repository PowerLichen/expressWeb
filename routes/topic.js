const express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');

router.get('/create', function (req, res) {
    var title = 'WEB - create'
    var list = template.list(req.list)
    var html = template.HTML(title, list, `
      <form action="/topic/create_process" method="POST">
          <p><input type="text" name='title' placeholder='title'></p>
          <p>
              <textarea name='description' placeholder='description'></textarea>
          </p>
          <p>
              <input type="submit">
          </p>
      </form>
      `, '', auth.statusUI(req, res));
    res.send(html);
});

router.post('/create_process', function (req, res) {
    if (!auth.isOwner(req, res)) {
        res.redirect('/');
        return false;
    }
    var post = req.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        res.redirect(`/topic/${title}`);
    });
});

router.get('/update/:pageId', function (req, res) {
    if(!auth.isOwner(req,res)){
        res.redirect('/');
        return false;
    }
    var filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        var title = req.params.pageId;
        var list = template.list(req.list)
        var html = template.HTML(title, list,
            `
          <form action="/topic/update_process" method="POST">
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
            `<a href="/create">create</a> <a href="/topic/update/${title}">update</a>`,
            auth.statusUI(req, res)
        );
        res.send(html);
    });
});

router.post('/update_process', function (req, res) {
    var post = req.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${filteredId}`, `data/${title}`, function (err) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
            res.redirect(`/topic/${title}`);
        });
    });
});

router.post('/delete_process', function (req, res) {
    if(!auth.isOwner(req,res)){
        res.redirect('/');
        return false;
    }
    var post = req.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (err) {
        res.redirect('/');
    });
});

router.get('/:pageId/', function (req, res, next) {
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
                ` <a href="/topic/create">create</a>
                    <a href="/topic/update/${sanitizedTitle}">update</a>
                    <form action='/topic/delete_process' method='post'>
                <input type='hidden' name='id' value='${sanitizedTitle}'>
                <input type='submit' value='delete'>
                </form>
                `,
                auth.statusUI(req, res)
            );
            res.send(html);
        }
    });
});

module.exports = router;
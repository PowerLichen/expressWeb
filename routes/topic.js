const express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');



module.exports = function (db) {
    router.get('/create', function (req, res) {
        db.query('SELECT * FROM author', function (err, authors) {
            var title = 'WEB - create';
            var list = template.list(req.list);
            var authorSelector = template.authorSelector(authors);
            var html = template.HTML(title, list, `
            <form action="/topic/create_process" method="POST">
                <p><input type="text" name='title' placeholder='title'></p>
                <p>
                    <textarea name='description' placeholder='description'></textarea>
                </p>
                <p>
                    ${authorSelector}
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
            `, '', auth.statusUI(req, res));
            res.send(html);
        });
    });

    router.post('/create_process', function (req, res) {
        if (!auth.isOwner(req, res)) {
            res.redirect('/');
            return false;
        }
        var post = req.body;
        var title = post.title;
        var authorId = post.author;
        var description = post.description;
        db.query(
            `INSERT INTO topic(title, description, created, author_id)
             VALUES(?, ?, NOW(), ?)`,
            [title, description, authorId],
            function (err, result) {
                if (err) {
                    console.log(err);
                    next(err);
                } else {
                    res.redirect(`/topic/${result.insertId}`);
                }
            }
        )
        // fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        //     
        // });
    });

    router.get('/update/:pageId', function (req, res) {
        if (!auth.isOwner(req, res)) {
            res.redirect('/');
            return false;
        }
        var filteredId = path.parse(req.params.pageId).base;
        db.query(
            `SELECT * FROM topic WHERE id = ?`, [filteredId],
            function (err, topic) {
                if (err) {
                    console.log(err);
                    next(err);
                } else {
                    var pageId = topic[0].id;
                    var title = topic[0].title;
                    var description = topic[0].description;
                    var author_id = topic[0].author_id;
                    db.query('SELECT * FROM author', function (err, authors) {
                        var list = template.list(req.list);
                        var authorSelector = template.authorSelector(authors, author_id);
                        var html = template.HTML(title, list,
                            `
                            <form action="/topic/update_process" method="POST">
                                <input type='hidden' name='id' value='${pageId}'>
                                <p><input type="text" name='title' placeholder='title', value='${title}'></p>
                                <p>
                                    <textarea name='description' placeholder='description'>${description}</textarea>
                                </p>
                                <p>
                                    ${authorSelector}
                                </P>
                                <p>
                                    <input type="submit">
                                </p>
                            </form>
                            `,
                            `<a href="/topic/create">create</a> <a href="/topic/update/${pageId}">update</a>`,
                            auth.statusUI(req, res)
                        );
                        res.send(html);
                    });
                }
            }
        );
    });

    router.post('/update_process', function (req, res) {
        var post = req.body;
        var id = post.id;
        var author = post.author;
        var filteredId = path.parse(id).base;
        var title = post.title;
        var description = post.description;
        db.query(`UPDATE topic SET title = ?, description = ?, author_id = ?
                  WHERE id = ?`,
            [title, description, author, filteredId],
            function (err, result) {
                res.redirect(`/topic/${filteredId}`);
            });
    });

    router.post('/delete_process', function (req, res) {
        if (!auth.isOwner(req, res)) {
            res.redirect('/');
            return false;
        }
        var post = req.body;
        var id = post.id;
        var filteredId = path.parse(id).base;
        db.query('DELETE FROM topic WHERE id = ?', [filteredId],
            function (err, result) {
                if (err) {
                    next(err);
                } else {
                    res.redirect('/');
                }
            })
    });

    router.get('/:pageId/', function (req, res, next) {
        var filteredId = path.parse(req.params.pageId).base;
        db.query(
            `SELECT topic.id, title, description, created, author_id, name, profile
             FROM topic LEFT JOIN author
             ON topic.author_id=author.id
             WHERE topic.id = ?`, [filteredId],
            function (err, topic) {
                if (err) {
                    next(err);
                } else {
                    var pageId = topic[0].id;
                    var title = topic[0].title;
                    var description = topic[0].description;
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description, {
                        allowedTags: ['h1']
                    });
                    var list = template.list(req.list)
                    var html = template.HTML(sanitizedTitle, list,
                        `<h2>${sanitizedTitle}</h2>
                         <p>${sanitizedDescription}</p>
                         <p>author by ${topic[0].name}</p>`,
                        `<a href="/topic/create">create</a>
                        <a href="/topic/update/${pageId}">update</a>
                        <form action='/topic/delete_process' method='post'>
                            <input type='hidden' name='id' value='${pageId}'>
                            <input type='submit' value='delete'>
                        </form>
                    `,
                        auth.statusUI(req, res)
                    );
                    res.send(html);
                }
            }
        );
    });

    return router;
}
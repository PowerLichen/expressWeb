const express = require('express')
const app = express()
const port = 3000

var fs = require('fs');
var path = require('path');
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

app.get('/page/:pageId/', function(req, res){
  fs.readdir('./data/', function (err, filelist) {
    var filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        var title = req.params.pageId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description,{
            allowedTags:['h1']
        });
        var list = template.list(filelist)
        var html = template.HTML(sanitizedTitle, list,
            `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
            `<a href="/create">create</a>
             <a href="/update?id=${sanitizedTitle}">update</a>
             <form action='delete_process' method='post'>
                <input type='hidden' name='id' value='${sanitizedTitle}'>
                <input type='submit' value='delete'>
             </form>`
        );
        res.send(html);
    });
});
})

app.listen(port, function () {
  console.log(`App listening at http://localhost:${port}`);
});

/*
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html')

var template = require('./lib/template.js')

var app = http.createServer(function (req, res) {
    var _url = req.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    var title = queryData.id;

    // comment: Show path without query string
    // console.log(url.parse(_url,true).pathname)

    // comment: just show page
    // console.log(__dirname + _url);
    // res.end(fs.readFileSync(__dirname + _url));

    // comment: node.js data transfer
    // res.end('egoing : ' + _url);

    if (pathname === '/') {
        if (queryData.id === undefined) {           
        } else {
            fs.readdir('./data/', function (err, filelist) {
                // 해당 위치에서 다른 경로로 이동할 수 없도록
                // 쿼리를 필터해주는 path 모듈 사용
                var filteredId = path.parse(queryData.id).base;
                //URL parse by query string
                fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
                    var title = queryData.id;
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description,{
                        // 특정 태그 허용
                        allowedTags:['h1']
                    });
                    var list = template.list(filelist)
                    var html = template.HTML(sanitizedTitle, list,
                        `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
                        `<a href="/create">create</a>
                         <a href="/update?id=${sanitizedTitle}">update</a>
                         <form action='delete_process' method='post'>
                            <input type='hidden' name='id' value='${sanitizedTitle}'>
                            <input type='submit' value='delete'>
                         </form>`
                    );
                    res.writeHead(200);
                    res.end(html);
                });
            });
        }
    } else if (pathname == '/create') {
        fs.readdir('./data/', function (err, filelist) {
            // console.log(filelist);
            title = 'WEB - create'
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
            res.writeHead(200);
            res.end(html);
        });
    } else if (pathname == '/create_process') {
        var body = '';
        // 대량의 데이터를 분산하여 Load하는 부분
        req.on('data', function (data) {
            body = body + data;
        });
        //데이터 수신이 전부 Load한 후 작동
        req.on('end', function () {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
                res.writeHead(302, { Location: `/?id=${title}` });
                res.end();
            });
        });

    } else if (pathname == '/update') {
        fs.readdir('./data/', function (err, filelist) {            
            var filteredId = path.parse(queryData.id).base;
            //URL parse by query string
            fs.readFile(`data/${filteredId}}`, 'utf8', function (err, data) {
                var title = queryData.id;
                var description = data;
                var list = template.list(filelist)
                //create 템플릿 재사용
                // value값 지정을 통해서 저장된 값 표시
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
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );
                res.writeHead(200);
                res.end(html);
            });
        });
    } else if (pathname == '/update_process') {
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
            // 사용자가 지정한 title로 기존에 위치한 이름 변경 
            fs.rename(`data/${filteredId}`, `data/${title}`, function (err) {
                fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
                    // 리다이렉트 기능 이용
                    res.writeHead(302, { Location: `/?id=${title}` });
                    res.end();
                });
            })
            //console.log(post);
        });
    } else if (pathname == '/delete_process') {
        var body = '';
        req.on('data', function (data) {
            body = body + data;
        });
        req.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;            
            var filteredId = path.parse(id).base;
            // 삭제 기능 수행 후 메인페이지로 리다이렉션
            fs.unlink(`data/${filteredId}`, function (err) {
                res.writeHead(302, { Location: `/` });
                res.end();
            });
            //console.log(post);
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    };
})

app.listen(3000);
*/
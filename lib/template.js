module.exports = {
    HTML: function (title, list, body, control, authStatusUI = '<a href="/auth/login">login</a>') {
        return `
        <!doctype html>
        <html>
        <head>
            <title>WEB - ${title}</title>
            <meta charset="utf-8">
        </head>
        <body>
            ${authStatusUI}
            <h1><a href="/">WEB</a></h1>
            ${list}
            ${control}
            ${body}    
        </body>
        </html>
        `;
    },
    list: function (topics) {
        var list = '<ul>'
        var i = 0;
        while (i < topics.length) {
            list = list + `<li><a href="/topic/${topics[i].id}">${topics[i].title}</a></li>`
            i = i + 1
        };
        list = list + '</ul>';
        return list;
    },
    authorSelector: function (authors, author_id) {
        var tag = '';
        var i = 0;
        while (i < authors.length) {
            var selected = '';
            if(authors[i].id === author_id){
                selected = ' selected';
            }
            tag += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
            i++;
        }
        return `
        <select name ='author'>
            ${tag}
        </select>
        `
    }
}
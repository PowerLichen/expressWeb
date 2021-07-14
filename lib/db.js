const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'node',
    password: 'zxasqw12!@',
    database: 'opentutorials'
});

module.exports = db;
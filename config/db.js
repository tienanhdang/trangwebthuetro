const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "trangwebthuetro",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("Kết nối MySQL thành công");

module.exports = db;

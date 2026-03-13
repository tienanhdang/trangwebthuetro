const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "trangwebthuetro"
});

db.connect((err) => {
    if (err) {
        console.log("Kết nối database lỗi");
    } else {
        console.log("Kết nối MySQL thành công");
    }
});

module.exports = db;
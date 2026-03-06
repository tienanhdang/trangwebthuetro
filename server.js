const express = require("express");
const mysql = require("mysql2");
const app = express();

/* KẾT NỐI DATABASE */

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",   // nếu có mật khẩu thì điền
    database: "trangwebthuetro"
});

db.connect((err) => {
    if (err) {
        console.log("Kết nối database lỗi");
    } else {
        console.log("Kết nối MySQL thành công");
    }
});
app.get("/phongtro", (req, res) => {

    const sql = "SELECT * FROM phong_tro";

    db.query(sql, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });

});
app.get("/phongtro/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT * FROM phong_tro
    WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });

});
app.get("/phongtro/:id/noithat", (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT noi_that.ten_noi_that
    FROM phong_noi_that
    JOIN noi_that
    ON phong_noi_that.noi_that_id = noi_that.id
    WHERE phong_noi_that.phong_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });

});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
const express = require("express");
const mysql = require("mysql2");
const app = express();

app.use(express.json());

/* KẾT NỐI DATABASE */

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

/* =========================
   API DANH SÁCH PHÒNG TRỌ
========================= */

app.get("/phongtro", (req, res) => {

    const sql = "SELECT * FROM phong_tro";

    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }
    });

});

/* =========================
   API CHI TIẾT PHÒNG
========================= */

app.get("/phongtro/:id", (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM phong_tro WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }

    });

});

/* =========================
   API NỘI THẤT PHÒNG
========================= */

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
            res.status(500).json(err);
        } else {
            res.json(result);
        }

    });

});

/* =========================
   API HÌNH ẢNH PHÒNG
========================= */

app.get("/phongtro/:id/hinhanh", (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM hinh_anh_phong WHERE phong_id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }

    });

});

/* =========================
   API ĐĂNG PHÒNG
========================= */

app.post("/phongtro", (req, res) => {

    const {
        chu_phong_id,
        tieu_de,
        dia_chi,
        quan_huyen,
        thanh_pho,
        gia_tien,
        dien_tich
    } = req.body;

    const sql = `
    INSERT INTO phong_tro
    (chu_phong_id, tieu_de, dia_chi, quan_huyen, thanh_pho, gia_tien, dien_tich)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [chu_phong_id, tieu_de, dia_chi, quan_huyen, thanh_pho, gia_tien, dien_tich],
        (err, result) => {

            if (err) {
                res.status(500).json(err);
            } else {
                res.json({
                    message: "Đăng phòng thành công",
                    id: result.insertId
                });
            }

        }
    );

});

/* =========================
   API ĐÁNH GIÁ PHÒNG
========================= */

app.get("/phongtro/:id/danhgia", (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT danh_gia.*, nguoi_dung.ho_ten
    FROM danh_gia
    JOIN nguoi_dung
    ON danh_gia.nguoi_dung_id = nguoi_dung.id
    WHERE phong_id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }

    });

});

/* ========================= */

app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});
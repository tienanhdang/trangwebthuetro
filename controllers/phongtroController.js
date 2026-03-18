const db = require("../config/db");

/* DANH SÁCH PHÒNG */

exports.getAllPhongTro = (req, res) => {

    const sql = "SELECT * FROM phong_tro";

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });

};

/* CHI TIẾT PHÒNG */

exports.getPhongTroById = (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM phong_tro WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });

};

/* NỘI THẤT PHÒNG */

exports.getNoiThat = (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT noi_that.ten_noi_that
    FROM phong_noi_that
    JOIN noi_that
    ON phong_noi_that.noi_that_id = noi_that.id
    WHERE phong_noi_that.phong_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });

};

/* HÌNH ẢNH PHÒNG */

exports.getHinhAnh = (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM hinh_anh_phong WHERE phong_id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });

};

/* ĐĂNG PHÒNG */

exports.createPhongTro = (req, res) => {

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

            if (err) return res.status(500).json(err);

            res.json({
                message: "Đăng phòng thành công",
                id: result.insertId
            });

        }
    );

};

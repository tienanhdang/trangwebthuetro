const db = require("../config/db");

exports.getDanhGia = (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT danh_gia.*, nguoi_dung.ho_ten
    FROM danh_gia
    JOIN nguoi_dung
    ON danh_gia.nguoi_dung_id = nguoi_dung.id
    WHERE phong_id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) return res.status(500).json(err);

        res.json(result);

    });

};
const db = require("../config/db");

// 1. Hàm lấy đánh giá (Khớp với danhgiaController.getDanhGia)
exports.getDanhGia = (req, res) => {
    const phongId = req.params.id;
    const sql = "SELECT * FROM danh_gia WHERE phong_id = ?";
    
    db.query(sql, [phongId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

// 2. Hàm thêm đánh giá (Khớp với danhgiaController.addDanhGia)
exports.addDanhGia = (req, res) => {
    const { phong_id, nguoi_dung_id, noi_dung, sao } = req.body;
    const sql = "INSERT INTO danh_gia (phong_id, nguoi_dung_id, noi_dung, sao) VALUES (?, ?, ?, ?)";

    db.query(sql, [phong_id, nguoi_dung_id, noi_dung, sao], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Thêm đánh giá thành công!" });
    });
};
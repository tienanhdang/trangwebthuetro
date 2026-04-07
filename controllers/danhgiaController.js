const db = require("../config/db");

// 1. Hàm lấy đánh giá (Khớp với danhgiaController.getDanhGia)
exports.getDanhGia = async (req, res) => {
    const phongId = req.params.id;
    const sql = "SELECT * FROM danh_gia WHERE phong_id = ?";
    
    try {
        const [result] = await db.query(sql, [phongId]);
        res.json(result);
    } catch (err) {
        console.error("Lỗi lấy đánh giá:", err);
        return res.status(500).json({ error: err.message });
    }
};

// 2. Hàm thêm đánh giá (Khớp với danhgiaController.addDanhGia)
exports.addDanhGia = async (req, res) => {
    const { phong_id, nguoi_dung_id, noi_dung, sao } = req.body;
    const sql = "INSERT INTO danh_gia (phong_id, nguoi_dung_id, noi_dung, sao) VALUES (?, ?, ?, ?)";

    try {
        await db.query(sql, [phong_id, nguoi_dung_id, noi_dung, sao]);
        res.status(201).json({ message: "Thêm đánh giá thành công!" });
    } catch (err) {
        console.error("Lỗi thêm đánh giá:", err);
        return res.status(500).json({ error: err.message });
    }
};

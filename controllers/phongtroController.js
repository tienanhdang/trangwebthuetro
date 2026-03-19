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
    // 1. KIỂM TRA QUYỀN: Nếu không phải chủ trọ thì đuổi về luôn
    if (req.user.role !== 'chu_tro') {
        return res.status(403).json({ message: "Chỉ tài khoản Chủ trọ mới có quyền đăng phòng!" });
    }

    // 2. LẤY ID TỪ TOKEN (Cực kỳ quan trọng để bảo mật)
    const chu_phong_id = req.user.id; 

    const {
        tieu_de,
        dia_chi,
        quan_huyen,
        thanh_pho,
        gia_tien,
        dien_tich
    } = req.body;

    const sql = `
        INSERT INTO phong_tro (chu_phong_id, tieu_de, dia_chi, quan_huyen, thanh_pho, gia_tien, dien_tich)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [chu_phong_id, tieu_de, dia_chi, quan_huyen, thanh_pho, gia_tien, dien_tich],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                message: "Đăng phòng thành công!",
                id: result.insertId
            });
        }
    );
};

/* XÓA PHÒNG TRỌ (BẢN NÂNG CẤP BẢO MẬT) */
exports.deletePhongTro = (req, res) => {
    const phongId = req.params.id;
    // req.user.id được lấy ra từ hàm verifyToken sau khi giải mã JWT
    const userId = req.user.id; 

    // Câu lệnh SQL: Chỉ xóa phòng khi ID phòng khớp VÀ người xóa phải là chủ phòng
    const sql = "DELETE FROM phong_tro WHERE id = ? AND chu_phong_id = ?";

    db.query(sql, [phongId, userId], (err, result) => {
        if (err) return res.status(500).json(err);
        
        // Nếu không có dòng nào bị ảnh hưởng -> 1 là phòng không tồn tại, 2 là người dùng không phải chủ phòng
        if (result.affectedRows === 0) {
            return res.status(403).json({ 
                message: "Không thể xóa! Phòng không tồn tại hoặc bạn không phải chủ phòng." 
            });
        }
        
        // Trả về thành công để Frontend hiện Popup
        res.status(200).json({ message: "Phòng trọ đã được xóa" });
    });
};
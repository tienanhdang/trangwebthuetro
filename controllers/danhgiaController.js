const db = require("../config/db");


// =========================
// LẤY ĐÁNH GIÁ
// GET /danhgia/:id
// =========================
exports.getDanhGia = async (req, res) => {

    const phongId = req.params.id;

    const sql = `
        SELECT 
            dg.id,
            dg.phong_id,
            dg.nguoi_dung_id,
            dg.so_sao,
            dg.binh_luan,
            dg.ngay_danh_gia,
            u.ho_ten
        FROM danh_gia dg
        LEFT JOIN nguoi_dung u
            ON dg.nguoi_dung_id = u.id
        WHERE dg.phong_id = ?
        ORDER BY dg.ngay_danh_gia DESC
    `;

    try {

        const [result] = await db.query(sql, [phongId]);

        res.json(result);

    } catch (err) {

        console.error("Lỗi lấy đánh giá:", err);

        res.status(500).json({
            error: "Lỗi lấy đánh giá"
        });
    }
};


// =========================
// THÊM ĐÁNH GIÁ
// POST /danhgia
// =========================
exports.addDanhGia = async (req, res) => {

    const {
        phong_id,
        nguoi_dung_id,
        so_sao,
        binh_luan
    } = req.body;


    if (!phong_id || !nguoi_dung_id || !so_sao) {

        return res.status(400).json({
            error: "Thiếu thông tin đánh giá"
        });
    }


    if (so_sao < 1 || so_sao > 5) {

        return res.status(400).json({
            error: "Số sao phải từ 1 đến 5"
        });
    }


    const sql = `
        INSERT INTO danh_gia
        (
            phong_id,
            nguoi_dung_id,
            so_sao,
            binh_luan
        )
        VALUES (?, ?, ?, ?)
    `;


    try {

        await db.query(sql, [
            phong_id,
            nguoi_dung_id,
            so_sao,
            binh_luan || null
        ]);


        res.status(201).json({
            message: "Thêm đánh giá thành công!"
        });

    } catch (err) {

        console.error("Lỗi thêm đánh giá:", err);

        res.status(500).json({
            error: err.message
        });
    }
};

exports.getDanhGia = (req, res) => {

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const sql = `
    SELECT danh_gia.*, nguoi_dung.ho_ten
    FROM danh_gia
    JOIN nguoi_dung
        ON danh_gia.nguoi_dung_id = nguoi_dung.id
    WHERE phong_id = ?
    ORDER BY danh_gia.id DESC
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json({ message: "Lỗi server", error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Chưa có đánh giá nào" });
        }

        res.json(result);

    });

};
exports.addDanhGia = (req, res) => {
    const { phong_id, nguoi_dung_id, noi_dung, so_sao } = req.body;

    const sql = `
    INSERT INTO danh_gia (phong_id, nguoi_dung_id, noi_dung, so_sao)
    VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [phong_id, nguoi_dung_id, noi_dung, so_sao], (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({ message: "Thêm đánh giá thành công" });
    });
};
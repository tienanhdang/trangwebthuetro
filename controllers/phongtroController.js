const db = require("../config/db");

/* ================================
1. DANH SÁCH PHÒNG + TÌM KIẾM + LỌC
GET /phongtro
================================ */
exports.getAllPhongTro = (req, res) => {
  const {
    keyword,
    gia_min,
    gia_max,
    thanh_pho,
    quan_huyen,
    page = 1,
    limit = 10
  } = req.query;

  let sql = "SELECT * FROM phong_tro WHERE 1=1";
  let params = [];

  if (keyword) {
    sql += " AND (tieu_de LIKE ? OR dia_chi LIKE ?)";
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (gia_min) {
    sql += " AND gia_tien >= ?";
    params.push(gia_min);
  }

  if (gia_max) {
    sql += " AND gia_tien <= ?";
    params.push(gia_max);
  }

  if (thanh_pho) {
    sql += " AND thanh_pho = ?";
    params.push(thanh_pho);
  }

  if (quan_huyen) {
    sql += " AND quan_huyen = ?";
    params.push(quan_huyen);
  }

  const offset = (page - 1) * limit;
  sql += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};


/* ================================
2. CHI TIẾT PHÒNG
GET /phongtro/:id
================================ */
exports.getPhongTroById = (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM phong_tro WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    res.json(result[0]); // ✅ trả object
  });
};


/* ================================
3. NỘI THẤT PHÒNG
GET /phongtro/:id/noithat
================================ */
exports.getNoiThat = (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT nt.ten_noi_that
    FROM phong_noi_that pnt
    JOIN noi_that nt ON pnt.noi_that_id = nt.id
    WHERE pnt.phong_id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};


/* ================================
4. HÌNH ẢNH PHÒNG
GET /phongtro/:id/hinhanh
================================ */
exports.getHinhAnh = (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM hinh_anh_phong WHERE phong_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};


/* ================================
5. LIÊN HỆ
GET /phongtro/:id/lienhe
================================ */
exports.getLienHe = (req, res) => {
  const id = req.params.id;

  const sql = "SELECT so_dien_thoai FROM phong_tro WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    const token = req.headers.authorization;

    if (!token) {
      return res.json({ so_dien_thoai: "********" });
    }

    res.json(result[0]);
  });
};


/* ================================
6. ĐĂNG PHÒNG
POST /phongtro
================================ */
exports.createPhongTro = (req, res) => {
  if (req.user.role !== "chu_tro") {
    return res.status(403).json({ message: "Chỉ chủ trọ được đăng" });
  }

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
    INSERT INTO phong_tro 
    (chu_phong_id, tieu_de, dia_chi, quan_huyen, thanh_pho, gia_tien, dien_tich)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    chu_phong_id,
    tieu_de,
    dia_chi,
    quan_huyen,
    thanh_pho,
    gia_tien,
    dien_tich
  ], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Đăng phòng thành công",
      id: result.insertId
    });
  });
};


/* ================================
7. XÓA PHÒNG
DELETE /phongtro/:id
================================ */
exports.deletePhongTro = (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  const sql = "DELETE FROM phong_tro WHERE id = ? AND chu_phong_id = ?";

  db.query(sql, [id, userId], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Không có quyền xóa" });
    }

    res.json({ message: "Xóa thành công" });
  });
};


/* ================================
8. SỬA PHÒNG
PUT /phongtro/:id
================================ */
exports.updatePhongTro = (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  const {
    tieu_de,
    dia_chi,
    quan_huyen,
    thanh_pho,
    gia_tien,
    dien_tich
  } = req.body;

  const sql = `
    UPDATE phong_tro
    SET tieu_de=?, dia_chi=?, quan_huyen=?, thanh_pho=?, gia_tien=?, dien_tich=?
    WHERE id=? AND chu_phong_id=?
  `;

  db.query(sql, [
    tieu_de,
    dia_chi,
    quan_huyen,
    thanh_pho,
    gia_tien,
    dien_tich,
    id,
    userId
  ], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Không có quyền sửa" });
    }

    res.json({ message: "Cập nhật thành công" });
  });
};


/* ================================
9. CẬP NHẬT TRẠNG THÁI
PATCH /phongtro/:id/trangthai
================================ */
exports.updateTrangThai = (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const { trang_thai } = req.body;

  const sql = `
    UPDATE phong_tro
    SET trang_thai = ?
    WHERE id = ? AND chu_phong_id = ?
  `;

  db.query(sql, [trang_thai, id, userId], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Không có quyền cập nhật" });
    }

    res.json({ message: "Cập nhật trạng thái thành công" });
  });
};
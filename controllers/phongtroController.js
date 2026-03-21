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
/* ================================
1.TÌM KIẾM + LỌC 
================================ */
exports.getAllPhongTro = async (req, res) => {
  try {
    const {
      keyword,
      gia_min,
      gia_max,
      thanh_pho,
      quan_huyen,
      noi_that,
      page = 1,
      limit = 10
    } = req.query;

    let sql = `
      SELECT DISTINCT p.*
      FROM phong p
      LEFT JOIN phong_noi_that pnt ON p.id = pnt.phong_id
      LEFT JOIN noi_that nt ON pnt.noi_that_id = nt.id
      WHERE 1=1
    `;

    let params = [];

    // tìm kiếm (tên + mô tả)
    if (keyword) {
      sql += " AND (p.ten LIKE ? OR p.mo_ta LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // lọc giá
    if (gia_min) {
      sql += " AND p.gia >= ?";
      params.push(gia_min);
    }

    if (gia_max) {
      sql += " AND p.gia <= ?";
      params.push(gia_max);
    }

    //địa điểm
    if (thanh_pho) {
      sql += " AND p.thanh_pho = ?";
      params.push(thanh_pho);
    }

    if (quan_huyen) {
      sql += " AND p.quan_huyen = ?";
      params.push(quan_huyen);
    }

    // nội thất (nhiều giá trị)
    if (noi_that) {
      const list = noi_that.split(","); // vd: may lanh,tu lanh
      sql += ` AND nt.ten_noi_that IN (${list.map(() => "?").join(",")})`;
      params.push(...list);
    }

    // phân trang
    const offset = (page - 1) * limit;
    sql += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(sql, params);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ================================
2. GET /phong/:id
CHI TIẾT PHÒNG + NỘI THẤT
================================ */
exports.getPhongTroById = async (req, res) => {
  try {
    const { id } = req.params;

    // lấy phòng
    const [phong] = await db.execute(
      "SELECT * FROM phong WHERE id = ?",
      [id]
    );

    if (phong.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    // lấy nội thất
    const [noiThat] = await db.execute(`
      SELECT nt.ten_noi_that
      FROM phong_noi_that pnt
      JOIN noi_that nt ON pnt.noi_that_id = nt.id
      WHERE pnt.phong_id = ?
    `, [id]);

    res.json({
      ...phong[0],
      noi_that: noiThat.map(n => n.ten_noi_that)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* Sửa phòng */
exports.updatePhongTro = async (req, res) => {
  try {
    const phongId = req.params.id;
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
      SET tieu_de = ?, dia_chi = ?, quan_huyen = ?, thanh_pho = ?, gia_tien = ?, dien_tich = ?
      WHERE id = ? AND chu_phong_id = ?
    `;

    const [result] = await db.execute(sql, [
      tieu_de,
      dia_chi,
      quan_huyen,
      thanh_pho,
      gia_tien,
      dien_tich,
      phongId,
      userId
    ]);

    if (result.affectedRows === 0) {
      return res.status(403).json({
        message: "Bạn không có quyền sửa phòng này!"
      });
    }

    res.json({ message: "Cập nhật phòng thành công" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* Cập nhật phòng */
exports.updateTrangThai = async (req, res) => {
  try {
    const phongId = req.params.id;
    const userId = req.user.id;
    const { trang_thai } = req.body;

    const sql = `
      UPDATE phong_tro
      SET trang_thai = ?
      WHERE id = ? AND chu_phong_id = ?
    `;

    const [result] = await db.execute(sql, [
      trang_thai,
      phongId,
      userId
    ]);

    if (result.affectedRows === 0) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật trạng thái!"
      });
    }

    res.json({ message: "Cập nhật trạng thái thành công" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================================
3. GET /phong/:id/lienhe
ẨN SĐT NẾU CHƯA LOGIN

exports.getLienHe = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      "SELECT so_dien_thoai FROM phong WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    // 🔐 giả lập login
    const token = req.headers.authorization;

    if (token !== "Bearer token123") {
      return res.json({ so_dien_thoai: "********" });
    }

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const fs = require("fs");
const path = require("path"); 
const db = require("../config/db");
/* ================================
1. DANH SÁCH PHÒNG + TÌM KIẾM + LỌC
GET /phongtro
================================ */
exports.getAllPhongTro = async (req, res) => {
  const { keyword, gia_min, gia_max, thanh_pho, phuong_xa, sort, noi_that, trang_thai, page = 1, limit = 10 } = req.query;

  // 1. Thêm CONCAT để đường dẫn ảnh đúng và dùng GROUP BY để tránh trùng lặp
  let sql = `
      SELECT pt.*, 
      (SELECT CONCAT('/uploads/', duong_dan_anh) FROM hinh_anh_phong WHERE phong_id = pt.id LIMIT 1) AS hinh_anh
      FROM phong_tro pt
      LEFT JOIN phong_noi_that pnt ON pt.id = pnt.phong_id
      LEFT JOIN noi_that nt ON pnt.noi_that_id = nt.id
      WHERE 1=1
  `;
  let params = [];

  if (keyword) {
    sql += " AND (pt.tieu_de LIKE ? OR pt.dia_chi LIKE ?)";
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  // Ép kiểu Number để tránh lỗi so sánh chuỗi trong SQL
  if (gia_min) { sql += " AND pt.gia_tien >= ?"; params.push(Number(gia_min)); }
  if (gia_max) { sql += " AND pt.gia_tien <= ?"; params.push(Number(gia_max)); }
  if (thanh_pho) { sql += " AND pt.thanh_pho = ?"; params.push(thanh_pho); }
  if (phuong_xa) { sql += " AND pt.phuong_xa = ?"; params.push(phuong_xa); }

  if (noi_that) {
    const noiThatArray = noi_that.split(',').map(item => item.trim());
    if (noiThatArray.length > 0) {
      const placeholders = noiThatArray.map(() => "?").join(",");
      sql += ` AND nt.ten_noi_that IN (${placeholders})`;
      params.push(...noiThatArray);
    }
  }

  if (trang_thai && trang_thai !== 'all') {
    sql += " AND pt.trang_thai = ?";
    params.push(trang_thai);
  }

  // 2. Chốt Group By trước khi Sort/Limit
  sql += " GROUP BY pt.id";

  if (sort === 'asc') sql += " ORDER BY pt.gia_tien ASC";
  else if (sort === 'desc') sql += " ORDER BY pt.gia_tien DESC";
  else sql += " ORDER BY pt.ngay_dang DESC"; 

  const offset = (parseInt(page) - 1) * parseInt(limit);
  sql += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  try {
    const [result] = await db.query(sql, params);
    res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
};


/* ================================
2. CHI TIẾT PHÒNG
GET /phongtro/:id
================================ */
exports.getPhongTroById = async (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM phong_tro WHERE id = ?";

  try {
    const [result] = await db.query(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    res.json(result[0]); // ✅ trả object
  } catch (err) {
    return res.status(500).json(err);
  }
};


/* ================================
3. NỘI THẤT PHÒNG
GET /phongtro/:id/noithat
================================ */
exports.getNoiThat = async (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT nt.ten_noi_that
    FROM phong_noi_that pnt
    JOIN noi_that nt ON pnt.noi_that_id = nt.id
    WHERE pnt.phong_id = ?
  `;

  try {
    const [result] = await db.query(sql, [id]);
    res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
};


/* ================================
4. HÌNH ẢNH PHÒNG
GET /phongtro/:id/hinhanh
================================ */
exports.getHinhAnh = async (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM hinh_anh_phong WHERE phong_id = ?";

  try {
    const [result] = await db.query(sql, [id]);

    const images = result.map(img => ({
      ...img,
      duong_dan_anh: '/uploads/' + img.duong_dan_anh
    }));

    res.json(images);
  } catch (err) {
    return res.status(500).json(err);
  }
};


/* ================================
5. LIÊN HỆ
GET /phongtro/:id/lienhe
================================ */
exports.getLienHe = async (req, res) => {
  const id = req.params.id;

  const sql = "SELECT so_dien_thoai FROM phong_tro WHERE id = ?";

  try {
    const [result] = await db.query(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    res.json(result[0]);
  } catch (err) {
    return res.status(500).json(err);
  }
};


/* ================================
6. ĐĂNG PHÒNG
POST /phongtro
================================ */
exports.createPhongTro = async (req, res) => {
    // 1. Kiểm tra quyền hạn
    if (req.user.role !== "chu_tro") {
        return res.status(403).json({ message: "Chỉ chủ trọ được đăng" });
    }

    const chu_phong_id = req.user.id;

    // 2. Lấy dữ liệu từ body
    const {
        tieu_de, dia_chi, phuong_xa, thanh_pho,
        gia_tien, dien_tich, mo_ta, vi_do, kinh_do,
        noi_that_ids, quy_dinh, ghi_chu
    } = req.body;

    // 2.5 Kiểm tra dữ liệu bắt buộc
    if (!tieu_de || !gia_tien || !dia_chi) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc" });
    }

    // SỬA: Thêm vi_do, kinh_do vào câu lệnh SQL
    const sqlPhong = `
        INSERT INTO phong_tro
        (chu_phong_id, tieu_de, dia_chi, phuong_xa, thanh_pho, gia_tien, dien_tich, mo_ta, quy_dinh, ghi_chu, vi_do, kinh_do)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await db.query(sqlPhong, [
            chu_phong_id, tieu_de, dia_chi, phuong_xa, thanh_pho,
            gia_tien, dien_tich, mo_ta, quy_dinh || null, ghi_chu || null,
            vi_do || null, kinh_do || null // Thêm ở đây
        ]);

        const phong_id = result.insertId;

        // ===== XỬ LÝ ẢNH (Bulk Insert) =====
        if (req.files && req.files.length > 0) {
            const valuesAnh = req.files.map(file => [phong_id, file.filename]);
            const sqlAnh = `INSERT INTO hinh_anh_phong (phong_id, duong_dan_anh) VALUES ?`;
            
            // SỬA: Bọc valuesAnh trong một mảng [] nữa
            await db.query(sqlAnh, [valuesAnh]); 
        }

        // ===== XỬ LÝ NỘI THẤT (Bulk Insert) =====
        if (noi_that_ids) {
            let finalIds = [];
            try {
                // Nếu là string (từ FormData gửi lên thường là string) thì parse, không thì giữ nguyên
                finalIds = typeof noi_that_ids === 'string' ? JSON.parse(noi_that_ids) : noi_that_ids;
                if (!Array.isArray(finalIds)) finalIds = [finalIds];
            } catch (e) {
                console.error("Lỗi xử lý nội thất:", e);
            }
            
            if (finalIds.length > 0) {
                const sqlNoiThat = "INSERT INTO phong_noi_that (phong_id, noi_that_id) VALUES ?";
                const valuesNT = finalIds.map(id => [phong_id, id]);

                // SỬA: Bọc valuesNT trong một mảng [] nữa
                await db.query(sqlNoiThat, [valuesNT]);
            }
        }

        res.json({
            message: "Đăng phòng thành công",
            phong_id: phong_id
        });
    } catch (err) {
        console.error("Lỗi hệ thống:", err);
        return res.status(500).json({ message: "Lỗi lưu thông tin phòng", error: err.message });
    }
};



/* ================================
7. XÓA PHÒNG & XÓA ẢNH VẬT LÝ
DELETE /phongtro/:id
================================ */
exports.deletePhongTro = async (req, res) => {
  // Kiểm tra quyền (giả sử req.user.role được set từ middleware)
  if (req.user.role !== "chu_tro") {
    return res.status(403).json({ message: "Chỉ chủ trọ được xóa" });
  }

  const id = req.params.id;
  const userId = req.user.id;

  try {
    // BƯỚC 1: Lấy danh sách tên file ảnh từ DB trước khi mọi thứ bị xóa
    // Đảm bảo tên cột là 'duong_dan_anh' và 'phong_id' khớp với DB của bạn
    const [images] = await db.query(
      "SELECT duong_dan_anh FROM hinh_anh_phong WHERE phong_id = ?", 
      [id]
    );

    // BƯỚC 2: Xóa trong Database
    // Nếu bạn chưa cài ON DELETE CASCADE, hãy chạy lệnh xóa ảnh trong DB trước:
    // await db.query("DELETE FROM hinh_anh_phong WHERE phong_id = ?", [id]);

    const deleteSql = "DELETE FROM phong_tro WHERE id = ? AND chu_phong_id = ?";
    const [result] = await db.query(deleteSql, [id, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy phòng hoặc bạn không có quyền xóa" });
    }

    // BƯỚC 3: Xóa file vật lý trên ổ cứng
    if (images && images.length > 0) {
      images.forEach(img => {
        // Giả sử ảnh lưu trong thư mục: /public/uploads/ hoặc /uploads/
        // Bạn cần điều chỉnh đường dẫn '..' cho đúng với cấu trúc thư mục của mình
        const fileName = img.duong_dan_anh; 
        const filePath = path.join(__dirname, "..", "public", "uploads", fileName);

        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Lỗi xóa file:", fileName, err);
            else console.log("Đã xóa file vật lý:", fileName);
          });
        }
      });
    }

    res.json({ message: "Đã xóa phòng và các hình ảnh liên quan thành công!" });

  } catch (err) {
    console.error("Lỗi khi xóa phòng:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ", error: err.message });
  }
};
/* ================================
8. SỬA PHÒNG
PUT /phongtro/:id
================================ */
exports.updatePhongTro = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id; 

  // 1. Lấy dữ liệu từ req.body
  // Lưu ý: Client gửi 'quan_huyen', nên ta hứng đúng tên đó để tránh undefined
  const {
    tieu_de,
    dia_chi,
    quan_huyen, 
    thanh_pho,
    gia_tien,
    dien_tich,
    mo_ta,
    vi_do,
    kinh_do,
    trang_thai
  } = req.body;

  // 2. Kiểm tra dữ liệu bắt buộc
  if (!tieu_de || !gia_tien || !dia_chi) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ Tiêu đề, Giá tiền và Địa chỉ." });
  }

  try {
    // 3. Xử lý cập nhật thông tin cơ bản
    const sql = `
      UPDATE phong_tro 
      SET tieu_de=?, dia_chi=?, phuong_xa=?, thanh_pho=?, 
          gia_tien=?, dien_tich=?, mo_ta=?, vi_do=?, kinh_do=?, trang_thai=?
      WHERE id=? AND chu_phong_id=?
    `;

    const values = [
      tieu_de,
      dia_chi,
      quan_huyen, // Khớp với name 'quan_huyen' từ FormData
      thanh_pho,
      gia_tien,
      dien_tich,
      mo_ta || null,
      vi_do || null,
      kinh_do || null,
      trang_thai || 'con_trong',
      id,
      userId
    ];

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(403).json({ 
        message: "Bạn không có quyền chỉnh sửa phòng này hoặc phòng không tồn tại." 
      });
    }

    // 4. Xử lý HÌNH ẢNH (Nếu người dùng có tải ảnh mới lên)
    if (req.files && req.files.length > 0) {
      // BƯỚC A: (Tùy chọn) Xóa ảnh cũ trong DB nếu bạn muốn thay thế hoàn toàn
      // await db.query("DELETE FROM hinh_anh WHERE phong_tro_id = ?", [id]);

      // BƯỚC B: Thêm ảnh mới vào bảng hinh_anh
      const sqlHinhAnh = "INSERT INTO hinh_anh_phong (phong_id, duong_dan_anh) VALUES ?";
      const valuesHinhAnh = req.files.map(file => [id, file.filename]);
      
      await db.query(sqlHinhAnh, [valuesHinhAnh]);
    }

    res.json({ message: "Cập nhật thông tin phòng thành công!" });

  } catch (err) {
    console.error("Lỗi cập nhật SQL:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ", error: err.message });
  }
};

/* ================================
9. CẬP NHẬT TRẠNG THÁI
PATCH /phongtro/:id/trangthai
================================ */
exports.updateTrangThai = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const { trang_thai } = req.body;

  const sql = `
    UPDATE phong_tro
    SET trang_thai = ?
    WHERE id = ? AND chu_phong_id = ?
  `;

  try {
    const [result] = await db.query(sql, [trang_thai, id, userId]);

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Không có quyền cập nhật" });
    }

    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getMyPhongTro = async (req, res) => {
  console.log("=== API /phongtro/my được gọi ===");

  console.log("USER:", req.user); // 👈 xem token decode

  const userId = req.user?.id;

  const sql = "SELECT * FROM phong_tro WHERE chu_phong_id = ?";

  try {
    const [result] = await db.query(sql, [userId]);

    console.log("RESULT:", result); // 👈 xem dữ liệu DB trả về

    res.json(result);
  } catch (err) {
    console.log("DB ERROR:", err);
    return res.status(500).json(err);
  }
};

exports.addDanhGia = async (req, res) => {
  const phong_id = req.params.id;
  const nguoi_dung_id = req.user?.id; // lấy từ token
  const { so_sao, binh_luan } = req.body;

  if (!nguoi_dung_id) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  if (!so_sao) {
    return res.status(400).json({ message: "Thiếu số sao" });
  }

  const sql = `
    INSERT INTO danh_gia (phong_id, nguoi_dung_id, so_sao, binh_luan)
    VALUES (?, ?, ?, ?)
  `;

  try {
    await db.query(sql, [phong_id, nguoi_dung_id, so_sao, binh_luan || null]);
    res.json({ message: "Đánh giá thành công" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};


// Lấy danh sách đánh giá theo phòng
exports.getDanhGia = async (req, res) => {
  const phong_id = req.params.id;

  const sql = `
    SELECT dg.id, dg.so_sao, dg.binh_luan, dg.ngay_danh_gia,
           u.ho_ten AS ten_nguoi_dung
    FROM danh_gia dg
    JOIN nguoi_dung u ON dg.nguoi_dung_id = u.id
    WHERE dg.phong_id = ?
    ORDER BY dg.ngay_danh_gia DESC
  `;

  try {
    const [result] = await db.query(sql, [phong_id]);
    res.json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================================
ĐẶT PHÒNG
POST /phongtro/:id/datphong
================================ */
exports.datPhong = async (req, res) => {
  const phong_id = req.params.id;
  const user_id = req.user?.id;
  
  const {
    ho_ten,
    so_dien_thoai,
    ngay_sinh,
    so_nguoi_o
  } = req.body;

  if (!user_id) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  if (!ho_ten || !so_dien_thoai) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  const sql = `
    INSERT INTO bookings (user_id, room_id, ho_ten, so_dien_thoai, ngay_sinh, so_nguoi_o, trang_thai)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;

  try {
    await db.query(sql, [user_id, phong_id, ho_ten, so_dien_thoai, ngay_sinh || null, so_nguoi_o || 1]);
    res.json({ 
      message: "Đặt phòng thành công! Chủ phòng sẽ liên hệ với bạn sớm.",
      success: true 
    });
  } catch (err) {
    console.error("Lỗi đặt phòng:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

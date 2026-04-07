const fs = require("fs");
const path = require("path"); 
const db = require("../config/db");
/* ================================
1. DANH SÁCH PHÒNG + TÌM KIẾM + LỌC
GET /phongtro
================================ */
exports.getAllPhongTro = async (req, res) => {
  const {
    keyword,
    gia_min,
    gia_max,
    thanh_pho,
    phuong_xa,
    sort, // Thêm tham số sort ở đây (ví dụ: 'asc' hoặc 'desc')
    noi_that, // Thêm tham số noi_that để lọc theo nội thất
    trang_thai, // Thêm tham số trang_thai để lọc theo trạng thái
    page = 1,
    limit = 10
  } = req.query;

  let sql = `
    SELECT DISTINCT pt.* 
    FROM phong_tro pt
    LEFT JOIN phong_noi_that pnt ON pt.id = pnt.phong_id
    LEFT JOIN noi_that nt ON pnt.noi_that_id = nt.id
    WHERE 1=1
  `;
  let params = [];

  // 1. Phần lọc (Filter) - Giữ nguyên
  if (keyword) {
    sql += " AND (pt.tieu_de LIKE ? OR pt.dia_chi LIKE ?)";
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (gia_min) {
    sql += " AND pt.gia_tien >= ?";
    params.push(gia_min);
  }
  if (gia_max) {
    sql += " AND pt.gia_tien <= ?";
    params.push(gia_max);
  }
  if (thanh_pho) {
    sql += " AND pt.thanh_pho = ?";
    params.push(thanh_pho);
  }
  if (phuong_xa) {
    sql += " AND pt.phuong_xa = ?";
    params.push(phuong_xa);
  }

  // 2. Phần lọc nội thất - THÊM MỚI
  if (noi_that) {
    const noiThatArray = noi_that.split(',').map(item => item.trim());
    if (noiThatArray.length > 0) {
      sql += " AND nt.ten_noi_that IN (?)";
      params.push(noiThatArray);
    }
  }

  // 3. Phần lọc trạng thái - THÊM MỚI
  if (trang_thai) {
    sql += " AND pt.trang_thai = ?";
    params.push(trang_thai);
  }

  // 4. Phần Sắp xếp (Sorting) - THÊM MỚI
  // Quan trọng: ORDER BY phải đứng sau WHERE và trước LIMIT
  if (sort === 'asc') {
    sql += " ORDER BY pt.gia_tien ASC";
  } else if (sort === 'desc') {
    sql += " ORDER BY pt.gia_tien DESC";
  } else {
    // Mặc định sắp xếp theo tin mới nhất nếu không chọn sort giá
    sql += " ORDER BY pt.ngay_dang DESC"; 
  }

  // 5. Phần Phân trang (Pagination)
  const offset = (parseInt(page) - 1) * parseInt(limit);
  sql += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  try {
    const [result] = await db.query(sql, params);
    res.json(result);
  } catch (err) {
    return res.status(500).json(err);
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
    res.json(result);
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

    // 2.5 Kiểm tra dữ liệu bắt buộc (Sử dụng console log để debug nếu cần)
    if (!tieu_de || !gia_tien || !dia_chi) {
        console.error("DEBUG: Thiếu thông tin đăng phòng:", req.body);
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc (Tiêu đề, Giá tiền, Địa chỉ)" });
    }

    const sqlPhong = `
        INSERT INTO phong_tro
        (chu_phong_id, tieu_de, dia_chi, phuong_xa, thanh_pho, gia_tien, dien_tich, mo_ta, quy_dinh, ghi_chu)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await db.query(sqlPhong, [
            chu_phong_id, tieu_de, dia_chi, phuong_xa, thanh_pho,
            gia_tien, dien_tich, mo_ta, quy_dinh || null, ghi_chu || null
        ]);

        const phong_id = result.insertId;

        // ===== XỬ LÝ ẢNH (Bulk Insert) =====
        if (req.files && req.files.length > 0) {
            const valuesAnh = req.files.map(file => [phong_id, file.filename]);

            const sqlAnh = `
                INSERT INTO hinh_anh_phong (phong_id, duong_dan_anh)
                VALUES ?
            `;

            await db.query(sqlAnh, [valuesAnh]);
        }

        // ===== XỬ LÝ NỘI THẤT (Bulk Insert) =====
        // Sửa lỗi ReferenceError bằng cách kiểm tra biến an toàn
        if (noi_that_ids) {
            let finalIds;
            if (typeof noi_that_ids === 'string') {
                try {
                    finalIds = JSON.parse(noi_that_ids);
                } catch (e) {
                    console.error("Lỗi parse noi_that_ids:", e);
                    finalIds = [];
                }
            } else {
                finalIds = Array.isArray(noi_that_ids) ? noi_that_ids : [noi_that_ids];
            }
            
            if (finalIds.length > 0) {
                const sqlNoiThat = "INSERT INTO phong_noi_that (phong_id, noi_that_id) VALUES ?";
                const valuesNT = finalIds.map(id => [phong_id, id]);

                await db.query(sqlNoiThat, [valuesNT]);
            }
        }

        // 3. Trả về kết quả thành công cho Frontend
        res.json({
            message: "Đăng phòng thành công",
            phong_id: phong_id
        });
    } catch (err) {
        console.error("Lỗi SQL chèn phòng:", err);
        return res.status(500).json({ message: "Lỗi lưu thông tin phòng", error: err });
    }
};



/* ================================
7. XÓA PHÒNG & XÓA ẢNH VẬT LÝ
DELETE /phongtro/:id
================================ */
exports.deletePhongTro = async (req, res) => {
  if (req.user.role !== "chu_tro") {
    return res.status(403).json({ message: "Chỉ chủ trọ được xóa" });
  }

  const id = req.params.id;
  const userId = req.user.id;

  try {
    // BƯỚC 1: Lấy danh sách đường dẫn ảnh từ DB trước khi xóa dữ liệu
    const getImagesSql = "SELECT duong_dan_anh FROM hinh_anh_phong WHERE phong_id = ?";
    const [images] = await db.query(getImagesSql, [id]);

    // BƯỚC 2: Xóa phòng trong Database
    // (Lưu ý: Nếu DB có khóa ngoại ON DELETE CASCADE thì ảnh trong DB sẽ tự mất)
    const deleteSql = "DELETE FROM phong_tro WHERE id = ? AND chu_phong_id = ?";
    const [result] = await db.query(deleteSql, [id, userId]);

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Không có quyền xóa hoặc phòng không tồn tại" });
    }

    // BƯỚC 3: Xóa các file ảnh thực tế trong thư mục uploads
    if (images && images.length > 0) {
      images.forEach(img => {
        // Xử lý đường dẫn: Xóa dấu "/" ở đầu nếu có để path.join hoạt động đúng
        const cleanPath = img.duong_dan_anh.startsWith('/') ? img.duong_dan_anh.slice(1) : img.duong_dan_anh;
        
        // Tạo đường dẫn tuyệt đối đến file
        const filePath = path.join(__dirname, "..", cleanPath);

        // Kiểm tra xem file có tồn tại trên ổ cứng không rồi mới xóa
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath); // Lệnh xóa file vật lý
            console.log("Đã xóa file:", filePath);
          } catch (fileErr) {
            console.error("Lỗi khi xóa file thực tế:", fileErr);
          }
        }
      });
    }

    res.json({ message: "Xóa phòng và toàn bộ ảnh thành công" });
  } catch (err) {
    return res.status(500).json(err);
  }
};
/* ================================
8. SỬA PHÒNG
PUT /phongtro/:id
================================ */
exports.updatePhongTro = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id; // ID này lấy từ Token (JWT) sau khi qua middleware xác thực

  // 1. Lấy đầy đủ các trường (bao gồm cả mô tả và tọa độ bản đồ nếu có)
  const {
    tieu_de,
    dia_chi,
    phuong_xa,
    thanh_pho,
    gia_tien,
    dien_tich,
    mo_ta,
    vi_do,
    kinh_do
  } = req.body;

  // 2. Kiểm tra dữ liệu bắt buộc (Tránh trường hợp gửi dữ liệu rỗng làm hỏng DB)
  if (!tieu_de || !gia_tien || !dia_chi) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ Tiêu đề, Giá tiền và Địa chỉ." });
  }

  // 3. Câu lệnh SQL có cơ chế bảo mật kép
  // Điều kiện WHERE id=? AND chu_phong_id=? đảm bảo:
  // - Đúng phòng cần sửa
  // - Người đang đăng nhập (userId) PHẢI là chủ của phòng đó
  const sql = `
    UPDATE phong_tro 
    SET tieu_de=?, dia_chi=?, phuong_xa=?, thanh_pho=?, 
        gia_tien=?, dien_tich=?, mo_ta=?, vi_do=?, kinh_do=?
    WHERE id=? AND chu_phong_id=?
  `;

  const values = [
    tieu_de,
    dia_chi,
    phuong_xa,
    thanh_pho,
    gia_tien,
    dien_tich,
    mo_ta || null,
    vi_do || null,
    kinh_do || null,
    id,
    userId
  ];

  try {
    const [result] = await db.query(sql, values);

    // 4. Kiểm tra kết quả thực thi
    // Nếu affectedRows = 0, có nghĩa là:
    // Hoặc ID phòng không tồn tại, hoặc chu_phong_id trong DB không khớp với userId từ Token
    if (result.affectedRows === 0) {
      return res.status(403).json({ 
        message: "Bạn không có quyền chỉnh sửa phòng này hoặc phòng không tồn tại." 
      });
    }

    res.json({ message: "Cập nhật thông tin phòng thành công!" });
  } catch (err) {
    console.error("Lỗi cập nhật SQL:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ", error: err });
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

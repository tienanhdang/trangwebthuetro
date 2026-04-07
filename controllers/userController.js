const db = require("../config/db"); // Dòng này cực kỳ quan trọng!
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =======================
// 1. CHỨC NĂNG ĐĂNG KÝ (Hỗ trợ phân quyền)
// =======================
exports.register = async (req, res) => {
    // Nhận thêm trường 'role' từ Frontend gửi lên
    const { ho_ten, email, so_dien_thoai, ten_tai_khoan, mat_khau, role } = req.body;

    try {
        const checkQuery = "SELECT * FROM nguoi_dung WHERE ten_tai_khoan = ? OR email = ?";
        const [result] = await db.query(checkQuery, [ten_tai_khoan, email]);

        if (result.length > 0) {
            return res.status(400).json({ message: "Tên tài khoản hoặc Email đã được sử dụng!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mat_khau, salt);

        // XỬ LÝ ROLE: Đảm bảo dữ liệu hợp lệ với Database
        // Nếu frontend không gửi hoặc gửi sai, mặc định gán là người thuê ('sinh_vien')
        let userRole = 'sinh_vien'; 
        if (role === 'chu_tro' || role === 'sinh_vien') {
            userRole = role;
        }

        const insertQuery = `
            INSERT INTO nguoi_dung (ho_ten, email, so_dien_thoai, ten_tai_khoan, mat_khau, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await db.query(insertQuery, [ho_ten, email, so_dien_thoai, ten_tai_khoan, hashedPassword, userRole]);
        
        res.status(201).json({ 
            message: "Đăng ký tài khoản thành công!",
            role_dang_ky: userRole
        });
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ error: "Lỗi khi lưu vào database" });
    }
};

// =======================
// 2. CHỨC NĂNG ĐĂNG NHẬP (Cấp quyền qua JWT)
// =======================
exports.login = async (req, res) => {
    const { ten_tai_khoan, mat_khau } = req.body;

    const sql = "SELECT * FROM nguoi_dung WHERE ten_tai_khoan = ?";
    
    try {
        const [result] = await db.query(sql, [ten_tai_khoan]);

        if (result.length === 0) {
            return res.status(404).json({ message: "Tài khoản không tồn tại!" });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
        if (!isMatch) {
            return res.status(400).json({ message: "Sai mật khẩu!" });
        }

        // ĐÓNG GÓI ROLE VÀO THẺ JWT
        const payload = { 
            id: user.id, 
            role: user.role,
            ho_ten: user.ho_ten,
            email: user.email,
            so_dien_thoai: user.so_dien_thoai,
            ten_tai_khoan: user.ten_tai_khoan,
            anh_dai_dien: user.anh_dai_dien
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: "Đăng nhập thành công!",
            token: token,
            user: {
                id: user.id,
                ho_ten: user.ho_ten,
                email: user.email,
                so_dien_thoai: user.so_dien_thoai,
                role: user.role,
                anh_dai_dien: user.anh_dai_dien
            }
        });
    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        return res.status(500).json({ error: "Lỗi database" });
    }
};

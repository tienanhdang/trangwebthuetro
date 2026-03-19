const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    // 1. Lấy token từ header của request (Frontend sẽ gửi token kèm theo chữ "Bearer ")
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    // 2. Nếu không có thẻ (token) -> Đuổi về (Lỗi 401: Unauthorized)
    if (!token) {
        return res.status(401).json({ message: "Truy cập bị từ chối! Bạn chưa đăng nhập." });
    }

    try {
        // 3. Kiểm tra thẻ thật hay giả bằng "Con dấu bí mật" (Lấy từ két sắt .env)
        // Lưu ý: Cần chắc chắn bạn đã khai báo JWT_SECRET trong file .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Nếu thẻ chuẩn -> Lưu thông tin người dùng vào req.user để các Controller sau có thể dùng
        req.user = decoded;

        // 5. Mở cổng cho đi tiếp vào Controller (Ví dụ: cho phép vào hàm createPhongTro)
        next();
    } catch (err) {
        // Nếu thẻ giả hoặc đã hết hạn -> Báo lỗi (Lỗi 403: Forbidden)
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};
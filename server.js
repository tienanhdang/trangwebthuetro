require('dotenv').config();
const express = require("express");

    const app = express();

// Middleware để đọc được dữ liệu JSON từ Frontend gửi lên
app.use(express.json());

// Nhập các file Routes
const phongtroRoutes = require("./routes/phongtroroutes");
const danhgiaRoutes = require("./routes/danhgiaroutes");
const userRoutes = require("./routes/userRoutes"); // <-- THÊM DÒNG NÀY

// Thiết lập đường dẫn API (Định tuyến)
app.use("/phongtro", phongtroRoutes);
app.use("/danhgia", danhgiaRoutes); // <-- SỬA LẠI THÀNH /danhgia CHO ĐỠ TRÙNG
app.use("/users", userRoutes); // <-- THÊM DÒNG NÀY ĐỂ KẾT NỐI ĐĂNG KÝ/ĐĂNG NHẬP

    app.listen(3000, () => {
        console.log("🚀 Server running on port 3000");
    });
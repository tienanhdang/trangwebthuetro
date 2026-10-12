```sql
CREATE DATABASE IF NOT EXISTS trangwebthuetro
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE trangwebthuetro;

-- 1. Bảng người dùng
CREATE TABLE nguoi_dung (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(100),
    email VARCHAR(100),
    so_dien_thoai VARCHAR(15),
    ten_tai_khoan VARCHAR(50),
    mat_khau VARCHAR(255),
    role ENUM('sinh_vien', 'chu_tro', 'admin')
);

-- 2. Bảng phòng trọ
CREATE TABLE phong_tro (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chu_phong_id INT UNSIGNED,
    tieu_de VARCHAR(255),
    dia_chi VARCHAR(255),
    phuong_xa VARCHAR(100),
    thanh_pho VARCHAR(100),
    gia_tien DECIMAL(12,2),
    dien_tich FLOAT,
    trang_thai ENUM('con_trong', 'o_ghep', 'da_thue'),
    mo_ta TEXT,
    quy_dinh TEXT,
    ghi_chu TEXT,
    vi_do DECIMAL(10,8),
    kinh_do DECIMAL(11,8),
    ngay_dang TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chu_phong_id)
        REFERENCES nguoi_dung(id)
);

-- 3. Bảng hình ảnh phòng
CREATE TABLE hinh_anh_phong (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phong_id INT UNSIGNED,
    duong_dan_anh VARCHAR(255),
    FOREIGN KEY (phong_id)
        REFERENCES phong_tro(id)
        ON DELETE CASCADE
);

-- 4. Bảng nội thất
CREATE TABLE noi_that (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ten_noi_that VARCHAR(100)
);

-- 5. Bảng liên kết phòng trọ - nội thất
CREATE TABLE phong_noi_that (
    phong_id INT UNSIGNED,
    noi_that_id INT UNSIGNED,
    PRIMARY KEY (phong_id, noi_that_id),
    FOREIGN KEY (phong_id)
        REFERENCES phong_tro(id)
        ON DELETE CASCADE,
    FOREIGN KEY (noi_that_id)
        REFERENCES noi_that(id)
        ON DELETE CASCADE
);

-- 6. Bảng đánh giá
CREATE TABLE danh_gia (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phong_id INT UNSIGNED,
    nguoi_dung_id INT UNSIGNED,
    so_sao INT,
    binh_luan TEXT,
    ngay_danh_gia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phong_id)
        REFERENCES phong_tro(id)
        ON DELETE CASCADE,
    FOREIGN KEY (nguoi_dung_id)
        REFERENCES nguoi_dung(id)
);

-- 7. Bảng cuộc trò chuyện
CREATE TABLE conversations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user1_id INT UNSIGNED,
    user2_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id)
        REFERENCES nguoi_dung(id),
    FOREIGN KEY (user2_id)
        REFERENCES nguoi_dung(id)
);

-- 8. Bảng tin nhắn
CREATE TABLE messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT UNSIGNED,
    sender_id INT UNSIGNED,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE,
    FOREIGN KEY (sender_id)
        REFERENCES nguoi_dung(id)
);

-- 9. Bảng đặt phòng
CREATE TABLE bookings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    room_id INT UNSIGNED,
    ho_ten VARCHAR(255),
    ngay_sinh DATE,
    so_nguoi INT,
    trang_thai VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES nguoi_dung(id),
    FOREIGN KEY (room_id)
        REFERENCES phong_tro(id)
);

-- 10. Bảng thông báo
CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    sender_id INT UNSIGNED,
    type VARCHAR(50),
    message TEXT,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    booking_id INT,
    FOREIGN KEY (user_id)
        REFERENCES nguoi_dung(id),
    FOREIGN KEY (sender_id)
        REFERENCES nguoi_dung(id),
    FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
);
```
-- Thêm các bảng mới cho hệ thống chat và đặt phòng

-- Bảng nguoi_dung (đã có, kiểm tra lại)
-- Bảng phong_tro (đã có, kiểm tra lại)

-- Bảng Conversations (cuộc trò chuyện)
-- Xóa foreign key constraint cũ nếu có
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS conversations;

CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    UNIQUE KEY unique_conversation (user1_id, user2_id)
);

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;

-- Bảng Messages (tin nhắn)
-- Xóa bảng cũ nếu có
DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);

-- Bảng Bookings (đặt phòng)
-- Xóa bảng cũ nếu có
DROP TABLE IF EXISTS bookings;

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    ho_ten VARCHAR(255) NOT NULL,
    ngay_sinh DATE,
    so_dien_thoai VARCHAR(20),
    ngay_nhan_phong DATE,
    so_nguoi_o INT DEFAULT 1,
    trang_thai VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES phong_tro(id) ON DELETE CASCADE
);

-- Bảng Notifications (thông báo)
-- Xóa bảng cũ nếu có
DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    booking_id INT DEFAULT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Tạo index để tối ưu hiệu suất
CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Cập nhật bảng nguoi_dung để thêm role nếu chưa có
ALTER TABLE nguoi_dung ADD COLUMN IF NOT EXISTS role ENUM('sinh_vien', 'chu_tro') DEFAULT 'sinh_vien';

-- Cập nhật bảng phong_tro để thêm trạng thái nếu chưa có
ALTER TABLE phong_tro ADD COLUMN IF NOT EXISTS trang_thai VARCHAR(50) DEFAULT 'con_trong';

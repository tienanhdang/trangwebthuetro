-- Migration script để sửa foreign key constraints
-- Chạy script này nếu gặp lỗi foreign key constraint

-- Tắt kiểm tra foreign key tạm thời
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

-- Xóa foreign key constraint cũ trong bảng conversations
ALTER TABLE conversations DROP FOREIGN KEY IF EXISTS conversations_ibfk_1;
ALTER TABLE conversations DROP FOREIGN KEY IF EXISTS conversations_ibfk_2;

-- Thêm foreign key constraint mới tham chiếu đến nguoi_dung
ALTER TABLE conversations 
ADD CONSTRAINT conversations_ibfk_1 
FOREIGN KEY (user1_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE;

ALTER TABLE conversations 
ADD CONSTRAINT conversations_ibfk_2 
FOREIGN KEY (user2_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE;

-- Xóa foreign key constraint cũ trong bảng messages
ALTER TABLE messages DROP FOREIGN KEY IF EXISTS messages_ibfk_1;
ALTER TABLE messages DROP FOREIGN KEY IF EXISTS messages_ibfk_2;

-- Thêm foreign key constraint mới tham chiếu đến nguoi_dung
ALTER TABLE messages 
ADD CONSTRAINT messages_ibfk_1 
FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT messages_ibfk_2 
FOREIGN KEY (sender_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE;

-- Xóa foreign key constraint cũ trong bảng bookings
ALTER TABLE bookings DROP FOREIGN KEY IF EXISTS bookings_ibfk_1;
ALTER TABLE bookings DROP FOREIGN KEY IF EXISTS bookings_ibfk_2;

-- Thêm foreign key constraint mới tham chiếu đến nguoi_dung và phong_tro
ALTER TABLE bookings 
ADD CONSTRAINT bookings_ibfk_1 
FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_ibfk_2 
FOREIGN KEY (room_id) REFERENCES phong_tro(id) ON DELETE CASCADE;

-- Xóa foreign key constraint cũ trong bảng notifications
ALTER TABLE notifications DROP FOREIGN KEY IF EXISTS notifications_ibfk_1;

-- Thêm foreign key constraint mới tham chiếu đến nguoi_dung
ALTER TABLE notifications 
ADD CONSTRAINT notifications_ibfk_1 
FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE;

-- Bật lại kiểm tra foreign key
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;

-- Thông báo hoàn thành
SELECT 'Đã sửa xong foreign key constraints!' as message;
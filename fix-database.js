const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixForeignKeys() {
    let connection;
    
    try {
        // Tạo kết nối database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'trangwebthuetro'
        });

        console.log('✅ Đã kết nối database');

        // Tắt kiểm tra foreign key tạm thời
        await connection.execute('SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0');
        console.log('✅ Đã tắt kiểm tra foreign key');

        // Xóa foreign key constraint cũ trong bảng conversations
        try {
            await connection.execute('ALTER TABLE conversations DROP FOREIGN KEY IF EXISTS conversations_ibfk_1');
            await connection.execute('ALTER TABLE conversations DROP FOREIGN KEY IF EXISTS conversations_ibfk_2');
            console.log('✅ Đã xóa foreign key cũ trong conversations');
        } catch (err) {
            console.log('⚠️ Không có foreign key cũ trong conversations');
        }

        // Thêm foreign key constraint mới tham chiếu đến nguoi_dung
        await connection.execute(`
            ALTER TABLE conversations 
            ADD CONSTRAINT conversations_ibfk_1 
            FOREIGN KEY (user1_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
        `);
        
        await connection.execute(`
            ALTER TABLE conversations 
            ADD CONSTRAINT conversations_ibfk_2 
            FOREIGN KEY (user2_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
        `);
        console.log('✅ Đã thêm foreign key mới cho conversations');

        // Xóa foreign key constraint cũ trong bảng messages
        try {
            await connection.execute('ALTER TABLE messages DROP FOREIGN KEY IF EXISTS messages_ibfk_1');
            await connection.execute('ALTER TABLE messages DROP FOREIGN KEY IF EXISTS messages_ibfk_2');
            console.log('✅ Đã xóa foreign key cũ trong messages');
        } catch (err) {
            console.log('⚠️ Không có foreign key cũ trong messages');
        }

        // Thêm foreign key constraint mới tham chiếu đến nguoi_dung
        await connection.execute(`
            ALTER TABLE messages 
            ADD CONSTRAINT messages_ibfk_1 
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        `);
        
        await connection.execute(`
            ALTER TABLE messages 
            ADD CONSTRAINT messages_ibfk_2 
            FOREIGN KEY (sender_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
        `);
        console.log('✅ Đã thêm foreign key mới cho messages');

        // Xóa foreign key constraint cũ trong bảng bookings
        try {
            await connection.execute('ALTER TABLE bookings DROP FOREIGN KEY IF EXISTS bookings_ibfk_1');
            await connection.execute('ALTER TABLE bookings DROP FOREIGN KEY IF EXISTS bookings_ibfk_2');
            console.log('✅ Đã xóa foreign key cũ trong bookings');
        } catch (err) {
            console.log('⚠️ Không có foreign key cũ trong bookings');
        }

        // Thêm cột updated_at nếu chưa có
        try {
            const [rows] = await connection.execute("SHOW COLUMNS FROM bookings LIKE 'updated_at'");
            if (rows.length === 0) {
                await connection.execute('ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at');
                console.log('✅ Đã thêm cột updated_at vào bookings');
            } else {
                console.log('✅ Cột updated_at đã tồn tại trong bookings');
            }
        } catch (err) {
            console.log('⚠️ Không thể thêm cột updated_at vào bookings:', err.message);
        }

        // Thêm foreign key constraint mới tham chiếu đến nguoi_dung và phong_tro
        await connection.execute(`
            ALTER TABLE bookings 
            ADD CONSTRAINT bookings_ibfk_1 
            FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
        `);
        
        await connection.execute(`
            ALTER TABLE bookings 
            ADD CONSTRAINT bookings_ibfk_2 
            FOREIGN KEY (room_id) REFERENCES phong_tro(id) ON DELETE CASCADE
        `);
        console.log('✅ Đã thêm foreign key mới cho bookings');

        // Thêm cột booking_id nếu chưa có
        try {
            await connection.execute('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS booking_id INT NULL');
            console.log('✅ Đã thêm cột booking_id vào notifications');
        } catch (err) {
            console.log('⚠️ Không thể thêm cột booking_id vào notifications:', err.message);
        }

        // Xóa foreign key constraint cũ trong bảng notifications
        try {
            await connection.execute('ALTER TABLE notifications DROP FOREIGN KEY IF EXISTS notifications_ibfk_1');
            console.log('✅ Đã xóa foreign key cũ trong notifications');
        } catch (err) {
            console.log('⚠️ Không có foreign key cũ trong notifications');
        }

        // Thêm foreign key constraint mới tham chiếu đến nguoi_dung
        await connection.execute(`
            ALTER TABLE notifications 
            ADD CONSTRAINT notifications_ibfk_1 
            FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
        `);
        console.log('✅ Đã thêm foreign key mới cho notifications');

        // Thêm foreign key constraint cho booking_id nếu chưa có
        try {
            await connection.execute('ALTER TABLE notifications ADD CONSTRAINT notifications_ibfk_2 FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL');
            console.log('✅ Đã thêm foreign key cho booking_id trong notifications');
        } catch (err) {
            console.log('⚠️ Không thể thêm foreign key cho booking_id trong notifications:', err.message);
        }

        // Bật lại kiểm tra foreign key
        await connection.execute('SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS');
        console.log('✅ Đã bật lại kiểm tra foreign key');

        console.log('\n🎉 ĐÃ SỬA XONG TẤT CẢ FOREIGN KEY CONSTRAINTS!');
        console.log('✅ Bây giờ bạn có thể thử lại chức năng chat');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Đã đóng kết nối database');
        }
    }
}

fixForeignKeys();
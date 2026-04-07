const db = require('../config/db');

class Conversation {
    // Tạo cuộc trò chuyện mới hoặc lấy cuộc trò chuyện hiện có
    static async createOrGet(user1_id, user2_id) {
        try {
            // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
            let query = `
                SELECT id FROM conversations 
                WHERE (user1_id = ? AND user2_id = ?) 
                   OR (user1_id = ? AND user2_id = ?)
                LIMIT 1
            `;
            const [existing] = await db.execute(query, [user1_id, user2_id, user2_id, user1_id]);

            if (existing.length > 0) {
                return existing[0].id;
            }

            // Tạo cuộc trò chuyện mới
            query = `
                INSERT INTO conversations (user1_id, user2_id)
                VALUES (?, ?)
            `;
            const [result] = await db.execute(query, [user1_id, user2_id]);
            return result.insertId;
        } catch (error) {
            console.error('Lỗi tạo/lấy cuộc trò chuyện:', error);
            throw error;
        }
    }

    // Lấy danh sách cuộc trò chuyện của user
    static async getByUserId(user_id) {
        try {
            const query = `
                SELECT c.*, 
                       u.ho_ten as partner_name,
                       u.email as partner_email,
                       u.so_dien_thoai as partner_phone,
                       (SELECT content FROM messages 
                        WHERE conversation_id = c.id 
                        ORDER BY created_at DESC 
                        LIMIT 1) as last_message,
                       (SELECT created_at FROM messages 
                        WHERE conversation_id = c.id 
                        ORDER BY created_at DESC 
                        LIMIT 1) as last_message_time
                FROM conversations c
                JOIN nguoi_dung u ON (u.id = c.user1_id OR u.id = c.user2_id) AND u.id != ?
                WHERE c.user1_id = ? OR c.user2_id = ?
                ORDER BY c.updated_at DESC
            `;
            const [rows] = await db.execute(query, [user_id, user_id, user_id]);
            return rows;
        } catch (error) {
            console.error('Lỗi lấy danh sách cuộc trò chuyện:', error);
            throw error;
        }
    }

    // Lấy thông tin cuộc trò chuyện
    static async getById(id) {
        try {
            const query = `
                SELECT c.*, 
                       u1.ho_ten as user1_name, u1.email as user1_email, u1.so_dien_thoai as user1_phone,
                       u2.ho_ten as user2_name, u2.email as user2_email, u2.so_dien_thoai as user2_phone
                FROM conversations c
                JOIN nguoi_dung u1 ON c.user1_id = u1.id
                JOIN nguoi_dung u2 ON c.user2_id = u2.id
                WHERE c.id = ?
            `;
            const [rows] = await db.execute(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Lỗi lấy thông tin cuộc trò chuyện:', error);
            throw error;
        }
    }

    // Cập nhật thời gian cập nhật cuộc trò chuyện
    static async updateLastActivity(id) {
        try {
            const query = `
                UPDATE conversations 
                SET updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `;
            await db.execute(query, [id]);
        } catch (error) {
            console.error('Lỗi cập nhật thời gian cuộc trò chuyện:', error);
            throw error;
        }
    }
}

module.exports = Conversation;
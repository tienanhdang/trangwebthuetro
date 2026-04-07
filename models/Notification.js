const db = require('../config/db');

class Notification {
    // Tạo thông báo mới
    static async create(user_id, type, message, sender_id = null, booking_id = null) {
        try {
            const query = `
                INSERT INTO notifications (user_id, type, message, sender_id, booking_id)
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await db.execute(query, [user_id, type, message, sender_id, booking_id]);
            return result.insertId;
        } catch (error) {
            console.error('Lỗi tạo thông báo:', error);
            throw error;
        }
    }

    // Lấy danh sách thông báo của user
    static async getByUserId(user_id, limit = 20, offset = 0) {
        try {
            const query = `
                SELECT * FROM notifications
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            const [rows] = await db.execute(query, [user_id, limit, offset]);
            return rows;
        } catch (error) {
            console.error('Lỗi lấy danh sách thông báo:', error);
            throw error;
        }
    }

    // Đánh dấu thông báo là đã đọc
    static async markAsRead(id) {
        try {
            const query = `
                UPDATE notifications 
                SET is_read = TRUE 
                WHERE id = ?
            `;
            await db.execute(query, [id]);
            return true;
        } catch (error) {
            console.error('Lỗi đánh dấu thông báo đã đọc:', error);
            throw error;
        }
    }

    // Đánh dấu tất cả thông báo là đã đọc
    static async markAllAsRead(user_id) {
        try {
            const query = `
                UPDATE notifications 
                SET is_read = TRUE 
                WHERE user_id = ? AND is_read = FALSE
            `;
            await db.execute(query, [user_id]);
            return true;
        } catch (error) {
            console.error('Lỗi đánh dấu tất cả thông báo đã đọc:', error);
            throw error;
        }
    }

    // Đếm số thông báo chưa đọc
    static async countUnread(user_id) {
        try {
            const query = `
                SELECT COUNT(*) as count
                FROM notifications
                WHERE user_id = ? AND is_read = FALSE
            `;
            const [rows] = await db.execute(query, [user_id]);
            return rows[0]?.count || 0;
        } catch (error) {
            console.error('Lỗi đếm thông báo chưa đọc:', error);
            throw error;
        }
    }

    // Xóa thông báo
    static async delete(id) {
        try {
            const query = `
                DELETE FROM notifications WHERE id = ?
            `;
            await db.execute(query, [id]);
            return true;
        } catch (error) {
            console.error('Lỗi xóa thông báo:', error);
            throw error;
        }
    }
}

module.exports = Notification;
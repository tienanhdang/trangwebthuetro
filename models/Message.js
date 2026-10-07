const db = require('../config/db');

class Message {

    // =========================
    // GỬI TIN NHẮN
    // =========================
    static async create(conversation_id, sender_id, content) {

        try {

            const query = `
                INSERT INTO messages
                (
                    conversation_id,
                    sender_id,
                    content
                )
                VALUES (?, ?, ?)
            `;

            const [result] = await db.execute(query, [
                conversation_id,
                sender_id,
                content
            ]);


            const Conversation = require('./Conversation');

            await Conversation.updateLastActivity(
                conversation_id
            );


            return result.insertId;

        } catch (error) {

            console.error('Lỗi gửi tin nhắn:', error);

            throw error;
        }
    }


    // =========================
    // LẤY TIN NHẮN
    // =========================
    static async getByConversationId(
        conversation_id,
        limit = 50,
        offset = 0
    ) {

        try {

            const query = `
                SELECT 
                    m.*,
                    u.ho_ten AS sender_name,
                    u.email AS sender_email,
                    u.so_dien_thoai AS sender_phone
                FROM messages m
                JOIN nguoi_dung u
                    ON m.sender_id = u.id
                WHERE m.conversation_id = ?
                ORDER BY m.created_at ASC
                LIMIT ? OFFSET ?
            `;

            const [rows] = await db.execute(query, [
                conversation_id,
                Number(limit),
                Number(offset)
            ]);

            return rows;

        } catch (error) {

            console.error('Lỗi lấy tin nhắn:', error);

            throw error;
        }
    }


    // =========================
    // LẤY TIN NHẮN MỚI
    // =========================
    static async getLatestByConversationId(
        conversation_id,
        last_message_id = 0
    ) {

        try {

            const query = `
                SELECT 
                    m.*,
                    u.ho_ten AS sender_name,
                    u.email AS sender_email,
                    u.so_dien_thoai AS sender_phone
                FROM messages m
                JOIN nguoi_dung u
                    ON m.sender_id = u.id
                WHERE m.conversation_id = ?
                AND m.id > ?
                ORDER BY m.created_at ASC
            `;

            const [rows] = await db.execute(query, [
                conversation_id,
                last_message_id
            ]);

            return rows;

        } catch (error) {

            console.error('Lỗi lấy tin nhắn mới:', error);

            throw error;
        }
    }


    // =========================
    // LẤY TIN NHẮN THEO ID
    // =========================
    static async getById(id) {

        try {

            const query = `
                SELECT 
                    m.*,
                    u.ho_ten AS sender_name,
                    u.email AS sender_email,
                    u.so_dien_thoai AS sender_phone
                FROM messages m
                JOIN nguoi_dung u
                    ON m.sender_id = u.id
                WHERE m.id = ?
            `;

            const [rows] = await db.execute(query, [id]);

            return rows[0] || null;

        } catch (error) {

            console.error('Lỗi lấy tin nhắn:', error);

            throw error;
        }
    }

}

module.exports = Message;

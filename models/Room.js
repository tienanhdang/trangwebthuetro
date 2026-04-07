const db = require('../config/db');

class Room {
    // Lấy phòng theo ID
    static async getById(id) {
        try {
            const query = `SELECT * FROM phong_tro WHERE id = ?`;
            const [rows] = await db.query(query, [id]);
            return rows[0] || null;
        } catch (err) {
            console.error("Lỗi lấy phòng theo ID:", err);
            throw err;
        }
    }

    // Cập nhật trạng thái phòng
    static async updateStatus(id, trang_thai) {
        try {
            const query = `UPDATE phong_tro SET trang_thai = ? WHERE id = ?`;
            const [result] = await db.query(query, [trang_thai, id]);
            return result;
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            throw err;
        }
    }
}

module.exports = Room;

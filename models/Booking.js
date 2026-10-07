const db = require('../config/db');

class Booking {

    // =========================
    // TẠO BOOKING
    // =========================
    static async create(user_id, room_id, data) {
        try {
            const {
                ho_ten,
                ngay_sinh = null,
                so_dien_thoai = null,
                ngay_nhan_phong = null,
                so_nguoi_o = 1,
                trang_thai = 'pending'
            } = data;

            const query = `
                INSERT INTO bookings (
                    user_id,
                    room_id,
                    ho_ten,
                    ngay_sinh,
                    so_dien_thoai,
                    ngay_nhan_phong,
                    so_nguoi_o,
                    trang_thai
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(query, [
                user_id,
                room_id,
                ho_ten,
                ngay_sinh,
                so_dien_thoai,
                ngay_nhan_phong,
                so_nguoi_o,
                trang_thai
            ]);

            return result.insertId;

        } catch (error) {
            console.error('Lỗi tạo booking:', error);
            throw error;
        }
    }


    // =========================
    // LẤY BOOKING THEO ID
    // =========================
    static async getById(id) {
        try {
            const query = `
                SELECT 
                    b.*,
                    u.ho_ten AS user_name,
                    u.email AS user_email,
                    u.so_dien_thoai AS user_phone,
                    p.tieu_de AS room_title,
                    p.gia_tien AS room_price,
                    p.dia_chi AS room_address
                FROM bookings b
                JOIN nguoi_dung u ON b.user_id = u.id
                JOIN phong_tro p ON b.room_id = p.id
                WHERE b.id = ?
            `;

            const [rows] = await db.execute(query, [id]);

            return rows[0] || null;

        } catch (error) {
            console.error('Lỗi lấy booking:', error);
            throw error;
        }
    }


    // =========================
    // BOOKING CỦA USER
    // =========================
    static async getByUserId(user_id) {
        try {
            const query = `
                SELECT 
                    b.*,
                    p.tieu_de AS room_title,
                    p.gia_tien AS room_price,
                    p.dia_chi AS room_address
                FROM bookings b
                JOIN phong_tro p ON b.room_id = p.id
                WHERE b.user_id = ?
                ORDER BY b.created_at DESC
            `;

            const [rows] = await db.execute(query, [user_id]);

            return rows;

        } catch (error) {
            console.error('Lỗi lấy booking của user:', error);
            throw error;
        }
    }


    // =========================
    // BOOKING CỦA PHÒNG
    // =========================
    static async getByRoomId(room_id) {
        try {
            const query = `
                SELECT 
                    b.*,
                    u.ho_ten AS user_name,
                    u.email AS user_email,
                    u.so_dien_thoai AS user_phone
                FROM bookings b
                JOIN nguoi_dung u ON b.user_id = u.id
                WHERE b.room_id = ?
                ORDER BY b.created_at DESC
            `;

            const [rows] = await db.execute(query, [room_id]);

            return rows;

        } catch (error) {
            console.error('Lỗi lấy booking của phòng:', error);
            throw error;
        }
    }


    // =========================
    // BOOKING CỦA CHỦ TRỌ
    // =========================
    static async getPendingByLandlordId(landlord_id) {
        try {
            const query = `
                SELECT 
                    b.*,
                    u.ho_ten AS user_name,
                    u.email AS user_email,
                    u.so_dien_thoai AS user_phone,
                    p.tieu_de AS room_title,
                    p.dia_chi AS room_address
                FROM bookings b
                JOIN nguoi_dung u ON b.user_id = u.id
                JOIN phong_tro p ON b.room_id = p.id
                WHERE p.chu_phong_id = ?
                AND b.trang_thai = 'pending'
                ORDER BY b.created_at DESC
            `;

            const [rows] = await db.execute(query, [landlord_id]);

            return rows;

        } catch (error) {
            console.error('Lỗi lấy booking chờ:', error);
            throw error;
        }
    }


    // =========================
    // CẬP NHẬT TRẠNG THÁI
    // =========================
    static async updateStatus(id, trang_thai) {
        try {

            const query = `
                UPDATE bookings
                SET trang_thai = ?
                WHERE id = ?
            `;

            await db.execute(query, [trang_thai, id]);

            return true;

        } catch (error) {
            console.error('Lỗi cập nhật trạng thái:', error);
            throw error;
        }
    }


    // =========================
    // HỦY BOOKING
    // =========================
    static async cancel(id) {
        try {

            const query = `
                UPDATE bookings
                SET trang_thai = 'cancelled'
                WHERE id = ?
            `;

            await db.execute(query, [id]);

            return true;

        } catch (error) {
            console.error('Lỗi hủy booking:', error);
            throw error;
        }
    }


    // =========================
    // TỪ CHỐI BOOKING
    // =========================
    static async reject(id) {
        try {

            const query = `
                UPDATE bookings
                SET trang_thai = 'rejected'
                WHERE id = ?
            `;

            await db.execute(query, [id]);

            return true;

        } catch (error) {
            console.error('Lỗi từ chối booking:', error);
            throw error;
        }
    }
}

module.exports = Booking;

const db = require('../config/db');

class Booking {
    // Tạo booking mới
    static async create(user_id, room_id, data) {
        try {
            const {
                ho_ten,
                tuoi,
                so_nguoi_o,
                trang_thai = 'pending',
                hinh_thuc_thanh_toan,
                ma_giam_gia,
                tong_tien
            } = data;

            const query = `
                INSERT INTO bookings (
                    user_id, room_id, ho_ten, tuoi, so_nguoi_o, 
                    trang_thai, hinh_thuc_thanh_toan, ma_giam_gia, tong_tien
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const [result] = await db.execute(query, [
                user_id, room_id, ho_ten, tuoi, so_nguoi_o,
                trang_thai, hinh_thuc_thanh_toan, ma_giam_gia, tong_tien
            ]);
            
            return result.insertId;
        } catch (error) {
            console.error('Lỗi tạo booking:', error);
            throw error;
        }
    }

    // Lấy booking theo ID
    static async getById(id) {
        try {
            const query = `
                SELECT b.*, 
                       u.ho_ten as user_name, u.email as user_email,
                       p.tieu_de as room_title, p.gia_tien as room_price
                FROM bookings b
                JOIN nguoi_dung u ON b.user_id = u.id
                JOIN phong_tro p ON b.room_id = p.id
                WHERE b.id = ?
            `;
            const [rows] = await db.execute(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Lỗi lấy booking:', error);
            throw error;
        }
    }

    // Lấy danh sách booking của user
    static async getByUserId(user_id) {
        try {
            const query = `
                SELECT b.*, 
                       p.tieu_de as room_title, p.gia_tien as room_price,
                       p.dia_chi as room_address, p.hinh_anh as room_image
                FROM bookings b
                JOIN phong_tro p ON b.room_id = p.id
                WHERE b.user_id = ?
                ORDER BY b.created_at DESC
            `;
            const [rows] = await db.execute(query, [user_id]);
            return rows;
        } catch (error) {
            console.error('Lỗi lấy danh sách booking:', error);
            throw error;
        }
    }

    // Lấy danh sách booking của phòng (cho landlord)
    static async getByRoomId(room_id) {
        try {
            const query = `
                SELECT b.*, 
                       u.ho_ten as user_name, u.email as user_email, u.so_dien_thoai as user_phone
                FROM bookings b
                JOIN nguoi_dung u ON b.user_id = u.id
                WHERE b.room_id = ?
                ORDER BY b.created_at DESC
            `;
            const [rows] = await db.execute(query, [room_id]);
            return rows;
        } catch (error) {
            console.error('Lỗi lấy danh sách booking của phòng:', error);
            throw error;
        }
    }

    // Lấy danh sách booking chờ xác nhận (cho landlord)
    static async getPendingByLandlordId(landlord_id) {
        try {
            const query = `
                SELECT b.*, 
                       u.ho_ten as user_name, u.email as user_email, u.so_dien_thoai as user_phone,
                       p.tieu_de as room_title, p.dia_chi as room_address
                FROM bookings b
                JOIN nguoi_dung u ON b.user_id = u.id
                JOIN phong_tro p ON b.room_id = p.id
                WHERE p.chu_phong_id = ? AND b.trang_thai = 'pending'
                ORDER BY b.created_at DESC
            `;
            const [rows] = await db.execute(query, [landlord_id]);
            return rows;
        } catch (error) {
            console.error('Lỗi lấy danh sách booking chờ xác nhận:', error);
            throw error;
        }
    }

    // Cập nhật trạng thái booking
    static async updateStatus(id, trang_thai) {
        try {
            const query = `
                UPDATE bookings 
                SET trang_thai = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            await db.execute(query, [trang_thai, id]);
            
            // Nếu xác nhận booking, cập nhật trạng thái phòng
            if (trang_thai === 'confirmed') {
                const booking = await this.getById(id);
                if (booking) {
                    const Room = require('./Room');
                    await Room.updateStatus(booking.room_id, 'da_thue');
                }
            }
            
            return true;
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái booking:', error);
            throw error;
        }
    }

    // Hủy booking
    static async cancel(id) {
        try {
            const query = `
                UPDATE bookings 
                SET trang_thai = 'cancelled', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            await db.execute(query, [id]);
            
            // Cập nhật trạng thái phòng về còn trống
            const booking = await this.getById(id);
            if (booking) {
                const Room = require('./Room');
                await Room.updateStatus(booking.room_id, 'con_trong');
            }
            
            return true;
        } catch (error) {
            console.error('Lỗi hủy booking:', error);
            throw error;
        }
    }

    // Từ chối booking
    static async reject(id) {
        try {
            const query = `
                UPDATE bookings 
                SET trang_thai = 'rejected', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            await db.execute(query, [id]);
            
            // Cập nhật trạng thái phòng về còn trống
            const booking = await this.getById(id);
            if (booking) {
                const Room = require('./Room');
                await Room.updateStatus(booking.room_id, 'con_trong');
            }
            
            return true;
        } catch (error) {
            console.error('Lỗi từ chối booking:', error);
            throw error;
        }
    }
}

module.exports = Booking;
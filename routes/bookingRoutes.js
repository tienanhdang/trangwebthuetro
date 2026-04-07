const express = require('express');
const router = express.Router();
const { verifyToken: authMiddleware } = require('../middleware/authMiddleware');
const db = require('../config/db');

// Tạo booking mới
router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { room_id, ho_ten, ngay_sinh, so_nguoi_o } = req.body;

        // 1. Validate required fields
        if (!room_id || !ho_ten) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        // 2. Kiểm tra phòng có tồn tại không và lấy thông tin chủ phòng luôn (Gộp lại cho tối ưu)
        const [rooms] = await db.query(
            'SELECT chu_phong_id, tieu_de FROM phong_tro WHERE id = ?', 
            [room_id]
        );

        if (rooms.length === 0) {
            return res.status(404).json({ error: 'Phòng không tồn tại' });
        }

        const chuPhongId = rooms[0].chu_phong_id;
        const tenPhong = rooms[0].tieu_de;

        // 3. Tạo booking
        const queryInsertBooking = `
            INSERT INTO bookings (user_id, room_id, ho_ten, ngay_sinh, so_nguoi_o, trang_thai, created_at)
            VALUES (?, ?, ?, ?, ?, 'pending', NOW())
        `;

        const [insertResult] = await db.query(queryInsertBooking, [userId, room_id, ho_ten, ngay_sinh || null, so_nguoi_o || 1]);
        const bookingId = insertResult.insertId;

        // 4. Tạo thông báo cho CHỦ PHÒNG
        const notificationMessage = `Có yêu cầu đặt phòng mới cho "${tenPhong}" từ ${ho_ten}`;

        await db.query(
            'INSERT INTO notifications (user_id, type, message, is_read, created_at, sender_id, booking_id) VALUES (?, ?, ?, FALSE, NOW(), ?, ?)',
            [chuPhongId, 'booking_pending', notificationMessage, userId, bookingId]
        );

        // Emit socket event
        if (io) {
            io.to(`user_${chuPhongId}`).emit('new_notification', {
                type: 'booking_pending',
                message: notificationMessage,
                created_at: new Date()
            });
        }

        res.json({ message: 'Đặt phòng thành công' });
    } catch (error) {
        console.error('Lỗi tạo booking:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
}); // Thêm dấu đóng ngoặc ở đây

// Lấy danh sách booking của user (sinh viên)
router.get('/my-bookings', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const query = `
            SELECT 
                b.id,
                b.room_id,
                b.ho_ten,
                b.ngay_sinh,
                b.so_nguoi_o,
                b.trang_thai,
                b.created_at,
                pt.tieu_de as room_title,
                pt.gia_tien as room_price,
                pt.dia_chi as room_address,
                (SELECT duong_dan_anh FROM hinh_anh_phong WHERE phong_id = b.room_id LIMIT 1) as room_image
            FROM bookings b
            JOIN phong_tro pt ON b.room_id = pt.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;

        const [bookings] = await db.query(query, [userId]);
        res.json(bookings);
    } catch (error) {
        console.error('Lỗi lấy danh sách booking:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Hủy đặt phòng
router.post('/:bookingId/cancel', authMiddleware, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        const checkQuery = `
            SELECT b.*, pt.tieu_de as room_title
            FROM bookings b
            JOIN phong_tro pt ON b.room_id = pt.id
            WHERE b.id = ? AND b.user_id = ?
        `;
        const [bookings] = await db.query(checkQuery, [bookingId, userId]);

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn đặt phòng' });
        }

        const booking = bookings[0];

        if (booking.trang_thai === 'cancelled') {
            return res.status(400).json({ error: 'Đơn đặt phòng đã được hủy trước đó' });
        }

        await db.query(
            'UPDATE bookings SET trang_thai = "cancelled" WHERE id = ?', 
            [bookingId]
        );

        // Thông báo cho chủ trọ của phòng đó (Không nên thông báo cho TẤT CẢ chủ trọ)
        const [roomData] = await db.query('SELECT chu_phong_id FROM phong_tro WHERE id = ?', [booking.room_id]);
        if (roomData.length > 0) {
            const landlordId = roomData[0].chu_phong_id;
            const cancelMsg = `Khách hàng ${booking.ho_ten} đã hủy đặt phòng "${booking.room_title}"`;
            await db.query(
                'INSERT INTO notifications (user_id, type, message, is_read, created_at, sender_id, booking_id) VALUES (?, ?, ?, FALSE, NOW(), ?, ?)',
                [landlordId, 'booking_cancel', cancelMsg, booking.user_id, bookingId]
            );

            // Emit socket event
            if (io) {
                io.to(`user_${landlordId}`).emit('new_notification', {
                    type: 'booking_cancel',
                    message: cancelMsg,
                    created_at: new Date()
                });
            }
        }

        res.json({ message: 'Hủy đặt phòng thành công' });
    } catch (error) {
        console.error('Lỗi hủy booking:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Lấy danh sách booking cho chủ trọ
router.get('/landlord-bookings', authMiddleware, async (req, res) => {
    try {
        const landlordId = req.user.id;
        if (req.user.role !== 'chu_tro') {
            return res.status(403).json({ error: 'Chỉ chủ trọ mới có quyền truy cập' });
        }

        const query = `
            SELECT 
                b.id, b.room_id, b.ho_ten, b.ngay_sinh, b.so_nguoi_o, b.trang_thai, b.created_at,
                pt.tieu_de as room_title, pt.gia_tien as room_price, pt.dia_chi as room_address,
                u.ho_ten as tenant_name, u.email as tenant_email
            FROM bookings b
            JOIN phong_tro pt ON b.room_id = pt.id
            JOIN nguoi_dung u ON b.user_id = u.id
            WHERE pt.chu_phong_id = ?
            ORDER BY b.created_at DESC
        `;

        const [bookings] = await db.query(query, [landlordId]);
        res.json(bookings);
    } catch (error) {
        console.error('Lỗi lấy danh sách booking:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Xác nhận đặt phòng (cho chủ trọ)
router.post('/:bookingId/confirm', authMiddleware, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const landlordId = req.user.id;

        if (req.user.role !== 'chu_tro') {
            return res.status(403).json({ error: 'Chỉ chủ trọ mới có quyền xác nhận' });
        }

        const checkQuery = `
            SELECT b.*, pt.tieu_de as room_title
            FROM bookings b
            JOIN phong_tro pt ON b.room_id = pt.id
            WHERE b.id = ? AND pt.chu_phong_id = ?
        `;
        const [bookings] = await db.query(checkQuery, [bookingId, landlordId]);

        if (bookings.length === 0) return res.status(404).json({ error: 'Không tìm thấy đơn đặt phòng' });

        const booking = bookings[0];
        if (booking.trang_thai !== 'pending') return res.status(400).json({ error: 'Đơn đặt phòng đã được xử lý' });

        await db.query('UPDATE bookings SET trang_thai = "confirmed" WHERE id = ?', [bookingId]);

        await db.query(
            'INSERT INTO notifications (user_id, type, message, is_read, created_at, sender_id, booking_id) VALUES (?, ?, ?, FALSE, NOW(), ?, ?)',
            [booking.user_id, 'booking_confirmed', `Đặt phòng "${booking.room_title}" đã được xác nhận`, landlordId, bookingId]
        );

        // Emit socket event
        if (io) {
            io.to(`user_${booking.user_id}`).emit('new_notification', {
                type: 'booking_confirmed',
                message: `Đặt phòng "${booking.room_title}" đã được xác nhận`,
                created_at: new Date()
            });
        }

        res.json({ message: 'Xác nhận đặt phòng thành công' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Xác nhận đặt phòng từ notification
router.post('/confirm-by-notification', authMiddleware, async (req, res) => {
    try {
        const { notificationId } = req.body;
        const landlordId = req.user.id;

        if (req.user.role !== 'chu_tro') {
            return res.status(403).json({ error: 'Chỉ chủ trọ mới có quyền xác nhận' });
        }

        if (!notificationId) {
            return res.status(400).json({ error: 'Thiếu notificationId' });
        }

        const [notes] = await db.query('SELECT * FROM notifications WHERE id = ? AND user_id = ?', [notificationId, landlordId]);
        if (notes.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy thông báo' });
        }

        const note = notes[0];
        let bookingId = note.booking_id;

        if (!bookingId && note.message) {
            const match = note.message.match(/Có yêu cầu đặt phòng mới cho "(.+)" từ (.+)$/i);
            if (match) {
                const roomTitle = match[1];
                const guestName = match[2];
                const [bookings] = await db.query(
                    `SELECT b.id FROM bookings b
                     JOIN phong_tro pt ON b.room_id = pt.id
                     WHERE pt.chu_phong_id = ? AND b.ho_ten = ? AND pt.tieu_de = ? AND b.trang_thai = 'pending'
                     ORDER BY b.created_at DESC
                     LIMIT 1`,
                    [landlordId, guestName, roomTitle]
                );
                if (bookings.length > 0) {
                    bookingId = bookings[0].id;
                    await db.query('UPDATE notifications SET booking_id = ? WHERE id = ?', [bookingId, notificationId]);
                }
            }
        }

        if (!bookingId) {
            return res.status(404).json({ error: 'Không tìm thấy mã đặt phòng' });
        }

        const checkQuery = `
            SELECT b.*, pt.tieu_de as room_title
            FROM bookings b
            JOIN phong_tro pt ON b.room_id = pt.id
            WHERE b.id = ? AND pt.chu_phong_id = ?
        `;
        const [bookings] = await db.query(checkQuery, [bookingId, landlordId]);

        if (bookings.length === 0) return res.status(404).json({ error: 'Không tìm thấy đơn đặt phòng' });

        const booking = bookings[0];
        if (booking.trang_thai !== 'pending') return res.status(400).json({ error: 'Đơn đặt phòng đã được xử lý' });

        await db.query('UPDATE bookings SET trang_thai = "confirmed" WHERE id = ?', [bookingId]);

        await db.query(
            'INSERT INTO notifications (user_id, type, message, is_read, created_at, sender_id, booking_id) VALUES (?, ?, ?, FALSE, NOW(), ?, ?)',
            [booking.user_id, 'booking_confirmed', `Đặt phòng "${booking.room_title}" đã được xác nhận`, landlordId, bookingId]
        );

        if (io) {
            io.to(`user_${booking.user_id}`).emit('new_notification', {
                type: 'booking_confirmed',
                message: `Đặt phòng "${booking.room_title}" đã được xác nhận`,
                created_at: new Date()
            });
        }

        res.json({ message: 'Xác nhận đặt phòng thành công' });
    } catch (error) {
        console.error('Lỗi xác nhận theo thông báo:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Từ chối đặt phòng (cho chủ trọ)
router.post('/:bookingId/reject', authMiddleware, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const landlordId = req.user.id;
        const { reason } = req.body;

        if (req.user.role !== 'chu_tro') return res.status(403).json({ error: 'Chỉ chủ trọ mới có quyền từ chối' });

        const [bookings] = await db.query(
            'SELECT b.*, pt.tieu_de as room_title FROM bookings b JOIN phong_tro pt ON b.room_id = pt.id WHERE b.id = ? AND pt.chu_phong_id = ?',
            [bookingId, landlordId]
        );

        if (bookings.length === 0) return res.status(404).json({ error: 'Không tìm thấy đơn đặt phòng' });

        const booking = bookings[0];
        await db.query('UPDATE bookings SET trang_thai = "rejected" WHERE id = ?', [bookingId]);

        await db.query(
            'INSERT INTO notifications (user_id, type, message, is_read, created_at, sender_id, booking_id) VALUES (?, ?, ?, FALSE, NOW(), ?, ?)',
            [booking.user_id, 'booking_rejected', `Đặt phòng "${booking.room_title}" đã bị từ chối. Lý do: ${reason || 'Không có lý do'}`, landlordId, bookingId]
        );

        // Emit socket event
        if (io) {
            io.to(`user_${booking.user_id}`).emit('new_notification', {
                type: 'booking_rejected',
                message: `Đặt phòng "${booking.room_title}" đã bị từ chối. Lý do: ${reason || 'Không có lý do'}`,
                created_at: new Date()
            });
        }

        res.json({ message: 'Từ chối đặt phòng thành công' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

let io;

function setSocketIO(socketIO) {
    io = socketIO;
}

module.exports = { router, setSocketIO };
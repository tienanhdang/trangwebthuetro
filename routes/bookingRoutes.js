const express = require('express');
const router = express.Router();
const { verifyToken: authMiddleware } = require('../middleware/authMiddleware');
const db = require('../config/db');
const Notification = require('../models/Notification');

// Socket.io instance (sẽ được truyền từ server.js)
let io;

// Hàm để thiết lập Socket.io
function setSocketIO(socketIO) {
    io = socketIO;
}

// Tạo booking mới
router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { room_id, ho_ten, ngay_sinh, so_nguoi_o, so_dien_thoai, ngay_nhan_phong } = req.body;

        // Validate required fields
        if (!room_id || !ho_ten) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        // Kiểm tra phòng có tồn tại không
        const [rooms] = await db.query(
            'SELECT id, chu_phong_id, tieu_de FROM phong_tro WHERE id = ?',
            [room_id]
        );
        if (rooms.length === 0) {
            return res.status(404).json({ error: 'Phòng không tồn tại' });
        }

        const room = rooms[0];
        console.log('DEBUG: Booking for room:', room);

        // Kiểm tra chủ phòng có tồn tại không
        if (!room.chu_phong_id) {
            console.error('ERROR: Phòng không có chủ phòng (chu_phong_id null)');
            return res.status(400).json({ error: 'Phòng này chưa có chủ phòng' });
        }

        // Kiểm tra chủ phòng có tồn tại trong bảng nguoi_dung
        const [landlords] = await db.query('SELECT id FROM nguoi_dung WHERE id = ?', [room.chu_phong_id]);
        if (landlords.length === 0) {
            console.error('ERROR: Chủ phòng không tồn tại trong database, chu_phong_id:', room.chu_phong_id);
            return res.status(400).json({ error: 'Chủ phòng không tồn tại' });
        }

        // Tạo booking
        const query = `
            INSERT INTO bookings (user_id, room_id, ho_ten, ngay_sinh, so_dien_thoai, ngay_nhan_phong, so_nguoi_o, trang_thai, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `;

        const [bookingResult] = await db.query(query, [userId, room_id, ho_ten, ngay_sinh || null, so_dien_thoai || null, ngay_nhan_phong || null, so_nguoi_o || 1]);
        const bookingId = bookingResult.insertId;

        // Tạo thông báo cho CHỦ PHÒNG
        const notificationMessage = `Có yêu cầu đặt phòng mới cho "${room.tieu_de}" từ ${ho_ten}`;
        
        try {
            const notificationId = await Notification.create(room.chu_phong_id, 'booking_pending', notificationMessage, null, bookingId);
            console.log('DEBUG: Notification created for chu_phong_id:', room.chu_phong_id, 'with ID:', notificationId);

            // Gửi thông báo realtime qua Socket.io
            if (io) {
                io.to(`user_${room.chu_phong_id}`).emit('new_notification', {
                    id: notificationId,
                    user_id: room.chu_phong_id,
                    type: 'booking_pending',
                    message: notificationMessage,
                    booking_id: bookingId,
                    is_read: false,
                    created_at: new Date()
                });
                console.log('DEBUG: Realtime notification sent to user:', room.chu_phong_id);
            }
        } catch (err) {
            console.error('Lỗi tạo thông báo cho chủ phòng:', err);
            // Không chặn đặt phòng nếu chỉ thông báo lỗi
        }

        res.json({ message: 'Đặt phòng thành công' });
    } catch (error) {
        console.error('Lỗi tạo booking:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

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
                b.so_dien_thoai,
                b.ngay_nhan_phong,
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
              AND b.trang_thai IN ('pending', 'confirmed')
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

        // Kiểm tra booking có tồn tại và thuộc về user không
        const checkQuery = `
            SELECT b.*, pt.chu_phong_id, pt.tieu_de as room_title
            FROM bookings b
            JOIN phong_tro pt ON b.room_id = pt.id
            WHERE b.id = ? AND b.user_id = ?
        `;
        const [bookings] = await db.query(checkQuery, [bookingId, userId]);

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn đặt phòng' });
        }

        const booking = bookings[0];

        // Kiểm tra xem có thể hủy không
        if (booking.trang_thai === 'cancelled') {
            return res.status(400).json({ error: 'Đơn đặt phòng đã được hủy trước đó' });
        }
        if (booking.trang_thai === 'confirmed') {
            return res.status(400).json({ error: 'Đơn đặt phòng đã được xác nhận, không thể hủy' });
        }
        if (booking.trang_thai === 'rejected') {
            return res.status(400).json({ error: 'Đơn đặt phòng đã bị từ chối, không thể hủy' });
        }

        // Cập nhật trạng thái booking thành cancelled
        const updateQuery = `
            UPDATE bookings 
            SET trang_thai = 'cancelled'
            WHERE id = ?
        `;
        await db.query(updateQuery, [bookingId]);

        // Tạo thông báo cho chủ phòng của booking
        const notificationMessage = `BOOKING_ID:${bookingId}|Khách hàng ${booking.ho_ten} đã hủy đặt phòng "${booking.room_title}"`;

        await db.query(
            'INSERT INTO notifications (user_id, type, booking_id, message, is_read, created_at) VALUES (?, ?, ?, ?, FALSE, NOW())',
            [booking.chu_phong_id, 'booking_cancel', bookingId, notificationMessage]
        );

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
        
        // Kiểm tra role
        if (req.user.role !== 'chu_tro') {
            return res.status(403).json({ error: 'Chỉ chủ trọ mới có quyền truy cập' });
        }

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
                u.ho_ten as tenant_name,
                u.email as tenant_email
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

        // Kiểm tra role
        if (req.user.role !== 'chu_tro') {
            return res.status(403).json({ error: 'Chỉ chủ trọ mới có quyền xác nhận' });
        }

        // Kiểm tra booking có tồn tại và thuộc về chủ trọ không
        const checkQuery = `
            SELECT b.*, pt.chu_phong_id, pt.tieu_de as room_title
            FROM bookings b
            JOIN phong_tro pt ON b.room_id = pt.id
            WHERE b.id = ? AND pt.chu_phong_id = ?
        `;
        const [bookings] = await db.query(checkQuery, [bookingId, landlordId]);

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn đặt phòng' });
        }

        const booking = bookings[0];

        if (booking.trang_thai !== 'pending') {
            return res.status(400).json({ error: 'Đơn đặt phòng đã được xử lý' });
        }

        // Cập nhật trạng thái booking thành confirmed
        const updateQuery = `
            UPDATE bookings 
            SET trang_thai = 'confirmed'
            WHERE id = ?
        `;
        await db.query(updateQuery, [bookingId]);

        // Tạo thông báo cho người thuê
        const notificationMessage = `Đặt phòng "${booking.room_title}" đã được xác nhận`;
        const notificationId = await Notification.create(booking.user_id, 'booking_confirmed', notificationMessage, landlordId, bookingId);

        // Gửi thông báo realtime
        if (io) {
            io.to(`user_${booking.user_id}`).emit('new_notification', {
                id: notificationId,
                user_id: booking.user_id,
                type: 'booking_confirmed',
                message: notificationMessage,
                booking_id: bookingId,
                is_read: false,
                created_at: new Date()
            });
        }

        res.json({ message: 'Xác nhận đặt phòng thành công' });
    } catch (error) {
        console.error('Lỗi xác nhận booking:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Từ chối đặt phòng (cho chủ trọ)
router.post('/:bookingId/reject', authMiddleware, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const landlordId = req.user.id;
        const { reason } = req.body;

        // Kiểm tra role
        if (req.user.role !== 'chu_tro') {
            return res.status(403).json({ error: 'Chỉ chủ trọ mới có quyền từ chối' });
        }

        // Kiểm tra booking có tồn tại và thuộc về chủ trọ không
        const checkQuery = `
            SELECT b.*, pt.chu_phong_id, pt.tieu_de as room_title
            FROM bookings b
            JOIN phong_tro pt ON b.room_id = pt.id
            WHERE b.id = ? AND pt.chu_phong_id = ?
        `;
        const [bookings] = await db.query(checkQuery, [bookingId, landlordId]);

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn đặt phòng' });
        }

        const booking = bookings[0];

        if (booking.trang_thai !== 'pending') {
            return res.status(400).json({ error: 'Đơn đặt phòng đã được xử lý' });
        }

        // Cập nhật trạng thái booking thành rejected
        const updateQuery = `
            UPDATE bookings 
            SET trang_thai = 'rejected'
            WHERE id = ?
        `;
        await db.query(updateQuery, [bookingId]);

        // Tạo thông báo cho người thuê
        const notificationMessage = `Đặt phòng "${booking.room_title}" đã bị từ chối. Lý do: ${reason || 'Không có lý do'}`;
        const notificationId = await Notification.create(booking.user_id, 'booking_rejected', notificationMessage, landlordId, bookingId);

        // Gửi thông báo realtime
        if (io) {
            io.to(`user_${booking.user_id}`).emit('new_notification', {
                id: notificationId,
                user_id: booking.user_id,
                type: 'booking_rejected',
                message: notificationMessage,
                booking_id: bookingId,
                is_read: false,
                created_at: new Date()
            });
        }

        res.json({ message: 'Từ chối đặt phòng thành công' });
    } catch (error) {
        console.error('Lỗi từ chối booking:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Xác nhận hủy phòng (cho chủ trọ)
router.post('/:bookingId/confirm-cancel', authMiddleware, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const landlordId = req.user.id;

        // Kiểm tra role
        if (req.user.role !== 'chu_tro') {
            return res.status(403).json({ error: 'Chỉ chủ trọ mới có quyền xác nhận hủy' });
        }

        // Kiểm tra booking có tồn tại và thuộc về chủ trọ không
        const checkQuery = `
            SELECT b.*, pt.chu_phong_id, pt.tieu_de as room_title
            FROM bookings b
            JOIN phong_tro pt ON b.room_id = pt.id
            WHERE b.id = ? AND pt.chu_phong_id = ?
        `;
        const [bookings] = await db.query(checkQuery, [bookingId, landlordId]);

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn đặt phòng' });
        }

        const booking = bookings[0];

        if (booking.trang_thai !== 'cancelled') {
            return res.status(400).json({ error: 'Đơn đặt phòng chưa được hủy' });
        }

        // Cập nhật trạng thái booking thành cancelled_confirmed
        const updateQuery = `
            UPDATE bookings 
            SET trang_thai = 'cancelled_confirmed'
            WHERE id = ?
        `;
        await db.query(updateQuery, [bookingId]);

        // Tạo thông báo cho người thuê
        const notificationMessage = `Yêu cầu hủy phòng "${booking.room_title}" đã được xác nhận`;
        const notificationId = await Notification.create(booking.user_id, 'cancel_confirmed', notificationMessage, landlordId, bookingId);

        // Gửi thông báo realtime
        if (io) {
            io.to(`user_${booking.user_id}`).emit('new_notification', {
                id: notificationId,
                user_id: booking.user_id,
                type: 'cancel_confirmed',
                message: notificationMessage,
                booking_id: bookingId,
                is_read: false,
                created_at: new Date()
            });
        }

        res.json({ message: 'Xác nhận hủy phòng thành công' });
    } catch (error) {
        console.error('Lỗi xác nhận hủy booking:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = { router, setSocketIO };
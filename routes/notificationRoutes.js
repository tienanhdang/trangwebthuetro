const express = require('express');
const router = express.Router();
const { verifyToken: authMiddleware } = require('../middleware/authMiddleware');
const db = require('../config/db');

// Lấy danh sách thông báo
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT 
                n.id,
                n.type,
                n.booking_id,
                n.message,
                n.is_read,
                n.created_at
            FROM notifications n
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC
        `;

        const [notifications] = await db.query(query, [userId]);
        res.json(notifications);
    } catch (error) {
        console.error('Lỗi lấy thông báo:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Đánh dấu thông báo đã đọc
router.put('/:notificationId/read', authMiddleware, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        // Kiểm tra thông báo có tồn tại và thuộc về user không
        const checkQuery = `
            SELECT id FROM notifications 
            WHERE id = ? AND user_id = ?
        `;
        const [notifications] = await db.query(checkQuery, [notificationId, userId]);

        if (notifications.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy thông báo' });
        }

        // Cập nhật trạng thái đã đọc
        const updateQuery = `
            UPDATE notifications 
            SET is_read = TRUE 
            WHERE id = ?
        `;
        await db.query(updateQuery, [notificationId]);

        res.json({ message: 'Đánh dấu đã đọc thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật thông báo:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Đánh dấu tất cả thông báo đã đọc
router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const updateQuery = `
            UPDATE notifications 
            SET is_read = TRUE 
            WHERE user_id = ? AND is_read = FALSE
        `;
        await db.query(updateQuery, [userId]);

        res.json({ message: 'Đánh dấu tất cả đã đọc thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật thông báo:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Lấy số thông báo chưa đọc
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT COUNT(*) as count
            FROM notifications
            WHERE user_id = ? AND is_read = FALSE
        `;

        const [result] = await db.query(query, [userId]);
        res.json({ count: result[0].count });
    } catch (error) {
        console.error('Lỗi lấy số thông báo chưa đọc:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
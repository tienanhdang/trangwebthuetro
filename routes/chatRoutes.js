const express = require('express');
const router = express.Router();
const { verifyToken: authMiddleware } = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const db = require('../config/db');

// Socket.io instance (sẽ được truyền từ server.js)
let io;

// Hàm để thiết lập Socket.io
function setSocketIO(socketIO) {
    io = socketIO;
}

// Lấy danh sách cuộc trò chuyện
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const conversations = await Conversation.getByUserId(req.user.id);
        res.json(conversations);
    } catch (error) {
        console.error('Lỗi lấy danh sách cuộc trò chuyện:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Lấy tin nhắn theo cuộc trò chuyện
router.get('/messages/:conversationId', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        // Kiểm tra xem user có quyền truy cập cuộc trò chuyện không
        const conversation = await Conversation.getById(conversationId);
        if (!conversation || (conversation.user1_id !== req.user.id && conversation.user2_id !== req.user.id)) {
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        const messages = await Message.getByConversationId(conversationId, parseInt(limit), parseInt(offset));
        res.json(messages);
    } catch (error) {
        console.error('Lỗi lấy tin nhắn:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Gửi tin nhắn
router.post('/send', authMiddleware, async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        
        if (!content || !conversationId) {
            return res.status(400).json({ error: 'Thiếu nội dung hoặc ID cuộc trò chuyện' });
        }

        // Kiểm tra xem user có quyền truy cập cuộc trò chuyện không
        const conversation = await Conversation.getById(conversationId);
        if (!conversation || (conversation.user1_id !== req.user.id && conversation.user2_id !== req.user.id)) {
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        // Gửi tin nhắn
        const messageId = await Message.create(conversationId, req.user.id, content);
        
        // Lấy tin nhắn vừa gửi để trả về
        const newMessage = await Message.getById(messageId);
        
        // Gửi realtime notification
        if (io) {
            const receiverId = conversation.user1_id === req.user.id ? conversation.user2_id : conversation.user1_id;
            
            // Gửi tin nhắn tới người nhận
            io.to(`user_${receiverId}`).emit('new_message', {
                ...newMessage,
                sender_name: req.user.ho_ten,
                sender_avatar: req.user.anh_dai_dien
            });

            // Gửi tin nhắn tới người gửi (để cập nhật UI)
            io.to(`user_${req.user.id}`).emit('new_message', {
                ...newMessage,
                sender_name: req.user.ho_ten,
                sender_avatar: req.user.anh_dai_dien
            });

            // Gửi thông báo cho người nhận
            const notificationMessage = `${req.user.ho_ten} đã gửi tin nhắn mới`;
            await Notification.create(receiverId, 'message', notificationMessage, req.user.id);
            
            io.to(`user_${receiverId}`).emit('new_notification', {
                message: notificationMessage,
                type: 'message',
                sender_id: req.user.id,
                is_read: false,
                created_at: new Date()
            });
        }

        res.json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Tạo cuộc trò chuyện mới
router.post('/create-conversation', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.body; // ID của người muốn chat
        
        if (!userId) {
            return res.status(400).json({ error: 'Thiếu ID người dùng' });
        }

        // Kiểm tra không tự chat với chính mình
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Không thể tự chat với chính mình' });
        }

        // Kiểm tra user hiện tại có tồn tại trong database không
        const db = require('../config/db');
        const [currentUser] = await db.query('SELECT id FROM nguoi_dung WHERE id = ?', [req.user.id]);
        if (currentUser.length === 0) {
            return res.status(400).json({ error: 'Người dùng hiện tại không tồn tại trong hệ thống' });
        }

        // Kiểm tra user đối phương có tồn tại trong database không
        const [targetUser] = await db.query('SELECT id FROM nguoi_dung WHERE id = ?', [userId]);
        if (targetUser.length === 0) {
            return res.status(400).json({ error: 'Người dùng đối phương không tồn tại trong hệ thống' });
        }

        // Tạo hoặc lấy cuộc trò chuyện
        const conversationId = await Conversation.createOrGet(req.user.id, userId);
        const conversation = await Conversation.getById(conversationId);

        res.json({
            success: true,
            conversation: conversation
        });
    } catch (error) {
        console.error('Lỗi tạo cuộc trò chuyện:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Lấy conversation từ notification để reply tin nhắn
router.post('/conversation-from-notification', authMiddleware, async (req, res) => {
    try {
        const { notificationId } = req.body;
        if (!notificationId) {
            return res.status(400).json({ error: 'Thiếu notificationId' });
        }

        const [rows] = await db.query(
            'SELECT sender_id, message FROM notifications WHERE id = ? AND user_id = ?',
            [notificationId, req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy thông báo' });
        }

        let senderId = rows[0].sender_id;
        const noteMessage = rows[0].message || '';

        if (!senderId) {
            const match = noteMessage.match(/^(.*?)\s+đã gửi tin nhắn mới/i);
            if (match && match[1]) {
                const senderName = match[1].trim();
                const [users] = await db.query('SELECT id FROM nguoi_dung WHERE ho_ten = ? LIMIT 1', [senderName]);
                if (users.length > 0) {
                    senderId = users[0].id;
                }
            }
        }

        if (!senderId) {
            return res.status(400).json({ error: 'Không tìm thấy thông tin người gửi' });
        }

        const conversationId = await Conversation.createOrGet(req.user.id, senderId);
        const conversation = await Conversation.getById(conversationId);

        res.json({ success: true, conversation });
    } catch (error) {
        console.error('Lỗi lấy conversation từ notification:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Đếm tin nhắn chưa đọc
router.get('/unread-count/:conversationId', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        // Kiểm tra quyền truy cập
        const conversation = await Conversation.getById(conversationId);
        if (!conversation || (conversation.user1_id !== req.user.id && conversation.user2_id !== req.user.id)) {
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        const count = await Message.countUnread(conversationId, req.user.id);
        res.json({ count });
    } catch (error) {
        console.error('Lỗi đếm tin nhắn chưa đọc:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = { router, setSocketIO };

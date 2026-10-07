require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// ===============================
// KIỂM TRA BIẾN MÔI TRƯỜNG
// ===============================
console.log('===============================');
console.log('JWT_SECRET =', process.env.JWT_SECRET);
console.log('PORT =', process.env.PORT);
console.log('===============================');

if (!process.env.JWT_SECRET) {
    console.error('❌ LỖI: JWT_SECRET chưa được cấu hình trong file .env');
}

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Frontend
app.use(express.static(path.join(__dirname, 'view')));

// ===============================
// ROUTES
// ===============================

const phongtroRoutes = require('./routes/phongtroroutes');

const danhgiaRoutes = require('./routes/danhgiaroutes');

const userRoutes = require('./routes/userroutes');

const {
    router: chatRoutes,
    setSocketIO: setChatSocketIO
} = require('./routes/chatRoutes');

const {
    router: bookingRoutes,
    setSocketIO: setBookingSocketIO
} = require('./routes/bookingRoutes');

const notificationRoutes = require('./routes/notificationRoutes');

// ===============================
// SOCKET.IO
// ===============================

setChatSocketIO(io);
setBookingSocketIO(io);

// ===============================
// API ROUTES
// ===============================

app.use('/phongtro', phongtroRoutes);

app.use('/danhgia', danhgiaRoutes);

app.use('/users', userRoutes);

app.use('/api/chat', chatRoutes);

app.use('/api/bookings', bookingRoutes);

app.use('/api/notifications', notificationRoutes);

// ===============================
// SOCKET.IO EVENTS
// ===============================

io.on('connection', (socket) => {

    console.log('🔌 User connected:', socket.id);

    // User room
    socket.on('join_user_room', (userId) => {

        socket.join(`user_${userId}`);

        console.log(
            `👤 User ${userId} joined room user_${userId}`
        );

    });

    // Conversation room
    socket.on('join_conversation', (conversationId) => {

        socket.join(`conversation_${conversationId}`);

        console.log(
            `💬 Socket ${socket.id} joined conversation ${conversationId}`
        );

    });

    // Leave conversation
    socket.on('leave_conversation', (conversationId) => {

        socket.leave(`conversation_${conversationId}`);

        console.log(
            `🚪 Socket ${socket.id} left conversation ${conversationId}`
        );

    });

    // Typing
    socket.on('typing', (data) => {

        if (!data || !data.conversationId) {
            return;
        }

        socket
            .to(`conversation_${data.conversationId}`)
            .emit('user_typing', {
                userId: data.userId,
                isTyping: data.isTyping
            });

    });

    // Disconnect
    socket.on('disconnect', () => {

        console.log(
            '❌ User disconnected:',
            socket.id
        );

    });

});

// ===============================
// START SERVER
// ===============================

function startServer(port) {

    server.listen(port, () => {

        console.log('================================');
        console.log(`🚀 Server running on port ${port}`);
        console.log(`🌐 http://localhost:${port}`);
        console.log(`🔌 Socket.io running on port ${port}`);
        console.log('================================');

    });

}

// ===============================
// XỬ LÝ PORT BỊ TRÙNG
// ===============================

server.on('error', (err) => {

    if (err.code === 'EADDRINUSE') {

        console.log(
            `❌ Port ${PORT} đang được sử dụng.`
        );

        const newPort = PORT + 1;

        console.log(
            `🔄 Đang thử port ${newPort}...`
        );

        startServer(newPort);

    } else {

        console.error(
            '❌ Lỗi server:',
            err
        );

    }

});

// Chạy server
startServer(PORT);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use("/uploads", express.static("uploads"));
app.use(express.static("view"));
app.use(cors());
app.use(express.json());

// Import routes
const phongtroRoutes = require("./routes/phongtroroutes");
const danhgiaRoutes = require("./routes/danhgiaroutes");
const userRoutes = require("./routes/userroutes");
const { router: chatRoutes, setSocketIO: setChatSocketIO } = require('./routes/chatRoutes');
const { router: bookingRoutes, setSocketIO: setBookingSocketIO } = require('./routes/bookingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Thiết lập Socket.io cho các routes
setChatSocketIO(io);
setBookingSocketIO(io);

// Thiết lập đường dẫn API (Định tuyến)
app.use("/phongtro", phongtroRoutes);
app.use("/danhgia", danhgiaRoutes);
app.use("/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user room
    socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Typing indicator
    socket.on('typing', (data) => {
        socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
            userId: data.userId,
            isTyping: data.isTyping
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Socket.io is running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} đã được sử dụng. Đang thử port ${PORT + 1}...`);
        server.listen(PORT + 1, () => {
            console.log(`🚀 Server running on port ${PORT + 1}`);
            console.log(`Socket.io is running on port ${PORT + 1}`);
        });
    } else {
        console.error('Lỗi server:', err);
    }
});

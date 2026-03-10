const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this in production
        methods: ["GET", "POST", "DELETE", "PUT"]
    }
});

// Pass io to express app to be used in controllers
app.set('io', io);

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/servers', require('./routes/servers'));
app.use('/api/posts', require('./routes/posts'));

// Socket.io logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_server', (serverId) => {
        socket.join(serverId);
        console.log(`User ${socket.id} joined server room: ${serverId}`);
    });

    socket.on('join_user', (userId) => {
        socket.join(userId);
        console.log(`User ${socket.id} joined private room: ${userId}`);
    });

    socket.on('leave_server', (serverId) => {
        socket.leave(serverId);
        console.log(`User ${socket.id} left server room: ${serverId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

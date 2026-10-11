const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Socket event handlers
io.on('connection', (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);

  // Join user's personal room or conversation room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`👤 Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send_message', (data) => {
    // Broadcast to conversation room
    io.to(`conversation_${data.conversation_id}`).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket Disconnected: ${socket.id}`);
  });
});

// Export io for controllers if needed
app.set('socketio', io);

server.listen(PORT, () => {
  console.log(`🚀 Campus Marketplace Backend Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

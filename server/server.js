const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.startsWith('http://localhost:') || 
          origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

const PORT = process.env.PORT || 5000;

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    const msg = 'The CORS policy does not allow access from this origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/harmony-studio')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      timestamp: Date.now()
    });
  });

  socket.on('play-note', ({ roomId, note, instrument }) => {
    socket.to(roomId).emit('note-played', {
      userId: socket.id,
      note,
      instrument,
      timestamp: Date.now()
    });
  });

  socket.on('send-message', ({ roomId, message, username }) => {
    io.to(roomId).emit('new-message', {
      userId: socket.id,
      username,
      message,
      timestamp: Date.now()
    });
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', {
      userId: socket.id,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/songs', require('./routes/songs'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    clients: io.engine?.clientsCount || 0,
    cors: 'enabled'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ✅ Only ONE server.listen
server.listen(PORT, () => {
  console.log(`🚀 Server running on port: ${PORT}`);
  console.log(`📡 WebSocket ready on port: ${PORT}`);
  console.log(`🔧 CORS enabled for all localhost origins`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`👉 Run: npx kill-port ${PORT}`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});
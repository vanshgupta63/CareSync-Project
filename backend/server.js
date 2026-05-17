import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import Message from './models/Message.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: 'https://care-sync-project-eight.vercel.app/', methods: ['GET', 'POST'] }
});

// ── Middleware ──────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
)
app.use(express.json());
app.use(morgan('dev'));

// ── REST Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/records', recordRoutes);

app.get('/', (_, res) => res.send('CareSync API is running...'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ── Socket.io ────────────────────────────────────────────────
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // User comes online
  socket.on('user:online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));
  });

  // Real-time message
  socket.on('message:send', async ({ senderId, receiverId, content }) => {
    try {
      const message = await Message.create({ sender: senderId, receiver: receiverId, content });
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('message:receive', message);
      }
      socket.emit('message:sent', message);
    } catch (err) {
      socket.emit('message:error', err.message);
    }
  });

  // Appointment notifications
  socket.on('appointment:booked', ({ doctorId, appointment }) => {
    const doctorSocket = onlineUsers.get(doctorId);
    if (doctorSocket) {
      io.to(doctorSocket).emit('appointment:new', appointment);
    }
  });

  // Video call signaling
  socket.on('call:offer', ({ to, offer, from }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) io.to(targetSocket).emit('call:offer', { offer, from });
  });

  socket.on('call:answer', ({ to, answer }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) io.to(targetSocket).emit('call:answer', { answer });
  });

  socket.on('call:ice-candidate', ({ to, candidate }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) io.to(targetSocket).emit('call:ice-candidate', { candidate });
  });

  socket.on('call:end', ({ to }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) io.to(targetSocket).emit('call:ended');
  });

  socket.on('disconnect', () => {
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('users:online', Array.from(onlineUsers.keys()));
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

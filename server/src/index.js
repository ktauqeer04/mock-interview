import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  createRoom,
  joinRoom,
  getRoom,
  getQuestionById,
  recordQuestionResult,
} from './database.js';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// REST API
app.post('/api/rooms', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const room = createRoom(email);
  res.json(room);
});

app.post('/api/rooms/:roomId/join', (req, res) => {
  const { roomId } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const result = joinRoom(roomId, email);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.room);
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.expiresAt < Date.now()) return res.status(410).json({ error: 'Room expired' });
  res.json(room);
});

app.get('/api/rooms/:roomId/question', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!room.questionId) return res.status(404).json({ error: 'No question assigned yet' });
  const question = getQuestionById(room.questionId);
  if (!question) return res.status(404).json({ error: 'Question not found' });
  res.json(question);
});

app.post('/api/rooms/:roomId/result', (req, res) => {
  const { email, questionId, solved } = req.body;
  if (!email || !questionId || typeof solved !== 'boolean') {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  recordQuestionResult(req.params.roomId, email, questionId, solved);
  res.json({ ok: true });
});

// Socket.io for code sync and signaling
io.on('connection', (socket) => {
  socket.on('join-room', ({ roomId, email }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.email = email;
  });

  socket.on('code-update', ({ roomId, code }) => {
    socket.to(roomId).emit('code-update', { code });
  });

  // WebRTC signaling
  socket.on('webrtc-offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('webrtc-offer', { offer });
  });

  socket.on('webrtc-answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('webrtc-answer', { answer });
  });

  socket.on('webrtc-ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('webrtc-ice-candidate', { candidate });
  });

  socket.on('request-offer', ({ roomId }) => {
    socket.to(roomId).emit('request-offer');
  });

  socket.on('disconnect', () => {
    // Notify peers
    if (socket.roomId) {
      socket.to(socket.roomId).emit('peer-left');
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const CHANNEL_PASSWORD = process.env.CHANNEL_PASSWORD || 'changeme123';
const MAX_USERS = 4;
const CHANNEL = 'principal';

// socketId -> { displayName, muted }
const users = new Map();

function broadcastUsers() {
  const list = Array.from(users.entries()).map(([id, u]) => ({
    id,
    displayName: u.displayName,
    muted: u.muted
  }));
  io.to(CHANNEL).emit('channel_users', { users: list });
}

function handleLeave(socket) {
  if (!users.has(socket.id)) return;
  const { displayName } = users.get(socket.id);
  users.delete(socket.id);
  socket.to(CHANNEL).emit('user_left', { userId: socket.id });
  broadcastUsers();
  console.log(`[-] ${displayName} left  (total: ${users.size})`);
}

io.on('connection', (socket) => {
  console.log(`[~] New socket: ${socket.id}`);

  // ── JOIN ──────────────────────────────────────────────────────────────────
  socket.on('join_channel', ({ password, displayName }) => {
    if (password !== CHANNEL_PASSWORD) {
      return socket.emit('join_error', { message: 'Contraseña incorrecta.' });
    }
    if (users.size >= MAX_USERS) {
      return socket.emit('join_error', { message: 'Canal lleno (máx. 4 usuarios).' });
    }
    if (!displayName || displayName.trim().length < 1) {
      return socket.emit('join_error', { message: 'Escribe tu nombre.' });
    }

    users.set(socket.id, { displayName: displayName.trim(), muted: false });
    socket.join(CHANNEL);

    const existingUsers = Array.from(users.entries())
      .filter(([id]) => id !== socket.id)
      .map(([id, u]) => ({ id, displayName: u.displayName, muted: u.muted }));

    // Tell the joiner who's already here
    socket.emit('joined', { userId: socket.id, existingUsers });

    // Tell everyone else a new user arrived
    socket.to(CHANNEL).emit('user_joined', {
      userId: socket.id,
      displayName: displayName.trim()
    });

    broadcastUsers();
    console.log(`[+] ${displayName} joined (total: ${users.size})`);
  });

  // ── WebRTC RELAY ──────────────────────────────────────────────────────────
  socket.on('webrtc_offer',     ({ to, sdp })       => socket.to(to).emit('webrtc_offer',     { from: socket.id, sdp }));
  socket.on('webrtc_answer',    ({ to, sdp })       => socket.to(to).emit('webrtc_answer',    { from: socket.id, sdp }));
  socket.on('ice_candidate',    ({ to, candidate }) => socket.to(to).emit('ice_candidate',    { from: socket.id, candidate }));

  // ── MUTE STATE ────────────────────────────────────────────────────────────
  socket.on('mute_state', ({ muted }) => {
    if (users.has(socket.id)) {
      users.get(socket.id).muted = muted;
      socket.to(CHANNEL).emit('user_mute_state', { userId: socket.id, muted });
    }
  });

  // ── SPEAKING STATE ────────────────────────────────────────────────────────
  socket.on('speaking_state', ({ speaking }) => {
    socket.to(CHANNEL).emit('speaking_state', { from: socket.id, speaking });
  });

  // ── LEAVE / DISCONNECT ────────────────────────────────────────────────────
  socket.on('leave_channel', () => handleLeave(socket));
  socket.on('disconnect',    () => handleLeave(socket));
});

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', users: users.size, max: MAX_USERS }));

// Status API for Admin Panel
app.get('/api/status', (_, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    channel: CHANNEL,
    users: Array.from(users.entries()).map(([id, u]) => ({ id, displayName: u.displayName, muted: u.muted })),
    max: MAX_USERS,
    timestamp: new Date().toISOString()
  });
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`✅ Signaling server on port ${PORT}`));

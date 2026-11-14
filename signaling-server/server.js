const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');

const { createAuth } = require('./auth');

function createVoiceServer({ auth = createAuth(), env = process.env } = {}) {
const app = express();
app.disable('x-powered-by');
const origins = new Set((env.ALLOWED_ORIGINS ||
  'https://yaire.site,https://www.yaire.site,https://dclf.yaire.site,https://tv.yaire.site,http://localhost:5500,http://localhost:8000').split(',').map(x => x.trim()));
const corsOptions = { origin(origin, callback) { callback(null, !origin || origins.has(origin)); },
  methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] };
app.use(cors(corsOptions));
app.use(express.json({ limit: '16kb' }));
app.use('/api', (_, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions, maxHttpBufferSize: 65536,
  allowRequest: (req, callback) => callback(null, !req.headers.origin || origins.has(req.headers.origin)),
  pingTimeout: 60000, pingInterval: 25000
});
const MAX_USERS = 4;
const CHANNEL = 'principal';

io.use(async (socket, next) => {
  try {
    socket.data.identity = await auth.authenticate(socket.handshake.auth?.token, { googleOnly: true });
    next();
  } catch {
    next(new Error('Inicia sesión con Google de nuevo.'));
  }
});

const users = new Map();
const chatLog = [];

// ── AWS NETWORK MONITORING ──────────────────────────────────────────────────
const fs = require('fs');
let lastNet = { rx: 0, tx: 0, time: Date.now() };
let currentNetSpeed = { rx_bps: 0, tx_bps: 0, rx_mb: '0.00', tx_mb: '0.00' };

function formatBytes(bytesPerSec) {
  if (bytesPerSec === 0) return '0.00 KB/s';
  const k = 1024;
  if (bytesPerSec < k * k) return (bytesPerSec / k).toFixed(2) + ' KB/s';
  return (bytesPerSec / (k * k)).toFixed(2) + ' MB/s';
}

function updateNetStats() {
  try {
    const data = fs.readFileSync('/proc/net/dev', 'utf8');
    const lines = data.split('\n');
    let totalRx = 0;
    let totalTx = 0;
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(/:|\s+/);
      const iface = parts[0];
      if (iface === 'lo') continue; // skip loopback
      totalRx += parseInt(parts[1], 10) || 0;
      totalTx += parseInt(parts[9], 10) || 0;
    }
    const now = Date.now();
    const dt = (now - lastNet.time) / 1000;
    if (dt > 0 && lastNet.time !== 0 && (totalRx >= lastNet.rx)) {
      currentNetSpeed.rx_bps = (totalRx - lastNet.rx) / dt;
      currentNetSpeed.tx_bps = (totalTx - lastNet.tx) / dt;
      currentNetSpeed.rx_mb = formatBytes(currentNetSpeed.rx_bps);
      currentNetSpeed.tx_mb = formatBytes(currentNetSpeed.tx_bps);
    }
    lastNet = { rx: totalRx, tx: totalTx, time: now };
  } catch (e) {
    // Only happens on non-linux OS (like Windows development), ignore
    currentNetSpeed.rx_mb = 'N/A';
    currentNetSpeed.tx_mb = 'N/A';
  }
}
const netTimer = setInterval(updateNetStats, 2000);
netTimer.unref();

// ── MUSIC STATE ──────────────────────────────────────────────────────────────
let musicQueue = [];
let musicState = { currentIndex: -1, isPlaying: false, startedAt: null, pausedAt: null, pausedTime: 0 };

function broadcastUsers() {
  const list = Array.from(users.entries()).map(([id, u]) => ({
    id,
    displayName: u.displayName,
    photoURL: u.photoURL,
    muted: u.muted,
    dnd: u.dnd
  }));
  io.to(CHANNEL).emit('channel_users', { users: list });
}

function handleLeave(socket) {
  socket.leave(CHANNEL);
  if (!users.has(socket.id)) return;
  const { displayName } = users.get(socket.id);
  users.delete(socket.id);
  socket.to(CHANNEL).emit('user_left', { userId: socket.id });
  broadcastUsers();
  if (users.size === 0) {
    chatLog.length = 0;
    musicQueue = [];
    musicState = { currentIndex: -1, isPlaying: false, startedAt: null, pausedAt: null, pausedTime: 0 };
  }
  console.log(`[-] ${displayName} left  (total: ${users.size})`);
}

io.on('connection', (socket) => {
  console.log(`[~] New socket: ${socket.id}`);

  let expiryTimer;
  function armExpiry() {
    clearTimeout(expiryTimer);
    expiryTimer = setTimeout(() => socket.disconnect(true),
      Math.max(0, socket.data.identity.exp * 1000 - Date.now()));
    expiryTimer.unref();
  }
  armExpiry();
  // All application events require a current identity; channel events require membership.
  let burst = 0, burstStart = Date.now();
  socket.use(([event, payload], next) => {
    if (Date.now() >= socket.data.identity.exp * 1000) {
      socket.disconnect(true);
      return;
    }
    if (Date.now() - burstStart > 1000) { burst = 0; burstStart = Date.now(); }
    if (++burst > 120) return;
    if (!['join_channel', 'leave_channel', 'refresh_auth'].includes(event) && !users.has(socket.id)) return;
    if (payload !== undefined && (payload === null || typeof payload !== 'object' || Array.isArray(payload))) return;
    next();
  });
  socket.on('refresh_auth', async ({ token } = {}) => {
    try {
      const identity = await auth.authenticate(token, { googleOnly: true });
      if (identity.uid !== socket.data.identity.uid) throw new Error('Cuenta distinta.');
      socket.data.identity = identity;
      armExpiry();
    } catch { socket.disconnect(true); }
  });

  socket.on('get_room_status', () => {
    socket.emit('room_status', { users: Array.from(users.values()), musicQueue });
  });

  socket.on('join_channel', ({ displayName, photoURL } = {}) => {
    if (users.has(socket.id)) return; // Idempotent reconnect/join.
    const identity = socket.data.identity;
    if (typeof displayName !== 'string' || !displayName.trim() || displayName.length > 80) {
      return socket.emit('join_error', { message: 'Escribe un nombre válido (máx. 80 caracteres).' });
    }
    // Only the same verified account may replace its previous session.
    for (const [oldId, oldUser] of users.entries()) {
      if (oldUser.uid === identity.uid && oldId !== socket.id) {
        const oldSocket = io.sockets.sockets.get(oldId);
        if (oldSocket) { handleLeave(oldSocket); oldSocket.disconnect(true); }
      }
    }
    if (users.size >= MAX_USERS) {
      return socket.emit('join_error', { message: 'Canal lleno (máx. 4 usuarios).' });
    }
    photoURL = safeMediaUrl(photoURL) || safeMediaUrl(identity.picture);

    // Add user
    users.set(socket.id, { uid: identity.uid, displayName: displayName.trim(), photoURL, muted: false, dnd: false, camEnabled: false });
    socket.join(CHANNEL);

    const existingUsers = Array.from(users.entries())
      .filter(([id]) => id !== socket.id)
      .map(([id, u]) => ({ id, displayName: u.displayName, photoURL: u.photoURL, muted: u.muted, dnd: u.dnd, camEnabled: u.camEnabled }));

    // Tell the joiner who's already here
    socket.emit('joined', { userId: socket.id, existingUsers });

    // Tell everyone else a new user arrived
    socket.to(CHANNEL).emit('user_joined', {
      userId: socket.id,
      displayName: displayName.trim(),
      photoURL,
      camEnabled: false
    });

    broadcastUsers();
    console.log(`[+] ${displayName} joined (total: ${users.size})`);
  });

  // ── WebRTC RELAY ──────────────────────────────────────────────────────────
  socket.on('webrtc_offer', ({ to, sdp } = {}) => { if (users.has(to) && to !== socket.id && sdp && ['string', 'object'].includes(typeof sdp)) socket.to(to).emit('webrtc_offer', { from: socket.id, sdp }); });
  socket.on('webrtc_answer', ({ to, sdp } = {}) => { if (users.has(to) && to !== socket.id && sdp && ['string', 'object'].includes(typeof sdp)) socket.to(to).emit('webrtc_answer', { from: socket.id, sdp }); });
  socket.on('ice_candidate', ({ to, candidate } = {}) => { if (users.has(to) && to !== socket.id && candidate && typeof candidate === 'object') socket.to(to).emit('ice_candidate', { from: socket.id, candidate }); });

  // ── MUTE STATE ────────────────────────────────────────────────────────────
  socket.on('mute_state', ({ muted } = {}) => {
    if (typeof muted !== 'boolean') return;
    if (users.has(socket.id)) {
      users.get(socket.id).muted = muted;
      socket.to(CHANNEL).emit('user_mute_state', { userId: socket.id, muted });
    }
  });

  // ── CAM STATE ─────────────────────────────────────────────────────────────
  socket.on('cam_state', ({ camEnabled } = {}) => {
    if (typeof camEnabled !== 'boolean') return;
    if (users.has(socket.id)) {
      users.get(socket.id).camEnabled = camEnabled;
      socket.to(CHANNEL).emit('user_cam_state', { userId: socket.id, camEnabled });
    }
  });

  // ── DND STATE ─────────────────────────────────────────────────────────────
  socket.on('dnd_state', ({ dnd } = {}) => {
    if (typeof dnd !== 'boolean') return;
    if (users.has(socket.id)) {
      users.get(socket.id).dnd = dnd;
      socket.to(CHANNEL).emit('user_dnd_state', { userId: socket.id, dnd });
    }
  });

  // ── SPEAKING STATE ────────────────────────────────────────────────────────
  socket.on('speaking_state', ({ speaking } = {}) => {
    if (typeof speaking !== 'boolean') return;
    socket.to(CHANNEL).emit('speaking_state', { from: socket.id, speaking });
  });

  // ── REACTIONS ─────────────────────────────────────────────────────────────
  socket.on('reaction', ({ emoji } = {}) => {
    if (typeof emoji === 'string' && emoji.length <= 32) socket.to(CHANNEL).emit('reaction', { from: socket.id, emoji });
  });

  // ── CHAT MESSAGE ─────────────────────────────────────────────────────────
  socket.on('chat_message', ({ text } = {}) => {
    const user = users.get(socket.id);
    if (!user || typeof text !== 'string' || !text.trim()) return;
    const msg = {
      from: socket.id,
      name: user.displayName,
      text: text.trim().slice(0, 500),
      ts: Date.now()
    };
    chatLog.push(msg);
    if (chatLog.length > 50) chatLog.shift(); // Keep last 50 messages
    io.to(CHANNEL).emit('chat_message', msg);
  });

  // ── CHAT TYPING ──────────────────────────────────────────────────────────
  socket.on('chat_typing', ({ isTyping } = {}) => {
    if (typeof isTyping !== 'boolean') return;
    const user = users.get(socket.id);
    if (!user) return;
    socket.to(CHANNEL).emit('chat_typing', {
      from: socket.id,
      name: user.displayName,
      isTyping
    });
  });
  // ── RING CHANNEL (notify others of incoming call) ────────────────────────
  socket.on('ring_channel', () => {
    const user = users.get(socket.id);
    if (!user) return;
    socket.to(CHANNEL).emit('incoming_ring', {
      from: socket.id,
      name: user.displayName
    });
  });

  // ── MUSIC ─────────────────────────────────────────────────────────────────
  socket.on('music_add', async ({ url, title, type, playNow, cover, artist } = {}) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    if (!safeMediaUrl(url) || !['youtube', 'spotify', 'audio', 'spotlight'].includes(type) || musicQueue.length >= 100) return;
    if ([title, artist].some(value => value != null && (typeof value !== 'string' || value.length > 300))) return;
    cover = safeMediaUrl(cover);
    let trackUrl = url;
    let trackType = type;
    let trackTitle = title || url;
    
    // Fallback: if client still sends spotify type, try server-side conversion
    if (type === 'spotify') {
      try {
        let searchTitle = trackTitle;
        if (searchTitle === 'Spotify Track' || !searchTitle || searchTitle.trim() === '') {
          try {
            const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(trackUrl)}`);
            const data = await res.json();
            const artist = data.author_name || '';
            const t = data.title || 'Spotify Track';
            searchTitle = artist ? `${t} - ${artist}` : t;
          } catch(e) {}
        }
        console.log('[Spotify] Searching YouTube for:', searchTitle + ' audio');
        const yts = require('yt-search');
        const r = await yts(searchTitle + ' audio');
        if (r && r.videos.length > 0) {
          trackUrl = r.videos[0].url;
          trackType = 'youtube';
          trackTitle = r.videos[0].title;
        }
      } catch (e) {
        console.error('yt-search error:', e);
      }
    }

    if (!users.has(socket.id)) return;
    const track = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,5),
      url: trackUrl,
      title: trackTitle,
      type: trackType,
      source: type,
      cover: cover || null,
      artist: artist || null,
      addedBy: socket.id,
      addedByName: user.displayName
    };

    if (playNow) {
      if (musicState.currentIndex === -1 || musicQueue.length === 0 || !musicState.isPlaying) {
        musicQueue.push(track);
        musicState = { currentIndex: musicQueue.length - 1, isPlaying: true, startedAt: Date.now(), pausedAt: null, pausedTime: 0 };
      } else {
        musicQueue.splice(musicState.currentIndex + 1, 0, track);
        musicState.currentIndex++;
        musicState.isPlaying = true;
        musicState.startedAt = Date.now();
        musicState.pausedAt = null;
        musicState.pausedTime = 0;
      }
      io.to(CHANNEL).emit('music_queue_update', { queue: musicQueue, state: musicState });
      io.to(CHANNEL).emit('music_play', { track, state: musicState });
      return;
    }

    musicQueue.push(track);
    io.to(CHANNEL).emit('music_queue_update', { queue: musicQueue, state: musicState });
    if (musicState.currentIndex === -1 || !musicState.isPlaying) {
      musicState = { currentIndex: musicQueue.length - 1, isPlaying: true, startedAt: Date.now(), pausedAt: null, pausedTime: 0 };
      io.to(CHANNEL).emit('music_play', { track: musicQueue[musicState.currentIndex], state: musicState });
    }
  });

  socket.on('music_play_index', ({ index } = {}) => {
    if (Number.isInteger(index) && index >= 0 && index < musicQueue.length) {
      musicState = { currentIndex: index, isPlaying: true, startedAt: Date.now(), pausedAt: null, pausedTime: 0 };
      io.to(CHANNEL).emit('music_play', { track: musicQueue[index], state: musicState });
      io.to(CHANNEL).emit('music_queue_update', { queue: musicQueue, state: musicState });
    }
  });

  socket.on('music_clear', () => {
    musicQueue = [];
    musicState = { currentIndex: -1, isPlaying: false, startedAt: null, pausedAt: null, pausedTime: 0 };
    io.to(CHANNEL).emit('music_stop', {});
    io.to(CHANNEL).emit('music_queue_update', { queue: musicQueue, state: musicState });
  });

  socket.on('music_remove', ({ trackId } = {}) => {
    const idx = musicQueue.findIndex(t => t.id === trackId);
    if (idx === -1) return;
    const wasPlaying = idx === musicState.currentIndex;
    musicQueue.splice(idx, 1);
    if (musicQueue.length === 0) {
      musicState = { currentIndex: -1, isPlaying: false, startedAt: null, pausedAt: null, pausedTime: 0 };
      io.to(CHANNEL).emit('music_stop', {});
    } else if (idx < musicState.currentIndex) {
      musicState.currentIndex--;
    } else if (wasPlaying) {
      if (musicState.currentIndex < musicQueue.length) {
        musicState = { ...musicState, isPlaying: true, startedAt: Date.now(), pausedTime: 0, pausedAt: null };
        io.to(CHANNEL).emit('music_play', { track: musicQueue[musicState.currentIndex], state: musicState });
      } else {
        musicState = { currentIndex: -1, isPlaying: false, startedAt: null, pausedAt: null, pausedTime: 0 };
        io.to(CHANNEL).emit('music_stop', {});
      }
    }
    io.to(CHANNEL).emit('music_queue_update', { queue: musicQueue, state: musicState });
  });

  socket.on('music_pause', ({ currentTime } = {}) => {
    if (!Number.isFinite(currentTime) || currentTime < 0 || currentTime > 86400) return;
    if (!musicState.isPlaying) return;
    musicState.isPlaying = false;
    musicState.pausedAt = Date.now();
    musicState.pausedTime = currentTime || 0;
    io.to(CHANNEL).emit('music_state_update', { state: musicState });
  });

  socket.on('music_resume', () => {
    if (musicState.isPlaying || musicState.currentIndex === -1) return;
    musicState.isPlaying = true;
    musicState.startedAt = Date.now() - (musicState.pausedTime * 1000);
    musicState.pausedAt = null;
    io.to(CHANNEL).emit('music_state_update', { state: musicState });
  });

  const handleNextTrack = () => {
    if (musicQueue.length === 0) return;
    if (musicState.currentIndex !== -1) {
      musicQueue.splice(musicState.currentIndex, 1);
      if (musicState.currentIndex >= musicQueue.length) {
        musicState.currentIndex = musicQueue.length > 0 ? 0 : -1;
      }
    }
    if (musicState.currentIndex !== -1 && musicQueue[musicState.currentIndex]) {
      musicState = { ...musicState, isPlaying: true, startedAt: Date.now(), pausedAt: null, pausedTime: 0 };
      io.to(CHANNEL).emit('music_play', { track: musicQueue[musicState.currentIndex], state: musicState });
    } else {
      musicState = { currentIndex: -1, isPlaying: false, startedAt: null, pausedAt: null, pausedTime: 0 };
      io.to(CHANNEL).emit('music_stop', {});
    }
    io.to(CHANNEL).emit('music_queue_update', { queue: musicQueue, state: musicState });
  };

  socket.on('music_skip', handleNextTrack);
  socket.on('music_ended', handleNextTrack);

  socket.on('music_seek', ({ time } = {}) => {
    if (!Number.isFinite(time) || time < 0 || time > 86400) return;
    if (musicState.currentIndex === -1) return;
    musicState.startedAt = Date.now() - (time * 1000);
    musicState.pausedTime = time;
    socket.to(CHANNEL).emit('music_seek', { time });
  });

  socket.on('music_sync_request', () => {
    const track = (musicState.currentIndex >= 0 && musicState.currentIndex < musicQueue.length) ? musicQueue[musicState.currentIndex] : null;
    let currentTime = 0;
    if (track && musicState.isPlaying && musicState.startedAt) {
      currentTime = (Date.now() - musicState.startedAt) / 1000;
    } else if (track) {
      currentTime = musicState.pausedTime || 0;
    }
    socket.emit('music_sync', { queue: musicQueue, state: musicState, currentTrack: track, currentTime });
  });

  // ── LEAVE / DISCONNECT ────────────────────────────────────────────────────
  socket.on('leave_channel', () => handleLeave(socket));
  socket.on('disconnect', () => { clearTimeout(expiryTimer); handleLeave(socket); });
});

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', users: users.size, max: MAX_USERS }));

// Status API for Admin Panel
app.get('/api/status', auth.requireSession({ admin: true }), (_, res) => {
  res.json({
    channel: CHANNEL,
    users: Array.from(users.entries()).map(([id, u]) => ({ 
      id, 
      displayName: u.displayName, 
      muted: u.muted,
      dnd: u.dnd || false
    })),
    max: MAX_USERS,
    chatLog: chatLog,
    musicQueue: musicQueue,
    musicState: musicState,
    awsNetwork: currentNetSpeed,
    timestamp: new Date().toISOString()
  });
});
app.post('/api/kick', auth.requireSession({ admin: true }), (req, res) => {
  const { userId } = req.body || {};
  if (typeof userId !== 'string') return res.status(400).json({ error: 'Usuario no válido.' });
  const targetSocket = io.sockets.sockets.get(userId);
  const user = users.get(userId);
  if (!user || !targetSocket) return res.status(404).json({ error: 'Usuario no encontrado.' });
  targetSocket.emit('kicked');
  handleLeave(targetSocket);
  targetSocket.disconnect(true);
  res.json({ success: true, kicked: user.displayName });
});

// ── LIVEKIT TOKEN ENDPOINT ───────────────────────────────────────────────────
app.get('/api/livekit-token', auth.requireSession({ googleOnly: true }), async (req, res) => {
  if (!Array.from(users.values()).some(user => user.uid === req.user.uid)) {
    return res.status(403).json({ error: 'Entra primero al canal de voz.' });
  }
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = env;
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
    return res.status(503).json({ error: 'LiveKit no está configurado.' });
  }
  try {
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: req.user.uid, name: req.user.name || 'Usuario', ttl: '10m'
    });
    at.addGrant({ roomJoin: true, room: CHANNEL, canPublish: true, canSubscribe: true });
    const token = await at.toJwt();
    res.json({ token, url: LIVEKIT_URL });
  } catch { res.status(500).json({ error: 'No se pudo iniciar LiveKit.' }); }
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(err.type === 'entity.too.large' ? 413 : 400).json({ error: 'Petición no válida.' });
});
server.on('close', () => clearInterval(netTimer));
return { app, server, io };
}

function safeMediaUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

if (require.main === module) {
  const { server } = createVoiceServer();
  const port = process.env.PORT || 3001;
  server.listen(port, () => console.log(`Signaling server on port ${port}`));
}
module.exports = { createVoiceServer };

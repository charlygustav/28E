const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000
});

let CHANNEL_PASSWORD = process.env.CHANNEL_PASSWORD || 'changeme123';
const MAX_USERS = 4;
const CHANNEL = 'principal';

const https = require('https');
function fetchPasswordFromFirebase() {
  https.get('https://yaire-591ca-default-rtdb.firebaseio.com/config/voicePassword.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const pwd = JSON.parse(data);
        if (pwd && typeof pwd === 'string' && pwd.trim().length > 0) {
          CHANNEL_PASSWORD = pwd.trim();
          console.log(`[Firebase] Loaded voice password: ${CHANNEL_PASSWORD}`);
        }
      } catch (e) {
        console.error('[Firebase] Error parsing voice password:', e);
      }
    });
  }).on('error', (err) => {
    console.error('[Firebase] Error fetching voice password:', err);
  });
}
fetchPasswordFromFirebase();

// socketId -> { displayName, muted, dnd }
const users = new Map();
const chatLog = [];

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
  if (!users.has(socket.id)) return;
  const { displayName } = users.get(socket.id);
  users.delete(socket.id);
  socket.to(CHANNEL).emit('user_left', { userId: socket.id });
  broadcastUsers();
  if (users.size === 0) {
    musicQueue = [];
    musicState = { currentIndex: -1, isPlaying: false, startedAt: null, pausedAt: null, pausedTime: 0 };
  }
  console.log(`[-] ${displayName} left  (total: ${users.size})`);
}

io.on('connection', (socket) => {
  console.log(`[~] New socket: ${socket.id}`);

  // ── JOIN ──────────────────────────────────────────────────────────────────
  socket.on('get_room_status', () => {
    socket.emit('room_status', { 
      users: Array.from(users.values()), 
      musicQueue: musicQueue 
    });
  });

  socket.on('join_channel', ({ password, displayName, photoURL }) => {
    // if (password !== CHANNEL_PASSWORD) {
    //   return socket.emit('join_error', { message: 'Contraseña incorrecta.' });
    // }
    if (users.size >= MAX_USERS) {
      return socket.emit('join_error', { message: 'Canal lleno (máx. 4 usuarios).' });
    }
    if (!displayName || displayName.trim().length < 1) {
      return socket.emit('join_error', { message: 'Escribe tu nombre.' });
    }

    // Evict any ghost session with the same display name
    for (const [oldId, oldUser] of users.entries()) {
      if (oldUser.displayName === displayName.trim() && oldId !== socket.id) {
        users.delete(oldId);
        io.to(oldId).emit('join_error', { message: 'Nueva sesión iniciada en otro lugar.' });
        io.sockets.sockets.get(oldId)?.disconnect(true);
        io.to(CHANNEL).emit('user_left', { userId: oldId });
      }
    }

    // Add user
    users.set(socket.id, { displayName: displayName.trim(), photoURL, muted: false, dnd: false });
    socket.join(CHANNEL);

    const existingUsers = Array.from(users.entries())
      .filter(([id]) => id !== socket.id)
      .map(([id, u]) => ({ id, displayName: u.displayName, photoURL: u.photoURL, muted: u.muted, dnd: u.dnd }));

    // Tell the joiner who's already here
    socket.emit('joined', { userId: socket.id, existingUsers });

    // Tell everyone else a new user arrived
    socket.to(CHANNEL).emit('user_joined', {
      userId: socket.id,
      displayName: displayName.trim(),
      photoURL
    });

    broadcastUsers();
    console.log(`[+] ${displayName} joined (total: ${users.size})`);
  });

  // ── WebRTC RELAY ──────────────────────────────────────────────────────────
  socket.on('webrtc_offer', ({ to, sdp }) => socket.to(to).emit('webrtc_offer', { from: socket.id, sdp }));
  socket.on('webrtc_answer', ({ to, sdp }) => socket.to(to).emit('webrtc_answer', { from: socket.id, sdp }));
  socket.on('ice_candidate', ({ to, candidate }) => socket.to(to).emit('ice_candidate', { from: socket.id, candidate }));

  // ── MUTE STATE ────────────────────────────────────────────────────────────
  socket.on('mute_state', ({ muted }) => {
    if (users.has(socket.id)) {
      users.get(socket.id).muted = muted;
      socket.to(CHANNEL).emit('user_mute_state', { userId: socket.id, muted });
    }
  });

  // ── DND STATE ─────────────────────────────────────────────────────────────
  socket.on('dnd_state', ({ dnd }) => {
    if (users.has(socket.id)) {
      users.get(socket.id).dnd = dnd;
      socket.to(CHANNEL).emit('user_dnd_state', { userId: socket.id, dnd });
    }
  });

  // ── SPEAKING STATE ────────────────────────────────────────────────────────
  socket.on('speaking_state', ({ speaking }) => {
    socket.to(CHANNEL).emit('speaking_state', { from: socket.id, speaking });
  });

  // ── REACTIONS ─────────────────────────────────────────────────────────────
  socket.on('reaction', ({ emoji }) => {
    socket.to(CHANNEL).emit('reaction', { from: socket.id, emoji });
  });

  // ── CHAT MESSAGE ─────────────────────────────────────────────────────────
  socket.on('chat_message', ({ text }) => {
    const user = users.get(socket.id);
    if (!user || !text?.trim()) return;
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
  socket.on('chat_typing', ({ isTyping }) => {
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
  socket.on('music_add', async ({ url, title, type }) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    let trackUrl = url;
    let trackType = type;
    let trackTitle = title || url;
    
    // Automatically convert Spotify links to YouTube for synchronized playback
    if (type === 'spotify') {
      try {
        let searchTitle = trackTitle;
        // Improve search title if it's generic or missing
        if (searchTitle === 'Spotify Track' || !searchTitle || searchTitle.trim() === '') {
          try {
            // First try to scrape the raw HTML <title> since it contains the artist (e.g. "Song Name - song and lyrics by Artist | Spotify")
            const htmlRes = await fetch(trackUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
            const html = await htmlRes.text();
            const titleMatch = html.match(/<title>(.*?)<\/title>/i);
            
            if (titleMatch && titleMatch[1] && !titleMatch[1].toLowerCase().includes('page not found')) {
              let clean = titleMatch[1].split('| Spotify')[0].trim();
              clean = clean.replace(/ - song( and lyrics)? by /i, ' - ');
              clean = clean.replace(/ - Album by /i, ' - ');
              clean = clean.replace(/ - Playlist by /i, ' - ');
              searchTitle = clean;
            } else {
              // Fallback to oembed if HTML scraping fails
              const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(trackUrl)}`);
              const data = await res.json();
              const artist = data.author_name || '';
              const title = data.title ? data.title.replace(/\s*[\[\(](official.*|video oficial|audio oficial|audio|video|music video|lyric.*|visualizer|hd)[\]\)]/gi, '').replace(/\s*[-|]\s*$/g, '').trim() : 'Spotify Track';
              searchTitle = artist ? `${title} - ${artist}` : title;
            }
          } catch(e) { console.error('Spotify title fetch error:', e); }
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

    const track = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,5), url: trackUrl, title: trackTitle, type: trackType, source: type, addedBy: socket.id, addedByName: user.displayName };
    musicQueue.push(track);
    io.to(CHANNEL).emit('music_queue_update', { queue: musicQueue, state: musicState });
    if (musicState.currentIndex === -1) {
      musicState = { currentIndex: 0, isPlaying: true, startedAt: Date.now(), pausedAt: null, pausedTime: 0 };
      io.to(CHANNEL).emit('music_play', { track: musicQueue[0], state: musicState });
    }
  });

  socket.on('music_remove', ({ trackId }) => {
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

  socket.on('music_pause', ({ currentTime }) => {
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

  socket.on('music_seek', ({ time }) => {
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
  socket.on('disconnect', () => handleLeave(socket));
});

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', users: users.size, max: MAX_USERS }));

// Status API for Admin Panel
app.get('/api/status', (_, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
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
    timestamp: new Date().toISOString()
  });
});
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-secret-2025';

app.options('/api/kick', (_, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.post('/api/kick', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { userId, adminKey } = req.body;
  if (adminKey !== ADMIN_KEY) return res.status(403).json({ error: 'No autorizado.' });
  const user = users.get(userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
  const targetSocket = io.sockets.sockets.get(userId);
  users.delete(userId);
  if (targetSocket) {
    targetSocket.emit('join_error', { message: '\u26d4 Has sido expulsado por el administrador.' });
    targetSocket.disconnect(true);
  }
  io.to(CHANNEL).emit('user_left', { userId });
  broadcastUsers();
  console.log(`[KICK] ${user.displayName} was kicked by admin`);
  res.json({ success: true, kicked: user.displayName });
});

app.options('/api/password', (_, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.post('/api/password', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { password, adminKey } = req.body;
  if (adminKey !== ADMIN_KEY) return res.status(403).json({ error: 'No autorizado.' });
  if (!password || password.trim().length < 1) return res.status(400).json({ error: 'Contraseña no válida.' });
  
  CHANNEL_PASSWORD = password.trim();
  console.log(`[API] Voice password updated by admin to: ${CHANNEL_PASSWORD}`);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`\u2705 Signaling server on port ${PORT}`));

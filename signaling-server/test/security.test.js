'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { io: client } = require('socket.io-client');
const { createVoiceServer } = require('../server');
const { createAuth } = require('../auth');
const { createTtsHandler } = require('../../api/tts');

const claims = (uid, extra = {}) => ({ uid, exp: Date.now() / 1000 + 3600,
  firebase: { sign_in_provider: 'google.com' }, ...extra });
const tokens = new Map([['alice', claims('alice')], ['bob', claims('bob')],
  ['admin', claims('owner', { email: 'owner@example.com', email_verified: true })],
  ['password', claims('password', { firebase: { sign_in_provider: 'password' } })]]);
const auth = createAuth({ env: { ADMIN_EMAILS: 'owner@example.com' }, verifyToken: async token => {
  if (!tokens.has(token)) throw new Error('Invalid signature');
  return tokens.get(token);
} });
let service, base;
const sockets = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const event = (socket, name) => Promise.race([once(socket, name).then(([value]) => value),
  delay(1500).then(() => { throw new Error('Timeout: ' + name); })]);
async function connect(token) {
  const socket = client(base, { auth: { token }, transports: ['websocket'], reconnection: false });
  sockets.push(socket);
  await event(socket, 'connect');
  return socket;
}
async function join(socket, displayName = 'Same Name') {
  const joined = event(socket, 'joined');
  socket.emit('join_channel', { displayName, uid: 'forged-owner' });
  await joined;
}
const request = (path, token, options = {}) => fetch(base + path, {
  ...options, headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers }
});
before(async () => {
  service = createVoiceServer({ auth, env: { ALLOWED_ORIGINS: 'https://yaire.site' } });
  service.server.listen(0, '127.0.0.1');
  await once(service.server, 'listening');
  base = 'http://127.0.0.1:' + service.server.address().port;
});
after(async () => { sockets.forEach(s => s.disconnect()); await new Promise(resolve => service.io.close(resolve)); });

test('Firebase verifier rejects a fabricated token without accepting client claims', async () => {
  await assert.rejects(createAuth().authenticate('not-a-signed-firebase-token'));
});
test('authorization rejects expiry, wrong provider and accounts outside the optional allowlist', async () => {
  await assert.rejects(auth.authenticate('password', { googleOnly: true }));
  const expired = createAuth({ verifyToken: async () => claims('x', { exp: 1 }) });
  await assert.rejects(expired.authenticate('token'));
  const restricted = createAuth({ env: { VOICE_ALLOWED_UIDS: 'bob' }, verifyToken: async () => claims('alice') });
  await assert.rejects(restricted.authenticate('token', { googleOnly: true }));
  assert.equal(auth.isAdmin(claims('attacker', { email: 'owner@example.com', email_verified: false })), false);
});
test('socket handshake rejects missing, forged and non-Google sessions', async () => {
  for (const token of [undefined, 'forged', 'password']) {
    const socket = client(base, { auth: { token }, transports: ['websocket'], reconnection: false });
    sockets.push(socket);
    assert.match((await event(socket, 'connect_error')).message, /Google/);
    socket.disconnect();
  }
});
test('admin HTTP APIs reject anonymous and ordinary accounts', async () => {
  assert.equal((await request('/api/status')).status, 401);
  assert.equal((await request('/api/status', 'alice')).status, 403);
  assert.equal((await request('/api/status', 'admin')).status, 200);
  assert.equal((await request('/api/kick', undefined, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminKey: 'old-key', userId: 'x' }) })).status, 401);
  assert.equal((await request('/api/password', 'admin', { method: 'POST' })).status, 404);
});
test('malformed events do not crash; same display name cannot evict another account', async () => {
  const alice = await connect('alice');
  const rejected = event(alice, 'join_error');
  alice.emit('join_channel', { displayName: 123 });
  assert.match((await rejected).message, /válido/);
  alice.emit('join_channel', null);
  await join(alice);
  const bob = await connect('bob'); await join(bob);
  alice.emit('chat_message', { text: 123 });
  alice.emit('music_seek', { time: -3 });
  await delay(30);
  const state = await (await request('/api/status', 'admin')).json();
  assert.equal(state.users.length, 2);
  assert.equal(alice.connected, true);
  bob.disconnect(); alice.disconnect(); await delay(30);
});
test('authenticated outsiders cannot control music or relay SDP; leave stops broadcasts', async () => {
  const alice = await connect('alice'); await join(alice);
  const bob = await connect('bob');
  let offers = 0; alice.on('webrtc_offer', () => offers++);
  bob.emit('webrtc_offer', { to: alice.id, sdp: 'forged' });
  const music = event(alice, 'music_play');
  alice.emit('music_add', { url: 'https://example.com/track.mp3', type: 'spotlight', title: 'Test' });
  await music;
  bob.emit('music_clear'); await delay(30);
  let state = await (await request('/api/status', 'admin')).json();
  assert.equal(state.musicQueue.length, 1); assert.equal(offers, 0);
  await join(bob);
  let broadcasts = 0; alice.on('chat_message', () => broadcasts++);
  alice.emit('leave_channel'); await delay(30);
  bob.emit('chat_message', { text: 'Private after leave' }); await delay(30);
  assert.equal(broadcasts, 0);
  assert.equal(service.io.sockets.sockets.get(alice.id).rooms.has('principal'), false);
  alice.disconnect(); bob.disconnect(); await delay(30);
  state = await (await request('/api/status', 'admin')).json();
  assert.deepEqual(state.chatLog, []);
});
test('a reconnect replaces only the same UID, and admin kick clears the last session', async () => {
  const first = await connect('alice'); await join(first);
  const disconnected = event(first, 'disconnect');
  const second = await connect('alice'); await join(second); await disconnected;
  const state = await (await request('/api/status', 'admin')).json();
  assert.equal(state.users.length, 1);
  const response = await request('/api/kick', 'admin', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: second.id }) });
  assert.equal(response.status, 200); await delay(30);
  assert.equal((await (await request('/health')).json()).users, 0);
});
test('LiveKit requires membership and configured credentials', async () => {
  assert.equal((await request('/api/livekit-token')).status, 401);
  assert.equal((await request('/api/livekit-token', 'bob')).status, 403);
  const bob = await connect('bob'); await join(bob);
  assert.equal((await request('/api/livekit-token', 'bob')).status, 503);
  bob.disconnect(); await delay(30);
});
test('refreshing a socket with another identity disconnects it', async () => {
  const alice = await connect('alice'); await join(alice);
  const disconnected = event(alice, 'disconnect');
  alice.emit('refresh_auth', { token: 'bob' }); await disconnected;
});
test('TTS requires authenticated POST, validates length, limits use and hides provider errors', async () => {
  let calls = 0;
  const handler = createTtsHandler({ auth, env: { ELEVENLABS_API_KEY: 'test-secret' }, fetchAudio: async () => {
    calls++; return { ok: true, arrayBuffer: async () => new Uint8Array([1, 2]).buffer };
  } });
  async function invoke(method, token, text, target = handler) {
    const result = { headers: {}, setHeader(k,v) { this.headers[k] = v; }, status(code) { this.code = code; return this; },
      json(data) { this.body = data; }, send(data) { this.body = data; } };
    await target({ method, headers: token ? { authorization: 'Bearer ' + token } : {}, body: { text } }, result);
    return result;
  }
  assert.equal((await invoke('GET', 'alice', 'hi')).code, 405);
  assert.equal((await invoke('POST', undefined, 'hi')).code, 401);
  assert.equal((await invoke('POST', 'alice', 'x'.repeat(1001))).code, 400);
  for (let i=0;i<3;i++) assert.equal((await invoke('POST', 'alice', 'hi')).code, 200);
  assert.equal((await invoke('POST', 'alice', 'hi')).code, 429); assert.equal(calls, 3);
  const failed = createTtsHandler({ auth, env: { ELEVENLABS_API_KEY: 'secret' }, fetchAudio: async () => { throw new Error('secret provider internals'); } });
  const result = await invoke('POST', 'bob', 'hi', failed);
  assert.equal(result.code, 502); assert.equal(JSON.stringify(result.body).includes('secret'), false);
});

test('LiveKit returns a signed JWT tied to the verified UID, ignoring participantName', async () => {
  const local = createVoiceServer({ auth, env: { LIVEKIT_API_KEY: 'test-key',
    LIVEKIT_API_SECRET: 'test-secret-which-is-at-least-thirty-two-characters', LIVEKIT_URL: 'wss://example.invalid' } });
  local.server.listen(0, '127.0.0.1'); await once(local.server, 'listening');
  const url = 'http://127.0.0.1:' + local.server.address().port;
  const socket = client(url, { auth: { token: 'alice' }, transports: ['websocket'], reconnection: false });
  try {
    await event(socket, 'connect'); await join(socket);
    const response = await fetch(url + '/api/livekit-token?participantName=forged-owner', { headers: { Authorization: 'Bearer alice' } });
    const body = await response.json(); assert.equal(response.status, 200);
    assert.equal(typeof body.token, 'string');
    const payload = JSON.parse(Buffer.from(body.token.split('.')[1], 'base64url').toString());
    assert.equal(payload.sub, 'alice'); assert.equal(payload.video.roomJoin, true);
    assert.ok(payload.exp - Math.floor(Date.now()/1000) <= 600);
    const { TokenVerifier } = require('livekit-server-sdk');
    const verified = await new TokenVerifier('test-key', 'test-secret-which-is-at-least-thirty-two-characters').verify(body.token);
    assert.equal(verified.sub, 'alice');
  } finally { socket.disconnect(); await new Promise(resolve => local.io.close(resolve)); }
});
test('expired socket sessions are disconnected even without further events', async () => {
  tokens.set('short', claims('short', { exp: Date.now()/1000 + 0.2 }));
  const socket = await connect('short'); const disconnected = event(socket, 'disconnect');
  await join(socket); await disconnected;
  tokens.delete('short');
});
test('channel capacity is enforced and joining twice does not create extra users', async () => {
  const connected = [];
  try {
    for (let i=0;i<5;i++) {
      tokens.set('capacity'+i, claims('capacity'+i));
      const socket = await connect('capacity'+i); connected.push(socket);
      if (i<4) await join(socket); else {
        const rejected = event(socket, 'join_error'); socket.emit('join_channel', { displayName: 'Fifth' });
        assert.match((await rejected).message, /lleno/);
      }
    }
    connected[0].emit('join_channel', { displayName: 'Again' }); await delay(30);
    assert.equal((await (await request('/health')).json()).users, 4);
  } finally { connected.forEach(s => s.disconnect()); for (let i=0;i<5;i++) tokens.delete('capacity'+i); await delay(30); }
});

test('untrusted profile text and image attributes cannot inject HTML or script URLs', () => {
  const safe = require('../../assets/js/safe-html');
  assert.equal(safe.text('<img src=x onerror="attack()">'), '&lt;img src=x onerror=&quot;attack()&quot;&gt;');
  assert.equal(safe.image('javascript:alert(1)'), '');
  assert.equal(safe.image('data:image/svg+xml;base64,PHN2Zz4='), '');
  assert.equal(safe.image('https://user:pass@example.com/x'), '');
  assert.equal(safe.image('data:image/png;base64,AAAA'), 'data:image/png;base64,AAAA');
  assert.equal(safe.text("O'Connor"), 'O&#39;Connor');
});

test('local Google test server serves the app while keeping credentials and source private', async () => {
  const { createDevServer } = require('../../scripts/dev-voice');
  const local = createDevServer({ auth });
  local.server.listen(0, '127.0.0.1'); await once(local.server, 'listening');
  const url = 'http://127.0.0.1:' + local.server.address().port;
  try {
    assert.equal((await fetch(url + '/?dev=1')).status, 200);
    assert.equal((await fetch(url + '/admin/')).status, 200);
    assert.equal((await fetch(url + '/admin/assets/js/firebase-voice-transport.js')).status, 200);
    assert.equal((await fetch(url + '/assets/js/voice-channel-widget.js')).status, 200);
    for (const route of ['/.env', '/.aws/credentials', '/.git/config', '/signaling-server/server.js', '/main.js', '/index.backup.html']) {
      assert.equal((await fetch(url + route)).status, 404);
    }
    assert.equal((await fetch(url + '/api/status')).status, 401);
  } finally { await new Promise(resolve => local.io.close(resolve)); }
});

test('TURN credentials require Google identity and are temporary HMAC credentials', async () => {
  const { createIceHandler } = require('../../api/voice-ice');
  const { createHmac } = require('node:crypto');
  const handler = createIceHandler({ auth, env: { TURN_URLS: 'turn:relay.example.com:3478?transport=udp', TURN_SHARED_SECRET: 'private-test-secret' }, now: () => 1000000 });
  const response = () => ({ setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; } });
  const anonymous = response(); await handler({ method: 'GET', headers: {} }, anonymous); assert.equal(anonymous.code, 401);
  const valid = response(); await handler({ method: 'GET', headers: { authorization: 'Bearer alice' } }, valid);
  assert.equal(valid.code, 200); assert.equal(valid.body.expiresAt, 4600);
  assert.equal(valid.body.iceServers[0].username, '4600:alice');
  assert.equal(valid.body.iceServers[0].credential, createHmac('sha1', 'private-test-secret').update('4600:alice').digest('base64'));
  assert.equal(JSON.stringify(valid.body).includes('private-test-secret'), false);
});
test('optional Spotify search authenticates requests and returns only YouTube links', async () => {
  const { createMusicSearchHandler } = require('../../api/music-search');
  let calls = 0;
  const handler = createMusicSearchHandler({ auth, search: async () => { calls++; return { videos: [{ url: 'https://www.youtube.com/watch?v=abcdefghijk', title: 'Found' }] }; } });
  const response = () => ({ setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; } });
  const guest = response(); await handler({ method: 'POST', headers: {}, body: { query: 'Song' } }, guest); assert.equal(guest.code, 401); assert.equal(calls, 0);
  const valid = response(); await handler({ method: 'POST', headers: { authorization: 'Bearer alice' }, body: { query: 'Song' } }, valid);
  assert.equal(valid.code, 200); assert.equal(valid.body.type, 'youtube'); assert.equal(calls, 1);
});


test('the separate admin deployment includes the same shared voice and escaping helpers', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  for (const file of ['safe-html.js', 'firebase-voice-transport.js']) {
    const shared = fs.readFileSync(path.join(__dirname, '../../assets/js', file), 'utf8');
    const admin = fs.readFileSync(path.join(__dirname, '../../admin/assets/js', file), 'utf8');
    assert.equal(admin, shared);
  }
});

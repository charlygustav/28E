'use strict';
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const sdk = require('firebase/database');
const { create, reduceMusic, ROOM, subscribeAdmin } = require('../../assets/js/firebase-voice-transport');
let env;
const clients = [];
const google = { firebase: { sign_in_provider: 'google.com' }, email_verified: true };
const dbFor = (uid, claims = google) => env.authenticatedContext(uid, claims).database();
const ref = (db, path = '') => sdk.ref(db, ROOM + (path ? '/' + path : ''));
const member = (uid, id = uid + ':-session-long-enough-' + uid) => ({ id, uid, displayName: uid, photoURL: '', muted: false, dnd: false, camEnabled: false, joinedAt: sdk.serverTimestamp() });
async function seed(uid, slot) { const db = dbFor(uid); await sdk.set(ref(db, 'members/' + slot), member(uid)); return db; }
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function until(predicate, timeout = 6000) { const start = Date.now(); return new Promise((resolve, reject) => { const tick = () => { if (predicate()) resolve(); else if (Date.now() - start > timeout) reject(new Error('Condition timed out')); else setTimeout(tick, 20); }; tick(); }); }
async function connect(uid, name = uid) {
  const db = dbFor(uid); const socket = create({ db, sdk, user: { uid, photoURL: '' } }); clients.push(socket);
  let joined, failure; socket.on('connect', () => socket.emit('join_channel', { displayName: name }));
  socket.on('joined', data => joined = data); socket.on('join_error', error => failure = error); socket.on('connect_error', error => failure = error);
  socket.connect(); await until(() => joined || failure); if (failure) throw new Error(failure.message);
  return { db, socket, joined };
}
before(async () => {
  const [host, port] = (process.env.FIREBASE_DATABASE_EMULATOR_HOST || '127.0.0.1:9000').split(':');
  env = await initializeTestEnvironment({ projectId: 'demo-28e', database: { host, port: Number(port), rules: fs.readFileSync('../firebase/database.rules.json', 'utf8') } });
});
beforeEach(async () => { await Promise.all(clients.splice(0).map(socket => socket.close())); await env.clearDatabase(); });
after(async () => { await Promise.all(clients.splice(0).map(socket => socket.close())); await env.cleanup(); });

test('Google sessions alone may claim slots; anonymous and password sessions are rejected', async () => {
  await assertFails(sdk.set(ref(env.unauthenticatedContext().database(), 'members/0'), member('x')));
  await assertFails(sdk.set(ref(dbFor('x', { firebase: { sign_in_provider: 'password' } }), 'members/0'), member('x')));
  await assertSucceeds(sdk.set(ref(dbFor('alice'), 'members/0'), member('alice')));
  await assertFails(sdk.set(ref(dbFor('mallory'), 'members/1'), member('alice')));
  await assertFails(sdk.set(ref(dbFor('mallory'), 'members/4'), member('mallory')));
});
test('a member cannot overwrite or remove another account, even using its session ID', async () => {
  const alice = await seed('alice', 0); const bob = dbFor('bob');
  await assertFails(sdk.remove(ref(bob, 'members/0')));
  await assertFails(sdk.update(ref(bob, 'members/0'), { muted: true }));
  await assertFails(sdk.update(ref(alice, 'members/0'), { id: 'forged-identity-long-enough' }));
  await assertSucceeds(sdk.update(ref(alice, 'members/0'), { muted: true }));
});
test('private chat, music and signal inboxes reject outsiders', async () => {
  const alice = await seed('alice', 0), bob = dbFor('bob');
  await assertFails(sdk.get(ref(bob, 'chat'))); await assertFails(sdk.get(ref(bob, 'music')));
  await assertFails(sdk.get(ref(bob, 'signals/alice:-session-long-enough-alice')));
  await assertSucceeds(sdk.get(ref(alice, 'chat')));
});
test('signaling is addressed to a real participant and bound to the sender identity', async () => {
  const alice = await seed('alice', 0); await seed('bob', 1);
  const packet = { from: 'alice:-session-long-enough-alice', uid: 'alice', kind: 'webrtc_offer', payload: '{"sdp":{"type":"offer","sdp":"test"}}', createdAt: sdk.serverTimestamp() };
  await sdk.set(ref(alice, 'signalCounters/bob:-session-long-enough-bob'), 1);
  await assertSucceeds(sdk.set(ref(alice, 'signals/bob:-session-long-enough-bob/1'), { ...packet, seq: 1 }));
  await assertFails(sdk.set(ref(alice, 'signals/bob:-session-long-enough-bob/2'), { ...packet, seq: 2, from: 'bob:-session-long-enough-bob' }));
  await assertFails(sdk.set(ref(alice, 'signals/nonexistent/1'), packet));
  await assertFails(sdk.get(ref(alice, 'signals/bob:-session-long-enough-bob')));
});
test('chat rejects forged authors, oversized messages and edits', async () => {
  const alice = await seed('alice', 0);
  const message = { uid: 'alice', from: 'alice:-session-long-enough-alice', name: 'Alice', text: 'Hello', seq: 1, ts: sdk.serverTimestamp() };
  await sdk.set(ref(alice, 'chatCounter'), 1);
  await assertSucceeds(sdk.set(ref(alice, 'chat/1'), message));
  await assertFails(sdk.set(ref(alice, 'chat/2'), { ...message, uid: 'bob' }));
  await assertFails(sdk.set(ref(alice, 'chat/3'), { ...message, text: 'x'.repeat(501) }));
  await assertFails(sdk.update(ref(alice, 'chat/1'), { text: 'Changed' }));
});
test('transport joins, exchanges SDP, syncs chat and releases presence', async () => {
  const a = await connect('alice'), b = await connect('bob'); let offer, chat;
  b.socket.on('webrtc_offer', value => offer = value); b.socket.on('chat_message', value => chat = value);
  await until(() => a.socket.members.length === 2);
  a.socket.emit('webrtc_offer', { to: b.socket.id, sdp: { type: 'offer', sdp: 'test' } });
  a.socket.emit('chat_message', { text: 'Hello Bob' });
  await until(() => offer && chat); assert.equal(offer.from, a.socket.id); assert.equal(chat.text, 'Hello Bob');
  await a.socket.close(); await until(() => b.socket.members.length === 1);
  assert.equal((await sdk.get(ref(b.db, 'members'))).size, 1);
});
test('five concurrent joins admit exactly four participants', async () => {
  const results = await Promise.allSettled(Array.from({ length: 5 }, (_, i) => connect('person' + i)));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 4);
  assert.equal(results.filter(result => result.status === 'rejected').length, 1);
});
test('music transactions synchronize and duplicate track-ended reports skip only once', async () => {
  const a = await connect('alice'), b = await connect('bob');
  a.socket.emit('music_add', { title: 'One', url: 'https://example.com/one.mp3', type: 'spotlight' });
  await until(() => b.socket.music.queue.length === 1);
  a.socket.emit('music_add', { title: 'Two', url: 'https://example.com/two.mp3', type: 'spotlight' });
  await until(() => b.socket.music.queue.length === 2);
  const state = b.socket.music;
  const ended = { trackId: state.queue[state.state.currentIndex].id, startedAt: state.state.startedAt };
  a.socket.emit('music_ended', ended); b.socket.emit('music_ended', ended);
  await until(() => a.socket.music.queue.length === 1 && b.socket.music.queue.length === 1);
  await sleep(100); assert.equal(a.socket.music.queue[0].title, 'Two');
});
test('admin receives live status and kicks a member; ordinary users cannot kick peers', async () => {
  const a = await connect('alice'), b = await connect('bob'); let data, kicked = false;
  const admin = dbFor('owner', { ...google, email: 'theginnomar.x@gmail.com' });
  const source = subscribeAdmin({ db: admin, sdk, onData: state => data = state, onError: error => { throw error; } });
  a.socket.on('kicked', () => kicked = true);
  await until(() => data?.users.length === 2);
  await assertFails(sdk.remove(ref(b.db, 'members/' + a.socket.slot)));
  await source.kick(a.socket.id);
  try { await until(() => kicked && data.users.length === 1); }
  catch (error) { throw new Error(JSON.stringify({ kicked, users: data.users, a: { closed: a.socket.closed, joined: a.socket.joined, failing: a.socket.failing, members: a.socket.members }, b: { closed: b.socket.closed } })); }
  finally { source.stop(); }
});
test('music reducer rejects script URLs and malformed seeks', () => {
  const m = member('alice');
  assert.throws(() => reduceMusic(null, 'music_add', { url: 'javascript:alert(1)', title: 'X', type: 'audio' }, m, Date.now(), 'id'));
  assert.equal(reduceMusic(null, 'music_seek', { time: -1 }, m, Date.now(), 'id'), undefined);
});

test('root is private, public content stays readable and settings require the owner', async () => {
  const anonymous = env.unauthenticatedContext().database();
  await assertFails(sdk.get(sdk.ref(anonymous)));
  await assertFails(sdk.set(sdk.ref(anonymous, 'config/mantenimiento'), false));
  await assertSucceeds(sdk.get(sdk.ref(anonymous, 'config')));
  const bob = dbFor('bob');
  await assertFails(sdk.set(sdk.ref(bob, 'radio_state/current'), { src: 'https://evil.example/song' }));
  await assertFails(sdk.get(sdk.ref(bob, 'ips')));
  const owner = dbFor('owner', { ...google, email: 'theginnomar.x@gmail.com' });
  await assertSucceeds(sdk.set(sdk.ref(owner, 'config/heroBadge'), 'Test'));
  await assertSucceeds(sdk.set(sdk.ref(owner, 'radio_state/current'), { src: 'https://example.com/song' }));
});
test('chat retention stays at 100 records and delivers ring replacements', async () => {
  const a = await connect('alice'), b = await connect('bob'); let last;
  b.socket.on('chat_message', value => last = value);
  for (let i = 1; i <= 105; i++) {
    a.socket.emit('chat_message', { text: 'Message ' + i }); await a.socket.writes;
  }
  await until(() => last?.text === 'Message 105');
  const snapshot = await sdk.get(ref(a.db, 'chat'));
  assert.equal(snapshot.size, 100);
});
test('a dropped connection cleans presence and reconnects with a fresh session', async () => {
  const a = await connect('alice'), b = await connect('bob');
  const original = a.socket.id;
  sdk.goOffline(a.db);
  await until(() => b.socket.members.length === 1);
  sdk.goOnline(a.db);
  await until(() => a.socket.id !== original && a.socket.joined && b.socket.members.length === 2);
});
test('Google session alone cannot bypass chat capacity or send music as an outsider', async () => {
  const alice = await seed('alice', 0);
  await sdk.set(ref(alice, 'chatCounter'), 1);
  await assertFails(sdk.set(ref(alice, 'chat/100'), { seq: 1, uid: 'alice', from: 'alice:-session-long-enough-alice', name: 'Alice', text: 'Hi', ts: sdk.serverTimestamp() }));
  const value = reduceMusic(null, 'music_add', { url: 'https://example.com/one.mp3', title: 'One', type: 'spotlight' }, member('alice'), Date.now(), 'test');
  await assertFails(sdk.set(ref(dbFor('mallory'), 'music'), value));
});

test('signaling payload cannot override the sender checked by Firebase rules', async () => {
  const a = await connect('alice'), b = await connect('bob'); let offer;
  b.socket.on('webrtc_offer', value => offer = value);
  const counter = await sdk.runTransaction(ref(a.db, 'signalCounters/' + b.socket.id), value => (value || 0) + 1);
  const seq = counter.snapshot.val();
  await sdk.set(ref(a.db, 'signals/' + b.socket.id + '/' + (seq % 128)), { seq, uid: 'alice', from: a.socket.id,
    kind: 'webrtc_offer', payload: JSON.stringify({ from: 'forged-owner', sdp: { type: 'offer', sdp: 'test' } }), createdAt: sdk.serverTimestamp() });
  await until(() => offer); assert.equal(offer.from, a.socket.id);
  await assertFails(sdk.set(ref(a.db, 'members/2'), { ...member('alice'), id: b.socket.id }));
});

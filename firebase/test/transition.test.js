'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { ref, set, get, serverTimestamp } = require('firebase/database');
let env;
const rules = fs.readFileSync('database.voice-transition.rules.json', 'utf8');
before(async () => {
  const [host, port] = process.env.FIREBASE_DATABASE_EMULATOR_HOST.split(':');
  env = await initializeTestEnvironment({ projectId: 'demo-28e-transition', database: { host, port: Number(port), rules } });
  await env.clearDatabase();
});
after(async () => { await env.cleanup(); });
test('transition uses the same voice security policy as the final hardened rules', () => {
  assert.deepEqual(JSON.parse(rules).rules.voiceRooms, JSON.parse(fs.readFileSync('database.rules.json', 'utf8')).rules.voiceRooms);
});
test('existing anonymous radio/news publishers keep their current per-path access', async () => {
  const db = env.unauthenticatedContext().database();
  await assertSucceeds(set(ref(db, 'radio_state/news'), { items: [{ title: 'Test headline' }], updatedAt: 1 }));
  await assertSucceeds(set(ref(db, 'radio_state/current'), { title: 'Test track', startTime: 1 }));
  assert.equal((await assertSucceeds(get(ref(db, 'radio_state/news/items/0/title')))).val(), 'Test headline');
});
test('legacy wildcard grants no anonymous read or write access to voice', async () => {
  const db = env.unauthenticatedContext().database();
  await assertFails(get(ref(db)));
  await assertFails(get(ref(db, 'voiceRooms')));
  await assertFails(get(ref(db, 'voiceRooms/principal/members')));
  await assertFails(set(ref(db, 'voiceRooms/principal/members/0'), { uid: 'attacker' }));
  await assertFails(set(ref(db, 'voiceRooms/other'), { data: 'unsafe' }));
});
test('Google can join; legacy access cannot be used to impersonate that member', async () => {
  const alice = env.authenticatedContext('alice', { firebase: { sign_in_provider: 'google.com' } }).database();
  const member = { id: 'alice:-session-long-enough-alice', uid: 'alice', displayName: 'Alice', photoURL: '', muted: false, dnd: false, camEnabled: false, joinedAt: serverTimestamp() };
  await assertSucceeds(set(ref(alice, 'voiceRooms/principal/members/0'), member));
  const anonymous = env.unauthenticatedContext().database();
  await assertFails(set(ref(anonymous, 'voiceRooms/principal/members/0/muted'), true));
  await assertFails(get(ref(anonymous, 'voiceRooms/principal/chat')));
  const bob = env.authenticatedContext('bob', { firebase: { sign_in_provider: 'google.com' } }).database();
  await assertFails(set(ref(bob, 'voiceRooms/principal/members/0'), { ...member, muted: true }));
});

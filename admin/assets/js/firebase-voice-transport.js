(function (root) {
  'use strict';
  const ROOM = 'voiceRooms/principal';
  const emptyMusic = () => ({ queue: [], state: { currentIndex: -1, isPlaying: false, startedAt: 0, pausedTime: 0 } });
  const normalizeMusic = value => ({ ...emptyMusic(), ...value, queue: Array.isArray(value?.queue) ? value.queue.filter(Boolean) : Object.values(value?.queue || {}), state: { ...emptyMusic().state, ...value?.state } });
  function mediaUrl(value) {
    if (typeof value !== 'string' || value.length > 2048) return '';
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
  }
  function reduceMusic(value, event, payload, member, now, revision) {
    const music = normalizeMusic(value), queue = music.queue.map(track => ({ ...track })), state = { ...music.state };
    const start = index => Object.assign(state, { currentIndex: index, isPlaying: index >= 0, startedAt: now, pausedTime: 0 });
    if (event === 'music_add') {
      if (queue.length >= 100 || !mediaUrl(payload.url) || !['youtube', 'spotlight', 'audio'].includes(payload.type) || typeof payload.title !== 'string' || payload.title.length > 300) throw new Error('Usa una canción de Spotlight o un enlace de YouTube válido.');
      const track = { id: revision, url: mediaUrl(payload.url), title: payload.title, type: payload.type,
        artist: String(payload.artist || '').slice(0, 300), cover: mediaUrl(payload.cover), addedBy: member.id, addedByName: member.displayName };
      if (payload.playNow && state.isPlaying && state.currentIndex >= 0) {
        queue.splice(state.currentIndex + 1, 0, track); start(state.currentIndex + 1);
      } else { queue.push(track); if (payload.playNow || state.currentIndex < 0 || !state.isPlaying) start(queue.length - 1); }
    } else if (event === 'music_clear') { queue.length = 0; start(-1);
    } else if (event === 'music_play_index') {
      if (!Number.isInteger(payload.index) || !queue[payload.index]) return undefined; start(payload.index);
    } else if (event === 'music_remove') {
      const index = queue.findIndex(track => track.id === payload.trackId); if (index < 0) return undefined;
      queue.splice(index, 1);
      if (!queue.length) start(-1); else if (index < state.currentIndex) state.currentIndex--; else if (index === state.currentIndex) start(Math.min(index, queue.length - 1));
    } else if (event === 'music_skip' || event === 'music_ended') {
      const track = queue[state.currentIndex]; if (!track) return undefined;
      if (event === 'music_ended' && (payload.trackId !== track.id || payload.startedAt !== state.startedAt)) return undefined;
      queue.splice(state.currentIndex, 1); start(queue.length ? Math.min(state.currentIndex, queue.length - 1) : -1);
    } else if (event === 'music_pause' || event === 'music_seek') {
      const time = event === 'music_seek' ? payload.time : payload.currentTime;
      if (!queue[state.currentIndex] || !Number.isFinite(time) || time < 0 || time > 86400) return undefined;
      state.pausedTime = time; state.startedAt = now - time * 1000;
      if (event === 'music_pause') state.isPlaying = false;
    } else if (event === 'music_resume') {
      if (!queue[state.currentIndex] || state.isPlaying) return undefined;
      state.isPlaying = true; state.startedAt = now - state.pausedTime * 1000;
    } else return undefined;
    return { queue, state, action: event, revision };
  }

  class FirebaseVoiceTransport {
    constructor({ db, sdk, user }) {
      this.db = db; this.sdk = sdk; this.user = user; this.handlers = new Map();
      this.stops = []; this.memberStops = []; this.closed = false; this.connected = false;
      this.members = []; this.offset = 0; this.music = emptyMusic(); this.events = new Map();
      this.joining = false; this.slot = null; this.id = null; this.joined = false;
      this.writes = Promise.resolve();
    }
    on(event, callback) { if (!this.handlers.has(event)) this.handlers.set(event, new Set()); this.handlers.get(event).add(callback); return this; }
    off(event, callback) { this.handlers.get(event)?.delete(callback); return this; }
    once(event, callback) { const once = data => { this.off(event, once); callback(data); }; return this.on(event, once); }
    removeAllListeners() { this.handlers.clear(); return this; }
    deliver(event, payload) {
      if (this.closed && event !== 'disconnect') return;
      for (const callback of [...(this.handlers.get(event) || [])]) {
        try { Promise.resolve(callback(payload)).catch(error => console.warn('[VC]', event, error.message)); }
        catch (error) { console.warn('[VC]', event, error.message); }
      }
    }
    ref(path = '') { return this.sdk.ref(this.db, ROOM + (path ? '/' + path : '')); }
    now() { return Date.now() + this.offset; }
    connect() {
      if (this.started || this.closed) return this; this.started = true;
      this.stops.push(this.sdk.onValue(this.sdk.ref(this.db, '.info/serverTimeOffset'), snap => { this.offset = snap.val() || 0; }));
      this.stops.push(this.sdk.onValue(this.sdk.ref(this.db, '.info/connected'), snap => {
        const online = snap.val() === true;
        if (online && !this.connected) {
          this.connected = true; this.deliver('connect');
        } else if (!online && this.connected) {
          this.connected = false; this.joined = false; this.slot = null;
          this.memberStops.splice(0).forEach(stop => stop()); this.musicLoaded = false;
          this.deliver('disconnect', 'transport close');
        }
      }, error => this.fail(error)));
      return this;
    }
    emit(event, payload = {}) {
      if (this.closed) return this;
      if (event === 'join_channel') { this.join(payload).catch(error => this.fail(error, 'join_error')); return this; }
      if (event === 'leave_channel') { this.close(); return this; }
      if (event === 'refresh_auth') return this; // Firebase SDK refreshes its own identity.
      this.writes = this.writes.then(() => this.send(event, payload)).catch(error => {
        this.deliver('operation_error', { message: error.code === 'PERMISSION_DENIED' ? 'No tienes permisos para esta acción.' : error.message });
      });
      return this;
    }
    async join({ displayName, photoURL } = {}) {
      if (this.joining || this.joined || this.closed) return;
      if (!this.user || typeof displayName !== 'string' || !displayName.trim() || displayName.length > 80) throw new Error('Inicia sesión con Google y escribe un nombre válido.');
      this.joining = true;
      try {
        const id = this.user.uid + ':' + this.sdk.push(this.ref('sessions')).key;
        const member = { id, uid: this.user.uid, displayName: displayName.trim(), photoURL: mediaUrl(photoURL || this.user.photoURL), muted: false, dnd: false, camEnabled: false, joinedAt: this.sdk.serverTimestamp() };
        for (let slot = 0; slot < 4; slot++) {
          if (this.closed) return;
          const target = this.ref('members/' + slot);
          // Register cleanup before exposing presence; transactions prevent claiming an occupied slot.
          if ((await this.sdk.get(target)).exists()) continue;
          const cleanup = this.sdk.onDisconnect(target);
          let result;
          try {
            await cleanup.remove();
            result = await this.sdk.runTransaction(target, current => current ? undefined : member, { applyLocally: false });
          } catch (error) {
            await cleanup.cancel().catch(() => {});
            // Another account can claim the slot between the read and cleanup registration.
            if (/permission|denied/i.test(String(error.code) + ' ' + error.message)) continue;
            throw error;
          }
          if (!result.committed) { await cleanup.cancel(); continue; }
          this.slot = slot; this.id = id; this.member = { ...member, joinedAt: result.snapshot.val().joinedAt };
          this.disconnectAction = this.sdk.onDisconnect(this.ref());
          await this.disconnectAction.update({ ['members/' + slot]: null, ['signals/' + id]: null, ['signalCounters/' + id]: null, ['events/' + id]: null });
          if (this.closed) { await this.release(); return; }
          this.joined = true;
          const snapshot = await this.sdk.get(this.ref('members'));
          this.members = listMembers(snapshot.val());
          this.deliver('joined', { userId: id, existingUsers: this.members.filter(value => value.id !== id) });
          this.deliver('channel_users', { users: this.members });
          this.listen();
          return;
        }
        throw new Error('Canal lleno (máx. 4 usuarios).');
      } finally { this.joining = false; }
    }
    listen() {
      const listen = (path, callback) => this.memberStops.push(this.sdk.onValue(this.ref(path), callback, error => this.fail(error)));
      listen('members', snap => {
        const previous = this.members, next = listMembers(snap.val());
        if (!next.some(member => member.id === this.id)) { this.deliver('kicked'); this.close(); return; }
        this.members = next;
        for (const member of next) {
          const old = previous.find(value => value.id === member.id);
          if (!old) this.deliver('user_joined', { userId: member.id, ...member });
          for (const [field, event] of [['muted', 'user_mute_state'], ['dnd', 'user_dnd_state'], ['camEnabled', 'user_cam_state']]) {
            if (old && old[field] !== member[field]) this.deliver(event, { userId: member.id, [field]: member[field] });
          }
        }
        for (const old of previous) if (!next.some(member => member.id === old.id)) this.deliver('user_left', { userId: old.id });
        this.deliver('channel_users', { users: next });
      });
      const inbox = this.sdk.query(this.ref('signals/' + this.id), this.sdk.orderByKey(), this.sdk.limitToLast(128));
      const seenSignals = new Set();
      const receiveSignal = snap => {
        const packet = snap.val();
        try {
          if (packet && !seenSignals.has(packet.seq) && this.now() - packet.createdAt < 60000 && ['webrtc_offer', 'webrtc_answer', 'ice_candidate'].includes(packet.kind)) {
            seenSignals.add(packet.seq);
            if (seenSignals.size > 256) seenSignals.delete(seenSignals.values().next().value);
            const value = JSON.parse(packet.payload);
            const content = packet.kind === 'ice_candidate' ? { candidate: value.candidate } : { sdp: value.sdp };
            this.deliver(packet.kind, { ...content, from: packet.from });
          }
        } catch { /* Ignore malformed or stale signaling packets. */ }
        this.sdk.runTransaction(snap.ref, value => value?.seq === packet?.seq ? null : undefined, { applyLocally: false }).catch(() => {});
      };
      this.memberStops.push(this.sdk.onChildAdded(inbox, receiveSignal, error => this.fail(error)));
      this.memberStops.push(this.sdk.onChildChanged(inbox, receiveSignal, error => this.fail(error)));
      listen('events', snap => {
        for (const [from, value] of Object.entries(snap.val() || {})) {
          if (from === this.id || !this.members.some(member => member.id === from)) continue;
          const previous = this.events.get(from) || {};
          const name = this.members.find(member => member.id === from)?.displayName || 'Usuario';
          if (value.speaking !== previous.speaking) this.deliver('speaking_state', { from, speaking: !!value.speaking });
          if (value.typing !== previous.typing) this.deliver('chat_typing', { from, name, isTyping: !!value.typing });
          if (value.ringAt !== previous.ringAt && this.now() - value.ringAt < 10000) this.deliver('incoming_ring', { from, name });
          this.events.set(from, value);
        }
      });
      const chat = this.sdk.query(this.ref('chat'), this.sdk.orderByChild('ts'), this.sdk.limitToLast(50));
      const seenChat = new Set();
      const receiveChat = snap => {
        const message = snap.val();
        if (!message || seenChat.has(message.seq)) return;
        seenChat.add(message.seq); if (seenChat.size > 200) seenChat.delete(seenChat.values().next().value);
        this.deliver('chat_message', message);
      };
      this.memberStops.push(this.sdk.onChildAdded(chat, receiveChat, error => this.fail(error)));
      this.memberStops.push(this.sdk.onChildChanged(chat, receiveChat, error => this.fail(error)));
      listen('music', snap => {
        const initial = !this.musicLoaded; this.musicLoaded = true;
        const previous = normalizeMusic(this.music), music = normalizeMusic(snap.val()); this.music = music;
        const track = music.queue[music.state.currentIndex], oldTrack = previous.queue[previous.state.currentIndex];
        this.deliver('music_queue_update', { queue: music.queue, state: music.state });
        if (initial) return;
        if (!track && oldTrack) this.deliver('music_stop', {});
        else if (track && track.id !== oldTrack?.id) {
          if (music.state.isPlaying) this.deliver('music_play', { track, state: music.state });
          else this.deliver('music_state_update', { state: music.state });
        }
        else if (track && music.revision !== previous.revision) {
          if (music.action === 'music_seek') this.deliver('music_seek', { time: music.state.pausedTime });
          else this.deliver('music_state_update', { state: music.state });
        }
      });
    }
    async send(event, payload) {
      if (!this.joined || this.closed || !this.connected) return;
      if (['webrtc_offer', 'webrtc_answer', 'ice_candidate'].includes(event)) {
        if (!this.members.some(member => member.id === payload.to) || payload.to === this.id) return;
        const content = event === 'ice_candidate' ? { candidate: payload.candidate } : { sdp: payload.sdp };
        const serialized = JSON.stringify(content); if (serialized.length > 32768) throw new Error('Señal demasiado grande.');
        const counter = await this.sdk.runTransaction(this.ref('signalCounters/' + payload.to), value => (value || 0) + 1, { applyLocally: false });
        const seq = counter.snapshot.val();
        await this.sdk.set(this.ref('signals/' + payload.to + '/' + (seq % 128)), { seq, from: this.id, uid: this.user.uid, kind: event, payload: serialized, createdAt: this.sdk.serverTimestamp() });
      } else if (['mute_state', 'dnd_state', 'cam_state'].includes(event)) {
        const field = { mute_state: 'muted', dnd_state: 'dnd', cam_state: 'camEnabled' }[event];
        if (typeof payload[field] === 'boolean') await this.sdk.update(this.ref('members/' + this.slot), { [field]: payload[field] });
      } else if (['speaking_state', 'chat_typing', 'ring_channel'].includes(event)) {
        const field = { speaking_state: 'speaking', chat_typing: 'typing', ring_channel: 'ringAt' }[event];
        const value = event === 'ring_channel' ? this.sdk.serverTimestamp() : payload[event === 'chat_typing' ? 'isTyping' : 'speaking'];
        if (event === 'ring_channel' || typeof value === 'boolean') await this.sdk.update(this.ref('events/' + this.id), { [field]: value });
      } else if (event === 'chat_message') {
        if (typeof payload.text !== 'string' || !payload.text.trim()) return;
        const counter = await this.sdk.runTransaction(this.ref('chatCounter'), value => (value || 0) + 1, { applyLocally: false });
        const seq = counter.snapshot.val();
        await this.sdk.set(this.ref('chat/' + (seq % 100)), { seq, from: this.id, uid: this.user.uid, name: this.member.displayName, text: payload.text.trim().slice(0, 500), ts: this.sdk.serverTimestamp() });
      } else if (event === 'music_sync_request') {
        const music = normalizeMusic((await this.sdk.get(this.ref('music'))).val());
        const currentTrack = music.queue[music.state.currentIndex] || null;
        this.deliver('music_sync', { queue: music.queue, state: music.state, currentTrack,
          currentTime: music.state.isPlaying ? Math.max(0, (this.now() - music.state.startedAt) / 1000) : music.state.pausedTime });
      } else if (event.startsWith('music_')) {
        const revision = this.sdk.push(this.ref('musicRevisions')).key, now = this.now();
        await this.sdk.runTransaction(this.ref('music'), value => reduceMusic(value, event, payload, this.member, now, revision), { applyLocally: false });
      }
    }
    async fail(error, event = 'connect_error') {
      if (this.closed || this.failing) return;
      this.failing = true;
      // Firebase can revoke private subscriptions before publishing the member removal.
      // Treat revoked access as a terminated session; cached membership is not authoritative.
      if (this.joined && /permission|denied/i.test(String(error.code) + ' ' + error.message)) {
        this.deliver('kicked', { message: 'Tu acceso al canal terminó. Vuelve a entrar con Google.' });
        this.removeAllListeners(); this.close(); return;
      }
      this.deliver(event, event === 'join_error' ? { message: error.message } : new Error('No se pudo conectar a Firebase. Revisa la sesión y los permisos del canal.'));
      this.removeAllListeners(); this.close();
    }
    async release() {
      if (this.slot === null || !this.id) return;
      const updates = { ['members/' + this.slot]: null, ['signals/' + this.id]: null, ['signalCounters/' + this.id]: null, ['events/' + this.id]: null };
      await this.sdk.update(this.ref(), updates);
      await this.disconnectAction?.cancel(); this.slot = null;
    }
    async close() {
      if (this.closed) return this.closing;
      this.closed = true; this.joined = false; this.connected = false;
      this.stops.splice(0).forEach(stop => stop()); this.memberStops.splice(0).forEach(stop => stop());
      this.deliver('disconnect', 'io client disconnect');
      this.closing = this.release().catch(() => {}); return this.closing;
    }
    disconnect() { this.close(); return this; }
  }
  function listMembers(value) { return Object.entries(value || {}).filter(([, member]) => member?.id).map(([slot, member]) => ({ ...member, slot })); }
  function subscribeAdmin({ db, sdk, onData, onError }) {
    const state = { users: [], chatLog: [], max: 4, musicQueue: [], musicState: emptyMusic().state };
    const stops = [];
    for (const path of ['members', 'chat', 'music']) {
      const target = path === 'chat' ? sdk.query(sdk.ref(db, ROOM + '/chat'), sdk.orderByChild('ts'), sdk.limitToLast(50)) : sdk.ref(db, ROOM + '/' + path);
      stops.push(sdk.onValue(target, snap => {
        if (path === 'members') state.users = listMembers(snap.val());
        else if (path === 'chat') state.chatLog = Object.values(snap.val() || {}).sort((a, b) => a.ts - b.ts);
        else { const music = normalizeMusic(snap.val()); state.musicQueue = music.queue; state.musicState = music.state; }
        onData({ ...state });
      }, onError));
    }
    return { stop() { stops.forEach(stop => stop()); }, async kick(id) {
      const member = state.users.find(member => member.id === id); if (!member) throw new Error('Usuario no encontrado.');
      await sdk.update(sdk.ref(db, ROOM), { ['members/' + member.slot]: null, ['signals/' + id]: null, ['signalCounters/' + id]: null, ['events/' + id]: null }); return { success: true };
    } };
  }
  const api = { create: options => new FirebaseVoiceTransport(options), reduceMusic, normalizeMusic, listMembers, subscribeAdmin, ROOM };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.YaireFirebaseVoice = api;
})(typeof window !== 'undefined' ? window : globalThis);

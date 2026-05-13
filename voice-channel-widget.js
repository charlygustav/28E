/* =========================================================
   28E — Voice Channel Widget  (WebRTC Mesh + Socket.io)
   ========================================================= */
(function () {
  'use strict';

  // ── CONFIG (cambia SIGNALING_URL tras el deploy en Railway) ──────────────
  const SIGNALING_URL = 'https://28e-production.up.railway.app';

  // ── CSS ──────────────────────────────────────────────────────────────────
  const CSS = `
  #vc-fab {
    position:fixed; bottom:28px; right:28px; z-index:9999;
    width:52px; height:52px; border-radius:50%;
    background:#0d0d0d; border:1px solid rgba(255,255,255,0.08);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; box-shadow:0 4px 24px rgba(0,0,0,.7);
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), border-color .2s, box-shadow .2s;
  }
  #vc-fab:hover { transform:scale(1.12); border-color:rgba(245,158,11,.45); box-shadow:0 4px 28px rgba(245,158,11,.22); }
  #vc-fab.connected { background:rgba(245,158,11,.13); border-color:rgba(245,158,11,.5); animation:vc-pulse 2s infinite; }
  #vc-fab svg { width:22px; height:22px; color:#f59e0b; }
  @keyframes vc-pulse { 0%,100%{box-shadow:0 4px 24px rgba(245,158,11,.2)} 50%{box-shadow:0 4px 32px rgba(245,158,11,.45)} }

  #vc-panel {
    position:fixed; bottom:88px; right:28px; z-index:9998;
    width:298px; background:#0a0a0a;
    border:1px solid rgba(255,255,255,0.07); border-radius:16px;
    overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.85);
    font-family:'Inter',-apple-system,sans-serif;
    transform:scale(.85) translateY(12px); opacity:0; pointer-events:none;
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), opacity .2s;
  }
  #vc-panel.open { transform:scale(1) translateY(0); opacity:1; pointer-events:all; }

  .vc-hdr { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.05); }
  .vc-hdr-l { display:flex; align-items:center; gap:10px; }
  .vc-icon { width:34px; height:34px; border-radius:9px; background:rgba(245,158,11,.12); display:flex; align-items:center; justify-content:center; color:#f59e0b; }
  .vc-icon svg { width:17px; height:17px; }
  .vc-title { color:#fff; font-size:13.5px; font-weight:600; letter-spacing:-.2px; }
  .vc-sub { color:rgba(255,255,255,.3); font-size:11px; margin-top:1px; }
  .vc-x { background:none; border:none; color:rgba(255,255,255,.3); cursor:pointer; font-size:18px; line-height:1; padding:2px 6px; border-radius:5px; transition:color .15s, background .15s; }
  .vc-x:hover { color:#fff; background:rgba(255,255,255,.07); }

  .vc-body { padding:16px; }
  .vc-label { display:block; color:rgba(255,255,255,.35); font-size:10.5px; font-weight:600; letter-spacing:.6px; text-transform:uppercase; margin-bottom:5px; }
  .vc-field { margin-bottom:12px; }
  .vc-input {
    width:100%; box-sizing:border-box; background:#131313;
    border:1px solid rgba(255,255,255,.07); border-radius:8px;
    padding:9px 11px; color:#fff; font-size:13px; font-family:inherit;
    outline:none; transition:border-color .15s;
  }
  .vc-input:focus { border-color:rgba(245,158,11,.4); }
  .vc-input::placeholder { color:rgba(255,255,255,.18); }
  .vc-btn {
    width:100%; padding:11px; border:none; border-radius:9px;
    background:rgba(245,158,11,.9); color:#000; font-size:13px;
    font-weight:700; cursor:pointer; transition:background .15s, transform .15s;
  }
  .vc-btn:hover:not(:disabled) { background:#f59e0b; transform:translateY(-1px); }
  .vc-btn:disabled { opacity:.45; cursor:not-allowed; transform:none; }
  .vc-err { color:#ef4444; font-size:12px; text-align:center; margin-top:9px; min-height:16px; }

  .vc-loader { padding:24px; text-align:center; color:rgba(255,255,255,.35); font-size:13px; }
  .vc-spin { width:22px; height:22px; border:2px solid rgba(245,158,11,.2); border-top-color:#f59e0b; border-radius:50%; animation:vc-spin .75s linear infinite; margin:0 auto 10px; }
  @keyframes vc-spin { to{transform:rotate(360deg)} }

  .vc-sect { padding:4px 16px 12px; }
  .vc-sect-lbl { color:rgba(255,255,255,.22); font-size:10px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; margin-bottom:8px; }
  .vc-user { display:flex; align-items:center; gap:9px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,.04); }
  .vc-user:last-child { border-bottom:none; }
  .vc-av {
    width:30px; height:30px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:700;
    background:rgba(244,114,182,.12); border:1.5px solid rgba(244,114,182,.25); color:#f472b6;
    transition:border-color .2s, box-shadow .2s;
  }
  .vc-av.me { background:rgba(245,158,11,.12); border-color:rgba(245,158,11,.3); color:#f59e0b; }
  .vc-av.speaking { border-color:#22c55e; box-shadow:0 0 0 3px rgba(34,197,94,.25); }
  .vc-uname { flex:1; color:#fff; font-size:13px; font-weight:500; }
  .vc-uname .tag { color:rgba(255,255,255,.3); font-size:11px; font-weight:400; margin-left:4px; }
  .vc-mico svg { width:14px; height:14px; color:rgba(239,68,68,.75); }

  .vc-ctrls { display:flex; gap:7px; padding:12px 16px 15px; border-top:1px solid rgba(255,255,255,.05); }
  .vc-cb {
    flex:1; padding:9px 6px; border-radius:8px;
    border:1px solid rgba(255,255,255,.07); background:#131313;
    color:rgba(255,255,255,.65); font-size:12px; font-weight:500;
    cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;
    transition:background .15s, color .15s, border-color .15s;
  }
  .vc-cb:hover { background:#1a1a1a; color:#fff; }
  .vc-cb svg { width:14px; height:14px; }
  .vc-cb.muted { background:rgba(239,68,68,.1); border-color:rgba(239,68,68,.3); color:#ef4444; }
  .vc-cb.leave { background:rgba(239,68,68,.07); border-color:rgba(239,68,68,.2); color:rgba(239,68,68,.8); }
  .vc-cb.leave:hover { background:rgba(239,68,68,.18); color:#ef4444; }

  .vc-sbar { padding:7px 16px; background:rgba(34,197,94,.06); border-top:1px solid rgba(34,197,94,.1); display:flex; align-items:center; gap:6px; font-size:11px; color:rgba(34,197,94,.85); }
  .vc-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; animation:vc-blink 2s infinite; }
  @keyframes vc-blink { 0%,100%{opacity:1} 50%{opacity:.35} }

  .vc-empty { padding:16px; text-align:center; color:rgba(255,255,255,.2); font-size:12px; }
  `;

  // ── ICONS ─────────────────────────────────────────────────────────────────
  const ICONS = {
    mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    micOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 9.6a2 2 0 0 1 1-2.2 12.84 12.84 0 0 0 .7-2.81 2 2 0 0 1 2-1.72h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>`,
    sound: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  };

  // ── MAIN CLASS ────────────────────────────────────────────────────────────
  class VoiceChannel {
    constructor() {
      this.socket      = null;
      this.stream      = null;
      this.peers       = new Map();   // peerId -> RTCPeerConnection
      this.audios      = new Map();   // peerId -> <audio>
      this.pendingIce  = new Map();   // peerId -> ICECandidate[]
      this.myId        = null;
      this.myName      = '';
      this.muted       = false;
      this.connected   = false;
      this.users       = [];          // [{id, displayName, muted}]

      this.ice = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]
      };

      this._injectCSS();
      this._buildUI();
    }

    // ── CSS ────────────────────────────────────────────────────────────────
    _injectCSS() {
      if (document.getElementById('vc-styles')) return;
      const s = document.createElement('style');
      s.id = 'vc-styles';
      s.textContent = CSS;
      document.head.appendChild(s);
    }

    // ── BUILD UI ───────────────────────────────────────────────────────────
    _buildUI() {
      // FAB
      this.fab = document.createElement('div');
      this.fab.id = 'vc-fab';
      this.fab.title = 'Canal de Voz';
      this.fab.innerHTML = ICONS.mic;
      this.fab.addEventListener('click', () => this._toggle());

      // Panel
      this.panel = document.createElement('div');
      this.panel.id = 'vc-panel';
      this.panel.innerHTML = this._tplLogin();

      document.body.appendChild(this.fab);
      document.body.appendChild(this.panel);
    }

    _toggle() {
      this.panel.classList.toggle('open');
    }

    // ── TEMPLATES ──────────────────────────────────────────────────────────
    _tplLogin(err = '') {
      return `
        <div class="vc-hdr">
          <div class="vc-hdr-l">
            <div class="vc-icon">${ICONS.sound}</div>
            <div><div class="vc-title">#principal</div><div class="vc-sub">Canal de voz privado</div></div>
          </div>
          <button class="vc-x" id="vc-close">✕</button>
        </div>
        <div class="vc-body">
          <div class="vc-field">
            <label class="vc-label">Tu nombre</label>
            <input class="vc-input" id="vc-name" type="text" placeholder="Ej: Charles" maxlength="20" autocomplete="off"/>
          </div>
          <div class="vc-field">
            <label class="vc-label">Contraseña del canal</label>
            <input class="vc-input" id="vc-pass" type="password" placeholder="••••••••" autocomplete="off"/>
          </div>
          <button class="vc-btn" id="vc-join">🎙️ Unirse al canal</button>
          <div class="vc-err" id="vc-err">${err}</div>
        </div>`;
    }

    _tplLoading() {
      return `
        <div class="vc-hdr">
          <div class="vc-hdr-l">
            <div class="vc-icon">${ICONS.sound}</div>
            <div><div class="vc-title">#principal</div><div class="vc-sub">Conectando…</div></div>
          </div>
          <button class="vc-x" id="vc-close">✕</button>
        </div>
        <div class="vc-loader"><div class="vc-spin"></div>Estableciendo conexión…</div>`;
    }

    _tplConnected() {
      const userRows = this.users.map(u => {
        const isMe = u.id === this.myId;
        const initials = u.displayName.slice(0, 2).toUpperCase();
        const muteIcon = u.muted ? `<span class="vc-mico">${ICONS.micOff}</span>` : '';
        return `
          <div class="vc-user" id="vc-u-${u.id}">
            <div class="vc-av${isMe ? ' me' : ''}" id="vc-av-${u.id}">${initials}</div>
            <div class="vc-uname">${u.displayName}${isMe ? '<span class="tag">(tú)</span>' : ''}</div>
            ${muteIcon}
          </div>`;
      }).join('');

      return `
        <div class="vc-hdr">
          <div class="vc-hdr-l">
            <div class="vc-icon">${ICONS.sound}</div>
            <div><div class="vc-title">#principal</div><div class="vc-sub">${this.users.length}/4 usuarios</div></div>
          </div>
          <button class="vc-x" id="vc-close">✕</button>
        </div>
        <div class="vc-sect">
          <div class="vc-sect-lbl">En el canal</div>
          ${userRows || '<div class="vc-empty">Solo tú por ahora…</div>'}
        </div>
        <div class="vc-ctrls">
          <button class="vc-cb${this.muted ? ' muted' : ''}" id="vc-mute">
            ${this.muted ? ICONS.micOff : ICONS.mic}
            ${this.muted ? 'Silenciado' : 'Silenciar'}
          </button>
          <button class="vc-cb leave" id="vc-leave">${ICONS.phone} Salir</button>
        </div>
        <div class="vc-sbar"><div class="vc-dot"></div>Conectado · #principal</div>`;
    }

    // ── RENDER ─────────────────────────────────────────────────────────────
    _render(tpl) {
      this.panel.innerHTML = tpl;
      this._bindPanelEvents();
    }

    _bindPanelEvents() {
      // Close btn always present
      const xBtn = document.getElementById('vc-close');
      if (xBtn) xBtn.addEventListener('click', () => this._toggle());

      // Login view
      const joinBtn = document.getElementById('vc-join');
      if (joinBtn) {
        joinBtn.addEventListener('click', () => this._doJoin());
        document.getElementById('vc-pass')
          .addEventListener('keydown', e => e.key === 'Enter' && this._doJoin());
      }

      // Connected view
      const muteBtn  = document.getElementById('vc-mute');
      const leaveBtn = document.getElementById('vc-leave');
      if (muteBtn)  muteBtn.addEventListener('click',  () => this._toggleMute());
      if (leaveBtn) leaveBtn.addEventListener('click', () => this._leave());
    }

    // ── JOIN ───────────────────────────────────────────────────────────────
    async _doJoin() {
      const name = document.getElementById('vc-name').value.trim();
      const pass = document.getElementById('vc-pass').value;
      if (!name) return this._setErr('Escribe tu nombre.');
      if (!pass) return this._setErr('Escribe la contraseña.');

      this.myName = name;
      this._render(this._tplLoading());

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch {
        this._render(this._tplLogin('❌ No se pudo acceder al micrófono.'));
        return;
      }

      this._connectSocket(name, pass);
    }

    _setErr(msg) {
      const el = document.getElementById('vc-err');
      if (el) el.textContent = msg;
    }

    // ── SOCKET ─────────────────────────────────────────────────────────────
    _connectSocket(name, pass) {
      // Load socket.io client dynamically if not already present
      const doConnect = () => {
        this.socket = io(SIGNALING_URL, { transports: ['websocket'] });

        this.socket.on('connect', () => {
          this.socket.emit('join_channel', { password: pass, displayName: name });
        });

        this.socket.on('join_error', ({ message }) => {
          this._cleanup();
          this._render(this._tplLogin(message));
        });

        this.socket.on('joined', async ({ userId, existingUsers }) => {
          this.myId = userId;
          this.connected = true;
          this.fab.classList.add('connected');
          // Initiate offers to everyone already in the channel
          for (const u of existingUsers) {
            await this._createOffer(u.id);
          }
        });

        this.socket.on('channel_users', ({ users }) => {
          this.users = users;
          if (this.connected) this._render(this._tplConnected());
        });

        this.socket.on('user_joined', async ({ userId }) => {
          // They will send us an offer; nothing to do here
        });

        this.socket.on('user_left', ({ userId }) => {
          this._closePeer(userId);
        });

        this.socket.on('webrtc_offer', async ({ from, sdp }) => {
          await this._handleOffer(from, sdp);
        });

        this.socket.on('webrtc_answer', async ({ from, sdp }) => {
          const pc = this.peers.get(from);
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          this._flushIce(from);
        });

        this.socket.on('ice_candidate', async ({ from, candidate }) => {
          const pc = this.peers.get(from);
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
          } else {
            if (!this.pendingIce.has(from)) this.pendingIce.set(from, []);
            this.pendingIce.get(from).push(candidate);
          }
        });

        this.socket.on('user_mute_state', ({ userId, muted }) => {
          const u = this.users.find(x => x.id === userId);
          if (u) u.muted = muted;
          if (this.connected) this._render(this._tplConnected());
        });

        this.socket.on('disconnect', () => {
          this._cleanup();
          this._render(this._tplLogin('Desconectado del servidor.'));
        });
      };

      if (window.io) {
        doConnect();
      } else {
        const sc = document.createElement('script');
        sc.src = 'https://cdn.socket.io/4.7.4/socket.io.min.js';
        sc.onload = doConnect;
        document.head.appendChild(sc);
      }
    }

    // ── WebRTC ─────────────────────────────────────────────────────────────
    _makePeer(peerId) {
      const pc = new RTCPeerConnection(this.ice);
      this.stream.getTracks().forEach(t => pc.addTrack(t, this.stream));
      this.peers.set(peerId, pc);

      pc.onicecandidate = ({ candidate }) => {
        if (candidate && this.socket)
          this.socket.emit('ice_candidate', { to: peerId, candidate });
      };

      pc.ontrack = ({ streams }) => {
        if (!streams[0]) return;
        let audio = this.audios.get(peerId);
        if (!audio) {
          audio = new Audio();
          audio.autoplay = true;
          this.audios.set(peerId, audio);
        }
        audio.srcObject = streams[0];
      };

      return pc;
    }

    async _createOffer(peerId) {
      const pc = this._makePeer(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket.emit('webrtc_offer', { to: peerId, sdp: pc.localDescription });
    }

    async _handleOffer(fromId, sdp) {
      const pc = this._makePeer(fromId);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.socket.emit('webrtc_answer', { to: fromId, sdp: pc.localDescription });
      this._flushIce(fromId);
    }

    _flushIce(peerId) {
      const pc = this.peers.get(peerId);
      const queue = this.pendingIce.get(peerId) || [];
      queue.forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {}));
      this.pendingIce.delete(peerId);
    }

    _closePeer(peerId) {
      const pc = this.peers.get(peerId);
      if (pc) { pc.close(); this.peers.delete(peerId); }
      const audio = this.audios.get(peerId);
      if (audio) { audio.srcObject = null; this.audios.delete(peerId); }
    }

    // ── MUTE ──────────────────────────────────────────────────────────────
    _toggleMute() {
      this.muted = !this.muted;
      this.stream.getAudioTracks().forEach(t => { t.enabled = !this.muted; });
      this.socket && this.socket.emit('mute_state', { muted: this.muted });
      this._render(this._tplConnected());
    }

    // ── LEAVE ─────────────────────────────────────────────────────────────
    _leave() {
      if (this.socket) {
        this.socket.emit('leave_channel');
        this.socket.disconnect();
        this.socket = null;
      }
      this._cleanup();
      this.panel.classList.remove('open');
      this._render(this._tplLogin());
    }

    _cleanup() {
      this.peers.forEach((_, id) => this._closePeer(id));
      this.peers.clear();
      if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
      this.connected = false;
      this.myId = null;
      this.users = [];
      this.muted = false;
      this.fab.classList.remove('connected');
    }
  }

  // ── INIT ─────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new VoiceChannel());
  } else {
    new VoiceChannel();
  }

})();

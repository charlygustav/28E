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
  .vc-timer { font-size:11px; color:rgba(255,255,255,.4); font-variant-numeric:tabular-nums; }
  .vc-cb.dnd { background:rgba(124,58,237,.1); border-color:rgba(124,58,237,.3); color:#a78bfa; }
  .vc-hist { padding:8px 16px 14px; border-top:1px solid rgba(255,255,255,.05); }
  .vc-hist-row { display:flex; justify-content:space-between; font-size:11px; color:rgba(255,255,255,.3); padding:3px 0; }
  .vc-hist-row span:first-child { color:rgba(255,255,255,.5); }
  #vc-bar {
    position:fixed; bottom:0; left:0; right:0; z-index:9997;
    background:#0d0d0d; border-top:1px solid rgba(255,255,255,.07);
    display:none; align-items:center; gap:10px; padding:8px 20px;
    font-size:12px; color:rgba(255,255,255,.6); font-family:'Inter',-apple-system,sans-serif;
  }
  #vc-bar.show { display:flex; }
  #vc-bar-open { background:rgba(245,158,11,.12); border:1px solid rgba(245,158,11,.3); color:#f59e0b; border-radius:6px; padding:3px 10px; font-size:11px; cursor:pointer; margin-left:auto; }
  .vc-toast {
    position:fixed; bottom:72px; right:24px; z-index:10000;
    background:#1a1a1a; border:1px solid rgba(255,255,255,.09); border-radius:10px;
    padding:10px 14px; font-size:12.5px; color:#fff; font-family:'Inter',-apple-system,sans-serif;
    box-shadow:0 8px 32px rgba(0,0,0,.7); transform:translateY(8px); opacity:0;
    transition:all .3s cubic-bezier(.34,1.56,.64,1); pointer-events:none; max-width:240px;
  }
  .vc-toast.show { transform:translateY(0); opacity:1; }
  .vc-toast.join { border-left:3px solid #22c55e; }
  .vc-toast.leave { border-left:3px solid #ef4444; }
  .vc-toast.info { border-left:3px solid #f59e0b; }
  `;

  // ── ICONS ─────────────────────────────────────────────────────────────────
  const ICONS = {
    mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    micOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 9.6a2 2 0 0 1 1-2.2 12.84 12.84 0 0 0 .7-2.81 2 2 0 0 1 2-1.72h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>`,
    sound: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  };

  // ── MAIN CLASS ────────────────────────────────────────────────────────────
  class VoiceChannel {
    constructor() {
      this.socket      = null;
      this.stream      = null;
      this.peers       = new Map();
      this.audios      = new Map();
      this.gains       = new Map();
      this.pendingIce  = new Map();
      this.myId        = null;
      this.myName      = '';
      this.muted       = false;
      this.dnd         = false;
      this.connected   = false;
      this.users       = [];
      this._creds      = null;
      this._reconnects = 0;
      this._callStart  = null;
      this._timerInt   = null;
      this._analyser   = null;
      this._analyserData = null;
      this._speakRaf   = null;
      this._isSpeaking = false;
      this._vizRaf     = null;
      this._bar        = null;

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
      this.fab = document.createElement('div');
      this.fab.id = 'vc-fab';
      this.fab.title = 'Canal de Voz';
      this.fab.innerHTML = ICONS.mic;
      this.fab.addEventListener('click', () => this._toggle());

      this.panel = document.createElement('div');
      this.panel.id = 'vc-panel';
      this.panel.innerHTML = this._tplLogin();

      this._bar = document.createElement('div');
      this._bar.id = 'vc-bar';
      this._bar.innerHTML = `<div class="vc-dot"></div><span>#principal · <span id="vc-bar-timer">00:00</span></span><button id="vc-bar-open">Abrir</button>`;

      document.body.appendChild(this.fab);
      document.body.appendChild(this.panel);
      document.body.appendChild(this._bar);

      this._bar.querySelector('#vc-bar-open').addEventListener('click', () => {
        this.panel.classList.add('open');
        this._bar.classList.remove('show');
      });

      this._bindPanelEvents();
    }

    _toggle() {
      const willOpen = !this.panel.classList.contains('open');
      this.panel.classList.toggle('open');
      if (this.connected && willOpen) this._bar.classList.remove('show');
    }

    // ── TEMPLATES ──────────────────────────────────────────────────────────
    _tplLogin(err = '') {
      const savedName = localStorage.getItem('28e_vc_name') || '';
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
            <input class="vc-input" id="vc-name" type="text" placeholder="Ej: Charles" maxlength="20" autocomplete="off" value="${savedName}"/>
          </div>
          <div class="vc-field">
            <label class="vc-label">Contraseña del canal</label>
            <input class="vc-input" id="vc-pass" type="password" placeholder="••••••••" autocomplete="off"/>
          </div>
          <button class="vc-btn" id="vc-join">🎙️ Unirse al canal</button>
          <div class="vc-err" id="vc-err">${err}</div>
        </div>
        ${this._tplHistory()}`;
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

    _tplHistory() {
      const h = JSON.parse(localStorage.getItem('28e_vc_history') || '[]');
      if (!h.length) return '';
      const rows = h.slice(0,3).map(s => {
        const d = new Date(s.date);
        const label = d.toLocaleDateString('es',{month:'short',day:'numeric'}) + ' ' + d.toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});
        const m = Math.floor(s.duration/60), sec = s.duration%60;
        return `<div class="vc-hist-row"><span>${s.name}</span><span>${label} · ${m}m${sec}s</span></div>`;
      }).join('');
      return `<div class="vc-hist"><div class="vc-sect-lbl" style="margin-bottom:6px">Últimas sesiones</div>${rows}</div>`;
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
            <div><div class="vc-title">#principal</div><div class="vc-sub">${this.users.length}/4 · <span class="vc-timer" id="vc-timer">00:00</span></div></div>
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
            ${this.muted ? 'Silenciado' : 'Mic'}
          </button>
          <button class="vc-cb${this.dnd ? ' dnd' : ''}" id="vc-dnd">
            ${ICONS.bell} ${this.dnd ? 'DND' : 'DND'}
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
      const xBtn = document.getElementById('vc-close');
      if (xBtn) xBtn.addEventListener('click', () => this._toggle());

      const joinBtn = document.getElementById('vc-join');
      if (joinBtn) {
        joinBtn.addEventListener('click', () => this._doJoin());
        document.getElementById('vc-pass').addEventListener('keydown', e => e.key === 'Enter' && this._doJoin());
      }

      const muteBtn  = document.getElementById('vc-mute');
      const dndBtn   = document.getElementById('vc-dnd');
      const leaveBtn = document.getElementById('vc-leave');
      if (muteBtn)  muteBtn.addEventListener('click',  () => this._toggleMute());
      if (dndBtn)   dndBtn.addEventListener('click',   () => this._toggleDND());
      if (leaveBtn) leaveBtn.addEventListener('click', () => this._leave());
    }

    // ── JOIN ───────────────────────────────────────────────────────────────
    async _doJoin() {
      const name = document.getElementById('vc-name').value.trim();
      const pass = document.getElementById('vc-pass').value;
      if (!name) return this._setErr('Escribe tu nombre.');
      if (!pass) return this._setErr('Escribe la contraseña.');

      this.myName = name;
      localStorage.setItem('28e_vc_name', name);
      this._creds = { name, pass };
      this._reconnects = 0;
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
          this._reconnects = 0;
          this.fab.classList.add('connected');
          this._startTimer();
          this._setupSpeaking();
          for (const u of existingUsers) await this._createOffer(u.id);
        });

        this.socket.on('channel_users', ({ users }) => {
          this.users = users;
          if (this.connected) this._render(this._tplConnected());
        });

        this.socket.on('user_joined', ({ userId, displayName }) => {
          this._toast(`🟢 ${displayName} se unió`, 'join');
        });

        this.socket.on('user_left', ({ userId }) => {
          const u = this.users.find(x => x.id === userId);
          if (u) this._toast(`🔴 ${u.displayName} salió`, 'leave');
          this._closePeer(userId);
        });

        this.socket.on('speaking_state', ({ from, speaking }) => {
          this._updateAvatar(from, speaking);
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
          if (this._reconnects < 3 && this._creds) {
            this._reconnects++;
            this._toast(`Reconectando... (${this._reconnects}/3)`, 'info');
            setTimeout(() => this._connectSocket(this._creds.name, this._creds.pass), this._reconnects * 2000);
          } else {
            this._cleanup();
            this._render(this._tplLogin('Desconectado del servidor.'));
          }
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
        if (candidate && this.socket) this.socket.emit('ice_candidate', { to: peerId, candidate });
      };

      pc.ontrack = (event) => {
        const stream = event.streams[0] || new MediaStream([event.track]);
        let audio = this.audios.get(peerId);
        if (!audio) {
          audio = document.createElement('audio');
          audio.autoplay = true;
          document.body.appendChild(audio);
          this.audios.set(peerId, audio);
        }
        audio.srcObject = stream;
        audio.volume = this.dnd ? 0 : 1;
        audio.play().catch(() => {});
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
      if (audio) { audio.srcObject = null; audio.remove(); this.audios.delete(peerId); }
    }

    // ── MUTE ──────────────────────────────────────────────────────────────
    _toggleMute() {
      this.muted = !this.muted;
      this.stream.getAudioTracks().forEach(t => { t.enabled = !this.muted; });
      this.socket && this.socket.emit('mute_state', { muted: this.muted });
      this._render(this._tplConnected());
    }

    _toggleDND() {
      this.dnd = !this.dnd;
      this.audios.forEach(a => { a.volume = this.dnd ? 0 : 1; });
      this._render(this._tplConnected());
    }

    // ── LEAVE ─────────────────────────────────────────────────────────────
    _leave() {
      this._creds = null; // prevents auto-reconnect on intentional leave
      if (this.socket) { this.socket.emit('leave_channel'); this.socket.disconnect(); this.socket = null; }
      this._cleanup();
      this.panel.classList.remove('open');
      this._bar.classList.remove('show');
      this._render(this._tplLogin());
    }

    _cleanup() {
      this._stopTimer();
      this._stopSpeaking();
      cancelAnimationFrame(this._vizRaf);
      this._vizRaf = null;
      this.peers.forEach((_, id) => this._closePeer(id));
      this.peers.clear();
      this.audios.forEach(a => { try { a.srcObject = null; a.remove(); } catch{} });
      this.audios.clear();
      this.gains.clear();
      if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
      this.connected = false;
      this.myId = null;
      this.users = [];
      this.muted = false;
      this.dnd = false;
      this.fab.classList.remove('connected');
    }

    // ── SPEAKING DETECTION ────────────────────────────────────────────────
    _setupSpeaking() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const src = ctx.createMediaStreamSource(this.stream);
        const an  = ctx.createAnalyser();
        an.fftSize = 256;
        src.connect(an);
        this._analyser = an;
        this._analyserData = new Uint8Array(an.frequencyBinCount);
        this._checkSpeaking();
      } catch(e) {}
    }

    _checkSpeaking() {
      if (!this._analyser) return;
      this._analyser.getByteFrequencyData(this._analyserData);
      const vol = this._analyserData.reduce((a,b) => a+b, 0) / this._analyserData.length;
      const speaking = vol > 12;
      if (speaking !== this._isSpeaking) {
        this._isSpeaking = speaking;
        this.socket && this.socket.emit('speaking_state', { speaking });
        this._updateAvatar(this.myId, speaking);
      }
      this._speakRaf = requestAnimationFrame(() => this._checkSpeaking());
    }

    _stopSpeaking() {
      cancelAnimationFrame(this._speakRaf);
      this._speakRaf = null;
      this._analyser = null;
    }

    _updateAvatar(userId, speaking) {
      const el = document.getElementById(`vc-av-${userId}`);
      if (el) el.classList.toggle('speaking', speaking);
    }

    // ── VISUALIZER ────────────────────────────────────────────────────────
    _startVisualizer() {
      const canvas = document.getElementById('vc-viz');
      if (!canvas || !this._analyser) return;
      canvas.width = canvas.offsetWidth || 298;
      const ctx = canvas.getContext('2d');
      const draw = () => {
        if (!this._analyser || !document.getElementById('vc-viz')) { return; }
        this._analyser.getByteFrequencyData(this._analyserData);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const step = Math.floor(this._analyserData.length / 40);
        const barW = canvas.width / 40 - 1;
        for (let i = 0; i < 40; i++) {
          const v = this._analyserData[i * step] / 255;
          const h = v * canvas.height;
          ctx.fillStyle = `rgba(245,158,11,${0.2 + v * 0.8})`;
          ctx.fillRect(i * (barW + 1), canvas.height - h, barW, h);
        }
        this._vizRaf = requestAnimationFrame(draw);
      };
      draw();
    }

    // ── TOAST + SOUND ─────────────────────────────────────────────────────
    _toast(msg, type = 'info') {
      const t = document.createElement('div');
      t.className = `vc-toast ${type}`;
      t.textContent = msg;
      document.body.appendChild(t);
      requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
      this._playNotif(type);
    }

    _playNotif(type) {
      try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(type === 'join' ? 880 : 440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(type === 'join' ? 1320 : 220, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      } catch(e) {}
    }

    // ── TIMER ────────────────────────────────────────────────────────────
    _startTimer() {
      this._callStart = Date.now();
      this._timerInt = setInterval(() => {
        const s = Math.floor((Date.now() - this._callStart) / 1000);
        const str = `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
        const el = document.getElementById('vc-timer');
        const barEl = document.getElementById('vc-bar-timer');
        if (el) el.textContent = str;
        if (barEl) barEl.textContent = str;
        if (!this.panel.classList.contains('open') && this.connected) {
          this._bar.classList.add('show');
        }
      }, 1000);
    }

    _stopTimer() {
      clearInterval(this._timerInt);
      this._timerInt = null;
      if (this._callStart) {
        const dur = Math.floor((Date.now() - this._callStart) / 1000);
        const h = JSON.parse(localStorage.getItem('28e_vc_history') || '[]');
        h.unshift({ date: new Date().toISOString(), duration: dur, name: this.myName });
        h.splice(10);
        localStorage.setItem('28e_vc_history', JSON.stringify(h));
        this._callStart = null;
      }
      this.fab.title = 'Canal de Voz';
    }
  }

  // ── INIT ─────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new VoiceChannel());
  } else {
    new VoiceChannel();
  }

})();

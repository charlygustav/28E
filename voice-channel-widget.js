/* =========================================================
   28E — Voice Channel Widget  (WebRTC Mesh + Socket.io)
   ========================================================= */
(function () {
  'use strict';

  // ── CONFIG (cambia SIGNALING_URL tras el deploy en Railway) ──────────────
  const SIGNALING_URL = 'https://28e-production.up.railway.app';

  // ── INTERNATIONALIZATION ──────────────────────────────────────────────────
  const VC_I18N = {
    es: {
      vc_title: "Canal de Voz",
      vc_sub: "Canal de voz privado",
      lbl_name: "Tu nombre",
      ph_name: "Ej: Charles",
      lbl_pass: "Contraseña del canal",
      ph_pass: "••••••••",
      btn_join: "Unirse al canal",
      hist_title: "Últimas sesiones",
      st_conn: "Conectando…",
      st_estab: "Estableciendo conexión…",
      st_disc: "Desconectado",
      msg_disc: "Se perdió la conexión con el servidor.",
      btn_reconn: "Reconectar",
      sect_in: "En el canal",
      empty_chan: "Solo tú por ahora…",
      tag_you: "(tú)",
      btn_mic: "Mic",
      btn_muted: "Silenciado",
      btn_leave: "Salir",
      bar_conn: "Conectado · #principal",
      err_name: "Escribe tu nombre.",
      err_pass: "Escribe la contraseña.",
      err_mic: "❌ No se pudo acceder al micrófono.",
      toast_join: "se unió",
      toast_left: "se fue",
      vc_chat: "Chat",
      vc_chat_ph: "Escribe un mensaje…",
      vc_chat_send: "Enviar",
      vc_chat_empty: "Sin mensajes aún",
      vc_typing: "está escribiendo...",
      vc_ring_title: "Llamada entrante",
      vc_ring_msg: "quiere hablar contigo 💛",
      vc_ring_join: "Unirse",
      vc_ring_ignore: "Ignorar",
      vc_restricted: "Acceso Restringido",
      vc_req_login: "Inicia sesión con tu cuenta de Google para poder entrar al Canal de Voz.",
      vc_session_as: "Sesión iniciada como",
      vc_login_google: "Continuar con Google",
      vc_music: "Música",
      vc_music_ph: "Pega un link de YouTube o Spotify…",
      vc_music_add: "Añadir",
      vc_music_now: "Reproduciendo",
      vc_music_queue: "Cola",
      vc_music_empty_q: "Sin canciones en cola",
      vc_music_no_track: "Nada sonando",
      vc_music_by: "por",
      vc_music_skip: "Siguiente",
      vc_music_err_url: "Link no válido. Usa YouTube o Spotify.",
      vc_hist_more: "Ver más",
      vc_nobody: "Nadie en el canal por ahora",
      vc_person: "persona conectada",
      vc_persons: "personas conectadas",
      vc_tab_room: "Sala",
      vc_hist_full: "Historial de Sesiones"
    },
    en: {
      vc_title: "Voice Channel",
      vc_sub: "Private voice channel",
      lbl_name: "Your name",
      ph_name: "Ex: Charles",
      lbl_pass: "Channel password",
      ph_pass: "••••••••",
      btn_join: "Join channel",
      hist_title: "Latest sessions",
      st_conn: "Connecting…",
      st_estab: "Establishing connection…",
      st_disc: "Disconnected",
      msg_disc: "Connection to the server was lost.",
      btn_reconn: "Reconnect",
      sect_in: "In channel",
      empty_chan: "Just you for now…",
      tag_you: "(you)",
      btn_mic: "Mic",
      btn_muted: "Muted",
      btn_leave: "Leave",
      bar_conn: "Connected · #main",
      err_name: "Enter your name.",
      err_pass: "Enter the password.",
      err_mic: "❌ Could not access microphone.",
      toast_join: "joined",
      toast_left: "left",
      vc_chat: "Chat",
      vc_chat_ph: "Type a message…",
      vc_chat_send: "Send",
      vc_chat_empty: "No messages yet",
      vc_typing: "is typing...",
      vc_ring_title: "Incoming call",
      vc_ring_msg: "wants to talk to you 💛",
      vc_ring_join: "Join",
      vc_ring_ignore: "Ignore",
      vc_restricted: "Restricted Access",
      vc_req_login: "Log in with your Google account to enter the Voice Channel.",
      vc_session_as: "Logged in as",
      vc_login_google: "Continue with Google",
      vc_music: "Music",
      vc_music_ph: "Paste a YouTube or Spotify link…",
      vc_music_add: "Add",
      vc_music_now: "Now Playing",
      vc_music_queue: "Queue",
      vc_music_empty_q: "No songs in queue",
      vc_music_no_track: "Nothing playing",
      vc_music_by: "by",
      vc_music_skip: "Skip",
      vc_music_err_url: "Invalid link. Use YouTube or Spotify.",
      vc_hist_more: "See more",
      vc_nobody: "No one in the channel yet",
      vc_person: "person connected",
      vc_persons: "people connected",
      vc_tab_room: "Room",
      vc_hist_full: "Session History"
    },
    pt: {
      vc_title: "Canal de Voz",
      vc_sub: "Canal de voz privado",
      lbl_name: "Seu nome",
      ph_name: "Ex: Charles",
      lbl_pass: "Senha do canal",
      ph_pass: "••••••••",
      btn_join: "Entrar no canal",
      hist_title: "Últimas sessões",
      st_conn: "Conectando…",
      st_estab: "Estabelecendo conexão…",
      st_disc: "Desconectado",
      msg_disc: "A conexão com o servidor foi perdida.",
      btn_reconn: "Reconectar",
      sect_in: "No canal",
      empty_chan: "Só você por enquanto…",
      tag_you: "(você)",
      btn_mic: "Mic",
      btn_muted: "Silenciado",
      btn_leave: "Sair",
      bar_conn: "Conectado · #principal",
      err_name: "Digite seu nome.",
      err_pass: "Digite a senha.",
      err_mic: "❌ Não foi possível acessar o microfone.",
      toast_join: "entrou",
      toast_left: "saiu",
      vc_chat: "Chat",
      vc_chat_ph: "Digite uma mensagem…",
      vc_chat_send: "Enviar",
      vc_chat_empty: "Sem mensagens ainda",
      vc_typing: "está digitando...",
      vc_ring_title: "Chamada recebida",
      vc_ring_msg: "quer falar com você 💛",
      vc_ring_join: "Entrar",
      vc_ring_ignore: "Ignorar",
      vc_restricted: "Acesso Restrito",
      vc_req_login: "Faça login com sua conta do Google para entrar no Canal de Voz.",
      vc_session_as: "Sessão iniciada como",
      vc_login_google: "Continuar com o Google",
      vc_music: "Música",
      vc_music_ph: "Cole um link do YouTube ou Spotify…",
      vc_music_add: "Adicionar",
      vc_music_now: "Tocando agora",
      vc_music_queue: "Fila",
      vc_music_empty_q: "Sem músicas na fila",
      vc_music_no_track: "Nada tocando",
      vc_music_by: "por",
      vc_music_skip: "Próxima",
      vc_music_err_url: "Link inválido. Use YouTube ou Spotify.",
      vc_hist_more: "Ver mais",
      vc_nobody: "Ninguém no canal por enquanto",
      vc_person: "pessoa conectada",
      vc_persons: "pessoas conectadas",
      vc_tab_room: "Sala",
      vc_hist_full: "Histórico de Sessões"
    },
    fr: {
      vc_title: "Canal Vocal",
      vc_sub: "Canal vocal privé",
      lbl_name: "Ton nom",
      ph_name: "Ex: Charles",
      lbl_pass: "Mot de passe",
      ph_pass: "••••••••",
      btn_join: "Rejoindre le canal",
      hist_title: "Dernières sessions",
      st_conn: "Connexion…",
      st_estab: "Établissement de la connexion…",
      st_disc: "Déconnecté",
      msg_disc: "La connexion au serveur a été perdue.",
      btn_reconn: "Reconnecter",
      sect_in: "Dans le canal",
      empty_chan: "Juste toi pour l'instant…",
      tag_you: "(toi)",
      btn_mic: "Mic",
      btn_muted: "Sourdine",
      btn_leave: "Quitter",
      bar_conn: "Connecté · #principal",
      err_name: "Entre ton nom.",
      err_pass: "Entre le mot de passe.",
      err_mic: "❌ Impossible d'accéder au micro.",
      toast_join: "a rejoint",
      toast_left: "est parti",
      vc_chat: "Chat",
      vc_chat_ph: "Écris un message…",
      vc_chat_send: "Envoyer",
      vc_chat_empty: "Pas encore de messages",
      vc_typing: "est en train d'écrire...",
      vc_ring_title: "Appel entrant",
      vc_ring_msg: "veut te parler 💛",
      vc_ring_join: "Rejoindre",
      vc_ring_ignore: "Ignorer",
      vc_restricted: "Accès Restreint",
      vc_req_login: "Connectez-vous avec votre compte Google pour entrer dans le canal vocal.",
      vc_session_as: "Connecté en tant que",
      vc_login_google: "Continuer avec Google",
      vc_music: "Musique",
      vc_music_ph: "Colle un lien YouTube ou Spotify…",
      vc_music_add: "Ajouter",
      vc_music_now: "En lecture",
      vc_music_queue: "File d'attente",
      vc_music_empty_q: "Pas de chansons",
      vc_music_no_track: "Rien en lecture",
      vc_music_by: "par",
      vc_music_skip: "Suivant",
      vc_music_err_url: "Lien invalide. Utilise YouTube ou Spotify.",
      vc_hist_more: "Voir plus",
      vc_nobody: "Personne dans le canal pour l'instant",
      vc_person: "personne connectée",
      vc_persons: "personnes connectées",
      vc_tab_room: "Salon",
      vc_hist_full: "Historique des Sessions"
    }
  };

  const _getLang = () => {
    let lang = 'es';
    if (typeof currentLang !== 'undefined') lang = currentLang;
    else if (window.currentLang) lang = window.currentLang;
    else if (localStorage.getItem('yaire_lang')) lang = localStorage.getItem('yaire_lang');
    else if (navigator.language) {
      const bLang = navigator.language.slice(0, 2).toLowerCase();
      if (VC_I18N[bLang]) lang = bLang;
    }
    return lang;
  };

  const _t = (key) => {
    const lang = _getLang();
    return (VC_I18N[lang] && VC_I18N[lang][key]) ? VC_I18N[lang][key] : VC_I18N['es'][key];
  };

  // ── CSS ──────────────────────────────────────────────────────────────────
  const CSS = `
  @keyframes vc-pulse { 0%,100%{box-shadow:0 4px 24px rgba(245,158,11,.2)} 50%{box-shadow:0 4px 32px rgba(245,158,11,.45)} }
  @keyframes vc-shine { 0% { transform:rotate(45deg) translateY(-100%); } 20%, 100% { transform:rotate(45deg) translateY(100%); } }
  @keyframes vc-spin { to{transform:rotate(360deg)} }
  @keyframes vc-slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
  @keyframes vc-speak-pulse { 0% { box-shadow:0 0 0 0 rgba(34,197,94,.4); } 70% { box-shadow:0 0 0 6px rgba(34,197,94,0); } 100% { box-shadow:0 0 0 0 rgba(34,197,94,0); } }
  @keyframes vc-pop { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes vc-blink { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes vc-ring-in { from { opacity:0; } to { opacity:1; } }
  @keyframes vc-ring-pulse { 0%,100% { box-shadow:0 0 0 0 rgba(245,158,11,.3); } 50% { box-shadow:0 0 0 18px rgba(245,158,11,0); } }
  @keyframes vc-music-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
  @keyframes vc-eq { 0%,100%{height:3px} 50%{height:12px} }
  .vc-scroll::-webkit-scrollbar { width:4px; }
  .vc-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:2px; }
  .vc-av.speaking { border-color: #10B981 !important; box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); animation: vc-speak-pulse 1.5s infinite; }
  @keyframes vc-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
  .vc-marquee-container { display: flex; overflow: hidden; white-space: nowrap; mask-image: linear-gradient(to right, transparent, black 10px, black calc(100% - 10px), transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10px, black calc(100% - 10px), transparent); width: 100%; }
  .vc-marquee-content { flex-shrink: 0; animation: vc-marquee 12s linear infinite; padding-right: 2rem; }
  `;

  // ── ICONS ─────────────────────────────────────────────────────────────────
  const ICONS = {
    mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    micOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 9.6a2 2 0 0 1 1-2.2 12.84 12.84 0 0 0 .7-2.81 2 2 0 0 1 2-1.72h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>`,
    sound: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    dnd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`,
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    skipFwd: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><rect x="17" y="5" width="2" height="14"/></svg>`,
    volumeUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  };

  // ── MAIN CLASS ────────────────────────────────────────────────────────────
  class VoiceChannel {
    constructor() {
      this.socket      = null;
      this.stream      = null;
      this._processedStream = null;
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
      this._savedName  = null;
      this._savedPass  = null;
      this._callStart  = null;
      this._timerInt   = null;
      this._analyser   = null;
      this._analyserData = null;
      this._speakRaf   = null;
      this._isSpeaking = false;
      this._vizRaf     = null;
      this._bar        = null;
      this._noiseCtx   = null;
      this._gateRaf    = null;

      // Chat state
      this._chatMsgs   = [];
      this._chatUnread = 0;

      // Ring state
      this._ringOsc    = null;
      this._ringGain   = null;
      this._ringCtx    = null;
      this._ringTimeout = null;

      // Typing state
      this._isTyping = false;

      // New Tabs State (room, chat, music)
      this._activeTab = 'room';

      // Music state
      this._musicQueue = [];
      this._musicState = { currentIndex: -1, isPlaying: false };
      this._musicCurrentTrack = null;
      this._musicVolume = 50;
      this._musicPlaying = false;
      this._musicProgressInt = null;
      this._ytPlayer = null;
      this._ytApiLoading = false;
      this._ytApiCallbacks = [];

      // Audio constraints for getUserMedia
      this._audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1
      };

      this._initAudio();

      // Auto-detect language changes
      this._lastLang = _getLang();
      setInterval(() => {
        const current = _getLang();
        if (current !== this._lastLang) {
          this._lastLang = current;
          this.updateTranslations();
        }
      }, 500);

      this.ice = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun.relay.metered.ca:80' },
          {
            urls: 'turn:global.relay.metered.ca:80',
            username: '5187d4c4c5314e021d568c2d',
            credential: 'Bb9ysI8BgTjn/dET'
          },
          {
            urls: 'turn:global.relay.metered.ca:80?transport=tcp',
            username: '5187d4c4c5314e021d568c2d',
            credential: 'Bb9ysI8BgTjn/dET'
          },
          {
            urls: 'turn:global.relay.metered.ca:443',
            username: '5187d4c4c5314e021d568c2d',
            credential: 'Bb9ysI8BgTjn/dET'
          },
          {
            urls: 'turns:global.relay.metered.ca:443?transport=tcp',
            username: '5187d4c4c5314e021d568c2d',
            credential: 'Bb9ysI8BgTjn/dET'
          }
        ]
      };

      this._injectCSS();
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

    _initAudio() {
      try {
        this.actx = new (window.AudioContext || window.webkitAudioContext)();
        this.sfxBuf = {};
        this.sfxNodes = {};
        const load = async (k, u) => {
          try {
            const r = await fetch(u);
            this.sfxBuf[k] = await this.actx.decodeAudioData(await r.arrayBuffer());
          } catch(e){}
        };
        load('flyin', 'sounds/flyin.wav');
        load('flyout', 'sounds/flyout.wav');
        load('typing', 'sounds/typing.wav');
        load('progress', 'SND01_sine/progress_loop.wav');
        load('toggleOn', 'SND01_sine/toggle_on.wav');
        load('toggleOff', 'SND01_sine/toggle_off.wav');
        load('act_launch', 'sounds/activity_launch.mp3');
        load('act_end', 'sounds/activity_end.mp3');
        load('act_join', 'sounds/activity_user_join.mp3');
        load('act_left', 'sounds/activity_user_left.mp3');
        load('music_start', 'sounds/lamusicadelvoz.wav');
        load('vc_chat_msg', 'sounds/nuevomensajeenelchatdevoz.wav');
        load('music_end_all', 'sounds/yanomasmusica.wav');
      } catch(e) {}
    }

    _playSfx(k, vol=0.4, loop=false, excl=null) {
      if (!this.actx || !this.sfxBuf[k]) return null;
      if (this.actx.state === 'suspended') this.actx.resume();
      if (excl && this.sfxNodes[excl]) this._stopSfx(this.sfxNodes[excl]);
      
      try {
        const src = this.actx.createBufferSource();
        src.buffer = this.sfxBuf[k];
        src.loop = loop;
        const gain = this.actx.createGain();
        
        // Anti-pop fade in
        const t = this.actx.currentTime;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.02);
        
        src.connect(gain);
        gain.connect(this.actx.destination);
        src.start(0);
        const node = { src, gain };
        if (excl) this.sfxNodes[excl] = node;
        return node;
      } catch(e) { return null; }
    }

    _stopSfx(node) {
      if (!node || !this.actx) return;
      try {
        const t = this.actx.currentTime;
        node.gain.gain.cancelScheduledValues(t);
        node.gain.gain.setValueAtTime(node.gain.gain.value, t);
        node.gain.gain.linearRampToValueAtTime(0, t + 0.04);
        node.src.stop(t + 0.04);
      } catch(e){}
    }

    // ── BUILD UI ───────────────────────────────────────────────────────────
    _buildUI() {
      const w = document.createElement('div');
      w.id = 'vc-wrapper';

      this.fab = document.createElement('div');
      this.fab.id = 'vc-fab';
      this.fab.title = _t('vc_title');
      this.fab.className = 'fixed bottom-6 right-6 z-[9999] flex items-center justify-center cursor-pointer transition-all duration-500 ease-out rounded-full bg-zinc-900 border border-white/10 shadow-2xl hover:border-amber-500/50 w-14 h-14 group';
      this.fab.innerHTML = `
        <div class="absolute inset-0 rounded-full bg-amber-500/20 blur-xl opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500 ease-out"></div>
        <div class="absolute inset-0 rounded-full shadow-[0_0_0_0_rgba(245,158,11,0)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-shadow duration-500 ease-out"></div>
        <span class="relative z-10 text-amber-500 transition-all duration-500 ease-out group-hover:scale-125 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] flex items-center justify-center w-6 h-6">${ICONS.mic}</span>
      `;
      this.fab.addEventListener('click', () => this._toggle());

      this.panel = document.createElement('div');
      this.panel.id = 'vc-panel';
      this.panel.className = 'fixed bottom-24 right-6 w-full max-w-[315px] bg-zinc-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-[9998] transition-all duration-300 transform scale-95 opacity-0 pointer-events-none translate-y-4 font-sans';
      this.panel.innerHTML = this._tplLogin();

      this._bar = document.createElement('div');
      this._bar.id = 'vc-bar';
      this._bar.className = 'fixed bottom-24 right-6 z-[9997] flex items-center gap-3 px-3.5 py-2.5 bg-zinc-950/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] opacity-0 pointer-events-none transition-all duration-500 translate-y-4 scale-95 origin-bottom-right';
      this._bar.innerHTML = `
        <div class="flex items-center justify-center w-7 h-7 rounded-full bg-green-500/10 border border-green-500/20 relative shrink-0 transition-colors duration-300" id="vc-bar-indicator-bg">
          <div class="absolute inset-0 rounded-full bg-green-500/20 animate-ping opacity-50 transition-all duration-300" id="vc-bar-indicator-ping"></div>
          <div class="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,1)] transition-colors duration-300" id="vc-bar-indicator-dot"></div>
          
          <div id="vc-bar-waveform" class="absolute inset-0 flex items-center justify-center gap-[2px] opacity-0 transition-opacity duration-300">
             <div class="w-1 bg-green-400 rounded-full animate-[vc-eq_0.5s_ease-in-out_infinite]"></div>
             <div class="w-1 bg-green-400 rounded-full animate-[vc-eq_0.5s_ease-in-out_infinite_0.1s]"></div>
             <div class="w-1 bg-green-400 rounded-full animate-[vc-eq_0.5s_ease-in-out_infinite_0.2s]"></div>
          </div>
        </div>
        <div class="flex flex-col justify-center min-w-[65px]">
          <div class="flex items-center gap-1.5 mb-1">
             <span class="text-[9px] font-extrabold text-green-400 uppercase tracking-[0.2em] leading-none transition-colors duration-300" id="vc-bar-title">${_t('bar_conn').split(' · ')[0]}</span>
             <div class="flex items-center gap-1" id="vc-bar-icons">
               <div id="vc-bar-music-icon" class="hidden text-amber-500 transition-opacity">
                 <svg class="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
               </div>
               <div id="vc-bar-chat-icon" class="hidden text-red-400 relative transition-opacity">
                 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                 <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)] animate-pulse"></span>
               </div>
             </div>
          </div>
          <span id="vc-bar-sub" class="text-[10px] text-white/50 font-medium leading-none">${_t('bar_conn').split(' · ')[1]}</span>
        </div>
        <div class="w-[1px] h-6 bg-white/10 mx-1"></div>
        <div class="flex items-center px-1">
          <span id="vc-bar-timer" class="text-white font-mono text-[13px] font-bold tabular-nums tracking-wide">00:00</span>
        </div>
      `;

      document.body.appendChild(this.fab);
      document.body.appendChild(this.panel);
      document.body.appendChild(this._bar);

      this.panel.addEventListener('click', (e) => e.stopPropagation());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const detHist = document.getElementById('vc-detailed-history');
          if (detHist) {
            const btn = document.getElementById('vc-det-close');
            if (btn) btn.click();
            return;
          }
          if (this.panel.classList.contains('scale-100')) {
            this._toggle();
          }
        }
      });

      let _panelMousedown = false;
      this.panel.addEventListener('mousedown', () => { _panelMousedown = true; });
      document.addEventListener('mouseup', () => { requestAnimationFrame(() => { _panelMousedown = false; }); });

      document.addEventListener('click', (e) => {
        if (!this.panel.classList.contains('scale-100')) return;
        if (this.panel.contains(e.target) || this.fab.contains(e.target)) return;
        if (_panelMousedown) return;
        if (window.getSelection && window.getSelection().toString()) return;
        if (document.getElementById('vc-detailed-history')) return;
        this._toggle();
      });

      window.addEventListener('languagechange', () => {
        if (this.fab) this.fab.title = _t('vc_title');
        
        if (this.connected) {
           this._render(this._tplConnected());
        } else {
          if (document.getElementById('vc-reconnect')) this._render(this._tplDisconnected());
          else if (this.panel.querySelector('.animate-spin')) this._render(this._tplLoading());
          else this._render(this._tplLogin());
        }
      });

      window.addEventListener('yaireAuthChanged', () => {
        if (!this.connected) {
          if (document.getElementById('vc-reconnect')) this._render(this._tplDisconnected());
          else if (this.panel.querySelector('.animate-spin')) this._render(this._tplLoading());
          else this._render(this._tplLogin());
        }
      });

      this._bindPanelEvents();
    }

    _toggle() {
      const willOpen = !this.panel.classList.contains('scale-100');
      
      if (willOpen) {
        this.panel.classList.remove('scale-95', 'opacity-0', 'pointer-events-none', 'translate-y-4');
        this.panel.classList.add('scale-100', 'opacity-100', 'pointer-events-auto', 'translate-y-0');
        if (this.connected) {
          this._bar.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
          this._bar.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        } else {
          if (document.getElementById('vc-reconnect')) this._render(this._tplDisconnected());
          else if (this.panel.querySelector('.animate-spin')) this._render(this._tplLoading());
          else this._render(this._tplLogin());
        }
        this._playSfx('flyin', 0.4, false, 'fly');
      } else {
        if (this._loginPollInt) { clearInterval(this._loginPollInt); this._loginPollInt = null; }
        this.panel.classList.remove('scale-100', 'opacity-100', 'pointer-events-auto', 'translate-y-0');
        this.panel.classList.add('scale-95', 'opacity-0', 'pointer-events-none', 'translate-y-4');
        if (this.connected) {
          this._bar.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
          this._bar.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
        }
        this._playSfx('flyout', 0.4, false, 'fly');
      }
    }

    // ── TEMPLATES ──────────────────────────────────────────────────────────
    _tplLogin(err = '') {
      const user = window.yaireCurrentUser;
      if (!user) {
        return `
          <div class="relative overflow-hidden flex flex-col h-full">
            <!-- Ambient Light Orbs -->
            <div class="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-[50px] pointer-events-none"></div>

            <div class="relative z-10 flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/20 backdrop-blur-sm">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center relative overflow-hidden [&>svg]:w-4 [&>svg]:h-4 [&>svg]:relative [&>svg]:z-10">${ICONS.sound}</div>
                <div><div class="text-white font-bold text-[13px]">#principal</div><div class="text-white/40 text-[10px]">${_t('vc_sub')}</div></div>
              </div>
              <button class="text-white/30 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors" id="vc-close">✕</button>
            </div>
            
            <div class="relative z-10 py-4 px-6 text-center flex-1 flex flex-col justify-center items-center">
              <div class="relative mb-3">
                <div class="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                <div class="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-amber-500/30 text-amber-500 flex items-center justify-center relative z-10 shadow-2xl backdrop-blur-md">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
              </div>
              <h3 class="text-white font-extrabold text-lg mb-1 tracking-tight">${_t('vc_restricted')}</h3>
              <p class="text-white/40 text-xs mb-4 leading-relaxed max-w-[250px] mx-auto">${_t('vc_req_login')}</p>
              
              <button id="vc-google-login-btn" class="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all shadow-xl backdrop-blur-md group">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                  ${_t('vc_login_google')}
              </button>
            </div>
          </div>`;
      }

      return `
        <div class="relative overflow-hidden flex flex-col h-full">
          <!-- Ambient Light Orbs -->
          <div class="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>
          <div class="absolute bottom-10 -left-10 w-48 h-48 bg-pink-500/10 rounded-full blur-[50px] pointer-events-none"></div>

          <div class="relative z-10 flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/20 backdrop-blur-sm">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center relative overflow-hidden [&>svg]:w-4 [&>svg]:h-4 [&>svg]:relative [&>svg]:z-10">${ICONS.sound}</div>
              <div><div class="text-white font-bold text-[13px]">#principal</div><div class="text-white/40 text-[10px]">${_t('vc_sub')}</div></div>
            </div>
            <button class="text-white/30 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors" id="vc-close">✕</button>
          </div>
          
          <div class="relative z-10 py-5 px-6 flex-1 flex flex-col items-center justify-center gap-5">
            <div class="flex flex-col items-center">
                <div class="relative group mb-3">
                    <div class="absolute inset-0 rounded-full bg-amber-500/30 blur-md group-hover:bg-amber-500/50 transition-colors duration-500 animate-pulse"></div>
                    <img src="${user.photoURL}" class="w-16 h-16 rounded-full object-cover border-2 border-amber-500/50 relative z-10 shadow-xl" draggable="false" />
                </div>
                <div class="text-[9px] text-amber-500/80 font-bold uppercase tracking-[0.2em] mb-1">${_t('vc_session_as')}</div>
                <div class="text-xl font-extrabold text-white tracking-tight">${user.displayName}</div>
            </div>
            
            <input id="vc-name" type="hidden" value="${user.displayName}"/>
            <input id="vc-pass" type="hidden" value="nopass"/>
            
            <div class="w-full flex flex-col items-center gap-2">
                <button id="vc-join" class="relative w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm rounded-xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  <span class="relative z-10 flex items-center justify-center gap-2">${_t('btn_join')}</span>
                </button>
                <div id="vc-conn-count" class="text-[10px] font-medium text-center flex items-center justify-center transition-opacity opacity-0 h-3"></div>
                <div class="text-red-400 text-[10px] text-center font-medium empty:hidden" id="vc-err">${err}</div>
            </div>
          </div>
          ${this._tplHistory()}
        </div>`;
    }

    _tplLoading() {
      return `
        <div class="relative overflow-hidden flex flex-col h-full">
          <!-- Ambient Light Orbs -->
          <div class="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none animate-pulse"></div>

          <div class="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/20 backdrop-blur-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">${ICONS.sound}</div>
              <div><div class="text-white font-bold text-sm">#principal</div><div class="text-white/40 text-[11px]">${_t('st_conn')}</div></div>
            </div>
            <button class="text-white/30 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors" id="vc-close">✕</button>
          </div>
          
          <div class="relative z-10 p-10 flex-1 flex flex-col items-center justify-center">
            <div class="relative mb-6">
               <div class="absolute inset-0 bg-amber-500/30 blur-xl rounded-full animate-pulse"></div>
               <div class="w-10 h-10 rounded-full border-[3px] border-zinc-800 border-t-amber-500 animate-spin relative z-10"></div>
            </div>
            <div class="text-white/50 text-sm font-medium tracking-wide animate-pulse">${_t('st_estab')}</div>
          </div>
        </div>`;
    }

    _tplDisconnected() {
      return `
        <div class="relative overflow-hidden flex flex-col h-full">
          <!-- Ambient Red Light Orbs -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[60px] pointer-events-none"></div>

          <div class="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/20 backdrop-blur-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">${ICONS.sound}</div>
              <div><div class="text-white font-bold text-sm">#principal</div><div class="text-red-400 font-bold text-[11px] uppercase tracking-wider">${_t('st_disc')}</div></div>
            </div>
            <button class="text-white/30 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors" id="vc-close">✕</button>
          </div>
          
          <div class="relative z-10 p-8 flex-1 flex flex-col justify-center items-center text-center">
            <div class="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4 backdrop-blur-sm border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
               <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <p class="text-white/50 text-xs mb-8 leading-relaxed max-w-[250px] mx-auto">${_t('msg_disc')}</p>
            <button id="vc-reconnect" class="w-full py-3.5 bg-red-500 hover:bg-red-400 text-white font-extrabold text-sm rounded-xl transition-all shadow-[0_4px_16px_rgba(239,68,68,0.2)] hover:-translate-y-0.5 active:translate-y-0">
              ${_t('btn_reconn')}
            </button>
          </div>
        </div>`;
    }

    _tplHistory() {
      const h = window.yaireVcHistoryData || [];
      if (!window.yaireCurrentUser || !h.length) return '';
      const lang = _getLang();
      const rows = h.slice(0,3).map(s => {
        const d = new Date(s.date);
        const label = d.toLocaleDateString(lang, {month:'short',day:'numeric'}) + ' ' + d.toLocaleTimeString(lang, {hour:'2-digit',minute:'2-digit'});
        const m = Math.floor(s.duration/60), sec = s.duration%60;
        return `<div class="flex justify-between text-[10px] py-1"><span class="text-white/70 font-medium">${s.name}</span><span class="text-white/30">${label} · ${m}m${sec}s</span></div>`;
      }).join('');
      const moreBtn = h.length > 3 ? `<button id="vc-btn-ver-mas" class="w-full mt-2 text-[9px] text-amber-500/80 hover:text-amber-400 font-bold uppercase tracking-wider py-1 border border-white/5 rounded-md bg-white/5 hover:bg-white/10 transition-colors">${_t('vc_hist_more')}</button>` : '';
      return `<div class="relative z-10 px-5 pb-4 pt-2 bg-zinc-900/30 backdrop-blur-md border-t border-white/5"><div class="text-[9px] text-white/30 font-bold uppercase tracking-[0.15em] mb-1.5">${_t('hist_title')}</div>${rows}${moreBtn}</div>`;
    }

    _showDetailedHistory() {
      if (document.getElementById('vc-detailed-history')) return;
      const h = window.yaireVcHistoryData || [];
      const lang = _getLang();
      const rows = h.map(s => {
        const d = new Date(s.date);
        const label = d.toLocaleDateString(lang, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}) + ' · ' + d.toLocaleTimeString(lang, {hour:'2-digit',minute:'2-digit'});
        const m = Math.floor(s.duration/60), sec = s.duration%60;
        return `
          <div class="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <div>
              <div class="text-white font-bold text-sm mb-1">${s.name}</div>
              <div class="text-white/40 text-[11px] capitalize">${label}</div>
            </div>
            <div class="text-amber-400 font-medium text-xs bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20">
              ${m}m ${sec}s
            </div>
          </div>
        `;
      }).join('');

      const modal = document.createElement('div');
      modal.id = 'vc-detailed-history';
      modal.className = 'fixed inset-0 z-[100000] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
      modal.innerHTML = `
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" id="vc-det-bg"></div>
        <div class="relative w-full max-w-lg max-h-[80vh] flex flex-col bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden scale-95 transition-transform duration-300" id="vc-det-card">
          <div class="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
            <h2 class="text-white font-extrabold text-xl tracking-tight">${_t('vc_hist_full')}</h2>
            <button class="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-colors" id="vc-det-close">✕</button>
          </div>
          <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-3 vc-scroll">
            ${rows}
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Animate in
      requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('#vc-det-card').classList.remove('scale-95');
      });

      const closeFunc = () => {
        modal.classList.add('opacity-0');
        modal.querySelector('#vc-det-card').classList.add('scale-95');
        setTimeout(() => modal.remove(), 300);
      };

      modal.querySelector('#vc-det-close').addEventListener('click', closeFunc);
      modal.querySelector('#vc-det-bg').addEventListener('click', closeFunc);
    }

    _tplConnected() {
      const userRows = this.users.map(u => {
        const isMe = u.id === this.myId;
        const initials = u.displayName.slice(0, 2).toUpperCase();
        const isMuted = isMe ? this.muted : u.muted;
        const isDnd   = isMe ? this.dnd   : u.dnd;
        
        const avatarHtml = (u.photoURL || (isMe && window.yaireCurrentUser?.photoURL)) 
          ? `<img src="${u.photoURL || window.yaireCurrentUser?.photoURL}" class="w-full h-full rounded-full object-cover" draggable="false" />` 
          : initials;

        const micIcon = isMuted ? `<span class="text-red-500 w-4 h-4 vc-mico">${ICONS.micOff}</span>` : '';
        const bellIcon = isDnd ? `<span class="text-purple-400 w-4 h-4 vc-dico" title="DND">${ICONS.dnd}</span>` : '';

        return `
          <div class="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors vc-user group" id="vc-u-${u.id}">
            <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all relative ${isMe ? 'bg-amber-500/20 text-amber-500 border-2 border-transparent' : 'bg-pink-500/20 text-pink-500 border-2 border-transparent'} vc-av" id="vc-av-${u.id}">
              ${avatarHtml}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-white text-sm font-medium truncate">${u.displayName} ${isMe ? `<span class="text-white/30 text-[10px] ml-1 px-1.5 py-0.5 rounded-md bg-white/10">${_t('tag_you')}</span>` : ''}</div>
            </div>
            <div class="flex items-center gap-2 pr-1 opacity-100 vc-icons-container">
               ${bellIcon}${micIcon}
            </div>
          </div>`;
      }).join('');

      // Render tab contents based on _activeTab state
      const isRoom = this._activeTab === 'room';
      const isChat = this._activeTab === 'chat';
      const isMusic = this._activeTab === 'music';

      return `
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 bg-zinc-900/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center relative overflow-hidden [&>svg]:w-5 [&>svg]:h-5 [&>svg]:relative [&>svg]:z-10">${ICONS.sound}</div>
            <div>
              <div class="text-white font-bold text-sm">#principal</div>
              <div class="text-white/40 text-[11px] flex items-center gap-1.5 vc-sub">
                <div class="w-1.5 h-1.5 rounded-full bg-green-500" style="animation: vc-blink 2s infinite"></div>
                ${this.users.length}/4 · <span id="vc-timer" class="tabular-nums font-mono vc-timer">00:00</span>
              </div>
            </div>
          </div>
          <button class="text-white/30 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors" id="vc-close">✕</button>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center px-2 py-1 mx-5 mt-2 bg-black/40 rounded-lg p-1">
          <button class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${isRoom ? 'bg-zinc-800 text-white shadow-md' : 'text-white/40 hover:text-white/80'}" id="vc-tab-room">
             ${_t('vc_tab_room')}
          </button>
          <button class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all relative ${isChat ? 'bg-zinc-800 text-white shadow-md' : 'text-white/40 hover:text-white/80'}" id="vc-tab-chat">
             ${_t('vc_chat')} ${this._chatUnread > 0 ? `<span class="absolute top-0 right-2 w-2 h-2 bg-red-500 rounded-full"></span>` : ''}
          </button>
          <button class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${isMusic ? 'bg-zinc-800 text-white shadow-md' : 'text-white/40 hover:text-white/80'}" id="vc-tab-music">
             ${_t('vc_music')} ${this._musicPlaying ? `<div class="flex items-end gap-[1px] h-2.5 vc-music-ind">
               <div class="w-[2px] bg-amber-500 animate-[vc-eq_0.8s_ease-in-out_infinite]"></div>
               <div class="w-[2px] bg-amber-500 animate-[vc-eq_0.8s_ease-in-out_infinite_0.2s]"></div>
               <div class="w-[2px] bg-amber-500 animate-[vc-eq_0.8s_ease-in-out_infinite_0.4s]"></div>
             </div>` : ''}
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="h-[250px] relative overflow-hidden">
          
          <!-- ROOM TAB -->
          <div class="absolute inset-0 flex flex-col ${isRoom ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-8 pointer-events-none'}" id="vc-content-room">
            <div class="flex-1 overflow-y-auto px-4 py-2 vc-scroll vc-sect">
              <div class="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2 px-2 mt-2 vc-sect-lbl">${_t('sect_in')}</div>
              ${userRows || `<div class="text-center text-white/20 text-xs py-8 vc-empty">${_t('empty_chan')}</div>`}
            </div>
          </div>

          <!-- CHAT TAB -->
          <div class="absolute inset-0 flex flex-col ${isChat ? 'opacity-100 translate-x-0 pointer-events-auto' : (isRoom ? 'opacity-0 translate-x-8 pointer-events-none' : 'opacity-0 -translate-x-8 pointer-events-none')}" id="vc-content-chat">
            <div class="flex-1 overflow-y-auto px-4 pt-2 pb-1 vc-scroll" id="vc-msgs">${this._renderChatMsgs()}</div>
            <div class="px-4 pb-2 text-amber-500/80 text-[10px] hidden" id="vc-chat-typing"></div>
            <div class="p-3 border-t border-white/5 flex gap-2">
              <input class="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-amber-500/50 transition-colors" id="vc-chat-in" type="text" placeholder="${_t('vc_chat_ph')}" autocomplete="off"/>
              <button class="bg-amber-500 text-black w-10 h-10 rounded-xl flex items-center justify-center hover:bg-amber-400 transition-colors shadow-lg" id="vc-chat-send">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>

          <!-- MUSIC TAB -->
          <div class="absolute inset-0 flex flex-col ${isMusic ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'}" id="vc-content-music">
            <div class="flex-1 overflow-y-auto vc-scroll flex flex-col" id="vc-music-inner">
               ${this._renderMusicPanel()}
            </div>
          </div>

        </div>

        <!-- Global Controls -->
        <div class="flex gap-2 p-4 border-t border-white/5 bg-zinc-900/50">
          <button class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${this.muted ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'}" id="vc-mute">
            <span class="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4 flex items-center justify-center">${this.muted ? ICONS.micOff : ICONS.mic}</span>
            ${this.muted ? _t('btn_muted') : _t('btn_mic')}
          </button>
          <button class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${this.dnd ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'}" id="vc-dnd">
            <span class="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4 flex items-center justify-center">${ICONS.bell}</span> DND
          </button>
          <button class="w-[46px] flex-shrink-0 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all [&>svg]:w-4 [&>svg]:h-4" id="vc-leave" title="Salir">
            ${ICONS.phone}
          </button>
        </div>`;
    }

    _updateUsersDOM() {
      if (!this.connected) return;
      const sub = document.querySelector('.vc-sub');
      if (sub && sub.textContent.includes('/4')) {
        const timerTxt = document.getElementById('vc-timer')?.textContent || '00:00';
        sub.innerHTML = `${this.users.length}/4 · <span class="vc-timer" id="vc-timer">${timerTxt}</span>`;
      }
      
      const container = document.querySelector('.vc-sect');
      if (!container) return;
      
      const currentIds = this.users.map(u => String(u.id));
      
      // Remove stale nodes
      container.querySelectorAll('.vc-user').forEach(node => {
        const id = node.id.replace('vc-u-', '');
        if (!currentIds.includes(id)) {
          if (window.gsap) {
            gsap.to(node, { x: 30, opacity: 0, scale: 0.9, duration: 0.3, ease: "power2.in", onComplete: () => node.remove() });
          } else {
            node.remove();
          }
        }
      });
      
      if (this.users.length === 0) {
        if (!container.querySelector('.vc-empty')) {
          const lbl = container.querySelector('.vc-sect-lbl');
          if (lbl) lbl.insertAdjacentHTML('afterend', `<div class="vc-empty">${_t('empty_chan')}</div>`);
        }
        return;
      }
      
      const empty = container.querySelector('.vc-empty');
      if (empty) empty.remove();
      
      this.users.forEach(u => {
        const isMe = u.id === this.myId;
        const isMuted = isMe ? this.muted : u.muted;
        const isDnd   = isMe ? this.dnd   : u.dnd;
        
        let node = document.getElementById(`vc-u-${u.id}`);
        if (!node) {
          node = document.createElement('div');
          node.className = 'flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors vc-user group';
          node.id = `vc-u-${u.id}`;
          
          const avatarHtml = (u.photoURL || (isMe && window.yaireCurrentUser?.photoURL)) 
            ? `<img src="${u.photoURL || window.yaireCurrentUser?.photoURL}" class="w-full h-full rounded-full object-cover" draggable="false" />` 
            : u.displayName.slice(0, 2).toUpperCase();
            
          node.innerHTML = `
            <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all relative ${isMe ? 'bg-amber-500/20 text-amber-500 border-2 border-transparent' : 'bg-pink-500/20 text-pink-500 border-2 border-transparent'} vc-av" id="vc-av-${u.id}">
              ${avatarHtml}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-white text-sm font-medium truncate">${u.displayName} ${isMe ? `<span class="text-white/30 text-[10px] ml-1 px-1.5 py-0.5 rounded-md bg-white/10">${_t('tag_you')}</span>` : ''}</div>
            </div>
            <div class="flex items-center gap-2 pr-1 opacity-100 vc-icons-container">
            </div>
          `;
          container.appendChild(node);
          
          if (window.gsap) {
            gsap.fromTo(node, 
              { x: -30, opacity: 0, scale: 0.9 },
              { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
            );
          }
          
          if (!isMe) {
            node.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              
              // Remove old menu if exists
              const oldMenu = document.getElementById('vc-user-ctx-menu');
              if (oldMenu) oldMenu.remove();
              
              const isLocallyMuted = u.localMuted;
              const menu = document.createElement('div');
              menu.id = 'vc-user-ctx-menu';
              menu.className = 'fixed z-[9999] bg-zinc-900 border border-white/10 shadow-2xl shadow-black/50 rounded-xl py-1.5 px-1.5 flex flex-col min-w-[180px] transform-gpu backdrop-blur-xl';
              
              menu.style.left = e.clientX + 'px';
              menu.style.top = e.clientY + 'px';
              
              menu.innerHTML = `
                <div class="px-3 py-1.5 mb-1 border-b border-white/10">
                  <div class="text-[10px] uppercase font-bold text-white/40 tracking-wider">${u.displayName}</div>
                </div>
                <button class="w-full text-left px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2">
                  <span class="w-4 h-4 flex items-center justify-center ${isLocallyMuted ? 'text-green-400' : 'text-red-400'}">${isLocallyMuted ? ICONS.mic : ICONS.micOff}</span>
                  ${isLocallyMuted ? 'Desmutear localmente' : 'Silenciar localmente'}
                </button>
              `;
              
              document.body.appendChild(menu);
              
              // Ensure it stays inside the viewport
              const rect = menu.getBoundingClientRect();
              if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 10) + 'px';
              if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 10) + 'px';
              
              // Action
              menu.querySelector('button').addEventListener('click', () => {
                u.localMuted = !u.localMuted;
                const audio = this.audios.get(u.id);
                if (audio) audio.muted = u.localMuted;
                this._updateUsersDOM();
                menu.remove();
              });
              
              // Close handler
              const closeMenu = (ev) => {
                if (!menu.contains(ev.target)) {
                  menu.remove();
                  document.removeEventListener('click', closeMenu);
                  document.removeEventListener('contextmenu', closeMenu);
                }
              };
              
              setTimeout(() => {
                document.addEventListener('click', closeMenu);
                document.addEventListener('contextmenu', closeMenu);
              }, 10);
            });
          }
        }
        
        let iconContainer = node.querySelector('.vc-icons-container');
        if (!iconContainer) {
            // Fallback for nodes that somehow lack the container
            iconContainer = document.createElement('div');
            iconContainer.className = 'flex items-center gap-2 pr-1 opacity-100 vc-icons-container';
            node.appendChild(iconContainer);
        }
        
        const existingDnd = iconContainer.querySelector('.vc-dico');
        if (isDnd && !existingDnd) {
          const mico = iconContainer.querySelector('.vc-mico');
          if (mico) mico.insertAdjacentHTML('beforebegin', `<span class="text-purple-400 w-4 h-4 vc-dico" title="${_t('btn_dnd')}">${ICONS.dnd}</span>`);
          else iconContainer.insertAdjacentHTML('beforeend', `<span class="text-purple-400 w-4 h-4 vc-dico" title="${_t('btn_dnd')}">${ICONS.dnd}</span>`);
        } else if (!isDnd && existingDnd) {
          existingDnd.remove();
        }
        
        const existingMic = iconContainer.querySelector('.vc-mico');
        if ((isMuted || u.localMuted) && !existingMic) {
          iconContainer.insertAdjacentHTML('beforeend', `<span class="text-red-500 w-4 h-4 vc-mico" title="${u.localMuted ? 'Silenciado localmente' : 'Silenciado'}">${ICONS.micOff}</span>`);
        } else if (!isMuted && !u.localMuted && existingMic) {
          existingMic.remove();
        } else if ((isMuted || u.localMuted) && existingMic) {
          existingMic.title = u.localMuted ? 'Silenciado localmente' : 'Silenciado';
        }
      });
    }

    _render(tpl) {
      if (this._loginPollInt) { clearInterval(this._loginPollInt); this._loginPollInt = null; }
      this.panel.innerHTML = tpl;
      this._bindPanelEvents();
      
      if (document.getElementById('vc-join')) {
        const updateConnCount = () => {
          fetch(SIGNALING_URL + '/health').then(r => r.json()).then(data => {
            const cnt = document.getElementById('vc-conn-count');
            if (cnt) {
              if (data.users === 0) {
                cnt.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-white/20 inline-block mr-1.5"></span><span class="text-white/30">${_t('vc_nobody')}</span>`;
              } else {
                cnt.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block mr-1.5 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span><span class="text-amber-500/90">${data.users} ${data.users === 1 ? _t('vc_person') : _t('vc_persons')}</span>`;
              }
              cnt.classList.remove('opacity-0');
            }
          }).catch(()=>{});
        };
        updateConnCount();
        this._loginPollInt = setInterval(updateConnCount, 5000);
      }
    }

    _bindPanelEvents() {
      const btnVerMas = document.getElementById('vc-btn-ver-mas');
      if (btnVerMas) btnVerMas.addEventListener('click', () => this._showDetailedHistory());

      const xBtn = document.getElementById('vc-close');
      if (xBtn) xBtn.addEventListener('click', () => this._toggle());

      const vcGoogleBtn = document.getElementById('vc-google-login-btn');
      if (vcGoogleBtn) {
        vcGoogleBtn.addEventListener('click', () => {
          const mainLogin = document.getElementById('auth-btn-login');
          if (mainLogin) mainLogin.click();
        });
        vcGoogleBtn.addEventListener('mouseover', () => vcGoogleBtn.style.opacity = '0.9');
        vcGoogleBtn.addEventListener('mouseout', () => vcGoogleBtn.style.opacity = '1');
      }

      const joinBtn = document.getElementById('vc-join');
      const nameInput = document.getElementById('vc-name');
      const passInput = document.getElementById('vc-pass');

      const playTyping = () => {
        this._playSfx('typing', 0.2);
      };

        if (joinBtn) {
          joinBtn.addEventListener('click', () => {
             const name = document.getElementById('vc-name').value.trim();
             joinBtn.disabled = true;
             joinBtn.innerHTML = '<div class="vc-spin"></div>';
             this._doJoin(name);
          });
        }

      const reconnectBtn = document.getElementById('vc-reconnect');
      if (reconnectBtn) reconnectBtn.addEventListener('click', () => {
        if (this._savedName && this._savedPass) {
          this._render(this._tplLoading());
          this.progNode = this._playSfx('progress', 0.3, true);
          this._connectSocket(this._savedName, this._savedPass);
        } else {
          this._render(this._tplLogin());
        }
      });

      const muteBtn  = document.getElementById('vc-mute');
      const dndBtn   = document.getElementById('vc-dnd');
      const leaveBtn = document.getElementById('vc-leave');
      if (muteBtn)  muteBtn.addEventListener('click',  () => this._toggleMute());
      if (dndBtn)   dndBtn.addEventListener('click',   () => this._toggleDND());
      if (leaveBtn) leaveBtn.addEventListener('click', () => this._leave());

      // Tabs logic
      const switchTab = (tab) => {
        if (this._activeTab === tab) return;
        this._activeTab = tab;
        if (tab === 'chat') {
          this._chatUnread = 0;
          document.title = '28E';
          this._playSfx('toggleOn', 0.3);
        } else {
          this._playSfx('toggleOff', 0.3);
        }
        this._updateTabs();
      };
      
      const tabRoom = document.getElementById('vc-tab-room');
      const tabChat = document.getElementById('vc-tab-chat');
      const tabMusic = document.getElementById('vc-tab-music');

      if (tabRoom) tabRoom.addEventListener('click', () => switchTab('room'));
      if (tabChat) tabChat.addEventListener('click', () => switchTab('chat'));
      if (tabMusic) tabMusic.addEventListener('click', () => switchTab('music'));

      // Chat send & typing
      const chatSend = document.getElementById('vc-chat-send');
      const chatIn = document.getElementById('vc-chat-in');
      if (chatSend) chatSend.addEventListener('click', () => this._sendChat());
      if (chatIn) {
        let typingTimer;
        chatIn.addEventListener('input', () => {
          this._playSfx('typing', 0.15);
          if (this.socket && !this._isTyping) {
            this._isTyping = true;
            this.socket.emit('chat_typing', { isTyping: true });
          }
          clearTimeout(typingTimer);
          typingTimer = setTimeout(() => {
            this._isTyping = false;
            if (this.socket) this.socket.emit('chat_typing', { isTyping: false });
          }, 1500);
        });
        chatIn.addEventListener('keydown', e => { 
          if (e.key === 'Enter') {
            this._sendChat();
            clearTimeout(typingTimer);
            this._isTyping = false;
            if (this.socket) this.socket.emit('chat_typing', { isTyping: false });
          }
        });
        
        // Auto focus if chat tab was just opened
        if (this._activeTab === 'chat' && document.activeElement !== chatIn) {
           setTimeout(() => chatIn.focus(), 50);
        }
      }

      this._bindMusicEvents();
    }

    updateTranslations() {
      if (this.fab) this.fab.title = _t('vc_title');
      
      if (this.connected) {
         this._updateTabs();
      } else if (this.panel && this.panel.classList.contains('scale-100')) {
         this._render(this._tplLogin());
      }
      
      const bTitle = document.getElementById('vc-bar-title');
      const bSub = document.getElementById('vc-bar-sub');
      if (bTitle && bSub) {
        bTitle.textContent = _t('bar_conn').split(' · ')[0];
        bSub.textContent = _t('bar_conn').split(' · ')[1] || '';
      }
    }

    _updateTabs() {
      if (this.connected) {
         this._render(this._tplConnected());
         this._updateBarChatState();
         
         const bTitle = document.getElementById('vc-bar-title');
         const bSub = document.getElementById('vc-bar-sub');
         if (bTitle && bSub) {
           bTitle.textContent = _t('bar_conn').split(' · ')[0];
           bSub.textContent = _t('bar_conn').split(' · ')[1] || '';
         }
         
         if (window.gsap) {
           const activeContent = document.getElementById(`vc-content-${this._activeTab}`);
           if (activeContent) {
             gsap.fromTo(activeContent, 
               { opacity: 0, x: 20 },
               { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }
             );
           }
         }
      }
    }

    async _doJoin(name) {
      if (!name) return this._setErr(_t('err_name'));

      this.myName = name;
      localStorage.setItem('28e_vc_name', name);
      this._savedName = name;
      
      try {
          const res = await fetch('https://yaire-591ca-default-rtdb.firebaseio.com/config/voicePassword.json');
          const pass = await res.json();
          this._savedPass = pass;
      } catch (e) {
          this._savedPass = 'error';
      }

      this._render(this._tplLoading());
      this.progNode = this._playSfx('progress', 0.3, true);

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: this._audioConstraints, video: false });
      } catch {
        this._stopSfx(this.progNode); this.progNode = null;
        this._render(this._tplLogin(_t('err_mic')));
        return;
      }

      // Create noise-cancelled processed stream
      this._processedStream = this._createProcessedStream();
      console.log('[VC] 🔇 Noise cancellation pipeline active');

      this._connectSocket(name, this._savedPass);
    }

    _setErr(msg) {
      const el = document.getElementById('vc-err');
      if (el) el.textContent = msg;
    }

    // ── SOCKET ─────────────────────────────────────────────────────────────
    _connectSocket(name, pass) {
      // Destroy previous socket cleanly before creating a new one
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      const doConnect = () => {
        this.socket = io(SIGNALING_URL, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1500,
          timeout: 20000
        });

        this.socket.on('connect', () => {
          this.socket.emit('join_channel', { password: pass, displayName: name, photoURL: window.yaireCurrentUser?.photoURL || null });
        });

        this.socket.on('join_error', ({ message }) => {
          this._stopSfx(this.progNode); this.progNode = null;
          this._cleanup();
          this._render(this._tplLogin(message));
        });

        this.socket.on('joined', async ({ userId, existingUsers }) => {
          this._stopSfx(this.progNode); this.progNode = null;
          this._playSfx('act_launch', 0.5);

          // Clean up old peers from previous session (reconnect scenario)
          this.peers.forEach((_, id) => this._closePeer(id));
          this.peers.clear();
          this.pendingIce.clear();

          // Re-acquire microphone if stream was lost
          if (!this.stream || this.stream.getAudioTracks().every(t => t.readyState === 'ended')) {
            try {
              this.stream = await navigator.mediaDevices.getUserMedia({ audio: this._audioConstraints, video: false });
              this._processedStream = this._createProcessedStream();
              console.log('[VC] ✅ Microphone re-acquired with noise cancellation');
            } catch(e) {
              console.error('[VC] ❌ Could not re-acquire microphone:', e);
            }
          }

          this.myId = userId;
          this.connected = true;
          this._reconnects = 0;
          this.fab.classList.add('connected');

          // Prevent duplicate timers/speakers
          if (!this._timerInt) this._startTimer();
          if (!this._analyser) this._setupSpeaking();
          if (!this._wakeLock && !this._silentAudio) this._startKeepAlive();

          for (const u of existingUsers) await this._createOffer(u.id);

          // Ring other users and clear invite state
          this.socket.emit('ring_channel');
          this._inviterName = null;
          this._chatMsgs = [];
          this._chatUnread = 0;
          this.socket.emit('music_sync_request');
        });

        this.socket.on('channel_users', ({ users }) => {
          this.users = users.map(u => {
            const existing = this.users.find(eu => eu.id === u.id);
            if (existing && existing.localMuted !== undefined) u.localMuted = existing.localMuted;
            return u;
          });
          if (this.connected) {
            if (!document.getElementById('vc-leave')) {
              this._render(this._tplConnected());
            } else {
              this._updateUsersDOM();
            }
          }
        });

        this.socket.on('user_joined', ({ userId, displayName }) => {
          this._playSfx('act_join', 0.5);
          if (typeof window.showToast === 'function') {
            window.showToast(`${displayName} ${_t('toast_join')}`, "var(--accent-green)", ICONS.sound);
          }
        });

        this.socket.on('user_left', ({ userId }) => {
          this._playSfx('act_left', 0.5);
          const u = this.users.find(x => x.id === userId);
          if (u && typeof window.showToast === 'function') {
            window.showToast(`${u.displayName} ${_t('toast_left')}`, "var(--accent-red)", ICONS.phone);
          }
          this._closePeer(userId);
        });

        this.socket.on('speaking_state', ({ from, speaking }) => {
          this._updateAvatar(from, speaking);
        });

        // ── CHAT MESSAGE ──────────────────────────────────────────────────
        this.socket.on('chat_message', ({ from, name, text, ts }) => {
          if (from === this.myId) return; // Ignore self (handled by local echo)
          this._appendChatMsg(from, name, text, ts);
        });

        // ── CHAT TYPING ───────────────────────────────────────────────────
        this.socket.on('chat_typing', ({ from, name, isTyping }) => {
          if (from === this.myId) return;
          const typingEl = document.getElementById('vc-chat-typing');
          if (typingEl) {
            if (isTyping) {
              typingEl.textContent = `${name} ${_t('vc_typing')}`;
              typingEl.classList.remove('hidden');
              typingEl.classList.add('block');
              // Auto-scroll to show typing indicator if at bottom
              const msgsEl = document.getElementById('vc-msgs');
              if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
            } else {
              typingEl.classList.add('hidden');
              typingEl.classList.remove('block');
            }
          }
        });

        // ── INCOMING RING ─────────────────────────────────────────────────
        this.socket.on('incoming_ring', ({ from, name }) => {
          if (this.connected) return; // already in channel
          this._showRingOverlay(name);
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
          if (this.connected) this._updateUsersDOM();
        });

        this.socket.on('user_dnd_state', ({ userId, dnd }) => {
          const u = this.users.find(x => x.id === userId);
          if (u) u.dnd = dnd;
          if (this.connected) this._updateUsersDOM();
        });

        // Only clean up UI on intentional/permanent disconnects
        this.socket.on('disconnect', (reason) => {
          if (reason === 'io client disconnect' || reason === 'io server disconnect') {
            this.connected = false;
            this._cleanup();
            if (this._bar) this._bar.classList.remove('show');
            this._render(this._tplLogin());
          }
          // For transport drops, socket.io reconnects silently in background
        });

        this.socket.on('kicked', () => {
          this.connected = false;
          if (this.socket) { this.socket.disconnect(); }
          this._cleanup();
          if (this._bar) this._bar.classList.remove('show');
          this._render(this._tplLogin("Has sido expulsado del canal por un administrador."));
        });

        // ── MUSIC EVENTS ────────────────────────────────────────────────────
        this.socket.on('music_queue_update', ({ queue, state }) => {
          this._musicQueue = queue;
          this._musicState = state;
          this._updateMusicUI();
        });

        this.socket.on('music_play', async ({ track, state }) => {
          this._musicState = state;
          this._playSfx('music_start', 0.5);
          const elapsed = state.startedAt ? (Date.now() - state.startedAt) / 1000 : 0;
          await this._playMusicTrack(track, Math.max(0, elapsed));
        });

        this.socket.on('music_state_update', ({ state }) => {
          this._musicState = state;
          if (state.isPlaying) this._resumeMusic();
          else this._pauseMusic();
        });

        this.socket.on('music_stop', () => {
          this._musicState = { currentIndex: -1, isPlaying: false };
          this._stopMusic();
          this._playSfx('music_end_all', 0.5);
        });

        this.socket.on('music_seek', ({ time }) => {
          this._seekMusic(time);
        });

        this.socket.on('music_sync', async ({ queue, state, currentTrack, currentTime }) => {
          this._musicQueue = queue;
          this._musicState = state;
          if (currentTrack && state.isPlaying) {
            await this._playMusicTrack(currentTrack, Math.max(0, currentTime || 0));
          } else if (currentTrack) {
            this._musicCurrentTrack = currentTrack;
            this._musicPlaying = false;
            this._updateMusicUI();
          }
        });

        // Re-join channel silently after background reconnect
        this.socket.io.on('reconnect', () => {
          if (this._savedName && this._savedPass) {
            this.socket.emit('join_channel', { password: this._savedPass, displayName: this._savedName, photoURL: window.yaireCurrentUser?.photoURL || null });
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
      // Close any existing peer connection for this peer first (prevents ghost connections)
      if (this.peers.has(peerId)) {
        console.log(`[VC] Closing existing peer ${peerId} before creating new one`);
        this._closePeer(peerId);
      }

      const pc = new RTCPeerConnection(this.ice);
      // Use noise-cancelled stream for peers, fallback to raw stream
      const outStream = this._processedStream || this.stream;
      if (outStream) {
        outStream.getTracks().forEach(t => pc.addTrack(t, outStream));
      }
      this.peers.set(peerId, pc);

      // Log ICE connection state changes for debugging
      pc.oniceconnectionstatechange = () => {
        console.log(`[VC] ICE state for ${peerId}: ${pc.iceConnectionState}`);
        if (pc.iceConnectionState === 'failed') {
          console.warn('[VC] ICE failed — attempting restart');
          pc.restartIce();
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`[VC] Connection state for ${peerId}: ${pc.connectionState}`);
      };

      pc.onicegatheringstatechange = () => {
        console.log(`[VC] ICE gathering for ${peerId}: ${pc.iceGatheringState}`);
      };

      pc.onicecandidate = ({ candidate }) => {
        if (candidate && this.socket) {
          console.log(`[VC] Sending ICE candidate to ${peerId}: ${candidate.type || 'unknown'} ${candidate.protocol || ''}`);
          this.socket.emit('ice_candidate', { to: peerId, candidate });
        }
      };

      pc.ontrack = (event) => {
        console.log(`[VC] Received remote track from ${peerId}:`, event.track.kind, event.track.readyState);
        const stream = event.streams[0] || new MediaStream([event.track]);
        let audio = this.audios.get(peerId);
        if (!audio) {
          audio = document.createElement('audio');
          audio.autoplay = true;
          audio.playsInline = true;
          audio.setAttribute('playsinline', '');
          audio.setAttribute('webkit-playsinline', '');
          audio.dataset.vcPeer = 'true';
          // iOS Safari needs the audio element in the DOM
          document.body.appendChild(audio);
          this.audios.set(peerId, audio);
        }
        audio.srcObject = stream;
        audio.volume = this.dnd ? 0 : 1;
        const u = this.users.find(x => x.id === peerId);
        audio.muted = u && u.localMuted ? true : false;
        // Robust play with retry — crucial for mobile browsers
        this._robustPlay(audio, peerId);
      };

      return pc;
    }

    _forceHighBitrateSDP(sdp) {
      if (sdp.includes('useinbandfec=1')) {
        return sdp.replace(/useinbandfec=1/g, 'useinbandfec=1; stereo=1; sprop-stereo=1; maxaveragebitrate=128000');
      } else {
        return sdp.replace(/(a=fmtp:111\s+.*)/g, '$1; stereo=1; sprop-stereo=1; maxaveragebitrate=128000');
      }
    }

    async _createOffer(peerId) {
      const pc = this._makePeer(peerId);
      const offer = await pc.createOffer();
      offer.sdp = this._forceHighBitrateSDP(offer.sdp);
      await pc.setLocalDescription(offer);
      console.log(`[VC] Sending offer to ${peerId} (HQ Audio)`);
      this.socket.emit('webrtc_offer', { to: peerId, sdp: pc.localDescription });
    }

    async _handleOffer(fromId, sdp) {
      const pc = this._makePeer(fromId);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      answer.sdp = this._forceHighBitrateSDP(answer.sdp);
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
      
      const btn = document.getElementById('vc-mute');
      if (btn) {
        btn.className = `flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${this.muted ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'}`;
        btn.innerHTML = `<span class="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4 flex items-center justify-center">${this.muted ? ICONS.micOff : ICONS.mic}</span> ${this.muted ? _t('btn_muted') : _t('btn_mic')}`;
        const svg = btn.querySelector('svg');
        if (svg) {
          svg.style.transform = 'scale(1.3)';
          setTimeout(() => { if (svg) svg.style.transform = ''; }, 150);
        }
      }
      this._updateUsersDOM();
      this._playSfx(this.muted ? 'toggleOff' : 'toggleOn', 0.4);
    }

    _toggleDND() {
      this.dnd = !this.dnd;
      this.audios.forEach(a => { a.volume = this.dnd ? 0 : 1; });
      if (this._ytPlayer && typeof this._ytPlayer.setVolume === 'function') {
        this._ytPlayer.setVolume(this.dnd ? 0 : this._musicVolume);
      }
      this.socket && this.socket.emit('dnd_state', { dnd: this.dnd });
      
      const btn = document.getElementById('vc-dnd');
      if (btn) {
        btn.className = `flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${this.dnd ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'}`;
        btn.innerHTML = `<span class="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4 flex items-center justify-center">${ICONS.bell}</span> DND`;
        const svg = btn.querySelector('svg');
        if (svg) {
          svg.style.transform = 'scale(1.2) rotate(-15deg)';
          setTimeout(() => { if (svg) svg.style.transform = ''; }, 150);
        }
      }
      this._updateUsersDOM();
      this._playSfx(this.dnd ? 'toggleOff' : 'toggleOn', 0.4);
    }

    // ── LEAVE ─────────────────────────────────────────────────────────────
    _leave() {
      this._playSfx('act_end', 0.5);
      if (this.socket) { this.socket.emit('leave_channel'); this.socket.disconnect(); this.socket = null; }
      this._cleanup();
      this._bar.classList.remove('show');
      this._render(this._tplLogin());
    }

    // ── CHAT METHODS ────────────────────────────────────────────────────
    _renderChatMsgs() {
      if (this._chatMsgs.length === 0) return `<div class="text-center text-white/20 text-xs py-8">${_t('vc_chat_empty')}</div>`;
      
      let html = '';
      let lastFrom = null;

      for (let i = 0; i < this._chatMsgs.length; i++) {
        const m = this._chatMsgs[i];
        const isMe = m.from === this.myId;
        const time = new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const escText = this._escHtml(m.text);
        const isEmojiOnly = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\s)+$/u.test(m.text) && m.text.trim().length > 0;
        
        const bubbleClass = isEmojiOnly 
          ? 'text-4xl py-1' 
          : (isMe ? 'bg-black text-white rounded-2xl px-3 py-2 text-sm shadow-sm font-medium border border-white/10' : 'bg-white text-zinc-900 rounded-2xl px-3 py-2 text-sm shadow-sm font-medium');
              
        const isGrouped = (lastFrom === m.from);
        
        if (!isGrouped) {
          if (i > 0) html += `</div></div>`; // close previous group
          html += `
          <div class="flex flex-col mb-3 ${isMe ? 'items-end' : 'items-start'} vc-chat-msg" data-from="${m.from}">
            <div class="flex items-baseline gap-2 mb-1 px-1">
              <span class="text-[10px] font-bold ${isMe ? 'text-amber-500' : 'text-white/60'}">${m.name}</span>
              <span class="text-[9px] text-white/30">${time}</span>
            </div>
            <div class="flex flex-col gap-1 w-full ${isMe ? 'items-end' : 'items-start'} vc-chat-bubbles">
              <div class="max-w-[85%] ${bubbleClass}">${escText}</div>`;
        } else {
          html += `<div class="max-w-[85%] ${bubbleClass}">${escText}</div>`;
        }
        
        lastFrom = m.from;
        
        if (i === this._chatMsgs.length - 1) {
          html += `</div></div>`; // close last group
        }
      }
      return html;
    }

    // Obsolete _toggleChat removed

    _sendChat() {
      const input = document.getElementById('vc-chat-in');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;
      if (this.socket) this.socket.emit('chat_message', { text });
      
      // Local echo (makes it feel instant, and works even if server doesn't bounce it back yet)
      this._appendChatMsg(this.myId, this.myName, text, Date.now());
      
      input.value = '';
      input.focus();
    }

    _appendChatMsg(from, name, text, ts) {
      this._chatMsgs.push({ from, name, text, ts });
      if (this._chatMsgs.length > 50) this._chatMsgs.shift();

      const isMe = from === this.myId;
      if (!isMe) this._playSfx('vc_chat_msg', 0.4);

      // Unread badge logic
      if (this._activeTab !== 'chat' && !isMe) {
        this._chatUnread++;
        if (this.connected) this._updateTabs();

        // ✨ Notificación en título de ventana
        const unreadCount = this._chatUnread > 9 ? '+9' : `+${this._chatUnread}`;
        document.title = `\uD83D\uDCAC ${unreadCount} | 28E`;
        // Restaurar título automáticamente al volver a la pestaña
        if (!this._vcTitleListener) {
          this._vcTitleListener = () => {
            if (document.visibilityState === 'visible') {
              document.title = '28E';
            }
          };
          document.addEventListener('visibilitychange', this._vcTitleListener);
        }
      }

      // Append to DOM
      const msgsEl = document.getElementById('vc-msgs');
      if (msgsEl) {
        // remove empty state if exists
        const emptyEl = msgsEl.firstElementChild;
        if (emptyEl && emptyEl.textContent === _t('vc_chat_empty')) emptyEl.remove();
        
        const time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const escText = this._escHtml(text);
        const isEmojiOnly = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\s)+$/u.test(text) && text.trim().length > 0;
        
        const bubbleClass = isEmojiOnly 
          ? 'text-4xl py-1' 
          : (isMe ? 'bg-black text-white rounded-2xl px-3 py-2 text-sm shadow-sm font-medium border border-white/10' : 'bg-white text-zinc-900 rounded-2xl px-3 py-2 text-sm shadow-sm font-medium');
              
        const lastMsgEl = msgsEl.lastElementChild;
        const lastFrom = lastMsgEl ? lastMsgEl.getAttribute('data-from') : null;
        
        let newBubbleEl;

        if (lastFrom === from) {
          // append just the bubble
          const bubblesContainer = lastMsgEl.querySelector('.vc-chat-bubbles');
          bubblesContainer.insertAdjacentHTML('beforeend', `<div class="max-w-[85%] ${bubbleClass}">${escText}</div>`);
          newBubbleEl = bubblesContainer.lastElementChild;
        } else {
          // append full group
          msgsEl.insertAdjacentHTML('beforeend', `
            <div class="flex flex-col mb-3 ${isMe ? 'items-end' : 'items-start'} vc-chat-msg" data-from="${from}">
              <div class="flex items-baseline gap-2 mb-1 px-1">
                <span class="text-[10px] font-bold ${isMe ? 'text-amber-500' : 'text-white/60'}">${name}</span>
                <span class="text-[9px] text-white/30">${time}</span>
              </div>
              <div class="flex flex-col gap-1 w-full ${isMe ? 'items-end' : 'items-start'} vc-chat-bubbles">
                <div class="max-w-[85%] ${bubbleClass}">${escText}</div>
              </div>
            </div>`);
          newBubbleEl = msgsEl.lastElementChild.querySelector('.vc-chat-bubbles').lastElementChild;
        }
          
        if (window.gsap && newBubbleEl) {
          gsap.from(newBubbleEl, {
            y: 20,
            opacity: 0,
            scale: 0.9,
            duration: 0.4,
            ease: "back.out(1.5)",
            onComplete: () => { msgsEl.scrollTop = msgsEl.scrollHeight; }
          });
        }
        msgsEl.scrollTop = msgsEl.scrollHeight;
      }

      if (!isMe) this._playSfx('typing', 0.25);
    }

    _escHtml(str) {
      const d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    // ── RINGTONE OVERLAY ────────────────────────────────────────────────
    _showRingOverlay(callerName) {
      // Don't show if already showing
      if (document.getElementById('vc-ring-overlay')) return;

      this._playRingtone();

      const initials = callerName.slice(0, 2).toUpperCase();
      const overlay = document.createElement('div');
      overlay.id = 'vc-ring-overlay';
      overlay.innerHTML = `
        <div class="vc-ring-label">${_t('vc_ring_title')}</div>
        <div class="vc-ring-avatar">${initials}</div>
        <div class="vc-ring-name">${callerName}</div>
        <div class="vc-ring-sub">${_t('vc_ring_msg')}</div>
        <div class="vc-ring-btns">
          <button class="vc-ring-btn join" id="vc-ring-join">${_t('vc_ring_join')}</button>
          <button class="vc-ring-btn ignore" id="vc-ring-ignore">${_t('vc_ring_ignore')}</button>
        </div>`;
      document.body.appendChild(overlay);

      // Auto-dismiss after 20 seconds
      this._ringTimeout = setTimeout(() => this._dismissRing(), 20000);

      document.getElementById('vc-ring-join').addEventListener('click', () => {
        this._dismissRing();
        // Open the panel for the user to join
        this.panel.classList.add('open');
        this._playSfx('flyin', 0.4, false, 'fly');
        // Focus on the password field
        setTimeout(() => {
          const passEl = document.getElementById('vc-pass');
          if (passEl) passEl.focus();
        }, 200);
      });

      document.getElementById('vc-ring-ignore').addEventListener('click', () => {
        this._dismissRing();
      });
    }

    _dismissRing() {
      clearTimeout(this._ringTimeout);
      this._stopRingtone();
      const overlay = document.getElementById('vc-ring-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s';
        setTimeout(() => overlay.remove(), 300);
      }
    }

    _playRingtone() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        this._ringCtx = ctx;
        const gain = ctx.createGain();
        gain.gain.value = 0.15;
        gain.connect(ctx.destination);
        this._ringGain = gain;

        // Musical ringtone pattern (ascending notes)
        const notes = [523.25, 659.25, 783.99, 880]; // C5, E5, G5, A5
        let noteIndex = 0;

        const playNote = () => {
          if (!this._ringCtx) return;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = notes[noteIndex % notes.length];

          const noteGain = ctx.createGain();
          const t = ctx.currentTime;
          noteGain.gain.setValueAtTime(0, t);
          noteGain.gain.linearRampToValueAtTime(0.3, t + 0.05);
          noteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

          osc.connect(noteGain);
          noteGain.connect(gain);
          osc.start(t);
          osc.stop(t + 0.4);
          noteIndex++;
        };

        // Play pattern: 4 notes, pause, repeat
        const playPattern = () => {
          if (!this._ringCtx) return;
          noteIndex = 0;
          for (let i = 0; i < 4; i++) {
            setTimeout(() => playNote(), i * 200);
          }
        };

        playPattern();
        this._ringInt = setInterval(playPattern, 2000);
      } catch(e) {}
    }

    _stopRingtone() {
      clearInterval(this._ringInt);
      if (this._ringCtx) {
        try { this._ringCtx.close(); } catch(e) {}
        this._ringCtx = null;
      }
    }

    // ── NOISE CANCELLATION PIPELINE ──────────────────────────────────────
    _createProcessedStream() {
      if (!this.stream) return null;

      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
        this._noiseCtx = ctx;

        const source = ctx.createMediaStreamSource(this.stream);

        // ── 1. High-pass filter — kill rumble/hum below 60Hz ──
        const highPass1 = ctx.createBiquadFilter();
        highPass1.type = 'highpass';
        highPass1.frequency.value = 60;
        highPass1.Q.value = 0.7;

        // ── 2. Secondary high-pass at 80Hz for extra speech isolation ──
        const highPass2 = ctx.createBiquadFilter();
        highPass2.type = 'highpass';
        highPass2.frequency.value = 80;
        highPass2.Q.value = 0.5;

        // ── 3. Low-pass filter — remove harsh hiss above 16kHz ──
        const lowPass = ctx.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.value = 16000;
        lowPass.Q.value = 0.5;

        // ── 4. Analyser for noise gate control ──
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.4;
        const dataArray = new Float32Array(analyser.fftSize);

        // ── 5. Noise gate via GainNode ──
        const gateGain = ctx.createGain();
        gateGain.gain.value = 0; // start closed

        // ── 6. Dynamics compressor — even out volume ──
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 20;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.005;
        compressor.release.value = 0.25;

        // ── 7. Output gain — final volume ──
        const outputGain = ctx.createGain();
        outputGain.gain.value = 1.3;

        // Chain: source → highPass1 → highPass2 → lowPass → analyser → gateGain → compressor → outputGain → dest
        const dest = ctx.createMediaStreamDestination();
        source.connect(highPass1);
        highPass1.connect(highPass2);
        highPass2.connect(lowPass);
        lowPass.connect(analyser);
        analyser.connect(gateGain);
        gateGain.connect(compressor);
        compressor.connect(outputGain);
        outputGain.connect(dest);

        // ── Adaptive noise gate control loop ──
        let noiseFloor = -55;        // dB — initial estimate
        let gateOpen = false;
        const GATE_OPEN_MARGIN = 17;
        const GATE_HYSTERESIS = 5;
        const ATTACK_TIME = 0.01;
        const RELEASE_TIME = 0.35;
        const NOISE_ADAPT_FAST = 0.01;
        const NOISE_ADAPT_SLOW = 0.0005; // slow adaptation for falling noise

        const controlGate = () => {
          if (!this._noiseCtx) return;
          analyser.getFloatTimeDomainData(dataArray);

          // Calculate RMS level in dB
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / dataArray.length);
          const db = 20 * Math.log10(Math.max(rms, 1e-10));

          // Adaptive noise floor tracking
          if (db < noiseFloor + 5) {
            // Probably noise — adapt quickly upward, slowly downward
            const rate = db > noiseFloor ? NOISE_ADAPT_FAST : NOISE_ADAPT_SLOW;
            noiseFloor = noiseFloor * (1 - rate) + db * rate;
          }

          const openThreshold = noiseFloor + GATE_OPEN_MARGIN;
          const closeThreshold = openThreshold - GATE_HYSTERESIS;
          const t = ctx.currentTime;

          if (!gateOpen && db > openThreshold) {
            // Open gate — speech detected
            gateOpen = true;
            gateGain.gain.cancelScheduledValues(t);
            gateGain.gain.setValueAtTime(gateGain.gain.value, t);
            gateGain.gain.linearRampToValueAtTime(1, t + ATTACK_TIME);
          } else if (gateOpen && db < closeThreshold) {
            // Close gate — back to noise
            gateOpen = false;
            gateGain.gain.cancelScheduledValues(t);
            gateGain.gain.setValueAtTime(gateGain.gain.value, t);
            gateGain.gain.linearRampToValueAtTime(0, t + RELEASE_TIME);
          }

          this._gateRaf = requestAnimationFrame(controlGate);
        };

        controlGate();

        console.log('[VC] 🎙️ Noise pipeline: HighPass(80+150Hz) → LowPass(8kHz) → NoiseGate(adaptive) → Compressor');
        return dest.stream;

      } catch(e) {
        console.error('[VC] ❌ Noise cancellation setup failed, using raw stream:', e);
        return null;
      }
    }

    _destroyNoiseProcessing() {
      cancelAnimationFrame(this._gateRaf);
      this._gateRaf = null;
      if (this._noiseCtx) {
        try { this._noiseCtx.close(); } catch(e) {}
        this._noiseCtx = null;
      }
    }

    // ── MUSIC METHODS ─────────────────────────────────────────────────────
    // Obsolete _toggleMusic removed

    _cleanMusicTitle(t) {
      if (!t) return t;
      let c = t.replace(/\s*[\[\(](official.*|video oficial|audio oficial|audio|video|music video|lyric.*|visualizer|hd)[\]\)]/gi, '');
      c = c.replace(/\s*[\[\(]?(Spotify|YouTube)[\]\)]?/gi, '');
      c = c.replace(/\s*[-|]\s*$/g, '');
      return c.trim();
    }

    _renderMusicPanel() {
      const track = this._musicCurrentTrack;
      const isPlaying = this._musicPlaying;
      let nowPlaying = '';
      if (track) {
        let currentPct = 0;
        let cTimeFmt = '0:00';
        let tTimeFmt = '0:00';
        
        if (track.type === 'youtube' && this._ytPlayer && typeof this._ytPlayer.getCurrentTime === 'function') {
          const cur = this._ytPlayer.getCurrentTime() || 0;
          const tot = this._ytPlayer.getDuration() || 0;
          if (tot > 0) currentPct = (cur / tot) * 100;
          
          const fmt = (secs) => {
            if (!secs || isNaN(secs)) return '0:00';
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return `${m}:${s < 10 ? '0'+s : s}`;
          };
          cTimeFmt = fmt(cur);
          tTimeFmt = fmt(tot);
        }

        const eqBars = isPlaying
          ? `<div class="flex items-end gap-0.5 h-3"><div class="w-0.5 bg-amber-500 rounded-full animate-[vc-eq_0.8s_ease-in-out_infinite]"></div><div class="w-0.5 bg-amber-500 rounded-full animate-[vc-eq_0.8s_ease-in-out_infinite_0.2s]"></div><div class="w-0.5 bg-amber-500 rounded-full animate-[vc-eq_0.8s_ease-in-out_infinite_0.4s]"></div></div>`
          : `<span class="w-4 h-4 text-white/40 [&>svg]:w-4 [&>svg]:h-4 flex items-center justify-center">${ICONS.sound || '♪'}</span>`;
        nowPlaying = `
          <div class="bg-white/5 border border-white/10 rounded-xl p-3 mb-2 relative overflow-hidden">
            <div class="flex items-center gap-3 relative z-10 mb-2">
              <div class="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center flex-shrink-0">
                ${eqBars}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[9px] text-amber-500 font-bold uppercase tracking-wider mb-0.5">${_t('vc_music_now')}</div>
                ${this._cleanMusicTitle(track.title).length > 25 
                  ? `<div class="vc-marquee-container text-sm font-bold text-white">
                       <div class="vc-marquee-content">${this._escHtml(this._cleanMusicTitle(track.title))}</div>
                       <div class="vc-marquee-content" aria-hidden="true">${this._escHtml(this._cleanMusicTitle(track.title))}</div>
                     </div>` 
                  : `<div class="text-sm font-bold text-white truncate">${this._escHtml(this._cleanMusicTitle(track.title))}</div>`
                }
                <div class="text-[10px] text-white/40 truncate">${track.addedByName ? `${_t('vc_music_by')} ${track.addedByName}` : ''}</div>
              </div>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/50">${(track.source || track.type) === 'youtube' ? 'YT' : 'SP'}</span>
            </div>
            
            ${track.type === 'youtube' ? `
              <div class="relative z-10 mb-3">
                <div class="h-1 bg-black/50 rounded-full overflow-hidden relative" id="vc-music-progress">
                  <div class="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-200" id="vc-music-progress-fill" style="width: ${currentPct}%"></div>
                </div>
                <div class="flex justify-between text-[9px] text-white/40 mt-1 font-mono">
                  <span id="vc-music-time-current">${cTimeFmt}</span>
                  <span id="vc-music-time-total">${tTimeFmt}</span>
                </div>
              </div>
            ` : ''}
            
            ${track.type === 'spotify' ? `<div class="mt-2 w-full" id="vc-spotify-embed"></div>` : ''}
            
            <div class="flex justify-between items-center relative z-10">
              <div class="flex items-center gap-2">
                <button class="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform [&>svg]:w-4 [&>svg]:h-4 shadow-md" id="vc-music-playpause">
                  ${isPlaying ? ICONS.pause : ICONS.play}
                </button>
                <button class="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors [&>svg]:w-4 [&>svg]:h-4" id="vc-music-skip">
                  ${ICONS.skipFwd}
                </button>
              </div>
              <div class="w-[45%] flex items-center gap-2 pr-1">
                <span class="text-white/40 [&>svg]:w-3.5 [&>svg]:h-3.5">${ICONS.volumeUp}</span>
                <input type="range" id="vc-music-vol-slider" min="0" max="100" value="${this._musicVolume}" class="w-full h-1 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-500" />
              </div>
            </div>
          </div>`;
      } else {
        nowPlaying = `<div class="text-center text-white/20 text-xs py-3 mb-2 bg-white/5 rounded-xl border border-white/5">${_t('vc_music_no_track')}</div>`;
      }
      
      const queueItems = this._musicQueue.length > 0
        ? this._musicQueue.map((t, i) => {
            const isCur = i === this._musicState.currentIndex;
            return `
            <div class="flex items-center gap-3 p-2 rounded-lg transition-colors ${isCur ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/5'}">
              <span class="w-4 text-center text-[10px] font-bold ${isCur ? 'text-amber-500' : 'text-white/30'}">${isCur && this._musicPlaying ? '♪' : (i + 1)}</span>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium text-white truncate ${isCur ? 'text-amber-500' : ''}">${this._escHtml(this._cleanMusicTitle(t.title))}</div>
                <div class="text-[10px] text-white/30 truncate">${t.addedByName || ''}</div>
              </div>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/30">${(t.source || t.type) === 'youtube' ? 'YT' : 'SP'}</span>
              ${!isCur ? `<button class="vc-music-track-rm w-6 h-6 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors [&>svg]:w-3 [&>svg]:h-3" data-track-id="${t.id}">${ICONS.trash}</button>` : ''}
            </div>`;
          }).join('')
        : `<div class="text-center text-white/20 text-xs py-4">${_t('vc_music_empty_q')}</div>`;
        
      return `
        <div class="p-3 flex-1 flex flex-col">
          ${nowPlaying}
          <div class="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1 px-1">${_t('vc_music_queue')} ${this._musicQueue.length > 0 ? `(${this._musicQueue.length})` : ''}</div>
          <div class="flex flex-col gap-1 mb-2" id="vc-music-queue">${queueItems}</div>
          <div class="mt-auto pt-2">
            <div class="text-red-500 text-xs text-center mb-1 min-h-[16px]" id="vc-music-err"></div>
            <div class="flex gap-2">
              <input class="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-amber-500/50 transition-colors" id="vc-music-url" type="text" placeholder="${_t('vc_music_ph')}" autocomplete="off"/>
              <button class="bg-amber-500 text-black px-4 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors whitespace-nowrap" id="vc-music-add">+ ${_t('vc_music_add')}</button>
            </div>
          </div>
        </div>`;
    }

    _updateMusicUI() {
      const body = document.getElementById('vc-music-inner');
      if (body) {
        body.innerHTML = this._renderMusicPanel();
        this._bindMusicEvents();
        if (this._musicCurrentTrack?.type === 'spotify') {
          this._createSpotifyEmbed(this._musicCurrentTrack);
        }
        if (this._musicPlaying && this._musicCurrentTrack?.type === 'youtube') {
          this._startMusicProgress();
        }
      }
      this._updateMusicIndicator();
    }

    _updateMusicIndicator() {
      const tab = document.getElementById('vc-tab-music');
      if (!tab) return;
      let ind = tab.querySelector('.vc-music-ind');
      if (this._musicPlaying) {
        if (!ind) {
          tab.insertAdjacentHTML('beforeend', `<div class="flex items-end gap-[1px] h-2.5 vc-music-ind">
             <div class="w-[2px] bg-amber-500 animate-[vc-eq_0.8s_ease-in-out_infinite]"></div>
             <div class="w-[2px] bg-amber-500 animate-[vc-eq_0.8s_ease-in-out_infinite_0.2s]"></div>
             <div class="w-[2px] bg-amber-500 animate-[vc-eq_0.8s_ease-in-out_infinite_0.4s]"></div>
           </div>`);
        }
      } else if (ind) {
        ind.remove();
      }
      this._updateBarMusicState();
    }

    _bindMusicEvents() {
      const playPause = document.getElementById('vc-music-playpause');
      if (playPause) playPause.addEventListener('click', () => this._musicTogglePlayPause());
      const skip = document.getElementById('vc-music-skip');
      if (skip) skip.addEventListener('click', () => { if (this.socket) this.socket.emit('music_skip'); });
      const addBtn = document.getElementById('vc-music-add');
      const urlInput = document.getElementById('vc-music-url');
      if (addBtn) addBtn.addEventListener('click', () => this._addMusicFromInput());
      if (urlInput) urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._addMusicFromInput(); });
      document.querySelectorAll('.vc-music-track-rm').forEach(btn => {
        btn.addEventListener('click', () => {
          const trackId = btn.dataset.trackId;
          if (trackId && this.socket) this.socket.emit('music_remove', { trackId });
        });
      });
      const progressBar = document.getElementById('vc-music-progress');
      const volSlider = document.getElementById('vc-music-vol-slider');
      if (volSlider) {
        volSlider.addEventListener('input', (e) => {
          this._setMusicVolume(e.target.value);
        });
      }
    }

    async _addMusicFromInput() {
      const input = document.getElementById('vc-music-url');
      const addBtn = document.getElementById('vc-music-add');
      if (!input || !addBtn) return;
      const url = input.value.trim();
      if (!url) return;
      const parsed = this._parseMusicUrl(url);
      if (!parsed) {
        const err = document.getElementById('vc-music-err');
        if (err) { err.textContent = _t('vc_music_err_url'); setTimeout(() => { err.textContent = ''; }, 3000); }
        return;
      }
      
      const originalText = addBtn.innerHTML;
      addBtn.innerHTML = `<div class="w-3 h-3 rounded-full border-[2px] border-black border-t-transparent animate-spin inline-block align-middle"></div>`;
      addBtn.disabled = true;
      input.disabled = true;
      
      let title = parsed.type === 'youtube' ? 'YouTube Video' : 'Spotify Track';
      try { title = await this._fetchMusicTitle(parsed.url, parsed.type); } catch(e) {}
      
      input.value = '';
      input.disabled = false;
      addBtn.disabled = false;
      addBtn.innerHTML = originalText;
      if (this.socket) {
        this.socket.emit('music_add', { url: parsed.url, title, type: parsed.type });
        this._playSfx('toggleOn', 0.3);
      }
    }

    _parseMusicUrl(url) {
      const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
      const ytMatch = url.match(ytRegex);
      if (ytMatch) return { type: 'youtube', id: ytMatch[1], url: `https://www.youtube.com/watch?v=${ytMatch[1]}` };
      const spRegex = /open\.spotify\.com\/.*?(track|album|playlist)\/([a-zA-Z0-9]+)/;
      const spMatch = url.match(spRegex);
      if (spMatch) return { type: 'spotify', spotifyType: spMatch[1], id: spMatch[2], url: `https://open.spotify.com/${spMatch[1]}/${spMatch[2]}` };
      return null;
    }

    async _fetchMusicTitle(url, type) {
      const cleanTitle = (t) => {
        if (!t) return t;
        let c = t.replace(/\s*[\[\(](official.*|video oficial|audio oficial|audio|video|music video|lyric.*|visualizer|hd)[\]\)]/gi, '');
        c = c.replace(/\s*[\[\(]?(Spotify|YouTube)[\]\)]?/gi, '');
        c = c.replace(/\s*[-|]\s*$/g, '');
        return c.trim();
      };
      try {
        if (type === 'youtube') {
          const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
          const data = await res.json();
          return cleanTitle(data.title) || 'YouTube Video';
        } else if (type === 'spotify') {
          const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
          const data = await res.json();
          const artist = data.author_name || '';
          const title = cleanTitle(data.title) || 'Spotify Track';
          return artist ? `${title} - ${artist}` : title;
        }
      } catch(e) { return type === 'youtube' ? 'YouTube Video' : 'Spotify Track'; }
    }

    _musicTogglePlayPause() {
      if (!this._musicCurrentTrack || !this.socket) return;
      if (this._musicPlaying) {
        let currentTime = 0;
        if (this._ytPlayer && typeof this._ytPlayer.getCurrentTime === 'function') currentTime = this._ytPlayer.getCurrentTime();
        this.socket.emit('music_pause', { currentTime });
      } else {
        this.socket.emit('music_resume');
      }
    }

    async _playMusicTrack(track, seekTime = 0) {
      this._musicCurrentTrack = track;
      this._musicPlaying = true;
      this._destroyMusicPlayer();
      this._updateMusicUI();
      if (track.type === 'youtube') {
        const ytId = this._parseMusicUrl(track.url)?.id;
        if (ytId) {
          await this._createYTPlayer(ytId, seekTime);
          this._startMusicProgress();
        }
      }
    }

    _pauseMusic() {
      this._musicPlaying = false;
      if (this._ytPlayer && typeof this._ytPlayer.pauseVideo === 'function') this._ytPlayer.pauseVideo();
      this._stopMusicProgress();
      this._updateMusicUI();
    }

    _resumeMusic() {
      this._musicPlaying = true;
      if (this._ytPlayer && typeof this._ytPlayer.playVideo === 'function') this._ytPlayer.playVideo();
      this._startMusicProgress();
      this._updateMusicUI();
    }

    _stopMusic() {
      this._musicPlaying = false;
      this._musicCurrentTrack = null;
      this._destroyMusicPlayer();
      this._stopMusicProgress();
      this._updateMusicUI();
    }

    _seekMusic(time) {
      if (this._ytPlayer && typeof this._ytPlayer.seekTo === 'function') this._ytPlayer.seekTo(time, true);
    }

    _setMusicVolume(vol) {
      const v = Number(vol);
      this._musicVolume = v;
      if (this._ytPlayer && typeof this._ytPlayer.setVolume === 'function') {
        this._ytPlayer.setVolume(this.dnd ? 0 : v);
        if (v > 0 && typeof this._ytPlayer.unMute === 'function') {
          this._ytPlayer.unMute();
        }
      }
    }

    _onTrackEnded() {
      if (this.socket) this.socket.emit('music_ended');
    }

    _loadYouTubeAPI() {
      if (window.YT && window.YT.Player) return Promise.resolve();
      return new Promise((resolve) => {
        if (this._ytApiLoading) {
          this._ytApiCallbacks.push(resolve);
          return;
        }
        this._ytApiLoading = true;
        const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
        if (existing) {
          const check = setInterval(() => {
            if (window.YT && window.YT.Player) { clearInterval(check); this._ytApiLoading = false; resolve(); }
          }, 100);
          return;
        }
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const prevCb = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevCb) prevCb();
          this._ytApiLoading = false;
          resolve();
          this._ytApiCallbacks.forEach(cb => cb());
          this._ytApiCallbacks = [];
        };
        document.head.appendChild(tag);
      });
    }

    async _createYTPlayer(videoId, seekTo = 0) {
      await this._loadYouTubeAPI();
      if (this._ytPlayer) { try { this._ytPlayer.destroy(); } catch(e) {} this._ytPlayer = null; }
      let container = document.getElementById('vc-yt-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'vc-yt-container';
        container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;';
        document.body.appendChild(container);
      }
      const playerDiv = document.createElement('div');
      playerDiv.id = 'vc-yt-player-' + Date.now();
      container.innerHTML = '';
      container.appendChild(playerDiv);
      return new Promise((resolve) => {
        this._ytPlayer = new YT.Player(playerDiv.id, {
          height: '1', width: '1', videoId,
          playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, start: Math.floor(seekTo) },
          events: {
            onReady: (e) => {
              e.target.setVolume(this.dnd ? 0 : this._musicVolume);
              if (seekTo > 0) e.target.seekTo(seekTo, true);
              e.target.playVideo();
              this._musicPlaying = true;
              resolve(e.target);
            },
            onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) this._onTrackEnded(); },
            onError: () => this._onTrackEnded()
          }
        });
      });
    }

    _createSpotifyEmbed(track) {
      const embedContainer = document.getElementById('vc-spotify-embed');
      if (!embedContainer) return;
      const spMatch = track.url.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
      if (!spMatch) return;
      const embedUrl = `https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}?utm_source=generator&theme=0`;
      const h = spMatch[1] === 'track' ? '80' : '152';
      embedContainer.innerHTML = `<iframe src="${embedUrl}" width="100%" height="${h}" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:8px;"></iframe>`;
    }

    _startMusicProgress() {
      this._stopMusicProgress();
      this._musicProgressInt = setInterval(() => {
        if (!this._musicPlaying || !this._ytPlayer) return;
        if (typeof this._ytPlayer.getCurrentTime !== 'function') return;
        const current = this._ytPlayer.getCurrentTime();
        const duration = this._ytPlayer.getDuration();
        const fill = document.getElementById('vc-music-progress-fill');
        const timeCurrent = document.getElementById('vc-music-time-current');
        const timeTotal = document.getElementById('vc-music-time-total');
        if (fill && duration > 0) fill.style.width = ((current / duration) * 100) + '%';
        const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
        if (timeCurrent) timeCurrent.textContent = fmt(current);
        if (timeTotal) timeTotal.textContent = fmt(duration);
      }, 500);
    }

    _stopMusicProgress() {
      if (this._musicProgressInt) { clearInterval(this._musicProgressInt); this._musicProgressInt = null; }
    }

    _destroyMusicPlayer() {
      this._stopMusicProgress();
      if (this._ytPlayer) { try { this._ytPlayer.destroy(); } catch(e) {} this._ytPlayer = null; }
      const container = document.getElementById('vc-yt-container');
      if (container) container.innerHTML = '';
    }

    _cleanup() {
        this.connected = false;
        this._stopSfx(this.progNode); this.progNode = null;
        this._stopTimer();
      this._stopSpeaking();
      this._stopKeepAlive();
      cancelAnimationFrame(this._vizRaf);
      this._vizRaf = null;
      this.peers.forEach((_, id) => this._closePeer(id));
      this.peers.clear();
      this.audios.forEach(a => { try { a.srcObject = null; a.remove(); } catch{} });
      this.audios.clear();
      this.gains.clear();
      this._destroyNoiseProcessing();
      this._destroyMusicPlayer();
      this._musicPlaying = false;
      this._musicCurrentTrack = null;
      this._musicQueue = [];
      this._musicState = { currentIndex: -1, isPlaying: false };
      this._musicOpen = false;
      if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
      this._processedStream = null;
      this.connected = false;
      this.myId = null;
      this.users = [];
      this.muted = false;
      this.dnd = false;
      this.fab.classList.remove('connected');
    }

    // ── ROBUST AUDIO PLAY (handles mobile autoplay restrictions) ──────────
    _robustPlay(audio, peerId, attempt = 0) {
      const maxAttempts = 5;
      audio.play().then(() => {
        console.log(`[VC] ✅ Audio playing for peer ${peerId} (attempt ${attempt + 1})`);
      }).catch((e) => {
        console.warn(`[VC] ⚠️ Audio play failed for ${peerId} (attempt ${attempt + 1}):`, e.message);
        if (attempt < maxAttempts) {
          // Retry with increasing delay
          setTimeout(() => this._robustPlay(audio, peerId, attempt + 1), 500 * (attempt + 1));
        } else {
          // Last resort: wait for user gesture to unlock audio
          console.warn(`[VC] 🔇 Waiting for user gesture to unlock audio for ${peerId}`);
          const unlock = () => {
            audio.play().then(() => {
              console.log(`[VC] ✅ Audio unlocked via gesture for ${peerId}`);
            }).catch(() => {});
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
          };
          document.addEventListener('click', unlock, { once: true });
          document.addEventListener('touchstart', unlock, { once: true });
        }
      });
    }

    // ── RESUME ALL PEER AUDIO (after visibility change / iOS background) ──
    _resumeAllAudio() {
      // Resume AudioContext if suspended
      if (this.actx && this.actx.state === 'suspended') {
        this.actx.resume().catch(() => {});
      }
      // Re-play all peer audio elements
      this.audios.forEach((audio, peerId) => {
        if (audio.paused && audio.srcObject) {
          audio.play().then(() => {
            console.log(`[VC] ✅ Resumed audio for peer ${peerId}`);
          }).catch(() => {});
        }
      });
    }

    // ── BACKGROUND KEEP-ALIVE (mobile) ─────────────────────────────────────
    _startKeepAlive() {
      // 1. Wake Lock API – prevents screen from turning off
      this._acquireWakeLock();
      document.addEventListener('visibilitychange', this._onVisChange = () => {
        if (document.visibilityState === 'visible' && this.connected) {
          this._acquireWakeLock();
          // Re-play all audio that iOS may have paused in background
          setTimeout(() => this._resumeAllAudio(), 300);
        }
      });

      // 2. Silent audio loop (AudioContext)
      try {
        const silentCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = silentCtx.createOscillator();
        const gain = silentCtx.createGain();
        osc.frequency.value = 1;
        gain.gain.value = 0.0001; 
        osc.connect(gain);
        gain.connect(silentCtx.destination);
        osc.start();
        this._silentCtx = silentCtx;
        this._silentOsc = osc;
      } catch(e) {}

      // 3. Silent HTML Audio Loop (Crucial for iOS background/locked screen)
      if (!this._silentAudio) {
        this._silentAudio = document.createElement('audio');
        // Minimal 44-byte silent WAV
        this._silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        this._silentAudio.loop = true;
        this._silentAudio.playsInline = true;
        this._silentAudio.setAttribute('playsinline', '');
        this._silentAudio.setAttribute('webkit-playsinline', '');
        document.body.appendChild(this._silentAudio);
      }
      this._silentAudio.play().catch(() => {});

      // 4. Web Locks API – prevents tab from being discarded by the browser
      if (navigator.locks) {
        this._lockAbort = new AbortController();
        navigator.locks.request('vc-keep-alive', { signal: this._lockAbort.signal }, () => {
          return new Promise(() => {}); // hold lock forever until aborted
        }).catch(() => {});
      }
    }

    async _acquireWakeLock() {
      try {
        if (this._wakeLock) return;
        if ('wakeLock' in navigator) {
          this._wakeLock = await navigator.wakeLock.request('screen');
          this._wakeLock.addEventListener('release', () => { this._wakeLock = null; });
        }
      } catch(e) {}
    }

    _stopKeepAlive() {
      // Release wake lock
      if (this._wakeLock) { this._wakeLock.release().catch(() => {}); this._wakeLock = null; }
      if (this._onVisChange) document.removeEventListener('visibilitychange', this._onVisChange);

      // Stop silent audio
      if (this._silentOsc) { try { this._silentOsc.stop(); } catch(e) {} this._silentOsc = null; }
      if (this._silentCtx) { try { this._silentCtx.close(); } catch(e) {} this._silentCtx = null; }
      if (this._silentAudio) { this._silentAudio.pause(); this._silentAudio.src = ''; this._silentAudio.remove(); this._silentAudio = null; }

      // Release web lock
      if (this._lockAbort) { this._lockAbort.abort(); this._lockAbort = null; }
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
      this._updateBarSpeakingState();
    }

    _updateBarSpeakingState() {
      const isAnyoneSpeaking = document.querySelector('.vc-av.speaking') !== null;
      const bg = document.getElementById('vc-bar-indicator-bg');
      const ping = document.getElementById('vc-bar-indicator-ping');
      const dot = document.getElementById('vc-bar-indicator-dot');
      const wave = document.getElementById('vc-bar-waveform');
      const title = document.getElementById('vc-bar-title');
      if (!bg || !ping || !dot || !wave || !title) return;
      
      if (isAnyoneSpeaking) {
        bg.classList.replace('bg-green-500/10', 'bg-amber-500/10');
        bg.classList.replace('border-green-500/20', 'border-amber-500/20');
        ping.classList.add('hidden');
        dot.classList.add('hidden');
        wave.classList.replace('opacity-0', 'opacity-100');
        title.classList.replace('text-green-400', 'text-amber-400');
      } else {
        bg.classList.replace('bg-amber-500/10', 'bg-green-500/10');
        bg.classList.replace('border-amber-500/20', 'border-green-500/20');
        ping.classList.remove('hidden');
        dot.classList.remove('hidden');
        wave.classList.replace('opacity-100', 'opacity-0');
        title.classList.replace('text-amber-400', 'text-green-400');
      }
    }

    _updateBarMusicState() {
      const barMusicIcon = document.getElementById('vc-bar-music-icon');
      if (barMusicIcon) {
        if (this._musicPlaying) barMusicIcon.classList.remove('hidden');
        else barMusicIcon.classList.add('hidden');
      }
    }

    _updateBarChatState() {
      const barChatIcon = document.getElementById('vc-bar-chat-icon');
      if (barChatIcon) {
        if (this._chatUnread > 0) barChatIcon.classList.remove('hidden');
        else barChatIcon.classList.add('hidden');
      }
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
        if (window.yaireVcHistoryAdd) {
            window.yaireVcHistoryAdd({ date: new Date().toISOString(), duration: dur, name: this.myName });
        }
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

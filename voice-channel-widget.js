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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  /* ── Keyframes ───────────────────────────────────────────── */
  @keyframes vc-spin        { to { transform: rotate(360deg); } }
  @keyframes vc-blink       { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes vc-eq          { 0%,100%{height:3px} 50%{height:14px} }
  @keyframes vc-marquee     { 0%{transform:translateX(0)} 100%{transform:translateX(-100%)} }
  @keyframes vc-pop         { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes vc-fadein      { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes vc-slideIn     { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes vc-orb-drift   { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(8px,-12px) scale(1.08)} }
  @keyframes vc-orb-drift2  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-10px,8px) scale(1.05)} }
  @keyframes vc-fab-glow    { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.0),0 8px 32px rgba(0,0,0,.6)} 50%{box-shadow:0 0 0 8px rgba(124,58,237,.15),0 8px 32px rgba(0,0,0,.6)} }
  @keyframes vc-ring-wave   { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.2);opacity:0} }
  @keyframes vc-ring-wave2  { 0%{transform:scale(1);opacity:.35} 100%{transform:scale(2.8);opacity:0} }
  @keyframes vc-ring-wave3  { 0%{transform:scale(1);opacity:.2} 100%{transform:scale(3.4);opacity:0} }
  @keyframes vc-speak-ring  { 0%{transform:scale(1);opacity:.6;box-shadow:0 0 0 0 rgba(6,182,212,.5)} 70%{transform:scale(1);opacity:0;box-shadow:0 0 0 10px rgba(6,182,212,0)} 100%{box-shadow:0 0 0 0 rgba(6,182,212,0)} }
  @keyframes vc-shimmer     { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes vc-badge-pop   { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  @keyframes vc-bar-breathe { 0%,100%{opacity:.7;transform:scaleY(0.6)} 50%{opacity:1;transform:scaleY(1)} }
  @keyframes vc-slide-up    { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes vc-pulse-slow  { 0%,100%{opacity:.6} 50%{opacity:1} }

  /* ── Panel shell ─────────────────────────────────────────── */
  #vc-panel {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  #vc-fab {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  #vc-bar {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* ── Scrollbar ───────────────────────────────────────────── */
  .vc-scroll::-webkit-scrollbar       { width: 3px; }
  .vc-scroll::-webkit-scrollbar-track { background: transparent; }
  .vc-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,.25); border-radius: 99px; }
  .vc-scroll::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,.45); }

  /* ── Speaking avatar ─────────────────────────────────────── */
  .vc-av.speaking {
    border-color: #06b6d4 !important;
    box-shadow: 0 0 0 2px rgba(6,182,212,.5), 0 0 16px rgba(6,182,212,.25);
    animation: vc-speak-ring 1.6s ease-out infinite;
  }

  /* ── Marquee ─────────────────────────────────────────────── */
  .vc-marquee-container {
    display: flex; overflow: hidden; white-space: nowrap;
    mask-image: linear-gradient(to right, transparent, black 10px, black calc(100% - 10px), transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 10px, black calc(100% - 10px), transparent);
    width: 100%;
  }
  .vc-marquee-content {
    flex-shrink: 0;
    animation: vc-marquee 12s linear infinite;
    padding-right: 2.5rem;
  }

  /* ── Tab sliding indicator ───────────────────────────────── */
  .vc-tab-pill {
    position: relative;
    flex: 1;
    padding: 7px 0;
    font-size: 11px;
    font-weight: 600;
    border-radius: 8px;
    transition: color .25s, background .25s;
    text-align: center;
    color: rgba(255,255,255,.35);
    cursor: pointer;
    letter-spacing: .01em;
  }
  .vc-tab-pill.active {
    color: #fff;
    background: rgba(124,58,237,.25);
    box-shadow: 0 1px 8px rgba(124,58,237,.2);
  }
  .vc-tab-pill:hover:not(.active) { color: rgba(255,255,255,.7); }

  /* ── User row ────────────────────────────────────────────── */
  .vc-user-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 14px;
    transition: background .2s;
    cursor: default;
  }
  .vc-user-card:hover { background: rgba(124,58,237,.07); }

  /* ── History rows ────────────────────────────────────────── */
  .vc-hist-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 10px;
    border-radius: 10px;
    transition: background .15s;
    font-size: 11px;
  }
  .vc-hist-row:hover { background: rgba(124,58,237,.07); }

  /* ── Buttons ─────────────────────────────────────────────── */
  .vc-btn-primary {
    background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%);
    color: #fff;
    font-weight: 700;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: opacity .2s, transform .15s, box-shadow .2s;
    box-shadow: 0 4px 20px rgba(124,58,237,.35);
  }
  .vc-btn-primary:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(124,58,237,.45); }
  .vc-btn-primary:active { transform: scale(.97); opacity: 1; }

  .vc-btn-glass {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
    color: rgba(255,255,255,.65);
    font-weight: 600;
    border-radius: 12px;
    cursor: pointer;
    transition: background .2s, color .2s, border-color .2s;
  }
  .vc-btn-glass:hover { background: rgba(124,58,237,.15); border-color: rgba(124,58,237,.3); color: #fff; }

  .vc-btn-danger {
    background: rgba(239,68,68,.08);
    border: 1px solid rgba(239,68,68,.15);
    color: #f87171;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    transition: background .2s, border-color .2s;
  }
  .vc-btn-danger:hover { background: rgba(239,68,68,.18); border-color: rgba(239,68,68,.3); }

  .vc-btn-muted-active {
    background: rgba(239,68,68,.1) !important;
    border: 1px solid rgba(239,68,68,.25) !important;
    color: #f87171 !important;
  }
  .vc-btn-dnd-active {
    background: rgba(124,58,237,.12) !important;
    border: 1px solid rgba(124,58,237,.3) !important;
    color: #a78bfa !important;
  }

  /* ── Ring overlay ────────────────────────────────────────── */
  #vc-ring-overlay {
    position: fixed;
    inset: 0;
    z-index: 999999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at center, rgba(124,58,237,.18) 0%, rgba(8,8,16,.97) 70%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    animation: vc-fadein .4s ease-out;
  }
  .vc-ring-waves {
    position: relative;
    width: 96px;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }
  .vc-ring-wave-el {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1.5px solid rgba(124,58,237,.5);
  }
  .vc-ring-wave-el:nth-child(1) { animation: vc-ring-wave  2.4s ease-out infinite; }
  .vc-ring-wave-el:nth-child(2) { animation: vc-ring-wave2 2.4s ease-out infinite .5s; }
  .vc-ring-wave-el:nth-child(3) { animation: vc-ring-wave3 2.4s ease-out infinite 1s; }
  .vc-ring-avatar-el {
    position: relative;
    z-index: 2;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #06b6d4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    border: 3px solid rgba(255,255,255,.15);
    box-shadow: 0 0 40px rgba(124,58,237,.4);
    overflow: hidden;
  }
  .vc-ring-avatar-el img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
  .vc-ring-label-el {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,.4);
    text-transform: uppercase;
    letter-spacing: .15em;
    margin-bottom: 6px;
  }
  .vc-ring-name-el {
    font-size: 24px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 4px;
    letter-spacing: -.02em;
  }
  .vc-ring-sub-el {
    font-size: 13px;
    color: rgba(255,255,255,.4);
    margin-bottom: 36px;
  }
  .vc-ring-btns-el {
    display: flex;
    gap: 16px;
  }
  .vc-ring-btn-join {
    padding: 14px 36px;
    border-radius: 99px;
    background: linear-gradient(135deg, #7c3aed, #06b6d4);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 24px rgba(124,58,237,.4);
    transition: opacity .2s, transform .15s;
  }
  .vc-ring-btn-join:hover { opacity: .9; transform: translateY(-2px); }
  .vc-ring-btn-ignore {
    padding: 14px 36px;
    border-radius: 99px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.1);
    color: rgba(255,255,255,.6);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s;
  }
  .vc-ring-btn-ignore:hover { background: rgba(255,255,255,.1); color: #fff; }

  /* ── Music progress track ────────────────────────────────── */
  .vc-progress-track {
    height: 4px;
    background: rgba(255,255,255,.08);
    border-radius: 99px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
  }
  .vc-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #7c3aed, #06b6d4);
    border-radius: 99px;
    transition: width .5s linear;
  }

  /* ── Input glow ──────────────────────────────────────────── */
  .vc-input {
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 12px;
    color: #fff;
    outline: none;
    font-family: inherit;
    transition: border-color .2s, background .2s, box-shadow .2s;
  }
  .vc-input:focus {
    border-color: rgba(124,58,237,.5);
    background: rgba(124,58,237,.06);
    box-shadow: 0 0 0 3px rgba(124,58,237,.1);
  }
  .vc-input::placeholder { color: rgba(255,255,255,.2); }

  /* ── Chat bubbles ────────────────────────────────────────── */
  .vc-bubble-me {
    background: rgba(124,58,237,.22);
    border: 1px solid rgba(124,58,237,.3);
    color: #e2d9fc;
    border-radius: 16px 16px 4px 16px;
    padding: 8px 12px;
    font-size: 12.5px;
    line-height: 1.5;
    max-width: 82%;
    word-break: break-word;
  }
  .vc-bubble-them {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.08);
    color: rgba(255,255,255,.88);
    border-radius: 16px 16px 16px 4px;
    padding: 8px 12px;
    font-size: 12.5px;
    line-height: 1.5;
    max-width: 82%;
    word-break: break-word;
  }
  .vc-bubble-emoji { font-size: 36px; padding: 2px 0; line-height: 1.2; }

  /* ── Orb glows ───────────────────────────────────────────── */
  .vc-orb-v {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    animation: vc-orb-drift 8s ease-in-out infinite;
  }
  .vc-orb-c {
    position: absolute;
    border-radius: 50%;
    filter: blur(50px);
    pointer-events: none;
    animation: vc-orb-drift2 10s ease-in-out infinite;
  }
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

      this.actx = null;
      this.sfxBuf = {};
      this.sfxNodes = {};
      this._audioReady = false;

      // Auto-detect language changes
      this._lastLang = _getLang();
      setInterval(() => {
        if (document.hidden) return;
        const current = _getLang();
        if (current !== this._lastLang) {
          this._lastLang = current;
          this.updateTranslations();
        }
      }, 2000);

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
      if (this._audioReady) return;
      this._audioReady = true;
      this._sfxPromises = {};
      try {
        this.actx = new (window.AudioContext || window.webkitAudioContext)();
        const load = (k, u) => {
          this._sfxPromises[k] = fetch(u)
            .then(r => r.arrayBuffer())
            .then(buf => this.actx.decodeAudioData(buf))
            .then(decoded => {
              this.sfxBuf[k] = decoded;
            })
            .catch(e => {});
        };
        load('flyin', 'sounds/flyin.wav');
        load('flyout', 'sounds/flyout.wav');
        load('typing', 'sounds/typing.wav');
        load('toggleOn', 'SND01_sine/toggle_on.wav');
        load('toggleOff', 'SND01_sine/toggle_off.wav');
        load('act_end', 'sounds/activity_end.mp3');
        load('act_join', 'sounds/activity_user_join.mp3');
        load('act_left', 'sounds/activity_user_left.mp3');
        load('music_start', 'siriSounds18Separate/VoiceTriggerTraining_FX_5.wav');
        load('vc_chat_msg', 'sounds/nuevomensajeenelchatdevoz.wav');
        load('music_end_all', 'siriSounds18Separate/VoiceTriggerTraining_FX_0.wav');
        
        // New Siri JBL Sounds
        load('jbl_begin', 'siriSounds18Separate/jbl_begin_sae.wav');
        load('jbl_latency', 'siriSounds18Separate/jbl_latency_sae_v2.wav');
        load('jbl_success', 'siriSounds18Separate/jbl_success_sae.wav');
        load('siri_end', 'siriSounds18Separate/siri-begin-improved.wav');
      } catch(e) {}
    }

    _playSfx(k, vol=0.4, loop=false, excl=null) {
      this._initAudio();
      
      const play = () => {
        if (!this.actx || !this.sfxBuf[k]) return null;
        if (this.actx.state === 'suspended') this.actx.resume();
        if (excl && this.sfxNodes[excl]) this._stopSfx(this.sfxNodes[excl]);
        
        try {
          const src = this.actx.createBufferSource();
          src.buffer = this.sfxBuf[k];
          src.loop = loop;
          const gain = this.actx.createGain();
          
          const t = this.actx.currentTime;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(vol, t + 0.02);
          
          src.connect(gain);
          gain.connect(this.actx.destination);
          src.start(0);
          const node = { src, gain };
          if (excl) this.sfxNodes[excl] = node;
          
          if (k === 'jbl_latency' && loop) {
              this.progNode = node;
          }
          
          return node;
        } catch(e) { return null; }
      };

      if (this.sfxBuf[k]) {
        return play();
      } else if (this._sfxPromises && this._sfxPromises[k]) {
        this._sfxPromises[k].then(play);
        return null;
      }
      return null;
    }

    _stopSfx(node) {
      if (!node || !this.actx) return;
      try {
        const t = this.actx.currentTime;
        node.gain.gain.cancelScheduledValues(t);
        // Exponential decay prevents pops better than linear ramp from current value
        node.gain.gain.setTargetAtTime(0, t, 0.015);
        node.src.stop(t + 0.1);
      } catch(e){}
    }

    // ── BUILD UI ───────────────────────────────────────────────────────────
    _buildUI() {
      const w = document.createElement('div');
      w.id = 'vc-wrapper';

      this.fab = document.createElement('div');
      this.fab.id = 'vc-fab';
      this.fab.title = _t('vc_title');
      this.fab.style.cssText = [
        'position:fixed', 'bottom:24px', 'right:24px', 'z-index:9999',
        'width:56px', 'height:56px', 'border-radius:50%', 'cursor:pointer',
        'display:flex', 'align-items:center', 'justify-content:center',
        'background:linear-gradient(135deg,#4c1d95 0%,#0e7490 100%)',
        'border:1.5px solid rgba(124,58,237,.4)',
        'box-shadow:0 8px 32px rgba(0,0,0,.6),0 0 0 0 rgba(124,58,237,.3)',
        'transition:transform .2s,box-shadow .2s,border-color .2s',
        'animation:vc-fab-glow 3s ease-in-out infinite'
      ].join(';');
      this.fab.innerHTML = `
        <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(167,139,250,.2),transparent 70%);pointer-events:none"></div>
        <span style="color:#fff;display:flex;align-items:center;justify-content:center;width:22px;height:22px;transition:transform .2s;filter:drop-shadow(0 0 6px rgba(167,139,250,.6))">${ICONS.mic}</span>
      `;
      this.fab.addEventListener('mouseenter', () => { this.fab.style.transform = 'scale(1.1)'; this.fab.style.boxShadow = '0 12px 40px rgba(0,0,0,.7),0 0 0 8px rgba(124,58,237,.12)'; });
      this.fab.addEventListener('mouseleave', () => { this.fab.style.transform = ''; this.fab.style.boxShadow = '0 8px 32px rgba(0,0,0,.6),0 0 0 0 rgba(124,58,237,.3)'; });
      this.fab.addEventListener('click', () => this._toggle());

      this.panel = document.createElement('div');
      this.panel.id = 'vc-panel';
      this.panel.style.cssText = [
        'position:fixed', 'bottom:96px', 'right:24px',
        'width:340px', 'max-width:calc(100vw - 32px)',
        'background:#080810',
        'border:1px solid rgba(124,58,237,.2)',
        'border-radius:24px',
        'box-shadow:0 24px 80px rgba(0,0,0,.85),0 0 0 1px rgba(255,255,255,.04) inset,0 0 60px rgba(124,58,237,.08)',
        'overflow:hidden', 'z-index:9998',
        'transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .25s,visibility .25s',
        'transform:scale(.92) translateY(10px)', 'opacity:0', 'pointer-events:none','visibility:hidden'
      ].join(';');
      this.panel.innerHTML = this._tplLogin();

      this._bar = document.createElement('div');
      this._bar.id = 'vc-bar';
      this._bar.style.cssText = [
        'position:fixed', 'bottom:96px', 'right:24px', 'z-index:9997',
        'display:flex', 'align-items:center', 'gap:10px',
        'padding:10px 14px',
        'background:rgba(8,8,16,.92)',
        'backdrop-filter:blur(24px)', '-webkit-backdrop-filter:blur(24px)',
        'border:1px solid rgba(124,58,237,.15)',
        'border-radius:18px',
        'box-shadow:0 8px 40px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.03) inset',
        'opacity:0', 'pointer-events:none', 'visibility:hidden',
        'transition:transform .35s cubic-bezier(.34,1.2,.64,1),opacity .25s,visibility .25s',
        'transform:translateY(10px) scale(.94)', 'cursor:pointer'
      ].join(';');
      this._bar.innerHTML = `
        <div style="display:flex;align-items:center;gap:5px;flex-shrink:0" id="vc-bar-eq">
          <div style="width:3px;background:linear-gradient(to top,#7c3aed,#06b6d4);border-radius:99px;animation:vc-eq .6s ease-in-out infinite" id="vc-bar-eq1"></div>
          <div style="width:3px;background:linear-gradient(to top,#7c3aed,#06b6d4);border-radius:99px;animation:vc-eq .6s ease-in-out infinite .15s" id="vc-bar-eq2"></div>
          <div style="width:3px;background:linear-gradient(to top,#7c3aed,#06b6d4);border-radius:99px;animation:vc-eq .6s ease-in-out infinite .3s" id="vc-bar-eq3"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;min-width:60px">
          <div style="display:flex;align-items:center;gap:5px">
            <span id="vc-bar-title" style="font-size:9px;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:.14em;line-height:1">${_t('bar_conn').split(' · ')[0]}</span>
            <div id="vc-bar-music-icon" class="hidden" style="color:#06b6d4">
              <svg style="width:10px;height:10px;animation:vc-pulse-slow 1.5s infinite" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
            </div>
            <div id="vc-bar-chat-icon" class="hidden" style="position:relative;color:#f87171">
              <svg style="width:10px;height:10px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              <span style="position:absolute;top:-2px;right:-2px;width:5px;height:5px;background:#f87171;border-radius:50%;animation:vc-pulse-slow 1s infinite"></span>
            </div>
          </div>
          <span id="vc-bar-sub" style="font-size:10px;color:rgba(255,255,255,.3);font-weight:500;line-height:1">${_t('bar_conn').split(' · ')[1]}</span>
        </div>
        <div style="width:1px;height:20px;background:rgba(255,255,255,.06);flex-shrink:0"></div>
        <span id="vc-bar-timer" style="font-family:'SF Mono',Monaco,monospace;font-size:13px;font-weight:600;color:#06b6d4;letter-spacing:.04em;tab-size:4">00:00</span>
        <div style="width:1px;height:20px;background:rgba(255,255,255,.06);flex-shrink:0"></div>
        <button id="vc-bar-mute" title="Mic" style="width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:rgba(255,255,255,.45);cursor:pointer;transition:background .15s,color .15s;flex-shrink:0" onmouseenter="this.style.background='rgba(124,58,237,.15)';this.style.color='#fff'" onmouseleave="this.style.background='transparent';this.style.color='rgba(255,255,255,.45)'">
          <span style="width:14px;height:14px;display:flex;align-items:center;justify-content:center">${ICONS.mic}</span>
        </button>
        <button id="vc-bar-leave" title="Salir" style="width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171;cursor:pointer;transition:background .15s;flex-shrink:0" onmouseenter="this.style.background='rgba(239,68,68,.22)'" onmouseleave="this.style.background='rgba(239,68,68,.1)'">
          <span style="width:14px;height:14px;display:flex;align-items:center;justify-content:center">${ICONS.phone}</span>
        </button>
      `;

      document.body.appendChild(this.fab);
      document.body.appendChild(this.panel);
      document.body.appendChild(this._bar);

      this.panel.addEventListener('click', (e) => e.stopPropagation());
      
      this._bar.addEventListener('click', () => this._toggle());
      
      const barMute = this._bar.querySelector('#vc-bar-mute');
      if (barMute) {
        barMute.addEventListener('click', (e) => {
          e.stopPropagation();
          this._toggleMute();
        });
      }
      
      const barLeave = this._bar.querySelector('#vc-bar-leave');
      if (barLeave) {
        barLeave.addEventListener('click', (e) => {
          e.stopPropagation();
          this._leave();
        });
      }

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
      const isOpen = this.panel.style.opacity === '1';
      
      if (!isOpen) {
        this._playSfx('jbl_begin', 0.5);
        this.panel.style.opacity = '1';
        this.panel.style.transform = 'scale(1) translateY(0)';
        this.panel.style.pointerEvents = 'auto';
        this.panel.style.visibility = 'visible';
        if (this.connected) {
          this._bar.style.opacity = '0';
          this._bar.style.transform = 'translateY(10px) scale(.94)';
          this._bar.style.pointerEvents = 'none';
          this._bar.style.visibility = 'hidden';
        } else {
          if (document.getElementById('vc-reconnect')) this._render(this._tplDisconnected());
          else if (document.getElementById('vc-loading-spinner')) this._render(this._tplLoading());
          else this._render(this._tplLogin());
        }
      } else {
        if (this._loginPollInt) { clearInterval(this._loginPollInt); this._loginPollInt = null; }
        this.panel.style.opacity = '0';
        this.panel.style.transform = 'scale(.92) translateY(10px)';
        this.panel.style.pointerEvents = 'none';
        this.panel.style.visibility = 'hidden';
        if (this.connected) {
          this._bar.style.opacity = '1';
          this._bar.style.transform = 'translateY(0) scale(1)';
          this._bar.style.pointerEvents = 'auto';
          this._bar.style.visibility = 'visible';
        }
        this._playSfx('flyout', 0.4, false, 'fly');
      }
    }

    // ── TEMPLATES ──────────────────────────────────────────────────────────
    _tplLogin(err = '') {
      const user = window.yaireCurrentUser;
      const _hdr = (sub = '', subColor = 'rgba(255,255,255,.35)') => `
        <div style="position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(124,58,237,.12)">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(6,182,212,.2));display:flex;align-items:center;justify-content:center;color:#a78bfa;box-shadow:0 0 12px rgba(124,58,237,.2)">
              <span style="width:16px;height:16px;display:flex">${ICONS.sound}</span>
            </div>
            <div>
              <div style="color:#fff;font-weight:700;font-size:13px;letter-spacing:-.01em">#principal</div>
              <div style="color:${subColor};font-size:10px;font-weight:500;letter-spacing:.01em">${sub}</div>
            </div>
          </div>
          <button id="vc-close" style="width:30px;height:30px;border-radius:8px;background:transparent;border:none;color:rgba(255,255,255,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:background .15s,color .15s" onmouseenter="this.style.background='rgba(255,255,255,.07)';this.style.color='#fff'" onmouseleave="this.style.background='transparent';this.style.color='rgba(255,255,255,.3)'">✕</button>
        </div>`;

      if (!user) {
        return `
          <div style="position:relative;overflow:hidden;display:flex;flex-direction:column">
            <div class="vc-orb-v" style="top:-80px;right:-60px;width:220px;height:220px;background:rgba(124,58,237,.12)"></div>
            <div class="vc-orb-c" style="bottom:-60px;left:-40px;width:180px;height:180px;background:rgba(6,182,212,.07)"></div>
            ${_hdr(_t('vc_sub'))}
            <div style="position:relative;z-index:10;padding:32px 24px;display:flex;flex-direction:column;align-items:center;text-align:center">
              <div style="position:relative;margin-bottom:20px">
                <div style="width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(6,182,212,.15));border:1px solid rgba(124,58,237,.3);display:flex;align-items:center;justify-content:center;color:#a78bfa;box-shadow:0 8px 32px rgba(124,58,237,.2)">
                  <svg style="width:28px;height:28px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
              </div>
              <h3 style="color:#fff;font-size:17px;font-weight:800;letter-spacing:-.02em;margin-bottom:8px">${_t('vc_restricted')}</h3>
              <p style="color:rgba(255,255,255,.4);font-size:12px;line-height:1.6;margin-bottom:24px;max-width:240px">${_t('vc_req_login')}</p>
              <button id="vc-google-login-btn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:13px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s,border-color .2s" onmouseenter="this.style.background='rgba(255,255,255,.09)';this.style.borderColor='rgba(255,255,255,.2)'" onmouseleave="this.style.background='rgba(255,255,255,.05)';this.style.borderColor='rgba(255,255,255,.1)'">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width:16px;height:16px" />
                ${_t('vc_login_google')}
              </button>
            </div>
          </div>`;
      }

      return `
        <div style="position:relative;overflow:hidden;display:flex;flex-direction:column">
          <div class="vc-orb-v" style="top:-80px;right:-60px;width:220px;height:220px;background:rgba(124,58,237,.13)"></div>
          <div class="vc-orb-c" style="bottom:20px;left:-50px;width:200px;height:200px;background:rgba(6,182,212,.06)"></div>
          ${_hdr(_t('vc_sub'))}
          <div style="position:relative;z-index:10;padding:28px 22px;display:flex;flex-direction:column;align-items:center;gap:20px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
              <div style="position:relative">
                <div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(124,58,237,.5);animation:vc-ring-wave 2.8s ease-out infinite"></div>
                <div style="position:absolute;inset:-6px;border-radius:50%;border:1px solid rgba(6,182,212,.35);animation:vc-ring-wave2 2.8s ease-out infinite .6s"></div>
                <img src="${user.photoURL}" style="width:68px;height:68px;border-radius:50%;object-fit:cover;border:2.5px solid rgba(124,58,237,.6);box-shadow:0 0 0 4px rgba(124,58,237,.1),0 8px 32px rgba(0,0,0,.5);position:relative;z-index:1" draggable="false" />
              </div>
              <div style="text-align:center">
                <div style="font-size:9.5px;font-weight:700;color:rgba(167,139,250,.8);text-transform:uppercase;letter-spacing:.18em;margin-bottom:5px">${_t('vc_session_as')}</div>
                <div style="font-size:17px;font-weight:800;color:#fff;letter-spacing:-.02em">${user.displayName}</div>
              </div>
            </div>
            <input id="vc-name" type="hidden" value="${user.displayName}"/>
            <input id="vc-pass" type="hidden" value="nopass"/>
            <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:10px">
              <button id="vc-join" class="vc-btn-primary" style="width:100%;padding:14px;font-size:14px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:center;justify-content:center;gap:8px">
                <span style="width:16px;height:16px;display:flex;align-items:center;justify-content:center">${ICONS.mic}</span>
                ${_t('btn_join')}
              </button>
              <div id="vc-conn-count" style="font-size:11px;font-weight:500;color:rgba(255,255,255,.35);min-height:16px;transition:opacity .3s"></div>
              <div id="vc-err" style="color:#f87171;font-size:11px;text-align:center;font-weight:500;min-height:0">${err}</div>
            </div>
          </div>
          ${this._tplHistory()}
        </div>`;
    }

    _tplLoading() {
      return `
        <div style="position:relative;overflow:hidden;display:flex;flex-direction:column">
          <div class="vc-orb-v" style="top:-60px;right:-40px;width:180px;height:180px;background:rgba(124,58,237,.1)"></div>
          <div style="position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(124,58,237,.12)">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(6,182,212,.2));display:flex;align-items:center;justify-content:center;color:#a78bfa">
                <span style="width:16px;height:16px;display:flex">${ICONS.sound}</span>
              </div>
              <div>
                <div style="color:#fff;font-weight:700;font-size:13px">#principal</div>
                <div style="color:rgba(255,255,255,.35);font-size:10px;font-weight:500">${_t('st_conn')}</div>
              </div>
            </div>
            <button id="vc-close" style="width:30px;height:30px;border-radius:8px;background:transparent;border:none;color:rgba(255,255,255,.3);cursor:pointer;font-size:14px;transition:background .15s" onmouseenter="this.style.background='rgba(255,255,255,.07)'" onmouseleave="this.style.background='transparent'">✕</button>
          </div>
          <div style="position:relative;z-index:10;padding:48px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px">
            <div style="position:relative" id="vc-loading-spinner">
              <div style="position:absolute;inset:-8px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,.25),transparent 70%);animation:vc-pulse-slow 2s ease-in-out infinite"></div>
              <div style="width:44px;height:44px;border-radius:50%;border:3px solid rgba(255,255,255,.06);border-top-color:#7c3aed;border-right-color:#06b6d4;animation:vc-spin 1s linear infinite;position:relative;z-index:1"></div>
            </div>
            <div style="color:rgba(255,255,255,.4);font-size:12px;font-weight:500;letter-spacing:.04em;animation:vc-pulse-slow 2s ease-in-out infinite">${_t('st_estab')}</div>
          </div>
        </div>`;
    }

    _tplDisconnected() {
      return `
        <div style="position:relative;overflow:hidden;display:flex;flex-direction:column">
          <div class="vc-orb-c" style="top:40%;left:50%;transform:translate(-50%,-50%);width:240px;height:240px;background:rgba(239,68,68,.1)"></div>
          <div style="position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(239,68,68,.15)">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:32px;height:32px;border-radius:10px;background:rgba(239,68,68,.15);display:flex;align-items:center;justify-content:center;color:#f87171">
                <span style="width:16px;height:16px;display:flex">${ICONS.sound}</span>
              </div>
              <div>
                <div style="color:#fff;font-weight:700;font-size:13px">#principal</div>
                <div style="color:#f87171;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em">${_t('st_disc')}</div>
              </div>
            </div>
            <button id="vc-close" style="width:30px;height:30px;border-radius:8px;background:transparent;border:none;color:rgba(255,255,255,.3);cursor:pointer;font-size:14px;transition:background .15s" onmouseenter="this.style.background='rgba(255,255,255,.07)'" onmouseleave="this.style.background='transparent'">✕</button>
          </div>
          <div style="position:relative;z-index:10;padding:36px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:16px">
            <div style="width:64px;height:64px;border-radius:20px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);display:flex;align-items:center;justify-content:center;color:#f87171;box-shadow:0 0 40px rgba(239,68,68,.15)">
              <svg style="width:32px;height:32px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <p style="color:rgba(255,255,255,.45);font-size:12px;line-height:1.7;max-width:220px">${_t('msg_disc')}</p>
            <button id="vc-reconnect" class="vc-btn-danger" style="width:100%;padding:14px;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px">
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
        return `<div class="vc-hist-row"><span style="color:rgba(255,255,255,.7);font-weight:600">${s.name}</span><span style="color:rgba(255,255,255,.3);font-size:10px">${label} &middot; ${m}m${sec}s</span></div>`;
      }).join('');
      const moreBtn = h.length > 3 ? `<button id="vc-btn-ver-mas" style="width:100%;margin-top:8px;padding:7px;border-radius:9px;background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.15);color:rgba(167,139,250,.8);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;transition:background .15s" onmouseenter="this.style.background='rgba(124,58,237,.15)'" onmouseleave="this.style.background='rgba(124,58,237,.08)'">${_t('vc_hist_more')}</button>` : '';
      return `<div style="padding:12px 16px 16px;border-top:1px solid rgba(124,58,237,.1);background:rgba(124,58,237,.04)">
        <div style="font-size:9px;font-weight:700;color:rgba(167,139,250,.5);text-transform:uppercase;letter-spacing:.15em;margin-bottom:6px">${_t('hist_title')}</div>
        ${rows}${moreBtn}
      </div>`;
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
          <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;transition:background .15s" onmouseenter="this.style.background='rgba(255,255,255,.06)'" onmouseleave="this.style.background='rgba(255,255,255,.03)'">
            <div>
              <div style="color:#fff;font-weight:700;font-size:14px;margin-bottom:4px">${s.name}</div>
              <div style="color:rgba(255,255,255,.4);font-size:11px;text-transform:capitalize">${label}</div>
            </div>
            <div style="color:#06b6d4;font-weight:600;font-size:12px;background:rgba(6,182,212,.1);padding:6px 12px;border-radius:8px;border:1px solid rgba(6,182,212,.2);font-family:'SF Mono',Monaco,monospace">
              ${m}m ${sec}s
            </div>
          </div>
        `;
      }).join('');

      const modal = document.createElement('div');
      modal.id = 'vc-detailed-history';
      modal.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .3s ease-out';
      modal.innerHTML = `
        <div style="position:absolute;inset:0;background:rgba(8,8,16,.85);backdrop-filter:blur(8px)" id="vc-det-bg"></div>
        <div style="position:relative;width:100%;max-width:512px;max-height:80vh;display:flex;flex-direction:column;background:rgba(12,10,26,.95);backdrop-filter:blur(24px);border:1px solid rgba(124,58,237,.2);border-radius:24px;box-shadow:0 24px 64px rgba(0,0,0,.6),inset 0 1px 1px rgba(255,255,255,.05);overflow:hidden;transform:scale(.95);transition:transform .3s cubic-bezier(.34,1.4,.64,1)" id="vc-det-card">
          <div class="vc-orb-v" style="top:-80px;right:-80px;width:240px;height:240px;background:rgba(124,58,237,.1)"></div>
          <div class="vc-orb-c" style="bottom:-60px;left:-60px;width:200px;height:200px;background:rgba(6,182,212,.08)"></div>
          
          <div style="display:flex;align-items:center;justify-content:space-between;padding:24px;border-bottom:1px solid rgba(124,58,237,.15);position:relative;z-index:10;background:rgba(255,255,255,.02)">
            <h2 style="color:#fff;font-weight:800;font-size:20px;letter-spacing:-.02em;margin:0">${_t('vc_hist_full')}</h2>
            <button style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,.05);color:rgba(255,255,255,.5);border:none;cursor:pointer;transition:background .15s,color .15s;font-size:16px" onmouseenter="this.style.background='rgba(255,255,255,.1)';this.style.color='#fff'" onmouseleave="this.style.background='rgba(255,255,255,.05)';this.style.color='rgba(255,255,255,.5)'" id="vc-det-close">&times;</button>
          </div>
          <div style="flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:12px;position:relative;z-index:10" class="vc-scroll">
            ${rows}
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Animate in
      requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.querySelector('#vc-det-card').style.transform = 'scale(1)';
      });

      const closeFunc = () => {
        modal.style.opacity = '0';
        modal.querySelector('#vc-det-card').style.transform = 'scale(.95)';
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
          ? `<img src="${u.photoURL || window.yaireCurrentUser?.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" draggable="false" />` 
          : initials;

        const micIcon = isMuted ? `<span class="vc-mico" style="color:#ef4444;width:16px;height:16px;display:flex">${ICONS.micOff}</span>` : '';
        const bellIcon = isDnd ? `<span class="vc-dico" style="color:#a855f7;width:16px;height:16px;display:flex" title="DND">${ICONS.dnd}</span>` : '';

        return `
          <div style="display:flex;align-items:center;gap:14px;padding:8px;border-radius:12px;transition:background .15s" onmouseenter="this.style.background='rgba(255,255,255,.04)'" onmouseleave="this.style.background='transparent'" class="vc-user group" id="vc-u-${u.id}">
            <div style="width:40px;height:40px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;transition:all .2s;position:relative;${isMe ? 'background:rgba(124,58,237,.1);color:#a78bfa;box-shadow:inset 0 0 0 1px rgba(124,58,237,.3)' : 'background:rgba(255,255,255,.03);color:rgba(255,255,255,.5);box-shadow:inset 0 0 0 1px rgba(255,255,255,.05)'}" class="vc-av" id="vc-av-${u.id}">
              ${avatarHtml}
            </div>
            <div style="flex:1;min-width:0">
              <div style="color:rgba(255,255,255,.9);font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em">${u.displayName} ${u.oracleHandle ? `<span style="color:rgba(6,182,212,.7);font-size:10px;margin-left:6px;font-weight:500;letter-spacing:.02em">@${u.oracleHandle}</span>` : ''} ${isMe ? `<span style="color:rgba(255,255,255,.3);font-size:10px;margin-left:6px;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.04);font-weight:500;border:1px solid rgba(255,255,255,.05)">${_t('tag_you')}</span>` : ''}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding-right:8px" class="vc-icons-container">
               ${bellIcon}${micIcon}
            </div>
          </div>`;
      }).join('');

      // Render tab contents based on _activeTab state
      const isRoom = this._activeTab === 'room';
      const isChat = this._activeTab === 'chat';
      const isMusic = this._activeTab === 'music';

      const eqInd = this._musicPlaying ? `<span class="vc-music-ind" style="display:flex;align-items:flex-end;gap:2px;height:10px;margin-left:4px">
             <span style="width:2px;background:#06b6d4;border-radius:99px;animation:vc-eq .8s ease-in-out infinite"></span>
             <span style="width:2px;background:#06b6d4;border-radius:99px;animation:vc-eq .8s ease-in-out infinite .2s"></span>
             <span style="width:2px;background:#06b6d4;border-radius:99px;animation:vc-eq .8s ease-in-out infinite .4s"></span>
           </span>` : '';

      return `
        <!-- Ambient Orbs -->
        <div class="vc-orb-v" style="top:-80px;right:-80px;width:250px;height:250px;background:rgba(124,58,237,.15)"></div>
        <div class="vc-orb-c" style="bottom:-40px;left:-40px;width:200px;height:200px;background:rgba(6,182,212,.1)"></div>

        <!-- Header -->
        <div style="position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(124,58,237,.12);background:rgba(255,255,255,.01);backdrop-filter:blur(8px)">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(6,182,212,.2));display:flex;align-items:center;justify-content:center;color:#a78bfa">
              <span style="width:18px;height:18px;display:flex">${ICONS.sound}</span>
            </div>
            <div>
              <div style="color:#fff;font-weight:700;font-size:13.5px;letter-spacing:-.01em">#principal</div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:2px" class="vc-sub">
                <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;flex-shrink:0;animation:vc-blink 2.5s ease-in-out infinite"></span>
                <span style="color:rgba(255,255,255,.4);font-size:10px;font-weight:500">${this.users.length}/4</span>
                <span style="color:rgba(255,255,255,.2);font-size:10px">&middot;</span>
                <span id="vc-timer" style="font-family:'SF Mono',Monaco,monospace;font-size:10px;color:#06b6d4;font-weight:600;letter-spacing:.04em" class="vc-timer">00:00</span>
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <button id="vc-btn-oracle-redirect" style="padding:6px 10px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);color:rgba(255,255,255,.6);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;display:flex;align-items:center;gap:5px;transition:background .15s,color .15s" onmouseenter="this.style.background='rgba(124,58,237,.15)';this.style.color='#fff';this.style.borderColor='rgba(124,58,237,.3)'" onmouseleave="this.style.background='rgba(255,255,255,.04)';this.style.color='rgba(255,255,255,.6)';this.style.borderColor='rgba(255,255,255,.07)'" title="Seguir en Oracle">
              <svg style="width:11px;height:11px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              <span>Oracle</span>
            </button>
            <button id="vc-close" style="width:28px;height:28px;border-radius:8px;background:transparent;border:none;color:rgba(255,255,255,.3);cursor:pointer;font-size:14px;transition:background .15s" onmouseenter="this.style.background='rgba(255,255,255,.07)'" onmouseleave="this.style.background='transparent'">&times;</button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div style="position:relative;z-index:10;display:flex;gap:4px;padding:8px 12px;background:rgba(0,0,0,.2)">
          <button class="vc-tab-pill ${isRoom ? 'active' : ''}" id="vc-tab-room" style="position:relative">${_t('vc_tab_room')}</button>
          <button class="vc-tab-pill ${isChat ? 'active' : ''}" id="vc-tab-chat" style="position:relative">
            ${_t('vc_chat')}
            ${this._chatUnread > 0 ? `<span style="position:absolute;top:4px;right:8px;width:6px;height:6px;background:#f87171;border-radius:50%;animation:vc-badge-pop .3s ease-out"></span>` : ''}
          </button>
          <button class="vc-tab-pill ${isMusic ? 'active' : ''}" id="vc-tab-music" style="display:flex;align-items:center;justify-content:center">
            ${_t('vc_music')} ${eqInd}
          </button>
        </div>

        <!-- Main Content Area -->
        <div style="height:248px;position:relative;overflow:hidden">
          
          <!-- ROOM TAB -->
          <div id="vc-content-room" style="position:absolute;inset:0;display:flex;flex-direction:column;transition:opacity .25s,transform .25s;${isRoom ? 'opacity:1;transform:translateX(0);pointer-events:auto' : 'opacity:0;transform:translateX(-12px);pointer-events:none'}">
            <div style="flex:1;overflow-y:auto;padding:8px" class="vc-scroll vc-sect">
              <div style="font-size:9px;color:rgba(255,255,255,.2);font-weight:700;text-transform:uppercase;letter-spacing:.16em;margin-bottom:8px;padding:0 6px" class="vc-sect-lbl">${_t('sect_in')}</div>
              ${userRows || `<div style="text-align:center;color:rgba(255,255,255,.2);font-size:12px;padding:32px 16px" class="vc-empty">${_t('empty_chan')}</div>`}
            </div>
          </div>

          <!-- CHAT TAB -->
          <div id="vc-content-chat" style="position:absolute;inset:0;display:flex;flex-direction:column;transition:opacity .25s,transform .25s;${isChat ? 'opacity:1;transform:translateX(0);pointer-events:auto' : (isRoom ? 'opacity:0;transform:translateX(12px);pointer-events:none' : 'opacity:0;transform:translateX(-12px);pointer-events:none')}">
            <div style="flex:1;overflow-y:auto;padding:12px 16px 4px 16px" class="vc-scroll" id="vc-msgs">${this._renderChatMsgs()}</div>
            <div style="padding:0 16px 8px;color:rgba(255,255,255,.4);font-size:10px;display:none" id="vc-chat-typing"></div>
            <div style="padding:12px;border-top:1px solid rgba(255,255,255,.03);display:flex;gap:8px">
              <input id="vc-chat-in" type="text" placeholder="${_t('vc_chat_ph')}" autocomplete="off" class="vc-input" style="flex:1;padding:8px 14px;border-radius:10px" />
              <button id="vc-chat-send" class="vc-btn-primary" style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0">
                <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>

          <!-- MUSIC TAB -->
          <div id="vc-content-music" style="position:absolute;inset:0;display:flex;flex-direction:column;transition:opacity .25s,transform .25s;${isMusic ? 'opacity:1;transform:translateX(0);pointer-events:auto' : 'opacity:0;transform:translateX(12px);pointer-events:none'}">
            <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column" class="vc-scroll" id="vc-music-inner">
               ${this._renderMusicPanel()}
            </div>
          </div>

        </div>

        <!-- Global Controls -->
        <div style="position:relative;z-index:10;display:flex;gap:10px;padding:16px;border-top:1px solid rgba(255,255,255,.03);background:rgba(0,0,0,.2);backdrop-filter:blur(8px)">
          <button id="vc-mute" style="flex:1;padding:12px;border-radius:12px;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s;border:1px solid ${this.muted ? 'rgba(239,68,68,.2)' : 'rgba(255,255,255,.05)'};background:${this.muted ? 'rgba(239,68,68,.1)' : 'rgba(255,255,255,.03)'};color:${this.muted ? '#ef4444' : 'rgba(255,255,255,.7)'};cursor:pointer" onmouseenter="if(!${this.muted}) { this.style.background='rgba(255,255,255,.06)'; this.style.color='#fff'; }">
            <span style="width:16px;height:16px;display:flex">${this.muted ? ICONS.micOff : ICONS.mic}</span>
            ${this.muted ? _t('btn_muted') : _t('btn_mic')}
          </button>
          <button id="vc-dnd" style="flex:1;padding:12px;border-radius:12px;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s;border:1px solid ${this.dnd ? 'rgba(168,85,247,.2)' : 'rgba(255,255,255,.05)'};background:${this.dnd ? 'rgba(168,85,247,.1)' : 'rgba(255,255,255,.03)'};color:${this.dnd ? '#a855f7' : 'rgba(255,255,255,.7)'};cursor:pointer" onmouseenter="if(!${this.dnd}) { this.style.background='rgba(255,255,255,.06)'; this.style.color='#fff'; }">
            <span style="width:16px;height:16px;display:flex">${ICONS.bell}</span> DND
          </button>
          <button id="vc-leave" style="width:48px;flex-shrink:0;border-radius:12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.15);color:#ef4444;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s" onmouseenter="this.style.background='rgba(239,68,68,.2)'" onmouseleave="this.style.background='rgba(239,68,68,.1)'" title="Salir">
            <span style="width:16px;height:16px;display:flex">${ICONS.phone}</span>
          </button>
        </div>`;
    }

    _updateUsersDOM() {
      if (!this.connected) return;
      const sub = document.querySelector('.vc-sub');
      if (sub && sub.textContent.includes('/4')) {
        const timerTxt = document.getElementById('vc-timer')?.textContent || '00:00';
        sub.innerHTML = `<span style="width:6px;height:6px;border-radius:50%;background:#22c55e;flex-shrink:0;animation:vc-blink 2.5s ease-in-out infinite"></span><span style="color:rgba(255,255,255,.4);font-size:10px;font-weight:500">${this.users.length}/4</span><span style="color:rgba(255,255,255,.2);font-size:10px">&middot;</span><span id="vc-timer" style="font-family:'SF Mono',Monaco,monospace;font-size:10px;color:#06b6d4;font-weight:600;letter-spacing:.04em" class="vc-timer">${timerTxt}</span>`;
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
          if (lbl) lbl.insertAdjacentHTML('afterend', `<div style="text-align:center;color:rgba(255,255,255,.2);font-size:12px;padding:32px 16px" class="vc-empty">${_t('empty_chan')}</div>`);
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
          node.className = 'vc-user-card vc-user';
          node.id = `vc-u-${u.id}`;
          
          const avatarHtml = (u.photoURL || (isMe && window.yaireCurrentUser?.photoURL)) 
            ? `<img src="${u.photoURL || window.yaireCurrentUser?.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" draggable="false" />` 
            : `<span style="font-size:12px;font-weight:800;color:${isMe?'#a78bfa':'rgba(255,255,255,.6)'}">${u.displayName.slice(0,2).toUpperCase()}</span>`;

          const avatarBg = isMe
            ? 'background:rgba(124,58,237,.15);border:1.5px solid rgba(124,58,237,.4);box-shadow:0 0 12px rgba(124,58,237,.15)'
            : 'background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.07)';

          node.innerHTML = `
            <div id="vc-av-${u.id}" class="vc-av" style="width:40px;height:40px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:border-color .2s,box-shadow .2s;${avatarBg}">
              ${avatarHtml}
            </div>
            <div style="flex:1;min-width:0">
              <div style="color:rgba(255,255,255,.9);font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em">
                ${u.displayName}
                ${u.oracleHandle ? `<span style="color:rgba(167,139,250,.7);font-size:10px;margin-left:5px;font-weight:500">@${u.oracleHandle}</span>` : ''}
                ${isMe ? `<span style="color:rgba(255,255,255,.25);font-size:9px;margin-left:5px;padding:1px 5px;border-radius:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-weight:500">${_t('tag_you')}</span>` : ''}
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:5px;padding-right:4px" class="vc-icons-container">
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
              menu.style.cssText = 'position:fixed;z-index:9999;background:rgba(12,10,26,.95);border:1px solid rgba(124,58,237,.2);box-shadow:0 16px 48px rgba(0,0,0,.8);border-radius:14px;padding:6px;display:flex;flex-direction:column;min-width:190px;backdrop-filter:blur(20px)';
              
              menu.style.left = e.clientX + 'px';
              menu.style.top = e.clientY + 'px';
              
              menu.innerHTML = `
                <div style="padding:8px 12px 8px;border-bottom:1px solid rgba(124,58,237,.12);margin-bottom:4px">
                  <div style="font-size:10px;text-transform:uppercase;font-weight:700;color:rgba(167,139,250,.5);letter-spacing:.12em">${u.displayName}</div>
                </div>
                <button style="width:100%;text-align:left;padding:9px 12px;border-radius:9px;font-size:13px;color:rgba(255,255,255,.85);background:transparent;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background .15s" onmouseenter="this.style.background='rgba(124,58,237,.15)'" onmouseleave="this.style.background='transparent'">
                  <span style="width:15px;height:15px;display:flex;align-items:center;justify-content:center;color:${isLocallyMuted ? '#4ade80' : '#f87171'}">${isLocallyMuted ? ICONS.mic : ICONS.micOff}</span>
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
        
        this._syncIcons(u.id, u);
      });
    }

    _syncIcons(userId, u) {
      const iconContainer = document.querySelector(`#vc-u-${userId} .vc-icons-container`);
      if (!iconContainer) return;
      const mico = iconContainer.querySelector('.vc-mico');
      const dico = iconContainer.querySelector('.vc-dico');
      
      if (u.dnd) {
        if (!dico) {
          if (mico) mico.insertAdjacentHTML('beforebegin', `<span class="vc-dico" style="color:#a855f7;width:16px;height:16px;display:flex" title="${_t('btn_dnd')}">${ICONS.dnd}</span>`);
          else iconContainer.insertAdjacentHTML('beforeend', `<span class="vc-dico" style="color:#a855f7;width:16px;height:16px;display:flex" title="${_t('btn_dnd')}">${ICONS.dnd}</span>`);
        }
      } else if (dico) {
        dico.remove();
      }

      if (u.muted || u.localMuted) {
        if (!mico) {
          iconContainer.insertAdjacentHTML('beforeend', `<span class="vc-mico" style="color:#ef4444;width:16px;height:16px;display:flex" title="${u.localMuted ? 'Silenciado localmente' : 'Silenciado'}">${ICONS.micOff}</span>`);
        }
      } else if (mico) {
        mico.remove();
      }
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
                cnt.innerHTML = `<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.2);margin-right:5px"></span><span style="color:rgba(255,255,255,.3)">${_t('vc_nobody')}</span>`;
              } else {
                cnt.innerHTML = `<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#06b6d4;margin-right:5px;animation:vc-pulse-slow 1.5s infinite;box-shadow:0 0 6px rgba(6,182,212,.6)"></span><span style="color:rgba(6,182,212,.9)">${data.users} ${data.users === 1 ? _t('vc_person') : _t('vc_persons')}</span>`;
              }
              cnt.style.opacity = '1';
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
             joinBtn.innerHTML = '<div style="width:18px;height:18px;border-radius:50%;border:2.5px solid rgba(255,255,255,.2);border-top-color:#fff;animation:vc-spin .8s linear infinite;display:inline-block"></div>';
             this._doJoin(name);
          });
        }

      const reconnectBtn = document.getElementById('vc-reconnect');
      if (reconnectBtn) reconnectBtn.addEventListener('click', () => {
        if (this._savedName && this._savedPass) {
          if (this.progNode) { this._stopSfx(this.progNode); this.progNode = null; }
          this._render(this._tplLoading());
          this.progNode = this._playSfx('jbl_latency', 0.3, true);
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

      const btnOracleRedirect = document.getElementById('vc-btn-oracle-redirect');
      if (btnOracleRedirect) {
        btnOracleRedirect.addEventListener('click', () => {
          this._leave();
          window.location.href = '/oracle.html?autojoin=true';
        });
      }

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
      
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: this._audioConstraints, video: false });
      } catch {
        this._render(this._tplLogin(_t('err_mic')));
        return;
      }

      if (this.progNode) { this._stopSfx(this.progNode); this.progNode = null; }
      this.progNode = this._playSfx('jbl_latency', 0.3, true);

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
          this.socket.emit('join_channel', { password: pass, displayName: name, photoURL: window.yaireCurrentUser?.photoURL || null, oracleHandle: window.yaireCurrentUser?.oracleHandle || null });
        });

        this.socket.on('join_error', ({ message }) => {
          this._stopSfx(this.progNode); this.progNode = null;
          this._cleanup();
          this._render(this._tplLogin(message));
        });

        this.socket.on('joined', async ({ userId, existingUsers }) => {
          this._stopSfx(this.progNode); this.progNode = null;
          this._playSfx('jbl_success', 0.5);

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
              typingEl.style.display = 'block';
              const msgsEl = document.getElementById('vc-msgs');
              if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
            } else {
              typingEl.style.display = 'none';
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
            this.socket.emit('join_channel', { password: this._savedPass, displayName: this._savedName, photoURL: window.yaireCurrentUser?.photoURL || null, oracleHandle: window.yaireCurrentUser?.oracleHandle || null });
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
        btn.className = `vc-btn-glass${this.muted ? ' vc-btn-muted-active' : ''}`;
        btn.innerHTML = `<span style="width:15px;height:15px;display:flex;align-items:center;justify-content:center">${this.muted ? ICONS.micOff : ICONS.mic}</span> ${this.muted ? _t('btn_muted') : _t('btn_mic')}`;
        const svg = btn.querySelector('svg');
        if (svg) { svg.style.transform = 'scale(1.3)'; setTimeout(() => { if (svg) svg.style.transform = ''; }, 150); }
      }
      
      const barMute = document.getElementById('vc-bar-mute');
      if (barMute) {
        barMute.style.color = this.muted ? '#f87171' : 'rgba(255,255,255,.45)';
        barMute.style.background = this.muted ? 'rgba(239,68,68,.12)' : 'transparent';
        barMute.querySelector('span').innerHTML = this.muted ? ICONS.micOff : ICONS.mic;
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
      
      const btn2 = document.getElementById('vc-dnd');
      if (btn2) {
        btn2.className = `vc-btn-glass${this.dnd ? ' vc-btn-dnd-active' : ''}`;
        btn2.innerHTML = `<span style="width:15px;height:15px;display:flex;align-items:center;justify-content:center">${ICONS.bell}</span> DND`;
        const svg = btn2.querySelector('svg');
        if (svg) { svg.style.transform = 'scale(1.2) rotate(-15deg)'; setTimeout(() => { if (svg) svg.style.transform = ''; }, 150); }
      }
      this._updateUsersDOM();
      this._playSfx(this.dnd ? 'toggleOff' : 'toggleOn', 0.4);
    }

    // ── LEAVE ─────────────────────────────────────────────────────────────
    _leave() {
      this._playSfx('siri_end', 0.5);
      if (this.socket) { this.socket.emit('leave_channel'); this.socket.disconnect(); this.socket = null; }
      this._cleanup();
      
      if (this._bar) {
        this._bar.style.opacity = '0';
        this._bar.style.transform = 'translateY(10px) scale(.94)';
        this._bar.style.pointerEvents = 'none';
        this._bar.style.visibility = 'hidden';
      }
      if (this.panel) {
        this.panel.style.opacity = '1';
        this.panel.style.transform = 'scale(1) translateY(0)';
        this.panel.style.pointerEvents = 'auto';
        this.panel.style.visibility = 'visible';
      }
      
      this._render(this._tplLogin());
    }

    // ── CHAT METHODS ────────────────────────────────────────────────────
    _renderChatMsgs() {
      if (this._chatMsgs.length === 0) return `<div style="text-align:center;color:rgba(255,255,255,.2);font-size:12px;padding:28px 16px">${_t('vc_chat_empty')}</div>`;
      
      let html = '';
      let lastFrom = null;

      for (let i = 0; i < this._chatMsgs.length; i++) {
        const m = this._chatMsgs[i];
        const isMe = m.from === this.myId;
        const time = new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const escText = this._escHtml(m.text);
        const isEmojiOnly = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\s)+$/u.test(m.text) && m.text.trim().length > 0;
        
        const bubbleClass = isEmojiOnly 
          ? 'vc-bubble-emoji' 
          : (isMe ? 'vc-bubble-me' : 'vc-bubble-them');
              
        const isGrouped = (lastFrom === m.from);
        
        if (!isGrouped) {
          if (i > 0) html += `</div></div>`; // close previous group
          html += `
          <div style="display:flex;flex-direction:column;margin-bottom:10px;align-items:${isMe ? 'flex-end' : 'flex-start'}" class="vc-chat-msg" data-from="${m.from}">
            <div style="display:flex;align-items:baseline;gap:5px;margin-bottom:4px;padding:0 2px">
              <span style="font-size:10px;font-weight:700;color:${isMe ? '#a78bfa' : 'rgba(255,255,255,.5)'}">${m.name}</span>
              <span style="font-size:9px;color:rgba(255,255,255,.25)">${time}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;width:100%;align-items:${isMe ? 'flex-end' : 'flex-start'}" class="vc-chat-bubbles">
              <div class="${bubbleClass}">${escText}</div>`;
        } else {
          html += `<div class="${bubbleClass}">${escText}</div>`;
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
          ? 'vc-bubble-emoji' 
          : (isMe ? 'vc-bubble-me' : 'vc-bubble-them');
              
        const lastMsgEl = msgsEl.lastElementChild;
        const lastFrom = lastMsgEl ? lastMsgEl.getAttribute('data-from') : null;
        
        let newBubbleEl;

        if (lastFrom === from) {
          // append just the bubble
          const bubblesContainer = lastMsgEl.querySelector('.vc-chat-bubbles');
          bubblesContainer.insertAdjacentHTML('beforeend', `<div class="${bubbleClass}">${escText}</div>`);
          newBubbleEl = bubblesContainer.lastElementChild;
        } else {
          // append full group
          msgsEl.insertAdjacentHTML('beforeend', `
            <div style="display:flex;flex-direction:column;margin-bottom:10px;align-items:${isMe ? 'flex-end' : 'flex-start'}" class="vc-chat-msg" data-from="${from}">
              <div style="display:flex;align-items:baseline;gap:5px;margin-bottom:4px;padding:0 2px">
                <span style="font-size:10px;font-weight:700;color:${isMe ? '#a78bfa' : 'rgba(255,255,255,.5)'}">${name}</span>
                <span style="font-size:9px;color:rgba(255,255,255,.25)">${time}</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;width:100%;align-items:${isMe ? 'flex-end' : 'flex-start'}" class="vc-chat-bubbles">
                <div class="${bubbleClass}">${escText}</div>
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
        <div class="vc-ring-waves">
          <div class="vc-ring-wave-el"></div>
          <div class="vc-ring-wave-el"></div>
          <div class="vc-ring-wave-el"></div>
          <div class="vc-ring-avatar-el">${initials}</div>
        </div>
        <div class="vc-ring-label-el">${_t('vc_ring_title')}</div>
        <div class="vc-ring-name-el">${callerName}</div>
        <div class="vc-ring-sub-el">${_t('vc_ring_msg')}</div>
        <div class="vc-ring-btns-el">
          <button class="vc-ring-btn-join" id="vc-ring-join">${_t('vc_ring_join')}</button>
          <button class="vc-ring-btn-ignore" id="vc-ring-ignore">${_t('vc_ring_ignore')}</button>
        </div>`;
      document.body.appendChild(overlay);

      // Auto-dismiss after 20 seconds
      this._ringTimeout = setTimeout(() => this._dismissRing(), 20000);

      document.getElementById('vc-ring-join').addEventListener('click', () => {
        this._dismissRing();
        // Open the panel for the user to join
        this._toggle();
        this._playSfx('flyin', 0.4, false, 'fly');
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
          ? `<span style="display:flex;align-items:flex-end;gap:2px;height:12px">
               <span style="width:2.5px;background:linear-gradient(to top,#7c3aed,#06b6d4);border-radius:99px;animation:vc-eq .8s ease-in-out infinite"></span>
               <span style="width:2.5px;background:linear-gradient(to top,#7c3aed,#06b6d4);border-radius:99px;animation:vc-eq .8s ease-in-out infinite .2s"></span>
               <span style="width:2.5px;background:linear-gradient(to top,#7c3aed,#06b6d4);border-radius:99px;animation:vc-eq .8s ease-in-out infinite .4s"></span>
             </span>`
          : `<span style="width:16px;height:16px;color:rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center">${ICONS.sound || '♪'}</span>`;
        nowPlaying = `
          <div style="background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.2);border-radius:14px;padding:12px;margin-bottom:10px;position:relative;overflow:hidden">
            <div style="position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;background:rgba(124,58,237,.1);filter:blur(20px)"></div>
            <div style="display:flex;align-items:center;gap:10px;position:relative;z-index:1;margin-bottom:10px">
              <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid rgba(124,58,237,.2)">
                ${eqBars}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:9px;color:#a78bfa;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">${_t('vc_music_now')}</div>
                ${this._cleanMusicTitle(track.title).length > 25 
                  ? `<div class="vc-marquee-container" style="font-size:12.5px;font-weight:700;color:#fff">
                       <div class="vc-marquee-content">${this._escHtml(this._cleanMusicTitle(track.title))}</div>
                       <div class="vc-marquee-content" aria-hidden="true">${this._escHtml(this._cleanMusicTitle(track.title))}</div>
                     </div>` 
                  : `<div style="font-size:12.5px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${this._escHtml(this._cleanMusicTitle(track.title))}</div>`
                }
                <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:1px">${track.addedByName ? `${_t('vc_music_by')} ${track.addedByName}` : ''}</div>
              </div>
              <span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:5px;background:rgba(124,58,237,.2);color:#a78bfa;flex-shrink:0">${(track.source || track.type) === 'youtube' ? 'YT' : 'SP'}</span>
            </div>
            
            ${track.type === 'youtube' ? `
              <div style="position:relative;z-index:1;margin-bottom:10px">
                <div class="vc-progress-track" id="vc-music-progress">
                  <div class="vc-progress-fill" id="vc-music-progress-fill" style="width:${currentPct}%"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:9px;color:rgba(255,255,255,.35);margin-top:4px;font-family:'SF Mono',Monaco,monospace">
                  <span id="vc-music-time-current">${cTimeFmt}</span>
                  <span id="vc-music-time-total">${tTimeFmt}</span>
                </div>
              </div>
            ` : ''}
            
            ${track.type === 'spotify' ? `<div style="margin-top:8px;width:100%" id="vc-spotify-embed"></div>` : ''}
            
            <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">
              <div style="display:flex;align-items:center;gap:8px">
                <button id="vc-music-playpause" style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#06b6d4);display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;color:#fff;box-shadow:0 4px 16px rgba(124,58,237,.4);transition:opacity .15s" onmouseenter="this.style.opacity='.85'" onmouseleave="this.style.opacity='1'">
                  <span style="width:14px;height:14px;display:flex;align-items:center;justify-content:center">${isPlaying ? ICONS.pause : ICONS.play}</span>
                </button>
                <button id="vc-music-skip" style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.6);cursor:pointer;transition:background .15s" onmouseenter="this.style.background='rgba(124,58,237,.2)'" onmouseleave="this.style.background='rgba(255,255,255,.06)'">
                  <span style="width:13px;height:13px;display:flex">${ICONS.skipFwd}</span>
                </button>
              </div>
              <div style="width:42%;display:flex;align-items:center;gap:6px">
                <span style="color:rgba(255,255,255,.3);width:13px;height:13px;display:flex">${ICONS.volumeUp}</span>
                <input type="range" id="vc-music-vol-slider" min="0" max="100" value="${this._musicVolume}" style="width:100%;height:3px;border-radius:99px;appearance:none;cursor:pointer;accent-color:#7c3aed;background:rgba(255,255,255,.08)" />
              </div>
            </div>
          </div>`;
      } else {
        nowPlaying = `<div style="text-align:center;color:rgba(255,255,255,.2);font-size:12px;padding:14px;margin-bottom:10px;background:rgba(124,58,237,.04);border-radius:12px;border:1px solid rgba(124,58,237,.1)">${_t('vc_music_no_track')}</div>`;
      }
      
      const queueItems = this._musicQueue.length > 0
        ? this._musicQueue.map((t, i) => {
            const isCur = i === this._musicState.currentIndex;
            return `
            <div style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:10px;transition:background .15s;background:${isCur ? 'rgba(124,58,237,.12)' : 'transparent'};border:1px solid ${isCur ? 'rgba(124,58,237,.25)' : 'transparent'}" onmouseenter="if(!${isCur})this.style.background='rgba(255,255,255,.04)'" onmouseleave="if(!${isCur})this.style.background='transparent'">
              <span style="width:14px;text-align:center;font-size:10px;font-weight:700;color:${isCur ? '#a78bfa' : 'rgba(255,255,255,.25)'}">${isCur && this._musicPlaying ? '♪' : (i + 1)}</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:11.5px;font-weight:600;color:${isCur ? '#a78bfa' : '#fff'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${this._escHtml(this._cleanMusicTitle(t.title))}</div>
                <div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:1px">${t.addedByName || ''}</div>
              </div>
              <span style="font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px;background:${isCur ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,.06)'};color:${isCur ? '#a78bfa' : 'rgba(255,255,255,.3)'}">${(t.source || t.type) === 'youtube' ? 'YT' : 'SP'}</span>
              ${!isCur ? `<button class="vc-music-track-rm" data-track-id="${t.id}" style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:rgba(255,255,255,.2);cursor:pointer;border-radius:6px;transition:all .15s" onmouseenter="this.style.background='rgba(239,68,68,.15)';this.style.color='#f87171'" onmouseleave="this.style.background='transparent';this.style.color='rgba(255,255,255,.2)'">
                <span style="width:11px;height:11px;display:flex">${ICONS.trash}</span>
              </button>` : ''}
            </div>`;
          }).join('')
        : `<div style="text-align:center;color:rgba(255,255,255,.2);font-size:11px;padding:16px">${_t('vc_music_empty_q')}</div>`;
        
      return `
        <div style="padding:12px;flex:1;display:flex;flex-direction:column">
          ${nowPlaying}
          <div style="font-size:9px;color:rgba(167,139,250,.4);font-weight:700;text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px;padding:0 2px">${_t('vc_music_queue')} ${this._musicQueue.length > 0 ? `(${this._musicQueue.length})` : ''}</div>
          <div style="display:flex;flex-direction:column;gap:2px;margin-bottom:10px" id="vc-music-queue">${queueItems}</div>
          <div style="margin-top:auto;padding-top:8px">
            <div style="color:#f87171;font-size:11px;text-align:center;margin-bottom:5px;min-height:15px" id="vc-music-err"></div>
            <div style="display:flex;gap:7px">
              <input id="vc-music-url" type="text" placeholder="${_t('vc_music_ph')}" autocomplete="off" class="vc-input" style="flex:1;padding:8px 11px;font-size:11.5px" />
              <button id="vc-music-add" class="vc-btn-primary" style="padding:8px 12px;font-size:11.5px;font-weight:700;white-space:nowrap" onclick="const errEl=document.getElementById('vc-music-err');errEl.textContent='';this.disabled=true;this.innerHTML='<span style=\'width:12px;height:12px;border-radius:50%;border:2px solid #000;border-top-color:transparent;animation:vc-spin 1s linear infinite;display:inline-block;vertical-align:middle\'></span>';">+ ${_t('vc_music_add')}</button>
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
          tab.insertAdjacentHTML('beforeend', `<span class="vc-music-ind" style="display:flex;align-items:flex-end;gap:2px;height:10px;margin-left:4px">
             <span style="width:2px;background:#06b6d4;border-radius:99px;animation:vc-eq .8s ease-in-out infinite"></span>
             <span style="width:2px;background:#06b6d4;border-radius:99px;animation:vc-eq .8s ease-in-out infinite .2s"></span>
             <span style="width:2px;background:#06b6d4;border-radius:99px;animation:vc-eq .8s ease-in-out infinite .4s"></span>
           </span>`);
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
      const eq1 = document.getElementById('vc-bar-eq1');
      const eq2 = document.getElementById('vc-bar-eq2');
      const eq3 = document.getElementById('vc-bar-eq3');
      const title = document.getElementById('vc-bar-title');
      if (eq1) eq1.style.animationPlayState = isAnyoneSpeaking ? 'running' : 'paused';
      if (eq2) eq2.style.animationPlayState = isAnyoneSpeaking ? 'running' : 'paused';
      if (eq3) eq3.style.animationPlayState = isAnyoneSpeaking ? 'running' : 'paused';
      if (title) title.style.color = isAnyoneSpeaking ? '#06b6d4' : '#a78bfa';
    }

    _updateBarMusicState() {
      const barMusicIcon = document.getElementById('vc-bar-music-icon');
      if (barMusicIcon) {
        barMusicIcon.style.display = this._musicPlaying ? 'flex' : 'none';
      }
    }

    _updateBarChatState() {
      const barChatIcon = document.getElementById('vc-bar-chat-icon');
      if (barChatIcon) {
        barChatIcon.style.display = this._chatUnread > 0 ? 'block' : 'none';
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
          // gradient: violet at bottom, cyan at top
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, `rgba(124,58,237,${0.3 + v * 0.7})`);
          gradient.addColorStop(1, `rgba(6,182,212,${0.2 + v * 0.8})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(i * (barW + 1), canvas.height - h, barW, h);
        }
        this._vizRaf = requestAnimationFrame(draw);
      };
      draw();
    }

    // ── TOAST + SOUND ─────────────────────────────────────────────────────
    _toast(msg, type = 'info') {
      const t = document.createElement('div');
      t.style.cssText = [
        'position:fixed', 'bottom:88px', 'right:24px', 'z-index:999998',
        'padding:10px 16px',
        'background:rgba(8,8,16,.92)',
        'backdrop-filter:blur(20px)',
        'border:1px solid ' + (type === 'join' ? 'rgba(6,182,212,.3)' : type === 'error' ? 'rgba(239,68,68,.3)' : 'rgba(124,58,237,.3)'),
        'border-radius:12px',
        'color:#fff',
        'font-size:13px',
        'font-weight:600',
        'font-family:Inter,sans-serif',
        'box-shadow:0 8px 32px rgba(0,0,0,.6)',
        'animation:vc-slide-up .25s cubic-bezier(.34,1.4,.64,1)',
        'max-width:280px',
        'pointer-events:none',
        'transition:opacity .4s'
      ].join(';');
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 3000);
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
        if (this.panel.style.opacity !== '1' && this.connected) {
          this._bar.style.opacity = '1';
          this._bar.style.transform = 'translateY(0) scale(1)';
          this._bar.style.pointerEvents = 'auto';
          this._bar.style.visibility = 'visible';
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

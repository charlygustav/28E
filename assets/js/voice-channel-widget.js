/* =========================================================
   28E — Afterglow (Firebase + WebRTC)
   ========================================================= */
(function () {
  'use strict';

  // ── FIREBASE VOICE ──────────────
  // Google identity and channel events use the existing Firebase project.

  // ── INTERNATIONALIZATION ──────────────────────────────────────────────────
  const VC_I18N = {
    es: {
      page_previous: "Anterior",
      page_next: "Siguiente",
      dock_open: "Abrir Afterglow",
      dock_active: "En llamada",
      page_queue: "Páginas de la cola",
      page_catalog: "Páginas de Spotlight",

      room_local_mute: "Silenciar para mí",
      room_local_unmute: "Volver a escuchar",
      room_hero: "Un lugar para escucharnos.",
      room_intro: "Entra, ponte cómodo y quédate un rato.",
      room_name: "Sala principal",
      room_capacity: "Hasta 4 personas · Voz, chat y música",
      room_mic_hint: "Tu micrófono se activará al entrar.",
      room_join: "Entrar a Afterglow",
      room_auth_title: "Tu lugar está aquí",
      room_auth_desc: "Entra con Google y comparte un rato de voz y música.",
      room_google: "Entrar con Google",
      room_ready: "Listos para conversar",
      room_mic_on: "Micrófono activo",
      room_deafened: "Escucha silenciada",
      room_deafen: "Silenciar audio",
      room_undeafen: "Activar audio",
      room_chat_title: "Todo empieza con un hola.",
      room_chat_desc: "Los mensajes de esta sala aparecerán aquí.",
      room_music_title: "Ponle música al momento.",
      room_music_desc: "Añade una canción o elige algo de Spotlight.",
      room_listen: "Escuchar juntos",
      room_catalog: "Explorar Spotlight",
      room_link_label: "YouTube o Spotify",
      room_back_music: "Volver a música",
      room_search: "Buscar en Spotlight",
      room_loading: "Preparando tu lugar…",
      room_loading_desc: "Permite el acceso al micrófono si el navegador te lo pide.",
      room_retry_title: "Volvemos a intentarlo",
      room_retry_desc: "La conexión se interrumpió. Puedes volver a entrar a la sala.",
      room_waiting: "Esperando compañía",
      room_in: "En la sala",
      room_mic_off: "Micrófono silenciado",
      room_options: "Opciones de participante",
      room_open: "Abrir Afterglow",
      room_close: "Cerrar panel",
      room_logout: "Cerrar sesión",
      room_paused: "Música en pausa",
      room_play: "Reproducir",
      room_pause: "Pausar",
      room_remove: "Quitar de la cola",
      room_volume: "Volumen de música",
      room_send: "Enviar mensaje",
      room_minimize_hint: "Puedes seguir navegando sin salir de la llamada.",
      room_silent: "Nadie está hablando todavía",
      room_google_loading: "Preparando Google…",
      room_google_error: "No se pudo iniciar sesión. Vuelve a intentarlo.",
      room_people: "Personas en la sala",
      room_leave: "Salir de la llamada",
      room_cancel: "Cancelar",
      room_account: "Cuenta de Google",
      room_search_label: "Buscar canción o artista",
      room_no_results: "Sin resultados",
      room_no_results_desc: "Prueba con otro título o artista.",
      room_link_ph: "Enlace de YouTube o Spotify",
      room_you_in: "Estás en la sala",
      room_persons: "personas en la sala",
      room_person: "persona en la sala",
      room_checking: "Comprobando la sala…",
      vc_title: "Afterglow",
      vc_sub: "Voz, chat y música en Afterglow",
      lbl_name: "Tu nombre",
      ph_name: "Ej: Charles",
      lbl_pass: "Contraseña del canal",
      ph_pass: "••••••••",
      btn_join: "Entrar a Afterglow",
      st_conn: "Conectando…",
      st_estab: "Estableciendo conexión…",
      st_disc: "Desconectado",
      msg_disc: "Se perdió la conexión con el servidor.",
      btn_reconn: "Reconectar",
      sect_in: "En el canal",
      empty_chan: "Solo tú por ahora…",
      tag_you: "(tú)",
      btn_mic: "Mic",
      btn_audio: "Audio",
      btn_audio_off: "Sin audio",
      btn_muted: "Silenciado",
      btn_leave: "Salir",
      bar_conn: "Conectado · Afterglow",
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
      vc_ring_title: "Llamada en Afterglow",
      vc_ring_msg: "quiere hablar contigo 💛",
      vc_ring_join: "Unirse",
      vc_ring_ignore: "Ignorar",
      vc_restricted: "Acceso Restringido",
      vc_req_login: "Inicia sesión con tu cuenta de Google para entrar a Afterglow.",
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
      vc_nobody: "Nadie en el canal por ahora",
      vc_person: "persona conectada",
      vc_persons: "personas conectadas",
      vc_tab_room: "Sala",
      vc_spotlight_menu: "Menú Spotlight",
      vc_spotlight_live: "Sintonizar en vivo",
      vc_spotlight_title: "Canciones de Spotlight",
      vc_spotlight_search_ph: "Buscar canción o artista…",
      vc_spotlight_play_now: "Sonar",
      vc_spotlight_add_queue: "Añadir a la cola",
      vc_spotlight_back: "Volver a la cola",
      vc_spotlight_live_hint: "Transmitiendo Spotlight en tiempo real"
    },
    en: {
      page_previous: "Previous",
      page_next: "Next",
      dock_open: "Open Afterglow",
      dock_active: "In a call",
      page_queue: "Queue pages",
      page_catalog: "Spotlight pages",

      room_local_mute: "Mute for me",
      room_local_unmute: "Unmute for me",
      room_hero: "A place to hear each other.",
      room_intro: "Come in, get comfortable and stay a while.",
      room_name: "Main room",
      room_capacity: "Up to 4 people · Voice, chat and music",
      room_mic_hint: "Your microphone will turn on when you join.",
      room_join: "Join Afterglow",
      room_auth_title: "Your place is here",
      room_auth_desc: "Sign in with Google and share a little voice and music.",
      room_google: "Sign in with Google",
      room_ready: "Ready to talk",
      room_mic_on: "Microphone on",
      room_deafened: "Audio muted",
      room_deafen: "Mute audio",
      room_undeafen: "Unmute audio",
      room_chat_title: "It starts with hello.",
      room_chat_desc: "Messages from this room will appear here.",
      room_music_title: "Give the moment a soundtrack.",
      room_music_desc: "Add a song or pick something from Spotlight.",
      room_listen: "Listen together",
      room_catalog: "Explore Spotlight",
      room_link_label: "YouTube or Spotify",
      room_back_music: "Back to music",
      room_search: "Search Spotlight",
      room_loading: "Getting your place ready…",
      room_loading_desc: "Allow microphone access if your browser asks.",
      room_retry_title: "Let’s try again",
      room_retry_desc: "The connection was interrupted. You can rejoin the room.",
      room_waiting: "Waiting for company",
      room_in: "In the room",
      room_mic_off: "Microphone muted",
      room_options: "Participant options",
      room_open: "Open Afterglow",
      room_close: "Close panel",
      room_logout: "Sign out",
      room_paused: "Music paused",
      room_play: "Play",
      room_pause: "Pause",
      room_remove: "Remove from queue",
      room_volume: "Music volume",
      room_send: "Send message",
      room_minimize_hint: "You can keep browsing without leaving the call.",
      room_silent: "No one is speaking yet",
      room_google_loading: "Connecting to Google…",
      room_google_error: "Could not sign in. Please try again.",
      room_people: "People in the room",
      room_leave: "Leave the call",
      room_cancel: "Cancel",
      room_account: "Google account",
      room_search_label: "Search song or artist",
      room_no_results: "No results",
      room_no_results_desc: "Try another title or artist.",
      room_link_ph: "YouTube or Spotify link",
      room_you_in: "You’re in the room",
      room_persons: "people in the room",
      room_person: "person in the room",
      room_checking: "Checking the room…",
      vc_title: "Afterglow",
      vc_sub: "Voice, chat and music in Afterglow",
      lbl_name: "Your name",
      ph_name: "Ex: Charles",
      lbl_pass: "Channel password",
      ph_pass: "••••••••",
      btn_join: "Join Afterglow",
      st_conn: "Connecting…",
      st_estab: "Establishing connection…",
      st_disc: "Disconnected",
      msg_disc: "Connection to the server was lost.",
      btn_reconn: "Reconnect",
      sect_in: "In channel",
      empty_chan: "Just you for now…",
      tag_you: "(you)",
      btn_mic: "Mic",
      btn_audio: "Audio",
      btn_audio_off: "Muted",
      btn_muted: "Muted",
      btn_leave: "Leave",
      bar_conn: "Connected · Afterglow",
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
      vc_ring_title: "Incoming Afterglow call",
      vc_ring_msg: "wants to talk to you 💛",
      vc_ring_join: "Join",
      vc_ring_ignore: "Ignore",
      vc_restricted: "Restricted Access",
      vc_req_login: "Sign in with your Google account to join Afterglow.",
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
      vc_nobody: "No one in the channel yet",
      vc_person: "person connected",
      vc_persons: "people connected",
      vc_tab_room: "Room",
      vc_spotlight_menu: "Spotlight Menu",
      vc_spotlight_live: "Tune in Live",
      vc_spotlight_title: "Spotlight Songs",
      vc_spotlight_search_ph: "Search song or artist…",
      vc_spotlight_play_now: "Play",
      vc_spotlight_add_queue: "Add to queue",
      vc_spotlight_back: "Back to queue",
      vc_spotlight_live_hint: "Streaming Spotlight in real-time"
    },
    pt: {
      page_previous: "Anterior",
      page_next: "Próxima",
      dock_open: "Abrir Afterglow",
      dock_active: "Em chamada",
      page_queue: "Páginas da fila",
      page_catalog: "Páginas do Spotlight",

      room_local_mute: "Silenciar para mim",
      room_local_unmute: "Ouvir de novo",
      room_hero: "Um lugar para nos ouvir.",
      room_intro: "Entre, fique à vontade e passe um tempo.",
      room_name: "Sala principal",
      room_capacity: "Até 4 pessoas · Voz, chat e música",
      room_mic_hint: "Seu microfone será ativado ao entrar.",
      room_join: "Entrar no Afterglow",
      room_auth_title: "Seu lugar é aqui",
      room_auth_desc: "Entre com o Google e compartilhe voz e música.",
      room_google: "Entrar com o Google",
      room_ready: "Prontos para conversar",
      room_mic_on: "Microfone ativo",
      room_deafened: "Áudio silenciado",
      room_deafen: "Silenciar áudio",
      room_undeafen: "Ativar áudio",
      room_chat_title: "Tudo começa com um oi.",
      room_chat_desc: "As mensagens desta sala aparecerão aqui.",
      room_music_title: "Dê música ao momento.",
      room_music_desc: "Adicione uma música ou escolha no Spotlight.",
      room_listen: "Ouvir juntos",
      room_catalog: "Explorar Spotlight",
      room_link_label: "YouTube ou Spotify",
      room_back_music: "Voltar à música",
      room_search: "Buscar no Spotlight",
      room_loading: "Preparando seu lugar…",
      room_loading_desc: "Permita o microfone se o navegador pedir.",
      room_retry_title: "Vamos tentar de novo",
      room_retry_desc: "A conexão foi interrompida. Você pode entrar de novo.",
      room_waiting: "Esperando companhia",
      room_in: "Na sala",
      room_mic_off: "Microfone silenciado",
      room_options: "Opções do participante",
      room_open: "Abrir Afterglow",
      room_close: "Fechar painel",
      room_logout: "Sair da conta",
      room_paused: "Música pausada",
      room_play: "Reproduzir",
      room_pause: "Pausar",
      room_remove: "Remover da fila",
      room_volume: "Volume da música",
      room_send: "Enviar mensagem",
      room_minimize_hint: "Você pode navegar sem sair da chamada.",
      room_silent: "Ninguém está falando ainda",
      room_google_loading: "Conectando ao Google…",
      room_google_error: "Não foi possível entrar. Tente de novo.",
      room_people: "Pessoas na sala",
      room_leave: "Sair da chamada",
      room_cancel: "Cancelar",
      room_account: "Conta do Google",
      room_search_label: "Buscar música ou artista",
      room_no_results: "Nenhum resultado",
      room_no_results_desc: "Tente outro título ou artista.",
      room_link_ph: "Link do YouTube ou Spotify",
      room_you_in: "Você está na sala",
      room_persons: "pessoas na sala",
      room_person: "pessoa na sala",
      room_checking: "Verificando a sala…",
      vc_title: "Afterglow",
      vc_sub: "Voz, chat e música no Afterglow",
      lbl_name: "Seu nome",
      ph_name: "Ex: Charles",
      lbl_pass: "Senha do canal",
      ph_pass: "••••••••",
      btn_join: "Entrar no Afterglow",
      st_conn: "Conectando…",
      st_estab: "Estabelecendo conexão…",
      st_disc: "Desconectado",
      msg_disc: "A conexão com o servidor foi perdida.",
      btn_reconn: "Reconectar",
      sect_in: "No canal",
      empty_chan: "Só você por enquanto…",
      tag_you: "(você)",
      btn_mic: "Mic",
      btn_audio: "Áudio",
      btn_audio_off: "Sem áudio",
      btn_muted: "Silenciado",
      btn_leave: "Sair",
      bar_conn: "Conectado · Afterglow",
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
      vc_ring_title: "Chamada no Afterglow",
      vc_ring_msg: "quer falar com você 💛",
      vc_ring_join: "Entrar",
      vc_ring_ignore: "Ignorar",
      vc_restricted: "Acesso Restrito",
      vc_req_login: "Entre com sua conta do Google para acessar o Afterglow.",
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
      vc_nobody: "Ninguém no canal por enquanto",
      vc_person: "pessoa conectada",
      vc_persons: "pessoas conectadas",
      vc_tab_room: "Sala",
      vc_spotlight_menu: "Menu Spotlight",
      vc_spotlight_live: "Sintonizar ao vivo",
      vc_spotlight_title: "Músicas do Spotlight",
      vc_spotlight_search_ph: "Buscar música ou artista…",
      vc_spotlight_play_now: "Tocar",
      vc_spotlight_add_queue: "Adicionar à fila",
      vc_spotlight_back: "Voltar para a fila",
      vc_spotlight_live_hint: "Transmitindo Spotlight em tempo real"
    },
    fr: {
      page_previous: "Précédent",
      page_next: "Suivant",
      dock_open: "Ouvrir Afterglow",
      dock_active: "En appel",
      page_queue: "Pages de la file",
      page_catalog: "Pages Spotlight",

      room_local_mute: "Couper pour moi",
      room_local_unmute: "Réactiver pour moi",
      room_hero: "Un endroit pour s’écouter.",
      room_intro: "Entre, installe-toi et reste un moment.",
      room_name: "Salon principal",
      room_capacity: "Jusqu’à 4 personnes · Voix, chat et musique",
      room_mic_hint: "Ton micro sera activé en entrant.",
      room_join: "Rejoindre Afterglow",
      room_auth_title: "Ta place est ici",
      room_auth_desc: "Connecte-toi avec Google pour partager voix et musique.",
      room_google: "Se connecter avec Google",
      room_ready: "Prêts à discuter",
      room_mic_on: "Micro activé",
      room_deafened: "Son coupé",
      room_deafen: "Couper le son",
      room_undeafen: "Activer le son",
      room_chat_title: "Tout commence par un bonjour.",
      room_chat_desc: "Les messages du salon apparaîtront ici.",
      room_music_title: "De la musique pour ce moment.",
      room_music_desc: "Ajoute un morceau ou choisis dans Spotlight.",
      room_listen: "Écouter ensemble",
      room_catalog: "Explorer Spotlight",
      room_link_label: "YouTube ou Spotify",
      room_back_music: "Retour à la musique",
      room_search: "Rechercher dans Spotlight",
      room_loading: "On prépare ta place…",
      room_loading_desc: "Autorise le micro si le navigateur le demande.",
      room_retry_title: "On réessaie",
      room_retry_desc: "La connexion a été interrompue. Tu peux revenir.",
      room_waiting: "En attendant de la compagnie",
      room_in: "Dans le salon",
      room_mic_off: "Micro coupé",
      room_options: "Options du participant",
      room_open: "Ouvrir Afterglow",
      room_close: "Fermer le panneau",
      room_logout: "Se déconnecter",
      room_paused: "Musique en pause",
      room_play: "Lire",
      room_pause: "Mettre en pause",
      room_remove: "Retirer de la file",
      room_volume: "Volume de la musique",
      room_send: "Envoyer un message",
      room_minimize_hint: "Tu peux naviguer sans quitter l’appel.",
      room_silent: "Personne ne parle pour le moment",
      room_google_loading: "Connexion à Google…",
      room_google_error: "Connexion impossible. Réessaie.",
      room_people: "Personnes dans le salon",
      room_leave: "Quitter l’appel",
      room_cancel: "Annuler",
      room_account: "Compte Google",
      room_search_label: "Rechercher un titre ou un artiste",
      room_no_results: "Aucun résultat",
      room_no_results_desc: "Essaie un autre titre ou artiste.",
      room_link_ph: "Lien YouTube ou Spotify",
      room_you_in: "Tu es dans le salon",
      room_persons: "personnes dans le salon",
      room_person: "personne dans le salon",
      room_checking: "Vérification du salon…",
      vc_title: "Afterglow",
      vc_sub: "Voix, chat et musique sur Afterglow",
      lbl_name: "Ton nom",
      ph_name: "Ex: Charles",
      lbl_pass: "Mot de passe",
      ph_pass: "••••••••",
      btn_join: "Rejoindre Afterglow",
      st_conn: "Connexion…",
      st_estab: "Établissement de la connexion…",
      st_disc: "Déconnecté",
      msg_disc: "La connexion au serveur a été perdue.",
      btn_reconn: "Reconnecter",
      sect_in: "Dans le canal",
      empty_chan: "Juste toi pour l'instant…",
      tag_you: "(toi)",
      btn_mic: "Mic",
      btn_audio: "Audio",
      btn_audio_off: "Muet",
      btn_muted: "Sourdine",
      btn_leave: "Quitter",
      bar_conn: "Connecté · Afterglow",
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
      vc_ring_title: "Appel sur Afterglow",
      vc_ring_msg: "veut te parler 💛",
      vc_ring_join: "Rejoindre",
      vc_ring_ignore: "Ignorer",
      vc_restricted: "Accès Restreint",
      vc_req_login: "Connecte-toi avec ton compte Google pour rejoindre Afterglow.",
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
      vc_nobody: "Personne dans le canal pour l'instant",
      vc_person: "personne connectée",
      vc_persons: "personnes connectées",
      vc_tab_room: "Salon",
      vc_spotlight_menu: "Menu Spotlight",
      vc_spotlight_live: "Écouter en direct",
      vc_spotlight_title: "Morceaux Spotlight",
      vc_spotlight_search_ph: "Rechercher un titre ou artiste…",
      vc_spotlight_play_now: "Écouter",
      vc_spotlight_add_queue: "Ajouter à la file",
      vc_spotlight_back: "Retour à la file",
      vc_spotlight_live_hint: "Diffusion de Spotlight en direct"
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

  // The visual layer is independent from Firebase and WebRTC.
  const VOICE_STYLESHEET = new URL('../css/voice-channel.css?v=20261114_motion', document.currentScript?.src || new URL('assets/js/voice-channel-widget.js', document.baseURI)).href;

  const ICONS = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M19 12H5m5-5-5 5 5 5"/></svg>',
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-15a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 4H5v16h4m0-8h12m-4-4 4 4-4 4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 5v14M5 12h14"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>',
    google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.7 2.9-4.2 2.9-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-4V7.4H3a10 10 0 0 0 0 9.2L6.4 14Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9 5.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z"/></svg>',

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
      this._connecting = false;
      this._joinAttempt = 0;
      this.users       = [];
      this._savedName  = null;
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
      this._motionKeyboard = false;
      document.addEventListener('keydown', () => { this._motionKeyboard = true; }, { capture: true });
      document.addEventListener('pointerdown', () => { this._motionKeyboard = false; }, { capture: true, passive: true });
      this._reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this._reducedMotion.addEventListener?.('change', () => { if (this._reducedMotion.matches) { this._clearMotion(this.panel); this._positionTabIndicator(); } });

      // Music state
      this._queuePage = 0;
      this._catalogPage = 0;
      this._queuePageSize = 2;
      this._catalogPageSize = 5;
      this._inputDrafts = {};
      this._speakers = new Set();
      this._musicQueue = [];
      this._musicState = { currentIndex: -1, isPlaying: false };
      this._musicCurrentTrack = null;
      this._musicVolume = 50;
      this._musicPlaying = false;
      this._musicProgressInt = null;
      this._ytPlayer = null;
      this._ytApiLoading = false;
      this._ytApiCallbacks = [];
      this._audioPlayer = null;
      this._musicSpotlightView = false;
      this._spotlightSearchQuery = '';

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

      // Relay servers are loaded from protected configuration when supplied.
      // The old VPS and its bundled TURN credentials are retired.
      this.ice = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };

      this._injectCSS();
      this._buildUI();

      // Precargar los archivos de audio para que suenen a la primera
      setTimeout(() => this._initAudio(), 500);

      window.yaireVoiceChannel = this;
    }

    // ── CSS ────────────────────────────────────────────────────────────────
    _injectCSS() {
      if (document.getElementById('vc-styles')) return;
      const s = document.createElement('link');
      s.id = 'vc-styles';
      s.rel = 'stylesheet';
      s.href = VOICE_STYLESHEET;
      document.head.appendChild(s);
    }

    _initAudio() {
      if (this._audioReady) return;
      this._audioReady = true;

      this.sfxUrls = {
        flyin: 'sounds/flyin.wav',
        flyout: 'sounds/flyout.wav',
        typing: 'sounds/typing.wav',
        toggleOn: 'sounds/toggle_on.wav',
        toggleOff: 'sounds/toggle_off.wav',
        act_end: 'sounds/activity_end.mp3',
        act_join: 'sounds/activity_user_join.mp3',
        act_left: 'sounds/activity_user_left.mp3',
        music_start: 'sounds/VoiceTriggerTraining_FX_5.wav',
        vc_chat_msg: 'sounds/nuevomensajeenelchatdevoz.wav',
        music_end_all: 'sounds/VoiceTriggerTraining_FX_0.wav',
        jbl_begin: 'sounds/jbl_begin_sae.wav',
        jbl_latency: 'sounds/latency_experience_long.wav',
        jbl_success: 'sounds/latency_loop.wav',
        siri_end: 'sounds/siri-begin-improved.wav'
      };

      this.sfxBuf = this.sfxBuf || {};
      this.sfxPromises = this.sfxPromises || {};
      this._audioPool = this._audioPool || {};

      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
          this.actx = new AudioCtxClass();
        }
      } catch(e) {
        this.actx = null;
      }

      // 1. Preload dedicated HTMLAudio elements for high-reliability mobile playback
      for (const [k, u] of Object.entries(this.sfxUrls)) {
        try {
          const a = new Audio();
          a.preload = 'auto';
          a.src = u;
          a.setAttribute('playsinline', '');
          a.setAttribute('webkit-playsinline', '');
          this._audioPool[k] = a;
        } catch(e){}
      }

      // 2. Preload Web Audio buffers for desktop
      if (this.actx) {
        const loadBuf = (k, u) => {
          this.sfxPromises[k] = fetch(u)
            .then(r => {
              if (!r.ok) throw new Error('HTTP ' + r.status);
              return r.arrayBuffer();
            })
            .then(ab => this.actx.decodeAudioData(ab))
            .then(buf => {
              this.sfxBuf[k] = buf;
              return buf;
            })
            .catch(() => null);
          return this.sfxPromises[k];
        };

        for (const [k, u] of Object.entries(this.sfxUrls)) {
          loadBuf(k, u);
        }
      }

      // 3. User interaction unlocker for iOS Safari and mobile Chrome
      const unlock = () => {
        if (this.actx) {
          if (this.actx.state === 'suspended' || this.actx.state === 'interrupted') {
            this.actx.resume().catch(() => {});
          }
          if (!this._unlocked) {
            try {
              const b = this.actx.createBuffer(1, 1, 22050);
              const s = this.actx.createBufferSource();
              s.buffer = b;
              s.connect(this.actx.destination);
              s.start(0);
              this._unlocked = true;
            } catch(e){}
          }
        }
        if (!this._poolUnlocked && this._audioPool) {
          this._poolUnlocked = true;
          try {
            ['jbl_latency', 'jbl_success'].forEach(key => {
              if (this._audioPool[key]) this._audioPool[key].load();
            });
          } catch(e){}
        }
      };

      ['click', 'touchstart', 'touchend', 'pointerdown'].forEach(evt => {
        window.addEventListener(evt, unlock, { capture: true, passive: true });
      });
    }

    _playSfx(k, vol=0.4, loop=false, excl=null) {
      this._initAudio();
      if (excl && this.sfxNodes[excl]) this._stopSfx(this.sfxNodes[excl]);

      const isMobile = this._checkMobile();
      const controller = {
        key: k,
        stopped: false,
        src: null,
        gain: null,
        audio: null
      };

      if (excl) this.sfxNodes[excl] = controller;

      // Play via HTMLAudioElement (Bulletproof for mobile devices & loop streams)
      const playHtmlAudio = () => {
        if (controller.stopped) return;
        const url = this.sfxUrls && this.sfxUrls[k];
        if (!url) return;
        try {
          let a;
          if (loop) {
            a = this._audioPool && this._audioPool[k] ? this._audioPool[k] : new Audio(url);
            a.src = url;
            a.loop = true;
            a.volume = Math.max(0, Math.min(1, vol));
            a.currentTime = 0;
          } else {
            // For one-shot sounds, create or clone a clean instance so rapid taps don't collide
            a = new Audio(url);
            a.loop = false;
            a.volume = Math.max(0, Math.min(1, vol));
            a.currentTime = 0;
          }
          a.setAttribute('playsinline', '');
          a.setAttribute('webkit-playsinline', '');
          const p = a.play();
          if (p && typeof p.catch === 'function') {
            p.catch(err => {
              console.warn('[VC SFX] HTMLAudio playback error:', err);
              if (!isMobile && this.actx && this.sfxBuf && this.sfxBuf[k]) {
                playBuffer(this.sfxBuf[k]);
              }
            });
          }
          controller.audio = a;
        } catch(e) {
          console.warn('[VC SFX] Audio init error:', e);
        }
      };

      // Play via Web Audio buffer source (for Desktop)
      const playBuffer = (buf) => {
        if (controller.stopped || !this.actx) return;
        try {
          if (this.actx.state === 'suspended' || this.actx.state === 'interrupted') {
            this.actx.resume().catch(() => {});
          }
          const src = this.actx.createBufferSource();
          src.buffer = buf;
          src.loop = loop;
          const gain = this.actx.createGain();
          const t = this.actx.currentTime;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(vol, t + 0.02);
          src.connect(gain);
          gain.connect(this.actx.destination);
          src.start(0);
          controller.src = src;
          controller.gain = gain;
        } catch(e) {
          playHtmlAudio();
        }
      };

      // In Mobile browsers, HTMLAudioElement is vastly more resilient to mic/WebRTC resets
      if (isMobile) {
        playHtmlAudio();
      } else {
        if (this.actx && this.sfxBuf && this.sfxBuf[k]) {
          playBuffer(this.sfxBuf[k]);
        } else if (this.sfxPromises && this.sfxPromises[k]) {
          this.sfxPromises[k].then(buf => {
            if (controller.stopped) return;
            if (buf) playBuffer(buf);
            else playHtmlAudio();
          }).catch(() => {
            if (!controller.stopped) playHtmlAudio();
          });
        } else {
          playHtmlAudio();
        }
      }

      return controller;
    }

    _stopSfx(node) {
      if (!node) return;
      node.stopped = true;
      if (node.audio) {
        try {
          const a = node.audio;
          a.pause();
          a.currentTime = 0;
          node.audio = null;
        } catch(e){}
      }
      if (node.src && this.actx) {
        try {
          const t = this.actx.currentTime;
          if (node.gain) {
            node.gain.gain.cancelScheduledValues(t);
            node.gain.gain.setTargetAtTime(0, t, 0.02);
          }
          node.src.stop(t + 0.1);
        } catch(e){}
      }
    }

    _checkMobile() {
      return window.innerWidth <= 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    _updateBarLayout() {
      if (!this._bar) return;
      this._bar.classList.remove('vc-bar-mobile', 'bottom-24', 'right-6');
      this._bar.removeAttribute('style');
      this._updateDockState();
    }

    _buildUI() {
      const w = document.createElement('div');
      w.id = 'vc-wrapper';

      // Dark blurred backdrop matching #drawer-overlay
      this._backdrop = document.createElement('div');
      this._backdrop.id = 'vc-backdrop';
      this._backdrop.addEventListener('click', () => this._toggle());
      document.body.appendChild(this._backdrop);

      this.fab = document.createElement('button');
      this.fab.id = 'vc-fab';
      this.fab.title = _t('vc_title');
      this.fab.style.display = 'none';
      this.fab.setAttribute('aria-hidden', 'true');
      this.fab.className = 'fixed bottom-6 right-6 z-[9999] flex items-center justify-center cursor-pointer transition-all duration-300 ease-out rounded-full bg-[#0B0B10]/95 border border-white/14 shadow-[0_12px_36px_rgba(0,0,0,0.65)] hover:border-white/30 w-13 h-13 group active:scale-95 hidden';
      this.fab.innerHTML = `
        <div class="absolute inset-0 rounded-full bg-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <span class="relative z-10 text-zinc-300 group-hover:text-white transition-all duration-300 flex items-center justify-center w-5 h-5">${ICONS.mic}</span>
      `;
      this.fab.addEventListener('click', () => this._toggle());

      this.panel = document.createElement('div');
      this.panel.id = 'vc-panel';
      this.panel.className = 'vc-panel-base';
      this.panel.setAttribute('role', 'dialog');
      this.panel.setAttribute('aria-modal', 'true');
      this.panel.setAttribute('aria-label', _t('vc_title'));
      this.panel.setAttribute('tabindex', '-1');
      this.panel.inert = true;
      this.panel.innerHTML = this._tplLogin();

      this._bar = document.createElement('div');
      this._bar.id = 'vc-bar';
      this._bar.className = 'vc-dock opacity-0';
      this._bar.inert = true;
      this._bar.setAttribute('role', 'group');
      this._bar.setAttribute('aria-label', 'Afterglow');
      this._bar.setAttribute('aria-hidden', 'true');
      this._bar.innerHTML = `
        <button id="vc-bar-open" class="vc-dock-open" aria-label="${_t('dock_open')}">
          <span class="vc-dock-symbol">${ICONS.sound}</span>
          <span class="vc-dock-info"><strong>Afterglow <span id="vc-bar-count"></span></strong><span class="vc-dock-meta"><span id="vc-bar-title">${_t('dock_active')}</span><time id="vc-bar-timer">00:00</time></span></span>
          <span class="vc-dock-notices"><span id="vc-bar-music-icon" class="hidden" title="${_t('vc_music')}">${ICONS.music}</span><span id="vc-bar-chat-icon" class="hidden" title="${_t('vc_chat')}">${ICONS.chat}</span></span>
        </button>
        <button id="vc-bar-mute" class="vc-dock-action" aria-label="${_t('room_mic_off')}" aria-pressed="false">${ICONS.mic}</button>
        <button id="vc-bar-dnd" class="vc-dock-action vc-dock-audio" aria-label="${_t('room_deafen')}" aria-pressed="false">${ICONS.bell}</button>
        <button id="vc-bar-leave" class="vc-dock-action vc-dock-leave" aria-label="${_t('room_leave')}">${ICONS.phone}</button>`;
      this._bar.querySelector('#vc-bar-open').addEventListener('click', () => this.open());
      this._bar.querySelector('#vc-bar-mute').addEventListener('click', () => this._toggleMute());
      this._bar.querySelector('#vc-bar-dnd').addEventListener('click', () => this._toggleDND());
      this._bar.querySelector('#vc-bar-leave').addEventListener('click', () => this._leave());

      document.body.appendChild(this.fab);
      document.body.appendChild(this.panel);
      document.body.appendChild(this._bar);
      this._bar.querySelectorAll('button').forEach(button => this._bindGsapButton(button));

      this._updateBarLayout();
      window.addEventListener('resize', () => { this._updateBarLayout(); this._positionTabIndicator(); });
      window.addEventListener('orientationchange', () => this._updateBarLayout());

      // Hide connected floating bar immediately when hamburger menu / drawer is opened
      const checkMenuState = () => {
        const isMenuOpen = document.body.classList.contains('menu-is-open') ||
                           document.querySelector('#drawer-overlay.open') !== null ||
                           document.querySelector('#drawer-overlay:not(.hidden)') !== null ||
                           document.querySelector('#menu-panel.open') !== null;
        if (this._bar) {
          if (isMenuOpen) {
            this._bar.classList.add('opacity-0', 'pointer-events-none');
            this._bar.classList.remove('opacity-100', 'pointer-events-auto');
          } else if (this.connected && !this.panel.classList.contains('scale-100')) {
            this._updateBarLayout();
            this._bar.classList.remove('opacity-0', 'pointer-events-none');
            this._bar.classList.add('opacity-100', 'pointer-events-auto');
          }
        }
      };

      const barObserver = new MutationObserver(() => this._syncBarAccessibility());
      barObserver.observe(this._bar, { attributes: true, attributeFilter: ['class'] });
      const panelObserver = new MutationObserver(() => this._syncBarAccessibility());
      panelObserver.observe(this.panel, { attributes: true, attributeFilter: ['class'] });
      const bodyObserver = new MutationObserver(() => { checkMenuState(); this._syncBarAccessibility(); });
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

      this.panel.addEventListener('click', (e) => e.stopPropagation());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && !this.panel.inert) {
          const items = Array.from(this.panel.querySelectorAll('button:not(:disabled), input:not([type=hidden]), [tabindex="0"]')).filter(el => !el.closest('[hidden], [inert]'));
          const first = items[0], last = items[items.length - 1];
          if (e.shiftKey && (document.activeElement === first || !this.panel.contains(document.activeElement))) { e.preventDefault(); last?.focus(); }
          else if (!e.shiftKey && (document.activeElement === last || !this.panel.contains(document.activeElement))) { e.preventDefault(); first?.focus(); }
        }
        if (e.key === 'Escape') {
          if (this.panel.classList.contains('open') || this.panel.classList.contains('scale-100')) {
            this._toggle();
          }
        }
      });

      let _panelMousedown = false;
      this.panel.addEventListener('mousedown', () => { _panelMousedown = true; });
      document.addEventListener('mouseup', () => { requestAnimationFrame(() => { _panelMousedown = false; }); });

      // Swipe Gestures for Mobile (Bind ONLY once in init)
      let touchStartX = 0;
      let touchEndX = 0;
      let touchStartY = 0;
      let touchEndY = 0;
      let touchStartTarget = null;

      this.panel.addEventListener('touchstart', e => {
        touchStartTarget = e.target;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      this.panel.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Detect if touch started inside any scrollable container (music spotlight, queue, chat, etc.)
        const isInsideScrollable = (el) => {
          let cur = el;
          while (cur && cur !== this.panel) {
            if (cur.classList && (
              cur.classList.contains('vc-scroll') ||
              cur.classList.contains('overflow-y-auto') ||
              cur.classList.contains('overflow-y-scroll') ||
              cur.id === 'vc-spotlight-track-list' ||
              cur.id === 'vc-music-inner' ||
              cur.id === 'vc-msgs' ||
              cur.id === 'vc-music-queue' ||
              cur.id === 'vc-users-group'
            )) {
              return true;
            }
            cur = cur.parentElement;
          }
          return false;
        };

        const startedInScrollable = isInsideScrollable(touchStartTarget);
        const startedInHeader = touchStartTarget && (
          touchStartTarget.closest('.vc-panel-header') ||
          touchStartTarget.closest('#vc-panel-header') ||
          touchStartTarget.closest('#vc-drag-handle')
        );

        // Swipe down to close:
        // NEVER close if user touched or scrolled inside any scrollable content area (music spotlight, chat, queue, etc.)
        // ONLY allow closing if initiated deliberately from the top header bar
        if (!startedInScrollable) {
          // Swipe right to close drawer (since drawer is on right side) or swipe down from header
          const swipedRight = deltaX > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5;
          const swipedDownFromHeader = startedInHeader && deltaY > 60 && Math.abs(deltaY) > Math.abs(deltaX) * 2;
          if (swipedRight || swipedDownFromHeader) {
            if (this.panel.classList.contains('open') || this.panel.classList.contains('scale-100') || this._vcOpen) {
              this._toggle();
            }
            return;
          }
        }
        
        if (!this.connected) return;

        // Ignore tab swipe if user touched inputs, buttons, sliders or scrollable lists
        if (touchStartTarget && (
          touchStartTarget.closest('input') ||
          touchStartTarget.closest('button') ||
          touchStartTarget.closest('select') ||
          touchStartTarget.closest('#vc-spotlight-track-list') ||
          touchStartTarget.closest('.vc-no-swipe')
        )) {
          return;
        }

        // Ensure swipe is mostly horizontal and significant enough (> 70px)
        if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
          const order = ['room', 'chat', 'music'];
          let currentIndex = order.indexOf(this._activeTab);
          
          if (deltaX < 0) {
            // Swiped left -> next tab
            if (currentIndex < order.length - 1) this._doSwitchTab(order[currentIndex + 1]);
          } else {
            // Swiped right -> prev tab
            if (currentIndex > 0) this._doSwitchTab(order[currentIndex - 1]);
          }
        }
      }, { passive: true });

      document.addEventListener('click', (e) => {
        if (!this.panel.classList.contains('open') && !this.panel.classList.contains('scale-100')) return;
        if (this._openingLock) return;
        if (this.panel.contains(e.target) || this.fab.contains(e.target) || (this._bar && this._bar.contains(e.target))) return;
        if (e.target.closest && (e.target.closest('#auth-btn-goto-vc') || e.target.closest('#auth-menu') || e.target.closest('#vc-user-ctx-menu'))) return;
        if (_panelMousedown) return;
        if (window.getSelection && window.getSelection().toString()) return;
        this._toggle();
      });

      window.addEventListener('languagechange', () => {
        if (this.fab) this.fab.title = _t('vc_title');
        
        if (this.connected) {
           this._render(this._tplConnected());
        } else if (this._connecting) {
          this._render(this._tplLoading());
        } else if (document.getElementById('vc-reconnect')) {
          this._render(this._tplDisconnected());
        } else {
          this._render(this._tplLogin());
        }
      });

      window.addEventListener('yaireAuthChanged', () => {
        if (!this.connected) {
          if (this._connecting) {
            this._render(this._tplLoading());
          } else if (document.getElementById('vc-reconnect')) {
            this._render(this._tplDisconnected());
          } else {
            this._render(this._tplLogin());
          }
        } else {
          this._updateBarAvatars();
        }
      });

      this._bindPanelEvents();
    }

    _toggle() {
      this._dismissParticipantMenu?.();
      const willOpen = !this.panel.classList.contains('open') && !this.panel.classList.contains('scale-100');
      const panelStyle = window.gsap ? getComputedStyle(this.panel) : null;
      const panelMatrix = panelStyle ? new DOMMatrixReadOnly(panelStyle.transform) : null;
      const motionStart = panelStyle ? { x: panelMatrix.m41, y: panelMatrix.m42, opacity: Number(panelStyle.opacity) } : null;
      
      // Close hamburger menu if open
      if (willOpen && typeof toggleMenu === 'function' && document.body.classList.contains('menu-is-open')) {
        toggleMenu();
      }

      if (willOpen) {
        this._previousFocus = document.activeElement;
        this.panel.inert = false;
        document.body.classList.add('vc-open', 'vc-is-open');
        const hdr = document.querySelector('header');
        if (hdr) {
          hdr.style.setProperty('opacity', '0', 'important');
          hdr.style.setProperty('pointer-events', 'none', 'important');
          hdr.style.setProperty('visibility', 'hidden', 'important');
        }
        this._playSfx('jbl_begin', 0.5);
        
        if (!this._backdrop) {
          this._backdrop = document.createElement('div');
          this._backdrop.id = 'vc-backdrop';
          this._backdrop.addEventListener('click', () => this._toggle());
          document.body.appendChild(this._backdrop);
        }
        this._backdrop.classList.add('open');
        
        this.panel.classList.remove('scale-95', 'opacity-0', 'pointer-events-none', 'translate-y-4');
        this.panel.classList.add('open', 'scale-100', 'opacity-100', 'pointer-events-auto');
        
        if (window.__28EGamepad && typeof window.__28EGamepad.onVoiceModalOpened === 'function') {
          window.__28EGamepad.onVoiceModalOpened();
        }
        
        if (this.fab) {
          this.fab.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
        }

        if (this.connected) {
          this._bar.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
          this._bar.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        } else {
          if (this._connecting) {
            this._render(this._tplLoading());
          } else if (document.getElementById('vc-reconnect')) {
            this._render(this._tplDisconnected());
          } else {
            this._render(this._tplLogin());
          }
        }
        requestAnimationFrame(() => this.panel.querySelector('#vc-close')?.focus({ preventScroll: true }));
      } else {
        this.panel.inert = true;
        document.body.classList.remove('vc-open', 'vc-is-open');
        const hdr = document.querySelector('header');
        if (hdr && !document.body.classList.contains('menu-is-open')) {
          hdr.style.removeProperty('opacity');
          hdr.style.removeProperty('pointer-events');
          hdr.style.removeProperty('visibility');
        }
        if (this._loginPollInt) { clearInterval(this._loginPollInt); this._loginPollInt = null; }
      if (this._loginMembersStop) { this._loginMembersStop(); this._loginMembersStop = null; }
        
        if (this._backdrop) {
          this._backdrop.classList.remove('open');
        }
        
        this.panel.classList.remove('open', 'scale-100', 'opacity-100', 'pointer-events-auto');
        this.panel.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
        
        if (window.__28EGamepad && typeof window.__28EGamepad.onVoiceModalClosed === 'function') {
          window.__28EGamepad.onVoiceModalClosed();
        }
        
        if (this.fab) {
          this.fab.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
        }

        if (this.connected) {
          const isMenuOpen = document.body.classList.contains('menu-is-open') || 
                             document.querySelector('#drawer-overlay.open') !== null ||
                             document.querySelector('#drawer-overlay:not(.hidden)') !== null ||
                             document.querySelector('#menu-panel.open') !== null;
          if (!isMenuOpen) {
            this._updateBarLayout();
            this._updateBarAvatars();
            this._bar.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
            this._bar.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
          }
        }
        requestAnimationFrame(() => {
          const previous = this._previousFocus;
          const visible = previous?.isConnected && previous.getClientRects().length && getComputedStyle(previous).visibility !== 'hidden';
          const target = visible ? previous : document.getElementById('auth-toggle') || (this.connected ? this._bar?.querySelector('#vc-bar-open') : null);
          target?.focus?.({ preventScroll: true });
        });
        this._playSfx('flyout', 0.4, false, 'fly');
      }
      this._animatePanel(willOpen, motionStart);
      if (willOpen) this._animateView(this.panel);
      else if (this.connected) this._animateIn(this._bar, { distance: 8 });
    }

    _syncBarAccessibility() {
      if (!this._bar) return;
      const visible = this.connected && !this.panel.classList.contains('open') && !this.panel.classList.contains('scale-100') && !document.body.classList.contains('menu-is-open') && this._bar.classList.contains('opacity-100') && !this._bar.classList.contains('opacity-0');
      const appearing = visible && this._bar.inert;
      this._bar.inert = !visible;
      this._bar.setAttribute('aria-hidden', String(!visible));
      this._bar.removeAttribute('tabindex');
      if (appearing) this._animateIn(this._bar, { distance: 8 });
    }

    open() {
      if (this.panel && !this.panel.classList.contains('open') && !this.panel.classList.contains('scale-100')) {
        this._openingLock = true;
        this._toggle();
        setTimeout(() => { this._openingLock = false; }, 250);
      }
    }

    close() {
      if (this.panel && (this.panel.classList.contains('open') || this.panel.classList.contains('scale-100'))) {
        this._toggle();
      }
    }

    _clearMotion(root) {
      if (!root || !window.gsap) return;
      const nodes = [root, ...root.querySelectorAll('[data-vc-motion]')];
      window.gsap.killTweensOf(nodes);
      window.gsap.set(nodes, { clearProps: 'transform,opacity' });
    }

    _animateIn(targets, { distance = 6, stagger = 0 } = {}) {
      const nodes = Array.from(targets?.nodeType ? [targets] : targets || []).filter(node => node?.isConnected && !node.closest('[hidden], [inert]'));
      if (!nodes.length || !window.gsap || this._motionKeyboard) return;
      const reduce = this._reducedMotion.matches;
      nodes.forEach(node => { node.dataset.vcMotion = ''; });
      window.gsap.killTweensOf(nodes);
      window.gsap.fromTo(nodes, { opacity: reduce ? .7 : 0, y: reduce ? 0 : distance }, {
        opacity: 1, y: 0, duration: reduce ? .12 : .2, stagger: reduce ? 0 : stagger,
        ease: 'power3.out', overwrite: true, clearProps: 'transform,opacity'
      });
    }

    _animateView(root = this.panel) {
      if (!root || !this.panel.classList.contains('open')) return;
      const active = root.querySelector('.vc-tab-content:not([hidden])');
      const nodes = active ? [active, root.querySelector('.vc-call-controls')].filter(Boolean)
        : Array.from(root.querySelector('.vc-screen')?.children || []).filter(node => !node.classList.contains('vc-panel-close'));
      this._animateIn(nodes.slice(0, 4), { distance: 8, stagger: .03 });
    }

    _animatePanel(open, start) {
      const g = window.gsap;
      if (!g || !start) return;
      g.killTweensOf(this.panel);
      this.panel.classList.add('vc-motion-panel');
      if (this._motionKeyboard) { g.set(this.panel, { clearProps: 'transform,opacity' }); return; }
      const reduce = this._reducedMotion.matches;
      g.fromTo(this.panel, { x: reduce ? 0 : start.x, y: reduce ? 0 : start.y, opacity: start.opacity }, {
        x: reduce || open ? 0 : this.panel.offsetWidth + 24, y: 0, opacity: open ? 1 : 0,
        duration: reduce ? .12 : open ? .26 : .2, ease: 'power3.out', overwrite: true,
        onComplete: () => { g.set(this.panel, { clearProps: 'transform,opacity' }); }
      });
    }

    _positionTabIndicator(previous) {
      const tabs = this.panel.querySelector('.vc-tabs');
      const active = tabs?.querySelector('[aria-selected="true"]');
      if (!active || !window.gsap) return;
      let indicator = tabs.querySelector('.vc-tab-indicator');
      if (!indicator) { indicator = document.createElement('span'); indicator.className = 'vc-tab-indicator'; indicator.dataset.vcMotion = ''; indicator.setAttribute('aria-hidden', 'true'); tabs.appendChild(indicator); }
      tabs.classList.add('vc-motion-tabs');
      const rect = active.getBoundingClientRect(), parent = tabs.getBoundingClientRect();
      const end = { x: rect.left - parent.left, scaleX: rect.width };
      window.gsap.killTweensOf(indicator);
      if (previous && !this._motionKeyboard && !this._reducedMotion.matches) {
        window.gsap.fromTo(indicator, { x: previous.left - parent.left, scaleX: previous.width }, { ...end, duration: .2, ease: 'power3.out', overwrite: true });
      } else window.gsap.set(indicator, end);
    }

    // ── TEMPLATES ──────────────────────────────────────────────────────────
    _tplCloseButton() {
      return `<button class="vc-icon-button" id="vc-close" aria-label="${_t('room_close')}" title="${_t('room_close')}">${ICONS.close}</button>`;
    }

    _tplHeader() {
      return `<div class="vc-panel-close">${this._tplCloseButton()}</div>`;
    }

    _avatarMarkup(user, className = '') {
      const name = String(user?.displayName || this.myName || '?');
      const initials = name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0] || '').join('').toUpperCase();
      let photo = '';
      try {
        const url = new URL(user?.photoURL || '', document.baseURI);
        if (user?.photoURL && ['https:', 'http:'].includes(url.protocol)) photo = url.href;
      } catch {}
      return `<span class="vc-avatar ${className}"><span>${this._escHtml(initials)}</span>${photo ? `<img src="${this._escHtml(photo)}" alt="" referrerpolicy="no-referrer" draggable="false" />` : ''}</span>`;
    }

    _tplLogin(err = '') {
      const user = window.yaireCurrentUser;
      return `<div class="vc-screen vc-lobby-screen">
        ${this._tplHeader()}
        <div class="vc-lobby">
          <div class="vc-lobby-intro"><h1 id="vc-room-title">${_t(user ? 'room_hero' : 'room_auth_title')}</h1><p>${_t(user ? 'room_intro' : 'room_auth_desc')}</p></div>
          <div class="vc-lobby-presence" aria-hidden="true">
            ${user ? this._avatarMarkup(user, 'vc-avatar-lobby') : `<span class="vc-avatar vc-avatar-lobby">${ICONS.mic}</span>`}
            <span class="vc-presence-connector"></span>
            <span class="vc-avatar vc-avatar-vacant">${ICONS.person}</span>
          </div>
          <div class="vc-lobby-room"><h2>${_t('room_name')}</h2><p>${_t('room_capacity')}</p>
            ${user ? `<div id="vc-conn-count" class="vc-presence-status" role="status">${_t('room_checking')}</div>` : ''}
          </div>
        </div>
        <div class="vc-lobby-footer">
          ${user ? `<div class="vc-identity">${this._avatarMarkup(user)}<div class="vc-identity-info"><strong>${this._escHtml(user.displayName || '28E')}</strong><span>${this._escHtml(user.email || _t('room_account'))}</span></div><button id="vc-logout-btn" class="vc-icon-button" title="${_t('room_logout')}" aria-label="${_t('room_logout')}">${ICONS.logout}</button></div>
            <input id="vc-name" type="hidden" value="${this._escHtml(user.displayName || '28E')}" />
            <button id="vc-join" class="vc-primary">${ICONS.mic}<span>${_t('room_join')}</span>${ICONS.arrow}</button>
            <p class="vc-footnote">${_t('room_mic_hint')}</p>` : `<button id="vc-google-login-btn" class="vc-primary vc-google-button">${ICONS.google}<span>${_t('room_google')}</span>${ICONS.arrow}</button>`}
          <p class="vc-error" id="vc-err" role="alert">${this._escHtml(err)}</p>
        </div>
      </div>`;
    }

    _tplLoading() {
      return `<div class="vc-screen">${this._tplHeader()}<div class="vc-state-screen" role="status" aria-live="polite">
        <div class="vc-connecting-avatar">${this._avatarMarkup(window.yaireCurrentUser, 'vc-avatar-lobby')}<span class="vc-connecting-orbit"></span></div>
        <h1 id="vc-room-title">${_t('room_loading')}</h1><p>${_t('room_loading_desc')}</p>
        <button id="vc-cancel-conn" class="vc-secondary">${_t('room_cancel')}</button>
      </div></div>`;
    }

    _tplDisconnected() {
      return `<div class="vc-screen">${this._tplHeader()}<div class="vc-state-screen">
        <span class="vc-state-symbol vc-state-error">${ICONS.phone}</span><h1 id="vc-room-title">${_t('room_retry_title')}</h1>
        <p role="status">${_t('room_retry_desc')}</p><button id="vc-reconnect" class="vc-primary">${ICONS.mic}<span>${_t('btn_reconn')}</span>${ICONS.arrow}</button>
      </div></div>`;
    }

    _tplParticipant(u) {
      const isMe = u.id === this.myId;
      const muted = isMe ? this.muted : u.muted;
      const dnd = isMe ? this.dnd : u.dnd;
      const user = { displayName: u.displayName, photoURL: u.photoURL || (isMe ? window.yaireCurrentUser?.photoURL : '') };
      return `<div class="vc-user" id="vc-u-${this._escHtml(u.id)}">
        <div class="vc-participant-avatar-wrap"><div class="vc-av" id="vc-av-${this._escHtml(u.id)}">${this._avatarMarkup(user)}</div><span class="vc-icons-container">${this._participantIcons(muted || u.localMuted, dnd)}</span></div>
        <div class="vc-participant-name"><strong>${this._escHtml(u.displayName)}</strong>${isMe ? `<span>${_t('tag_you')}</span>` : ''}</div>
        <span class="vc-participant-state">${_t(muted || u.localMuted ? 'room_mic_off' : dnd ? 'room_deafened' : 'room_mic_on')}</span>
        ${!isMe ? `<button class="vc-participant-options vc-icon-button" data-user-options="${this._escHtml(u.id)}" aria-label="${_t('room_options')}: ${this._escHtml(u.displayName)}" title="${_t('room_options')}">···</button>` : ''}
      </div>`;
    }

    _participantIcons(muted, dnd) {
      return `${muted ? `<span class="vc-mico" title="${_t('room_mic_off')}">${ICONS.micOff}</span>` : ''}${dnd ? `<span class="vc-dico" title="${_t('room_deafened')}">${ICONS.dnd}</span>` : ''}`;
    }

    _tplConnected() {
      const tab = this._activeTab;
      const tabs = [['room', 'vc_tab_room', 'people'], ['chat', 'vc_chat', 'chat'], ['music', 'vc_music', 'music']];
      const count = this.users.length;
      const elapsed = this._callStart ? Math.max(0, Math.floor((Date.now() - this._callStart) / 1000)) : 0;
      const timer = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
      return `<div class="vc-screen vc-connected-screen">
        <div class="vc-room-heading vc-panel-header" id="vc-panel-header"><div class="vc-room-heading-copy"><h1 id="vc-room-title">${_t('room_name')}</h1><p class="vc-room-status"><span class="vc-status-dot"></span>${_t('room_you_in')}<span class="vc-heading-count" id="vc-member-count">${count}/4</span></p></div><span id="vc-timer" class="vc-timer">${timer}</span>${this._tplCloseButton()}</div>
        <div class="vc-tabs" role="tablist" aria-label="${_t('vc_title')}">${tabs.map(([id, key, icon]) => `<button class="vc-tab" id="vc-tab-${id}" role="tab" aria-selected="${tab === id}" aria-controls="vc-content-${id}" tabindex="${tab === id ? '0' : '-1'}">${ICONS[icon]}<span>${_t(key)}</span>${id === 'chat' && this._chatUnread ? `<span class="vc-unread">${this._chatUnread > 9 ? '9+' : this._chatUnread}</span>` : ''}${id === 'music' && this._musicPlaying ? '<span class="vc-music-ind vc-status-dot"></span>' : ''}</button>`).join('')}</div>
        <div class="vc-main-content">
          <section id="vc-content-room" class="vc-tab-content" role="tabpanel" aria-labelledby="vc-tab-room" ${tab !== 'room' ? 'hidden inert' : ''}>
            <div class="vc-sect vc-scroll"><div id="vc-users-group" class="vc-users-group" aria-label="${_t('room_people')}">${this.users.map(u => this._tplParticipant(u)).join('')}</div>
              <p class="vc-room-hint">${_t(count < 2 ? 'room_waiting' : 'room_ready')}</p>
            </div>
          </section>
          <section id="vc-content-chat" class="vc-tab-content" role="tabpanel" aria-labelledby="vc-tab-chat" ${tab !== 'chat' ? 'hidden inert' : ''}>
            <div id="vc-msgs" class="vc-scroll" role="log" aria-live="polite" aria-label="${_t('vc_chat')}">${this._renderChatMsgs()}</div>
            <div id="vc-chat-typing" class="vc-typing hidden" role="status"></div>
            <div class="vc-chat-composer"><input id="vc-chat-in" aria-label="${_t('vc_chat_ph')}" type="text" placeholder="${_t('vc_chat_ph')}" autocomplete="off" maxlength="2000" enterkeyhint="send" /><button id="vc-chat-send" class="vc-icon-button vc-send-button" aria-label="${_t('room_send')}">${ICONS.arrow}</button></div>
          </section>
          <section id="vc-content-music" class="vc-tab-content" role="tabpanel" aria-labelledby="vc-tab-music" ${tab !== 'music' ? 'hidden inert' : ''}><div class="vc-scroll" id="vc-music-inner">${this._renderMusicPanel()}</div></section>
        </div>
        <div class="vc-call-controls" role="group" aria-label="${_t('vc_title')}">
          <button id="vc-mute" class="vc-call-button" aria-pressed="${this.muted}" aria-label="${_t(this.muted ? 'room_mic_on' : 'room_mic_off')}"><span class="vc-control-icon" aria-hidden="true">${this.muted ? ICONS.micOff : ICONS.mic}</span><span>${_t(this.muted ? 'btn_muted' : 'btn_mic')}</span></button>
          <button id="vc-dnd" class="vc-call-button" aria-pressed="${this.dnd}" aria-label="${_t(this.dnd ? 'room_undeafen' : 'room_deafen')}"><span class="vc-control-icon" aria-hidden="true">${this.dnd ? ICONS.dnd : ICONS.bell}</span><span>${_t(this.dnd ? 'btn_audio_off' : 'btn_audio')}</span></button>
          <button id="vc-leave" class="vc-call-button vc-leave-button" title="${_t('room_leave')}" aria-label="${_t('room_leave')}"><span class="vc-control-icon" aria-hidden="true">${ICONS.phone}</span><span>${_t('btn_leave')}</span></button>
        </div>
      </div>`;
    }

    _updateUsersDOM() {
      if (!this.connected) return;
      const group = this.panel.querySelector('#vc-users-group');
      if (!group) return;
      const ids = new Set(this.users.map(u => String(u.id)));
      for (const id of this._speakers) if (!ids.has(String(id))) this._speakers.delete(id);
      group.querySelectorAll('.vc-user').forEach(node => { if (!ids.has(node.id.slice(5))) node.remove(); });
      this.users.forEach(u => {
        let node = document.getElementById(`vc-u-${u.id}`);
        if (!node) {
          group.insertAdjacentHTML('beforeend', this._tplParticipant(u));
          node = group.lastElementChild;
          if (this._activeTab === 'room') this._animateIn(node);
          if (u.id !== this.myId) this._bindUserContextMenu(node, u);
        }
        const muted = (u.id === this.myId ? this.muted : u.muted) || u.localMuted;
        const dnd = u.id === this.myId ? this.dnd : u.dnd;
        node.querySelector('.vc-icons-container').innerHTML = this._participantIcons(muted, dnd);
        node.querySelector('.vc-participant-state').textContent = _t(muted ? 'room_mic_off' : dnd ? 'room_deafened' : 'room_mic_on');
        node.querySelector('.vc-participant-name strong').textContent = u.displayName;
      });
      const count = document.getElementById('vc-member-count');
      if (count) count.textContent = `${this.users.length}/4`;
      const hint = this.panel.querySelector('.vc-room-hint');
      if (hint) hint.textContent = _t(this.users.length < 2 ? 'room_waiting' : 'room_ready');
      this._updateBarAvatars();
    }

    _bindUserContextMenu(node, u) {
      if (!node || node._ctxBound) return;
      node._ctxBound = true;
      const openMenu = event => {
        event.preventDefault();
        this._dismissParticipantMenu?.();
        const member = this.users.find(value => value.id === u.id) || u;
        const trigger = node.querySelector('[data-user-options]');
        const menu = document.createElement('div');
        menu.id = 'vc-user-ctx-menu';
        menu.className = 'vc-participant-menu';
        menu.setAttribute('role', 'dialog');
        menu.setAttribute('aria-label', _t('room_options'));
        menu.innerHTML = `<button>${member.localMuted ? ICONS.sound : ICONS.micOff}<span>${_t(member.localMuted ? 'room_local_unmute' : 'room_local_mute')}</span></button>`;
        document.body.appendChild(menu);
        const anchor = trigger?.getBoundingClientRect();
        menu.style.left = Math.max(8, Math.min(event.clientX || anchor?.left || 8, innerWidth - menu.offsetWidth - 8)) + 'px';
        menu.style.top = Math.max(8, Math.min(event.clientY || anchor?.bottom || 8, innerHeight - menu.offsetHeight - 8)) + 'px';
        const dismissOutside = e => { if (!menu.contains(e.target) && !trigger?.contains(e.target)) this._dismissParticipantMenu?.(); };
        const dismiss = (restoreFocus = false) => {
          document.removeEventListener('pointerdown', dismissOutside, true);
          menu.remove();
          if (this._dismissParticipantMenu === dismiss) this._dismissParticipantMenu = null;
          if (restoreFocus && trigger?.isConnected && !this.panel.inert) trigger.focus();
        };
        this._dismissParticipantMenu = dismiss;
        document.addEventListener('pointerdown', dismissOutside, true);
        menu.addEventListener('keydown', e => {
          if (e.key === 'Escape') { e.stopPropagation(); dismiss(true); }
          if (e.key === 'Tab') { e.preventDefault(); dismiss(true); }
        });
        menu.querySelector('button').addEventListener('click', () => {
          const current = this.users.find(value => value.id === u.id);
          if (current) {
            current.localMuted = !current.localMuted;
            const audio = this.audios.get(current.id);
            if (audio) audio.muted = current.localMuted;
            this._updateUsersDOM();
          }
          dismiss(true);
        });
        menu.querySelector('button').focus();
      };
      node.addEventListener('contextmenu', openMenu);
      node.querySelector('[data-user-options]')?.addEventListener('click', openMenu);
    }

    _updatePingIndicator(userId, quality) {
      const pingDot = document.getElementById(`vc-ping-${userId}`);
      if (!pingDot) return;
      if (quality === 'excellent' || quality === window.LivekitClient?.ConnectionQuality?.Excellent) {
        pingDot.className = 'w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)] transition-colors duration-300';
        pingDot.title = 'Conexión excelente';
      } else if (quality === 'good' || quality === window.LivekitClient?.ConnectionQuality?.Good) {
        pingDot.className = 'w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)] transition-colors duration-300';
        pingDot.title = 'Conexión inestable';
      } else {
        pingDot.className = 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] transition-colors duration-300';
        pingDot.title = 'Conexión mala';
      }
    }

    _updateBarAvatars() {
      this._updateDockState();
    }

    _updateDockState() {
      if (!this._bar) return;
      const count = this._bar.querySelector('#vc-bar-count');
      if (count) count.textContent = `${Math.max(this.connected ? 1 : 0, this.users.length)}/4`;
      for (const [id, pressed, icon, label] of [
        ['vc-bar-mute', this.muted, this.muted ? ICONS.micOff : ICONS.mic, _t(this.muted ? 'room_mic_on' : 'room_mic_off')],
        ['vc-bar-dnd', this.dnd, this.dnd ? ICONS.dnd : ICONS.bell, _t(this.dnd ? 'room_undeafen' : 'room_deafen')]
      ]) {
        const button = this._bar.querySelector('#' + id);
        if (button) { button.setAttribute('aria-pressed', String(pressed)); button.setAttribute('aria-label', label); button.innerHTML = icon; }
      }
      const title = this._bar.querySelector('#vc-bar-title');
      if (title) title.textContent = _t(this.muted ? 'room_mic_off' : this.dnd ? 'room_deafened' : 'dock_active');
      this._bar.classList.toggle('is-speaking', this._speakers.size > 0);
      this._updateBarMusicState();
      this._updateBarChatState();
    }

    _render(tpl, { animate = true } = {}) {
      this._clearMotion(this.panel);
      this._saveDrafts();
      this._listObserver?.disconnect();
      cancelAnimationFrame(this._listFitRaf);
      this._dismissParticipantMenu?.();
      if (this._loginPollInt) { clearInterval(this._loginPollInt); this._loginPollInt = null; }
      if (this._loginMembersStop) { this._loginMembersStop(); this._loginMembersStop = null; }
      this.panel.innerHTML = tpl;
      this._restoreDrafts();
      this._bindPanelEvents();
      
      if (document.getElementById('vc-join')) {
        const updateConnCount = data => {
            const cnt = document.getElementById('vc-conn-count');
            if (cnt) {
              cnt.classList.toggle('vc-has-company', data.users > 0);
              cnt.innerHTML = `<span class="vc-status-dot"></span>${data.users ? `${data.users} ${_t(data.users === 1 ? 'room_person' : 'room_persons')}` : _t('vc_nobody')}`;
              cnt.classList.remove('opacity-0');
            }
        };
        const firebase = window.yaireVoiceFirebase;
        if (firebase?.user) {
          this._loginMembersStop = firebase.sdk.onValue(firebase.sdk.ref(firebase.db, 'voiceRooms/principal/members'), snapshot => {
            updateConnCount({ users: window.YaireFirebaseVoice.listMembers(snapshot.val()).length });
          }, () => { const count = document.getElementById('vc-conn-count'); if (count) count.textContent = _t('msg_disc'); });
        }
      }
      this._bindAvatarFallbacks();
      this._positionTabIndicator();
      if (animate) this._animateView();
    }

    _bindAvatarFallbacks() {
      this.panel.querySelectorAll('.vc-avatar img').forEach(img => { img.addEventListener('error', () => img.remove(), { once: true }); });
    }

    _bindGsapButton(el) {
      if (!el || el._vcPressBound || !window.gsap) return;
      el._vcPressBound = true;
      const press = down => {
        if (el.disabled || this._motionKeyboard || this._reducedMotion.matches) return;
        el.dataset.vcMotion = '';
        window.gsap.to(el, { scale: down ? .97 : 1, duration: down ? .1 : .16, ease: 'power3.out', overwrite: true, ...(down ? {} : { clearProps: 'transform' }) });
      };
      el.addEventListener('pointerdown', () => press(true));
      for (const event of ['pointerup', 'pointercancel', 'pointerleave', 'blur']) el.addEventListener(event, () => press(false));
    }

    _bindPanelEvents() {
      const cancelBtn = document.getElementById('vc-cancel-conn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          this._connecting = false;
          if (this.progNode) { this._stopSfx(this.progNode); this.progNode = null; }
          if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
          }
          this._cleanup();
          this._render(this._tplLogin());
        });
      }

      const xBtn = document.getElementById('vc-close');
      if (xBtn) {
        xBtn.addEventListener('click', () => this._toggle());
        this._bindGsapButton(xBtn);
      }

      const vcGoogleBtn = document.getElementById('vc-google-login-btn');
      if (vcGoogleBtn) {
        vcGoogleBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._playSfx('tap', 0.4);

          if (typeof window.yaireLoginWithGoogle === 'function') {
            try {
              const originalLabel = vcGoogleBtn.innerHTML;
              vcGoogleBtn.dataset.originalLabel = originalLabel;
              vcGoogleBtn.disabled = true;
              vcGoogleBtn.innerHTML = `
                <div class="vc-spin"></div>
                <span>${_t('room_google_loading')}</span>
              `;
              await window.yaireLoginWithGoogle();
            } catch (err) {
              this._setErr(_t('room_google_error'));
            } finally {
              if (vcGoogleBtn) {
                vcGoogleBtn.disabled = false;
                vcGoogleBtn.innerHTML = vcGoogleBtn.dataset.originalLabel || `${ICONS.google}<span>${_t('room_google')}</span>`;
              }
            }
            return;
          }

          // Fallback to guestbook login button if available
          const gbLogin = document.getElementById('gb-login-btn');
          if (gbLogin) {
            gbLogin.click();
            return;
          }

          alert("El servicio de Google se está conectando, por favor intenta de nuevo en un segundo.");
        });
        this._bindGsapButton(vcGoogleBtn);
      }

      const vcLogoutBtn = document.getElementById('vc-logout-btn');
      if (vcLogoutBtn) {
        vcLogoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._playSfx('tap', 0.3);
          if (typeof window.yaireLogout === 'function') {
            window.yaireLogout();
          }
        });
      }

      const joinBtn = document.getElementById('vc-join');
      const nameInput = document.getElementById('vc-name');

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
        this._bindGsapButton(joinBtn);
      }

      const reconnectBtn = document.getElementById('vc-reconnect');
      if (reconnectBtn) {
        reconnectBtn.addEventListener('click', () => {
          this._doJoin(this._savedName || window.yaireCurrentUser?.displayName || '28E');
        });
        this._bindGsapButton(reconnectBtn);
      }

      const muteBtn  = document.getElementById('vc-mute');
      const dndBtn   = document.getElementById('vc-dnd');
      const leaveBtn = document.getElementById('vc-leave');
      if (muteBtn) { muteBtn.addEventListener('click',  () => this._toggleMute()); this._bindGsapButton(muteBtn); }
      if (dndBtn)  { dndBtn.addEventListener('click',   () => this._toggleDND()); this._bindGsapButton(dndBtn); }
      if (leaveBtn) { leaveBtn.addEventListener('click', () => this._leave()); this._bindGsapButton(leaveBtn); }

      // Tabs logic
      const tabRoom = document.getElementById('vc-tab-room');
      const tabChat = document.getElementById('vc-tab-chat');
      const tabMusic = document.getElementById('vc-tab-music');

      if (tabRoom) { tabRoom.addEventListener('click', () => this._doSwitchTab('room')); this._bindGsapButton(tabRoom); }
      if (tabChat) { tabChat.addEventListener('click', () => this._doSwitchTab('chat')); this._bindGsapButton(tabChat); }
      if (tabMusic) { tabMusic.addEventListener('click', () => this._doSwitchTab('music')); this._bindGsapButton(tabMusic); }

      this.panel.querySelector('.vc-tabs')?.addEventListener('keydown', e => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const tabs = ['room', 'chat', 'music'];
        let index = tabs.indexOf(this._activeTab);
        index = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (index + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
        this._doSwitchTab(tabs[index]);
        document.getElementById(`vc-tab-${tabs[index]}`)?.focus();
      });

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
        
        // Auto focus if chat tab was just opened (ONLY on desktop)
        if (this._activeTab === 'chat' && document.activeElement !== chatIn) {
          const isMobile = this._checkMobile() || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches);
          if (!isMobile) {
            setTimeout(() => { if (this._activeTab === 'chat' && document.activeElement?.getAttribute('role') !== 'tab') chatIn.focus(); }, 50);
          } else {
            chatIn.blur();
          }
        }
      }

      // Context menu for pre-rendered participant nodes
      if (this.panel) {
        this.panel.querySelectorAll('.vc-user').forEach(node => {
          const id = node.id.replace('vc-u-', '');
          const u = this.users.find(x => String(x.id) === String(id));
          if (u && u.id !== this.myId) {
            this._bindUserContextMenu(node, u);
          }
        });
      }

      this._bindMusicEvents();
    }

    _doSwitchTab(tab) {
      if (this._activeTab === tab || !['room', 'chat', 'music'].includes(tab)) return;
      const previous = this.panel.querySelector('.vc-tab[aria-selected="true"]')?.getBoundingClientRect();
      this._activeTab = tab;
      if (tab === 'chat') { this._chatUnread = 0; document.title = '28E'; }
      this._updateTabs();
      this._positionTabIndicator(previous);
      this._animateIn(this.panel.querySelector('.vc-tab-content:not([hidden])'), { distance: 6 });
      this._playSfx('toggleOn', 0.2);
    }

    updateTranslations() {
      if (this.fab) this.fab.title = _t('vc_title');
      
      if (this.connected) {
         this._updateTabs();
      } else if (this.panel && this.panel.classList.contains('scale-100')) {
         this._render(this._tplLogin());
      }
      
      this._updateDockState();
    }

    _updateTabs(direction = 1) {
      if (this.connected) {
         this._render(this._tplConnected(), { animate: false });
         this._updateBarChatState();
         
         this._updateDockState();
         this._bindAvatarFallbacks();
         const messages = document.getElementById('vc-msgs');
         if (messages) messages.scrollTop = messages.scrollHeight;
      }
    }

    async _doJoin(name) {
      if (!name) return this._setErr(_t('err_name'));
      if (!window.yaireCurrentUser?.getIdToken) {
        this._render(this._tplLogin('Inicia sesión con Google para entrar.'));
        return;
      }

      if (this.actx && (this.actx.state === 'suspended' || this.actx.state === 'interrupted')) {
        this.actx.resume().catch(() => {});
      }

      // Detener música de Spotlight si estaba sonando antes de entrar al canal
      if (typeof window.stopSpotlightLocalPlayback === 'function') {
        window.stopSpotlightLocalPlayback();
      }

      const attempt = ++this._joinAttempt;
      this._connecting = true;
      this.myName = name;
      localStorage.setItem('28e_vc_name', name);
      this._savedName = name;
      
      this._render(this._tplLoading());
      if (this.progNode) { this._stopSfx(this.progNode); this.progNode = null; }
      this.progNode = this._playSfx('jbl_latency', 0.4, true);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: this._audioConstraints, video: false });
        if (attempt !== this._joinAttempt || !this._connecting) { stream.getTracks().forEach(track => track.stop()); return; }
        this.stream = stream;
      } catch {
        if (attempt !== this._joinAttempt || !this._connecting) return;
        this._connecting = false;
        if (this.progNode) { this._stopSfx(this.progNode); this.progNode = null; }
        this._render(this._tplLogin(_t('err_mic')));
        return;
      }

      try {
        const token = await window.yaireCurrentUser.getIdToken();
        if (attempt !== this._joinAttempt || !this._connecting) return;
        const response = await fetch('/api/voice-ice', { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store', signal: AbortSignal.timeout(5000) });
        if (attempt !== this._joinAttempt || !this._connecting) return;
        if (response.ok) {
          const relay = await response.json();
          if (attempt !== this._joinAttempt || !this._connecting) return;
          this.ice = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, ...relay.iceServers] };
        }
      } catch { /* Direct WebRTC is still available when no relay has been configured. */ }

      if (attempt !== this._joinAttempt || !this._connecting) return;
      // Create noise-cancelled processed stream
      this._processedStream = this._createProcessedStream();
      console.log('[VC] 🔇 Noise cancellation pipeline active');

      this._connectSocket(name);
    }

    _setErr(msg) {
      const el = document.getElementById('vc-err');
      if (el) el.textContent = msg;
    }

    // ── SOCKET ─────────────────────────────────────────────────────────────
    _connectSocket(name) {
      // Destroy previous socket cleanly before creating a new one
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      const doConnect = () => {
        this.socket = window.YaireFirebaseVoice.create(window.yaireVoiceFirebase);

        this.socket.on('connect', () => {
          this.socket.emit('join_channel', { displayName: name, photoURL: window.yaireCurrentUser?.photoURL || null });
        });

        this.socket.on('join_error', ({ message }) => {
          this._connecting = false;
          if (this._connTimeout) { clearTimeout(this._connTimeout); this._connTimeout = null; }
          this._stopSfx(this.progNode); this.progNode = null;
          this._cleanup();
          this._render(this._tplLogin(message));
        });

        this.socket.on('connect_error', (err) => {
          console.warn('[VC] connect_error:', err);
          this._connecting = false;
          if (this._connTimeout) { clearTimeout(this._connTimeout); this._connTimeout = null; }
          this._stopSfx(this.progNode); this.progNode = null;
          this._cleanup();
          this._render(this._tplLogin("No se pudo conectar a Afterglow (" + (err.message || 'error de red') + ")."));
        });

        if (this._connTimeout) { clearTimeout(this._connTimeout); }
        this._connTimeout = setTimeout(() => {
          if (this._connecting && !this.connected) {
            this._connecting = false;
            if (this.progNode) { this._stopSfx(this.progNode); this.progNode = null; }
            if (this.socket) { this.socket.disconnect(); this.socket = null; }
            this._cleanup();
            this._render(this._tplLogin("Afterglow tardó demasiado en responder. Vuelve a intentarlo."));
          }
        }, 12000);

        const sessionSocket = this.socket;
        const sessionAttempt = this._joinAttempt;
        const sessionValid = () => this.socket === sessionSocket && this._joinAttempt === sessionAttempt;
        this.socket.on('joined', async ({ userId, existingUsers }) => {
          if (!sessionValid()) return;
          if (this._connTimeout) { clearTimeout(this._connTimeout); this._connTimeout = null; }
          this._connecting = false;
          if (typeof window.stopSpotlightLocalPlayback === 'function') {
            window.stopSpotlightLocalPlayback();
          }

          // 1. Detener el sonido de latencia/espera
          if (this.progNode) {
            this._stopSfx(this.progNode);
            this.progNode = null;
          }

          // 2. Reproducir inmediatamente el sonido de éxito a buen volumen
          this._playSfx('jbl_success', 0.6);

          // 3. Limpiar peers antiguos de la sesión previa
          this.peers.forEach((_, id) => this._closePeer(id));
          this.peers.clear();
          this.pendingIce.clear();

          this.myId = userId;
          this.connected = true;
          this._reconnects = 0;
          this.fab.classList.add('connected');
          this._updateBarAvatars();

          if (!this._timerInt) this._startTimer();

          // 4. Inicializar micrófono y WebRTC
          const initMicAndWebRTC = async () => {
            if (!sessionValid() || !this.connected) return;
            if (!this.stream || this.stream.getAudioTracks().every(t => t.readyState === 'ended')) {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: this._audioConstraints, video: false });
                if (!sessionValid() || !this.connected) { stream.getTracks().forEach(track => track.stop()); return; }
                this.stream = stream;
                this._processedStream = this._createProcessedStream();
                console.log('[VC] ✅ Microphone re-acquired with noise cancellation');
              } catch(e) {
                if (!sessionValid() || !this.connected) return;
                this._leave();
                this._setErr(_t('err_mic'));
                return;
              }
            }

            if (!this._analyser) this._setupSpeaking();
            if (!this._wakeLock && !this._silentAudio) this._startKeepAlive();

            for (const u of existingUsers) {
              if (!sessionValid() || !this.connected) return;
              await this._createOffer(u.id);
            }
            if (!sessionValid() || !this.connected) return;
            sessionSocket.emit('ring_channel');
            this._inviterName = null;
            this._chatMsgs = [];
            this._chatUnread = 0;
            sessionSocket.emit('music_sync_request');
          };

          if (this._checkMobile()) {
            // En celular, diferir la activación del micrófono 350ms para que el hardware de audio
            // no corte el sonido de éxito ni lo enmudezca al cambiar de modo
            clearTimeout(this._micInitTimeout);
            this._micInitTimeout = setTimeout(initMicAndWebRTC, 350);
          } else {
            await initMicAndWebRTC();
          }
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
            this._updateBarAvatars();
          }
        });

        this.socket.on('user_joined', ({ userId, displayName }) => {
          this._playSfx('act_join', 0.5);
          if (typeof window.showToast === 'function') {
            window.showToast(`${displayName} ${_t('toast_join')}`, "var(--accent-green)", ICONS.sound);
          }
          this._updateBarAvatars();
        });

        this.socket.on('user_left', ({ userId }) => {
          this._speakers.delete(userId);
          this._playSfx('act_left', 0.5);
          const u = this.users.find(x => x.id === userId);
          if (u && typeof window.showToast === 'function') {
            window.showToast(`${u.displayName} ${_t('toast_left')}`, "var(--accent-red)", ICONS.phone);
          }
          this._closePeer(userId);
          this._updateBarAvatars();
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
          clearInterval(this._authRefreshTimer);
          if (reason === 'io client disconnect' || reason === 'io server disconnect') {
            this.connected = false;
      this._connecting = false;
            this._cleanup();
            if (this._bar) this._bar.classList.remove('show');
            this._render(this._tplLogin());
          }
          // For transport drops, socket.io reconnects silently in background
        });

        this.socket.on('kicked', (details = {}) => {
          this.connected = false;
          if (this.socket) { this.socket.disconnect(); }
          this._cleanup();
          if (this._bar) this._bar.classList.remove('show');
          this._render(this._tplLogin(details.message || "Has sido expulsado del canal por un administrador."));
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

        this.socket.on('operation_error', ({ message }) => this._showMusicError(message));
        this.socket.connect();
      };

      if (window.YaireFirebaseVoice && window.yaireVoiceFirebase) doConnect();
      else {
        this._connecting = false;
        this._cleanup();
        this._render(this._tplLogin('Firebase todavía no está listo. Recarga e inténtalo de nuevo.'));
      }
    }

    // ── WebRTC ─────────────────────────────────────────────────────────────
    _makePeer(peerId) {
      const pc = new RTCPeerConnection(this.ice);
      const streamToUse = this._processedStream || this.stream;
      if (streamToUse) {
        streamToUse.getTracks().forEach(t => pc.addTrack(t, streamToUse));
      }
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
          audio.dataset.vcPeer = peerId;
          audio.setAttribute('playsinline', '');
          audio.setAttribute('webkit-playsinline', '');
          document.body.appendChild(audio);
          this.audios.set(peerId, audio);
        }
        audio.srcObject = streams[0];
        audio.volume = this.dnd ? 0 : 1;
        const u = this.users.find(x => x.id === peerId);
        audio.muted = u && u.localMuted ? true : false;
        
        if (typeof this._robustPlay === 'function') {
          this._robustPlay(audio, peerId);
        } else {
          audio.play().catch(e => console.error('[VC] Autoplay error:', e));
        }
      };

      return pc;
    }

    async _createOffer(peerId) {
      const socket = this.socket, attempt = this._joinAttempt;
      if (!this.connected || !socket) return;
      const pc = this._makePeer(peerId);
      const active = () => this.connected && this.socket === socket && this._joinAttempt === attempt && this.peers.get(peerId) === pc;
      try {
        const offer = await pc.createOffer();
        if (!active()) return;
        await pc.setLocalDescription(offer);
        if (active()) socket.emit('webrtc_offer', { to: peerId, sdp: pc.localDescription });
      } catch (error) { if (active()) console.warn('[VC] Offer failed:', error); }
    }

    async _handleOffer(fromId, sdp) {
      const socket = this.socket, attempt = this._joinAttempt;
      if (!this.connected || !socket) return;
      const pc = this._makePeer(fromId);
      const active = () => this.connected && this.socket === socket && this._joinAttempt === attempt && this.peers.get(fromId) === pc;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        if (!active()) return;
        const answer = await pc.createAnswer();
        if (!active()) return;
        await pc.setLocalDescription(answer);
        if (!active()) return;
        socket.emit('webrtc_answer', { to: fromId, sdp: pc.localDescription });
        this._flushIce(fromId);
      } catch (error) { if (active()) console.warn('[VC] Answer failed:', error); }
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
      if (audio) { 
        audio.srcObject = null; 
        audio.remove(); 
        this.audios.delete(peerId); 
      }
    }

    // ── MUTE ──────────────────────────────────────────────────────────────
    _toggleMute() {
      this.muted = !this.muted;
      this.stream.getAudioTracks().forEach(t => { t.enabled = !this.muted; });
      this.socket && this.socket.emit('mute_state', { muted: this.muted });
      
      const btn = document.getElementById('vc-mute');
      if (btn) {
        btn.setAttribute('aria-pressed', String(this.muted));
        btn.setAttribute('aria-label', _t(this.muted ? 'room_mic_on' : 'room_mic_off'));
        btn.innerHTML = `<span class="vc-control-icon" aria-hidden="true">${this.muted ? ICONS.micOff : ICONS.mic}</span><span>${_t(this.muted ? 'btn_muted' : 'btn_mic')}</span>`;
      }
      this._updateUsersDOM();
      this._updateDockState();
      this._playSfx(this.muted ? 'toggleOff' : 'toggleOn', 0.4);
    }

    _toggleDND() {
      this.dnd = !this.dnd;
      this.audios.forEach(a => { a.volume = this.dnd ? 0 : 1; });
      if (this._ytPlayer && typeof this._ytPlayer.setVolume === 'function') {
        this._ytPlayer.setVolume(this.dnd ? 0 : this._musicVolume);
      }
      if (this._audioPlayer) {
        this._audioPlayer.volume = this.dnd ? 0 : (this._musicVolume / 100);
      }
      this.socket && this.socket.emit('dnd_state', { dnd: this.dnd });
      
      const btn = document.getElementById('vc-dnd');
      if (btn) {
        btn.setAttribute('aria-pressed', String(this.dnd));
        btn.setAttribute('aria-label', _t(this.dnd ? 'room_undeafen' : 'room_deafen'));
        btn.innerHTML = `<span class="vc-control-icon" aria-hidden="true">${this.dnd ? ICONS.dnd : ICONS.bell}</span><span>${_t(this.dnd ? 'btn_audio_off' : 'btn_audio')}</span>`;
      }
      this._updateUsersDOM();
      this._updateDockState();
      this._playSfx(this.dnd ? 'toggleOff' : 'toggleOn', 0.4);
    }

    // ── LEAVE ─────────────────────────────────────────────────────────────
    _leave() {
      this._playSfx('siri_end', 0.5);
      if (this.socket) { this.socket.emit('leave_channel'); this.socket.disconnect(); this.socket = null; }
      this._cleanup();
      this._bar.classList.remove('show');
      this._render(this._tplLogin());
    }

    // ── CHAT METHODS ────────────────────────────────────────────────────
    _chatMessageMarkup(m) {
      const isMe = m.from === this.myId;
      const time = new Date(m.ts).toLocaleTimeString(_getLang(), { hour: '2-digit', minute: '2-digit' });
      return `<div class="vc-chat-msg ${isMe ? 'vc-chat-mine' : ''}" data-from="${this._escHtml(m.from)}"><div class="vc-chat-meta"><strong>${this._escHtml(m.name)}</strong><time>${time}</time></div><div class="vc-chat-bubble">${this._escHtml(m.text)}</div></div>`;
    }

    _renderChatMsgs() {
      if (!this._chatMsgs.length) return `<div class="vc-empty-state" data-chat-empty>${ICONS.chat}<h2>${_t('room_chat_title')}</h2><p>${_t('room_chat_desc')}</p></div>`;
      return this._chatMsgs.map(m => this._chatMessageMarkup(m)).join('');
    }

    // ── CHAT ─────────────────────────────────────────────────────────────


    _sendChat() {
      const input = document.getElementById('vc-chat-in');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;
      if (this.socket) this.socket.emit('chat_message', { text });
      
      // Local echo (makes it feel instant, and works even if server doesn't bounce it back yet)
      this._appendChatMsg(this.myId, this.myName, text, Date.now());
      
      input.value = '';
      const isMobile = this._checkMobile() || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches);
      if (!isMobile) {
        input.focus();
      } else {
        input.blur();
      }
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

      const msgsEl = document.getElementById('vc-msgs');
      if (msgsEl) {
        // A tab refresh already rendered this message when its unread count changed.
        if (this._activeTab === 'chat' || isMe) {
          msgsEl.querySelector('[data-chat-empty]')?.remove();
          msgsEl.insertAdjacentHTML('beforeend', this._chatMessageMarkup({ from, name, text, ts }));
          if (this._activeTab === 'chat') this._animateIn(msgsEl.lastElementChild, { distance: 4 });
        }
        while (msgsEl.querySelectorAll('.vc-chat-msg').length > 50) msgsEl.querySelector('.vc-chat-msg').remove();
        msgsEl.scrollTop = msgsEl.scrollHeight;
      }

      if (!isMe) this._playSfx('typing', 0.25);
    }

    _escHtml(str) {
      const d = document.createElement('div');
      d.textContent = String(str ?? '');
      return d.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
        <div class="vc-ring-avatar">${this._escHtml(initials)}</div>
        <div class="vc-ring-name">${this._escHtml(callerName)}</div>
        <div class="vc-ring-sub">${_t('vc_ring_msg')}</div>
        <div class="vc-ring-btns">
          <button class="vc-ring-btn join" id="vc-ring-join">${_t('vc_ring_join')}</button>
          <button class="vc-ring-btn ignore" id="vc-ring-ignore">${_t('vc_ring_ignore')}</button>
        </div>`;
      document.body.appendChild(overlay);
      this._animateIn(overlay, { distance: 8 });
      overlay.querySelectorAll('button').forEach(button => this._bindGsapButton(button));

      // Auto-dismiss after 20 seconds
      this._ringTimeout = setTimeout(() => this._dismissRing(), 20000);

      document.getElementById('vc-ring-join').addEventListener('click', () => {
        this._dismissRing();
        // Open the panel for the user to join
        if (!this.panel.classList.contains('scale-100')) {
          this._toggle();
        } else {
          this.panel.classList.add('open');
        }
        this._playSfx('flyin', 0.4, false, 'fly');
        // Focus on the password field
        setTimeout(() => {
          const joinEl = document.getElementById('vc-join') || document.getElementById('vc-google-login-btn');
          if (joinEl) joinEl.focus();
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
        overlay.inert = true;
        if (window.gsap) {
          window.gsap.killTweensOf(overlay);
          window.gsap.to(overlay, { opacity: 0, y: this._reducedMotion.matches ? 0 : 8, duration: .16, ease: 'power3.out', overwrite: true, onComplete: () => overlay.remove() });
        } else overlay.remove();
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

      if (this._noiseCtx) {
        try { this._noiseCtx.close(); } catch(e){}
        this._noiseCtx = null;
      }

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

    _getSpotlightTracks() {
      if (typeof window.spotlightTracks !== 'undefined' && Array.isArray(window.spotlightTracks) && window.spotlightTracks.length > 0) {
        return window.spotlightTracks;
      }
      return [
        { title: "Bing Bong", artist: "Yailin la Mas Viral", src: "radio/Bing Bong - Yailin la Mas Viral - SpotubeDL.com.mp3" },
        { title: "Brazilera - Remix", artist: "Chimbala", src: "radio/Brazilera - Remix - Chimbala - SpotubeDL.com.mp3" },
        { title: "Como Panas", artist: "Bryant Myers", src: "radio/Como Panas - Bryant Myers - SpotubeDL.com.mp3" },
        { title: "Delincuente", artist: "Tokischa", src: "radio/Delincuente - Tokischa - SpotubeDL.com.mp3" },
        { title: "God is a woman", artist: "Ariana Grande", src: "radio/God is a woman - Ariana Grande - SpotubeDL.com.mp3" },
        { title: "God's Plan", artist: "Drake", src: "radio/God's Plan - Drake - SpotubeDL.com.mp3" },
        { title: "I Like It", artist: "Cardi B", src: "radio/I Like It - Cardi B - SpotubeDL.com.mp3" },
        { title: "Inolvidable", artist: "Ovy On The Drums", src: "radio/Inolvidable - Ovy On The Drums - SpotubeDL.com.mp3" },
        { title: "Oscar Winning Tears.", artist: "RAYE", src: "radio/Oscar Winning Tears. - RAYE - SpotubeDL.com.mp3" },
        { title: "Pasao De Famarcia", artist: "Lil Naay", src: "radio/Pasao De Famarcia - Lil Naay - SpotubeDL.com.mp3" },
        { title: "Thootie", artist: "Ice Spice ft. Tokischa", src: "radio/Thootie (feat. Tokischa) - Ice Spice - SpotubeDL.com.mp3" },
        { title: "Toto Lindo", artist: "Huan62", src: "radio/Toto Lindo - Huan62 - SpotubeDL.com.mp3" },
        { title: "Oro Fundido", artist: "Oblivion's Mighty Trash", src: "sounds/Oro Fundido - Oblivion's Mighty Trash - SpotubeDL.com.mp3" },
        { title: "CRAZY (Live)", artist: "Otis McDonald", src: "sounds/Otis McDonald - CRAZY - Live (SPOTISAVER).mp3" },
        { title: "O.Sky", artist: "Otis McDonald", src: "sounds/Otis McDonald - O.Sky.mp3" }
      ];
    }

    _getTrackArtwork(track) {
      if (!track) return null;
      if (track.cover) return track.cover;
      if (track.artwork) return track.artwork;
      const key = (track.title || '') + '|' + (track.artist || '');
      if (window.spotArtworkCache && window.spotArtworkCache[key]) {
        return window.spotArtworkCache[key];
      }
      return null;
    }

    _resolvePendingArtwork() {
      const nodes = document.querySelectorAll('[data-spot-art-key]');
      if (!nodes || nodes.length === 0) return;
      nodes.forEach(el => {
        const key = el.dataset.spotArtKey;
        if (!key) return;
        const parts = key.split('|');
        const title = parts[0] || '';
        const artist = parts[1] || '';

        if (window.spotArtworkCache && window.spotArtworkCache[key]) {
          const img = document.createElement('img');
          img.src = window.spotArtworkCache[key];
          img.className = 'w-full h-full object-cover';
          img.loading = 'lazy';
          el.replaceWith(img);
          return;
        }

        if (typeof window.fetchSpotlightArtwork === 'function') {
          window.fetchSpotlightArtwork({ title, artist }).then(artUrl => {
            if (artUrl && el.isConnected) {
              const img = document.createElement('img');
              img.src = artUrl;
              img.className = 'w-full h-full object-cover';
              img.loading = 'lazy';
              el.replaceWith(img);
            }
          }).catch(() => {});
        }
      });
    }

    _trackArtMarkup(track, className = '') {
      const art = this._getTrackArtwork(track);
      const key = (track.title || '') + '|' + (track.artist || '');
      return `<span class="vc-track-art ${className}">${art ? `<img src="${this._escHtml(art)}" alt="" loading="lazy" />` : `<span data-spot-art-key="${this._escHtml(key)}">${ICONS.music}</span>`}</span>`;
    }

    _pager(kind, total) {
      const size = kind === 'queue' ? this._queuePageSize : this._catalogPageSize;
      const pages = Math.max(1, Math.ceil(total / size));
      const key = kind === 'queue' ? '_queuePage' : '_catalogPage';
      this[key] = Math.min(Math.max(0, this[key]), pages - 1);
      const page = this[key];
      if (pages === 1) return '';
      return `<nav class="vc-pager" aria-label="${_t(kind === 'queue' ? 'page_queue' : 'page_catalog')}"><button id="vc-${kind}-prev" class="vc-page-button" data-vc-page="${kind}" data-direction="-1" ${page === 0 ? 'disabled' : ''} aria-label="${_t('page_previous')}">${ICONS.back}</button><span class="vc-page-count" aria-live="polite">${page + 1}/${pages}</span><button id="vc-${kind}-next" class="vc-page-button" data-vc-page="${kind}" data-direction="1" ${page + 1 >= pages ? 'disabled' : ''} aria-label="${_t('page_next')}">${ICONS.arrow}</button></nav>`;
    }

    _renderSpotlightCatalog() {
      const tracks = this._getSpotlightTracks();
      const query = (this._spotlightSearchQuery || '').toLocaleLowerCase().trim();
      const filtered = query ? tracks.filter(t => `${t.title || ''} ${t.artist || ''}`.toLocaleLowerCase().includes(query)) : tracks;
      const pager = this._pager('catalog', filtered.length);
      const start = this._catalogPage * this._catalogPageSize;
      return `<div class="vc-music-panel vc-catalog-panel">
        <div class="vc-catalog-heading"><button id="vc-spotlight-back-btn" class="vc-back-button">${ICONS.back}<span>Spotlight · ${filtered.length}</span></button>${pager}</div>
        <div class="vc-search-field">${ICONS.search}<input id="vc-spotlight-search-input" type="search" aria-label="${_t('room_search_label')}" placeholder="${_t('room_search_label')}" value="${this._escHtml(this._spotlightSearchQuery || '')}" autocomplete="off" enterkeyhint="search" />${query ? `<button id="vc-spotlight-search-clear" class="vc-icon-button" aria-label="${_t('room_cancel')}">${ICONS.close}</button>` : ''}</div>
        <div class="vc-list-window" data-list-window="catalog"><div class="vc-track-list" id="vc-spotlight-track-list">${filtered.length ? filtered.slice(start, start + this._catalogPageSize).map((t, i) => {
          const attrs = `data-src="${this._escHtml(t.src)}" data-title="${this._escHtml(t.title)}" data-artist="${this._escHtml(t.artist || '')}"`;
          return `<div class="vc-track-row"><button class="vc-spot-track-row vc-track-play" data-idx="${start + i}" ${attrs} aria-label="${_t('room_play')}: ${this._escHtml(t.title)}">${this._trackArtMarkup(t)}<span class="vc-track-info"><strong>${this._escHtml(t.title)}</strong><small>${this._escHtml(t.artist || 'Spotlight')}</small></span></button><button class="vc-spot-add-queue vc-icon-button" ${attrs} aria-label="${_t('vc_spotlight_add_queue')}: ${this._escHtml(t.title)}" title="${_t('vc_spotlight_add_queue')}">${ICONS.plus}</button></div>`;
        }).join('') : `<div class="vc-empty-state">${ICONS.search}<h2>${_t('room_no_results')}</h2><p>${_t('room_no_results_desc')}</p></div>`}</div></div>
      </div>`;
    }

    _renderMusicPanel() {
      if (this._musicSpotlightView) return this._renderSpotlightCatalog();
      const track = this._musicCurrentTrack;
      const playing = this._musicPlaying;
      const fmt = secs => { const n = Number.isFinite(secs) ? Math.max(0, Math.floor(secs)) : 0; return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };
      let current = 0, duration = 0;
      if (track?.type === 'youtube' && typeof this._ytPlayer?.getCurrentTime === 'function') { current = this._ytPlayer.getCurrentTime() || 0; duration = this._ytPlayer.getDuration() || 0; }
      else if (this._audioPlayer) { current = this._audioPlayer.currentTime || 0; duration = this._audioPlayer.duration || 0; }
      const percent = duration > 0 ? Math.min(100, Math.max(0, current / duration * 100)) : 0;
      const source = track ? ((track.source || track.type) === 'spotlight' ? 'Spotlight' : (track.source || track.type) === 'spotify' ? 'Spotify' : track.type === 'youtube' ? 'YouTube' : '28E') : '';
      const controls = `<button id="vc-music-playpause" class="vc-icon-button vc-play-button" aria-label="${_t(playing ? 'room_pause' : 'room_play')}">${playing ? ICONS.pause : ICONS.play}</button><button id="vc-music-skip" class="vc-icon-button" aria-label="${_t('vc_music_skip')}" title="${_t('vc_music_skip')}">${ICONS.skipFwd}</button>`;
      const now = track ? `<div class="vc-now-playing" data-track-id="${this._escHtml(track.id || track.url || track.title)}">
        <div class="vc-player-main">${this._trackArtMarkup(track)}<div class="vc-track-info"><strong title="${this._escHtml(this._cleanMusicTitle(track.title))}">${this._escHtml(this._cleanMusicTitle(track.title))}</strong><small>${this._escHtml(track.artist || source)}</small></div></div>
        <div class="vc-player-bottom">${track.type !== 'spotify' ? `<div class="vc-track-progress"><div id="vc-music-progress" role="slider" tabindex="0" aria-label="${_t('vc_music_now')}" aria-valuemin="0" aria-valuemax="${Math.floor(duration)}" aria-valuenow="${Math.floor(current)}"><div class="vc-progress-track"><div id="vc-music-progress-fill" style="width:${percent}%"></div></div></div><div class="vc-time-row" ${duration > 0 ? '' : 'hidden'}><span id="vc-music-time-current">${fmt(current)}</span><span id="vc-music-time-total">${fmt(duration)}</span></div></div>` : ''}<div class="vc-player-actions">${controls}</div></div>
        ${track.type === 'spotify' ? '<div id="vc-spotify-embed"></div>' : ''}
      </div>` : `<div class="vc-music-empty">${ICONS.music}<div><h2>${_t('vc_music_no_track')}</h2><p>${_t('room_music_desc')}</p></div></div>`;
      const pending = this._musicQueue.filter((t, i) => track ? (track.id ? t.id !== track.id : i !== this._musicState.currentIndex) : true);
      const queuePager = this._pager('queue', pending.length);
      const queueStart = this._queuePage * this._queuePageSize;
      const queue = pending.slice(queueStart, queueStart + this._queuePageSize).map(t => {
        return `<div class="vc-track-row">${this._trackArtMarkup(t)}<div class="vc-track-info"><strong>${this._escHtml(this._cleanMusicTitle(t.title))}</strong><small>${this._escHtml(t.artist || t.addedByName || '')}</small></div><button class="vc-icon-button vc-music-track-rm" data-track-id="${this._escHtml(t.id)}" aria-label="${_t('room_remove')}: ${this._escHtml(t.title)}" title="${_t('room_remove')}">${ICONS.close}</button></div>`;
      }).join('');
      return `<div class="vc-music-panel vc-queue-panel">${now}
        <div class="vc-queue-region"><div class="vc-queue-heading"><h2 class="vc-music-label" ${pending.length ? '' : 'hidden'}>${_t('vc_music_queue')}<span>${pending.length}</span></h2><button id="vc-spotlight-open-btn" class="vc-catalog-button"><span><strong>${_t('room_catalog')}</strong></span>${ICONS.arrow}</button></div><div class="vc-list-window" data-list-window="queue"><div id="vc-music-queue" class="vc-track-list">${queue || `<p class="vc-queue-empty">${_t('vc_music_empty_q')}</p>`}</div></div>${queuePager}</div>
        <div class="vc-music-compose"><div class="vc-input-row"><input id="vc-music-url" type="url" aria-label="${_t('room_link_label')}" placeholder="${_t('room_link_ph')}" autocomplete="off" enterkeyhint="go" /><button id="vc-music-add" class="vc-icon-button vc-add-button" aria-label="${_t('vc_music_add')}" title="${_t('vc_music_add')}">${ICONS.plus}</button></div><p class="vc-error" id="vc-music-err" role="status"></p></div>
      </div>`;
    }

    _saveDrafts() {
      if (!this.panel) return;
      for (const id of ['vc-chat-in', 'vc-music-url']) { const input = this.panel.querySelector('#' + id); if (input) this._inputDrafts[id] = input.value; }
    }

    _restoreDrafts() {
      for (const [id, value] of Object.entries(this._inputDrafts)) { const input = this.panel.querySelector('#' + id); if (input) input.value = value; }
    }

    _bindListSizing() {
      this._listObserver?.disconnect();
      if (typeof ResizeObserver !== 'function') return;
      this._listObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          if (!entry.target.isConnected || entry.contentRect.height < 1) continue;
          const kind = entry.target.dataset.listWindow;
          const key = kind === 'queue' ? '_queuePageSize' : '_catalogPageSize';
          const rows = Math.max(1, Math.floor(entry.contentRect.height / 48));
          if (rows !== this[key]) { this[key] = rows; cancelAnimationFrame(this._listFitRaf); this._listFitRaf = requestAnimationFrame(() => this._updateMusicUI()); break; }
        }
      });
      this.panel.querySelectorAll('[data-list-window]').forEach(node => this._listObserver.observe(node));
    }

    _updateMusicUI(animate = false) {
      const body = document.getElementById('vc-music-inner');
      const previousTrack = body?.querySelector('.vc-now-playing')?.dataset.trackId;
      if (body) {
        this._clearMotion(body);
        this._saveDrafts();
        const focused = this.panel.contains(document.activeElement) ? document.activeElement.id : '';
        const cursor = focused && document.activeElement.selectionStart;
        this._listObserver?.disconnect();
        body.innerHTML = this._renderMusicPanel();
        this._restoreDrafts();
        this._bindMusicEvents();
        if (focused) {
          const target = document.getElementById(focused);
          if (target && !target.disabled) { target.focus({ preventScroll: true }); if (typeof cursor === 'number' && target.type !== 'url') try { target.setSelectionRange(cursor, cursor); } catch {} }
          else if (focused === 'vc-spotlight-search-clear') body.querySelector('#vc-spotlight-search-input')?.focus({ preventScroll: true });
          else if (focused.startsWith('vc-queue-') || focused.startsWith('vc-catalog-')) body.querySelector('[data-vc-page]:not(:disabled)')?.focus();
        }
        if (this._musicCurrentTrack?.type === 'spotify') {
          this._createSpotifyEmbed(this._musicCurrentTrack);
        }
        if (this._musicPlaying && (this._musicCurrentTrack?.type === 'youtube' || this._musicCurrentTrack?.type === 'spotlight' || this._musicCurrentTrack?.type === 'audio')) {
          this._startMusicProgress();
        }
      }
        const currentTrack = body?.querySelector('.vc-now-playing');
        if (body && this._activeTab === 'music' && this.panel.classList.contains('open')) {
          if (animate) this._animateIn(body.querySelector('.vc-music-panel'), { distance: 5 });
          else if (currentTrack && currentTrack.dataset.trackId !== previousTrack) this._animateIn(currentTrack);
        }
      this._updateMusicIndicator();
    }

    _updateMusicIndicator() {
      const tab = document.getElementById('vc-tab-music');
      if (tab) {
        const indicator = tab.querySelector('.vc-music-ind');
        if (this._musicPlaying && !indicator) tab.insertAdjacentHTML('beforeend', '<span class="vc-music-ind vc-status-dot"></span>');
        else if (!this._musicPlaying) indicator?.remove();
      }
      this._updateBarMusicState();
    }

    _bindMusicEvents() {
      this.panel.querySelectorAll('#vc-music-inner button').forEach(button => this._bindGsapButton(button));
      this.panel.querySelectorAll('[data-vc-page]').forEach(button => button.addEventListener('click', () => { const key = button.dataset.vcPage === 'queue' ? '_queuePage' : '_catalogPage'; this[key] += Number(button.dataset.direction); this._updateMusicUI(true); }));
      this._bindListSizing();
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
      if (progressBar) {
        progressBar.addEventListener('click', (e) => {
          const rect = progressBar.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const pct = Math.max(0, Math.min(1, clickX / rect.width));
          let duration = 0;
          if (this._ytPlayer && typeof this._ytPlayer.getDuration === 'function') {
            duration = this._ytPlayer.getDuration();
          } else if (this._audioPlayer && this._audioPlayer.duration) {
            duration = this._audioPlayer.duration;
          }
          if (duration > 0) {
            const seekTime = pct * duration;
            if (this.socket) this.socket.emit('music_seek', { time: seekTime });
            this._seekMusic(seekTime);
          }
        });
      }
      if (progressBar) progressBar.addEventListener('keydown', e => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const duration = Number(progressBar.getAttribute('aria-valuemax'));
        if (!duration) return;
        const current = Number(progressBar.getAttribute('aria-valuenow'));
        const time = e.key === 'Home' ? 0 : e.key === 'End' ? duration : Math.max(0, Math.min(duration, current + (e.key === 'ArrowRight' ? 5 : -5)));
        this.socket?.emit('music_seek', { time });
        this._seekMusic(time);
        progressBar.setAttribute('aria-valuenow', String(Math.floor(time)));
      });
      // Spotlight buttons
      const spotOpenBtn = document.getElementById('vc-spotlight-open-btn');
      if (spotOpenBtn) {
        spotOpenBtn.addEventListener('click', () => {
          this._musicSpotlightView = true;
          this._updateMusicUI(true);
        });
      }

      const spotBackBtn = document.getElementById('vc-spotlight-back-btn');
      if (spotBackBtn) {
        spotBackBtn.addEventListener('click', () => {
          this._musicSpotlightView = false;
          this._updateMusicUI(true);
        });
      }

      const spotSearchInput = document.getElementById('vc-spotlight-search-input');
      if (spotSearchInput) {
        spotSearchInput.addEventListener('input', (e) => {
          this._spotlightSearchQuery = e.target.value;
          this._catalogPage = 0;
          const body = document.getElementById('vc-music-inner');
          if (body) {
            body.innerHTML = this._renderMusicPanel();
            this._bindMusicEvents();
            const inputAgain = document.getElementById('vc-spotlight-search-input');
            if (inputAgain) {
              inputAgain.focus();
              inputAgain.selectionStart = inputAgain.selectionEnd = inputAgain.value.length;
            }
          }
        });
      }

      const spotSearchClear = document.getElementById('vc-spotlight-search-clear');
      if (spotSearchClear) {
        spotSearchClear.addEventListener('click', () => {
          this._spotlightSearchQuery = '';
          this._catalogPage = 0;
          this._updateMusicUI();
        });
      }

      // Clic en la fila: Reproducir de inmediato
      document.querySelectorAll('.vc-spot-track-row').forEach(row => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('.vc-spot-add-queue')) return;
          const src = row.dataset.src;
          const title = row.dataset.title;
          const artist = row.dataset.artist;
          this._addSpotlightTrack({ src, title, artist }, true);
        });
      });

      // Clic en botón +: Añadir a la cola
      document.querySelectorAll('.vc-spot-add-queue').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const src = btn.dataset.src;
          const title = btn.dataset.title;
          const artist = btn.dataset.artist;
          this._addSpotlightTrack({ src, title, artist }, false);
        });
      });

      // Resolver portadas de canciones asíncronamente
      this._resolvePendingArtwork();
    }

    tuneIntoSpotlightLive() {
      this.open();
      if (this.connected) {
        this._doSwitchTab('music');
      }

      if (!this.socket) {
        this._toast("Entra a Afterglow primero para sintonizar en vivo", "info");
        return;
      }
      this._playSfx('toggleOn', 0.3);

      const state = typeof window.getSpotlightCurrentState === 'function' ? window.getSpotlightCurrentState() : null;

      if (state && state.isPlaying) {
        if (state.mode === 'radio' && state.radioState) {
          const r = state.radioState;
          if (typeof window.stopSpotlightLocalPlayback === 'function') window.stopSpotlightLocalPlayback();
          this._addSpotlightTrack({
            src: r.src,
            title: r.title || 'Spotlight Radio',
            artist: r.artist || 'Live Broadcast'
          }, true);
          this._showMusicSuccess(`Sintonizando ${r.title || 'Radio'} en vivo...`);
          return;
        } else if (state.track) {
          const t = state.track;
          if (typeof window.stopSpotlightLocalPlayback === 'function') window.stopSpotlightLocalPlayback();
          this._addSpotlightTrack(t, true);
          this._showMusicSuccess(`Sintonizando ${t.title} en vivo...`);
          return;
        }
      }

      const tracks = this._getSpotlightTracks();
      const curTrack = (state && state.trackIndex >= 0 && tracks[state.trackIndex]) ? tracks[state.trackIndex] : tracks[0];
      if (curTrack) {
        if (typeof window.stopSpotlightLocalPlayback === 'function') window.stopSpotlightLocalPlayback();
        this._addSpotlightTrack(curTrack, true);
        this._showMusicSuccess(`Reproduciendo ${curTrack.title} de Spotlight...`);
      }
    }

    async _addSpotlightTrack(track, playNow = false) {
      if (!this.socket) {
        this._toast('Entra a Afterglow primero para reproducir música con los demás', 'info');
        return;
      }
      const fullUrl = track.src.startsWith('http') ? track.src : new URL(track.src, document.baseURI).href;
      const finalTitle = track.artist ? `${track.title} - ${track.artist}` : track.title;
      const cover = this._getTrackArtwork(track);

      this._playSfx('toggleOn', 0.3);

      if (playNow) {
        this._showMusicSuccess(`Reproduciendo: ${track.title}`);
        this._musicSpotlightView = false;

        this.socket.emit('music_add', {
          url: fullUrl,
          title: finalTitle,
          type: 'spotlight',
          artist: track.artist || '',
          cover: cover || null,
          playNow: true
        });

        // Fallback for older signaling server: if no music starts in 500ms, resume
        setTimeout(() => {
          if (this.socket && !this._musicPlaying) {
            this.socket.emit('music_resume');
          }
        }, 500);
      } else {
        this._showMusicSuccess(`Añadida a la cola: ${track.title}`);
        this.socket.emit('music_add', {
          url: fullUrl,
          title: finalTitle,
          type: 'spotlight',
          artist: track.artist || '',
          cover: cover || null,
          playNow: false
        });
      }

      this._updateMusicUI();
    }

    _showMusicSuccess(msg) {
      const err = document.getElementById('vc-music-err');
      if (err) {
        err.innerHTML = `<span class="text-amber-400 font-semibold flex items-center justify-center gap-1">✨ ${this._escHtml(msg)}</span>`;
        setTimeout(() => { if (err.textContent.includes(msg)) err.innerHTML = ''; }, 4000);
      }
    }

    _showMusicError(msg) {
      const err = document.getElementById('vc-music-err');
      if (err) {
        err.textContent = msg;
        setTimeout(() => { if (err.textContent === msg) err.textContent = ''; }, 3000);
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
      input.value = '';

      const errEl = document.getElementById('vc-music-err');

      try {
        let finalTitle = '';
        if (parsed.type === 'spotlight') {
          finalTitle = parsed.title || 'Spotlight Track';
        } else if (parsed.type === 'youtube') {
          if (errEl) errEl.innerHTML = `<span class="text-amber-500 flex items-center justify-center gap-1.5"><span class="w-2 h-2 rounded-full border border-amber-500 border-t-transparent animate-spin inline-block"></span> Cargando…</span>`;
          try { finalTitle = await this._fetchMusicTitle(parsed.url, 'youtube'); } catch(e) {}
          finalTitle = finalTitle || 'YouTube Video';
        } else if (parsed.type === 'spotify') {
          if (errEl) errEl.innerHTML = `<span class="text-amber-500 flex items-center justify-center gap-1.5"><span class="w-2 h-2 rounded-full border border-amber-500 border-t-transparent animate-spin inline-block"></span> Obteniendo info…</span>`;
          try {
            const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(parsed.url)}`);
            const data = await res.json();
            const artist = data.author_name || '';
            const title = data.title || 'Spotify Track';
            finalTitle = artist ? `${title} - ${artist}` : title;
          } catch(e) { finalTitle = 'Spotify Track'; }
        }

        // Resolve Spotify metadata through the authenticated, optional web API.
        if (parsed.type === 'spotify') {
          const response = await fetch('/api/music-search', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await window.yaireCurrentUser.getIdToken() },
            body: JSON.stringify({ query: finalTitle }), signal: AbortSignal.timeout(15000)
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'No se pudo buscar la canción.');
          parsed.type = result.type; parsed.url = result.url; finalTitle = result.title;
        }
        if (errEl) {
          const loadingMsg = parsed.type === 'spotify' ? 'Buscando en YouTube…' : (parsed.type === 'spotlight' ? 'Añadiendo de Spotlight…' : 'Añadiendo…');
          errEl.innerHTML = `<span class="text-amber-500 flex items-center justify-center gap-1.5"><span class="w-2 h-2 rounded-full border border-amber-500 border-t-transparent animate-spin inline-block"></span> ${loadingMsg}</span>`;
        }

        if (this.socket) {
          const queueHandler = () => {
            if (errEl) errEl.innerHTML = '';
            addBtn.disabled = false;
            input.disabled = false;
            addBtn.innerHTML = originalText;
          };
          this.socket.once('music_queue_update', queueHandler);
          // Fallback if server takes too long
          setTimeout(() => { this.socket?.off('music_queue_update', queueHandler); queueHandler(); }, 20000);

          this.socket.emit('music_add', { url: parsed.url, title: finalTitle, type: parsed.type });
          this._playSfx('toggleOn', 0.3);
        } else {
          if (errEl) errEl.innerHTML = '';
          addBtn.disabled = false;
          input.disabled = false;
          addBtn.innerHTML = originalText;
        }
      } catch(e) {
        console.error('[VC] Music add error:', e);
        if (errEl) errEl.textContent = e.message || 'No se pudo añadir la canción.';
        addBtn.disabled = false;
        input.disabled = false;
        addBtn.innerHTML = originalText;
      }
    }

    _parseMusicUrl(url) {
      if (!url) return null;
      const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
      const ytMatch = url.match(ytRegex);
      if (ytMatch) return { type: 'youtube', id: ytMatch[1], url: `https://www.youtube.com/watch?v=${ytMatch[1]}` };
      const spRegex = /open\.spotify\.com\/.*?(track|album|playlist)\/([a-zA-Z0-9]+)/;
      const spMatch = url.match(spRegex);
      if (spMatch) return { type: 'spotify', spotifyType: spMatch[1], id: spMatch[2], url: `https://open.spotify.com/${spMatch[1]}/${spMatch[2]}` };

      // Direct audio file or relative radio/sounds URL
      if (url.endsWith('.mp3') || url.includes('radio/') || url.includes('sounds/')) {
        const full = new URL(url, document.baseURI).href;
        return { type: 'spotlight', url: full, title: url.split('/').pop().replace(/\.mp3$/i, '') };
      }

      // Match by song title or artist from Spotlight catalog
      const spotlightSongs = this._getSpotlightTracks();
      const q = url.toLowerCase().trim();
      const match = spotlightSongs.find(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.artist && t.artist.toLowerCase().includes(q))
      );
      if (match) {
        const full = new URL(match.src, document.baseURI).href;
        return { type: 'spotlight', url: full, title: `${match.title} - ${match.artist || 'Spotlight'}` };
      }

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
        if (this._ytPlayer && typeof this._ytPlayer.getCurrentTime === 'function') {
          currentTime = this._ytPlayer.getCurrentTime();
        } else if (this._audioPlayer) {
          currentTime = this._audioPlayer.currentTime || 0;
        }
        this.socket.emit('music_pause', { currentTime });
      } else {
        this.socket.emit('music_resume');
      }
    }

    async _createAudioPlayer(src, seekTo = 0) {
      if (this._audioPlayer) {
        try {
          this._audioPlayer.pause();
          this._audioPlayer.src = '';
          this._audioPlayer.load();
        } catch (e) {}
        this._audioPlayer = null;
      }

      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = this.dnd ? 0 : (this._musicVolume / 100);
      this._audioPlayer = audio;

      audio.onended = () => this._onTrackEnded();
      audio.onerror = (e) => {
        console.warn('[VC] Spotlight audio playback error:', e, audio.error);
        this._toast('Error al reproducir audio de Spotlight', 'error');
      };

      const fullUrl = src.startsWith('http') ? src : new URL(src, document.baseURI).href;
      audio.src = fullUrl;

      if (seekTo > 0) {
        const applySeek = () => {
          try {
            if (audio.duration && seekTo < audio.duration) {
              audio.currentTime = seekTo;
            }
          } catch(e) {}
        };
        audio.addEventListener('loadedmetadata', applySeek, { once: true });
        audio.addEventListener('canplay', applySeek, { once: true });
      }

      try {
        await audio.play();
        this._musicPlaying = true;
        this._updateMusicUI();
      } catch (err) {
        console.warn('[VC] Spotlight autoplay blocked, waiting for interaction:', err);
        const resumeOnInteract = () => {
          if (this._audioPlayer && this._musicPlaying) {
            this._audioPlayer.play().catch(() => {});
          }
          window.removeEventListener('click', resumeOnInteract);
          window.removeEventListener('touchstart', resumeOnInteract);
        };
        window.addEventListener('click', resumeOnInteract, { once: true });
        window.addEventListener('touchstart', resumeOnInteract, { once: true });
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
      } else if (track.type === 'spotlight' || track.type === 'audio' || track.source === 'spotlight') {
        await this._createAudioPlayer(track.url, seekTime);
        this._startMusicProgress();
        this._updateMusicUI();
      }
    }

    _pauseMusic() {
      this._musicPlaying = false;
      if (this._ytPlayer && typeof this._ytPlayer.pauseVideo === 'function') this._ytPlayer.pauseVideo();
      if (this._audioPlayer) this._audioPlayer.pause();
      this._stopMusicProgress();
      this._updateMusicUI();
    }

    _resumeMusic() {
      this._musicPlaying = true;
      if (this._ytPlayer && typeof this._ytPlayer.playVideo === 'function') this._ytPlayer.playVideo();
      if (this._audioPlayer) this._audioPlayer.play().catch(e => console.warn('[VC] audio resume error:', e));
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
      if (this._audioPlayer) {
        try { this._audioPlayer.currentTime = time; } catch (e) {}
      }
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
      if (this._audioPlayer) {
        this._audioPlayer.volume = this.dnd ? 0 : (v / 100);
      }
    }

    _onTrackEnded() {
      if (this.socket) this.socket.emit('music_ended', { trackId: this._musicCurrentTrack?.id, startedAt: this._musicState.startedAt });
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
        if (!this._musicPlaying) return;
        let current = 0;
        let duration = 0;

        if (this._ytPlayer && typeof this._ytPlayer.getCurrentTime === 'function') {
          current = this._ytPlayer.getCurrentTime() || 0;
          duration = this._ytPlayer.getDuration() || 0;
        } else if (this._audioPlayer) {
          current = this._audioPlayer.currentTime || 0;
          duration = this._audioPlayer.duration || 0;
        } else {
          return;
        }

        const fill = document.getElementById('vc-music-progress-fill');
        const timeCurrent = document.getElementById('vc-music-time-current');
        const timeTotal = document.getElementById('vc-music-time-total');
        const progress = document.getElementById('vc-music-progress');
        if (progress) { progress.setAttribute('aria-valuemax', String(Math.floor(duration))); progress.setAttribute('aria-valuenow', String(Math.floor(current))); }
        if (fill && duration > 0) fill.style.width = Math.min(100, ((current / duration) * 100)) + '%';
        const fmt = (s) => {
          if (!s || isNaN(s)) return '0:00';
          const m = Math.floor(s / 60);
          const sec = Math.floor(s % 60);
          return `${m}:${sec < 10 ? '0' + sec : sec}`;
        };
        if (timeCurrent) timeCurrent.textContent = fmt(current);
        if (timeTotal && duration > 0) { timeTotal.textContent = fmt(duration); timeTotal.parentElement.hidden = false; }
      }, 500);
    }

    _stopMusicProgress() {
      if (this._musicProgressInt) { clearInterval(this._musicProgressInt); this._musicProgressInt = null; }
    }

    _destroyMusicPlayer() {
      this._stopMusicProgress();
      if (this._ytPlayer) { try { this._ytPlayer.destroy(); } catch(e) {} this._ytPlayer = null; }
      if (this._audioPlayer) {
        try {
          this._audioPlayer.pause();
          this._audioPlayer.src = '';
          this._audioPlayer.load();
        } catch (e) {}
        this._audioPlayer = null;
      }
      const container = document.getElementById('vc-yt-container');
      if (container) container.innerHTML = '';
    }

    _cleanup() {
      this._joinAttempt++;
      this._speakers.clear();
      this._listObserver?.disconnect();
      clearTimeout(this._micInitTimeout);
      this._micInitTimeout = null;
      this._dismissParticipantMenu?.();
      this._connecting = false;
      clearInterval(this._authRefreshTimer);
      this._authRefreshTimer = null;
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
      this._syncBarAccessibility();
      this.myId = null;
      this.users = [];
      this.muted = false;
      this.dnd = false;
      this.fab.classList.remove('connected');
      if (this._bar) {
        this._bar.classList.add('opacity-0', 'pointer-events-none');
        this._bar.classList.remove('opacity-100', 'pointer-events-auto', 'show');
      }
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
        if (this._silentCtx) {
          try { this._silentCtx.close(); } catch(e){}
          this._silentCtx = null;
        }
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

      // 3. Silent HTML Audio Loop (Crucial for iOS background/locked screen when idle)
      const isExternalMusicPlaying = (typeof isSpotPlaying !== 'undefined' && isSpotPlaying) || 
                                    (typeof spotAudio !== 'undefined' && spotAudio && !spotAudio.paused);
      if (!isExternalMusicPlaying) {
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
      }

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
        if (this._speakingCtx) {
          try { this._speakingCtx.close(); } catch(e){}
          this._speakingCtx = null;
        }
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        this._speakingCtx = ctx;
        const src = ctx.createMediaStreamSource(this.stream);
        const an  = ctx.createAnalyser();
        an.fftSize = 256;
        src.connect(an);
        this._analyser = an;
        this._analyserData = new Uint8Array(an.frequencyBinCount);
        this._checkSpeaking();

        if (ctx.state === 'suspended') {
          const resumeCtx = () => {
            ctx.resume().catch(e => console.error(e));
            ['click', 'touchstart'].forEach(e => document.removeEventListener(e, resumeCtx));
          };
          ['click', 'touchstart'].forEach(e => document.addEventListener(e, resumeCtx, { once: true }));
        }
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
      const avatar = document.getElementById(`vc-av-${userId}`);
      if (avatar) avatar.classList.toggle('speaking', speaking);
      if (speaking) this._speakers.add(userId); else this._speakers.delete(userId);
      this._updateDockState();
    }

    _updateBarSpeakingState() { this._updateDockState(); }

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
      this._initAudio();
      if (!this.actx) return;
      try {
        const ctx = this.actx;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(type === 'join' ? 880 : 440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(type === 'join' ? 1320 : 220, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
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
        if (!this.panel.classList.contains('scale-100') && this.connected) {
          const isMenuOpen = document.body.classList.contains('menu-is-open') || 
                             document.querySelector('#drawer-overlay.open') !== null ||
                             document.querySelector('#drawer-overlay:not(.hidden)') !== null ||
                             document.querySelector('#menu-panel.open') !== null;
          if (!isMenuOpen) {
            this._updateBarLayout();
            this._bar.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
            this._bar.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
          }
        }
      }, 1000);
    }

    _stopTimer() {
      clearInterval(this._timerInt);
      this._timerInt = null;
      this._callStart = null;
      this.fab.title = _t('vc_title');
    }
  }

  // ── INIT ─────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.yaireVoiceChannel = new VoiceChannel(); });
  } else {
    window.yaireVoiceChannel = new VoiceChannel();
  }

})();

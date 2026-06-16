// 28E Oracle - Immersive Voice & Video Room

// OracleAudio - Sound Manager for the immersive experience
class OracleAudio {
    static sounds = {
        hover: 'SND01_sine/tap_01.wav',
        click: 'SND01_sine/select.wav',
        connect: 'sounds/activity_launch.mp3',
        join: 'sounds/activity_user_join.mp3',
        left: 'sounds/activity_user_left.mp3',
        toggleOn: 'SND01_sine/toggle_on.wav',
        toggleOff: 'SND01_sine/toggle_off.wav',
        messageReceived: 'sounds/nuevomensajeenelchatdevoz.wav',
        messageSent: 'SND01_sine/transition_up.wav',
        transitionDown: 'SND01_sine/transition_down.wav',
        reaction: 'SND01_sine/tap_03.wav'
    };

    static typeSounds = [
        'SND01_sine/type_01.wav',
        'SND01_sine/type_02.wav',
        'SND01_sine/type_03.wav',
        'SND01_sine/type_04.wav',
        'SND01_sine/type_05.wav'
    ];

    static playTyping() {
        const rnd = this.typeSounds[Math.floor(Math.random() * this.typeSounds.length)];
        const audio = new Audio(rnd);
        audio.volume = 0.3; // softer typing sound
        audio.play().catch(()=>{});
    }

    static play(soundName) {
        if (!this.sounds[soundName]) return;
        const audio = new Audio(this.sounds[soundName]);
        audio.play().catch(() => {
            // Ignore errors (usually due to lack of user interaction)
        });
    }

    static initUIListeners() {
        // Automatically bind to buttons and links
        document.querySelectorAll('button, a').forEach(el => {
            if (el.classList.contains('no-sound')) return;
            
            el.addEventListener('mouseenter', () => {
                const sound = el.getAttribute('data-sound-hover') || 'hover';
                OracleAudio.play(sound);
            });
            
            el.addEventListener('mousedown', () => {
                const sound = el.getAttribute('data-sound-click') || 'click';
                OracleAudio.play(sound);
            });
        });
        
        // Add typing sound to chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                // Don't play typing sound on enter, let messageSent handle it
                if (e.key !== 'Enter') {
                    OracleAudio.playTyping();
                }
            });
        }
    }
}

class OracleRoom {
    constructor() {
        this.socket = null;
        this.stream = null;
        this.peers = new Map();
        this.pendingIce = new Map();
        
        this.myId = null;
        this.users = [];
        this.cameraEnabled = false;
        this.micEnabled = true;

        this.ytPlayer = null;
        this.isYtReady = false;
        this.musicQueue = [];
        this.musicState = { currentIndex: -1, isPlaying: false };

        this.iceConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: 'turn:global.relay.metered.ca:80',
                    username: '5187d4c4c5314e021d568c2d',
                    credential: 'Bb9ysI8BgTjn/dET'
                }
            ]
        };

        this.initUI();
    }

    async init() {
        const user = window.yaireCurrentUser;
        if (!user) return alert("Debes iniciar sesión.");

        let pass = 'nopass';
        try {
            const res = await fetch('https://yaire-591ca-default-rtdb.firebaseio.com/config/voicePassword.json');
            pass = await res.json();
        } catch(e) {}

        this.connectSocket(user.displayName, pass, user.photoURL, user.oracleHandle);
        this.acquireMedia();
    }

    initUI() {
        // Bind UI buttons
        document.getElementById('btn-mic').addEventListener('click', () => this.toggleMic());
        document.getElementById('btn-cam').addEventListener('click', () => this.toggleCam());
        document.getElementById('btn-leave').addEventListener('click', () => this.leaveRoom());

        document.getElementById('chat-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendChat();
        });

        document.getElementById('rave-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addRaveVideo();
        });
    }

    async acquireMedia() {
        try {
            if (this.stream) {
                this.stream.getTracks().forEach(t => t.stop());
            }
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true },
                video: this.cameraEnabled ? { facingMode: "user", width: { ideal: 640 }, height: { ideal: 360 } } : false
            });
            
            // Sync mic state
            this.stream.getAudioTracks().forEach(t => t.enabled = this.micEnabled);

            // Create/update my own video element
            this.updateVideoElement('local', this.stream, window.yaireCurrentUser);

            // If we are already connected, we need to renegotiate WebRTC with all peers
            for (const [peerId, pc] of this.peers.entries()) {
                const senders = pc.getSenders();
                this.stream.getTracks().forEach(track => {
                    const sender = senders.find(s => s.track && s.track.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        pc.addTrack(track, this.stream);
                        // Renegotiate
                        this.createOffer(peerId);
                    }
                });
            }
        } catch (e) {
            console.error("No se pudo acceder a los medios", e);
            if (this.cameraEnabled) {
                this.cameraEnabled = false;
                this.updateCamBtnUI();
                alert("No se pudo acceder a la cámara.");
                this.acquireMedia(); // fallback to audio only
            }
        }
    }

    updateVideoElement(id, stream, userObj) {
        const grid = document.getElementById('video-grid');
        let container = document.getElementById(`video-container-${id}`);
        
        if (!container) {
            container = document.createElement('div');
            container.id = `video-container-${id}`;
            container.className = 'video-container';
            container.innerHTML = `
                <video id="vid-${id}" autoplay playsinline ${id === 'local' ? 'muted' : ''}></video>
                <div class="avatar-fallback text-center">
                    <img src="${userObj?.photoURL || ''}" class="w-20 h-20 rounded-full mb-3 shadow-lg border-2 border-white/10" onerror="this.style.display='none'" />
                    <span class="font-bold text-sm tracking-wide text-white/80">${userObj?.displayName || 'Usuario'} ${id==='local'?'(Tú)':''}</span>
                </div>
                <div id="reactions-${id}" class="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-10"></div>
            `;
            grid.appendChild(container);
            this.updateGridLayout();

            if (window.gsap) {
                gsap.from(container, { scale: 0.8, opacity: 0, y: 20, duration: 0.6, ease: "back.out(1.5)" });
            }
        }

        const vid = container.querySelector('video');
        if (stream && stream.getVideoTracks().length > 0) {
            vid.srcObject = stream;
            container.classList.add('has-video');
        } else {
            container.classList.remove('has-video');
            if (stream) vid.srcObject = stream; // Keep audio
        }
    }

    removeVideoElement(id) {
        const container = document.getElementById(`video-container-${id}`);
        if (container) {
            container.remove();
            this.updateGridLayout();
        }
    }

    updateGridLayout() {
        const grid = document.getElementById('video-grid');
        const count = grid.children.length;
        grid.className = 'video-grid';
        if (count === 1) grid.classList.add('grid-1');
        else if (count === 2) grid.classList.add('grid-2');
        else if (count === 3) grid.classList.add('grid-3');
        else grid.classList.add('grid-4');
    }

    // --- SOCKET LOGIC ---
    connectSocket(name, pass, photoURL, oracleHandle) {
        this.socket = io('https://28e-production.up.railway.app', { transports: ['websocket'] });

        this.socket.on('connect', () => {
            this.socket.emit('join_channel', { password: pass, displayName: name, photoURL, oracleHandle });
        });

        this.socket.on('joined', ({ userId, existingUsers }) => {
            this.myId = userId;
            this.users = existingUsers;
            existingUsers.forEach(u => this.createOffer(u.id));
            this.socket.emit('music_sync_request');
            
            // Show toast
            this.showToast('Te has conectado a Oracle.');
            OracleAudio.play('connect');
        });

        this.socket.on('channel_users', ({ users }) => {
            this.users = users.filter(u => u.id !== this.myId);
        });

        this.socket.on('user_joined', ({ userId, displayName, photoURL, oracleHandle }) => {
            this.users.push({ id: userId, displayName, photoURL, oracleHandle });
            this.updateVideoElement(userId, null, { displayName, photoURL, oracleHandle });
            this.showToast(`${displayName} se ha unido.`);
            OracleAudio.play('join');
        });

        this.socket.on('user_left', ({ userId }) => {
            const u = this.users.find(x => x.id === userId);
            if (u) this.showToast(`${u.displayName} se ha ido.`);
            OracleAudio.play('left');
            this.closePeer(userId);
            this.removeVideoElement(userId);
        });

        // WebRTC Signaling
        this.socket.on('webrtc_offer', async ({ from, sdp }) => this.handleOffer(from, sdp));
        this.socket.on('webrtc_answer', async ({ from, sdp }) => {
            const pc = this.peers.get(from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                this.flushIce(from);
            }
        });
        this.socket.on('ice_candidate', async ({ from, candidate }) => {
            const pc = this.peers.get(from);
            if (pc && pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(()=>{});
            } else {
                if (!this.pendingIce.has(from)) this.pendingIce.set(from, []);
                this.pendingIce.get(from).push(candidate);
            }
        });

        // Reactions
        this.socket.on('reaction', ({ from, emoji }) => {
            this.showReaction(emoji, from);
            OracleAudio.play('reaction');
        });

        // Chat
        this.socket.on('chat_message', ({ from, name, text, ts }) => {
            if (from !== this.myId) {
                this.appendChatMsg(from, name, text, ts);
                OracleAudio.play('messageReceived');
            }
        });

        // Music/Rave Events
        this.socket.on('music_queue_update', ({ queue, state }) => {
            this.musicQueue = queue;
            this.musicState = state;
            this.updateRaveUI();
        });
        
        this.socket.on('music_play', ({ track, state }) => {
            this.musicState = state;
            this.playRaveTrack(track, 0);
        });
        
        this.socket.on('music_state_update', ({ state }) => {
            this.musicState = state;
            if (this.ytPlayer && this.isYtReady) {
                if (state.isPlaying) this.ytPlayer.playVideo();
                else this.ytPlayer.pauseVideo();
            }
        });

        this.socket.on('music_seek', ({ time }) => {
            if (this.ytPlayer && this.isYtReady) {
                this.ytPlayer.seekTo(time, true);
            }
        });

        this.socket.on('music_sync', ({ queue, state, currentTrack, currentTime }) => {
            this.musicQueue = queue;
            this.musicState = state;
            if (currentTrack && state.isPlaying) {
                this.playRaveTrack(currentTrack, currentTime || 0);
            } else if (currentTrack) {
                this.playRaveTrack(currentTrack, currentTime || 0, false);
            }
        });
    }

    // --- WEBRTC ---
    makePeer(peerId) {
        if (this.peers.has(peerId)) this.closePeer(peerId);

        const pc = new RTCPeerConnection(this.iceConfig);
        if (this.stream) {
            this.stream.getTracks().forEach(t => pc.addTrack(t, this.stream));
        }

        pc.onicecandidate = ({ candidate }) => {
            if (candidate) this.socket.emit('ice_candidate', { to: peerId, candidate });
        };

        pc.ontrack = (event) => {
            const stream = event.streams[0] || new MediaStream([event.track]);
            const userObj = this.users.find(u => u.id === peerId);
            this.updateVideoElement(peerId, stream, userObj);
        };

        this.peers.set(peerId, pc);
        return pc;
    }

    async createOffer(peerId) {
        const pc = this.makePeer(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.socket.emit('webrtc_offer', { to: peerId, sdp: pc.localDescription });
    }

    async handleOffer(fromId, sdp) {
        const pc = this.makePeer(fromId);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.socket.emit('webrtc_answer', { to: fromId, sdp: pc.localDescription });
        this.flushIce(fromId);
    }

    flushIce(peerId) {
        const pc = this.peers.get(peerId);
        const queue = this.pendingIce.get(peerId) || [];
        queue.forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(()=>{}));
        this.pendingIce.delete(peerId);
    }

    closePeer(peerId) {
        const pc = this.peers.get(peerId);
        if (pc) { pc.close(); this.peers.delete(peerId); }
    }

    // --- CONTROLS ---
    toggleMic() {
        this.micEnabled = !this.micEnabled;
        OracleAudio.play(this.micEnabled ? 'toggleOn' : 'toggleOff');
        if (this.stream) this.stream.getAudioTracks().forEach(t => t.enabled = this.micEnabled);
        
        const btn = document.getElementById('btn-mic');
        if (this.micEnabled) {
            btn.classList.replace('bg-red-500/20', 'bg-white/10');
            btn.classList.replace('text-red-500', 'text-white');
            btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
        } else {
            btn.classList.replace('bg-white/10', 'bg-red-500/20');
            btn.classList.replace('text-white', 'text-red-500');
            btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
        }
    }

    toggleCam() {
        this.cameraEnabled = !this.cameraEnabled;
        OracleAudio.play(this.cameraEnabled ? 'toggleOn' : 'toggleOff');
        this.updateCamBtnUI();
        this.acquireMedia(); // re-acquire media to add/remove video track
    }

    updateCamBtnUI() {
        const strike = document.getElementById('cam-strike');
        if (this.cameraEnabled) {
            strike.classList.replace('scale-100', 'scale-0');
        } else {
            strike.classList.replace('scale-0', 'scale-100');
        }
    }

    leaveRoom() {
        OracleAudio.play('transitionDown');
        if (this.socket) {
            this.socket.emit('leave_channel');
            this.socket.disconnect();
            this.socket = null;
        }
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
        this.peers.forEach(pc => pc.close());
        this.peers.clear();
        
        const grid = document.getElementById('video-grid');
        grid.innerHTML = '';
        if (this.ytPlayer && this.isYtReady) this.ytPlayer.stopVideo();
        
        document.body.classList.remove('mode-youtube');
        document.body.classList.add('mode-video');
        
        const lobbyOverlay = document.getElementById('lobby-overlay');
        if (lobbyOverlay) {
            lobbyOverlay.style.display = 'flex';
            setTimeout(() => lobbyOverlay.style.opacity = '1', 50);
        }
        
        // Clear chat
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) chatContainer.innerHTML = '<div class="text-center text-xs text-white/30 my-4">Bienvenido a Oracle. Tus mensajes están cifrados.</div>';
    }

    // --- CHAT ---
    sendChat() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;
        
        OracleAudio.play('messageSent');
        this.socket.emit('chat_message', { text });
        this.appendChatMsg(this.myId, window.yaireCurrentUser.displayName, text, Date.now());
        input.value = '';
    }

    appendChatMsg(from, name, text, ts) {
        const container = document.getElementById('chat-messages');
        const isMe = from === this.myId;
        const isSystem = from === 'system';
        
        const div = document.createElement('div');
        
        if (isSystem) {
            div.className = 'text-center text-[10px] text-amber-500/50 my-1 font-bold tracking-wider uppercase';
            div.textContent = text;
        } else {
            const userObj = isMe ? window.yaireCurrentUser : this.users.find(u => u.id === from);
            const avatarUrl = userObj?.photoURL || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgMThoLjAxIi8+PC9zdmc+';
            
            div.className = `flex gap-2 w-full ${isMe ? 'flex-row-reverse' : 'flex-row'}`;
            div.innerHTML = `
                <img src="${avatarUrl}" class="w-8 h-8 rounded-full border border-white/10 shrink-0 object-cover mt-1 shadow-md" onerror="this.style.display='none'" />
                <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]">
                    <span class="text-[9px] text-white/50 mb-1 px-1 font-bold tracking-wider uppercase">${name}</span>
                    <div class="px-3 py-2 text-xs shadow-lg backdrop-blur-md ${isMe ? 'bg-amber-500 text-black rounded-2xl rounded-tr-sm' : 'bg-white/10 text-white border border-white/5 rounded-2xl rounded-tl-sm'}">
                        ${text}
                    </div>
                </div>
            `;
        }
        
        container.appendChild(div);
        
        if (window.gsap && !isSystem) {
            gsap.from(div, { opacity: 0, y: 15, scale: 0.95, duration: 0.4, ease: "back.out(1.5)", transformOrigin: isMe ? "right bottom" : "left bottom" });
        }
        
        container.scrollTop = container.scrollHeight;
    }

    // --- SOCIAL FEATURES ---
    sendReaction(emoji) {
        if (!this.socket) return;
        this.socket.emit('reaction', { emoji });
        this.showReaction(emoji, 'local');
    }

    showReaction(emoji, fromId) {
        const anchorId = fromId === 'local' ? 'local' : fromId;
        const container = document.getElementById(`reactions-${anchorId}`);
        
        const el = document.createElement('div');
        el.className = 'floating-reaction';
        el.textContent = emoji;
        
        if (container) {
            el.style.left = `${Math.random() * 60 + 20}%`;
            el.style.bottom = '10px';
            container.appendChild(el);
            
            if (window.gsap) {
                gsap.to(el, {
                    y: -150 - Math.random() * 100,
                    x: (Math.random() - 0.5) * 50,
                    opacity: 0,
                    rotation: (Math.random() - 0.5) * 60,
                    duration: 1.5 + Math.random(),
                    ease: "power1.out",
                    onComplete: () => el.remove()
                });
            } else {
                setTimeout(() => el.remove(), 2000);
            }
        } else {
            el.style.left = `${Math.random() * 20 + 40}%`;
            el.style.bottom = '100px';
            document.body.appendChild(el);
            if (window.gsap) {
                gsap.to(el, { y: -200, opacity: 0, duration: 2, onComplete: () => el.remove() });
            } else {
                setTimeout(() => el.remove(), 2000);
            }
        }
    }

    showToast(msg) {
        const tContainer = document.getElementById('toast-container');
        if (!tContainer) return;
        
        const el = document.createElement('div');
        el.className = 'toast-msg';
        el.innerHTML = `<svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>${msg}</span>`;
        tContainer.appendChild(el);
        
        if (window.gsap) {
            gsap.fromTo(el, 
                { opacity: 0, y: -20, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
            );
            gsap.to(el, {
                opacity: 0, y: -20, scale: 0.9, duration: 0.4, delay: 3, ease: "power2.in",
                onComplete: () => el.remove()
            });
        } else {
            setTimeout(() => el.remove(), 3000);
        }
    }

    // --- YOUTUBE RAVE ---
    addRaveVideo() {
        const input = document.getElementById('rave-input');
        const url = input.value.trim();
        if (!url) return;
        
        // Let server determine if it's youtube or spotify
        const type = url.includes('spotify') ? 'spotify' : 'youtube';
        this.socket.emit('music_add', { url, type });
        input.value = '';
    }

    updateRaveUI() {
        const qContainer = document.getElementById('rave-queue');
        if (this.musicQueue.length === 0) {
            qContainer.innerHTML = '<div class="text-xs text-white/30 text-center py-8">La cola está vacía.</div>';
            document.body.classList.remove('mode-youtube');
            document.body.classList.add('mode-video');
            if (this.ytPlayer && this.isYtReady) this.ytPlayer.stopVideo();
            return;
        }

        qContainer.innerHTML = this.musicQueue.map((t, idx) => `
            <div class="p-3 bg-white/5 border border-white/5 rounded-xl flex gap-3 items-center group">
                <div class="text-xs font-bold ${idx === this.musicState.currentIndex ? 'text-amber-500' : 'text-white/50'}">${idx + 1}</div>
                <div class="flex-1 truncate text-xs text-white font-medium">${t.title || 'Video URL'}</div>
            </div>
        `).join('');
    }

    playRaveTrack(track, timeOffset = 0, autoPlay = true) {
        if (!track) return;
        
        // Enter Rave Mode
        document.body.classList.remove('mode-video');
        document.body.classList.add('mode-youtube');
        
        document.getElementById('yt-now-playing').textContent = track.title;

        // Parse YT ID
        let vidId = '';
        try {
            if (track.url.includes('v=')) vidId = track.url.split('v=')[1].split('&')[0];
            else if (track.url.includes('youtu.be/')) vidId = track.url.split('youtu.be/')[1].split('?')[0];
        } catch(e) {}

        if (!vidId) return;

        if (!this.ytPlayer) {
            this.ytPlayer = new YT.Player('yt-player-container', {
                videoId: vidId,
                playerVars: { autoplay: autoPlay ? 1 : 0, controls: 1, disablekb: 0, rel: 0 },
                events: {
                    onReady: (e) => {
                        this.isYtReady = true;
                        if (timeOffset > 0) e.target.seekTo(timeOffset, true);
                        if (autoPlay) e.target.playVideo();
                    },
                    onStateChange: (e) => this.onYtStateChange(e)
                }
            });
        } else if (this.isYtReady) {
            this.ytPlayer.loadVideoById({ videoId: vidId, startSeconds: timeOffset });
            if (!autoPlay) setTimeout(() => this.ytPlayer.pauseVideo(), 500);
        }
    }

    onYtStateChange(e) {
        // Only broadcast if user actively clicked (avoid infinite loops)
        // YT.PlayerState.PLAYING = 1, PAUSED = 2
        if (e.data === YT.PlayerState.PAUSED) {
            this.socket.emit('music_pause', { currentTime: this.ytPlayer.getCurrentTime() });
        } else if (e.data === YT.PlayerState.PLAYING) {
            // Check if we resumed
            if (!this.musicState.isPlaying) {
                 this.socket.emit('music_resume');
                 this.socket.emit('music_seek', { time: this.ytPlayer.getCurrentTime() });
            }
        }
    }
}

// Ensure YT API is loaded globally before init
window.onYouTubeIframeAPIReady = () => {
    console.log("YouTube API Ready");
};

// Called when Firebase Auth is ready
window.OracleSetup = () => {
    document.body.classList.add('mode-video');
    window.oracleRoom = new OracleRoom();
    
    // Fetch live room status via temporary socket
    const tempSocket = io('https://28e-production.up.railway.app', { transports: ['websocket'] });
    tempSocket.on('connect', () => {
        tempSocket.emit('get_room_status');
    });

    const fallbackEmptyRoom = () => {
        const statusEl = document.getElementById('lobby-room-status');
        if (statusEl) {
            statusEl.innerHTML = `
                <div class="flex flex-col items-center justify-center p-6 text-center bg-white/5 rounded-2xl border border-white/5">
                    <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                    <p class="text-sm font-bold text-white/50">Sala vacía</p>
                    <p class="text-xs text-zinc-500 mt-1">Nadie está transmitiendo ahora.</p>
                </div>
            `;
        }
        tempSocket.disconnect();
    };

    tempSocket.on('connect_error', fallbackEmptyRoom);
    setTimeout(() => { if (!tempSocket.connected) fallbackEmptyRoom(); }, 5000);
    
    tempSocket.on('room_status', ({ users, musicQueue }) => {
        const statusEl = document.getElementById('lobby-room-status');
        if (!statusEl) return;
        
        if (users.length === 0) {
            statusEl.innerHTML = `
                <div class="flex flex-col items-center justify-center p-6 text-center bg-white/5 rounded-2xl border border-white/5">
                    <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                    <p class="text-sm font-bold text-white/50">Sala vacía</p>
                    <p class="text-xs text-zinc-500 mt-1">Nadie está transmitiendo.</p>
                </div>
            `;
        } else {
            statusEl.innerHTML = `
                <div class="flex flex-col gap-3">
                    ${users.map((u, i) => `
                        <div class="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-default story-item opacity-0">
                            <div class="relative">
                                <div class="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-50"></div>
                                <img src="${u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}&background=random`}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}&background=random'" class="w-12 h-12 rounded-full border-2 border-green-500 object-cover relative z-10" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-bold text-white truncate">${u.displayName ? u.displayName : 'Usuario'}</p>
                                <p class="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5">${u.oracleHandle ? '@' + u.oracleHandle : 'Transmitiendo'}</p>
                            </div>
                        </div>
                    `).join('')}
                    
                    ${musicQueue && musicQueue.length > 0 ? `
                        <div class="mt-4 p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl border border-pink-500/20 flex flex-col gap-2 relative overflow-hidden group">
                            <div class="absolute inset-0 bg-pink-500/5 group-hover:bg-pink-500/10 transition-colors"></div>
                            <div class="flex items-center gap-2 relative z-10">
                                <div class="w-6 h-6 rounded-full bg-pink-500 text-black flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                                <span class="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Oracle Rave Activo</span>
                            </div>
                            <p class="text-xs text-white font-medium truncate relative z-10 pl-8">${musicQueue[0].title}</p>
                        </div>
                    ` : ''}
                </div>
            `;
            
            if (window.gsap) {
                gsap.fromTo(".story-item", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", clearProps: "all" });
            } else {
                document.querySelectorAll('.story-item').forEach(el => el.style.opacity = '1');
            }
        }
        
        // Disconnect temp socket to save resources
        tempSocket.disconnect();
    });
    
    // Bind the join button in the lobby
    const btnJoin = document.getElementById('btn-join-room');
    if (btnJoin) {
        btnJoin.addEventListener('click', () => {
            const lobbyOverlay = document.getElementById('lobby-overlay');
            if (lobbyOverlay) {
                lobbyOverlay.style.opacity = '0';
                setTimeout(() => lobbyOverlay.style.display = 'none', 500);
            }
            window.oracleRoom.init();
        });
    }
};

// Initialize UI audio listeners
document.addEventListener('DOMContentLoaded', () => {
    OracleAudio.initUIListeners();
});

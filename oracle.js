// 28E Oracle v3 — Immersive Voice & Video Room with Glassmorphism UI

// ═══ ORACLE AUDIO — Sound Manager ═══
class OracleAudio {
    static sounds = {
        hover: 'SND01_sine/tap_01.wav',
        click: 'SND01_sine/select.wav',
        connect: 'siriSounds18Separate/jbl_success_sae.wav',
        latency: 'siriSounds18Separate/jbl_latency_sae_v2.wav',
        join: 'sounds/activity_user_join.mp3',
        left: 'sounds/activity_user_left.mp3',
        toggleOn: 'SND01_sine/toggle_on.wav',
        toggleOff: 'SND01_sine/toggle_off.wav',
        messageReceived: 'sounds/nuevomensajeenelchatdevoz.wav',
        messageSent: 'SND01_sine/transition_up.wav',
        transitionDown: 'siriSounds18Separate/siri-begin-improved.wav',
        reaction: 'SND01_sine/tap_03.wav'
    };

    static typeSounds = [
        'SND01_sine/type_01.wav', 'SND01_sine/type_02.wav',
        'SND01_sine/type_03.wav', 'SND01_sine/type_04.wav',
        'SND01_sine/type_05.wav'
    ];

    static playTyping() {
        const rnd = this.typeSounds[Math.floor(Math.random() * this.typeSounds.length)];
        const audio = new Audio(rnd);
        audio.volume = 0.3;
        audio.play().catch(() => {});
    }

    static play(soundName, loop = false) {
        if (!this.sounds[soundName]) return;
        const audio = new Audio(this.sounds[soundName]);
        audio.loop = loop;
        audio.play().catch(() => {});
        return audio;
    }

    static initUIListeners() {
        document.querySelectorAll('button, a').forEach(el => {
            if (el.classList.contains('no-sound')) return;
            el.addEventListener('mouseenter', () => {
                OracleAudio.play(el.getAttribute('data-sound-hover') || 'hover');
            });
            el.addEventListener('mousedown', () => {
                OracleAudio.play(el.getAttribute('data-sound-click') || 'click');
            });
        });

        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') OracleAudio.playTyping();
            });
        }
    }
}

// ═══ ORACLE ROOM — Main Room Logic ═══
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

        // Room timer
        this.roomJoinedAt = null;
        this.roomTimerInterval = null;

        // Speaker detection
        this.audioContexts = new Map(); // peerId -> { ctx, analyser, source }
        this.speakingStates = new Map();
        this.localSpeakingDetector = null;

        // Typing indicator
        this._typingTimeout = null;
        this._isTyping = false;

        // Music progress
        this._musicProgressInterval = null;

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

    init() {
        const user = window.yaireCurrentUser;
        if (!user) return alert("Debes iniciar sesión.");

        if (this.latencyAudio) {
            this.latencyAudio.pause();
            this.latencyAudio = null;
        }
        this.latencyAudio = OracleAudio.play('latency', true);

        // Fetch password asynchronously while we establish connection
        const passPromise = fetch('https://yaire-591ca-default-rtdb.firebaseio.com/config/voicePassword.json')
            .then(res => res.json())
            .catch(() => 'nopass');

        this.connectSocket(user.displayName, passPromise, user.photoURL, user.oracleHandle);
        this.acquireMedia();
    }

    initUI() {
        document.getElementById('btn-mic').addEventListener('click', () => this.toggleMic());
        document.getElementById('btn-cam').addEventListener('click', () => this.toggleCam());
        document.getElementById('btn-leave').addEventListener('click', () => this.leaveRoom());

        document.getElementById('chat-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendChat();
        });

        // Music UI is bound dynamically in updateMusicUI()

        // Typing indicator for chat
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('input', () => this.handleTyping());
        }

        // Lobby camera controls
        const lobbyMic = document.getElementById('lobby-btn-mic');
        const lobbyCam = document.getElementById('lobby-btn-cam');
        if (lobbyMic) lobbyMic.addEventListener('click', () => {
            this.micEnabled = !this.micEnabled;
            OracleAudio.play(this.micEnabled ? 'toggleOn' : 'toggleOff');
            lobbyMic.classList.toggle('muted', !this.micEnabled);
            if (this._lobbyStream) {
                this._lobbyStream.getAudioTracks().forEach(t => t.enabled = this.micEnabled);
            }
        });
        if (lobbyCam) lobbyCam.addEventListener('click', () => {
            this.cameraEnabled = !this.cameraEnabled;
            OracleAudio.play(this.cameraEnabled ? 'toggleOn' : 'toggleOff');
            lobbyCam.classList.toggle('muted', !this.cameraEnabled);
            this.updateLobbyPreview();
        });
    }

    // ═══ LOBBY CAMERA PREVIEW ═══
    async updateLobbyPreview() {
        const video = document.getElementById('lobby-cam-video');
        const placeholder = document.getElementById('lobby-cam-placeholder');
        if (!video) return;

        if (this.cameraEnabled) {
            try {
                if (this._lobbyStream) {
                    this._lobbyStream.getTracks().forEach(t => t.stop());
                }
                this._lobbyStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 360 } },
                    audio: true
                });
                this._lobbyStream.getAudioTracks().forEach(t => t.enabled = this.micEnabled);
                video.srcObject = this._lobbyStream;
                video.classList.remove('hidden');
                if (placeholder) placeholder.classList.add('hidden');
            } catch (e) {
                console.error('Camera preview error:', e);
                this.cameraEnabled = false;
            }
        } else {
            if (this._lobbyStream) {
                this._lobbyStream.getVideoTracks().forEach(t => t.stop());
            }
            video.classList.add('hidden');
            if (placeholder) placeholder.classList.remove('hidden');
        }
    }

    stopLobbyPreview() {
        if (this._lobbyStream) {
            this._lobbyStream.getTracks().forEach(t => t.stop());
            this._lobbyStream = null;
        }
    }

    // ═══ MEDIA ACQUISITION ═══
    async acquireMedia() {
        try {
            if (this.stream) {
                this.stream.getTracks().forEach(t => t.stop());
            }
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true },
                video: this.cameraEnabled ? { facingMode: "user", width: { ideal: 640 }, height: { ideal: 360 } } : false
            });

            this.stream.getAudioTracks().forEach(t => t.enabled = this.micEnabled);
            this.updateVideoElement('local', this.stream, window.yaireCurrentUser);
            this.setupLocalSpeakingDetection(this.stream);

            for (const [peerId, pc] of this.peers.entries()) {
                const senders = pc.getSenders();
                this.stream.getTracks().forEach(track => {
                    const sender = senders.find(s => s.track && s.track.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        pc.addTrack(track, this.stream);
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
                this.acquireMedia();
            } else {
                this.micEnabled = false;
                this.updateMicBtnUI();
                this.updateVideoElement('local', null, window.yaireCurrentUser);
            }
        }
    }

    // ═══ SPEAKER DETECTION ═══
    setupLocalSpeakingDetection(stream) {
        try {
            if (this.localSpeakingDetector) {
                clearInterval(this.localSpeakingDetector._interval);
                this.localSpeakingDetector.ctx.close();
            }

            const ctx = new AudioContext();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.5;
            source.connect(analyser);

            const data = new Uint8Array(analyser.frequencyBinCount);
            let wasSpeaking = false;

            const interval = setInterval(() => {
                analyser.getByteFrequencyData(data);
                const avg = data.reduce((a, b) => a + b) / data.length;
                const isSpeaking = avg > 15 && this.micEnabled;

                if (isSpeaking !== wasSpeaking) {
                    wasSpeaking = isSpeaking;
                    this.setSpeakingState('local', isSpeaking);
                    if (this.socket) {
                        this.socket.emit('speaking_state', { speaking: isSpeaking });
                    }
                }
            }, 100);

            this.localSpeakingDetector = { ctx, analyser, source, _interval: interval };
        } catch (e) {
            console.error('Speaker detection error:', e);
        }
    }

    setupRemoteSpeakingDetection(peerId, stream) {
        try {
            if (this.audioContexts.has(peerId)) {
                const old = this.audioContexts.get(peerId);
                clearInterval(old._interval);
                old.ctx.close();
            }

            const ctx = new AudioContext();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.5;
            source.connect(analyser);

            const data = new Uint8Array(analyser.frequencyBinCount);
            let wasSpeaking = false;

            const interval = setInterval(() => {
                analyser.getByteFrequencyData(data);
                const avg = data.reduce((a, b) => a + b) / data.length;
                const isSpeaking = avg > 10;

                if (isSpeaking !== wasSpeaking) {
                    wasSpeaking = isSpeaking;
                    this.setSpeakingState(peerId, isSpeaking);
                }
            }, 100);

            this.audioContexts.set(peerId, { ctx, analyser, source, _interval: interval });
        } catch (e) {}
    }

    setSpeakingState(id, isSpeaking) {
        this.speakingStates.set(id, isSpeaking);
        const container = document.getElementById(`video-container-${id}`);
        if (container) {
            container.classList.toggle('speaking', isSpeaking);
        }
        // Update speak bars
        const bars = document.getElementById(`speak-bars-${id}`);
        if (bars) {
            bars.classList.toggle('active', isSpeaking);
        }
        // Update people list
        this.updatePeopleList();
    }

    // ═══ VIDEO ELEMENTS ═══
    updateVideoElement(id, stream, userObj) {
        const grid = document.getElementById('video-grid');
        let container = document.getElementById(`video-container-${id}`);

        if (!container) {
            container = document.createElement('div');
            container.id = `video-container-${id}`;
            container.className = 'video-container';
            const avatarUrl = userObj?.photoURL || '';
            const displayName = userObj?.displayName || 'Usuario';
            const handle = userObj?.oracleHandle ? `@${userObj.oracleHandle}` : '';
            const isLocal = id === 'local';

            container.innerHTML = `
                <video id="vid-${id}" autoplay playsinline ${isLocal ? 'muted' : ''} style="${isLocal ? 'transform:scaleX(-1);' : ''}"></video>
                <div class="avatar-fallback">
                    <div class="w-20 h-20 rounded-full glass-light flex items-center justify-center overflow-hidden shadow-xl">
                        <img src="${avatarUrl}" class="w-full h-full object-cover" onerror="this.style.display='none'" />
                    </div>
                </div>
                <div class="video-overlay-info">
                    <div class="flex items-center gap-2">
                        <div id="speak-bars-${id}" class="speak-bars">
                            <div class="bar" style="height:3px;"></div>
                            <div class="bar" style="height:5px;"></div>
                            <div class="bar" style="height:3px;"></div>
                            <div class="bar" style="height:7px;"></div>
                        </div>
                        <span class="text-xs font-bold text-white/90 drop-shadow-lg">${displayName}${isLocal ? ' (Tú)' : ''}</span>
                        ${handle ? `<span class="text-[10px] text-amber-500/50 font-bold">${handle}</span>` : ''}
                    </div>
                    <div id="mic-status-${id}" class="w-6 h-6 rounded-full flex items-center justify-center" style="background:rgba(0,0,0,0.4);backdrop-filter:blur(10px);">
                        <svg class="w-3 h-3 text-white/70" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                    </div>
                </div>
                <div id="reactions-${id}" class="absolute inset-0 pointer-events-none overflow-hidden rounded-[1.25rem] z-10"></div>
            `;
            grid.appendChild(container);
            this.updateGridLayout();

            if (window.gsap) {
                gsap.from(container, { scale: 0.85, opacity: 0, y: 20, duration: 0.6, ease: "back.out(1.5)" });
            }
        }

        const vid = container.querySelector('video');
        let shouldShowVideo = false;

        if (stream && stream.getVideoTracks().length > 0) {
            vid.srcObject = stream;
            shouldShowVideo = true;
        }

        const isLocal = id === 'local';
        if (isLocal) {
            shouldShowVideo = this.cameraEnabled;
        } else if (userObj && userObj.camEnabled !== undefined) {
            shouldShowVideo = userObj.camEnabled;
        }

        if (shouldShowVideo) {
            container.classList.add('has-video');
        } else {
            container.classList.remove('has-video');
            if (stream && !vid.srcObject) vid.srcObject = stream;
        }
    }

    removeVideoElement(id) {
        const container = document.getElementById(`video-container-${id}`);
        if (container) {
            if (window.gsap) {
                gsap.to(container, {
                    scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in",
                    onComplete: () => { container.remove(); this.updateGridLayout(); }
                });
            } else {
                container.remove();
                this.updateGridLayout();
            }
        }
        // Clean up audio context
        if (this.audioContexts.has(id)) {
            const ac = this.audioContexts.get(id);
            clearInterval(ac._interval);
            ac.ctx.close();
            this.audioContexts.delete(id);
        }
        this.speakingStates.delete(id);
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

    // ═══ SOCKET LOGIC ═══
    connectSocket(name, passPromise, photoURL, oracleHandle) {
        this.socket = io('https://28e-production.up.railway.app', { transports: ['websocket'] });

        this.socket.on('connect', async () => {
            const pass = await Promise.resolve(passPromise);
            this.socket.emit('join_channel', { password: pass, displayName: name, photoURL, oracleHandle });
            this.socket.emit('mute_state', { muted: !this.micEnabled });
            this.socket.emit('cam_state', { camEnabled: this.cameraEnabled });
        });

        this.socket.on('joined', ({ userId, existingUsers }) => {
            if (this.latencyAudio) {
                this.latencyAudio.pause();
                this.latencyAudio.currentTime = 0;
                this.latencyAudio = null;
            }

            this.myId = userId;
            this.users = existingUsers;
            existingUsers.forEach(u => {
                this.createOffer(u.id);
                this.updateVideoElement(u.id, null, u);
                const container = document.getElementById(`video-container-${u.id}`);
                if (container) {
                    if (u.camEnabled) container.classList.add('has-video');
                    else container.classList.remove('has-video');
                }
            });
            this.socket.emit('music_sync_request');

            this.showToast('Conectado a Oracle');
            OracleAudio.play('connect');

            // Start room timer
            this.startRoomTimer();

            // Update sidebar user count
            this.updateUserCount();
            this.updatePeopleList();
        });

        this.socket.on('channel_users', ({ users }) => {
            this.users = users.filter(u => u.id !== this.myId);
            this.updateUserCount();
            this.updatePeopleList();
        });

        this.socket.on('user_joined', ({ userId, displayName, photoURL, oracleHandle, camEnabled }) => {
            this.users.push({ id: userId, displayName, photoURL, oracleHandle, camEnabled });
            this.updateVideoElement(userId, null, { displayName, photoURL, oracleHandle });
            const container = document.getElementById(`video-container-${userId}`);
            if (container) {
                if (camEnabled) container.classList.add('has-video');
                else container.classList.remove('has-video');
            }
            this.showToast(`${displayName} se unió`);
            OracleAudio.play('join');
            this.updateUserCount();
            this.updatePeopleList();
        });

        this.socket.on('user_left', ({ userId }) => {
            const u = this.users.find(x => x.id === userId);
            if (u) this.showToast(`${u.displayName} se fue`);
            OracleAudio.play('left');
            this.closePeer(userId);
            this.removeVideoElement(userId);
            this.users = this.users.filter(x => x.id !== userId);
            this.updateUserCount();
            this.updatePeopleList();
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
                await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
            } else {
                if (!this.pendingIce.has(from)) this.pendingIce.set(from, []);
                this.pendingIce.get(from).push(candidate);
            }
        });

        // Speaking state from server
        this.socket.on('speaking_state', ({ from, speaking }) => {
            this.setSpeakingState(from, speaking);
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

        // Typing
        this.socket.on('chat_typing', ({ from, name, isTyping }) => {
            const indicator = document.getElementById('typing-indicator');
            const typingName = document.getElementById('typing-name');
            if (indicator && typingName) {
                if (isTyping) {
                    typingName.textContent = name;
                    indicator.classList.remove('hidden');
                } else {
                    indicator.classList.add('hidden');
                }
            }
        });

        // Mute state
        this.socket.on('user_mute_state', ({ userId, muted }) => {
            const micStatus = document.getElementById(`mic-status-${userId}`);
            if (micStatus) {
                if (muted) {
                    micStatus.innerHTML = '<svg class="w-3 h-3 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/></svg>';
                } else {
                    micStatus.innerHTML = '<svg class="w-3 h-3 text-white/70" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>';
                }
            }
            // Update people list
            const user = this.users.find(u => u.id === userId);
            if (user) user.muted = muted;
            this.updatePeopleList();
        });

        // Cam state
        this.socket.on('user_cam_state', ({ userId, camEnabled }) => {
            const container = document.getElementById(`video-container-${userId}`);
            if (container) {
                if (camEnabled) {
                    container.classList.add('has-video');
                } else {
                    container.classList.remove('has-video');
                }
            }
            const user = this.users.find(u => u.id === userId);
            if (user) user.camEnabled = camEnabled;
        });

        // Music Events
        this.socket.on('music_queue_update', ({ queue, state }) => {
            this.musicQueue = queue;
            this.musicState = state;
            this.updateMusicUI();
        });

        this.socket.on('music_play', ({ track, state }) => {
            this.musicState = state;
            this.playMusicTrack(track, 0);
        });

        this.socket.on('music_state_update', ({ state }) => {
            this.musicState = state;
            if (this.ytPlayer && this.isYtReady) {
                if (state.isPlaying) this.ytPlayer.playVideo();
                else this.ytPlayer.pauseVideo();
            }
            this.updateMusicUI();
        });

        this.socket.on('music_seek', ({ time }) => {
            if (this.ytPlayer && this.isYtReady) {
                this.ytPlayer.seekTo(time, true);
            }
        });

        this.socket.on('music_stop', () => {
            this.musicQueue = [];
            this.musicState = { currentIndex: -1, isPlaying: false };
            this.stopMusic();
        });

        this.socket.on('music_sync', ({ queue, state, currentTrack, currentTime }) => {
            this.musicQueue = queue;
            this.musicState = state;
            if (currentTrack && state.isPlaying) {
                this.playMusicTrack(currentTrack, currentTime || 0);
            } else if (currentTrack) {
                this.playMusicTrack(currentTrack, currentTime || 0, false);
            } else {
                this.updateMusicUI();
            }
        });
    }

    // ═══ WEBRTC ═══
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
            this.setupRemoteSpeakingDetection(peerId, stream);
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
        queue.forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {}));
        this.pendingIce.delete(peerId);
    }

    closePeer(peerId) {
        const pc = this.peers.get(peerId);
        if (pc) { pc.close(); this.peers.delete(peerId); }
    }

    // ═══ CONTROLS ═══
    toggleMic() {
        this.micEnabled = !this.micEnabled;
        OracleAudio.play(this.micEnabled ? 'toggleOn' : 'toggleOff');
        if (this.stream) this.stream.getAudioTracks().forEach(t => t.enabled = this.micEnabled);

        // Emit mute state to server
        if (this.socket) this.socket.emit('mute_state', { muted: !this.micEnabled });

        const btn = document.getElementById('btn-mic');
        if (this.micEnabled) {
            btn.classList.remove('muted');
            btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
        } else {
            btn.classList.add('muted');
            btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
        }

        // Update local mic status icon
        const localMic = document.getElementById('mic-status-local');
        if (localMic) {
            if (!this.micEnabled) {
                localMic.innerHTML = '<svg class="w-3 h-3 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/></svg>';
            } else {
                localMic.innerHTML = '<svg class="w-3 h-3 text-white/70" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>';
            }
        }
    }

    toggleCam() {
        this.cameraEnabled = !this.cameraEnabled;
        OracleAudio.play(this.cameraEnabled ? 'toggleOn' : 'toggleOff');
        if (this.socket) this.socket.emit('cam_state', { camEnabled: this.cameraEnabled });
        this.updateCamBtnUI();
        this.acquireMedia();
    }

    updateCamBtnUI() {
        const strike = document.getElementById('cam-strike');
        if (this.cameraEnabled) {
            strike.classList.replace('scale-100', 'scale-0');
        } else {
            strike.classList.replace('scale-0', 'scale-100');
        }
    }


    // ═══ ROOM TIMER ═══
    startRoomTimer() {
        this.roomJoinedAt = Date.now();
        const timerEl = document.getElementById('room-timer');
        if (!timerEl) return;

        if (this.roomTimerInterval) clearInterval(this.roomTimerInterval);
        this.roomTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.roomJoinedAt) / 1000);
            const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const secs = (elapsed % 60).toString().padStart(2, '0');
            timerEl.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    stopRoomTimer() {
        if (this.roomTimerInterval) {
            clearInterval(this.roomTimerInterval);
            this.roomTimerInterval = null;
        }
        const timerEl = document.getElementById('room-timer');
        if (timerEl) timerEl.textContent = '00:00';
    }

    // ═══ TYPING INDICATOR ═══
    handleTyping() {
        if (!this.socket) return;
        if (!this._isTyping) {
            this._isTyping = true;
            this.socket.emit('chat_typing', { isTyping: true });
        }
        clearTimeout(this._typingTimeout);
        this._typingTimeout = setTimeout(() => {
            this._isTyping = false;
            this.socket.emit('chat_typing', { isTyping: false });
        }, 2000);
    }

    // ═══ LEAVE ROOM ═══
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
        // Clean up speaker detection
        if (this.localSpeakingDetector) {
            clearInterval(this.localSpeakingDetector._interval);
            this.localSpeakingDetector.ctx.close();
            this.localSpeakingDetector = null;
        }
        for (const [id, ac] of this.audioContexts.entries()) {
            clearInterval(ac._interval);
            ac.ctx.close();
        }
        this.audioContexts.clear();
        this.speakingStates.clear();

        this.peers.forEach(pc => pc.close());
        this.peers.clear();

        const grid = document.getElementById('video-grid');
        grid.innerHTML = '';
        if (this.ytPlayer && this.isYtReady) this.ytPlayer.stopVideo();

        document.body.classList.remove('mode-youtube');
        document.body.classList.add('mode-video');

        this.stopRoomTimer();
        this.stopMusicProgress();

        const lobbyOverlay = document.getElementById('lobby-overlay');
        if (lobbyOverlay) {
            lobbyOverlay.style.display = 'flex';
            setTimeout(() => lobbyOverlay.style.opacity = '1', 50);
        }

        // Clear chat
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            chatContainer.innerHTML = '<div class="text-center text-[10px] text-white/20 my-4 glass-card rounded-xl p-3 mx-auto w-fit font-medium">Bienvenido a Oracle. Tus mensajes están cifrados de extremo a extremo.</div>';
        }

        // Reset people list
        const peopleList = document.getElementById('people-list');
        if (peopleList) peopleList.innerHTML = '<div class="text-xs text-white/20 text-center py-8">Nadie conectado aún.</div>';
    }

    // ═══ USER COUNT & PEOPLE LIST ═══
    updateUserCount() {
        const el = document.getElementById('sidebar-user-count');
        if (el) el.textContent = this.users.length + 1; // +1 for self
    }

    updatePeopleList() {
        const list = document.getElementById('people-list');
        if (!list) return;

        const me = window.yaireCurrentUser;
        const allUsers = [
            {
                id: 'local',
                displayName: me?.displayName || 'Tú',
                photoURL: me?.photoURL || '',
                oracleHandle: me?.oracleHandle,
                muted: !this.micEnabled,
                isMe: true
            },
            ...this.users.map(u => ({ ...u, isMe: false }))
        ];

        if (allUsers.length === 0) {
            list.innerHTML = '<div class="text-xs text-white/20 text-center py-8">Nadie conectado aún.</div>';
            return;
        }

        list.innerHTML = allUsers.map(u => {
            const isSpeaking = this.speakingStates.get(u.id) || false;
            const avatarUrl = u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}&background=random`;
            return `
                <div class="person-card">
                    <div class="relative shrink-0">
                        <img src="${avatarUrl}" class="w-9 h-9 rounded-full object-cover border ${isSpeaking ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'border-white/5'} transition-all" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}&background=random'" />
                        ${isSpeaking ? '<div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0a0a0f]"></div>' : ''}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-white truncate">${u.displayName}${u.isMe ? ' (Tú)' : ''}</p>
                        ${u.oracleHandle ? `<p class="text-[10px] text-amber-500/50 font-bold">@${u.oracleHandle}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-1.5">
                        ${u.muted ? '<div class="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center"><svg class="w-3 h-3 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/></svg></div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ═══ CHAT ═══
    sendChat() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;

        OracleAudio.play('messageSent');
        this.socket.emit('chat_message', { text });
        this.appendChatMsg(this.myId, window.yaireCurrentUser.displayName, text, Date.now());
        input.value = '';

        // Stop typing
        if (this._isTyping) {
            this._isTyping = false;
            this.socket.emit('chat_typing', { isTyping: false });
        }
    }

    appendChatMsg(from, name, text, ts) {
        const container = document.getElementById('chat-messages');
        const isMe = from === this.myId;
        const isSystem = from === 'system';

        const div = document.createElement('div');

        if (isSystem) {
            div.className = 'text-center text-[10px] text-amber-500/40 my-1 font-bold tracking-wider uppercase';
            div.textContent = text;
            container.appendChild(div);
        } else {
            const time = ts ? new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '';
            const escText = this.escapeHTML(text);
            const isEmojiOnly = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\s)+$/u.test(text) && text.trim().length > 0;
            
            const bubbleClass = isEmojiOnly 
              ? 'text-4xl py-1' 
              : (isMe ? 'bg-[#101014] text-white rounded-2xl px-3.5 py-2 text-sm shadow-md font-medium border border-white/10' : 'bg-white text-black rounded-2xl px-3.5 py-2 text-sm shadow-md font-medium');

            const lastMsgEl = container.lastElementChild;
            const lastFrom = lastMsgEl ? lastMsgEl.getAttribute('data-from') : null;
            let newBubbleEl;

            if (lastFrom === from) {
                // Group message
                const bubblesContainer = lastMsgEl.querySelector('.chat-bubbles');
                if (bubblesContainer) {
                    bubblesContainer.insertAdjacentHTML('beforeend', `<div class="${bubbleClass}">${escText}</div>`);
                    newBubbleEl = bubblesContainer.lastElementChild;
                }
            } else {
                // New message group
                const userObj = isMe ? window.yaireCurrentUser : this.users.find(u => u.id === from);
                const avatarUrl = userObj?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

                div.className = `flex gap-2.5 w-full ${isMe ? 'flex-row-reverse' : 'flex-row'} mb-3 chat-msg`;
                div.setAttribute('data-from', from);
                div.innerHTML = `
                    <img src="${avatarUrl}" class="w-7 h-7 rounded-full border border-white/5 shrink-0 object-cover mt-1 shadow-md" onerror="this.style.display='none'" />
                    <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]">
                        <div class="flex items-center gap-2 mb-1 px-1">
                            <span class="text-[9px] text-white/40 font-bold tracking-wider uppercase">${name}</span>
                            <span class="text-[8px] text-white/15 font-mono">${time}</span>
                        </div>
                        <div class="flex flex-col gap-1 w-full ${isMe ? 'items-end' : 'items-start'} chat-bubbles">
                            <div class="${bubbleClass}">${escText}</div>
                        </div>
                    </div>
                `;
                container.appendChild(div);
                newBubbleEl = div.querySelector('.chat-bubbles').lastElementChild;
            }

            if (window.gsap && newBubbleEl && !isSystem) {
                gsap.from(newBubbleEl, {
                    opacity: 0, y: 12, scale: 0.95, duration: 0.35,
                    ease: "back.out(1.5)",
                    transformOrigin: isMe ? "right bottom" : "left bottom"
                });
            }
        }

        container.scrollTop = container.scrollHeight;
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ═══ REACTIONS ═══
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
                    x: (Math.random() - 0.5) * 60,
                    opacity: 0, rotation: (Math.random() - 0.5) * 60,
                    duration: 1.5 + Math.random(), ease: "power1.out",
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

    // ═══ TOASTS ═══
    showToast(msg) {
        const tContainer = document.getElementById('toast-container');
        if (!tContainer) return;

        const el = document.createElement('div');
        el.className = 'toast-msg';
        el.innerHTML = `<svg class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>${msg}</span>`;
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
            setTimeout(() => el.remove(), 3500);
        }
    }

    // ═══ MUSIC LISTENER ═══
    escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    }

    cleanMusicTitle(t) {
        if (!t) return t;
        let c = t.replace(/\s*[\[\(](official.*|video oficial|audio oficial|audio|video|music video|lyric.*|visualizer|hd)[\]\)]/gi, '');
        c = c.replace(/\s*[\[\(]?(Spotify|YouTube)[\]\)]?/gi, '');
        c = c.replace(/\s*[-|]\s*$/g, '');
        return c.trim();
    }

    renderMusicPanel() {
        const track = this.musicQueue[this.musicState.currentIndex];
        const isPlaying = this.musicState.isPlaying;
        let nowPlaying = '';
        if (track) {
            let currentPct = 0;
            let cTimeFmt = '0:00';
            let tTimeFmt = '0:00';
            
            if (track.type === 'youtube' && this.ytPlayer && this.isYtReady) {
                const cur = this.ytPlayer.getCurrentTime() || 0;
                const tot = this.ytPlayer.getDuration() || 0;
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
                : `<span class="w-4 h-4 text-white/40 [&>svg]:w-4 [&>svg]:h-4 flex items-center justify-center"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></span>`;
            
            nowPlaying = `
                <div class="bg-white/5 border border-white/10 rounded-xl p-3 mb-2 relative overflow-hidden">
                    <div class="flex items-center gap-3 relative z-10 mb-2">
                        <div class="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center flex-shrink-0">
                            ${eqBars}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-[9px] text-amber-500 font-bold uppercase tracking-wider mb-0.5">Reproduciendo</div>
                            ${this.cleanMusicTitle(track.title).length > 25 
                                ? `<div class="vc-marquee-container text-sm font-bold text-white">
                                     <div class="vc-marquee-content">${this.escapeHTML(this.cleanMusicTitle(track.title))}</div>
                                     <div class="vc-marquee-content" aria-hidden="true">${this.escapeHTML(this.cleanMusicTitle(track.title))}</div>
                                   </div>` 
                                : `<div class="text-sm font-bold text-white truncate">${this.escapeHTML(this.cleanMusicTitle(track.title))}</div>`
                            }
                            <div class="text-[10px] text-white/40 truncate">${track.addedByName ? `por ${track.addedByName}` : ''}</div>
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
                                ${isPlaying ? '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' : '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'}
                            </button>
                            <button class="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors [&>svg]:w-4 [&>svg]:h-4" id="vc-music-skip">
                                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                            </button>
                        </div>
                        <div class="w-[45%] flex items-center gap-2 pr-1">
                            <span class="text-white/40 [&>svg]:w-3.5 [&>svg]:h-3.5"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25-2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg></span>
                            <input type="range" id="vc-music-vol-slider" min="0" max="100" value="${this.musicVolume || 50}" class="w-full h-1 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                        </div>
                    </div>
                </div>`;
        } else {
            nowPlaying = `<div class="text-center text-white/20 text-xs py-3 mb-2 bg-white/5 rounded-xl border border-white/5">No hay pista activa</div>`;
        }
        
        const queueItems = this.musicQueue.length > 0
            ? this.musicQueue.map((t, i) => {
                    const isCur = i === this.musicState.currentIndex;
                    return `
                    <div class="flex items-center gap-3 p-2 rounded-lg transition-colors ${isCur ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/5'}">
                        <span class="w-4 text-center text-[10px] font-bold ${isCur ? 'text-amber-500' : 'text-white/30'}">${isCur && isPlaying ? '♪' : (i + 1)}</span>
                        <div class="flex-1 min-w-0">
                            <div class="text-xs font-medium text-white truncate ${isCur ? 'text-amber-500' : ''}">${this.escapeHTML(this.cleanMusicTitle(t.title))}</div>
                            <div class="text-[10px] text-white/30 truncate">${t.addedByName || ''}</div>
                        </div>
                        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/30">${(t.source || t.type) === 'youtube' ? 'YT' : 'SP'}</span>
                        ${!isCur ? `<button class="vc-music-track-rm w-6 h-6 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors [&>svg]:w-3 [&>svg]:h-3" data-track-id="${t.id}"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>` : ''}
                    </div>`;
                }).join('')
            : `<div class="text-center text-white/20 text-xs py-4">Cola vacía</div>`;
            
        return `
            <div class="p-3 flex-1 flex flex-col">
                ${nowPlaying}
                <div class="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1 px-1">Cola ${this.musicQueue.length > 0 ? `(${this.musicQueue.length})` : ''}</div>
                <div class="flex flex-col gap-1 mb-2" id="vc-music-queue">${queueItems}</div>
                <div class="mt-auto pt-2">
                    <div class="text-red-500 text-xs text-center mb-1 min-h-[16px]" id="vc-music-err"></div>
                    <div class="flex gap-2">
                        <input class="flex-1 glass-input rounded-xl px-3 py-2.5 text-white text-xs outline-none transition-colors" id="vc-music-url" type="text" placeholder="YouTube o Spotify URL..." autocomplete="off"/>
                        <button class="bg-gradient-to-br from-amber-500 to-orange-600 text-black px-4 font-bold text-xs rounded-xl hover:from-amber-400 hover:to-orange-500 transition-colors whitespace-nowrap" id="vc-music-add">+ Añadir</button>
                    </div>
                </div>
            </div>`;
    }

    updateMusicUI() {
        const body = document.getElementById('music-inner');
        if (body) {
            body.innerHTML = this.renderMusicPanel();
            this.bindMusicEvents();
            const track = this.musicQueue[this.musicState.currentIndex];
            if (track && track.type === 'spotify') {
                this.createSpotifyEmbed(track);
            }
            if (this.musicState.isPlaying && track && track.type === 'youtube') {
                this.startMusicProgress();
            }
        }
    }

    bindMusicEvents() {
        const playPause = document.getElementById('vc-music-playpause');
        if (playPause) playPause.addEventListener('click', () => this.musicTogglePlayPause());
        const skip = document.getElementById('vc-music-skip');
        if (skip) skip.addEventListener('click', () => { if (this.socket) this.socket.emit('music_skip'); });
        const addBtn = document.getElementById('vc-music-add');
        const urlInput = document.getElementById('vc-music-url');
        if (addBtn) addBtn.addEventListener('click', () => this.addMusicFromInput());
        if (urlInput) urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.addMusicFromInput(); });
        document.querySelectorAll('.vc-music-track-rm').forEach(btn => {
            btn.addEventListener('click', () => {
                const trackId = btn.dataset.trackId;
                if (trackId && this.socket) this.socket.emit('music_remove', { trackId });
            });
        });
        const volSlider = document.getElementById('vc-music-vol-slider');
        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                this.setMusicVolume(e.target.value);
            });
        }
    }

    async addMusicFromInput() {
        const input = document.getElementById('vc-music-url');
        const addBtn = document.getElementById('vc-music-add');
        if (!input || !addBtn) return;
        const url = input.value.trim();
        if (!url) return;
        const parsed = this.parseMusicUrl(url);
        if (!parsed) {
            const err = document.getElementById('vc-music-err');
            if (err) { err.textContent = 'URL inválida.'; setTimeout(() => { err.textContent = ''; }, 3000); }
            return;
        }
        
        const originalText = addBtn.innerHTML;
        addBtn.innerHTML = `<div class="w-3 h-3 rounded-full border-[2px] border-black border-t-transparent animate-spin inline-block align-middle"></div>`;
        addBtn.disabled = true;
        input.disabled = true;
        
        let title = parsed.type === 'youtube' ? 'YouTube Video' : 'Spotify Track';
        try { title = await this.fetchMusicTitle(parsed.url, parsed.type); } catch(e) {}
        
        input.value = '';
        input.disabled = false;
        addBtn.disabled = false;
        addBtn.innerHTML = originalText;
        if (this.socket) {
            this.socket.emit('music_add', { url: parsed.url, title, type: parsed.type });
        }
    }

    parseMusicUrl(url) {
        const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
        const ytMatch = url.match(ytRegex);
        if (ytMatch) return { type: 'youtube', id: ytMatch[1], url: `https://www.youtube.com/watch?v=${ytMatch[1]}` };
        const spRegex = /open\.spotify\.com\/.*?(track|album|playlist)\/([a-zA-Z0-9]+)/;
        const spMatch = url.match(spRegex);
        if (spMatch) return { type: 'spotify', spotifyType: spMatch[1], id: spMatch[2], url: `https://open.spotify.com/${spMatch[1]}/${spMatch[2]}` };
        return null;
    }

    async fetchMusicTitle(url, type) {
        try {
            if (type === 'youtube') {
                const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
                const data = await res.json();
                return this.cleanMusicTitle(data.title) || 'YouTube Video';
            } else if (type === 'spotify') {
                const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
                const data = await res.json();
                const artist = data.author_name || '';
                const title = this.cleanMusicTitle(data.title) || 'Spotify Track';
                return artist ? `${title} - ${artist}` : title;
            }
        } catch(e) { return type === 'youtube' ? 'YouTube Video' : 'Spotify Track'; }
    }

    musicTogglePlayPause() {
        const track = this.musicQueue[this.musicState.currentIndex];
        if (!track || !this.socket) return;
        if (this.musicState.isPlaying) {
            let currentTime = 0;
            if (this.ytPlayer && this.isYtReady) currentTime = this.ytPlayer.getCurrentTime();
            this.socket.emit('music_pause', { currentTime });
        } else {
            this.socket.emit('music_resume');
        }
    }

    playMusicTrack(track, timeOffset = 0, autoPlay = true) {
        this.updateMusicUI();
        if (track.type === 'youtube') {
            const ytId = this.parseMusicUrl(track.url)?.id;
            if (ytId) {
                this.createYTPlayer(ytId, timeOffset, autoPlay);
            }
        } else {
            this.destroyYTPlayer();
        }
    }

    stopMusic() {
        this.destroyYTPlayer();
        this.stopMusicProgress();
        this.updateMusicUI();
    }

    setMusicVolume(vol) {
        const v = Number(vol);
        this.musicVolume = v;
        if (this.ytPlayer && this.isYtReady) {
            this.ytPlayer.setVolume(v);
            if (v > 0 && this.ytPlayer.isMuted()) {
                this.ytPlayer.unMute();
            }
        }
    }

    createSpotifyEmbed(track) {
        const embedContainer = document.getElementById('vc-spotify-embed');
        if (!embedContainer) return;
        const spMatch = track.url.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
        if (!spMatch) return;
        const embedUrl = `https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}?utm_source=generator&theme=0`;
        const h = spMatch[1] === 'track' ? '80' : '152';
        embedContainer.innerHTML = `<iframe src="${embedUrl}" width="100%" height="${h}" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:8px;"></iframe>`;
    }

    createYTPlayer(videoId, seekTo = 0, autoPlay = true) {
        if (!window.YT || !window.YT.Player) return;
        
        if (this.ytPlayer) { 
            try { this.ytPlayer.destroy(); } catch(e) {} 
            this.ytPlayer = null; 
            this.isYtReady = false;
        }
        
        let container = document.getElementById('oracle-yt-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'oracle-yt-container';
            container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;';
            document.body.appendChild(container);
        }
        
        const playerDiv = document.createElement('div');
        playerDiv.id = 'oracle-yt-player-' + Date.now();
        container.innerHTML = '';
        container.appendChild(playerDiv);
        
        this.ytPlayer = new YT.Player(playerDiv.id, {
            height: '1', width: '1', videoId,
            playerVars: { autoplay: autoPlay ? 1 : 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, start: Math.floor(seekTo) },
            events: {
                onReady: (e) => {
                    this.isYtReady = true;
                    e.target.setVolume(this.musicVolume || 50);
                    if (seekTo > 0) e.target.seekTo(seekTo, true);
                    if (autoPlay) e.target.playVideo();
                    this.startMusicProgress();
                },
                onStateChange: (e) => this.onYtStateChange(e),
                onError: () => this.socket.emit('music_ended')
            }
        });
    }

    destroyYTPlayer() {
        if (this.ytPlayer) { 
            try { this.ytPlayer.destroy(); } catch(e) {} 
            this.ytPlayer = null; 
            this.isYtReady = false;
        }
    }

    startMusicProgress() {
        this.stopMusicProgress();
        this._musicProgressInterval = setInterval(() => {
            if (!this.musicState.isPlaying || !this.ytPlayer || !this.isYtReady) return;
            const current = this.ytPlayer.getCurrentTime();
            const duration = this.ytPlayer.getDuration();
            const fill = document.getElementById('vc-music-progress-fill');
            const timeCurrent = document.getElementById('vc-music-time-current');
            const timeTotal = document.getElementById('vc-music-time-total');
            if (fill && duration > 0) fill.style.width = ((current / duration) * 100) + '%';
            const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
            if (timeCurrent) timeCurrent.textContent = fmt(current);
            if (timeTotal) timeTotal.textContent = fmt(duration);
        }, 500);
    }

    stopMusicProgress() {
        if (this._musicProgressInterval) { 
            clearInterval(this._musicProgressInterval); 
            this._musicProgressInterval = null; 
        }
    }

    onYtStateChange(e) {
        if (e.data === YT.PlayerState.PAUSED) {
            this.socket.emit('music_pause', { currentTime: this.ytPlayer.getCurrentTime() });
        } else if (e.data === YT.PlayerState.PLAYING) {
            if (!this.musicState.isPlaying) {
                this.socket.emit('music_resume');
                this.socket.emit('music_seek', { time: this.ytPlayer.getCurrentTime() });
            }
            this.startMusicProgress();
        } else if (e.data === YT.PlayerState.ENDED) {
            this.socket.emit('music_ended');
        }
    }
}

// ═══ YT API ═══
window.onYouTubeIframeAPIReady = () => {
    console.log("YouTube API Ready");
};

// ═══ ORACLE SETUP — Called when Firebase Auth is ready ═══
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
                <div class="flex flex-col items-center justify-center p-6 text-center rounded-xl" style="background:rgba(255,255,255,0.02);">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white/15 mb-3" style="background:rgba(255,255,255,0.03);">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                    <p class="text-sm font-bold text-white/30">Sala vacía</p>
                    <p class="text-xs text-zinc-600 mt-1">Sé el primero en conectarte.</p>
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
                <div class="flex flex-col items-center justify-center p-6 text-center rounded-xl" style="background:rgba(255,255,255,0.02);">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white/15 mb-3" style="background:rgba(255,255,255,0.03);">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                    <p class="text-sm font-bold text-white/30">Sala vacía</p>
                    <p class="text-xs text-zinc-600 mt-1">Sé el primero en conectarte.</p>
                </div>
            `;
        } else {
            statusEl.innerHTML = `
                <div class="flex flex-col gap-2">
                    ${users.map(u => `
                        <div class="person-card story-item" style="opacity:0;">
                            <div class="relative shrink-0">
                                <img src="${u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}&background=random`}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}&background=random'" class="w-10 h-10 rounded-full border-2 border-green-500/50 object-cover shadow-[0_0_10px_rgba(34,197,94,0.2)]" />
                                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0a0a0f]"></div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-bold text-white truncate">${u.displayName || 'Usuario'}</p>
                                <p class="text-[10px] text-green-400/70 font-bold uppercase tracking-wider">${u.oracleHandle ? '@' + u.oracleHandle : 'En vivo'}</p>
                            </div>
                        </div>
                    `).join('')}

                    ${musicQueue && musicQueue.length > 0 ? `
                        <div class="mt-3 p-4 rounded-xl relative overflow-hidden" style="background:linear-gradient(135deg,rgba(236,72,153,0.06),rgba(139,92,246,0.06));border:1px solid rgba(236,72,153,0.1);">
                            <div class="flex items-center gap-2 mb-1">
                                <div class="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.4)]">
                                    <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                                <span class="text-[9px] text-pink-400 font-bold uppercase tracking-[0.1em]">Música Activa</span>
                            </div>
                            <p class="text-xs text-white/80 font-medium truncate pl-7">${musicQueue[0].title}</p>
                        </div>
                    ` : ''}
                </div>
            `;

            if (window.gsap) {
                gsap.fromTo(".story-item", { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: "power2.out", clearProps: "all" });
            } else {
                document.querySelectorAll('.story-item').forEach(el => el.style.opacity = '1');
            }
        }

        tempSocket.disconnect();
    });

    // Bind the join button
    const btnJoin = document.getElementById('btn-join-room');
    if (btnJoin) {
        btnJoin.addEventListener('click', () => {
            const lobbyOverlay = document.getElementById('lobby-overlay');
            if (lobbyOverlay) {
                lobbyOverlay.style.opacity = '0';
                setTimeout(() => lobbyOverlay.style.display = 'none', 500);
            }
            window.oracleRoom.stopLobbyPreview();
            window.oracleRoom.init();
        });

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('autojoin') === 'true') {
            setTimeout(() => btnJoin.click(), 500);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
};

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded', () => {
    OracleAudio.initUIListeners();
});

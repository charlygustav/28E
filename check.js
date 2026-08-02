(async function () {
            // Fecha de desbloqueo: 28 de Abril de 2026 a las 00:00:00 (Mes 3 = Abril)
            const unlockDate = new Date(2026, 3, 28, 0, 0, 0);
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('reset') === '1') {
                localStorage.clear();
                sessionStorage.clear();
            }
            const _FB = 'https://yaire-591ca-default-rtdb.firebaseio.com/config.json';

            // Función para iniciar la cuenta regresiva e inyectar el Toast
            function startMaintenanceCountdown(targetPage = 'mantenimiento') {
                if (document.getElementById('maintenance-countdown-overlay')) return;

                // Detener el polling
                if (typeof _stateInterval !== 'undefined') {
                    clearInterval(_stateInterval);
                }

                const overlay = document.createElement('div');
                overlay.id = 'maintenance-countdown-overlay';
                overlay.className = 'fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-md opacity-0';

                overlay.innerHTML = `
                    <div class="relative p-8 rounded-2xl bg-zinc-900/80 border border-white/10 text-center max-w-sm w-full mx-4 shadow-2xl overflow-hidden backdrop-blur-lg transform scale-95 opacity-0" id="maintenance-card" style="transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease;">
                        <!-- Orbes brillantes decorativos -->
                        <div class="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div class="relative z-10">
                            <!-- Icono de engranaje animado -->
                            <div class="mx-auto w-16 h-16 mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-3xl animate-spin-slow">
                                ⚙️
                            </div>
                            <h3 class="text-xl font-bold text-white mb-2">Mantenimiento</h3>
                            <p class="text-zinc-400 text-sm mb-6 leading-relaxed">
                                La página entrará en mantenimiento en unos segundos. Guardando sesión...
                            </p>
                            
                            <!-- Contador gigante -->
                            <div id="maintenance-countdown-timer" class="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-500 tracking-wider">
                                5
                            </div>
                        </div>
                    </div>
                `;

                document.body.appendChild(overlay);

                // Animación de entrada
                setTimeout(() => {
                    overlay.style.opacity = '1';
                    overlay.style.transition = 'opacity 0.5s ease-out';
                    const card = document.getElementById('maintenance-card');
                    if (card) {
                        card.classList.remove('scale-95', 'opacity-0');
                        card.classList.add('scale-100', 'opacity-100');
                    }
                }, 50);

                let timeLeft = 5;
                const timerEl = document.getElementById('maintenance-countdown-timer');

                const countdownInterval = setInterval(() => {
                    timeLeft--;
                    if (timeLeft >= 1) {
                        if (timerEl) {
                            timerEl.textContent = timeLeft;
                            // Animación pop del número
                            if (window.gsap) {
                                window.gsap.fromTo(timerEl,
                                    { scale: 1.6, opacity: 0.3 },
                                    { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }
                                );
                            } else {
                                // Fallback simple de escala con CSS si GSAP no responde temporalmente
                                timerEl.style.transform = 'scale(1.3)';
                                timerEl.style.transition = 'none';
                                setTimeout(() => {
                                    timerEl.style.transform = 'scale(1)';
                                    timerEl.style.transition = 'transform 0.2s ease-out';
                                }, 50);
                            }
                        }
                    } else {
                        clearInterval(countdownInterval);

                        // Animación de salida antes de redirigir
                        const card = document.getElementById('maintenance-card');
                        if (card) {
                            card.style.transform = 'scale(0.8)';
                            card.style.opacity = '0';
                            card.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
                        }
                        overlay.style.opacity = '0';
                        overlay.style.transition = 'opacity 0.3s ease-in';

                        setTimeout(() => {
                            window.location.replace(targetPage);
                        }, 300);
                    }
                }, 1000);
            }

            // Función que lee Firebase y actúa según el estado
            let _isInitialCheck = true; // true solo en el primer checkState al cargar
            async function checkState() {
                // If coming back from maintenance expiry, skip Firebase redirect
                if (localStorage.getItem('yaire_restore') === '1') {
                    localStorage.removeItem('yaire_restore');
                    _isInitialCheck = false;
                    return;
                }
                try {
                    const res = await fetch(_FB + '?nocache=' + Date.now());
                    if (res.ok) {
                        const fbCfg = await res.json();
                        if (fbCfg) {
                            const oldStr = localStorage.getItem('yaire_config');
                            const newStr = JSON.stringify(fbCfg);

                            // Si la configuración cambió y ya teníamos una previa
                            if (oldStr && oldStr !== newStr) {
                                let oldCfg = null;
                                try {
                                    oldCfg = JSON.parse(oldStr);
                                } catch (err) { }
                                localStorage.setItem('yaire_config', newStr);
                                window.dispatchEvent(new CustomEvent('yaire_config_updated', { detail: fbCfg }));
                                // Check if scheduled time is up
                                let timeIsUp = false;
                                if (fbCfg.maintType === 'scheduled' && fbCfg.maintDate) {
                                    const [dPart, tPart] = fbCfg.maintDate.split('T');
                                    const [yyyy, mm, dd] = dPart.split('-');
                                    const [hh, min] = tPart.split(':');
                                    if (Date.now() >= new Date(yyyy, mm - 1, dd, hh, min).getTime()) timeIsUp = true;
                                }

                                if (fbCfg.mantenimiento && !timeIsUp) {
                                    const targetPage = (fbCfg.maintScreen === 'cinematic') ? 'maintenance' : 'mantenimiento';
                                    // Solo si el estado previo NO era mantenimiento y ahora sí es mantenimiento
                                    if (oldCfg && !oldCfg.mantenimiento) {
                                        startMaintenanceCountdown(targetPage);
                                    } else {
                                        window.location.replace(targetPage);
                                    }
                                } else if (!_isInitialCheck && !sessionStorage.getItem('yaire_reloaded')) {
                                    // Solo recargar durante polling (no al abrir la página)
                                    // Máximo 1 reload por sesión para evitar loops infinitos
                                    sessionStorage.setItem('yaire_reloaded', '1');
                                    window.location.reload();
                                }
                                // En carga inicial: solo actualizar localStorage, sin reload
                                _isInitialCheck = false;
                                return;
                            } else if (!oldStr) {
                                localStorage.setItem('yaire_config', newStr);
                                window.dispatchEvent(new CustomEvent('yaire_config_updated', { detail: fbCfg }));
                            }

                            let timeIsUp = false;
                            if (fbCfg.maintType === 'scheduled' && fbCfg.maintDate) {
                                const [dPart, tPart] = fbCfg.maintDate.split('T');
                                const [yyyy, mm, dd] = dPart.split('-');
                                const [hh, min] = tPart.split(':');
                                if (Date.now() >= new Date(yyyy, mm - 1, dd, hh, min).getTime()) timeIsUp = true;
                            }
                            if (fbCfg.mantenimiento && !timeIsUp) {
                                const targetPage = (fbCfg.maintScreen === 'cinematic') ? 'maintenance' : 'mantenimiento';
                                window.location.replace(targetPage);
                                return;
                            }
                        }
                    }
                } catch (e) { }

                // Si no hay mantenimiento, verificar fecha de lanzamiento
                if (new Date() < unlockDate && urlParams.get('dev') !== '1') {
                    window.location.replace('mantenimiento');
                }
                _isInitialCheck = false;
            }

            // Chequeo inmediato al cargar
            await checkState();

            // Polling cada 3 segundos para detectar cambios del admin en tiempo real
            // Guard: no hacer fetch mientras la pestaña está oculta (ahorra batería y red)
            let _stateInterval = setInterval(() => { if (!document.hidden) checkState(); }, 8000);
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) checkState(); // Chequeo inmediato al volver
            });
        })();
(function () {
                try {
                    var hc = navigator.hardwareConcurrency || 8;
                    var dm = navigator.deviceMemory || 8;
                    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    var isSmallScreen = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
                    var perfLite = prefersReduced || hc <= 4 || dm <= 4 || isSmallScreen;
                    if (perfLite) document.documentElement.classList.add('perf-lite');
                    window.__PERF_LITE__ = !!perfLite;
                } catch (e) {
                    window.__PERF_LITE__ = false;
                }
            })();
(function () {
            var scriptPromises = {};
            var ric = window.requestIdleCallback || function (cb) {
                return setTimeout(function () {
                    cb({ didTimeout: false, timeRemaining: function () { return 0; } });
                }, 900);
            };

            window.__runWhenIdle = function (cb, timeout) {
                return ric(cb, { timeout: timeout || 3500 });
            };

            window.__loadScriptOnce = function (src, attrs) {
                if (scriptPromises[src]) return scriptPromises[src];
                scriptPromises[src] = new Promise(function (resolve, reject) {
                    var existing = document.querySelector('script[src="' + src + '"]');
                    if (existing) {
                        existing.addEventListener('load', resolve, { once: true });
                        existing.addEventListener('error', reject, { once: true });
                        if (existing.dataset.loaded === 'true') resolve();
                        return;
                    }
                    var s = document.createElement('script');
                    s.src = src;
                    s.async = true;
                    if (attrs) {
                        Object.keys(attrs).forEach(function (key) {
                            if (attrs[key] === true) s.setAttribute(key, '');
                            else if (attrs[key] !== false && attrs[key] != null) s.setAttribute(key, attrs[key]);
                        });
                    }
                    s.onload = function () { s.dataset.loaded = 'true'; resolve(); };
                    s.onerror = reject;
                    document.head.appendChild(s);
                });
                return scriptPromises[src];
            };
        })();



const _debugMode = new URLSearchParams(window.location.search).get('debug') === '1';
        if (_debugMode) document.getElementById('yaire-debug').style.display = 'block';
        function logDebug(msg) {
            if (_debugMode) {
                const d = document.getElementById('yaire-debug');
                if (d) d.innerHTML += `[${Math.round(performance.now())}ms] ${msg}<br>`;
                console.log(`[DEBUG] ${msg}`);
            }
        }
        logDebug('Body started');
(function () {
            var _t = setTimeout(function () {
                var ld = document.getElementById('loader');
                if (ld && ld.style.display !== 'none' && !document.body.classList.contains('page-ready')) {
                    ld.style.opacity = '0';
                    setTimeout(function () { ld.style.display = 'none'; document.body.classList.add('page-ready'); }, 400);
                }
            }, 1500);
            window.__cancelLoaderSafety = function () { clearTimeout(_t); };
        })();
(function() {
        var now = new Date();
        var month = now.getMonth();
        var day = now.getDate();
        var urlParams = new URLSearchParams(window.location.search);
        var forceCeleb = urlParams.get('celeb') === '1';
        var isCelebDay = (month === 6 && day >= 27 && day <= 29) || forceCeleb;
        var alreadySeen = sessionStorage.getItem('celeb_6m_seen');
        if (!isCelebDay || alreadySeen) return;
        var overlay = document.getElementById('celebration-overlay');
        if (!overlay) return;
        overlay.style.display = 'flex';

        function showCelebration() {
            sessionStorage.setItem('celeb_6m_seen', '1');
            overlay.style.transition = 'opacity 0.8s ease';
            overlay.style.opacity = '1';
            if (typeof gsap === 'undefined') {
                overlay.querySelectorAll('#celeb-number, #celeb-title, #celeb-subtitle, #celeb-enter-btn').forEach(function(el) { el.style.opacity = '1'; el.style.transform = 'none'; });
                return;
            }
            var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl.to('#celeb-number', { opacity: 1, scale: 1, duration: 1.5, ease: 'elastic.out(1, 0.5)' }, 0.3);
            tl.to('#celeb-title', { opacity: 1, y: 0, duration: 1 }, 1.0);
            tl.to('#celeb-subtitle', { opacity: 1, y: 0, duration: 0.8 }, 1.4);
            tl.to('#celeb-enter-btn', { opacity: 1, y: 0, duration: 0.8 }, 1.8);
            tl.call(function() { launchFireworks(); }, null, 1.2);
            tl.call(function() { startConfetti(); }, null, 1.5);
        }

        function launchFireworks() {
            var canvas = document.getElementById('celebration-canvas');
            if (!canvas) return;
            var ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth; canvas.height = window.innerHeight;
            var colors = ['#f59e0b','#ec4899','#fbbf24','#f472b6','#fff','#a78bfa','#34d399'];
            var particles = [];
            var animId;
            function createBurst(x, y) {
                var count = 60 + Math.floor(Math.random() * 40);
                for (var i = 0; i < count; i++) {
                    var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
                    var speed = 2 + Math.random() * 5;
                    particles.push({ x:x, y:y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life:1, decay: 0.012+Math.random()*0.015, color: colors[Math.floor(Math.random()*colors.length)], size: 1.5+Math.random()*2.5, trail:[] });
                }
            }
            function animate() {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'lighter';
                particles = particles.filter(function(p) { return p.life > 0; });
                particles.forEach(function(p) {
                    p.trail.push({x:p.x, y:p.y}); if(p.trail.length > 5) p.trail.shift();
                    p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.vx *= 0.99; p.life -= p.decay;
                    p.trail.forEach(function(t, i) { ctx.beginPath(); ctx.arc(t.x, t.y, p.size*(i/p.trail.length)*0.5, 0, Math.PI*2); ctx.fillStyle = p.color; ctx.globalAlpha = p.life*(i/p.trail.length)*0.3; ctx.fill(); });
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.fill(); ctx.globalAlpha = 1;
                });
                var ov = document.getElementById('celebration-overlay');
                if (particles.length > 0 || (ov && ov.style.display !== 'none')) { animId = requestAnimationFrame(animate); }
            }
            animate();
            var w = canvas.width, h = canvas.height;
            createBurst(w*0.5, h*0.35);
            setTimeout(function(){ createBurst(w*0.25, h*0.3); }, 400);
            setTimeout(function(){ createBurst(w*0.75, h*0.25); }, 700);
            setTimeout(function(){ createBurst(w*0.4, h*0.2); }, 1100);
            setTimeout(function(){ createBurst(w*0.6, h*0.35); }, 1500);
            var burstCount = 0;
            var burstInterval = setInterval(function() {
                if (burstCount > 15 || !document.getElementById('celebration-overlay') || document.getElementById('celebration-overlay').style.display === 'none') { clearInterval(burstInterval); return; }
                createBurst(w*(0.15+Math.random()*0.7), h*(0.1+Math.random()*0.4)); burstCount++;
            }, 2000);
            window.__celebCleanup = function() { cancelAnimationFrame(animId); clearInterval(burstInterval); ctx.clearRect(0,0,canvas.width,canvas.height); };
        }

        function startConfetti() {
            var container = document.getElementById('confetti-container');
            if (!container || typeof gsap === 'undefined') return;
            var confettiColors = ['#f59e0b','#ec4899','#fbbf24','#f472b6','#a78bfa','#34d399','#fff'];
            var shapes = ['rect','circle','strip'];
            var confettiInterval;
            function spawnConfetti() {
                for (var i = 0; i < 4; i++) {
                    var el = document.createElement('div');
                    var shape = shapes[Math.floor(Math.random()*shapes.length)];
                    el.className = 'celeb-confetti ' + shape;
                    el.style.background = confettiColors[Math.floor(Math.random()*confettiColors.length)];
                    el.style.left = Math.random()*100 + '%'; el.style.top = '-20px';
                    container.appendChild(el);
                    gsap.to(el, { y: window.innerHeight+50, x: (Math.random()-0.5)*200, rotation: Math.random()*720-360, opacity: 0, duration: 3+Math.random()*3, ease: 'power1.in', onComplete: function() { if(el.parentNode) el.remove(); } });
                }
            }
            for (var i = 0; i < 8; i++) { setTimeout(spawnConfetti, i*100); }
            confettiInterval = setInterval(spawnConfetti, 400);
            setTimeout(function() { clearInterval(confettiInterval); }, 20000);
            window.__confettiCleanup = function() { clearInterval(confettiInterval); };
        }

        window.dismissCelebration = function() {
            var ov = document.getElementById('celebration-overlay');
            if (!ov) return;
            if (typeof gsap !== 'undefined') {
                gsap.to(ov, { opacity: 0, scale: 1.05, duration: 0.8, ease: 'power2.inOut', onComplete: function() { ov.style.display = 'none'; if(window.__celebCleanup) window.__celebCleanup(); if(window.__confettiCleanup) window.__confettiCleanup(); } });
            } else { ov.style.opacity = '0'; setTimeout(function(){ ov.style.display = 'none'; }, 800); }
        };

        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(m) {
                if (m.type === 'attributes' && m.attributeName === 'class' && document.body.classList.contains('page-ready')) {
                    observer.disconnect();
                    setTimeout(showCelebration, 600);
                }
            });
        });
        observer.observe(document.body, { attributes: true });
        if (document.body.classList.contains('page-ready')) { setTimeout(showCelebration, 600); }
    })();
let spotlightTracks = [
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
                let currentSpotTrack = 0;
                let spotAudio = new Audio();
                let fbRadioAudio = new Audio();
                let currentRadioState = null;
                let radioUnsubscribe = null;
                let serverTimeOffset = 0;

                function startFirebaseRadio() {
                    if (!window.yaireRadioFb) {
                        setTimeout(startFirebaseRadio, 100);
                        return;
                    }
                    const { db, ref, onValue } = window.yaireRadioFb;

                    if (!radioUnsubscribe) {
                        onValue(ref(db, '.info/serverTimeOffset'), snap => {
                            serverTimeOffset = snap.val() || 0;
                        });


                        radioUnsubscribe = onValue(ref(db, 'radio_state/current'), snap => {
                            const state = snap.val();
                            currentRadioState = state;
                            if (!state || spotlightMode !== 'radio') return;

                            const expTitle = document.getElementById('spotlight-expanded-title');
                            const expArtist = document.getElementById('spotlight-expanded-artist');
                            const compactArtist = document.getElementById('spotlight-artist');

                            if (expTitle) expTitle.textContent = state.title || 'Spotlight Music';
                            if (expArtist) expArtist.innerHTML = `<span class="text-red-500 font-bold tracking-widest uppercase animate-pulse">🔴 EN VIVO: ${state.artist || 'Transmisión'}</span>`;
                            if (compactArtist) compactArtist.innerHTML = `<span class="text-red-500 font-bold tracking-wider animate-pulse">🔴 ${state.artist || 'EN VIVO'}</span>`;

                            if (state.title && state.artist) {
                                fetchSpotlightArtwork({ title: state.title, artist: state.artist }).then(url => updateAllArtwork(url || 'tulip.ico?v=3'));
                            }


                            if (state.isPlaying) {
                                if (fbRadioAudio.src !== new URL(state.src, document.baseURI).href) {
                                    fbRadioAudio.src = state.src;
                                    fbRadioAudio.load();

                                    const now = Date.now() + serverTimeOffset;
                                    let seekTime = (now - state.startTime) / 1000;

                                    if (seekTime < 5) {
                                        const announcerText = `Estás escuchando ${state.title} de ${state.artist}, en Spotlight Music.`;
                                        const announcerAudio = new Audio(`/api/tts?text=${encodeURIComponent(announcerText)}`);

                                        // We use the Audio object directly to check if API is available
                                        setTimeout(() => {
                                            announcerAudio.play().then(() => {
                                                // Aplicar Ducking
                                                const currentGlobal = fbRadioAudio.volume;
                                                fbRadioAudio.volume = currentGlobal * 0.2;

                                                announcerAudio.onended = () => {
                                                    fbRadioAudio.volume = currentGlobal;
                                                };
                                            }).catch(e => {
                                                // Si falla (e.g. no API key o autoplay bloqueado) no hacemos ducking
                                                console.warn("TTS Announcer skipped:", e);
                                            });
                                        }, 500); // Wait half a second before speaking
                                    }
                                }

                                const now = Date.now() + serverTimeOffset;
                                let seekTime = (now - state.startTime) / 1000;
                                if (seekTime < 0) seekTime = 0;

                                if (Math.abs(fbRadioAudio.currentTime - seekTime) > 2) {
                                    fbRadioAudio.currentTime = seekTime;
                                }

                                if (fbRadioAudio.paused && isSpotPlaying) {
                                    fbRadioAudio.play().catch(e => console.error("Radio play error:", e));
                                }
                            } else {
                                fbRadioAudio.pause();
                            }
                        });

                        onValue(ref(db, 'radio_state/globalVolume'), snap => {
                            const vol = snap.val();
                            if (vol !== null) {
                                fbRadioAudio.volume = vol;
                            }
                        });

                        ['airhorn', 'applause', 'djdrop'].forEach(sfxId => {
                            onValue(ref(db, 'radio_state/sfx_' + sfxId), snap => {
                                const ts = snap.val();
                                if (ts && (!window['__last_sfx_' + sfxId] || ts > window['__last_sfx_' + sfxId])) {
                                    // Only play if we are in radio mode and it's a recent trigger (within 10 seconds)
                                    const isNew = !window['__last_sfx_' + sfxId]; // ignore initial load
                                    window['__last_sfx_' + sfxId] = ts;

                                    if (!isNew && spotlightMode === 'radio' && isSpotPlaying && (Date.now() + serverTimeOffset - ts < 10000)) {
                                        const urls = {
                                            airhorn: 'https://www.myinstants.com/media/sounds/mlg-airhorn.mp3',
                                            applause: 'https://www.myinstants.com/media/sounds/applause-1.mp3',
                                            djdrop: 'https://www.myinstants.com/media/sounds/dj-airhorn-sound-effect.mp3'
                                        };
                                        const a = new Audio(urls[sfxId]);
                                        a.volume = fbRadioAudio.volume;
                                        a.play().catch(() => { });
                                    }
                                }
                            });
                        });

                    }

                    if (!isSpotPlaying) {
                        isSpotPlaying = true;
                        spotlightUpdateUI();
                        if (fbRadioAudio.src) {
                            // Resync current time when locally resumed
                            if (currentRadioState && currentRadioState.isPlaying && currentRadioState.startTime) {
                                const now = Date.now() + serverTimeOffset;
                                let seekTime = (now - currentRadioState.startTime) / 1000;
                                if (seekTime < 0) seekTime = 0;
                                fbRadioAudio.currentTime = seekTime;
                            }
                            fbRadioAudio.play().catch(e => console.error("Radio play error:", e));
                        }
                    }
                }

                function stopFirebaseRadio() {
                    isSpotPlaying = false;
                    fbRadioAudio.pause();
                    spotlightUpdateUI();
                    document.title = '28E';
                }

                fbRadioAudio.addEventListener('ended', () => {
                    if (spotlightMode !== 'radio' || !window.yaireRadioFb) return;
                    const { db, ref, runTransaction, serverTimestamp } = window.yaireRadioFb;
                    const endedSrc = fbRadioAudio.src;

                    runTransaction(ref(db, 'radio_state/current'), (currentData) => {
                        if (!currentData) return currentData;
                        const currentAbsoluteSrc = new URL(currentData.src, document.baseURI).href;
                        if (currentAbsoluteSrc !== endedSrc) return; // Alguien más ya avanzó

                        let nextIndex = 0;
                        const currentIndex = spotlightTracks.findIndex(t => t.src === currentData.src || new URL(t.src, document.baseURI).href === currentData.src);
                        if (currentIndex !== -1) {
                            nextIndex = (currentIndex + 1) % spotlightTracks.length;
                        }

                        const nextTrack = spotlightTracks[nextIndex];
                        currentData.src = nextTrack.src;
                        currentData.title = nextTrack.title;
                        currentData.artist = nextTrack.artist;
                        currentData.startTime = serverTimestamp();
                        currentData.isPlaying = true;
                        currentData.source = 'auto';

                        return currentData;
                    });
                });
                let spotlightMode = 'music'; // 'music' or 'radio'
                let isSpotPlaying = false;
                let isSpotlightExpanded = false;
                let spotArtworkCache = {};

                async function fetchSpotlightArtwork(track) {
                    const key = track.title + '|' + track.artist;
                    if (key in spotArtworkCache) return spotArtworkCache[key];

                    const clean = (str) => {
                        if (!str) return '';
                        return str.replace(/\b(remix|remixed|edit|radio edit|feat\.?|ft\.?)\b/gi, '')
                            .replace(/[()\-–]/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                    };

                    const searchDeezer = (query, artistFilter) => {
                        return new Promise((resolve) => {
                            const cbName = 'dzcb_' + Date.now() + Math.floor(Math.random() * 10000);
                            window[cbName] = (data) => {
                                delete window[cbName];
                                document.head.removeChild(script);
                                if (data && data.data && data.data.length > 0) {
                                    if (artistFilter) {
                                        const lowerArtist = artistFilter.toLowerCase();
                                        const match = data.data.find(r => r.artist && r.artist.name && r.artist.name.toLowerCase().includes(lowerArtist));
                                        if (match && match.album && match.album.cover_big) return resolve(match.album.cover_big);
                                    }
                                    if (data.data[0].album && data.data[0].album.cover_big) return resolve(data.data[0].album.cover_big);
                                }
                                resolve(null);
                            };
                            const script = document.createElement('script');
                            script.src = `https://api.deezer.com/search?q=${query}&output=jsonp&callback=${cbName}`;
                            script.onerror = () => {
                                delete window[cbName];
                                document.head.removeChild(script);
                                resolve(null);
                            };
                            document.head.appendChild(script);
                        });
                    };

                    const searchiTunes = async (query, artistFilter) => {
                        try {
                            const res = await fetch('https://itunes.apple.com/search?term=' + query + '&entity=song&limit=10');
                            const data = await res.json();
                            if (data.results && data.results.length > 0) {
                                if (artistFilter) {
                                    const lowerArtist = artistFilter.toLowerCase();
                                    const match = data.results.find(r => r.artistName && r.artistName.toLowerCase().includes(lowerArtist));
                                    if (match) return match.artworkUrl100.replace('100x100bb', '400x400bb');
                                }
                                return data.results[0].artworkUrl100.replace('100x100bb', '400x400bb');
                            }
                        } catch (e) { }
                        return null;
                    };

                    // Try 1: Clean Title + Clean Artist (Deezer -> iTunes)
                    const titleClean = clean(track.title);
                    const artistClean = clean(track.artist);
                    let q = encodeURIComponent(titleClean + ' ' + artistClean);

                    let url = await searchDeezer(q, artistClean);
                    if (url) { spotArtworkCache[key] = url; return url; }

                    url = await searchiTunes(q, artistClean);
                    if (url) { spotArtworkCache[key] = url; return url; }

                    // Try 2: Original Title + Original Artist
                    q = encodeURIComponent(track.title + ' ' + track.artist);
                    url = await searchDeezer(q, track.artist);
                    if (url) { spotArtworkCache[key] = url; return url; }

                    url = await searchiTunes(q, track.artist);
                    if (url) { spotArtworkCache[key] = url; return url; }

                    // Try 3: Just Title
                    q = encodeURIComponent(titleClean);
                    url = await searchDeezer(q, artistClean);
                    if (url) { spotArtworkCache[key] = url; return url; }

                    url = await searchiTunes(q, artistClean);
                    if (url) {
                        spotArtworkCache[key] = url;
                        return url;
                    }

                    spotArtworkCache[key] = null;
                    return null;
                }

                function updateAllArtwork(artUrl) {
                    // Vinyl (expanded player)
                    const vinylArt = document.getElementById('spotlight-vinyl-art');
                    const vinylIcon = document.getElementById('spotlight-expanded-icon');
                    if (vinylArt) {
                        if (artUrl) {
                            vinylArt.src = artUrl;
                            vinylArt.style.display = 'block';
                            if (vinylIcon) vinylIcon.style.display = 'none';
                        } else {
                            vinylArt.style.display = 'none';
                            if (vinylIcon) vinylIcon.style.display = '';
                        }
                    }
                    // Compact player thumbnail
                    const compactArt = document.getElementById('spotlight-compact-art');
                    const compactIcon = document.getElementById('spotlight-icon');
                    if (compactArt) {
                        if (artUrl) {
                            compactArt.src = artUrl;
                            compactArt.style.display = 'block';
                            if (compactIcon) compactIcon.style.display = 'none';
                        } else {
                            compactArt.style.display = 'none';
                            if (compactIcon) compactIcon.style.display = '';
                        }
                    }
                }

                function toggleSpotlightExpand() {
                    isSpotlightExpanded = !isSpotlightExpanded;
                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.play(isSpotlightExpanded ? 'flyin.wav' : 'flyout.wav', 0.6);
                    }
                    const expEl = document.getElementById('spotlight-expanded');
                    if (!expEl) return;

                    // Set correct solid background based on dark mode
                    const isDark = document.documentElement.classList.contains('dark');
                    expEl.style.background = isDark ? '#09090b' : '#ffffff';

                    if (isSpotlightExpanded) {
                        // Make sure starting position is correct before animating
                        gsap.set(expEl, { y: '100%', opacity: 0 });
                        expEl.classList.remove('pointer-events-none');
                        expEl.classList.add('pointer-events-auto');
                        // Sync UI only — never touch spotAudio.src here (would pause playback)
                        syncExpandedPlayerUI();
                        renderSpotlightPlaylist();
                        gsap.to(expEl, {
                            y: '0%',
                            opacity: 1,
                            duration: 0.4,
                            ease: 'power2.out'
                        });
                    } else {
                        gsap.to(expEl, {
                            y: '100%',
                            opacity: 0,
                            duration: 0.35,
                            ease: 'power2.in',
                            onComplete: () => {
                                expEl.classList.remove('pointer-events-auto');
                                expEl.classList.add('pointer-events-none');
                            }
                        });
                    }
                }

                // Only updates text + icon in the expanded view — never touches spotAudio
                function syncExpandedPlayerUI() {
                    // Sync play/pause icon and vinyl spin state
                    const expPlayIcon = document.getElementById('spotlight-expanded-play-icon');
                    const vinylSpin = document.getElementById('spotlight-vinyl-spin');
                    if (expPlayIcon) {
                        expPlayIcon.innerHTML = isSpotPlaying
                            ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
                            : '<path d="M8 5v14l11-7z"/>';
                    }
                    if (vinylSpin) {
                        vinylSpin.style.animationPlayState = isSpotPlaying ? 'running' : 'paused';
                    }

                    if (spotlightMode === 'radio') return; // Do not overwrite titles/artwork in Radio mode

                    const track = spotlightTracks[currentSpotTrack];
                    if (!track) return;
                    const expTitle = document.getElementById('spotlight-expanded-title');
                    const expArtist = document.getElementById('spotlight-expanded-artist');
                    if (expTitle) expTitle.textContent = track.title;
                    if (expArtist) expArtist.textContent = track.artist;

                    // Fetch and display artwork
                    fetchSpotlightArtwork(track).then(artUrl => updateAllArtwork(artUrl));
                }

                function renderSpotlightPlaylist() {
                    const listEl = document.getElementById('spotlight-expanded-list');
                    if (!listEl) return;
                    listEl.innerHTML = '';
                    spotlightTracks.forEach((track, index) => {
                        const isCurrent = index === currentSpotTrack;
                        const key = track.title + '|' + track.artist;
                        const cachedArt = spotArtworkCache[key];
                        const item = document.createElement('div');
                        item.className = 'flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 select-none ' + (
                            isCurrent
                                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold border border-brand-500/20 shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                        );
                        const thumbHtml = cachedArt
                            ? `<img src="${cachedArt}" class="w-8 h-8 rounded-lg object-cover flex-shrink-0" />`
                            : `<span class="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm flex-shrink-0">${isCurrent ? '🔊' : '🎵'}</span>`;
                        item.innerHTML = thumbHtml +
                            `<span class="text-xs truncate font-medium flex-1">${track.title}</span>` +
                            (isCurrent ? '<span class="text-[10px] text-brand-500 flex-shrink-0 font-bold">▶</span>' : '');
                        item.onclick = () => spotlightPlayTrack(index);
                        listEl.appendChild(item);
                        // Fetch art if not cached yet — update this item when ready
                        if (!cachedArt && cachedArt !== null) {
                            fetchSpotlightArtwork(track).then(artUrl => {
                                if (artUrl) {
                                    const thumbEl = item.querySelector('span.w-8');
                                    if (thumbEl) {
                                        const img = document.createElement('img');
                                        img.src = artUrl;
                                        img.className = 'w-8 h-8 rounded-lg object-cover flex-shrink-0';
                                        item.replaceChild(img, thumbEl);
                                    }
                                }
                            });
                        }
                    });
                }

                function spotlightPrevTrack() {
                    let prev = currentSpotTrack - 1;
                    if (prev < 0) prev = spotlightTracks.length - 1;
                    spotlightPlayTrack(prev);
                }

                let toastShownForCurrentSong = false;

                function initSpotlight() {
                    // Cargar canciones desde Firebase (vía config del admin panel)
                    try {
                        const cfg = JSON.parse(localStorage.getItem('yaire_config') || '{}');
                        if (cfg.songs && cfg.songs.length > 0) {
                            spotlightTracks = cfg.songs;
                        }
                    } catch (e) { /* fallback al listado hardcodeado */ }

                    spotAudio.volume = 0.5;
                    spotlightLoadTrack(0);
                    spotAudio.addEventListener('ended', spotlightNext);

                    spotAudio.addEventListener('timeupdate', () => {
                        if (!spotAudio.duration) return;
                        const timeLeft = spotAudio.duration - spotAudio.currentTime;
                        if (timeLeft <= 10 && timeLeft > 0 && !toastShownForCurrentSong) {
                            toastShownForCurrentSong = true;
                            let next = currentSpotTrack + 1;
                            if (next >= spotlightTracks.length) next = 0;
                            const nextTrack = spotlightTracks[next];
                            if (nextTrack) {
                                const toast = document.getElementById('next-song-toast');
                                const titleEl = document.getElementById('next-song-toast-title');
                                const artImg = document.getElementById('next-song-toast-art');
                                const fallbackIcon = document.getElementById('next-song-toast-fallback');
                                const artContainer = document.getElementById('next-song-toast-art-container');

                                if (toast && titleEl) {
                                    titleEl.textContent = nextTrack.title;

                                    fetchSpotlightArtwork(nextTrack).then(artUrl => {
                                        if (artUrl) {
                                            artImg.src = artUrl;
                                            artImg.classList.remove('hidden');
                                            fallbackIcon.classList.add('hidden');
                                            artContainer.classList.remove('bg-brand-500/20', 'text-brand-400');
                                        } else {
                                            artImg.classList.add('hidden');
                                            fallbackIcon.classList.remove('hidden');
                                            artContainer.classList.add('bg-brand-500/20', 'text-brand-400');
                                        }

                                        gsap.fromTo(toast,
                                            { y: 20, x: -20, opacity: 0 },
                                            { y: 0, x: 0, opacity: 1, duration: 0.6, ease: "back.out(1.5)" }
                                        );
                                        setTimeout(() => {
                                            gsap.to(toast, { y: 20, opacity: 0, duration: 0.5, ease: "power2.in" });
                                        }, 8000);
                                    });
                                }
                            }
                        }
                    });

                    if (typeof AudioManager !== 'undefined') {
                        spotAudio.muted = AudioManager.muted;
                    }

                    function updateSpotlightPlaylist(songs) {
                        if (songs && songs.length > 0) {
                            spotlightTracks = songs;
                            if (!isSpotPlaying) {
                                spotlightLoadTrack(0);
                            }
                        }
                    }

                    // Actualizar lista si el admin cambia la config en otra pestaña
                    window.addEventListener('storage', (e) => {
                        if (e.key === 'yaire_config' && e.newValue) {
                            try {
                                const cfg = JSON.parse(e.newValue);
                                updateSpotlightPlaylist(cfg.songs);
                            } catch (e) { }
                        }
                    });

                    // Actualizar lista cuando se carga la config en la pestaña actual
                    window.addEventListener('yaire_config_updated', (e) => {
                        const cfg = e.detail;
                        updateSpotlightPlaylist(cfg ? cfg.songs : null);
                    });
                }

                function spotlightLoadTrack(i) {
                    toastShownForCurrentSong = false;
                    currentSpotTrack = i;
                    const track = spotlightTracks[i];
                    spotAudio.src = track.src;
                    document.getElementById('spotlight-title').textContent = track.title;
                    document.getElementById('spotlight-artist').textContent = track.artist;

                    // Expanded player elements
                    const expTitle = document.getElementById('spotlight-expanded-title');
                    const expArtist = document.getElementById('spotlight-expanded-artist');
                    if (expTitle) expTitle.textContent = track.title;
                    if (expArtist) expArtist.textContent = track.artist;

                    // Fetch and update artwork immediately
                    fetchSpotlightArtwork(track).then(artUrl => {
                        updateAllArtwork(artUrl);
                        if (isSpotlightExpanded) {
                            renderSpotlightPlaylist();
                        }
                    });

                    // Actualizar título de ventana y Media Session del Sistema Operativo
                    if (isSpotPlaying) {
                        if (spotlightMode === 'radio') {
                            document.title = '28E FM (Live)';
                            if ('mediaSession' in navigator) {
                                navigator.mediaSession.metadata = new MediaMetadata({
                                    title: 'Spotlight Music',
                                    artist: 'Live Broadcast',
                                    album: '28E',
                                    artwork: [{ src: 'tulip.ico?v=3', sizes: '512x512', type: 'image/x-icon' }]
                                });
                            }
                        } else {
                            document.title = `${track.title}`;
                            if ('mediaSession' in navigator) {
                                const art = currentArtworkSrc || 'tulip.ico?v=3';
                                navigator.mediaSession.metadata = new MediaMetadata({
                                    title: track.title,
                                    artist: track.artist,
                                    album: '28E Spotlight',
                                    artwork: [{ src: art, sizes: '512x512', type: 'image/jpeg' }]
                                });
                            }
                        }
                    }
                }

                function spotlightPlayTrack(i) {
                    spotAudio.pause();

                    isSpotPlaying = true;
                    spotlightUpdateUI();

                    if (currentSpotTrack !== i) {
                        // Register the play handler BEFORE changing the source
                        // so we don't miss the canplay event on cached/local files
                        let played = false;
                        const doPlay = () => {
                            if (played) return;
                            played = true;
                            spotAudio.play().then(() => {
                                spotlightUpdateTitle();
                            }).catch(err => {
                                console.error('Music playback failed:', err);
                                isSpotPlaying = false;
                                spotlightUpdateUI();
                            });
                        };
                        spotAudio.addEventListener('canplay', doPlay, { once: true });

                        // Now change the source (this triggers loading)
                        spotlightLoadTrack(i);

                        // Safety: if canplay doesn't fire within 3 seconds, force play
                        setTimeout(() => { doPlay(); }, 3000);
                    } else {
                        // Same track, just replay from start
                        spotAudio.currentTime = 0;
                        spotAudio.play().then(() => {
                            spotlightUpdateTitle();
                        }).catch(err => {
                            console.error('Music playback failed:', err);
                            isSpotPlaying = false;
                            spotlightUpdateUI();
                        });
                    }
                }

                function spotlightUpdateTitle() {
                    const track = spotlightTracks[currentSpotTrack];
                    if (isSpotPlaying && track) {
                        document.title = spotlightMode === 'radio' ? '28E FM (Live)' : `${track.title}`;
                    } else {
                        document.title = '28E';
                    }
                }

                function spotlightTogglePlay() {
                    if (spotlightMode === 'radio') {
                        if (isSpotPlaying) {
                            stopFirebaseRadio();
                        } else {
                            startFirebaseRadio();
                        }
                        return;
                    }

                    if (!spotAudio.src) spotlightLoadTrack(0);
                    if (isSpotPlaying) {
                        spotAudio.pause();
                        isSpotPlaying = false;
                        spotlightUpdateUI();
                        document.title = '28E';
                    } else {
                        spotAudio.play().then(() => {
                            isSpotPlaying = true;
                            spotlightUpdateUI();
                            spotlightUpdateTitle();
                        }).catch(console.error);
                    }
                }

                function spotlightNext() {
                    if (spotlightMode === 'radio') return; // Cannot skip live radio
                    let next = currentSpotTrack + 1;
                    if (next >= spotlightTracks.length) next = 0;
                    spotlightPlayTrack(next);
                }

                function setSpotlightMode(mode) {
                    if (spotlightMode === mode) return;
                    spotlightMode = mode;
                    AudioManager.play('language.wav', 0.6);

                    const btnMusic = document.getElementById('spot-mode-btn-music');
                    const btnRadio = document.getElementById('spot-mode-btn-radio');
                    const compactNext = document.getElementById('spotlight-compact-next');
                    const expPrev = document.getElementById('spotlight-expanded-prev');
                    const expNext = document.getElementById('spotlight-expanded-next');
                    const expProgress = document.getElementById('spotlight-progress-container');
                    const expTimeList = expProgress ? expProgress.previousElementSibling : null;
                    const expList = document.getElementById('spotlight-expanded-list');
                    const radioVis = document.getElementById('spotlight-radio-visualizer');
                    const expTitle = document.getElementById('spotlight-expanded-title');
                    const expArtist = document.getElementById('spotlight-expanded-artist');
                    const compactTitle = document.getElementById('spotlight-title');
                    const compactArtist = document.getElementById('spotlight-artist');

                    // Pause current playback on switch
                    if (isSpotPlaying) {
                        if (mode === 'radio' && spotAudio) { spotAudio.pause(); if (isSpotPlaying) startFirebaseRadio(); }
                        if (mode === 'music') stopFirebaseRadio();
                        isSpotPlaying = false;
                        spotlightUpdateUI();
                        document.title = '28E';
                    }

                    if (mode === 'music') {
                        // Activate Music UI
                        btnMusic.className = "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all bg-white dark:bg-zinc-700 text-brand-500 shadow-sm";
                        btnRadio.className = "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300";
                        if (compactNext) compactNext.style.display = '';
                        if (expPrev) expPrev.style.visibility = 'visible';
                        if (expNext) expNext.style.visibility = 'visible';
                        if (expProgress) expProgress.style.display = '';
                        if (expTimeList) expTimeList.style.display = '';
                        if (expList) expList.style.display = '';
                        if (radioVis) radioVis.style.display = 'none';

                        const vinylArt = document.getElementById('spotlight-vinyl-art');
                        if (vinylArt) vinylArt.classList.remove('scale-[0.8]');

                        // Restore track info
                        const t = spotlightTracks[currentSpotTrack];
                        if (t) {
                            if (compactTitle) compactTitle.textContent = 'Spotlight Music';
                            if (compactArtist) compactArtist.textContent = t.artist;
                            if (expTitle) expTitle.textContent = t.title;
                            if (expArtist) expArtist.textContent = t.artist;
                            fetchSpotlightArtwork(t).then(artUrl => updateAllArtwork(artUrl));
                        }
                    } else {
                        // Activate Radio UI
                        btnRadio.className = "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all bg-white dark:bg-zinc-700 text-brand-500 shadow-sm";
                        btnMusic.className = "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300";
                        if (compactNext) compactNext.style.display = 'none';
                        if (expPrev) expPrev.style.visibility = 'hidden';
                        if (expNext) expNext.style.visibility = 'hidden';
                        if (expProgress) expProgress.style.display = 'none';
                        if (expTimeList) expTimeList.style.display = 'none';
                        if (expList) expList.style.display = 'none';
                        if (radioVis) radioVis.style.display = 'flex';

                        const vinylArt = document.getElementById('spotlight-vinyl-art');
                        if (vinylArt) vinylArt.classList.add('scale-[0.8]', 'transition-transform', 'duration-300');

                        const dict = typeof dictionary !== 'undefined' && typeof currentLang !== 'undefined' && dictionary[currentLang] ? dictionary[currentLang] : {
                            radio_live_badge: '🔴 EN VIVO',
                            radio_live_title: '🔴 Transmisión en Vivo'
                        };

                        // Set live text
                        if (compactTitle) compactTitle.textContent = 'Spotlight Music';
                        if (compactArtist) compactArtist.innerHTML = `<span class="text-red-500 font-bold tracking-wider animate-pulse" data-i18n="radio_live_badge">${dict.radio_live_badge}</span>`;
                        if (expTitle) expTitle.textContent = 'Spotlight Music';
                        if (expArtist) expArtist.innerHTML = `<span class="text-red-500 font-bold tracking-widest uppercase animate-pulse" data-i18n="radio_live_title">${dict.radio_live_title}</span>`;

                        // Use default radio artwork
                        updateAllArtwork('tulip.ico?v=3');
                    }
                }

                function spotlightUpdateUI() {
                    const icon = document.getElementById('spotlight-play-icon');
                    const iconWrap = document.getElementById('spotlight-icon-wrap');
                    const expPlayIcon = document.getElementById('spotlight-expanded-play-icon');
                    const vinylSpin = document.getElementById('spotlight-vinyl-spin');

                    if (isSpotPlaying) {
                        icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
                        icon.classList.remove('ml-0.5');
                        iconWrap.classList.add('bg-brand-50', 'dark:bg-brand-900/20');
                        if (expPlayIcon) {
                            expPlayIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
                            expPlayIcon.classList.remove('ml-0.5');
                        }
                    } else {
                        icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
                        icon.classList.add('ml-0.5');
                        iconWrap.classList.remove('bg-brand-50', 'dark:bg-brand-900/20');
                        if (expPlayIcon) {
                            expPlayIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
                            expPlayIcon.classList.add('ml-0.5');
                        }
                    }

                    if (vinylSpin) {
                        vinylSpin.style.animationPlayState = isSpotPlaying ? 'running' : 'paused';
                    }
                }

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initSpotlight);
                } else {
                    initSpotlight();
                }

                // Restaurar título al volver a la pestaña
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        if (isSpotPlaying && spotlightTracks[currentSpotTrack]) {
                            const t = spotlightTracks[currentSpotTrack];
                            document.title = spotlightMode === 'radio' ? '28E FM (Live)' : `${t.title}`;
                        } else {
                            document.title = '28E';
                        }
                    }
                });

                // --- PROGRESS BAR LOGIC ---
                function spotlightFormatTime(seconds) {
                    if (isNaN(seconds)) return "0:00";
                    const m = Math.floor(seconds / 60);
                    const s = Math.floor(seconds % 60);
                    return m + ':' + (s < 10 ? '0' : '') + s;
                }

                spotAudio.addEventListener('timeupdate', () => {
                    const currentTime = spotAudio.currentTime;
                    const duration = spotAudio.duration || 0;
                    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

                    const fill = document.getElementById('spotlight-progress-fill');
                    const thumb = document.getElementById('spotlight-progress-thumb');
                    const currentTimeEl = document.getElementById('spotlight-current-time');

                    if (fill) fill.style.width = progressPercent + '%';
                    if (thumb) thumb.style.left = progressPercent + '%';
                    if (currentTimeEl) currentTimeEl.textContent = spotlightFormatTime(currentTime);
                });

                spotAudio.addEventListener('loadedmetadata', () => {
                    const totalTimeEl = document.getElementById('spotlight-total-time');
                    if (totalTimeEl) totalTimeEl.textContent = spotlightFormatTime(spotAudio.duration);
                });

                function spotlightSeek(e) {
                    const container = document.getElementById('spotlight-progress-container');
                    if (!container || !spotAudio.duration) return;
                    const rect = container.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.max(0, Math.min(1, clickX / rect.width));
                    spotAudio.currentTime = percent * spotAudio.duration;
                }

                // Drag functionality for progress bar
                let isDraggingProgress = false;
                function setupProgressDrag() {
                    const container = document.getElementById('spotlight-progress-container');
                    if (!container) return;

                    container.addEventListener('mousedown', (e) => {
                        isDraggingProgress = true;
                        spotlightSeek(e);
                    });

                    let _docRaf;
                    document.addEventListener('mousemove', (e) => {
                        if (isDraggingProgress) {
                            if (_docRaf) cancelAnimationFrame(_docRaf);
                            _docRaf = requestAnimationFrame(() => spotlightSeek(e));
                        }
                    });

                    document.addEventListener('mouseup', () => {
                        isDraggingProgress = false;
                    });
                }

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', setupProgressDrag);
                } else {
                    setupProgressDrag();
                }
// ===== TULIP SECTION INTERACTIONS =====

                // Petal particle system
                (function initTulipPetals() {
                    const container = document.getElementById('tulip-petals-container');
                    if (!container) return;
                    const petals = ['🌸', '🌷', '💮', '🏵️', '✿'];
                    function spawnPetal() {
                        if (container.children.length >= 25) return; // Cap to prevent memory leaks
                        const el = document.createElement('span');
                        el.className = 'tulip-petal';
                        el.textContent = petals[Math.floor(Math.random() * petals.length)];
                        el.style.left = Math.random() * 100 + '%';
                        el.style.animationDuration = (6 + Math.random() * 8) + 's';
                        el.style.animationDelay = Math.random() * 2 + 's';
                        el.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
                        el.style.willChange = 'transform, opacity'; // Hardware acceleration
                        container.appendChild(el);
                        // Limpieza segura:
                        const cleanUp = () => { if (el.parentNode) el.remove(); };
                        el.addEventListener('animationend', cleanUp);
                        setTimeout(cleanUp, 15000); // Fallback if animationend fails
                    }
                    // Initial burst
                    const initialPetals = window.__PERF_LITE__ ? 2 : 6;
                    for (let i = 0; i < initialPetals; i++) setTimeout(() => spawnPetal(), i * 400);
                    // Continuous — spawn every few seconds
                    const spawnDelay = window.__PERF_LITE__ ? 5200 : 2500;
                    let petalInterval = null;

                    // Performance: Only run when visible & clean DOM when hidden
                    const petalObs = new IntersectionObserver((entries) => {
                        if (entries[0].isIntersecting) {
                            if (!petalInterval) petalInterval = setInterval(spawnPetal, spawnDelay);
                        } else {
                            if (petalInterval) {
                                clearInterval(petalInterval);
                                petalInterval = null;
                            }
                            container.innerHTML = ''; // Prevent zombie DOM nodes
                        }
                    }, { threshold: 0 });

                    petalObs.observe(container);
                })();

                // Tulip burst on click
                function tulipBurst(el) {
                    if (typeof AudioManager !== 'undefined') AudioManager.play('transicion.wav', 0.5);
                    const rect = el.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    for (let i = 0; i < 10; i++) {
                        const p = document.createElement('span');
                        p.textContent = ['🌷', '🌸', '💗', '✨', '💕'][Math.floor(Math.random() * 5)];
                        p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:${14 + Math.random() * 14}px;pointer-events:none;z-index:9999;--tx:${(Math.random() - 0.5) * 200}px;--ty:${(Math.random() - 0.5) * 200}px;animation:tulipBurstParticle 0.9s ease-out forwards;`;
                        document.body.appendChild(p);
                        p.addEventListener('animationend', () => p.remove());
                    }
                    el.style.transform = 'scale(0.85)';
                    setTimeout(() => el.style.transform = '', 200);
                }

                // Tulip color guide
                const tulipColorData = {
                    rosa: { emoji: '🌷', nameKey: 'tulips_cm_pink', descKey: 'tulips_cd_pink', border: '#ec4899', bg: 'rgba(236,72,153,0.08)', panelBg: 'bg-pink-50/60 dark:bg-pink-950/20', panelBorder: 'border-pink-200/30 dark:border-pink-800/20' },
                    rojo: { emoji: '🌹', nameKey: 'tulips_cm_red', descKey: 'tulips_cd_red', border: '#ef4444', bg: 'rgba(239,68,68,0.08)', panelBg: 'bg-red-50/60 dark:bg-red-950/20', panelBorder: 'border-red-200/30 dark:border-red-800/20' },
                    amarillo: { emoji: '🌻', nameKey: 'tulips_cm_yellow', descKey: 'tulips_cd_yellow', border: '#eab308', bg: 'rgba(234,179,8,0.08)', panelBg: 'bg-yellow-50/60 dark:bg-yellow-950/20', panelBorder: 'border-yellow-200/30 dark:border-yellow-800/20' },
                    blanco: { emoji: '🤍', nameKey: 'tulips_cm_white', descKey: 'tulips_cd_white', border: '#a1a1aa', bg: 'rgba(161,161,170,0.06)', panelBg: 'bg-zinc-50/60 dark:bg-zinc-800/20', panelBorder: 'border-zinc-200/30 dark:border-zinc-700/20' },
                    morado: { emoji: '💜', nameKey: 'tulips_cm_purple', descKey: 'tulips_cd_purple', border: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', panelBg: 'bg-violet-50/60 dark:bg-violet-950/20', panelBorder: 'border-violet-200/30 dark:border-violet-800/20' },
                    naranja: { emoji: '🧡', nameKey: 'tulips_cm_orange', descKey: 'tulips_cd_orange', border: '#f97316', bg: 'rgba(249,115,22,0.08)', panelBg: 'bg-orange-50/60 dark:bg-orange-950/20', panelBorder: 'border-orange-200/30 dark:border-orange-800/20' }
                };

                function showTulipColor(btn) {
                    if (typeof AudioManager !== 'undefined') AudioManager.play('revelacion.wav', 0.4);
                    const color = btn.dataset.tulipColor;
                    const data = tulipColorData[color];
                    if (!data) return;

                    // Update all buttons
                    document.querySelectorAll('.tulip-color-btn').forEach(b => {
                        b.classList.remove('active-color');
                        b.style.removeProperty('--active-border');
                        b.style.removeProperty('--active-bg');
                    });
                    btn.classList.add('active-color');
                    btn.style.setProperty('--active-border', data.border);
                    btn.style.setProperty('--active-bg', data.bg);

                    // Show display panel
                    const display = document.getElementById('tulip-color-display');
                    const t = (typeof dictionary !== 'undefined' && dictionary[typeof currentLang !== 'undefined' ? currentLang : 'es']) ? dictionary[typeof currentLang !== 'undefined' ? currentLang : 'es'] : {};

                    document.getElementById('tulip-color-emoji').textContent = data.emoji;
                    document.getElementById('tulip-color-name').textContent = t[data.nameKey] || '';
                    document.getElementById('tulip-color-meaning').textContent = t[data.descKey] || '';

                    // Animate panel with dynamic bg
                    display.className = `mt-6 p-5 rounded-2xl ${data.panelBg} border ${data.panelBorder} transition-all duration-500`;
                    display.style.opacity = '1';
                    display.style.maxHeight = '200px';
                }

                // Sync tulip promise counter with the total-days counter
                (function syncTulipPromise() {
                    const src = document.getElementById('total-days-count');
                    const dst = document.getElementById('tulip-promise-days');
                    if (!src || !dst) return;
                    const obs = new MutationObserver(() => {
                        dst.textContent = src.textContent;
                    });
                    obs.observe(src, { childList: true, characterData: true, subtree: true });
                    dst.textContent = src.textContent;
                })();
document.addEventListener('DOMContentLoaded', () => {
                                const carousel = document.getElementById('universe-carousel');
                                const indicators = document.getElementById('univ-indicators')?.children;
                                if (carousel && indicators) {
                                    carousel.addEventListener('scroll', () => {
                                        const index = Math.round(carousel.scrollLeft / carousel.clientWidth);
                                        Array.from(indicators).forEach((dot, i) => {
                                            if (i === index) {
                                                dot.className = "w-2 h-2 rounded-full bg-white transition-all duration-300 w-4";
                                            } else {
                                                dot.className = "w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 transition-all duration-300";
                                            }
                                        });
                                    });
                                }
                            });
(function () {
                    let panelClockInterval = null;
                    let bpmInterval = null;
                    let heartsInterval = null;
                    // Activar barra DNA al entrar en viewport
                    var dnaObs = new IntersectionObserver(function (entries) {
                        entries.forEach(function (e) { if (e.isIntersecting) { document.querySelector('.dna-bar-inner').style.width = '100%'; dnaObs.disconnect(); } });
                    }, { threshold: 0.1 });
                    var dnaTarget = document.getElementById('dna-section') || document.getElementById('colores-yaire');
                    if (dnaTarget) dnaObs.observe(dnaTarget);

                    // Paleta modal data
                    // Build paletaData dynamically from active language
                    function getPaletaData() {
                        var d = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {};
                        function t(k, fb) { return d[k] || fb || ''; }

                        function moodBar(label, pct, fillClass) {
                            return '<div><div class="flex justify-between items-center mb-1"><span class="text-[11px] font-bold uppercase tracking-wider text-zinc-400">' + label + '</span><span class="text-[11px] font-bold ' + fillClass + '">' + pct + '</span></div><div class="pc-mood-bar"><div class="pc-mood-fill ' + fillClass.replace(/text-/, 'bg-') + '" style="--pct:' + pct + '"></div></div></div>';
                        }
                        function quote(txt, colorClass) {
                            return '<div class="mt-6 p-3.5 rounded-2xl bg-' + colorClass + '-50 dark:bg-' + colorClass + '-900/20 border border-' + colorClass + '-100 dark:border-' + colorClass + '-900/40"><p class="text-' + colorClass + '-800 dark:text-' + colorClass + '-300 text-sm font-medium italic leading-relaxed">' + txt + '</p></div>';
                        }
                        function tag(txt) { return '<span class="pc-tag bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">' + txt + '</span>'; }
                        function iconGrid(items) {
                            return '<div class="grid grid-cols-3 gap-2">' + items.map(function (i) { return '<div class="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3 text-center border border-zinc-100 dark:border-zinc-700"><p class="text-2xl mb-1">' + i[0] + '</p><p class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">' + i[1] + '</p></div>'; }).join('') + '</div>';
                        }
                        function psychBox(emoji, colorClass, psychText, headerLabel) {
                            return '<div class="rounded-2xl border border-' + colorClass + '-100 dark:border-' + colorClass + '-900/40 overflow-hidden"><div class="bg-' + colorClass + '-50 dark:bg-' + colorClass + '-900/20 px-4 py-3 border-b border-' + colorClass + '-100 dark:border-' + colorClass + '-900/40 flex items-center gap-2"><span class="text-base">' + emoji + '</span><span class="text-xs font-extrabold uppercase tracking-widest text-' + colorClass + '-700 dark:text-' + colorClass + '-400">' + headerLabel + '</span></div><div class="px-4 py-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">' + psychText + '</div></div>';
                        }
                        function note(txt) {
                            return '<div class="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-700"><span class="text-xl mt-0.5">✍️</span><p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic">' + txt + '</p></div>';
                        }

                        var psychLabel = t('modal_psych_label', 'Psicología del color');

                        return {
                            verde: {
                                hex: '#10B981',
                                swatch: 'linear-gradient(135deg,#6ee7b7,#10b981,#059669)',
                                title: t('pc_verde_name', 'Verde'),
                                sub: t('pc_verde_sub', 'Esmeralda'),
                                subClasses: 'text-emerald-600 dark:text-emerald-400',
                                desc: t('pc_verde_desc', 'Esperanza, naturaleza y tu paz interior.'),
                                moodsHtml: moodBar(t('pc_verde_m1', 'Energía'), '85%', 'text-emerald-600') + moodBar(t('pc_verde_m2', 'Calma'), '92%', 'text-emerald-600'),
                                quoteHtml: quote(t('modal_verde_quote', '"El verde es tu refugio. Me recuerda a tu capacidad de sanar y a la frescura de tu risa cuando todo está bien."'), 'emerald'),
                                tagsHtml: tag(t('modal_verde_tag3', 'Naturaleza')) + tag(t('modal_verde_tag4', 'Sanación')) + tag(t('modal_verde_tag5', 'Frescura')),
                                extraHtml: psychBox('🌿', 'emerald', t('modal_verde_psych', 'El verde activa el sistema nervioso parasimpático: literalmente <strong>baja la frecuencia cardíaca</strong> y reduce el cortisol.'), psychLabel) + iconGrid([['🌱', t('modal_verde_icon1', 'Crecimiento')], ['🍃', t('modal_verde_icon2', 'Equilibrio')], ['💚', t('modal_verde_icon3', 'Sanación')]]) + note(t('modal_verde_note', '"Cuando te imagino en tu elemento, siempre hay verde alrededor. Eres la persona que hace que todo lo que toca vuelva a florecer."'))
                            },
                            rojo: {
                                hex: '#F43F5E',
                                swatch: 'linear-gradient(135deg,#fda4af,#f43f5e,#be123c)',
                                title: t('pc_rojo_name', 'Rojo'),
                                sub: t('pc_rojo_sub', 'Pasión'),
                                subClasses: 'text-rose-500 dark:text-rose-400',
                                desc: t('pc_rojo_desc', 'Pasión, amor y determinación.'),
                                moodsHtml: moodBar(t('pc_rojo_m1', 'Pasión'), '97%', 'text-rose-500') + moodBar(t('pc_rojo_m2', 'Valentía'), '90%', 'text-rose-500'),
                                quoteHtml: quote(t('modal_rojo_quote', '"El rojo eres tú cuando luchas por lo que amas. Es la intensidad de tu amor y tu determinación de no rendirte."'), 'rose'),
                                tagsHtml: tag(t('modal_rojo_tag3', 'Valentía')) + tag(t('modal_rojo_tag4', 'Intensidad')) + tag(t('modal_rojo_tag5', 'Deseo')),
                                extraHtml: psychBox('🔥', 'rose', t('modal_rojo_psych', 'El rojo <strong>acelera el pulso y la respiración</strong>, aumenta la adrenalina y agudiza los reflejos. Es el color que el cerebro procesa más rápido.'), psychLabel) + iconGrid([['❤️‍🔥', t('modal_rojo_icon1', 'Pasión')], ['⚡', t('modal_rojo_icon2', 'Energía')], ['🦁', t('modal_rojo_icon3', 'Valentía')]]) + note(t('modal_rojo_note', '"El rojo en ti no es agresividad, es convicción. Es esa parte tuya que sabe exactamente lo que quiere y no para hasta conseguirlo."'))
                            },
                            rosa: {
                                hex: '#EC4899',
                                swatch: 'linear-gradient(135deg,#fbcfe8,#ec4899,#be185d)',
                                title: t('pc_rosa_name', 'Rosa'),
                                sub: t('pc_rosa_sub', 'Tulipán'),
                                subClasses: 'text-pink-500 dark:text-pink-400',
                                desc: t('pc_rosa_desc', 'Ternura, romanticismo y alegría.'),
                                moodsHtml: moodBar(t('pc_rosa_m1', 'Dulzura'), '95%', 'text-pink-500') + moodBar(t('pc_rosa_m2', 'Romanticismo'), '98%', 'text-pink-500'),
                                quoteHtml: quote(t('modal_rosa_quote', '"El rosa es tu esencia. Es la calidez de tus palabras, el aroma de tus tulipanes y la magia de tu ternura infinita."'), 'pink'),
                                tagsHtml: tag(t('modal_rosa_tag3', 'Romance')) + tag(t('modal_rosa_tag4', 'Delicadeza')) + tag(t('modal_rosa_tag5', 'Flores')),
                                extraHtml: psychBox('🌷', 'pink', t('modal_rosa_psych', 'El rosa genera liberación de <strong>oxitocina</strong>, la hormona del vínculo emocional. Estudios han demostrado que entornos rosas reducen la ansiedad en minutos.'), psychLabel) + iconGrid([['🌸', t('modal_rosa_icon1', 'Ternura')], ['🫶', t('modal_rosa_icon2', 'Cuidado')], ['🌷', t('modal_rosa_icon3', 'Belleza')]]) + note(t('modal_rosa_note', '"El rosa eres tú en tu forma más pura. La que cuida sin pedir nada a cambio, la que da amor sin miedo."'))
                            },
                            morado: {
                                hex: '#8B5CF6',
                                swatch: 'linear-gradient(135deg,#ddd6fe,#8b5cf6,#5b21b6)',
                                title: t('pc_morado_name', 'Morado'),
                                sub: t('pc_morado_sub', 'Sueño'),
                                subClasses: 'text-violet-500 dark:text-violet-400',
                                desc: t('pc_morado_desc', 'Creatividad, misterio y sueños.'),
                                moodsHtml: moodBar(t('pc_morado_m1', 'Creatividad'), '88%', 'text-violet-500') + moodBar(t('pc_morado_m2', 'Intuición'), '94%', 'text-violet-500'),
                                quoteHtml: quote(t('modal_morado_quote', '"El morado es tu chispa creativa. Es la magia de tus sueños y esa parte única tuya que me fascina cada día más."'), 'violet'),
                                tagsHtml: tag(t('modal_morado_tag3', 'Intuición')) + tag(t('modal_morado_tag4', 'Sueños')) + tag(t('modal_morado_tag5', 'Unicidad')),
                                extraHtml: psychBox('✨', 'violet', t('modal_morado_psych', 'El morado es el color más difícil de reproducir en la naturaleza, lo que lo convierte en el más <strong>asociado con lo único e irrepetible</strong>.'), psychLabel) + iconGrid([['🔮', t('modal_morado_icon1', 'Misterio')], ['💜', t('modal_morado_icon2', 'Magia')], ['🌙', t('modal_morado_icon3', 'Sueños')]]) + note(t('modal_morado_note', '"El morado en ti es ese universo interior que pocos llegan a ver del todo. Una profundidad que me atrae y me maravilla."'))
                            }
                        };
                    }

                    window.pcClosePaletaModal = function () {
                        AudioManager.play('flyout.wav', 0.6);
                        var m = document.getElementById('paleta-modal');
                        if (!m || m.classList.contains('hidden')) return;
                        m.classList.add('pc-closing');
                        setTimeout(function () {
                            m.classList.remove('pc-closing');
                            m.classList.add('hidden');
                            document.body.style.overflow = '';
                        }, 260);
                    };

                    var _currentModalHex = '';
                    window.pcModalCopyHex = function () {
                        if (!_currentModalHex) return;
                        navigator.clipboard.writeText(_currentModalHex).then(function () {
                            var chip = document.getElementById('paleta-modal-hex-chip');
                            var icon = chip ? chip.querySelector('.chip-icon') : null;
                            if (icon) { icon.textContent = '✓'; setTimeout(function () { icon.textContent = '📋'; }, 1600); }
                            var t = document.getElementById('paleta-toast2');
                            var dict = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {}; t.textContent = '✓ ' + _currentModalHex + ' ' + (dict.hex_copied || 'copiado');
                            t.classList.add('show');
                            setTimeout(function () { t.classList.remove('show'); }, 2000);
                        });
                    };

                    window.pcOpenPaleta = function (key) {
                        AudioManager.play('entry.wav', 0.6);
                        var paletaData = getPaletaData();
                        var d = paletaData[key];
                        if (!d) return;
                        var m = document.getElementById('paleta-modal');
                        if (!m) return;
                        m.classList.remove('paleta-bars-in');

                        _currentModalHex = d.hex || '';
                        // Hex chip
                        var chip = document.getElementById('paleta-modal-hex-chip');
                        var swatchEl = document.getElementById('paleta-modal-hex-swatch');
                        var codeEl = document.getElementById('paleta-modal-hex-code');
                        if (swatchEl) swatchEl.style.background = d.hex || '';
                        if (codeEl) codeEl.textContent = d.hex || '';
                        if (chip) chip.querySelector('.chip-icon').textContent = '📋';

                        var modalSwatch = document.getElementById('paleta-modal-swatch');
                        var modalTitle = document.getElementById('paleta-modal-title');
                        if (modalSwatch) modalSwatch.style.background = d.swatch;
                        if (modalTitle) modalTitle.textContent = d.title;
                        var subEl = document.getElementById('paleta-modal-sub');
                        if (subEl) {
                            subEl.textContent = d.sub;
                            subEl.className = 'text-sm md:text-base font-semibold mt-1 ' + d.subClasses;
                        }
                        var modalDesc = document.getElementById('paleta-modal-desc');
                        var modalMoods = document.getElementById('paleta-modal-moods');
                        var modalQuote = document.getElementById('paleta-modal-quote');
                        var modalTags = document.getElementById('paleta-modal-tags');
                        if (modalDesc) modalDesc.textContent = d.desc;
                        if (modalMoods) modalMoods.innerHTML = d.moodsHtml;
                        if (modalQuote) modalQuote.innerHTML = d.quoteHtml;
                        if (modalTags) modalTags.innerHTML = d.tagsHtml;
                        var extraEl = document.getElementById('paleta-modal-extra');
                        if (extraEl) extraEl.innerHTML = d.extraHtml || '';

                        document.body.style.overflow = 'hidden';
                        m.classList.remove('hidden');
                        requestAnimationFrame(function () {
                            requestAnimationFrame(function () {
                                m.classList.add('paleta-bars-in');
                            });
                        });
                    };

                    document.addEventListener('keydown', function (e) {
                        if (e.key === 'Escape') {
                            var paleta = document.getElementById('paleta-modal');
                            if (paleta && !paleta.classList.contains('hidden')) { window.pcClosePaletaModal(); return; }
                            var redirect = document.getElementById('redirect-modal');
                            if (redirect && !redirect.classList.contains('hidden')) { closeModal('redirect-modal', 'redirect-content'); return; }
                            var recipe = document.getElementById('recipe-modal');
                            if (recipe && !recipe.classList.contains('hidden')) { closeModal('recipe-modal', 'recipe-content'); return; }
                        }
                    });

                    // Toggle cards
                    window.pcToggle = function (card, emoji) {
                        var was = card.classList.contains('pce');
                        document.querySelectorAll('#view-grid2 .pc-card.pce').forEach(function (c) {
                            c.classList.remove('pce');
                            var a = c.querySelector('.pc-arrow'); if (a) a.style.transform = '';
                        });
                        if (!was) {
                            card.classList.add('pce');
                            var arr = card.querySelector('.pc-arrow'); if (arr) arr.style.transform = 'rotate(180deg)';
                            pcSpawn(emoji);
                        }
                    };

                    window.pcSpawn = function (e) {
                        var el = document.createElement('div');
                        el.className = 'float-emoji'; el.textContent = e;
                        el.style.left = (Math.random() * window.innerWidth * .7 + window.innerWidth * .15) + 'px';
                        el.style.top = (Math.random() * window.innerHeight * .5 + window.innerHeight * .2) + 'px';
                        document.body.appendChild(el);
                        setTimeout(function () { el.remove(); }, 1300);
                    };

                    window.pcCopyHex = function (hex) {
                        navigator.clipboard.writeText(hex).then(function () {
                            var t = document.getElementById('paleta-toast2');
                            var dict = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {}; t.textContent = '✓ ' + hex + ' ' + (dict.hex_copied || 'copiado'); t.classList.add('show');
                            setTimeout(function () { t.classList.remove('show'); }, 2200);
                        });
                    };

                    window.setPV = function (v) {
                        AudioManager.play('language.wav', 0.6);
                        var grid = document.getElementById('view-grid2');
                        var list = document.getElementById('view-list2');
                        var mixer = document.getElementById('view-mixer2');
                        if (grid) grid.classList.toggle('hidden', v !== 'grid');
                        if (list) list.classList.toggle('hidden', v !== 'list');
                        if (mixer) mixer.classList.toggle('hidden', v !== 'mixer');
                        ['pvg', 'pvl', 'pvm'].forEach(function (id, i) {
                            var btn = document.getElementById(id);
                            if (btn) btn.classList.toggle('active', ['grid', 'list', 'mixer'][i] === v);
                        });
                        // Re-trigger entrada con reflow
                        var target = document.getElementById('view-' + (v === 'grid' ? 'grid2' : v === 'list' ? 'list2' : 'mixer2'));
                        if (!target) return;
                        target.classList.remove('pc-entering');
                        void target.offsetWidth;
                        target.classList.add('pc-entering');
                    };

                    // ── MIXER PHYSICS ENGINE ──
                    function getMixerCombos() {
                        var d = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {};
                        function t(k, fb) { return d[k] || fb; }
                        return {
                            '0-1': { title: t('mix_01_title', 'Fuerza Natural'), emoji: '🌿🔥', desc: t('mix_01_desc', 'Verde y rojo juntos: la fuerza de quien cuida y lucha al mismo tiempo.') },
                            '0-2': { title: t('mix_02_title', 'Amor en Flor'), emoji: '🌸🌿', desc: t('mix_02_desc', 'La combinación más Yaire. Ternura que brota de la tierra.') },
                            '0-3': { title: t('mix_03_title', 'Bruja del Bosque'), emoji: '🌿✨', desc: t('mix_03_desc', 'Creatividad que florece desde la naturaleza. Misterio y calma.') },
                            '1-2': { title: t('mix_12_title', 'Corazón en Llamas'), emoji: '🔥🌷', desc: t('mix_12_desc', 'Pasión con ternura, fuerza con delicadeza.') },
                            '1-3': { title: t('mix_13_title', 'Volcán Mágico'), emoji: '🔥✨', desc: t('mix_13_desc', 'Creatividad explosiva. Una energía que no se puede ignorar.') },
                            '2-3': { title: t('mix_23_title', 'Universo Rosado'), emoji: '🌸✨', desc: t('mix_23_desc', 'Tu firma cósmica. Ternura de sueños en un universo tuyo.') }
                        };
                    }
                    var mixerSel = [null, null];
                    var mixerResultHex = '';

                    function h2r(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
                    function r2h(r, g, b) { return '#' + [r, g, b].map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }

                    // Physics blobs
                    var mixerCtx, mixerCanvas, mixerBalls = [], mixerRaf, mixerW, mixerH;
                    var _mixerVisible = false;
                    function initMixerCanvas() {
                        mixerCanvas = document.getElementById('mixer-canvas');
                        if (!mixerCanvas) return;
                        mixerCtx = mixerCanvas.getContext('2d');
                        resizeMixer();
                        window.addEventListener('resize', resizeMixer);
                        mixerCanvas.addEventListener('pointerdown', mixerPokeNearest);
                        mixerCanvas.addEventListener('pointermove', function (e) { if (e.buttons) mixerPokeNearest(e); });
                    }
                    function resizeMixer() {
                        if (!mixerCanvas) return;
                        mixerW = mixerCanvas.offsetWidth;
                        mixerH = mixerCanvas.offsetHeight;
                        mixerCanvas.width = mixerW;
                        mixerCanvas.height = mixerH;
                    }
                    function mixerPokeNearest(e) {
                        var rect = mixerCanvas.getBoundingClientRect();
                        var mx = (e.clientX - rect.left) * (mixerCanvas.width / rect.width);
                        var my = (e.clientY - rect.top) * (mixerCanvas.height / rect.height);
                        mixerBalls.forEach(function (b) {
                            var dx = b.x - mx, dy = b.y - my, d = Math.sqrt(dx * dx + dy * dy);
                            if (d < 120) { var f = Math.min(18, (120 - d) / 6 + 2); b.vx += (dx / d) * f; b.vy += (dy / d) * f; }
                        });
                    }
                    function spawnBall(color, count) {
                        for (var i = 0; i < count; i++) {
                            var r = 18 + Math.random() * 14;
                            mixerBalls.push({
                                x: mixerW * 0.2 + Math.random() * mixerW * 0.6,
                                y: mixerH * 0.2 + Math.random() * mixerH * 0.6,
                                vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
                                r: r, color: color, alpha: 0, targetAlpha: 0.88
                            });
                        }
                    }
                    function mixerLoop() {
                        if (!mixerCtx) return;
                        var isDark = document.documentElement.classList.contains('dark');
                        mixerCtx.clearRect(0, 0, mixerW, mixerH);
                        var alive = mixerBalls.filter(function (b) { return b.alpha > 0.01 || b.targetAlpha > 0; });
                        mixerBalls = alive;

                        // Metaball blending via layered circles with soft edges
                        mixerBalls.forEach(function (b) {
                            b.alpha += (b.targetAlpha - b.alpha) * 0.06;
                            // physics
                            b.vx *= 0.978; b.vy *= 0.978;
                            b.vy += 0.12; // slight gravity
                            b.x += b.vx; b.y += b.vy;
                            // wall bounce with soft damping
                            if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.7; }
                            if (b.x + b.r > mixerW) { b.x = mixerW - b.r; b.vx = -Math.abs(b.vx) * 0.7; }
                            if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy) * 0.7; }
                            if (b.y + b.r > mixerH) { b.y = mixerH - b.r; b.vy = -Math.abs(b.vy) * 0.7; }
                            // ball-ball repulsion
                            mixerBalls.forEach(function (o) {
                                if (o === b) return;
                                var dx = b.x - o.x, dy = b.y - o.y, d = Math.sqrt(dx * dx + dy * dy) || 1, minD = b.r + o.r + 4;
                                if (d < minD) { var push = (minD - d) / d * 0.45; b.vx += dx * push; b.vy += dy * push; }
                            });
                        });

                        // Draw with radial gradient glow
                        mixerBalls.forEach(function (b) {
                            var g = mixerCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 1.4);
                            g.addColorStop(0, hexAlpha(b.color, b.alpha));
                            g.addColorStop(0.65, hexAlpha(b.color, b.alpha * 0.82));
                            g.addColorStop(1, hexAlpha(b.color, 0));
                            mixerCtx.beginPath();
                            mixerCtx.arc(b.x, b.y, b.r * 1.4, 0, Math.PI * 2);
                            mixerCtx.fillStyle = g;
                            mixerCtx.fill();
                        });
                        // Draw crisp core on top
                        mixerBalls.forEach(function (b) {
                            mixerCtx.beginPath();
                            mixerCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                            mixerCtx.fillStyle = hexAlpha(b.color, b.alpha);
                            mixerCtx.fill();
                        });

                        if (_mixerVisible) mixerRaf = requestAnimationFrame(mixerLoop);
                    }
                    function hexAlpha(hex, a) {
                        var rv = h2r(hex); return 'rgba(' + rv[0] + ',' + rv[1] + ',' + rv[2] + ',' + a.toFixed(3) + ')';
                    }
                    function startMixerLoop() {
                        if (mixerRaf) cancelAnimationFrame(mixerRaf);
                        _mixerVisible = true;
                        mixerLoop();
                    }

                    // Pause mixer physics when not visible to save CPU
                    var mixerVisObs = new IntersectionObserver(function (entries) {
                        _mixerVisible = entries[0].isIntersecting;
                        if (_mixerVisible && !mixerRaf && mixerBalls.length > 0) startMixerLoop();
                        if (!_mixerVisible && mixerRaf) { cancelAnimationFrame(mixerRaf); mixerRaf = null; }
                    }, { threshold: 0 });
                    var _mixerEl = document.getElementById('view-mixer2');
                    if (_mixerEl) mixerVisObs.observe(_mixerEl);

                    window.mixSelect = function (btn) {
                        var color = btn.dataset.color, name = btn.dataset.name, idx = parseInt(btn.dataset.idx);
                        // toggle off if already selected
                        var existingSlot = -1;
                        mixerSel.forEach(function (s, i) { if (s && s.idx === idx) existingSlot = i; });
                        if (existingSlot >= 0) {
                            AudioManager.play('colors.wav', 0.6);
                            mixerSel[existingSlot] = null;
                            btn.querySelector('.mix-btn-ring').style.opacity = '0';
                            btn.querySelector('div').style.transform = '';
                            // fade out balls of that color
                            mixerBalls.forEach(function (b) { if (b.color === color) b.targetAlpha = 0; });
                            mixerUpdateResult();
                            return;
                        }
                        var slot = mixerSel[0] === null ? 0 : (mixerSel[1] === null ? 1 : 0);
                        // deselect previous in that slot
                        if (mixerSel[slot]) {
                            var old = mixerSel[slot];
                            document.querySelectorAll('.mix-btn').forEach(function (b2) {
                                if (parseInt(b2.dataset.idx) === old.idx) {
                                    b2.querySelector('.mix-btn-ring').style.opacity = '0';
                                    b2.querySelector('div').style.transform = '';
                                }
                            });
                            mixerBalls.forEach(function (b) { if (b.color === old.color) b.targetAlpha = 0; });
                        }
                        mixerSel[slot] = { color: color, name: name, idx: idx };
                        if (mixerSel[0] !== null && mixerSel[1] !== null) {
                            AudioManager.play('revelacion.wav', 0.8);
                        } else {
                            AudioManager.play('colors.wav', 0.6);
                        }
                        btn.querySelector('.mix-btn-ring').style.opacity = '1';
                        btn.querySelector('div').style.transform = 'scale(1.12)';
                        // hide hint
                        var hint = document.getElementById('mixer-hint');
                        if (hint) hint.style.opacity = '0';
                        // spawn blobs
                        spawnBall(color, 14 + Math.floor(Math.random() * 6));
                        startMixerLoop();
                        mixerUpdateResult();
                    };

                    function mixerUpdateResult() {
                        var A = mixerSel[0], B = mixerSel[1];
                        var bar = document.getElementById('mixer-result-bar');
                        if (A && B) {
                            var ra = h2r(A.color), rb = h2r(B.color);
                            var rm = Math.round((ra[0] + rb[0]) / 2), gm = Math.round((ra[1] + rb[1]) / 2), bm = Math.round((ra[2] + rb[2]) / 2);
                            mixerResultHex = r2h(rm, gm, bm);
                            var key = [A.idx, B.idx].sort().join('-'), c = getMixerCombos()[key] || { title: A.name + ' + ' + B.name, emoji: '🎨', desc: (typeof dictionary !== 'undefined' && dictionary[currentLang] ? dictionary[currentLang].mix_default || 'Una mezcla única.' : 'Una mezcla única.') };
                            var sw = document.getElementById('mixer-result-swatch');
                            var ti = document.getElementById('mixer-result-title');
                            var de = document.getElementById('mixer-result-desc');
                            var em = document.getElementById('mixer-result-emoji');
                            var cp = document.getElementById('mixer-copy-hex');
                            if (sw) { sw.style.background = 'linear-gradient(135deg,' + A.color + ',' + mixerResultHex + ',' + B.color + ')'; sw.style.boxShadow = '0 4px 14px ' + mixerResultHex + '66'; }
                            if (ti) ti.textContent = c.title;
                            if (de) de.textContent = c.desc;
                            if (em) em.textContent = c.emoji;
                            if (cp) cp.textContent = mixerResultHex;
                            if (bar) bar.classList.remove('hidden');
                        } else {
                            mixerResultHex = '';
                            if (bar) bar.classList.add('hidden');
                        }
                    }

                    window.mixerCopyResult = function () {
                        if (!mixerResultHex) return;
                        navigator.clipboard.writeText(mixerResultHex).then(function () {
                            AudioManager.play('seleccionsi.wav', 0.6);
                            var btn = document.getElementById('mixer-copy-hex');
                            if (btn) { var dict2 = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {}; btn.textContent = '✓ ' + (dict2.hex_copied || 'copiado') + '!'; setTimeout(function () { btn.textContent = mixerResultHex; }, 1500); }
                        });
                    };

                    window.mixerReset = function () {
                        AudioManager.play('flyout.wav', 0.6);
                        mixerSel = [null, null];
                        mixerBalls.forEach(function (b) { b.targetAlpha = 0; });
                        document.querySelectorAll('.mix-btn').forEach(function (b) {
                            b.querySelector('.mix-btn-ring').style.opacity = '0';
                            b.querySelector('div').style.transform = '';
                        });
                        var hint = document.getElementById('mixer-hint');
                        if (hint) hint.style.opacity = '1';
                        var bar = document.getElementById('mixer-result-bar');
                        if (bar) bar.classList.add('hidden');
                        mixerResultHex = '';
                    };

                    // Init mixer when view becomes visible
                    var origSetPV = window.setPV;
                    window.setPV = function (v) {
                        origSetPV(v);
                        if (v === 'mixer') {
                            setTimeout(function () {
                                if (!mixerCtx) initMixerCanvas();
                                else resizeMixer();
                                if (!mixerRaf) startMixerLoop();
                            }, 50);
                        }
                    };
                })();
(function () {
                    const card = document.getElementById('memorial-card');
                    const canvas = document.getElementById('memorial-canvas');
                    if (!card || !canvas) return;

                    let cardRect = null;
                    function updateCardRect() {
                        cardRect = card.getBoundingClientRect();
                    }
                    updateCardRect();

                    // Hover Glow
                    card.addEventListener('mouseenter', updateCardRect);
                    let _cardRaf;
                    card.addEventListener('mousemove', (e) => {
                        if (_cardRaf) cancelAnimationFrame(_cardRaf);
                        _cardRaf = requestAnimationFrame(() => {
                            if (!cardRect) updateCardRect();
                            const x = e.clientX - cardRect.left;
                            const y = e.clientY - cardRect.top;
                            card.style.setProperty('--mouse-x', `${x}px`);
                            card.style.setProperty('--mouse-y', `${y}px`);

                            // mouse influence for particles (only when hovering inside card)
                            mousePos.x = x;
                            mousePos.y = y;
                        });
                    });

                    card.addEventListener('mouseleave', () => {
                        mousePos.x = null;
                        mousePos.y = null;
                    });

                    // Particles Canvas logic
                    const ctx = canvas.getContext('2d');
                    let particles = [];
                    let w, h;
                    let mousePos = { x: null, y: null };
                    let animFrame;

                    function resize() {
                        updateCardRect();
                        const rect = cardRect;
                        w = canvas.width = rect.width;
                        h = canvas.height = rect.height;
                    }

                    class Particle {
                        constructor() {
                            this.reset(true);
                        }
                        reset(randomY) {
                            this.x = Math.random() * w;
                            this.y = randomY ? Math.random() * h : h + 10;
                            this.size = Math.random() * 1.5 + 0.5;
                            this.speedY = -(Math.random() * 0.4 + 0.1);
                            this.speedX = (Math.random() - 0.5) * 0.3;
                            this.life = Math.random() * 0.8 + 0.2;
                            this.glow = Math.random() * 0.5 + 0.2;
                            this.baseColor = Math.random() > 0.5 ? '255, 235, 180' : '255, 255, 255';
                        }
                        update() {
                            this.y += this.speedY;
                            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.3; // subtle sway
                            this.life -= 0.002;

                            // cursor interaction
                            if (mousePos.x !== null && mousePos.y !== null) {
                                const dx = mousePos.x - this.x;
                                const dy = mousePos.y - this.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                if (dist < 120) {
                                    this.x -= dx * 0.015;
                                    this.y -= dy * 0.015;
                                    this.glow = Math.min(1.0, this.glow + 0.05);
                                }
                            }

                            if (this.y < -10 || this.x < -10 || this.x > w + 10 || this.life <= 0) {
                                this.reset(false);
                            }
                        }
                        draw() {
                            ctx.beginPath();
                            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                            const alpha = Math.max(0, Math.min(this.glow, this.life * 2));
                            ctx.fillStyle = `rgba(${this.baseColor}, ${alpha})`;
                            ctx.fill();

                            // add a subtle blur pass around the particle if it's very bright
                            if (alpha > 0.7) {
                                ctx.shadowBlur = 5;
                                ctx.shadowColor = `rgba(${this.baseColor}, ${alpha})`;
                            } else {
                                ctx.shadowBlur = 0;
                            }
                        }
                    }

                    let _resizeAttached = false;
                    function initParticles() {
                        resize();
                        particles = [];
                        for (let i = 0; i < 60; i++) particles.push(new Particle());
                        // Guard: evitar duplicar el listener resize si initParticles se llama más de una vez
                        if (!_resizeAttached) {
                            window.addEventListener('resize', resize, { passive: true });
                            _resizeAttached = true;
                        }
                    }

                    function loop() {
                        ctx.clearRect(0, 0, w, h);
                        ctx.globalCompositeOperation = 'lighter';
                        particles.forEach(p => { p.update(); p.draw(); });
                        animFrame = requestAnimationFrame(loop);
                    }

                    // Intersection Observer for animations
                    const obs = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const staggers = card.querySelectorAll('.memorial-staggered');
                                staggers.forEach(el => el.classList.add('visible'));

                                if (!particles.length) initParticles();
                                // Reanudar loop si fue cancelado al salir de pantalla
                                if (!animFrame) loop();
                            } else {
                                // Cancelar rAF cuando la sección sale del viewport — ahorra GPU/CPU
                                if (animFrame) {
                                    cancelAnimationFrame(animFrame);
                                    animFrame = null;
                                }
                            }
                        });
                    }, { threshold: 0.2 });

                    setTimeout(() => {
                        obs.observe(card);
                    }, 500); // small delay to ensure DOM is ready
                })();
(function () {
                    // Live clock — cachear referencia fuera de la función (se llama cada 1000ms)
                    var _clockEl = document.getElementById('panel-live-clock');
                    function updatePanelClock() {
                        if (!_clockEl) _clockEl = document.getElementById('panel-live-clock');
                        if (!_clockEl) return;
                        var now = new Date();
                        _clockEl.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    }
                    panelClockInterval = setInterval(updatePanelClock, 1000);
                    updatePanelClock();

                    // Days counter — cachear ref del elemento
                    var _daysEl = document.getElementById('days-counter');
                    function updateDaysCounter() {
                        if (!_daysEl) _daysEl = document.getElementById('days-counter');
                        var startDate = new Date('2026-01-17T00:00:00');
                        var now = new Date();
                        var diff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
                        if (_daysEl) _daysEl.textContent = diff;
                    }
                    updateDaysCounter();

                    // BPM fluctuation
                    var bpmEl = document.getElementById('bpm-value');
                    if (bpmEl) {
                        bpmInterval = setInterval(function () {
                            var bpm = 175 + Math.floor(Math.random() * 15);
                            bpmEl.textContent = bpm;
                        }, 2000);
                    }

                    // Floating hearts in BPM card
                    var heartsContainer = document.getElementById('bpm-hearts-container');
                    if (heartsContainer) {
                        heartsInterval = setInterval(function () {
                            // Cap DOM nodes: skip spawn if already 12 hearts active
                            if (heartsContainer.children.length >= 12) return;
                            var h = document.createElement('span');
                            h.textContent = ['❤️', '💖', '💗', '💓'][Math.floor(Math.random() * 4)];
                            h.style.cssText = 'position:absolute;bottom:0;font-size:' + (12 + Math.random() * 14) + 'px;left:' + (Math.random() * 100) + '%;opacity:0.6;animation:panel-heart-float ' + (2 + Math.random() * 2) + 's ease-out forwards;pointer-events:none;';
                            heartsContainer.appendChild(h);
                            setTimeout(function () { if (h.parentNode) h.remove(); }, 4000);
                        }, 800);
                    }

                    let _isPanelVisible = true;
                    const panelObs = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            _isPanelVisible = entry.isIntersecting;
                            if (!_isPanelVisible || document.hidden) {
                                if (panelClockInterval) { clearInterval(panelClockInterval); panelClockInterval = null; }
                                if (bpmInterval) { clearInterval(bpmInterval); bpmInterval = null; }
                                if (heartsInterval) { clearInterval(heartsInterval); heartsInterval = null; }
                            } else {
                                if (!panelClockInterval) panelClockInterval = setInterval(updatePanelClock, 1000);
                                if (bpmEl && !bpmInterval) {
                                    bpmInterval = setInterval(function () {
                                        var bpm = 175 + Math.floor(Math.random() * 15);
                                        bpmEl.textContent = bpm;
                                    }, 2000);
                                }
                                if (heartsContainer && !heartsInterval) {
                                    heartsInterval = setInterval(function () {
                                        if (heartsContainer.children.length >= 12) return;
                                        var h = document.createElement('span');
                                        h.textContent = ['❤️', '💖', '💗', '💓'][Math.floor(Math.random() * 4)];
                                        h.style.cssText = 'position:absolute;bottom:0;font-size:' + (12 + Math.random() * 14) + 'px;left:' + (Math.random() * 100) + '%;opacity:0.6;animation:panel-heart-float ' + (2 + Math.random() * 2) + 's ease-out forwards;pointer-events:none;';
                                        heartsContainer.appendChild(h);
                                        setTimeout(function () { if (h.parentNode) h.remove(); }, 4000);
                                    }, 800);
                                }
                            }
                        });
                    }, { threshold: 0.1 });

                    if (document.getElementById('dashboard')) {
                        panelObs.observe(document.getElementById('dashboard'));
                    } else if (bpmEl) {
                        panelObs.observe(bpmEl);
                    }

                    document.addEventListener('visibilitychange', function () {
                        if (document.hidden) {
                            if (panelClockInterval) { clearInterval(panelClockInterval); panelClockInterval = null; }
                            if (bpmInterval) { clearInterval(bpmInterval); bpmInterval = null; }
                            if (heartsInterval) { clearInterval(heartsInterval); heartsInterval = null; }
                        } else if (_isPanelVisible) {
                            if (!panelClockInterval) panelClockInterval = setInterval(updatePanelClock, 1000);
                            if (bpmEl && !bpmInterval) {
                                bpmInterval = setInterval(function () {
                                    var bpm = 175 + Math.floor(Math.random() * 15);
                                    bpmEl.textContent = bpm;
                                }, 2000);
                            }
                            if (heartsContainer && !heartsInterval) {
                                heartsInterval = setInterval(function () {
                                    if (heartsContainer.children.length >= 12) return;
                                    var h = document.createElement('span');
                                    h.textContent = ['❤️', '💖', '💗', '💓'][Math.floor(Math.random() * 4)];
                                    h.style.cssText = 'position:absolute;bottom:0;font-size:' + (12 + Math.random() * 14) + 'px;left:' + (Math.random() * 100) + '%;opacity:0.6;animation:panel-heart-float ' + (2 + Math.random() * 2) + 's ease-out forwards;pointer-events:none;';
                                    heartsContainer.appendChild(h);
                                    setTimeout(function () { if (h.parentNode) h.remove(); }, 4000);
                                }, 800);
                            }
                        }
                    });

                    // Gauge animation on scroll
                    var gaugesAnimated = false;
                    var gaugeObs = new IntersectionObserver(function (entries) {
                        entries.forEach(function (e) {
                            if (e.isIntersecting && !gaugesAnimated) {
                                gaugesAnimated = true;
                                document.querySelectorAll('.gauge-card').forEach(function (card, i) {
                                    setTimeout(function () {
                                        var pct = parseFloat(card.dataset.gaugePct) || 0;
                                        var ring = card.querySelector('.gauge-ring');
                                        var val = card.querySelector('.gauge-value');
                                        var circumference = 113.1;
                                        var offset = circumference - (pct / 100 * circumference);
                                        if (ring) ring.style.strokeDashoffset = offset;
                                        // Animate number
                                        var start = 0;
                                        var duration = 1200;
                                        var startTime = null;
                                        function animate(ts) {
                                            if (!startTime) startTime = ts;
                                            var progress = Math.min((ts - startTime) / duration, 1);
                                            var current = Math.round(progress * pct);
                                            if (val) val.textContent = current + '%';
                                            if (progress < 1) requestAnimationFrame(animate);
                                        }
                                        requestAnimationFrame(animate);
                                    }, i * 120);
                                });
                                gaugeObs.disconnect();
                            }
                        });
                    }, { threshold: 0.05, rootMargin: '50px 0px' });
                    var gaugeSection = document.getElementById('estadisticas');
                    if (gaugeSection) gaugeObs.observe(gaugeSection);
                })();
function toggleSongLyric(el) {
                    if (typeof AudioManager !== 'undefined') AudioManager.play(el.classList.contains('active') ? 'seleccionno.wav' : 'seleccionsi.wav', 0.4);
                    el.classList.toggle('active');
                }
                function toggleAllSongLyrics() {
                    if (typeof AudioManager !== 'undefined') AudioManager.play('revelacion.wav', 0.5);
                    const container = document.getElementById('song-lyrics-container');
                    const sections = container.querySelectorAll('.song-lyric-section');
                    const btn = document.getElementById('song-expand-all-btn');
                    const allOpen = [...sections].every(s => s.classList.contains('active'));
                    sections.forEach(s => {
                        if (allOpen) s.classList.remove('active');
                        else s.classList.add('active');
                    });
                    const d = window.dictionary && window.dictionary[window.currentLang || 'es'] || {};
                    btn.textContent = allOpen ? (d.song_expand_all || 'Expandir Toda la Letra') : (d.song_collapse_all || 'Colapsar Letra');
                }

                // ═══ COUNTDOWN LOCK SYSTEM ═══
                (function initSongLock() {
                    const UNLOCK_DATE = new Date('2020-04-28T00:00:00-04:00'); // Changed to past date so JS unlocks instantly
                    const overlay = document.getElementById('song-lock-overlay');
                    const content = document.getElementById('song-content-wrapper');
                    const daysEl = document.getElementById('lock-days');
                    const hoursEl = document.getElementById('lock-hours');
                    const minsEl = document.getElementById('lock-mins');
                    const secsEl = document.getElementById('lock-secs');
                    const menuBadge = document.getElementById('menu-song-lock-badge');
                    const menuDaysEl = document.getElementById('menu-song-lock-days');
                    const menuIcon = document.getElementById('menu-song-icon');
                    const menuLabel = document.getElementById('menu-song-label');

                    const menuGamesBadge = document.getElementById('menu-games-lock-badge');
                    const menuGamesDaysEl = document.getElementById('menu-games-lock-days');

                    const menuVaultBadge = document.getElementById('menu-vault-lock-badge');
                    const menuVaultDaysEl = document.getElementById('menu-vault-lock-days');

                    // Universe Carousel Elements
                    const univSlide = document.getElementById('univ-song-slide');
                    const univPrev = document.getElementById('univ-btn-prev');
                    const univNext = document.getElementById('univ-btn-next');
                    const univPlayer = document.getElementById('univ-song-player-container');

                    function unlock() {
                        if (overlay) {
                            overlay.classList.add('unlocked');
                            setTimeout(() => overlay.style.display = 'none', 1600);
                        }
                        if (content) content.classList.add('unlocked');
                        // Unlock the menu
                        if (menuBadge) menuBadge.style.display = 'none';
                        if (menuGamesBadge) menuGamesBadge.style.display = 'none';
                        if (menuVaultBadge) menuVaultBadge.style.display = 'none';
                        if (menuIcon) menuIcon.textContent = '🎶';
                        if (menuLabel) { menuLabel.style.filter = 'none'; menuLabel.style.userSelect = 'auto'; }

                        const enigmaSection = document.getElementById('enigma-28');
                        if (enigmaSection) enigmaSection.id = 'tu-cancion';
                        const menuSongLink = document.getElementById('menu-song-link');
                        if (menuSongLink) menuSongLink.setAttribute('href', '#tu-cancion');

                        // Unlock Universe Carousel Card
                        if (univSlide) {
                            // Decode and inject entire slide HTML to prevent source code leak
                            if (!univSlide.dataset.unlocked) {
                                const payload = "PGRpdiBjbGFzcz0iYWJzb2x1dGUgLXJpZ2h0LTggLWJvdHRvbS04IHRleHQtWzEwcmVtXSBvcGFjaXR5LVswLjA0XSBwb2ludGVyLWV2ZW50cy1ub25lIHNlbGVjdC1ub25lIj7wn4y3PC9kaXY+PGRpdiBjbGFzcz0icmVsYXRpdmUgei0xMCB3LWZ1bGwiPjxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIG1iLTQiPjxzcGFuIGNsYXNzPSJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNSBweC0zIHB5LTEgcm91bmRlZC1mdWxsIGJnLXR1bGlwLTUwMC8xNSBib3JkZXIgYm9yZGVyLXR1bGlwLTUwMC8zMCB0ZXh0LXR1bGlwLTQwMCB0ZXh0LVsxMHB4XSBmb250LWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVzdCIgZGF0YS1pMThuPSJ1bml2X3VubG9ja19iYWRnZSI+8J+OgiAzIE1lc2VzIEp1bnRvczwvc3Bhbj48L2Rpdj48aDMgY2xhc3M9InRleHQtMnhsIG1kOnRleHQtM3hsIGZvbnQtZXh0cmFib2xkIHRleHQtd2hpdGUgbWItMSBsZWFkaW5nLXRpZ2h0IiBkYXRhLWkxOG49InVuaXZfdW5sb2NrX3RpdGxlIj5UdWxpcGFuZXMgUGEnIFlhaXJlPC9oMz48cCBjbGFzcz0idGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtdHVsaXAtNDAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlc3QgbWItNCI+Q2hhcmxlcyBHdXN0YXYgwrcgSmVyc2V5IENsdWIgw5cgQ2luZW1hdGljIFRocmlsbGVyPC9wPjxwIGNsYXNzPSJ0ZXh0LXppbmMtNDAwIHRleHQtc20gbWQ6dGV4dC1iYXNlIG1iLTYgbGVhZGluZy1yZWxheGVkIG1heC13LW1kIiBkYXRhLWkxOG49InVuaXZfdW5sb2NrX2Rlc2MiPlVuYSBjYW5jacOzbiBjb21wdWVzdGEgZGVzZGUgY2Vybywgc29sbyBwYXJhIHRpLiBDYWRhIGJlYXQsIGNhZGEgdmlvbMOtbiB5IGNhZGEgbGV0cmEgdGllbmUgdHUgbm9tYnJlLiBFc3RlIGVzIGVsIHNvdW5kdHJhY2sgb2ZpY2lhbCBkZSBub3NvdHJvcyBkb3MuPC9wPjxkaXYgY2xhc3M9ImZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBnYXAtMyI+PGEgaHJlZj0iI3R1LWNhbmNpb24iIG9uY2xpY2s9ImlmKHR5cGVvZiBBdWRpb01hbmFnZXIgIT09ICd1bmRlZmluZWQnKSBBdWRpb01hbmFnZXIucGxheSgnZmx5aW4ud2F2JywgMC42KTsiIGNsYXNzPSJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHgtNSBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXdoaXRlIGZvbnQtYm9sZCBiZy1ncmFkaWVudC10by1yIGZyb20tYnJhbmQtNjAwIHRvLXR1bGlwLTUwMCBzaGFkb3ctbGcgYWN0aXZlOnNjYWxlLTk1IHRyYW5zaXRpb24tYWxsIHRleHQtc20iIGRhdGEtaTE4bj0idW5pdl91bmxvY2tfYnRuIj48c3ZnIGNsYXNzPSJ3LTQgaC00IiBmaWxsPSJjdXJyZW50Q29sb3IiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTggNXYxNGwxMS03eiIvPjwvc3ZnPkVzY3VjaGFyIGxhIGNhbmNpw7NuPC9hPjxzcGFuIGNsYXNzPSJ0ZXh0LXppbmMtNTAwIGRhcms6dGV4dC16aW5jLTYwMCB0ZXh0LVsxMHB4XSBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtbC0yIiBkYXRhLWkxOG49InVuaXZfdW5sb2NrX2Zvb3RlciI+wqkgMjAyNiBDaGFybGVzIEd1c3RhdiAmYW1wOyBHb29nbGUgRmxvdyBNdXNpYy48L3NwYW4+PC9kaXY+PC9kaXY+";
                                univSlide.innerHTML = decodeURIComponent(escape(atob(payload)));
                                if (window.setLanguage && window.currentLang) { setLanguage(window.currentLang); }
                                // Change class from locked placeholder to the active styling
                                univSlide.className = "w-full flex-shrink-0 snap-center bg-zinc-900 p-6 md:p-8 rounded-[2rem] shadow-xl border border-tulip-500/30 flex flex-col items-start gap-4 relative overflow-hidden transition-all duration-700";
                                univSlide.style.minHeight = 'auto';
                            }
                        }

                        // Unlock Game 3 Memory Match
                        const game3Card = document.getElementById('game3-arcade-card');
                        const game3Overlay = document.getElementById('game3-lock-overlay');
                        if (game3Card) {
                            game3Card.classList.remove('opacity-50', 'grayscale', 'duration-1000');
                            game3Card.classList.add('cursor-pointer', 'hover:shadow-2xl', 'hover:-translate-y-3', 'duration-400');
                            game3Card.style.pointerEvents = 'auto';
                        }
                        if (game3Overlay) {
                            game3Overlay.classList.add('opacity-0');
                            setTimeout(() => game3Overlay.classList.add('hidden'), 1000);
                        }
                    }

                    function pad(n) { return String(n).padStart(2, '0'); }

                    function updateCountdown() {
                        const now = new Date();
                        const diff = UNLOCK_DATE - now;

                        if (diff <= 0) {
                            unlock();
                            return;
                        }

                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        const secs = Math.floor((diff % (1000 * 60)) / 1000);

                        const prevSecs = secsEl.textContent;
                        daysEl.textContent = pad(days);
                        hoursEl.textContent = pad(hours);
                        minsEl.textContent = pad(mins);
                        secsEl.textContent = pad(secs);

                        // Update menu badge with remaining days
                        const badgeText = days + 'd ' + pad(hours) + 'h';
                        if (menuDaysEl) {
                            menuDaysEl.textContent = badgeText;
                        }
                        if (menuGamesDaysEl) {
                            menuGamesDaysEl.textContent = badgeText;
                        }
                        if (menuVaultDaysEl) {
                            menuVaultDaysEl.textContent = badgeText;
                        }

                        // Tick animation on seconds change
                        if (pad(secs) !== prevSecs) {
                            secsEl.parentElement.classList.remove('tick');
                            void secsEl.parentElement.offsetWidth; // force reflow
                            secsEl.parentElement.classList.add('tick');
                        }

                        requestAnimationFrame(() => setTimeout(updateCountdown, 1000));
                    }

                    // Check if already past unlock date
                    if (new Date() >= UNLOCK_DATE) {
                        if (overlay) overlay.style.transition = 'none';
                        unlock();
                        if (overlay) overlay.style.display = 'none';
                        if (content) {
                            content.classList.remove('song-content-locked');
                        }
                    } else {
                        updateCountdown();
                    }
                })();
const dictionary = {
            es: {
                flag: "ES", code: "ES", nav_subtitle: "Para Yaire",
                menu_nav: "Spotlight", menu_home: "Inicio", menu_story: "Historia & Tiempo", menu_name: "Tu Nombre", menu_tulips: "Tus Flores", menu_quiz: "El Misterio", menu_dist: "La Distancia", menu_food: "El Pacto", menu_universe: "Su Universo", menu_gallery: "Galería de Arte", menu_games: "Minijuegos", menu_promises: "Promesas", menu_memorial: "Para tu Ángel", menu_hype: "El Hype", menu_stats: "Estadísticas", menu_mes_cinco: "Capítulo V: 5 Meses", menu_secret: "El Último Secreto", menu_settings: "Ajustes de Sistema", menu_theme: "Tema Visual", menu_lang: "Idioma", menu_new_badge: "Nuevo",
                menu_colors: "Colores Favoritos", menu_tulip_colors: "Guía de Colores", menu_healing: "Sanación", menu_guestbook: "Muro de Dedicatorias",
                spot_mode_music: "Música", spot_mode_radio: "Radio", radio_signal: "Señal en Vivo", radio_desc: "Sintonizando la frecuencia de 28E. Emisión ininterrumpida de amor y recuerdos.", radio_live_badge: "🔴 EN VIVO", radio_live_title: "🔴 Transmisión en Vivo",
                gb_auth_req: "Para firmar el muro, por favor identifícate.", gb_auth_google: "Continuar con Google", gb_auth_manual: "Prefiero escribir mi nombre manualmente", auth_prompt: "Inicia sesión para entrar al canal de voz y guardar progreso.", auth_login_btn: "Iniciar sesión", auth_logout_btn: "Cerrar sesión", gb_tag: "Muro de Dedicatorias", gb_title: "Dejando Huella", gb_desc: "Un espacio para dejar mensajes, recuerdos o simplemente un saludo. Todo lo que se escriba aquí quedará guardado para siempre.", gb_form_title: "Escribe un mensaje", gb_label_name: "Tu Nombre", gb_ph_name: "Ej. Visitante Anónimo", gb_label_msg: "Mensaje", gb_ph_msg: "Escribe algo bonito...", gb_btn: "Publicar Mensaje", gb_loading: "Cargando mensajes...", gb_empty: "Aún no hay mensajes. ¡Sé el primero!", gb_recent: "Reciente", gb_save_changes: "Guardar Cambios", gb_cancel_edit: "Cancelar Edición", gb_delete_confirm: "¿Estás seguro de que quieres borrar este mensaje para siempre?", gb_deleted_title: "Borrado", gb_deleted_msg: "El mensaje ha sido eliminado", gb_updated_title: "Actualizado", gb_updated_msg: "Tu mensaje ha sido modificado", gb_edit_title: "Editar mensaje", gb_delete_title: "Borrar mensaje", gb_edited_tag: "(editado)",
                menu_cat_essence: "✦ ESENCIA", menu_cat_exp: "✦ EXPERIENCIAS", menu_cat_special: "✦ ESPECIAL", menu_search: "Buscar sección...",
                search_empty_title: "Sin resultados...", search_empty_sub: "Intenta con otra frase, mi amor.", search_game_tag: "(Minijuego)", search_game_btn: "Abrir Juego", search_recipe_btn: "Ver Receta", search_tool_btn: "Abrir Herramienta", menu_recipe: "Gastronomía", menu_tools: "Herramientas",
                theme_light: "Claro", theme_dark: "Oscuro", theme_system: "Sistema",

                loading: "Cargando nuestro universo...", nav_logo: "28E", hero_badge: "¡Felices 3 Meses!", hero_countdown_prefix: "3 meses en",
                hero_title1: "Mi lugar favorito", hero_title2: "es contigo.",
                hero_subtitle: "Eres la casualidad más hermosa que me ha pasado, la dueña de mis pensamientos más profundos, el motivo de mis mejores sonrisas y la mujer con la que quiero construir, cuidar y compartir cada pequeño instante del resto de mis días. Esta página es nuestra, para siempre.",

                origin_label: "Nuestra Historia", origin_title: "De los píxeles a la realidad.",
                origin_text1: "¿Quién iba a decir que detrás de unas pantallas, en el mundo virtual de <strong>Hevvo</strong>, iba a encontrar al amor de mi vida? Nos mudamos a <strong>Habbo ID</strong> para seguir nuestra historia, y sin darnos cuenta, lo que empezó como un juego se convirtió en el sentimiento más real, maduro y profundo que he experimentado.",
                origin_text_key: "\"Todo esto no hubiera sido posible sin tu amiga Key. A ella le debo el agradecimiento eterno por haber sido el puente que cruzó nuestros caminos y darme la inmensa oportunidad de ser el afortunado novio de la chica más increíble del mundo.\"",
                origin_text2: "Desde aquel 28 de enero de 2026, marcamos un antes y un después. Y ahora, cada segundo a tu lado cuenta como un tesoro.",
                counter_title: "Tiempo exacto amándote:", time_months: "Meses", time_days: "Días", time_hours: "Horas", time_mins: "Mins", time_secs_suffix: "+ {s} segundos latiendo por ti", counter_total_lbl: "Días Totales Juntos",

                name_label: "Identidad y Magia", name_title: "El Misterio de tu Nombre", name_hover_hint: "(Pasa el cursor o toca las letras)",
                name_card1_title: "Su Origen", name_card1_desc: "El nombre Yaire tiene hermosas raíces. Se asocia frecuentemente con el hebreo antiguo (Yair), con conexiones espirituales y luminosas. Es un nombre raro y precioso.",
                name_card2_title: "Su Significado", name_card2_desc: "Significa literalmente <strong>\"La que ilumina\"</strong> o \"Iluminada por Dios\". Un significado perfecto, porque desde que llegaste, llenaste de luz y color todos mis días.",
                name_card3_title: "Mi Definición", name_card3_desc: "Para mí, Yaire no es solo un nombre. Es sinónimo de amor puro, de paz, de inteligencia y de la mujer con la que quiero compartir el resto de mi vida.",

                tulips_label: "Tus Flores Favoritas", tulips_title: "La Elegancia del Tulipán Rosa",
                tulips_subtitle: "Un viaje por el significado, la belleza y la promesa que guardan tus flores favoritas.",
                tulips_tap_hint: "Toca el tulipán",
                tulips_desc1: "Sé muy bien que tus flores favoritas son los tulipanes, especialmente los de color rosa. ¿Sabías que en el lenguaje de las flores, el tulipán rosa simboliza el afecto genuino, el cuidado, los buenos deseos y un amor que está floreciendo de la manera más hermosa y pura?",
                tulips_desc2: "Tal vez hoy solo pueda regalártelos en formato digital a través de esta pantalla, pero te prometo que el día que nos veamos en persona, te estaré esperando con el ramo de tulipanes rosas más hermoso y real que hayas visto en tu vida.",
                tulips_meaning_title: "El Lenguaje Secreto del Tulipán Rosa",
                tulips_sym1_title: "Afecto Genuino", tulips_sym1_desc: "El tulipán rosa es la declaración silenciosa de un cariño auténtico y sincero, que nace del corazón sin pretensiones.",
                tulips_sym2_title: "Cuidado y Protección", tulips_sym2_desc: "Simboliza el deseo de proteger y cuidar a la persona amada, como quien cuida la flor más delicada de su jardín.",
                tulips_sym3_title: "Buenos Deseos", tulips_sym3_desc: "Regalar tulipanes rosas es enviar los mejores deseos al alma de esa persona, deseándole felicidad eterna.",
                tulips_sym4_title: "Amor Floreciente", tulips_sym4_desc: "El significado más profundo: un amor que apenas comienza a florecer y que promete convertirse en algo eterno e indestructible.",
                tulips_colors_title: "Guía de Colores del Tulipán", tulips_colors_hint: "Toca cada color para descubrir su significado",
                tulips_c_pink: "Rosa", tulips_c_red: "Rojo", tulips_c_yellow: "Amarillo", tulips_c_white: "Blanco", tulips_c_purple: "Morado", tulips_c_orange: "Naranja",
                tulips_cm_pink: "Tulipán Rosa — Afecto y Ternura", tulips_cd_pink: "Representa el amor tierno y genuino, la conexión emocional pura y los buenos deseos hacia la persona amada. Es tu flor, Yaire.",
                tulips_cm_red: "Tulipán Rojo — Amor Apasionado", tulips_cd_red: "El tulipán rojo simboliza un amor intenso, profundo y declarado. Es la confesión más sincera de un corazón enamorado.",
                tulips_cm_yellow: "Tulipán Amarillo — Alegría y Amistad", tulips_cd_yellow: "Asociado a la felicidad, la energía positiva y la calidez de una sonrisa sincera. Representa también la esperanza.",
                tulips_cm_white: "Tulipán Blanco — Perdón y Pureza", tulips_cd_white: "Símbolo de paz, nuevos comienzos y un amor inmaculado. Perfecto para pedir perdón o empezar de cero.",
                tulips_cm_purple: "Tulipán Morado — Realeza y Admiración", tulips_cd_purple: "Históricamente asociado a la nobleza y el lujo. Regalar un tulipán morado dice: 'Te admiro profundamente'.",
                tulips_cm_orange: "Tulipán Naranja — Energía y Pasión", tulips_cd_orange: "Combina la intensidad del rojo con la alegría del amarillo. Representa entusiasmo, vitalidad y una conexión vibrante.",
                tulips_facts_title: "¿Sabías que...?",
                tulips_fact1_title: "La Fiebre del Tulipán", tulips_fact1_desc: "En el siglo XVII en Holanda, los tulipanes llegaron a valer más que las casas. Un solo bulbo podía costar lo mismo que una mansión junto a un canal de Ámsterdam.",
                tulips_fact2_title: "Origen Turco", tulips_fact2_desc: "Aunque los relacionamos con Holanda, los tulipanes son originarios de Asia Central y Turquía. La palabra \"tulipán\" viene del turco \"tülbend\" (turbante).",
                tulips_fact3_title: "Proporción Áurea", tulips_fact3_desc: "Los pétalos del tulipán siguen la proporción áurea de Fibonacci. Su geometría natural es considerada una de las más perfectas del reino vegetal.",
                tulips_fact4_title: "Flores Nocturnas", tulips_fact4_desc: "Los tulipanes se cierran por la noche y se abren con la luz del sol. Son fotosensibles, igual que los girasoles pero de manera diferente.",
                tulips_fact5_title: "+3,000 Variedades", tulips_fact5_desc: "Existen más de 3,000 variedades de tulipanes registradas en el mundo. Pero la más especial de todas es la que representa tu sonrisa: la rosa.",
                tulips_promise_badge: "Mi Promesa", tulips_promise_title: "Un Ramo de Tulipanes Rosas Te Espera",
                tulips_promise_text: "El día que finalmente nos encontremos cara a cara, no voy a llegar con las manos vacías. Te estaré esperando con el ramo de tulipanes rosas más hermoso y real que hayas visto en tu vida. Cada flor representará un día que te amé desde la distancia.",
                tulips_promise_flowers: "Tulipanes prometidos", tulips_promise_love: "Amor contenido", tulips_promise_dest: "Destinataria",
                tulips_promise_footnote: "* El número de tulipanes crece cada día que te amo. Contador en vivo. 🌷",

                quiz_label: "Un Pequeño Juego", quiz_title: "El Misterio del Girasol", quiz_question: "Ya hablamos de tus flores favoritas... pero, ¿sabes por qué mis flores representativas en nuestra relación siempre son los girasoles?",
                quiz_opt1: "Porque simplemente me encanta el color amarillo.", quiz_opt2: "Porque tú eres el sol que me ilumina siempre.", quiz_opt3: "Porque crecen muy alto, igual que tú.",
                quiz_correct_title: "¡Exactamente mi amor!",
                quiz_correct_desc1: "Los girasoles tienen una hermosa propiedad en la naturaleza llamada <strong>heliotropismo</strong>. Esto significa que durante todo el día se mueven y giran buscando siempre la luz del sol para poder crecer, nutrirse y mantenerse vivos y vibrantes.",
                quiz_correct_desc2: "Desde que llegaste a mi vida, me di cuenta de que mi corazón hace exactamente lo mismo. Tú eres ese sol radiante, brillante y cálido. Y yo, como un simple girasol, siempre te estoy buscando a ti, buscando tu luz, tu sonrisa y tu energía para sentirme vivo.",
                sunflower_hint: "Arrastra el sol para iluminarlo... ☀️",
                sunflower_success: "¡Siempre hacia ti! 🌻✨",

                dist_title: "Un Océano de Por Medio", dist_dr: "República Dominicana", dist_ve: "Venezuela",
                dist_text: "\"La distancia actual es de ~900 kilómetros, pero nuestros corazones están en las mismas coordenadas. Es solo un número temporal... pronto, ese número se reducirá a cero.\"",

                food_label: "Gastronomia y Promesas", food_title: "Entre Pechugas a la Crema y el Clásico Mundial",
                food_card1_title: "Su Platillo Estrella",
                food_card1_desc: "Sé perfectamente que tu comida favorita en todo el mundo es la <strong>Pechuga a la Crema</strong>. Como no puedo enviártela por correo, ya tengo el plan perfecto: aprender a cocinarla con el nivel exacto de cremosidad y sabor que te mereces.",
                food_card1_btn: "Ver preparación",
                food_card2_title: "La Deuda del Clásico",
                food_card2_desc: "¿Recuerdas nuestro legendario reto del Clásico Mundial de Béisbol? A pesar de la distancia, el trato era claro: si ganaba Dominicana, yo (desde Venezuela) tenía que prepararme un <strong>Mangú con los 3 golpes</strong> y comérmelo en tu honor. Si ganaba Venezuela, a ti te tocaba hacer y comer arepas.",
                food_card2_result: "Al final, Dominicana se coronó campeona. Así que esa deuda sagrada está firmada y sellada. Ese Mangú venezolano-dominicano va porque va.",

                universe_title: "Su Universo",
                movie_label: "Su Película Favorita", movie_title: "La Princesa y el Sapo",
                movie_text1: "Admiro cómo conectas con Tiana, una mujer que trabajaba incansablemente por sus sueños sabiendo lo que quería lograr en la vida. Y sí, nunca superaré el chiste de que pensabas que la protagonista se llamaba <strong class='font-bold'>Diana</strong> en lugar de Tiana 😂.",
                movie_text2: "Chistes aparte, tú eres mi verdadera princesa. Prometo apoyarte en la construcción de ese \"restaurante\" (tus metas), aunque yo todavía esté trabajando duro para dejar de ser un simple sapo.",
                movie_btn: "Ver ahora",
                playlist_label: "Nuestra Conexión", playlist_title: "La Playlist que me hiciste", playlist_text: "El mejor regalo. Cada canción es un pedacito de nosotros.",
                song1_title: "Se Dejo Del Novio", song1_desc: "\"El himno definitivo. Esa energía que me hace pensar instantáneamente en ti bailando y sonriendo sin parar.\"",
                song2_title: "God is a woman", song2_desc: "\"Poderosa y mágica, exactamente igual que tú. Cada vez que la escucho, capta la esencia de lo increíble y divina que eres.\"",
                song3_title: "Set Fire to the Rain", song3_desc: "\"Una voz inconfundible para un corazón inconfundible. Esta canción tiene la intensidad y la fuerza que tanto te caracterizan.\"",
                song_btn: "Escuchar ahora",

                gallery_label: "La Musa", gallery_title: "Galería de Arte", gallery_desc: "Porque ninguna obra de arte en los mejores museos del mundo se compara con tu belleza. Un espacio dedicado exclusivamente a admirarte.",
                gallery_cap1: "\"La sonrisa que ilumina mis días.\"", gallery_cap2: "\"Perfección.\"", gallery_cap3: "\"Mi vista favorita.\"",

                modal_title: "¡Un momento!", modal_text_song: "Estás a punto de salir a YouTube para escuchar una de las canciones favoritas de Yaire. ¿Preparado para sentir su vibra?", modal_text_movie: "Estás a punto de ir a Disney+ para ver la película favorita de Yaire. Prepara las palomitas 🍿.", modal_no: "Quedarme aquí", modal_yes_song: "Ir a YouTube", modal_yes_movie: "Ir a Disney+", modal_yes: "Continuar", secret_pwd_btn_text: "Desbloquear", secret_nav_prev: "Anterior", secret_nav_next: "Siguiente", secret_signature_text: "Te amo, hoy y siempre.", sig_days: "Días juntos", sig_km: "Km de amor", sig_love: "Amor", sig_progress: "Nivel de amor", sig_online: "En vivo", sig_close: "Cerrar carta", sig_love_btn: "Te amo", sig_sender_sub: "Tu novio · Desde el 28.01.2026", sig_dedication: "— Con todo mi corazón",

                recipe_title: "Pechuga a la Crema Especial", recipe_sub: "La receta secreta para robarle el corazón a Yaire.",
                recipe_tab_ing: "Ingredientes", recipe_tab_prep: "Paso a Paso", recipe_tab_sec: "El Secreto",

                step_done: "Marcar como listo", chef_note_label: "Secreto del Chef", prep_progress: "Progreso de la receta",
                prep_s1_title: "El Sellado Perfecto", prep_s1_time: "⏳ 8 mins", prep_s1_desc: "Salpimentamos las pechugas con cariño y las doramos en el sartén a fuego medio-alto con mantequilla y un hilo de aceite, hasta conseguir una costra dorada impecable por ambos lados.", prep_s1_note: "Seca bien el pollo con papel absorbente antes de condimentarlo. La humedad es el peor enemigo de un buen dorado crujiente.",
                prep_s2_title: "La Base del Sabor", prep_s2_time: "⏳ 5 mins", prep_s2_desc: "Retiramos el pollo temporalmente. En ese mismo sartén, aprovechando los jugos de la cocción, sofreímos la cebolla finamente picada y el ajo triturado hasta que estén cristalinos y muy aromáticos.", prep_s2_note: "Usa una espátula de madera para raspar suavemente el fondo del sartén mientras se sofríe la cebolla. ¡Ahí están concentrados los mejores sabores!",
                prep_s3_title: "La Magia Cremosa", prep_s3_time: "⏳ 10 mins", prep_s3_desc: "Vertemos la crema de leche, ajustamos la sal y agregamos el queso parmesano. Bajamos el fuego al mínimo y dejamos reducir lentamente la salsa hasta que tome una textura espesa y sedosa.", prep_s3_note: "¡Paciencia! Nunca dejes que la crema hierva a fuego alto porque podría cortarse. Un hervor suave y delicado es la clave del éxito.",
                prep_s4_title: "El Reencuentro", prep_s4_time: "⏳ 5 mins", prep_s4_desc: "Devolvemos las pechugas (y los jugos que soltaron) al sartén. Dejamos que se bañen en la salsa, absorban el sabor profundo y terminen de cocinarse suavemente por dentro.", prep_s4_note: "Antes de servir, apaga el fuego y deja reposar el plato en el sartén por 2 o 3 minutos. Esto permite que los jugos del pollo se redistribuyan y quede extra jugoso.",

                recipe_sec_title: "El toque final", recipe_sec_text: "Servirla mientras te miro a los ojos y agradecer que, aunque nos separaban 900 kilómetros, al final logramos compartir la misma mesa.",

                games_label: "Zona Interactiva", games_title: "Yaire's Gaming Hub",
                game1_title: "El Jardín de Yaire", game1_desc: "Cosecha girasoles a contrarreloj.",
                game2_title: "Vuelo Hacia Ti", game2_desc: "Esquiva obstáculos y atrapa tulipanes.",
                game_score_label: "Puntos", game_time_label: "Tiempo", game_start: "¡Empezar!", game_start2: "¡Empezar!", game_restart: "¡Jugar de nuevo!",
                game_back_btn: "Volver a Selección", game_play_btn: "Jugar Ahora",
                game1_start_title: "¡Prepárate!", game1_start_sub: "Cosecha los girasoles antes de que se marchiten. 30 segundos.",
                game2_start_title: "¡A volar!", game2_start_sub: "Esquiva troncos y atrapa flores.",
                game3_title: "Cartas Ocultas", game3_desc: "Encuentra las parejas ocultas.",
                game3_locked: "Contenido Clasificado", game3_locked_desc: "Esta sorpresa se desbloquea el 28 de Abril.", game3_locked_btn: "Saber más",
                game3_start_title: "¡Concéntrate!", game3_start_sub: "Encuentra todas las parejas.",
                game3_over_title_win: "¡Memoria perfecta!", game3_over_title_lose: "Inténtalo de nuevo.",
                game3_moves_label: "Movimientos", game3_time_label: "Tiempo", game3_streak_label: "🔥 Racha",
                game3_hud: "Movimientos: {moves} | Tiempo: {time}s",
                game1_over_title: "¡Se acabó el tiempo!", game1_over_sub: "Lograste cosechar <span class=\"text-brand-500 font-bold text-base bg-brand-50 dark:bg-brand-900/10 px-2 py-0.5 rounded-md mx-1\">{score}</span> girasoles de amor.",
                game2_over_title_win: "¡Récord histórico alcanzado!", game2_over_title_lose: "Mala suerte, vuelve a intentarlo.",
                game_end: "¡Se acabó el tiempo! Lograste cosechar {score} girasoles de amor.",
                game_react_low: "Jeje, tienes que darle más rápido la próxima vez. 🐢", game_react_med: "¡Nada mal! Tienes buenos reflejos. 🌻", game_react_high: "¡Increíble! Tus dedos volaron. ⚡❤️",
                game2_new_record: "¡Nuevo Récord de Vuelo!", game2_gameover: "¡Oh no! Chocaste. Tulipanes recolectados: {score}",
                game4_title: "Adivina la Canción", game4_desc: "Escucha el fragmento y adivina qué canción suena.", game4_round_label: "Ronda", game4_listen_hint: "Toca para escuchar", game4_listening: "Escuchando...", game4_choose: "¡Elige tu respuesta!", game4_new_badge: "Nuevo", game4_start_title: "¿Conoces la canción?", game4_start_sub: "Escucha un fragmento y elige la correcta. 10 rondas.", game4_over_great: "¡Eres DJ oficial!", game4_over_good: "¡Nada mal!", game4_over_bad: "A escuchar más música…", game4_over_sub: "Puntuación: <strong class=\"text-emerald-500\">{score}</strong> puntos",

                prep_title: "Mis Promesas para Ti", prep_subtitle: "No son solo palabras vacías en una página web. Son decretos reales de cómo planeo amarte, respetarte y cuidarte todos los días de mi vida.",
                promise_click_hint: "Toca cada promesa para ver más ✨",
                step1_title: "Ser Tu Refugio Seguro", step1_desc: "Prometo ser ese lugar donde siempre puedas descansar. En los días donde el mundo parezca pesado, te ofrezco un espacio libre de juicios donde solo haya abrazos, té caliente y oídos dispuestos a escucharte quejarte de todo. Prometo cuidar tu corazón con la misma delicadeza con la que tú has sanado el mío.<br><br>Quiero ser tu refugio cuando estalle la tormenta, quien te sostenga la mano en silencio cuando las palabras no basten y quien te recuerde tu inmenso valor humano cuando tú misma dudes de él. Aquí siempre estarás a salvo.",
                step2_title: "Proteger Tus Sonrisas", step2_desc: "Me comprometo solemnemente a hacer el ridículo, contar los chistes más malos que existan, o bailar de la forma más extraña posible, si eso garantiza que esa hermosa sonrisa tuya vuelva a aparecer. Prometo que nuestras vidas estarán llenas de carcajadas espontáneas y de bromas internas.<br><br>Ningún día será gris mientras yo pueda dibujarte una sonrisa de vuelta. Quiero memorizar la melodía de tu risa, hacerte reír hasta que te duela el estómago y asegurarme de que la alegría sea nuestro pan de cada día, siempre juntos.",
                step3_title: "Crecimiento y Equipo", step3_desc: "Prometo nunca cortar tus alas, sino ser el viento que las impulse. Seré tu fan número uno en la primera fila de todos tus éxitos. Ya sea estudiando, trabajando, o construyendo el imperio de Tiana, prometo estar a tu lado trabajando codo a codo como un equipo invencible.<br><br>Porque tus sueños ahora son también los míos. Celebraré todas y cada una de tus victorias como propias y seré tu red de seguridad en cada caída. Juntos construiremos no solo una relación hermosa, sino un futuro brillante.",
                step4_title: "Amarte Como Elección Diaria", step4_desc: "Prometo amarte no solo en tus mejores días, sino también cuando estés despeinada, en pijamas y estresada. Prometo que el amor no será solo un sentimiento, sino una acción constante. Te elijo hoy, te elegí ayer, y prometo elegirte cada mañana cuando me despierte. Eres mi hogar.<br><br>No busco la perfección, te busco a ti hoy y siempre tal cual eres. En la salud, en la enfermedad, en la abundancia y en la escasez. Mi promesa más sagrada es que mi amor es incondicional, porque en ti, bonita, encontré a mi persona.",

                memorial_label: "Un Ángel en el Cielo", memorial_title: "Yahir",
                memorial_counter: "hace {months} meses",
                memorial_text1: "Un viernes de diciembre se movía lleno de vida. El lunes 23, a las tres de la tarde, hizo su último movimiento y dijo adiós en silencio. La Nochebuena cambió para siempre. Tú fuiste valiente: te quedaste despierta toda la noche cuidando a tu hermana después de la cesárea, sin dormir, sin comer, sosteniendo todo con tus propias manos.",
                memorial_text2: "Cada 23 del mes, Yuneth lo recuerda. Y tú estás ahí para ella, siempre. Porque sabes que la vida sigue, pero también sabes que un bebé no se supera — simplemente se aprende a caminar con ese peso. Lo conociste, y aunque no fue de la forma que soñabas, viste lo hermoso y perfecto que era.",
                memorial_text3: "Yo también perdí a mi hermanita. No sé exactamente lo que sientes, pero conozco ese vacío. Por eso te prometo que nunca cargarás esto sola. Quiero ser tu lugar seguro para llorar, para desahogarte, para recordarlo sin miedo. Aquí estoy, aquí estaré — sosteniendo tu mano firmemente, hoy y siempre.",
                memorial_quote: "Yahir tiene un lugar, un lugar que nadie va a quitar. Así sea que lleguen nuevos o nuevas, Yahir estará allí presente.", memorial_quote_author: "— Yaire",

                hype_title: "Ojalá este Hype se haga REAL.", hype_text: "Todavía no es un hecho, pero la sola idea de que algún día ese avión aterrice en Venezuela me tiene soñando despierto. Ya tengo pensada la ruta, los lugares, la comida, y lo más importante: el momento exacto en el que por fin te pueda dar ese abrazo en persona. ¡Mantengo la esperanza intacta!",
                hype_list1_title: "El Abrazo de Aeropuerto", hype_list1_desc: "Ese primer momento donde por fin podré comprobar si eres tan abrazable como imagino (seguro que sí). Cero soltarte por al menos 5 minutos.",
                hype_list2_title: "Tour Gastronómico", hype_list2_desc: "Te llevaré a comer las mejores arepas, empanadas y tequeños que existen. Y por supuesto, cocinarte tu merecido Mangú.",
                hype_list3_title: "Crear Memorias Reales", hype_list3_desc: "Cambiar las capturas de pantalla de videollamadas por fotos de verdad. Llenar la galería de recuerdos, risas y aventuras físicas.",

                stat_sup_title: "Monitor en Vivo", chart_title: "Panel de Control Emocional", chart_desc: "Un análisis exhaustivo y en tiempo real de mi capacidad mental, emocional y mi paciencia con los kilómetros.",
                stat_fact1_title: "Ritmo Cardíaco al Verte", stat_fact1_desc: "180",
                stat_prog_title: "Niveles Actuales", stat_prog1: "Ganas de verte", stat_prog2: "Paciencia con la distancia", stat_prog3: "Ganas de soltarte al abrazarte",
                stat_chart_title: "Distribución Mental",
                stat_log_title: "Registro Diario (En Vivo)", stat_log_1: "Despertar e inmediatamente pensar en tu sonrisa.", stat_log_2: "Mirar mi galería de fotos para verte unos minutos.", stat_log_3: "Imaginando qué haríamos si estuviéramos juntos ahorita.", stat_log_4: "Dormir con la esperanza de soñar contigo.",

                footer: "&copy; 2026 Charles Gustav. Todos los derechos reservados y dedicados exclusivamente a Yaire Alvarado.",
                pal_badge_label: "Colores Favoritos", dist_orig: "Origen", dist_dest: "Destino", mixer_hint: "Elige dos colores abajo", mixer_palette_label: "Paleta disponible", mixer_reset: "Limpiar",
                mix_01_title: "Fuerza Natural", mix_01_desc: "Verde y rojo juntos: la fuerza de quien cuida y lucha al mismo tiempo.",
                mix_02_title: "Amor en Flor", mix_02_desc: "La combinación más Yaire. Ternura que brota de la tierra.",
                mix_03_title: "Bruja del Bosque", mix_03_desc: "Creatividad que florece desde la naturaleza. Misterio y calma.",
                mix_12_title: "Corazón en Llamas", mix_12_desc: "Pasión con ternura, fuerza con delicadeza.",
                mix_13_title: "Volcán Mágico", mix_13_desc: "Creatividad explosiva. Una energía que no se puede ignorar.",
                mix_23_title: "Universo Rosado", mix_23_desc: "Tu firma cósmica. Ternura de sueños en un universo tuyo.",
                mix_default: "Una mezcla única.", pal_badge_count: "4 tonos", pal_dna_label: "Tu ADN de color", pal_dna_count: "4 esencias",
                pal_dna_1: "Natural", pal_dna_2: "Pasional", pal_dna_3: "Tierna", pal_dna_4: "Mágica",
                pal_view_grid: "⊞ Cuadrícula", pal_view_list: "☰ Lista", pal_view_mixer: "⟳ Mezclador",
                pal_tap_more: "Toca para más",
                pal_mix_lab: "Laboratorio de colores", pal_mix_title: "Mezcla tu Paleta", pal_mix_sub: "Selecciona dos colores y obsérvalos mezclarse en tiempo real.",
                pal_section_desc: "Cada color que te representa es un capítulo de quién eres. Toca cualquiera para descubrir su historia y lo que dice de ti.",
                pal_title: "La Paleta de Yaire",
                pal_swipe_hint: "Desliza para cambiar vista",
                pal_quote: "\"Juntos, estos cuatro colores forman algo imposible de describir. Forman a Yaire.\"",
                dist_stat1: "Kilómetros", dist_stat2: "Tiempo de vuelo", dist_stat3: "Diferencia horaria", dist_stat4: "Amor que nos une",
                dist_card1_title: "Hablar 24/7", dist_card1_desc: "La distancia no nos quitó la voz. Cada mensaje tuyo llega a mí como si estuvieras al lado.",
                dist_card2_title: "Mismo Huso Horario", dist_card2_desc: "Ambos GMT-4. Cuando tú amaneces, yo también. Eso hace todo más fácil de sobrellevar.",
                dist_card3_title: "Temporario", dist_card3_desc: "900 km no es nada comparado con lo que construimos. El contador regresivo ya empezó.",
                promise_flip_hint: "Toca para leer →", promise_flip_back: "Toca para volver ←",
                promises_seal_quote: "\"Estas promesas no tienen fecha de vencimiento. Son para toda la vida, en cada versión de ti y de mí.\"",
                promises_seal_author: "— Charles, con todo mi amor",
                top5_badge: "Análisis del Chat", top5_title: "El Vocabulario de Yaire", top5_desc: "Pasé nuestras conversaciones por un análisis exhaustivo y estas son las palabras y frases que más repites. No me sorprende para nada lo que encontré.",
                emoji_card_title: "Dato Curioso", emoji_card_desc: "Su emoji más usado en el chat (169 veces)",
                top5_words_title: "Top 5 Palabras", top5_words_sub: "Las más usadas por Yaire en nuestro chat",
                top5_phrases_title: "Top 5 Frases", top5_phrases_sub: "Lo que más repite Yaire en el chat",
                w1_badge: "★ Imbatible", w1_desc: "1218 mensajes. Su palabra favorita del universo. La usa para todo.",
                w2_badge: "Eterna", w2_desc: "258 mensajes de risas. JAKAJJAJA, KAKAJAJA... siempre en mayúsculas.",
                w3_badge: "Elegante", w3_desc: "249 mensajes. Su forma respetuosa y cariñosa de dirigirse a ti.",
                w4_badge: "Favorita", w4_desc: "135 mensajes. \"Qué lindooo\", \"mi hombre lindo\" — su piropo por excelencia.",
                w5_badge: "Honesta", w5_desc: "123 mensajes. \"En verdad\", \"la verdad\", \"de verdad\" — su sello de autenticidad.",
                p1_text: "\"Te amoooo / Te amo mucho\"", p1_desc: "282 mensajes. Su declaración diaria e inagotable. Siempre alarga las vocales para demostrar toda la intensidad de lo que siente.",
                p2_text: "\"Mi amor\"", p2_desc: "253 mensajes. Su vocativo estrella para iniciar cada conversación, responderte o simplemente hacerte saber que está ahí.",
                p3_text: "\"Sin embargo...\"", p3_desc: "70 mensajes. Su conector estrella para razonar. Siempre que quiere expresar un punto con profundidad, lo marca con un \"sin embargo\" que se ha vuelto su firma intelectual.",
                p4_text: "\"Qué lindooo / Tan lindooo\"", p4_desc: "80 mensajes. Su reacción inmediata cada vez que eres romántico, le mandas algo tierno o tienes un detalle bonito con ella. Siempre alarga la o.",
                p5_text: "\"No te preocupes amor\"", p5_desc: "47 mensajes. Su instinto protector. Cada vez que te sientes culpable o inseguro, ella usa esta frase como un abrazo verbal para calmarte.",
                secret_eyes_label: "Solo para sus ojos",
                hype_stop1: "Parada N°1", hype_stop2: "Parada N°2", hype_stop3: "Parada N°3",
                promise_num1: "Promesa N°1", promise_num1b: "☂️ Promesa N°1", promise_num2: "Promesa N°2", promise_num2b: "🎭 Promesa N°2", promise_num3: "Promesa N°3", promise_num3b: "🌱 Promesa N°3", promise_num4: "Promesa N°4", promise_num4b: "💍 Promesa N°4",
                flight_status_label: "Estado", flight_status_val: "PRONTO™",
                chart_labels: ['Dormir', 'Imaginarnos Juntos', 'Admirarte en silencio', 'Pensar en ti (Fondo continuo)'],
                chart_dataset: '%',

                recipe_ing: ['2 Pechugas de pollo grandes', '1 taza de crema de leche (Heavy cream)', '1/2 cebolla blanca finamente picada', '2 dientes de ajo triturados', '1 toque de mantequilla y aceite de oliva', 'Queso parmesano al gusto', 'Sal, pimienta y mucho amor'],

                secret_label: "El Último Secreto", secret_desc: "Hay una última cosa que necesito decirte. Pero este espacio está protegido con magia. Solo tú sabes la contraseña para entrar.", secret_btn: "Revelar Secreto",
                secret_stat_letter: "Carta", secret_stat_love: "Amor", secret_stat_key: "1 Clave",
                secret_pwd_title: "El Último Secreto", secret_pwd_desc: "Solo ella conoce la palabra mágica.", secret_pwd_error: "Esa no es la palabra mágica.", secret_hint: "Pista: La identidad que usaste cuando nuestra historia continuó entre píxeles.", secret_pwd_btn: "Desbloquear", secret_pwd_cancel: "Volver",
                secret_security_badge: "Acceso Restringido", secret_lockout: "Acceso bloqueado",
                secret_letter_title: "Mi Amada Yaire,",
                secret_letter_p1: "Si estás leyendo esto, es porque conoces la llave que abre no solo esta bóveda digital, sino la puerta directa a mi alma. Mi hermosa manzanita, no existen palabras en ningún diccionario que puedan medir la inmensidad de lo que causas en mí.",
                secret_letter_p2: "Desde aquel primer cruce de palabras en Hevvo, pasando por nuestras interminables charlas en Habbo, hasta llegar a este punto donde te has convertido en el centro absoluto de mi universo, mi vida ha cambiado para siempre.",
                secret_letter_p3: "Me enamoro de ti todos los días. Me enamoro de la forma en que tus ojos brillan, de esa sonrisa que podría detener guerras, de tu inteligencia, de tu fuerza para superar los días difíciles y de la ternura infinita que guardas en tu corazón.",
                secret_letter_p4: "Sé que los 900 kilómetros de océano que nos separan a veces parecen crueles. Pero quiero que sepas que cada segundo de espera vale la pena. No me importa la distancia cuando se trata de la mujer con la que quiero despertar cada mañana.",
                hype_airline: "Aerolínea del Amor", hype_bp_label: "Boarding Pass",
                hype_passenger: "Pasajera", hype_class: "Clase", hype_class_val: "Amor Total",
                hype_seat: "Asiento", hype_waiting: "En espera · Fecha TBD", hype_flight_dur: "~2h de vuelo",
                pc_verde_name: "Verde", pc_verde_sub: "Esmeralda", pc_verde_tag1: "Calma", pc_verde_tag2: "Vida",
                pc_verde_desc: "Esperanza, naturaleza y tu paz interior. El color de tu calma y de tu energía más pura.",
                pc_verde_m1: "Energía", pc_verde_m1p: "85%", pc_verde_m2: "Calma", pc_verde_m2p: "92%",
                pc_rojo_name: "Rojo", pc_rojo_sub: "Pasión", pc_rojo_tag1: "Amor", pc_rojo_tag2: "Fuerza",
                pc_rojo_desc: "Pasión, amor y determinación. El color de tus besos, de tu carácter y de tu corazón valiente.",
                pc_rojo_m1: "Pasión", pc_rojo_m1p: "97%", pc_rojo_m2: "Valentía", pc_rojo_m2p: "90%",
                pc_rosa_name: "Rosa", pc_rosa_sub: "Tulipán", pc_rosa_tag1: "Ternura", pc_rosa_tag2: "Dulzura",
                pc_rosa_desc: "Ternura, romanticismo y alegría. El color de tus flores favoritas y de tu lado más mágico.",
                pc_rosa_m1: "Dulzura", pc_rosa_m1p: "95%", pc_rosa_m2: "Romanticismo", pc_rosa_m2p: "98%",
                pc_morado_name: "Morado", pc_morado_sub: "Sueño", pc_morado_tag1: "Magia", pc_morado_tag2: "Misterio",
                pc_morado_desc: "Creatividad, misterio y sueños. El color de tu imaginación y de los momentos más mágicos.",
                pc_morado_m1: "Creatividad", pc_morado_m1p: "88%", pc_morado_m2: "Intuición", pc_morado_m2p: "94%",
                pc_list_verde_name: "Verde Esmeralda", pc_list_verde_sub: "Calma · Vida · Sanación · Naturaleza", pc_list_verde_pct: "85% Energía",
                pc_list_rojo_name: "Rojo Pasión", pc_list_rojo_sub: "Amor · Valentía · Intensidad · Deseo", pc_list_rojo_pct: "97% Pasión",
                pc_list_rosa_name: "Rosa Tulipán", pc_list_rosa_sub: "Ternura · Romance · Flores · Delicadeza", pc_list_rosa_pct: "98% Romance",
                pc_list_morado_name: "Morado Sueño", pc_list_morado_sub: "Magia · Intuición · Creatividad · Unicidad", pc_list_morado_pct: "94% Intuición",
                modal_psych_label: "Psicología del color",
                modal_verde_quote: "\"El verde es tu refugio. Me recuerda a tu capacidad de sanar y a la frescura de tu risa cuando todo está bien.\"",
                modal_verde_tag3: "Naturaleza", modal_verde_tag4: "Sanación", modal_verde_tag5: "Frescura",
                modal_verde_psych: "El verde activa el sistema nervioso parasimpático: literalmente <strong>baja la frecuencia cardíaca</strong> y reduce el cortisol. Es el único color que el ojo humano puede percibir sin ningún ajuste de enfoque.",
                modal_verde_icon1: "Crecimiento", modal_verde_icon2: "Equilibrio", modal_verde_icon3: "Sanación",
                modal_verde_note: "\"Cuando te imagino en tu elemento, siempre hay verde alrededor. Eres la persona que hace que todo lo que toca vuelva a florecer.\"",
                modal_rojo_quote: "\"El rojo eres tú cuando luchas por lo que amas. Es la intensidad de tu amor y tu determinación de no rendirte.\"",
                modal_rojo_tag3: "Valentía", modal_rojo_tag4: "Intensidad", modal_rojo_tag5: "Deseo",
                modal_rojo_psych: "El rojo <strong>acelera el pulso y la respiración</strong>, aumenta la adrenalina y agudiza los reflejos. Es el color que el cerebro procesa más rápido que ningún otro. No es casualidad que sea el color del amor intenso.",
                modal_rojo_icon1: "Pasión", modal_rojo_icon2: "Energía", modal_rojo_icon3: "Valentía",
                modal_rojo_note: "\"El rojo en ti no es agresividad, es convicción. Es esa parte tuya que sabe exactamente lo que quiere y no para hasta conseguirlo.\"",
                modal_rosa_quote: "\"El rosa es tu esencia. Es la calidez de tus palabras, el aroma de tus tulipanes y la magia de tu ternura infinita.\"",
                modal_rosa_tag3: "Romance", modal_rosa_tag4: "Delicadeza", modal_rosa_tag5: "Flores",
                modal_rosa_psych: "El rosa genera liberación de <strong>oxitocina</strong>, la hormona del vínculo emocional. Estudios han demostrado que entornos rosas reducen la ansiedad en minutos. Es literalmente el color de la ternura.",
                modal_rosa_icon1: "Ternura", modal_rosa_icon2: "Cuidado", modal_rosa_icon3: "Belleza",
                modal_rosa_note: "\"El rosa eres tú en tu forma más pura. La que cuida sin pedir nada a cambio, la que da amor sin miedo y la que hace que todos se sientan seguros a tu lado.\"",
                modal_morado_quote: "\"El morado es tu chispa creativa. Es la magia de tus sueños y esa parte única tuya que me fascina cada día más.\"",
                modal_morado_tag3: "Intuición", modal_morado_tag4: "Sueños", modal_morado_tag5: "Unicidad",
                modal_morado_psych: "El morado es el color más difícil de reproducir en la naturaleza, lo que lo convierte en el más <strong>asociado con lo único e irrepetible</strong>. Estimula la parte del cerebro vinculada a la imaginación.",
                modal_morado_icon1: "Misterio", modal_morado_icon2: "Magia", modal_morado_icon3: "Sueños",
                modal_morado_note: "\"El morado en ti es ese universo interior que pocos llegan a ver del todo. Una profundidad que me atrae y me maravilla cada vez que me dejas asomar a ella.\"",
                hex_copied: "copiado", copy_hex: "Copiar hex",
                secret_letter_p5: "Prometo cuidarte, respetarte, hacerte reír hasta que te duela el estómago y ser el hombre que mereces. Esto es más que una simple página web; es un testamento de mi amor por ti. Gracias por elegirme, Yaire.",
                secret_update_notice: "Solo para sus ojos",
                secret_letter_v2_p1: "Si estás leyendo esto, es porque el tiempo no se detiene, y hoy cumplimos tres meses maravillosos. Mi hermosa manzanita, sigo sin encontrar las palabras exactas, pero mi alma entera vibra cada vez que pienso en nosotros. Tres meses parecen poco para quien no nos conoce, pero para nosotros es toda una eternidad de amor.",
                secret_letter_v2_p2: "Desde aquel primer cruce de palabras en Hevvo, y nuestras inolvidables charlas en Habbo, hasta este preciso instante, me pregunto: ¿Cómo es posible amarte más cada día? Te has convertido en mi hogar, en el latido de mi corazón y en la razón por la que sonrío al despertar.",
                secret_letter_v2_p3: "Me enamoro de ti en cada detalle. De tu voz, de la magia de tus ojos, de esa sonrisa que desarma todas mis defensas. Admiro tu inteligencia brillante, tu valentía para afrontar los días difíciles, y la inmensa ternura con la que me tratas. Eres la obra de arte más perfecta que la vida me pudo regalar.",
                secret_letter_v2_p4: "Es cierto que los 900 kilómetros de océano siguen ahí, intentando ponernos a prueba, pero durante estos tres meses me has demostrado que nuestro amor es más inmenso que cualquier distancia. Cada segundo de espera valdrá la pena en el momento en que finalmente pueda estrecharte entre mis brazos, donde perteneces.",
                secret_letter_v2_p5: "Prometo seguir cuidándote, respetándote y amándote con la misma intensidad o aún más que el primer día. Felices 3 meses, mi amor. Gracias por hacerme el hombre más afortunado del universo y por elegir caminar a mi lado. Esto es solo el principio de nuestra hermosa historia, Yaire.",
                // Panel de Control Emocional
                stat_bpm_warn: "⚠️ Peligrosamente enamorado", stat_bpm_beats: "Latidos por ti", stat_bpm_thinking: "Pensando en ti", stat_bpm_yours: "Tuyo",
                stat_days_label: "Días conociéndonos", stat_days_counting: "y contando...",
                stat_conn_title: "Estado de conexión", stat_conn_love: "Enamoramiento", stat_conn_active: "ACTIVO", stat_conn_signal: "Señal emocional", stat_conn_latency: "Latencia amor",
                stat_g1_tip: "Nivel: CÓDIGO ROJO 🚨", stat_g2_sub: "Casi nula", stat_g2_tip: "Estado: IMPACIENTE 😤",
                stat_g3_sub: "JAMÁS", stat_g3_tip: "Probabilidad: 0.00% 🤗",
                stat_g4_label: "Soñar contigo", stat_g4_sub: "Cada noche", stat_g4_tip: "Frecuencia: SIEMPRE 🌙",
                stat_g5_label: "Celos sanos", stat_g5_sub: "Controlados", stat_g5_tip: "Nivel: MODERADO 😅",
                stat_g6_label: "Felicidad", stat_g6_sub: "Gracias a ti", stat_g6_tip: "Causa: YAIRE 🌷",
                stat_chart_sub: "Basado en datos de 24h reales", stat_log_live: "En Vivo",
                stat_ticker1: "💖 Te amo infinitamente", stat_ticker2: "🌷 Eres mi tulipán favorito", stat_ticker3: "✨ Me haces mejor persona", stat_ticker4: "🏠 Eres mi hogar", stat_ticker5: "⚡ Mi energía eres tú", stat_ticker6: "🌙 Sueño contigo", stat_ticker7: "🔥 Me vuelves loco", stat_ticker8: "🦋 Me pones nervioso",
                stat_diag1_title: "Diagnóstico Cardíaco", stat_diag1_sub: "Estado: Crítico por amor", stat_diag1_text: "Paciente presenta taquicardia severa cada vez que ve una foto de Yaire. Se recomienda no alejar al sujeto de la causa, ya que los síntomas empeoran con la distancia. Tratamiento: abrazos. Dosis: ilimitada.",
                stat_diag2_title: "Análisis Cerebral", stat_diag2_sub: "85% ocupación: Yaire", stat_diag2_text: "El escáner cerebral revela que el 85% de la actividad neuronal está dedicada a pensar en Yaire. El 10% restante intenta ser productivo. El último 5% se debate entre comer o seguir mirando sus fotos.",
                stat_diag3_title: "Patrón de Sueño", stat_diag3_sub: "Sueños: 100% con ella", stat_diag3_text: "El paciente reporta que el 100% de sus sueños involucran a Yaire. Los más frecuentes: cocinarle, viajar juntos, y el primer abrazo. Efecto secundario: despertar sonriendo sin razón aparente.",
                stat_diag4_title: "Receta Médica", stat_diag4_sub: "Prescripción final", stat_diag4_text: "Tras un análisis exhaustivo, el diagnóstico es claro: el paciente padece de <strong class=\"text-brand-500\">amor crónico e incurable</strong>. No existe cura conocida ni se busca una. La única prescripción es: más Yaire. 💖",
                // Recipe Modal
                rcp_badge: "Receta Especial · Para Yaire 💖", rcp_title: "Pechuga a la Crema Especial",
                rcp_time: "⏱️ ~28 minutos", rcp_portions: "👤 2 porciones", rcp_level: "⭐ Nivel: Amor",
                rcp_tab_ing: "⊞ Ingredientes", rcp_tab_prep: "≡ Paso a Paso", rcp_tab_tech: "⚙ Técnica", rcp_tab_secret: "♡ El Secreto",
                rcp_portions_label: "Porciones", rcp_portions_adjust: "Ajusta las cantidades", rcp_shopping: "Lista de compras",
                rcp_ing1: "Pechuga de pollo", rcp_ing2: "Crema de leche", rcp_ing3: "Queso parmesano", rcp_ing4: "Cebolla", rcp_ing5: "Ajo", rcp_ing6: "Mantequilla", rcp_ing7: "Aceite de oliva", rcp_ing8: "Sal y pimienta", rcp_ing9: "Perejil fresco",
                rcp_ing1_qty: "400 g", rcp_ing2_qty: "250 ml", rcp_ing3_qty: "50 g", rcp_ing4_qty: "1 mediana", rcp_ing5_qty: "3 dientes", rcp_ing6_qty: "30 g", rcp_ing7_qty: "2 cdas", rcp_ing8_qty: "Al gusto", rcp_ing9_qty: "Para decorar",
                rcp_tip_title: "Consejo de compra", rcp_tip_text: "Busca pechugas de pollo sin piel y uniformes en grosor para una cocción pareja. La crema de leche con al menos 30% de grasa garantiza una salsa más espesa y sedosa.",
                rcp_steps_label: "Pasos", rcp_diff_label: "Dificultad", rcp_diff_val: "Medio",
                rcp_s1_title: "El Sellado Perfecto", rcp_s1_heat: "🔥 Fuego medio-alto",
                rcp_s1_text: "Salpimentamos las pechugas con cariño y las doramos en el sartén a fuego medio-alto con mantequilla y un hilo de aceite de oliva, hasta conseguir una <strong class=\"text-zinc-800 dark:text-zinc-200\">costra dorada impecable</strong> por ambos lados.",
                rcp_s1_tip: "Seca muy bien el pollo con papel absorbente antes de condimentarlo. La humedad es el peor enemigo de un dorado crujiente. Y sal abundante justo antes de poner en el sartén, no antes.",
                rcp_s2_title: "La Base del Sabor", rcp_s2_heat: "🔥 Fuego medio",
                rcp_s2_text: "Retiramos el pollo y, <strong class=\"text-zinc-800 dark:text-zinc-200\">en los mismos jugos de cocción</strong>, sofreímos la cebolla finamente picada y el ajo triturado hasta que estén cristalinos, dorados y muy aromáticos. No los descuides.",
                rcp_s2_tip: "¡Los fondos del sartén son oro! Usa una espátula de madera para raspar suavemente mientras sofrías. Ahí están concentrados los sabores más profundos del pollo.",
                rcp_s3_title: "La Magia Cremosa", rcp_s3_heat: "🔥 Fuego bajo",
                rcp_s3_text: "Vertemos la crema de leche, ajustamos la sal, agregamos el queso parmesano rallado. Bajamos el fuego al mínimo y dejamos <strong class=\"text-zinc-800 dark:text-zinc-200\">reducir lentamente</strong> hasta conseguir una salsa espesa y sedosa que nape la cuchara.",
                rcp_s3_tip: "¡Paciencia! Nunca dejes que la crema hierva a fuego alto porque se puede cortar. Un hervor suave y amoroso es la clave. Revuelve con movimientos lentos y circulares.",
                rcp_s4_title: "El Reencuentro", rcp_s4_heat: "🔥 Fuego muy bajo",
                rcp_s4_text: "Devolvemos las pechugas (con todos sus jugos) al sartén. Las bañamos en la salsa y las dejamos terminar de cocinar suavemente por dentro, absorber el sabor y <strong class=\"text-zinc-800 dark:text-zinc-200\">fusionarse con la crema</strong>.",
                rcp_s4_tip: "Apaga el fuego y deja reposar 2-3 minutos antes de servir. Los jugos se redistribuyen dentro del pollo y quedará asombrosamente jugoso. Decora con perejil fresco picado y ralladura de parmesano.",
                rcp_chef_secret: "Secreto del Chef", rcp_step_done: "Paso completado ✓", rcp_progress: "Progreso de la receta",
                rcp_tech_temp: "Control de Temperatura", rcp_tech_seal: "Sellado inicial", rcp_tech_seal_val: "Alta · 200°C", rcp_tech_saute: "Sofrito", rcp_tech_saute_val: "Media · 150°C", rcp_tech_cream: "Reducción crema", rcp_tech_cream_val: "Baja · 90°C",
                rcp_tech_keys: "Claves de Éxito", rcp_tech_k1_t: "Paciencia", rcp_tech_k1_d: "Nunca apresures la crema. La magia lleva tiempo.", rcp_tech_k2_t: "Temperatura", rcp_tech_k2_d: "Respeta cada nivel de fuego. Es la diferencia entre bueno y extraordinario.", rcp_tech_k3_t: "Amor", rcp_tech_k3_d: "El ingrediente secreto que no está en ninguna lista pero se siente en cada bocado.",
                rcp_secret_title: "El Ingrediente Secreto", rcp_secret_text: "Esta receta no es solo comida. Es una promesa. La promesa de que quiero cuidarte en todos los sentidos, incluyendo alimentarte con todo mi amor. Cada vez que prepare este plato, será pensando en ti, en tu sonrisa al probar el primer bocado, y en la vida que quiero construir a tu lado.",
                rcp_secret_badge: "Con amor, para Yaire 🌷",
                rcp_tech_errors: "Errores a Evitar", rcp_err1_t: "Pollo mojado antes de sellar", rcp_err1_d: "Sécalo con papel absorbente, la humedad impide el dorado y crea vapor.", rcp_err2_t: "Hervir la crema a fuego alto", rcp_err2_d: "La crema se corta y se separa. Siempre fuego muy bajo y paciencia.", rcp_err3_t: "Servir inmediatamente tras apagar", rcp_err3_d: "Dale 2-3 minutos de reposo para jugos redistribuyan. Vale la pena.",
                rcp_tech_vars: "Variantes Especiales", rcp_var1_t: "🍄 Variante Gourmet", rcp_var1_d: "Agrega champiñones salteados y un toque de vino blanco antes de la crema.", rcp_var2_t: "🌿 Variante Aromática", rcp_var2_d: "Añade tomillo fresco, romero o albahaca para una fragancia irresistible.", rcp_var3_t: "🌶️ Variante Picante", rcp_var3_d: "Una pizca de pimienta cayena o ajillo le da un contraste perfecto.", rcp_var4_t: "🧀 Variante 4 Quesos", rcp_var4_d: "Mezcla mozzarella, gouda, parmesano y crema para una salsa explosiva.",
                rcp_tech_sides: "Acompañamientos Ideales",
                rcp_side1: "🍚 Arroz blanco", rcp_side2: "🥦 Brócoli al vapor", rcp_side3: "🥔 Puré de papa", rcp_side4: "🥗 Ensalada verde", rcp_side5: "🍞 Pan artesanal",
                rcp_secret_dist: "Porque la distancia nunca fue un obstáculo.",
                rcp_sec_c1_t: "La Escena Perfecta", rcp_sec_c1_d: "La mesa, dos platos, música suave, te mirarte y saber que este momento fue el final de la espera. Todo eso es parte de la receta.",
                rcp_sec_c2_t: "El Pacto Gastronómico", rcp_sec_c2_d: "Yo aprendo a hacerla exactamente a tu gusto. Tú me enseñas lo que más te gusta de ella. Y así construimos algo nuestro.",
                rcp_sec_c3_t: "La Promesa", rcp_sec_c3_d: "Un día este modal será historia. Porque estaremos en la misma cocina, y yo estaré cocinándola personalmente, solo para ti.",
                // Healing Center
                menu_healing: "Sanación",
                heal_badge: "💊 Centro de Sanación", heal_title: "Reparar con Oro", heal_subtitle: "En Japón, el Kintsugi repara lo roto con oro, haciéndolo más bello que antes. Así quiero tratar cada herida entre nosotros.",
                heal_progress_label: "Progreso de sanación",
                heal_s1_label: "Paso 1 de 5", heal_s1_title: "🫁 Respira conmigo", heal_s1_sub: "Antes de hablar, calmemos el corazón. Sigue el ritmo.",
                heal_breathe_ready: "Toca para empezar", heal_breathe_count: "0 de 3 ciclos", heal_continue: "Continuar →", heal_back: "← Volver",
                heal_s2_label: "Paso 2 de 5", heal_s2_title: "🪞 Reconozco que...", heal_s2_sub: "No busco excusas. Reconozco mis errores con honestidad.",
                heal_ack1_t: "A veces no escucho como debería", heal_ack1_d: "Prometo prestar atención real: no solo oír, sino escucharte con el alma.",
                heal_ack2_t: "Mis silencios a veces lastiman", heal_ack2_d: "Cuando me quedo callado no es porque no me importe; a veces no sé cómo expresarme.",
                heal_ack3_t: "Puedo ser terco cuando discutimos", heal_ack3_d: "Reconozco que a veces me aferro a tener razón en vez de buscar la paz.",
                heal_ack4_t: "La distancia amplifica mis errores", heal_ack4_d: "Lo que en persona se arregla con un abrazo, por pantalla se vuelve días de angustia.",
                heal_s3_label: "Paso 3 de 5", heal_s3_title: "👂 Te escucho", heal_s3_sub: "Intento ponerme en tu lugar y sentir lo que tú sientes.",
                heal_listen_from: "Lo que creo que tú sientes", heal_listen_pers: "Desde tu perspectiva",
                heal_listen_1: '"Sé que cuando me quedo en silencio sientes que no me importa, aunque no sea así. Sé que a veces necesitas que te diga las cosas en el momento, no después. Sé que la distancia lo hace más difícil y que ambos estamos aprendiendo."',
                heal_listen_2: '"Solo quiero sentirme segura. Saber que cuando hablo, me escuchas de verdad. Que cuando algo me duele, no lo minimizas. Que estamos en el mismo equipo."',
                heal_temp_label: "Temperatura emocional", heal_temp_warm: "Tibia — bajando la guardia", heal_temp_cool: "En paz — gana el amor",
                heal_s4_label: "Paso 4 de 5", heal_s4_title: "🤝 Nuestro pacto", heal_s4_sub: "Compromisos reales. Firma cada uno para sellar la promesa.",
                heal_pact1_t: "Hablar antes de explotar", heal_pact1_d: "Si algo me incomoda, lo digo con calma en el momento. No lo acumulo.",
                heal_pact2_t: "Pedir pausa, nunca huir", heal_pact2_d: "Si necesito espacio, lo pido. Pero siempre vuelvo para resolver.",
                heal_pact3_t: "El problema vs. nosotros", heal_pact3_d: "Nunca eres tú contra mí. Siempre somos nosotros contra el problema.",
                heal_pact4_t: "Nunca dormir con rabia", heal_pact4_d: 'Aunque sea difícil, buscar siempre un "buenas noches" sincero antes de dormir.',
                heal_pact_pending: "Pendiente", heal_pact_signed: "✓ Firmado",
                heal_s5_label: "Paso 5 de 5", heal_s5_title: "🫂 El abrazo", heal_s5_sub: "Lo que estaba roto ahora brilla con oro. Somos más fuertes que antes.",
                heal_final_title: "Sanados y más fuertes", heal_final_text: "Cada grieta reparada es una prueba de que elegimos quedarnos. De que el amor no es solo sentir bonito: también es reconstruir juntos. Tú y yo, siempre.",
                heal_final_quote: '"Lo que se rompe y se repara con oro es más bello que lo que nunca se rompió."',
                heal_stat_ack: "Reconocidos", heal_stat_pact: "Pactos", heal_stat_healed: "Sanado", heal_restart: "↻ Reiniciar",
                // Song Section
                univ_lock_title: "Contenido Clasificado",
                univ_lock_subtitle: "Esta sorpresa se desbloquea el 28 de Abril.",
                univ_lock_btn: "Saber más",
                univ_unlock_badge: "🎂 3 Meses Juntos",
                univ_unlock_title: "Tulipanes Pa' Yaire",
                univ_unlock_desc: "Una canción compuesta desde cero, solo para ti. Cada beat, cada violín y cada letra tiene tu nombre. Este es el soundtrack oficial de nosotros dos.",
                univ_unlock_btn: "<svg class=\"w-4 h-4\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8 5v14l11-7z\"/></svg>Escuchar la canción",
                univ_unlock_footer: "© 2026 Charles Gustav & Google Flow Music.",
                univ_wrapped_title: "28E Wrapped",
                univ_wrapped_subtitle: "Una sorpresa especial por nuestros 4 meses juntos. Tu resumen personalizado de nuestros momentos.",
                univ_wrapped_btn: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Abrir',
                menu_song: "Tu Canción",
                song_badge: "🎤 Producción Original", song_title: "Tulipanes Pa' Yaire",
                song_subtitle: "No todos tienen una canción hecha exclusivamente para ellos. Esta es nuestra banda sonora oficial, y tú eres la protagonista absoluta.",
                song_now_playing: "Reproduciendo", song_genre: "Jersey Club · Thriller Cinemático",
                song_story_title: "La Historia Detrás del Track",
                song_story_text: "No fue solo abrir un programa y colocar notas aleatorias. Cada beat, cada línea y cada crescendo tiene un significado real y un pedazo de lo que siento por ti.",
                song_card1_label: "El Concepto", song_card1_desc: "No quería dedicarte una canción que ya existiera. Quería crear algo desde cero que capturara exactamente cómo me haces sentir: esa mezcla de adrenalina, nervios y fascinación total.",
                song_card2_label: "El Género", song_card2_desc: "Una fusión inesperada: el suspenso cinematográfico representa cómo mi mundo se detiene cuando te veo, y el drop explosivo de Jersey Club es como se acelera mi corazón por ti.",
                song_card3_label: "La Dedicatoria", song_card3_desc: "Cada 'Yaire' pronunciado en esta canción es un grito al universo de lo orgulloso que estoy de ti. Es un recordatorio de que eres mi musa, mi reina y mi inspiración constante.",
                song_lyrics_title: "La Letra Completa", song_lyrics_hint: "Toca cada sección para revelar la letra",
                song_intro_tag: "Violines Thriller Cinemáticos", song_prechorus_tag: "Cuerdas Ascendentes + 808 Sub",
                song_chorus_tag: "Jersey Club Beat Drop", song_verse_tag: "Fast Flow · Rhythmic Bounce",
                song_bridge_tag: "Violines Staccato Thriller", song_outro_tag: "Fade Out · 808s + Cuerdas Lentas",
                song_expand_all: "Expandir Letra Completa", song_collapse_all: "Contraer Letra",
                song_key_cminor: "Do menor", song_sing_along: "Canta conmigo",
                song_closing_title: "\"Nuestra propia melodía\"", song_closing_desc: "Porque las mejores historias de amor no solo se leen o se ven, también se escuchan. Y esta melodía está hecha a la medida de tu sonrisa.",
                song_composed_by: "Compuesta con amor por Charles Gustav",
                footer_privacy: "Política de Privacidad",
                credits_btn: "Créditos de Producción", credits_title: "Créditos Oficiales",
                credits_sec_dir: "Concepto & Diseño", credits_lbl_dir: "Dirección Creativa", credits_lbl_insp: "Inspiración Absoluta", credits_lbl_dev: "Desarrollo UI/UX & Código", credits_lbl_thanks: "Agradecimiento Especial",
                credits_sec_tech: "Tecnologías & Core", credits_lbl_lang: "Lenguaje Base", credits_lbl_struct: "Estructura & Semántica", credits_lbl_frame: "Framework de Estilos", credits_lbl_arch: "Arquitectura App", credits_lbl_store: "Almacenamiento", credits_lbl_pwa: "Compatibilidad PWA",
                credits_sec_lib: "Librerías Visuales & Motores", credits_lbl_anim: "Animación Avanzada", credits_lbl_scroll: "Disparadores de Scroll", credits_lbl_data: "Visualización de Datos", credits_lbl_fonts: "Tipografías",
                credits_sec_sys: "Sistemas Especiales (Custom)", credits_lbl_audio: "Motor de Sonido 0-Lag", credits_lbl_i18n: "Traducción Dinámica", credits_lbl_swipe: "Gestos Táctiles Móviles", credits_lbl_canvas: "Render de Partículas",
                letter_next_btn: "Siguiente →", letter_fin_btn: "✓ Fin"
            }
        };

        let currentLang = 'es';
        let chartInstance = null;

        // SISTEMA WEB AUDIO API (Ultra Latencia Cero en Hardware)
        const __audioBuffers = {};
        async function preloadWebAudio(url) {
            try {
                const TempCtx = window.AudioContext || window.webkitAudioContext;
                if (!window._sharedAudioCtx) window._sharedAudioCtx = new TempCtx();
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                __audioBuffers[url] = await window._sharedAudioCtx.decodeAudioData(arrayBuffer);
            } catch (e) { }
        }

        window.playEffect = function (url) {
            try {
                const TempCtx = window.AudioContext || window.webkitAudioContext;
                if (!window._sharedAudioCtx) window._sharedAudioCtx = new TempCtx();
                if (window._sharedAudioCtx.state === 'suspended') window._sharedAudioCtx.resume();

                if (__audioBuffers[url]) {
                    const source = window._sharedAudioCtx.createBufferSource();
                    source.buffer = __audioBuffers[url];
                    const gain = window._sharedAudioCtx.createGain();
                    gain.gain.value = 0.7; // Volumen estético
                    source.connect(gain);
                    gain.connect(window._sharedAudioCtx.destination);
                    source.start(0);
                } else {
                    const a = new Audio(url);
                    a.volume = 0.7;
                    a.play().catch(e => { });
                    preloadWebAudio(url);
                }
            } catch (e) { }
        };

        // Precargar archivos al instante
        setTimeout(() => preloadWebAudio('sounds/flyin.wav'), 500);

        // ══════════ SISTEMA DE SONIDO NATIVO ══════════
        let audioCtx = null;
        function playSound(type) {
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();

                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                const now = audioCtx.currentTime;

                if (type === 'pop') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                    gainNode.gain.setValueAtTime(0.2, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1);
                } else if (type === 'ding') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                    gainNode.gain.setValueAtTime(0.15, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now); osc.stop(now + 0.3);
                } else if (type === 'flap') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1);
                } else if (type === 'bonk') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                    gainNode.gain.setValueAtTime(0.15, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now); osc.stop(now + 0.2);
                } else if (type === 'error') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(150, now);
                    gainNode.gain.setValueAtTime(0.15, now);
                    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now); osc.stop(now + 0.2);
                } else if (type === 'magic') {
                    const notes = [400, 523.25, 659.25, 800, 1046.5];
                    notes.forEach((freq, i) => {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.type = 'sine'; o.frequency.value = freq;
                        o.connect(g); g.connect(audioCtx.destination);
                        const t = now + (i * 0.08);
                        g.gain.setValueAtTime(0, t);
                        g.gain.linearRampToValueAtTime(0.1, t + 0.02);
                        g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                        o.start(t); o.stop(t + 0.3);
                    });
                }
            } catch (e) { }
        }

        // ══════════ INICIO PRINCIPAL ══════════
        let loaderEscondido = false;

        logDebug('Script loader principal ejecutando');

        // ── Fast Loader ──────────────────────────────────────────
        document.addEventListener('DOMContentLoaded', () => {
            logDebug('DOMContentLoaded disparado');

            const loaderEl = document.getElementById('loader');

            // ── Fast exit — fade out immediately ──
            if (window.__cancelLoaderSafety) window.__cancelLoaderSafety();
            loaderEscondido = true;

            if (loaderEl) {
                loaderEl.style.opacity = '0';
                setTimeout(() => {
                    loaderEl.style.display = 'none';
                    document.body.classList.add('page-ready');
                }, 350);
            } else {
                document.body.classList.add('page-ready');
            }

            setTimeout(() => {
                initScrollSpy();
                const top5Section = document.getElementById('top5yaire');
                if (top5Section) {
                    const barObs = new IntersectionObserver((entries) => {
                        entries.forEach(e => { if (e.isIntersecting) { animateWordBars(); barObs.disconnect(); } });
                    }, { threshold: 0.3 });
                    barObs.observe(top5Section);
                }
            }, 500);

            // 2. Inicialización Básica
            logDebug('Llamando a initTheme()');
            initTheme();
            logDebug('Llamando a initLanguage()');
            initLanguage();
            logDebug('Llamando a AudioManager.init()');
            AudioManager.init();
            logDebug('Inicializaciones básicas terminadas. Configuracion defer ida...');
            
            // Defer heavy inits until after loader exits to prevent CPU saturation
            if (window.__runWhenIdle) {
                window.__runWhenIdle(() => { initChart(); initButterflyGame(); }, 5000);
            } else {
                setTimeout(() => { initChart(); initButterflyGame(); }, 2000);
            }

            // 3. Temporizadores
            logDebug('Iniciando temporizadores');
            let countersInterval = setInterval(updateCounters, 1000);
            updateCounters();
            logDebug('Fin del bloque DOMContentLoaded síncrono');

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    if (countersInterval) {
                        clearInterval(countersInterval);
                        countersInterval = null;
                    }
                    return;
                }
                updateCounters();
                if (!countersInterval) countersInterval = setInterval(updateCounters, 1000);
            });

            // 4. Teclado Bóveda Secreta
            const pwdInput = document.getElementById('secret-pwd');
            if (pwdInput) {
                pwdInput.addEventListener('input', () => {
                    AudioManager.play('typing.wav', 0.6);
                    const cc = document.getElementById('pwd-char-count');
                    if (cc) cc.textContent = pwdInput.value.length;
                    const glow = document.getElementById('vault-glow');
                    if (glow) { glow.style.opacity = '1'; clearTimeout(glow._t); glow._t = setTimeout(() => glow.style.opacity = '', 400); }
                });

                // Detectar tecla Enter para desbloquear y ESC para volver
                pwdInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        checkPassword();
                    }
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        closeSecretModal();
                    }
                });
            }
        });

        // ══════════ NÚCLEO DE LA PÁGINA ══════════
        // Cache DOM refs una sola vez — evitar 6 getElementById por tick de 1 segundo
        const _cntEls = {};
        function _getCntEl(id) {
            return _cntEls[id] || (_cntEls[id] = document.getElementById(id));
        }

        function updateCounters() {
            const start = new Date('2026-01-28T00:00:00').getTime();
            const now = new Date().getTime();
            const diff = now - start;
            const elMonths = _getCntEl('count-months');
            const elDays = _getCntEl('count-days');
            const elHours = _getCntEl('count-hours');
            const elMins = _getCntEl('count-mins');
            const elSecs = _getCntEl('count-secs');
            const elTotalDays = _getCntEl('total-days-count');

            if (diff > 0) {
                const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
                const d = new Date(now);
                const sDate = new Date(start);

                let months = (d.getFullYear() - sDate.getFullYear()) * 12 + d.getMonth() - sDate.getMonth();
                let tempD = new Date(sDate);
                tempD.setMonth(sDate.getMonth() + months);
                if (d < tempD) {
                    months--;
                    tempD = new Date(sDate);
                    tempD.setMonth(sDate.getMonth() + months);
                }

                const msDiff = d.getTime() - tempD.getTime();
                const days = Math.floor(msDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((msDiff / (1000 * 60 * 60)) % 24);
                const mins = Math.floor((msDiff / 1000 / 60) % 60);
                const secs = Math.floor((msDiff / 1000) % 60);

                const dict = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {};
                const secsSuffix = (dict.time_secs_suffix || '+ {s} segundos latiendo por ti').replace('{s}', secs);

                if (elMonths) elMonths.innerText = months;
                if (elDays) elDays.innerText = days;
                if (elHours) elHours.innerText = hours;
                if (elMins) elMins.innerText = mins;
                if (elSecs) elSecs.innerText = secsSuffix;
                if (elTotalDays) elTotalDays.innerText = totalDays;
            }
        }

        function initTheme() {
            document.documentElement.classList.add('dark');
            if (typeof chartInstance !== 'undefined' && chartInstance) { chartInstance.options.plugins.legend.labels.color = '#a1a1aa'; chartInstance.update(); }
            if (typeof drawButterflyGame === 'function') drawButterflyGame();
        }

        function initLanguage() {

            setLanguage('es', false);
        }

        function setLanguage(lang, playSound = false) {
            if (!dictionary[lang]) return;
            if (playSound) AudioManager.play('language.wav', 0.6);
            currentLang = lang;
            const dict = dictionary[lang];

            document.querySelectorAll('.lang-btn').forEach(b => {
                if (b.getAttribute('data-lang') === lang) {
                    b.classList.add('bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900', 'shadow-sm');
                    b.classList.remove('text-zinc-500', 'dark:text-zinc-400', 'hover:text-zinc-800', 'dark:hover:text-zinc-200');
                } else {
                    b.classList.remove('bg-zinc-900', 'dark:bg-white', 'text-white', 'dark:text-zinc-900', 'shadow-sm');
                    b.classList.add('text-zinc-500', 'dark:text-zinc-400', 'hover:text-zinc-800', 'dark:hover:text-zinc-200');
                }
            });

            document.querySelectorAll('[data-i18n]').forEach(el => {
                const k = el.getAttribute('data-i18n');
                if (dict[k]) {
                    el.innerHTML = dict[k];
                }
            });

            // Translate placeholders
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const k = el.getAttribute('data-i18n-placeholder');
                if (dict[k]) el.placeholder = dict[k];
            });

            // Translate aria-labels
            document.querySelectorAll('[data-i18n-aria]').forEach(el => {
                const k = el.getAttribute('data-i18n-aria');
                if (dict[k]) el.setAttribute('aria-label', dict[k]);
            });

            // Dispatch a custom event so standalone components can update themselves
            window.dispatchEvent(new CustomEvent('languagechange', { detail: lang }));

            if (chartInstance) { chartInstance.data.labels = dict.chart_labels; chartInstance.data.datasets[0].label = dict.chart_dataset; chartInstance.update(); }

            const il = document.getElementById('recipe-ing-list');
            if (il) il.innerHTML = dict.recipe_ing.map(i => `<div class="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-700"><span class="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0"></span><span class="font-medium text-sm md:text-base">${i}</span></div>`).join('');

            const rst = document.getElementById('recipe-sec-text'); if (rst) rst.innerText = dict.recipe_sec_text;

            // Admin config overrides (always applied AFTER i18n so they are never overwritten)
            applyAdminConfigOverrides();
        }

        function applyAdminConfigOverrides() {
            try {
                const cfg = JSON.parse(localStorage.getItem('yaire_config') || '{}');

                // Detectar idioma activo (es / en / pt / fr)
                const lang = (typeof currentLang !== 'undefined' ? currentLang : 'es').toLowerCase().split('-')[0];
                const isSpanish = (lang === 'es');
                const suffix = isSpanish ? '' : `_${lang}`;

                // Mapa de "veces" en cada idioma
                const timesWord = { es: 'veces', en: 'times', pt: 'vezes', fr: 'fois' }[lang] || 'veces';

                // Top 5 Palabras
                for (let i = 1; i <= 5; i++) {
                    const wBadge = cfg[`w${i}Badge`];
                    const wWord = cfg[`w${i}Word`];
                    const wDesc = isSpanish ? cfg[`w${i}Desc`] : cfg[`w${i}Desc${suffix}`];

                    if (wBadge) {
                        const badgeEl = document.querySelector(`[data-i18n="w${i}_badge"]`);
                        if (badgeEl) {
                            // Traducir "veces" al idioma activo en el badge (#1416 veces → #1416 times)
                            badgeEl.innerHTML = wBadge.replace(/veces/i, timesWord);
                            if (wWord && badgeEl.previousElementSibling) badgeEl.previousElementSibling.innerHTML = wWord;
                        }
                    }
                    if (wDesc) {
                        const descEl = document.querySelector(`[data-i18n="w${i}_desc"]`);
                        if (descEl) descEl.innerHTML = wDesc;
                    }
                }

                // Top 5 Frases
                for (let i = 1; i <= 5; i++) {
                    const pText = cfg[`p${i}Text`];
                    const pDesc = isSpanish ? cfg[`p${i}Desc`] : cfg[`p${i}Desc${suffix}`];

                    if (pText) {
                        const pEl = document.querySelector(`[data-i18n="p${i}_text"]`);
                        if (pEl) pEl.innerHTML = pText;
                    }
                    if (pDesc) {
                        const dEl = document.querySelector(`[data-i18n="p${i}_desc"]`);
                        if (dEl) dEl.innerHTML = pDesc;
                    }
                }

                // Emoji card — plantilla por idioma
                if (cfg.emojiTop) {
                    const emojiTemplates = {
                        es: (n) => `Su emoji más usado en el chat (${n} veces)`,
                        en: (n) => `Her most used emoji in the chat (${n} times)`,
                        pt: (n) => `O emoji mais usado no chat (${n} vezes)`,
                        fr: (n) => `Son emoji le plus utilisé dans le chat (${n} fois)`
                    };
                    const emojiTpl = emojiTemplates[lang] || emojiTemplates.es;
                    const emojiEl = document.querySelector('[data-i18n="emoji_card_desc"]');
                    if (emojiEl) emojiEl.innerHTML = emojiTpl(cfg.emojiTopCount || '?');
                    const emojiIcon = document.querySelector('.cv-section .text-2xl.drop-shadow-sm');
                    if (emojiIcon) emojiIcon.textContent = cfg.emojiTop;
                }
            } catch (e) { }
        }

        // ═══ Admin Panel: Recarga automática cuando se guardan cambios ═══
        window.addEventListener('storage', (e) => {
            if (e.key === 'yaire_reload') {
                location.reload();
            }
        });

        // ═══ Performance: Page Visibility API ═══
        // Pause intensive operations when tab is hidden to save battery
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                // Tab hidden: pause background stuff
                if (window.chartInstance) window.chartInstance.stop();
                if (game1Active) { clearInterval(timer1Interval); cancelAnimationFrame(g1FrameId); }
                if (butterflyActive) cancelAnimationFrame(bFrameId);
                if (game3Active) clearInterval(game3Timer);

                // Mute audio internally if playing long ambient tracks (skip voice channel peers)
                document.querySelectorAll('audio:not([data-vc-peer]), video').forEach(media => {
                    if (!media.paused) {
                        media.dataset.wasPlaying = "true";
                        media.pause();
                    }
                });
            } else {
                // Tab visible: resume
                if (window.chartInstance) window.chartInstance.update();

                // Games resume
                if (game1Active) {
                    clearInterval(timer1Interval);
                    timer1Interval = setInterval(() => { timeLeft1--; updateG1HUD(); if (timeLeft1 <= 0) endGame1(); }, 1000);
                    g1Loop();
                }
                if (butterflyActive) bFrameId = requestAnimationFrame(gameLoopB);
                if (game3Active) {
                    clearInterval(game3Timer);
                    game3Timer = setInterval(() => {
                        game3TimeLeft--;
                        const tEl = document.getElementById('game3-time');
                        if (tEl) tEl.innerText = game3TimeLeft + 's';
                        const ring = document.getElementById('g3-timer-ring');
                        if (ring) { const pct = Math.max(0, game3TimeLeft / 60), c = 2 * Math.PI * 24; ring.style.strokeDashoffset = c * (1 - pct); ring.style.stroke = pct > 0.5 ? '#a855f7' : pct > 0.17 ? '#f59e0b' : '#ef4444'; }
                        if (game3TimeLeft <= 0) endGame3(false);
                    }, 1000);
                }

                document.querySelectorAll('audio:not([data-vc-peer]), video').forEach(media => {
                    if (media.dataset.wasPlaying === "true") {
                        media.play().catch(e => console.log(e));
                        media.dataset.wasPlaying = "false";
                    }
                });
            }
        });

        // Motor de Audio
        const AudioManager = {
            muted: localStorage.getItem('yaire-muted') === 'true',
            ctx: null,
            buffers: {},
            _warmedUp: false,
            _audioCache: {},

            // ── All sounds in the project ──
            _critical: [
                'typing.wav', 'flyin.wav', 'flyout.wav', 'transicion.wav',
                'navegacion.wav', 'modos.wav', 'scroll.wav', 'seleccionsi.wav',
                'seleccionno.wav', 'inicio.wav', 'slideralto.wav', 'sliderbajo.wav',
                'incorrect.wav', 'correcto.wav', 'secret.wav', 'hover.wav'
            ],
            _secondary: [
                'abrirtusecreto.mp3', 'celebration.wav', 'clickgirasol.wav', 'colors.wav',
                'dedicatoriacarta.mp3', 'entrarcarta.mp3', 'entry.wav',
                'gameopen.wav', 'juego.wav', 'language.wav', 'navegarcarta.mp3',
                'perdergirasol.wav', 'revelacion.wav', 'tarjetas.wav'
            ],

            // Crea el AudioContext — se llama al init(), sin esperar gesto
            initContext: function () {
                if (!this.ctx) {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (AC) {
                        try {
                            this.ctx = new AC();
                            // Arrancar preload de buffers inmediatamente
                            this._startPreload();
                        } catch (e) { }
                    }
                }
            },

            // Resume si estaba suspendido (requerido tras política de autoplay)
            _resume: function () {
                if (this.ctx && this.ctx.state === 'suspended') {
                    return this.ctx.resume().catch(() => { });
                }
                return Promise.resolve();
            },

            // Toca un buffer silencioso de 1 muestra — abre el pipeline de hardware.
            // Sin esto, incluso con buffers precargados el primer sonido tiene latencia.
            _warmUp: function () {
                if (this._warmedUp || !this.ctx) return;
                this._warmedUp = true;
                try {
                    const buf = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
                    const src = this.ctx.createBufferSource();
                    src.buffer = buf;
                    src.connect(this.ctx.destination);
                    src.start(0);
                } catch (e) { }
            },

            // Precarga todos los buffers en oleadas
            _startPreload: function () {
                // Oleada 1: sonidos críticos de inmediato
                this._critical.forEach(s => this._loadBuffer(s));
                // Oleada 2: secundarios 800ms después
                setTimeout(() => {
                    this._secondary.forEach(s => this._loadBuffer(s));
                }, 800);
            },

            // Descarga y decodifica un archivo al buffer (idempotente)
            _loadBuffer: async function (soundFile) {
                if (this.buffers[soundFile] || !this.ctx) return;
                try {
                    const res = await fetch(`sounds/${soundFile}`);
                    const ab = await res.arrayBuffer();
                    // decodeAudioData puede fallar si el ctx está suspendido — no pasa nada,
                    // el fallback de Audio lo manejará mientras tanto
                    this.buffers[soundFile] = await this.ctx.decodeAudioData(ab);
                } catch (e) { }
            },

            // Reproduce desde buffer WebAudio (latencia ~1ms) o fallback cloneNode
            _playBuffer: function (soundFile, volume) {
                if (this.buffers[soundFile] && this.ctx) {
                    // WebAudio path — latencia de hardware mínima
                    const source = this.ctx.createBufferSource();
                    source.buffer = this.buffers[soundFile];
                    const gain = this.ctx.createGain();
                    // setValueAtTime en lugar de .value para evitar clicks de audio
                    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
                    source.connect(gain);
                    gain.connect(this.ctx.destination);
                    // ctx.currentTime = scheduling preciso (no 0)
                    source.start(this.ctx.currentTime);
                } else {
                    // Fallback: Audio cloneNode (buffer HTML5 precargado)
                    if (!this._audioCache[soundFile]) {
                        const a = new Audio(`sounds/${soundFile}`);
                        a.preload = 'auto';
                        this._audioCache[soundFile] = a;
                    }
                    const clone = this._audioCache[soundFile].cloneNode();
                    clone.volume = volume;
                    clone.play().catch(() => { });
                    // Disparar preload WebAudio para la próxima vez
                    this._loadBuffer(soundFile);
                }
            },

            play: function (soundFile, volume = 0.5) {
                if (this.muted) return;
                try {
                    if (!this.ctx) this.initContext();
                    if (!this.ctx) { this._playBuffer(soundFile, volume); return; }

                    if (this.ctx.state === 'suspended') {
                        // Resume primero, luego reproducir — evita el lag de ctx suspendido
                        this._resume().then(() => this._playBuffer(soundFile, volume));
                    } else {
                        this._playBuffer(soundFile, volume);
                    }
                } catch (e) { }
            },

            toggle: function () {
                this.muted = !this.muted;
                localStorage.setItem('yaire-muted', this.muted);
                const icon = document.getElementById('sound-icon');
                if (icon) icon.textContent = this.muted ? '🔇' : '🔊';
                if (typeof spotAudio !== 'undefined') spotAudio.muted = this.muted;
            },

            init: function () {
                const icon = document.getElementById('sound-icon');
                if (icon) icon.textContent = this.muted ? '🔇' : '🔊';
                const btn = document.getElementById('sound-toggle');
                if (btn) btn.addEventListener('click', () => {
                    if (!this.muted) {
                        this.play('sliderbajo.wav', 0.6);
                        setTimeout(() => this.toggle(), 100);
                    } else {
                        this.toggle();
                        this.play('slideralto.wav', 0.6);
                    }
                });

                // ⚡ Crear AudioContext + iniciar preload INMEDIATAMENTE
                // (no esperamos al primer gesto — así los buffers ya están listos)
                try { this.initContext(); } catch (e) { }

                // En el primer gesto: resume() + warmUp del pipeline de hardware
                // Esto elimina la latencia del primer sonido completamente
                const warmup = () => {
                    this._resume().then(() => this._warmUp());
                    ['click', 'touchstart', 'keydown'].forEach(ev =>
                        document.removeEventListener(ev, warmup)
                    );
                };
                ['click', 'touchstart', 'keydown'].forEach(ev =>
                    document.addEventListener(ev, warmup, { once: true, passive: true })
                );
            }
        };


        let menuFocusTimeout = null;
        function toggleMenu() {
            const p = document.getElementById('menu-panel'), o = document.getElementById('drawer-overlay');
            const isOpen = p && p.classList.contains('open');
            if (!isOpen) {
                AudioManager.play('flyin.wav', 0.6);
                if (p) p.classList.add('open');
                if (o) { o.classList.remove('hidden'); setTimeout(() => o.classList.remove('opacity-0'), 10); }
                // Focus search ONLY if it remains open after 200ms (prevents fast Esc racing)
                clearTimeout(menuFocusTimeout);
                menuFocusTimeout = setTimeout(() => {
                    if (p && p.classList.contains('open')) {
                        const s = document.getElementById('menu-search');
                        if (s) s.focus();
                    }
                }, 200);
            } else {
                AudioManager.play('flyout.wav', 0.6);
                if (typeof isSpotlightExpanded !== 'undefined' && isSpotlightExpanded) {
                    toggleSpotlightExpand();
                }
                if (p) p.classList.remove('open');
                if (o) { o.classList.add('opacity-0'); setTimeout(() => o.classList.add('hidden'), 300); }
                // Clear search and ensure focus is killed
                clearTimeout(menuFocusTimeout);
                const s = document.getElementById('menu-search'); if (s) { s.value = ''; s.blur(); }
                filterMenuLinks('');
            }
        }

        // Search filter for menu links
        function filterMenuLinks(query) {
            const q = query.toLowerCase().trim();
            let visibleCount = 0;

            document.querySelectorAll('.injected-game-search, .no-search-results').forEach(e => e.remove());

            document.querySelectorAll('#menu-links .menu-link-item, #menu-links a.menu-link').forEach(link => {
                if (link.classList.contains('injected-game-search')) return;

                let text = link.textContent.toLowerCase();
                const isApril28 = true; // Unlocked logic

                // Hack anti-spoilers: Ocultar canción y bóveda del buscador hasta el 28 de Abril
                if (!isApril28 && (link.id === 'menu-song-link' || link.id === 'menu-vault-link')) {
                    text = 'locked_enigma_item_forbidden_search';
                }

                if (!q || text.includes(q)) {
                    link.style.display = '';
                    visibleCount++;
                } else {
                    link.style.display = 'none';
                }
            });

            document.querySelectorAll('#menu-links .menu-category-label').forEach(label => {
                const grid = label.nextElementSibling;
                if (grid) {
                    const hasVisible = Array.from(grid.children).some(c => c.style.display !== 'none' && !c.classList.contains('injected-game-search'));
                    label.style.display = hasVisible ? '' : 'none';
                }
            });

            if (q) {
                const t = dictionary[currentLang] || dictionary.es;
                const isUnlocked = true; // Unlocked logic
                const searchItems = [
                    { id: 'game1', type: 'game', keys: ['jardin', 'jardín', 'girasol', 'garden', 'sunflower', 'tournesol', 'girassol', 'juego', 'juegos', 'minijuego', 'minijuegos', 'game', 'games', 'jeux', 'jogo', 'jogos'], emoji: '🌻', title: t.game1_title || 'El Jardín de Yaire' },
                    { id: 'game2', type: 'game', keys: ['vuelo', 'mariposa', 'tulipan', 'tulipán', 'hacia ti', 'flight', 'butterfly', 'tulip', 'vol', 'papillon', 'tulipe', 'voo', 'borboleta', 'juego', 'juegos', 'minijuego', 'minijuegos', 'game', 'games', 'jeux', 'jogo', 'jogos'], emoji: '🦋', title: t.game2_title || 'Vuelo Hacia Ti' },
                    { id: 'mixer', type: 'tool', keys: ['mezcla', 'paleta', 'colores', 'mix', 'palette', 'colors', 'couleurs', 'mistura', 'cores', 'mixer', 'laboratorio', 'laboratoire'], emoji: '🎨', title: t.pal_mix_title || 'Mezcla tu Paleta' },
                    { id: 'color_guide', type: 'tool', keys: ['guia', 'guía', 'color', 'colores', 'tulip', 'tulipan', 'tulipán', 'guide', 'cores', 'couleurs'], emoji: '🌷', title: t.menu_tulip_colors || 'Guía de Colores' },
                    { id: 'recipe', type: 'recipe', keys: ['pechuga', 'crema', 'receta', 'recipe', 'chicken', 'poulet', 'frango', 'cocinar', 'cocina', 'cocinero', 'chef', 'food', 'comida', 'recette'], emoji: '🍴', title: t.recipe_title || 'Pechuga a la Crema' },
                    { id: 'wrapped', type: 'wrapped', keys: ['wrapped', 'resumen', '120', 'dias', 'estadisticas', 'stats', 'resumo', 'resume', 'estadísticas', 'historia'], emoji: '🎉', title: t.univ_wrapped_title || '28E Wrapped' }
                ];
                if (isUnlocked) {
                    searchItems.push({ id: 'game3', type: 'game', keys: ['cartas', 'ocultas', 'memoria', 'juego', 'juegos', 'minijuego', 'minijuegos', 'cards', 'hidden', 'memory', 'game', 'games', 'cartes', 'cachées', 'mémoire', 'jeux', 'memória', 'jogo', 'jogos'], emoji: '🃏', title: t.game3_title || 'Cartas Ocultas' });
                    searchItems.push({ id: 'game4', type: 'game', keys: ['adivina', 'cancion', 'canción', 'musica', 'música', 'audio', 'song', 'guess', 'music', 'chanson', 'devine', 'musique', 'adivinhe', 'juego', 'juegos', 'minijuego', 'minijuegos', 'game', 'games', 'jeux', 'jogo', 'jogos'], emoji: '🎵', title: t.game4_title || 'Adivina la Canción' });
                }

                let addedCategories = {};
                searchItems.forEach(g => {
                    if (g.keys.some(k => k.includes(q) || q.includes(k))) {
                        if (!addedCategories[g.type]) {
                            const sep = document.createElement('div');
                            sep.className = 'injected-game-search relative my-5';

                            let sepLabel, sepIcon;
                            if (g.type === 'game') {
                                sepLabel = t.menu_games || 'Minijuegos';
                                sepIcon = '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                            } else if (g.type === 'recipe') {
                                sepLabel = t.menu_recipe || 'Gastronomía';
                                sepIcon = '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>';
                            } else {
                                sepLabel = t.menu_tools || 'Herramientas';
                                sepIcon = '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>';
                            }

                            sep.innerHTML = `
                                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div class="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                                </div>
                                <div class="relative flex justify-center">
                                    <span class="bg-white dark:bg-[#121214] px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest text-brand-500 rounded-full border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-1.5">
                                        ${sepIcon}
                                        ${sepLabel}
                                    </span>
                                </div>
                            `;
                            document.getElementById('menu-links').appendChild(sep);
                            addedCategories[g.type] = true;
                        }

                        let btnText = t.search_game_btn;
                        if (g.type === 'recipe') btnText = t.search_recipe_btn || 'Ver Receta';
                        else if (g.type === 'tool') btnText = t.search_tool_btn || 'Abrir Herramienta';
                        else if (g.type === 'wrapped') btnText = t.univ_wrapped_btn ? t.univ_wrapped_btn.replace(/<svg[^>]*>.*?<\/svg>/g, '').trim() : 'Abrir';

                        const gameLink = document.createElement('div');
                        gameLink.tabIndex = 0;
                        gameLink.className = "injected-game-search menu-link-item cursor-pointer flex items-center justify-between p-3 rounded-xl transition-all mb-2 hover:bg-brand-50 hover:text-brand-600 focus:bg-brand-50 focus:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 dark:focus:bg-brand-900/30 dark:focus:text-brand-400 border border-transparent hover:border-brand-200 focus:border-brand-200 dark:hover:border-brand-900/50 dark:focus:border-brand-900/50";
                        gameLink.innerHTML = `<div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-sm group-hover:bg-brand-500/10 group-hover:text-brand-500 group-hover:border-brand-200 dark:group-hover:border-brand-800 transition-colors">${g.emoji}</div>
                            <span class="font-bold text-sm tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-brand-500 transition-colors">${g.title}</span>
                        </div>
                        <span class="text-[9px] text-brand-600 dark:text-brand-400 font-extrabold uppercase tracking-widest bg-brand-100/50 dark:bg-brand-900/40 px-2.5 py-1.5 rounded-md shadow-sm border border-brand-100 dark:border-brand-900/50">${btnText}</span>`;
                        gameLink.onclick = () => {
                            toggleMenu();
                            if (g.id === 'mixer') {
                                setTimeout(() => {
                                    const cy = document.getElementById('colores-yaire');
                                    if (cy) cy.scrollIntoView({ behavior: 'smooth' });
                                    if (typeof setPV === 'function') setPV('mixer');
                                }, 300);
                            } else if (g.id === 'color_guide') {
                                setTimeout(() => {
                                    const g = document.getElementById('guia-colores-tulipan');
                                    if (g) g.scrollIntoView({ behavior: 'smooth' });
                                }, 300);
                            } else if (g.id === 'recipe') {
                                setTimeout(() => {
                                    if (typeof openRecipeModal === 'function') openRecipeModal();
                                    const mj = document.getElementById('historia');
                                    if (mj) mj.scrollIntoView({ behavior: 'smooth' });
                                }, 300);
                            } else if (g.id === 'wrapped') {
                                setTimeout(() => {
                                    if (window.yaireCurrentUser) {
                                        if (typeof AudioManager !== 'undefined') AudioManager.play('entry.wav', 0.6);
                                        openModal('wrapped-redirect-modal', 'wrapped-redirect-content');
                                    } else {
                                        if (window.showPremiumAlert) window.showPremiumAlert('Acceso Restringido', 'Inicia sesión con tu cuenta de Google primero para ver tu 28E Wrapped.', 'error');
                                    }
                                }, 300);
                            } else {
                                setTimeout(() => {
                                    const mj = document.getElementById('minijuegos');
                                    if (mj) mj.scrollIntoView({ behavior: 'smooth' });
                                }, 300);
                                setTimeout(() => { openArcadeGame(g.id); }, 700);
                            }
                        };
                        document.getElementById('menu-links').appendChild(gameLink);
                        visibleCount++;
                    }
                });

                if (visibleCount === 0) {
                    const noRes = document.createElement('div');
                    noRes.className = 'no-search-results text-center py-10 opacity-70';
                    noRes.innerHTML = `
                        <div class="text-4xl mb-3">🥺</div>
                        <p class="text-sm font-bold text-zinc-500 dark:text-zinc-400">${t.search_empty_title}</p>
                        <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">${t.search_empty_sub}</p>
                    `;
                    document.getElementById('menu-links').appendChild(noRes);
                }
            }
        }

        // Wire up search input
        document.addEventListener('DOMContentLoaded', () => {
            const searchInput = document.getElementById('menu-search');
            if (searchInput) {
                searchInput.addEventListener('focus', () => {
                    const p = document.getElementById('menu-panel');
                    if (p && p.classList.contains('open')) AudioManager.play('modos.wav', 0.8);
                });
                searchInput.addEventListener('input', (e) => {
                    AudioManager.play('typing.wav', 0.6);
                    filterMenuLinks(e.target.value);
                });
            }
            // Arrow Keys, Enter, and Escape mapping for Menu Panel
            document.addEventListener('keydown', (e) => {
                const p = document.getElementById('menu-panel');

                // Atajo Global (Solo /)
                if (e.key === '/' && (!p || !p.classList.contains('open'))) {
                    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                        e.preventDefault();
                        toggleMenu();
                        return;
                    }
                }

                if (e.key === 'Escape') {
                    const searchInput = document.getElementById('menu-search');
                    // Stage 1: if menu is open and search has text, clear it
                    if (p && p.classList.contains('open') && searchInput && searchInput.value.trim() !== '') {
                        AudioManager.play('typing.wav', 0.6);
                        searchInput.value = '';
                        filterMenuLinks('');
                        searchInput.focus();
                        return;
                    }
                    // Stage 2: if menu is open and search is empty, close menu
                    if (p && p.classList.contains('open')) { toggleMenu(); return; }
                    // Also handle secret modal
                    const sm = document.getElementById('secret-modal');
                    if (sm && !sm.classList.contains('hidden')) closeSecretModal();
                }

                if (p && p.classList.contains('open')) {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        AudioManager.play('navegacion.wav', 0.8);
                        const searchInput = document.getElementById('menu-search');
                        const rawLinks = Array.from(document.querySelectorAll('#menu-links a, #menu-links .menu-link-item, #menu-links .vault-btn'));
                        const links = rawLinks.filter(el => {
                            if (el.style.display === 'none') return false;
                            if (el.parentElement && el.parentElement.style.display === 'none') return false;
                            return el.offsetParent !== null;
                        });
                        const focusables = [searchInput, ...links].filter(el => el);

                        if (focusables.length === 0) return;

                        let currentIndex = focusables.findIndex(el => el === document.activeElement);
                        if (e.key === 'ArrowDown') {
                            currentIndex = (currentIndex >= focusables.length - 1) ? 0 : currentIndex + 1;
                        } else {
                            currentIndex = (currentIndex <= 0) ? focusables.length - 1 : currentIndex - 1;
                        }

                        const target = focusables[currentIndex];
                        if (target) {
                            target.focus({ preventScroll: true });
                            target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                            // Add temporary outline classes to a tags if they don't have focus variants
                            if (target.tagName === 'A') {
                                target.classList.add('focus:outline-none', 'focus:bg-brand-50', 'dark:focus:bg-brand-900/30', 'focus:ring-2', 'focus:ring-brand-500/50');
                            }
                        }
                    } else if (e.key === 'Enter') {
                        const active = document.activeElement;
                        // If we are on search input and press enter, click first search result or first link
                        if (active && active.id === 'menu-search') {
                            e.preventDefault();

                            // 🌟 EASTER EGGS en Enter
                            const val = active.value.toLowerCase().trim();
                            if (val === 'te amo' || val === 'teamo' || val === 'ahí es' || val === 'ahi es' || val === 'manzanita') {
                                active.value = ''; // Magic clear
                                if (typeof spawnSpotlightConfetti === 'function') {
                                    spawnSpotlightConfetti();
                                    setTimeout(spawnSpotlightConfetti, 400); // Doble explosion
                                    AudioManager.play('secret.wav', 1.0);
                                }
                                filterMenuLinks(''); // Reset filter
                                return;
                            }
                            if (val === '28' || val === 'yaire') {
                                active.value = '';
                                AudioManager.play('secret.wav', 0.8);

                                // Lluvia dorada general también
                                if (typeof spawnSpotlightConfetti === 'function') {
                                    spawnSpotlightConfetti();
                                }

                                // Efecto mucho más visible: Brillo masivo en todo el panel y candados
                                const menuPanel = document.getElementById('menu-panel');
                                if (menuPanel) {
                                    menuPanel.style.transition = 'box-shadow 1s ease-in-out, border-color 1s ease-in-out';

                                    // Hack visual force layout reflow to guarantee the transition starts
                                    void menuPanel.offsetWidth;

                                    menuPanel.style.boxShadow = '0 0 80px rgba(245, 158, 11, 0.5)';
                                    menuPanel.style.borderColor = '#f59e0b';
                                }

                                document.querySelectorAll('[id*="lock-days"], #menu-vault-lock-badge, #menu-song-lock-badge, #menu-games-lock-badge').forEach(el => {
                                    el.style.transition = 'color 1s ease-in-out';
                                    el.classList.add('animate-pulse');
                                    el.style.color = '#f59e0b';
                                });

                                setTimeout(() => {
                                    if (menuPanel) {
                                        menuPanel.style.boxShadow = '';
                                        menuPanel.style.borderColor = '';
                                        setTimeout(() => { if (menuPanel.style.boxShadow === '') menuPanel.style.transition = ''; }, 1000);
                                    }
                                    document.querySelectorAll('[id*="lock-days"], #menu-vault-lock-badge, #menu-song-lock-badge, #menu-games-lock-badge').forEach(el => {
                                        el.classList.remove('animate-pulse');
                                        el.style.color = '';
                                        setTimeout(() => { el.style.transition = ''; }, 1000);
                                    });
                                }, 3000);

                                filterMenuLinks('');
                                return;
                            }

                            // Comportamiento normal (ir al primer resultado de búsqueda)
                            const rawLinks = Array.from(document.querySelectorAll('#menu-links a, #menu-links .menu-link-item, #menu-links .vault-btn'));
                            const firstLink = rawLinks.find(el => {
                                if (el.style.display === 'none') return false;
                                if (el.parentElement && el.parentElement.style.display === 'none') return false;
                                return el.offsetParent !== null;
                            });
                            if (firstLink) firstLink.click();
                        } else if (active && (active.classList.contains('menu-link-item') || active.classList.contains('vault-btn'))) {
                            e.preventDefault();
                            // Give minor delay to show selection
                            active.classList.add('scale-95');
                            setTimeout(() => active.click(), 100);
                        }
                    }
                }
            });
            // Click menu link closes menu
            document.querySelectorAll('#menu-links .menu-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        const targetId = href.slice(1);
                        const target = document.getElementById(targetId);
                        // Force-hide overlay immediately so it doesn't block scroll events
                        const overlay = document.getElementById('drawer-overlay');
                        if (overlay) { overlay.classList.add('opacity-0', 'hidden'); }
                        // Close menu + scroll simultaneously
                        toggleMenu();
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        setTimeout(() => toggleMenu(), 150);
                    }
                });
            });

            // ✨ Spotlight Animated Placeholder
            const spotlightTips = {
                es: [
                    "Buscar curiosidades de la página...",
                    "Explora el 'Jardín de Tulipanes'...",
                    "Sugerencias: 'te amo' o 'manzanita'...",
                    "Busca 'El Pacto' para ver nuestra promesa...",
                    "Encuentra el easter egg escondido...",
                    "¿Sabías que hay magia el 28 de Abril?",
                    "Prueba a escribir 'yaire' y dale Enter...",
                    "Explora 'Sanación'..."
                ],
                en: [
                    "Search page curiosities...",
                    "Explore the 'Tulip Garden'...",
                    "Suggestions: 'te amo' or 'manzanita'...",
                    "Search for 'The Pact'...",
                    "Find the hidden easter egg...",
                    "Did you know there's magic on April 28?",
                    "Try typing 'yaire' and press Enter...",
                    "Explore Healing..."
                ],
                fr: [
                    "Chercher des curiosités de la page...",
                    "Explorez le 'Jardin des tulipes'...",
                    "Suggestions : 'te amo' ou 'manzanita'...",
                    "Cherchez 'Le Pacte'...",
                    "Trouvez l'easter egg caché...",
                    "Tapez 'yaire' et appuyez sur Entrée...",
                    "Explorez Guérison..."
                ],
                pt: [
                    "Procurar curiosidades da página...",
                    "Explore o 'Jardim de Tulipas'...",
                    "Sugestões: 'te amo' ou 'manzanita'...",
                    "Procure por 'O Pacto'...",
                    "Encontre o easter egg...",
                    "Sabia que há magia no dia 28 de Abril?",
                    "Tente digitar 'yaire' e aperte Enter...",
                    "Explore o 'Centro de Cura'..."
                ]
            };

            let spIdx = 0;
            let charIdx = 0;
            let isSpDeleting = false;

            // Inyectar tips del admin si existen
            (function () {
                try {
                    const cfg = JSON.parse(localStorage.getItem('yaire_config') || '{}');
                    if (cfg.spotlightTips && cfg.spotlightTips.es) {
                        spotlightTips.es = cfg.spotlightTips.es;
                        if (cfg.spotlightTips.en) spotlightTips.en = cfg.spotlightTips.en;
                        if (cfg.spotlightTips.pt) spotlightTips.pt = cfg.spotlightTips.pt;
                        if (cfg.spotlightTips.fr) spotlightTips.fr = cfg.spotlightTips.fr;
                    }
                } catch (e) { }
            })();

            let _spotlightTimer = null;

            function animateSpotlightPlaceholder() {
                const input = document.getElementById('menu-search');
                if (!input) { _spotlightTimer = setTimeout(animateSpotlightPlaceholder, 1000); return; }

                // Pausa si el menú está cerrado o la pestaña oculta — ahorra CPU/DOM
                const menuPanel = document.getElementById('menu-panel');
                if (document.hidden || !menuPanel || !menuPanel.classList.contains('open')) {
                    _spotlightTimer = setTimeout(animateSpotlightPlaceholder, 500);
                    return;
                }

                const arr = spotlightTips[typeof currentLang !== 'undefined' ? currentLang : 'es'] || spotlightTips.es;
                if (spIdx >= arr.length) spIdx = 0;
                const spWord = arr[spIdx];

                if (isSpDeleting) {
                    input.setAttribute('placeholder', spWord.substring(0, charIdx - 1) + '|');
                    charIdx--;
                } else {
                    input.setAttribute('placeholder', spWord.substring(0, charIdx + 1) + '|');
                    charIdx++;
                }

                // Bug fix: if charIdx goes out of bounds when changing languages mid-animation
                if (charIdx > spWord.length) charIdx = spWord.length;

                let speed = isSpDeleting ? 25 : 60;

                if (!isSpDeleting && charIdx === spWord.length) {
                    // Remove cursor bar before pausing
                    input.setAttribute('placeholder', spWord);
                    speed = 3000;
                    isSpDeleting = true;
                } else if (isSpDeleting && charIdx === 0) {
                    isSpDeleting = false;
                    spIdx = (spIdx + 1) % arr.length;
                    speed = 600;
                }

                _spotlightTimer = setTimeout(animateSpotlightPlaceholder, speed);
            }

            _spotlightTimer = setTimeout(animateSpotlightPlaceholder, 2000);

        });

        // 🎯 Hero badge countdown to 3 months (April 28, 2026)
        function initHeroCountdown() {
            const target = new Date('2020-04-28T00:00:00-04:00').getTime();
            const el = document.getElementById('hero-countdown');
            if (!el) return;

            function update() {
                const t = dictionary[currentLang] || dictionary.es;
                const now = Date.now();
                const diff = target - now;

                if (diff <= 0) {
                    // Already past — only apply defaults if admin hasn't overridden
                    if (!window.__adminBadgeApplied) {
                        const badgeEl = document.querySelector('[data-i18n="hero_badge"]');
                        if (badgeEl) {
                            badgeEl.innerHTML = t.hero_badge || '¡Felices 3 Meses!';
                        }
                        el.textContent = '🎉';
                    }
                    return;
                }

                const days = Math.floor(diff / 86400000);
                const hours = Math.floor((diff % 86400000) / 3600000);
                const mins = Math.floor((diff % 3600000) / 60000);
                const secs = Math.floor((diff % 60000) / 1000);

                const prefix = t.hero_countdown_prefix || '3 meses en';
                el.textContent = `${prefix} ${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
                requestAnimationFrame(() => setTimeout(update, 1000));
            }
            update();
        }
        document.addEventListener('DOMContentLoaded', initHeroCountdown);

        function initScrollSpy() {
            // Reveal animation observer (solo para clases reveal, no para menú)
            const revealObs = new IntersectionObserver((entries) => {
                entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
            }, { threshold: 0.1 });
            document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade').forEach(el => revealObs.observe(el));

            // Pause animations on off-screen sections to reduce GPU/CPU load
            const animPauseObs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('paused-anim');
                    } else {
                        entry.target.classList.add('paused-anim');
                    }
                });
            }, { rootMargin: '200px 0px' });
            document.querySelectorAll('.cv-section').forEach(el => animPauseObs.observe(el));

            // Scroll spy del menú — usa la sección más centrada en pantalla
            const sectionIds = ['hero', 'historia', 'nombre', 'tulipanes', 'guia-colores-tulipan', 'quiz-girasol', 'distancia', 'comida', 'universo', 'galeria', 'minijuegos', 'promesas', 'guestbook', 'colores-yaire', 'memorial', 'hype', 'estadisticas', 'top5yaire', 'enigma-28', 'tu-cancion', 'secreto'];

            // Cache: elementos del DOM resueltos una sola vez — evitar getElementById en cada tick de scroll
            const _sectionEls = {};
            sectionIds.forEach(id => { _sectionEls[id] = document.getElementById(id); });

            // Cache: lista de menu-links — evitar querySelectorAll en cada tick de setActiveLink
            const _menuLinks = Array.from(document.querySelectorAll('.menu-link'));

            function setActiveLink(id) {
                _menuLinks.forEach(l => {
                    const href = l.getAttribute('href');
                    const isTarget = href === '#' + id;
                    if (href === '#secreto') return;
                    if (isTarget) {
                        l.classList.add('active', 'text-white', 'bg-amber-600', 'dark:text-amber-500', 'dark:bg-amber-500/10');
                        l.classList.remove('text-zinc-600', 'dark:text-zinc-400', 'hover:bg-brand-50', 'dark:hover:bg-brand-900/10', 'hover:text-brand-600', 'dark:hover:text-brand-400');
                        // Make icon container dark/opaque to contrast with active background
                        const iconSpan = l.querySelector('span:first-child');
                        if (iconSpan) {
                            iconSpan.classList.remove('bg-zinc-100', 'dark:bg-zinc-800');
                            iconSpan.classList.add('bg-amber-700/50', 'dark:bg-amber-500/20', 'border-transparent');
                        }
                    } else {
                        l.classList.remove('active', 'text-white', 'bg-amber-600', 'dark:text-amber-500', 'dark:bg-amber-500/10');
                        l.classList.add('text-zinc-600', 'dark:text-zinc-400', 'hover:bg-brand-50', 'dark:hover:bg-brand-900/10', 'hover:text-brand-600', 'dark:hover:text-brand-400');
                        // Restore icon container
                        const iconSpan = l.querySelector('span:first-child');
                        if (iconSpan) {
                            iconSpan.classList.add('bg-zinc-100', 'dark:bg-zinc-800');
                            iconSpan.classList.remove('bg-amber-700/50', 'dark:bg-amber-500/20', 'border-transparent');
                        }
                    }
                });
            }

            // Highlight on click from hamburger menu
            let ignoreScroll = false;
            let scrollTimeout = null;

            _menuLinks.forEach(l => {
                l.addEventListener('click', function () {
                    const href = this.getAttribute('href');
                    if (href && href.startsWith('#') && href !== '#secreto') {
                        // Immediately highlight the clicked section
                        setActiveLink(href.slice(1));

                        // Temporarily disable scroll listener interference
                        ignoreScroll = true;
                        if (scrollTimeout) clearTimeout(scrollTimeout);

                        // Re-enable scroll spy after scrolling finishes (approx 800ms)
                        scrollTimeout = setTimeout(() => {
                            ignoreScroll = false;
                            onScroll(); // Re-eval current pos just in case
                        }, 800);
                    }
                });
            });

            let ticking = false;
            function onScroll() {
                if (ticking || ignoreScroll) return;
                ticking = true;
                requestAnimationFrame(function () {
                    const vh = window.innerHeight;
                    let best = null, bestScore = -Infinity;
                    sectionIds.forEach(function (id) {
                        const el = _sectionEls[id]; // usar cache — sin getElementById en cada scroll
                        if (!el) return;
                        const r = el.getBoundingClientRect();
                        // Visibilidad: cuánto del section está dentro de la ventana
                        const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
                        if (visible > bestScore) { bestScore = visible; best = id; }
                    });
                    if (best) setActiveLink(best);
                    ticking = false;
                });
            }
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }

        // ══════════ MODALES Y NAVEGACIÓN ══════════
        function openRedirectModal(url, type) {
            AudioManager.play('entry.wav', 0.6);
            const m = document.getElementById('redirect-modal');
            const c = document.getElementById('redirect-content');
            const t = document.getElementById('modal-text');
            const btn = document.getElementById('modal-confirm-btn');
            const yesTxt = document.getElementById('modal-yes-text');
            const icon = document.getElementById('modal-icon');

            if (!m || !c) return;

            const dict = dictionary[currentLang];
            if (type === 'song') {
                t.innerText = dict.modal_text_song;
                yesTxt.innerText = dict.modal_yes_song;
                icon.innerText = '🎧';
                btn.className = "flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-brand-500 to-tulip-500 text-white hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-2";
            } else {
                t.innerText = dict.modal_text_movie;
                yesTxt.innerText = dict.modal_yes_movie;
                icon.innerText = '🍿';
                btn.className = "flex-1 px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-opacity text-center flex items-center justify-center gap-2";
            }

            btn.href = url;
            m.classList.remove('hidden');
            setTimeout(() => { m.classList.remove('opacity-0'); c.classList.remove('scale-95'); }, 10);
        }

        function openModal(mId, cId) {
            const m = document.getElementById(mId);
            const c = document.getElementById(cId);
            if (!m) return;
            m.classList.remove('hidden');
            setTimeout(() => { m.classList.remove('opacity-0'); if (c) c.classList.remove('scale-95'); }, 10);
        }

        function closeModal(mId, cId) {
            if (mId === 'redirect-modal' || mId === 'recipe-modal' || mId === 'credits-modal' || mId === 'wrapped-redirect-modal') AudioManager.play('flyout.wav', 0.6);
            const m = document.getElementById(mId);
            const c = document.getElementById(cId);
            if (!m) return;

            // Garbage Collection for Timers
            if (mId === 'recipe-modal' && typeof stopAllRecipeTimers === 'function') stopAllRecipeTimers();
            if (typeof timer1Interval !== 'undefined' && timer1Interval) { clearInterval(timer1Interval); timer1Interval = null; }
            if (typeof game3Timer !== 'undefined' && game3Timer) { clearInterval(game3Timer); game3Timer = null; }

            m.classList.add('opacity-0');
            if (c) c.classList.add('scale-95');
            setTimeout(() => { m.classList.add('hidden'); }, 300);
        }

        // ══════════ RECIPE MODAL — REDESIGNED ══════════
        let recipeServings = 2;
        let stepTimers = {};
        let recipeUiCache = null;

        function getRecipeUiCache() {
            if (recipeUiCache) return recipeUiCache;
            recipeUiCache = {
                stepChecks: Array.from(document.querySelectorAll('.step-chk')),
                stepCards: Array.from(document.querySelectorAll('.step-card-new')),
                recipePanes: Array.from(document.querySelectorAll('.recipe-pane-new')),
                recipeTabs: Array.from(document.querySelectorAll('.recipe-tab-new'))
            };
            return recipeUiCache;
        }

        function stopAllRecipeTimers() {
            Object.keys(stepTimers).forEach((key) => {
                clearInterval(stepTimers[key]);
            });
            stepTimers = {};
            document.querySelectorAll('.timer-active').forEach(el => el.classList.remove('timer-active'));
        }

        function openRecipeModal() {
            AudioManager.play('entry.wav', 0.6);
            const m = document.getElementById('recipe-modal');
            const c = document.getElementById('recipe-content');
            if (!m) return;
            m.classList.remove('hidden');
            stopAllRecipeTimers();
            // Reset to first tab
            const firstTab = document.getElementById('rtab-ing');
            if (firstTab) switchRecipeTabNew('ing', firstTab, false);
            // Reset progress
            const cache = getRecipeUiCache();
            cache.stepChecks.forEach(el => {
                el.style.background = 'transparent';
                const icon = el.querySelector('svg');
                if (icon) icon.style.opacity = '0';
            });
            cache.stepCards.forEach(card => card.classList.remove('done'));
            updateRecipeProgress();
            setTimeout(() => {
                m.classList.remove('opacity-0');
                if (c) c.classList.remove('scale-95');
            }, 10);
        }

        function switchRecipeTabNew(tabId, btn, playSound = true) {
            if (playSound) AudioManager.play('abrirtusecreto.mp3', 0.6);
            const cache = getRecipeUiCache();
            cache.recipePanes.forEach(p => {
                p.classList.add('hidden');
                // Remove animation classes so they can run again
                p.classList.remove('rcp-tab-enter', 'opacity-100', 'opacity-0', 'translate-y-0', 'translate-y-4', 'transition-all', 'duration-500', 'ease-out', 'transform');
            });
            cache.recipeTabs.forEach(t => t.classList.remove('active'));
            const pane = document.getElementById('rpane-' + tabId);
            if (pane) {
                // Remove hidden first
                pane.classList.remove('hidden');

                // Force a DOM reflow so the browser catches the class removal
                void pane.offsetWidth;

                // Add the keyframe animation class
                pane.classList.add('rcp-tab-enter');
            }
            if (btn) btn.classList.add('active');
        }

        // Keep old function for compatibility
        function switchRecipeTab(tId, b) { switchRecipeTabNew(tId, b); }

        function toggleIngCard(card) {
            card.classList.toggle('checked-ing');
            const chk = card.querySelector('.ing-check');
            if (card.classList.contains('checked-ing')) {
                AudioManager.play('seleccionsi.wav', 0.6);
                chk.style.background = '#10b981';
                chk.style.borderColor = '#10b981';
                chk.style.color = 'white';
            } else {
                AudioManager.play('seleccionno.wav', 0.6);
                chk.style.background = '';
                chk.style.borderColor = '';
                chk.style.color = '';
            }
            const total = document.querySelectorAll('.ing-card').length;
            const checked = document.querySelectorAll('.ing-card.checked-ing').length;
            const bar = document.getElementById('ing-progress-bar');
            const lbl = document.getElementById('ing-count-label');
            if (bar) bar.style.width = (checked / total * 100) + '%';
            if (lbl) lbl.textContent = checked + '/' + total;
        }

        function changeServings(delta) {
            if (delta > 0) AudioManager.play('slideralto.wav', 0.6);
            else AudioManager.play('sliderbajo.wav', 0.6);
            recipeServings = Math.max(1, Math.min(10, recipeServings + delta));
            document.getElementById('servings-count').textContent = recipeServings;
            document.querySelectorAll('.ing-qty').forEach(el => {
                const base = parseFloat(el.dataset.base);
                if (!base || base === 0) return;
                const val = base / 2 * recipeServings;
                const unit = el.textContent.replace(/[\d\.]+\s*/, '');
                el.textContent = (Number.isInteger(val) ? val : val.toFixed(0)) + ' ' + unit.trim();
            });
        }

        function toggleTip(id) {
            const box = document.getElementById(id);
            if (!box) return;
            box.classList.toggle('open');
        }

        function markStepDone(cardId, labelEl) {
            const card = document.getElementById(cardId);
            const chk = labelEl.querySelector('.step-chk');
            const svg = chk ? chk.querySelector('svg') : null;
            const isDone = !card.classList.contains('done');
            if (isDone) {
                AudioManager.play('seleccionsi.wav', 0.6);
                card.classList.add('done');
                if (chk) { chk.style.background = '#10b981'; chk.style.borderColor = '#10b981'; }
                if (svg) svg.style.opacity = '1';
            } else {
                AudioManager.play('seleccionno.wav', 0.6);
                card.classList.remove('done');
                if (chk) { chk.style.background = 'transparent'; chk.style.borderColor = ''; }
                if (svg) svg.style.opacity = '0';
            }
            updateRecipeProgress();
        }

        function startStepTimer(minutes, displayId, btnId) {
            const display = document.getElementById(displayId);
            const btn = document.getElementById(btnId);
            if (!display) return;
            display.parentElement.classList.remove('hidden');
            // Clear existing
            if (stepTimers[displayId]) { clearInterval(stepTimers[displayId]); }
            let secs = minutes * 60;
            const _td = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {};
            btn.textContent = _td.timer_stop || '⏹️ Detener';
            btn.onclick = () => {
                clearInterval(stepTimers[displayId]);
                display.parentElement.classList.add('hidden');
                btn.textContent = '⏱️ ' + minutes + ' ' + (_td.timer_min || 'min');
                btn.onclick = () => startStepTimer(minutes, displayId, btnId);
            };
            display.classList.add('timer-active');
            function tick() {
                if (secs <= 0) {
                    clearInterval(stepTimers[displayId]);
                    display.textContent = _td.timer_done || '✅ ¡Listo!';
                    display.classList.remove('timer-active');
                    btn.textContent = '⏱️ ' + minutes + ' ' + (_td.timer_min || 'min');
                    btn.onclick = () => startStepTimer(minutes, displayId, btnId);
                    return;
                }
                const m = Math.floor(secs / 60);
                const s = secs % 60;
                display.textContent = m + ':' + (s < 10 ? '0' : '') + s;
                secs--;
            }
            tick();
            stepTimers[displayId] = setInterval(tick, 1000);
        }

        function updateRecipeProgress() {
            const done = document.querySelectorAll('.step-card-new.done').length;
            const total = document.querySelectorAll('.step-card-new').length || 4;
            const percentage = Math.round((done / total) * 100);
            const bar = document.getElementById('prep-bar');
            const percentText = document.getElementById('prep-percentage');
            const emoji = document.getElementById('prep-emoji');
            if (bar) bar.style.width = percentage + '%';
            if (percentText) percentText.textContent = percentage + '%';
            if (emoji) {
                if (percentage === 0) emoji.textContent = '👨‍🍳';
                else if (percentage <= 25) emoji.textContent = '🔪';
                else if (percentage <= 50) emoji.textContent = '🥘';
                else if (percentage <= 75) emoji.textContent = '✨';
                else {
                    emoji.textContent = '🤤';
                    if (percentage === 100) spawnRecipeConfetti();
                }
            }
        }

        function spawnSpotlightConfetti() {
            const panel = document.getElementById('menu-panel');
            if (!panel) return;
            // Inject dynamically the animation to avoid touching CSS chunks
            if (!document.getElementById('spotlight-confetti-css')) {
                const s = document.createElement('style');
                s.id = 'spotlight-confetti-css';
                s.textContent = '@keyframes slFall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(800px) rotate(360deg); opacity: 0; } }';
                document.head.appendChild(s);
            }
            const emojis = ['💖', '✨', '🌷', '💍', '💌', '💕', '⭐'];
            // Cap to 18 particles max (was 30)
            const count = window.__PERF_LITE__ ? 8 : 18;
            for (let i = 0; i < count; i++) {
                const p = document.createElement('span');
                p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                const duration = 1.5 + Math.random() * 1.5;
                const delay = Math.random() * 0.5;
                p.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:-5%;font-size:${14 + Math.random() * 16}px;pointer-events:none;z-index:99;animation:slFall ${duration}s ${delay}s ease-in forwards;`;
                panel.appendChild(p);
                setTimeout(() => { if (p.parentNode) p.remove(); }, (duration + delay) * 1000 + 100);
            }
        }

        function spawnRecipeConfetti() {
            const anchor = document.getElementById('confetti-anchor');
            if (!anchor) return;
            const pieces = ['🎉', '✨', '🍗', '💖', '⭐', '🎊'];
            for (let i = 0; i < 12; i++) {
                const p = document.createElement('span');
                p.className = 'confetti-piece';
                p.textContent = pieces[Math.floor(Math.random() * pieces.length)];
                p.style.cssText = `left:${(Math.random() - 0.5) * 200}px;top:${-Math.random() * 20}px;animation-delay:${Math.random() * 0.5}s;animation-duration:${0.8 + Math.random() * 0.8}s;`;
                anchor.appendChild(p);
                setTimeout(() => p.remove(), 1500);
            }
        }


        // ══════════ BÓVEDA SECRETA ══════════
        function spawnVaultParticles() { /* disabled */ }

        function spawnLetterHearts() {
            // Update sig-days-count
            const el = document.getElementById('sig-days-count');
            if (el) {
                const start = new Date('2026-01-28T00:00:00');
                const diff = Math.floor((Date.now() - start) / 86400000);
                el.textContent = diff > 0 ? diff : '—';
            }
        }

        function animateLockOpen() {
            const wrap = document.getElementById('vault-lock-icon');
            if (wrap) { wrap.style.borderColor = 'rgba(74,222,128,0.9)'; wrap.style.boxShadow = '0 0 40px rgba(74,222,128,0.4)'; }
            const shackle = document.getElementById('lock-shackle');
            if (shackle) {
                setTimeout(() => {
                    shackle.setAttribute('d', 'M16 22V10a8 8 0 0116 0');
                    shackle.style.stroke = '#4ade80';
                    const lockSvg = document.getElementById('lock-svg');
                    if (lockSvg) lockSvg.style.filter = 'drop-shadow(0 0 12px #4ade80)';
                }, 300);
            }
        }

        function openSecretModal() {
            AudioManager.play('abrirtusecreto.mp3', 0.8);
            const m = document.getElementById('secret-modal');
            const l = document.getElementById('secret-login');
            const letter = document.getElementById('secret-letter');
            if (!m || !l) return;

            const pwdEl = document.getElementById('secret-pwd');
            if (pwdEl) { pwdEl.value = ''; pwdEl.disabled = false; }
            const cc = document.getElementById('pwd-char-count'); if (cc) cc.textContent = '0';
            document.getElementById('secret-error').classList.add('hidden');
            document.getElementById('secret-hint-wrap').classList.add('hidden');
            const timerWrap = document.getElementById('secret-lockout-timer');
            if (timerWrap) timerWrap.classList.add('hidden');

            const lockRing = document.querySelector('#vault-lock-wrap svg');
            if (lockRing) {
                lockRing.style.opacity = '0.3';
                lockRing.querySelector('circle').style.stroke = 'url(#ringGrad)';
            }

            secretAttempts = 0;
            if (window.lockoutInterval) {
                clearInterval(window.lockoutInterval);
            }

            const shackle = document.getElementById('lock-shackle');
            if (shackle) { shackle.setAttribute('d', 'M16 22V16a8 8 0 0116 0v6'); shackle.style.stroke = ''; }
            const lockSvg = document.getElementById('lock-svg'); if (lockSvg) lockSvg.style.filter = '';
            const lockWrap = document.getElementById('vault-lock-icon'); if (lockWrap) { lockWrap.style.borderColor = ''; lockWrap.style.boxShadow = ''; }

            const btn = document.getElementById('unlock-btn');
            if (btn) { btn.disabled = false; btn.style.background = 'linear-gradient(135deg,#f59e0b,#ec4899)'; btn.style.opacity = '1'; const s = btn.querySelector('span.relative'); if (s) s.innerHTML = '<span>🔓</span><span>Desbloquear</span>'; }

            l.style.opacity = '0';
            l.style.transform = 'scale(0.9)';
            l.style.display = 'flex';
            l.style.flexDirection = 'column';
            l.style.alignItems = 'center';
            if (letter) {
                letter.classList.add('hidden');
                letter.style.opacity = '';
                letter.style.transform = '';
            }

            const dedModal = document.getElementById('secret-dedication-modal');
            const dedContent = document.getElementById('dedication-content');
            if (dedModal) dedModal.classList.add('hidden');
            if (dedContent) {
                dedContent.style.opacity = '0';
                dedContent.style.transform = 'scale(0.95)';
            }

            m.style.opacity = '0';
            m.classList.remove('hidden');
            spawnVaultParticles();

            // GSAP Cinematic Entrance
            if (typeof gsap !== 'undefined') {
                gsap.to(m, { opacity: 1, duration: 0.5, ease: "power2.out" });

                l.style.display = 'flex';
                l.style.flexDirection = 'column';
                l.style.alignItems = 'center';

                gsap.fromTo(l,
                    { opacity: 0, scale: 0.85, y: 50, rotationX: 10, filter: "blur(10px)" },
                    {
                        opacity: 1, scale: 1, y: 0, rotationX: 0, filter: "blur(0px)", duration: 0.8, ease: "back.out(1.5)", delay: 0.1, onComplete: () => {
                            if (pwdEl) pwdEl.focus();
                        }
                    }
                );
            } else {
                l.style.opacity = '0';
                l.style.transform = 'scale(0.9)';
                l.style.display = 'flex';
                l.style.flexDirection = 'column';
                l.style.alignItems = 'center';
                m.style.opacity = '0';

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        m.style.transition = 'opacity 0.4s ease';
                        m.style.opacity = '1';
                        l.style.transition = 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s';
                        l.style.opacity = '1';
                        l.style.transform = 'scale(1)';
                        setTimeout(() => { if (pwdEl) pwdEl.focus(); }, 300);
                    });
                });
            }
        }

        function togglePwdVisibility() {
            AudioManager.play('typing.wav', 0.6);
            const input = document.getElementById('secret-pwd');
            const eyeOn = document.getElementById('eye-icon');
            const eyeOff = document.getElementById('eye-off-icon');
            if (!input) return;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            eyeOn.classList.toggle('hidden', isHidden);
            eyeOff.classList.toggle('hidden', !isHidden);
            input.focus();
        }

        function closeSecretModal() {
            AudioManager.play('flyout.wav', 0.6);
            const m = document.getElementById('secret-modal');
            if (!m) return;
            // Kill lockout timer if active
            if (window.lockoutInterval) { clearInterval(window.lockoutInterval); window.lockoutInterval = null; }
            // Clean up heart particles
            const lh = document.getElementById('letter-hearts');
            if (lh) lh.innerHTML = '';
            const vp = document.getElementById('vault-particles');
            if (vp) vp.innerHTML = '';
            m.style.transition = 'opacity 0.4s ease';
            m.style.opacity = '0';
            setTimeout(() => { m.classList.add('hidden'); m.style.opacity = ''; m.style.transition = ''; }, 450);
        }

        let VAULT_HASH = '10c2f3ab8d6d9af72e5a63c161b2f079098e5511272e184262b579148202fcda';

        async function hashSHA256(text) {
            const data = new TextEncoder().encode(text);
            const buffer = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        async function checkPassword() {
            const i = document.getElementById('secret-pwd');
            const e = document.getElementById('secret-error');
            const hWrap = document.getElementById('secret-hint-wrap');
            if (!i || !e || !hWrap) return;

            const inputHash = await hashSHA256(i.value.toLowerCase().trim());

            if (inputHash === VAULT_HASH) {
                AudioManager.play('entrarcarta.mp3', 0.8);
                animateLockOpen();
                const btn = document.getElementById('unlock-btn');
                if (btn) {
                    btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
                    const s = btn.querySelector('span.relative');
                    if (s) s.innerHTML = '<span>✅</span><span>¡Correcto!</span>';
                }

                setTimeout(() => {
                    const l = document.getElementById('secret-login');
                    if (typeof gsap !== 'undefined' && l) {
                        // GSAP Exploding Exit
                        gsap.to(l, {
                            scale: 1.3, opacity: 0, filter: "blur(20px)", y: -60, duration: 0.6, ease: "power2.in",
                            onComplete: () => {
                                gsap.set(l, { clearProps: "all" });
                                l.style.display = 'none';
                                showLetter();
                            }
                        });
                    } else if (l) {
                        l.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        l.style.opacity = '0';
                        l.style.transform = 'scale(0.85)';
                        setTimeout(() => {
                            l.style.display = 'none';
                            showLetter();
                        }, 420);
                    }
                }, 900);

            } else {
                AudioManager.play('incorrect.wav', 0.6);
                secretAttempts++;

                const wrap = document.getElementById('vault-lock-icon');
                if (typeof gsap !== 'undefined' && wrap) {
                    // GSAP Red Flash & Shake
                    gsap.to(wrap, { borderColor: "rgba(239,68,68,0.8)", duration: 0.1, yoyo: true, repeat: 5 });
                    gsap.fromTo(wrap, { x: -8 }, {
                        x: 8, duration: 0.05, yoyo: true, repeat: 7, ease: "linear", onComplete: () => {
                            gsap.set(wrap, { x: 0 });
                        }
                    });
                } else if (wrap) {
                    wrap.style.animation = 'none';
                    requestAnimationFrame(() => { wrap.style.animation = 'vaultUnlock 0.5s ease'; });
                    wrap.style.borderColor = 'rgba(239,68,68,0.8)';
                    setTimeout(() => { wrap.style.borderColor = ''; wrap.style.animation = ''; }, 600);
                }

                e.classList.remove('hidden');
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(e, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
                } else {
                    e.classList.remove('animate-shake'); void e.offsetWidth; e.classList.add('animate-shake');
                }

                if (secretAttempts >= 6) {
                    hWrap.classList.remove('hidden');
                }

                if (secretAttempts % 3 === 0) {
                    lockVault();
                }
            }
        }

        function lockVault() {
            const pwd = document.getElementById('secret-pwd');
            const btn = document.getElementById('unlock-btn');
            const err = document.getElementById('secret-error');
            const timerWrap = document.getElementById('secret-lockout-timer');
            const timerSec = document.getElementById('lockout-seconds');
            const lockRing = document.querySelector('#vault-lock-wrap svg');

            if (pwd) pwd.disabled = true;
            if (btn) btn.disabled = true;
            if (err) err.classList.add('hidden');
            if (timerWrap) timerWrap.classList.remove('hidden');

            if (lockRing) {
                lockRing.style.opacity = '0.8';
                lockRing.querySelector('circle').style.stroke = 'url(#ringGradLock)';
            }

            let timeLeft = 30;
            if (timerSec) timerSec.textContent = timeLeft;

            if (window.lockoutInterval) clearInterval(window.lockoutInterval);
            window.lockoutInterval = setInterval(() => {
                timeLeft--;
                if (timerSec) timerSec.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(window.lockoutInterval);
                    unlockVaultState();
                }
            }, 1000);
        }

        function unlockVaultState() {
            const pwd = document.getElementById('secret-pwd');
            const btn = document.getElementById('unlock-btn');
            const timerWrap = document.getElementById('secret-lockout-timer');
            const lockRing = document.querySelector('#vault-lock-wrap svg');

            if (pwd) { pwd.disabled = false; pwd.value = ''; pwd.focus(); }
            if (btn) btn.disabled = false;
            if (timerWrap) timerWrap.classList.add('hidden');

            if (lockRing) {
                lockRing.style.opacity = '0.3';
                lockRing.querySelector('circle').style.stroke = 'url(#ringGrad)';
            }
        }

        function showLetter() {
            const letter = document.getElementById('secret-letter');
            if (!letter) return;
            const dict = dictionary[currentLang] || dictionary['es'];
            const isV2Ready = true;
            if (isV2Ready && dict.secret_letter_v2_p1) {
                letterParagraphs = [dict.secret_letter_v2_p1, dict.secret_letter_v2_p2, dict.secret_letter_v2_p3, dict.secret_letter_v2_p4, dict.secret_letter_v2_p5];
            } else {
                letterParagraphs = [dict.secret_letter_p1, dict.secret_letter_p2, dict.secret_letter_p3, dict.secret_letter_p4, dict.secret_letter_p5];
            }
            currentPara = 0;
            const lt = document.getElementById('letter-title'); if (lt) lt.textContent = dict.secret_letter_title;
            const nav = document.getElementById('letter-nav'); if (nav) nav.classList.remove('hidden');
            const sig = document.getElementById('letter-signature'); if (sig) sig.classList.add('hidden');
            renderLetterPara();
            letter.style.opacity = '0';
            letter.style.transform = 'scale(0.93) translateY(16px)';
            letter.classList.remove('hidden');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    letter.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
                    letter.style.opacity = '1';
                    letter.style.transform = 'scale(1) translateY(0)';
                    spawnLetterHearts();
                });
            });
        }

        /*
        function renderLetterPara() {
            const body = document.getElementById('letter-body');
            const dotsWrap = document.getElementById('para-dots');
            const nextBtn = document.getElementById('next-para');
            const prevBtn = document.getElementById('prev-para');
            if (!body || !dotsWrap) return;
            body.innerHTML = '';
            for (let idx = 0; idx <= currentPara; idx++) {
                const p = document.createElement('p');
                p.innerHTML = letterParagraphs[idx];
                p.style.animation = idx === currentPara ? 'paraFadeIn 0.6s ease-out both' : '';
                body.appendChild(p);
            }
            const emojis = ['💖', '💕', '💗', '💓', '💝', '🌷', '✨'];
            for (let i = 0; i < 14; i++) {
                const h = document.createElement('span');
                h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                h.style.cssText = `position:absolute;left:${10 + Math.random() * 80}%;bottom:${Math.random() * 30}%;font-size:${14 + Math.random() * 20}px;animation:floatHeart ${1.5 + Math.random() * 2}s ${Math.random() * 1.5}s ease-out forwards;pointer-events:none;`;
                c.appendChild(h);
                setTimeout(() => { if (h.parentNode) h.remove(); }, 4000);
            }
        }

        function animateLockOpen() {
            const wrap = document.getElementById('vault-lock-icon');
            if (wrap) { wrap.style.borderColor = 'rgba(74,222,128,0.9)'; wrap.style.boxShadow = '0 0 40px rgba(74,222,128,0.4)'; }
            const shackle = document.getElementById('lock-shackle');
            if (shackle) {
                setTimeout(() => {
                    shackle.setAttribute('d', 'M16 22V10a8 8 0 0116 0');
                    shackle.style.stroke = '#4ade80';
                    const lockSvg = document.getElementById('lock-svg');
                    if (lockSvg) lockSvg.style.filter = 'drop-shadow(0 0 12px #4ade80)';
                }, 300);
            }
        }

        function openSecretModal() {
            AudioManager.play('gameopen.wav', 0.8);
            const m = document.getElementById('secret-modal');
            const l = document.getElementById('secret-login');
            const letter = document.getElementById('secret-letter');
            if (!m || !l) return;

            const pwdEl = document.getElementById('secret-pwd');
            if (pwdEl) { pwdEl.value = ''; pwdEl.disabled = false; }
            const cc = document.getElementById('pwd-char-count'); if (cc) cc.textContent = '0';
            document.getElementById('secret-error').classList.add('hidden');
            document.getElementById('secret-hint-wrap').classList.add('hidden');
            secretAttempts = 0;

            [1, 2, 3].forEach(i => { const h = document.getElementById('heart-' + i); if (h) { h.textContent = '❤️'; h.style.opacity = '1'; h.style.filter = ''; } });

            const shackle = document.getElementById('lock-shackle');
            if (shackle) { shackle.setAttribute('d', 'M16 22V16a8 8 0 0116 0v6'); shackle.style.stroke = ''; }
            const lockSvg = document.getElementById('lock-svg'); if (lockSvg) lockSvg.style.filter = '';
            const lockWrap = document.getElementById('vault-lock-icon'); if (lockWrap) { lockWrap.style.borderColor = ''; lockWrap.style.boxShadow = ''; }

            const btn = document.getElementById('unlock-btn');
            if (btn) { btn.disabled = false; btn.style.background = 'linear-gradient(135deg,#f59e0b,#ec4899)'; btn.style.opacity = '1'; const s = btn.querySelector('span.relative'); if (s) s.innerHTML = '<span>🔓</span><span>Desbloquear</span>'; }

            l.style.opacity = '0';
            l.style.transform = 'scale(0.9)';
            l.style.display = 'flex';
            l.style.flexDirection = 'column';
            l.style.alignItems = 'center';
            if (letter) letter.classList.add('hidden');

            m.style.opacity = '0';
            m.classList.remove('hidden');
            spawnVaultParticles();

                    m.style.transition = 'opacity 0.4s ease';
                    m.style.opacity = '1';
                    l.style.transition = 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s';
                    l.style.opacity = '1';
                    l.style.transform = 'scale(1)';
                    setTimeout(() => { if (pwdEl) pwdEl.focus(); }, 300);
                });
            });
        }

        function togglePwdVisibility() {
            AudioManager.play('typing.wav', 0.6);
            const input = document.getElementById('secret-pwd');
            const eyeOn = document.getElementById('eye-icon');
            const eyeOff = document.getElementById('eye-off-icon');
            if (!input) return;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            eyeOn.classList.toggle('hidden', isHidden);
            eyeOff.classList.toggle('hidden', !isHidden);
            input.focus();
        }

        function closeSecretModal() {
            AudioManager.play('flyout.wav', 0.6);
            const m = document.getElementById('secret-modal');
            if (!m) return;
            m.style.transition = 'opacity 0.4s ease';
            m.style.opacity = '0';
            setTimeout(() => { m.classList.add('hidden'); m.style.opacity = ''; m.style.transition = ''; }, 450);
        }

        let VAULT_HASH_V2 = '10c2f3ab8d6d9af72e5a63c161b2f079098e5511272e184262b579148202fcda';

        async function hashSHA256(text) {
            const data = new TextEncoder().encode(text);
            const buffer = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        async function checkPassword() {
            const i = document.getElementById('secret-pwd');
            const e = document.getElementById('secret-error');
            const hWrap = document.getElementById('secret-hint-wrap');
            if (!i || !e || !hWrap) return;

            const inputHash = await hashSHA256(i.value.toLowerCase().trim());

            if (inputHash === VAULT_HASH_V2 || (typeof VAULT_HASH !== 'undefined' && inputHash === VAULT_HASH)) {
                AudioManager.play('correcto.wav', 0.6);
                animateLockOpen();
                const btn = document.getElementById('unlock-btn');
                if (btn) {
                    btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
                    const s = btn.querySelector('span.relative');
                    if (s) s.innerHTML = '<span>✅</span><span>¡Correcto!</span>';
                }
                
                setTimeout(() => {
                    const l = document.getElementById('secret-login');
                    if (typeof gsap !== 'undefined' && l) {
                        // GSAP Exploding Exit
                        gsap.to(l, { 
                            scale: 1.3, opacity: 0, filter: "blur(20px)", y: -60, duration: 0.6, ease: "power2.in",
                            onComplete: () => {
                                l.style.display = 'none';
                                gsap.set(l, { clearProps: "all" });
                                showLetter();
                            }
                        });
                    } else if (l) {
                        l.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        l.style.opacity = '0';
                        l.style.transform = 'scale(0.85)';
                        setTimeout(() => {
                            l.style.display = 'none';
                            showLetter();
                        }, 420);
                    }
                }, 900);

            } else {
                AudioManager.play('incorrect.wav', 0.6);
                secretAttempts++;
                const h = document.getElementById('heart-' + (4 - secretAttempts));
                if (h) { h.textContent = '🖤'; h.style.opacity = '0.4'; h.style.filter = 'grayscale(1)'; }
                
                const wrap = document.getElementById('vault-lock-icon');
                if (typeof gsap !== 'undefined' && wrap) {
                    // GSAP Red Flash & Shake
                    gsap.to(wrap, { borderColor: "rgba(239,68,68,0.8)", duration: 0.1, yoyo: true, repeat: 5 });
                    gsap.fromTo(wrap, { x: -8 }, { x: 8, duration: 0.05, yoyo: true, repeat: 7, ease: "linear", onComplete: () => {
                        gsap.set(wrap, { x: 0 });
                    }});
                } else if (wrap) {
                    wrap.style.animation = 'none';
                    requestAnimationFrame(() => { wrap.style.animation = 'vaultUnlock 0.5s ease'; });
                    wrap.style.borderColor = 'rgba(239,68,68,0.8)';
                    setTimeout(() => { wrap.style.borderColor = ''; wrap.style.animation = ''; }, 600);
                }
                
                e.classList.remove('hidden');
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(e, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
                } else {
                    e.classList.remove('animate-shake'); void e.offsetWidth; e.classList.add('animate-shake');
                }
                
                if (secretAttempts >= 3) hWrap.classList.remove('hidden');
                if (secretAttempts >= 3) {
                    setTimeout(() => {
                        secretAttempts = 0;
                        [1, 2, 3].forEach(idx => { const hh = document.getElementById('heart-' + idx); if (hh) { hh.textContent = '❤️'; hh.style.opacity = '1'; hh.style.filter = ''; } });
                    }, 1500);
                }
            }
        }

        function showLetter() {
            const letter = document.getElementById('secret-letter');
            if (!letter) return;
            const dict = dictionary[currentLang] || dictionary['es'];
            const isV2Ready = true;
            if (isV2Ready && dict.secret_letter_v2_p1) {
                letterParagraphs = [dict.secret_letter_v2_p1, dict.secret_letter_v2_p2, dict.secret_letter_v2_p3, dict.secret_letter_v2_p4, dict.secret_letter_v2_p5];
            } else {
                letterParagraphs = [dict.secret_letter_p1, dict.secret_letter_p2, dict.secret_letter_p3, dict.secret_letter_p4, dict.secret_letter_p5];
            }
            currentPara = 0;
            const lt = document.getElementById('letter-title'); if (lt) lt.textContent = dict.secret_letter_title;
            const nav = document.getElementById('letter-nav'); if (nav) nav.classList.remove('hidden');
            const sig = document.getElementById('letter-signature'); if (sig) sig.classList.add('hidden');
            renderLetterPara();
            
            letter.classList.remove('hidden');
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(letter, 
                    { opacity: 0, scale: 0.9, y: 80, rotationX: -15 }, 
                    { opacity: 1, scale: 1, y: 0, rotationX: 0, duration: 1, ease: "back.out(1.2)" }
                );
                spawnLetterHearts();
            } else {
                letter.style.opacity = '0';
                letter.style.transform = 'scale(0.93) translateY(16px)';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        letter.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
                        letter.style.opacity = '1';
                        letter.style.transform = 'scale(1) translateY(0)';
                        spawnLetterHearts();
                    });
                });
            }
        }
        */

        function renderLetterPara() {
            const body = document.getElementById('letter-body');
            const dotsWrap = document.getElementById('para-dots');
            const nextBtn = document.getElementById('next-para');
            const prevBtn = document.getElementById('prev-para');
            if (!body || !dotsWrap) return;
            body.innerHTML = '';
            for (let idx = 0; idx <= currentPara; idx++) {
                const p = document.createElement('p');
                p.innerHTML = letterParagraphs[idx];
                body.appendChild(p);

                if (idx === currentPara) {
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(p,
                            { opacity: 0, y: 30, filter: "blur(5px)" },
                            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power2.out" }
                        );
                    } else {
                        p.style.animation = 'paraFadeIn 0.6s ease-out both';
                    }
                }
            }
            setTimeout(() => { body.scrollTop = body.scrollHeight; }, 50);
            dotsWrap.innerHTML = '';
            letterParagraphs.forEach((_, idx) => {
                const d = document.createElement('span');
                d.style.cssText = `display:inline-block;width:8px;height:8px;border-radius:9999px;transition:all 0.3s;background:${idx <= currentPara ? '#f59e0b' : '#3f3f46'};transform:${idx === currentPara ? 'scale(1.3)' : 'scale(1)'};`;
                dotsWrap.appendChild(d);
            });
            if (prevBtn) { prevBtn.style.display = currentPara === 0 ? 'none' : 'flex'; }
            const isLast = currentPara >= letterParagraphs.length - 1;
            if (nextBtn) {
                if (isLast) {
                    const _ld2 = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {};
                    nextBtn.textContent = _ld2.letter_fin_btn || '✓ Fin';
                    nextBtn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
                    nextBtn.onclick = () => {
                        if (typeof AudioManager !== 'undefined') AudioManager.play('navegarcarta.mp3', 0.6);
                        const letterWrap = document.getElementById('secret-letter');
                        const dedModal = document.getElementById('secret-dedication-modal');
                        const dedContent = document.getElementById('dedication-content');

                        if (letterWrap) {
                            if (typeof gsap !== 'undefined') {
                                gsap.to(letterWrap, {
                                    scale: 1.3, opacity: 0, filter: "blur(20px)", y: -60, duration: 0.6, ease: "power2.in",
                                    onComplete: () => {
                                        letterWrap.classList.add('hidden');
                                        gsap.set(letterWrap, { clearProps: "all" });
                                        if (dedModal) {
                                            dedModal.classList.remove('hidden');
                                            void dedModal.offsetWidth;
                                            if (dedContent) {
                                                dedContent.style.opacity = '1';
                                                dedContent.style.transform = 'scale(1)';
                                            }
                                        }
                                    }
                                });
                            } else {
                                letterWrap.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                                letterWrap.style.opacity = '0';
                                letterWrap.style.transform = 'scale(0.95)';
                                setTimeout(() => {
                                    letterWrap.classList.add('hidden');
                                    if (dedModal) {
                                        dedModal.classList.remove('hidden');
                                        void dedModal.offsetWidth;
                                        if (dedContent) {
                                            dedContent.style.opacity = '1';
                                            dedContent.style.transform = 'scale(1)';
                                        }
                                    }
                                }, 600);
                            }
                        }
                    };
                } else {
                    const _ld2 = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {};
                    nextBtn.textContent = _ld2.letter_next_btn || 'Siguiente →';
                    nextBtn.style.background = 'linear-gradient(135deg,#f59e0b,#ec4899)';
                    nextBtn.onclick = () => letterNav(1);
                }
            }
        }

        function letterNav(dir) {
            if (dir === 1) {
                AudioManager.play('navegarcarta.mp3', 0.6);
            } else {
                AudioManager.play('scroll.wav', 0.6);
            }
            currentPara = Math.max(0, Math.min(letterParagraphs.length - 1, currentPara + dir));
            renderLetterPara();
        }

        function finishSecretModal() {
            if (typeof AudioManager !== 'undefined') AudioManager.play('secret.wav', 0.8);

            const dedContent = document.getElementById('dedication-content');
            if (dedContent) {
                const card = dedContent.firstElementChild;
                if (card) {
                    card.style.transition = 'box-shadow 1s ease-in-out, border-color 1s ease-in-out';
                    void card.offsetWidth;
                    card.style.boxShadow = '0 0 100px rgba(245, 158, 11, 0.8)';
                    card.style.borderColor = '#f59e0b';
                }
            }

            if (typeof window.spawnSpotlightConfetti === 'function') {
                window.spawnSpotlightConfetti();
            }

            // Subtle petal / heart drop
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const p = document.createElement('div');
                    p.innerHTML = ['🌸', '💖', '✨'][Math.floor(Math.random() * 3)];
                    p.className = 'fixed z-[300] text-2xl md:text-3xl pointer-events-none drop-shadow-md';
                    p.style.left = `${Math.random() * 100}vw`;
                    p.style.top = `-50px`;
                    p.style.animation = `heartFall ${3 + Math.random() * 2}s linear forwards`;
                    document.body.appendChild(p);
                    setTimeout(() => p.remove(), 5000);
                }, i * 150);
            }

            setTimeout(() => {
                // Hacer scroll al inicio instantáneamente mientras el modal aún cubre toda la pantalla
                window.scrollTo({ top: 0, behavior: 'instant' });

                const m = document.getElementById('secret-modal');
                if (m && typeof gsap !== 'undefined') {
                    if (typeof AudioManager !== 'undefined') AudioManager.play('flyout.wav', 0.6);
                    gsap.fromTo(m,
                        { clipPath: "circle(100% at 50% 50%)" },
                        {
                            clipPath: "circle(0% at 50% 50%)", duration: 0.8, ease: "power4.inOut", onComplete: () => {
                                m.classList.add('hidden');
                                gsap.set(m, { clearProps: "clipPath, opacity" });
                            }
                        }
                    );
                } else {
                    closeSecretModal();
                }
            }, 2000); // 2 segundos para admirar el brillo
        }

        // ══════════ HEALING CENTER ══════════
        let breatheRunning = false, breatheCycles = 0;
        function startBreathe() {
            if (breatheRunning) return;
            AudioManager.play('slideralto.wav', 0.6);
            breatheRunning = true;
            const circle = document.getElementById('breathe-circle');
            const text = document.getElementById('breathe-text');
            const counter = document.getElementById('breathe-counter');

            function doCycle() {
                if (breatheCycles >= 3) {
                    AudioManager.play('correcto.wav', 0.6);
                    text.textContent = '✓';
                    circle.className = 'heal-breathe-circle';
                    circle.style.borderColor = '#10b981';
                    document.getElementById('breathe-next-btn').disabled = false;
                    updateHealProgress(1);
                    return;
                }

                breatheCycles++;
                if (counter) counter.textContent = breatheCycles + ' de 3 ciclos';

                // Inhala
                if (text) text.textContent = 'Inhala';
                if (circle) {
                    circle.className = 'heal-breathe-circle inhale';
                    circle.style.borderColor = '#f59e0b';
                }

                setTimeout(() => {
                    // Exhala
                    if (text) text.textContent = 'Exhala';
                    if (circle) circle.className = 'heal-breathe-circle exhale';

                    setTimeout(() => {
                        doCycle();
                    }, 3000);
                }, 3000);
            }
            doCycle();
        }
        document.addEventListener('DOMContentLoaded', () => {
            const bc = document.getElementById('breathe-circle');
            if (bc) bc.addEventListener('click', startBreathe);
        });

        function toggleHealCard(card) {
            card.classList.toggle('checked');
            if (card.classList.contains('checked')) {
                AudioManager.play('seleccionsi.wav', 0.6);
            } else {
                AudioManager.play('seleccionno.wav', 0.6);
            }
            const total = document.querySelectorAll('#heal-ack-cards .heal-card').length;
            const checked = document.querySelectorAll('#heal-ack-cards .heal-card.checked').length;
            document.getElementById('heal-ack-next').disabled = checked < 2;
            // Heal cracks
            if (checked >= 1) healCrack('crack1');
            if (checked >= 2) healCrack('crack2');
            if (checked >= 3) healCrack('crack3');
            if (checked >= 4) healCrack('crack4');
            if (checked >= 2) updateHealProgress(2);
        }

        // ══════════ HELIOTROPISMO (GIRASOL INTERACTIVO) ══════════
        let sunflowerUnlocked = false;

        function updateSunPosition(val) {
            if (sunflowerUnlocked) return;
            const sun = document.getElementById('draggable-sun');
            const head = document.getElementById('sunflower-head');
            const morning = document.getElementById('sky-morning');
            const noon = document.getElementById('sky-noon');
            const evening = document.getElementById('sky-evening');
            const stars = document.getElementById('sky-stars');
            const hint = document.getElementById('sunflower-hint');

            const xPos = 10 + (val * 0.8);
            const normalized = (val - 50) / 50;
            const yPos = 20 + (normalized * normalized * 40);

            sun.style.left = `${xPos}%`;
            sun.style.top = `${yPos}%`;

            const angle = (val - 50) * 1.2;
            head.style.transform = `translateY(-50%) rotate(${angle}deg)`;

            if (val < 50) {
                const progress = val / 50;
                morning.style.opacity = 1 - progress;
                noon.style.opacity = progress;
                evening.style.opacity = 0;
                stars.style.opacity = Math.max(0, 1 - progress * 2);
            } else {
                const progress = (val - 50) / 50;
                morning.style.opacity = 0;
                noon.style.opacity = 1 - progress;
                evening.style.opacity = progress;
                stars.style.opacity = Math.max(0, (progress - 0.5) * 2);
            }

            if (val > 5 && hint) {
                hint.style.opacity = '0';
            }
            if (val >= 98) checkSunflowerComplete();
        }

        function checkSunflowerComplete() {
            const slider = document.getElementById('sun-slider');
            if (slider.value >= 98 && !sunflowerUnlocked) {
                sunflowerUnlocked = true;
                slider.disabled = true;
                slider.style.display = 'none';

                if (typeof AudioManager !== 'undefined') AudioManager.play('dedicatoriacarta.mp3', 0.8);

                createSunflowerParticles();

                const explanation = document.getElementById('quiz-explanation');
                explanation.style.display = 'block';
                // Trigger reflow
                void explanation.offsetWidth;
                explanation.classList.add('expanded');
                explanation.style.maxHeight = '2000px';
                explanation.style.opacity = '1';
                explanation.style.transform = 'translateY(0)';
                setTimeout(() => { explanation.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);

                const hint = document.getElementById('sunflower-hint');
                if (hint) {
                    const _sd = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {};
                    const _st = _sd.sunflower_success || '¡Siempre hacia ti! 🌻✨';
                    hint.innerHTML = '<span class="text-white font-bold text-lg drop-shadow-md bg-black/30 inline-block px-5 py-2 rounded-full backdrop-blur-sm transform-gpu">' + _st + '</span>';
                    hint.style.opacity = '1';
                    hint.classList.remove('animate-pulse');
                    hint.classList.add('animate-bounce');
                }
            }
        }

        function createSunflowerParticles() {
            const widget = document.getElementById('sunflower-widget');
            for (let i = 0; i < 25; i++) {
                const p = document.createElement('div');
                p.innerText = ['🌻', '✨', '💛', '💖'][Math.floor(Math.random() * 4)];
                p.className = 'absolute z-30 text-2xl pointer-events-none drop-shadow-lg';
                p.style.left = `50%`;
                p.style.bottom = `100px`;
                p.style.transition = 'all 1s cubic-bezier(0.25, 1, 0.5, 1)';
                p.style.transform = `translate(-50%, 0) scale(0)`;

                widget.appendChild(p);

                setTimeout(() => {
                    const angle = Math.random() * Math.PI;
                    const dist = 60 + Math.random() * 180;
                    const tx = Math.cos(angle) * dist;
                    const ty = -Math.sin(angle) * dist;
                    p.style.transform = `translate(calc(-50% + ${tx}px), ${ty}px) scale(${0.8 + Math.random() * 0.6})`;
                    p.style.opacity = '0';
                }, 50);

                setTimeout(() => p.remove(), 1050);
            }
        }

        function healCrack(id) {
            const el = document.getElementById(id);
            if (el) { el.setAttribute('stroke', 'url(#goldGrad)'); el.setAttribute('stroke-width', '2.5'); el.setAttribute('opacity', '1'); }
        }

        function signPact(card) {
            card.classList.toggle('signed');
            if (card.classList.contains('signed')) {
                AudioManager.play('seleccionsi.wav', 0.6);
            } else {
                AudioManager.play('seleccionno.wav', 0.6);
            }
            const status = card.querySelector('.pact-status');
            const dict = dictionary[currentLang] || dictionary.es;
            if (card.classList.contains('signed')) {
                status.textContent = dict.heal_pact_signed || '✓ Firmado';
                status.style.color = '#10b981';
            } else {
                status.textContent = dict.heal_pact_pending || 'Pendiente';
                status.style.color = '';
            }
            const total = document.querySelectorAll('#heal-pact-cards .heal-pact-card').length;
            const signed = document.querySelectorAll('#heal-pact-cards .heal-pact-card.signed').length;
            document.getElementById('heal-pact-next').disabled = signed < 2;
            if (signed >= 2) updateHealProgress(4);
        }

        let currentHealStep = 1;
        function goHealStep(step) {
            AudioManager.play('scroll.wav', 0.6);
            document.querySelectorAll('.heal-step').forEach(s => s.classList.remove('active'));
            const target = document.getElementById('heal-step-' + step);
            if (target) { target.classList.add('active'); }
            currentHealStep = step;
            updateHealProgress(step);
            // Temperature animation on step 3
            if (step === 3) {
                setTimeout(() => {
                    const bar = document.getElementById('heal-temp-bar');
                    if (bar) bar.style.width = '35%';
                    const txt = document.getElementById('heal-temp-text');
                    const dict = dictionary[currentLang] || dictionary.es;
                    if (txt) txt.textContent = dict.heal_temp_cool || 'En paz — el amor gana';
                }, 800);
            }
            // Final stats
            if (step === 5) {
                const acks = document.querySelectorAll('#heal-ack-cards .heal-card.checked').length;
                const pacts = document.querySelectorAll('#heal-pact-cards .heal-pact-card.signed').length;
                const statAck = document.getElementById('heal-stat-ack');
                const statPact = document.getElementById('heal-stat-pact');
                if (statAck) statAck.textContent = acks;
                if (statPact) statPact.textContent = pacts;
                updateHealProgress(5);
                // All cracks healed
                ['crack1', 'crack2', 'crack3', 'crack4'].forEach(c => healCrack(c));
            }
            // Scroll to section top
            const healSection = document.getElementById('sanacion');
            if (healSection) healSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function updateHealProgress(step) {
            for (let i = 1; i <= 5; i++) {
                const seg = document.getElementById('heal-seg-' + i);
                if (seg) seg.style.width = i <= step ? '100%' : '0%';
            }
        }

        function resetHealing() {
            AudioManager.play('flyout.wav', 0.6);
            breatheRunning = false; breatheCycles = 0;
            currentHealStep = 1;
            // Reset breathing
            const circle = document.getElementById('breathe-circle');
            if (circle) { circle.className = 'heal-breathe-circle'; circle.style.borderColor = ''; }
            const btext = document.getElementById('breathe-text');
            const dict = dictionary[currentLang] || dictionary.es;
            if (btext) btext.textContent = dict.heal_breathe_ready || 'Toca para empezar';
            const breatheCounter = document.getElementById('breathe-counter');
            const breatheNextBtn = document.getElementById('breathe-next-btn');
            if (breatheCounter) breatheCounter.textContent = dict.heal_breathe_count || '0 de 3 ciclos';
            if (breatheNextBtn) breatheNextBtn.disabled = true;
            // Reset cards
            document.querySelectorAll('.heal-card').forEach(c => c.classList.remove('checked'));
            const healAckNext = document.getElementById('heal-ack-next');
            if (healAckNext) healAckNext.disabled = true;
            // Reset pacts
            document.querySelectorAll('.heal-pact-card').forEach(c => {
                c.classList.remove('signed');
                const s = c.querySelector('.pact-status');
                if (s) { s.textContent = dict.heal_pact_pending || 'Pendiente'; s.style.color = ''; }
            });
            const healPactNext = document.getElementById('heal-pact-next');
            if (healPactNext) healPactNext.disabled = true;
            // Reset cracks
            ['crack1', 'crack2', 'crack3', 'crack4'].forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.setAttribute('stroke', '#52525b'); el.setAttribute('stroke-width', '1.5'); el.setAttribute('opacity', '.5'); }
            });
            // Reset temp
            const bar = document.getElementById('heal-temp-bar');
            if (bar) bar.style.width = '80%';
            // Reset progress
            updateHealProgress(0);
            // Show step 1
            document.querySelectorAll('.heal-step').forEach(s => s.classList.remove('active'));
            const healStep1 = document.getElementById('heal-step-1');
            if (healStep1) healStep1.classList.add('active');
            const healSection = document.getElementById('sanacion');
            if (healSection) healSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // ══════════ FLIP CARDS - PROMESAS ══════════
        function flipCard(wrap) {
            wrap.classList.toggle('flipped');
            if (wrap.classList.contains('flipped')) {
                AudioManager.play('tarjetas.wav', 0.7);
            } else {
                AudioManager.play('seleccionno.wav', 0.5);
            }
        }

        // ══════════ PHRASE TOGGLE - TOP5 ══════════
        function togglePhrase(card) {
            const detail = card.querySelector('.phrase-detail');
            const arrow = card.querySelector('.phrase-arrow');
            const isOpen = detail.style.maxHeight !== '0px' && detail.style.maxHeight !== '';
            // Close all
            document.querySelectorAll('.phrase-detail').forEach(d => { d.style.maxHeight = '0px'; d.style.opacity = '0'; });
            document.querySelectorAll('.phrase-arrow').forEach(a => { a.textContent = '+'; });
            if (!isOpen) {
                AudioManager.play('scroll.wav', 0.6);
                detail.style.maxHeight = '200px';
                detail.style.opacity = '1';
                if (arrow) arrow.textContent = '−';
            }
        }

        // ══════════ WORD BAR ANIMATION ══════════
        function animateWordBars() {
            document.querySelectorAll('.word-bar').forEach(bar => {
                const target = bar.style.getPropertyValue('--wb');
                bar.style.width = target;
            });
        }

        // ══════════ JUEGOS Y QUIZ ══════════
        let quizDodgeCount = 0;

        function dodgeAnswer(btn) {
            if (quizDodgeCount < 3) {
                const x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 40 + 20);
                const y = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 30 + 10);

                btn.style.transform = `translate(${x}px, ${y}px) scale(0.95)`;
                btn.style.zIndex = "20";
                quizDodgeCount++;

                let hint = document.getElementById('quiz-tease-msg');
                if (!hint) {
                    hint = document.createElement('span');
                    hint.id = "quiz-tease-msg";
                    hint.className = "absolute -top-5 right-4 text-xs font-bold text-brand-600 bg-brand-100 px-3 py-1 rounded-full shadow-md animate-bounce pointer-events-none";
                    btn.appendChild(hint);
                }

                if (quizDodgeCount === 1) hint.innerText = "¡Atrápame si puedes! 🏃‍♀️💨";
                if (quizDodgeCount === 2) hint.innerText = "¡Casi! 😂🌻";
                if (quizDodgeCount === 3) {
                    hint.innerText = "¡Uf! Ya me cansé 🥵";
                    setTimeout(() => { btn.style.transform = "translate(0px, 0px) scale(1)"; }, 600);
                }
            }
        }

        function checkQuizAnswer(index, btnEl) {
            const quizOptions = document.getElementById('quiz-options');
            if (!quizOptions) return;
            const btns = quizOptions.children;

            if (index === 1) {
                if (quizDodgeCount < 3) {
                    playSound('flap');
                    dodgeAnswer(btnEl);
                    return;
                }

                AudioManager.play('dedicatoriacarta.mp3', 0.8);
                const hint = document.getElementById('quiz-tease-msg');
                if (hint) hint.remove();

                btnEl.style.transform = `scale(1.05)`;
                btnEl.style.zIndex = "10";
                btnEl.classList.remove('border-zinc-200', 'dark:border-zinc-800');
                btnEl.classList.add('border-brand-500', 'bg-brand-50', 'dark:bg-brand-900/20', 'text-brand-600', 'dark:text-brand-400');

                for (let i = 0; i < btns.length; i++) {
                    btns[i].onclick = null;
                    btns[i].onmouseenter = null;
                    btns[i].ontouchstart = null;
                    if (i !== 1) {
                        btns[i].classList.add('opacity-40', 'scale-95');
                    }
                }

                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        const c = document.getElementById('quiz-options');
                        const p = document.createElement('div');
                        p.innerText = ['🌻', '✨', '💛', '💖'][Math.floor(Math.random() * 4)];
                        p.className = 'absolute z-0 text-3xl pointer-events-none animate-float-up drop-shadow-lg';
                        p.style.left = `${Math.random() * 100}%`;
                        p.style.top = `${50 + (Math.random() * 50)}%`;
                        c.appendChild(p);
                        setTimeout(() => p.remove(), 1000);
                    }, i * 60);
                }

                const exp = document.getElementById('quiz-explanation');
                if (!exp) return;
                exp.classList.remove('hidden');
                setTimeout(() => {
                    exp.classList.add('expanded');
                    setTimeout(() => {
                        exp.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 400);
                }, 50);
            } else {
                AudioManager.play('incorrect.wav', 0.6);
                btnEl.classList.add('animate-shake', 'border-red-500', 'text-red-500', 'bg-red-50', 'dark:bg-red-900/20');

                const span = btnEl.querySelector('span');
                if (span && !btnEl.dataset.teased) {
                    const originalText = span.innerHTML;
                    btnEl.dataset.teased = "true";

                    span.innerHTML = index === 0 ? "¡Falso! (Aunque el amarillo es lindo) ❌" : "¡Oye! No eres taaan alta 😂 ❌";

                    setTimeout(() => {
                        btnEl.classList.remove('animate-shake', 'border-red-500', 'text-red-500', 'bg-red-50', 'dark:bg-red-900/20');
                        span.innerHTML = originalText;
                        btnEl.dataset.teased = "";
                    }, 2000);
                }
            }
        }

        // ═══════════════════════════════════════════════════════════
        // REDESIGNED MINIGAMES — Hub + 3 Games
        // ═══════════════════════════════════════════════════════════

        // -- Hub 3D Tilt --
        function tiltCard(e, el) {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px)`;
        }
        function resetTilt(el) { el.style.transform = ''; }

        // -- Overlay Helpers --
        function showGameOverlay(id) {
            const ov = document.getElementById(id);
            if (!ov) return;
            ov.style.display = 'flex';
            void ov.offsetWidth;
            ov.classList.add('active');
        }
        function hideGameOverlay(id) {
            const ov = document.getElementById(id);
            if (!ov) return;
            ov.classList.remove('active');
            setTimeout(() => {
                ov.style.display = 'none';
                const smartMsg = ov.querySelector('[id^="smart-msg-"]');
                const miniBoard = ov.querySelector('[id^="leaderboard-mini-"]');
                if (smartMsg) smartMsg.innerHTML = "";
                if (miniBoard) miniBoard.innerHTML = "";

                // Hide records wrapper for next time
                const wrapper = ov.querySelector('[id^="records-wrapper-"]');
                if (wrapper) {
                    wrapper.classList.add('hidden');
                    // Reset GSAP styles if present
                    if (window.gsap) gsap.set(wrapper, { clearProps: "all" });
                }
            }, 350);
        }

        // -- Arcade Hub Open/Close --
        function openArcadeGame(gameId) {
            AudioManager.play('gameopen.wav', 0.8);
            const h = document.getElementById('games-hub'), a = document.getElementById('game-active-area');
            const g1 = document.getElementById('game1-wrapper'), g2 = document.getElementById('game2-wrapper'), g3 = document.getElementById('game3-wrapper'), g4 = document.getElementById('game4-wrapper');
            h.classList.add('opacity-0', 'scale-95');
            const m = document.getElementById('minijuegos');
            if (m) m.style.minHeight = m.offsetHeight + 'px';
            setTimeout(() => {
                h.classList.add('hidden');
                g1.classList.add('hidden'); g2.classList.add('hidden'); g3.classList.add('hidden'); g4.classList.add('hidden');
                if (gameId === 'game1') { g1.classList.remove('hidden'); showGameOverlay('g1-overlay'); if (!g1Canvas) initGame1(); else drawG1(); }
                else if (gameId === 'game2') { g2.classList.remove('hidden'); showGameOverlay('game2-overlay'); }
                else if (gameId === 'game3') { g3.classList.remove('hidden'); showGameOverlay('game3-overlay'); initMemoryBoard(); }
                else if (gameId === 'game4') { g4.classList.remove('hidden'); showGameOverlay('game4-overlay'); }
                a.classList.remove('hidden');
                a.classList.add('scale-95', 'opacity-0');
                void a.offsetWidth;
                a.classList.remove('scale-95', 'opacity-0');
                setTimeout(() => { if (m) m.style.minHeight = ''; }, 500);
                let gameName = "Juego";
                if (gameId === 'game1') gameName = "Atrapa Girasoles";
                else if (gameId === 'game2') gameName = "Mariposa de Luz";
                else if (gameId === 'game3') gameName = "Memoria de Amor";
                else if (gameId === 'game4') gameName = "¿Qué Canción Es?";
                if (window.yaireUpdatePresence) window.yaireUpdatePresence("Jugando: " + gameName);
            }, 500);
        }
        function closeArcadeGame() {
            AudioManager.play('flyout.wav', 0.6);
            const h = document.getElementById('games-hub'), a = document.getElementById('game-active-area');
            // Stop all game loops & timers rigorously before hiding
            if (game1Active) { clearInterval(timer1Interval); timer1Interval = null; cancelAnimationFrame(g1FrameId); g1FrameId = null; game1Active = false; showGameOverlay('g1-overlay'); }
            if (butterflyActive) { butterflyActive = false; cancelAnimationFrame(bFrameId); bFrameId = null; }
            if (game3Active) { clearInterval(game3Timer); game3Timer = null; game3Active = false; showGameOverlay('game3-overlay'); }
            if (game4Active) { cleanupGuessGame(); showGameOverlay('game4-overlay'); }
            // Clean up canvas particle arrays to free memory
            g1Particles = []; g1Sunflowers = []; obstacles = []; bTrail = [];
            const m = document.getElementById('minijuegos');
            if (m) m.style.minHeight = m.offsetHeight + 'px';
            a.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                a.classList.add('hidden');
                h.classList.remove('hidden');
                h.classList.add('scale-95', 'opacity-0');
                void h.offsetWidth;
                h.classList.remove('scale-95', 'opacity-0');
                setTimeout(() => { if (m) m.style.minHeight = ''; }, 500);
                if (window.yaireUpdatePresence) window.yaireUpdatePresence("Zona de Juegos");
            }, 500);
        }

        // ════════════════════════════════════════════════════
        //  GAME 1 — EL JARDÍN DE YAIRE (Canvas Garden)
        // ════════════════════════════════════════════════════
        let g1Canvas, g1Ctx, game1Active = false, score1 = 0, timeLeft1 = 30, timer1Interval;
        let g1Sunflowers = [], g1Particles = [], g1Clouds = [], g1Wind = 0, g1Combo = 0, g1LastClick = 0, g1FrameId;

        function resizeGame1Canvas() {
            if (!g1Canvas) return;
            const isMobile = window.innerWidth < 768;
            const cw = isMobile ? 600 : 1200;
            const ch = isMobile ? 500 : 675;
            g1Canvas.width = cw;
            g1Canvas.height = ch;
        }

        function initGame1() {
            g1Canvas = document.getElementById('game1-canvas');
            if (!g1Canvas) return;
            g1Ctx = g1Canvas.getContext('2d');
            resizeGame1Canvas();
            g1Clouds = [];
            for (let i = 0; i < 5; i++) g1Clouds.push({ x: Math.random() * g1Canvas.width, y: 20 + Math.random() * 70, w: 50 + Math.random() * 90, s: 0.15 + Math.random() * 0.25 });
            g1Canvas.addEventListener('click', g1Click);
            g1Canvas.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.touches[0]; g1Click({ clientX: t.clientX, clientY: t.clientY }); }, { passive: false });
            window.addEventListener('resize', () => { if (!game1Active) resizeGame1Canvas(); });
            drawG1();
        }

        function startGame1() {
            if (game1Active) return;
            AudioManager.play('juego.wav', 0.8);
            resizeGame1Canvas();
            game1Active = true; score1 = 0; timeLeft1 = 30; g1Combo = 0; g1LastClick = 0;
            g1Sunflowers = []; g1Particles = [];
            updateG1HUD();
            hideGameOverlay('g1-overlay');
            spawnG1(); g1Loop();
            clearInterval(timer1Interval);
            timer1Interval = setInterval(() => { timeLeft1--; updateG1HUD(); if (timeLeft1 <= 0) endGame1(); }, 1000);
        }

        function spawnG1() {
            if (!game1Active) return;
            const cw = g1Canvas.width, ch = g1Canvas.height;
            g1Sunflowers.push({
                x: 60 + Math.random() * (cw - 120), y: ch * 0.5 + Math.random() * (ch * 0.35),
                scale: 0, maxScale: 0.7 + Math.random() * 0.4, age: 0, maxAge: 180 + Math.floor(Math.random() * 60),
                sway: Math.random() * Math.PI * 2, alive: true
            });
            const alive = g1Sunflowers.filter(s => s.alive).length;
            const maxAlive = score1 < 8 ? 1 : score1 < 20 ? 2 : 3;
            let delay = score1 < 5 ? 1400 : score1 < 15 ? 900 : score1 < 30 ? 600 : 450;
            if (alive < maxAlive) delay = Math.min(delay, 350);
            setTimeout(() => spawnG1(), delay);
        }

        function g1Click(e) {
            if (!game1Active) return;
            const r = g1Canvas.getBoundingClientRect();
            const sx = g1Canvas.width / r.width, sy = g1Canvas.height / r.height;
            const mx = (e.clientX - r.left) * sx, my = (e.clientY - r.top) * sy;
            for (let i = g1Sunflowers.length - 1; i >= 0; i--) {
                const s = g1Sunflowers[i];
                if (!s.alive || s.age > s.maxAge - 40) continue;
                const hx = s.x + Math.sin(s.sway) * s.scale * 4, hy = s.y - 55 * s.scale;
                const dx = mx - hx, dy = my - hy;
                // Expanded hitbox for better mobile UX
                const hr = 75 * s.scale;
                if (dx * dx + dy * dy < hr * hr) {
                    AudioManager.play('clickgirasol.wav', 0.9);
                    s.alive = false;
                    const now = Date.now();
                    g1Combo = (now - g1LastClick < 1200) ? Math.min(g1Combo + 1, 5) : 1;
                    g1LastClick = now;
                    const mult = g1Combo >= 5 ? 5 : g1Combo >= 3 ? 3 : g1Combo >= 2 ? 2 : 1;
                    score1 += mult;
                    // Improved Particles with more explosive spread
                    for (let j = 0; j < 14; j++) {
                        const a = (Math.PI * 2 / 14) * j + (Math.random() - 0.5);
                        const speed = 3 + Math.random() * 5;
                        g1Particles.push({ x: hx, y: hy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 3, life: 1, d: 0.01 + Math.random() * 0.015, sz: 5 + Math.random() * 7, t: 'petal', c: Math.random() > 0.5 ? '#fcf003' : '#f59e0b', rot: Math.random() * 6.28, rs: (Math.random() - 0.5) * 0.25 });
                    }
                    g1Particles.push({ x: hx, y: hy - 10, vx: 0, vy: -2, life: 1, d: 0.015, t: 'text', txt: `+${mult}`, sz: mult > 1 ? 32 : 24, c: mult > 1 ? '#ec4899' : '#facc15' });
                    if (mult > 1) { playSound('magic'); g1ShowCombo(`COMBO x${mult}!`); }
                    updateG1HUD();
                    const scEl = document.getElementById('g1-score');
                    if (scEl) { scEl.classList.remove('score-pop'); void scEl.offsetWidth; scEl.classList.add('score-pop'); }
                    return;
                }
            }
        }

        function g1ShowCombo(text) {
            const wrap = g1Canvas.parentElement;
            const old = wrap.querySelector('.combo-banner');
            if (old) old.remove();
            const d = document.createElement('div'); d.className = 'combo-banner'; d.textContent = text;
            wrap.appendChild(d);
            setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 500); }, 800);
        }

        function updateG1HUD() {
            const sc = document.getElementById('g1-score'), tm = document.getElementById('g1-time');
            if (sc) sc.textContent = score1;
            if (tm) { tm.textContent = timeLeft1 + 's'; tm.style.color = timeLeft1 <= 5 ? '#ef4444' : ''; }
            const ring = document.getElementById('g1-timer-ring');
            if (ring) {
                const pct = Math.max(0, timeLeft1 / 30), circ = 2 * Math.PI * 24;
                ring.style.strokeDashoffset = circ * (1 - pct);
                ring.style.stroke = pct > 0.5 ? '#22c55e' : pct > 0.17 ? '#f59e0b' : '#ef4444';
            }
        }

        function g1Loop() {
            if (!game1Active) return;
            g1Wind += 0.02;
            for (const s of g1Sunflowers) {
                if (!s.alive && s.scale > 0) { s.scale *= 0.93; continue; }
                if (!s.alive) continue;
                s.age++;
                if (s.scale < s.maxScale) s.scale += 0.025;
                if (s.age > s.maxAge - 40) { s.scale *= 0.97; if (s.scale < 0.08) s.alive = false; }
                s.sway += 0.03;
            }
            g1Sunflowers = g1Sunflowers.filter(s => s.alive || s.scale > 0.05);
            for (const p of g1Particles) {
                p.x += p.vx; p.y += p.vy; p.life -= p.d;
                if (p.t === 'petal') { p.vy += 0.07; p.vx *= 0.99; p.rot += p.rs; }
            }
            g1Particles = g1Particles.filter(p => p.life > 0);
            for (const c of g1Clouds) { c.x += c.s; if (c.x > g1Canvas.width + c.w) c.x = -c.w; }
            drawG1();
            g1FrameId = requestAnimationFrame(g1Loop);
        }

        function drawG1() {
            const ctx = g1Ctx, cw = g1Canvas.width, ch = g1Canvas.height;
            if (!ctx) return;
            const isD = document.documentElement.classList.contains('dark');
            // Sky
            const sky = ctx.createLinearGradient(0, 0, 0, ch);
            if (isD) { sky.addColorStop(0, '#0f172a'); sky.addColorStop(0.5, '#1e1b4b'); sky.addColorStop(1, '#312e81'); }
            else { sky.addColorStop(0, '#7dd3fc'); sky.addColorStop(0.4, '#bae6fd'); sky.addColorStop(1, '#e0f2fe'); }
            ctx.fillStyle = sky; ctx.fillRect(0, 0, cw, ch);
            // Clouds
            ctx.fillStyle = isD ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.65)';
            for (const c of g1Clouds) { ctx.beginPath(); ctx.arc(c.x, c.y, c.w * 0.28, 0, Math.PI * 2); ctx.arc(c.x + c.w * 0.22, c.y - 4, c.w * 0.33, 0, Math.PI * 2); ctx.arc(c.x + c.w * 0.45, c.y, c.w * 0.28, 0, Math.PI * 2); ctx.fill(); }
            // Hills
            const h1 = ctx.createLinearGradient(0, ch * 0.48, 0, ch);
            h1.addColorStop(0, isD ? '#064e3b' : '#86efac'); h1.addColorStop(1, isD ? '#022c22' : '#4ade80');
            ctx.fillStyle = h1; ctx.beginPath(); ctx.moveTo(0, ch);
            for (let x = 0; x <= cw; x += 15) ctx.lineTo(x, ch * 0.52 + Math.sin(x * 0.005 + 1) * 25 + Math.sin(x * 0.012) * 12);
            ctx.lineTo(cw, ch); ctx.fill();
            const h2 = ctx.createLinearGradient(0, ch * 0.6, 0, ch);
            h2.addColorStop(0, isD ? '#065f46' : '#4ade80'); h2.addColorStop(1, isD ? '#064e3b' : '#22c55e');
            ctx.fillStyle = h2; ctx.beginPath(); ctx.moveTo(0, ch);
            for (let x = 0; x <= cw; x += 15) ctx.lineTo(x, ch * 0.62 + Math.sin(x * 0.007 + 2) * 18 + Math.sin(x * 0.003) * 22);
            ctx.lineTo(cw, ch); ctx.fill();
            // Grass
            ctx.strokeStyle = isD ? 'rgba(16,185,129,0.12)' : 'rgba(34,197,94,0.25)'; ctx.lineWidth = 1.5;
            for (let i = 0; i < 35; i++) {
                const gx = (i / 35) * cw + Math.sin(g1Wind + i) * 2, gy = ch * 0.72 + Math.sin(i * 0.7) * 18;
                const sw = Math.sin(g1Wind + i * 0.3) * 7; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(gx + sw * 0.5, gy - 13, gx + sw, gy - 22); ctx.stroke();
            }
            // Sunflowers
            for (const s of g1Sunflowers) { if (s.scale < 0.05) continue; drawSunflower(ctx, s, isD); }
            // Particles
            for (const p of g1Particles) {
                ctx.globalAlpha = Math.max(0, p.life);
                if (p.t === 'text') { ctx.font = `bold ${p.sz}px Inter,sans-serif`; ctx.fillStyle = p.c; ctx.textAlign = 'center'; ctx.fillText(p.txt, p.x, p.y); }
                else if (p.t === 'petal') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.sz, p.sz * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
                ctx.globalAlpha = 1;
            }
        }

        function drawSunflower(ctx, s, isD) {
            const sw = Math.sin(s.sway) * s.scale * 4;
            const wilt = s.age > s.maxAge - 40;
            ctx.save(); ctx.translate(s.x, s.y); ctx.scale(s.scale, s.scale);
            // Stem
            ctx.strokeStyle = isD ? '#065f46' : '#15803d'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(sw * 0.5, -28, sw, -52); ctx.stroke();
            // Leaves
            ctx.fillStyle = isD ? '#059669' : '#22c55e';
            ctx.save(); ctx.translate(sw * 0.3, -22); ctx.rotate(0.3 + Math.sin(s.sway) * 0.08); ctx.beginPath(); ctx.ellipse(7, 0, 10, 4, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            ctx.save(); ctx.translate(sw * 0.3, -32); ctx.rotate(-0.3 - Math.sin(s.sway + 1) * 0.08); ctx.beginPath(); ctx.ellipse(-7, 0, 9, 3.5, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            // Head
            ctx.translate(sw, -52);
            for (let i = 0; i < 12; i++) { const a = (Math.PI * 2 / 12) * i + Math.sin(s.sway * 0.5) * 0.04; ctx.save(); ctx.rotate(a); ctx.fillStyle = wilt ? '#a3a3a3' : (i % 2 ? '#fbbf24' : '#facc15'); ctx.beginPath(); ctx.ellipse(0, -16, 5.5, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
            const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 11); cg.addColorStop(0, wilt ? '#737373' : '#92400e'); cg.addColorStop(1, wilt ? '#525252' : '#78350f');
            ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = wilt ? '#a3a3a3' : '#b45309';
            for (let i = 0; i < 7; i++) { const a = (Math.PI * 2 / 7) * i; ctx.beginPath(); ctx.arc(Math.cos(a) * 5, Math.sin(a) * 5, 1.2, 0, Math.PI * 2); ctx.fill(); }
            ctx.restore();
        }

        function endGame1() {
            clearInterval(timer1Interval); cancelAnimationFrame(g1FrameId); game1Active = false;
            AudioManager.play('perdergirasol.wav', 0.9);
            const t = dictionary[currentLang];
            const ic = document.getElementById('g1-ov-icon'), ti = document.getElementById('g1-ov-title'), su = document.getElementById('g1-ov-sub'), bt = document.getElementById('g1-ov-btn');
            if (ic) ic.textContent = '⏳';
            if (ti) ti.textContent = t.game1_over_title || '¡Se acabó el tiempo!';
            if (su) su.innerHTML = (t.game1_over_sub || 'Lograste cosechar <span class="text-brand-500 font-bold">{score}</span> girasoles.').replace('{score}', score1);
            if (bt) bt.textContent = t.game_restart || 'Jugar de nuevo';
            showGameOverlay('g1-overlay');
        }

        // ════════════════════════════════════════════════════
        //  GAME 2 — VUELO HACIA TI (Enhanced Runner)
        // ════════════════════════════════════════════════════
        let butterflyCanvas, ctxB, bgCanvas, ctxBg;
        let butterfly = { y: 375, v: 0, g: 0.45, jump: -8.5, size: 72, wingPhase: 0 };
        let obstacles = [], score2 = 0, highScore2 = 0, butterflyActive = false, bFrameId, baseSpeed = 5.5;
        let bgOffset = 0, bTrail = [], bSlowMo = false, bSlowFrames = 0;
        const pipeW = 100, gapSize = 280;

        function resizeButterflyCanvas() {
            if (!butterflyCanvas || !bgCanvas) return;
            const isMobile = window.innerWidth < 768;
            const cw = isMobile ? 600 : 1200;
            const ch = isMobile ? 400 : 675;
            butterflyCanvas.width = cw; butterflyCanvas.height = ch;
            bgCanvas.width = cw; bgCanvas.height = ch;
            butterfly.y = ch / 2;
        }

        function initButterflyGame() {
            butterflyCanvas = document.getElementById('butterfly-game-canvas');
            bgCanvas = document.getElementById('bg-canvas');
            if (!butterflyCanvas || !bgCanvas) return;
            ctxB = butterflyCanvas.getContext('2d');
            ctxBg = bgCanvas.getContext('2d');
            resizeButterflyCanvas();
            const s = localStorage.getItem('yaire_hs');
            if (s) { highScore2 = parseInt(s); const hs = document.getElementById('game2-highscore'); if (hs) hs.innerText = highScore2; }
            butterflyCanvas.addEventListener('mousedown', flap);
            butterflyCanvas.addEventListener('touchstart', flap, { passive: false });
            window.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && butterflyActive) { e.preventDefault(); flap(); }
                if (e.code === 'Escape') { const a = document.getElementById('game-active-area'); if (a && !a.classList.contains('hidden') && getComputedStyle(a).opacity > '0') { e.preventDefault(); closeArcadeGame(); } }
            });
            window.addEventListener('resize', () => { if (!butterflyActive) resizeButterflyCanvas(); });
            drawButterflyGame(); drawParallaxBg();
        }

        function flap(e) { if (e) e.preventDefault(); if (!butterflyActive) return; AudioManager.play('clickgirasol.wav', 0.8); butterfly.v = butterfly.jump; butterfly.wingPhase = 0; }

        function startButterflyGame() {
            if (butterflyActive) return;
            AudioManager.play('juego.wav', 0.8);
            resizeButterflyCanvas();
            butterflyActive = true; bSlowMo = false; bSlowFrames = 0; score2 = 0; obstacles = []; bTrail = [];
            butterfly.y = butterflyCanvas.height / 2; butterfly.v = 0; baseSpeed = 5.5; bgOffset = 0;
            const sc = document.getElementById('game2-score'); if (sc) sc.innerText = 0;
            hideGameOverlay('game2-overlay');
            gameLoopB();
        }

        function gameLoopB() {
            if (!butterflyActive) return;
            const spd = bSlowMo ? baseSpeed * 0.15 : baseSpeed;
            butterfly.wingPhase += 0.15;
            butterfly.v += butterfly.g * (bSlowMo ? 0.15 : 1);
            butterfly.y += butterfly.v * (bSlowMo ? 0.15 : 1);
            // Trail
            bTrail.push({ x: 150, y: butterfly.y, a: 1 });
            if (bTrail.length > 20) bTrail.shift();
            for (const t of bTrail) t.a *= 0.92;
            if (butterfly.y > butterflyCanvas.height - 30) { if (!bSlowMo) { bSlowMo = true; bSlowFrames = 12; } }
            if (butterfly.y < 15) { butterfly.y = 15; butterfly.v = 0; }
            // Slow-mo death countdown
            if (bSlowMo) { bSlowFrames--; if (bSlowFrames <= 0) { gameOverB(); return; } }
            // Obstacles
            if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < butterflyCanvas.width - 420) {
                let gapY = Math.random() * (butterflyCanvas.height - gapSize - 100) + 50;
                obstacles.push({ x: butterflyCanvas.width, gapY, passed: false, collected: false });
            }
            let hit = false;
            for (let i = obstacles.length - 1; i >= 0; i--) {
                let p = obstacles[i]; p.x -= spd;
                let bL = 150 - butterfly.size / 2, bR = 150 + butterfly.size / 2, bT = butterfly.y - butterfly.size / 2, bB = butterfly.y + butterfly.size / 2;
                if (bR > p.x && bL < p.x + pipeW) { if (bT < p.gapY || bB > p.gapY + gapSize) hit = true; }
                if (hit && !bSlowMo) { bSlowMo = true; bSlowFrames = 12; hit = false; continue; }
                if (!p.passed && bL > p.x + pipeW / 2) { playSound('ding'); score2++; p.passed = true; const sc = document.getElementById('game2-score'); if (sc) sc.innerText = score2; baseSpeed = 5.5 + score2 * 0.12; }
                if (p.x < -pipeW) obstacles.splice(i, 1);
            }
            bgOffset -= (spd * 0.3);
            if (bgOffset <= -bgCanvas.width) bgOffset = 0;
            drawParallaxBg(); drawButterflyGame();
            bFrameId = requestAnimationFrame(gameLoopB);
        }

        function drawParallaxBg() {
            if (!ctxBg || !bgCanvas) return;
            const w = bgCanvas.width, h = bgCanvas.height, isD = document.documentElement.classList.contains('dark');
            // Dynamic sky based on score
            const skyGrad = ctxBg.createLinearGradient(0, 0, 0, h);
            if (isD) {
                skyGrad.addColorStop(0, '#0f172a'); skyGrad.addColorStop(1, '#1e1b4b');
            } else {
                const t = Math.min(score2 / 30, 1); // 0=dawn, 1=sunset
                const r = Math.floor(56 + t * 180), g2c = Math.floor(189 - t * 80), b = Math.floor(248 - t * 120);
                skyGrad.addColorStop(0, `rgb(${r},${g2c},${b})`);
                skyGrad.addColorStop(1, t > 0.5 ? '#fde68a' : '#e0f2fe');
            }
            ctxBg.fillStyle = skyGrad; ctxBg.fillRect(0, 0, w, h);
            // Mountains (far layer)
            ctxBg.fillStyle = isD ? 'rgba(30,27,75,0.6)' : 'rgba(148,163,184,0.3)';
            ctxBg.beginPath(); ctxBg.moveTo(0, h);
            for (let x = 0; x <= w; x += 30) ctxBg.lineTo(x, h * 0.5 + Math.sin((x + bgOffset * 0.2) * 0.003) * 80 + Math.sin((x + bgOffset * 0.2) * 0.007) * 40);
            ctxBg.lineTo(w, h); ctxBg.fill();
            // Hills (mid layer)
            ctxBg.fillStyle = isD ? 'rgba(6,78,59,0.4)' : 'rgba(134,239,172,0.4)';
            ctxBg.beginPath(); ctxBg.moveTo(0, h);
            for (let x = 0; x <= w; x += 20) ctxBg.lineTo(x, h * 0.65 + Math.sin((x + bgOffset * 0.5) * 0.005) * 50 + Math.cos((x + bgOffset * 0.5) * 0.008) * 25);
            ctxBg.lineTo(w, h); ctxBg.fill();
            // Clouds
            ctxBg.fillStyle = isD ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.45)';
            for (let i = 0; i < 2; i++) {
                let ox = bgOffset * 0.6 + i * w;
                ctxBg.beginPath(); ctxBg.arc(ox + 200, 180, 45, 0, Math.PI * 2); ctxBg.arc(ox + 255, 180, 65, 0, Math.PI * 2); ctxBg.arc(ox + 310, 180, 45, 0, Math.PI * 2); ctxBg.fill();
                ctxBg.beginPath(); ctxBg.arc(ox + 750, 90, 35, 0, Math.PI * 2); ctxBg.arc(ox + 795, 90, 50, 0, Math.PI * 2); ctxBg.arc(ox + 840, 90, 35, 0, Math.PI * 2); ctxBg.fill();
            }
            // Ground
            ctxBg.fillStyle = isD ? '#064e3b' : '#22c55e';
            ctxBg.fillRect(0, h - 30, w, 30);
        }

        function drawButterflyGame() {
            if (!ctxB || !butterflyCanvas) return;
            const isD = document.documentElement.classList.contains('dark');
            ctxB.clearRect(0, 0, butterflyCanvas.width, butterflyCanvas.height);
            // Obstacles — organic rounded columns
            obstacles.forEach(p => {
                const grad1 = ctxB.createLinearGradient(p.x, 0, p.x + pipeW, 0);
                grad1.addColorStop(0, isD ? '#14532d' : '#16a34a'); grad1.addColorStop(0.5, isD ? '#166534' : '#22c55e'); grad1.addColorStop(1, isD ? '#14532d' : '#16a34a');
                // Top pipe
                ctxB.fillStyle = grad1;
                ctxB.beginPath();
                ctxB.moveTo(p.x, 0); ctxB.lineTo(p.x + pipeW, 0);
                ctxB.lineTo(p.x + pipeW, p.gapY - 15);
                ctxB.quadraticCurveTo(p.x + pipeW, p.gapY, p.x + pipeW - 15, p.gapY);
                ctxB.lineTo(p.x + 15, p.gapY);
                ctxB.quadraticCurveTo(p.x, p.gapY, p.x, p.gapY - 15);
                ctxB.closePath(); ctxB.fill();
                // Bottom pipe
                const bpY = p.gapY + gapSize;
                ctxB.fillStyle = grad1;
                ctxB.beginPath();
                ctxB.moveTo(p.x + 15, bpY);
                ctxB.quadraticCurveTo(p.x, bpY, p.x, bpY + 15);
                ctxB.lineTo(p.x, butterflyCanvas.height);
                ctxB.lineTo(p.x + pipeW, butterflyCanvas.height);
                ctxB.lineTo(p.x + pipeW, bpY + 15);
                ctxB.quadraticCurveTo(p.x + pipeW, bpY, p.x + pipeW - 15, bpY);
                ctxB.closePath(); ctxB.fill();
                // Tulip collectible
                if (!p.passed && !p.collected) {
                    const ty = p.gapY + gapSize / 2 + Math.sin(Date.now() * 0.003) * 8;
                    ctxB.font = '52px Arial'; ctxB.textAlign = 'center'; ctxB.textBaseline = 'middle';
                    ctxB.fillText('🌷', p.x + pipeW / 2, ty);
                }
            });
            // Trail
            for (let i = 0; i < bTrail.length; i++) {
                const t = bTrail[i];
                ctxB.globalAlpha = t.a * 0.3;
                ctxB.fillStyle = isD ? '#c084fc' : '#f9a8d4';
                ctxB.beginPath(); ctxB.arc(t.x - (bTrail.length - i) * 4, t.y, 4 + (i / bTrail.length) * 6, 0, Math.PI * 2);
                ctxB.fill();
            }
            ctxB.globalAlpha = 1;
            // Butterfly with animated wings
            ctxB.save(); ctxB.translate(150, butterfly.y);
            let rot = Math.min(Math.PI / 5, Math.max(-Math.PI / 5, butterfly.v * 0.04));
            ctxB.rotate(rot);
            const wingAngle = Math.sin(butterfly.wingPhase) * 0.35;
            // Left wing
            ctxB.save(); ctxB.scale(1, Math.cos(wingAngle));
            ctxB.fillStyle = isD ? '#a78bfa' : '#f9a8d4';
            ctxB.beginPath(); ctxB.ellipse(-18, -5, 22, 14, -0.3, 0, Math.PI * 2); ctxB.fill();
            ctxB.fillStyle = isD ? '#7c3aed' : '#ec4899';
            ctxB.beginPath(); ctxB.ellipse(-14, -4, 13, 8, -0.3, 0, Math.PI * 2); ctxB.fill();
            ctxB.restore();
            // Right wing
            ctxB.save(); ctxB.scale(1, Math.cos(wingAngle + Math.PI * 0.1));
            ctxB.fillStyle = isD ? '#a78bfa' : '#f9a8d4';
            ctxB.beginPath(); ctxB.ellipse(18, -5, 22, 14, 0.3, 0, Math.PI * 2); ctxB.fill();
            ctxB.fillStyle = isD ? '#7c3aed' : '#ec4899';
            ctxB.beginPath(); ctxB.ellipse(14, -4, 13, 8, 0.3, 0, Math.PI * 2); ctxB.fill();
            ctxB.restore();
            // Body
            ctxB.fillStyle = isD ? '#5b21b6' : '#9d174d';
            ctxB.beginPath(); ctxB.ellipse(0, 0, 5, 16, 0, 0, Math.PI * 2); ctxB.fill();
            // Antennae
            ctxB.strokeStyle = isD ? '#a78bfa' : '#be185d'; ctxB.lineWidth = 1.5;
            ctxB.beginPath(); ctxB.moveTo(0, -14); ctxB.quadraticCurveTo(-8, -26, -12, -28); ctxB.stroke();
            ctxB.beginPath(); ctxB.moveTo(0, -14); ctxB.quadraticCurveTo(8, -26, 12, -28); ctxB.stroke();
            ctxB.restore();
            // Start text
            if (!butterflyActive && score2 === 0 && obstacles.length === 0) {
                ctxB.fillStyle = isD ? '#bae6fd' : '#0369a1'; ctxB.font = 'bold 42px Inter'; ctxB.textAlign = 'center';
                ctxB.fillText(dictionary[currentLang]?.game2_start_title || '¡A volar!', butterflyCanvas.width / 2, butterflyCanvas.height / 2);
            }
            // Slow-mo flash
            if (bSlowMo) { ctxB.fillStyle = `rgba(255,255,255,${0.15 * (bSlowFrames / 12)})`; ctxB.fillRect(0, 0, butterflyCanvas.width, butterflyCanvas.height); }
        }

        function gameOverB() {
            playSound('bonk');
            butterflyActive = false; bSlowMo = false; cancelAnimationFrame(bFrameId);
            let isRecord = false;
            if (score2 > highScore2) { highScore2 = score2; localStorage.setItem('yaire_hs', highScore2); const hs = document.getElementById('game2-highscore'); if (hs) hs.innerText = highScore2; isRecord = true; }
            const ic = document.getElementById('game2-overlay-icon'), tx = document.getElementById('game2-overlay-text'), su = document.getElementById('game2-overlay-sub'), btn = document.getElementById('game2-overlay-btn');
            if (ic) ic.textContent = isRecord ? '🏆' : '💥';
            if (su) su.textContent = isRecord ? (dictionary[currentLang].game2_over_title_win || '¡Récord histórico!') : (dictionary[currentLang].game2_over_title_lose || 'Vuelve a intentarlo.');
            if (tx) tx.innerHTML = (dictionary[currentLang].game2_gameover || 'Tulipanes: {score}').replace('{score}', score2);
            if (btn) btn.textContent = dictionary[currentLang].game_restart || 'Intentar de nuevo';
            showGameOverlay('game2-overlay');
        }

        // ════════════════════════════════════════════════════
        //  GAME 3 — CARTAS OCULTAS (Enhanced Memory)
        // ════════════════════════════════════════════════════
        let game3Active = false, game3Timer = null, game3TimeLeft = 60, game3Moves = 0;
        let game3Cards = [], flippedCards = [], matchedPairs = 0, g3Streak = 0, g3LastMatch = false;
        const totalPairs = 8;
        const emojis = ['🌷', '🦋', '🌻', '✨', '💖', '💍', '🧸', '🍓'];

        function initMemoryBoard() {
            const board = document.getElementById('memory-board');
            if (!board) return;
            board.innerHTML = '';
            let cards = [...emojis, ...emojis];
            cards.sort(() => Math.random() - 0.5);
            game3Cards = cards;
            for (let i = 0; i < cards.length; i++) {
                const div = document.createElement('div');
                div.className = 'mem-card';
                div.setAttribute('data-index', i);
                div.onclick = function () { flipMemoryCard(this, i); };
                div.innerHTML = `<div class="mem-card-inner"><div class="mem-card-face mem-card-front"><span class="text-2xl md:text-3xl text-purple-400/60 dark:text-purple-500/50">✦</span></div><div class="mem-card-face mem-card-back"><span class="text-3xl md:text-4xl">${cards[i]}</span></div></div>`;
                board.appendChild(div);
            }
        }

        function startMemoryGame() {
            if (game3Active) return;
            AudioManager.play('juego.wav', 0.8);
            game3Active = true; game3TimeLeft = 60; game3Moves = 0; flippedCards = []; matchedPairs = 0; g3Streak = 0; g3LastMatch = false;
            document.getElementById('game3-moves').innerText = 0;
            document.getElementById('game3-time').innerText = '60s';
            const sl = document.getElementById('g3-streak-label'), sc = document.getElementById('g3-streak-count');
            if (sl) sl.style.display = 'none'; if (sc) sc.style.display = 'none';
            initMemoryBoard();
            hideGameOverlay('game3-overlay');
            clearInterval(game3Timer);
            game3Timer = setInterval(() => {
                game3TimeLeft--;
                const tEl = document.getElementById('game3-time');
                if (tEl) tEl.innerText = game3TimeLeft + 's';
                // SVG ring
                const ring = document.getElementById('g3-timer-ring');
                if (ring) { const pct = Math.max(0, game3TimeLeft / 60), c = 2 * Math.PI * 24; ring.style.strokeDashoffset = c * (1 - pct); ring.style.stroke = pct > 0.5 ? '#a855f7' : pct > 0.17 ? '#f59e0b' : '#ef4444'; }
                if (game3TimeLeft <= 10) { if (tEl) tEl.style.color = '#ef4444'; playSound('pop'); }
                if (game3TimeLeft <= 0) endGame3(false);
            }, 1000);
        }

        function flipMemoryCard(el, index) {
            if (!game3Active || flippedCards.length >= 2 || el.classList.contains('flipped') || el.classList.contains('matched')) return;
            playSound('flap');
            el.classList.add('flipped');
            flippedCards.push({ el, index });
            if (flippedCards.length === 2) { game3Moves++; document.getElementById('game3-moves').innerText = game3Moves; checkMemoryMatch(); }
        }

        function checkMemoryMatch() {
            const c1 = flippedCards[0], c2 = flippedCards[1];
            if (game3Cards[c1.index] === game3Cards[c2.index]) {
                // Match!
                setTimeout(() => {
                    playSound('magic');
                    c1.el.classList.add('matched'); c2.el.classList.add('matched');
                    // Streak
                    if (g3LastMatch) g3Streak++; else g3Streak = 1;
                    g3LastMatch = true;
                    if (g3Streak >= 2) {
                        const sl = document.getElementById('g3-streak-label'), sc = document.getElementById('g3-streak-count');
                        if (sl) sl.style.display = ''; if (sc) { sc.style.display = ''; sc.textContent = g3Streak; }
                        g3ShowStreak(`🔥 ¡Racha x${g3Streak}!`);
                    }
                    matchedPairs++; flippedCards = [];
                    if (matchedPairs === totalPairs) setTimeout(() => endGame3(true), 400);
                }, 350);
            } else {
                g3LastMatch = false; g3Streak = 0;
                const sl = document.getElementById('g3-streak-label'), sc = document.getElementById('g3-streak-count');
                if (sl) sl.style.display = 'none'; if (sc) sc.style.display = 'none';
                setTimeout(() => {
                    playSound('pop');
                    c1.el.classList.remove('flipped'); c2.el.classList.remove('flipped');
                    flippedCards = [];
                }, 750);
            }
        }

        function g3ShowStreak(text) {
            const wrapper = document.getElementById('game3-wrapper');
            if (!wrapper) return;
            const old = wrapper.querySelector('.streak-banner');
            if (old) old.remove();
            const d = document.createElement('div'); d.className = 'streak-banner'; d.textContent = text;
            wrapper.querySelector('.relative').appendChild(d);
            setTimeout(() => d.remove(), 1500);
        }

        function endGame3(win) {
            clearInterval(game3Timer); game3Active = false;
            const tEl = document.getElementById('game3-time');
            if (tEl) tEl.style.color = '';
            const ic = document.getElementById('game3-overlay-icon'), tx = document.getElementById('game3-overlay-text'), su = document.getElementById('game3-overlay-sub'), btn = document.getElementById('game3-overlay-btn');
            if (win) {
                playSound('magic');
                if (ic) ic.textContent = '🏆';
                if (tx) tx.textContent = dictionary[currentLang].game3_over_title_win || '¡Memoria perfecta!';
            } else {
                playSound('bonk');
                if (ic) ic.textContent = '💥';
                if (tx) tx.textContent = dictionary[currentLang].game3_over_title_lose || 'Inténtalo de nuevo.';
            }
            if (su) { const _gd = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {}; su.innerHTML = (_gd.game3_hud || 'Movimientos: {moves} | Tiempo: {time}s').replace('{moves}', '<strong class="text-purple-500">' + game3Moves + '</strong>').replace('{time}', '<strong class="text-purple-500">' + game3TimeLeft + '</strong>'); }
            if (btn) btn.textContent = dictionary[currentLang].game_restart || "Jugar de nuevo";

            showGameOverlay('game3-overlay');
        }
        // ════════════════════════════════════════════════════
        //  GAME 4 — ADIVINA LA CANCIÓN (Guess the Song)
        // ════════════════════════════════════════════════════
        let game4Active = false, g4Audio = null, g4Timer = null, g4BarRaf = null;
        let g4Rounds = [], g4CurrentRound = 0, g4Score = 0, g4Streak = 0, g4TimeLeft = 15;
        let g4Answered = false, g4ClipTimeout = null, g4RoundStartTime = 0;
        const G4_TOTAL_ROUNDS = 10;
        const G4_CLIP_DURATION = 8; // seconds
        const G4_ROUND_TIME = 15; // seconds per round

        function getG4Tracks() {
            // Use spotlightTracks from the Spotlight Music player
            if (typeof spotlightTracks !== 'undefined' && spotlightTracks.length > 0) return spotlightTracks;
            return [];
        }

        function shuffleArray(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
            return a;
        }

        function setupGuessRounds() {
            const tracks = getG4Tracks();
            if (tracks.length < 4) return [];
            const shuffled = shuffleArray(tracks);
            const selected = shuffled.slice(0, Math.min(G4_TOTAL_ROUNDS, tracks.length));
            return selected.map(correct => {
                // Pick 3 wrong answers (not the correct one)
                const others = tracks.filter(t => t.title !== correct.title);
                const wrongOnes = shuffleArray(others).slice(0, 3);
                const options = shuffleArray([correct, ...wrongOnes]);
                return { correct, options };
            });
        }

        function startGuessGame() {
            AudioManager.play('juego.wav', 0.8);
            hideGameOverlay('game4-overlay');
            g4Rounds = setupGuessRounds();
            if (g4Rounds.length === 0) return;
            g4CurrentRound = 0;
            g4Score = 0;
            g4Streak = 0;
            game4Active = true;
            document.getElementById('g4-score').textContent = '0';
            document.getElementById('g4-streak').textContent = '0';
            document.getElementById('g4-streak-wrap').style.opacity = '0';
            loadGuessRound();
        }

        function loadGuessRound() {
            if (g4CurrentRound >= g4Rounds.length) { endGuessGame(); return; }
            if (g4CurrentRound > 0) AudioManager.play('abrirtusecreto.mp3', 0.5);
            g4Answered = false;
            g4TimeLeft = G4_ROUND_TIME;

            const round = g4Rounds[g4CurrentRound];
            document.getElementById('g4-round').textContent = `${g4CurrentRound + 1}/${g4Rounds.length}`;
            document.getElementById('g4-time').textContent = g4TimeLeft + 's';

            // Reset timer ring
            const ring = document.getElementById('g4-timer-ring');
            if (ring) { ring.style.transition = 'none'; ring.setAttribute('stroke-dashoffset', '0'); ring.style.stroke = '#10b981'; }

            // Show listening indicator (no interactive button)
            const playBtn = document.getElementById('g4-play-btn');
            if (playBtn) {
                playBtn.innerHTML = '<svg class="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14V8l6 4-6 4z"/></svg>';
                playBtn.disabled = true;
                playBtn.classList.add('opacity-70', 'cursor-default', 'animate-pulse');
            }
            const hint = document.getElementById('g4-play-hint');
            const _gd = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {};
            if (hint) hint.textContent = _gd.game4_listening || 'Escuchando...';

            // Build option buttons (disabled during clip)
            const optionsEl = document.getElementById('g4-options');
            optionsEl.innerHTML = '';
            round.options.forEach((track, i) => {
                const btn = document.createElement('button');
                btn.className = 'g4-opt w-full text-left px-4 py-3 md:py-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 font-semibold text-sm md:text-base transition-all duration-300 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 opacity-50 pointer-events-none';
                btn.innerHTML = `<span class="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-400 shrink-0">${String.fromCharCode(65 + i)}</span><span class="truncate"><strong>${track.title}</strong> <span class="text-zinc-400 dark:text-zinc-500 text-xs ml-1">— ${track.artist}</span></span>`;
                btn.onclick = () => guessAnswer(i);
                btn.id = `g4-opt-${i}`;
                optionsEl.appendChild(btn);
            });

            // Stop previous audio
            if (g4Audio) { g4Audio.pause(); g4Audio.currentTime = 0; }
            clearTimeout(g4ClipTimeout);

            // Create and auto-play audio
            g4Audio = new Audio(round.correct.src);
            g4Audio.volume = 0.7;

            // Reset bar animation to idle then auto-play
            resetG4Bars();
            autoPlayG4Clip();
        }

        function autoPlayG4Clip() {
            if (!game4Active || !g4Audio) return;

            function startClip() {
                const maxStart = Math.max(0, g4Audio.duration - G4_CLIP_DURATION - 1);
                const startPos = Math.random() * maxStart;
                g4Audio.currentTime = startPos;
                g4Audio.play().catch(() => { });

                // Animate bars while playing
                animateG4Bars();

                // Stop clip after duration, THEN start the timer
                clearTimeout(g4ClipTimeout);
                g4ClipTimeout = setTimeout(() => {
                    if (g4Audio && !g4Audio.paused) g4Audio.pause();
                    stopG4Bars();

                    if (!g4Answered && game4Active) {
                        // Now enable options and start timer
                        g4RoundStartTime = Date.now();
                        document.querySelectorAll('.g4-opt').forEach(b => {
                            b.classList.remove('opacity-50', 'pointer-events-none');
                        });
                        const playBtn = document.getElementById('g4-play-btn');
                        if (playBtn) {
                            playBtn.innerHTML = '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
                            playBtn.classList.remove('animate-pulse', 'opacity-70');
                            playBtn.classList.add('opacity-50', 'cursor-default');
                        }
                        const hint = document.getElementById('g4-play-hint');
                        const _gd = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {};
                        if (hint) hint.textContent = _gd.game4_choose || '¡Elige tu respuesta!';

                        startG4Timer();
                    }
                }, G4_CLIP_DURATION * 1000);
            }

            // Wait for audio metadata to load
            g4Audio.addEventListener('loadedmetadata', function onMeta() {
                g4Audio.removeEventListener('loadedmetadata', onMeta);
                startClip();
            }, { once: true });

            // If already loaded
            if (g4Audio.readyState >= 2) {
                startClip();
            } else {
                g4Audio.load();
            }
        }

        // Keep playGuessClip for backward compat but it's no longer needed
        function playGuessClip() { }

        function guessAnswer(idx) {
            if (!game4Active || g4Answered) return;
            g4Answered = true;
            clearInterval(g4Timer);
            clearTimeout(g4ClipTimeout);
            if (g4Audio) g4Audio.pause();
            stopG4Bars();

            const round = g4Rounds[g4CurrentRound];
            const chosen = round.options[idx];
            const isCorrect = chosen.title === round.correct.title;
            const correctIdx = round.options.findIndex(o => o.title === round.correct.title);

            // Calculate speed bonus
            const elapsed = (Date.now() - g4RoundStartTime) / 1000;
            let points = 0;

            if (isCorrect) {
                points = 100;
                const speedBonus = Math.max(0, Math.round(50 * (1 - elapsed / G4_ROUND_TIME)));
                points += speedBonus;
                g4Score += points;
                g4Streak++;

                AudioManager.play('celebration.wav', 0.7);

                // Highlight correct
                const btn = document.getElementById(`g4-opt-${idx}`);
                if (btn) {
                    btn.classList.add('border-emerald-500', 'bg-emerald-50', 'dark:bg-emerald-900/30', 'ring-2', 'ring-emerald-500/50');
                    btn.querySelector('span:first-child').classList.add('bg-emerald-500', 'text-white');
                    btn.querySelector('span:first-child').classList.remove('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-400');
                    // Show points
                    const ptSpan = document.createElement('span');
                    ptSpan.className = 'ml-auto text-emerald-500 font-black text-sm animate-pulse';
                    ptSpan.textContent = `+${points}`;
                    btn.appendChild(ptSpan);
                }

                // Update streak
                if (g4Streak >= 2) {
                    document.getElementById('g4-streak-wrap').style.opacity = '1';
                    document.getElementById('g4-streak').textContent = g4Streak;
                    if (g4Streak >= 3) AudioManager.play('clickgirasol.wav', 0.5);
                }
            } else {
                g4Streak = 0;
                AudioManager.play('incorrect.wav', 0.6);
                document.getElementById('g4-streak-wrap').style.opacity = '0';

                // Highlight wrong
                const wrongBtn = document.getElementById(`g4-opt-${idx}`);
                if (wrongBtn) {
                    wrongBtn.classList.add('border-red-500', 'bg-red-50', 'dark:bg-red-900/20', 'text-red-500');
                    wrongBtn.querySelector('span:first-child').classList.add('bg-red-500', 'text-white');
                    wrongBtn.querySelector('span:first-child').classList.remove('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-400');
                }
                // Show correct answer
                const correctBtn = document.getElementById(`g4-opt-${correctIdx}`);
                if (correctBtn) {
                    correctBtn.classList.add('border-emerald-500', 'bg-emerald-50', 'dark:bg-emerald-900/30');
                    correctBtn.querySelector('span:first-child').classList.add('bg-emerald-500', 'text-white');
                    correctBtn.querySelector('span:first-child').classList.remove('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-400');
                }
            }

            // Disable all buttons
            document.querySelectorAll('.g4-opt').forEach(b => { b.disabled = true; b.classList.add('pointer-events-none'); });

            // Update score
            document.getElementById('g4-score').textContent = g4Score;

            // Next round after delay
            g4CurrentRound++;
            setTimeout(() => {
                if (game4Active) loadGuessRound();
            }, 1800);
        }

        function startG4Timer() {
            clearInterval(g4Timer);
            const ring = document.getElementById('g4-timer-ring');
            const CIRCUMFERENCE = 150.8;

            g4Timer = setInterval(() => {
                g4TimeLeft--;
                document.getElementById('g4-time').textContent = g4TimeLeft + 's';

                // Animate ring
                if (ring) {
                    const progress = 1 - (g4TimeLeft / G4_ROUND_TIME);
                    ring.style.transition = 'stroke-dashoffset 0.9s linear, stroke 0.3s';
                    ring.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE * progress));
                    if (g4TimeLeft <= 5) { ring.style.stroke = '#ef4444'; AudioManager.play('sliderbajo.wav', 0.25); }
                    else if (g4TimeLeft <= 8) ring.style.stroke = '#f59e0b';
                }

                if (g4TimeLeft <= 0) {
                    // Time's up — treat as wrong answer
                    g4Answered = true;
                    clearInterval(g4Timer);
                    clearTimeout(g4ClipTimeout);
                    if (g4Audio) g4Audio.pause();
                    stopG4Bars();
                    g4Streak = 0;
                    document.getElementById('g4-streak-wrap').style.opacity = '0';

                    AudioManager.play('perdergirasol.wav', 0.5);

                    // Show correct answer
                    const round = g4Rounds[g4CurrentRound];
                    const correctIdx = round.options.findIndex(o => o.title === round.correct.title);
                    const correctBtn = document.getElementById(`g4-opt-${correctIdx}`);
                    if (correctBtn) {
                        correctBtn.classList.add('border-emerald-500', 'bg-emerald-50', 'dark:bg-emerald-900/30', 'animate-pulse');
                        correctBtn.querySelector('span:first-child').classList.add('bg-emerald-500', 'text-white');
                        correctBtn.querySelector('span:first-child').classList.remove('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-400');
                    }
                    document.querySelectorAll('.g4-opt').forEach(b => { b.disabled = true; b.classList.add('pointer-events-none'); });

                    g4CurrentRound++;
                    setTimeout(() => { if (game4Active) loadGuessRound(); }, 1800);
                }
            }, 1000);
        }

        function animateG4Bars() {
            const bars = document.querySelectorAll('.g4-bar');
            function animate() {
                bars.forEach(bar => {
                    bar.style.height = (20 + Math.random() * 80) + '%';
                    bar.style.opacity = (0.4 + Math.random() * 0.6);
                });
                g4BarRaf = requestAnimationFrame(() => setTimeout(() => animate(), 100));
            }
            animate();
        }

        function stopG4Bars() {
            cancelAnimationFrame(g4BarRaf);
            g4BarRaf = null;
            document.querySelectorAll('.g4-bar').forEach(bar => {
                bar.style.height = (15 + Math.random() * 25) + '%';
                bar.style.opacity = '0.3';
            });
        }

        function resetG4Bars() {
            cancelAnimationFrame(g4BarRaf);
            g4BarRaf = null;
            const heights = [20, 45, 70, 90, 60, 100, 75, 55, 85, 40, 65, 95, 50, 30, 70, 80, 45, 60];
            document.querySelectorAll('.g4-bar').forEach((bar, i) => {
                bar.style.height = (heights[i] || 40) + '%';
                bar.style.opacity = '';
            });
        }

        function endGuessGame() {
            game4Active = false;
            clearInterval(g4Timer);
            clearTimeout(g4ClipTimeout);
            if (g4Audio) { g4Audio.pause(); g4Audio = null; }
            stopG4Bars();

            const total = g4Rounds.length * 150; // max possible score
            const pct = Math.round((g4Score / total) * 100);
            const _gd = (typeof dictionary !== 'undefined' && dictionary[currentLang]) ? dictionary[currentLang] : {};

            const ic = document.getElementById('game4-overlay-icon');
            const tx = document.getElementById('game4-overlay-text');
            const su = document.getElementById('game4-overlay-sub');
            const btn = document.getElementById('game4-overlay-btn');

            if (pct >= 70) {
                if (ic) ic.textContent = '🏆';
                if (tx) tx.textContent = _gd.game4_over_great || '¡Eres DJ oficial!';
                AudioManager.play('revelacion.wav', 0.7);
            } else if (pct >= 40) {
                if (ic) ic.textContent = '🎶';
                if (tx) tx.textContent = _gd.game4_over_good || '¡Nada mal!';
                AudioManager.play('secret.wav', 0.6);
            } else {
                if (ic) ic.textContent = '🎧';
                if (tx) tx.textContent = _gd.game4_over_bad || 'A escuchar más música…';
                AudioManager.play('perdergirasol.wav', 0.5);
            }

            if (su) su.innerHTML = (_gd.game4_over_sub || 'Puntuación: <strong class="text-emerald-500">{score}</strong> puntos').replace('{score}', g4Score);
            if (btn) btn.textContent = _gd.game_restart || '¡Jugar de nuevo!';
            showGameOverlay('game4-overlay');
        }

        function cleanupGuessGame() {
            game4Active = false;
            clearInterval(g4Timer); g4Timer = null;
            clearTimeout(g4ClipTimeout);
            if (g4Audio) { g4Audio.pause(); g4Audio = null; }
            stopG4Bars();
            g4CurrentRound = 0; g4Score = 0; g4Streak = 0;
        }

        function initChart() {
            const ctxE = document.getElementById('timeChart');
            if (!ctxE || chartInstance) return;

            const renderChart = () => {
                if (!window.Chart || chartInstance) return;
                const ctx = ctxE.getContext('2d');
                const isD = document.documentElement.classList.contains('dark');
                const dict = dictionary[currentLang] || dictionary['es'];
                chartInstance = new Chart(ctx, { type: 'doughnut', data: { labels: dict.chart_labels || dictionary['es'].chart_labels, datasets: [{ label: dict.chart_dataset || dictionary['es'].chart_dataset, data: [10, 15, 20, 55], backgroundColor: ['#e4e4e7', '#fbcfe8', '#f59e0b', '#ec4899'], borderColor: 'transparent', borderWidth: 0, hoverOffset: 8 }] }, options: { responsive: true, maintainAspectRatio: false, layout: { padding: 10 }, plugins: { legend: { position: 'bottom', labels: { color: isD ? '#a1a1aa' : '#52525b', font: { family: "'Inter', sans-serif", size: 12 }, padding: 15, usePointStyle: true, pointStyle: 'circle' } }, tooltip: { backgroundColor: 'rgba(24, 24, 27, 0.9)', titleFont: { family: "'Inter', sans-serif", size: 14, weight: 'bold' }, bodyFont: { family: "'Inter', sans-serif", size: 13 }, padding: 12, cornerRadius: 12, displayColors: false, callbacks: { label: function (c) { return c.label + ': ' + c.parsed + '%'; } } } }, cutout: '75%', animation: { animateScale: true, animateRotate: true, duration: window.__PERF_LITE__ ? 600 : 1500, easing: 'easeOutQuart' } } });
            };

            const loadAndRender = () => {
                if (window.Chart) {
                    renderChart();
                    return;
                }
                if (!window.__loadScriptOnce) return;
                window.__loadScriptOnce('https://cdn.jsdelivr.net/npm/chart.js', { crossorigin: 'anonymous' }).then(renderChart).catch(() => { });
            };

            if ('IntersectionObserver' in window) {
                const chartObserver = new IntersectionObserver((entries) => {
                    if (!entries.some(entry => entry.isIntersecting)) return;
                    chartObserver.disconnect();
                    loadAndRender();
                }, { rootMargin: '300px 0px', threshold: 0.01 });
                chartObserver.observe(ctxE);
            } else if (window.__runWhenIdle) {
                window.__runWhenIdle(loadAndRender, 4000);
            } else {
                setTimeout(loadAndRender, 1200);
            }
        }
document.addEventListener("DOMContentLoaded", () => {
            if (typeof initRouletteSlot === 'function') initRouletteSlot();
            initCinemascopeHold();
        });

        function initCinemascopeHold() {
            const btn = document.getElementById('cs-hold-btn');
            const circle = document.getElementById('cs-hold-circle-val');
            const icon = document.getElementById('cs-hold-icon');
            const label = document.getElementById('cs-hold-label');
            const sub = document.getElementById('cs-hold-sub');
            if (!btn || !circle) return;

            let holdTimer = null;
            let startTime = 0;
            const HOLD_DURATION = 3000;
            const CIRCUMFERENCE = 691;
            let unlocked = false;

            window.__csResetHold = () => {
                unlocked = false;
                if (icon) icon.textContent = '🔒';
                if (label) label.textContent = 'Juramento V';
                if (sub) sub.textContent = 'Mantén 3s para revelar';
                circle.style.strokeDashoffset = CIRCUMFERENCE;
                btn.style.boxShadow = '0 0 40px rgba(0, 0, 0, 0.8)';
                btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                btn.style.transform = 'scale(1)';
            };

            window.__csConfirmSeal = () => {
                unlocked = true;
                if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('gameopen.wav', 1);
                if (icon) icon.textContent = '💖';
                if (label) label.textContent = '¡Juramento Sellado!';
                if (sub) sub.textContent = '28 de Junio 2026';
                btn.style.boxShadow = '0 0 100px rgba(236, 72, 153, 0.6)';
                btn.style.borderColor = '#ec4899';
            };

            function startHold(e) {
                if (unlocked) return;
                if (e.cancelable && e.type === 'touchstart') e.preventDefault();
                startTime = performance.now();
                if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('magic.wav', 0.5);
                btn.style.boxShadow = '0 0 70px rgba(245, 158, 11, 0.4)';
                btn.style.transform = 'scale(0.96)';

                function loop(now) {
                    const elapsed = now - startTime;
                    const progress = Math.min(1, elapsed / HOLD_DURATION);
                    circle.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);

                    const secondsLeft = Math.ceil((HOLD_DURATION - elapsed) / 1000);
                    if (sub && secondsLeft > 0) sub.textContent = secondsLeft + 's restantes...';

                    if (progress < 1) {
                        holdTimer = requestAnimationFrame(loop);
                    } else {
                        triggerUnlock();
                    }
                }
                holdTimer = requestAnimationFrame(loop);
            }

            function cancelHold() {
                if (unlocked) return;
                if (holdTimer) cancelAnimationFrame(holdTimer);
                holdTimer = null;
                circle.style.strokeDashoffset = CIRCUMFERENCE;
                if (sub) sub.textContent = 'Mantén 3s para revelar';
                btn.style.boxShadow = '0 0 40px rgba(0, 0, 0, 0.8)';
                btn.style.transform = 'scale(1)';
            }

            function triggerUnlock() {
                unlocked = true; // Lock temporarily while modal is open
                if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('magic.wav', 1);
                btn.style.boxShadow = '0 0 80px rgba(245, 158, 11, 0.8)';
                btn.style.borderColor = '#f59e0b';
                if (sub) sub.textContent = 'Abriendo Bóveda...';

                if (window.__loadConfetti) {
                    window.__loadConfetti().then(confetti => {
                        if (confetti) confetti({ particleCount: 250, spread: 120, origin: { y: 0.6 }, colors: ['#f59e0b', '#ec4899', '#fbbf24', '#ffffff'], zIndex: 99999 });
                    });
                }
                showCinemascopeRewardModal();
            }

            btn.addEventListener('mousedown', startHold);
            btn.addEventListener('touchstart', startHold, { passive: false });
            window.addEventListener('mouseup', cancelHold);
            btn.addEventListener('mouseleave', cancelHold);
            window.addEventListener('touchend', cancelHold);
            window.addEventListener('touchcancel', cancelHold);
        }

        function showCinemascopeRewardModal() {
            if (document.getElementById('cs-reward-modal')) return;
            const m = document.createElement('div');
            m.id = 'cs-reward-modal';
            m.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl overflow-y-auto';
            m.style.opacity = '0';
            m.innerHTML = `
                  <div id="cs-modal-card" class="bg-zinc-950/80 backdrop-blur-3xl border border-amber-500/20 p-6 sm:p-8 rounded-[2rem] max-w-lg sm:max-w-2xl w-full max-h-[85vh] flex flex-col justify-between my-auto text-center shadow-[0_0_100px_rgba(245,158,11,0.15)] relative overflow-hidden transform-gpu">
                      
                      <!-- Decorative Orbs -->
                      <div class="absolute -right-32 -top-32 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
                      <div class="absolute -left-32 -bottom-32 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse" style="animation-delay: 2s;"></div>
                      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-black/40 to-black/90 pointer-events-none z-0"></div>
                      
                      <button onclick="closeCinemascopeModal(false)" class="absolute top-4 right-4 sm:top-5 sm:right-5 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all z-20 text-xs shadow-md" title="Cancelar y no sellar (Esc)">✕</button>
  
                      <div class="relative z-10 flex-shrink-0 mt-6">
                          <div class="inline-flex flex-wrap justify-center items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-amber-500/10 border border-amber-500/30 text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] text-amber-300 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                              <span>✦ Pacto Sellado: 10 Feb 2026 (11:13 PM) ✦ Te Amo #1,034</span>
                          </div>
                          
                          <div class="relative inline-block mb-3">
                              <div class="text-4xl sm:text-5xl select-none">🌷</div>
                              <div class="absolute inset-0 bg-pink-500/20 blur-xl rounded-full"></div>
                          </div>
                          
                          <h3 class="text-2xl sm:text-3xl md:text-4xl font-black text-amber-400 mb-2 tracking-tight">El Juramento de 5 Meses</h3>
                          <div class="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-4"></div>
                      </div>
                      
                      <div class="relative z-10 flex-1 overflow-y-auto text-left bg-black/40 backdrop-blur-md border border-white/5 p-5 sm:p-7 rounded-2xl my-2 space-y-4 font-serif text-sm sm:text-base text-zinc-200/90 leading-relaxed custom-scrollbar shadow-inner">
                          <p class="italic text-amber-300/90 text-base sm:text-lg tracking-wide font-medium">"Mi amada Yaire,</p>
                          
                          <p class="first-letter:text-4xl first-letter:font-bold first-letter:text-amber-400 first-letter:mr-1 first-letter:float-left">Hoy, 28 de junio, sellamos nuestro quinto mes oficial. Cinco meses desde que nuestros mundos colisionaron para nunca más separarse. Parece que fue ayer cuando una simple conversación encendió una chispa, y hoy esa chispa es el fuego que abriga mis madrugadas y le da sentido a cada uno de mis días.</p>
                          
                          <p>Quiero que sepas que la distancia física entre nosotros es solo un espejismo; mi alma está entrelazada con la tuya a cada segundo que pasa. Cada línea de código de este santuario virtual, cada detalle que preparo minuciosamente para ti, lo hago pensando en la curva de tu sonrisa, en la calidez de tu voz y en la luz inagotable de tu mirada.</p>
                          
                          <p>Eres mi paz absoluta en medio del caos, mi musa eterna y el amor de mi vida. Hemos superado tormentas, océanos de kilómetros y madrugadas de insomnio, pero si de algo estoy seguro hoy, es de que cada obstáculo solo ha forjado nuestro vínculo hasta convertirlo en titanio puro.</p>
                          
                          <p>Cinco meses se sienten como un suspiro, pero son solo el hermoso prólogo de nuestra historia. Estoy listo para construir los siglos enteros que nos esperan, para borrar la distancia de una vez por todas y para amanecer abrazado a ti todos los días que me queden de vida.</p>
                          
                          <p class="font-medium text-amber-100">Te amo con cada latido, cada aliento y cada pensamiento que habita en mí."</p>
                          
                          <div class="pt-4 border-t border-white/5 mt-4">
                              <p class="text-right font-bold text-amber-400 text-xs sm:text-sm tracking-[0.15em] uppercase">— Siempre tuyo, Charles Gustav 💖</p>
                          </div>
                      </div>
  
                      <div class="relative z-10 flex-shrink-0 mt-5">
                          <button onclick="closeCinemascopeModal(true)" class="w-full py-4 sm:py-4 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-amber-500 text-black font-black text-xs sm:text-sm tracking-[0.2em] uppercase hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(236,72,153,0.6)] bg-[length:200%_auto] animate-gradient">
                              Guardar Juramento en mi Alma
                          </button>
                      </div>
                  </div>`;

            // Click outside backdrop to close WITHOUT sealing
            m.addEventListener('click', (e) => {
                if (e.target === m) closeCinemascopeModal(false);
            });

            document.body.appendChild(m);

            // GSAP Jaw-Dropping 3D Entrance Animation
            if (typeof gsap !== 'undefined') {
                const card = document.getElementById('cs-modal-card');
                gsap.set(card, { scale: 0.7, opacity: 0, y: 50, rotationX: 12 });
                gsap.to(m, { opacity: 1, duration: 0.3, ease: 'power2.out' });
                gsap.to(card, { scale: 1, opacity: 1, y: 0, rotationX: 0, duration: 0.65, ease: 'back.out(1.6)', delay: 0.05 });
            } else {
                m.style.opacity = '1';
            }

            // Escape key listener (closes WITHOUT sealing)
            window.__csEscHandler = (e) => {
                if (e.key === 'Escape') closeCinemascopeModal(false);
            };
            window.addEventListener('keydown', window.__csEscHandler);
        }

        window.closeCinemascopeModal = function (confirmSeal) {
            const m = document.getElementById('cs-reward-modal');
            if (!m) return;
            if (window.__csEscHandler) {
                window.removeEventListener('keydown', window.__csEscHandler);
                window.__csEscHandler = null;
            }

            function finish() {
                m.remove();
                if (confirmSeal === true) {
                    if (window.__csConfirmSeal) window.__csConfirmSeal();
                } else {
                    if (window.__csResetHold) window.__csResetHold();
                }
            }

            if (typeof gsap !== 'undefined') {
                const card = document.getElementById('cs-modal-card');
                gsap.to(card, { scale: 0.85, opacity: 0, y: 20, duration: 0.25, ease: 'power2.in' });
                gsap.to(m, { opacity: 0, duration: 0.25, ease: 'power2.in', delay: 0.05, onComplete: finish });
            } else {
                finish();
            }
        };
    
        // ═══ CINEMASCOPE VI — HOLD TO UNLOCK OATH VI ═══
        (function initCinemascopeVIHold() {
            const btn6 = document.getElementById('cs6-hold-btn');
            const circle6 = document.getElementById('cs6-hold-circle-val');
            const icon6 = document.getElementById('cs6-hold-icon');
            const label6 = document.getElementById('cs6-hold-label');
            const sub6 = document.getElementById('cs6-hold-sub');
            const oath6 = document.getElementById('cs6-oath');
            if (!btn6 || !circle6) return;

            let holdTimer6 = null;
            let startTime6 = 0;
            const HOLD_DURATION6 = 3000;
            const CIRCUMFERENCE6 = 691;
            let unlocked6 = false;

            function startHold6(e) {
                if (unlocked6) return;
                if (e.cancelable && e.type === 'touchstart') e.preventDefault();
                startTime6 = performance.now();
                if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('magic.wav', 0.5);
                btn6.style.boxShadow = '0 0 70px rgba(245, 158, 11, 0.4)';
                btn6.style.transform = 'scale(0.96)';

                function loop6(now) {
                    var elapsed = now - startTime6;
                    var progress = Math.min(1, elapsed / HOLD_DURATION6);
                    circle6.style.strokeDashoffset = CIRCUMFERENCE6 * (1 - progress);
                    var secondsLeft = Math.ceil((HOLD_DURATION6 - elapsed) / 1000);
                    if (sub6 && secondsLeft > 0) sub6.textContent = secondsLeft + 's restantes...';
                    if (progress < 1) {
                        holdTimer6 = requestAnimationFrame(loop6);
                    } else {
                        triggerUnlock6();
                    }
                }
                holdTimer6 = requestAnimationFrame(loop6);
            }

            function cancelHold6() {
                if (unlocked6) return;
                if (holdTimer6) cancelAnimationFrame(holdTimer6);
                holdTimer6 = null;
                circle6.style.strokeDashoffset = CIRCUMFERENCE6;
                if (sub6) sub6.textContent = 'Mantén 3s para revelar';
                btn6.style.boxShadow = '0 0 40px rgba(0, 0, 0, 0.8)';
                btn6.style.transform = 'scale(1)';
            }

            function triggerUnlock6() {
                unlocked6 = true;
                if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('gameopen.wav', 1);
                if (icon6) icon6.textContent = '🏆';
                if (label6) label6.textContent = '¡Juramento Sellado!';
                if (sub6) sub6.textContent = '28 de Julio 2026 — Medio Año';
                btn6.style.boxShadow = '0 0 100px rgba(245, 158, 11, 0.8)';
                btn6.style.borderColor = '#f59e0b';

                if (window.__loadConfetti) {
                    window.__loadConfetti().then(function(confetti) {
                        if (confetti) confetti({ particleCount: 350, spread: 140, origin: { y: 0.6 }, colors: ['#f59e0b', '#ec4899', '#fbbf24', '#ffffff', '#a78bfa'], zIndex: 99999 });
                    });
                }

                // Reveal the oath inline with GSAP
                if (oath6) {
                    oath6.style.display = 'block';
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(oath6, { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' });
                    } else {
                        oath6.style.opacity = '1';
                    }
                    setTimeout(function() { oath6.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 400);
                }
            }

            btn6.addEventListener('mousedown', startHold6);
            btn6.addEventListener('touchstart', startHold6, { passive: false });
            window.addEventListener('mouseup', cancelHold6);
            btn6.addEventListener('mouseleave', cancelHold6);
            window.addEventListener('touchend', cancelHold6);
            window.addEventListener('touchcancel', cancelHold6);
        })();
// ═══════════════════════════════════════════════════════════════
        // MOBILE SWIPE NAVIGATION SYSTEM
        // ═══════════════════════════════════════════════════════════════
        (function () {
            'use strict';

            // Check if device is mobile + has touch
            function isMobileDevice() {
                return window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
            }

            if (!isMobileDevice()) {
                // Also listen for resize in case orientation changes
                window.addEventListener('resize', function () {
                    if (isMobileDevice() && !window._swipeInitialized) {
                        initAllSwipe();
                    }
                });
                return;
            }

            window._swipeInitialized = true;
            initAllSwipe();

            function initAllSwipe() {

                // ──────────────────────────────────────────────────
                // UTILITY: Generic swipe detector
                // ──────────────────────────────────────────────────
                function attachSwipe(el, onLeft, onRight, opts) {
                    if (!el) return;
                    opts = opts || {};
                    var threshold = opts.threshold || 50;
                    var startX = 0, startY = 0;

                    el.addEventListener('touchstart', function (e) {
                        var t = e.changedTouches[0];
                        startX = t.pageX;
                        startY = t.pageY;
                    }, { passive: true });

                    el.addEventListener('touchend', function (e) {
                        var t = e.changedTouches[0];
                        var dx = t.pageX - startX;
                        var dy = t.pageY - startY;

                        // Only trigger if horizontal swipe is dominant
                        if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.3) {
                            if (dx < 0) {
                                onLeft();
                            } else {
                                onRight();
                            }
                        }
                    }, { passive: true });
                }

                // ──────────────────────────────────────────────────
                // UTILITY: Create dot indicators
                // ──────────────────────────────────────────────────
                function createDots(container, count, activeIndex, onDotClick, extraClass) {
                    // Remove existing dots
                    var existing = container.querySelector('.swipe-dots' + (extraClass ? '.' + extraClass : ''));
                    if (existing) existing.remove();

                    var dotsWrap = document.createElement('div');
                    dotsWrap.className = 'swipe-dots' + (extraClass ? ' ' + extraClass : '');

                    for (var i = 0; i < count; i++) {
                        var dot = document.createElement('button');
                        dot.className = 'swipe-dot' + (i === activeIndex ? ' active' : '');
                        dot.setAttribute('aria-label', 'Ir a ' + (i + 1));
                        dot.dataset.idx = i;
                        dot.addEventListener('click', function () {
                            onDotClick(parseInt(this.dataset.idx));
                        });
                        dotsWrap.appendChild(dot);
                    }

                    container.appendChild(dotsWrap);
                    return dotsWrap;
                }

                function updateDots(dotsWrap, activeIndex) {
                    if (!dotsWrap) return;
                    var dots = dotsWrap.querySelectorAll('.swipe-dot');
                    dots.forEach(function (d, i) {
                        d.classList.toggle('active', i === activeIndex);
                    });
                }

                // Remove animation classes utility
                function clearSwipeAnims(el) {
                    el.classList.remove('swipe-anim-left-in', 'swipe-anim-right-in',
                        'swipe-anim-left-out', 'swipe-anim-right-out',
                        'paleta-view-swipe-left', 'paleta-view-swipe-right',
                        'rcp-swipe-left-in', 'rcp-swipe-right-in');
                }

                // ==============================================================
                // 1. PALETA DE YAIRE — View Tabs (Grid ↔ Lista ↔ Mezclador)
                // ==============================================================
                (function () {
                    var views = ['grid', 'list', 'mixer'];
                    var viewContainerIds = ['view-grid2', 'view-list2', 'view-mixer2'];
                    var currentView = 0;

                    var section = document.getElementById('colores-yaire');
                    if (!section) return;

                    // Find the toggle buttons wrapper
                    var toggleWrap = section.querySelector('.pvbtn-wrap');
                    if (!toggleWrap) return;

                    // Add translatable hint only (no dots)
                    var dotsContainer = toggleWrap.parentElement;
                    var hint = document.createElement('div');
                    hint.className = 'swipe-hint';
                    hint.setAttribute('data-i18n', 'pal_swipe_hint');
                    hint.textContent = (typeof dictionary !== 'undefined' && dictionary[currentLang] && dictionary[currentLang].pal_swipe_hint) || 'Desliza para cambiar vista';
                    dotsContainer.appendChild(hint);

                    // Track current view by intercepting setPV
                    var _origSetPV = window.setPV;
                    window.setPV = function (v) {
                        _origSetPV(v);
                        var idx = views.indexOf(v);
                        if (idx !== -1) currentView = idx;
                    };

                    function goToView(idx, direction) {
                        if (idx < 0 || idx >= views.length || idx === currentView) return;

                        var dir = direction || (idx > currentView ? 'left' : 'right');
                        currentView = idx;
                        setPV(views[currentView]);

                        // Apply animation to new active container
                        var activeContainer = document.getElementById(viewContainerIds[currentView]);
                        if (activeContainer && !activeContainer.classList.contains('hidden')) {
                            clearSwipeAnims(activeContainer);
                            void activeContainer.offsetWidth;
                            activeContainer.classList.add(dir === 'left' ? 'paleta-view-swipe-left' : 'paleta-view-swipe-right');
                            activeContainer.addEventListener('animationend', function handler() {
                                clearSwipeAnims(activeContainer);
                                activeContainer.removeEventListener('animationend', handler);
                            });
                        }
                    }

                    // Attach swipe to the whole section
                    var headerArea = section.querySelector('.max-w-6xl');
                    if (headerArea) {
                        attachSwipe(headerArea,
                            function () { goToView(currentView + 1, 'left'); },
                            function () { goToView(currentView - 1, 'right'); }
                        );
                    }
                })();


                // ==============================================================
                // 2. PALETA DE YAIRE — Color Modal Swipe (inside paleta-modal)
                // ==============================================================
                (function () {
                    var colorKeys = ['verde', 'rojo', 'rosa', 'morado'];
                    var colorDotColors = ['#10B981', '#F43F5E', '#EC4899', '#8B5CF6'];
                    var currentColorIdx = 0;
                    var isSwipeTransitioning = false;

                    var modal = document.getElementById('paleta-modal');
                    if (!modal) return;

                    var panel = modal.querySelector('.paleta-modal-panel');

                    // Create dots only (no hint text) inside the modal panel
                    var dotsWrap = document.createElement('div');
                    dotsWrap.className = 'paleta-modal-swipe-dots';
                    dotsWrap.style.paddingBottom = '12px';
                    for (var i = 0; i < colorKeys.length; i++) {
                        var dot = document.createElement('button');
                        dot.className = 'swipe-dot' + (i === 0 ? ' active' : '');
                        dot.style.background = colorDotColors[i];
                        dot.setAttribute('aria-label', colorKeys[i]);
                        dot.dataset.idx = i;
                        dot.addEventListener('click', function () {
                            goToColor(parseInt(this.dataset.idx));
                        });
                        dotsWrap.appendChild(dot);
                    }

                    // Insert dots at the bottom of the panel
                    if (panel) {
                        panel.appendChild(dotsWrap);
                    }

                    function updateColorDots(idx) {
                        var dots = dotsWrap.querySelectorAll('.swipe-dot');
                        dots.forEach(function (d, i) {
                            if (i === idx) {
                                d.classList.add('active');
                                d.style.background = colorDotColors[i];
                                d.style.boxShadow = '0 0 10px ' + colorDotColors[i] + '80';
                            } else {
                                d.classList.remove('active');
                                d.style.background = colorDotColors[i];
                                d.style.boxShadow = 'none';
                            }
                        });
                    }

                    function goToColor(idx, direction) {
                        if (idx < 0 || idx >= colorKeys.length || idx === currentColorIdx) return;
                        if (isSwipeTransitioning) return;

                        isSwipeTransitioning = true;
                        var dir = direction || (idx > currentColorIdx ? 'left' : 'right');
                        currentColorIdx = idx;

                        // Animate the scrollable content area only (not the whole panel)
                        var scrollContent = panel ? panel.querySelector('.p-6.overflow-y-auto, [class*="overflow-y-auto"]') : null;
                        var headerContent = panel ? panel.querySelector('.p-6.border-b, [class*="border-b"]') : null;

                        // Fade out content briefly
                        if (scrollContent) scrollContent.style.opacity = '0';
                        if (headerContent) headerContent.style.opacity = '0';

                        setTimeout(function () {
                            // Switch color content using the original function
                            _origOpenPaleta(colorKeys[currentColorIdx]);
                            updateColorDots(currentColorIdx);

                            // Fade back in with slight slide
                            if (headerContent) {
                                headerContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                                headerContent.style.transform = 'translateX(' + (dir === 'left' ? '30px' : '-30px') + ')';
                                headerContent.style.opacity = '0';
                                void headerContent.offsetWidth;
                                headerContent.style.transform = 'translateX(0)';
                                headerContent.style.opacity = '1';
                            }
                            if (scrollContent) {
                                scrollContent.style.transition = 'opacity 0.35s ease 0.05s, transform 0.35s ease 0.05s';
                                scrollContent.style.transform = 'translateX(' + (dir === 'left' ? '30px' : '-30px') + ')';
                                scrollContent.style.opacity = '0';
                                void scrollContent.offsetWidth;
                                scrollContent.style.transform = 'translateX(0)';
                                scrollContent.style.opacity = '1';
                            }

                            setTimeout(function () {
                                isSwipeTransitioning = false;
                                // Clean up inline styles
                                if (headerContent) { headerContent.style.transition = ''; headerContent.style.transform = ''; }
                                if (scrollContent) { scrollContent.style.transition = ''; scrollContent.style.transform = ''; }
                            }, 400);
                        }, 150);
                    }

                    // Track which color was opened via the original function
                    var _origOpenPaleta = window.pcOpenPaleta;
                    window.pcOpenPaleta = function (key) {
                        var idx = colorKeys.indexOf(key);
                        if (idx !== -1) currentColorIdx = idx;
                        _origOpenPaleta(key);
                        updateColorDots(currentColorIdx);
                    };

                    // Attach swipe to the modal
                    attachSwipe(modal,
                        function () { goToColor(currentColorIdx + 1, 'left'); },
                        function () { goToColor(currentColorIdx - 1, 'right'); }
                    );
                })();


                // ==============================================================
                // 3. RECIPE MODAL — Tab Swipe (Ingredientes ↔ Paso a Paso ↔ Técnica ↔ El Secreto)
                // ==============================================================
                (function () {
                    var tabOrder = ['ing', 'prep', 'tech', 'secret'];
                    var tabBtnIds = ['rtab-ing', 'rtab-prep', 'rtab-tech', 'rtab-secret'];
                    var currentTab = 0;

                    var scrollArea = document.getElementById('recipe-scroll-area');
                    if (!scrollArea) return;

                    // Track current tab
                    var _origSwitch = window.switchRecipeTabNew;

                    window.switchRecipeTabNew = function (tabId, btn) {
                        var idx = tabOrder.indexOf(tabId);
                        if (idx !== -1) currentTab = idx;
                        _origSwitch(tabId, btn);
                    };

                    // Keep old alias
                    window.switchRecipeTab = function (tId, b) { window.switchRecipeTabNew(tId, b); };

                    function goToRecipeTab(idx, direction) {
                        if (idx < 0 || idx >= tabOrder.length || idx === currentTab) return;

                        var dir = direction || (idx > currentTab ? 'left' : 'right');
                        var tabId = tabOrder[idx];
                        var btn = document.getElementById(tabBtnIds[idx]);

                        currentTab = idx;

                        // Call the original function to switch tabs
                        _origSwitch(tabId, btn);

                        // Apply swipe animation to the pane
                        var pane = document.getElementById('rpane-' + tabId);
                        if (pane) {
                            // Remove default animation
                            pane.classList.remove('rcp-tab-enter');
                            clearSwipeAnims(pane);
                            void pane.offsetWidth;
                            pane.classList.add(dir === 'left' ? 'rcp-swipe-left-in' : 'rcp-swipe-right-in');

                            pane.addEventListener('animationend', function handler() {
                                clearSwipeAnims(pane);
                                pane.removeEventListener('animationend', handler);
                            });
                        }

                        // Scroll the tab button into view
                        if (btn) {
                            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                        }

                        // Scroll content area to top
                        scrollArea.scrollTop = 0;
                    }

                    attachSwipe(scrollArea,
                        function () { goToRecipeTab(currentTab + 1, 'left'); },  // swipe left → next tab
                        function () { goToRecipeTab(currentTab - 1, 'right'); }  // swipe right → prev tab
                    );
                })();

            } // end initAllSwipe
        })();
(function () {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
            gsap.registerPlugin(ScrollTrigger);

            function initAnimations() {

                // ─── 1. UNIVERSE CAROUSEL SLIDES — fly in from the right ─────
                var univCarousel = document.getElementById('universe-carousel');
                if (univCarousel) {
                    var slides = Array.from(univCarousel.children);
                    gsap.set(slides, { opacity: 0, x: 80, scale: 0.96 });
                    gsap.to(slides, {
                        opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out', stagger: 0.18,
                        scrollTrigger: { trigger: univCarousel, start: 'top 90%', once: true }
                    });
                }

                // ─── 2. SONG CARDS — cascade up ──────────────────────────────
                var songGrid = document.querySelector('#universo .grid');
                if (songGrid) {
                    var songCards = Array.from(songGrid.children);
                    gsap.set(songCards, { opacity: 0, y: 60, scale: 0.94 });
                    gsap.to(songCards, {
                        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.3)', stagger: 0.14,
                        scrollTrigger: { trigger: songGrid, start: 'top 90%', once: true }
                    });
                }

                // ─── 3. TULIP MEANING CARDS — fan out ────────────────────────
                var tulipCards = Array.from(document.querySelectorAll('.tulip-meaning-card'));
                if (tulipCards.length) {
                    var tGrid = tulipCards[0].closest('.grid') || tulipCards[0];
                    gsap.set(tulipCards, { opacity: 0, y: 50, rotationY: -20 });
                    gsap.to(tulipCards, {
                        opacity: 1, y: 0, rotationY: 0, duration: 0.85, ease: 'power3.out', stagger: 0.12,
                        scrollTrigger: { trigger: tGrid, start: 'top 90%', once: true }
                    });
                }

                // ─── 4. YAIRE NAME LETTERS — bounce down from top ────────────
                var nameLetters = Array.from(document.querySelectorAll('.name-letter'));
                if (nameLetters.length) {
                    gsap.set(nameLetters, { opacity: 0, y: -80, scale: 1.4 });
                    gsap.to(nameLetters, {
                        opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.1,
                        scrollTrigger: { trigger: '.name-container', start: 'top 85%', once: true }
                    });
                }

                // ─── 5. PROMISE FLIP CARDS — rise dramatically ───────────────
                var promiseCards = Array.from(document.querySelectorAll('.promise-card-wrap'));
                if (promiseCards.length) {
                    var pGrid = promiseCards[0].closest('.grid') || promiseCards[0];
                    gsap.set(promiseCards, { opacity: 0, y: 80, scale: 0.92 });
                    gsap.to(promiseCards, {
                        opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', stagger: 0.2,
                        scrollTrigger: { trigger: pGrid, start: 'top 90%', once: true }
                    });
                }

                // ─── 6. COLOR PALETTE CARDS — alternate sides ────────────────
                var pcCards = Array.from(document.querySelectorAll('.pc-card'));
                pcCards.forEach(function (card, i) {
                    gsap.set(card, { opacity: 0, x: i % 2 === 0 ? -60 : 60, scale: 0.95 });
                    gsap.to(card, {
                        opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'power2.out',
                        scrollTrigger: { trigger: card, start: 'top 92%', once: true }
                    });
                });

                // ─── 7. TULIP COLOR BUTTONS — pop in with stagger ────────────
                var colorBtns = Array.from(document.querySelectorAll('.tulip-color-btn'));
                if (colorBtns.length) {
                    gsap.set(colorBtns, { opacity: 0, scale: 0.6, y: 20 });
                    gsap.to(colorBtns, {
                        opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2.5)', stagger: 0.06,
                        scrollTrigger: { trigger: '#tulip-color-grid', start: 'top 88%', once: true }
                    });
                }

                // ─── 8. BOARDING PASS — tilt from below ──────────────────────
                var boardingPass = document.getElementById('boarding-pass');
                if (boardingPass) {
                    gsap.set(boardingPass, { opacity: 0, y: 60, rotationX: 6 });
                    gsap.to(boardingPass, {
                        opacity: 1, y: 0, rotationX: 0, duration: 1.1, ease: 'power3.out',
                        scrollTrigger: { trigger: boardingPass, start: 'top 88%', once: true }
                    });
                }

                // ─── 9. HISTORIA / COMIDA / NOMBRE GRID CARDS ────────────────
                ['#nombre .grid > div', '#historia .grid > div', '#comida .grid > div'].forEach(function (sel) {
                    var cards = Array.from(document.querySelectorAll(sel));
                    if (!cards.length) return;
                    var grid = cards[0].closest('.grid');
                    gsap.set(cards, { opacity: 0, y: 40 });
                    gsap.to(cards, {
                        opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', stagger: 0.15,
                        scrollTrigger: { trigger: grid, start: 'top 88%', once: true }
                    });
                });

                // ─── 10. SECTION TITLES (H2) ─────────────────────────────────
                var sectionTitles = Array.from(document.querySelectorAll('.cv-section h2, .section-title, .enigma-title'));
                sectionTitles.forEach(function (title) {
                    gsap.fromTo(title,
                        { opacity: 0, y: 30, scale: 0.95 },
                        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: title, start: 'top 92%', once: true } }
                    );
                });

                // ─── 11. GSAP HOVER INTERACTIONS FOR BUTTONS ─────────────────
                var interactableBtns = document.querySelectorAll('.menu-link-item, .vault-btn, .tulip-color-btn, #spotlight-play-btn, .game-card');
                interactableBtns.forEach(function (btn) {
                    // Pre-bind hardware acceleration to prevent jumpiness on first hover
                    gsap.set(btn, { force3D: true });
                    btn.addEventListener('mouseenter', function () {
                        gsap.to(btn, { scale: 1.04, duration: 0.4, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
                    });
                    btn.addEventListener('mouseleave', function () {
                        gsap.to(btn, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
                    });
                    btn.addEventListener('mousedown', function () {
                        gsap.to(btn, { scale: 0.94, duration: 0.1, overwrite: 'auto' });
                    });
                    btn.addEventListener('mouseup', function () {
                        gsap.to(btn, { scale: 1.04, duration: 0.4, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
                    });
                });

                // ─── 12. CONTINUOUS SUBTLE FLOATING (YOYO) ───────────────────
                var floatingIcons = document.querySelectorAll('.menu-link-icon, .menu-new-badge');
                floatingIcons.forEach(function (icon) {
                    gsap.set(icon, { force3D: true });
                    var delay = Math.random() * 1.5;
                    if (icon.classList.contains('menu-new-badge')) {
                        gsap.to(icon, { scale: 1.08, duration: 0.8, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: delay });
                    } else {
                        gsap.to(icon, { y: -3, duration: 2 + Math.random(), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: delay });
                    }
                });

                // ─── 13. HERO SECTION REVEAL ─────────────────────────────────
                var heroElements = document.querySelectorAll('#hero-title, #hero-subtitle, #hero-countdown');
                if (heroElements.length) {
                    gsap.fromTo(heroElements,
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.2, delay: 0.2 }
                    );
                }
            }

            // Wait until loader is fully hidden before setting up animations
            function waitForLoader() {
                var loader = document.getElementById('loader');
                if (!loader || loader.style.display === 'none' || loader.classList.contains('hidden')) {
                    setTimeout(initAnimations, 400);
                } else {
                    setTimeout(waitForLoader, 250);
                }
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function () { setTimeout(waitForLoader, 600); });
            } else {
                setTimeout(waitForLoader, 600);
            }
        })();
(function () {
            try {
                const cfg = JSON.parse(localStorage.getItem('yaire_config') || '{}');

                // 1. Galería de Arte
                if (cfg.gal1) {
                    const img1 = document.querySelector('img[alt="Yaire 1"]');
                    if (img1) img1.src = cfg.gal1;
                }
                if (cfg.gal2) {
                    const img2 = document.querySelector('img[alt="Yaire 2"]');
                    if (img2) img2.src = cfg.gal2;
                }
                if (cfg.gal3) {
                    const img3 = document.querySelector('img[alt="Yaire 3"]');
                    if (img3) img3.src = cfg.gal3;
                }

                // 2. Vocabulario — palabras y frases son manejadas por applyAdminConfigOverrides()
                // (que se llama al final de cada setLanguage para que siempre prevalezca sobre el i18n)

                // 3. El Último Secreto (Vault)
                if (cfg.vaultHint) {
                    const hint = document.querySelector('[data-i18n="secret_hint"]');
                    if (hint) hint.innerHTML = cfg.vaultHint;
                }
                // El hash de la contraseña se sobrescribe reasignando la variable si existe
                if (cfg.vaultHash && typeof VAULT_HASH !== 'undefined') {
                    VAULT_HASH = cfg.vaultHash;
                }
                if (cfg.vaultHash && typeof VAULT_HASH_V2 !== 'undefined') {
                    VAULT_HASH_V2 = cfg.vaultHash;
                }

                // Canciones
                if (cfg.songs && cfg.songs.length > 0 && typeof spotlightTracks !== 'undefined') {
                    spotlightTracks = cfg.songs;
                }

                // 4. Hero Badge
                function applyHeroBadgeConfig(cfg) {
                    if (cfg.heroBadge || cfg.heroBadgeLinkText || cfg.heroBadgeEmoji1 || cfg.heroBadgeEmoji2) {
                        // Traducciones base desde Firebase o el propio texto
                        const enTxt = cfg.heroBadge_en && cfg.heroBadge_en.trim() !== '' ? cfg.heroBadge_en : cfg.heroBadge;
                        const ptTxt = cfg.heroBadge_pt && cfg.heroBadge_pt.trim() !== '' ? cfg.heroBadge_pt : cfg.heroBadge;
                        const frTxt = cfg.heroBadge_fr && cfg.heroBadge_fr.trim() !== '' ? cfg.heroBadge_fr : cfg.heroBadge;

                        if (typeof dictionary !== 'undefined') {
                            if (dictionary['es']) dictionary['es'].hero_badge = cfg.heroBadge;
                            if (dictionary['en']) dictionary['en'].hero_badge = enTxt;
                            if (dictionary['pt']) dictionary['pt'].hero_badge = ptTxt;
                            if (dictionary['fr']) dictionary['fr'].hero_badge = frTxt;

                            if (cfg.heroBadgeLinkText) {
                                const linkEn = cfg.heroBadgeLinkText_en || cfg.heroBadgeLinkText;
                                const linkPt = cfg.heroBadgeLinkText_pt || cfg.heroBadgeLinkText;
                                const linkFr = cfg.heroBadgeLinkText_fr || cfg.heroBadgeLinkText;
                                if (dictionary['es']) dictionary['es'].hero_badge_link = cfg.heroBadgeLinkText;
                                if (dictionary['en']) dictionary['en'].hero_badge_link = linkEn;
                                if (dictionary['pt']) dictionary['pt'].hero_badge_link = linkPt;
                                if (dictionary['fr']) dictionary['fr'].hero_badge_link = linkFr;
                            }

                            // Marcar que el admin controla el badge (evita que initHeroCountdown sobreescriba)
                            window.__adminBadgeApplied = true;

                            // DOM Updates for Badge Elements
                            const badgeTextEl = document.getElementById('hero-badge-text');
                            const e1 = document.getElementById('hero-badge-e1');
                            const e2 = document.getElementById('hero-badge-e2');
                            const cDown = document.getElementById('hero-countdown');
                            const dot = document.getElementById('hero-badge-dot');
                            const linkEl = document.getElementById('hero-badge-link');

                            // Texto principal: si vacío, ocultar
                            if (badgeTextEl) {
                                if (!cfg.heroBadge || cfg.heroBadge.trim() === '') {
                                    badgeTextEl.style.display = 'none';
                                } else {
                                    badgeTextEl.style.display = '';
                                }
                            }

                            // Emoji izquierdo: si vacío, ocultar
                            if (e1) {
                                if (!cfg.heroBadgeEmoji1 || cfg.heroBadgeEmoji1.trim() === '') {
                                    e1.style.display = 'none';
                                } else {
                                    e1.textContent = cfg.heroBadgeEmoji1;
                                    e1.style.display = '';
                                }
                            }

                            // Enlace o Emoji derecho
                            if (linkEl && cfg.heroBadgeLinkText && cfg.heroBadgeLinkText.trim() !== '') {
                                linkEl.href = cfg.heroBadgeLinkUrl || '#';
                                linkEl.classList.remove('hidden');
                                if (cDown) cDown.style.display = 'none';
                                if (dot) dot.classList.add('hidden');
                                if (e2) e2.classList.add('hidden');
                            } else if (e2) {
                                if (linkEl) linkEl.classList.add('hidden');
                                if (!cfg.heroBadgeEmoji2 || cfg.heroBadgeEmoji2.trim() === '') {
                                    e2.style.display = 'none';
                                } else {
                                    e2.textContent = cfg.heroBadgeEmoji2;
                                    e2.style.display = '';
                                    e2.classList.remove('hidden');
                                }
                                if (cDown) cDown.style.display = 'none';
                                if (dot) dot.classList.add('hidden');
                            }

                            // Aplicar los cambios de inmediato si la función existe
                            if (typeof setLanguage === 'function' && typeof currentLang !== 'undefined') {
                                setLanguage(currentLang, false);
                            }
                        }

                        // Autocompletar traducciones faltantes (ej: si el panel viejo falló)
                        if (enTxt === cfg.heroBadge) {
                            const translateApi = async (text, lang) => {
                                try {
                                    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
                                    const res = await fetch(url);
                                    const data = await res.json();
                                    return data[0].map(item => item[0]).join('');
                                } catch (e) { return text; }
                            };

                            translateApi(cfg.heroBadge, 'en').then(t => {
                                if (typeof dictionary !== 'undefined' && dictionary['en']) {
                                    dictionary['en'].hero_badge = t;
                                    if (typeof currentLang !== 'undefined' && currentLang === 'en' && typeof setLanguage === 'function') setLanguage('en', false);
                                }
                            });
                            translateApi(cfg.heroBadge, 'pt').then(t => {
                                if (typeof dictionary !== 'undefined' && dictionary['pt']) {
                                    dictionary['pt'].hero_badge = t;
                                    if (typeof currentLang !== 'undefined' && currentLang === 'pt' && typeof setLanguage === 'function') setLanguage('pt', false);
                                }
                            });
                            translateApi(cfg.heroBadge, 'fr').then(t => {
                                if (typeof dictionary !== 'undefined' && dictionary['fr']) {
                                    dictionary['fr'].hero_badge = t;
                                    if (typeof currentLang !== 'undefined' && currentLang === 'fr' && typeof setLanguage === 'function') setLanguage('fr', false);
                                }
                            });
                        }
                    }
                }

                applyHeroBadgeConfig(cfg);

                window.addEventListener('yaire_config_updated', (e) => {
                    if (e.detail) {
                        applyHeroBadgeConfig(e.detail);
                    }
                });

                // 5. Spotlight Tips (Sincronización en vivo y fallback de traducción)
                if (cfg.spotlightTips && typeof spotlightTips !== 'undefined') {
                    if (cfg.spotlightTips.es) spotlightTips.es = cfg.spotlightTips.es;
                    if (cfg.spotlightTips.en) spotlightTips.en = cfg.spotlightTips.en;
                    if (cfg.spotlightTips.pt) spotlightTips.pt = cfg.spotlightTips.pt;
                    if (cfg.spotlightTips.fr) spotlightTips.fr = cfg.spotlightTips.fr;

                    // Autocompletar traducciones faltantes al vuelo si el panel no las generó
                    const tipsEs = cfg.spotlightTips.es;
                    if (tipsEs && tipsEs.length > 0) {
                        const translateApi = async (text, lang) => {
                            try {
                                const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
                                const res = await fetch(url);
                                const data = await res.json();
                                return data[0].map(item => item[0]).join('');
                            } catch (e) { return text; }
                        };

                        // Si EN no existe o es igual a ES (sin traducir)
                        if (!cfg.spotlightTips.en || (cfg.spotlightTips.en[0] === tipsEs[0] && tipsEs[0])) {
                            Promise.all(tipsEs.map(t => translateApi(t, 'en'))).then(arr => spotlightTips.en = arr);
                        }
                        // Si PT no existe o es igual a ES
                        if (!cfg.spotlightTips.pt || (cfg.spotlightTips.pt[0] === tipsEs[0] && tipsEs[0])) {
                            Promise.all(tipsEs.map(t => translateApi(t, 'pt'))).then(arr => spotlightTips.pt = arr);
                        }
                        // Si FR no existe o es igual a ES
                        if (!cfg.spotlightTips.fr || (cfg.spotlightTips.fr[0] === tipsEs[0] && tipsEs[0])) {
                            Promise.all(tipsEs.map(t => translateApi(t, 'fr'))).then(arr => spotlightTips.fr = arr);
                        }
                    }
                }

                // Rastreador de Visitas Globales y Registro de IP
                const trackVisit = () => {
                    // Solo contamos una visita por sesión
                    if (!sessionStorage.getItem('yaire_visited')) {
                        // Incrementar el contador global original (para mantener consistencia)
                        fetch('https://api.counterapi.dev/v1/charlygustav_yaire/visits/up')
                            .then(r => r.json())
                            .then(data => console.log("Visita global #" + data.count))
                            .catch(e => { });

                        // Registrar IP real en Firebase para el Panel
                        fetch('https://api.ipify.org?format=json')
                            .then(r => r.json())
                            .then(data => {
                                const newVisit = {
                                    ip: data.ip,
                                    date: new Date().toISOString(),
                                    loc: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Desconocido',
                                    dev: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
                                };
                                fetch('https://yaire-591ca-default-rtdb.firebaseio.com/ips.json', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(newVisit)
                                });
                                sessionStorage.setItem('yaire_visited', 'true');
                            }).catch(e => console.log("Error de IP"));
                    }
                };

                if (window.__runWhenIdle) {
                    window.__runWhenIdle(trackVisit, 8000);
                } else {
                    setTimeout(trackVisit, 5000);
                }

            } catch (e) {
                console.error("Admin Panel Error:", e);
            }
        })();
// Frase del Dia - cargada desde Firebase Admin
        (async function loadFraseDelDia() {
            try {
                const r = await fetch('https://yaire-591ca-default-rtdb.firebaseio.com/config/frase.json');
                const d = await r.json();
                if (d && d.texto && d.texto.trim()) {
                    const textEl = document.getElementById('frase-del-dia-text');
                    const autorEl = document.getElementById('frase-del-dia-autor');
                    const cont = document.getElementById('frase-container');
                    if (textEl) textEl.textContent = '\u275d ' + d.texto.trim() + ' \u275e';
                    if (autorEl && d.autor) autorEl.textContent = '\u2014 ' + d.autor.trim();
                    if (cont) setTimeout(() => cont.style.opacity = '1', 150);
                }
            } catch (e) { }
        })();
(function () {
            var loadVoiceWidget = function () {
                if (window.__loadScriptOnce) {
                    window.__loadScriptOnce('voice-channel-widget.js?v=10').catch(function () { });
                }
            };
            if (window.__runWhenIdle) {
                window.__runWhenIdle(loadVoiceWidget, 5000);
            } else {
                window.addEventListener('load', function () { setTimeout(loadVoiceWidget, 1200); }, { once: true });
            }
        })();
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
        import { getDatabase, ref, push, onValue, onDisconnect, set, serverTimestamp, get, remove, update, runTransaction } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js';
        import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js';

        const firebaseConfig = {
            apiKey: "AIzaSyDFkuktrXnsV9-jg2bv5dpJQRR-he8PT3g",
            authDomain: "yaire.site",
            databaseURL: "https://yaire-591ca-default-rtdb.firebaseio.com",
            projectId: "yaire-591ca",
            storageBucket: "yaire-591ca.firebasestorage.app",
            messagingSenderId: "450381430658",
            appId: "1:450381430658:web:262d1bb7b1732c3990d99b"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        window.yaireRadioFb = { db, ref, onValue, set, serverTimestamp, runTransaction };

        // --- PRESENCIA ---
        const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        const presenceRef = ref(db, 'presence/' + sessionId);

        onDisconnect(presenceRef).remove();

        // Heartbeat cada 30 segundos
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                updatePresence();
            }
        }, 30000);


        window.addEventListener('beforeunload', () => {
            remove(presenceRef);
        });

        let currentSection = "Navegando";
        let userLocation = "Buscando...";
        let currentUser = null;

        fetch('https://get.geojs.io/v1/ip/geo.json').then(r => r.json()).then(d => {
            userLocation = `${d.city || 'Desconocido'}, ${d.country || ''}`;
            updatePresence();
        }).catch(() => userLocation = "Desconocida");

        const updatePresence = () => {
            const payload = {
                section: currentSection,
                lastActive: serverTimestamp(),
                userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
                location: userLocation
            };
            if (currentUser) {
                payload.user = {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                    email: currentUser.email
                };
            }
            set(presenceRef, payload);
        };
        updatePresence();
        window.yaireUpdatePresence = (sec) => { currentSection = sec; updatePresence(); };

        // --- VC HISTORY WRAPPERS ---
        window.yaireVcHistoryGet = async () => {
            if (!currentUser) return [];
            try {
                const snap = await get(ref(db, `users/${currentUser.uid}/vc_history`));
                return snap.exists() ? snap.val() : [];
            } catch (e) {
                console.error("Error fetching VC history:", e);
                return [];
            }
        };

        window.yaireVcHistoryAdd = async (sessionData) => {
            if (!currentUser) return;
            // Optimistic update for instant UI response
            if (!window.yaireVcHistoryData) window.yaireVcHistoryData = [];
            window.yaireVcHistoryData.unshift(sessionData);
            window.yaireVcHistoryData = window.yaireVcHistoryData.slice(0, 50);

            try {
                const historyRef = ref(db, `users/${currentUser.uid}/vc_history`);
                await set(historyRef, window.yaireVcHistoryData);
            } catch (e) {
                console.error("Error saving VC history:", e);
            }
        };

        // --- AUTH ---
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const authToggle = document.getElementById('auth-toggle');
        const authIcon = document.getElementById('auth-icon');
        const authAvatar = document.getElementById('auth-avatar');

        onAuthStateChanged(auth, async (user) => {
            currentUser = user;
            window.yaireCurrentUser = user; // Expose globally
            if (user) {
                window.yaireVcHistoryData = await window.yaireVcHistoryGet();

            } else {
                window.yaireVcHistoryData = [];
            }
            window.dispatchEvent(new Event('yaireAuthChanged'));
            if (user) {
                authIcon.classList.add('hidden');
                authAvatar.src = user.photoURL;
                authAvatar.classList.remove('hidden');
                authToggle.title = "Cuenta (" + user.displayName + ")";

                authMenuLoggedOut.classList.add('hidden');
                authMenuLoggedOut.classList.remove('flex');
                authMenuLoggedIn.classList.remove('hidden');
                authMenuLoggedIn.classList.add('flex');
                authMenuName.textContent = user.displayName;
                authMenuEmail.textContent = user.email;

                // Guestbook Auth Logic
                const gbPrompt = document.getElementById('gb-auth-prompt');
                const gbFormContainer = document.getElementById('guestbook-form');
                if (gbPrompt && gbFormContainer) {
                    gbPrompt.classList.add('hidden');
                    gbFormContainer.classList.remove('hidden');
                    gbFormContainer.classList.add('flex');
                    const gbName = document.getElementById('gb-name');
                    if (gbName) {
                        gbName.value = user.displayName;
                        gbName.readOnly = true;
                        gbName.classList.add('opacity-70', 'cursor-not-allowed');
                    }
                    const gbBackBtn = document.getElementById('gb-back-btn');
                    if (gbBackBtn) gbBackBtn.classList.add('hidden');
                }
            } else {
                authAvatar.classList.add('hidden');
                authIcon.classList.remove('hidden');
                authToggle.title = "Iniciar sesión";

                authMenuLoggedIn.classList.add('hidden');
                authMenuLoggedIn.classList.remove('flex');
                authMenuLoggedOut.classList.remove('hidden');
                authMenuLoggedOut.classList.add('flex');

                // Guestbook Auth Logic Reset
                const gbPrompt = document.getElementById('gb-auth-prompt');
                const gbFormContainer = document.getElementById('guestbook-form');
                if (gbPrompt && gbFormContainer) {
                    gbPrompt.classList.remove('hidden');
                    gbFormContainer.classList.add('hidden');
                    gbFormContainer.classList.remove('flex');
                    const gbName = document.getElementById('gb-name');
                    if (gbName) {
                        gbName.value = '';
                        gbName.readOnly = false;
                        gbName.classList.remove('opacity-70', 'cursor-not-allowed');
                    }
                    const gbBackBtn = document.getElementById('gb-back-btn');
                    if (gbBackBtn) gbBackBtn.classList.remove('hidden');
                }
            }
            updatePresence();
        });

        const authMenu = document.getElementById('auth-menu');
        const authMenuLoggedOut = document.getElementById('auth-menu-logged-out');
        const authMenuLoggedIn = document.getElementById('auth-menu-logged-in');
        const authMenuName = document.getElementById('auth-menu-name');
        const authMenuEmail = document.getElementById('auth-menu-email');
        const authBtnLogin = document.getElementById('auth-btn-login');
        const authBtnLogout = document.getElementById('auth-btn-logout');

        let isAuthMenuOpen = false;

        function toggleAuthMenu() {
            isAuthMenuOpen = !isAuthMenuOpen;
            if (isAuthMenuOpen) {
                if (window.playEffect) window.playEffect('sounds/slideralto.wav'); else new Audio('sounds/slideralto.wav').play().catch(() => { });
                authMenu.style.display = 'block';
                void authMenu.offsetWidth;
                authMenu.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
                authMenu.classList.add('opacity-100', 'scale-100');
            } else {
                if (window.playEffect) window.playEffect('sounds/sliderbajo.wav'); else new Audio('sounds/sliderbajo.wav').play().catch(() => { });
                authMenu.classList.remove('opacity-100', 'scale-100');
                authMenu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                setTimeout(() => {
                    if (!isAuthMenuOpen) authMenu.style.display = 'none';
                }, 200);
            }
        }

        authToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAuthMenu();
            const tm = document.getElementById('theme-menu');
            if (tm && !tm.classList.contains('opacity-0')) {
                tm.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                setTimeout(() => { if (tm.classList.contains('opacity-0')) tm.style.display = 'none'; }, 200);
            }
        });

        document.addEventListener('click', (e) => {
            if (isAuthMenuOpen && !authToggle.contains(e.target) && !authMenu.contains(e.target)) {
                toggleAuthMenu();
            }
        });

        authBtnLogin.addEventListener('click', () => {
            signInWithPopup(auth, provider).then(() => {
                toggleAuthMenu();
            }).catch(err => {
                console.error("Error logging in:", err);
                if (window.showPremiumAlert) window.showPremiumAlert("Error de Inicio de Sesión", err.message, "error"); else alert("Error: " + err.message);
            });
        });

        authBtnLogout.addEventListener('click', () => {
            signOut(auth).then(() => {
                toggleAuthMenu();
            });
        });

        const gbLoginBtn = document.getElementById('gb-login-btn');
        if (gbLoginBtn) {
            gbLoginBtn.addEventListener('click', () => {
                signInWithPopup(auth, provider).catch(err => {
                    console.error("Error logging in from guestbook:", err);
                    if (window.showPremiumAlert) window.showPremiumAlert("Error de Inicio de Sesión", err.message, "error"); else alert("Error: " + err.message);
                });
            });
        }

        const gbManualBtn = document.getElementById('gb-manual-btn');
        if (gbManualBtn) {
            gbManualBtn.addEventListener('click', () => {
                const gbPrompt = document.getElementById('gb-auth-prompt');
                const gbFormContainer = document.getElementById('guestbook-form');
                if (gbPrompt && gbFormContainer) {
                    gbPrompt.classList.add('hidden');
                    gbFormContainer.classList.remove('hidden');
                    gbFormContainer.classList.add('flex');
                    const gbName = document.getElementById('gb-name');
                    if (gbName) {
                        gbName.value = '';
                        gbName.readOnly = false;
                        gbName.classList.remove('opacity-70', 'cursor-not-allowed');
                        gbName.focus();
                    }
                }
            });
        }

        const gbBackBtn = document.getElementById('gb-back-btn');
        if (gbBackBtn) {
            gbBackBtn.addEventListener('click', () => {
                const gbPrompt = document.getElementById('gb-auth-prompt');
                const gbFormContainer = document.getElementById('guestbook-form');
                if (gbPrompt && gbFormContainer) {
                    gbFormContainer.classList.add('hidden');
                    gbFormContainer.classList.remove('flex');
                    gbPrompt.classList.remove('hidden');
                }
            });
        }

        const observer = new IntersectionObserver((entries) => {
            let activeEntries = entries.filter(e => e.isIntersecting);
            if (activeEntries.length > 0) {
                let target = activeEntries[0].target;
                let secId = target.id;
                const secMap = {
                    "hero": "Inicio",
                    "frase-del-dia": "Frase del Día",
                    "historia": "Nuestra Historia",
                    "nombre": "El Misterio del Nombre",
                    "tulipanes": "Sus Flores Favoritas",
                    "quiz-girasol": "Misterio del Girasol",
                    "distancia": "Distancia",
                    "comida": "Gastronomía",
                    "universo": "Universo",
                    "galeria": "Galería de Arte",
                    "minijuegos": "Zona de Juegos",
                    "promesas": "Mis Promesas",
                    "guestbook": "Muro de Dedicatorias",
                    "colores-yaire": "Colores de Yaire",
                    "memorial": "Memorial",
                    "hype": "Hype",
                    "estadisticas": "Estadísticas",
                    "top5yaire": "Top 5",
                    "enigma-28": "Enigma 28",
                    "secreto": "Sección Secreta"
                };
                currentSection = secMap[secId] || secId || "Navegando";
                updatePresence();
            }
        }, { rootMargin: "-30% 0px -30% 0px" });

        document.querySelectorAll('section').forEach(sec => observer.observe(sec));

        // --- GUESTBOOK ---
        const gbForm = document.getElementById('guestbook-form');
        const gbWall = document.getElementById('guestbook-wall');
        const gbEmpty = document.getElementById('gb-empty');

        let gbEditingId = null;

        const t = (key, fallback) => {
            const lang = typeof currentLang !== 'undefined' ? currentLang : 'es';
            return (dictionary[lang] && dictionary[lang][key]) || fallback;
        };

        const resetGbForm = () => {
            gbEditingId = null;
            gbForm.reset();
            const submitBtn = gbForm.querySelector('button[type="submit"] span');
            if (submitBtn) submitBtn.textContent = dictionary[currentLang]?.gb_btn || 'Publicar Mensaje';
            const cancelBtn = document.getElementById('gb-cancel-edit-btn');
            if (cancelBtn) cancelBtn.remove();

            if (window.yaireCurrentUser) {
                const gbName = document.getElementById('gb-name');
                if (gbName) gbName.value = window.yaireCurrentUser.displayName;
            }
        };

        if (gbForm) {
            gbForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('gb-name').value.trim();
                const msg = document.getElementById('gb-msg').value.trim();
                if (name && msg) {
                    if (gbEditingId) {
                        // UPDATE EXISTING
                        update(ref(db, 'guestbook/' + gbEditingId), {
                            msg: msg,
                            editedAt: serverTimestamp()
                        }).then(() => {
                            if (window.showPremiumAlert) window.showPremiumAlert(t('gb_updated_title', 'Actualizado'), t('gb_updated_msg', 'Tu mensaje ha sido modificado'), 'success');
                            resetGbForm();
                        });
                    } else {
                        // CREATE NEW
                        const messageData = {
                            name: name,
                            msg: msg,
                            timestamp: serverTimestamp()
                        };
                        if (window.yaireCurrentUser) {
                            messageData.uid = window.yaireCurrentUser.uid;
                            messageData.photoURL = window.yaireCurrentUser.photoURL;
                        }
                        push(ref(db, 'guestbook'), messageData).then(() => {
                            resetGbForm();
                        });
                    }
                }
            });
        }

        window.startEditGbMsg = (id, msgText) => {
            gbEditingId = id;
            const gbMsgInput = document.getElementById('gb-msg');
            const gbFormContainer = document.getElementById('guestbook-form');
            if (gbMsgInput && gbFormContainer) {
                gbFormContainer.classList.remove('hidden');
                gbFormContainer.classList.add('flex');

                gbMsgInput.value = msgText;
                gbMsgInput.focus();

                // Change submit text
                const submitBtn = gbFormContainer.querySelector('button[type="submit"] span');
                if (submitBtn) submitBtn.textContent = t('gb_save_changes', 'Guardar Cambios');

                // Add cancel button if not exists
                if (!document.getElementById('gb-cancel-edit-btn')) {
                    const cancelBtn = document.createElement('button');
                    cancelBtn.type = 'button';
                    cancelBtn.id = 'gb-cancel-edit-btn';
                    cancelBtn.className = 'w-full text-zinc-500 font-bold hover:text-red-500 transition-colors text-sm py-2 mt-1';
                    cancelBtn.textContent = t('gb_cancel_edit', 'Cancelar Edición');
                    cancelBtn.onclick = resetGbForm;
                    gbFormContainer.appendChild(cancelBtn);
                }

                // Scroll to form
                document.getElementById('gb-form-anim')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        window.deleteGbMsg = (id) => {
            if (confirm(t('gb_delete_confirm', '¿Estás seguro de que quieres borrar este mensaje para siempre?'))) {
                remove(ref(db, 'guestbook/' + id)).then(() => {
                    if (window.showPremiumAlert) window.showPremiumAlert(t('gb_deleted_title', 'Borrado'), t('gb_deleted_msg', 'El mensaje ha sido eliminado'), 'success');
                });
            }
        };

        onValue(ref(db, 'guestbook'), (snapshot) => {
            if (snapshot.exists()) {
                if (gbEmpty) gbEmpty.style.display = 'none';
                gbWall.innerHTML = '';
                const data = snapshot.val();
                const msgs = Object.entries(data).map(([id, val]) => ({ id, ...val })).sort((a, b) => (b.timestamp || Date.now()) - (a.timestamp || Date.now()));

                msgs.forEach((m, idx) => {
                    const card = document.createElement('div');
                    // Glassmorphism card styles with masonry break-inside-avoid
                    card.className = "break-inside-avoid inline-block w-full mb-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-white/40 dark:border-zinc-700/40 rounded-3xl p-6 shadow-xl shadow-zinc-200/30 dark:shadow-none hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 group relative overflow-hidden gb-card-anim";
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';

                    const dateText = m.timestamp ? new Date(m.timestamp).toLocaleDateString() : t('gb_recent', 'Reciente');
                    const safeName = document.createElement('div'); safeName.innerText = m.name || 'Anónimo';
                    const safeMsg = document.createElement('div'); safeMsg.innerText = m.msg || '';
                    const initial = (safeName.innerText.charAt(0) || '?').toUpperCase();

                    // Generate a seeded color based on name length so it stays consistent
                    const colors = ['bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'];
                    const colorClass = colors[safeName.innerText.length % colors.length];

                    const avatarHTML = m.photoURL
                        ? `<img src="${m.photoURL}" class="w-10 h-10 shrink-0 rounded-full object-cover shadow-inner border border-zinc-200 dark:border-zinc-700" alt="Avatar">`
                        : `<div class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-sm ${colorClass} shadow-inner">${initial}</div>`;

                    let controlsHTML = '';
                    if (window.yaireCurrentUser && m.uid === window.yaireCurrentUser.uid) {
                        controlsHTML = `
                            <div class="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button onclick="window.startEditGbMsg('${m.id}', this.closest('.gb-card-anim').querySelector('.gb-msg-text').innerText)" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-amber-500 hover:bg-white dark:hover:bg-zinc-700 shadow-sm flex items-center justify-center transition-all" title="${t('gb_edit_title', 'Editar mensaje')}">
                                    <i class="ph-bold ph-pencil-simple"></i>
                                </button>
                                <button onclick="window.deleteGbMsg('${m.id}')" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-700 shadow-sm flex items-center justify-center transition-all" title="${t('gb_delete_title', 'Borrar mensaje')}">
                                    <i class="ph-bold ph-trash"></i>
                                </button>
                            </div>
                        `;
                    }

                    const editedTag = m.editedAt ? `<span class="ml-2 text-[9px] font-bold text-zinc-400 lowercase italic">${t('gb_edited_tag', '(editado)')}</span>` : '';

                    card.innerHTML = `
                        <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/20 dark:bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                        ${controlsHTML}
                        <div class="flex items-start gap-4 mb-4 relative z-10 pr-16">
                            ${avatarHTML}
                            <div class="flex-1 pt-1">
                                <h5 class="text-base font-black text-zinc-900 dark:text-white leading-none tracking-tight mb-1">${safeName.innerHTML}</h5>
                                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">${dateText}${editedTag}</span>
                            </div>
                        </div>
                        <p class="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed font-medium relative z-10 gb-msg-text">${safeMsg.innerHTML}</p>
                    `;
                    gbWall.appendChild(card);

                    // Animate in
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, idx * 100);
                });
            } else {
                gbWall.innerHTML = '<div class="col-span-full text-center py-12 text-zinc-500 font-serif italic" id="gb-empty">Aún no hay mensajes. ¡Sé el primero!</div>';
            }
        });

        // --- CONTROL REMOTO (Lluvia de Flores) ---
        let loadTime = Date.now();
        onValue(ref(db, 'live_events/flower_rain/timestamp'), (snapshot) => {
            const val = snapshot.val();
            // Only trigger if the event is NEW (happened after the page loaded)
            if (val && val > loadTime) {
                if (window.triggerFlowerRain) window.triggerFlowerRain();
            }
        });
window.__loadConfetti = function () {
            if (window.confetti) return Promise.resolve(window.confetti);
            if (!window.__loadScriptOnce) return Promise.reject(new Error('Script loader unavailable'));
            return window.__loadScriptOnce('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js')
                .then(function () { return window.confetti; });
        };

        window.triggerFlowerRain = function () {
            window.__loadConfetti().then(function (confetti) {
                if (!confetti) return;
            var duration = 5 * 1000;
            var animationEnd = Date.now() + duration;
            var defaults = { startVelocity: 20, spread: 360, ticks: 60, zIndex: 10000 };

            var interval = setInterval(function () {
                var timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                var particleCount = 20 * (timeLeft / duration);

                confetti(Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: Math.random(), y: Math.random() - 0.2 },
                    shapes: ['circle'],
                    scalar: 2.5,
                    colors: ['#ec4899', '#f43f5e', '#fca5a5', '#fbbf24'] // Pink, red, light pink, yellow (tulip/rose colors)
                }));
            }, 250);
            }).catch(function () { });
        }
window.showPremiumAlert = function (title, msg, type = 'error') {
            const container = document.getElementById('premium-toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            // Using pointer-events-auto so the toast can be clicked/hovered
            toast.className = "transform transition-all duration-500 translate-y-10 opacity-0 pointer-events-auto flex items-center gap-4 bg-[#18181b]/95 backdrop-blur-md border rounded-2xl p-4 shadow-xl w-80";

            let iconClass = '';
            let iconBgClass = '';
            let borderClass = '';
            let shadowClass = '';

            if (type === 'error') {
                borderClass = 'border-red-500/30';
                shadowClass = 'shadow-[0_10px_40px_rgba(239,68,68,0.2)]';
                iconBgClass = 'bg-red-500/20';
                iconClass = 'ph-fill ph-warning-circle text-red-500';
            } else if (type === 'success') {
                borderClass = 'border-emerald-500/30';
                shadowClass = 'shadow-[0_10px_40px_rgba(16,185,129,0.2)]';
                iconBgClass = 'bg-emerald-500/20';
                iconClass = 'ph-fill ph-check-circle text-emerald-500';
            } else {
                borderClass = 'border-brand-500/30';
                shadowClass = 'shadow-[0_10px_40px_rgba(236,72,153,0.2)]';
                iconBgClass = 'bg-brand-500/20';
                iconClass = 'ph-fill ph-info text-brand-500';
            }

            toast.classList.add(borderClass, shadowClass);

            toast.innerHTML = `
        <div class="w-10 h-10 rounded-full ${iconBgClass} flex items-center justify-center shrink-0">
            <i class="${iconClass} text-xl"></i>
        </div>
        <div class="flex-1 min-w-0">
            <h3 class="text-white font-bold text-sm truncate">${title}</h3>
            <p class="text-zinc-400 text-xs mt-0.5 leading-relaxed">${msg}</p>
        </div>
        <button class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors shrink-0">
            <i class="ph-bold ph-x"></i>
        </button>
    `;

            const closeBtn = toast.querySelector('button');
            let isClosing = false;

            const closeToast = () => {
                if (isClosing) return;
                isClosing = true;
                toast.classList.remove('translate-y-0', 'opacity-100');
                toast.classList.add('translate-y-10', 'opacity-0');
                setTimeout(() => toast.remove(), 500);
            };

            closeBtn.onclick = closeToast;

            // Append to container
            container.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    toast.classList.remove('translate-y-10', 'opacity-0');
                    toast.classList.add('translate-y-0', 'opacity-100');
                });
            });

            // Auto dismiss
            setTimeout(() => {
                closeToast();
            }, 4000);
        };

        window.hidePremiumAlert = function () {
            const container = document.getElementById('premium-toast-container');
            if (container && container.lastChild) {
                const btn = container.lastChild.querySelector('button');
                if (btn) btn.click();
            }
        };

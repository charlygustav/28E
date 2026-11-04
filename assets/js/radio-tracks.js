
                
                function normalizeAudioSrc(url) {
                    if (!url) return url;
                    if (url.includes('/radio/')) {
                        return 'radio/' + url.split('/radio/').pop();
                    }
                    if (url.includes('/sounds/')) {
                        return 'sounds/' + url.split('/sounds/').pop();
                    }
                    return url;
                }

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
                spotAudio.preload = 'auto';
                let fbRadioAudio = new Audio();
                let currentRadioState = null;
                let radioUnsubscribe = null;
                let serverTimeOffset = 0;

                // ── EXPOSICIÓN GLOBAL PARA CANAL DE VOZ Y COMPONENTES ─────────
                window.spotlightTracks = spotlightTracks;
                window.spotAudio = spotAudio;
                window.getSpotlightCurrentState = function () {
                    return {
                        isPlaying: isSpotPlaying,
                        mode: typeof spotlightMode !== 'undefined' ? spotlightMode : 'music',
                        trackIndex: currentSpotTrack,
                        track: (spotlightTracks && spotlightTracks[currentSpotTrack]) ? spotlightTracks[currentSpotTrack] : null,
                        currentTime: spotAudio ? (spotAudio.currentTime || 0) : 0,
                        radioState: currentRadioState,
                        serverTimeOffset: serverTimeOffset
                    };
                };
                window.stopSpotlightLocalPlayback = function () {
                    try {
                        if (typeof stopFirebaseRadio === 'function') stopFirebaseRadio();
                    } catch (e) { }
                    try {
                        if (typeof fbRadioAudio !== 'undefined' && fbRadioAudio) fbRadioAudio.pause();
                    } catch (e) { }
                    try {
                        if (typeof spotAudio !== 'undefined' && spotAudio) spotAudio.pause();
                    } catch (e) { }
                    isSpotPlaying = false;
                    try {
                        if (typeof spotlightUpdateUI === 'function') spotlightUpdateUI();
                    } catch (e) { }
                    try {
                        if (typeof spotlightUpdateTitle === 'function') spotlightUpdateTitle();
                        else document.title = '28E';
                    } catch (e) { }
                };

                // ── YOUTUBE LIVE STREAM RADIO ENGINE (AUDIO PURO + METADATOS EN VIVO) ──
                const YOUTUBE_STREAM_ID = 'Gfnj_4BU9cs';
                let ytRadioPlayer = null;
                let ytRadioReady = false;
                function loadYouTubeAPI(callback) {
                    if (window.YT && window.YT.Player) {
                        callback();
                        return;
                    }
                    const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
                    if (!existing) {
                        const tag = document.createElement('script');
                        tag.src = 'https://www.youtube.com/iframe_api';
                        const firstScriptTag = document.getElementsByTagName('script')[0];
                        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    }
                    const prevCb = window.onYouTubeIframeAPIReady;
                    window.onYouTubeIframeAPIReady = () => {
                        if (typeof prevCb === 'function') prevCb();
                        callback();
                    };
                }

                function initYouTubeRadio(autoplay = false) {
                    if (ytRadioPlayer && typeof ytRadioPlayer.playVideo === 'function') {
                        if (autoplay) {
                            try { ytRadioPlayer.playVideo(); } catch (e) { }
                        }
                        return;
                    }

                    loadYouTubeAPI(() => {
                        if (ytRadioPlayer) return;
                        try {
                            ytRadioPlayer = new YT.Player('spotlight-yt-player', {
                                videoId: YOUTUBE_STREAM_ID,
                                playerVars: {
                                    autoplay: autoplay ? 1 : 0,
                                    controls: 0,
                                    playsinline: 1,
                                    rel: 0,
                                    modestbranding: 1,
                                    origin: window.location.origin
                                },
                                events: {
                                    onReady: (event) => {
                                        ytRadioReady = true;
                                        if (autoplay || (isSpotPlaying && spotlightMode === 'radio')) {
                                            try { event.target.playVideo(); } catch (e) { }
                                        }
                                    },
                                    onStateChange: (event) => {
                                        if (spotlightMode !== 'radio') return;
                                        if (event.data === YT.PlayerState.PLAYING) {
                                            isSpotPlaying = true;
                                            spotlightUpdateUI();
                                            document.title = currentRadioState && currentRadioState.title ? `28E Radio · ${currentRadioState.title}` : '28E · Radio en Vivo';
                                        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                                            isSpotPlaying = false;
                                            spotlightUpdateUI();
                                            document.title = '28E';
                                        }
                                    }
                                }
                            });
                        } catch (err) {
                            console.error('Error initializing YouTube Radio player:', err);
                        }
                    });
                }

                function updateRadioTrackUI(state) {
                    if (!state) return;
                    const expTitle = document.getElementById('spotlight-expanded-title');
                    const expArtist = document.getElementById('spotlight-expanded-artist');
                    const compactArtist = document.getElementById('spotlight-artist');
                    const compactTitle = document.getElementById('spotlight-title');

                    const titleText = state.title || '28E Radio';
                    const artistText = state.artist || 'Transmisión en Vivo';

                    if (expTitle) expTitle.textContent = titleText;
                    if (compactTitle) compactTitle.textContent = titleText;
                    if (expArtist) expArtist.innerHTML = `<span class="text-rose-500 font-bold tracking-widest uppercase animate-pulse">🔴 EN VIVO</span> · ${artistText}`;
                    if (compactArtist) compactArtist.innerHTML = `<span class="text-rose-500 font-bold tracking-wider animate-pulse">🔴 EN VIVO</span> · ${artistText}`;

                    if (state.title && state.artist) {
                        fetchSpotlightArtwork({ title: state.title, artist: state.artist }).then(url => {
                            if (spotlightMode === 'radio') {
                                updateAllArtwork(url || 'tulip.ico?v=3');
                            }
                        });
                    } else {
                        updateAllArtwork('tulip.ico?v=3');
                    }
                }

                function subscribeToRadioState() {
                    if (!window.yaireRadioFb) {
                        setTimeout(subscribeToRadioState, 250);
                        return;
                    }
                    const { db, ref, onValue } = window.yaireRadioFb;
                    onValue(ref(db, 'radio_state/current'), snap => {
                        const state = snap.val();
                        currentRadioState = state;
                        if (!state) return;
                        if (spotlightMode === 'radio') {
                            updateRadioTrackUI(state);
                        }
                    });
                }
                subscribeToRadioState();

                function startYouTubeRadio() {
                    if (spotAudio) spotAudio.pause();
                    isSpotPlaying = true;
                    spotlightUpdateUI();
                    document.title = currentRadioState && currentRadioState.title ? `28E Radio · ${currentRadioState.title}` : '28E · Radio en Vivo';

                    if (ytRadioPlayer && typeof ytRadioPlayer.playVideo === 'function') {
                        try { ytRadioPlayer.playVideo(); } catch (e) { }
                    } else {
                        initYouTubeRadio(true);
                    }
                }

                function stopYouTubeRadio() {
                    isSpotPlaying = false;
                    spotlightUpdateUI();
                    document.title = '28E';

                    if (ytRadioPlayer && typeof ytRadioPlayer.pauseVideo === 'function') {
                        try { ytRadioPlayer.pauseVideo(); } catch (e) { }
                    }
                }

                function startFirebaseRadio() { startYouTubeRadio(); }
                function stopFirebaseRadio() { stopYouTubeRadio(); }
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
                window.spotArtworkCache = spotArtworkCache;
                window.fetchSpotlightArtwork = fetchSpotlightArtwork;

                function updateAllArtwork(artUrl) {
                    // Ambient artwork blur
                    const ambientArt = document.getElementById('spotlight-ambient-art');
                    if (ambientArt) {
                        if (artUrl) {
                            ambientArt.src = artUrl;
                            ambientArt.style.opacity = '0.35';
                        } else {
                            ambientArt.style.opacity = '0';
                        }
                    }
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
                    expEl.style.background = '#09090D';

                    if (isSpotlightExpanded) {
                        expEl.classList.remove('pointer-events-none');
                        expEl.classList.add('pointer-events-auto');
                        // Sync UI only — never touch spotAudio.src here (would pause playback)
                        syncExpandedPlayerUI();
                        renderSpotlightPlaylist();
                        if (typeof gsap !== 'undefined') {
                            gsap.set(expEl, { y: '100%', opacity: 0 });
                            gsap.to(expEl, {
                                y: '0%',
                                opacity: 1,
                                duration: 0.4,
                                ease: 'power2.out'
                            });
                        } else {
                            expEl.style.transform = 'translateY(0%)';
                            expEl.style.opacity = '1';
                        }
                    } else {
                        if (typeof gsap !== 'undefined') {
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
                        } else {
                            expEl.style.transform = 'translateY(100%)';
                            expEl.style.opacity = '0';
                            expEl.classList.remove('pointer-events-auto');
                            expEl.classList.add('pointer-events-none');
                        }
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
                    // Immediately sync progress bar & timestamps
                    spotlightUpdateProgress();
                }

                function renderSpotlightPlaylist() {
                    const listEl = document.getElementById('spotlight-expanded-list');
                    if (!listEl) return;
                    listEl.innerHTML = '';
                    const countEl = document.getElementById('spotlight-track-count');
                    if (countEl) countEl.textContent = spotlightTracks.length + ' PISTAS';

                    spotlightTracks.forEach((track, index) => {
                        const isCurrent = index === currentSpotTrack;
                        const key = track.title + '|' + track.artist;
                        const cachedArt = spotArtworkCache[key];
                        const item = document.createElement('div');
                        item.className = 'group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer select-none border transition-all duration-150 ' + (
                            isCurrent
                                ? 'bg-white/[0.08] border-white/15 text-white shadow-sm'
                                : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.06] text-zinc-300'
                        );
                        const thumbHtml = cachedArt
                            ? `<img src="${cachedArt}" draggable="false" class="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow border border-white/10 select-none pointer-events-none" style="-webkit-user-drag: none; user-select: none;" />`
                            : `<span class="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-rose-400 flex-shrink-0 select-none pointer-events-none"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></span>`;
                        
                        const rightIndicator = isCurrent
                            ? `<div class="flex items-end gap-[2px] h-3 shrink-0 px-1.5" title="Reproduciendo">
                                 <span class="eq-bar"></span>
                                 <span class="eq-bar"></span>
                                 <span class="eq-bar"></span>
                               </div>`
                            : `<span class="w-6 h-6 rounded-full flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-white/10 transition-all shrink-0">
                                 <svg class="w-3 h-3 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                               </span>`;

                        item.innerHTML = thumbHtml +
                            `<div class="flex-1 min-w-0 flex flex-col justify-center">` +
                            `<span class="text-xs truncate font-semibold leading-tight ${isCurrent ? 'text-rose-400' : 'text-zinc-200 group-hover:text-white'}">${track.title}</span>` +
                            `<span class="text-zinc-400 truncate mt-0.5" style="font-size: 11px; line-height: 1.25;">${track.artist || '28E Soundtrack'}</span>` +
                            `</div>` +
                            rightIndicator;

                        item.onclick = () => {
                            spotlightPlayTrack(index);
                            renderSpotlightPlaylist();
                        };
                        listEl.appendChild(item);
                        // Fetch art if not cached yet — update this item when ready
                        if (!cachedArt && cachedArt !== null) {
                            fetchSpotlightArtwork(track).then(artUrl => {
                                if (artUrl) {
                                    const thumbEl = item.querySelector('span.w-10');
                                    if (thumbEl) {
                                        const img = document.createElement('img');
                                        img.src = artUrl;
                                        img.setAttribute('draggable', 'false');
                                        img.className = 'w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow border border-white/10 select-none pointer-events-none';
                                        img.style.webkitUserDrag = 'none';
                                        img.style.userSelect = 'none';
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
                            spotlightTracks = cfg.songs.map(s => ({ ...s, src: typeof normalizeAudioSrc === "function" ? normalizeAudioSrc(s.src) : s.src }));
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
                                const artistEl = document.getElementById('next-song-toast-artist');
                                const artImg = document.getElementById('next-song-toast-art');
                                const fallbackIcon = document.getElementById('next-song-toast-fallback');
                                const artContainer = document.getElementById('next-song-toast-art-container');

                                if (toast && titleEl) {
                                    // Reset previous title marquee state
                                    gsap.killTweensOf(titleEl);
                                    gsap.set(titleEl, { x: 0 });
                                    const marqueeWrapper = titleEl.closest('.toast-title-marquee-wrapper') || titleEl.parentElement;
                                    if (marqueeWrapper) marqueeWrapper.classList.remove('has-overflow');

                                    titleEl.textContent = nextTrack.title;
                                    if (artistEl) artistEl.textContent = nextTrack.artist || '';

                                    fetchSpotlightArtwork(nextTrack).then(artUrl => {
                                        if (artUrl) {
                                            artImg.src = artUrl;
                                            artImg.classList.remove('hidden');
                                            fallbackIcon.classList.add('hidden');
                                            artContainer.classList.remove('bg-brand-500/20', 'text-brand-400', 'bg-amber-500/15', 'text-amber-400', 'bg-white/[0.05]', 'text-zinc-400');
                                        } else {
                                            artImg.classList.add('hidden');
                                            fallbackIcon.classList.remove('hidden');
                                            artContainer.classList.remove('bg-brand-500/20', 'text-brand-400');
                                            artContainer.classList.add('bg-white/[0.05]', 'text-zinc-400');
                                        }

                                        const isMobileToast = window.innerWidth <= 1024 || window.matchMedia('(pointer: coarse)').matches;
                                        if (isMobileToast) {
                                            gsap.fromTo(toast,
                                                { y: 20, x: 0, xPercent: -50, opacity: 0, scale: 0.92 },
                                                { y: 0, x: 0, xPercent: -50, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" }
                                            );
                                        } else {
                                            gsap.fromTo(toast,
                                                { y: 20, x: -20, xPercent: 0, scale: 1, opacity: 0 },
                                                { y: 0, x: 0, xPercent: 0, scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" }
                                            );
                                        }

                                        // Automatic marquee based on song title length
                                        let hideDelay = 7500;
                                        requestAnimationFrame(() => {
                                            if (!titleEl || !marqueeWrapper) return;
                                            const overflow = titleEl.scrollWidth - marqueeWrapper.clientWidth;
                                            if (overflow > 4) {
                                                marqueeWrapper.classList.add('has-overflow');
                                                // Comfortable reading speed: ~22px per second, minimum 2.4s
                                                const scrollDuration = Math.max(2.4, overflow / 22);
                                                // Ensure toast stays open long enough to read the full title cycle
                                                hideDelay = Math.max(8500, (scrollDuration * 2 + 3.2) * 1000);

                                                gsap.to(titleEl, {
                                                    x: -(overflow + 6),
                                                    duration: scrollDuration,
                                                    ease: "power1.inOut",
                                                    delay: 1.2,
                                                    repeat: -1,
                                                    yoyo: true,
                                                    repeatDelay: 1.2
                                                });
                                            }

                                            if (window._nextSongToastTimer) clearTimeout(window._nextSongToastTimer);
                                            window._nextSongToastTimer = setTimeout(() => {
                                                if (isMobileToast) {
                                                    gsap.to(toast, { y: 20, xPercent: -50, opacity: 0, scale: 0.92, duration: 0.45, ease: "power2.in" });
                                                } else {
                                                    gsap.to(toast, { y: 20, x: -20, xPercent: 0, opacity: 0, duration: 0.5, ease: "power2.in" });
                                                }
                                                setTimeout(() => {
                                                    gsap.killTweensOf(titleEl);
                                                    gsap.set(titleEl, { x: 0 });
                                                    if (marqueeWrapper) marqueeWrapper.classList.remove('has-overflow');
                                                }, 500);
                                            }, hideDelay);
                                        });
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
                    spotAudio.src = typeof normalizeAudioSrc === "function" ? normalizeAudioSrc(track.src) : track.src;
                    spotAudio.preload = "auto";
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
                            stopYouTubeRadio();
                        } else {
                            startYouTubeRadio();
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

                let isSpotLoop = false;
                function spotlightToggleLoop() {
                    isSpotLoop = !isSpotLoop;
                    if (spotAudio) spotAudio.loop = isSpotLoop;
                    const loopBtn = document.getElementById('spotlight-loop-btn');
                    if (loopBtn) {
                        if (isSpotLoop) {
                            loopBtn.classList.add('text-rose-400', 'bg-rose-500/10');
                            loopBtn.classList.remove('text-zinc-400');
                            loopBtn.setAttribute('title', 'Repetir canción: Activado');
                        } else {
                            loopBtn.classList.remove('text-rose-400', 'bg-rose-500/10');
                            loopBtn.classList.add('text-zinc-400');
                            loopBtn.setAttribute('title', 'Repetir canción: Desactivado');
                        }
                    }
                }

                function spotlightToggleMute() {
                    let isMutedNow = false;
                    if (spotlightMode === 'radio') {
                        if (ytRadioPlayer && typeof ytRadioPlayer.isMuted === 'function') {
                            if (ytRadioPlayer.isMuted()) {
                                ytRadioPlayer.unMute();
                                isMutedNow = false;
                            } else {
                                ytRadioPlayer.mute();
                                isMutedNow = true;
                            }
                        }
                    } else {
                        if (!spotAudio) return;
                        spotAudio.muted = !spotAudio.muted;
                        isMutedNow = spotAudio.muted;
                    }
                    const muteBtn = document.getElementById('spotlight-mute-btn');
                    if (muteBtn) {
                        if (isMutedNow) {
                            muteBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>`;
                            muteBtn.classList.add('text-rose-400', 'bg-rose-500/10');
                            muteBtn.classList.remove('text-zinc-400');
                            muteBtn.setAttribute('title', 'Sonido silenciado');
                        } else {
                            muteBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>`;
                            muteBtn.classList.remove('text-rose-400', 'bg-rose-500/10');
                            muteBtn.classList.add('text-zinc-400');
                            muteBtn.setAttribute('title', 'Silenciar sonido');
                        }
                    }
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
                    const expLoop = document.getElementById('spotlight-loop-btn');
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
                        if (mode === 'radio' && spotAudio) { spotAudio.pause(); startYouTubeRadio(); }
                        if (mode === 'music') stopYouTubeRadio();
                        isSpotPlaying = false;
                        spotlightUpdateUI();
                        document.title = '28E';
                    }

                    if (mode === 'music') {
                        // Activate Music UI
                        stopYouTubeRadio();
                        btnMusic.className = "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all bg-white shadow-sm cursor-pointer";
                        btnRadio.className = "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all text-zinc-400 hover:text-white cursor-pointer";
                        btnMusic.setAttribute('data-active', 'true');
                        btnMusic.style.setProperty('color', '#000000', 'important');
                        btnRadio.setAttribute('data-active', 'false');
                        btnRadio.style.setProperty('color', '#A1A1AA', 'important');
                        if (compactNext) compactNext.style.display = '';
                        if (expPrev) expPrev.style.visibility = 'visible';
                        if (expNext) expNext.style.visibility = 'visible';
                        if (expLoop) expLoop.style.visibility = 'visible';
                        if (expProgress) expProgress.style.display = '';
                        if (expTimeList) expTimeList.style.display = '';
                        if (expList) expList.style.display = '';
                        if (radioVis) {
                            radioVis.classList.add('hidden');
                            radioVis.classList.remove('flex');
                        }

                        // Restore music track info
                        const t = spotlightTracks[currentSpotTrack];
                        if (t) {
                            if (compactTitle) compactTitle.textContent = t.title;
                            if (compactArtist) compactArtist.textContent = t.artist;
                            if (expTitle) expTitle.textContent = t.title;
                            if (expArtist) expArtist.textContent = t.artist;
                            fetchSpotlightArtwork(t).then(artUrl => {
                                if (spotlightMode === 'music') updateAllArtwork(artUrl);
                            });
                        }
                    } else {
                        // Activate Radio UI (Pure Audio Stream + Live Metadata & Artwork)
                        if (spotAudio) spotAudio.pause();
                        initYouTubeRadio(isSpotPlaying);

                        btnRadio.className = "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all bg-rose-500 shadow-sm cursor-pointer";
                        btnMusic.className = "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all text-zinc-400 hover:text-white cursor-pointer";
                        btnRadio.setAttribute('data-active', 'true');
                        btnRadio.style.setProperty('color', '#FFFFFF', 'important');
                        btnMusic.setAttribute('data-active', 'false');
                        btnMusic.style.setProperty('color', '#A1A1AA', 'important');
                        if (compactNext) compactNext.style.display = 'none';
                        if (expPrev) expPrev.style.visibility = 'hidden';
                        if (expNext) expNext.style.visibility = 'hidden';
                        if (expLoop) expLoop.style.visibility = 'hidden';
                        if (expProgress) expProgress.style.display = 'none';
                        if (expTimeList) expTimeList.style.display = 'none';
                        if (expList) expList.style.display = 'none';
                        if (radioVis) {
                            radioVis.classList.remove('hidden');
                            radioVis.classList.add('flex');
                        }

                        // Set live track info from Firebase stream state
                        if (currentRadioState) {
                            updateRadioTrackUI(currentRadioState);
                        } else {
                            if (compactTitle) compactTitle.textContent = '28E Radio';
                            if (compactArtist) compactArtist.innerHTML = `<span class="text-rose-500 font-bold tracking-wider animate-pulse">🔴 EN VIVO</span>`;
                            if (expTitle) expTitle.textContent = '28E Radio';
                            if (expArtist) expArtist.innerHTML = `<span class="text-rose-500 font-bold tracking-widest uppercase animate-pulse">🔴 TRANSMISIÓN EN VIVO</span>`;
                            updateAllArtwork('tulip.ico?v=3');
                        }
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
                        iconWrap.classList.add('bg-rose-500/20');
                        if (expPlayIcon) {
                            expPlayIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
                            expPlayIcon.classList.remove('ml-0.5');
                        }
                    } else {
                        icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
                        icon.classList.add('ml-0.5');
                        iconWrap.classList.remove('bg-rose-500/20');
                        if (expPlayIcon) {
                            expPlayIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
                            expPlayIcon.classList.add('ml-0.5');
                        }
                    }

                    if (vinylSpin) {
                        vinylSpin.style.animationPlayState = isSpotPlaying ? 'running' : 'paused';
                    }

                    if (isSpotlightExpanded) {
                        renderSpotlightPlaylist();
                    }
                }

                // Explicit window exports for global inline click handlers
                window.toggleSpotlightExpand = toggleSpotlightExpand;
                window.spotlightTogglePlay = spotlightTogglePlay;
                window.spotlightNext = spotlightNext;
                window.spotlightPrevTrack = spotlightPrevTrack;
                window.spotlightPlayTrack = spotlightPlayTrack;
                window.spotlightLoadTrack = spotlightLoadTrack;
                window.spotlightToggleLoop = spotlightToggleLoop;
                window.spotlightToggleMute = spotlightToggleMute;
                window.setSpotlightMode = setSpotlightMode;
                window.spotlightSeek = spotlightSeek;
                window.spotlightUpdateProgress = spotlightUpdateProgress;
                window.renderSpotlightPlaylist = renderSpotlightPlaylist;

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
                    if (isNaN(seconds) || seconds < 0) return "0:00";
                    const m = Math.floor(seconds / 60);
                    const s = Math.floor(seconds % 60);
                    return m + ':' + (s < 10 ? '0' : '') + s;
                }

                function spotlightUpdateProgress() {
                    const currentTime = spotAudio.currentTime || 0;
                    const duration = spotAudio.duration || 0;
                    const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

                    const fill = document.getElementById('spotlight-progress-fill');
                    const thumb = document.getElementById('spotlight-progress-thumb');
                    const currentTimeEl = document.getElementById('spotlight-current-time');
                    const totalTimeEl = document.getElementById('spotlight-total-time');

                    if (fill) fill.style.width = progressPercent + '%';
                    if (thumb) thumb.style.left = progressPercent + '%';
                    if (currentTimeEl) currentTimeEl.textContent = spotlightFormatTime(currentTime);
                    if (totalTimeEl && duration > 0) totalTimeEl.textContent = spotlightFormatTime(duration);
                }

                spotAudio.addEventListener('timeupdate', spotlightUpdateProgress);
                spotAudio.addEventListener('loadedmetadata', spotlightUpdateProgress);

                function spotlightSeek(e) {
                    const container = document.getElementById('spotlight-progress-container');
                    if (!container || !spotAudio.duration) return;
                    const rect = container.getBoundingClientRect();
                    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
                    const clickX = clientX - rect.left;
                    const percent = Math.max(0, Math.min(1, clickX / rect.width));
                    spotAudio.currentTime = percent * spotAudio.duration;
                    spotlightUpdateProgress();
                }

                // Drag functionality for progress bar (Mouse + Touch)
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

                    // Mobile Touch seek support
                    container.addEventListener('touchstart', (e) => {
                        if (e.touches && e.touches[0]) {
                            isDraggingProgress = true;
                            spotlightSeek(e.touches[0]);
                        }
                    }, { passive: true });

                    document.addEventListener('touchmove', (e) => {
                        if (isDraggingProgress && e.touches && e.touches[0]) {
                            if (_docRaf) cancelAnimationFrame(_docRaf);
                            _docRaf = requestAnimationFrame(() => spotlightSeek(e.touches[0]));
                        }
                    }, { passive: true });

                    document.addEventListener('touchend', () => {
                        isDraggingProgress = false;
                    });
                }

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', setupProgressDrag);
                } else {
                    setupProgressDrag();
                }
            
window.showNextSongToast = function(customTrack) {
    let next = currentSpotTrack + 1;
    if (next >= spotlightTracks.length) next = 0;
    const nextTrack = customTrack || spotlightTracks[next];
    if (!nextTrack) return;
    const toast = document.getElementById('next-song-toast');
    const titleEl = document.getElementById('next-song-toast-title');
    const artistEl = document.getElementById('next-song-toast-artist');
    const artImg = document.getElementById('next-song-toast-art');
    const fallbackIcon = document.getElementById('next-song-toast-fallback');
    const artContainer = document.getElementById('next-song-toast-art-container');
    if (!toast || !titleEl) return;

    gsap.killTweensOf(titleEl);
    gsap.set(titleEl, { x: 0 });
    const marqueeWrapper = titleEl.closest('.toast-title-marquee-wrapper') || titleEl.parentElement;
    if (marqueeWrapper) marqueeWrapper.classList.remove('has-overflow');

    titleEl.textContent = nextTrack.title;
    if (artistEl) artistEl.textContent = nextTrack.artist || '';

    fetchSpotlightArtwork(nextTrack).then(artUrl => {
        if (artUrl) {
            artImg.src = artUrl;
            artImg.classList.remove('hidden');
            fallbackIcon.classList.add('hidden');
        } else {
            artImg.classList.add('hidden');
            fallbackIcon.classList.remove('hidden');
        }

        const isMobileToast = window.innerWidth <= 1024 || window.matchMedia('(pointer: coarse)').matches;
        if (isMobileToast) {
            gsap.fromTo(toast,
                { y: 20, x: 0, xPercent: -50, opacity: 0, scale: 0.95 },
                { y: 0, x: 0, xPercent: -50, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" }
            );
        } else {
            gsap.fromTo(toast,
                { y: 20, x: -20, xPercent: 0, scale: 1, opacity: 0 },
                { y: 0, x: 0, xPercent: 0, scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" }
            );
        }

        if (window._nextSongToastTimer) clearTimeout(window._nextSongToastTimer);
        window._nextSongToastTimer = setTimeout(() => {
            if (isMobileToast) {
                gsap.to(toast, { y: 20, xPercent: -50, opacity: 0, scale: 0.95, duration: 0.45, ease: "power2.in" });
            } else {
                gsap.to(toast, { y: 20, x: -20, xPercent: 0, opacity: 0, duration: 0.5, ease: "power2.in" });
            }
        }, 6500);
    });
};

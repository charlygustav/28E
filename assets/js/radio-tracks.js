
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

                // ── EXPOSICIÓN GLOBAL PARA CANAL DE VOZ Y COMPONENTES ─────────
                window.spotlightTracks = spotlightTracks;
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
                    const isDark = document.documentElement.classList.contains('dark');
                    expEl.style.background = isDark ? '#09090b' : '#ffffff';

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
                        item.className = 'spotlight-track-item flex items-center gap-3 px-3 py-2 rounded-2xl cursor-pointer select-none border ' + (
                            isCurrent
                                ? 'is-active text-brand-500 font-bold shadow-sm'
                                : 'text-zinc-700 dark:text-zinc-300'
                        );
                        const thumbHtml = cachedArt
                            ? `<img src="${cachedArt}" class="w-9 h-9 rounded-xl object-cover flex-shrink-0 shadow-sm" />`
                            : `<span class="w-9 h-9 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 flex items-center justify-center text-sm flex-shrink-0 border border-black/5 dark:border-white/5">${isCurrent ? '🔊' : '🎵'}</span>`;
                        item.innerHTML = thumbHtml +
                            `<div class="flex-1 min-w-0 flex flex-col justify-center">` +
                            `<span class="text-xs truncate font-semibold leading-tight ${isCurrent ? 'text-brand-500 dark:text-brand-400' : 'text-zinc-800 dark:text-zinc-200'}">${track.title}</span>` +
                            `<span class="text-[10px] text-zinc-400 dark:text-zinc-400 truncate mt-0.5">${track.artist || '28E Spotlight'}</span>` +
                            `</div>` +
                            (isCurrent
                                ? `<span class="flex-shrink-0 text-brand-500 text-xs px-1 flex items-center gap-0.5">` +
                                `<span class="w-0.5 h-3 bg-brand-500 rounded-full animate-pulse"></span>` +
                                `<span class="w-0.5 h-4 bg-brand-500 rounded-full animate-pulse" style="animation-delay:0.15s"></span>` +
                                `<span class="w-0.5 h-2 bg-brand-500 rounded-full animate-pulse" style="animation-delay:0.3s"></span>` +
                                `</span>`
                                : '');
                        item.onclick = () => spotlightPlayTrack(index);
                        listEl.appendChild(item);
                        // Fetch art if not cached yet — update this item when ready
                        if (!cachedArt && cachedArt !== null) {
                            fetchSpotlightArtwork(track).then(artUrl => {
                                if (artUrl) {
                                    const thumbEl = item.querySelector('span.w-9');
                                    if (thumbEl) {
                                        const img = document.createElement('img');
                                        img.src = artUrl;
                                        img.className = 'w-9 h-9 rounded-xl object-cover flex-shrink-0 shadow-sm';
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
                                    // Reset previous title marquee state
                                    gsap.killTweensOf(titleEl);
                                    gsap.set(titleEl, { x: 0 });
                                    const marqueeWrapper = titleEl.closest('.toast-title-marquee-wrapper') || titleEl.parentElement;
                                    if (marqueeWrapper) marqueeWrapper.classList.remove('has-overflow');

                                    titleEl.textContent = nextTrack.title;

                                    fetchSpotlightArtwork(nextTrack).then(artUrl => {
                                        if (artUrl) {
                                            artImg.src = artUrl;
                                            artImg.classList.remove('hidden');
                                            fallbackIcon.classList.add('hidden');
                                            artContainer.classList.remove('bg-brand-500/20', 'text-brand-400', 'bg-amber-500/15', 'text-amber-400');
                                        } else {
                                            artImg.classList.add('hidden');
                                            fallbackIcon.classList.remove('hidden');
                                            artContainer.classList.remove('bg-brand-500/20', 'text-brand-400');
                                            artContainer.classList.add('bg-amber-500/15', 'text-amber-400');
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

                let isSpotLoop = false;
                function spotlightToggleLoop() {
                    isSpotLoop = !isSpotLoop;
                    if (spotAudio) spotAudio.loop = isSpotLoop;
                    const loopBtn = document.getElementById('spotlight-loop-btn');
                    if (loopBtn) {
                        if (isSpotLoop) {
                            loopBtn.classList.add('text-brand-500', 'dark:text-brand-400', 'bg-brand-500/10');
                            loopBtn.classList.remove('text-zinc-400', 'dark:text-zinc-400');
                            loopBtn.setAttribute('title', 'Repetir canción: Activado');
                        } else {
                            loopBtn.classList.remove('text-brand-500', 'dark:text-brand-400', 'bg-brand-500/10');
                            loopBtn.classList.add('text-zinc-400', 'dark:text-zinc-400');
                            loopBtn.setAttribute('title', 'Repetir canción: Desactivado');
                        }
                    }
                }

                function spotlightToggleMute() {
                    if (!spotAudio) return;
                    spotAudio.muted = !spotAudio.muted;
                    const muteBtn = document.getElementById('spotlight-mute-btn');
                    if (muteBtn) {
                        if (spotAudio.muted) {
                            muteBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>`;
                            muteBtn.classList.add('text-red-500', 'dark:text-red-400');
                            muteBtn.classList.remove('text-zinc-400', 'dark:text-zinc-400');
                            muteBtn.setAttribute('title', 'Sonido silenciado');
                        } else {
                            muteBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>`;
                            muteBtn.classList.remove('text-red-500', 'dark:text-red-400');
                            muteBtn.classList.add('text-zinc-400', 'dark:text-zinc-400');
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
                        if (mode === 'radio' && spotAudio) { spotAudio.pause(); if (isSpotPlaying) startFirebaseRadio(); }
                        if (mode === 'music') stopFirebaseRadio();
                        isSpotPlaying = false;
                        spotlightUpdateUI();
                        document.title = '28E';
                    }

                    if (mode === 'music') {
                        // Activate Music UI
                        btnMusic.className = "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all bg-white dark:bg-zinc-700 text-brand-500 shadow-sm cursor-pointer";
                        btnRadio.className = "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer";
                        if (compactNext) compactNext.style.display = '';
                        if (expPrev) expPrev.style.visibility = 'visible';
                        if (expNext) expNext.style.visibility = 'visible';
                        if (expLoop) expLoop.style.visibility = 'visible';
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
                        btnRadio.className = "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all bg-white dark:bg-zinc-700 text-brand-500 shadow-sm cursor-pointer";
                        btnMusic.className = "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer";
                        if (compactNext) compactNext.style.display = 'none';
                        if (expPrev) expPrev.style.visibility = 'hidden';
                        if (expNext) expNext.style.visibility = 'hidden';
                        if (expLoop) expLoop.style.visibility = 'hidden';
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
            
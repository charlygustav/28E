
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
                    
                    const willOpen = !allOpen;
                    sections.forEach(s => {
                        if (willOpen) s.classList.add('active');
                        else s.classList.remove('active');
                    });

                    const d = window.dictionary && window.dictionary[window.currentLang || 'es'] || {};
                    const label = btn.querySelector('.btn-label') || btn;
                    label.textContent = willOpen ? (d.song_collapse_all || 'Contraer letra') : (d.song_expand_all || 'Expandir letra');
                    
                    const arrow = btn.querySelector('svg');
                    if (arrow) arrow.style.transform = willOpen ? 'rotate(180deg)' : 'rotate(0deg)';
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
                            if (!univSlide.dataset.unlocked) {
                                univSlide.dataset.unlocked = "true";
                                univSlide.className = "w-full flex-shrink-0 snap-center rounded-2xl sm:rounded-[26px] bg-[#0f0f14] hover:bg-[#15151c] border border-white/[0.08] hover:border-white/20 px-6 py-5 sm:px-8 sm:py-5 transition-all duration-300 relative overflow-hidden group flex items-center";
                                univSlide.style.marginLeft = "1rem";
                                univSlide.style.background = "#0f0f14";
                                univSlide.style.backdropFilter = "none";
                                univSlide.style.minHeight = "auto";
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
            
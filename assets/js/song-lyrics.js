
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
            
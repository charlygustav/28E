
                // ===== TULIP SECTION INTERACTIONS =====

                // Petal particle system
                (function initTulipPetals() {
                    const container = document.getElementById('tulip-petals-container');
                    if (!container) return;
                    const petals = ['🌸', '🌷', '💮', '🏵️', '✿'];
                    function spawnPetal() {
                        if (window.innerWidth < 768) return; // Mobile optimization: stop petal generation
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
            

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
            
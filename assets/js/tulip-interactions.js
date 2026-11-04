// ===== TULIP SECTION INTERACTIONS =====

// Petal particle system
(function initTulipPetals() {
    const container = document.getElementById('tulip-petals-container');
    if (!container) return;
    const petals = ['🌸', '🌷', '💮', '🏵️', '✿'];
    function spawnPetal() {
        if (window.innerWidth < 768) return; // Mobile optimization
        if (container.children.length >= 25) return; // Cap to prevent memory leaks
        const el = document.createElement('span');
        el.className = 'tulip-petal';
        el.textContent = petals[Math.floor(Math.random() * petals.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.animationDuration = (6 + Math.random() * 8) + 's';
        el.style.animationDelay = Math.random() * 2 + 's';
        el.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
        el.style.willChange = 'transform, opacity';
        container.appendChild(el);
        const cleanUp = () => { if (el.parentNode) el.remove(); };
        el.addEventListener('animationend', cleanUp);
        setTimeout(cleanUp, 15000);
    }
    const initialPetals = window.__PERF_LITE__ ? 2 : 6;
    for (let i = 0; i < initialPetals; i++) setTimeout(() => spawnPetal(), i * 400);
    const spawnDelay = window.__PERF_LITE__ ? 5200 : 2500;
    let petalInterval = null;

    const petalObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            if (!petalInterval) petalInterval = setInterval(spawnPetal, spawnDelay);
        } else {
            if (petalInterval) {
                clearInterval(petalInterval);
                petalInterval = null;
            }
            container.innerHTML = '';
        }
    }, { threshold: 0 });

    petalObs.observe(container);
})();

// Tulip Spectacle on Click — Interactive Blooming & Secret Messages
const TULIP_MESSAGES = [
    {
        badge: "Pétalo #1 · El Reencuentro",
        text: "«Tal vez hoy solo pueda regalártelos en formato digital a través de esta pantalla, pero te prometo que el día que nos veamos en persona, te estaré esperando con el ramo de tulipanes rosas más hermoso y real que hayas visto en tu vida.»"
    },
    {
        badge: "Pétalo #2 · Afecto Puro",
        text: "«Sé muy bien que los tulipanes rosas son tus flores favoritas en el mundo. Simbolizan el amor tierno, el cuidado genuino y la conexión más sincera: exactamente lo que despiertas en mí cada segundo.»"
    },
    {
        badge: "Pétalo #3 · Tiempo & Distancia",
        text: "«Cada día que amanece es un tulipán más que florece en la distancia. Ya son más de 270 días escribiendo esta historia, y cada mañana vuelvo a elegirte con el mismo amor del primer día.»"
    },
    {
        badge: "Pétalo #4 · Tu Luz",
        text: "«No hay jardín ni primavera tan hermosa como el sonido de tu risa. Eres la calma en mis días difíciles y el motivo por el cual todo esto tiene sentido.»"
    },
    {
        badge: "Pétalo #5 · Certeza Eterna",
        text: "«Prometo cuidarte, valorar cada detalle tuyo, celebrar tus alegrías y ser tu refugio en cada tormenta. Mi corazón tiene tu nombre grabado para siempre.»"
    },
    {
        badge: "Pétalo #6 · Floración Completa",
        text: "«¡Ramo infinito florecido! Todas estas flores son tuyas, Yaire. Mi amor por ti no tiene fecha de caducidad ni distancia que lo apague. Te amo con toda mi alma.»"
    }
];

let tulipBloomStep = 0;
let tulipIdleTween = null;

// Organic breathing float powered by GSAP
function startTulipIdle() {
    const emoji = document.getElementById('tulip-hero-emoji');
    if (!emoji || typeof gsap === 'undefined') return;
    if (tulipIdleTween) tulipIdleTween.kill();
    tulipIdleTween = gsap.to(emoji, {
        y: -8,
        rotation: 3,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
    });
}

// 3D Magnetic Tilt & Physical Micro-interactions (rAF Throttled & Hardware-Accelerated)
(function initTulipHeroInteractions() {
    function setup() {
        const wrap = document.getElementById('tulip-hero-orb-wrap');
        const disc = document.getElementById('tulip-hero-disc');
        const emoji = document.getElementById('tulip-hero-emoji');
        const glow = document.getElementById('tulip-hero-glow');
        if (!wrap || !disc || !emoji) return;

        if (typeof gsap !== 'undefined') {
            startTulipIdle();

            let rafId = null;
            let mouseX = 0, mouseY = 0;

            const updateTilt = () => {
                gsap.to(disc, {
                    rotateY: mouseX * 8,
                    rotateX: -mouseY * 8,
                    scale: 1.02,
                    transformPerspective: 800,
                    duration: 0.28,
                    ease: "power2.out",
                    overwrite: "auto"
                });
                gsap.to(emoji, {
                    x: mouseX * 10,
                    y: mouseY * 10,
                    duration: 0.32,
                    ease: "power2.out",
                    overwrite: "auto"
                });
                if (glow) {
                    gsap.to(glow, {
                        scale: 1.08,
                        opacity: 0.85,
                        duration: 0.3,
                        overwrite: "auto"
                    });
                }
                rafId = null;
            };

            wrap.addEventListener('mousemove', (e) => {
                const rect = wrap.getBoundingClientRect();
                mouseX = (e.clientX - rect.left) / rect.width - 0.5;
                mouseY = (e.clientY - rect.top) / rect.height - 0.5;
                if (!rafId) {
                    rafId = requestAnimationFrame(updateTilt);
                }
            });

            wrap.addEventListener('mouseleave', () => {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
                gsap.to(disc, {
                    rotateY: 0,
                    rotateX: 0,
                    scale: 1,
                    duration: 0.45,
                    ease: "power2.out",
                    overwrite: "auto"
                });
                gsap.to(emoji, {
                    x: 0,
                    y: 0,
                    duration: 0.45,
                    ease: "power2.out",
                    overwrite: "auto",
                    onComplete: () => {
                        startTulipIdle();
                    }
                });
                if (glow) {
                    gsap.to(glow, {
                        scale: 1,
                        opacity: 0.6,
                        duration: 0.4,
                        overwrite: "auto"
                    });
                }
            });

            // Instant physical press feedback (Apple HIG)
            wrap.addEventListener('pointerdown', () => {
                gsap.to(disc, {
                    scale: 0.96,
                    duration: 0.12,
                    ease: "power2.out",
                    overwrite: "auto"
                });
                gsap.to(emoji, {
                    scale: 0.94,
                    duration: 0.12,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();

// Main Apple-Style Fluid Bloom Triggered on Click (Zero Jank, Zero Heavy DOM Allocation)
function tulipBurst(el) {
    if (!el) return;

    // 1. Audio design: responsive & clear
    if (typeof AudioManager !== 'undefined') {
        if (tulipBloomStep === TULIP_MESSAGES.length - 2) {
            AudioManager.play('celebration.wav', 0.85);
        } else {
            AudioManager.play('clickgirasol.wav', 0.65);
        }
    }

    // 2. Advance bloom state
    tulipBloomStep = (tulipBloomStep + 1) % TULIP_MESSAGES.length;
    const msg = TULIP_MESSAGES[tulipBloomStep];
    const isFullBloom = (tulipBloomStep === TULIP_MESSAGES.length - 1);

    const disc = document.getElementById('tulip-hero-disc') || el.querySelector('.rounded-full') || el;
    const tulipSpan = document.getElementById('tulip-hero-emoji') || el.querySelector('span') || el;
    const glow = document.getElementById('tulip-hero-glow');

    // 3. Apple Fluid Spring Physics
    if (typeof gsap !== 'undefined') {
        if (tulipIdleTween) tulipIdleTween.pause();

        // 3a. Tulip Spring Bounce
        gsap.killTweensOf(tulipSpan);
        if (isFullBloom) {
            const tl = gsap.timeline({
                onComplete: () => {
                    startTulipIdle();
                }
            });
            tl.to(tulipSpan, {
                scale: 1.3,
                rotation: 10,
                y: -10,
                duration: 0.2,
                ease: "power2.out"
            }).to(tulipSpan, {
                scale: 1,
                rotation: 0,
                y: 0,
                duration: 0.45,
                ease: "back.out(1.5)"
            });
        } else {
            const wiggle = (tulipBloomStep % 2 === 0 ? 5 : -5);
            const tl = gsap.timeline({
                onComplete: () => {
                    startTulipIdle();
                }
            });
            tl.to(tulipSpan, {
                scale: 1.18,
                rotation: wiggle,
                y: -8,
                duration: 0.16,
                ease: "power2.out"
            }).to(tulipSpan, {
                scale: 1,
                rotation: 0,
                y: 0,
                duration: 0.36,
                ease: "back.out(1.5)"
            });
        }

        // 3b. Tactile disc rebound
        gsap.killTweensOf(disc);
        gsap.fromTo(disc,
            { scale: 0.95 },
            { scale: 1, duration: 0.34, ease: "back.out(1.4)" }
        );

        // 3c. Glow pulse
        if (glow) {
            gsap.killTweensOf(glow);
            gsap.fromTo(glow,
                { opacity: 0.95, scale: isFullBloom ? 1.25 : 1.15 },
                { opacity: 0.6, scale: 1, duration: 0.5, ease: "power2.out" }
            );
        }

        // 3d. Segmented Petal Track with snappy feedback
        const track = document.getElementById('tulip-petals-track');
        if (track) {
            const dots = track.querySelectorAll('.petal-indicator-dot');
            dots.forEach((dot, idx) => {
                if (idx <= tulipBloomStep) {
                    dot.className = 'petal-indicator-dot h-1 w-3.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]';
                    if (idx === tulipBloomStep) {
                        gsap.fromTo(dot,
                            { scale: 1.35 },
                            { scale: 1, duration: 0.28, ease: "power2.out" }
                        );
                    }
                } else {
                    dot.className = 'petal-indicator-dot h-1 w-3.5 rounded-full bg-white/20';
                }
            });
        }

        // 3e. Status Text Crossfade (Instant & Crisp)
        const statusEl = document.getElementById('tulip-tap-status');
        if (statusEl) {
            const nextLabel = isFullBloom ? 'Floración completa' : `Pétalo ${tulipBloomStep + 1} de ${TULIP_MESSAGES.length}`;
            statusEl.textContent = nextLabel;
            gsap.killTweensOf(statusEl);
            gsap.fromTo(statusEl,
                { opacity: 0.3, y: 3 },
                { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
            );
        }

        // 3f. Secret Promise Card Crossfade (Instant & Snappy)
        const badgeEl = document.getElementById('tulip-petal-badge');
        const countEl = document.getElementById('tulip-petal-count');
        const textEl = document.getElementById('tulip-secret-text');
        const cardEl = document.getElementById('tulip-secret-card');

        if (textEl && badgeEl && countEl) {
            badgeEl.textContent = msg.badge;
            countEl.textContent = `Pétalo ${tulipBloomStep + 1} / ${TULIP_MESSAGES.length}`;
            textEl.textContent = msg.text;

            gsap.killTweensOf([badgeEl, countEl, textEl]);
            gsap.fromTo([badgeEl, countEl, textEl],
                { opacity: 0.4, y: 4 },
                { opacity: 1, y: 0, duration: 0.22, stagger: 0.03, ease: "power2.out" }
            );
        }

        if (cardEl) {
            if (isFullBloom) {
                gsap.to(cardEl, {
                    borderColor: 'rgba(251, 191, 36, 0.55)',
                    background: 'radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.22) 0%, rgba(251, 191, 36, 0.1) 60%, transparent 100%), rgba(22, 16, 26, 0.9)',
                    boxShadow: '0 0 35px rgba(244, 63, 94, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    duration: 0.4,
                    ease: "power2.out"
                });
            } else {
                gsap.to(cardEl, {
                    borderColor: 'rgba(244, 63, 94, 0.28)',
                    background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.10) 0%, rgba(236, 72, 153, 0.04) 50%, rgba(18, 14, 22, 0.65) 100%)',
                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                    duration: 0.3
                });
            }
        }
    } else {
        // Fallback for non-GSAP environments
        tulipSpan.style.transform = isFullBloom ? 'scale(1.25) rotate(6deg)' : 'scale(1.12)';
        setTimeout(() => { tulipSpan.style.transform = ''; }, 300);

        const badgeEl = document.getElementById('tulip-petal-badge');
        const countEl = document.getElementById('tulip-petal-count');
        const textEl = document.getElementById('tulip-secret-text');
        if (textEl && badgeEl && countEl) {
            badgeEl.textContent = msg.badge;
            countEl.textContent = `Pétalo ${tulipBloomStep + 1} / ${TULIP_MESSAGES.length}`;
            textEl.textContent = msg.text;
        }

        const track = document.getElementById('tulip-petals-track');
        if (track) {
            const dots = track.querySelectorAll('.petal-indicator-dot');
            dots.forEach((dot, idx) => {
                dot.className = (idx <= tulipBloomStep)
                    ? 'petal-indicator-dot h-1 w-3.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                    : 'petal-indicator-dot h-1 w-3.5 rounded-full bg-white/20';
            });
        }

        const statusEl = document.getElementById('tulip-tap-status');
        if (statusEl) {
            statusEl.textContent = isFullBloom ? 'Floración completa' : `Pétalo ${tulipBloomStep + 1} de ${TULIP_MESSAGES.length}`;
        }
    }

    // 4. Grand Finale Confetti ONLY on step 6 (Floración Completa)
    if (isFullBloom) {
        if (typeof window.confetti === 'function') {
            const rect = el.getBoundingClientRect();
            const cx = (rect.left + rect.width / 2) / window.innerWidth;
            const cy = (rect.top + rect.height / 2) / window.innerHeight;
            window.confetti({
                particleCount: 45,
                spread: 70,
                origin: { x: cx, y: cy },
                colors: ['#f43f5e', '#ec4899', '#fda4af', '#fb7185', '#fbbf24', '#ffffff']
            });
        }
    }
}

// Tulip color guide data & interaction
const tulipColorData = {
    rosa: {
        title: 'Tulipán Rosa — Afecto y Ternura',
        desc: 'Representa el amor tierno y genuino, la conexión emocional pura y los buenos deseos hacia la persona amada. Es tu flor, Yaire.',
        nameKey: 'tulips_cm_pink',
        descKey: 'tulips_cd_pink',
        border: '#ec4899',
        badge: 'Favorito de Yaire',
        code: 'ESPECÍMEN #01 · ROSA',
        sym: 'Amor Tierno',
        essence: 'Pura Conexión',
        dest: 'Yaire',
        auraColor: 'rgba(244, 63, 94, 0.45)',
        orbBg: 'radial-gradient(circle at 35% 30%, rgba(244, 63, 94, 0.4) 0%, rgba(10, 10, 14, 0.85) 100%)',
        orbGlow: '0 0 35px rgba(244, 63, 94, 0.5)',
        iconColor: '#fda4af',
        imgFilter: 'drop-shadow(0 8px 16px rgba(244, 63, 94, 0.55))',
        panelBg: 'radial-gradient(circle at 20% 30%, rgba(236, 72, 153, 0.16) 0%, transparent 65%), rgba(16, 16, 22, 0.82)',
        panelGlow: 'rgba(236, 72, 153, 0.3)'
    },
    rojo: {
        title: 'Tulipán Rojo — Amor Apasionado',
        desc: 'El tulipán rojo simboliza un amor intenso, profundo y declarado. Es la confesión más sincera de un corazón enamorado.',
        nameKey: 'tulips_cm_red',
        descKey: 'tulips_cd_red',
        border: '#ef4444',
        badge: 'Pasión & Fuego',
        code: 'ESPECÍMEN #02 · ROJO',
        sym: 'Amor Eterno',
        essence: 'Confesión Sincera',
        dest: 'Para ti',
        auraColor: 'rgba(239, 68, 68, 0.45)',
        orbBg: 'radial-gradient(circle at 35% 30%, rgba(239, 68, 68, 0.4) 0%, rgba(10, 10, 14, 0.85) 100%)',
        orbGlow: '0 0 35px rgba(239, 68, 68, 0.5)',
        iconColor: '#fca5a5',
        imgFilter: 'hue-rotate(-25deg) saturate(1.8) drop-shadow(0 8px 16px rgba(239, 68, 68, 0.55))',
        panelBg: 'radial-gradient(circle at 20% 30%, rgba(239, 68, 68, 0.16) 0%, transparent 65%), rgba(20, 14, 16, 0.82)',
        panelGlow: 'rgba(239, 68, 68, 0.3)'
    },
    amarillo: {
        title: 'Tulipán Amarillo — Alegría y Amistad',
        desc: 'Asociado a la felicidad, la energía positiva y la calidez de una sonrisa sincera. Representa también la esperanza.',
        nameKey: 'tulips_cm_yellow',
        descKey: 'tulips_cd_yellow',
        border: '#eab308',
        badge: 'Luz & Alegría',
        code: 'ESPECÍMEN #03 · AMARILLO',
        sym: 'Felicidad Viva',
        essence: 'Esperanza Cálida',
        dest: 'Nuestra Luz',
        auraColor: 'rgba(234, 179, 8, 0.45)',
        orbBg: 'radial-gradient(circle at 35% 30%, rgba(234, 179, 8, 0.4) 0%, rgba(10, 10, 14, 0.85) 100%)',
        orbGlow: '0 0 35px rgba(234, 179, 8, 0.5)',
        iconColor: '#fde047',
        imgFilter: 'hue-rotate(65deg) saturate(2) brightness(1.15) drop-shadow(0 8px 16px rgba(234, 179, 8, 0.55))',
        panelBg: 'radial-gradient(circle at 20% 30%, rgba(234, 179, 8, 0.16) 0%, transparent 65%), rgba(20, 18, 14, 0.82)',
        panelGlow: 'rgba(234, 179, 8, 0.3)'
    },
    blanco: {
        title: 'Tulipán Blanco — Perdón y Pureza',
        desc: 'Símbolo de paz, nuevos comienzos y un amor inmaculado. Perfecto para pedir perdón o empezar de cero.',
        nameKey: 'tulips_cm_white',
        descKey: 'tulips_cd_white',
        border: '#f8fafc',
        badge: 'Paz & Pureza',
        code: 'ESPECÍMEN #04 · BLANCO',
        sym: 'Amor Inmaculado',
        essence: 'Nuevo Comienzo',
        dest: 'Siempre',
        auraColor: 'rgba(255, 255, 255, 0.35)',
        orbBg: 'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(10, 10, 14, 0.85) 100%)',
        orbGlow: '0 0 35px rgba(255, 255, 255, 0.5)',
        iconColor: '#ffffff',
        imgFilter: 'grayscale(1) brightness(1.6) drop-shadow(0 8px 16px rgba(255, 255, 255, 0.55))',
        panelBg: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 65%), rgba(18, 18, 22, 0.82)',
        panelGlow: 'rgba(255, 255, 255, 0.3)'
    },
    morado: {
        title: 'Tulipán Morado — Realeza y Admiración',
        desc: "Históricamente asociado a la nobleza y el lujo. Regalar un tulipán morado dice: 'Te admiro profundamente'.",
        nameKey: 'tulips_cm_purple',
        descKey: 'tulips_cd_purple',
        border: '#8b5cf6',
        badge: 'Admiración',
        code: 'ESPECÍMEN #05 · MORADO',
        sym: 'Nobleza & Lujo',
        essence: 'Te Admiro',
        dest: 'Para ti',
        auraColor: 'rgba(139, 92, 246, 0.45)',
        orbBg: 'radial-gradient(circle at 35% 30%, rgba(139, 92, 246, 0.4) 0%, rgba(10, 10, 14, 0.85) 100%)',
        orbGlow: '0 0 35px rgba(139, 92, 246, 0.5)',
        iconColor: '#d8b4fe',
        imgFilter: 'hue-rotate(275deg) saturate(1.8) drop-shadow(0 8px 16px rgba(139, 92, 246, 0.55))',
        panelBg: 'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.16) 0%, transparent 65%), rgba(18, 14, 22, 0.82)',
        panelGlow: 'rgba(139, 92, 246, 0.3)'
    },
    naranja: {
        title: 'Tulipán Naranja — Energía y Pasión',
        desc: 'Combina la intensidad del rojo con la alegría del amarillo. Representa entusiasmo, vitalidad y una conexión vibrante.',
        nameKey: 'tulips_cm_orange',
        descKey: 'tulips_cd_orange',
        border: '#f97316',
        badge: 'Vitalidad',
        code: 'ESPECÍMEN #06 · NARANJA',
        sym: 'Entusiasmo Puro',
        essence: 'Conexión Vibrante',
        dest: 'Mi Energía',
        auraColor: 'rgba(249, 115, 22, 0.45)',
        orbBg: 'radial-gradient(circle at 35% 30%, rgba(249, 115, 22, 0.4) 0%, rgba(10, 10, 14, 0.85) 100%)',
        orbGlow: '0 0 35px rgba(249, 115, 22, 0.5)',
        iconColor: '#fed7aa',
        imgFilter: 'hue-rotate(40deg) saturate(2.2) brightness(1.05) drop-shadow(0 8px 16px rgba(249, 115, 22, 0.55))',
        panelBg: 'radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.16) 0%, transparent 65%), rgba(22, 16, 14, 0.82)',
        panelGlow: 'rgba(249, 115, 22, 0.3)'
    }
};

function applyColorData(data) {
    const dict = (typeof dictionary !== 'undefined' && dictionary[typeof currentLang !== 'undefined' ? currentLang : 'es'])
               ? dictionary[typeof currentLang !== 'undefined' ? currentLang : 'es']
               : (typeof dictionary !== 'undefined' && dictionary.es ? dictionary.es : null);

    const titleText = (dict && dict[data.nameKey]) ? dict[data.nameKey] : data.title;
    const descText = (dict && dict[data.descKey]) ? dict[data.descKey] : data.desc;

    const nameEl = document.getElementById('tulip-color-name');
    const descEl = document.getElementById('tulip-color-meaning');
    const badgeEl = document.getElementById('tulip-color-badge');
    const orbEl = document.getElementById('tulip-color-orb');
    const codeEl = document.getElementById('tulip-color-code');
    const symEl = document.getElementById('tulip-meta-sym');
    const essEl = document.getElementById('tulip-meta-essence');
    const destEl = document.getElementById('tulip-meta-dest');
    const auraEl = document.getElementById('tulip-ambient-aura');
    const display = document.getElementById('tulip-color-display');

    if (nameEl) nameEl.textContent = titleText;
    if (descEl) descEl.textContent = descText;
    if (badgeEl) {
        badgeEl.textContent = data.badge;
        badgeEl.style.color = data.iconColor;
    }
    if (codeEl) codeEl.textContent = data.code;
    if (symEl) symEl.textContent = data.sym;
    if (essEl) {
        essEl.textContent = data.essence;
        essEl.style.color = data.iconColor;
    }
    if (destEl) destEl.textContent = data.dest;

    if (orbEl) {
        orbEl.style.background = data.orbBg;
        orbEl.style.boxShadow = `${data.orbGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
        const emojiEl = document.getElementById('tulip-color-emoji') || orbEl.querySelector('#tulip-color-emoji');
        if (emojiEl && data.imgFilter) {
            emojiEl.style.filter = data.imgFilter;
        }
        const svg = orbEl.querySelector('svg');
        if (svg) {
            svg.style.color = data.iconColor;
            svg.style.filter = `drop-shadow(0 4px 14px ${data.panelGlow})`;
        }
        const img = orbEl.querySelector('#tulip-color-img') || orbEl.querySelector('img');
        if (img && data.imgFilter) {
            img.style.filter = data.imgFilter;
        }
    }

    if (auraEl) {
        auraEl.style.background = data.auraColor;
    }

    if (display) {
        display.style.background = data.panelBg;
        display.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        display.style.boxShadow = '0 4px 16px -2px rgba(0, 0, 0, 0.35), 0 24px 48px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)';
    }
}

let currentActiveTulipColor = null;

function closeTulipColor() {
    const drawer = document.getElementById('tulip-color-drawer');
    if (!drawer) return;

    if (typeof AudioManager !== 'undefined') {
        try { AudioManager.play('clickgirasol.wav', 0.3); } catch (e) {}
    }

    drawer.classList.remove('is-open');
    drawer.style.gridTemplateRows = '0fr';
    drawer.style.opacity = '0';
    drawer.style.pointerEvents = 'none';
    drawer.style.marginTop = '0';

    document.querySelectorAll('.tulip-color-btn').forEach(b => {
        b.classList.remove('active-color');
        const disc = b.querySelector('.swatch-disc');
        if (disc) {
            disc.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
            if (typeof gsap !== 'undefined') {
                gsap.to(disc, { scale: 1, duration: 0.25, ease: "power2.out" });
            } else {
                disc.style.transform = 'scale(1)';
            }
        }
        const label = b.querySelector('.swatch-label');
        if (label) {
            label.style.color = 'rgba(161, 161, 170, 0.7)';
            label.style.fontWeight = '500';
        }
    });

    currentActiveTulipColor = null;
}
window.closeTulipColor = closeTulipColor;

function showTulipColor(btn) {
    if (!btn) return;
    const color = btn.dataset.tulipColor;
    const data = tulipColorData[color];
    if (!data) return;

    const drawer = document.getElementById('tulip-color-drawer');
    const wasOpen = drawer && drawer.classList.contains('is-open');

    // Toggle closed if clicking the already open/active color
    if (currentActiveTulipColor === color && wasOpen) {
        closeTulipColor();
        return;
    }

    if (typeof AudioManager !== 'undefined') {
        try { AudioManager.play('revelacion.wav', 0.4); } catch (e) {}
    }

    currentActiveTulipColor = color;

    // Update all buttons in dock
    document.querySelectorAll('.tulip-color-btn').forEach(b => {
        b.classList.remove('active-color');
        const disc = b.querySelector('.swatch-disc');
        if (disc) {
            disc.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
            if (typeof gsap !== 'undefined') {
                gsap.to(disc, { scale: 1, duration: 0.25, ease: "power2.out" });
            } else {
                disc.style.transform = 'scale(1)';
            }
        }
        const label = b.querySelector('.swatch-label');
        if (label) {
            label.style.color = 'rgba(161, 161, 170, 0.7)';
            label.style.fontWeight = '500';
        }
    });

    btn.classList.add('active-color');
    const activeDisc = btn.querySelector('.swatch-disc');
    if (activeDisc) {
        activeDisc.style.boxShadow = `0 0 0 3px #09090B, 0 0 0 5px ${data.border}, 0 0 24px ${data.auraColor}`;
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(activeDisc, { scale: 0.96 }, { scale: 1.14, duration: 0.35, ease: "back.out(2)" });
        } else {
            activeDisc.style.transform = 'scale(1.14)';
        }
    }
    const activeLabel = btn.querySelector('.swatch-label');
    if (activeLabel) {
        activeLabel.style.color = '#FFFFFF';
        activeLabel.style.fontWeight = '700';
    }

    applyColorData(data);

    if (drawer) {
        drawer.classList.add('is-open');
        drawer.style.gridTemplateRows = '1fr';
        drawer.style.opacity = '1';
        drawer.style.pointerEvents = 'auto';
        drawer.style.marginTop = '1.5rem';
    }

    const textContainer = document.getElementById('tulip-text-container');
    const orbEl = document.getElementById('tulip-color-orb');
    const displayCard = document.getElementById('tulip-color-display');

    if (typeof gsap !== 'undefined') {
        if (!wasOpen && displayCard) {
            // First time opening: smooth Apple slide & scale
            gsap.fromTo(displayCard,
                { opacity: 0, y: 16, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "power2.out" }
            );
        } else if (textContainer) {
            // Switching between colors: crisp text crossfade
            gsap.fromTo(textContainer,
                { opacity: 0.3, y: 4 },
                { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }
            );
            if (orbEl) {
                gsap.fromTo(orbEl, { scale: 0.94 }, { scale: 1, duration: 0.32, ease: "back.out(1.5)" });
            }
        }
    }
}
window.showTulipColor = showTulipColor;

// Sync tulip promise counter in real time with the relationship start date
(function syncTulipPromise() {
    function computeLiveDays() {
        // Exact start date of relationship: January 28, 2026
        const start = new Date('2026-01-28T00:00:00').getTime();
        const now = Date.now();
        return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    }

    const dst = document.getElementById('tulip-promise-days');
    const src = document.getElementById('total-days-count');

    function update() {
        if (!dst) return;
        if (src && src.textContent && src.textContent.trim() !== '0') {
            dst.textContent = src.textContent.trim();
        } else {
            dst.textContent = computeLiveDays();
        }
    }

    update();

    if (src && dst) {
        const obs = new MutationObserver(() => {
            if (src.textContent && src.textContent.trim() !== '0') {
                dst.textContent = src.textContent.trim();
            }
        });
        obs.observe(src, { childList: true, characterData: true, subtree: true });
    }

    // Refresh every minute to ensure real-time rollover at midnight
    setInterval(update, 60000);
})();

// Carousel controls for botanical curiosities
function scrollTulipFacts(dir) {
    const carousel = document.getElementById('tulip-facts-carousel');
    if (!carousel) return;
    if (typeof AudioManager !== 'undefined') AudioManager.play('transicion.wav', 0.25);
    const card = carousel.firstElementChild;
    const step = card ? (card.offsetWidth + 16) : 320;
    if (typeof gsap !== 'undefined') {
        gsap.to(carousel, {
            scrollLeft: carousel.scrollLeft + dir * step,
            duration: 0.45,
            ease: "power2.out"
        });
    } else {
        carousel.scrollBy({ left: dir * step, behavior: 'smooth' });
    }
}

(function initTulipFactsCarousel() {
    function setup() {
        const carousel = document.getElementById('tulip-facts-carousel');
        const dotsContainer = document.getElementById('tulip-facts-dots');
        if (!carousel || !dotsContainer) return;

        const cards = carousel.children;
        const total = cards.length;
        dotsContainer.innerHTML = '';

        for (let i = 0; i < total; i++) {
            const dot = document.createElement('button');
            dot.className = 'h-1.5 rounded-full transition-all duration-300 ' + (i === 0 ? 'bg-rose-400 w-4' : 'bg-white/20 w-1.5');
            dot.setAttribute('aria-label', 'Curiosidad ' + (i + 1));
            dot.addEventListener('click', () => {
                const card = cards[i];
                if (card) {
                    if (typeof AudioManager !== 'undefined') AudioManager.play('transicion.wav', 0.2);
                    if (typeof gsap !== 'undefined') {
                        gsap.to(carousel, {
                            scrollLeft: card.offsetLeft - carousel.offsetLeft,
                            duration: 0.45,
                            ease: "power2.out"
                        });
                    } else {
                        carousel.scrollTo({ left: card.offsetLeft - carousel.offsetLeft, behavior: 'smooth' });
                    }
                }
            });
            dotsContainer.appendChild(dot);
        }

        carousel.addEventListener('scroll', () => {
            const scrollLeft = carousel.scrollLeft;
            const index = Math.round(scrollLeft / (cards[0] ? cards[0].offsetWidth + 16 : 300));
            const dots = dotsContainer.children;
            for (let i = 0; i < dots.length; i++) {
                if (i === Math.min(index, total - 1)) {
                    dots[i].className = 'w-4 h-1.5 rounded-full bg-rose-400 transition-all duration-300';
                } else {
                    dots[i].className = 'w-1.5 h-1.5 rounded-full bg-white/20 transition-all duration-300';
                }
            }
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();

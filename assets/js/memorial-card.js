/**
 * memorial-card.js
 * Lightweight Ethereal Celestial Particle Engine & Counter for Yahir Memorial Section
 */
(function () {
    const card = document.getElementById('memorial-card');
    const canvas = document.getElementById('memorial-canvas');
    if (!card || !canvas) return;

    // Ensure card and all internal elements are immediately visible (never stuck at opacity 0)
    card.style.opacity = '1';
    card.style.transform = 'none';
    card.querySelectorAll('.memorial-staggered, .memorial-svg-container, .memorial-divider').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.classList.add('visible');
    });

    // ── 1. TIME COUNTER (Preserved exact calculation) ──
    const counterEl = document.getElementById('memorial-counter');
    function updateCounter() {
        if (!counterEl) return;
        const departure = new Date(2025, 11, 23); // Dec 23, 2025
        const now = new Date();
        let months = (now.getFullYear() - departure.getFullYear()) * 12 + (now.getMonth() - departure.getMonth());
        let days = now.getDate() - departure.getDate();
        if (days < 0) {
            months--;
            const prev = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prev.getDate();
        }
        if (months >= 12) {
            const years = Math.floor(months / 12);
            const rem = months % 12;
            counterEl.textContent = years + (years === 1 ? ' año' : ' años') + (rem > 0 ? ', ' + rem + (rem === 1 ? ' mes' : ' meses') : '') + ' y ' + days + (days === 1 ? ' día' : ' días') + ' desde su partida';
        } else {
            counterEl.textContent = months + (months === 1 ? ' mes' : ' meses') + ' y ' + days + (days === 1 ? ' día' : ' días') + ' desde su partida';
        }
    }
    updateCounter();
    setInterval(updateCounter, 60000);

    // ── 2. INTERACTIVE SPECULAR MOUSE TRACKING ──
    let cardRect = null;
    function updateCardRect() {
        cardRect = card.getBoundingClientRect();
    }

    let _cardRaf;
    card.addEventListener('mouseenter', updateCardRect, { passive: true });
    card.addEventListener('mousemove', (e) => {
        if (_cardRaf) return;
        _cardRaf = requestAnimationFrame(() => {
            _cardRaf = null;
            if (!cardRect) updateCardRect();
            const x = e.clientX - cardRect.left;
            const y = e.clientY - cardRect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    }, { passive: true });

    // ── 3. ULTRA-LIGHTWEIGHT CELESTIAL PARTICLES CANVAS ──
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w = 0, h = 0;
    let dpr = 1;
    let animFrame = null;
    let isCanvasVisible = false;

    function resize() {
        updateCardRect();
        const rect = cardRect || card.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = Math.max(1, rect.width);
        h = Math.max(1, rect.height);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial) {
            this.x = Math.random() * w;
            this.y = initial ? Math.random() * h : h + 10;
            this.size = Math.random() * 1.8 + 0.7;
            this.baseAlpha = Math.random() * 0.45 + 0.2;
            this.speedY = -(Math.random() * 0.3 + 0.08);
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.life = Math.random() * 0.85 + 0.3;
            this.swayOffset = Math.random() * Math.PI * 2;
            this.swaySpeed = Math.random() * 0.018 + 0.006;
            this.twinkleOffset = Math.random() * Math.PI * 2;
            this.twinkleSpeed = Math.random() * 0.035 + 0.015;

            const colorRoll = Math.random();
            if (colorRoll < 0.55) {
                this.color = '255, 225, 140';
            } else if (colorRoll < 0.85) {
                this.color = '255, 245, 200';
            } else {
                this.color = '255, 255, 255';
            }
        }

        update(time) {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(time * this.swaySpeed + this.swayOffset) * 0.25;
            this.life -= 0.0015;

            if (this.y < -15 || this.x < -15 || this.x > w + 15 || this.life <= 0) {
                this.reset(false);
            }
        }

        draw(time) {
            const twinkle = Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.25;
            const currentAlpha = Math.max(0, Math.min(1, (this.baseAlpha + twinkle) * Math.min(1, this.life * 2.5)));
            if (currentAlpha <= 0.02) return;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${currentAlpha.toFixed(2)})`;
            ctx.fill();
        }
    }

    function initParticles() {
        resize();
        particles = [];
        const count = window.innerWidth < 768 ? 18 : 32;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    let pTime = 0;
    function loop() {
        if (!isCanvasVisible) {
            animFrame = null;
            return;
        }
        pTime += 1;
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(pTime);
            particles[i].draw(pTime);
        }

        animFrame = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize, { passive: true });
    initParticles();

    // Pause canvas RAF when section is off-screen
    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    isCanvasVisible = true;
                    resize();
                    if (!animFrame) loop();
                } else {
                    isCanvasVisible = false;
                }
            });
        }, { rootMargin: '150px 0px' });
        obs.observe(card);
    }
})();

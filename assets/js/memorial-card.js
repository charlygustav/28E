
                (function () {
                    const card = document.getElementById('memorial-card');
                    const canvas = document.getElementById('memorial-canvas');
                    if (!card || !canvas) return;

                    // ── Time counter ──
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

                    // ── Hover glow ──
                    let cardRect = null;
                    function updateCardRect() {
                        cardRect = card.getBoundingClientRect();
                    }
                    updateCardRect();

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
                            mousePos.x = x;
                            mousePos.y = y;
                        });
                    });

                    card.addEventListener('mouseleave', () => {
                        mousePos.x = null;
                        mousePos.y = null;
                    });

                    // ── Particles Canvas ──
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
                            this.size = Math.random() * 2 + 0.8;
                            this.speedY = -(Math.random() * 0.4 + 0.1);
                            this.speedX = (Math.random() - 0.5) * 0.3;
                            this.life = Math.random() * 0.8 + 0.2;
                            this.glow = Math.random() * 0.5 + 0.3;
                            this.baseColor = Math.random() > 0.3 ? '255, 220, 150' : '255, 255, 255';
                        }
                        update() {
                            this.y += this.speedY;
                            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.4;
                            this.life -= 0.002;

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

                            if (alpha > 0.6) {
                                ctx.shadowBlur = 8;
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
                        for (let i = 0; i < 70; i++) particles.push(new Particle());
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

                    // Start particles immediately to ensure they show up
                    initParticles();
                    loop();

                    // Intersection Observer for animations
                    const obs = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const staggers = card.querySelectorAll('.memorial-staggered');
                                staggers.forEach(el => el.classList.add('visible'));
                                if (!animFrame) loop();
                            } else {
                                if (animFrame) {
                                    cancelAnimationFrame(animFrame);
                                    animFrame = null;
                                }
                            }
                        });
                    }, { threshold: 0.15 });

                    setTimeout(() => {
                        obs.observe(card);
                    }, 300);
                })();
            
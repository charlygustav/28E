
        (function () {
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
                    overlay.querySelectorAll('#celeb-number, #celeb-title, #celeb-subtitle, #celeb-enter-btn').forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
                    return;
                }
                var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
                tl.to('#celeb-number', { opacity: 1, scale: 1, duration: 1.5, ease: 'elastic.out(1, 0.5)' }, 0.3);
                tl.to('#celeb-title', { opacity: 1, y: 0, duration: 1 }, 1.0);
                tl.to('#celeb-subtitle', { opacity: 1, y: 0, duration: 0.8 }, 1.4);
                tl.to('#celeb-enter-btn', { opacity: 1, y: 0, duration: 0.8 }, 1.8);
                tl.call(function () { launchFireworks(); }, null, 1.2);
                tl.call(function () { startConfetti(); }, null, 1.5);
            }

            function launchFireworks() {
                var canvas = document.getElementById('celebration-canvas');
                if (!canvas) return;
                var ctx = canvas.getContext('2d');
                canvas.width = window.innerWidth; canvas.height = window.innerHeight;
                var colors = ['#f59e0b', '#ec4899', '#fbbf24', '#f472b6', '#fff', '#a78bfa', '#34d399'];
                var particles = [];
                var animId;
                function createBurst(x, y) {
                    var count = 60 + Math.floor(Math.random() * 40);
                    for (var i = 0; i < count; i++) {
                        var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
                        var speed = 2 + Math.random() * 5;
                        particles.push({ x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, decay: 0.012 + Math.random() * 0.015, color: colors[Math.floor(Math.random() * colors.length)], size: 1.5 + Math.random() * 2.5, trail: [] });
                    }
                }
                function animate() {
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.fillStyle = 'rgba(0,0,0,0.15)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.globalCompositeOperation = 'lighter';
                    particles = particles.filter(function (p) { return p.life > 0; });
                    particles.forEach(function (p) {
                        p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 5) p.trail.shift();
                        p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.vx *= 0.99; p.life -= p.decay;
                        p.trail.forEach(function (t, i) { ctx.beginPath(); ctx.arc(t.x, t.y, p.size * (i / p.trail.length) * 0.5, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.globalAlpha = p.life * (i / p.trail.length) * 0.3; ctx.fill(); });
                        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.fill(); ctx.globalAlpha = 1;
                    });
                    var ov = document.getElementById('celebration-overlay');
                    if (particles.length > 0 || (ov && ov.style.display !== 'none')) { animId = requestAnimationFrame(animate); }
                }
                animate();
                var w = canvas.width, h = canvas.height;
                createBurst(w * 0.5, h * 0.35);
                setTimeout(function () { createBurst(w * 0.25, h * 0.3); }, 400);
                setTimeout(function () { createBurst(w * 0.75, h * 0.25); }, 700);
                setTimeout(function () { createBurst(w * 0.4, h * 0.2); }, 1100);
                setTimeout(function () { createBurst(w * 0.6, h * 0.35); }, 1500);
                var burstCount = 0;
                var burstInterval = setInterval(function () {
                    if (burstCount > 15 || !document.getElementById('celebration-overlay') || document.getElementById('celebration-overlay').style.display === 'none') { clearInterval(burstInterval); return; }
                    createBurst(w * (0.15 + Math.random() * 0.7), h * (0.1 + Math.random() * 0.4)); burstCount++;
                }, 2000);
                window.__celebCleanup = function () { cancelAnimationFrame(animId); clearInterval(burstInterval); ctx.clearRect(0, 0, canvas.width, canvas.height); };
            }

            function startConfetti() {
                var container = document.getElementById('confetti-container');
                if (!container || typeof gsap === 'undefined') return;
                var confettiColors = ['#f59e0b', '#ec4899', '#fbbf24', '#f472b6', '#a78bfa', '#34d399', '#fff'];
                var shapes = ['rect', 'circle', 'strip'];
                var confettiInterval;
                function spawnConfetti() {
                    for (var i = 0; i < 4; i++) {
                        var el = document.createElement('div');
                        var shape = shapes[Math.floor(Math.random() * shapes.length)];
                        el.className = 'celeb-confetti ' + shape;
                        el.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                        el.style.left = Math.random() * 100 + '%'; el.style.top = '-20px';
                        container.appendChild(el);
                        gsap.to(el, { y: window.innerHeight + 50, x: (Math.random() - 0.5) * 200, rotation: Math.random() * 720 - 360, opacity: 0, duration: 3 + Math.random() * 3, ease: 'power1.in', onComplete: function () { if (el.parentNode) el.remove(); } });
                    }
                }
                for (var i = 0; i < 8; i++) { setTimeout(spawnConfetti, i * 100); }
                confettiInterval = setInterval(spawnConfetti, 400);
                setTimeout(function () { clearInterval(confettiInterval); }, 20000);
                window.__confettiCleanup = function () { clearInterval(confettiInterval); };
            }

            window.dismissCelebration = function () {
                var ov = document.getElementById('celebration-overlay');
                if (!ov) return;
                if (typeof gsap !== 'undefined') {
                    gsap.to(ov, { opacity: 0, scale: 1.05, duration: 0.8, ease: 'power2.inOut', onComplete: function () { ov.style.display = 'none'; if (window.__celebCleanup) window.__celebCleanup(); if (window.__confettiCleanup) window.__confettiCleanup(); } });
                } else { ov.style.opacity = '0'; setTimeout(function () { ov.style.display = 'none'; }, 800); }
            };

            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (m) {
                    if (m.type === 'attributes' && m.attributeName === 'class' && document.body.classList.contains('page-ready')) {
                        observer.disconnect();
                        setTimeout(showCelebration, 600);
                    }
                });
            });
            observer.observe(document.body, { attributes: true });
            if (document.body.classList.contains('page-ready')) { setTimeout(showCelebration, 600); }
        })();
    
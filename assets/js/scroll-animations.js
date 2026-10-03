
        (function () {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
            gsap.registerPlugin(ScrollTrigger);

            function initAnimations() {

                // ─── 1. UNIVERSE CAROUSEL SLIDES — fly in from the right ─────
                var univCarousel = document.getElementById('universe-carousel');
                if (univCarousel) {
                    var slides = Array.from(univCarousel.children);
                    gsap.set(slides, { opacity: 0, x: 80, scale: 0.96 });
                    gsap.to(slides, {
                        opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out', stagger: 0.18,
                        scrollTrigger: { trigger: univCarousel, start: 'top 90%', once: true }
                    });
                }

                // ─── 2. SONG CARDS — cascade up ──────────────────────────────
                var songGrid = document.querySelector('#universo .grid');
                if (songGrid) {
                    var songCards = Array.from(songGrid.children);
                    gsap.set(songCards, { opacity: 0, y: 60, scale: 0.94 });
                    gsap.to(songCards, {
                        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.3)', stagger: 0.14,
                        scrollTrigger: { trigger: songGrid, start: 'top 90%', once: true }
                    });
                }

                // ─── 3. TULIP MEANING CARDS — fan out ────────────────────────
                var tulipCards = Array.from(document.querySelectorAll('.tulip-meaning-card'));
                if (tulipCards.length) {
                    var tGrid = tulipCards[0].closest('.grid') || tulipCards[0];
                    gsap.set(tulipCards, { opacity: 0, y: 50, rotationY: -20 });
                    gsap.to(tulipCards, {
                        opacity: 1, y: 0, rotationY: 0, duration: 0.85, ease: 'power3.out', stagger: 0.12,
                        scrollTrigger: { trigger: tGrid, start: 'top 90%', once: true }
                    });
                }

                // ─── 4. YAIRE NAME LETTERS — bounce down from top ────────────
                var nameLetters = Array.from(document.querySelectorAll('.name-letter'));
                if (nameLetters.length) {
                    gsap.set(nameLetters, { opacity: 0, y: -80, scale: 1.4 });
                    gsap.to(nameLetters, {
                        opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.1,
                        scrollTrigger: { trigger: '.name-container', start: 'top 85%', once: true }
                    });
                }

                // ─── 5. PROMISE FLIP CARDS — rise dramatically ───────────────
                var promiseCards = Array.from(document.querySelectorAll('.promise-card-wrap'));
                if (promiseCards.length) {
                    var pGrid = promiseCards[0].closest('.grid') || promiseCards[0];
                    gsap.set(promiseCards, { opacity: 0, y: 80, scale: 0.92 });
                    gsap.to(promiseCards, {
                        opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', stagger: 0.2,
                        scrollTrigger: { trigger: pGrid, start: 'top 90%', once: true }
                    });
                }

                // ─── 6. COLOR PALETTE CARDS — alternate sides ────────────────
                var pcCards = Array.from(document.querySelectorAll('.pc-card'));
                pcCards.forEach(function (card, i) {
                    gsap.set(card, { opacity: 0, x: i % 2 === 0 ? -60 : 60, scale: 0.95 });
                    gsap.to(card, {
                        opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'power2.out',
                        scrollTrigger: { trigger: card, start: 'top 92%', once: true }
                    });
                });

                // ─── 7. TULIP COLOR BUTTONS — pop in with stagger ────────────
                var colorBtns = Array.from(document.querySelectorAll('.tulip-color-btn'));
                if (colorBtns.length) {
                    gsap.set(colorBtns, { opacity: 0, scale: 0.6, y: 20 });
                    gsap.to(colorBtns, {
                        opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2.5)', stagger: 0.06,
                        scrollTrigger: { trigger: '#tulip-color-grid', start: 'top 88%', once: true }
                    });
                }

                // ─── 8. BOARDING PASS — tilt from below ──────────────────────
                var boardingPass = document.getElementById('boarding-pass');
                if (boardingPass) {
                    gsap.set(boardingPass, { opacity: 0, y: 60, rotationX: 6 });
                    gsap.to(boardingPass, {
                        opacity: 1, y: 0, rotationX: 0, duration: 1.1, ease: 'power3.out',
                        scrollTrigger: { trigger: boardingPass, start: 'top 88%', once: true }
                    });
                }

                // ─── 9. HISTORIA / COMIDA / NOMBRE GRID CARDS ────────────────
                ['#nombre .grid > div', '#historia .grid > div', '#comida .grid > div'].forEach(function (sel) {
                    var cards = Array.from(document.querySelectorAll(sel));
                    if (!cards.length) return;
                    var grid = cards[0].closest('.grid');
                    gsap.set(cards, { opacity: 0, y: 40 });
                    gsap.to(cards, {
                        opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', stagger: 0.15,
                        scrollTrigger: { trigger: grid, start: 'top 88%', once: true }
                    });
                });

                // ─── 10. SECTION TITLES (H2) ─────────────────────────────────
                var sectionTitles = Array.from(document.querySelectorAll('.cv-section h2, .section-title, .enigma-title'));
                sectionTitles.forEach(function (title) {
                    gsap.fromTo(title,
                        { opacity: 0, y: 30, scale: 0.95 },
                        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: title, start: 'top 92%', once: true } }
                    );
                });

                // ─── 11. GSAP HOVER INTERACTIONS FOR BUTTONS ─────────────────
                var interactableBtns = document.querySelectorAll('.menu-link-item, .vault-btn, .tulip-color-btn, #spotlight-play-btn, .game-card');
                interactableBtns.forEach(function (btn) {
                    // Pre-bind hardware acceleration to prevent jumpiness on first hover
                    gsap.set(btn, { force3D: true });
                    btn.addEventListener('mouseenter', function () {
                        gsap.to(btn, { scale: 1.04, duration: 0.4, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
                    });
                    btn.addEventListener('mouseleave', function () {
                        gsap.to(btn, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
                    });
                    btn.addEventListener('mousedown', function () {
                        gsap.to(btn, { scale: 0.94, duration: 0.1, overwrite: 'auto' });
                    });
                    btn.addEventListener('mouseup', function () {
                        gsap.to(btn, { scale: 1.04, duration: 0.4, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
                    });
                });

                // ─── 12. CONTINUOUS SUBTLE FLOATING (YOYO) ───────────────────
                var floatingIcons = document.querySelectorAll('.menu-link-icon, .menu-new-badge');
                floatingIcons.forEach(function (icon) {
                    gsap.set(icon, { force3D: true });
                    var delay = Math.random() * 1.5;
                    if (icon.classList.contains('menu-new-badge')) {
                        gsap.to(icon, { scale: 1.08, duration: 0.8, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: delay });
                    } else {
                        gsap.to(icon, { y: -3, duration: 2 + Math.random(), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: delay });
                    }
                });

                // ─── 13. HERO SECTION REVEAL ─────────────────────────────────
                var heroElements = document.querySelectorAll('#hero-title, #hero-subtitle, #hero-countdown');
                if (heroElements.length) {
                    gsap.fromTo(heroElements,
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.2, delay: 0.2 }
                    );
                }
            }

            // Wait until loader is fully hidden before setting up animations
            function waitForLoader() {
                var loader = document.getElementById('loader');
                if (!loader || loader.style.display === 'none' || loader.classList.contains('hidden')) {
                    setTimeout(initAnimations, 400);
                } else {
                    setTimeout(waitForLoader, 250);
                }
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function () { setTimeout(waitForLoader, 600); });
            } else {
                setTimeout(waitForLoader, 600);
            }
        })();
    
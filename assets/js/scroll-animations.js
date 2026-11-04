(function () {
    'use strict';

    // 1. Ensure all interior section cards, titles, and interactive elements remain 100% visible
    function ensureVisibility() {
        var selectors = [
            '#universe-carousel > *',
            '#universo .grid > *',
            '.tulip-meaning-card',
            '.promise-card-wrap',
            '.pc-card',
            '.tulip-color-btn',
            '#boarding-pass',
            '#nombre .grid > div',
            '#comida .grid > div',
            '.cv-section h2',
            '.section-title',
            '.enigma-title',
            '#hero-title',
            '#hero-subtitle',
            '#hero-countdown'
        ];
        var els = document.querySelectorAll(selectors.join(', '));
        for (var i = 0; i < els.length; i++) {
            els[i].style.opacity = '1';
            els[i].style.transform = 'none';
        }
    }

    // 2. Apple Design & Emil Kowalski Fluid Scroll Entrance System
    function initAppleScrollEntrances() {
        // Respect reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Dynamically select all content sections (excluding the top hero which has its own entry)
        var sections = document.querySelectorAll('section[id]:not(#epidemic-hero)');
        if (!sections || sections.length === 0) return;

        var vh = window.innerHeight || document.documentElement.clientHeight;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var el = entry.target;
                if (entry.isIntersecting) {
                    // Trigger fluid Apple entrance
                    el.classList.add('apple-entered');
                } else {
                    // When scrolled back above (element goes below viewport), re-arm for clean re-entrance
                    var rect = entry.boundingClientRect;
                    if (rect.top > vh + 30) {
                        el.classList.remove('apple-entered');
                    }
                }
            });
        }, {
            threshold: 0.04,
            rootMargin: '0px 0px -10px 0px'
        });

        sections.forEach(function (sec) {
            var rect = sec.getBoundingClientRect();
            // If already visible or above the viewport on initial page load, reveal immediately
            if (rect.top < vh * 0.85) {
                sec.classList.add('apple-section-enter', 'apple-entered');
            } else {
                sec.classList.add('apple-section-enter');
            }
            observer.observe(sec);
        });

        // Instant reveal on menu click / hash navigation
        function revealTarget(targetId) {
            if (!targetId) return;
            var clean = targetId.replace(/^#/, '');
            var targetEl = document.getElementById(clean);
            if (targetEl) {
                targetEl.classList.add('apple-entered');
            }
        }

        window.addEventListener('hashchange', function () {
            revealTarget(window.location.hash);
        });

        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function () {
                revealTarget(link.getAttribute('href'));
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            ensureVisibility();
            initAppleScrollEntrances();
        });
    } else {
        ensureVisibility();
        initAppleScrollEntrances();
    }
})();

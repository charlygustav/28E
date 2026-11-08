/**
 * 28E Hero Dynamic Phrases
 * Rotación cinematográfica y fluida de frases en el Gran Titular Hero
 * Inspirado en la filosofía de movimiento de Apple & Emil Kowalski (GPU transforms, micro-stagger)
 */
(function () {
    'use strict';

    if (window.__HERO_PHRASES_INITIALIZED__) return;
    window.__HERO_PHRASES_INITIALIZED__ = true;

    const HERO_PHRASES = [
        {
            line1: "Mi lugar favorito",
            line2: 'sigue siendo <em class="italic" style="font-style: italic; font-family: inherit;">contigo.</em>'
        },
        {
            line1: "Entre millones de historias,",
            line2: 'siempre elijo la <em class="italic" style="font-style: italic; font-family: inherit;">nuestra.</em>'
        },
        {
            line1: "No existe distancia",
            line2: 'que apague este <em class="italic" style="font-style: italic; font-family: inherit;">amor.</em>'
        },
        {
            line1: "Una hermosa casualidad",
            line2: 'convertida en mi <em class="italic" style="font-style: italic; font-family: inherit;">certeza.</em>'
        },
        {
            line1: "El universo entero",
            line2: 'se detiene en tu <em class="italic" style="font-style: italic; font-family: inherit;">sonrisa.</em>'
        },
        {
            line1: "De tu mano,",
            line2: 'hasta el fin del <em class="italic" style="font-style: italic; font-family: inherit;">mundo.</em>'
        }
    ];

    let currentIndex = 0;
    let isAnimating = false;
    let rotationTimer = null;

    const DISPLAY_DURATION = 5000; // 5 segundos de lectura automática continua por frase

    function initHeroPhrases() {
        const titleEl = document.getElementById('hero-main-title') || document.querySelector('#epidemic-hero h1');
        if (!titleEl) return;

        const line1 = document.getElementById('hero-line-1') || titleEl.querySelector('[data-i18n="hero_title1"]');
        const line2 = document.getElementById('hero-line-2') || titleEl.querySelector('[data-i18n="hero_title2"]');
        if (!line1 || !line2) return;

        // Asignar IDs si no los tienen
        if (!titleEl.id) titleEl.id = 'hero-main-title';
        if (!line1.id) line1.id = 'hero-line-1';
        if (!line2.id) line2.id = 'hero-line-2';

        // Estilos para aceleración por hardware y transiciones suaves
        [line1, line2].forEach(el => {
            el.style.willChange = 'transform, opacity';
            el.style.transformOrigin = 'center center';
        });

        function changeToNextPhrase() {
            if (isAnimating) return;
            isAnimating = true;

            currentIndex = (currentIndex + 1) % HERO_PHRASES.length;
            const nextPhrase = HERO_PHRASES[currentIndex];

            if (window.gsap) {
                const tl = window.gsap.timeline({
                    onComplete: () => {
                        isAnimating = false;
                        scheduleNext(); // Re-armar el temporizador automático inmediatamente tras terminar la animación
                    }
                });

                // Fase 1: Desvanecimiento y elevación sutil de la frase actual
                tl.to([line1, line2], {
                    y: -18,
                    opacity: 0,
                    scale: 0.98,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "power2.in",
                    onComplete: () => {
                        // Actualizar contenido
                        line1.textContent = nextPhrase.line1;
                        line2.innerHTML = nextPhrase.line2;

                        // Preparar entrada desde abajo
                        window.gsap.set([line1, line2], {
                            y: 20,
                            opacity: 0,
                            scale: 0.98
                        });
                    }
                });

                // Fase 2: Entrada fluida y asentamiento cinematográfico
                tl.to([line1, line2], {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.07,
                    ease: "power3.out"
                });

            } else {
                // Respaldo CSS si GSAP no está disponible
                line1.style.transition = 'opacity 300ms ease, transform 300ms ease';
                line2.style.transition = 'opacity 300ms ease 50ms, transform 300ms ease 50ms';
                line1.style.opacity = '0';
                line1.style.transform = 'translateY(-16px)';
                line2.style.opacity = '0';
                line2.style.transform = 'translateY(-16px)';

                setTimeout(() => {
                    line1.textContent = nextPhrase.line1;
                    line2.innerHTML = nextPhrase.line2;
                    line1.style.transform = 'translateY(16px)';
                    line2.style.transform = 'translateY(16px)';

                    requestAnimationFrame(() => {
                        line1.style.opacity = '1';
                        line1.style.transform = 'translateY(0)';
                        line2.style.opacity = '1';
                        line2.style.transform = 'translateY(0)';
                        isAnimating = false;
                        scheduleNext();
                    });
                }, 320);
            }
        }

        function scheduleNext() {
            clearTimeout(rotationTimer);
            if (document.hidden) return; // Solo pausar si la pestaña está en segundo plano

            rotationTimer = setTimeout(() => {
                changeToNextPhrase();
            }, DISPLAY_DURATION);
        }

        // Tocar o hacer clic para pasar a la siguiente frase inmediatamente (opcional)
        titleEl.addEventListener('click', () => {
            if (isAnimating) return;
            clearTimeout(rotationTimer);
            changeToNextPhrase();
        });

        // Pausa y reanudación si la pestaña se oculta / vuelve a enfocarse
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearTimeout(rotationTimer);
            } else {
                scheduleNext();
            }
        });

        // Iniciar el ciclo de rotación automática
        scheduleNext();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroPhrases);
    } else {
        initHeroPhrases();
    }
})();


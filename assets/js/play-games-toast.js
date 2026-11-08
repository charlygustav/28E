/**
 * 28E Play Games Toast
 * Diseño Editorial & Minimalista con las Tipografías Oficiales de 28E (Sebenta / Fraunces & Plus Jakarta Sans)
 * Muestra el saludo oficial a la cuenta de usuario conectada al abrir cualquier juego o experiencia.
 */
(function () {
    'use strict';

    // 0. Sincronizar y limpiar parámetros de auth de la URL al instante para que la barra de direcciones quede 100% impecable
    (function cleanAuthParamsFromUrl() {
        try {
            const urlObj = new URL(window.location.href);
            const u = urlObj.searchParams.get('user') || urlObj.searchParams.get('u');
            const av = urlObj.searchParams.get('avatar') || urlObj.searchParams.get('av');
            let shouldClean = false;

            if (u || av) {
                let current = {};
                try {
                    const raw = localStorage.getItem('yaire_auth_user');
                    if (raw) current = JSON.parse(raw);
                } catch (e) {}

                if (u) {
                    current.displayName = u;
                    current.firstName = u.trim().split(' ')[0];
                }
                if (av) {
                    const decodedAv = decodeURIComponent(av);
                    current.activeAvatarURL = decodedAv;
                    current.photoURL = decodedAv;
                }
                current.updatedAt = Date.now();
                try { localStorage.setItem('yaire_auth_user', JSON.stringify(current)); } catch (e) {}

                urlObj.searchParams.delete('user');
                urlObj.searchParams.delete('u');
                urlObj.searchParams.delete('avatar');
                urlObj.searchParams.delete('av');
                shouldClean = true;
            }

            if (shouldClean) {
                const cleanSearch = urlObj.searchParams.toString() ? ('?' + urlObj.searchParams.toString()) : '';
                window.history.replaceState(null, document.title, urlObj.pathname + cleanSearch + urlObj.hash);
            }
        } catch (e) {}
    })();

    if (window.__28E_PLAY_TOAST_INITIALIZED__) return;
    window.__28E_PLAY_TOAST_INITIALIZED__ = true;

    // Inyectar estilos CSS con las tipografías oficiales de la web
    const styleEl = document.createElement('style');
    styleEl.id = 'play-games-toast-styles';
    styleEl.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        @font-face {
            font-family: 'Sebenta';
            font-style: normal;
            font-weight: 400 600;
            font-display: swap;
            src: url('fonts/Sebenta-Medium.woff2') format('woff2'),
                 url('https://cdn.epidemicsound.com/fonts/Sebenta-Medium.woff2') format('woff2');
        }

        #play-games-toast-wrapper {
            position: fixed;
            bottom: max(24px, env(safe-area-inset-bottom, 24px));
            right: max(24px, env(safe-area-inset-right, 24px));
            display: flex;
            justify-content: flex-end;
            align-items: center;
            pointer-events: none;
            z-index: 9999999;
        }

        @media (max-width: 640px) {
            #play-games-toast-wrapper {
                bottom: max(16px, env(safe-area-inset-bottom, 16px));
                right: max(16px, env(safe-area-inset-right, 16px));
            }
        }

        #play-games-toast-container {
            display: inline-flex;
            align-items: center;
            gap: 13px;
            height: 52px;
            padding: 6px 22px 6px 6px;
            border-radius: 9999px;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(24, 24, 34, 0.42) 48%, rgba(12, 12, 20, 0.65) 100%);
            backdrop-filter: blur(28px) saturate(200%) brightness(1.06);
            -webkit-backdrop-filter: blur(28px) saturate(200%) brightness(1.06);
            border: 1px solid rgba(255, 255, 255, 0.16);
            box-shadow: 
                0 16px 40px -6px rgba(0, 0, 0, 0.65),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.26),
                inset 0 -1px 0 0 rgba(255, 255, 255, 0.06);
            cursor: pointer;
            box-sizing: border-box;
            user-select: none;
            -webkit-user-select: none;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            opacity: 0;
            transform: translateY(28px) scale(0.9);
            transform-origin: bottom right;
            pointer-events: none;
            transition: background 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
        }

        #play-games-toast-container.play-toast-visible {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }

        #play-games-toast-container.play-toast-leaving {
            opacity: 0;
            transform: translateY(20px) scale(0.92);
            pointer-events: none;
        }

        /* Transición de respaldo CSS si GSAP no está presente */
        #play-games-toast-container.css-animated {
            transition: transform 420ms cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 320ms ease;
        }

        #play-games-toast-container.css-animated.play-toast-leaving {
            transition: transform 220ms cubic-bezier(0.4, 0, 1, 1), opacity 180ms ease;
        }

        #play-games-toast-container:hover {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.13) 0%, rgba(30, 30, 44, 0.52) 48%, rgba(16, 16, 26, 0.75) 100%);
            border-color: rgba(255, 255, 255, 0.26);
            box-shadow: 
                0 20px 48px -6px rgba(0, 0, 0, 0.75),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.32),
                inset 0 -1px 0 0 rgba(255, 255, 255, 0.08);
        }

        #play-games-toast-container:active {
            transform: scale(0.97) translateY(0);
        }

        .play-toast-avatar-box {
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.08);
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .play-toast-avatar-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            display: block;
        }

        .play-toast-avatar-fallback {
            display: none;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, #e11d48, #c026d3);
            color: #ffffff;
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            font-weight: 700;
            font-size: 15px;
            align-items: center;
            justify-content: center;
        }

        .play-toast-title {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            font-size: 16.5px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.01em;
            line-height: 1;
            white-space: nowrap;
            padding-right: 4px;
        }

        @media (prefers-reduced-motion: reduce) {
            #play-games-toast-container,
            #play-games-toast-container.css-animated {
                transition: opacity 120ms ease !important;
                transform: translateY(0) !important;
            }
        }
    `;
    document.head.appendChild(styleEl);

    // Variables de control DOM
    let wrapperEl = null;
    let containerEl = null;
    let toastTimeout = null;
    let isToastActive = false;
    let lastToastTriggerTime = 0;

    function ensureToastDOM() {
        if (wrapperEl && document.body.contains(wrapperEl)) return;
        wrapperEl = document.getElementById('play-games-toast-wrapper');
        if (wrapperEl) {
            containerEl = document.getElementById('play-games-toast-container');
            return;
        }

        wrapperEl = document.createElement('div');
        wrapperEl.id = 'play-games-toast-wrapper';

        containerEl = document.createElement('div');
        containerEl.id = 'play-games-toast-container';
        containerEl.setAttribute('role', 'status');
        containerEl.setAttribute('aria-live', 'polite');
        containerEl.innerHTML = `
            <div class="play-toast-avatar-box">
                <img id="play-toast-avatar-img" class="play-toast-avatar-img" src="" alt="Avatar" />
                <div id="play-toast-avatar-fallback" class="play-toast-avatar-fallback"></div>
            </div>
            <span class="play-toast-title" id="play-toast-title">¡Hola!</span>
        `;
        wrapperEl.appendChild(containerEl);
        document.body.appendChild(wrapperEl);

        containerEl.addEventListener('click', dismissToast);
    }

    /**
     * Obtiene los datos del usuario conectado en 28E.
     */
    function getAuthUser() {
        // 1. Directo desde la sesión global de Firebase en index.html
        if (window.yaireCurrentUser && window.yaireCurrentUser.uid) {
            const u = window.yaireCurrentUser;
            const mii = (typeof window.yaireGetCurrentMiiProfile === 'function')
                ? window.yaireGetCurrentMiiProfile()
                : null;
            const hasActiveMii = !!(mii && mii.enabled !== false && mii.avatarUrl);
            const avatar = hasActiveMii
                ? mii.avatarUrl
                : (window.yaireActiveAvatarURL || u.photoURL || '');
            const rawName = (u.displayName || u.email || 'Gamer').trim();
            const firstName = rawName.split(' ')[0] || 'Gamer';
            return {
                isLogged: true,
                uid: u.uid,
                displayName: rawName,
                firstName: firstName,
                avatar: avatar,
                hasMii: hasActiveMii
            };
        }

        // 2. Parámetro de URL (ej: dclf.html?user=Charles o ?u=Charles)
        try {
            const params = new URLSearchParams(window.location.search);
            const userParam = params.get('user') || params.get('u');
            if (userParam && userParam.trim()) {
                const name = userParam.trim();
                let cachedAvatar = '';
                try {
                    const guestMii = localStorage.getItem('yaire_mii_guest');
                    if (guestMii) {
                        const m = JSON.parse(guestMii);
                        if (m && m.avatarUrl) cachedAvatar = m.avatarUrl;
                    }
                } catch (e) { }

                // Guardar para que dclf.html persista la sesión
                try {
                    if (!localStorage.getItem('yaire_auth_user')) {
                        localStorage.setItem('yaire_auth_user', JSON.stringify({
                            displayName: name,
                            firstName: name.split(' ')[0],
                            activeAvatarURL: cachedAvatar
                        }));
                    }
                } catch (e) { }

                return {
                    isLogged: true,
                    uid: 'param_user',
                    displayName: name,
                    firstName: name.split(' ')[0],
                    avatar: cachedAvatar,
                    hasMii: !!cachedAvatar
                };
            }
        } catch (e) { }

        // 3. Cookie compartida entre todos los subdominios de yaire.site (*.yaire.site)
        try {
            const match = document.cookie.match(/(?:^|;\s*)yaire_auth_user=([^;]+)/);
            if (match) {
                const data = JSON.parse(decodeURIComponent(match[1]));
                if (data && (data.firstName || data.displayName)) {
                    const rawName = (data.displayName || data.firstName || 'Gamer').trim();
                    const firstName = data.firstName || rawName.split(' ')[0] || 'Gamer';
                    const avatar = data.activeAvatarURL || data.photoURL || '';
                    try { localStorage.setItem('yaire_auth_user', JSON.stringify(data)); } catch (e) {}
                    return {
                        isLogged: true,
                        uid: data.uid || 'cookie',
                        displayName: rawName,
                        firstName: firstName,
                        avatar: avatar,
                        hasMii: !!data.miiActive || !!avatar
                    };
                }
            }
        } catch (e) {}

        // 4. LocalStorage compartido (para tv.html, dclf.html o lectura en 0ms)
        try {
            const raw = localStorage.getItem('yaire_auth_user');
            if (raw) {
                const data = JSON.parse(raw);
                if (data && (data.uid || data.firstName || data.displayName)) {
                    const rawName = (data.displayName || data.firstName || 'Gamer').trim();
                    const firstName = data.firstName || rawName.split(' ')[0] || 'Gamer';
                    const avatar = data.activeAvatarURL || data.photoURL || '';
                    return {
                        isLogged: true,
                        uid: data.uid || 'local',
                        displayName: rawName,
                        firstName: firstName,
                        avatar: avatar,
                        hasMii: !!data.miiActive || !!avatar
                    };
                }
            }
        } catch (e) { }

        // 4. Fallback si hay un perfil Mii con nombre
        try {
            const guestMiiRaw = localStorage.getItem('yaire_mii_guest');
            if (guestMiiRaw) {
                const gm = JSON.parse(guestMiiRaw);
                if (gm && gm.name && gm.name.trim()) {
                    return {
                        isLogged: true,
                        uid: 'guest_mii',
                        displayName: gm.name.trim(),
                        firstName: gm.name.trim().split(' ')[0],
                        avatar: gm.avatarUrl || '',
                        hasMii: true
                    };
                }
            }
        } catch (e) { }

        return null;
    }

    /**
     * Cierra el toast con animación fluida
     */
    function dismissToast() {
        if (!containerEl || !isToastActive) return;
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }

        if (window.gsap) {
            window.gsap.killTweensOf(containerEl);
            const avatarEl = containerEl.querySelector('.play-toast-avatar-box');
            const titleEl = containerEl.querySelector('.play-toast-title');
            if (avatarEl) window.gsap.killTweensOf(avatarEl);
            if (titleEl) window.gsap.killTweensOf(titleEl);

            window.gsap.to(containerEl, {
                y: 20,
                scale: 0.92,
                opacity: 0,
                duration: 0.22,
                ease: "power2.in",
                onComplete: () => {
                    containerEl.classList.remove('play-toast-visible');
                    containerEl.classList.remove('play-toast-leaving');
                    isToastActive = false;
                }
            });
        } else {
            containerEl.classList.add('css-animated', 'play-toast-leaving');
            setTimeout(() => {
                if (containerEl) {
                    containerEl.classList.remove('play-toast-visible', 'play-toast-leaving', 'css-animated');
                }
                isToastActive = false;
            }, 220);
        }
    }

    let hasExperienceToastShown = false;

    /**
     * Muestra el toast nítido y minimalista
     */
    function show28EPlayToast(options = {}) {
        const now = Date.now();
        // Evitar duplicaciones o reinicios si ya está activo o ya se disparó en esta página
        if (hasExperienceToastShown && !options.force) return;
        if (isToastActive || (now - lastToastTriggerTime < 5000)) return;
        lastToastTriggerTime = now;
        hasExperienceToastShown = true;

        ensureToastDOM();

        const user = getAuthUser();
        if (!user && !options.force) return;

        const firstName = options.testName || (user ? user.firstName : 'Gamer');
        const avatarUrl = user ? user.avatar : '';

        const titleEl = containerEl.querySelector('#play-toast-title');
        const imgEl = containerEl.querySelector('#play-toast-avatar-img');
        const fbEl = containerEl.querySelector('#play-toast-avatar-fallback');

        if (titleEl) {
            titleEl.textContent = `¡Hola, ${firstName}!`;
        }

        // Avatar (28E Studio Mii activo > Foto Google > Inicial)
        if (avatarUrl) {
            if (imgEl) {
                imgEl.src = avatarUrl;
                imgEl.style.display = 'block';
                imgEl.onerror = () => {
                    imgEl.style.display = 'none';
                    if (fbEl) {
                        fbEl.style.display = 'flex';
                        fbEl.textContent = firstName.charAt(0).toUpperCase();
                    }
                };
            }
            if (fbEl) fbEl.style.display = 'none';
        } else {
            if (imgEl) imgEl.style.display = 'none';
            if (fbEl) {
                fbEl.style.display = 'flex';
                fbEl.textContent = firstName.charAt(0).toUpperCase();
            }
        }

        // Animación de Entrada nítida (GSAP o CSS)
        if (toastTimeout) clearTimeout(toastTimeout);
        isToastActive = true;

        if (window.gsap) {
            window.gsap.killTweensOf(containerEl);
            const avatarEl = containerEl.querySelector('.play-toast-avatar-box');
            const titleEl = containerEl.querySelector('.play-toast-title');
            if (avatarEl) window.gsap.killTweensOf(avatarEl);
            if (titleEl) window.gsap.killTweensOf(titleEl);

            containerEl.classList.remove('play-toast-leaving', 'css-animated');
            containerEl.classList.add('play-toast-visible');

            // Timeline física coordinada estilo Apple / Emil Kowalski
            const tl = window.gsap.timeline();
            tl.fromTo(containerEl,
                { y: 30, scale: 0.88, opacity: 0 },
                {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    duration: 0.46,
                    ease: "back.out(1.18)"
                }
            );

            if (avatarEl) {
                tl.fromTo(avatarEl,
                    { scale: 0.78, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.38, ease: "power3.out" },
                    "-=0.38"
                );
            }

            if (titleEl) {
                tl.fromTo(titleEl,
                    { x: 12, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.38, ease: "power3.out" },
                    "-=0.34"
                );
            }
        } else {
            containerEl.classList.remove('play-toast-leaving');
            containerEl.classList.add('css-animated', 'play-toast-visible');
        }

        // Salida automática tras 3.2 segundos
        toastTimeout = setTimeout(() => {
            dismissToast();
        }, 3200);
    }

    // Exponer API global
    window.show28EPlayToast = show28EPlayToast;
    window.dismiss28EPlayToast = dismissToast;

    // Disparo automático en páginas independientes (tv.html y dclf.html)
    function autoTriggerIfExperiencePage() {
        const path = window.location.pathname.toLowerCase();
        const host = window.location.hostname.toLowerCase();
        const isTv = path.includes('tv') || host.indexOf('tv.') !== -1;
        const isDclf = path.includes('dclf') || host.indexOf('dclf.') !== -1;

        if (isDclf || isTv) {
            // Disparar en el loader inicial tanto en DCLF como en 28E TV
            setTimeout(() => {
                show28EPlayToast();
            }, 800);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoTriggerIfExperiencePage);
    } else {
        autoTriggerIfExperiencePage();
    }
})();

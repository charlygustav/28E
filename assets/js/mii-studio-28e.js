/**
 * ============================================================================
 * ESTUDIO MII 28E — Editor de Personaje (Apple Design & Emil Kowalski Edition)
 * ============================================================================
 * Diseño minimalista, superficies translúcidas con bordes especulares de 1px,
 * divulgación progresiva, cero emojis, botones 100% redondeados (pill) y
 * rendimiento instantáneo a 60fps mediante caché de nodos DOM SVG y O(1).
 */
(function () {
    'use strict';

    const NINTENDO_API = 'https://studio.mii.nintendo.com/miis/image.png';
    const FALLBACK_API = 'https://mii-unsecure.ariankordi.net/miis/image.png';
    const ICONS_JSON_URL = 'assets/data/mii-icons.json';

    // Catálogos separados por género (sin mezclar peinados u ojos femeninos y masculinos)
    const HAIR_ORDER_MALE = [
        33, 47, 40, 37, 32, 107, 48, 51, 55, 70, 44, 66,
        52, 50, 38, 49, 43, 31, 56, 68, 62, 115, 76, 119,
        64, 81, 116, 121, 22, 58, 60, 87, 125, 117, 73, 75,
        42, 89, 57, 54, 80, 34, 23, 86, 88, 118, 39, 36,
        45, 67, 59, 65, 41, 30
    ];

    const HAIR_ORDER_FEMALE = [
        12, 16, 10, 82, 128, 129, 14, 95, 105, 100, 6, 20,
        93, 102, 27, 4, 17, 110, 123, 8, 106, 72, 3, 21,
        0, 98, 63, 90, 11, 120, 5, 74, 108, 94, 124, 25,
        99, 69, 35, 13, 122, 113, 53, 24, 85, 83, 71, 131,
        96, 101, 29, 7, 15, 112, 79, 1, 109, 127, 91, 26,
        61, 103, 2, 77, 18, 92, 84, 9, 19, 130, 97, 104,
        46, 78, 28, 114, 126, 111
    ];

    const EYE_ORDER_FEMALE = [
        4, 0, 39, 17, 1, 26, 27, 20, 33, 19,
        32, 9, 23, 34, 40, 35, 41, 24, 30, 18,
        28, 46, 7, 42, 45, 29, 10, 47, 54, 56
    ];

    const EYE_ORDER_MALE = [
        2, 8, 16, 15, 11, 12, 21, 25, 5, 13,
        36, 37, 6, 31, 44, 38, 3, 43, 22, 14,
        48, 49, 50, 53, 59, 58, 57, 55, 51, 52
    ];

    const MAKEUP_ORDER_FEMALE = [0, 1, 2, 9, 3, 4, 5, 6, 7, 8, 10];
    const MAKEUP_ORDER_MALE = [0, 9, 10, 11, 2];

    const EYEBROW_ORDER = [
        6, 0, 12, 1, 9, 19, 7, 21, 8, 17, 5, 4,
        11, 10, 2, 3, 14, 20, 15, 13, 22, 18, 16, 23
    ];

    const MOUTH_ORDER = [
        19, 22, 1, 21, 23, 5, 0, 8, 10, 16, 6, 13,
        7, 9, 2, 17, 3, 4, 15, 11, 20, 18, 14, 12,
        27, 30, 24, 25, 29, 28, 26, 35, 31, 34, 33, 32
    ];

    const NOSE_ORDER = [
        1, 10, 2, 3, 6, 0, 5, 4, 8, 9, 7, 11,
        13, 14, 12, 17, 16, 15
    ];

    const SKIN_COLORS = [
        { id: 0, hex: '#FFD3AD', label: 'Marfil' },
        { id: 6, hex: '#FFBEA5', label: 'Porcelana' },
        { id: 7, hex: '#FFC58F', label: 'Durazno' },
        { id: 3, hex: '#FFAA8C', label: 'Coral' },
        { id: 1, hex: '#FEB66B', label: 'Miel' },
        { id: 2, hex: '#DE7942', label: 'Bronce' },
        { id: 4, hex: '#AD5129', label: 'Canela' },
        { id: 8, hex: '#8C3C23', label: 'Caoba' },
        { id: 5, hex: '#632C18', label: 'Cacao' },
        { id: 9, hex: '#3C2D23', label: 'Ébano' }
    ];

    const FAVORITE_COLORS = [
        { id: 7, hex: '#F55A7D', label: 'Rosa' },
        { id: 0, hex: '#D21E14', label: 'Rojo' },
        { id: 1, hex: '#FF6E19', label: 'Naranja' },
        { id: 2, hex: '#FFD820', label: 'Amarillo' },
        { id: 3, hex: '#78D220', label: 'Lima' },
        { id: 4, hex: '#007830', label: 'Bosque' },
        { id: 6, hex: '#3CAADE', label: 'Cielo' },
        { id: 5, hex: '#0A48BC', label: 'Azul' },
        { id: 8, hex: '#7328AD', label: 'Violeta' },
        { id: 9, hex: '#483818', label: 'Café' },
        { id: 10, hex: '#E0E0E0', label: 'Blanco' },
        { id: 11, hex: '#181814', label: 'Negro' }
    ];

    // Paleta oficial Switch CommonColor (100 colores, índices 0..99)
    const SWITCH_COLORS = [
        '#2d2828', '#402010', '#5c180a', '#7c3a14', '#787880', '#4e3e10', '#885818', '#d0a04a', '#000000', '#6c7070',
        '#663c2c', '#605e30', '#4654a8', '#387058', '#603810', '#a81008', '#203068', '#a86000', '#787068', '#d85208',
        '#f00c08', '#f54848', '#f09a74', '#8c5040', '#842626', '#ff7366', '#ffa6a6', '#ffc0ba', '#732e3b', '#991f3d',
        '#8a173e', '#b53e42', '#c71e56', '#b05381', '#c7546e', '#fa7597', '#fcacc9', '#ffc9d8', '#311c40', '#37283d',
        '#4c184d', '#6f42b3', '#855cb8', '#c083cc', '#a893c9', '#c5ace6', '#eebefa', '#d2c5ed', '#191f40', '#123f66',
        '#2a82d4', '#57b4f2', '#7ac5de', '#89a6fa', '#84bdfa', '#a1e3ff', '#0b2e36', '#013d3b', '#0d4f59', '#236663',
        '#307e8c', '#4faeb0', '#7ac49e', '#7fd4c0', '#87e5b6', '#0a4a35', '#437a00', '#027562', '#369970', '#4bad1a',
        '#92bf0a', '#63c788', '#9ee042', '#96de7e', '#bbf2aa', '#99932b', '#a69563', '#ccc039', '#ccb987', '#d9cc82',
        '#d5d96f', '#d5e683', '#d8fa9d', '#7d4500', '#e6bb7a', '#fee24a', '#fade82', '#f7ea9c', '#faf89b', '#a64d1e',
        '#ff960d', '#d19b69', '#ffb266', '#ffc28c', '#e5cfb1', '#414141', '#9b9b9b', '#bebebe', '#dcd7cd', '#ffffff'
    ];

    const QUICK_HAIR_COLORS = [8, 1, 2, 3, 5, 6, 7, 4, 99, 32, 35, 41, 50, 61, 69, 20];
    const QUICK_EYE_COLORS = [8, 10, 11, 12, 51, 13, 68, 9, 41, 32, 35, 85, 20, 96];
    const QUICK_MOUTH_COLORS = [19, 20, 21, 22, 23, 32, 34, 35, 36, 28, 40];
    const QUICK_GLASS_COLORS = [8, 14, 15, 16, 17, 18, 32, 35, 41, 51, 68, 99];

    const BG_PRESETS = [
        { id: '18181BFF', hex: '#18181B', label: 'Grafito' },
        { id: '27272AFF', hex: '#27272A', label: 'Pizarra' },
        { id: 'C4377AFF', hex: '#C4377A', label: 'Rosa 28E' },
        { id: 'F472B6FF', hex: '#F472B6', label: 'Sakura' },
        { id: '3B0764FF', hex: '#3B0764', label: 'Índigo' },
        { id: '7C3AEDFF', hex: '#7C3AED', label: 'Violeta' },
        { id: '1D4ED8FF', hex: '#1D4ED8', label: 'Cobalto' },
        { id: '0284C7FF', hex: '#0284C7', label: 'Cielo' },
        { id: '059669FF', hex: '#059669', label: 'Esmeralda' },
        { id: 'D97706FF', hex: '#D97706', label: 'Ámbar' },
        { id: 'E11D48FF', hex: '#E11D48', label: 'Carmesí' },
        { id: 'F4F4F5FF', hex: '#F4F4F5', label: 'Plata' }
    ];

    const EXPRESSIONS = [
        { id: 'normal', label: 'Natural' },
        { id: 'smile', label: 'Alegre' },
        { id: 'like_wink_left', label: 'Guiño' },
        { id: 'wink_right', label: 'Pícaro' },
        { id: 'surprise', label: 'Sorpresa' },
        { id: 'blink', label: 'Sereno' },
        { id: 'anger', label: 'Serio' },
        { id: 'sorrow', label: 'Melancólico' }
    ];

    const IDX = {
        beardColor: 0,
        beardType: 1,
        build: 2,
        eyeAspect: 3,
        eyeColor: 4,
        eyeRotate: 5,
        eyeScale: 6,
        eyeType: 7,
        eyeX: 8,
        eyeY: 9,
        eyebrowAspect: 10,
        eyebrowColor: 11,
        eyebrowRotate: 12,
        eyebrowScale: 13,
        eyebrowType: 14,
        eyebrowX: 15,
        eyebrowY: 16,
        facelineColor: 17,
        facelineMake: 18,
        facelineType: 19,
        facelineWrinkle: 20,
        favoriteColor: 21,
        gender: 22,
        glassColor: 23,
        glassScale: 24,
        glassType: 25,
        glassY: 26,
        hairColor: 27,
        hairFlip: 28,
        hairType: 29,
        height: 30,
        moleScale: 31,
        moleType: 32,
        moleX: 33,
        moleY: 34,
        mouthAspect: 35,
        mouthColor: 36,
        mouthScale: 37,
        mouthType: 38,
        mouthY: 39,
        mustacheScale: 40,
        mustacheType: 41,
        mustacheY: 42,
        noseScale: 43,
        noseType: 44,
        noseY: 45
    };

    const BOUNDS = [
        [0, 99], [0, 5], [0, 127], [0, 6], [0, 99], [0, 7], [0, 7], [0, 59], [0, 12], [0, 18],
        [0, 6], [0, 99], [0, 11], [0, 8], [0, 23], [0, 12], [3, 18], [0, 9], [0, 11], [0, 11],
        [0, 11], [0, 11], [0, 1], [0, 99], [0, 7], [0, 19], [0, 20], [0, 99], [0, 1], [0, 131],
        [0, 127], [0, 8], [0, 1], [0, 16], [0, 30], [0, 6], [0, 99], [0, 8], [0, 35], [0, 18],
        [0, 8], [0, 5], [0, 16], [0, 8], [0, 17], [0, 18]
    ];

    // Presets equilibrados con sonrisa real (mouthType 19) y expresión natural
    const PRESET_CHICA = [
        8, 0, 56, 3, 10, 4, 4, 4, 2, 12,
        3, 1, 5, 4, 0, 2, 10, 0, 1, 0,
        0, 7, 1, 8, 4, 0, 10, 1, 0, 12,
        60, 4, 0, 2, 20, 3, 21, 4, 19, 13,
        4, 0, 10, 3, 1, 9
    ];

    const PRESET_CHICO = [
        8, 0, 64, 3, 8, 4, 4, 2, 2, 12,
        3, 8, 5, 4, 6, 2, 10, 0, 0, 0,
        0, 11, 0, 8, 4, 0, 10, 8, 0, 33,
        68, 4, 0, 2, 20, 3, 19, 4, 19, 13,
        4, 0, 10, 4, 1, 9
    ];

    function clampBytes(arr) {
        const out = new Array(46);
        for (let i = 0; i < 46; i++) {
            const min = BOUNDS[i][0];
            const max = BOUNDS[i][1];
            let v = Number.isFinite(arr[i]) ? Math.round(arr[i]) : PRESET_CHICA[i];
            if (v < min) v = min;
            if (v > max) v = max;
            out[i] = v;
        }
        return out;
    }

    function encodeStudioMii(rawBytes) {
        const clean = clampBytes(rawBytes);
        const out = [0];
        let prev = 0;
        for (let i = 0; i < 46; i++) {
            const enc = (7 + (clean[i] ^ prev)) & 0xFF;
            out.push(enc);
            prev = enc;
        }
        return out.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function decodeStudioMii(hexStr) {
        if (!hexStr || typeof hexStr !== 'string') return null;
        const cleanHex = hexStr.trim().toLowerCase().replace(/[^0-9a-f]/g, '');
        if (cleanHex.length !== 94 && cleanHex.length !== 92) return null;
        const bytes = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes.push(parseInt(cleanHex.slice(i, i + 2), 16));
        }
        if (bytes.length === 46) return clampBytes(bytes);
        const dst = new Array(46);
        for (let i = 0; i < 46; i++) {
            const val = (bytes[i + 1] - 7 + 256) & 0xFF;
            dst[i] = (val ^ bytes[i]) & 0xFF;
        }
        return clampBytes(dst);
    }

    function buildMiiUrl(rawBytes, opts, useFallback) {
        const options = opts || {};
        const dataHex = encodeStudioMii(rawBytes);
        const width = options.width || 512;
        const type = options.viewType === 'all_body' ? 'all_body' : 'face';
        const expression = options.expression || 'normal';
        const bgColor = options.bgColor || 'C4377AFF';
        const rotateY = ((Number(options.rotateY) || 0) % 360 + 360) % 360;

        const base = useFallback ? FALLBACK_API : NINTENDO_API;
        let url = `${base}?data=${dataHex}&type=${type}&width=${width}&expression=${encodeURIComponent(expression)}`;
        if (bgColor && /^[0-9A-Fa-f]{8}$/.test(bgColor)) {
            url += `&bgColor=${bgColor.toUpperCase()}`;
        }
        if (rotateY > 0) {
            url += `&characterYRotate=${Math.round(rotateY)}`;
        }
        return url;
    }

    // Estado interno
    let iconsData = null;
    let iconsLoadingPromise = null;
    let modalEl = null;
    let activeTab = 'face';
    let subTabFace = 'shape';      // 'shape' | 'makeup' | 'wrinkles'
    let subTabBeard = 'mustache';  // 'mustache' | 'goatee' | 'mole'
    let showAdjustments = false;
    let showAllColors = false;

    // Caché de nodos DOM de grillas SVG para cambios de pestaña en < 0.5ms
    const gridDomCache = {};

    let state = {
        enabled: true,
        rawBytes: PRESET_CHICA.slice(),
        expression: 'normal',
        bgColor: 'C4377AFF',
        viewType: 'face',
        rotateY: 0
    };

    function playSound(file, vol) {
        try {
            if (typeof window.AudioManager !== 'undefined' && typeof window.AudioManager.play === 'function') {
                window.AudioManager.play(file, vol || 0.35);
            }
        } catch (e) {}
    }

    let miiBgmAudio = null;
    let miiBgmFadeTimer = null;
    let wasSpotAudioPlaying = false;

    function startMiiBgm() {
        try {
            if (miiBgmFadeTimer) {
                clearInterval(miiBgmFadeTimer);
                miiBgmFadeTimer = null;
            }
            if (typeof window.spotAudio !== 'undefined' && window.spotAudio && !window.spotAudio.paused) {
                wasSpotAudioPlaying = true;
                window.spotAudio.pause();
            } else {
                wasSpotAudioPlaying = false;
            }
            if (!miiBgmAudio) {
                miiBgmAudio = new Audio('sounds/mii-studio-bgm.mp3');
                miiBgmAudio.loop = true;
                miiBgmAudio.preload = 'auto';
            }
            const isMuted = typeof window.AudioManager !== 'undefined' && window.AudioManager && window.AudioManager.muted;
            miiBgmAudio.muted = !!isMuted;
            miiBgmAudio.currentTime = 0;
            miiBgmAudio.volume = 0;
            const playPromise = miiBgmAudio.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(() => {
                    const targetVol = 0.42;
                    miiBgmFadeTimer = setInterval(() => {
                        if (!miiBgmAudio || miiBgmAudio.paused) {
                            clearInterval(miiBgmFadeTimer);
                            miiBgmFadeTimer = null;
                            return;
                        }
                        if (miiBgmAudio.volume < targetVol - 0.04) {
                            miiBgmAudio.volume = Math.min(targetVol, miiBgmAudio.volume + 0.04);
                        } else {
                            miiBgmAudio.volume = targetVol;
                            clearInterval(miiBgmFadeTimer);
                            miiBgmFadeTimer = null;
                        }
                    }, 30);
                }).catch(() => {});
            }
        } catch (e) {}
    }

    function stopMiiBgm() {
        try {
            if (miiBgmFadeTimer) {
                clearInterval(miiBgmFadeTimer);
                miiBgmFadeTimer = null;
            }
            if (miiBgmAudio) {
                miiBgmAudio.pause();
                miiBgmAudio.currentTime = 0;
            }
            if (wasSpotAudioPlaying && typeof window.spotAudio !== 'undefined' && window.spotAudio) {
                wasSpotAudioPlaying = false;
                window.spotAudio.play().catch(() => {});
            }
        } catch (e) {}
    }

    function loadIconsJson() {
        if (iconsData) return Promise.resolve(iconsData);
        if (iconsLoadingPromise) return iconsLoadingPromise;
        iconsLoadingPromise = fetch(ICONS_JSON_URL)
            .then(r => r.json())
            .then(d => {
                iconsData = d;
                Object.keys(gridDomCache).forEach(k => delete gridDomCache[k]);
                return d;
            })
            .catch(err => {
                console.warn('Error cargando iconos Mii:', err);
                iconsLoadingPromise = null;
                return null;
            });
        return iconsLoadingPromise;
    }

    function injectStyles() {
        if (document.getElementById('mii-studio-28e-styles')) return;
        const style = document.createElement('style');
        style.id = 'mii-studio-28e-styles';
        style.textContent = `
            #mii-studio-modal {
                --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
                --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
                position: fixed;
                inset: 0;
                z-index: 10050;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                background: rgba(0, 0, 0, 0.62);
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                opacity: 0;
                pointer-events: none;
                transition: opacity 200ms var(--ease-out);
            }
            #mii-studio-modal.open {
                opacity: 1;
                pointer-events: auto;
            }
            .mii-studio-dialog {
                width: 100%;
                max-width: 840px;
                height: min(84vh, 620px);
                background: rgba(20, 20, 23, 0.94);
                border: 1px solid rgba(255, 255, 255, 0.09);
                box-shadow:
                    0 24px 72px rgba(0, 0, 0, 0.65),
                    0 0 0 0.5px rgba(255, 255, 255, 0.06) inset;
                border-radius: 26px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.96);
                transition: transform 220ms var(--ease-out);
                color: #f4f4f5;
                font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
                -webkit-font-smoothing: antialiased;
            }
            #mii-studio-modal.open .mii-studio-dialog {
                transform: scale(1);
            }

            /* Header */
            .mii-header {
                height: 54px;
                padding: 0 18px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-shrink: 0;
            }
            .mii-header-title {
                font-size: 14px;
                font-weight: 600;
                letter-spacing: -0.02em;
                color: #f4f4f5;
            }
            .mii-segmented {
                display: inline-flex;
                align-items: center;
                padding: 3px;
                border-radius: 9999px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.06);
                gap: 2px;
            }
            .mii-segmented-btn {
                padding: 5px 13px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 500;
                letter-spacing: -0.01em;
                color: #a1a1aa;
                background: transparent;
                border: none;
                cursor: pointer;
                transition: color 150ms var(--ease-out), background-color 150ms var(--ease-out), transform 120ms var(--ease-out);
            }
            .mii-segmented-btn.active {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.14);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            }
            .mii-segmented-btn:active {
                transform: scale(0.97);
            }
            .mii-close-btn {
                width: 30px;
                height: 30px;
                border-radius: 9999px;
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.06);
                color: #a1a1aa;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: color 150ms var(--ease-out), background-color 150ms var(--ease-out), transform 120ms var(--ease-out);
            }
            .mii-close-btn:active {
                transform: scale(0.93);
            }

            /* Body Layout */
            .mii-studio-body {
                display: grid;
                grid-template-columns: 262px 1fr;
                flex: 1;
                min-height: 0;
                overflow: hidden;
            }

            /* Left Stage */
            .mii-stage-panel {
                background: rgba(255, 255, 255, 0.012);
                border-right: 1px solid rgba(255, 255, 255, 0.07);
                padding: 20px 18px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
            }
            .mii-stage-viewport {
                position: relative;
                width: 196px;
                height: 196px;
                border-radius: 44px;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.12);
                box-shadow:
                    0 16px 36px rgba(0, 0, 0, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.14);
                background-color: #C4377A;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 200ms var(--ease-out);
            }
            .mii-stage-viewport img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                user-select: none;
                -webkit-user-drag: none;
                transition: opacity 150ms var(--ease-out);
            }
            .mii-presets-box,
            .mii-editor-panel {
                transition: opacity 180ms var(--ease-out), filter 180ms var(--ease-out);
            }
            .mii-studio-dialog.google-mode .mii-presets-box,
            .mii-studio-dialog.google-mode .mii-editor-panel {
                opacity: 0.22;
                pointer-events: none;
                user-select: none;
                filter: grayscale(1);
            }
            .mii-studio-dialog.google-mode .mii-stage-viewport {
                background-color: transparent !important;
                border-color: transparent;
                box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
            }
            .mii-studio-dialog.google-mode .mii-stage-viewport img {
                object-fit: cover;
                border-radius: 44px;
            }
            .mii-stage-loader {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 16px;
                height: 16px;
                border-radius: 9999px;
                border: 1.75px solid rgba(255, 255, 255, 0.16);
                border-top-color: rgba(255, 255, 255, 0.85);
                animation: miiSpin 650ms linear infinite;
                opacity: 0;
                pointer-events: none;
                transition: opacity 140ms var(--ease-out);
            }
            .mii-stage-loader.loading {
                opacity: 1;
            }
            @keyframes miiSpin {
                to { transform: rotate(360deg); }
            }

            /* Camera & Quick Bar */
            .mii-cam-bar {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 12px;
            }
            .mii-icon-btn {
                width: 30px;
                height: 30px;
                border-radius: 9999px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.07);
                color: #a1a1aa;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: color 150ms var(--ease-out), background-color 150ms var(--ease-out), transform 120ms var(--ease-out);
            }
            .mii-icon-btn:active {
                transform: scale(0.95);
            }
            .mii-presets-box {
                width: 100%;
                display: flex;
                flex-direction: column;
                padding-top: 12px;
                border-top: 1px solid rgba(255, 255, 255, 0.06);
            }
            .mii-ghost-btn {
                width: 100%;
                padding: 8px 14px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 500;
                letter-spacing: -0.01em;
                color: #d4d4d8;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.08);
                cursor: pointer;
                text-align: center;
                white-space: nowrap;
                transition: color 150ms var(--ease-out), background-color 150ms var(--ease-out), transform 120ms var(--ease-out);
            }
            .mii-ghost-btn:active {
                transform: scale(0.97);
            }

            /* Right Editor Panel */
            .mii-editor-panel {
                display: flex;
                flex-direction: column;
                min-height: 0;
                overflow: hidden;
            }
            .mii-tabs-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 3px;
                padding: 10px 14px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                overflow-x: auto;
                scrollbar-width: none;
                flex-shrink: 0;
            }
            .mii-tabs-bar::-webkit-scrollbar {
                display: none;
            }
            .mii-tab-btn {
                flex: 1 1 auto;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 6px 8px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 500;
                letter-spacing: -0.01em;
                color: #8e8e93;
                background: transparent;
                border: 1px solid transparent;
                cursor: pointer;
                white-space: nowrap;
                transition: color 150ms var(--ease-out), background-color 150ms var(--ease-out), transform 120ms var(--ease-out);
            }
            .mii-tab-btn.active {
                color: #f4f4f5;
                background: rgba(255, 255, 255, 0.11);
                border-color: rgba(255, 255, 255, 0.09);
            }
            .mii-tab-btn:active {
                transform: scale(0.97);
            }

            /* Tab Content Area */
            .mii-tab-content {
                flex: 1;
                overflow-y: auto;
                padding: 14px 16px 18px;
                display: flex;
                flex-direction: column;
                gap: 14px;
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.14) transparent;
            }

            /* Toolbar inside tab */
            .mii-subtoolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                flex-wrap: wrap;
            }

            /* Static, zero-recalc CSS variables for SVG part icons */
            .mii-parts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
                gap: 7px;
                contain: content;
                --icon-face-fill: #e4e4e7;
                --icon-face-stroke: #52525b;
                --icon-head-fill: #e4e4e7;
                --icon-head-stroke: #71717a;
                --icon-hair-fill: #3f3f46;
                --icon-facial-hair-fill: #3f3f46;
                --icon-hair-tie: #E775A6;
                --icon-glasses-fill: #3f3f46;
                --icon-glasses-shade: rgba(231, 117, 166, 0.22);
                --icon-hat-fill: #71717a;
                --icon-hat-stroke: #3f3f46;
                --icon-face-detail: #E775A6;
                --icon-face-wrinkles: #52525b;
                --icon-eyebrow-fill: #e4e4e7;
                --icon-mouth-tooth: #ffffff;
                --icon-lip-color-top: #E775A6;
                --icon-lip-color-bottom: #f48fb1;
                --eye-color: #71717a;
            }
            .mii-part-card {
                height: 58px;
                border-radius: 18px;
                background: rgba(255, 255, 255, 0.045);
                border: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                padding: 4px;
                color: #e4e4e7;
                transition: transform 140ms var(--ease-out), background-color 140ms var(--ease-out), border-color 140ms var(--ease-out);
            }
            .mii-part-card.mii-part-composite {
                color: #27272a;
            }
            .mii-part-card.selected {
                background: rgba(231, 117, 166, 0.14);
                border-color: rgba(231, 117, 166, 0.75);
                box-shadow: 0 0 0 1px rgba(231, 117, 166, 0.35);
            }
            .mii-part-card:active {
                transform: scale(0.95);
            }
            .mii-part-card svg {
                width: 42px;
                height: 42px;
                display: block;
                pointer-events: none;
            }

            /* Color Swatches */
            .mii-color-bar {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 6px;
            }
            .mii-color-swatch {
                width: 24px;
                height: 24px;
                border-radius: 9999px;
                border: 1.5px solid rgba(255, 255, 255, 0.16);
                cursor: pointer;
                padding: 0;
                transition: transform 140ms var(--ease-out), border-color 140ms var(--ease-out), box-shadow 140ms var(--ease-out);
            }
            .mii-color-swatch.selected {
                border-color: #ffffff;
                box-shadow: 0 0 0 2px #E775A6;
                transform: scale(1.1);
            }
            .mii-color-swatch:active {
                transform: scale(0.92);
            }

            /* Sliders Drawer */
            .mii-adjust-drawer {
                background: rgba(255, 255, 255, 0.025);
                border: 1px solid rgba(255, 255, 255, 0.07);
                border-radius: 18px;
                padding: 12px 16px;
                display: flex;
                flex-direction: column;
                gap: 9px;
            }
            .mii-slider-row {
                display: grid;
                grid-template-columns: 88px 1fr 32px;
                align-items: center;
                gap: 10px;
                font-size: 12px;
                color: #a1a1aa;
            }
            .mii-slider-val {
                text-align: right;
                font-size: 11.5px;
                color: #71717a;
                font-variant-numeric: tabular-nums;
            }
            .mii-slider-row input[type="range"] {
                width: 100%;
                accent-color: #E775A6;
                cursor: pointer;
                height: 4px;
                border-radius: 9999px;
            }

            .mii-section-label {
                font-size: 11px;
                font-weight: 500;
                color: #71717a;
                letter-spacing: -0.01em;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .mii-pill-btn {
                height: 24px;
                padding: 0 10px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 500;
                letter-spacing: -0.01em;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.07);
                color: #a1a1aa;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                transition: color 140ms var(--ease-out), background-color 140ms var(--ease-out), border-color 140ms var(--ease-out), transform 120ms var(--ease-out);
            }
            .mii-pill-btn.active {
                background: rgba(231, 117, 166, 0.16);
                border-color: rgba(231, 117, 166, 0.55);
                color: #ffffff;
            }
            .mii-pill-btn:active {
                transform: scale(0.97);
            }

            /* Footer */
            .mii-footer {
                height: 54px;
                padding: 0 18px;
                border-top: 1px solid rgba(255, 255, 255, 0.07);
                background: rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
                flex-shrink: 0;
            }
            .mii-save-btn {
                padding: 8px 18px;
                border-radius: 9999px;
                font-size: 12.5px;
                font-weight: 600;
                letter-spacing: -0.01em;
                color: #ffffff;
                background: #C4377A;
                border: 1px solid rgba(255, 255, 255, 0.16);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                cursor: pointer;
                transition: background-color 150ms var(--ease-out), transform 120ms var(--ease-out);
            }
            .mii-save-btn:active {
                transform: scale(0.97);
            }

            /* Hover states gated for fine pointers only */
            @media (hover: hover) and (pointer: fine) {
                .mii-close-btn:hover,
                .mii-icon-btn:hover,
                .mii-ghost-btn:hover,
                .mii-pill-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                }
                .mii-tab-btn:hover:not(.active) {
                    color: #d4d4d8;
                    background: rgba(255, 255, 255, 0.04);
                }
                .mii-part-card:hover:not(.selected) {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.15);
                }
                .mii-color-swatch:hover {
                    transform: scale(1.1);
                    border-color: #ffffff;
                }
                .mii-save-btn:hover {
                    background: #d44187;
                }
            }

            /* Responsive Mobile */
            @media (max-width: 740px) {
                .mii-studio-dialog {
                    height: 92vh;
                    border-radius: 22px;
                }
                .mii-studio-body {
                    grid-template-columns: 1fr;
                    overflow-y: auto;
                }
                .mii-stage-panel {
                    border-right: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                    padding: 14px;
                }
                .mii-stage-viewport {
                    width: 140px;
                    height: 140px;
                    border-radius: 30px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #mii-studio-modal,
                .mii-studio-dialog,
                .mii-part-card,
                .mii-color-swatch,
                .mii-tab-btn,
                .mii-pill-btn,
                .mii-save-btn {
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function randomizeMii() {
        const isFemale = state.rawBytes[IDX.gender] === 1 ? 1 : 0;
        const hairPool = isFemale ? HAIR_ORDER_FEMALE : HAIR_ORDER_MALE;
        const eyePool = isFemale ? EYE_ORDER_FEMALE : EYE_ORDER_MALE;
        const mouthPool = [19, 22, 1, 21, 0, 8, 10, 16, 6, 13, 15, 11];
        const nosePool = [1, 10, 2, 3, 6, 0, 5, 4];
        const skinPool = [0, 6, 7, 3, 1, 2, 4];
        const hairColors = [8, 1, 2, 3, 5, 6, 7, 32, 41, 50];
        const eyeColors = [8, 10, 11, 12, 13, 51, 41];
        const favColors = [7, 0, 1, 2, 3, 5, 6, 8, 10, 11];

        const pick = arr => arr[Math.floor(Math.random() * arr.length)];
        const hCol = pick(hairColors);
        const raw = isFemale ? PRESET_CHICA.slice() : PRESET_CHICO.slice();

        raw[IDX.gender] = isFemale;
        raw[IDX.facelineColor] = pick(skinPool);
        raw[IDX.facelineType] = Math.floor(Math.random() * 6);
        raw[IDX.facelineMake] = isFemale ? pick([0, 1, 2, 9]) : pick([0, 0, 9, 10]);
        raw[IDX.facelineWrinkle] = 0;
        raw[IDX.hairType] = pick(hairPool);
        raw[IDX.hairColor] = hCol;
        raw[IDX.hairFlip] = Math.random() < 0.5 ? 1 : 0;
        raw[IDX.eyeType] = pick(eyePool);
        raw[IDX.eyeColor] = pick(eyeColors);
        raw[IDX.eyebrowType] = isFemale ? pick([0, 1, 7, 9, 12, 19]) : pick([6, 0, 1, 8, 11]);
        raw[IDX.eyebrowColor] = hCol;
        raw[IDX.noseType] = pick(nosePool);
        raw[IDX.mouthType] = pick(mouthPool);
        raw[IDX.mouthColor] = isFemale ? pick([19, 20, 21, 22, 35]) : 19;
        raw[IDX.glassType] = Math.random() < 0.22 ? pick([1, 2, 3, 9, 11, 14, 15]) : 0;
        raw[IDX.glassColor] = pick([8, 14, 15, 16, 17]);
        raw[IDX.favoriteColor] = pick(favColors);
        raw[IDX.beardType] = 0;
        raw[IDX.mustacheType] = 0;

        state.rawBytes = clampBytes(raw);
        state.expression = 'normal';
        state.enabled = true;
        updateModeButtonsUI();
        playSound('colors.wav', 0.35);
        refreshPreview(true);
        renderActiveTab();
    }

    let previewTimer = null;
    let activePreloader = null;

    function getGooglePhotoUrl() {
        let url = window.yaireGooglePhotoURL || '';
        if (!url && window.yaireCurrentUser && Array.isArray(window.yaireCurrentUser.providerData)) {
            const prov = window.yaireCurrentUser.providerData.find(p => p && p.photoURL);
            if (prov) url = prov.photoURL;
        }
        if (url && url.includes('googleusercontent.com')) {
            url = url.replace(/=s\d+(-c)?/g, '=s400-c');
        }
        return url;
    }

    function refreshPreview(immediate) {
        if (!modalEl) return;
        const viewport = modalEl.querySelector('#mii-stage-viewport');
        const imgEl = modalEl.querySelector('#mii-stage-img');
        const loaderEl = modalEl.querySelector('#mii-stage-loader');

        if (viewport) {
            if (state.enabled === false) {
                viewport.style.backgroundColor = 'transparent';
            } else {
                const bgObj = BG_PRESETS.find(b => b.id === state.bgColor);
                viewport.style.backgroundColor = bgObj ? bgObj.hex : '#C4377A';
            }
        }

        if (previewTimer) clearTimeout(previewTimer);

        if (state.enabled === false) {
            if (activePreloader) {
                activePreloader.onload = null;
                activePreloader.onerror = null;
                activePreloader = null;
            }
            if (loaderEl) loaderEl.classList.remove('loading');
            const googleUrl = getGooglePhotoUrl();
            if (imgEl && googleUrl && imgEl.dataset.currentUrl !== googleUrl) {
                imgEl.src = googleUrl;
                imgEl.dataset.currentUrl = googleUrl;
            }
            return;
        }

        const delay = immediate ? 15 : 95;

        previewTimer = setTimeout(() => {
            if (!imgEl) return;
            const primaryUrl = buildMiiUrl(state.rawBytes, state, false);
            const fallbackUrl = buildMiiUrl(state.rawBytes, state, true);

            if (imgEl.dataset.currentUrl === primaryUrl) return;
            if (loaderEl) loaderEl.classList.add('loading');

            if (activePreloader) {
                activePreloader.onload = null;
                activePreloader.onerror = null;
                activePreloader = null;
            }

            const preloader = new Image();
            activePreloader = preloader;
            preloader.referrerPolicy = 'no-referrer';
            preloader.onload = () => {
                if (activePreloader !== preloader) return;
                imgEl.src = primaryUrl;
                imgEl.dataset.currentUrl = primaryUrl;
                if (loaderEl) loaderEl.classList.remove('loading');
            };
            preloader.onerror = () => {
                if (activePreloader !== preloader) return;
                const fbPreloader = new Image();
                activePreloader = fbPreloader;
                fbPreloader.referrerPolicy = 'no-referrer';
                fbPreloader.onload = () => {
                    if (activePreloader !== fbPreloader) return;
                    imgEl.src = fallbackUrl;
                    imgEl.dataset.currentUrl = primaryUrl;
                    if (loaderEl) loaderEl.classList.remove('loading');
                };
                fbPreloader.onerror = () => {
                    if (activePreloader !== fbPreloader) return;
                    if (loaderEl) loaderEl.classList.remove('loading');
                };
                fbPreloader.src = fallbackUrl;
            };
            preloader.src = primaryUrl;
        }, delay);
    }

    function buildColorPickerHTML(byteIdx, quickList, rightActionHTML) {
        const currentVal = state.rawBytes[byteIdx];
        const swatches = quickList.map(colorIdx => {
            const hex = SWITCH_COLORS[colorIdx] || '#000000';
            const sel = currentVal === colorIdx ? 'selected' : '';
            return `<button type="button" class="mii-color-swatch ${sel}" data-color-byte="${byteIdx}" data-color-val="${colorIdx}" style="background:${hex};" aria-label="Color ${colorIdx + 1}"></button>`;
        }).join('');

        return `
            <div>
                <div class="mii-section-label">
                    <span>Color</span>
                    ${rightActionHTML || ''}
                </div>
                <div class="mii-color-bar">${swatches}</div>
            </div>
        `;
    }

    function buildSliderHTML(label, byteIdx, min, max) {
        const val = state.rawBytes[byteIdx];
        return `
            <div class="mii-slider-row">
                <span>${label}</span>
                <input type="range" min="${min}" max="${max}" value="${val}" data-slider-byte="${byteIdx}" />
                <span class="mii-slider-val" data-slider-val="${byteIdx}">${val}</span>
            </div>
        `;
    }

    function getPartsGridNode(categoryKey, byteIdx, orderList, totalCount) {
        const currentVal = state.rawBytes[byteIdx];
        const cacheKey = `${categoryKey}_${byteIdx}_${orderList ? orderList[0] + '_' + orderList.length : totalCount}`;

        if (gridDomCache[cacheKey]) {
            const cachedGrid = gridDomCache[cacheKey];
            const prevSel = cachedGrid.querySelector('.mii-part-card.selected');
            if (prevSel) prevSel.classList.remove('selected');
            const nextSel = cachedGrid.querySelector(`[data-part-val="${currentVal}"]`);
            if (nextSel) nextSel.classList.add('selected');
            return cachedGrid;
        }

        const indices = orderList || Array.from({ length: totalCount }, (_, i) => i);
        const catIcons = iconsData && iconsData[categoryKey] ? iconsData[categoryKey] : null;

        const gridEl = document.createElement('div');
        gridEl.className = 'mii-parts-grid';
        gridEl.innerHTML = indices.map(idx => {
            const sel = currentVal === idx ? 'selected' : '';
            let rawSvg = (catIcons && catIcons[idx]) ? catIcons[idx] : '';
            let compositeClass = '';
            if (rawSvg) {
                if (categoryKey === 'glasses' || (categoryKey === 'mouth' && (rawSvg.includes('--icon-mouth-tooth') || rawSvg.includes('--icon-lip-color')))) {
                    compositeClass = 'mii-part-composite';
                } else if (categoryKey === 'eyes' && !rawSvg.includes('fill="white"') && !rawSvg.includes('var(--eye-color)')) {
                    rawSvg = rawSvg.replace(/fill="black"/g, 'fill="currentColor"').replace(/stroke="black"/g, 'stroke="currentColor"');
                }
            }
            const svgMarkup = rawSvg || `<span style="font-size:11px;font-weight:600;color:#71717a;">${idx + 1}</span>`;
            return `<button type="button" class="mii-part-card ${compositeClass} ${sel}" data-part-byte="${byteIdx}" data-part-val="${idx}" aria-label="Opción ${idx + 1}">${svgMarkup}</button>`;
        }).join('');

        if (catIcons) {
            gridDomCache[cacheKey] = gridEl;
        }
        return gridEl;
    }

    function renderActiveTab() {
        if (!modalEl) return;
        const container = modalEl.querySelector('#mii-tab-content');
        if (!container) return;

        const b = state.rawBytes;
        const isFemale = b[IDX.gender] === 1;

        // Ocultar pestaña Vello (Bigote/Barba) cuando el personaje es Femenino
        const beardTabBtn = modalEl.querySelector('.mii-tab-btn[data-tab="beard"]');
        if (beardTabBtn) {
            beardTabBtn.style.display = isFemale ? 'none' : '';
        }
        if (isFemale && activeTab === 'beard') {
            activeTab = 'face';
        }

        // Sincronizar selector de género en el panel izquierdo
        const stageFemBtn = modalEl.querySelector('#mii-stage-gender-f');
        const stageMaleBtn = modalEl.querySelector('#mii-stage-gender-m');
        if (stageFemBtn && stageMaleBtn) {
            stageFemBtn.classList.toggle('active', isFemale);
            stageMaleBtn.classList.toggle('active', !isFemale);
        }

        modalEl.querySelectorAll('.mii-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === activeTab);
        });

        container.innerHTML = '';

        if (activeTab === 'face') {
            const skinSwatches = SKIN_COLORS.map(s => {
                const sel = b[IDX.facelineColor] === s.id ? 'selected' : '';
                return `<button type="button" class="mii-color-swatch ${sel}" data-color-byte="${IDX.facelineColor}" data-color-val="${s.id}" style="background:${s.hex};" title="${s.label}"></button>`;
            }).join('');

            const topWrap = document.createElement('div');
            topWrap.style.display = 'flex';
            topWrap.style.flexDirection = 'column';
            topWrap.style.gap = '14px';
            topWrap.innerHTML = `
                <div>
                    <div class="mii-section-label"><span>Tono de piel</span></div>
                    <div class="mii-color-bar">${skinSwatches}</div>
                </div>
                <div class="mii-subtoolbar">
                    <div class="mii-segmented">
                        <button type="button" class="mii-segmented-btn ${subTabFace === 'shape' ? 'active' : ''}" data-subtab-face="shape">Contorno</button>
                        <button type="button" class="mii-segmented-btn ${subTabFace === 'makeup' ? 'active' : ''}" data-subtab-face="makeup">${isFemale ? 'Rubor y pecas' : 'Facciones'}</button>
                        <button type="button" class="mii-segmented-btn ${subTabFace === 'wrinkles' ? 'active' : ''}" data-subtab-face="wrinkles">Líneas</button>
                        <button type="button" class="mii-segmented-btn ${subTabFace === 'mole' ? 'active' : ''}" data-subtab-face="mole">Lunar</button>
                    </div>
                </div>
            `;
            container.appendChild(topWrap);

            if (subTabFace === 'shape') {
                container.appendChild(getPartsGridNode('face', IDX.facelineType, null, 12));
            } else if (subTabFace === 'makeup') {
                const makeupList = isFemale ? MAKEUP_ORDER_FEMALE : MAKEUP_ORDER_MALE;
                container.appendChild(getPartsGridNode('makeup', IDX.facelineMake, makeupList, makeupList.length));
            } else if (subTabFace === 'wrinkles') {
                container.appendChild(getPartsGridNode('wrinkles', IDX.facelineWrinkle, null, 12));
            } else {
                const moleBox = document.createElement('div');
                moleBox.className = 'mii-adjust-drawer';
                moleBox.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:12.5px;font-weight:500;color:#e4e4e7;">Mostrar lunar facial</span>
                        <button type="button" class="mii-pill-btn ${b[IDX.moleType] === 1 ? 'active' : ''}" id="mii-btn-toggle-mole">
                            ${b[IDX.moleType] === 1 ? 'Activado' : 'Desactivado'}
                        </button>
                    </div>
                    ${buildSliderHTML('Tamaño', IDX.moleScale, 0, 8)}
                    ${buildSliderHTML('Posición X', IDX.moleX, 0, 16)}
                    ${buildSliderHTML('Posición Y', IDX.moleY, 0, 30)}
                `;
                container.appendChild(moleBox);
            }
        } else if (activeTab === 'hair') {
            const hairList = isFemale ? HAIR_ORDER_FEMALE : HAIR_ORDER_MALE;
            const flipBtn = `<button type="button" class="mii-pill-btn ${b[IDX.hairFlip] === 1 ? 'active' : ''}" id="mii-btn-hairflip">Invertir</button>`;
            const topWrap = document.createElement('div');
            topWrap.style.display = 'flex';
            topWrap.style.flexDirection = 'column';
            topWrap.style.gap = '10px';
            topWrap.innerHTML = buildColorPickerHTML(IDX.hairColor, QUICK_HAIR_COLORS, flipBtn);
            container.appendChild(topWrap);
            container.appendChild(getPartsGridNode('hair', IDX.hairType, hairList, hairList.length));
        } else if (activeTab === 'eyes') {
            const eyeList = isFemale ? EYE_ORDER_FEMALE : EYE_ORDER_MALE;
            const adjBtn = `<button type="button" class="mii-pill-btn ${showAdjustments ? 'active' : ''}" id="mii-toggle-adjust">Ajustar</button>`;
            const topWrap = document.createElement('div');
            topWrap.style.display = 'flex';
            topWrap.style.flexDirection = 'column';
            topWrap.style.gap = '10px';
            topWrap.innerHTML = `
                ${buildColorPickerHTML(IDX.eyeColor, QUICK_EYE_COLORS, adjBtn)}
                ${showAdjustments ? `
                    <div class="mii-adjust-drawer">
                        ${buildSliderHTML('Tamaño', IDX.eyeScale, 0, 7)}
                        ${buildSliderHTML('Apertura', IDX.eyeAspect, 0, 6)}
                        ${buildSliderHTML('Inclinación', IDX.eyeRotate, 0, 7)}
                        ${buildSliderHTML('Separación', IDX.eyeX, 0, 12)}
                        ${buildSliderHTML('Altura', IDX.eyeY, 0, 18)}
                    </div>
                ` : ''}
            `;
            container.appendChild(topWrap);
            container.appendChild(getPartsGridNode('eyes', IDX.eyeType, eyeList, eyeList.length));
        } else if (activeTab === 'eyebrows') {
            const adjBtn = `<button type="button" class="mii-pill-btn ${showAdjustments ? 'active' : ''}" id="mii-toggle-adjust">Ajustar</button>`;
            const topWrap = document.createElement('div');
            topWrap.style.display = 'flex';
            topWrap.style.flexDirection = 'column';
            topWrap.style.gap = '10px';
            topWrap.innerHTML = `
                ${buildColorPickerHTML(IDX.eyebrowColor, QUICK_HAIR_COLORS, adjBtn)}
                ${showAdjustments ? `
                    <div class="mii-adjust-drawer">
                        ${buildSliderHTML('Tamaño', IDX.eyebrowScale, 0, 8)}
                        ${buildSliderHTML('Grosor', IDX.eyebrowAspect, 0, 6)}
                        ${buildSliderHTML('Inclinación', IDX.eyebrowRotate, 0, 11)}
                        ${buildSliderHTML('Separación', IDX.eyebrowX, 0, 12)}
                        ${buildSliderHTML('Altura', IDX.eyebrowY, 3, 18)}
                    </div>
                ` : ''}
            `;
            container.appendChild(topWrap);
            container.appendChild(getPartsGridNode('eyebrows', IDX.eyebrowType, EYEBROW_ORDER, 24));
        } else if (activeTab === 'nose') {
            const topWrap = document.createElement('div');
            topWrap.style.display = 'flex';
            topWrap.style.flexDirection = 'column';
            topWrap.style.gap = '10px';
            topWrap.innerHTML = `
                <div class="mii-section-label" style="margin:0;">
                    <span>Forma de nariz</span>
                    <button type="button" class="mii-pill-btn ${showAdjustments ? 'active' : ''}" id="mii-toggle-adjust">Ajustar</button>
                </div>
                ${showAdjustments ? `
                    <div class="mii-adjust-drawer">
                        ${buildSliderHTML('Tamaño', IDX.noseScale, 0, 8)}
                        ${buildSliderHTML('Altura', IDX.noseY, 0, 18)}
                    </div>
                ` : ''}
            `;
            container.appendChild(topWrap);
            container.appendChild(getPartsGridNode('nose', IDX.noseType, NOSE_ORDER, 18));
        } else if (activeTab === 'mouth') {
            const adjBtn = `<button type="button" class="mii-pill-btn ${showAdjustments ? 'active' : ''}" id="mii-toggle-adjust">Ajustar</button>`;
            const topWrap = document.createElement('div');
            topWrap.style.display = 'flex';
            topWrap.style.flexDirection = 'column';
            topWrap.style.gap = '10px';
            topWrap.innerHTML = `
                ${buildColorPickerHTML(IDX.mouthColor, QUICK_MOUTH_COLORS, adjBtn)}
                ${showAdjustments ? `
                    <div class="mii-adjust-drawer">
                        ${buildSliderHTML('Tamaño', IDX.mouthScale, 0, 8)}
                        ${buildSliderHTML('Grosor', IDX.mouthAspect, 0, 6)}
                        ${buildSliderHTML('Altura', IDX.mouthY, 0, 18)}
                    </div>
                ` : ''}
            `;
            container.appendChild(topWrap);
            container.appendChild(getPartsGridNode('mouth', IDX.mouthType, MOUTH_ORDER, 36));
        } else if (activeTab === 'glasses') {
            const adjBtn = `<button type="button" class="mii-pill-btn ${showAdjustments ? 'active' : ''}" id="mii-toggle-adjust">Ajustar</button>`;
            const topWrap = document.createElement('div');
            topWrap.style.display = 'flex';
            topWrap.style.flexDirection = 'column';
            topWrap.style.gap = '10px';
            topWrap.innerHTML = `
                ${buildColorPickerHTML(IDX.glassColor, QUICK_GLASS_COLORS, adjBtn)}
                ${showAdjustments ? `
                    <div class="mii-adjust-drawer">
                        ${buildSliderHTML('Tamaño', IDX.glassScale, 0, 7)}
                        ${buildSliderHTML('Altura', IDX.glassY, 0, 20)}
                    </div>
                ` : ''}
            `;
            container.appendChild(topWrap);
            container.appendChild(getPartsGridNode('glasses', IDX.glassType, null, 20));
        } else if (activeTab === 'beard') {
            if (subTabBeard === 'mole') subTabBeard = 'mustache';
            const topWrap = document.createElement('div');
            topWrap.style.display = 'flex';
            topWrap.style.flexDirection = 'column';
            topWrap.style.gap = '10px';
            topWrap.innerHTML = `
                ${buildColorPickerHTML(IDX.beardColor, QUICK_HAIR_COLORS)}
                <div class="mii-subtoolbar">
                    <div class="mii-segmented">
                        <button type="button" class="mii-segmented-btn ${subTabBeard === 'mustache' ? 'active' : ''}" data-subtab-beard="mustache">Bigote</button>
                        <button type="button" class="mii-segmented-btn ${subTabBeard === 'goatee' ? 'active' : ''}" data-subtab-beard="goatee">Barba</button>
                    </div>
                    ${subTabBeard === 'mustache' ? `
                        <button type="button" class="mii-pill-btn ${showAdjustments ? 'active' : ''}" id="mii-toggle-adjust">Ajustar</button>
                    ` : ''}
                </div>
            `;
            container.appendChild(topWrap);

            if (subTabBeard === 'mustache') {
                if (showAdjustments) {
                    const adj = document.createElement('div');
                    adj.className = 'mii-adjust-drawer';
                    adj.innerHTML = `
                        ${buildSliderHTML('Tamaño', IDX.mustacheScale, 0, 8)}
                        ${buildSliderHTML('Altura', IDX.mustacheY, 0, 16)}
                    `;
                    container.appendChild(adj);
                }
                container.appendChild(getPartsGridNode('mustache', IDX.mustacheType, null, 6));
            } else {
                container.appendChild(getPartsGridNode('goatee', IDX.beardType, null, 6));
            }
        } else if (activeTab === 'style') {
            const expBtns = EXPRESSIONS.map(ex => {
                const active = state.expression === ex.id ? 'active' : '';
                return `<button type="button" class="mii-pill-btn ${active}" data-expression="${ex.id}">${ex.label}</button>`;
            }).join('');

            const favSwatches = FAVORITE_COLORS.map(fc => {
                const sel = b[IDX.favoriteColor] === fc.id ? 'selected' : '';
                return `<button type="button" class="mii-color-swatch ${sel}" data-color-byte="${IDX.favoriteColor}" data-color-val="${fc.id}" style="background:${fc.hex};" title="${fc.label}"></button>`;
            }).join('');

            const bgSwatches = BG_PRESETS.map(bg => {
                const sel = state.bgColor === bg.id ? 'selected' : '';
                return `<button type="button" class="mii-color-swatch ${sel}" data-bg-preset="${bg.id}" style="background:${bg.hex};" title="${bg.label}"></button>`;
            }).join('');

            const styleWrap = document.createElement('div');
            styleWrap.style.display = 'flex';
            styleWrap.style.flexDirection = 'column';
            styleWrap.style.gap = '16px';
            styleWrap.innerHTML = `
                <div>
                    <div class="mii-section-label"><span>Fondo del retrato</span></div>
                    <div class="mii-color-bar">${bgSwatches}</div>
                </div>
                <div>
                    <div class="mii-section-label"><span>Color de vestimenta</span></div>
                    <div class="mii-color-bar">${favSwatches}</div>
                </div>
                <div>
                    <div class="mii-section-label"><span>Expresión de cámara</span></div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">${expBtns}</div>
                </div>
            `;
            container.appendChild(styleWrap);
        }
    }

    function ensureModalDOM() {
        if (modalEl) return modalEl;
        injectStyles();

        modalEl = document.createElement('div');
        modalEl.id = 'mii-studio-modal';
        modalEl.innerHTML = `
            <div class="mii-studio-dialog" role="dialog" aria-modal="true" aria-label="Personaje Mii">
                <!-- Header -->
                <div class="mii-header">
                    <span class="mii-header-title">Personaje</span>
                    <div class="mii-segmented" role="tablist" aria-label="Tipo de avatar">
                        <button type="button" id="mii-mode-mii" class="mii-segmented-btn active">Personaje Mii</button>
                        <button type="button" id="mii-mode-google" class="mii-segmented-btn">Foto de Google</button>
                    </div>
                    <button type="button" id="mii-btn-close" class="mii-close-btn" aria-label="Cerrar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="mii-studio-body">
                    <!-- Left Stage -->
                    <div class="mii-stage-panel">
                        <div style="display:flex;flex-direction:column;align-items:center;width:100%;">
                            <div id="mii-stage-viewport" class="mii-stage-viewport">
                                <img id="mii-stage-img" src="" alt="Vista previa del personaje" referrerpolicy="no-referrer" />
                                <div id="mii-stage-loader" class="mii-stage-loader"></div>
                            </div>
                        </div>

                        <div class="mii-presets-box" style="gap:8px;align-items:center;">
                            <div class="mii-segmented" style="width:100%;">
                                <button type="button" id="mii-stage-gender-f" class="mii-segmented-btn active" style="flex:1;" data-gender-preset="1">Femenino</button>
                                <button type="button" id="mii-stage-gender-m" class="mii-segmented-btn" style="flex:1;" data-gender-preset="0">Masculino</button>
                            </div>
                            <button type="button" id="mii-preset-random" class="mii-ghost-btn">Generar Mii al azar</button>
                        </div>
                    </div>

                    <!-- Right Customization Panel -->
                    <div class="mii-editor-panel">
                        <div class="mii-tabs-bar" role="tablist">
                            <button type="button" class="mii-tab-btn active" data-tab="face">Rostro</button>
                            <button type="button" class="mii-tab-btn" data-tab="hair">Cabello</button>
                            <button type="button" class="mii-tab-btn" data-tab="eyes">Ojos</button>
                            <button type="button" class="mii-tab-btn" data-tab="eyebrows">Cejas</button>
                            <button type="button" class="mii-tab-btn" data-tab="nose">Nariz</button>
                            <button type="button" class="mii-tab-btn" data-tab="mouth">Boca</button>
                            <button type="button" class="mii-tab-btn" data-tab="glasses">Gafas</button>
                            <button type="button" class="mii-tab-btn" data-tab="beard">Vello</button>
                            <button type="button" class="mii-tab-btn" data-tab="style">Estilo</button>
                        </div>
                        <div id="mii-tab-content" class="mii-tab-content"></div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="mii-footer">
                    <button type="button" id="mii-btn-cancel" class="mii-pill-btn" style="background:transparent;border-color:transparent;color:#a1a1aa;">
                        Cancelar
                    </button>
                    <button type="button" id="mii-btn-save" class="mii-save-btn">
                        Guardar cambios
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalEl);
        bindModalEvents();
        return modalEl;
    }

    function updateModeButtonsUI() {
        if (!modalEl) return;
        const isGoogleMode = state.enabled === false;
        const btnMii = modalEl.querySelector('#mii-mode-mii');
        const btnGoogle = modalEl.querySelector('#mii-mode-google');
        const dialogEl = modalEl.querySelector('.mii-studio-dialog');
        if (btnMii && btnGoogle) {
            btnMii.classList.toggle('active', !isGoogleMode);
            btnGoogle.classList.toggle('active', isGoogleMode);
        }
        if (dialogEl) {
            dialogEl.classList.toggle('google-mode', isGoogleMode);
        }
    }

    function bindModalEvents() {
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) closeMiiStudio();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalEl && modalEl.classList.contains('open')) {
                closeMiiStudio();
            }
        });

        modalEl.querySelector('#mii-btn-close').addEventListener('click', closeMiiStudio);
        modalEl.querySelector('#mii-btn-cancel').addEventListener('click', closeMiiStudio);

        // Selector Mii / Google
        modalEl.querySelector('#mii-mode-mii').addEventListener('click', () => {
            if (state.enabled !== false) return;
            state.enabled = true;
            playSound('seleccionsi.wav', 0.35);
            updateModeButtonsUI();
            refreshPreview(true);
        });
        modalEl.querySelector('#mii-mode-google').addEventListener('click', () => {
            if (state.enabled === false) return;
            state.enabled = false;
            playSound('seleccionno.wav', 0.35);
            updateModeButtonsUI();
            refreshPreview(true);
        });

        // Selector de género en el panel izquierdo
        modalEl.addEventListener('click', (e) => {
            const genderPresetBtn = e.target.closest('[data-gender-preset]');
            if (genderPresetBtn) {
                const isFemale = parseInt(genderPresetBtn.dataset.genderPreset, 10) === 1;
                if ((state.rawBytes[IDX.gender] === 1) === isFemale) return;
                const currentSkin = state.rawBytes[IDX.facelineColor];
                const nextRaw = isFemale ? PRESET_CHICA.slice() : PRESET_CHICO.slice();
                nextRaw[IDX.facelineColor] = currentSkin;
                state.rawBytes = clampBytes(nextRaw);
                state.expression = 'normal';
                state.enabled = true;
                updateModeButtonsUI();
                playSound('colors.wav', 0.35);
                refreshPreview(true);
                renderActiveTab();
            }
        });

        // Generar Mii al azar
        modalEl.querySelector('#mii-preset-random').addEventListener('click', randomizeMii);

        // Pestañas principales (con soporte de rueda horizontal y centrado automático)
        const tabsBar = modalEl.querySelector('.mii-tabs-bar');
        if (tabsBar) {
            tabsBar.addEventListener('wheel', (e) => {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                    tabsBar.scrollLeft += e.deltaY;
                }
            }, { passive: true });
        }

        modalEl.querySelectorAll('.mii-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (activeTab === btn.dataset.tab) return;
                activeTab = btn.dataset.tab;
                btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                playSound('navegacion.wav', 0.3);
                renderActiveTab();
            });
        });

        // Delegación O(1) en el contenido de la pestaña
        const contentEl = modalEl.querySelector('#mii-tab-content');
        contentEl.addEventListener('click', (e) => {
            const subFaceBtn = e.target.closest('[data-subtab-face]');
            if (subFaceBtn) {
                subTabFace = subFaceBtn.dataset.subtabFace;
                renderActiveTab();
                return;
            }

            const subBeardBtn = e.target.closest('[data-subtab-beard]');
            if (subBeardBtn) {
                subTabBeard = subBeardBtn.dataset.subtabBeard;
                renderActiveTab();
                return;
            }

            if (e.target.closest('#mii-toggle-adjust')) {
                showAdjustments = !showAdjustments;
                renderActiveTab();
                return;
            }

            if (e.target.closest('#mii-toggle-all-colors')) {
                showAllColors = !showAllColors;
                renderActiveTab();
                return;
            }

            if (e.target.closest('#mii-btn-toggle-mole')) {
                state.rawBytes[IDX.moleType] = state.rawBytes[IDX.moleType] === 1 ? 0 : 1;
                state.enabled = true;
                updateModeButtonsUI();
                refreshPreview(true);
                renderActiveTab();
                return;
            }

            // Selección de parte O(1) sin re-renderizar innerHTML
            const partBtn = e.target.closest('[data-part-byte]');
            if (partBtn) {
                const byteIdx = parseInt(partBtn.dataset.partByte, 10);
                const val = parseInt(partBtn.dataset.partVal, 10);
                state.rawBytes[byteIdx] = val;
                state.enabled = true;
                updateModeButtonsUI();

                const isSegmented = partBtn.classList.contains('mii-segmented-btn');
                const activeClass = isSegmented ? 'active' : 'selected';
                contentEl.querySelectorAll(`[data-part-byte="${byteIdx}"]`).forEach(el => {
                    el.classList.toggle(activeClass, el === partBtn);
                });

                playSound('seleccionsi.wav', 0.3);
                refreshPreview(true);
                return;
            }

            // Selección de color O(1) sin re-renderizar innerHTML
            const colorBtn = e.target.closest('[data-color-byte]');
            if (colorBtn) {
                const byteIdx = parseInt(colorBtn.dataset.colorByte, 10);
                const val = parseInt(colorBtn.dataset.colorVal, 10);
                state.rawBytes[byteIdx] = val;
                if (byteIdx === IDX.hairColor) {
                    state.rawBytes[IDX.eyebrowColor] = val;
                    state.rawBytes[IDX.beardColor] = val;
                }
                state.enabled = true;
                updateModeButtonsUI();

                contentEl.querySelectorAll(`[data-color-byte="${byteIdx}"]`).forEach(el => {
                    el.classList.toggle('selected', el === colorBtn);
                });

                playSound('colors.wav', 0.3);
                refreshPreview(true);
                return;
            }

            if (e.target.closest('#mii-btn-hairflip')) {
                const btn = e.target.closest('#mii-btn-hairflip');
                state.rawBytes[IDX.hairFlip] = state.rawBytes[IDX.hairFlip] === 1 ? 0 : 1;
                btn.classList.toggle('active', state.rawBytes[IDX.hairFlip] === 1);
                playSound('seleccionsi.wav', 0.3);
                refreshPreview(true);
                return;
            }

            const expBtn = e.target.closest('[data-expression]');
            if (expBtn) {
                state.expression = expBtn.dataset.expression;
                state.enabled = true;
                updateModeButtonsUI();
                contentEl.querySelectorAll('[data-expression]').forEach(el => {
                    el.classList.toggle('active', el === expBtn);
                });
                playSound('seleccionsi.wav', 0.3);
                refreshPreview(true);
                return;
            }

            const bgBtn = e.target.closest('[data-bg-preset]');
            if (bgBtn) {
                state.bgColor = bgBtn.dataset.bgPreset;
                state.enabled = true;
                updateModeButtonsUI();
                contentEl.querySelectorAll('[data-bg-preset]').forEach(el => {
                    el.classList.toggle('selected', el === bgBtn);
                });
                playSound('colors.wav', 0.3);
                refreshPreview(true);
                return;
            }
        });

        contentEl.addEventListener('input', (e) => {
            const slider = e.target.closest('[data-slider-byte]');
            if (slider) {
                const byteIdx = parseInt(slider.dataset.sliderByte, 10);
                const val = parseInt(slider.value, 10);
                state.rawBytes[byteIdx] = val;
                state.enabled = true;
                updateModeButtonsUI();
                const valLabel = contentEl.querySelector(`[data-slider-val="${byteIdx}"]`);
                if (valLabel) valLabel.textContent = String(val);
                refreshPreview(false);
            }
        });

        modalEl.querySelector('#mii-btn-save').addEventListener('click', async () => {
            const saveBtn = modalEl.querySelector('#mii-btn-save');
            const origText = saveBtn.textContent;
            saveBtn.textContent = 'Guardando...';
            saveBtn.disabled = true;

            const avatarHeadUrl = buildMiiUrl(state.rawBytes, {
                viewType: 'face',
                width: 512,
                expression: state.expression || 'normal',
                bgColor: state.bgColor || 'C4377AFF',
                rotateY: 0
            }, false);

            const profilePayload = {
                enabled: state.enabled !== false,
                dataHex: encodeStudioMii(state.rawBytes),
                rawBytes: clampBytes(state.rawBytes),
                expression: state.expression || 'normal',
                bgColor: state.bgColor || 'C4377AFF',
                viewType: state.viewType || 'face',
                avatarUrl: avatarHeadUrl,
                updatedAt: Date.now()
            };

            try {
                if (typeof window.yaireSaveMiiProfile === 'function') {
                    await window.yaireSaveMiiProfile(profilePayload);
                } else {
                    localStorage.setItem('yaire_mii_guest', JSON.stringify(profilePayload));
                }
                playSound('celebration.wav', 0.45);
                closeMiiStudio();
                if (window.showPremiumAlert) {
                    window.showPremiumAlert(
                        profilePayload.enabled ? 'Personaje actualizado' : 'Foto de Google activada',
                        profilePayload.enabled
                            ? 'Tu personaje Mii ya está activo en tu cuenta, comentarios y canal de voz.'
                            : 'Tu cuenta volvió a mostrar tu foto de perfil de Google.',
                        'success'
                    );
                }
            } catch (err) {
                console.error('Error guardando Mii:', err);
            } finally {
                saveBtn.textContent = origText;
                saveBtn.disabled = false;
            }
        });
    }

    function openMiiStudio() {
        ensureModalDOM();
        if (modalEl && modalEl.classList.contains('open')) return;

        let saved = null;
        if (typeof window.yaireGetCurrentMiiProfile === 'function') {
            saved = window.yaireGetCurrentMiiProfile();
        }
        if (!saved) {
            try {
                const rawGuest = localStorage.getItem('yaire_mii_guest');
                if (rawGuest) saved = JSON.parse(rawGuest);
            } catch (e) {}
        }

        if (saved && Array.isArray(saved.rawBytes) && saved.rawBytes.length === 46) {
            state.rawBytes = clampBytes(saved.rawBytes);
            state.expression = saved.expression || 'normal';
            state.bgColor = saved.bgColor || 'C4377AFF';
            state.viewType = 'face';
            state.enabled = saved.enabled !== false;
            state.rotateY = 0;
        } else if (saved && saved.dataHex) {
            const dec = decodeStudioMii(saved.dataHex);
            if (dec) state.rawBytes = dec;
            state.expression = saved.expression || 'normal';
            state.bgColor = saved.bgColor || 'C4377AFF';
            state.enabled = saved.enabled !== false;
        }

        updateModeButtonsUI();
        modalEl.classList.add('open');
        playSound('gameopen.wav', 0.35);
        startMiiBgm();

        refreshPreview(true);
        renderActiveTab();

        loadIconsJson().then(() => {
            if (modalEl && modalEl.classList.contains('open')) {
                renderActiveTab();
            }
        });
    }

    function closeMiiStudio() {
        if (!modalEl) return;
        modalEl.classList.remove('open');
        stopMiiBgm();
        playSound('flyout.wav', 0.3);
    }

    window.openMiiStudio28E = openMiiStudio;
    window.closeMiiStudio28E = closeMiiStudio;
    window.MiiStudio28E = {
        open: openMiiStudio,
        close: closeMiiStudio,
        encodeStudioMii,
        decodeStudioMii,
        buildMiiUrl
    };
})();

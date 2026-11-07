/**
 * ============================================================================
 * ESTUDIO MII 28E — Creador Oficial de Personajes Mii para Cuentas 28E
 * ============================================================================
 * Conectado al motor de renderizado Nintendo Mii Studio (studio.mii.nintendo.com)
 * con respaldo en FFL Renderer (mii-unsecure.ariankordi.net) y sincronización
 * en tiempo real con Firebase Realtime Database (users/{uid}/miiProfile).
 */
(function () {
    'use strict';

    const NINTENDO_API = 'https://studio.mii.nintendo.com/miis/image.png';
    const FALLBACK_API = 'https://mii-unsecure.ariankordi.net/miis/image.png';
    const ICONS_JSON_URL = 'assets/data/mii-icons.json';

    // Tablas de orden visual oficial de Nintendo Switch / Mii Studio
    const HAIR_ORDER = [
        33, 47, 40, 37, 32, 107, 48, 51, 55, 70, 44, 66,
        52, 50, 38, 49, 43, 31, 56, 68, 62, 115, 76, 119,
        64, 81, 116, 121, 22, 58, 60, 87, 125, 117, 73, 75,
        42, 89, 57, 54, 80, 34, 23, 86, 88, 118, 39, 36,
        45, 67, 59, 65, 41, 30, 12, 16, 10, 82, 128, 129,
        14, 95, 105, 100, 6, 20, 93, 102, 27, 4, 17, 110,
        123, 8, 106, 72, 3, 21, 0, 98, 63, 90, 11, 120,
        5, 74, 108, 94, 124, 25, 99, 69, 35, 13, 122, 113,
        53, 24, 85, 83, 71, 131, 96, 101, 29, 7, 15, 112,
        79, 1, 109, 127, 91, 26, 61, 103, 2, 77, 18, 92,
        84, 9, 19, 130, 97, 104, 46, 78, 28, 114, 126, 111
    ];

    const EYE_ORDER = [
        2, 4, 0, 8, 39, 17, 1, 26, 16, 15, 27, 20,
        33, 11, 19, 32, 9, 12, 23, 34, 21, 25, 40, 35,
        5, 41, 13, 36, 37, 6, 24, 30, 31, 18, 28, 46,
        7, 44, 38, 42, 45, 29, 3, 43, 22, 10, 14, 47,
        48, 49, 50, 53, 59, 56, 54, 58, 57, 55, 51, 52
    ];

    const EYEBROW_ORDER = [
        6, 0, 12, 1, 9, 19, 7, 21, 8, 17, 5, 4,
        11, 10, 2, 3, 14, 20, 15, 13, 22, 18, 16, 23
    ];

    const MOUTH_ORDER = [
        23, 1, 19, 21, 22, 5, 0, 8, 10, 16, 6, 13,
        7, 9, 2, 17, 3, 4, 15, 11, 20, 18, 14, 12,
        27, 30, 24, 25, 29, 28, 26, 35, 31, 34, 33, 32
    ];

    const NOSE_ORDER = [
        1, 10, 2, 3, 6, 0, 5, 4, 8, 9, 7, 11,
        13, 14, 12, 17, 16, 15
    ];

    const SKIN_COLORS = [
        { id: 0, hex: '#FFD3AD', label: 'Marfil Cálido' },
        { id: 6, hex: '#FFBEA5', label: 'Porcelana Rosada' },
        { id: 7, hex: '#FFC58F', label: 'Durazno Claro' },
        { id: 3, hex: '#FFAA8C', label: ' Coral Suave' },
        { id: 1, hex: '#FEB66B', label: 'Trigueño Miel' },
        { id: 2, hex: '#DE7942', label: 'Bronceado' },
        { id: 4, hex: '#AD5129', label: 'Canela' },
        { id: 8, hex: '#8C3C23', label: 'Caoba' },
        { id: 5, hex: '#632C18', label: 'Cacao' },
        { id: 9, hex: '#3C2D23', label: 'Ébano' }
    ];

    const FAVORITE_COLORS = [
        { id: 7, hex: '#F55A7D', label: 'Rosa 28E' },
        { id: 0, hex: '#D21E14', label: 'Rojo' },
        { id: 1, hex: '#FF6E19', label: 'Naranja' },
        { id: 2, hex: '#FFD820', label: 'Amarillo' },
        { id: 3, hex: '#78D220', label: 'Verde Lima' },
        { id: 4, hex: '#007830', label: 'Verde Bosque' },
        { id: 6, hex: '#3CAADE', label: 'Azul Cielo' },
        { id: 5, hex: '#0A48BC', label: 'Azul Real' },
        { id: 8, hex: '#7328AD', label: 'Morado' },
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

    // Colores destacados rápidos por categoría
    const QUICK_HAIR_COLORS = [8, 1, 2, 3, 5, 6, 7, 4, 99, 32, 35, 41, 50, 61, 69, 20];
    const QUICK_EYE_COLORS = [8, 10, 11, 12, 51, 13, 68, 9, 41, 32, 35, 85, 20, 96];
    const QUICK_MOUTH_COLORS = [19, 20, 21, 22, 23, 32, 34, 35, 36, 28, 40];
    const QUICK_GLASS_COLORS = [8, 14, 15, 16, 17, 18, 32, 35, 41, 51, 68, 99];

    const BG_PRESETS = [
        { id: 'C4377AFF', hex: '#C4377A', label: 'Rosa 28E' },
        { id: 'F472B6FF', hex: '#F472B6', label: 'Rosa Pastel' },
        { id: '18181BFF', hex: '#18181B', label: 'Noche 28E' },
        { id: '3B0764FF', hex: '#3B0764', label: 'Violeta Nocturno' },
        { id: '7C3AEDFF', hex: '#7C3AED', label: 'Púrpura' },
        { id: '1D4ED8FF', hex: '#1D4ED8', label: 'Azul Real' },
        { id: '0284C7FF', hex: '#0284C7', label: 'Azul Cielo' },
        { id: '059669FF', hex: '#059669', label: 'Esmeralda' },
        { id: 'D97706FF', hex: '#D97706', label: 'Ámbar Dorado' },
        { id: 'E11D48FF', hex: '#E11D48', label: 'Carmesí' },
        { id: 'F4F4F5FF', hex: '#F4F4F5', label: 'Blanco Nube' },
        { id: '00000000', hex: 'transparent', label: 'Transparente' }
    ];

    const EXPRESSIONS = [
        { id: 'smile', label: 'Sonrisa', emoji: '😊' },
        { id: 'normal', label: 'Normal', emoji: '🙂' },
        { id: 'like_wink_left', label: 'Guiño Feliz', emoji: '😉' },
        { id: 'wink_left', label: 'Guiño Izq.', emoji: '😜' },
        { id: 'wink_right', label: 'Guiño Der.', emoji: '😝' },
        { id: 'surprise', label: 'Sorpresa', emoji: '😮' },
        { id: 'blink', label: 'Relajado', emoji: '😌' },
        { id: 'anger', label: 'Intenso', emoji: '😠' },
        { id: 'sorrow', label: 'Puchero', emoji: '🥺' }
    ];

    // Índices exactos en el buffer de 46 bytes de Mii Studio (orden alfabético de campos de CharInfoRaw)
    const IDX = {
        beardColor: 0,      // 0..99
        beardType: 1,       // 0..5
        build: 2,           // 0..127
        eyeAspect: 3,       // 0..6
        eyeColor: 4,        // 0..99
        eyeRotate: 5,       // 0..7
        eyeScale: 6,        // 0..7
        eyeType: 7,         // 0..59
        eyeX: 8,            // 0..12
        eyeY: 9,            // 0..18
        eyebrowAspect: 10,  // 0..6
        eyebrowColor: 11,   // 0..99
        eyebrowRotate: 12,  // 0..11
        eyebrowScale: 13,   // 0..8
        eyebrowType: 14,    // 0..23
        eyebrowX: 15,       // 0..12
        eyebrowY: 16,       // 3..18
        facelineColor: 17,  // 0..9
        facelineMake: 18,   // 0..11
        facelineType: 19,   // 0..11
        facelineWrinkle: 20,// 0..11
        favoriteColor: 21,  // 0..11
        gender: 22,         // 0..1
        glassColor: 23,     // 0..99
        glassScale: 24,     // 0..7
        glassType: 25,      // 0..19
        glassY: 26,         // 0..20
        hairColor: 27,      // 0..99
        hairFlip: 28,       // 0..1
        hairType: 29,       // 0..131
        height: 30,         // 0..127
        moleScale: 31,      // 0..8
        moleType: 32,       // 0..1
        moleX: 33,          // 0..16
        moleY: 34,          // 0..30
        mouthAspect: 35,    // 0..6
        mouthColor: 36,     // 0..99
        mouthScale: 37,     // 0..8
        mouthType: 38,      // 0..35
        mouthY: 39,         // 0..18
        mustacheScale: 40,  // 0..8
        mustacheType: 41,   // 0..5
        mustacheY: 42,      // 0..16
        noseScale: 43,      // 0..8
        noseType: 44,       // 0..17
        noseY: 45           // 0..18
    };

    const BOUNDS = [
        [0, 99], [0, 5], [0, 127], [0, 6], [0, 99], [0, 7], [0, 7], [0, 59], [0, 12], [0, 18],
        [0, 6], [0, 99], [0, 11], [0, 8], [0, 23], [0, 12], [3, 18], [0, 9], [0, 11], [0, 11],
        [0, 11], [0, 11], [0, 1], [0, 99], [0, 7], [0, 19], [0, 20], [0, 99], [0, 1], [0, 131],
        [0, 127], [0, 8], [0, 1], [0, 16], [0, 30], [0, 6], [0, 99], [0, 8], [0, 35], [0, 18],
        [0, 8], [0, 5], [0, 16], [0, 8], [0, 17], [0, 18]
    ];

    const PRESET_CHICA = [
        8, 0, 58, 3, 10, 3, 4, 4, 2, 12,
        3, 1, 6, 4, 0, 2, 10, 0, 1, 0,
        0, 7, 1, 8, 4, 0, 10, 1, 0, 12,
        60, 4, 0, 2, 20, 3, 21, 4, 23, 13,
        4, 0, 10, 3, 1, 9
    ];

    const PRESET_CHICO = [
        8, 0, 64, 3, 8, 4, 4, 2, 2, 12,
        3, 8, 6, 4, 6, 2, 10, 0, 0, 0,
        0, 11, 0, 8, 4, 0, 10, 8, 0, 33,
        68, 4, 0, 2, 20, 3, 19, 4, 23, 13,
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
        if (bytes.length === 46) {
            return clampBytes(bytes);
        }
        // Deobfuscate 47-byte URL payload
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
        const expression = options.expression || 'smile';
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

    // Estado del Estudio Mii
    let iconsData = null;
    let iconsLoadingPromise = null;
    let modalEl = null;
    let activeTab = 'face';
    let showAllColors = false;

    let state = {
        enabled: true,
        rawBytes: PRESET_CHICA.slice(),
        expression: 'smile',
        bgColor: 'C4377AFF',
        viewType: 'face',
        rotateY: 0
    };

    function playSound(file, vol) {
        try {
            if (typeof window.AudioManager !== 'undefined' && typeof window.AudioManager.play === 'function') {
                window.AudioManager.play(file, vol || 0.45);
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
                position: fixed;
                inset: 0;
                z-index: 10050;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12px;
                background: rgba(6, 6, 10, 0.78);
                backdrop-filter: blur(18px);
                -webkit-backdrop-filter: blur(18px);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1);
            }
            #mii-studio-modal.open {
                opacity: 1;
                pointer-events: auto;
            }
            .mii-studio-dialog {
                width: 100%;
                max-width: 960px;
                max-height: min(90vh, 760px);
                background: linear-gradient(165deg, rgba(24, 24, 29, 0.97) 0%, rgba(14, 14, 18, 0.99) 100%);
                border: 1px solid rgba(255, 255, 255, 0.11);
                border-radius: 28px;
                box-shadow: 0 30px 90px rgba(0, 0, 0, 0.75), 0 0 60px rgba(196, 55, 122, 0.16);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.96) translateY(8px);
                transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
                color: #f4f4f5;
                font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
            }
            #mii-studio-modal.open .mii-studio-dialog {
                transform: scale(1) translateY(0);
            }
            .mii-studio-body {
                display: grid;
                grid-template-columns: 310px 1fr;
                flex: 1;
                min-height: 0;
                overflow: hidden;
            }
            @media (max-width: 780px) {
                .mii-studio-dialog {
                    max-height: 94vh;
                    border-radius: 22px;
                }
                .mii-studio-body {
                    grid-template-columns: 1fr;
                    overflow-y: auto;
                }
            }
            .mii-stage-panel {
                background: radial-gradient(circle at 50% 32%, rgba(196, 55, 122, 0.16) 0%, rgba(24, 24, 27, 0.4) 70%);
                border-right: 1px solid rgba(255, 255, 255, 0.07);
                padding: 18px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }
            @media (max-width: 780px) {
                .mii-stage-panel {
                    border-right: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                    padding: 14px;
                }
            }
            .mii-stage-viewport {
                position: relative;
                width: 210px;
                height: 210px;
                border-radius: 36px;
                overflow: hidden;
                border: 2px solid rgba(255, 255, 255, 0.14);
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2);
                background-image:
                    linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%),
                    linear-gradient(-45deg, rgba(255,255,255,0.04) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.04) 75%),
                    linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.04) 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.25s ease;
            }
            @media (max-width: 780px) {
                .mii-stage-viewport {
                    width: 156px;
                    height: 156px;
                    border-radius: 28px;
                }
            }
            .mii-stage-viewport img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                user-select: none;
                -webkit-user-drag: none;
                transition: opacity 0.18s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .mii-stage-loader {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 22px;
                height: 22px;
                border-radius: 999px;
                background: rgba(15, 15, 20, 0.72);
                border: 2px solid rgba(255, 255, 255, 0.18);
                border-top-color: #E775A6;
                animation: miiSpin 0.7s linear infinite;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.15s ease;
            }
            .mii-stage-loader.loading {
                opacity: 1;
            }
            @keyframes miiSpin {
                to { transform: rotate(360deg); }
            }
            .mii-editor-panel {
                display: flex;
                flex-direction: column;
                min-height: 0;
                overflow: hidden;
            }
            .mii-tabs-bar {
                display: flex;
                gap: 6px;
                padding: 12px 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                overflow-x: auto;
                scrollbar-width: none;
            }
            .mii-tabs-bar::-webkit-scrollbar {
                display: none;
            }
            .mii-tab-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 7px 13px;
                border-radius: 999px;
                font-size: 12.5px;
                font-weight: 600;
                color: #a1a1aa;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.06);
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.16s ease;
            }
            .mii-tab-btn:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.08);
            }
            .mii-tab-btn.active {
                color: #ffffff;
                background: linear-gradient(135deg, rgba(196, 55, 122, 0.45), rgba(231, 117, 166, 0.25));
                border-color: rgba(231, 117, 166, 0.55);
                box-shadow: 0 4px 14px rgba(196, 55, 122, 0.25);
            }
            .mii-tab-content {
                flex: 1;
                overflow-y: auto;
                padding: 16px 18px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .mii-parts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(62px, 1fr));
                gap: 8px;
                --icon-face-fill: #f4f4f5;
                --icon-face-stroke: #52525b;
                --icon-head-fill: #f4f4f5;
                --icon-head-stroke: #a1a1aa;
                --icon-hair-fill: #27272a;
                --icon-facial-hair-fill: #27272a;
                --icon-hair-tie: #ec4899;
                --icon-glasses-fill: #3f3f46;
                --icon-glasses-shade: rgba(231, 117, 166, 0.25);
                --icon-hat-fill: #C4377A;
                --icon-hat-stroke: #831843;
                --icon-face-detail: #f472b6;
                --icon-face-wrinkles: #71717a;
                --icon-eyebrow-fill: #3f3f46;
                --icon-mouth-tooth: #ffffff;
                --icon-lip-color-top: #be123c;
                --icon-lip-color-bottom: #fb7185;
                --eye-color: #3b82f6;
            }
            .mii-part-card {
                height: 62px;
                border-radius: 16px;
                background: rgba(255, 255, 255, 0.05);
                border: 1.5px solid rgba(255, 255, 255, 0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.14s ease;
                position: relative;
                padding: 5px;
                color: #27272a;
            }
            .mii-part-card:hover {
                background: rgba(255, 255, 255, 0.11);
                border-color: rgba(255, 255, 255, 0.22);
                transform: translateY(-1px);
            }
            .mii-part-card.selected {
                background: rgba(231, 117, 166, 0.18);
                border-color: #E775A6;
                box-shadow: 0 0 0 2px rgba(231, 117, 166, 0.28);
            }
            .mii-part-card svg {
                width: 46px;
                height: 46px;
                display: block;
                pointer-events: none;
            }
            .mii-color-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .mii-color-swatch {
                width: 30px;
                height: 30px;
                border-radius: 999px;
                border: 2px solid rgba(255, 255, 255, 0.18);
                cursor: pointer;
                transition: transform 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease;
                position: relative;
            }
            .mii-color-swatch:hover {
                transform: scale(1.12);
                border-color: #ffffff;
            }
            .mii-color-swatch.selected {
                transform: scale(1.14);
                border-color: #ffffff;
                box-shadow: 0 0 0 3px #E775A6;
            }
            .mii-slider-row {
                display: grid;
                grid-template-columns: 110px 1fr 38px;
                align-items: center;
                gap: 10px;
                font-size: 12.5px;
                color: #d4d4d8;
            }
            .mii-slider-row input[type="range"] {
                width: 100%;
                accent-color: #E775A6;
                cursor: pointer;
                height: 6px;
                border-radius: 999px;
            }
            .mii-section-label {
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: #a1a1aa;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .mii-pill-btn {
                padding: 6px 12px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 600;
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #e4e4e7;
                cursor: pointer;
                transition: all 0.15s ease;
                display: inline-flex;
                align-items: center;
                gap: 5px;
            }
            .mii-pill-btn:hover {
                background: rgba(255, 255, 255, 0.12);
                color: #ffffff;
            }
            .mii-pill-btn.active {
                background: rgba(196, 55, 122, 0.35);
                border-color: #E775A6;
                color: #ffffff;
            }
        `;
        document.head.appendChild(style);
    }

    function randomizeMii() {
        const isFemale = Math.random() < 0.5 ? 1 : 0;
        const hairPool = isFemale
            ? [12, 20, 21, 22, 23, 27, 36, 39, 41, 45, 54, 57, 58, 60, 63, 65, 67, 73, 75, 80, 86, 88, 89, 100, 102, 117, 121]
            : [33, 47, 40, 37, 32, 48, 51, 55, 70, 44, 66, 52, 50, 38, 49, 43, 31, 56, 68, 62, 64, 81, 115];
        const eyePool = isFemale
            ? [4, 1, 17, 20, 26, 27, 19, 32, 33, 34, 40, 41, 18, 28]
            : [2, 0, 8, 39, 16, 15, 11, 9, 12, 23, 25, 35, 5, 13];
        const mouthPool = [23, 1, 19, 21, 22, 0, 8, 10, 16, 6, 13, 15, 11];
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
        raw[IDX.facelineMake] = isFemale ? pick([0, 1, 2, 3, 9]) : pick([0, 0, 0, 3]);
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
        raw[IDX.glassType] = Math.random() < 0.28 ? pick([1, 2, 3, 9, 11, 14, 15]) : 0;
        raw[IDX.glassColor] = pick([8, 14, 15, 16, 17]);
        raw[IDX.favoriteColor] = pick(favColors);
        raw[IDX.beardType] = 0;
        raw[IDX.mustacheType] = 0;

        state.rawBytes = clampBytes(raw);
        state.expression = pick(['smile', 'like_wink_left', 'normal', 'wink_left']);
        playSound('colors.wav', 0.45);
        refreshPreview();
        renderActiveTab();
    }

    let previewTimer = null;
    function refreshPreview() {
        if (!modalEl) return;
        const viewport = modalEl.querySelector('#mii-stage-viewport');
        const imgEl = modalEl.querySelector('#mii-stage-img');
        const loaderEl = modalEl.querySelector('#mii-stage-loader');
        const hexInput = modalEl.querySelector('#mii-code-input');

        if (viewport) {
            const bgObj = BG_PRESETS.find(b => b.id === state.bgColor);
            viewport.style.backgroundColor = (bgObj && bgObj.hex !== 'transparent') ? bgObj.hex : 'rgba(24,24,27,0.45)';
        }
        if (hexInput && document.activeElement !== hexInput) {
            hexInput.value = encodeStudioMii(state.rawBytes);
        }

        if (previewTimer) clearTimeout(previewTimer);
        previewTimer = setTimeout(() => {
            if (!imgEl) return;
            const primaryUrl = buildMiiUrl(state.rawBytes, state, false);
            const fallbackUrl = buildMiiUrl(state.rawBytes, state, true);

            if (imgEl.dataset.currentUrl === primaryUrl) return;
            if (loaderEl) loaderEl.classList.add('loading');

            const preloader = new Image();
            preloader.referrerPolicy = 'no-referrer';
            preloader.onload = () => {
                imgEl.src = primaryUrl;
                imgEl.dataset.currentUrl = primaryUrl;
                if (loaderEl) loaderEl.classList.remove('loading');
            };
            preloader.onerror = () => {
                const fbPreloader = new Image();
                fbPreloader.referrerPolicy = 'no-referrer';
                fbPreloader.onload = () => {
                    imgEl.src = fallbackUrl;
                    imgEl.dataset.currentUrl = primaryUrl;
                    if (loaderEl) loaderEl.classList.remove('loading');
                };
                fbPreloader.onerror = () => {
                    if (loaderEl) loaderEl.classList.remove('loading');
                };
                fbPreloader.src = fallbackUrl;
            };
            preloader.src = primaryUrl;
        }, 70);
    }

    function updateGridColorVars(container) {
        if (!container) return;
        const b = state.rawBytes;
        const skinObj = SKIN_COLORS.find(s => s.id === b[IDX.facelineColor]) || SKIN_COLORS[0];
        const hairHex = SWITCH_COLORS[b[IDX.hairColor]] || '#27272a';
        const eyeHex = SWITCH_COLORS[b[IDX.eyeColor]] || '#3b82f6';
        const browHex = SWITCH_COLORS[b[IDX.eyebrowColor]] || hairHex;
        const lipHex = SWITCH_COLORS[b[IDX.mouthColor]] || '#e11d48';
        const glassHex = SWITCH_COLORS[b[IDX.glassColor]] || '#3f3f46';
        const beardHex = SWITCH_COLORS[b[IDX.beardColor]] || hairHex;

        container.style.setProperty('--icon-face-fill', skinObj.hex);
        container.style.setProperty('--icon-head-fill', skinObj.hex);
        container.style.setProperty('--icon-hair-fill', hairHex);
        container.style.setProperty('--eye-color', eyeHex);
        container.style.setProperty('--icon-eyebrow-fill', browHex);
        container.style.setProperty('--icon-lip-color-top', lipHex);
        container.style.setProperty('--icon-lip-color-bottom', lipHex);
        container.style.setProperty('--icon-glasses-fill', glassHex);
        container.style.setProperty('--icon-facial-hair-fill', beardHex);
    }

    function buildColorPickerHTML(byteIdx, quickList) {
        const currentVal = state.rawBytes[byteIdx];
        const indices = showAllColors
            ? Array.from({ length: 100 }, (_, i) => i)
            : quickList;

        const swatches = indices.map(colorIdx => {
            const hex = SWITCH_COLORS[colorIdx] || '#000000';
            const sel = currentVal === colorIdx ? 'selected' : '';
            return `<button type="button" class="mii-color-swatch ${sel}" data-color-byte="${byteIdx}" data-color-val="${colorIdx}" style="background:${hex};" title="Color #${colorIdx}"></button>`;
        }).join('');

        return `
            <div>
                <div class="mii-section-label">
                    <span>Color</span>
                    <button type="button" class="mii-pill-btn" id="mii-toggle-all-colors" style="padding:3px 9px;font-size:11px;">
                        ${showAllColors ? 'Ver colores básicos' : '🎨 Ver los 100 colores Switch'}
                    </button>
                </div>
                <div class="mii-color-grid">${swatches}</div>
            </div>
        `;
    }

    function buildSliderHTML(label, byteIdx, min, max) {
        const val = state.rawBytes[byteIdx];
        return `
            <div class="mii-slider-row">
                <span>${label}</span>
                <input type="range" min="${min}" max="${max}" value="${val}" data-slider-byte="${byteIdx}" />
                <span class="text-right font-mono text-xs text-zinc-400" data-slider-val="${byteIdx}">${val}</span>
            </div>
        `;
    }

    function buildPartsGridHTML(categoryKey, byteIdx, orderList, totalCount) {
        const currentVal = state.rawBytes[byteIdx];
        const indices = orderList || Array.from({ length: totalCount }, (_, i) => i);
        const catIcons = iconsData && iconsData[categoryKey] ? iconsData[categoryKey] : null;

        const cards = indices.map(idx => {
            const sel = currentVal === idx ? 'selected' : '';
            const svgMarkup = (catIcons && catIcons[idx])
                ? catIcons[idx]
                : `<span class="text-xs font-bold text-zinc-300">#${idx + 1}</span>`;
            return `<button type="button" class="mii-part-card ${sel}" data-part-byte="${byteIdx}" data-part-val="${idx}" title="Opción ${idx + 1}">${svgMarkup}</button>`;
        }).join('');

        return `<div class="mii-parts-grid">${cards}</div>`;
    }

    function renderActiveTab() {
        if (!modalEl) return;
        const container = modalEl.querySelector('#mii-tab-content');
        if (!container) return;

        modalEl.querySelectorAll('.mii-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === activeTab);
        });

        const b = state.rawBytes;
        let html = '';

        if (activeTab === 'face') {
            const skinSwatches = SKIN_COLORS.map(s => {
                const sel = b[IDX.facelineColor] === s.id ? 'selected' : '';
                return `<button type="button" class="mii-color-swatch ${sel}" data-color-byte="${IDX.facelineColor}" data-color-val="${s.id}" style="background:${s.hex};" title="${s.label}"></button>`;
            }).join('');

            html = `
                <div>
                    <div class="mii-section-label"><span>Género Base</span></div>
                    <div class="flex gap-2">
                        <button type="button" class="mii-pill-btn ${b[IDX.gender] === 1 ? 'active' : ''}" data-part-byte="${IDX.gender}" data-part-val="1">♀ Chica</button>
                        <button type="button" class="mii-pill-btn ${b[IDX.gender] === 0 ? 'active' : ''}" data-part-byte="${IDX.gender}" data-part-val="0">♂ Chico</button>
                    </div>
                </div>
                <div>
                    <div class="mii-section-label"><span>Tono de Piel</span></div>
                    <div class="mii-color-grid">${skinSwatches}</div>
                </div>
                <div>
                    <div class="mii-section-label"><span>Forma del Rostro (12)</span></div>
                    ${buildPartsGridHTML('face', IDX.facelineType, null, 12)}
                </div>
                <div>
                    <div class="mii-section-label"><span>Rubor y Maquillaje (12)</span></div>
                    ${buildPartsGridHTML('makeup', IDX.facelineMake, null, 12)}
                </div>
                <div>
                    <div class="mii-section-label"><span>Rasgos / Líneas Faciales (12)</span></div>
                    ${buildPartsGridHTML('wrinkles', IDX.facelineWrinkle, null, 12)}
                </div>
            `;
        } else if (activeTab === 'hair') {
            html = `
                <div class="flex items-center justify-between">
                    <span class="text-xs text-zinc-400">132 peinados oficiales de Nintendo Switch</span>
                    <button type="button" class="mii-pill-btn ${b[IDX.hairFlip] === 1 ? 'active' : ''}" id="mii-btn-hairflip">
                        ↔ Invertir Lado del Peinado
                    </button>
                </div>
                ${buildColorPickerHTML(IDX.hairColor, QUICK_HAIR_COLORS)}
                <div>
                    <div class="mii-section-label"><span>Estilo de Cabello</span></div>
                    ${buildPartsGridHTML('hair', IDX.hairType, HAIR_ORDER, 132)}
                </div>
            `;
        } else if (activeTab === 'eyes') {
            html = `
                ${buildColorPickerHTML(IDX.eyeColor, QUICK_EYE_COLORS)}
                <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    <div class="mii-section-label" style="margin-bottom:2px;"><span>Posición y Forma de Ojos</span></div>
                    ${buildSliderHTML('Tamaño', IDX.eyeScale, 0, 7)}
                    ${buildSliderHTML('Apertura', IDX.eyeAspect, 0, 6)}
                    ${buildSliderHTML('Inclinación', IDX.eyeRotate, 0, 7)}
                    ${buildSliderHTML('Separación', IDX.eyeX, 0, 12)}
                    ${buildSliderHTML('Altura', IDX.eyeY, 0, 18)}
                </div>
                <div>
                    <div class="mii-section-label"><span>Estilo de Ojos (60)</span></div>
                    ${buildPartsGridHTML('eyes', IDX.eyeType, EYE_ORDER, 60)}
                </div>
            `;
        } else if (activeTab === 'eyebrows') {
            html = `
                <div class="flex items-center justify-between">
                    <span class="text-xs text-zinc-400">Personaliza tus cejas</span>
                    <button type="button" class="mii-pill-btn" id="mii-btn-sync-brow-color">
                        🎨 Igualar al color de pelo
                    </button>
                </div>
                ${buildColorPickerHTML(IDX.eyebrowColor, QUICK_HAIR_COLORS)}
                <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    ${buildSliderHTML('Tamaño', IDX.eyebrowScale, 0, 8)}
                    ${buildSliderHTML('Grosor', IDX.eyebrowAspect, 0, 6)}
                    ${buildSliderHTML('Inclinación', IDX.eyebrowRotate, 0, 11)}
                    ${buildSliderHTML('Separación', IDX.eyebrowX, 0, 12)}
                    ${buildSliderHTML('Altura', IDX.eyebrowY, 3, 18)}
                </div>
                <div>
                    <div class="mii-section-label"><span>Forma de Cejas (24)</span></div>
                    ${buildPartsGridHTML('eyebrows', IDX.eyebrowType, EYEBROW_ORDER, 24)}
                </div>
            `;
        } else if (activeTab === 'nose') {
            html = `
                <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    ${buildSliderHTML('Tamaño', IDX.noseScale, 0, 8)}
                    ${buildSliderHTML('Altura', IDX.noseY, 0, 18)}
                </div>
                <div>
                    <div class="mii-section-label"><span>Forma de Nariz (18)</span></div>
                    ${buildPartsGridHTML('nose', IDX.noseType, NOSE_ORDER, 18)}
                </div>
            `;
        } else if (activeTab === 'mouth') {
            html = `
                ${buildColorPickerHTML(IDX.mouthColor, QUICK_MOUTH_COLORS)}
                <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    ${buildSliderHTML('Tamaño', IDX.mouthScale, 0, 8)}
                    ${buildSliderHTML('Grosor', IDX.mouthAspect, 0, 6)}
                    ${buildSliderHTML('Altura', IDX.mouthY, 0, 18)}
                </div>
                <div>
                    <div class="mii-section-label"><span>Estilo de Boca (36)</span></div>
                    ${buildPartsGridHTML('mouth', IDX.mouthType, MOUTH_ORDER, 36)}
                </div>
            `;
        } else if (activeTab === 'glasses') {
            html = `
                ${buildColorPickerHTML(IDX.glassColor, QUICK_GLASS_COLORS)}
                <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    ${buildSliderHTML('Tamaño Gafas', IDX.glassScale, 0, 7)}
                    ${buildSliderHTML('Altura Gafas', IDX.glassY, 0, 20)}
                </div>
                <div>
                    <div class="mii-section-label"><span>Gafas y Lentes (20)</span></div>
                    ${buildPartsGridHTML('glasses', IDX.glassType, null, 20)}
                </div>
            `;
        } else if (activeTab === 'beard') {
            html = `
                ${buildColorPickerHTML(IDX.beardColor, QUICK_HAIR_COLORS)}
                <div>
                    <div class="mii-section-label"><span>Bigote (6)</span></div>
                    ${buildPartsGridHTML('mustache', IDX.mustacheType, null, 6)}
                </div>
                <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    ${buildSliderHTML('Tamaño Bigote', IDX.mustacheScale, 0, 8)}
                    ${buildSliderHTML('Altura Bigote', IDX.mustacheY, 0, 16)}
                </div>
                <div>
                    <div class="mii-section-label"><span>Barba (6)</span></div>
                    ${buildPartsGridHTML('goatee', IDX.beardType, null, 6)}
                </div>
                <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-semibold text-zinc-300">Lunar Facial</span>
                        <button type="button" class="mii-pill-btn ${b[IDX.moleType] === 1 ? 'active' : ''}" data-part-byte="${IDX.moleType}" data-part-val="${b[IDX.moleType] === 1 ? 0 : 1}">
                            ${b[IDX.moleType] === 1 ? '✓ Lunar Activado' : '+ Activar Lunar'}
                        </button>
                    </div>
                    ${buildSliderHTML('Tamaño Lunar', IDX.moleScale, 0, 8)}
                    ${buildSliderHTML('Posición X', IDX.moleX, 0, 16)}
                    ${buildSliderHTML('Posición Y', IDX.moleY, 0, 30)}
                </div>
            `;
        } else if (activeTab === 'style') {
            const expBtns = EXPRESSIONS.map(ex => {
                const active = state.expression === ex.id ? 'active' : '';
                return `<button type="button" class="mii-pill-btn ${active}" data-expression="${ex.id}">${ex.emoji} ${ex.label}</button>`;
            }).join('');

            const favSwatches = FAVORITE_COLORS.map(fc => {
                const sel = b[IDX.favoriteColor] === fc.id ? 'selected' : '';
                return `<button type="button" class="mii-color-swatch ${sel}" data-color-byte="${IDX.favoriteColor}" data-color-val="${fc.id}" style="background:${fc.hex};" title="${fc.label}"></button>`;
            }).join('');

            const bgSwatches = BG_PRESETS.map(bg => {
                const sel = state.bgColor === bg.id ? 'selected' : '';
                const styleBg = bg.hex === 'transparent'
                    ? 'background: repeating-conic-gradient(#3f3f46 0% 25%, #18181b 0% 50%) 50% / 10px 10px;'
                    : `background:${bg.hex};`;
                return `<button type="button" class="mii-color-swatch ${sel}" data-bg-preset="${bg.id}" style="${styleBg}" title="${bg.label}"></button>`;
            }).join('');

            html = `
                <div>
                    <div class="mii-section-label"><span>Expresión del Personaje</span></div>
                    <div class="flex flex-wrap gap-2">${expBtns}</div>
                </div>
                <div>
                    <div class="mii-section-label"><span>Color de Ropa / Favorito (12)</span></div>
                    <div class="mii-color-grid">${favSwatches}</div>
                </div>
                <div>
                    <div class="mii-section-label"><span>Color de Fondo del Avatar</span></div>
                    <div class="mii-color-grid">${bgSwatches}</div>
                </div>
                <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    <div class="mii-section-label"><span>Estatura y Complexión (Cuerpo Entero)</span></div>
                    ${buildSliderHTML('Estatura', IDX.height, 0, 127)}
                    ${buildSliderHTML('Complexión', IDX.build, 0, 127)}
                </div>
                <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2">
                    <div class="mii-section-label"><span>Código Mii Studio (Importar / Compartir)</span></div>
                    <div class="flex gap-2">
                        <input id="mii-code-input" type="text" value="${encodeStudioMii(state.rawBytes)}"
                            class="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-pink-400"
                            placeholder="Pega aquí un código hexadecimal Mii Studio de 94 caracteres..." />
                        <button type="button" class="mii-pill-btn" id="mii-btn-apply-code">Importar</button>
                        <button type="button" class="mii-pill-btn" id="mii-btn-copy-code">Copiar</button>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        updateGridColorVars(container);
    }

    function ensureModalDOM() {
        if (modalEl) return modalEl;
        injectStyles();

        modalEl = document.createElement('div');
        modalEl.id = 'mii-studio-modal';
        modalEl.innerHTML = `
            <div class="mii-studio-dialog" role="dialog" aria-modal="true" aria-label="Estudio Mii 28E">
                <!-- Header -->
                <div class="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500/30 to-purple-600/30 border border-pink-400/30 flex items-center justify-center text-pink-300 shadow-inner">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="8" r="5"></circle>
                                <path d="M20 21a8 8 0 1 0-16 0"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="text-base font-bold text-white tracking-tight">Estudio Mii 28E</h2>
                                <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30">Nintendo Mii</span>
                            </div>
                            <p class="text-xs text-zinc-400">Personaliza el personaje oficial de tu cuenta para toda la web y el canal de voz</p>
                        </div>
                    </div>
                    <button type="button" id="mii-btn-close" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer" title="Cerrar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="mii-studio-body">
                    <!-- Left Stage -->
                    <div class="mii-stage-panel">
                        <div class="flex flex-col items-center gap-2.5 w-full">
                            <!-- Avatar source toggle -->
                            <div class="flex items-center p-1 rounded-full bg-black/40 border border-white/10 w-full max-w-[240px]">
                                <button type="button" id="mii-mode-mii" class="flex-1 py-1 px-2.5 rounded-full text-xs font-semibold transition cursor-pointer bg-pink-600/40 text-white border border-pink-400/40">
                                    Usar mi Mii
                                </button>
                                <button type="button" id="mii-mode-google" class="flex-1 py-1 px-2.5 rounded-full text-xs font-semibold transition cursor-pointer text-zinc-400 hover:text-white">
                                    Foto Google
                                </button>
                            </div>

                            <!-- 3D Viewport -->
                            <div id="mii-stage-viewport" class="mii-stage-viewport">
                                <img id="mii-stage-img" src="" alt="Tu Mii 3D" referrerpolicy="no-referrer" />
                                <div id="mii-stage-loader" class="mii-stage-loader"></div>
                            </div>

                            <!-- Camera view & rotation -->
                            <div class="flex items-center gap-1.5">
                                <button type="button" class="mii-pill-btn" id="mii-rot-left" title="Girar a la izquierda">↺</button>
                                <button type="button" class="mii-pill-btn active" id="mii-view-face">Retrato</button>
                                <button type="button" class="mii-pill-btn" id="mii-view-body">Cuerpo</button>
                                <button type="button" class="mii-pill-btn" id="mii-rot-right" title="Girar a la derecha">↻</button>
                            </div>
                        </div>

                        <!-- Quick Presets -->
                        <div class="w-full flex flex-col gap-2 pt-2 border-t border-white/10">
                            <div class="text-[11px] font-semibold text-zinc-400 text-center uppercase tracking-wider">Plantillas Rápidas</div>
                            <div class="grid grid-cols-3 gap-1.5">
                                <button type="button" id="mii-preset-chica" class="mii-pill-btn justify-center">♀ Chica</button>
                                <button type="button" id="mii-preset-chico" class="mii-pill-btn justify-center">♂ Chico</button>
                                <button type="button" id="mii-preset-random" class="mii-pill-btn justify-center">🎲 Azar</button>
                            </div>
                        </div>
                    </div>

                    <!-- Right Customization Panel -->
                    <div class="mii-editor-panel">
                        <div class="mii-tabs-bar">
                            <button type="button" class="mii-tab-btn active" data-tab="face">😊 Cara</button>
                            <button type="button" class="mii-tab-btn" data-tab="hair">💇 Pelo</button>
                            <button type="button" class="mii-tab-btn" data-tab="eyes">👀 Ojos</button>
                            <button type="button" class="mii-tab-btn" data-tab="eyebrows">🤨 Cejas</button>
                            <button type="button" class="mii-tab-btn" data-tab="nose">👃 Nariz</button>
                            <button type="button" class="mii-tab-btn" data-tab="mouth">👄 Boca</button>
                            <button type="button" class="mii-tab-btn" data-tab="glasses">👓 Gafas</button>
                            <button type="button" class="mii-tab-btn" data-tab="beard">🧔 Barba/Lunar</button>
                            <button type="button" class="mii-tab-btn" data-tab="style">✨ Pose y Fondo</button>
                        </div>
                        <div id="mii-tab-content" class="mii-tab-content"></div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-black/30">
                    <a id="mii-btn-download" href="#" target="_blank" rel="noopener" class="mii-pill-btn text-xs">
                        ⬇ Abrir PNG 512px
                    </a>
                    <div class="flex items-center gap-2.5">
                        <button type="button" id="mii-btn-cancel" class="px-4 py-2 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer">
                            Cancelar
                        </button>
                        <button type="button" id="mii-btn-save" class="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#A81B65] via-[#C4377A] to-[#E775A6] hover:brightness-110 active:scale-95 transition shadow-lg shadow-pink-900/40 cursor-pointer">
                            Guardar Personaje Mii
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalEl);
        bindModalEvents();
        return modalEl;
    }

    function updateModeButtonsUI() {
        if (!modalEl) return;
        const btnMii = modalEl.querySelector('#mii-mode-mii');
        const btnGoogle = modalEl.querySelector('#mii-mode-google');
        if (!btnMii || !btnGoogle) return;
        if (state.enabled !== false) {
            btnMii.className = 'flex-1 py-1 px-2.5 rounded-full text-xs font-semibold transition cursor-pointer bg-pink-600/40 text-white border border-pink-400/40';
            btnGoogle.className = 'flex-1 py-1 px-2.5 rounded-full text-xs font-semibold transition cursor-pointer text-zinc-400 hover:text-white';
        } else {
            btnGoogle.className = 'flex-1 py-1 px-2.5 rounded-full text-xs font-semibold transition cursor-pointer bg-pink-600/40 text-white border border-pink-400/40';
            btnMii.className = 'flex-1 py-1 px-2.5 rounded-full text-xs font-semibold transition cursor-pointer text-zinc-400 hover:text-white';
        }
    }

    function bindModalEvents() {
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) closeMiiStudio();
        });

        modalEl.querySelector('#mii-btn-close').addEventListener('click', closeMiiStudio);
        modalEl.querySelector('#mii-btn-cancel').addEventListener('click', closeMiiStudio);

        // Mode switcher
        modalEl.querySelector('#mii-mode-mii').addEventListener('click', () => {
            state.enabled = true;
            playSound('seleccionsi.wav', 0.4);
            updateModeButtonsUI();
        });
        modalEl.querySelector('#mii-mode-google').addEventListener('click', () => {
            state.enabled = false;
            playSound('seleccionno.wav', 0.4);
            updateModeButtonsUI();
        });

        // View & Rotation
        const btnFace = modalEl.querySelector('#mii-view-face');
        const btnBody = modalEl.querySelector('#mii-view-body');
        btnFace.addEventListener('click', () => {
            state.viewType = 'face';
            state.rotateY = 0;
            btnFace.classList.add('active');
            btnBody.classList.remove('active');
            refreshPreview();
        });
        btnBody.addEventListener('click', () => {
            state.viewType = 'all_body';
            btnBody.classList.add('active');
            btnFace.classList.remove('active');
            refreshPreview();
        });

        modalEl.querySelector('#mii-rot-left').addEventListener('click', () => {
            state.rotateY = (state.rotateY - 30 + 360) % 360;
            refreshPreview();
        });
        modalEl.querySelector('#mii-rot-right').addEventListener('click', () => {
            state.rotateY = (state.rotateY + 30) % 360;
            refreshPreview();
        });

        // Presets
        modalEl.querySelector('#mii-preset-chica').addEventListener('click', () => {
            state.rawBytes = PRESET_CHICA.slice();
            state.expression = 'smile';
            playSound('colors.wav', 0.4);
            refreshPreview();
            renderActiveTab();
        });
        modalEl.querySelector('#mii-preset-chico').addEventListener('click', () => {
            state.rawBytes = PRESET_CHICO.slice();
            state.expression = 'smile';
            playSound('colors.wav', 0.4);
            refreshPreview();
            renderActiveTab();
        });
        modalEl.querySelector('#mii-preset-random').addEventListener('click', randomizeMii);

        // Tabs
        modalEl.querySelectorAll('.mii-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.dataset.tab;
                playSound('navegacion.wav', 0.35);
                renderActiveTab();
            });
        });

        // Delegated clicks inside tab content
        const contentEl = modalEl.querySelector('#mii-tab-content');
        contentEl.addEventListener('click', (e) => {
            const partBtn = e.target.closest('[data-part-byte]');
            if (partBtn) {
                const byteIdx = parseInt(partBtn.dataset.partByte, 10);
                const val = parseInt(partBtn.dataset.partVal, 10);
                state.rawBytes[byteIdx] = val;
                state.enabled = true;
                updateModeButtonsUI();
                playSound('seleccionsi.wav', 0.35);
                refreshPreview();
                renderActiveTab();
                return;
            }

            const colorBtn = e.target.closest('[data-color-byte]');
            if (colorBtn) {
                const byteIdx = parseInt(colorBtn.dataset.colorByte, 10);
                const val = parseInt(colorBtn.dataset.colorVal, 10);
                state.rawBytes[byteIdx] = val;
                state.enabled = true;
                updateModeButtonsUI();
                playSound('colors.wav', 0.35);
                refreshPreview();
                renderActiveTab();
                return;
            }

            if (e.target.closest('#mii-toggle-all-colors')) {
                showAllColors = !showAllColors;
                renderActiveTab();
                return;
            }

            if (e.target.closest('#mii-btn-hairflip')) {
                state.rawBytes[IDX.hairFlip] = state.rawBytes[IDX.hairFlip] === 1 ? 0 : 1;
                playSound('seleccionsi.wav', 0.35);
                refreshPreview();
                renderActiveTab();
                return;
            }

            if (e.target.closest('#mii-btn-sync-brow-color')) {
                state.rawBytes[IDX.eyebrowColor] = state.rawBytes[IDX.hairColor];
                playSound('colors.wav', 0.35);
                refreshPreview();
                renderActiveTab();
                return;
            }

            const expBtn = e.target.closest('[data-expression]');
            if (expBtn) {
                state.expression = expBtn.dataset.expression;
                state.enabled = true;
                updateModeButtonsUI();
                playSound('seleccionsi.wav', 0.35);
                refreshPreview();
                renderActiveTab();
                return;
            }

            const bgBtn = e.target.closest('[data-bg-preset]');
            if (bgBtn) {
                state.bgColor = bgBtn.dataset.bgPreset;
                state.enabled = true;
                updateModeButtonsUI();
                playSound('colors.wav', 0.35);
                refreshPreview();
                renderActiveTab();
                return;
            }

            if (e.target.closest('#mii-btn-apply-code')) {
                const inp = contentEl.querySelector('#mii-code-input');
                const decoded = decodeStudioMii(inp ? inp.value : '');
                if (decoded) {
                    state.rawBytes = decoded;
                    state.enabled = true;
                    updateModeButtonsUI();
                    playSound('celebration.wav', 0.45);
                    refreshPreview();
                    renderActiveTab();
                } else if (window.showPremiumAlert) {
                    window.showPremiumAlert('Código inválido', 'Introduce un código hexadecimal válido de Mii Studio (94 caracteres).', 'error');
                }
                return;
            }

            if (e.target.closest('#mii-btn-copy-code')) {
                const code = encodeStudioMii(state.rawBytes);
                if (navigator.clipboard) navigator.clipboard.writeText(code);
                if (window.showPremiumAlert) {
                    window.showPremiumAlert('Código Copiado', 'El código de tu Mii se copió al portapapeles.', 'success');
                }
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
                refreshPreview();
            }
        });

        // Download PNG link
        modalEl.querySelector('#mii-btn-download').addEventListener('click', (e) => {
            const url = buildMiiUrl(state.rawBytes, { ...state, width: 512 }, false);
            e.currentTarget.href = url;
        });

        // Save button
        modalEl.querySelector('#mii-btn-save').addEventListener('click', async () => {
            const saveBtn = modalEl.querySelector('#mii-btn-save');
            const origText = saveBtn.textContent;
            saveBtn.textContent = 'Guardando...';
            saveBtn.disabled = true;

            const avatarHeadUrl = buildMiiUrl(state.rawBytes, {
                viewType: 'face',
                width: 512,
                expression: state.expression || 'smile',
                bgColor: state.bgColor || 'C4377AFF',
                rotateY: 0
            }, false);

            const profilePayload = {
                enabled: state.enabled !== false,
                dataHex: encodeStudioMii(state.rawBytes),
                rawBytes: clampBytes(state.rawBytes),
                expression: state.expression || 'smile',
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
                playSound('celebration.wav', 0.55);
                closeMiiStudio();
                if (window.showPremiumAlert) {
                    window.showPremiumAlert(
                        profilePayload.enabled ? '¡Mii Guardado!' : 'Foto de Google Activada',
                        profilePayload.enabled
                            ? 'Tu personaje Mii ya es tu avatar activo en tu cuenta, comentarios y canal de voz.'
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

        // Load saved profile from current account or localStorage
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
            state.expression = saved.expression || 'smile';
            state.bgColor = saved.bgColor || 'C4377AFF';
            state.viewType = saved.viewType || 'face';
            state.enabled = saved.enabled !== false;
            state.rotateY = 0;
        } else if (saved && saved.dataHex) {
            const dec = decodeStudioMii(saved.dataHex);
            if (dec) state.rawBytes = dec;
            state.expression = saved.expression || 'smile';
            state.bgColor = saved.bgColor || 'C4377AFF';
            state.enabled = saved.enabled !== false;
        }

        updateModeButtonsUI();
        modalEl.classList.add('open');
        playSound('gameopen.wav', 0.45);

        refreshPreview();
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
        playSound('flyout.wav', 0.35);
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

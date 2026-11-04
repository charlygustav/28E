/**
 * 28E — Console-Grade Gamepad Spatial Navigation, Haptics & Minigame Engine
 * Designed with Apple Fluid Interface & Emil Kowalski Design Engineering principles:
 * - Whisper-quiet translucent materials (backdrop-filter + top specular edge)
 * - Custom strong ease-out curves: cubic-bezier(0.23, 1, 0.32, 1), sub-240ms transitions
 * - Asymmetric enter/exit timing + subtle blur(2px) materialization
 * - Maximum restraint: single-line AirPods-style connection pill & 2-3 item HUD that auto-hides on idle
 * - Deterministic 4-Zone Dashboard (#menu-panel) & Spotlight Player (#spotlight-expanded) Navigation
 */
(function () {
    'use strict';

    if (window.__28EGamepadEngineLoaded) return;
    window.__28EGamepadEngineLoaded = true;

    // ─── State ───────────────────────────────────────────────────────────────
    var state = {
        connected: false,
        activeMode: false,
        gamepadIndex: null,
        brand: 'ps', // 'ps' | 'xbox'
        controllerName: 'Control',
        focusedEl: null,
        lastNavTime: 0,
        lastInputTime: 0,
        lastFlapStickUp: false,
        lastBtnState: {},
        holdBtn0Start: 0,
        holdingRevealBtn: false,
        lastHapticPulse: 0,
        sunVirtualPct: 12,
        sunDragging: false,
        vkbdOpen: false,
        vkbdTargetInput: null,
        vkbdSelectedIdx: 0,
        toastTimer: null,
        hudIdleTimer: null,
        wasMenuPanelOpen: false,
        wasSpotlightExpanded: false,
        wasRecipeModalOpen: false,
        wasCreditsModalOpen: false,
        lastSpotPlaylistIdx: 0,
        scrollVelocityY: 0,
        galleryLightboxOpen: false,
        galleryLightboxIdx: 0,
        currentPaletaColorIdx: 0,
        holdingCs6Btn: false,
        cs6HoldCompleted: false,
        rightStickScrolled: false,
        lastRightStickScrollTime: 0,
        tulipanesVideoStarted: false,
        tulipanesVideoPlaying: false,
        lastRawButtonsState: {}
    };

    var NAV_REPEAT_MS = 220;
    var STICK_DEADZONE = 0.46;
    var SCROLL_DEADZONE = 0.14;
    var SCROLL_MAX_SPEED = 26;
    var HUD_IDLE_HIDE_MS = 4500;

    // ─── Brand Glyphs & Exact Vector Button Badges ───────────────────────────
    var GLYPHS = {
        ps: {
            confirm: 'ps-cross',
            back: 'ps-circle',
            alt1: 'ps-square',
            alt2: 'ps-triangle',
            bumpers: 'ps-l1r1',
            menu: 'ps-options',
            alt1Text: '□',
            alt2Text: '△'
        },
        xbox: {
            confirm: 'xb-a',
            back: 'xb-b',
            alt1: 'xb-x',
            alt2: 'xb-y',
            bumpers: 'xb-lbrb',
            menu: 'xb-menu',
            alt1Text: 'X',
            alt2Text: 'Y'
        },
        switch: {
            confirm: 'sw-a',
            back: 'sw-b',
            alt1: 'sw-y',
            alt2: 'sw-x',
            bumpers: 'sw-lr',
            menu: 'sw-plus',
            alt1Text: 'Y',
            alt2Text: 'X'
        },
        generic: {
            confirm: 'gen-a',
            back: 'gen-b',
            alt1: 'gen-x',
            alt2: 'gen-y',
            bumpers: 'gen-lr',
            menu: 'gen-menu',
            alt1Text: 'X',
            alt2Text: 'Y'
        },
        'generic-num': {
            confirm: 'gen-1',
            back: 'gen-2',
            alt1: 'gen-3',
            alt2: 'gen-4',
            bumpers: 'gen-56',
            menu: 'gen-menu',
            alt1Text: '3',
            alt2Text: '4'
        }
    };

    function g() {
        return GLYPHS[state.brand] || GLYPHS.ps;
    }

    function getButtonMapping() {
        if (state.brand === 'switch') {
            return {
                confirm: 1, // Nintendo Switch: physical A (Right face button)
                back: 0,    // Nintendo Switch: physical B (Bottom face button)
                alt1: 2,    // Nintendo Switch: physical Y (Left face button)
                alt2: 3,    // Nintendo Switch: physical X (Top face button)
                l1: 4,
                r1: 5,
                l2: 6,
                r2: 7,
                select: 8,
                menu: 9
            };
        }
        return {
            confirm: 0, // Standard / Xbox / PS: physical bottom button (A / Cross)
            back: 1,    // Standard / Xbox / PS: physical right button (B / Circle)
            alt1: 2,    // Standard / Xbox / PS: physical left button (X / Square)
            alt2: 3,    // Standard / Xbox / PS: physical top button (Y / Triangle)
            l1: 4,
            r1: 5,
            l2: 6,
            r2: 7,
            select: 8,
            menu: 9
        };
    }

    function detectBrand(id) {
        var s = String(id || '').toLowerCase();
        if (
            s.indexOf('057e') !== -1 ||
            s.indexOf('nintendo') !== -1 ||
            s.indexOf('pro controller') !== -1 ||
            s.indexOf('joy-con') !== -1 ||
            s.indexOf('joycon') !== -1 ||
            s.indexOf('switch') !== -1
        ) {
            return 'switch';
        }
        if (
            s.indexOf('054c') !== -1 ||
            s.indexOf('dualsense') !== -1 ||
            s.indexOf('dualshock') !== -1 ||
            s.indexOf('playstation') !== -1 ||
            s.indexOf('ps4') !== -1 ||
            s.indexOf('ps5') !== -1 ||
            s.indexOf('sony') !== -1 ||
            s.indexOf('wireless controller') !== -1
        ) {
            return 'ps';
        }
        if (
            s.indexOf('045e') !== -1 ||
            s.indexOf('xbox') !== -1 ||
            s.indexOf('x-box') !== -1 ||
            s.indexOf('xinput') !== -1 ||
            s.indexOf('microsoft') !== -1
        ) {
            return 'xbox';
        }
        if (
            s.indexOf('0079') !== -1 ||
            s.indexOf('0810') !== -1 ||
            s.indexOf('dragonrise') !== -1 ||
            s.indexOf('twin') !== -1
        ) {
            return 'generic-num';
        }
        return 'generic';
    }

    var GLYPH_PATHS = {
        A: 'M5.2 13.2L8.0 4.8H10.0L12.8 13.2H10.9L10.3 11.3H7.7L7.1 13.2H5.2ZM8.1 9.6H9.9L9.0 6.8L8.1 9.6Z',
        B: 'M5.6 4.8H9.7C11.1 4.8 12.0 5.6 12.0 6.7C12.0 7.6 11.3 8.3 10.3 8.6C11.5 8.9 12.4 9.8 12.4 11.0C12.4 12.3 11.3 13.2 9.8 13.2H5.6V4.8ZM7.4 8.2H9.5C10.2 8.2 10.7 7.7 10.7 7.0C10.7 6.3 10.2 5.9 9.5 5.9H7.4V8.2ZM7.4 12.1H9.6C10.4 12.1 11.0 11.6 11.0 10.8C11.0 10.0 10.4 9.5 9.6 9.5H7.4V12.1Z',
        X: 'M5.5 4.8H7.8L9.0 7.2L10.2 4.8H12.5L10.2 8.9L12.6 13.2H10.3L9.0 10.7L7.7 13.2H5.4L7.8 8.9L5.5 4.8Z',
        Y: 'M5.4 4.8H7.6L9.0 8.0L10.4 4.8H12.6L10.1 9.3V13.2H7.9V9.3L5.4 4.8Z',
        '1': 'M6.8 13.2V11.7H8.3V6.6L7.1 7.5L6.3 6.2L8.6 4.8H10.1V11.7H11.6V13.2H6.8Z',
        '2': 'M5.6 13.2V11.6L8.6 8.5C9.3 7.8 9.8 7.2 9.8 6.5C9.8 5.8 9.3 5.4 8.6 5.4C7.9 5.4 7.4 5.8 7.3 6.5H5.5C5.7 5.0 6.9 4.0 8.7 4.0C10.4 4.0 11.6 5.0 11.6 6.5C11.6 7.6 10.9 8.6 9.8 9.6L7.9 11.6H11.8V13.2H5.6Z',
        '3': 'M5.8 13.2C7.3 13.2 8.5 12.7 9.2 12.0C9.7 11.5 10.0 10.9 10.0 10.1C10.0 9.2 9.4 8.4 8.5 8.1C9.2 7.7 9.6 7.0 9.6 6.2C9.6 4.9 8.5 4.0 6.9 4.0C5.6 4.0 4.6 4.6 4.2 5.5L5.6 6.4C5.8 5.9 6.3 5.6 6.9 5.6C7.5 5.6 8.0 6.0 8.0 6.6C8.0 7.2 7.4 7.7 6.6 7.7H5.6V9.1H6.7C7.6 9.1 8.3 9.6 8.3 10.3C8.3 11.0 7.6 11.6 6.6 11.6C5.9 11.6 5.3 11.2 5.0 10.6L3.6 11.5C4.2 12.5 5.5 13.2 5.8 13.2Z',
        '4': 'M9.9 13.2V11.4H4.8V9.8L9.8 4.8H11.6V9.8H13.2V11.4H11.6V13.2H9.9ZM9.9 9.8V7.2L7.3 9.8H9.9Z'
    };

    function vectorBadge(char, badgeClass) {
        var d = GLYPH_PATHS[char] || '';
        return '<span class="gp-key-badge ' + badgeClass + '"><svg viewBox="0 0 18 18" style="width:18px;height:18px;display:block;"><path fill="currentColor" fill-rule="evenodd" d="' + d + '"/></svg></span>';
    }

    function renderKeyBadge(token) {
        if (token === 'stick-r' || token === 'rs' || token === 'r-stick') {
            return '<span class="gp-key-badge gp-key-badge-wide gp-badge-neutral"><svg viewBox="0 0 18 18" style="width:14px;height:14px;display:inline-block;vertical-align:-2px;margin-right:4px;" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.4"/><circle cx="9" cy="9" r="2.5" fill="currentColor"/><path d="M9 1.5L10.5 3H7.5L9 1.5ZM9 16.5L7.5 15H10.5L9 16.5Z" fill="currentColor"/></svg>Stick R</span>';
        }
        if (token === 'xb-a') {
            return vectorBadge('A', 'gp-badge-xb-a');
        }
        if (token === 'xb-b') {
            return vectorBadge('B', 'gp-badge-xb-b');
        }
        if (token === 'xb-x') {
            return vectorBadge('X', 'gp-badge-xb-x');
        }
        if (token === 'xb-y') {
            return vectorBadge('Y', 'gp-badge-xb-y');
        }
        if (token === 'sw-a') {
            return vectorBadge('A', 'gp-badge-sw');
        }
        if (token === 'sw-b') {
            return vectorBadge('B', 'gp-badge-sw');
        }
        if (token === 'sw-x') {
            return vectorBadge('X', 'gp-badge-sw');
        }
        if (token === 'sw-y') {
            return vectorBadge('Y', 'gp-badge-sw');
        }
        if (token === 'ps-cross') {
            return '<span class="gp-key-badge gp-badge-ps-cross"><svg viewBox="0 0 18 18" style="width:18px;height:18px;display:block;" fill="none"><path d="M5.5 5.5L12.5 12.5M12.5 5.5L5.5 12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>';
        }
        if (token === 'ps-circle') {
            return '<span class="gp-key-badge gp-badge-ps-circle"><svg viewBox="0 0 18 18" style="width:18px;height:18px;display:block;" fill="none"><circle cx="9" cy="9" r="3.6" stroke="currentColor" stroke-width="1.8"/></svg></span>';
        }
        if (token === 'ps-square') {
            return '<span class="gp-key-badge gp-badge-ps-square"><svg viewBox="0 0 18 18" style="width:18px;height:18px;display:block;" fill="none"><rect x="5.5" y="5.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.7"/></svg></span>';
        }
        if (token === 'ps-triangle') {
            return '<span class="gp-key-badge gp-badge-ps-triangle"><svg viewBox="0 0 18 18" style="width:18px;height:18px;display:block;" fill="none"><path d="M9 4.8L13.2 12.2H4.8L9 4.8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></span>';
        }
        if (token === 'xb-lbrb') {
            return '<span class="gp-key-badge gp-key-badge-wide gp-badge-neutral">LB / RB</span>';
        }
        if (token === 'ps-l1r1') {
            return '<span class="gp-key-badge gp-key-badge-wide gp-badge-neutral">L1 / R1</span>';
        }
        if (token === 'sw-lr') {
            return '<span class="gp-key-badge gp-key-badge-wide gp-badge-neutral">L / R</span>';
        }
        if (token === 'dpad-lr' || token === 'arrows-lr' || token === '← →') {
            return '<span class="gp-key-badge gp-badge-neutral"><svg viewBox="0 0 18 18" style="width:18px;height:18px;display:block;" fill="none"><path d="M7 3.8C7 3.36 7.36 3 7.8 3H10.2C10.64 3 11 3.36 11 3.8V6.8C11 6.91 11.09 7 11.2 7H14.2C14.64 7 15 7.36 15 7.8V10.2C15 10.64 14.64 11 14.2 11H11.2C11.09 11 11 11.09 11 11.2V14.2C11 14.64 10.64 15 10.2 15H7.8C7.36 15 7 14.64 7 14.2V11.2C7 11.09 6.91 11 6.8 11H3.8C3.36 11 3 10.64 3 10.2V7.8C3 7.36 3.36 7 3.8 7H6.8C6.91 7 7 6.91 7 6.8V3.8Z" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.30)" stroke-width="0.7"/><circle cx="9" cy="9" r="1.1" fill="rgba(255,255,255,0.35)"/><path d="M4.3 9L6.3 7.5V10.5L4.3 9Z" fill="#FFFFFF"/><path d="M13.7 9L11.7 7.5V10.5L13.7 9Z" fill="#FFFFFF"/></svg></span>';
        }
        if (token === 'xb-menu' || token === 'ps-options') {
            return '<span class="gp-key-badge gp-badge-neutral"><svg viewBox="0 0 18 18" style="width:18px;height:18px;display:block;" fill="none"><path d="M5.2 6.5H12.8M5.2 9H12.8M5.2 11.5H12.8" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/></svg></span>';
        }
        if (token === 'sw-plus') {
            return '<span class="gp-key-badge gp-badge-neutral"><svg viewBox="0 0 18 18" style="width:18px;height:18px;display:block;" fill="none"><path d="M9 5.5V12.5M5.5 9H12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></span>';
        }
        if (token === 'gen-a') {
            return vectorBadge('A', 'gp-badge-generic');
        }
        if (token === 'gen-b') {
            return vectorBadge('B', 'gp-badge-generic');
        }
        if (token === 'gen-x') {
            return vectorBadge('X', 'gp-badge-generic');
        }
        if (token === 'gen-y') {
            return vectorBadge('Y', 'gp-badge-generic');
        }
        if (token === 'gen-1') {
            return vectorBadge('1', 'gp-badge-generic');
        }
        if (token === 'gen-2') {
            return vectorBadge('2', 'gp-badge-generic');
        }
        if (token === 'gen-3') {
            return vectorBadge('3', 'gp-badge-generic');
        }
        if (token === 'gen-4') {
            return vectorBadge('4', 'gp-badge-generic');
        }
        if (token === 'gen-lr') {
            return '<span class="gp-key-badge gp-key-badge-wide gp-badge-generic">L / R</span>';
        }
        if (token === 'gen-56') {
            return '<span class="gp-key-badge gp-key-badge-wide gp-badge-generic">5 / 6</span>';
        }
        if (token === 'gen-menu') {
            return '<span class="gp-key-badge gp-badge-generic"><svg viewBox="0 0 18 18" style="width:18px;height:18px;display:block;" fill="none"><path d="M5.2 6.5H12.8M5.2 9H12.8M5.2 11.5H12.8" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/></svg></span>';
        }
        return '<span class="gp-key-badge gp-badge-neutral">' + token + '</span>';
    }

    function cleanControllerName(id) {
        var s = String(id || '').toLowerCase();
        if (s.indexOf('dualsense') !== -1) return 'DualSense';
        if (s.indexOf('dualshock') !== -1) return 'DualShock';
        if (s.indexOf('054c') !== -1 || s.indexOf('playstation') !== -1) return 'Control PlayStation';
        if (s.indexOf('045e') !== -1 || s.indexOf('xbox') !== -1) return 'Control Xbox';
        if (s.indexOf('057e') !== -1 || s.indexOf('nintendo') !== -1 || s.indexOf('switch') !== -1 || s.indexOf('joy-con') !== -1 || s.indexOf('joycon') !== -1 || s.indexOf('pro controller') !== -1) return 'Control Nintendo Switch';
        return 'Control';
    }

    // ─── Dashboard & Expanded Player State Helpers ───────────────────────────
    function isMenuPanelOpen() {
        var mp = document.getElementById('menu-panel');
        return Boolean(mp && mp.classList.contains('open'));
    }

    function isSpotlightExpandedOpen() {
        if (!isMenuPanelOpen()) return false;
        var sp = document.getElementById('spotlight-expanded');
        if (!sp) return false;
        if (sp.classList.contains('pointer-events-auto')) return true;
        var op = parseFloat(window.getComputedStyle(sp).opacity || '0');
        return op > 0.5;
    }

    function lockMenuPanelScroll() {
        var mp = document.getElementById('menu-panel');
        if (mp) {
            if (mp.scrollTop !== 0) mp.scrollTop = 0;
            if (mp.scrollLeft !== 0) mp.scrollLeft = 0;
        }
    }

    function prepareMenuPanelTargets() {
        var mp = document.getElementById('menu-panel');
        if (!mp) return;
        lockMenuPanelScroll();

        if (!mp.__gpScrollLockBound) {
            mp.__gpScrollLockBound = true;
            mp.addEventListener('scroll', lockMenuPanelScroll, { passive: true });
        }

        // Separate the Mini-Player left Track Info ("Loko") from its sibling Play/Next buttons
        var dock = mp.querySelector('div[onclick*="toggleSpotlightExpand"]');
        if (dock) {
            var trackInfo = dock.querySelector('div.flex.items-center.gap-3');
            if (trackInfo && !trackInfo.hasAttribute('data-gp-spotlight-expand')) {
                trackInfo.setAttribute('data-gp-spotlight-expand', 'true');
                trackInfo.setAttribute('role', 'button');
                trackInfo.setAttribute('aria-label', 'Abrir reproductor de música');
            }
        }
    }

    function isRecipeModalOpen() {
        var rm = document.getElementById('recipe-modal');
        return Boolean(rm && !rm.classList.contains('hidden') && window.getComputedStyle(rm).display !== 'none');
    }

    function isCreditsModalOpen() {
        var cm = document.getElementById('credits-modal');
        if (!cm || cm.classList.contains('hidden') || cm.classList.contains('opacity-0')) return false;
        try {
            return window.getComputedStyle(cm).display !== 'none';
        } catch (e) {
            return true;
        }
    }

    function getCreditsModalZones() {
        var cm = document.getElementById('credits-modal');
        if (!cm) return { closeBtn: null, cards: [], sections: [] };
        var closeBtn = document.getElementById('credits-close-btn') || cm.querySelector('button[onclick*="closeModal"]');
        return { closeBtn: closeBtn, cards: [], sections: [] };
    }

    function removeFocusRing(el) {
        if (!el) return;
        updateYaireLetterEffect(el, null);
        el.classList.remove('gp-focus');
        el.classList.remove('gp-focus-press');
    }

    function onCreditsModalOpened() {
        var cScroll = document.querySelector('#credits-content .custom-credits-scroll');
        if (cScroll) cScroll.scrollTop = 0;
        if (state.focusedEl) {
            removeFocusRing(state.focusedEl);
            state.focusedEl = null;
        }
        pulseHaptic(25, 0.18, 0.08);
        updateHUD();
    }

    function jumpCreditsSection(dir) {
        var cScroll = document.querySelector('#credits-content .custom-credits-scroll') || document.querySelector('#credits-modal .custom-credits-scroll');
        if (!cScroll) return;
        var step = (dir > 0 ? 1 : -1) * 220;
        cScroll.scrollTop += step;
        pulseHaptic(20, 0.15, 0.08);
    }

    function moveCreditsModalFocus(dx, dy) {
        var cScroll = document.querySelector('#credits-content .custom-credits-scroll') || document.querySelector('#credits-modal .custom-credits-scroll');
        if (!cScroll) return;
        var step = (dy !== 0 ? dy : dx) * 130;
        cScroll.scrollTop += step;
    }

    // ─── Auth Menu (#auth-menu) Gamepad Controller ───────────────────────────
    function isAuthMenuOpen() {
        var am = document.getElementById('auth-menu');
        if (!am) return false;
        if (am.style.display === 'none') return false;
        if (am.classList.contains('pointer-events-none') || am.classList.contains('opacity-0')) return false;
        var st = window.getComputedStyle(am);
        return st.display !== 'none' && parseFloat(st.opacity || '0') > 0.5;
    }

    function getAuthMenuZones() {
        var am = document.getElementById('auth-menu');
        if (!am) return { items: [] };
        var loggedInBox = document.getElementById('auth-menu-logged-in');
        var isLogged = loggedInBox && !loggedInBox.classList.contains('hidden') && window.getComputedStyle(loggedInBox).display !== 'none';
        var container = isLogged ? loggedInBox : document.getElementById('auth-menu-logged-out');
        if (!container) return { items: [] };
        var btns = Array.prototype.slice.call(container.querySelectorAll('button:not([disabled])'));
        return { items: btns };
    }

    function onAuthMenuOpened() {
        if (!state.activeMode) return;
        var az = getAuthMenuZones();
        if (az.items.length > 0) {
            setFocusedElement(az.items[0], false);
            pulseHaptic(25, 0.18, 0.08);
        }
    }

    function moveAuthMenuFocus(dx, dy) {
        var az = getAuthMenuZones();
        if (!az.items.length) return;
        var cur = ensureValidFocus();
        if (!cur) return;
        var idx = az.items.indexOf(cur);
        var nextEl = null;

        if (idx === -1) {
            nextEl = az.items[0];
        } else {
            if (Math.abs(dy) >= Math.abs(dx)) {
                if (dy > 0) {
                    nextEl = az.items[Math.min(az.items.length - 1, idx + 1)];
                } else if (dy < 0) {
                    nextEl = az.items[Math.max(0, idx - 1)];
                }
            } else {
                if (dx > 0) {
                    nextEl = az.items[Math.min(az.items.length - 1, idx + 1)];
                } else if (dx < 0) {
                    nextEl = az.items[Math.max(0, idx - 1)];
                }
            }
        }

        if (nextEl && nextEl !== cur) {
            setFocusedElement(nextEl, true);
            pulseHaptic(20, 0.16, 0.05);
            if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') {
                try { AudioManager.play('tictac.wav', 0.18); } catch (e) {}
            }
        }
    }

    // ─── Voice Channel Modal (#vc-panel) Gamepad Controller ──────────────────
    function isVoiceModalOpen() {
        var p = document.getElementById('vc-panel');
        if (!p) return false;
        if (document.body.classList.contains('vc-open') || document.body.classList.contains('vc-is-open')) return true;
        if (p.classList.contains('open') || p.classList.contains('scale-100') || p.classList.contains('opacity-100')) {
            return !p.classList.contains('pointer-events-none');
        }
        var st = window.getComputedStyle(p);
        return st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity || '0') > 0.5 && !p.classList.contains('pointer-events-none');
    }

    function isVoiceHistoryOpen() {
        var h = document.getElementById('vc-detailed-history');
        if (!h) return false;
        return (h.classList.contains('open') || !h.classList.contains('opacity-0')) && window.getComputedStyle(h).display !== 'none';
    }

    function getVoiceModalZones() {
        var p = document.getElementById('vc-panel');
        if (!p) return { closeBtn: null, logoutBtn: null, joinBtn: null, verMasBtn: null, historyRows: [], tabs: [], bottomBar: [], chatInputs: [], musicBtns: [], allCandidates: [] };

        var closeBtn = p.querySelector('#vc-close');
        var logoutBtn = p.querySelector('#vc-logout-btn');
        var joinBtn = p.querySelector('#vc-join') || p.querySelector('#vc-google-login-btn') || p.querySelector('#vc-cancel-conn') || p.querySelector('#vc-reconnect');
        var verMasBtn = p.querySelector('#vc-btn-ver-mas');
        var historyRows = Array.prototype.slice.call(p.querySelectorAll('.vc-hist-row'));
        var tabs = Array.prototype.slice.call(p.querySelectorAll('#vc-tab-room, #vc-tab-chat, #vc-tab-music'));
        var bottomBar = Array.prototype.slice.call(p.querySelectorAll('#vc-mute, #vc-dnd, #vc-leave'));
        var chatInputs = Array.prototype.slice.call(p.querySelectorAll('#vc-chat-in, #vc-chat-send'));
        var musicBtns = Array.prototype.slice.call(p.querySelectorAll('#vc-music-inner button, #vc-music-inner input'));

        var candidates = [];
        if (closeBtn && isElementVisible(closeBtn, false)) candidates.push(closeBtn);
        if (logoutBtn && isElementVisible(logoutBtn, false)) candidates.push(logoutBtn);
        if (joinBtn && isElementVisible(joinBtn, false)) candidates.push(joinBtn);
        if (tabs.length) candidates.push.apply(candidates, tabs.filter(function (t) { return isElementVisible(t, false); }));
        if (chatInputs.length) candidates.push.apply(candidates, chatInputs.filter(function (c) { return isElementVisible(c, false); }));
        if (musicBtns.length) candidates.push.apply(candidates, musicBtns.filter(function (m) { return isElementVisible(m, false); }));
        if (historyRows.length) candidates.push.apply(candidates, historyRows.filter(function (h) { return isElementVisible(h, false); }));
        if (verMasBtn && isElementVisible(verMasBtn, false)) candidates.push(verMasBtn);
        if (bottomBar.length) candidates.push.apply(candidates, bottomBar.filter(function (b) { return isElementVisible(b, false); }));

        return {
            closeBtn: closeBtn,
            logoutBtn: logoutBtn,
            joinBtn: joinBtn,
            verMasBtn: verMasBtn,
            historyRows: historyRows,
            tabs: tabs,
            bottomBar: bottomBar,
            chatInputs: chatInputs,
            musicBtns: musicBtns,
            allCandidates: candidates
        };
    }

    function onVoiceModalOpened() {
        if (!state.activeMode) return;
        var vz = getVoiceModalZones();
        var target = vz.joinBtn || vz.closeBtn || vz.allCandidates[0];
        if (target) {
            setFocusedElement(target, false);
            pulseHaptic(30, 0.22, 0.1);
        }
    }

    function onVoiceModalClosed() {
        if (!state.activeMode) return;
        var authTog = document.getElementById('auth-toggle');
        if (authTog && isElementVisible(authTog, true)) {
            setFocusedElement(authTog, false);
        } else {
            ensureValidFocus();
        }
    }

    function onVoiceHistoryOpened() {
        if (!state.activeMode) return;
        var det = document.getElementById('vc-detailed-history');
        if (!det) return;
        var closeBtn = det.querySelector('#vc-det-close');
        var firstRow = det.querySelector('.vc-det-row');
        var target = closeBtn || firstRow;
        if (target) {
            setFocusedElement(target, false);
            pulseHaptic(25, 0.18, 0.08);
        }
    }

    function onVoiceHistoryClosed() {
        if (!state.activeMode) return;
        var vz = getVoiceModalZones();
        var target = vz.verMasBtn || vz.joinBtn;
        if (target) {
            setFocusedElement(target, false);
        } else {
            ensureValidFocus();
        }
    }

    function cycleVoiceTab(dir) {
        var p = document.getElementById('vc-panel');
        if (!p) return;
        var tabs = [
            document.getElementById('vc-tab-room'),
            document.getElementById('vc-tab-chat'),
            document.getElementById('vc-tab-music')
        ].filter(Boolean);
        if (!tabs.length) return;

        var activeIdx = 0;
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].classList.contains('bg-white/[0.12]')) {
                activeIdx = i;
                break;
            }
        }
        var nextIdx = Math.max(0, Math.min(tabs.length - 1, activeIdx + dir));
        if (nextIdx === activeIdx && dir > 0) nextIdx = 0;
        else if (nextIdx === activeIdx && dir < 0) nextIdx = tabs.length - 1;

        var nextTab = tabs[nextIdx];
        if (nextTab) {
            nextTab.click();
            setFocusedElement(nextTab, true);
            pulseHaptic(26, 0.2, 0.08);
            if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') {
                try { AudioManager.play('transicion.wav', 0.25); } catch (e) {}
            }
        }
    }

    function moveVoiceModalFocus(dx, dy) {
        var vz = getVoiceModalZones();
        var cur = ensureValidFocus();
        if (!cur) return;
        var nextEl = null;

        var isClose = (cur === vz.closeBtn);
        var isLogout = (cur === vz.logoutBtn);
        var isJoin = (cur === vz.joinBtn);
        var histIdx = vz.historyRows.indexOf(cur);
        var isVerMas = (cur === vz.verMasBtn);
        var tabIdx = vz.tabs.indexOf(cur);
        var btmIdx = vz.bottomBar.indexOf(cur);
        var isChatIn = (cur.id === 'vc-chat-in');
        var isChatSend = (cur.id === 'vc-chat-send');

        if (isClose) {
            if (dy > 0) {
                if (vz.tabs.length > 0) {
                    var actTab = vz.tabs.find(function (t) { return t.classList.contains('bg-white/[0.12]'); });
                    nextEl = actTab || vz.tabs[0];
                } else if (vz.logoutBtn) {
                    nextEl = vz.logoutBtn;
                } else if (vz.joinBtn) {
                    nextEl = vz.joinBtn;
                } else if (vz.allCandidates.length > 1) {
                    nextEl = vz.allCandidates[1];
                }
            } else if (dx < 0 && vz.logoutBtn) {
                nextEl = vz.logoutBtn;
            }
        } else if (isLogout) {
            if (dy < 0) {
                nextEl = vz.closeBtn;
            } else if (dy > 0) {
                nextEl = vz.joinBtn;
            } else if (dx > 0 && vz.closeBtn) {
                nextEl = vz.closeBtn;
            }
        } else if (isJoin) {
            if (dy < 0) {
                nextEl = vz.logoutBtn || vz.closeBtn;
            } else if (dy > 0) {
                if (vz.historyRows.length > 0) {
                    nextEl = vz.historyRows[0];
                } else if (vz.verMasBtn) {
                    nextEl = vz.verMasBtn;
                }
            }
        } else if (histIdx !== -1) {
            if (Math.abs(dy) >= Math.abs(dx)) {
                if (dy < 0) {
                    if (histIdx === 0) {
                        nextEl = vz.joinBtn || vz.closeBtn;
                    } else {
                        nextEl = vz.historyRows[histIdx - 1];
                    }
                } else if (dy > 0) {
                    if (histIdx === vz.historyRows.length - 1) {
                        nextEl = vz.verMasBtn || vz.historyRows[histIdx];
                    } else {
                        nextEl = vz.historyRows[histIdx + 1];
                    }
                }
            } else {
                if (dx > 0 && vz.verMasBtn) {
                    nextEl = vz.verMasBtn;
                }
            }
        } else if (isVerMas) {
            if (dy < 0) {
                if (vz.historyRows.length > 0) {
                    nextEl = vz.historyRows[vz.historyRows.length - 1];
                } else {
                    nextEl = vz.joinBtn || vz.closeBtn;
                }
            }
        } else if (tabIdx !== -1) {
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0 && tabIdx > 0) {
                    nextEl = vz.tabs[tabIdx - 1];
                } else if (dx > 0 && tabIdx < vz.tabs.length - 1) {
                    nextEl = vz.tabs[tabIdx + 1];
                }
            } else {
                if (dy < 0) {
                    nextEl = vz.closeBtn;
                } else if (dy > 0) {
                    if (isChatIn || isChatSend) {
                        nextEl = vz.chatInputs[0];
                    } else if (vz.chatInputs.length > 0 && vz.tabs[tabIdx].id === 'vc-tab-chat') {
                        nextEl = vz.chatInputs[0];
                    } else if (vz.musicBtns.length > 0 && vz.tabs[tabIdx].id === 'vc-tab-music') {
                        nextEl = vz.musicBtns[0];
                    } else if (vz.bottomBar.length > 0) {
                        nextEl = vz.bottomBar[0];
                    }
                }
            }
        } else if (isChatIn || isChatSend) {
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0 && isChatIn && vz.chatInputs[1]) nextEl = vz.chatInputs[1];
                else if (dx < 0 && isChatSend && vz.chatInputs[0]) nextEl = vz.chatInputs[0];
            } else {
                if (dy < 0) {
                    nextEl = vz.tabs.find(function (t) { return t.id === 'vc-tab-chat'; }) || vz.tabs[1] || vz.closeBtn;
                } else if (dy > 0 && vz.bottomBar.length > 0) {
                    nextEl = vz.bottomBar[0];
                }
            }
        } else if (btmIdx !== -1) {
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0 && btmIdx < vz.bottomBar.length - 1) {
                    nextEl = vz.bottomBar[btmIdx + 1];
                } else if (dx < 0 && btmIdx > 0) {
                    nextEl = vz.bottomBar[btmIdx - 1];
                }
            } else {
                if (dy < 0) {
                    var actT = vz.tabs.find(function (t) { return t.classList.contains('bg-white/[0.12]'); });
                    if (actT && actT.id === 'vc-tab-chat' && vz.chatInputs.length > 0) {
                        nextEl = vz.chatInputs[0];
                    } else if (actT && actT.id === 'vc-tab-music' && vz.musicBtns.length > 0) {
                        nextEl = vz.musicBtns[vz.musicBtns.length - 1];
                    } else {
                        nextEl = actT || vz.closeBtn;
                    }
                }
            }
        } else {
            var all = vz.allCandidates;
            var cIdx = all.indexOf(cur);
            if (cIdx !== -1) {
                if (dy > 0 || dx > 0) nextEl = all[Math.min(all.length - 1, cIdx + 1)];
                else if (dy < 0 || dx < 0) nextEl = all[Math.max(0, cIdx - 1)];
            } else if (all.length > 0) {
                nextEl = all[0];
            }
        }

        if (nextEl && nextEl !== cur) {
            setFocusedElement(nextEl, true);
            pulseHaptic(20, 0.16, 0.05);
            if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') {
                try { AudioManager.play('tictac.wav', 0.18); } catch (e) {}
            }
        }
    }

    function moveVoiceHistoryFocus(dx, dy) {
        var det = document.getElementById('vc-detailed-history');
        if (!det) return;
        var closeBtn = det.querySelector('#vc-det-close');
        var rows = Array.prototype.slice.call(det.querySelectorAll('.vc-det-row'));
        var cur = ensureValidFocus();
        if (!cur) return;
        var nextEl = null;

        var isClose = (cur === closeBtn);
        var rowIdx = rows.indexOf(cur);

        if (isClose) {
            if (dy > 0 && rows.length > 0) {
                nextEl = rows[0];
            }
        } else if (rowIdx !== -1) {
            if (Math.abs(dy) >= Math.abs(dx)) {
                if (dy < 0) {
                    if (rowIdx === 0) {
                        nextEl = closeBtn;
                    } else {
                        nextEl = rows[rowIdx - 1];
                    }
                } else if (dy > 0) {
                    nextEl = rows[Math.min(rows.length - 1, rowIdx + 1)];
                }
            } else {
                if (dx > 0 && rowIdx === 0 && closeBtn) {
                    nextEl = closeBtn;
                }
            }
        } else {
            nextEl = closeBtn || rows[0];
        }

        if (nextEl && nextEl !== cur) {
            setFocusedElement(nextEl, true);
            pulseHaptic(20, 0.16, 0.05);
            if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') {
                try { AudioManager.play('tictac.wav', 0.18); } catch (e) {}
            }
        }
    }

    function getActiveRecipeTabId() {
        var ids = ['ing', 'prep', 'tech', 'secret'];
        for (var i = 0; i < ids.length; i++) {
            var pane = document.getElementById('rpane-' + ids[i]);
            if (pane && !pane.classList.contains('hidden')) {
                return ids[i];
            }
        }
        return 'ing';
    }

    function prepareRecipeModalTargets() {
        var rm = document.getElementById('recipe-modal');
        if (!rm) return;
        var readCards = rm.querySelectorAll('#rpane-tech > div, #rpane-secret > div:first-child, #rpane-secret .mt-5 > div');
        for (var i = 0; i < readCards.length; i++) {
            if (!readCards[i].hasAttribute('data-gp-rcp-card')) {
                readCards[i].setAttribute('data-gp-rcp-card', 'true');
            }
        }
    }

    function scrollElementIntoContainer(container, el, pad) {
        if (!container || !el) return;
        var padding = pad !== undefined ? pad : 22;
        var cRect = container.getBoundingClientRect();
        var eRect = el.getBoundingClientRect();
        var itemTopInScroll = container.scrollTop + (eRect.top - cRect.top);
        var itemBottomInScroll = container.scrollTop + (eRect.bottom - cRect.top);
        var viewTop = container.scrollTop;
        var viewBottom = container.scrollTop + container.clientHeight;

        if (itemTopInScroll < viewTop + padding) {
            container.scrollTop = Math.max(0, Math.round(itemTopInScroll - padding));
        } else if (itemBottomInScroll > viewBottom - padding) {
            container.scrollTop = Math.min(
                Math.max(0, container.scrollHeight - container.clientHeight),
                Math.round(itemBottomInScroll - container.clientHeight + padding)
            );
        }
        lockMenuPanelScroll();
    }

    // ─── Arcade Bridge Helpers ───────────────────────────────────────────────
    function isArcadeGame1Playing() {
        if (window.__28EArcade && typeof window.__28EArcade.isGame1Active === 'function') {
            return window.__28EArcade.isGame1Active();
        }
        var ov = document.getElementById('g1-overlay');
        return window.activeArcadeGame === 'game1' && ov && !ov.classList.contains('active');
    }

    function isArcadeGame2Playing() {
        if (window.__28EArcade && typeof window.__28EArcade.isGame2Active === 'function') {
            return window.__28EArcade.isGame2Active();
        }
        var ov = document.getElementById('game2-overlay');
        return window.activeArcadeGame === 'game2' && ov && !ov.classList.contains('active');
    }

    function isArcadeGame3Playing() {
        if (window.__28EArcade && typeof window.__28EArcade.isGame3Active === 'function') {
            return window.__28EArcade.isGame3Active();
        }
        var ov = document.getElementById('game3-overlay');
        return window.activeArcadeGame === 'game3' && ov && !ov.classList.contains('active');
    }

    function isArcadeGame4Playing() {
        if (window.__28EArcade && typeof window.__28EArcade.isGame4Active === 'function') {
            return window.__28EArcade.isGame4Active();
        }
        var ov = document.getElementById('game4-overlay');
        return window.activeArcadeGame === 'game4' && ov && !ov.classList.contains('active');
    }

    // ─── Haptics Engine ──────────────────────────────────────────────────────
    function isJoyConL(pad) {
        if (!pad) return false;
        var s = String(pad.id || '').toLowerCase();
        return s.indexOf('joy-con (l)') !== -1 || s.indexOf('joy-con l') !== -1 || s.indexOf('joycon (l)') !== -1 || s.indexOf('joycon l') !== -1 || (s.indexOf('057e') !== -1 && s.indexOf('2006') !== -1);
    }

    function isJoyConR(pad) {
        if (!pad) return false;
        var s = String(pad.id || '').toLowerCase();
        return s.indexOf('joy-con (r)') !== -1 || s.indexOf('joy-con r') !== -1 || s.indexOf('joycon (r)') !== -1 || s.indexOf('joycon r') !== -1 || (s.indexOf('057e') !== -1 && s.indexOf('2007') !== -1);
    }

    function createFusedJoyConPair(padL, padR) {
        var maxButtons = Math.max(padL.buttons ? padL.buttons.length : 0, padR.buttons ? padR.buttons.length : 0, 18);
        var buttons = [];
        for (var i = 0; i < maxButtons; i++) {
            var bL = (padL.buttons && padL.buttons[i]) ? padL.buttons[i] : { pressed: false, value: 0 };
            var bR = (padR.buttons && padR.buttons[i]) ? padR.buttons[i] : { pressed: false, value: 0 };
            var isPressed = Boolean(bL.pressed || bR.pressed);
            var val = Math.max(bL.value || 0, bR.value || 0);
            buttons.push({ pressed: isPressed, value: val });
        }

        var lx = (padL.axes && padL.axes.length > 0) ? padL.axes[0] : ((padR.axes && padR.axes.length > 2) ? padR.axes[2] : 0);
        var ly = (padL.axes && padL.axes.length > 1) ? padL.axes[1] : ((padR.axes && padR.axes.length > 3) ? padR.axes[3] : 0);
        var rx = (padR.axes && padR.axes.length > 0) ? padR.axes[0] : ((padL.axes && padL.axes.length > 2) ? padL.axes[2] : 0);
        var ry = (padR.axes && padR.axes.length > 1) ? padR.axes[1] : ((padL.axes && padL.axes.length > 3) ? padL.axes[3] : 0);

        return {
            id: 'Nintendo Joy-Con Pair (Fused L+R)',
            index: padR.index !== undefined ? padR.index : 0,
            connected: true,
            mapping: 'standard',
            buttons: buttons,
            axes: [lx, ly, rx, ry],
            vibrationActuator: padR.vibrationActuator || padL.vibrationActuator,
            hapticActuators: (padR.hapticActuators && padR.hapticActuators.length) ? padR.hapticActuators : padL.hapticActuators
        };
    }

    function getActiveGamepad() {
        if (!navigator.getGamepads) return null;
        var rawPads = navigator.getGamepads();
        if (!rawPads) return null;

        var connectedPads = [];
        for (var i = 0; i < rawPads.length; i++) {
            if (rawPads[i] && rawPads[i].connected) {
                connectedPads.push(rawPads[i]);
            }
        }
        if (connectedPads.length === 0) return null;
        if (connectedPads.length === 1) return connectedPads[0];

        // Multiple gamepads connected: check if Joy-Con (L) and Joy-Con (R) pair exist
        var joyL = null;
        var joyR = null;
        for (var j = 0; j < connectedPads.length; j++) {
            if (isJoyConL(connectedPads[j])) joyL = connectedPads[j];
            else if (isJoyConR(connectedPads[j])) joyR = connectedPads[j];
        }
        if (joyL && joyR) {
            return createFusedJoyConPair(joyL, joyR);
        }

        // Otherwise dynamically route to whichever gamepad has active button/stick input
        for (var k = 0; k < connectedPads.length; k++) {
            var p = connectedPads[k];
            if (p.buttons) {
                for (var b = 0; b < p.buttons.length; b++) {
                    if (p.buttons[b] && p.buttons[b].pressed) {
                        state.gamepadIndex = p.index;
                        return p;
                    }
                }
            }
            if (p.axes) {
                for (var a = 0; a < p.axes.length; a++) {
                    if (Math.abs(p.axes[a]) > 0.2) {
                        state.gamepadIndex = p.index;
                        return p;
                    }
                }
            }
        }

        if (state.gamepadIndex !== null) {
            for (var m = 0; m < connectedPads.length; m++) {
                if (connectedPads[m].index === state.gamepadIndex) return connectedPads[m];
            }
        }
        return connectedPads[0];
    }

    function pulseHaptic(durationMs, weakMag, strongMag) {
        try {
            var pad = getActiveGamepad();
            if (!pad) return;
            var dur = Math.max(10, Math.min(1000, durationMs || 30));
            var weak = Math.max(0, Math.min(1, weakMag !== undefined ? weakMag : 0.25));
            var strong = Math.max(0, Math.min(1, strongMag !== undefined ? strongMag : 0.1));

            if (pad.vibrationActuator && typeof pad.vibrationActuator.playEffect === 'function') {
                pad.vibrationActuator.playEffect('dual-rumble', {
                    startDelay: 0,
                    duration: dur,
                    weakMagnitude: weak,
                    strongMagnitude: strong
                }).catch(function () {});
            } else if (pad.hapticActuators && pad.hapticActuators[0] && typeof pad.hapticActuators[0].pulse === 'function') {
                pad.hapticActuators[0].pulse(Math.max(weak, strong), dur).catch(function () {});
            }
        } catch (e) {}
    }

    function triggerCelebrationRumble() {
        pulseHaptic(110, 0.75, 0.55);
        setTimeout(function () { pulseHaptic(90, 0.5, 0.35); }, 150);
        setTimeout(function () { pulseHaptic(180, 0.95, 0.85); }, 290);
    }

    // ─── Seamless Gamepad Cursor Auto-Hide & Mouse Handoff ───────────────────
    var lastMouseX = null;
    var lastMouseY = null;

    function hideMouseCursor() {
        if (document.documentElement) document.documentElement.classList.add('gp-hide-cursor');
        if (document.body) document.body.classList.add('gp-hide-cursor');
        lastMouseX = null;
        lastMouseY = null;
    }

    function showMouseCursor() {
        if (document.documentElement) document.documentElement.classList.remove('gp-hide-cursor');
        if (document.body) document.body.classList.remove('gp-hide-cursor');
        lastMouseX = null;
        lastMouseY = null;
        if (state.activeMode) {
            state.activeMode = false;
            state.scrollVelocityY = 0;
            if (state.focusedEl) {
                updateYaireLetterEffect(state.focusedEl, null);
                state.focusedEl.classList.remove('gp-focus');
                state.focusedEl.classList.remove('gp-focus-press');
            }
            updateHUD();
        }
        var strayFocus = document.querySelectorAll('.gp-focus, .gp-focus-press');
        for (var i = 0; i < strayFocus.length; i++) {
            strayFocus[i].classList.remove('gp-focus', 'gp-focus-press');
        }
    }

    // ─── Inject Styles & UI DOM (Apple + Emil Kowalski Craft) ────────────────
    function injectStylesAndUI() {
        if (document.getElementById('gp-engine-styles')) return;

        var style = document.createElement('style');
        style.id = 'gp-engine-styles';
        style.textContent = [
            ':root {',
            '    --gp-ease-out: cubic-bezier(0.23, 1, 0.32, 1);',
            '}',
            '/* Gamepad Navigation: Auto-Hide Mouse Cursor */',
            'html.gp-hide-cursor, html.gp-hide-cursor *, body.gp-hide-cursor, body.gp-hide-cursor * {',
            '    cursor: none !important;',
            '}',
            '/* ─── 5-Section Custom Gamepad Polish Focus ─── */',
            '/* 1. Juramento IX Circular Hold Button */',
            '#cs6-hold-btn.gp-focus {',
            '    outline: 2.5px solid rgba(251, 113, 133, 0.95) !important;',
            '    outline-offset: 4px !important;',
            '    box-shadow: 0 0 0 6px rgba(244, 63, 94, 0.25), 0 0 45px rgba(245, 158, 11, 0.45) !important;',
            '    transform: scale(1.05) !important;',
            '}',
            '/* 2. Tulipanes Pa Yaire Video Facade & Bento Cards */',
            '#yt-facade.gp-focus {',
            '    outline: 2px solid rgba(255, 148, 194, 0.95) !important;',
            '    outline-offset: 4px !important;',
            '    box-shadow: 0 0 0 4px rgba(231, 117, 166, 0.25), 0 0 35px rgba(244, 63, 94, 0.45) !important;',
            '    border-radius: 20px !important;',
            '}',
            '#yt-facade.gp-focus .rounded-full {',
            '    transform: scale(1.15) !important;',
            '    box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.4), 0 0 30px rgba(244, 63, 94, 0.8) !important;',
            '    background-color: #FFFFFF !important;',
            '}',
            '#tu-cancion .grid > div.gp-focus, #enigma-28 .grid > div.gp-focus {',
            '    outline: 1.5px solid rgba(255, 148, 194, 0.9) !important;',
            '    outline-offset: 3px !important;',
            '    box-shadow: 0 0 0 4px rgba(231, 117, 166, 0.18), 0 12px 30px rgba(196, 55, 122, 0.3) !important;',
            '    transform: translateY(-4px) !important;',
            '}',
            '/* 3. Paleta de Colores Cards & Modal */',
            '.pc-card.gp-focus {',
            '    outline: 2px solid #FF94C2 !important;',
            '    outline-offset: 4px !important;',
            '    box-shadow: 0 0 0 4px rgba(231, 117, 166, 0.25), 0 16px 36px rgba(0, 0, 0, 0.6) !important;',
            '    transform: translateY(-6px) scale(1.02) !important;',
            '}',
            '#paleta-modal-hex-chip.gp-focus {',
            '    outline: 2px solid #FF94C2 !important;',
            '    outline-offset: 2px !important;',
            '    box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.25) !important;',
            '}',
            '#paleta-modal .pc-close-btn.gp-focus {',
            '    outline: 2px solid #FF94C2 !important;',
            '    background: rgba(255, 255, 255, 0.15) !important;',
            '}',
            '/* 4. Guestbook Textarea & Submit Button */',
            '#gb-msg.gp-focus {',
            '    outline: 2px solid #FF94C2 !important;',
            '    outline-offset: 2px !important;',
            '    border-color: rgba(255, 148, 194, 0.8) !important;',
            '    box-shadow: 0 0 0 3px rgba(231, 117, 166, 0.25), 0 0 20px rgba(196, 55, 122, 0.25) !important;',
            '}',
            '#guestbook-form button[type="submit"].gp-focus {',
            '    outline: 2px solid #FFFFFF !important;',
            '    outline-offset: 3px !important;',
            '    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3), 0 8px 24px rgba(244, 63, 94, 0.4) !important;',
            '}',
            '/* 5. Galeria de Arte 3D Focus & Lightbox */',
            '.galeria-card.gp-focus {',
            '    outline: 2px solid rgba(255, 148, 194, 0.95) !important;',
            '    outline-offset: 4px !important;',
            '    box-shadow: 0 0 0 4px rgba(231, 117, 166, 0.25), 0 20px 45px -10px rgba(244, 63, 94, 0.45) !important;',
            '    transform: translateY(-8px) scale(1.03) !important;',
            '    z-index: 25 !important;',
            '}',
            '.galeria-card.gp-focus img {',
            '    transform: scale(1.06) !important;',
            '}',
            '.gp-lightbox-close.gp-focus, .gp-lightbox-prev.gp-focus, .gp-lightbox-next.gp-focus {',
            '    outline: 2px solid #FF94C2 !important;',
            '    outline-offset: 3px !important;',
            '    background: rgba(255, 255, 255, 0.25) !important;',
            '    box-shadow: 0 0 20px rgba(255, 148, 194, 0.5) !important;',
            '}',
            '/* Refined Spatial Focus Ring — Instant & Subtle */',
            '.gp-focus {',
            '    outline: 1.5px solid rgba(255, 148, 194, 0.88) !important;',
            '    outline-offset: 4px !important;',
            '    box-shadow: 0 0 0 3px rgba(231, 117, 166, 0.16), 0 0 20px rgba(196, 55, 122, 0.32) !important;',
            '    transition: transform 140ms var(--gp-ease-out), box-shadow 140ms var(--gp-ease-out), background-color 140ms var(--gp-ease-out) !important;',
            '    z-index: 40 !important;',
            '}',
            '/* Dashboard (#menu-panel) & Spotlight Player Tailored Unclipped Focus States */',
            '#menu-panel .menu-link-item.gp-focus {',
            '    outline: none !important;',
            '    background: rgba(231, 117, 166, 0.13) !important;',
            '    box-shadow: inset 0 0 0 1.5px rgba(255, 148, 194, 0.88), 0 4px 16px -4px rgba(196, 55, 122, 0.32) !important;',
            '}',
            '#menu-panel .menu-link-item.gp-focus span {',
            '    color: #FFFFFF !important;',
            '}',
            '#menu-panel .menu-link-item.gp-focus > span:last-child {',
            '    opacity: 1 !important;',
            '    transform: translateX(2px) !important;',
            '    color: #FF94C2 !important;',
            '}',
            '#menu-panel .vault-btn.gp-focus {',
            '    outline: none !important;',
            '    background: rgba(244, 63, 94, 0.14) !important;',
            '    box-shadow: inset 0 0 0 1.5px rgba(255, 148, 194, 0.92), inset 0 0 20px rgba(244, 63, 94, 0.18) !important;',
            '}',
            '#menu-panel #menu-search.gp-focus {',
            '    outline: none !important;',
            '    box-shadow: none !important;',
            '}',
            '#menu-panel div:has(> #menu-search.gp-focus) {',
            '    background: rgba(231, 117, 166, 0.10) !important;',
            '    border-radius: 10px !important;',
            '    padding: 6px 10px !important;',
            '    margin: -6px -10px !important;',
            '    box-shadow: inset 0 0 0 1.5px rgba(255, 148, 194, 0.85), 0 0 16px rgba(196, 55, 122, 0.25) !important;',
            '}',
            '#menu-panel div:has(> #menu-search.gp-focus) svg {',
            '    color: #FF94C2 !important;',
            '}',
            '#menu-panel [data-gp-spotlight-expand="true"] {',
            '    border-radius: 12px;',
            '    padding: 4px 6px;',
            '    margin: -4px -6px;',
            '}',
            '#menu-panel [data-gp-spotlight-expand="true"].gp-focus {',
            '    outline: none !important;',
            '    background: rgba(231, 117, 166, 0.13) !important;',
            '    box-shadow: inset 0 0 0 1.5px rgba(255, 148, 194, 0.88), 0 0 16px rgba(196, 55, 122, 0.25) !important;',
            '}',
            '#menu-panel > div:first-child a.gp-focus,',
            '#menu-panel > div:first-child button.gp-focus,',
            '#menu-panel button[onclick*="spotlight"].gp-focus,',
            '#spotlight-expanded button.gp-focus {',
            '    outline-offset: 2px !important;',
            '}',
            '#spotlight-progress-container.gp-focus {',
            '    outline: none !important;',
            '    border-radius: 9999px !important;',
            '    background: rgba(231, 117, 166, 0.14) !important;',
            '    box-shadow: 0 0 0 2px rgba(255, 148, 194, 0.85), 0 0 14px rgba(244, 63, 94, 0.35) !important;',
            '}',
            '#spotlight-expanded-list > div.gp-focus {',
            '    outline: none !important;',
            '    background: rgba(231, 117, 166, 0.14) !important;',
            '    border-color: rgba(255, 148, 194, 0.85) !important;',
            '    box-shadow: inset 0 0 0 1.5px rgba(255, 148, 194, 0.85), 0 4px 14px -4px rgba(196, 55, 122, 0.3) !important;',
            '}',
            '/* Recipe Modal (#recipe-modal) Tailored Focus States */',
            '#recipe-modal .recipe-tab-new.gp-focus {',
            '    outline: none !important;',
            '    box-shadow: 0 0 0 1.5px rgba(255, 148, 194, 0.92), 0 0 16px rgba(244, 63, 94, 0.35) !important;',
            '    color: #FFFFFF !important;',
            '}',
            '#recipe-modal .ing-card.gp-focus {',
            '    outline: none !important;',
            '    border-color: rgba(255, 148, 194, 0.90) !important;',
            '    background: rgba(244, 63, 94, 0.12) !important;',
            '    box-shadow: inset 0 0 0 1px rgba(255, 148, 194, 0.55), 0 10px 26px -6px rgba(196, 55, 122, 0.38) !important;',
            '    transform: translateY(-2px) !important;',
            '}',
            '#recipe-modal label[onclick*="markStepDone"] {',
            '    border-radius: 10px;',
            '    padding: 4px 10px;',
            '    margin: -4px -10px;',
            '}',
            '#recipe-modal label[onclick*="markStepDone"].gp-focus {',
            '    outline: none !important;',
            '    background: rgba(231, 117, 166, 0.14) !important;',
            '    box-shadow: inset 0 0 0 1.5px rgba(255, 148, 194, 0.88), 0 0 14px rgba(196, 55, 122, 0.28) !important;',
            '    color: #FFFFFF !important;',
            '}',
            '#recipe-modal [data-gp-rcp-card="true"].gp-focus {',
            '    outline: none !important;',
            '    border-color: rgba(255, 148, 194, 0.85) !important;',
            '    box-shadow: inset 0 0 0 1.5px rgba(255, 148, 194, 0.85), 0 10px 26px -6px rgba(196, 55, 122, 0.32) !important;',
            '}',
            '#recipe-modal button.pc-close-btn.gp-focus {',
            '    outline-offset: 2px !important;',
            '}',
            '/* Credits Modal (#credits-modal) Tailored Focus States */',
            '#credits-modal .credit-row-card.gp-focus {',
            '    outline: none !important;',
            '    box-shadow: none !important;',
            '    border-color: rgba(255, 148, 194, 0.18) !important;',
            '    transform: none !important;',
            '    background: transparent !important;',
            '},',
            '#credits-modal #credits-close-btn.gp-focus {',
            '    outline: none !important;',
            '    border-color: rgba(255, 148, 194, 0.95) !important;',
            '    box-shadow: 0 0 0 2.5px rgba(255, 148, 194, 0.9), 0 0 20px rgba(231, 117, 166, 0.6) !important;',
            '    transform: scale(1.14) !important;',
            '    background: rgba(255, 255, 255, 0.18) !important;',
            '    color: #FFFFFF !important;',
            '}',
            '/* Auth Menu (#auth-menu) Tailored Focus States */',
            '#auth-toggle.gp-focus {',
            '    outline: none !important;',
            '    border-color: rgba(255, 148, 194, 0.95) !important;',
            '    box-shadow: 0 0 0 2px rgba(255, 148, 194, 0.95), 0 0 20px rgba(231, 117, 166, 0.6) !important;',
            '    background: rgba(255, 255, 255, 0.16) !important;',
            '    transform: scale(1.04) !important;',
            '}',
            '#auth-menu button.gp-focus {',
            '    outline: none !important;',
            '    background-color: rgba(255, 255, 255, 0.14) !important;',
            '    color: #ffffff !important;',
            '    box-shadow: 0 0 0 2px rgba(255, 148, 194, 0.95), 0 0 16px rgba(231, 117, 166, 0.5) !important;',
            '    transform: scale(1.02) !important;',
            '}',
            '#auth-menu button.gp-focus svg {',
            '    color: #ffffff !important;',
            '}',
            '#auth-menu #auth-btn-logout.gp-focus {',
            '    outline: none !important;',
            '    background-color: rgba(244, 63, 94, 0.18) !important;',
            '    color: #fda4af !important;',
            '    box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.95), 0 0 16px rgba(244, 63, 94, 0.45) !important;',
            '    transform: scale(1.02) !important;',
            '}',
            '#auth-menu #auth-btn-logout.gp-focus svg {',
            '    color: #fda4af !important;',
            '}',
            '/* Voice Channel Modal (#vc-panel) Tailored Focus States */',
            '#vc-panel #vc-close.gp-focus {',
            '    outline: none !important;',
            '    border-color: rgba(255, 148, 194, 0.95) !important;',
            '    box-shadow: 0 0 0 2.5px rgba(255, 148, 194, 0.95), 0 0 18px rgba(231, 117, 166, 0.6) !important;',
            '    transform: scale(1.12) !important;',
            '    background: rgba(255, 255, 255, 0.2) !important;',
            '    color: #FFFFFF !important;',
            '}',
            '#vc-panel #vc-logout-btn.gp-focus {',
            '    outline: none !important;',
            '    box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.95), 0 0 16px rgba(244, 63, 94, 0.45) !important;',
            '    background: rgba(244, 63, 94, 0.18) !important;',
            '    color: #fda4af !important;',
            '    transform: scale(1.1) !important;',
            '}',
            '#vc-panel #vc-join.gp-focus {',
            '    outline: none !important;',
            '    box-shadow: 0 0 0 2.5px rgba(255, 148, 194, 0.95), 0 0 24px rgba(231, 117, 166, 0.7) !important;',
            '    transform: scale(1.025) !important;',
            '    filter: brightness(1.12) !important;',
            '}',
            '#vc-panel #vc-google-login-btn.gp-focus {',
            '    outline: none !important;',
            '    box-shadow: 0 0 0 2px rgba(255, 148, 194, 0.95), 0 0 20px rgba(231, 117, 166, 0.5) !important;',
            '    background: rgba(255, 255, 255, 0.18) !important;',
            '    transform: scale(1.02) !important;',
            '}',
            '#vc-panel #vc-btn-ver-mas.gp-focus {',
            '    outline: none !important;',
            '    box-shadow: 0 0 0 2px rgba(255, 148, 194, 0.9), 0 0 16px rgba(231, 117, 166, 0.5) !important;',
            '    background: rgba(255, 255, 255, 0.12) !important;',
            '    color: #FFFFFF !important;',
            '    border-radius: 8px !important;',
            '}',
            '#vc-panel .vc-hist-row.gp-focus {',
            '    outline: none !important;',
            '    background: rgba(255, 255, 255, 0.08) !important;',
            '    box-shadow: 0 0 0 1.5px rgba(255, 148, 194, 0.8) !important;',
            '    border-radius: 8px !important;',
            '}',
            '#vc-panel #vc-tab-room.gp-focus,',
            '#vc-panel #vc-tab-chat.gp-focus,',
            '#vc-panel #vc-tab-music.gp-focus {',
            '    outline: none !important;',
            '    box-shadow: 0 0 0 2px rgba(255, 148, 194, 0.9), 0 0 16px rgba(231, 117, 166, 0.5) !important;',
            '    background: rgba(255, 255, 255, 0.16) !important;',
            '    color: #FFFFFF !important;',
            '}',
            '#vc-panel #vc-mute.gp-focus,',
            '#vc-panel #vc-dnd.gp-focus,',
            '#vc-panel #vc-leave.gp-focus,',
            '#vc-panel #vc-cancel-conn.gp-focus,',
            '#vc-panel #vc-reconnect.gp-focus {',
            '    outline: none !important;',
            '    box-shadow: 0 0 0 2px rgba(255, 148, 194, 0.95), 0 0 18px rgba(231, 117, 166, 0.55) !important;',
            '    transform: scale(1.04) !important;',
            '}',
            '#vc-detailed-history #vc-det-close.gp-focus {',
            '    outline: none !important;',
            '    box-shadow: 0 0 0 2px rgba(255, 148, 194, 0.95), 0 0 18px rgba(231, 117, 166, 0.6) !important;',
            '    transform: scale(1.12) !important;',
            '}',
            '#vc-detailed-history .vc-det-row.gp-focus {',
            '    outline: none !important;',
            '    box-shadow: 0 0 0 1.5px rgba(255, 148, 194, 0.8) !important;',
            '    background: rgba(255, 255, 255, 0.08) !important;',
            '}',
            '.name-letter.gp-focus {',
            '    border-radius: 14px !important;',
            '    padding: 0 6px !important;',
            '    opacity: 1 !important;',
            '    transform: translateY(-14px) scale(1.12) !important;',
            '    color: #fda4af !important;',
            '    text-shadow: 0 0 25px rgba(244, 63, 94, 0.85), 0 0 50px rgba(225, 29, 72, 0.5) !important;',
            '}',
            '.gp-focus-press {',
            '    transform: scale(0.97) !important;',
            '}',
            '/* Fullscreen Art Lightbox Modal (#galeria) */',
            '#gp-lightbox-modal {',
            '    position: fixed;',
            '    inset: 0;',
            '    z-index: 99995;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    opacity: 0;',
            '    pointer-events: none;',
            '    transition: opacity 220ms var(--gp-ease-out);',
            '}',
            '#gp-lightbox-modal.gp-visible {',
            '    opacity: 1;',
            '    pointer-events: auto;',
            '}',
            '.gp-lightbox-backdrop {',
            '    position: absolute;',
            '    inset: 0;',
            '    background: rgba(6, 6, 10, 0.94);',
            '    backdrop-filter: blur(28px) saturate(170%);',
            '    -webkit-backdrop-filter: blur(28px) saturate(170%);',
            '}',
            '.gp-lightbox-dialog {',
            '    position: relative;',
            '    z-index: 2;',
            '    display: flex;',
            '    flex-direction: column;',
            '    align-items: center;',
            '    max-width: 90vw;',
            '    max-height: 90vh;',
            '    user-select: none;',
            '}',
            '.gp-lightbox-frame {',
            '    position: relative;',
            '    max-height: 72vh;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    border-radius: 22px;',
            '    overflow: hidden;',
            '    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 45px rgba(244, 63, 94, 0.22);',
            '    border: 1px solid rgba(255, 255, 255, 0.12);',
            '    background: #0D0D12;',
            '}',
            '.gp-lightbox-img {',
            '    max-height: 72vh;',
            '    max-width: 82vw;',
            '    object-fit: contain;',
            '    display: block;',
            '    border-radius: 21px;',
            '    transition: transform 260ms var(--gp-ease-out), opacity 200ms ease;',
            '}',
            '.gp-lightbox-caption-wrap {',
            '    margin-top: 14px;',
            '    text-align: center;',
            '    display: flex;',
            '    flex-direction: column;',
            '    align-items: center;',
            '    gap: 4px;',
            '}',
            '.gp-lightbox-badge {',
            '    font-family: -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif;',
            '    font-size: 11px;',
            '    font-weight: 700;',
            '    letter-spacing: 0.18em;',
            '    text-transform: uppercase;',
            '    color: #FF94C2;',
            '}',
            '.gp-lightbox-caption {',
            '    font-family: "Playfair Display", Georgia, serif;',
            '    font-style: italic;',
            '    font-size: 17px;',
            '    color: #FFFFFF;',
            '    max-width: 580px;',
            '    line-height: 1.35;',
            '    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);',
            '}',
            '.gp-lightbox-counter {',
            '    font-family: -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif;',
            '    font-size: 11px;',
            '    font-weight: 500;',
            '    color: rgba(255, 255, 255, 0.45);',
            '}',
            '.gp-lightbox-close {',
            '    position: fixed;',
            '    top: 24px;',
            '    right: 28px;',
            '    z-index: 10;',
            '    width: 42px;',
            '    height: 42px;',
            '    border-radius: 50%;',
            '    background: rgba(255, 255, 255, 0.08);',
            '    border: 1px solid rgba(255, 255, 255, 0.15);',
            '    color: #FFFFFF;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    cursor: pointer;',
            '    transition: background 150ms ease, transform 150ms ease;',
            '}',
            '.gp-lightbox-prev, .gp-lightbox-next {',
            '    position: fixed;',
            '    top: 50%;',
            '    transform: translateY(-50%);',
            '    z-index: 10;',
            '    width: 48px;',
            '    height: 48px;',
            '    border-radius: 50%;',
            '    background: rgba(255, 255, 255, 0.08);',
            '    border: 1px solid rgba(255, 255, 255, 0.15);',
            '    color: #FFFFFF;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    cursor: pointer;',
            '    backdrop-filter: blur(12px);',
            '    transition: background 150ms ease, transform 150ms ease;',
            '}',
            '.gp-lightbox-prev { left: 24px; }',
            '.gp-lightbox-next { right: 24px; }',
            '/* AirPods-Style Single-Line Connection Pill (Bottom-Left) */',
            '#gp-toast {',
            '    position: fixed;',
            '    bottom: 1.25rem;',
            '    left: 1.25rem;',
            '    top: auto;',
            '    transform-origin: bottom left;',
            '    transform: translateY(6px) scale(0.96);',
            '    z-index: 100000;',
            '    display: inline-flex;',
            '    align-items: center;',
            '    gap: 8px;',
            '    height: 32px;',
            '    padding: 0 12px;',
            '    border-radius: 9999px;',
            '    background: rgba(14, 14, 18, 0.82);',
            '    border: 1px solid rgba(255, 255, 255, 0.08);',
            '    border-top-color: rgba(255, 255, 255, 0.16);',
            '    box-shadow: 0 10px 28px -6px rgba(0, 0, 0, 0.65);',
            '    backdrop-filter: blur(20px) saturate(180%);',
            '    -webkit-backdrop-filter: blur(20px) saturate(180%);',
            '    opacity: 0;',
            '    filter: blur(2px);',
            '    pointer-events: none;',
            '    transition: opacity 160ms var(--gp-ease-out), transform 160ms var(--gp-ease-out), filter 160ms var(--gp-ease-out);',
            '    user-select: none;',
            '}',
            '#gp-toast.gp-visible {',
            '    opacity: 1;',
            '    filter: blur(0px);',
            '    transform: translateY(0) scale(1);',
            '    transition: opacity 220ms var(--gp-ease-out), transform 220ms var(--gp-ease-out), filter 220ms var(--gp-ease-out);',
            '}',
            '/* Whisper-Quiet Apple tvOS-Style Contextual HUD */',
            '#gp-hud {',
            '    position: fixed;',
            '    bottom: 1.25rem;',
            '    right: 1.25rem;',
            '    z-index: 99990;',
            '    display: inline-flex;',
            '    align-items: center;',
            '    gap: 12px;',
            '    height: 32px;',
            '    padding: 0 12px;',
            '    border-radius: 9999px;',
            '    background: rgba(14, 14, 18, 0.76);',
            '    border: 1px solid rgba(255, 255, 255, 0.07);',
            '    border-top-color: rgba(255, 255, 255, 0.14);',
            '    box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.6);',
            '    backdrop-filter: blur(20px) saturate(180%);',
            '    -webkit-backdrop-filter: blur(20px) saturate(180%);',
            '    opacity: 0;',
            '    filter: blur(2px);',
            '    transform: translateY(6px) scale(0.97);',
            '    pointer-events: none;',
            '    transition: opacity 150ms var(--gp-ease-out), transform 150ms var(--gp-ease-out), filter 150ms var(--gp-ease-out);',
            '    user-select: none;',
            '}',
            '#gp-hud.gp-visible {',
            '    opacity: 1;',
            '    filter: blur(0px);',
            '    transform: translateY(0) scale(1);',
            '    transition: opacity 210ms var(--gp-ease-out), transform 210ms var(--gp-ease-out), filter 210ms var(--gp-ease-out);',
            '}',
            '.gp-hud-item {',
            '    display: inline-flex;',
            '    align-items: center;',
            '    gap: 5.5px;',
            '    height: 18px;',
            '    font-family: -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif;',
            '    font-size: 11.5px;',
            '    font-weight: 500;',
            '    letter-spacing: -0.01em;',
            '    color: rgba(228, 228, 231, 0.84);',
            '    line-height: 1;',
            '}',
            '.gp-hud-label {',
            '    display: block;',
            '    line-height: 1;',
            '}',
            '.gp-key-badge {',
            '    display: inline-flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    width: 18px;',
            '    height: 18px;',
            '    min-width: 18px;',
            '    padding: 0;',
            '    border-radius: 9999px;',
            '    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", system-ui, sans-serif;',
            '    font-weight: 800;',
            '    font-size: 11px;',
            '    line-height: 1;',
            '    box-sizing: border-box;',
            '    flex-shrink: 0;',
            '    user-select: none;',
            '    overflow: hidden;',
            '    transition: transform 120ms var(--gp-ease-out), box-shadow 120ms ease;',
            '}',
            '.gp-key-badge svg {',
            '    width: 18px;',
            '    height: 18px;',
            '    display: block;',
            '    flex-shrink: 0;',
            '}',
            '.gp-key-badge.gp-key-badge-wide {',
            '    width: auto;',
            '    min-width: 22px;',
            '    padding: 0 5.5px;',
            '    font-size: 10px;',
            '    font-weight: 700;',
            '    letter-spacing: 0.02em;',
            '}',
            '/* Authentic Xbox Button Styling */',
            '.gp-badge-xb-a {',
            '    color: #22C55E !important;',
            '    background: rgba(34, 197, 94, 0.14) !important;',
            '    border: 1px solid rgba(34, 197, 94, 0.45) !important;',
            '    box-shadow: 0 0 8px rgba(34, 197, 94, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;',
            '}',
            '.gp-badge-xb-b {',
            '    color: #EF4444 !important;',
            '    background: rgba(239, 68, 68, 0.14) !important;',
            '    border: 1px solid rgba(239, 68, 68, 0.45) !important;',
            '    box-shadow: 0 0 8px rgba(239, 68, 68, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;',
            '}',
            '.gp-badge-xb-x {',
            '    color: #3B82F6 !important;',
            '    background: rgba(59, 130, 246, 0.14) !important;',
            '    border: 1px solid rgba(59, 130, 246, 0.45) !important;',
            '    box-shadow: 0 0 8px rgba(59, 130, 246, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;',
            '}',
            '.gp-badge-xb-y {',
            '    color: #EAB308 !important;',
            '    background: rgba(234, 179, 8, 0.14) !important;',
            '    border: 1px solid rgba(234, 179, 8, 0.45) !important;',
            '    box-shadow: 0 0 8px rgba(234, 179, 8, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;',
            '}',
            '/* Authentic PlayStation Symbol Styling */',
            '.gp-badge-ps-cross {',
            '    color: #38BDF8 !important;',
            '    background: rgba(56, 189, 248, 0.14) !important;',
            '    border: 1px solid rgba(56, 189, 248, 0.45) !important;',
            '    box-shadow: 0 0 8px rgba(56, 189, 248, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;',
            '}',
            '.gp-badge-ps-circle {',
            '    color: #F43F5E !important;',
            '    background: rgba(244, 63, 94, 0.14) !important;',
            '    border: 1px solid rgba(244, 63, 94, 0.45) !important;',
            '    box-shadow: 0 0 8px rgba(244, 63, 94, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;',
            '}',
            '.gp-badge-ps-square {',
            '    color: #EC4899 !important;',
            '    background: rgba(236, 72, 153, 0.14) !important;',
            '    border: 1px solid rgba(236, 72, 153, 0.45) !important;',
            '    box-shadow: 0 0 8px rgba(236, 72, 153, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;',
            '}',
            '.gp-badge-ps-triangle {',
            '    color: #34D399 !important;',
            '    background: rgba(52, 211, 153, 0.14) !important;',
            '    border: 1px solid rgba(52, 211, 153, 0.45) !important;',
            '    box-shadow: 0 0 8px rgba(52, 211, 153, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;',
            '}',
            '/* Neutral Bumpers, Menu & Stick Badges */',
            '.gp-badge-neutral {',
            '    color: #E4E4E7 !important;',
            '    background: rgba(255, 255, 255, 0.08) !important;',
            '    border: 1px solid rgba(255, 255, 255, 0.16) !important;',
            '    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;',
            '}',
            '/* Authentic Nintendo Switch Button Styling */',
            '.gp-badge-sw {',
            '    color: #FFFFFF !important;',
            '    background: rgba(255, 255, 255, 0.12) !important;',
            '    border: 1px solid rgba(255, 255, 255, 0.28) !important;',
            '    box-shadow: 0 0 8px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.22) !important;',
            '}',
            '/* Universal Neutral Styling for Generic PC & USB Gamepads */',
            '.gp-badge-generic {',
            '    color: #FFFFFF !important;',
            '    background: rgba(255, 255, 255, 0.11) !important;',
            '    border: 1px solid rgba(255, 255, 255, 0.24) !important;',
            '    box-shadow: 0 0 6px rgba(255, 255, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;',
            '}',
            '/* On-Screen Virtual Keyboard for Passcode / Oath / Search */',
            '#gp-vkbd {',
            '    position: fixed;',
            '    bottom: 3.75rem;',
            '    left: 50%;',
            '    transform: translate(-50%, 8px) scale(0.96);',
            '    z-index: 100005;',
            '    width: 92vw;',
            '    max-width: 400px;',
            '    padding: 14px;',
            '    border-radius: 22px;',
            '    background: rgba(16, 16, 20, 0.88);',
            '    border: 1px solid rgba(255, 255, 255, 0.09);',
            '    border-top-color: rgba(255, 255, 255, 0.16);',
            '    box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.85);',
            '    backdrop-filter: blur(24px) saturate(180%);',
            '    -webkit-backdrop-filter: blur(24px) saturate(180%);',
            '    opacity: 0;',
            '    filter: blur(2px);',
            '    pointer-events: none;',
            '    transition: opacity 160ms var(--gp-ease-out), transform 160ms var(--gp-ease-out), filter 160ms var(--gp-ease-out);',
            '    user-select: none;',
            '}',
            '#gp-vkbd.gp-visible {',
            '    opacity: 1;',
            '    filter: blur(0px);',
            '    transform: translate(-50%, 0) scale(1);',
            '    pointer-events: auto;',
            '    transition: opacity 220ms var(--gp-ease-out), transform 220ms var(--gp-ease-out), filter 220ms var(--gp-ease-out);',
            '}',
            '.gp-vkbd-grid {',
            '    display: grid;',
            '    grid-template-columns: repeat(10, 1fr);',
            '    gap: 4px;',
            '}',
            '.gp-vkbd-key {',
            '    height: 32px;',
            '    border-radius: 8px;',
            '    background: rgba(255, 255, 255, 0.045);',
            '    border: 1px solid rgba(255, 255, 255, 0.07);',
            '    color: #F4F4F5;',
            '    font-family: -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif;',
            '    font-size: 12px;',
            '    font-weight: 500;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    cursor: pointer;',
            '    transition: transform 120ms var(--gp-ease-out), background 120ms ease;',
            '}',
            '.gp-vkbd-key.gp-vkbd-active {',
            '    background: rgba(231, 117, 166, 0.24) !important;',
            '    border-color: rgba(255, 148, 194, 0.65) !important;',
            '    color: #FFFFFF !important;',
            '    transform: scale(1.05);',
            '}',
            '@media (prefers-reduced-motion: reduce) {',
            '    #gp-toast, #gp-hud, #gp-vkbd, .gp-focus {',
            '        transition: opacity 150ms ease !important;',
            '        filter: none !important;',
            '    }',
            '}',
            '@media (max-width: 640px) {',
            '    #gp-hud { left: 50%; right: auto; transform: translate(-50%, 6px) scale(0.97); }',
            '    #gp-hud.gp-visible { transform: translate(-50%, 0) scale(1); }',
            '}'
        ].join('\n');
        document.head.appendChild(style);

        // Single-line AirPods-style Connection Pill
        var toast = document.createElement('div');
        toast.id = 'gp-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = [
            '<svg id="gp-toast-icon" style="width: 15px; height: 15px; color: #FF94C2; flex-shrink: 0; display: block;" fill="none" viewBox="0 2.4 24 24" stroke="currentColor" stroke-width="1.8">',
            '  <path stroke-linecap="round" stroke-linejoin="round" d="M6.5 9h11a4.5 4.5 0 014.39 5.48l-.68 3.06a2.5 2.5 0 01-4.12 1.32l-2.06-1.85a1.5 1.5 0 00-1.01-.39h-4.04a1.5 1.5 0 00-1.01.39l-2.06 1.85a2.5 2.5 0 01-4.12-1.32l-.68-3.06A4.5 4.5 0 016.5 9z" />',
            '  <path stroke-linecap="round" stroke-linejoin="round" d="M8.5 12v3M7 13.5h3M15.5 12.75h.01M17.25 14.25h.01" />',
            '</svg>',
            '<span id="gp-toast-title" style="font-family: -apple-system, BlinkMacSystemFont, \'Inter\', system-ui, sans-serif; font-size: 12px; font-weight: 500; color: rgba(255, 255, 255, 0.92); letter-spacing: -0.01em; line-height: 1; display: block;">Mando detectado</span>'
        ].join('');
        document.body.appendChild(toast);

        // Contextual Bottom HUD Bar
        var hud = document.createElement('div');
        hud.id = 'gp-hud';
        document.body.appendChild(hud);

        // On-Screen Virtual Keyboard for Passcode / Oath / Search
        var vkbd = document.createElement('div');
        vkbd.id = 'gp-vkbd';
        document.body.appendChild(vkbd);

        // Fullscreen Lightbox Modal for Art Gallery (#galeria)
        if (!document.getElementById('gp-lightbox-modal')) {
            var lb = document.createElement('div');
            lb.id = 'gp-lightbox-modal';
            lb.style.display = 'none';
            lb.innerHTML = [
                '<div class="gp-lightbox-backdrop" onclick="window.__gpCloseGalleryLightbox && window.__gpCloseGalleryLightbox()"></div>',
                '<div class="gp-lightbox-dialog" role="dialog" aria-modal="true">',
                '  <button class="gp-lightbox-close" onclick="window.__gpCloseGalleryLightbox && window.__gpCloseGalleryLightbox()" aria-label="Cerrar">',
                '    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
                '  </button>',
                '  <button class="gp-lightbox-prev" onclick="window.__gpPrevGalleryPhoto && window.__gpPrevGalleryPhoto()" aria-label="Anterior">',
                '    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
                '  </button>',
                '  <button class="gp-lightbox-next" onclick="window.__gpNextGalleryPhoto && window.__gpNextGalleryPhoto()" aria-label="Siguiente">',
                '    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
                '  </button>',
                '  <div class="gp-lightbox-frame">',
                '    <img id="gp-lightbox-img" class="gp-lightbox-img" src="" alt="Obra de arte">',
                '  </div>',
                '  <div class="gp-lightbox-caption-wrap">',
                '    <span id="gp-lightbox-badge" class="gp-lightbox-badge">OBRA I</span>',
                '    <p id="gp-lightbox-caption" class="gp-lightbox-caption">La sonrisa que ilumina mis días.</p>',
                '    <span id="gp-lightbox-counter" class="gp-lightbox-counter">1 / 6</span>',
                '  </div>',
                '</div>'
            ].join('');
            document.body.appendChild(lb);
        }

        prepareMenuPanelTargets();
        prepareRecipeModalTargets();
        prepareGalleryCards();
    }

    function showGamepadToast(title, _unusedSub, isConnected) {
        injectStylesAndUI();
        var toast = document.getElementById('gp-toast');
        var titleEl = document.getElementById('gp-toast-title');
        var iconEl = document.getElementById('gp-toast-icon');
        if (!toast) return;

        if (titleEl) titleEl.textContent = title;
        if (iconEl) {
            iconEl.style.color = isConnected === false ? '#A1A1AA' : '#FF94C2';
        }

        toast.classList.add('gp-visible');
        if (state.toastTimer) clearTimeout(state.toastTimer);
        state.toastTimer = setTimeout(function () {
            toast.classList.remove('gp-visible');
        }, 2800);
    }

    // ─── Contextual HUD Updating (Max 2–3 Restrained Prompts) ────────────────
    function getActiveContextType() {
        if (state.vkbdOpen) return 'vkbd';
        if (state.galleryLightboxOpen) return 'lightbox';

        var cs6Oath = document.getElementById('cs6-oath');
        if (cs6Oath && !cs6Oath.classList.contains('hidden') && window.getComputedStyle(cs6Oath).display !== 'none' && parseFloat(window.getComputedStyle(cs6Oath).opacity || '0') > 0.5) {
            return 'oath';
        }

        var palModal = document.getElementById('paleta-modal');
        if (palModal && !palModal.classList.contains('hidden') && window.getComputedStyle(palModal).display !== 'none') {
            return 'paleta-modal';
        }

        if (isArcadeGame2Playing()) return 'game2';
        if (isArcadeGame1Playing()) return 'game1';
        if (isArcadeGame3Playing()) return 'game3';
        if (isArcadeGame4Playing()) return 'game4';

        var secModal = document.getElementById('secret-modal');
        if (secModal && !secModal.classList.contains('hidden')) {
            var dedModal = document.getElementById('secret-dedication-modal');
            if (dedModal && !dedModal.classList.contains('hidden')) return 'dedication';
            var letModal = document.getElementById('secret-letter');
            if (letModal && !letModal.classList.contains('hidden')) return 'letter';
            return 'vault-login';
        }

        if (isRecipeModalOpen()) {
            return 'recipe-modal';
        }

        if (isCreditsModalOpen()) {
            return 'credits-modal';
        }

        if (isVoiceHistoryOpen()) {
            return 'voice-history';
        }

        if (isVoiceModalOpen()) {
            return 'voice-modal';
        }

        if (isAuthMenuOpen()) {
            return 'auth-menu';
        }

        if (isSpotlightExpandedOpen()) {
            if (state.focusedEl && state.focusedEl.id === 'spotlight-progress-container') {
                return 'spotlight-scrub';
            }
            return 'spotlight-expanded';
        }

        if (isMenuPanelOpen()) {
            return 'dashboard';
        }

        if (state.focusedEl) {
            if (state.focusedEl.id === 'cs6-hold-btn') return 'cs6-hold';
            if (state.focusedEl.id === 'yt-facade') return 'yt-facade';
            if (state.focusedEl.classList && state.focusedEl.classList.contains('galeria-card')) return 'galeria-card';
            if (state.focusedEl.id === 'gb-msg') return 'guestbook-msg';
            if (state.focusedEl.classList && state.focusedEl.classList.contains('name-letter')) return 'yaire-letters';
            if (state.focusedEl.id === 'draggable-sun' || state.focusedEl.id === 'sunflower-widget') return 'sunflower';
        }

        return 'default';
    }

    function updateHUD() {
        var hud = document.getElementById('gp-hud');
        if (!hud) return;
        if (!state.activeMode) {
            hud.classList.remove('gp-visible');
            return;
        }

        // Auto-hide HUD after 4.5s of no controller input so the screen stays pure
        if (performance.now() - state.lastInputTime > HUD_IDLE_HIDE_MS && !state.vkbdOpen) {
            hud.classList.remove('gp-visible');
            return;
        }

        var gl = g();
        var ctx = getActiveContextType();
        var items = [];

        if (ctx === 'vkbd') {
            items = [
                { key: gl.confirm, label: 'Escribir' },
                { key: gl.alt1, label: 'Borrar' },
                { key: gl.alt2, label: 'Listo' }
            ];
        } else if (ctx === 'lightbox') {
            items = [
                { key: gl.bumpers, label: 'Foto ant / sig' },
                { key: gl.back, label: 'Cerrar' }
            ];
        } else if (ctx === 'oath') {
            items = [
                { key: gl.confirm, label: 'Firmar' },
                { key: gl.back, label: 'Cerrar' }
            ];
        } else if (ctx === 'credits-modal') {
            items = [
                { key: 'stick-r', label: 'Scroll' },
                { key: gl.confirm, label: 'Cerrar' },
                { key: gl.back, label: 'Cerrar' }
            ];
        } else if (ctx === 'paleta-modal') {
            items = [
                { key: gl.bumpers, label: 'Cambiar color' },
                { key: gl.confirm, label: 'Copiar hex' },
                { key: gl.back, label: 'Volver' }
            ];
        } else if (ctx === 'cs6-hold') {
            items = [
                { key: gl.confirm, label: 'Mantener 3s' },
                { key: gl.back, label: 'Volver' }
            ];
        } else if (ctx === 'yt-facade') {
            var ytActionLabel = 'Reproducir';
            if (state.tulipanesVideoStarted) {
                ytActionLabel = state.tulipanesVideoPlaying ? 'Pausar' : 'Continuar';
            }
            items = [
                { key: gl.confirm, label: ytActionLabel },
                { key: gl.back, label: 'Volver' }
            ];
        } else if (ctx === 'galeria-card') {
            items = [
                { key: gl.confirm, label: 'Ver obra' },
                { key: gl.back, label: 'Volver' }
            ];
        } else if (ctx === 'guestbook-msg') {
            items = [
                { key: gl.confirm, label: 'Escribir' },
                { key: gl.back, label: 'Volver' }
            ];
        } else if (ctx === 'game2') {
            items = [
                { key: gl.confirm, label: 'Aletear' },
                { key: gl.back, label: 'Salir' }
            ];
        } else if (ctx === 'game1') {
            items = [
                { key: gl.confirm, label: 'Atrapar' },
                { key: gl.back, label: 'Salir' }
            ];
        } else if (ctx === 'game3') {
            items = [
                { key: gl.confirm, label: 'Voltear' },
                { key: gl.back, label: 'Salir' }
            ];
        } else if (ctx === 'game4') {
            items = [
                { key: gl.confirm, label: 'Elegir' },
                { key: gl.back, label: 'Salir' }
            ];
        } else if (ctx === 'recipe-modal') {
            items = [
                { key: gl.confirm, label: 'Seleccionar' },
                { key: gl.bumpers, label: 'Pestaña' },
                { key: gl.back, label: 'Cerrar' }
            ];
        } else if (ctx === 'spotlight-scrub') {
            items = [
                { key: 'arrows-lr', label: 'Adelantar' },
                { key: gl.confirm, label: 'Play/Pausa' },
                { key: gl.back, label: 'Plegar' }
            ];
        } else if (ctx === 'spotlight-expanded') {
            items = [
                { key: gl.confirm, label: 'Seleccionar' },
                { key: gl.back, label: 'Plegar' }
            ];
        } else if (ctx === 'dashboard') {
            items = [
                { key: gl.confirm, label: 'Seleccionar' },
                { key: gl.bumpers, label: 'Categoría' },
                { key: gl.back, label: 'Cerrar' }
            ];
        } else if (ctx === 'yaire-letters') {
            items = [
                { key: 'arrows-lr', label: 'Letras' },
                { key: gl.confirm, label: 'Destello' }
            ];
        } else if (ctx === 'sunflower') {
            items = [
                { key: 'arrows-lr', label: 'Sol' },
                { key: gl.confirm, label: 'Florecer' }
            ];
        } else if (ctx === 'letter') {
            items = [
                { key: gl.confirm, label: 'Mantener 3s' },
                { key: gl.back, label: 'Cerrar' }
            ];
        } else if (ctx === 'dedication') {
            items = [
                { key: gl.confirm, label: 'Te amo' },
                { key: gl.back, label: 'Cerrar' }
            ];
        } else if (ctx === 'vault-login') {
            items = [
                { key: gl.confirm, label: 'Seleccionar' },
                { key: gl.back, label: 'Volver' }
            ];
        } else if (ctx === 'auth-menu') {
            items = [
                { key: gl.confirm, label: 'Seleccionar' },
                { key: gl.back, label: 'Cerrar' }
            ];
        } else if (ctx === 'voice-modal') {
            var vPan = document.getElementById('vc-panel');
            var isConn = vPan && vPan.querySelector('#vc-tab-room');
            if (isConn) {
                items = [
                    { key: gl.bumpers, label: 'Pestañas' },
                    { key: gl.confirm, label: 'Seleccionar' },
                    { key: gl.back, label: 'Cerrar' }
                ];
            } else {
                items = [
                    { key: gl.confirm, label: 'Seleccionar' },
                    { key: gl.back, label: 'Cerrar' }
                ];
            }
        } else if (ctx === 'voice-history') {
            items = [
                { key: gl.back, label: 'Volver' }
            ];
        } else {
            items = [
                { key: gl.confirm, label: 'Seleccionar' },
                { key: gl.back, label: 'Volver' },
                { key: gl.menu, label: 'Menú' }
            ];
        }

        var html = '';
        for (var i = 0; i < items.length; i++) {
            html += '<span class="gp-hud-item">' + renderKeyBadge(items[i].key) + '<span class="gp-hud-label">' + items[i].label + '</span></span>';
        }
        if (hud.innerHTML !== html) {
            hud.innerHTML = html;
        }
        hud.classList.add('gp-visible');
    }

    // ─── Active Scope & Interactive Candidates ───────────────────────────────
    function isElementVisible(el, allowUnrevealed) {
        if (!el || !el.getBoundingClientRect) return false;
        if (el.disabled) return false;
        if (el.classList && el.classList.contains('is-hidden-search')) return false;
        var cur = el;
        while (cur && cur !== document.body) {
            if (cur.classList && cur.classList.contains('hidden')) return false;
            if (cur.classList && cur.classList.contains('is-hidden-search')) return false;
            if (cur.classList && cur.classList.contains('game-overlay-new') && !cur.classList.contains('active')) {
                return false;
            }
            var st = window.getComputedStyle(cur);
            if (st.display === 'none' || st.visibility === 'hidden') {
                return false;
            }
            if (parseFloat(st.opacity) === 0) {
                var isScrollReveal = cur.classList && (
                    cur.classList.contains('reveal') ||
                    cur.classList.contains('reveal-scale') ||
                    cur.classList.contains('reveal-fade') ||
                    cur.classList.contains('apple-section-enter')
                );
                var isRecipeTransition = Boolean(cur.closest && cur.closest('#recipe-modal'));
                if (!isRecipeTransition && (!allowUnrevealed || !isScrollReveal)) {
                    return false;
                }
            }
            cur = cur.parentElement;
        }
        var rect = el.getBoundingClientRect();
        return rect.width > 6 && rect.height > 6;
    }

    function revealAncestorsIfNeeded(el) {
        var cur = el;
        while (cur && cur !== document.body) {
            if (cur.classList) {
                if (cur.classList.contains('reveal') || cur.classList.contains('reveal-scale') || cur.classList.contains('reveal-fade')) {
                    cur.classList.add('active');
                }
                if (cur.classList.contains('apple-section-enter')) {
                    cur.classList.add('apple-entered');
                }
            }
            cur = cur.parentElement;
        }
    }

    function getActiveScopeRoot() {
        if (state.galleryLightboxOpen) {
            var lbModal = document.getElementById('gp-lightbox-modal');
            if (lbModal && lbModal.classList.contains('gp-visible')) return lbModal;
        }

        var secModal = document.getElementById('secret-modal');
        if (secModal && !secModal.classList.contains('hidden')) {
            var dedModal = document.getElementById('secret-dedication-modal');
            if (dedModal && !dedModal.classList.contains('hidden')) return dedModal;
            var letModal = document.getElementById('secret-letter');
            if (letModal && !letModal.classList.contains('hidden')) return letModal;
            var loginModal = document.getElementById('secret-login');
            if (loginModal && !loginModal.classList.contains('hidden')) return loginModal;
            return secModal;
        }

        var cs6Modal = document.getElementById('cs6-oath');
        if (cs6Modal && !cs6Modal.classList.contains('hidden') && window.getComputedStyle(cs6Modal).display !== 'none' && parseFloat(window.getComputedStyle(cs6Modal).opacity || '0') > 0.5) {
            return cs6Modal;
        }

        var modalIds = [
            'credits-modal',
            'paleta-modal',
            'recipe-modal',
            'cs6-oath',
            'oath-modal',
            'game-modal',
            'gp-lightbox-modal',
            'lightbox-modal'
        ];
        for (var i = 0; i < modalIds.length; i++) {
            var m = document.getElementById(modalIds[i]);
            if (m && !m.classList.contains('hidden') && window.getComputedStyle(m).display !== 'none') {
                return m;
            }
        }

        if (isSpotlightExpandedOpen()) {
            return document.getElementById('spotlight-expanded');
        }

        if (isMenuPanelOpen()) {
            return document.getElementById('menu-panel');
        }

        if (isVoiceHistoryOpen()) {
            return document.getElementById('vc-detailed-history');
        }

        if (isVoiceModalOpen()) {
            return document.getElementById('vc-panel');
        }

        if (isAuthMenuOpen()) {
            return document.getElementById('auth-menu');
        }

        var gameArea = document.getElementById('game-active-area');
        if (gameArea && !gameArea.classList.contains('hidden') && window.getComputedStyle(gameArea).display !== 'none') {
            return gameArea;
        }

        return document.body;
    }

    // ─── Dashboard (#menu-panel) Zone Collectors ─────────────────────────────
    function getDashboardZones() {
        prepareMenuPanelTargets();
        var mp = document.getElementById('menu-panel');
        if (!mp) return { header: [], search: null, links: [], miniPlayer: [] };

        var headerRow = mp.children[0];
        var headerItems = [];
        if (headerRow) {
            var rawHeader = headerRow.querySelectorAll('a[href], button:not([disabled])');
            for (var i = 0; i < rawHeader.length; i++) {
                if (isElementVisible(rawHeader[i], false)) {
                    headerItems.push(rawHeader[i]);
                }
            }
        }

        var searchEl = document.getElementById('menu-search');
        var searchItem = (searchEl && isElementVisible(searchEl, false)) ? searchEl : null;

        var linksContainer = document.getElementById('menu-links');
        var linkItems = [];
        if (linksContainer) {
            var rawLinks = linksContainer.querySelectorAll('.menu-link');
            for (var j = 0; j < rawLinks.length; j++) {
                if (isElementVisible(rawLinks[j], false)) {
                    linkItems.push(rawLinks[j]);
                }
            }
        }

        var miniPlayerItems = [];
        var expandTarget = mp.querySelector('[data-gp-spotlight-expand="true"]');
        if (expandTarget && isElementVisible(expandTarget, false)) {
            miniPlayerItems.push(expandTarget);
        }
        var dock = mp.querySelector('div[onclick*="toggleSpotlightExpand"]');
        if (dock) {
            var dockBtns = dock.querySelectorAll('button:not([disabled])');
            for (var k = 0; k < dockBtns.length; k++) {
                if (isElementVisible(dockBtns[k], false)) {
                    miniPlayerItems.push(dockBtns[k]);
                }
            }
        }

        return {
            header: headerItems,
            search: searchItem,
            links: linkItems,
            miniPlayer: miniPlayerItems
        };
    }

    // ─── Spotlight Expanded (#spotlight-expanded) Zone Collectors ────────────
    function getSpotlightExpandedZones() {
        var sp = document.getElementById('spotlight-expanded');
        if (!sp) return { topRow: [], progress: null, deck: [], playlist: [] };

        var topRow = [];
        var collapseBtn = sp.querySelector('button[onclick*="toggleSpotlightExpand"]');
        if (collapseBtn && isElementVisible(collapseBtn, false)) topRow.push(collapseBtn);
        var musicBtn = document.getElementById('spot-mode-btn-music');
        if (musicBtn && isElementVisible(musicBtn, false)) topRow.push(musicBtn);
        var radioBtn = document.getElementById('spot-mode-btn-radio');
        if (radioBtn && isElementVisible(radioBtn, false)) topRow.push(radioBtn);

        var progEl = document.getElementById('spotlight-progress-container');
        var progress = (progEl && isElementVisible(progEl, false)) ? progEl : null;

        var deckIds = [
            'spotlight-loop-btn',
            'spotlight-expanded-prev',
            'spotlight-expanded-play-btn',
            'spotlight-expanded-next',
            'spotlight-mute-btn'
        ];
        var deck = [];
        for (var i = 0; i < deckIds.length; i++) {
            var dBtn = document.getElementById(deckIds[i]);
            if (dBtn && isElementVisible(dBtn, false)) deck.push(dBtn);
        }

        var playlist = [];
        var listContainer = document.getElementById('spotlight-expanded-list');
        if (listContainer) {
            var rows = listContainer.children;
            for (var j = 0; j < rows.length; j++) {
                if (isElementVisible(rows[j], false)) {
                    playlist.push(rows[j]);
                }
            }
        }

        return {
            topRow: topRow,
            progress: progress,
            deck: deck,
            playlist: playlist
        };
    }

    // ─── Recipe Modal (#recipe-modal) Zone Collectors ────────────────────────
    function getRecipeModalZones() {
        prepareRecipeModalTargets();
        var rm = document.getElementById('recipe-modal');
        if (!rm) {
            return { closeBtn: null, tabs: [], activeTab: 'ing', servingsBtns: [], ingCards: [], prepItems: [], readCards: [] };
        }

        var closeEl = rm.querySelector('button.pc-close-btn');
        var closeBtn = (closeEl && isElementVisible(closeEl, false)) ? closeEl : null;

        var tabIds = ['rtab-ing', 'rtab-prep', 'rtab-tech', 'rtab-secret'];
        var tabs = [];
        for (var i = 0; i < tabIds.length; i++) {
            var tEl = document.getElementById(tabIds[i]);
            if (tEl && isElementVisible(tEl, false)) {
                tabs.push(tEl);
            }
        }

        var activeTab = getActiveRecipeTabId();
        var servingsBtns = [];
        var ingCards = [];
        var prepItems = [];
        var readCards = [];

        if (activeTab === 'ing') {
            var paneIng = document.getElementById('rpane-ing');
            if (paneIng) {
                var rawServ = paneIng.querySelectorAll('button[onclick*="changeServings"]');
                for (var s = 0; s < rawServ.length; s++) {
                    if (isElementVisible(rawServ[s], false)) servingsBtns.push(rawServ[s]);
                }
                var rawIng = paneIng.querySelectorAll('#ing-grid > .ing-card');
                for (var c = 0; c < rawIng.length; c++) {
                    if (isElementVisible(rawIng[c], false)) ingCards.push(rawIng[c]);
                }
            }
        } else if (activeTab === 'prep') {
            var panePrep = document.getElementById('rpane-prep');
            if (panePrep) {
                var rawPrep = panePrep.querySelectorAll('button[onclick*="startStepTimer"], button[onclick*="toggleTip"], label[onclick*="markStepDone"]');
                for (var p = 0; p < rawPrep.length; p++) {
                    if (isElementVisible(rawPrep[p], false)) prepItems.push(rawPrep[p]);
                }
            }
        } else if (activeTab === 'tech' || activeTab === 'secret') {
            var paneRead = document.getElementById('rpane-' + activeTab);
            if (paneRead) {
                var rawRead = paneRead.querySelectorAll('[data-gp-rcp-card="true"]');
                for (var r = 0; r < rawRead.length; r++) {
                    if (isElementVisible(rawRead[r], false)) readCards.push(rawRead[r]);
                }
            }
        }

        return {
            closeBtn: closeBtn,
            tabs: tabs,
            activeTab: activeTab,
            servingsBtns: servingsBtns,
            ingCards: ingCards,
            prepItems: prepItems,
            readCards: readCards
        };
    }

    function getFocusableCandidates() {
        var root = getActiveScopeRoot();

        if (root && root.id === 'recipe-modal') {
            var rz = getRecipeModalZones();
            return [].concat(
                rz.closeBtn ? [rz.closeBtn] : [],
                rz.tabs,
                rz.servingsBtns,
                rz.ingCards,
                rz.prepItems,
                rz.readCards
            );
        }

        if (root && root.id === 'credits-modal') {
            return [];
        }

        if (root && root.id === 'auth-menu') {
            return getAuthMenuZones().items;
        }

        if (root && (root.id === 'vc-panel' || root.id === 'vc-detailed-history')) {
            return getVoiceModalZones().allCandidates;
        }

        if (root && root.id === 'spotlight-expanded') {
            var sz = getSpotlightExpandedZones();
            return [].concat(sz.topRow, sz.progress ? [sz.progress] : [], sz.deck, sz.playlist);
        }

        if (root && root.id === 'menu-panel') {
            var dz = getDashboardZones();
            return [].concat(dz.header, dz.search ? [dz.search] : [], dz.links, dz.miniPlayer);
        }

        var isMainBody = (root === document.body);
        var selectors = [
            'button:not([disabled])',
            'a[href]',
            'input:not([type="hidden"]):not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[role="button"]',
            '[onclick]',
            '.name-letter',
            '#draggable-sun',
            '#sunflower-widget',
            '#memory-board > div',
            '#g4-options button',
            '.paleta-swatch-card',
            '.music-track-row',
            '#cs6-hold-btn',
            '#yt-facade',
            '#tu-cancion .grid > div',
            '#enigma-28 .grid > div',
            '.pc-card',
            '#paleta-modal-hex-chip',
            '#paleta-modal .pc-close-btn',
            '#gb-msg',
            '#gb-login-btn',
            '#guestbook-form button[type="submit"]',
            '#guestbook-wall button',
            '.galeria-card',
            '.gp-lightbox-close',
            '.gp-lightbox-prev',
            '.gp-lightbox-next',
            '#cs6-oath .oath-close-btn',
            '#cs9-signing-box button',
            '#cs9-signed-seal button',
            '#cs9-oath-input'
        ].join(', ');

        var raw = root.querySelectorAll(selectors);
        var list = [];
        for (var i = 0; i < raw.length; i++) {
            var el = raw[i];
            if (el.id === 'gp-toast' || el.id === 'gp-hud' || el.closest('#gp-vkbd')) continue;
            if (isMainBody && el.closest('#menu-panel')) continue;
            if (isMainBody && el.closest('#epidemic-nav') && window.scrollY > 140) continue;
            if (el.id === 'sunflower-widget' && document.getElementById('draggable-sun')) continue;
            if (isElementVisible(el, isMainBody)) {
                list.push(el);
            }
        }
        return list;
    }

    // ─── Special Activation for Y-A-I-R-E Letters ────────────────────────────
    function updateYaireLetterEffect(prevEl, nextEl) {
        var prevIsLetter = prevEl && prevEl.classList && prevEl.classList.contains('name-letter');
        var nextIsLetter = nextEl && nextEl.classList && nextEl.classList.contains('name-letter');

        if (prevIsLetter && !nextIsLetter) {
            var oldContainer = prevEl.closest('.name-container');
            if (oldContainer) {
                oldContainer.classList.remove('has-active');
                oldContainer.querySelectorAll('.name-letter').forEach(function (l) {
                    l.classList.remove('is-active');
                });
            }
        }

        if (nextIsLetter) {
            var container = nextEl.closest('.name-container');
            if (container) {
                container.classList.add('has-active');
                container.querySelectorAll('.name-letter').forEach(function (l) {
                    l.classList.remove('is-active');
                });
            }
            nextEl.classList.add('is-active');
            if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
                try { window.AudioManager.play('hover.wav', 0.22); } catch (e) {}
            }
        }
    }

    function setFocusedElement(el, shouldScroll) {
        var prevEl = state.focusedEl;
        if (prevEl && prevEl !== el) {
            prevEl.classList.remove('gp-focus');
            prevEl.classList.remove('gp-focus-press');
        }
        state.focusedEl = el;
        updateYaireLetterEffect(prevEl, el);

        if (!el) {
            lockMenuPanelScroll();
            updateHUD();
            return;
        }

        // Track playlist index inside #spotlight-expanded-list so async artwork re-renders preserve focus
        if (el.parentElement && el.parentElement.id === 'spotlight-expanded-list') {
            var siblings = Array.prototype.slice.call(el.parentElement.children);
            var sIdx = siblings.indexOf(el);
            if (sIdx !== -1) state.lastSpotPlaylistIdx = sIdx;
        }

        revealAncestorsIfNeeded(el);
        if (state.activeMode) {
            el.classList.add('gp-focus');
        }

        if (el.id === 'menu-search' && !state.vkbdOpen && document.activeElement === el) {
            el.blur();
        }

        if (el.closest('#menu-panel')) {
            // NEVER call el.scrollIntoView() inside #menu-panel (prevents outer aside scroll shift!)
            lockMenuPanelScroll();
            if (shouldScroll !== false) {
                var menuLinksBox = document.getElementById('menu-links');
                var spotListBox = document.getElementById('spotlight-expanded-list');
                if (menuLinksBox && menuLinksBox.contains(el)) {
                    scrollElementIntoContainer(menuLinksBox, el, 22);
                } else if (spotListBox && spotListBox.contains(el)) {
                    scrollElementIntoContainer(spotListBox, el, 14);
                }
            }
            lockMenuPanelScroll();
        } else if (el.closest('#recipe-modal')) {
            // Scroll only #recipe-scroll-area inside #recipe-modal (never the page body)
            if (shouldScroll !== false) {
                var rScroll = document.getElementById('recipe-scroll-area');
                if (rScroll && rScroll.contains(el)) {
                    var stepCard = el.closest('.step-card-new');
                    if (stepCard && el.id && el.id.indexOf('tb') === 0) {
                        scrollElementIntoContainer(rScroll, stepCard, 18);
                    } else {
                        scrollElementIntoContainer(rScroll, el, 28);
                    }
                }
            }
        } else if (el.closest('#paleta-modal')) {
            if (shouldScroll !== false) {
                var pScroll = document.querySelector('#paleta-modal .paleta-modal-right');
                if (pScroll && pScroll.contains(el)) {
                    scrollElementIntoContainer(pScroll, el, 20);
                }
            }
        } else if (el.closest('#cs6-oath')) {
            if (shouldScroll !== false) {
                var oScroll = document.getElementById('cs6-oath-card');
                if (oScroll && oScroll.contains(el)) {
                    scrollElementIntoContainer(oScroll, el, 20);
                }
            }
        } else if (el.closest('#credits-modal')) {
            if (shouldScroll !== false) {
                var cScroll = document.querySelector('#credits-content .custom-credits-scroll');
                if (cScroll && cScroll.contains(el)) {
                    scrollElementIntoContainer(cScroll, el, 24);
                }
            }
        } else if (el.closest('#vc-panel')) {
            if (shouldScroll !== false) {
                var vScroll = el.closest('.vc-scroll') || el.closest('.overflow-y-auto') || el.closest('.vc-lobby-container');
                if (vScroll) {
                    scrollElementIntoContainer(vScroll, el, 20);
                }
            }
        } else if (el.closest('#vc-detailed-history')) {
            if (shouldScroll !== false) {
                var dScroll = el.closest('.vc-det-list');
                if (dScroll) {
                    scrollElementIntoContainer(dScroll, el, 16);
                }
            }
        } else if (shouldScroll !== false) {
            try {
                var rect = el.getBoundingClientRect();
                var inViewVert = rect.top >= 100 && rect.bottom <= (window.innerHeight - 100);
                var inHorizontalCarousel = Boolean(el.closest('#games-carousel'));
                if (!inViewVert || inHorizontalCarousel) {
                    el.scrollIntoView({ behavior: 'smooth', block: inHorizontalCarousel ? 'nearest' : 'center', inline: 'center' });
                }
            } catch (e) {}
        }
        updateHUD();
    }

    function ensureValidFocus() {
        if (isArcadeGame2Playing() || isArcadeGame1Playing()) {
            if (state.focusedEl) {
                state.focusedEl.classList.remove('gp-focus');
                state.focusedEl = null;
            }
            return null;
        }

        var root = getActiveScopeRoot();

        // Handle #gp-lightbox-modal default focus
        if (state.galleryLightboxOpen || (root && root.id === 'gp-lightbox-modal')) {
            var lb = document.getElementById('gp-lightbox-modal');
            if (lb) {
                if (state.focusedEl && lb.contains(state.focusedEl) && isElementVisible(state.focusedEl, false)) {
                    return state.focusedEl;
                }
                var lbClose = lb.querySelector('.gp-lightbox-close') || lb.querySelector('.gp-lightbox-next');
                if (lbClose) {
                    setFocusedElement(lbClose, false);
                    return lbClose;
                }
            }
        }

        // Handle #paleta-modal default focus
        if (root && root.id === 'paleta-modal') {
            if (state.focusedEl && document.body.contains(state.focusedEl) && root.contains(state.focusedEl) && isElementVisible(state.focusedEl, false)) {
                return state.focusedEl;
            }
            var palTarget = document.getElementById('paleta-modal-hex-chip') || root.querySelector('.pc-close-btn');
            if (palTarget) {
                setFocusedElement(palTarget, false);
                return palTarget;
            }
        }

        // Handle #cs6-oath default focus
        if (root && root.id === 'cs6-oath') {
            if (state.focusedEl && document.body.contains(state.focusedEl) && root.contains(state.focusedEl) && isElementVisible(state.focusedEl, false)) {
                return state.focusedEl;
            }
            var oathTarget = document.getElementById('cs9-oath-input') || root.querySelector('.oath-close-btn') || root.querySelector('button');
            if (oathTarget) {
                setFocusedElement(oathTarget, false);
                return oathTarget;
            }
        }

        // Handle #recipe-modal default focus
        if (root && root.id === 'recipe-modal') {
            if (state.focusedEl && document.body.contains(state.focusedEl) && root.contains(state.focusedEl) && isElementVisible(state.focusedEl, false)) {
                return state.focusedEl;
            }
            var rz = getRecipeModalZones();
            var defaultRecipeTarget = rz.ingCards[0] || rz.prepItems[0] || rz.readCards[0] || rz.tabs[0] || rz.closeBtn;
            if (defaultRecipeTarget) {
                setFocusedElement(defaultRecipeTarget, true);
                return defaultRecipeTarget;
            }
            return null;
        }

        // Handle #credits-modal default focus: keep clean with no selection borders
        if (root && root.id === 'credits-modal') {
            if (state.focusedEl) {
                removeFocusRing(state.focusedEl);
                state.focusedEl = null;
            }
            return null;
        }

        // Handle detached playlist item in #spotlight-expanded-list after renderSpotlightPlaylist()
        if (root && root.id === 'spotlight-expanded') {
            if (state.focusedEl && document.body.contains(state.focusedEl) && root.contains(state.focusedEl) && isElementVisible(state.focusedEl, false)) {
                return state.focusedEl;
            }
            var sz = getSpotlightExpandedZones();
            if (sz.playlist.length > 0 && state.lastSpotPlaylistIdx >= 0 && state.focusedEl && !document.body.contains(state.focusedEl)) {
                var restoredIdx = Math.min(sz.playlist.length - 1, state.lastSpotPlaylistIdx);
                setFocusedElement(sz.playlist[restoredIdx], false);
                return sz.playlist[restoredIdx];
            }
            var defaultSpotTarget = document.getElementById('spotlight-expanded-play-btn') || sz.deck[0] || sz.topRow[0] || sz.playlist[0];
            if (defaultSpotTarget) {
                setFocusedElement(defaultSpotTarget, false);
                return defaultSpotTarget;
            }
            return null;
        }

        // Handle #menu-panel default focus
        if (root && root.id === 'menu-panel') {
            lockMenuPanelScroll();
            if (state.focusedEl && document.body.contains(state.focusedEl) && root.contains(state.focusedEl) && isElementVisible(state.focusedEl, false)) {
                return state.focusedEl;
            }
            var dz = getDashboardZones();
            var defaultMenuTarget = dz.links[0] || dz.search || dz.header[0] || dz.miniPlayer[0];
            if (defaultMenuTarget) {
                setFocusedElement(defaultMenuTarget, true);
                return defaultMenuTarget;
            }
            return null;
        }

        // Handle #auth-menu default focus
        if (root && root.id === 'auth-menu') {
            if (state.focusedEl && document.body.contains(state.focusedEl) && root.contains(state.focusedEl) && isElementVisible(state.focusedEl, false)) {
                return state.focusedEl;
            }
            var az = getAuthMenuZones();
            if (az.items.length > 0) {
                setFocusedElement(az.items[0], false);
                return az.items[0];
            }
            return null;
        }

        // Handle #vc-detailed-history default focus
        if (root && root.id === 'vc-detailed-history') {
            if (state.focusedEl && document.body.contains(state.focusedEl) && root.contains(state.focusedEl) && isElementVisible(state.focusedEl, false)) {
                return state.focusedEl;
            }
            var detClose = root.querySelector('#vc-det-close');
            var detRow = root.querySelector('.vc-det-row');
            var detTarget = detClose || detRow;
            if (detTarget) {
                setFocusedElement(detTarget, false);
                return detTarget;
            }
            return null;
        }

        // Handle #vc-panel default focus
        if (root && root.id === 'vc-panel') {
            if (state.focusedEl && document.body.contains(state.focusedEl) && root.contains(state.focusedEl) && isElementVisible(state.focusedEl, false)) {
                return state.focusedEl;
            }
            var vz = getVoiceModalZones();
            var defVoiceTarget = vz.joinBtn || vz.closeBtn || vz.logoutBtn || vz.allCandidates[0];
            if (defVoiceTarget) {
                setFocusedElement(defVoiceTarget, false);
                return defVoiceTarget;
            }
            return null;
        }

        if (state.focusedEl && document.body.contains(state.focusedEl) && isElementVisible(state.focusedEl, true)) {
            if (root.contains(state.focusedEl)) {
                if (state.activeMode && !state.focusedEl.classList.contains('gp-focus')) {
                    state.focusedEl.classList.add('gp-focus');
                }
                if (root !== document.body) return state.focusedEl;
                var fRect = state.focusedEl.getBoundingClientRect();
                if (fRect.bottom >= -120 && fRect.top <= window.innerHeight + 120) {
                    return state.focusedEl;
                }
            }
        }
        var candidates = getFocusableCandidates();
        if (!candidates.length) return null;

        var best = null;
        var bestDist = Infinity;
        var cx = window.innerWidth / 2;
        var cy = window.innerHeight / 2;

        for (var i = 0; i < candidates.length; i++) {
            var r = candidates[i].getBoundingClientRect();
            var ex = r.left + r.width / 2;
            var ey = r.top + r.height / 2;
            var inViewportPenalty = (r.bottom < 0 || r.top > window.innerHeight) ? 2000 : 0;
            var dist = Math.hypot(ex - cx, ey - cy) + inViewportPenalty;
            if (dist < bestDist) {
                bestDist = dist;
                best = candidates[i];
            }
        }
        if (best) setFocusedElement(best, false);
        return best;
    }

    // ─── Deterministic Dashboard (#menu-panel) Navigation ────────────────────
    function moveDashboardFocus(dx, dy) {
        lockMenuPanelScroll();
        var dz = getDashboardZones();
        var cur = ensureValidFocus();
        if (!cur) return;

        var mLinksContainer = document.getElementById('menu-links');
        var headerIdx = dz.header.indexOf(cur);
        var isSearch = (cur === dz.search);
        var linkIdx = dz.links.indexOf(cur);
        var mpIdx = dz.miniPlayer.indexOf(cur);

        var nextEl = null;

        // Zone 0: Top Header Row ([28E, Install, Sound, Close X])
        if (headerIdx !== -1) {
            if (Math.abs(dx) > Math.abs(dy)) {
                var nextH = Math.max(0, Math.min(dz.header.length - 1, headerIdx + (dx > 0 ? 1 : -1)));
                nextEl = dz.header[nextH];
            } else if (dy > 0) {
                nextEl = dz.search || dz.links[0] || dz.miniPlayer[0];
            }
        }
        // Zone 1: Search Input (#menu-search)
        else if (isSearch) {
            if (dy < 0) {
                nextEl = dz.header[dz.header.length - 1] || dz.header[0];
            } else if (dy > 0) {
                if (dz.links.length > 0) {
                    if (mLinksContainer) mLinksContainer.scrollTop = 0;
                    nextEl = dz.links[0];
                } else if (dz.miniPlayer.length > 0) {
                    nextEl = dz.miniPlayer[0];
                }
            } else if (dx > 0 && dz.header.length > 0) {
                nextEl = dz.header[dz.header.length - 1];
            } else if (dx < 0 && dz.header.length > 0) {
                nextEl = dz.header[0];
            }
        }
        // Zone 2: Scrollable Menu Links (#menu-links)
        else if (linkIdx !== -1) {
            if (dy < 0) {
                if (linkIdx > 0) {
                    nextEl = dz.links[linkIdx - 1];
                    if (linkIdx - 1 === 0 && mLinksContainer) {
                        mLinksContainer.scrollTop = 0;
                    }
                } else {
                    if (mLinksContainer) mLinksContainer.scrollTop = 0;
                    nextEl = dz.search || dz.header[0];
                }
            } else if (dy > 0) {
                if (linkIdx < dz.links.length - 1) {
                    nextEl = dz.links[linkIdx + 1];
                    if (linkIdx + 1 === dz.links.length - 1 && mLinksContainer) {
                        mLinksContainer.scrollTop = mLinksContainer.scrollHeight;
                    }
                } else if (dz.miniPlayer.length > 0) {
                    nextEl = dz.miniPlayer[0];
                }
            }
        }
        // Zone 3: Bottom Docked Mini-Player ([Track Info "Loko", Play/Pause, Next])
        else if (mpIdx !== -1) {
            if (Math.abs(dx) > Math.abs(dy)) {
                var nextMp = Math.max(0, Math.min(dz.miniPlayer.length - 1, mpIdx + (dx > 0 ? 1 : -1)));
                nextEl = dz.miniPlayer[nextMp];
            } else if (dy < 0) {
                if (dz.links.length > 0) {
                    nextEl = dz.links[dz.links.length - 1];
                    if (mLinksContainer) {
                        mLinksContainer.scrollTop = mLinksContainer.scrollHeight;
                    }
                } else {
                    nextEl = dz.search || dz.header[0];
                }
            }
        } else {
            nextEl = dz.links[0] || dz.search || dz.header[0];
        }

        if (nextEl && nextEl !== cur) {
            setFocusedElement(nextEl, true);
            pulseHaptic(20, 0.16, 0.04);
            if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
                try { window.AudioManager.play('navegacion.wav', 0.45); } catch (e) {}
            }
        }
        lockMenuPanelScroll();
    }

    // ─── Deterministic Spotlight Expanded (#spotlight-expanded) Navigation ───
    function moveSpotlightExpandedFocus(dx, dy) {
        lockMenuPanelScroll();
        var sz = getSpotlightExpandedZones();
        var cur = ensureValidFocus();
        if (!cur) return;

        var topIdx = sz.topRow.indexOf(cur);
        var isProg = (cur === sz.progress);
        var deckIdx = sz.deck.indexOf(cur);
        var playIdx = sz.playlist.indexOf(cur);

        var nextEl = null;

        // Row 0: Top Header ([Collapse, Música, Radio])
        if (topIdx !== -1) {
            if (Math.abs(dx) > Math.abs(dy)) {
                var nextT = Math.max(0, Math.min(sz.topRow.length - 1, topIdx + (dx > 0 ? 1 : -1)));
                nextEl = sz.topRow[nextT];
            } else if (dy > 0) {
                nextEl = sz.progress || document.getElementById('spotlight-expanded-play-btn') || sz.deck[0] || sz.playlist[0];
            }
        }
        // Row 1: Scrubber Progress Bar (#spotlight-progress-container)
        else if (isProg) {
            if (Math.abs(dx) > Math.abs(dy)) {
                if (window.spotAudio && window.spotAudio.duration) {
                    window.spotAudio.currentTime = Math.max(0, Math.min(window.spotAudio.duration, (window.spotAudio.currentTime || 0) + dx * 5));
                    if (typeof window.spotlightUpdateProgress === 'function') {
                        try { window.spotlightUpdateProgress(); } catch (e) {}
                    }
                    pulseHaptic(18, 0.16, 0.05);
                }
                return;
            } else if (dy < 0) {
                nextEl = sz.topRow[0];
            } else if (dy > 0) {
                nextEl = document.getElementById('spotlight-expanded-play-btn') || sz.deck[0] || sz.playlist[0];
            }
        }
        // Row 2: 5-Button Control Deck ([Loop, Prev, Play/Pause, Next, Mute])
        else if (deckIdx !== -1) {
            if (Math.abs(dx) > Math.abs(dy)) {
                var nextD = Math.max(0, Math.min(sz.deck.length - 1, deckIdx + (dx > 0 ? 1 : -1)));
                nextEl = sz.deck[nextD];
            } else if (dy < 0) {
                nextEl = sz.progress || sz.topRow[0];
            } else if (dy > 0 && sz.playlist.length > 0) {
                var targetPIdx = Math.min(sz.playlist.length - 1, Math.max(0, state.lastSpotPlaylistIdx || 0));
                nextEl = sz.playlist[targetPIdx];
            }
        }
        // Row 3: Scrollable Song Playlist (#spotlight-expanded-list > div)
        else if (playIdx !== -1) {
            if (dy < 0) {
                if (playIdx > 0) {
                    nextEl = sz.playlist[playIdx - 1];
                } else {
                    var listEl = document.getElementById('spotlight-expanded-list');
                    if (listEl) listEl.scrollTo({ top: 0, behavior: 'smooth' });
                    nextEl = document.getElementById('spotlight-expanded-play-btn') || sz.deck[0] || sz.progress || sz.topRow[0];
                }
            } else if (dy > 0) {
                if (playIdx < sz.playlist.length - 1) {
                    nextEl = sz.playlist[playIdx + 1];
                }
            }
        } else {
            nextEl = document.getElementById('spotlight-expanded-play-btn') || sz.deck[0] || sz.topRow[0];
        }

        if (nextEl && nextEl !== cur) {
            setFocusedElement(nextEl, true);
            pulseHaptic(20, 0.16, 0.04);
        }
        lockMenuPanelScroll();
    }

    // ─── Deterministic Recipe Modal (#recipe-modal) Navigation ───────────────
    function moveRecipeModalFocus(dx, dy) {
        var rz = getRecipeModalZones();
        var cur = ensureValidFocus();
        if (!cur) return;

        var rScroll = document.getElementById('recipe-scroll-area');
        var tabKeys = ['ing', 'prep', 'tech', 'secret'];
        var activeTabIdx = Math.max(0, tabKeys.indexOf(rz.activeTab));
        var activeTabBtn = rz.tabs[activeTabIdx] || rz.tabs[0];

        var isClose = (cur === rz.closeBtn);
        var tabIdx = rz.tabs.indexOf(cur);
        var servIdx = rz.servingsBtns.indexOf(cur);
        var ingIdx = rz.ingCards.indexOf(cur);
        var prepIdx = rz.prepItems.indexOf(cur);
        var cardIdx = rz.readCards.indexOf(cur);

        var nextEl = null;

        // Zone 0: Close Button (X)
        if (isClose) {
            if (dy > 0 || dx < 0) {
                nextEl = activeTabBtn || rz.ingCards[0] || rz.prepItems[0] || rz.readCards[0];
            }
        }
        // Zone 1: 4-Tab Bar ([Ingredientes, Paso a Paso, Técnica, El Secreto])
        else if (tabIdx !== -1) {
            if (Math.abs(dx) > Math.abs(dy)) {
                var nextT = Math.max(0, Math.min(rz.tabs.length - 1, tabIdx + (dx > 0 ? 1 : -1)));
                if (nextT !== tabIdx && rz.tabs[nextT]) {
                    if (typeof window.switchRecipeTabNew === 'function') {
                        window.switchRecipeTabNew(tabKeys[nextT], rz.tabs[nextT], true);
                    } else {
                        rz.tabs[nextT].click();
                    }
                    if (rScroll) rScroll.scrollTop = 0;
                    nextEl = rz.tabs[nextT];
                }
            } else if (dy < 0) {
                nextEl = rz.closeBtn;
            } else if (dy > 0) {
                if (rz.activeTab === 'ing') {
                    nextEl = rz.servingsBtns[1] || rz.servingsBtns[0] || rz.ingCards[0];
                } else if (rz.activeTab === 'prep') {
                    nextEl = rz.prepItems[0];
                } else {
                    nextEl = rz.readCards[0];
                }
            }
        }
        // Zone 2A: Ingredientes Tab — Porciones [- , +]
        else if (servIdx !== -1) {
            if (Math.abs(dx) > Math.abs(dy)) {
                var nextS = Math.max(0, Math.min(rz.servingsBtns.length - 1, servIdx + (dx > 0 ? 1 : -1)));
                nextEl = rz.servingsBtns[nextS];
            } else if (dy < 0) {
                if (rScroll) rScroll.scrollTop = 0;
                nextEl = activeTabBtn || rz.closeBtn;
            } else if (dy > 0) {
                nextEl = rz.ingCards[0];
            }
        }
        // Zone 2B: Ingredientes Tab — 9 Ingredient Cards Grid (#ing-grid > .ing-card)
        else if (ingIdx !== -1) {
            var cols = window.innerWidth >= 640 ? 3 : 2;
            if (Math.abs(dx) > Math.abs(dy)) {
                var nextI = Math.max(0, Math.min(rz.ingCards.length - 1, ingIdx + (dx > 0 ? 1 : -1)));
                nextEl = rz.ingCards[nextI];
            } else if (dy < 0) {
                if (ingIdx - cols >= 0) {
                    nextEl = rz.ingCards[ingIdx - cols];
                } else {
                    if (rScroll) rScroll.scrollTop = 0;
                    nextEl = rz.servingsBtns[1] || rz.servingsBtns[0] || activeTabBtn;
                }
            } else if (dy > 0) {
                if (ingIdx + cols < rz.ingCards.length) {
                    nextEl = rz.ingCards[ingIdx + cols];
                    if (ingIdx + cols >= rz.ingCards.length - cols && rScroll) {
                        rScroll.scrollTop = rScroll.scrollHeight;
                    }
                } else if (rScroll) {
                    rScroll.scrollTop = rScroll.scrollHeight;
                }
            }
        }
        // Zone 2C: Paso a Paso Tab — Step Controls (Timer, Chef Tip, Mark Step Done)
        else if (prepIdx !== -1) {
            if (dy < 0) {
                if (prepIdx > 0) {
                    nextEl = rz.prepItems[prepIdx - 1];
                    if (prepIdx - 1 === 0 && rScroll) rScroll.scrollTop = 0;
                } else {
                    if (rScroll) rScroll.scrollTop = 0;
                    nextEl = activeTabBtn || rz.closeBtn;
                }
            } else if (dy > 0) {
                if (prepIdx < rz.prepItems.length - 1) {
                    nextEl = rz.prepItems[prepIdx + 1];
                    if (prepIdx + 1 === rz.prepItems.length - 1 && rScroll) {
                        rScroll.scrollTop = rScroll.scrollHeight;
                    }
                }
            } else if (Math.abs(dx) > Math.abs(dy)) {
                var stepIdx = Math.floor(prepIdx / 3);
                var nextStep = Math.max(0, Math.min(Math.floor((rz.prepItems.length - 1) / 3), stepIdx + (dx > 0 ? 1 : -1)));
                if (nextStep !== stepIdx) {
                    nextEl = rz.prepItems[nextStep * 3];
                }
            }
        }
        // Zone 2D: Técnica & El Secreto Tabs — Reading Cards
        else if (cardIdx !== -1) {
            if (dy < 0 || dx < 0) {
                if (cardIdx > 0) {
                    nextEl = rz.readCards[cardIdx - 1];
                    if (cardIdx - 1 === 0 && rScroll) rScroll.scrollTop = 0;
                } else if (dy < 0) {
                    if (rScroll) rScroll.scrollTop = 0;
                    nextEl = activeTabBtn || rz.closeBtn;
                }
            } else if (dy > 0 || dx > 0) {
                if (cardIdx < rz.readCards.length - 1) {
                    nextEl = rz.readCards[cardIdx + 1];
                    if (cardIdx + 1 === rz.readCards.length - 1 && rScroll) {
                        rScroll.scrollTop = rScroll.scrollHeight;
                    }
                }
            }
        } else {
            nextEl = rz.ingCards[0] || rz.prepItems[0] || rz.readCards[0] || activeTabBtn;
        }

        if (nextEl && nextEl !== cur) {
            setFocusedElement(nextEl, true);
            pulseHaptic(20, 0.16, 0.04);
            if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
                try { window.AudioManager.play('navegacion.wav', 0.45); } catch (e) {}
            }
        }
    }

    // ─── 2D Spatial Navigation Raycaster (With Anti-Multi-Section Jump Guard) ─
    function moveSpatialFocus(dx, dy) {
        var root = getActiveScopeRoot();

        if (root && root.id === 'recipe-modal') {
            moveRecipeModalFocus(dx, dy);
            return;
        }

        if (root && root.id === 'credits-modal') {
            moveCreditsModalFocus(dx, dy);
            return;
        }

        if (root && root.id === 'spotlight-expanded') {
            moveSpotlightExpandedFocus(dx, dy);
            return;
        }

        if (root && root.id === 'menu-panel') {
            moveDashboardFocus(dx, dy);
            return;
        }

        if (root && root.id === 'auth-menu') {
            moveAuthMenuFocus(dx, dy);
            return;
        }

        if (root && root.id === 'vc-detailed-history') {
            moveVoiceHistoryFocus(dx, dy);
            return;
        }

        if (root && root.id === 'vc-panel') {
            moveVoiceModalFocus(dx, dy);
            return;
        }

        var isMainBody = (root === document.body);
        var current = ensureValidFocus();
        var candidates = getFocusableCandidates();
        if (!candidates.length) return;
        if (!current) {
            setFocusedElement(candidates[0], true);
            pulseHaptic(22, 0.16, 0.04);
            return;
        }

        // Special case: Sunflower Widget Horizontal Scrubbing with Left/Right
        if ((current.id === 'draggable-sun' || current.id === 'sunflower-widget') && Math.abs(dx) > Math.abs(dy)) {
            scrubSunflowerByDelta(dx * 14);
            return;
        }

        // Special case: Y-A-I-R-E letters horizontal stepping
        if (current.classList && current.classList.contains('name-letter') && Math.abs(dx) > Math.abs(dy)) {
            var container = current.closest('.name-container');
            if (container) {
                var letters = Array.prototype.slice.call(container.querySelectorAll('.name-letter'));
                var idx = letters.indexOf(current);
                if (idx !== -1) {
                    var nextIdx = Math.max(0, Math.min(letters.length - 1, idx + (dx > 0 ? 1 : -1)));
                    if (nextIdx !== idx) {
                        setFocusedElement(letters[nextIdx], false);
                        pulseHaptic(24, 0.22, 0.08);
                    }
                    return;
                }
            }
        }

        // Special case: Games Carousel horizontal stepping
        if (current.closest('#games-carousel') && Math.abs(dx) > Math.abs(dy)) {
            var gCarousel = document.getElementById('games-carousel');
            var gCards = Array.prototype.slice.call(gCarousel.querySelectorAll('.ghub-card-v3'));
            var cIdx = gCards.indexOf(current.closest('.ghub-card-v3'));
            if (cIdx !== -1) {
                var nextCIdx = Math.max(0, Math.min(gCards.length - 1, cIdx + (dx > 0 ? 1 : -1)));
                if (nextCIdx !== cIdx) {
                    setFocusedElement(gCards[nextCIdx], true);
                    pulseHaptic(24, 0.20, 0.06);
                }
                return;
            }
        }

        var curRect = current.getBoundingClientRect();

        // If current element was scrolled far off-screen by manual Right Stick scrolling,
        // pick up focus from the best candidate currently visible in the viewport
        var isRecentRightStickScroll = state.rightStickScrolled && (performance.now() - state.lastRightStickScrollTime < 1200);
        if (isMainBody && isRecentRightStickScroll && (curRect.bottom < -40 || curRect.top > window.innerHeight + 40)) {
            state.rightStickScrolled = false;
            var inViewCands = [];
            var vMid = window.innerHeight / 2;
            for (var cIdx = 0; cIdx < candidates.length; cIdx++) {
                var cEl = candidates[cIdx];
                var cr = cEl.getBoundingClientRect();
                if (cr.top >= 40 && cr.bottom <= window.innerHeight - 40 && cr.left < window.innerWidth && cr.right > 0) {
                    inViewCands.push({ el: cEl, dist: Math.abs((cr.top + cr.height / 2) - vMid) });
                }
            }
            if (inViewCands.length > 0) {
                inViewCands.sort(function (a, b) { return a.dist - b.dist; });
                current = inViewCands[0].el;
                curRect = current.getBoundingClientRect();
            }
        }

        var curX = curRect.left + curRect.width / 2;
        var curY = curRect.top + curRect.height / 2;

        var isVerticalMove = Math.abs(dy) > Math.abs(dx);
        var isHorizontalMove = Math.abs(dx) > Math.abs(dy);

        var maxVerticalJump = isMainBody ? Math.min(650, window.innerHeight * 0.75) : Infinity;
        var maxHorizontalJump = isMainBody ? Math.min(820, window.innerWidth * 0.85) : Infinity;

        var best = null;
        var bestScore = Infinity;
        var nextInDirection = null;
        var nextInDirDist = Infinity;

        for (var i = 0; i < candidates.length; i++) {
            var cand = candidates[i];
            if (cand === current) continue;
            if (current.contains(cand) || cand.contains(current)) continue;

            // Prevent jumping between sibling letters of YAIRE via 2D spatial search
            if (current.classList && current.classList.contains('name-letter') && cand.classList && cand.classList.contains('name-letter')) {
                continue;
            }
            // When entering YAIRE from outside, only offer the first letter Y as the entry candidate
            if ((!current.classList || !current.classList.contains('name-letter')) && cand.classList && cand.classList.contains('name-letter')) {
                var letterBox = cand.closest('.name-container');
                if (letterBox) {
                    var firstLetter = letterBox.querySelector('.name-letter');
                    if (cand !== firstLetter) continue;
                }
            }

            var r = cand.getBoundingClientRect();
            if (r.width <= 6 || r.height <= 6) continue;
            // Ignore off-screen horizontal elements (drawers, hidden modals off canvas)
            if (isMainBody && (r.right < 0 || r.left > window.innerWidth)) continue;

            var cx = r.left + r.width / 2;
            var cy = r.top + r.height / 2;

            var vx = cx - curX;
            var vy = cy - curY;

            // Strict Directional Separation
            if (isVerticalMove) {
                if (dy > 0) {
                    // Moving DOWN:
                    // Candidate top must not be higher than current top
                    if (r.top < curRect.top + 15) continue;
                    // Filter horizontal siblings on the same row:
                    // If candidate overlaps current vertically by more than 20px and is separated horizontally, it's a sibling, NOT below!
                    if (r.top < curRect.bottom - 20 && Math.abs(cx - curX) > 40) continue;
                    if (vy <= 6) continue;
                } else {
                    // Moving UP:
                    if (r.bottom > curRect.bottom - 15) continue;
                    if (r.bottom > curRect.top + 20 && Math.abs(cx - curX) > 40) continue;
                    if (vy >= -6) continue;
                }
            } else if (isHorizontalMove) {
                if (dx > 0) {
                    if (vx <= 6) continue;
                } else {
                    if (vx >= -6) continue;
                }
            }

            var primary = vx * dx + vy * dy;
            if (primary <= 4) continue;

            var perp = Math.abs(vx * dy - vy * dx);

            // Track closest valid candidate in requested vertical direction for section bridge
            if (isVerticalMove) {
                var bridgeDist = Math.abs(vy) + Math.abs(vx) * 0.35;
                if (bridgeDist < nextInDirDist) {
                    nextInDirDist = bridgeDist;
                    nextInDirection = cand;
                }
            }

            if (isVerticalMove) {
                if (primary > maxVerticalJump) continue;
            } else {
                if (primary > maxHorizontalJump || perp > 220) continue;
            }

            var perpWeight = isHorizontalMove ? 3.4 : 1.65;
            var score = primary + perp * perpWeight;

            if (score < bestScore) {
                bestScore = score;
                best = cand;
            }
        }

        // Section Bridge: If no element is within local jump radius, bridge directly to the next section candidate in that direction
        if (!best && nextInDirection && isVerticalMove && isMainBody) {
            best = nextInDirection;
        }

        if (best) {
            setFocusedElement(best, true);
            pulseHaptic(22, 0.16, 0.04);
        } else if (Math.abs(dy) > 0 && isMainBody) {
            var stepPx = Math.round(Math.min(380, window.innerHeight * 0.45)) * dy;
            window.scrollBy({ top: stepPx, behavior: 'smooth' });
            pulseHaptic(18, 0.1, 0.02);

            setTimeout(function () {
                var freshCandidates = getFocusableCandidates();
                var vMid = window.innerHeight / 2;
                var closestInView = null;
                var minDist = Infinity;
                for (var k = 0; k < freshCandidates.length; k++) {
                    var freshCand = freshCandidates[k];
                    // Skip if sibling in same name-container
                    if (current && current.classList && current.classList.contains('name-letter') && freshCand.classList && freshCand.classList.contains('name-letter')) {
                        continue;
                    }
                    var cr = freshCand.getBoundingClientRect();
                    // Direction filter: only look forward
                    if (dy > 0 && cr.top <= curRect.bottom) continue;
                    if (dy < 0 && cr.bottom >= curRect.top) continue;

                    if (cr.top >= 70 && cr.bottom <= window.innerHeight - 60) {
                        var d = Math.abs((cr.top + cr.height / 2) - vMid);
                        if (d < minDist) {
                            minDist = d;
                            closestInView = freshCand;
                        }
                    }
                }
                if (closestInView && closestInView !== state.focusedEl) {
                    setFocusedElement(closestInView, false);
                }
            }, 240);
        }
    }

    // ─── Section / Category Jumping (L1 / R1) ────────────────────────────────
    function jumpDashboardCategory(dir) {
        var mLinksContainer = document.getElementById('menu-links');
        if (!mLinksContainer) return;

        var catStarts = [];
        var groups = mLinksContainer.querySelectorAll('.menu-cat-group, #menu-vault-wrap');
        for (var i = 0; i < groups.length; i++) {
            var firstLink = groups[i].querySelector('.menu-link');
            if (firstLink && isElementVisible(firstLink, false)) {
                catStarts.push(firstLink);
            }
        }
        if (!catStarts.length) return;

        var dz = getDashboardZones();
        var cur = state.focusedEl;
        var curLinkIdx = dz.links.indexOf(cur);
        var currentCatIdx = 0;

        if (curLinkIdx !== -1) {
            for (var c = 0; c < catStarts.length; c++) {
                var startIdxInLinks = dz.links.indexOf(catStarts[c]);
                if (startIdxInLinks !== -1 && startIdxInLinks <= curLinkIdx) {
                    currentCatIdx = c;
                }
            }
        }

        var nextCatIdx = Math.max(0, Math.min(catStarts.length - 1, currentCatIdx + dir));
        var targetEl = catStarts[nextCatIdx];
        if (targetEl) {
            if (nextCatIdx === 0) {
                mLinksContainer.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (nextCatIdx === catStarts.length - 1) {
                mLinksContainer.scrollTo({ top: mLinksContainer.scrollHeight, behavior: 'smooth' });
            }
            setFocusedElement(targetEl, true);
            pulseHaptic(32, 0.26, 0.12);
        }
    }

    function jumpRecipeTab(dir) {
        var tabKeys = ['ing', 'prep', 'tech', 'secret'];
        var curTab = getActiveRecipeTabId();
        var curIdx = Math.max(0, tabKeys.indexOf(curTab));
        var nextIdx = Math.max(0, Math.min(tabKeys.length - 1, curIdx + dir));
        if (nextIdx === curIdx) return;

        var wasOnTabBar = Boolean(state.focusedEl && state.focusedEl.classList && state.focusedEl.classList.contains('recipe-tab-new'));
        var nextKey = tabKeys[nextIdx];
        var nextBtn = document.getElementById('rtab-' + nextKey);
        if (nextBtn) {
            if (typeof window.switchRecipeTabNew === 'function') {
                window.switchRecipeTabNew(nextKey, nextBtn, true);
            } else {
                nextBtn.click();
            }
        }
        var rScroll = document.getElementById('recipe-scroll-area');
        if (rScroll) rScroll.scrollTop = 0;

        var rz = getRecipeModalZones();
        var targetEl = null;
        if (wasOnTabBar) {
            targetEl = nextBtn;
        } else if (nextKey === 'ing') {
            targetEl = rz.ingCards[0] || rz.servingsBtns[1] || nextBtn;
        } else if (nextKey === 'prep') {
            targetEl = rz.prepItems[0] || nextBtn;
        } else {
            targetEl = rz.readCards[0] || nextBtn;
        }
        if (targetEl) {
            setFocusedElement(targetEl, false);
        }
        pulseHaptic(32, 0.26, 0.12);
    }

    function jumpSection(dir) {
        var root = getActiveScopeRoot();
        if (root && root.id === 'recipe-modal') {
            jumpRecipeTab(dir);
            return;
        }
        if (root && root.id === 'credits-modal') {
            jumpCreditsSection(dir);
            return;
        }
        if (root && root.id === 'menu-panel') {
            jumpDashboardCategory(dir);
            return;
        }
        if (root !== document.body) return;

        var sections = Array.prototype.slice.call(document.querySelectorAll('main > section, header, footer#site-footer')).filter(function (sec) {
            return sec.offsetHeight > 40 && window.getComputedStyle(sec).display !== 'none';
        });
        if (!sections.length) return;

        var scrollMid = window.scrollY + window.innerHeight * 0.32;
        var currentIdx = 0;
        for (var i = 0; i < sections.length; i++) {
            var top = sections[i].getBoundingClientRect().top + window.scrollY;
            if (top <= scrollMid + 60) {
                currentIdx = i;
            }
        }

        var nextIdx = Math.max(0, Math.min(sections.length - 1, currentIdx + dir));
        var targetSec = sections[nextIdx];
        if (!targetSec) return;

        targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        pulseHaptic(38, 0.30, 0.18);

        setTimeout(function () {
            var focusables = targetSec.querySelectorAll('button:not([disabled]), a[href], [onclick], .name-letter, #draggable-sun, input:not([disabled])');
            for (var j = 0; j < focusables.length; j++) {
                if (isElementVisible(focusables[j], true)) {
                    setFocusedElement(focusables[j], false);
                    break;
                }
            }
        }, 380);
    }

    // ─── Sunflower Observatory Interactive Control ───────────────────────────
    function scrubSunflowerToPct(pct) {
        var widget = document.getElementById('sunflower-widget');
        var sun = document.getElementById('draggable-sun');
        if (!widget || !sun) return;

        state.sunVirtualPct = Math.max(12, Math.min(89, pct));
        var rect = widget.getBoundingClientRect();
        var clientX = rect.left + (state.sunVirtualPct / 100) * rect.width;
        var clientY = rect.top + rect.height * 0.3;

        try {
            if (!state.sunDragging) {
                state.sunDragging = true;
                sun.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: clientX, clientY: clientY, pointerId: 1 }));
                sun.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: clientX, clientY: clientY }));
            }
            window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true, clientX: clientX, clientY: clientY, pointerId: 1 }));
            window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX: clientX, clientY: clientY }));

            if (typeof window.updateSunPosition === 'function') {
                var norm = Math.round(((state.sunVirtualPct - 12) / (88 - 12)) * 100);
                window.updateSunPosition(Math.max(0, Math.min(100, norm)));
            }
        } catch (e) {}

        var now = performance.now();
        if (now - state.lastHapticPulse > 55) {
            state.lastHapticPulse = now;
            var intensity = (state.sunVirtualPct - 12) / 76;
            pulseHaptic(30, 0.15 + intensity * 0.45, intensity * 0.35);
        }

        if (state.sunVirtualPct >= 88) {
            setTimeout(function () {
                try {
                    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
                    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                } catch (e) {}
                state.sunDragging = false;
            }, 80);
            triggerCelebrationRumble();
        }
    }

    function scrubSunflowerByDelta(deltaPct) {
        scrubSunflowerToPct(state.sunVirtualPct + deltaPct);
    }

    function autoBloomSunflower() {
        var step = state.sunVirtualPct;
        var timer = setInterval(function () {
            step += 6;
            scrubSunflowerToPct(step);
            if (step >= 88) {
                clearInterval(timer);
            }
        }, 28);
    }

    // ─── On-Screen Virtual Keyboard for Inputs (#secret-pwd, #oath-input, #menu-search) ────
    var VKBD_KEYS = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
        'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
        'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ',
        'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫', 'ESP', 'OK'
    ];

    function openVirtualKeyboard(inputEl) {
        if (!inputEl) return;
        injectStylesAndUI();
        state.vkbdOpen = true;
        state.vkbdTargetInput = inputEl;
        state.vkbdSelectedIdx = 10; // 'q'
        inputEl.focus({ preventScroll: true });
        lockMenuPanelScroll();
        renderVirtualKeyboard();
        var vkbd = document.getElementById('gp-vkbd');
        if (vkbd) vkbd.classList.add('gp-visible');
        updateHUD();
        pulseHaptic(35, 0.3, 0.15);
    }

    function closeVirtualKeyboard() {
        state.vkbdOpen = false;
        var vkbd = document.getElementById('gp-vkbd');
        if (vkbd) vkbd.classList.remove('gp-visible');
        if (state.vkbdTargetInput && state.vkbdTargetInput.id === 'menu-search') {
            state.vkbdTargetInput.blur();
            var dz = getDashboardZones();
            if (dz.links.length > 0) {
                setFocusedElement(dz.links[0], true);
            }
        }
        lockMenuPanelScroll();
        updateHUD();
    }

    function renderVirtualKeyboard() {
        var vkbd = document.getElementById('gp-vkbd');
        if (!vkbd) return;
        var gl = g();
        var html = [
            '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 0 2px;">',
            '  <span style="font-family: -apple-system, BlinkMacSystemFont, \'Inter\', sans-serif; font-size: 11px; font-weight: 500; color: rgba(255, 255, 255, 0.7);">Teclado</span>',
            '  <span style="display: inline-flex; align-items: center; gap: 6px; font-family: -apple-system, BlinkMacSystemFont, \'Inter\', sans-serif; font-size: 10.5px; color: rgba(228, 228, 231, 0.8);">' + renderKeyBadge(gl.alt1) + '<span>Borrar</span>' + renderKeyBadge(gl.alt2) + '<span>Listo</span></span>',
            '</div>',
            '<div class="gp-vkbd-grid">'
        ].join('');

        for (var i = 0; i < VKBD_KEYS.length; i++) {
            var k = VKBD_KEYS[i];
            var activeCls = (i === state.vkbdSelectedIdx) ? ' gp-vkbd-active' : '';
            html += '<button type="button" class="gp-vkbd-key' + activeCls + '" data-vkbd-idx="' + i + '">' + k.toUpperCase() + '</button>';
        }
        html += '</div>';
        vkbd.innerHTML = html;
    }

    function handleVirtualKeyboardNav(dx, dy) {
        var col = state.vkbdSelectedIdx % 10;
        var row = Math.floor(state.vkbdSelectedIdx / 10);
        if (dx !== 0) col = (col + dx + 10) % 10;
        if (dy !== 0) row = (row + dy + 4) % 4;
        state.vkbdSelectedIdx = row * 10 + col;
        renderVirtualKeyboard();
        pulseHaptic(18, 0.14, 0.03);
    }

    function dispatchInputChange(inputEl) {
        if (!inputEl) return;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        inputEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
        lockMenuPanelScroll();
    }

    function submitVirtualKeyboard() {
        var inputEl = state.vkbdTargetInput;
        closeVirtualKeyboard();
        if (!inputEl) return;
        if (inputEl.id === 'secret-pwd' && typeof window.checkSecretPassword === 'function') {
            window.checkSecretPassword();
        } else if (inputEl.id !== 'menu-search') {
            inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
        }
        pulseHaptic(45, 0.45, 0.25);
    }

    function pressVirtualKeyboardKey() {
        var inputEl = state.vkbdTargetInput;
        if (!inputEl) return;
        var key = VKBD_KEYS[state.vkbdSelectedIdx];
        if (key === '⌫') {
            inputEl.value = inputEl.value.slice(0, -1);
            dispatchInputChange(inputEl);
            pulseHaptic(25, 0.2, 0.1);
        } else if (key === 'ESP') {
            inputEl.value += ' ';
            dispatchInputChange(inputEl);
            pulseHaptic(25, 0.2, 0.08);
        } else if (key === 'OK') {
            submitVirtualKeyboard();
        } else {
            inputEl.value += key;
            dispatchInputChange(inputEl);
            pulseHaptic(25, 0.22, 0.08);
        }
    }

    function toggleTulipanesVideo() {
        var slot = document.getElementById('yt-iframe-slot');
        var cover = document.getElementById('yt-cover');
        var iframe = document.getElementById('yt-iframe');

        if (!iframe || !state.tulipanesVideoStarted) {
            state.tulipanesVideoStarted = true;
            state.tulipanesVideoPlaying = true;
            if (typeof window.AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') {
                try { AudioManager.play('entry.wav', 0.8); } catch (e) {}
            }
            if (cover) cover.style.display = 'none';
            if (slot) {
                slot.style.display = 'block';
                slot.innerHTML = '<iframe id="yt-iframe" class="absolute inset-0 w-full h-full" style="border: 0; border-radius: inherit;" src="https://www.youtube.com/embed/krfIh_nm2pA?rel=0&modestbranding=1&autoplay=1&enablejsapi=1" title="Tulipanes Pa\' Yaire" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
            }
            pulseHaptic(45, 0.35, 0.20);
            updateHUD();
            return;
        }

        if (state.tulipanesVideoPlaying) {
            try {
                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            }
            catch (e) {}
            state.tulipanesVideoPlaying = false;
            pulseHaptic(30, 0.25, 0.10);
            updateHUD();
        } else {
            try {
                iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            }
            catch (e) {}
            state.tulipanesVideoPlaying = true;
            pulseHaptic(38, 0.35, 0.18);
            updateHUD();
        }
    }

    window.toggleTulipanesVideo = toggleTulipanesVideo;

    window.addEventListener('message', function (ev) {
        try {
            var data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
            if (data && data.event === 'onStateChange') {
                if (data.info === 1) {
                    state.tulipanesVideoStarted = true;
                    state.tulipanesVideoPlaying = true;
                    updateHUD();
                } else if (data.info === 2 || data.info === 0) {
                    state.tulipanesVideoPlaying = false;
                    updateHUD();
                }
            }
        } catch (e) {}
    }, { passive: true });

    // ─── Primary Action (A / ✕) & Back (B / ○) ───────────────────────────────
    function triggerPrimaryAction() {
        if (isCreditsModalOpen()) {
            pulseHaptic(35, 0.25, 0.12);
            var closeBtn = document.getElementById('credits-close-btn');
            if (closeBtn) {
                closeBtn.click();
            } else if (typeof window.closeModal === 'function') {
                window.closeModal('credits-modal', 'credits-content');
            } else {
                var cm = document.getElementById('credits-modal');
                if (cm) { cm.classList.add('opacity-0'); cm.classList.add('hidden'); }
            }
            if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
                try { window.AudioManager.play('cerrar.wav', 0.25); } catch (e) {}
            }
            return;
        }

        if (state.vkbdOpen) {
            pressVirtualKeyboardKey();
            return;
        }

        if (isArcadeGame2Playing()) {
            if (window.__28EArcade && typeof window.__28EArcade.flapButterfly === 'function') {
                window.__28EArcade.flapButterfly();
            } else {
                var bCanvas = document.getElementById('butterfly-game-canvas');
                if (bCanvas) bCanvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            }
            pulseHaptic(26, 0.30, 0.12);
            return;
        }

        if (isArcadeGame1Playing()) {
            if (window.__28EArcade && typeof window.__28EArcade.popNearestSunflower === 'function') {
                var popped = window.__28EArcade.popNearestSunflower();
                if (popped) pulseHaptic(38, 0.45, 0.25);
                else pulseHaptic(18, 0.12, 0.04);
                return;
            }
        }

        var el = ensureValidFocus();
        if (!el) return;

        if (el.classList && el.classList.contains('name-letter')) {
            updateYaireLetterEffect(null, el);
            pulseHaptic(40, 0.35, 0.18);
            return;
        }

        if (el.id === 'draggable-sun' || el.id === 'sunflower-widget') {
            autoBloomSunflower();
            return;
        }

        if (el.id === 'spotlight-progress-container') {
            if (typeof window.spotlightTogglePlay === 'function') {
                window.spotlightTogglePlay();
            }
            pulseHaptic(35, 0.3, 0.15);
            return;
        }

        if (el.hasAttribute && el.hasAttribute('data-gp-spotlight-expand')) {
            pulseHaptic(42, 0.36, 0.20);
            if (typeof window.toggleSpotlightExpand === 'function') {
                window.toggleSpotlightExpand();
            }
            setTimeout(function () {
                onSpotlightExpandChanged(true);
            }, 50);
            return;
        }

        // Handle clicking a song row in #spotlight-expanded-list (which re-renders the list DOM)
        if (el.parentElement && el.parentElement.id === 'spotlight-expanded-list') {
            var siblings = Array.prototype.slice.call(el.parentElement.children);
            var sIdx = siblings.indexOf(el);
            if (sIdx !== -1) state.lastSpotPlaylistIdx = sIdx;
            pulseHaptic(42, 0.36, 0.20);
            el.click();
            setTimeout(function () {
                var listEl = document.getElementById('spotlight-expanded-list');
                if (listEl && listEl.children[state.lastSpotPlaylistIdx]) {
                    setFocusedElement(listEl.children[state.lastSpotPlaylistIdx], true);
                }
            }, 30);
            return;
        }

        if (el.classList && el.classList.contains('g4-opt') && el.id && el.id.indexOf('g4-opt-') === 0) {
            var optIdx = parseInt(el.id.replace('g4-opt-', ''), 10);
            if (!isNaN(optIdx) && window.__28EArcade && typeof window.__28EArcade.answerGame4Option === 'function') {
                pulseHaptic(42, 0.38, 0.22);
                window.__28EArcade.answerGame4Option(optIdx);
                return;
            }
        }

        if ((el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'password' || !el.type)) || el.tagName === 'TEXTAREA') {
            openVirtualKeyboard(el);
            return;
        }

        if (el.id === 'yt-facade') {
            toggleTulipanesVideo();
            return;
        }

        if (el.classList && el.classList.contains('galeria-card')) {
            var allCards = Array.prototype.slice.call(document.querySelectorAll('.galeria-card'));
            var cardIdx = allCards.indexOf(el);
            openGalleryLightbox(cardIdx >= 0 ? cardIdx : 0);
            return;
        }

        if (el.id === 'cs6-hold-btn') {
            pulseHaptic(20, 0.15, 0.05);
            return;
        }

        if (el.classList && el.classList.contains('credit-row-card')) {
            pulseHaptic(28, 0.25, 0.1);
            if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
                try { window.AudioManager.play('tictac.wav', 0.25); } catch (e) {}
            }
            return;
        }

        if (el.classList && (el.classList.contains('vc-hist-row') || el.classList.contains('vc-det-row'))) {
            pulseHaptic(28, 0.22, 0.1);
            if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
                try { window.AudioManager.play('tictac.wav', 0.22); } catch (e) {}
            }
            return;
        }

        if (el.id === 'auth-toggle') {
            el.classList.add('gp-focus-press');
            setTimeout(function () { if (el) el.classList.remove('gp-focus-press'); }, 140);
            pulseHaptic(42, 0.36, 0.18);
            el.click();
            setTimeout(function () {
                if (isAuthMenuOpen()) onAuthMenuOpened();
            }, 120);
            return;
        }

        if (el.id === 'auth-btn-goto-vc' || el.id === 'auth-btn-goto-vc-loggedout') {
            el.classList.add('gp-focus-press');
            setTimeout(function () { if (el) el.classList.remove('gp-focus-press'); }, 140);
            pulseHaptic(45, 0.38, 0.2);
            el.click();
            setTimeout(function () {
                if (isVoiceModalOpen()) onVoiceModalOpened();
            }, 280);
            return;
        }

        if (el.id === 'vc-btn-ver-mas') {
            el.classList.add('gp-focus-press');
            setTimeout(function () { if (el) el.classList.remove('gp-focus-press'); }, 140);
            pulseHaptic(40, 0.35, 0.18);
            el.click();
            setTimeout(function () {
                onVoiceHistoryOpened();
            }, 160);
            return;
        }

        if (el.id === 'vc-close') {
            el.classList.add('gp-focus-press');
            setTimeout(function () { if (el) el.classList.remove('gp-focus-press'); }, 140);
            pulseHaptic(35, 0.25, 0.15);
            el.click();
            setTimeout(onVoiceModalClosed, 220);
            return;
        }

        var isMenuLink = Boolean(el.closest('#menu-links') && el.classList && el.classList.contains('menu-link'));
        var targetHref = isMenuLink ? (el.getAttribute('href') || '') : '';
        var onclickAttr = el.getAttribute ? (el.getAttribute('onclick') || '') : '';
        var opensRecipeModal = onclickAttr.indexOf('openRecipeModal') !== -1;
        var togglesChefTip = onclickAttr.indexOf('toggleTip') !== -1;

        el.classList.add('gp-focus-press');
        setTimeout(function () {
            if (el) el.classList.remove('gp-focus-press');
        }, 140);

        if (el.id === 'secret-love-btn') {
            triggerCelebrationRumble();
        } else {
            pulseHaptic(45, 0.38, 0.22);
        }

        el.click();

        if (opensRecipeModal) {
            setTimeout(onRecipeModalOpened, 40);
            return;
        }

        if (togglesChefTip) {
            setTimeout(function () {
                var rScroll = document.getElementById('recipe-scroll-area');
                var stepCard = el.closest('.step-card-new');
                if (rScroll && stepCard) {
                    scrollElementIntoContainer(rScroll, stepCard, 28);
                }
            }, 90);
            return;
        }

        if (isMenuLink) {
            setTimeout(function () {
                if (targetHref && targetHref.charAt(0) === '#' && targetHref.length > 1) {
                    var secId = targetHref.slice(1);
                    var secEl = document.getElementById(secId === 'hero' ? 'epidemic-hero' : secId);
                    if (secEl) {
                        var firstInteractive = secEl.querySelector('button:not([disabled]), a[href], [onclick], .name-letter, #draggable-sun, input:not([disabled])');
                        if (firstInteractive && isElementVisible(firstInteractive, true)) {
                            setFocusedElement(firstInteractive, false);
                            return;
                        }
                    }
                }
                ensureValidFocus();
            }, 420);
        }
    }

    function triggerBackAction() {
        if (state.vkbdOpen) {
            closeVirtualKeyboard();
            pulseHaptic(30, 0.22, 0.12);
            return;
        }

        if (state.galleryLightboxOpen) {
            closeGalleryLightbox();
            pulseHaptic(35, 0.25, 0.15);
            return;
        }

        var cs6Modal = document.getElementById('cs6-oath');
        if (cs6Modal && !cs6Modal.classList.contains('hidden') && window.getComputedStyle(cs6Modal).display !== 'none') {
            if (typeof window.closeOathModal === 'function') {
                window.closeOathModal();
            } else {
                cs6Modal.style.display = 'none';
            }
            if (typeof window.__resetOathLock === 'function') window.__resetOathLock();
            pulseHaptic(35, 0.25, 0.15);
            setTimeout(function () {
                var btn = document.getElementById('cs6-hold-btn');
                if (btn) setFocusedElement(btn, false);
                else ensureValidFocus();
            }, 220);
            return;
        }

        var secModal = document.getElementById('secret-modal');
        if (secModal && !secModal.classList.contains('hidden')) {
            if (typeof window.closeSecretModal === 'function') {
                window.closeSecretModal();
                pulseHaptic(35, 0.25, 0.15);
                return;
            }
        }

        var credModal = document.getElementById('credits-modal');
        if (credModal && !credModal.classList.contains('hidden') && !credModal.classList.contains('opacity-0')) {
            pulseHaptic(35, 0.25, 0.15);
            var closeBtn = document.getElementById('credits-close-btn');
            if (closeBtn) {
                closeBtn.click();
            } else if (typeof window.closeModal === 'function') {
                window.closeModal('credits-modal', 'credits-content');
            } else {
                credModal.classList.add('opacity-0');
                credModal.classList.add('hidden');
            }
            if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
                try { window.AudioManager.play('cerrar.wav', 0.25); } catch (e) {}
            }
            return;
        }

        if (isVoiceHistoryOpen()) {
            var detClose = document.getElementById('vc-det-close');
            if (detClose) {
                detClose.click();
            } else {
                var det = document.getElementById('vc-detailed-history');
                if (det) det.remove();
            }
            pulseHaptic(30, 0.22, 0.1);
            setTimeout(function () {
                var vz = getVoiceModalZones();
                var target = vz.verMasBtn || vz.joinBtn;
                if (target) setFocusedElement(target, false);
                else ensureValidFocus();
            }, 180);
            return;
        }

        if (isVoiceModalOpen()) {
            if (window.yaireVoiceChannel && typeof window.yaireVoiceChannel.close === 'function') {
                window.yaireVoiceChannel.close();
            } else {
                var vcClose = document.getElementById('vc-close');
                if (vcClose) vcClose.click();
            }
            pulseHaptic(35, 0.25, 0.15);
            setTimeout(function () {
                var gotoVcBtn = document.getElementById('auth-btn-goto-vc') || document.getElementById('auth-toggle');
                if (gotoVcBtn && isElementVisible(gotoVcBtn, true)) {
                    setFocusedElement(gotoVcBtn, false);
                } else {
                    ensureValidFocus();
                }
            }, 250);
            return;
        }

        if (isAuthMenuOpen()) {
            var authTog = document.getElementById('auth-toggle');
            if (authTog) {
                authTog.click();
            } else {
                var am = document.getElementById('auth-menu');
                if (am) {
                    am.classList.remove('opacity-100', 'scale-100');
                    am.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                    setTimeout(function () { am.style.display = 'none'; }, 200);
                }
            }
            pulseHaptic(30, 0.22, 0.1);
            setTimeout(function () {
                var authPill = document.getElementById('auth-toggle');
                if (authPill && isElementVisible(authPill, true)) {
                    setFocusedElement(authPill, false);
                } else {
                    ensureValidFocus();
                }
            }, 150);
            return;
        }

        var palModal = document.getElementById('paleta-modal');
        if (palModal && !palModal.classList.contains('hidden') && window.getComputedStyle(palModal).display !== 'none') {
            if (typeof window.pcClosePaletaModal === 'function') {
                window.pcClosePaletaModal();
                pulseHaptic(35, 0.25, 0.15);
                setTimeout(function () {
                    var cards = document.querySelectorAll('.pc-card');
                    var targetCard = cards[state.currentPaletaColorIdx] || cards[0];
                    if (targetCard && isElementVisible(targetCard, true)) {
                        setFocusedElement(targetCard, false);
                    } else {
                        ensureValidFocus();
                    }
                }, 280);
                return;
            }
        }

        if (isRecipeModalOpen()) {
            if (typeof window.closeModal === 'function') {
                window.closeModal('recipe-modal', 'recipe-content');
            } else if (typeof window.closeRecipeModal === 'function') {
                window.closeRecipeModal();
            } else {
                var rCloseBtn = document.querySelector('#recipe-modal button.pc-close-btn');
                if (rCloseBtn) rCloseBtn.click();
            }
            pulseHaptic(35, 0.25, 0.15);
            setTimeout(function () {
                var openRecBtn = document.querySelector('button[onclick*="openRecipeModal"]');
                if (openRecBtn && isElementVisible(openRecBtn, true)) {
                    setFocusedElement(openRecBtn, false);
                } else {
                    ensureValidFocus();
                }
            }, 320);
            return;
        }

        var gmModal = document.getElementById('game-modal');
        if (gmModal && !gmModal.classList.contains('hidden') && window.getComputedStyle(gmModal).display !== 'none') {
            var closeBtn = gmModal.querySelector('button[onclick*="close"]');
            if (closeBtn) closeBtn.click();
            pulseHaptic(35, 0.25, 0.15);
            return;
        }

        if (isSpotlightExpandedOpen()) {
            if (typeof window.toggleSpotlightExpand === 'function') {
                window.toggleSpotlightExpand();
                pulseHaptic(32, 0.24, 0.12);
                setTimeout(function () {
                    onSpotlightExpandChanged(false);
                }, 50);
                return;
            }
        }

        if (isMenuPanelOpen()) {
            var searchInput = document.getElementById('menu-search');
            if (searchInput && searchInput.value.trim() !== '') {
                searchInput.value = '';
                if (typeof window.filterMenuLinks === 'function') window.filterMenuLinks('');
                searchInput.blur();
                var dz = getDashboardZones();
                if (dz.links[0]) setFocusedElement(dz.links[0], true);
                pulseHaptic(28, 0.2, 0.1);
                return;
            }
            if (typeof window.closeMenu === 'function') {
                window.closeMenu();
            } else if (typeof window.toggleMenu === 'function') {
                window.toggleMenu();
            }
            pulseHaptic(32, 0.24, 0.12);
            setTimeout(ensureValidFocus, 260);
            return;
        }

        var gameArea = document.getElementById('game-active-area');
        if (gameArea && !gameArea.classList.contains('hidden') && window.getComputedStyle(gameArea).display !== 'none') {
            if (typeof window.closeArcadeGame === 'function') {
                window.closeArcadeGame();
                pulseHaptic(35, 0.25, 0.15);
                setTimeout(function () {
                    var firstCard = document.querySelector('#games-carousel .ghub-card-v3');
                    if (firstCard) setFocusedElement(firstCard, false);
                }, 550);
                return;
            }
        }
    }

    function onRecipeModalOpened() {
        prepareRecipeModalTargets();
        var rScroll = document.getElementById('recipe-scroll-area');
        if (rScroll) rScroll.scrollTop = 0;
        if (!state.activeMode) return;
        var rz = getRecipeModalZones();
        var firstTarget = rz.ingCards[0] || rz.prepItems[0] || rz.readCards[0] || rz.tabs[0] || rz.closeBtn;
        if (firstTarget) {
            setFocusedElement(firstTarget, false);
        }
    }

    function onMenuOpened() {
        lockMenuPanelScroll();
        prepareMenuPanelTargets();
        var s = document.getElementById('menu-search');
        if (s && state.activeMode) s.blur();
        var mLinks = document.getElementById('menu-links');
        if (mLinks) mLinks.scrollTo({ top: 0, behavior: 'auto' });
        if (!state.activeMode) {
            lockMenuPanelScroll();
            return;
        }
        var dz = getDashboardZones();
        var firstTarget = dz.links[0] || dz.search || dz.header[0];
        if (firstTarget) {
            setFocusedElement(firstTarget, false);
        }
        lockMenuPanelScroll();
    }

    function onSpotlightExpandChanged(isExpanded) {
        lockMenuPanelScroll();
        if (!state.activeMode) return;
        if (isExpanded) {
            var playBtn = document.getElementById('spotlight-expanded-play-btn');
            if (playBtn) setFocusedElement(playBtn, false);
        } else {
            var dz = getDashboardZones();
            if (dz.miniPlayer[0]) setFocusedElement(dz.miniPlayer[0], false);
        }
        lockMenuPanelScroll();
    }

    function toggleMainMenu() {
        if (typeof window.toggleMenu === 'function') {
            window.toggleMenu();
            pulseHaptic(38, 0.3, 0.16);
            setTimeout(function () {
                if (isMenuPanelOpen()) {
                    onMenuOpened();
                } else {
                    ensureValidFocus();
                }
            }, 80);
        }
    }

    // ─── Art Gallery Lightbox & Paleta Controllers ───────────────────────────
    var PALETA_KEYS = ['verde', 'rojo', 'rosa', 'morado'];

    function cyclePaletaColor(delta) {
        var len = PALETA_KEYS.length;
        state.currentPaletaColorIdx = (state.currentPaletaColorIdx + delta + len) % len;
        var key = PALETA_KEYS[state.currentPaletaColorIdx];
        if (typeof window.pcOpenPaleta === 'function') {
            window.pcOpenPaleta(key);
            pulseHaptic(30, 0.24, 0.12);
        }
    }

    function getGalleryArtworks() {
        var cards = document.querySelectorAll('.galeria-card');
        var items = [];
        for (var i = 0; i < cards.length; i++) {
            var img = cards[i].querySelector('img');
            var badge = cards[i].querySelector('.galeria-overlay span');
            var cap = cards[i].querySelector('.galeria-overlay p');
            items.push({
                src: img ? (img.currentSrc || img.src) : '',
                alt: img ? img.alt : '',
                badge: badge ? badge.textContent.trim() : ('OBRA ' + (i + 1)),
                caption: cap ? cap.textContent.trim() : '',
                cardEl: cards[i]
            });
        }
        return items;
    }

    function renderGalleryLightboxPhoto() {
        var artworks = getGalleryArtworks();
        if (!artworks.length) return;
        var art = artworks[state.galleryLightboxIdx];
        if (!art) return;

        var imgEl = document.getElementById('gp-lightbox-img');
        var badgeEl = document.getElementById('gp-lightbox-badge');
        var capEl = document.getElementById('gp-lightbox-caption');
        var countEl = document.getElementById('gp-lightbox-counter');

        if (imgEl) {
            imgEl.style.opacity = '0';
            imgEl.src = art.src;
            imgEl.onload = function () {
                imgEl.style.opacity = '1';
            };
        }
        if (badgeEl) badgeEl.textContent = art.badge;
        if (capEl) capEl.textContent = art.caption;
        if (countEl) countEl.textContent = (state.galleryLightboxIdx + 1) + ' / ' + artworks.length;
    }

    function openGalleryLightbox(idx) {
        var artworks = getGalleryArtworks();
        if (!artworks.length) return;
        idx = Math.max(0, Math.min(idx, artworks.length - 1));
        state.galleryLightboxIdx = idx;
        state.galleryLightboxOpen = true;

        var m = document.getElementById('gp-lightbox-modal');
        if (!m) {
            injectStylesAndUI();
            m = document.getElementById('gp-lightbox-modal');
        }
        if (!m) return;

        renderGalleryLightboxPhoto();
        m.style.display = 'flex';
        void m.offsetWidth;
        m.classList.add('gp-visible');

        var closeBtn = m.querySelector('.gp-lightbox-close');
        if (closeBtn) setFocusedElement(closeBtn, false);

        if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
            try { window.AudioManager.play('entry.wav', 0.6); } catch (e) {}
        }
        pulseHaptic(40, 0.35, 0.18);
        updateHUD();
    }

    function nextGalleryPhoto() {
        var artworks = getGalleryArtworks();
        if (!artworks.length) return;
        state.galleryLightboxIdx = (state.galleryLightboxIdx + 1) % artworks.length;
        renderGalleryLightboxPhoto();
        pulseHaptic(28, 0.24, 0.12);
        if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
            try { window.AudioManager.play('hover.wav', 0.3); } catch (e) {}
        }
    }

    function prevGalleryPhoto() {
        var artworks = getGalleryArtworks();
        if (!artworks.length) return;
        state.galleryLightboxIdx = (state.galleryLightboxIdx - 1 + artworks.length) % artworks.length;
        renderGalleryLightboxPhoto();
        pulseHaptic(28, 0.24, 0.12);
        if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
            try { window.AudioManager.play('hover.wav', 0.3); } catch (e) {}
        }
    }

    function closeGalleryLightbox() {
        var m = document.getElementById('gp-lightbox-modal');
        if (!m || !state.galleryLightboxOpen) return;
        state.galleryLightboxOpen = false;
        m.classList.remove('gp-visible');
        setTimeout(function () {
            m.style.display = 'none';
        }, 220);

        if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
            try { window.AudioManager.play('flyout.wav', 0.5); } catch (e) {}
        }

        var artworks = getGalleryArtworks();
        var curCard = artworks[state.galleryLightboxIdx] ? artworks[state.galleryLightboxIdx].cardEl : null;
        if (curCard && isElementVisible(curCard, true)) {
            setFocusedElement(curCard, false);
        } else {
            ensureValidFocus();
        }
        updateHUD();
    }

    window.__gpCloseGalleryLightbox = closeGalleryLightbox;
    window.__gpPrevGalleryPhoto = prevGalleryPhoto;
    window.__gpNextGalleryPhoto = nextGalleryPhoto;

    function prepareGalleryCards() {
        var cards = document.querySelectorAll('.galeria-card');
        for (var i = 0; i < cards.length; i++) {
            (function (idx, c) {
                if (!c.getAttribute('data-gp-bound')) {
                    c.setAttribute('data-gp-bound', 'true');
                    c.setAttribute('role', 'button');
                    c.setAttribute('tabindex', '0');
                    c.style.cursor = 'pointer';
                    c.addEventListener('click', function () {
                        openGalleryLightbox(idx);
                    });
                }
            })(i, cards[i]);
        }
    }

    document.addEventListener('click', function (e) {
        var card = e.target && e.target.closest ? e.target.closest('.pc-card') : null;
        if (card) {
            var onclick = card.getAttribute('onclick') || '';
            for (var k = 0; k < PALETA_KEYS.length; k++) {
                if (onclick.indexOf(PALETA_KEYS[k]) !== -1) {
                    state.currentPaletaColorIdx = k;
                    break;
                }
            }
        }
    }, true);

    // ─── Biometric 3-Second Hold (#hold-reveal-btn & #cs6-hold-btn) ─────────
    function handleBiometricHold(isPressed, now, isCs6) {
        if (isCs6) {
            var cs6Btn = document.getElementById('cs6-hold-btn');
            if (!cs6Btn) return false;

            if (isPressed) {
                if (!state.holdingCs6Btn) {
                    state.holdingCs6Btn = true;
                    state.holdBtn0Start = now;
                    state.cs6HoldCompleted = false;
                    cs6Btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                }
                var elapsedCs6 = now - state.holdBtn0Start;
                if (now - state.lastHapticPulse > 100) {
                    state.lastHapticPulse = now;
                    var p6 = Math.min(1, elapsedCs6 / 3000);
                    pulseHaptic(45, 0.15 + p6 * 0.75, 0.10 + p6 * 0.75);
                }
                if (elapsedCs6 >= 3000 && !state.cs6HoldCompleted) {
                    state.cs6HoldCompleted = true;
                    triggerCelebrationRumble();
                    setTimeout(function () {
                        var oathModal = document.getElementById('cs6-oath');
                        if (oathModal) {
                            var focusable = oathModal.querySelector('button, input');
                            if (focusable) setFocusedElement(focusable, false);
                        }
                    }, 250);
                }
                return true;
            } else if (state.holdingCs6Btn) {
                if (!state.cs6HoldCompleted) {
                    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                    if (typeof window.__resetOathLock === 'function') window.__resetOathLock();
                }
                state.holdingCs6Btn = false;
                state.cs6HoldCompleted = false;
                return true;
            }
            return false;
        }

        var letModal = document.getElementById('secret-letter');
        var holdBtn = document.getElementById('hold-reveal-btn');
        if (!letModal || letModal.classList.contains('hidden') || !holdBtn) {
            if (state.holdingRevealBtn && holdBtn) {
                holdBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            }
            state.holdingRevealBtn = false;
            return false;
        }

        var dedModal = document.getElementById('secret-dedication-modal');
        if (dedModal && !dedModal.classList.contains('hidden')) {
            state.holdingRevealBtn = false;
            return false;
        }

        if (isPressed) {
            if (!state.holdingRevealBtn) {
                state.holdingRevealBtn = true;
                state.holdBtn0Start = now;
                setFocusedElement(holdBtn, true);
                holdBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            }
            var elapsed = now - state.holdBtn0Start;
            if (now - state.lastHapticPulse > 120) {
                state.lastHapticPulse = now;
                var p = Math.min(1, elapsed / 3000);
                pulseHaptic(55, 0.2 + p * 0.65, 0.1 + p * 0.65);
            }
            return true;
        } else if (state.holdingRevealBtn) {
            state.holdingRevealBtn = false;
            holdBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            return true;
        }
        return false;
    }

    // ─── Arcade Overlay Lifecycle Hooks ──────────────────────────────────────
    function handleOverlayShown(overlayId) {
        if (!state.activeMode) return;
        state.lastInputTime = performance.now();
        var btnMap = {
            'g1-overlay': 'g1-ov-btn',
            'game2-overlay': 'game2-overlay-btn',
            'game3-overlay': 'game3-overlay-btn',
            'game4-overlay': 'game4-overlay-btn'
        };
        var btnId = btnMap[overlayId];
        if (btnId) {
            var btn = document.getElementById(btnId);
            if (btn) setFocusedElement(btn, false);
        }
        updateHUD();
    }

    function handleOverlayHidden(overlayId) {
        if (!state.activeMode) return;
        state.lastInputTime = performance.now();
        if (overlayId === 'game2-overlay' || overlayId === 'g1-overlay') {
            if (state.focusedEl) {
                state.focusedEl.classList.remove('gp-focus');
                state.focusedEl = null;
            }
        } else if (overlayId === 'game3-overlay') {
            setTimeout(function () {
                var firstCard = document.querySelector('#memory-board .mem-card');
                if (firstCard) setFocusedElement(firstCard, false);
            }, 60);
        } else if (overlayId === 'game4-overlay') {
            setTimeout(function () {
                var firstOpt = document.getElementById('g4-opt-0');
                if (firstOpt) setFocusedElement(firstOpt, false);
            }, 90);
        }
        updateHUD();
    }

    function handleGame4RoundLoaded() {
        if (!state.activeMode) return;
        state.lastInputTime = performance.now();
        var firstOpt = document.getElementById('g4-opt-0');
        if (firstOpt) setFocusedElement(firstOpt, false);
        updateHUD();
    }

    // ─── Main 60fps Gamepad Polling Loop ─────────────────────────────────────
    function isBtnPressed(pad, idx) {
        return Boolean(pad.buttons && pad.buttons[idx] && pad.buttons[idx].pressed);
    }

    function wasBtnJustPressed(pad, idx) {
        var cur = isBtnPressed(pad, idx);
        var prev = Boolean(state.lastBtnState[idx]);
        state.lastBtnState[idx] = cur;
        return cur && !prev;
    }

    function pollGamepad(now) {
        requestAnimationFrame(pollGamepad);

        // Keep #menu-panel scrollTop locked at 0 at all times
        var menuOpenNow = isMenuPanelOpen();
        var spotExpNow = isSpotlightExpandedOpen();
        var recipeOpenNow = isRecipeModalOpen();
        var credModalOpen = isCreditsModalOpen();
        if (menuOpenNow) {
            lockMenuPanelScroll();
        }
        if (credModalOpen && !state.wasCreditsModalOpen) {
            onCreditsModalOpened();
        } else if (!credModalOpen && state.wasCreditsModalOpen) {
            if (state.activeMode) {
                var credBtn = document.querySelector('button[onclick*="credits-modal"]');
                if (credBtn) {
                    setFocusedElement(credBtn, false);
                }
            }
        }
        if (state.activeMode) {
            if (recipeOpenNow && !state.wasRecipeModalOpen) {
                onRecipeModalOpened();
            } else if (menuOpenNow && !state.wasMenuPanelOpen) {
                onMenuOpened();
            } else if (spotExpNow !== state.wasSpotlightExpanded && menuOpenNow) {
                onSpotlightExpandChanged(spotExpNow);
            }
        }
        state.wasMenuPanelOpen = menuOpenNow;
        state.wasSpotlightExpanded = spotExpNow;
        state.wasRecipeModalOpen = recipeOpenNow;
        state.wasCreditsModalOpen = credModalOpen;

        var pad = getActiveGamepad();
        if (!pad) return;

        if (!state.connected || (state.lastPadId && state.lastPadId !== pad.id)) {
            var isNewConn = !state.connected;
            state.connected = true;
            state.brand = detectBrand(pad.id);
            state.controllerName = cleanControllerName(pad.id);
            state.lastPadId = pad.id;
            state.lastInputTime = now;
            if (isNewConn) {
                showGamepadToast('Mando detectado', '', true);
                pulseHaptic(65, 0.45, 0.25);
            }
        }

        // Read Axes
        var lx = (pad.axes && pad.axes.length > 0) ? pad.axes[0] : 0;
        var ly = (pad.axes && pad.axes.length > 1) ? pad.axes[1] : 0;
        var rx = (pad.axes && pad.axes.length > 2) ? pad.axes[2] : 0;
        var ry = (pad.axes && pad.axes.length > 3) ? pad.axes[3] : 0;

        // Read D-Pad
        var dUp = isBtnPressed(pad, 12);
        var dDown = isBtnPressed(pad, 13);
        var dLeft = isBtnPressed(pad, 14);
        var dRight = isBtnPressed(pad, 15);

        // Triggers L2 (6) / R2 (7)
        var l2Val = (pad.buttons && pad.buttons[6]) ? (pad.buttons[6].value || 0) : 0;
        var r2Val = (pad.buttons && pad.buttons[7]) ? (pad.buttons[7].value || 0) : 0;

        var anyButton = false;
        for (var b = 0; b < pad.buttons.length; b++) {
            if (pad.buttons[b] && pad.buttons[b].pressed) {
                anyButton = true;
                break;
            }
        }
        var anyStick = Math.abs(lx) > STICK_DEADZONE || Math.abs(ly) > STICK_DEADZONE || Math.abs(rx) > SCROLL_DEADZONE || Math.abs(ry) > SCROLL_DEADZONE;

        if (anyButton || anyStick) {
            state.lastInputTime = now;
            if (!state.activeMode) {
                state.activeMode = true;
                hideMouseCursor();
                ensureValidFocus();
            } else if (document.body && !document.body.classList.contains('gp-hide-cursor')) {
                hideMouseCursor();
            }
        }

        var ctx = getActiveContextType();

        // ─── Dedicated First-Class Handler: Créditos Modal (#credits-modal) ───
        if (ctx === 'credits-modal' || credModalOpen) {
            var cScroll = document.querySelector('#credits-content .custom-credits-scroll') || document.querySelector('#credits-modal .custom-credits-scroll');

            // 1. Fluid Inertial Analog & D-Pad Scrolling (Active Gamepad Mode Only)
            if (state.activeMode) {
                var credInputY = 0;
                if (Math.abs(ry) > 0.15) {
                    credInputY = ry;
                } else if (Math.abs(ly) > 0.15) {
                    credInputY = ly;
                } else if (Math.abs(rx) > 0.18 && Math.abs(ry) <= 0.10) {
                    credInputY = rx;
                } else if (Math.abs(lx) > 0.18 && Math.abs(ly) <= 0.10) {
                    credInputY = lx;
                } else if (dUp) {
                    credInputY = -0.85;
                } else if (dDown) {
                    credInputY = 0.85;
                } else if (r2Val > 0.12) {
                    credInputY = r2Val * 0.85;
                } else if (l2Val > 0.12) {
                    credInputY = -l2Val * 0.85;
                }

                if (credInputY !== 0) {
                    state.lastInputTime = now;
                    var absIn = Math.abs(credInputY);
                    var normIn = Math.min(1.0, (absIn - 0.15) / 0.85);
                    var targetCredVel = Math.sign(credInputY) * Math.pow(Math.max(0.12, normIn), 1.6) * SCROLL_MAX_SPEED;
                    state.scrollVelocityY = state.scrollVelocityY * 0.68 + targetCredVel * 0.32;
                    if (cScroll) {
                        cScroll.scrollTop += state.scrollVelocityY;
                    }
                } else if (Math.abs(state.scrollVelocityY) > 0.05) {
                    state.scrollVelocityY = state.scrollVelocityY * 0.78;
                    if (Math.abs(state.scrollVelocityY) < 0.05) {
                        state.scrollVelocityY = 0;
                    } else if (cScroll) {
                        cScroll.scrollTop += state.scrollVelocityY;
                    }
                } else {
                    state.scrollVelocityY = 0;
                }
            } else {
                state.scrollVelocityY = 0;
            }

            // 2. Section Jump with Bumpers (L1 / R1)
            var btnMap = getButtonMapping();
            if (wasBtnJustPressed(pad, btnMap.l1)) {
                jumpCreditsSection(-1);
            }
            if (wasBtnJustPressed(pad, btnMap.r1)) {
                jumpCreditsSection(1);
            }

            // 3. Immediate Close on ANY Button (A, B, X, Y, +, -, Menu, Home, Capture, Confirm, Back)
            var shouldCloseCredits = false;
            var closeCandidateButtons = [0, 1, 2, 3, 8, 9, 16, 17, btnMap.confirm, btnMap.back, btnMap.menu];
            for (var cbi = 0; cbi < closeCandidateButtons.length; cbi++) {
                if (wasBtnJustPressed(pad, closeCandidateButtons[cbi])) {
                    shouldCloseCredits = true;
                    break;
                }
            }

            // Check all raw gamepads so split or secondary Joy-Cons close reliably
            if (!shouldCloseCredits && navigator.getGamepads) {
                var rawList = navigator.getGamepads();
                if (rawList) {
                    for (var rpi = 0; rpi < rawList.length; rpi++) {
                        var rp = rawList[rpi];
                        if (rp && rp.connected && rp.buttons) {
                            for (var rbi = 0; rbi < Math.min(rp.buttons.length, 18); rbi++) {
                                var rKey = rpi + '_' + rbi;
                                var rPressed = Boolean(rp.buttons[rbi] && rp.buttons[rbi].pressed);
                                var rPrev = Boolean(state.lastRawButtonsState[rKey]);
                                state.lastRawButtonsState[rKey] = rPressed;
                                if (rPressed && !rPrev) {
                                    if (rbi === 0 || rbi === 1 || rbi === 2 || rbi === 3 || rbi === 8 || rbi === 9 || rbi === 16 || rbi === 17) {
                                        shouldCloseCredits = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (shouldCloseCredits) break;
                    }
                }
            }

            if (shouldCloseCredits) {
                pulseHaptic(35, 0.25, 0.15);
                var closeBtn = document.getElementById('credits-close-btn');
                if (closeBtn) {
                    closeBtn.click();
                } else if (typeof window.closeModal === 'function') {
                    window.closeModal('credits-modal', 'credits-content');
                } else {
                    var cm = document.getElementById('credits-modal');
                    if (cm) {
                        cm.classList.add('opacity-0');
                        cm.classList.add('hidden');
                    }
                }
                if (typeof window.AudioManager !== 'undefined' && window.AudioManager && typeof window.AudioManager.play === 'function') {
                    try { window.AudioManager.play('cerrar.wav', 0.25); } catch (e) {}
                }
                updateHUD();
                return;
            }

            updateHUD();
            return;
        }

        // Instant Flap in Game 2 ("Vuelo Hacia Ti") on D-Pad Up or Left Stick Up Flick
        if (ctx === 'game2') {
            var dUpJustPressed = wasBtnJustPressed(pad, 12);
            var stickUpNow = ly < -0.45;
            var stickUpJustFlicked = stickUpNow && !state.lastFlapStickUp;
            state.lastFlapStickUp = stickUpNow;
            if (dUpJustPressed || stickUpJustFlicked) {
                triggerPrimaryAction();
            }
        } else {
            state.lastFlapStickUp = false;
        }

        // ─── Right Stick & L2/R2 Analog Fluid Inertial Scrolling ──────────────
        // Disabled during active canvas mini-games to preserve action focus
        var targetScrollVelocity = 0;
        if (ctx !== 'game2' && ctx !== 'game1') {
            var absRy = Math.abs(ry);
            if (absRy > SCROLL_DEADZONE) {
                var normRy = Math.min(1.0, (absRy - SCROLL_DEADZONE) / (1.0 - SCROLL_DEADZONE));
                targetScrollVelocity = Math.sign(ry) * Math.pow(normRy, 1.75) * SCROLL_MAX_SPEED;
                state.rightStickScrolled = true;
                state.lastRightStickScrollTime = now;
            } else {
                // Secondary analog triggers L2/R2 for precision progressive scrolling
                var triggerDelta = r2Val - l2Val;
                var absTrig = Math.abs(triggerDelta);
                if (absTrig > 0.12) {
                    var normTrig = Math.min(1.0, (absTrig - 0.12) / (1.0 - 0.12));
                    targetScrollVelocity = Math.sign(triggerDelta) * Math.pow(normTrig, 1.6) * SCROLL_MAX_SPEED;
                    state.rightStickScrolled = true;
                    state.lastRightStickScrollTime = now;
                }
            }
        }

        // Apply physical inertial damping (silky flywheel momentum)
        if (targetScrollVelocity !== 0) {
            // Rapid direction turnaround if stick flipped to opposite direction
            if ((state.scrollVelocityY > 0 && targetScrollVelocity < 0) || (state.scrollVelocityY < 0 && targetScrollVelocity > 0)) {
                state.scrollVelocityY = state.scrollVelocityY * 0.35 + targetScrollVelocity * 0.65;
            } else {
                state.scrollVelocityY = state.scrollVelocityY * 0.74 + targetScrollVelocity * 0.26;
            }
        } else {
            // Smooth exponential deceleration on stick release (simulates physical fluid friction)
            state.scrollVelocityY = state.scrollVelocityY * 0.82;
            if (Math.abs(state.scrollVelocityY) < 0.08) {
                state.scrollVelocityY = 0;
            }
        }

        // Apply scroll delta directly with { behavior: 'instant' } to bypass CSS scroll-smooth stutter
        if (ctx === 'letter') {
            var letterBody = document.getElementById('cinematic-letter-body');
            var letterVertical = (Math.abs(ly) > 0.25 ? ly : (dDown ? 0.75 : (dUp ? -0.75 : 0)));
            if (letterBody && Math.abs(letterVertical) > 0.1) {
                var lStep = letterVertical * 11;
                if (typeof letterBody.scrollBy === 'function') {
                    letterBody.scrollBy({ top: lStep, left: 0, behavior: 'instant' });
                } else {
                    letterBody.scrollTop += lStep;
                }
            } else if (letterBody && Math.abs(state.scrollVelocityY) > 0.05) {
                if (typeof letterBody.scrollBy === 'function') {
                    letterBody.scrollBy({ top: state.scrollVelocityY, left: 0, behavior: 'instant' });
                } else {
                    letterBody.scrollTop += state.scrollVelocityY;
                }
            }
        } else if (Math.abs(state.scrollVelocityY) > 0.05) {
            var sVel = state.scrollVelocityY;
            var palModal = document.getElementById('paleta-modal');
            var palModalOpen = palModal && !palModal.classList.contains('hidden') && window.getComputedStyle(palModal).display !== 'none';

            var cs6Modal = document.getElementById('cs6-oath');
            var cs6ModalOpen = cs6Modal && !cs6Modal.classList.contains('hidden') && window.getComputedStyle(cs6Modal).display !== 'none';

            if (palModalOpen) {
                var pScroll = palModal.querySelector('.paleta-modal-right');
                if (pScroll) {
                    if (typeof pScroll.scrollBy === 'function') {
                        pScroll.scrollBy({ top: sVel, left: 0, behavior: 'instant' });
                    } else {
                        pScroll.scrollTop += sVel;
                    }
                }
            } else if (cs6ModalOpen) {
                var oScroll = document.getElementById('cs6-oath-card') || cs6Modal;
                if (oScroll) {
                    if (typeof oScroll.scrollBy === 'function') {
                        oScroll.scrollBy({ top: sVel, left: 0, behavior: 'instant' });
                    } else {
                        oScroll.scrollTop += sVel;
                    }
                }
            } else if (ctx === 'voice-modal' || isVoiceModalOpen()) {
                var vPanel = document.getElementById('vc-panel');
                var vScroll = vPanel ? (vPanel.querySelector('.vc-scroll') || vPanel.querySelector('.overflow-y-auto') || vPanel.querySelector('.vc-lobby-container') || vPanel) : null;
                if (vScroll) {
                    if (typeof vScroll.scrollBy === 'function') {
                        vScroll.scrollBy({ top: sVel, left: 0, behavior: 'instant' });
                    } else {
                        vScroll.scrollTop += sVel;
                    }
                }
            } else if (isVoiceHistoryOpen()) {
                var detList = document.querySelector('#vc-detailed-history .vc-det-list');
                if (detList) {
                    if (typeof detList.scrollBy === 'function') {
                        detList.scrollBy({ top: sVel, left: 0, behavior: 'instant' });
                    } else {
                        detList.scrollTop += sVel;
                    }
                }
            } else if (recipeOpenNow) {
                var rScroll = document.getElementById('recipe-scroll-area');
                if (rScroll) {
                    if (typeof rScroll.scrollBy === 'function') {
                        rScroll.scrollBy({ top: sVel, left: 0, behavior: 'instant' });
                    } else {
                        rScroll.scrollTop += sVel;
                    }
                }
            } else if (spotExpNow) {
                var spotList = document.getElementById('spotlight-expanded-list');
                if (spotList) {
                    if (typeof spotList.scrollBy === 'function') {
                        spotList.scrollBy({ top: sVel, left: 0, behavior: 'instant' });
                    } else {
                        spotList.scrollTop += sVel;
                    }
                    lockMenuPanelScroll();
                }
            } else if (menuOpenNow) {
                var mLinks = document.getElementById('menu-links');
                if (mLinks) {
                    if (typeof mLinks.scrollBy === 'function') {
                        mLinks.scrollBy({ top: sVel, left: 0, behavior: 'instant' });
                    } else {
                        mLinks.scrollTop += sVel;
                    }
                    lockMenuPanelScroll();
                }
            } else {
                // Crucial: bypass html.scroll-smooth compositor hitch by specifying behavior: 'instant'
                if (typeof window.scrollBy === 'function') {
                    window.scrollBy({ top: sVel, left: 0, behavior: 'instant' });
                } else {
                    var sEl = document.scrollingElement || document.documentElement || document.body;
                    if (sEl) sEl.scrollTop += sVel;
                }
            }
        }

        if (ctx === 'sunflower' && Math.abs(lx) > 0.22) {
            scrubSunflowerByDelta(lx * 1.45);
        }

        // Directional Navigation (D-Pad + Left Stick with dominant-axis lock & cooldown)
        var navDx = 0;
        var navDy = 0;
        if (dLeft) navDx = -1;
        else if (dRight) navDx = 1;
        else if (dUp) navDy = -1;
        else if (dDown) navDy = 1;
        else if (Math.abs(lx) > STICK_DEADZONE || Math.abs(ly) > STICK_DEADZONE) {
            if (Math.abs(lx) > Math.abs(ly)) {
                navDx = lx < 0 ? -1 : 1;
            } else {
                navDy = ly < 0 ? -1 : 1;
            }
        }

        if ((navDx !== 0 || navDy !== 0) && (now - state.lastNavTime > NAV_REPEAT_MS)) {
            state.lastNavTime = now;
            if (state.vkbdOpen) {
                handleVirtualKeyboardNav(navDx, navDy);
            } else if (ctx === 'lightbox') {
                if (navDx < 0) prevGalleryPhoto();
                else if (navDx > 0) nextGalleryPhoto();
            } else if (ctx === 'paleta-modal' && navDx !== 0) {
                cyclePaletaColor(navDx);
            } else if (ctx !== 'letter' && ctx !== 'game2' && ctx !== 'game1' && ctx !== 'credits-modal') {
                moveSpatialFocus(navDx, navDy);
            }
        } else if (navDx === 0 && navDy === 0) {
            state.lastNavTime = 0;
        }

        var btnMap = getButtonMapping();
        var confirmPressed = isBtnPressed(pad, btnMap.confirm);
        var isCs6HoldBtn = (state.focusedEl && state.focusedEl.id === 'cs6-hold-btn');
        if (ctx === 'letter' || isCs6HoldBtn) {
            handleBiometricHold(confirmPressed, now, isCs6HoldBtn);
            state.lastBtnState[btnMap.confirm] = confirmPressed;
        } else {
            if (wasBtnJustPressed(pad, btnMap.confirm)) {
                triggerPrimaryAction();
            }
        }

        if (wasBtnJustPressed(pad, btnMap.back)) {
            triggerBackAction();
        }

        if (wasBtnJustPressed(pad, btnMap.alt1)) {
            if (state.vkbdOpen && state.vkbdTargetInput) {
                state.vkbdTargetInput.value = state.vkbdTargetInput.value.slice(0, -1);
                dispatchInputChange(state.vkbdTargetInput);
                pulseHaptic(24, 0.2, 0.08);
            } else if (state.focusedEl && (state.focusedEl.id === 'yt-facade' || (state.focusedEl.closest && state.focusedEl.closest('#tu-cancion, #enigma-28')))) {
                toggleTulipanesVideo();
            }
        }

        if (wasBtnJustPressed(pad, btnMap.alt2) && state.vkbdOpen) {
            submitVirtualKeyboard();
        }

        if (wasBtnJustPressed(pad, btnMap.l1)) {
            if (ctx === 'game2') triggerPrimaryAction();
            else if (ctx === 'lightbox') prevGalleryPhoto();
            else if (ctx === 'paleta-modal') cyclePaletaColor(-1);
            else if (ctx === 'credits-modal') jumpCreditsSection(-1);
            else if (ctx === 'voice-modal') cycleVoiceTab(-1);
            else jumpSection(-1);
        }
        if (wasBtnJustPressed(pad, btnMap.r1)) {
            if (ctx === 'game2') triggerPrimaryAction();
            else if (ctx === 'lightbox') nextGalleryPhoto();
            else if (ctx === 'paleta-modal') cyclePaletaColor(1);
            else if (ctx === 'credits-modal') jumpCreditsSection(1);
            else if (ctx === 'voice-modal') cycleVoiceTab(1);
            else jumpSection(1);
        }

        if (wasBtnJustPressed(pad, btnMap.menu)) {
            toggleMainMenu();
        }

        updateHUD();
    }

    // ─── Event Listeners ─────────────────────────────────────────────────────
    window.addEventListener('gamepadconnected', function (e) {
        var gp = e.gamepad;
        if (!gp) return;
        state.connected = true;
        state.activeMode = true;
        hideMouseCursor();
        state.gamepadIndex = gp.index;
        state.brand = detectBrand(gp.id);
        state.controllerName = cleanControllerName(gp.id);
        state.lastInputTime = performance.now();

        injectStylesAndUI();
        showGamepadToast('Mando detectado', '', true);
        ensureValidFocus();
        updateHUD();
        pulseHaptic(75, 0.5, 0.3);
    });

    window.addEventListener('gamepaddisconnected', function () {
        showMouseCursor();
        state.connected = false;
        state.activeMode = false;
        state.gamepadIndex = null;
        state.scrollVelocityY = 0;
        if (state.focusedEl) {
            state.focusedEl.classList.remove('gp-focus');
        }
        closeVirtualKeyboard();
        showGamepadToast('Mando desconectado', '', false);
        updateHUD();
    });

    window.addEventListener('mousemove', function (e) {
        if (!e.isTrusted) return;
        if (lastMouseX === null || lastMouseY === null) {
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            return;
        }
        var dist = Math.hypot(e.clientX - lastMouseX, e.clientY - lastMouseY);
        if (dist > 10) {
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            showMouseCursor();
        }
    }, { passive: true });

    window.addEventListener('mousedown', function (e) {
        if (!e.isTrusted) return;
        showMouseCursor();
    }, { passive: true });

    window.addEventListener('pointerdown', function (e) {
        if (!e.isTrusted) return;
        if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
            showMouseCursor();
        }
    }, { passive: true });

    window.addEventListener('blur', function () {
        showMouseCursor();
    }, { passive: true });

    window.GamepadEngine28E = {
        getState: function () { return state; },
        hideCursor: hideMouseCursor,
        showCursor: showMouseCursor,
        focusNext: function (dx, dy) { state.activeMode = true; hideMouseCursor(); state.lastInputTime = performance.now(); moveSpatialFocus(dx, dy); },
        pressConfirm: function () { state.activeMode = true; hideMouseCursor(); state.lastInputTime = performance.now(); triggerPrimaryAction(); },
        pressBack: function () { state.activeMode = true; hideMouseCursor(); state.lastInputTime = performance.now(); triggerBackAction(); },
        jumpCategory: function (dir) { state.activeMode = true; hideMouseCursor(); state.lastInputTime = performance.now(); jumpSection(dir); },
        openKeyboard: openVirtualKeyboard,
        showToast: showGamepadToast,
        updateHUD: updateHUD,
        onMenuOpened: onMenuOpened,
        onRecipeModalOpened: onRecipeModalOpened,
        onCreditsModalOpened: onCreditsModalOpened,
        jumpCreditsSection: jumpCreditsSection,
        onSpotlightExpandChanged: onSpotlightExpandChanged,
        onOverlayShown: handleOverlayShown,
        onOverlayHidden: handleOverlayHidden,
        onGame4RoundLoaded: handleGame4RoundLoaded,
        openGalleryLightbox: openGalleryLightbox,
        closeGalleryLightbox: closeGalleryLightbox,
        cyclePaleta: cyclePaletaColor,
        toggleTulipanesVideo: toggleTulipanesVideo,
        isAuthMenuOpen: isAuthMenuOpen,
        onAuthMenuOpened: onAuthMenuOpened,
        isVoiceModalOpen: isVoiceModalOpen,
        onVoiceModalOpened: onVoiceModalOpened,
        onVoiceModalClosed: onVoiceModalClosed,
        isVoiceHistoryOpen: isVoiceHistoryOpen,
        onVoiceHistoryOpened: onVoiceHistoryOpened,
        onVoiceHistoryClosed: onVoiceHistoryClosed,
        cycleVoiceTab: cycleVoiceTab
    };
    window.__28EGamepad = window.GamepadEngine28E;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            injectStylesAndUI();
            requestAnimationFrame(pollGamepad);
        });
    } else {
        injectStylesAndUI();
        requestAnimationFrame(pollGamepad);
    }
})();

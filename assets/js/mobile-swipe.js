
        // ═══════════════════════════════════════════════════════════════
        // MOBILE SWIPE NAVIGATION SYSTEM
        // ═══════════════════════════════════════════════════════════════
        (function () {
            'use strict';

            // Check if device is mobile + has touch
            function isMobileDevice() {
                return window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
            }

            if (!isMobileDevice()) {
                // Also listen for resize in case orientation changes
                window.addEventListener('resize', function () {
                    if (isMobileDevice() && !window._swipeInitialized) {
                        initAllSwipe();
                    }
                });
                return;
            }

            window._swipeInitialized = true;
            initAllSwipe();

            function initAllSwipe() {

                // ──────────────────────────────────────────────────
                // UTILITY: Generic swipe detector
                // ──────────────────────────────────────────────────
                function attachSwipe(el, onLeft, onRight, opts) {
                    if (!el) return;
                    opts = opts || {};
                    var threshold = opts.threshold || 50;
                    var startX = 0, startY = 0;

                    el.addEventListener('touchstart', function (e) {
                        var t = e.changedTouches[0];
                        startX = t.pageX;
                        startY = t.pageY;
                    }, { passive: true });

                    el.addEventListener('touchend', function (e) {
                        var t = e.changedTouches[0];
                        var dx = t.pageX - startX;
                        var dy = t.pageY - startY;

                        // Only trigger if horizontal swipe is dominant
                        if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.3) {
                            if (dx < 0) {
                                onLeft();
                            } else {
                                onRight();
                            }
                        }
                    }, { passive: true });
                }

                // ──────────────────────────────────────────────────
                // UTILITY: Create dot indicators
                // ──────────────────────────────────────────────────
                function createDots(container, count, activeIndex, onDotClick, extraClass) {
                    // Remove existing dots
                    var existing = container.querySelector('.swipe-dots' + (extraClass ? '.' + extraClass : ''));
                    if (existing) existing.remove();

                    var dotsWrap = document.createElement('div');
                    dotsWrap.className = 'swipe-dots' + (extraClass ? ' ' + extraClass : '');

                    for (var i = 0; i < count; i++) {
                        var dot = document.createElement('button');
                        dot.className = 'swipe-dot' + (i === activeIndex ? ' active' : '');
                        dot.setAttribute('aria-label', 'Ir a ' + (i + 1));
                        dot.dataset.idx = i;
                        dot.addEventListener('click', function () {
                            onDotClick(parseInt(this.dataset.idx));
                        });
                        dotsWrap.appendChild(dot);
                    }

                    container.appendChild(dotsWrap);
                    return dotsWrap;
                }

                function updateDots(dotsWrap, activeIndex) {
                    if (!dotsWrap) return;
                    var dots = dotsWrap.querySelectorAll('.swipe-dot');
                    dots.forEach(function (d, i) {
                        d.classList.toggle('active', i === activeIndex);
                    });
                }

                // Remove animation classes utility
                function clearSwipeAnims(el) {
                    el.classList.remove('swipe-anim-left-in', 'swipe-anim-right-in',
                        'swipe-anim-left-out', 'swipe-anim-right-out',
                        'paleta-view-swipe-left', 'paleta-view-swipe-right',
                        'rcp-swipe-left-in', 'rcp-swipe-right-in');
                }

                // ==============================================================
                // 1. PALETA DE YAIRE — View Tabs (Grid ↔ Lista ↔ Mezclador)
                // ==============================================================
                (function () {
                    var views = ['grid', 'list', 'mixer'];
                    var viewContainerIds = ['view-grid2', 'view-list2', 'view-mixer2'];
                    var currentView = 0;

                    var section = document.getElementById('colores-yaire');
                    if (!section) return;

                    // Find the toggle buttons wrapper
                    var toggleWrap = section.querySelector('.pvbtn-wrap');
                    if (!toggleWrap) return;

                    // Add translatable hint only (no dots)
                    var dotsContainer = toggleWrap.parentElement;
                    var hint = document.createElement('div');
                    hint.className = 'swipe-hint';
                    hint.setAttribute('data-i18n', 'pal_swipe_hint');
                    hint.textContent = (typeof dictionary !== 'undefined' && dictionary[currentLang] && dictionary[currentLang].pal_swipe_hint) || 'Desliza para cambiar vista';
                    dotsContainer.appendChild(hint);

                    // Track current view by intercepting setPV
                    var _origSetPV = window.setPV;
                    window.setPV = function (v) {
                        _origSetPV(v);
                        var idx = views.indexOf(v);
                        if (idx !== -1) currentView = idx;
                    };

                    function goToView(idx, direction) {
                        if (idx < 0 || idx >= views.length || idx === currentView) return;

                        var dir = direction || (idx > currentView ? 'left' : 'right');
                        currentView = idx;
                        setPV(views[currentView]);

                        // Apply animation to new active container
                        var activeContainer = document.getElementById(viewContainerIds[currentView]);
                        if (activeContainer && !activeContainer.classList.contains('hidden')) {
                            clearSwipeAnims(activeContainer);
                            void activeContainer.offsetWidth;
                            activeContainer.classList.add(dir === 'left' ? 'paleta-view-swipe-left' : 'paleta-view-swipe-right');
                            activeContainer.addEventListener('animationend', function handler() {
                                clearSwipeAnims(activeContainer);
                                activeContainer.removeEventListener('animationend', handler);
                            });
                        }
                    }

                    // Attach swipe to the whole section
                    var headerArea = section.querySelector('.max-w-6xl');
                    if (headerArea) {
                        attachSwipe(headerArea,
                            function () { goToView(currentView + 1, 'left'); },
                            function () { goToView(currentView - 1, 'right'); }
                        );
                    }
                })();


                // ==============================================================
                // 2. PALETA DE YAIRE — Color Modal Swipe (inside paleta-modal)
                // ==============================================================
                (function () {
                    var colorKeys = ['verde', 'rojo', 'rosa', 'morado'];
                    var colorDotColors = ['#10B981', '#F43F5E', '#EC4899', '#8B5CF6'];
                    var currentColorIdx = 0;
                    var isSwipeTransitioning = false;

                    var modal = document.getElementById('paleta-modal');
                    if (!modal) return;

                    var panel = modal.querySelector('.paleta-modal-panel');

                    // Create dots only (no hint text) inside the modal panel
                    var dotsWrap = document.createElement('div');
                    dotsWrap.className = 'paleta-modal-swipe-dots';
                    dotsWrap.style.paddingBottom = '12px';
                    for (var i = 0; i < colorKeys.length; i++) {
                        var dot = document.createElement('button');
                        dot.className = 'swipe-dot' + (i === 0 ? ' active' : '');
                        dot.style.background = colorDotColors[i];
                        dot.setAttribute('aria-label', colorKeys[i]);
                        dot.dataset.idx = i;
                        dot.addEventListener('click', function () {
                            goToColor(parseInt(this.dataset.idx));
                        });
                        dotsWrap.appendChild(dot);
                    }

                    // Insert dots at the bottom of the panel
                    if (panel) {
                        panel.appendChild(dotsWrap);
                    }

                    function updateColorDots(idx) {
                        var dots = dotsWrap.querySelectorAll('.swipe-dot');
                        dots.forEach(function (d, i) {
                            if (i === idx) {
                                d.classList.add('active');
                                d.style.background = colorDotColors[i];
                                d.style.boxShadow = '0 0 10px ' + colorDotColors[i] + '80';
                            } else {
                                d.classList.remove('active');
                                d.style.background = colorDotColors[i];
                                d.style.boxShadow = 'none';
                            }
                        });
                    }

                    function goToColor(idx, direction) {
                        if (idx < 0 || idx >= colorKeys.length || idx === currentColorIdx) return;
                        if (isSwipeTransitioning) return;

                        isSwipeTransitioning = true;
                        var dir = direction || (idx > currentColorIdx ? 'left' : 'right');
                        currentColorIdx = idx;

                        // Animate the scrollable content area only (not the whole panel)
                        var scrollContent = panel ? panel.querySelector('.p-6.overflow-y-auto, [class*="overflow-y-auto"]') : null;
                        var headerContent = panel ? panel.querySelector('.p-6.border-b, [class*="border-b"]') : null;

                        // Fade out content briefly
                        if (scrollContent) scrollContent.style.opacity = '0';
                        if (headerContent) headerContent.style.opacity = '0';

                        setTimeout(function () {
                            // Switch color content using the original function
                            _origOpenPaleta(colorKeys[currentColorIdx]);
                            updateColorDots(currentColorIdx);

                            // Fade back in with slight slide
                            if (headerContent) {
                                headerContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                                headerContent.style.transform = 'translateX(' + (dir === 'left' ? '30px' : '-30px') + ')';
                                headerContent.style.opacity = '0';
                                void headerContent.offsetWidth;
                                headerContent.style.transform = 'translateX(0)';
                                headerContent.style.opacity = '1';
                            }
                            if (scrollContent) {
                                scrollContent.style.transition = 'opacity 0.35s ease 0.05s, transform 0.35s ease 0.05s';
                                scrollContent.style.transform = 'translateX(' + (dir === 'left' ? '30px' : '-30px') + ')';
                                scrollContent.style.opacity = '0';
                                void scrollContent.offsetWidth;
                                scrollContent.style.transform = 'translateX(0)';
                                scrollContent.style.opacity = '1';
                            }

                            setTimeout(function () {
                                isSwipeTransitioning = false;
                                // Clean up inline styles
                                if (headerContent) { headerContent.style.transition = ''; headerContent.style.transform = ''; }
                                if (scrollContent) { scrollContent.style.transition = ''; scrollContent.style.transform = ''; }
                            }, 400);
                        }, 150);
                    }

                    // Track which color was opened via the original function
                    var _origOpenPaleta = window.pcOpenPaleta;
                    window.pcOpenPaleta = function (key) {
                        var idx = colorKeys.indexOf(key);
                        if (idx !== -1) currentColorIdx = idx;
                        _origOpenPaleta(key);
                        updateColorDots(currentColorIdx);
                    };

                    // Attach swipe to the modal
                    attachSwipe(modal,
                        function () { goToColor(currentColorIdx + 1, 'left'); },
                        function () { goToColor(currentColorIdx - 1, 'right'); }
                    );
                })();


                // ==============================================================
                // 3. RECIPE MODAL — Tab Swipe (Ingredientes ↔ Paso a Paso ↔ Técnica ↔ El Secreto)
                // ==============================================================
                (function () {
                    var tabOrder = ['ing', 'prep', 'tech', 'secret'];
                    var tabBtnIds = ['rtab-ing', 'rtab-prep', 'rtab-tech', 'rtab-secret'];
                    var currentTab = 0;

                    var scrollArea = document.getElementById('recipe-scroll-area');
                    if (!scrollArea) return;

                    // Track current tab
                    var _origSwitch = window.switchRecipeTabNew;

                    window.switchRecipeTabNew = function (tabId, btn) {
                        var idx = tabOrder.indexOf(tabId);
                        if (idx !== -1) currentTab = idx;
                        _origSwitch(tabId, btn);
                    };

                    // Keep old alias
                    window.switchRecipeTab = function (tId, b) { window.switchRecipeTabNew(tId, b); };

                    function goToRecipeTab(idx, direction) {
                        if (idx < 0 || idx >= tabOrder.length || idx === currentTab) return;

                        var dir = direction || (idx > currentTab ? 'left' : 'right');
                        var tabId = tabOrder[idx];
                        var btn = document.getElementById(tabBtnIds[idx]);

                        currentTab = idx;

                        // Call the original function to switch tabs
                        _origSwitch(tabId, btn);

                        // Apply swipe animation to the pane
                        var pane = document.getElementById('rpane-' + tabId);
                        if (pane) {
                            // Remove default animation
                            pane.classList.remove('rcp-tab-enter');
                            clearSwipeAnims(pane);
                            void pane.offsetWidth;
                            pane.classList.add(dir === 'left' ? 'rcp-swipe-left-in' : 'rcp-swipe-right-in');

                            pane.addEventListener('animationend', function handler() {
                                clearSwipeAnims(pane);
                                pane.removeEventListener('animationend', handler);
                            });
                        }

                        // Scroll the tab button into view
                        if (btn) {
                            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                        }

                        // Scroll content area to top
                        scrollArea.scrollTop = 0;
                    }

                    attachSwipe(scrollArea,
                        function () { goToRecipeTab(currentTab + 1, 'left'); },  // swipe left → next tab
                        function () { goToRecipeTab(currentTab - 1, 'right'); }  // swipe right → prev tab
                    );
                })();

            } // end initAllSwipe
        })();
    
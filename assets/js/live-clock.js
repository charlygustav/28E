
                (function () {
                    // Live clock — cachear referencia fuera de la función (se llama cada 1000ms)
                    var _clockEl = document.getElementById('panel-live-clock');
                    function updatePanelClock() {
                        if (!_clockEl) _clockEl = document.getElementById('panel-live-clock');
                        if (!_clockEl) return;
                        var now = new Date();
                        _clockEl.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    }
                    panelClockInterval = setInterval(updatePanelClock, 1000);
                    updatePanelClock();

                    // Days counter — cachear ref del elemento
                    var _daysEl = document.getElementById('days-counter');
                    function updateDaysCounter() {
                        if (!_daysEl) _daysEl = document.getElementById('days-counter');
                        var startDate = new Date('2026-01-17T00:00:00');
                        var now = new Date();
                        var diff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
                        if (_daysEl) _daysEl.textContent = diff;
                    }
                    updateDaysCounter();

                    // BPM fluctuation
                    var bpmEl = document.getElementById('bpm-value');
                    if (bpmEl) {
                        bpmInterval = setInterval(function () {
                            var bpm = 175 + Math.floor(Math.random() * 15);
                            bpmEl.textContent = bpm;
                        }, 2000);
                    }

                    // Floating hearts in BPM card
                    var heartsContainer = document.getElementById('bpm-hearts-container');
                    if (heartsContainer) {
                        heartsInterval = setInterval(function () {
                            // Cap DOM nodes: skip spawn if already 12 hearts active
                            if (heartsContainer.children.length >= 12) return;
                            var h = document.createElement('span');
                            h.textContent = ['❤️', '💖', '💗', '💓'][Math.floor(Math.random() * 4)];
                            h.style.cssText = 'position:absolute;bottom:0;font-size:' + (12 + Math.random() * 14) + 'px;left:' + (Math.random() * 100) + '%;opacity:0.6;animation:panel-heart-float ' + (2 + Math.random() * 2) + 's ease-out forwards;pointer-events:none;';
                            heartsContainer.appendChild(h);
                            setTimeout(function () { if (h.parentNode) h.remove(); }, 4000);
                        }, 800);
                    }

                    let _isPanelVisible = true;
                    const panelObs = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            _isPanelVisible = entry.isIntersecting;
                            if (!_isPanelVisible || document.hidden) {
                                if (panelClockInterval) { clearInterval(panelClockInterval); panelClockInterval = null; }
                                if (bpmInterval) { clearInterval(bpmInterval); bpmInterval = null; }
                                if (heartsInterval) { clearInterval(heartsInterval); heartsInterval = null; }
                            } else {
                                if (!panelClockInterval) panelClockInterval = setInterval(updatePanelClock, 1000);
                                if (bpmEl && !bpmInterval) {
                                    bpmInterval = setInterval(function () {
                                        var bpm = 175 + Math.floor(Math.random() * 15);
                                        bpmEl.textContent = bpm;
                                    }, 2000);
                                }
                                if (heartsContainer && !heartsInterval) {
                                    heartsInterval = setInterval(function () {
                                        if (heartsContainer.children.length >= 12) return;
                                        var h = document.createElement('span');
                                        h.textContent = ['❤️', '💖', '💗', '💓'][Math.floor(Math.random() * 4)];
                                        h.style.cssText = 'position:absolute;bottom:0;font-size:' + (12 + Math.random() * 14) + 'px;left:' + (Math.random() * 100) + '%;opacity:0.6;animation:panel-heart-float ' + (2 + Math.random() * 2) + 's ease-out forwards;pointer-events:none;';
                                        heartsContainer.appendChild(h);
                                        setTimeout(function () { if (h.parentNode) h.remove(); }, 4000);
                                    }, 800);
                                }
                            }
                        });
                    }, { threshold: 0.1 });

                    if (document.getElementById('dashboard')) {
                        panelObs.observe(document.getElementById('dashboard'));
                    } else if (bpmEl) {
                        panelObs.observe(bpmEl);
                    }

                    document.addEventListener('visibilitychange', function () {
                        if (document.hidden) {
                            if (panelClockInterval) { clearInterval(panelClockInterval); panelClockInterval = null; }
                            if (bpmInterval) { clearInterval(bpmInterval); bpmInterval = null; }
                            if (heartsInterval) { clearInterval(heartsInterval); heartsInterval = null; }
                        } else if (_isPanelVisible) {
                            if (!panelClockInterval) panelClockInterval = setInterval(updatePanelClock, 1000);
                            if (bpmEl && !bpmInterval) {
                                bpmInterval = setInterval(function () {
                                    var bpm = 175 + Math.floor(Math.random() * 15);
                                    bpmEl.textContent = bpm;
                                }, 2000);
                            }
                            if (heartsContainer && !heartsInterval) {
                                heartsInterval = setInterval(function () {
                                    if (heartsContainer.children.length >= 12) return;
                                    var h = document.createElement('span');
                                    h.textContent = ['❤️', '💖', '💗', '💓'][Math.floor(Math.random() * 4)];
                                    h.style.cssText = 'position:absolute;bottom:0;font-size:' + (12 + Math.random() * 14) + 'px;left:' + (Math.random() * 100) + '%;opacity:0.6;animation:panel-heart-float ' + (2 + Math.random() * 2) + 's ease-out forwards;pointer-events:none;';
                                    heartsContainer.appendChild(h);
                                    setTimeout(function () { if (h.parentNode) h.remove(); }, 4000);
                                }, 800);
                            }
                        }
                    });

                    // Gauge animation on scroll
                    var gaugesAnimated = false;
                    var gaugeObs = new IntersectionObserver(function (entries) {
                        entries.forEach(function (e) {
                            if (e.isIntersecting && !gaugesAnimated) {
                                gaugesAnimated = true;
                                document.querySelectorAll('.gauge-card').forEach(function (card, i) {
                                    setTimeout(function () {
                                        var pct = parseFloat(card.dataset.gaugePct) || 0;
                                        var ring = card.querySelector('.gauge-ring');
                                        var val = card.querySelector('.gauge-value');
                                        var circumference = 113.1;
                                        var offset = circumference - (pct / 100 * circumference);
                                        if (ring) ring.style.strokeDashoffset = offset;
                                        // Animate number
                                        var start = 0;
                                        var duration = 1200;
                                        var startTime = null;
                                        function animate(ts) {
                                            if (!startTime) startTime = ts;
                                            var progress = Math.min((ts - startTime) / duration, 1);
                                            var current = Math.round(progress * pct);
                                            if (val) val.textContent = current + '%';
                                            if (progress < 1) requestAnimationFrame(animate);
                                        }
                                        requestAnimationFrame(animate);
                                    }, i * 120);
                                });
                                gaugeObs.disconnect();
                            }
                        });
                    }, { threshold: 0.05, rootMargin: '50px 0px' });
                    var gaugeSection = document.getElementById('estadisticas');
                    if (gaugeSection) gaugeObs.observe(gaugeSection);
                })();
            
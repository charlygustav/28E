
        document.addEventListener("DOMContentLoaded", () => {
            if (typeof initRouletteSlot === 'function') initRouletteSlot();
            initCinemascopeHold();
        });

        function initCinemascopeHold() {
            const btn = document.getElementById('cs-hold-btn');
            const circle = document.getElementById('cs-hold-circle-val');
            const icon = document.getElementById('cs-hold-icon');
            const label = document.getElementById('cs-hold-label');
            const sub = document.getElementById('cs-hold-sub');
            if (!btn || !circle) return;

            let holdTimer = null;
            let startTime = 0;
            const HOLD_DURATION = 3000;
            const CIRCUMFERENCE = 691;
            let unlocked = false;

            window.__csResetHold = () => {
                unlocked = false;
                if (icon) icon.textContent = '🔒';
                if (label) label.textContent = 'Juramento V';
                if (sub) sub.textContent = 'Mantén 3s para revelar';
                circle.style.strokeDashoffset = CIRCUMFERENCE;
                btn.style.boxShadow = '0 0 40px rgba(0, 0, 0, 0.8)';
                btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                btn.style.transform = 'scale(1)';
            };

            window.__csConfirmSeal = () => {
                unlocked = true;
                if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('gameopen.wav', 1);
                if (icon) icon.textContent = '💖';
                if (label) label.textContent = '¡Juramento Sellado!';
                if (sub) sub.textContent = '28 de Junio 2026';
                btn.style.boxShadow = '0 0 100px rgba(236, 72, 153, 0.6)';
                btn.style.borderColor = '#ec4899';
            };

            function startHold(e) {
                if (unlocked) return;
                if (e.cancelable && e.type === 'touchstart') e.preventDefault();
                startTime = performance.now();
                if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('magic.wav', 0.5);
                btn.style.boxShadow = '0 0 70px rgba(245, 158, 11, 0.4)';
                btn.style.transform = 'scale(0.96)';

                function loop(now) {
                    const elapsed = now - startTime;
                    const progress = Math.min(1, elapsed / HOLD_DURATION);
                    circle.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);

                    const secondsLeft = Math.ceil((HOLD_DURATION - elapsed) / 1000);
                    if (sub && secondsLeft > 0) sub.textContent = secondsLeft + 's restantes...';

                    if (progress < 1) {
                        holdTimer = requestAnimationFrame(loop);
                    } else {
                        triggerUnlock();
                    }
                }
                holdTimer = requestAnimationFrame(loop);
            }

            function cancelHold() {
                if (unlocked) return;
                if (holdTimer) cancelAnimationFrame(holdTimer);
                holdTimer = null;
                circle.style.strokeDashoffset = CIRCUMFERENCE;
                if (sub) sub.textContent = 'Mantén 3s para revelar';
                btn.style.boxShadow = '0 0 40px rgba(0, 0, 0, 0.8)';
                btn.style.transform = 'scale(1)';
            }

            function triggerUnlock() {
                unlocked = true; // Lock temporarily while modal is open
                if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('magic.wav', 1);
                btn.style.boxShadow = '0 0 80px rgba(245, 158, 11, 0.8)';
                btn.style.borderColor = '#f59e0b';
                if (sub) sub.textContent = 'Abriendo Bóveda...';

                if (window.__loadConfetti) {
                    window.__loadConfetti().then(confetti => {
                        if (confetti) confetti({ particleCount: 250, spread: 120, origin: { y: 0.6 }, colors: ['#f59e0b', '#ec4899', '#fbbf24', '#ffffff'], zIndex: 99999 });
                    });
                }
                showCinemascopeRewardModal();
            }

            btn.addEventListener('mousedown', startHold);
            btn.addEventListener('touchstart', startHold, { passive: false });
            window.addEventListener('mouseup', cancelHold);
            btn.addEventListener('mouseleave', cancelHold);
            window.addEventListener('touchend', cancelHold);
            window.addEventListener('touchcancel', cancelHold);
        }

        function showCinemascopeRewardModal() {
            if (document.getElementById('cs-reward-modal')) return;
            const m = document.createElement('div');
            m.id = 'cs-reward-modal';
            m.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl overflow-y-auto';
            m.style.opacity = '0';
            m.innerHTML = `
                  <div id="cs-modal-card" class="bg-zinc-950/80 backdrop-blur-3xl border border-amber-500/20 p-6 sm:p-8 rounded-[2rem] max-w-lg sm:max-w-2xl w-full max-h-[85vh] flex flex-col justify-between my-auto text-center relative overflow-hidden transform-gpu">
                      
                      <!-- Decorative Orbs -->
                      <div class="absolute -right-32 -top-32 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
                      <div class="absolute -left-32 -bottom-32 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse" style="animation-delay: 2s;"></div>
                      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-black/40 to-black/90 pointer-events-none z-0"></div>
                      
                      <button onclick="closeCinemascopeModal(false)" class="absolute top-4 right-4 sm:top-5 sm:right-5 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all z-20 text-xs shadow-md" title="Cancelar y no sellar (Esc)">✕</button>
  
                      <div class="relative z-10 flex-shrink-0 mt-6">
                          <div class="inline-flex flex-wrap justify-center items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-amber-500/10 border border-amber-500/30 text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] text-amber-300 mb-4">
                              <span>✦ Pacto Sellado: 10 Feb 2026 (11:13 PM) ✦ Te Amo #1,034</span>
                          </div>
                          
                          <div class="relative inline-block mb-3">
                              <div class="text-4xl sm:text-5xl select-none">🌷</div>
                              <div class="absolute inset-0 bg-pink-500/20 blur-xl rounded-full"></div>
                          </div>
                          
                          <h3 class="text-2xl sm:text-3xl md:text-4xl font-black text-amber-400 mb-2 tracking-tight">El Juramento de 5 Meses</h3>
                          <div class="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-4"></div>
                      </div>
                      
                      <div class="relative z-10 flex-1 overflow-y-auto text-left bg-black/40 backdrop-blur-md border border-white/5 p-5 sm:p-7 rounded-2xl my-2 space-y-4 font-serif text-sm sm:text-base text-zinc-200/90 leading-relaxed custom-scrollbar shadow-inner">
                          <p class="italic text-amber-300/90 text-base sm:text-lg tracking-wide font-medium">"Mi amada Yaire,</p>
                          
                          <p class="first-letter:text-4xl first-letter:font-bold first-letter:text-amber-400 first-letter:mr-1 first-letter:float-left">Hoy, 28 de junio, sellamos nuestro quinto mes oficial. Cinco meses desde que nuestros mundos colisionaron para nunca más separarse. Parece que fue ayer cuando una simple conversación encendió una chispa, y hoy esa chispa es el fuego que abriga mis madrugadas y le da sentido a cada uno de mis días.</p>
                          
                          <p>Quiero que sepas que la distancia física entre nosotros es solo un espejismo; mi alma está entrelazada con la tuya a cada segundo que pasa. Cada línea de código de este santuario virtual, cada detalle que preparo minuciosamente para ti, lo hago pensando en la curva de tu sonrisa, en la calidez de tu voz y en la luz inagotable de tu mirada.</p>
                          
                          <p>Eres mi paz absoluta en medio del caos, mi musa eterna y el amor de mi vida. Hemos superado tormentas, océanos de kilómetros y madrugadas de insomnio, pero si de algo estoy seguro hoy, es de que cada obstáculo solo ha forjado nuestro vínculo hasta convertirlo en titanio puro.</p>
                          
                          <p>Cinco meses se sienten como un suspiro, pero son solo el hermoso prólogo de nuestra historia. Estoy listo para construir los siglos enteros que nos esperan, para borrar la distancia de una vez por todas y para amanecer abrazado a ti todos los días que me queden de vida.</p>
                          
                          <p class="font-medium text-amber-100">Te amo con cada latido, cada aliento y cada pensamiento que habita en mí."</p>
                          
                          <div class="pt-4 border-t border-white/5 mt-4">
                              <p class="text-right font-bold text-amber-400 text-xs sm:text-sm tracking-[0.15em] uppercase">— Siempre tuyo, Charles Gustav 💖</p>
                          </div>
                      </div>
  
                      <div class="relative z-10 flex-shrink-0 mt-5">
                          <button onclick="closeCinemascopeModal(true)" class="w-full py-4 sm:py-4 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-amber-500 text-black font-black text-xs sm:text-sm tracking-[0.2em] uppercase hover:brightness-110 active:scale-95 transition-all hover: bg-[length:200%_auto] animate-gradient">
                              Guardar Juramento en mi Alma
                          </button>
                      </div>
                  </div>`;

            // Click outside backdrop to close WITHOUT sealing
            m.addEventListener('click', (e) => {
                if (e.target === m) closeCinemascopeModal(false);
            });

            document.body.appendChild(m);

            // GSAP Jaw-Dropping 3D Entrance Animation
            if (typeof gsap !== 'undefined') {
                const card = document.getElementById('cs-modal-card');
                gsap.set(card, { scale: 0.7, opacity: 0, y: 50, rotationX: 12 });
                gsap.to(m, { opacity: 1, duration: 0.3, ease: 'power2.out' });
                gsap.to(card, { scale: 1, opacity: 1, y: 0, rotationX: 0, duration: 0.65, ease: 'back.out(1.6)', delay: 0.05 });
            } else {
                m.style.opacity = '1';
            }

            // Escape key listener (closes WITHOUT sealing)
            window.__csEscHandler = (e) => {
                if (e.key === 'Escape') closeCinemascopeModal(false);
            };
            window.addEventListener('keydown', window.__csEscHandler);
        }

        window.closeCinemascopeModal = function (confirmSeal) {
            const m = document.getElementById('cs-reward-modal');
            if (!m) return;
            if (window.__csEscHandler) {
                window.removeEventListener('keydown', window.__csEscHandler);
                window.__csEscHandler = null;
            }

            function finish() {
                m.remove();
                if (confirmSeal === true) {
                    if (window.__csConfirmSeal) window.__csConfirmSeal();
                } else {
                    if (window.__csResetHold) window.__csResetHold();
                }
            }

            if (typeof gsap !== 'undefined') {
                const card = document.getElementById('cs-modal-card');
                gsap.to(card, { scale: 0.85, opacity: 0, y: 20, duration: 0.25, ease: 'power2.in' });
                gsap.to(m, { opacity: 0, duration: 0.25, ease: 'power2.in', delay: 0.05, onComplete: finish });
            } else {
                finish();
            }
        };

        // ═══ CINEMASCOPE VI — HOLD TO UNLOCK OATH VI ═══
        (function initCinemascopeVIHold() {
            const btn6 = document.getElementById('cs6-hold-btn');
            const circle6 = document.getElementById('cs6-hold-circle-val');
            const icon6 = document.getElementById('cs6-hold-icon');
            const label6 = document.getElementById('cs6-hold-label');
            const sub6 = document.getElementById('cs6-hold-sub');
            const oath6 = document.getElementById('cs6-oath');
            if (!btn6 || !circle6) return;

            let holdTimer6 = null;
            let startTime6 = 0;
            const HOLD_DURATION6 = 3000;
            const CIRCUMFERENCE6 = 691;
            let unlocked6 = false;

            function startHold6(e) {
                if (unlocked6) return;
                if (e.cancelable && e.type === 'touchstart') e.preventDefault();
                startTime6 = performance.now();
                if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('magic.wav', 0.5);
                btn6.style.boxShadow = '0 0 70px rgba(245, 158, 11, 0.4)';
                btn6.style.transform = 'scale(0.96)';

                function loop6(now) {
                    var elapsed = now - startTime6;
                    var progress = Math.min(1, elapsed / HOLD_DURATION6);
                    circle6.style.strokeDashoffset = CIRCUMFERENCE6 * (1 - progress);
                    var secondsLeft = Math.ceil((HOLD_DURATION6 - elapsed) / 1000);
                    if (sub6 && secondsLeft > 0) sub6.textContent = secondsLeft + 's restantes...';
                    if (progress < 1) {
                        holdTimer6 = requestAnimationFrame(loop6);
                    } else {
                        triggerUnlock6();
                    }
                }
                holdTimer6 = requestAnimationFrame(loop6);
            }

            function cancelHold6() {
                if (unlocked6) return;
                if (holdTimer6) cancelAnimationFrame(holdTimer6);
                holdTimer6 = null;
                circle6.style.strokeDashoffset = CIRCUMFERENCE6;
                if (sub6) sub6.textContent = 'Mantén 3s para revelar';
                btn6.style.boxShadow = '0 0 40px rgba(0, 0, 0, 0.8)';
                btn6.style.transform = 'scale(1)';
            }

            function triggerUnlock6() {
                unlocked6 = true;
                if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('gameopen.wav', 1);
                if (icon6) icon6.textContent = '🏆';
                if (label6) label6.textContent = '¡Juramento Sellado!';
                if (sub6) sub6.textContent = '28 de Julio 2026 — Medio Año';
                btn6.style.boxShadow = '0 0 100px rgba(245, 158, 11, 0.8)';
                btn6.style.borderColor = '#f59e0b';

                if (window.__loadConfetti) {
                    window.__loadConfetti().then(function (confetti) {
                        if (confetti) confetti({ particleCount: 350, spread: 140, origin: { y: 0.6 }, colors: ['#f59e0b', '#ec4899', '#fbbf24', '#ffffff', '#a78bfa'], zIndex: 99999 });
                    });
                }

                // Reveal the oath as a Modal with GSAP
                const currentOath6 = document.getElementById('cs6-oath');
                if (currentOath6) {
                    currentOath6.style.display = 'flex';
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(currentOath6, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)' });
                    } else {
                        currentOath6.style.opacity = '1';
                    }
                }
            }

            btn6.addEventListener('mousedown', startHold6);
            btn6.addEventListener('touchstart', startHold6, { passive: false });
            window.addEventListener('mouseup', cancelHold6);
            btn6.addEventListener('mouseleave', cancelHold6);
            window.addEventListener('touchend', cancelHold6);
            window.addEventListener('touchcancel', cancelHold6);
        })();

    
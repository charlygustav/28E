
        (async function () {
            // Fecha de desbloqueo: 28 de Abril de 2026 a las 00:00:00 (Mes 3 = Abril)
            const unlockDate = new Date(2026, 3, 28, 0, 0, 0);
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('reset') === '1') {
                localStorage.clear();
                sessionStorage.clear();
            }
            const _FB = 'https://yaire-591ca-default-rtdb.firebaseio.com/config.json';

            // Función para iniciar la cuenta regresiva e inyectar el Toast
            function startMaintenanceCountdown(targetPage = 'mantenimiento') {
                if (!document.body) {
                    window.addEventListener('DOMContentLoaded', () => startMaintenanceCountdown(targetPage), { once: true });
                    return;
                }
                if (document.getElementById('maintenance-countdown-overlay')) return;

                // Detener el polling
                if (typeof _stateInterval !== 'undefined') {
                    clearInterval(_stateInterval);
                }

                const overlay = document.createElement('div');
                overlay.id = 'maintenance-countdown-overlay';
                overlay.className = 'fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-md opacity-0';

                overlay.innerHTML = `
                    <div class="relative p-8 rounded-2xl bg-zinc-900/80 border border-white/10 text-center max-w-sm w-full mx-4 shadow-2xl overflow-hidden backdrop-blur-lg transform scale-95 opacity-0" id="maintenance-card" style="transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease;">
                        <!-- Orbes brillantes decorativos -->
                        <div class="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div class="relative z-10">
                            <!-- Icono de engranaje animado -->
                            <div class="mx-auto w-16 h-16 mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-3xl animate-spin-slow">
                                ⚙️
                            </div>
                            <h3 class="text-xl font-bold text-white mb-2">Mantenimiento</h3>
                            <p class="text-zinc-400 text-sm mb-6 leading-relaxed">
                                La página entrará en mantenimiento en unos segundos. Guardando sesión...
                            </p>
                            
                            <!-- Contador gigante -->
                            <div id="maintenance-countdown-timer" class="text-7xl font-extrabold text-amber-400 tracking-wider">
                                5
                            </div>
                        </div>
                    </div>
                `;

                document.body.appendChild(overlay);

                // Animación de entrada
                setTimeout(() => {
                    overlay.style.opacity = '1';
                    overlay.style.transition = 'opacity 0.5s ease-out';
                    const card = document.getElementById('maintenance-card');
                    if (card) {
                        card.classList.remove('scale-95', 'opacity-0');
                        card.classList.add('scale-100', 'opacity-100');
                    }
                }, 50);

                let timeLeft = 5;
                const timerEl = document.getElementById('maintenance-countdown-timer');

                const countdownInterval = setInterval(() => {
                    timeLeft--;
                    if (timeLeft >= 1) {
                        if (timerEl) {
                            timerEl.textContent = timeLeft;
                            // Animación pop del número
                            if (window.gsap) {
                                window.gsap.fromTo(timerEl,
                                    { scale: 1.6, opacity: 0.3 },
                                    { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }
                                );
                            } else {
                                // Fallback simple de escala con CSS si GSAP no responde temporalmente
                                timerEl.style.transform = 'scale(1.3)';
                                timerEl.style.transition = 'none';
                                setTimeout(() => {
                                    timerEl.style.transform = 'scale(1)';
                                    timerEl.style.transition = 'transform 0.2s ease-out';
                                }, 50);
                            }
                        }
                    } else {
                        clearInterval(countdownInterval);

                        // Animación de salida antes de redirigir
                        const card = document.getElementById('maintenance-card');
                        if (card) {
                            card.style.transform = 'scale(0.8)';
                            card.style.opacity = '0';
                            card.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
                        }
                        overlay.style.opacity = '0';
                        overlay.style.transition = 'opacity 0.3s ease-in';

                        setTimeout(() => {
                            window.location.replace(targetPage);
                        }, 300);
                    }
                }, 1000);
            }

            // Función que lee Firebase y actúa según el estado
            let _isInitialCheck = true; // true solo en el primer checkState al cargar
            async function checkState() {
                // If coming back from maintenance expiry, skip Firebase redirect
                if (localStorage.getItem('yaire_restore') === '1') {
                    localStorage.removeItem('yaire_restore');
                    _isInitialCheck = false;
                    return;
                }
                try {
                    const res = await fetch(_FB + '?nocache=' + Date.now());
                    if (res.ok) {
                        const fbCfg = await res.json();
                        if (fbCfg) {
                            const oldStr = localStorage.getItem('yaire_config');
                            const newStr = JSON.stringify(fbCfg);

                            // Si la configuración cambió y ya teníamos una previa
                            if (oldStr && oldStr !== newStr) {
                                let oldCfg = null;
                                try {
                                    oldCfg = JSON.parse(oldStr);
                                } catch (err) { }
                                localStorage.setItem('yaire_config', newStr);
                                window.dispatchEvent(new CustomEvent('yaire_config_updated', { detail: fbCfg }));
                                // Check if scheduled time is up
                                let timeIsUp = false;
                                if (fbCfg.maintType === 'scheduled' && fbCfg.maintDate) {
                                    const [dPart, tPart] = fbCfg.maintDate.split('T');
                                    const [yyyy, mm, dd] = dPart.split('-');
                                    const [hh, min] = tPart.split(':');
                                    if (Date.now() >= new Date(yyyy, mm - 1, dd, hh, min).getTime()) timeIsUp = true;
                                }

                                if (fbCfg.mantenimiento && !timeIsUp && urlParams.get('dev') !== '1') {
                                    const targetPage = fbCfg.maintScreen === 'cinematic' ? 'Yaire_Trailer_Cinematico.html' : fbCfg.maintScreen === 'trailer' ? 'tulipanes.html' : 'mantenimiento.html';
                                    // Solo si el estado previo NO era mantenimiento y ahora sí es mantenimiento
                                    if (oldCfg && !oldCfg.mantenimiento) {
                                        startMaintenanceCountdown(targetPage);
                                    } else {
                                        window.location.replace(targetPage);
                                    }
                                } else if (!_isInitialCheck && !sessionStorage.getItem('yaire_reloaded')) {
                                    // Solo recargar durante polling (no al abrir la página)
                                    // Máximo 1 reload por sesión para evitar loops infinitos
                                    sessionStorage.setItem('yaire_reloaded', '1');
                                    window.location.reload();
                                }
                                // En carga inicial: solo actualizar localStorage, sin reload
                                _isInitialCheck = false;
                                return;
                            } else if (!oldStr) {
                                localStorage.setItem('yaire_config', newStr);
                                window.dispatchEvent(new CustomEvent('yaire_config_updated', { detail: fbCfg }));
                            }

                            let timeIsUp = false;
                            if (fbCfg.maintType === 'scheduled' && fbCfg.maintDate) {
                                const [dPart, tPart] = fbCfg.maintDate.split('T');
                                const [yyyy, mm, dd] = dPart.split('-');
                                const [hh, min] = tPart.split(':');
                                if (Date.now() >= new Date(yyyy, mm - 1, dd, hh, min).getTime()) timeIsUp = true;
                            }
                            if (fbCfg.mantenimiento && !timeIsUp && urlParams.get('dev') !== '1') {
                                const targetPage = fbCfg.maintScreen === 'cinematic' ? 'Yaire_Trailer_Cinematico.html' : fbCfg.maintScreen === 'trailer' ? 'tulipanes.html' : 'mantenimiento.html';
                                window.location.replace(targetPage);
                                return;
                            }
                        }
                    }
                } catch (e) { }

                // Si no hay mantenimiento, verificar fecha de lanzamiento
                if (new Date() < unlockDate && urlParams.get('dev') !== '1') {
                    window.location.replace('mantenimiento.html');
                }
                _isInitialCheck = false;
            }

            // Chequeo inmediato al cargar
            await checkState();

            // Polling cada 3 segundos para detectar cambios del admin en tiempo real
            // Guard: no hacer fetch mientras la pestaña está oculta (ahorra batería y red)
            let _stateInterval = setInterval(() => { if (!document.hidden) checkState(); }, 8000);
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) checkState(); // Chequeo inmediato al volver
            });
        })();
    
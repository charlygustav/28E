
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
        import { getDatabase, ref, push, onValue, onDisconnect, set, serverTimestamp, get, remove, update, runTransaction } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js';
        import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js';

        // Redirección de 127.0.0.1 a localhost para compatibilidad con dominios autorizados de Firebase Auth
        if (window.location.hostname === '127.0.0.1') {
            window.location.replace(window.location.href.replace('127.0.0.1', 'localhost'));
        }

        const firebaseConfig = {
            apiKey: "AIzaSyDFkuktrXnsV9-jg2bv5dpJQRR-he8PT3g",
            authDomain: "yaire-591ca.firebaseapp.com",
            databaseURL: "https://yaire-591ca-default-rtdb.firebaseio.com",
            projectId: "yaire-591ca",
            storageBucket: "yaire-591ca.firebasestorage.app",
            messagingSenderId: "450381430658",
            appId: "1:450381430658:web:262d1bb7b1732c3990d99b"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        window.yaireRadioFb = { db, ref, onValue, set, serverTimestamp, runTransaction };

        // --- PRESENCIA ---
        const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        const presenceRef = ref(db, 'presence/' + sessionId);

        onDisconnect(presenceRef).remove();

        // Heartbeat cada 30 segundos
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                updatePresence();
            }
        }, 30000);


        window.addEventListener('beforeunload', () => {
            remove(presenceRef);
        });

        let currentSection = "Navegando";
        let userLocation = "Buscando...";
        let currentUser = null;

        fetch('https://get.geojs.io/v1/ip/geo.json').then(r => r.json()).then(d => {
            userLocation = `${d.city || 'Desconocido'}, ${d.country || ''}`;
            updatePresence();
        }).catch(() => userLocation = "Desconocida");

        const updatePresence = () => {
            const payload = {
                section: currentSection,
                lastActive: serverTimestamp(),
                userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
                location: userLocation
            };
            if (currentUser) {
                payload.user = {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                    email: currentUser.email
                };
            }
            set(presenceRef, payload);
        };
        updatePresence();
        window.yaireUpdatePresence = (sec) => { currentSection = sec; updatePresence(); };

        // --- VC HISTORY WRAPPERS ---
        window.yaireVcHistoryGet = async () => {
            if (!currentUser) return [];
            try {
                const snap = await get(ref(db, `users/${currentUser.uid}/vc_history`));
                return snap.exists() ? snap.val() : [];
            } catch (e) {
                console.error("Error fetching VC history:", e);
                return [];
            }
        };

        window.yaireVcHistoryAdd = async (sessionData) => {
            if (!currentUser) return;
            // Optimistic update for instant UI response
            if (!window.yaireVcHistoryData) window.yaireVcHistoryData = [];
            window.yaireVcHistoryData.unshift(sessionData);
            window.yaireVcHistoryData = window.yaireVcHistoryData.slice(0, 50);

            try {
                const historyRef = ref(db, `users/${currentUser.uid}/vc_history`);
                await set(historyRef, window.yaireVcHistoryData);
            } catch (e) {
                console.error("Error saving VC history:", e);
            }
        };

        // --- AUTH ---
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const authToggle = document.getElementById('auth-toggle');
        const authIcon = document.getElementById('auth-icon');
        const authAvatar = document.getElementById('auth-avatar');

        onAuthStateChanged(auth, async (user) => {
            currentUser = user;
            window.yaireCurrentUser = user; // Expose globally
            if (user) {
                window.yaireVcHistoryData = await window.yaireVcHistoryGet();

            } else {
                window.yaireVcHistoryData = [];
            }
            window.dispatchEvent(new Event('yaireAuthChanged'));
            if (user) {
                authIcon.classList.add('hidden');
                authAvatar.src = user.photoURL;
                authAvatar.classList.remove('hidden');
                authToggle.title = "Cuenta (" + user.displayName + ")";

                const authMenuAvatar = document.getElementById('auth-menu-avatar');
                const authMenuAvatarPh = document.getElementById('auth-menu-avatar-ph');
                if (authMenuAvatar && user.photoURL) {
                    authMenuAvatar.src = user.photoURL;
                    authMenuAvatar.classList.remove('hidden');
                    authMenuAvatar.style.display = 'block';
                    if (authMenuAvatarPh) {
                        authMenuAvatarPh.classList.add('hidden');
                        authMenuAvatarPh.style.display = 'none';
                    }
                }

                const authMenu = document.getElementById('auth-menu');
                if (authMenu) authMenu.classList.add('logged-in-view');

                authMenuLoggedOut.classList.add('hidden');
                authMenuLoggedOut.classList.remove('flex');
                authMenuLoggedIn.classList.remove('hidden');
                authMenuLoggedIn.classList.add('flex');
                authMenuName.textContent = user.displayName;
                authMenuEmail.textContent = user.email;

                // Guestbook Auth Logic
                const gbPrompt = document.getElementById('gb-auth-prompt');
                const gbFormContainer = document.getElementById('guestbook-form');
                if (gbPrompt && gbFormContainer) {
                    gbPrompt.classList.add('hidden');
                    gbFormContainer.classList.remove('hidden');
                    gbFormContainer.classList.add('flex');
                    const gbName = document.getElementById('gb-name');
                    if (gbName) {
                        gbName.value = user.displayName;
                        gbName.readOnly = true;
                        gbName.classList.add('opacity-70', 'cursor-not-allowed');
                    }
                    const gbBackBtn = document.getElementById('gb-back-btn');
                    if (gbBackBtn) gbBackBtn.classList.add('hidden');
                }
            } else {
                authAvatar.classList.add('hidden');
                authIcon.classList.remove('hidden');
                authToggle.title = "Iniciar sesión";

                const authMenu = document.getElementById('auth-menu');
                if (authMenu) authMenu.classList.remove('logged-in-view');

                const authMenuAvatar = document.getElementById('auth-menu-avatar');
                const authMenuAvatarPh = document.getElementById('auth-menu-avatar-ph');
                if (authMenuAvatar) {
                    authMenuAvatar.classList.add('hidden');
                    authMenuAvatar.style.display = 'none';
                }
                if (authMenuAvatarPh) {
                    authMenuAvatarPh.classList.remove('hidden');
                    authMenuAvatarPh.style.display = 'flex';
                }

                authMenuLoggedIn.classList.add('hidden');
                authMenuLoggedIn.classList.remove('flex');
                authMenuLoggedOut.classList.remove('hidden');
                authMenuLoggedOut.classList.add('flex');

                // Guestbook Auth Logic Reset
                const gbPrompt = document.getElementById('gb-auth-prompt');
                const gbFormContainer = document.getElementById('guestbook-form');
                if (gbPrompt && gbFormContainer) {
                    gbPrompt.classList.remove('hidden');
                    gbFormContainer.classList.add('hidden');
                    gbFormContainer.classList.remove('flex');
                    const gbName = document.getElementById('gb-name');
                    if (gbName) {
                        gbName.value = '';
                        gbName.readOnly = false;
                        gbName.classList.remove('opacity-70', 'cursor-not-allowed');
                    }
                    const gbBackBtn = document.getElementById('gb-back-btn');
                    if (gbBackBtn) gbBackBtn.classList.remove('hidden');
                }
            }
            updatePresence();
        });

        const authMenu = document.getElementById('auth-menu');
        const authMenuLoggedOut = document.getElementById('auth-menu-logged-out');
        const authMenuLoggedIn = document.getElementById('auth-menu-logged-in');
        const authMenuName = document.getElementById('auth-menu-name');
        const authMenuEmail = document.getElementById('auth-menu-email');
        const authBtnLogin = document.getElementById('auth-btn-login');
        const authBtnLogout = document.getElementById('auth-btn-logout');

        let isAuthMenuOpen = false;

        function toggleAuthMenu() {
            isAuthMenuOpen = !isAuthMenuOpen;
            if (isAuthMenuOpen) {
                if (window.playEffect) window.playEffect('sounds/slideralto.wav'); else new Audio('sounds/slideralto.wav').play().catch(() => { });
                authMenu.style.display = 'block';
                void authMenu.offsetWidth;
                authMenu.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
                authMenu.classList.add('opacity-100', 'scale-100');
            } else {
                if (window.playEffect) window.playEffect('sounds/sliderbajo.wav'); else new Audio('sounds/sliderbajo.wav').play().catch(() => { });
                authMenu.classList.remove('opacity-100', 'scale-100');
                authMenu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                setTimeout(() => {
                    if (!isAuthMenuOpen) authMenu.style.display = 'none';
                }, 200);
            }
        }

        authToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAuthMenu();
            const tm = document.getElementById('theme-menu');
            if (tm && !tm.classList.contains('opacity-0')) {
                tm.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                setTimeout(() => { if (tm.classList.contains('opacity-0')) tm.style.display = 'none'; }, 200);
            }
        });

        document.addEventListener('click', (e) => {
            if (isAuthMenuOpen && !authToggle.contains(e.target) && !authMenu.contains(e.target)) {
                toggleAuthMenu();
            }
        });

        function getFriendlyAuthError(err) {
            const code = err.code || '';
            if (code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user') {
                return "Parece que cerraste la ventana antes de terminar. ¡Inténtalo de nuevo cuando estés listo!";
            } else if (code === 'auth/popup-blocked') {
                return "Tu navegador bloqueó la ventana de inicio de sesión. Por favor, permite las ventanas emergentes para este sitio.";
            } else if (code === 'auth/network-request-failed') {
                return "Hubo un problema de conexión. Verifica tu internet e inténtalo de nuevo.";
            } else if (code === 'auth/account-exists-with-different-credential') {
                return "Ese correo ya está registrado de otra forma. Intenta iniciar sesión con el método original que usaste.";
            } else if (code === 'auth/invalid-credential') {
                return "Google rechazó la credencial o el dominio no coincide. Si estás en entorno local, asegúrate de ingresar desde http://localhost:5500; si estás en la web, verifica que tu cuenta tenga acceso.";
            } else if (code === 'auth/unauthorized-domain') {
                return "Este dominio no está autorizado en Firebase. Para desarrollo local, utiliza http://localhost:5500.";
            } else {
                return "Ocurrió un error inesperado al conectar con Google. (Detalle técnico: " + (code || err.message) + ")";
            }
        }

        authBtnLogin.addEventListener('click', () => {
            signInWithPopup(auth, provider).then(() => {
                toggleAuthMenu();
            }).catch(err => {
                console.error("Error logging in:", err, err.code, err.message, err.customData);
                const friendlyMsg = getFriendlyAuthError(err);
                if (window.showPremiumAlert) window.showPremiumAlert("No se pudo iniciar sesión", friendlyMsg, "error"); else alert("Error: " + friendlyMsg);
            });
        });

        authBtnLogout.addEventListener('click', () => {
            signOut(auth).then(() => {
                toggleAuthMenu();
            });
        });

        const gbLoginBtn = document.getElementById('gb-login-btn');
        if (gbLoginBtn) {
            gbLoginBtn.addEventListener('click', () => {
                signInWithPopup(auth, provider).catch(err => {
                    console.error("Error logging in from guestbook:", err);
                    const friendlyMsg = getFriendlyAuthError(err);
                    if (window.showPremiumAlert) window.showPremiumAlert("No se pudo iniciar sesión", friendlyMsg, "error"); else alert("Error: " + friendlyMsg);
                });
            });
        }

        const gbManualBtn = document.getElementById('gb-manual-btn');
        if (gbManualBtn) {
            gbManualBtn.addEventListener('click', () => {
                const gbPrompt = document.getElementById('gb-auth-prompt');
                const gbFormContainer = document.getElementById('guestbook-form');
                if (gbPrompt && gbFormContainer) {
                    gbPrompt.classList.add('hidden');
                    gbFormContainer.classList.remove('hidden');
                    gbFormContainer.classList.add('flex');
                    const gbName = document.getElementById('gb-name');
                    if (gbName) {
                        gbName.value = '';
                        gbName.readOnly = false;
                        gbName.classList.remove('opacity-70', 'cursor-not-allowed');
                        gbName.focus();
                    }
                }
            });
        }

        const gbBackBtn = document.getElementById('gb-back-btn');
        if (gbBackBtn) {
            gbBackBtn.addEventListener('click', () => {
                const gbPrompt = document.getElementById('gb-auth-prompt');
                const gbFormContainer = document.getElementById('guestbook-form');
                if (gbPrompt && gbFormContainer) {
                    gbFormContainer.classList.add('hidden');
                    gbFormContainer.classList.remove('flex');
                    gbPrompt.classList.remove('hidden');
                }
            });
        }

        const observer = new IntersectionObserver((entries) => {
            let activeEntries = entries.filter(e => e.isIntersecting);
            if (activeEntries.length > 0) {
                let target = activeEntries[0].target;
                let secId = target.id;
                const secMap = {
                    "hero": "Inicio",
                    "frase-del-dia": "Frase del Día",
                    "historia": "Nuestra Historia",
                    "nombre": "El Misterio del Nombre",
                    "tulipanes": "Sus Flores Favoritas",
                    "quiz-girasol": "Misterio del Girasol",
                    "distancia": "Distancia",
                    "comida": "Gastronomía",
                    "universo": "Universo",
                    "galeria": "Galería de Arte",
                    "minijuegos": "Zona de Juegos",
                    "promesas": "Mis Promesas",
                    "guestbook": "Muro de Dedicatorias",
                    "colores-yaire": "Colores de Yaire",
                    "memorial": "Memorial",
                    "hype": "Hype",
                    "estadisticas": "Estadísticas",
                    "top5yaire": "Top 5",
                    "enigma-28": "Enigma 28",
                    "secreto": "Sección Secreta"
                };
                currentSection = secMap[secId] || secId || "Navegando";
                updatePresence();
            }
        }, { rootMargin: "-30% 0px -30% 0px" });

        document.querySelectorAll('section').forEach(sec => observer.observe(sec));

        // --- GUESTBOOK ---
        const gbForm = document.getElementById('guestbook-form');
        const gbWall = document.getElementById('guestbook-wall');
        const gbEmpty = document.getElementById('gb-empty');

        let gbEditingId = null;

        const t = (key, fallback) => {
            const lang = typeof currentLang !== 'undefined' ? currentLang : 'es';
            return (dictionary[lang] && dictionary[lang][key]) || fallback;
        };

        const resetGbForm = () => {
            gbEditingId = null;
            gbForm.reset();
            const submitBtn = gbForm.querySelector('button[type="submit"] span');
            if (submitBtn) submitBtn.textContent = dictionary[currentLang]?.gb_btn || 'Publicar Mensaje';
            const cancelBtn = document.getElementById('gb-cancel-edit-btn');
            if (cancelBtn) cancelBtn.remove();

            if (window.yaireCurrentUser) {
                const gbName = document.getElementById('gb-name');
                if (gbName) gbName.value = window.yaireCurrentUser.displayName;
            }
        };

        if (gbForm) {
            gbForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('gb-name').value.trim();
                const msg = document.getElementById('gb-msg').value.trim();
                if (name && msg) {
                    if (gbEditingId) {
                        // UPDATE EXISTING
                        update(ref(db, 'guestbook/' + gbEditingId), {
                            msg: msg,
                            editedAt: serverTimestamp()
                        }).then(() => {
                            if (window.showPremiumAlert) window.showPremiumAlert(t('gb_updated_title', 'Actualizado'), t('gb_updated_msg', 'Tu mensaje ha sido modificado'), 'success');
                            resetGbForm();
                        });
                    } else {
                        // CREATE NEW
                        const messageData = {
                            name: name,
                            msg: msg,
                            timestamp: serverTimestamp()
                        };
                        if (window.yaireCurrentUser) {
                            messageData.uid = window.yaireCurrentUser.uid;
                            messageData.photoURL = window.yaireCurrentUser.photoURL;
                        }
                        push(ref(db, 'guestbook'), messageData).then(() => {
                            resetGbForm();
                        });
                    }
                }
            });
        }

        window.startEditGbMsg = (id, msgText) => {
            gbEditingId = id;
            const gbMsgInput = document.getElementById('gb-msg');
            const gbFormContainer = document.getElementById('guestbook-form');
            if (gbMsgInput && gbFormContainer) {
                gbFormContainer.classList.remove('hidden');
                gbFormContainer.classList.add('flex');

                gbMsgInput.value = msgText;
                gbMsgInput.focus();

                // Change submit text
                const submitBtn = gbFormContainer.querySelector('button[type="submit"] span');
                if (submitBtn) submitBtn.textContent = t('gb_save_changes', 'Guardar Cambios');

                // Add cancel button if not exists
                if (!document.getElementById('gb-cancel-edit-btn')) {
                    const cancelBtn = document.createElement('button');
                    cancelBtn.type = 'button';
                    cancelBtn.id = 'gb-cancel-edit-btn';
                    cancelBtn.className = 'w-full text-zinc-400 font-bold hover:text-red-400 transition-colors text-sm py-2 mt-1';
                    cancelBtn.textContent = t('gb_cancel_edit', 'Cancelar Edición');
                    cancelBtn.onclick = resetGbForm;
                    gbFormContainer.appendChild(cancelBtn);
                }

                // Scroll to form
                document.getElementById('gb-form-anim')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        window.deleteGbMsg = (id) => {
            if (confirm(t('gb_delete_confirm', '¿Estás seguro de que quieres borrar este mensaje para siempre?'))) {
                remove(ref(db, 'guestbook/' + id)).then(() => {
                    if (window.showPremiumAlert) window.showPremiumAlert(t('gb_deleted_title', 'Borrado'), t('gb_deleted_msg', 'El mensaje ha sido eliminado'), 'success');
                });
            }
        };

        onValue(ref(db, 'guestbook'), (snapshot) => {
            if (snapshot.exists()) {
                if (gbEmpty) gbEmpty.style.display = 'none';
                gbWall.innerHTML = '';
                const data = snapshot.val();
                const msgs = Object.entries(data).map(([id, val]) => ({ id, ...val })).sort((a, b) => (b.timestamp || Date.now()) - (a.timestamp || Date.now()));

                msgs.forEach((m, idx) => {
                    const card = document.createElement('div');
                    // Glassmorphism card styles with masonry break-inside-avoid
                    card.className = "break-inside-avoid inline-block w-full mb-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-white/40 dark:border-zinc-700/40 rounded-3xl p-6 shadow-xl shadow-zinc-200/30 dark:shadow-none hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 group relative overflow-hidden gb-card-anim";
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';

                    const dateText = m.timestamp ? new Date(m.timestamp).toLocaleDateString() : t('gb_recent', 'Reciente');
                    const safeName = document.createElement('div'); safeName.innerText = m.name || 'Anónimo';
                    const safeMsg = document.createElement('div'); safeMsg.innerText = m.msg || '';
                    const initial = (safeName.innerText.charAt(0) || '?').toUpperCase();

                    // Generate a seeded color based on name length so it stays consistent
                    const colors = ['bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'];
                    const colorClass = colors[safeName.innerText.length % colors.length];

                    const avatarHTML = m.photoURL
                        ? `<img src="${m.photoURL}" class="w-10 h-10 shrink-0 rounded-full object-cover shadow-inner border border-zinc-200 dark:border-zinc-700" alt="Avatar">`
                        : `<div class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-sm ${colorClass} shadow-inner">${initial}</div>`;

                    let controlsHTML = '';
                    if (window.yaireCurrentUser && m.uid === window.yaireCurrentUser.uid) {
                        controlsHTML = `
                            <div class="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button onclick="window.startEditGbMsg('${m.id}', this.closest('.gb-card-anim').querySelector('.gb-msg-text').innerText)" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-amber-500 hover:bg-white dark:hover:bg-zinc-700 shadow-sm flex items-center justify-center transition-all" title="${t('gb_edit_title', 'Editar mensaje')}">
                                    <i class="ph-bold ph-pencil-simple"></i>
                                </button>
                                <button onclick="window.deleteGbMsg('${m.id}')" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-700 shadow-sm flex items-center justify-center transition-all" title="${t('gb_delete_title', 'Borrar mensaje')}">
                                    <i class="ph-bold ph-trash"></i>
                                </button>
                            </div>
                        `;
                    }

                    const editedTag = m.editedAt ? `<span class="ml-2 text-[9px] font-bold text-zinc-400 lowercase italic">${t('gb_edited_tag', '(editado)')}</span>` : '';

                    card.innerHTML = `
                        <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/20 dark:bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                        ${controlsHTML}
                        <div class="flex items-start gap-4 mb-4 relative z-10 pr-16">
                            ${avatarHTML}
                            <div class="flex-1 pt-1">
                                <h5 class="text-base font-black text-zinc-900 dark:text-white leading-none tracking-tight mb-1">${safeName.innerHTML}</h5>
                                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">${dateText}${editedTag}</span>
                            </div>
                        </div>
                        <p class="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed font-medium relative z-10 gb-msg-text">${safeMsg.innerHTML}</p>
                    `;
                    gbWall.appendChild(card);

                    // Animate in
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, idx * 100);
                });
            } else {
                gbWall.innerHTML = '<div class="col-span-full text-center py-12 text-zinc-400 font-serif italic" id="gb-empty">Aún no hay mensajes. ¡Sé el primero!</div>';
            }
        });

        // --- CONTROL REMOTO (Lluvia de Flores) ---
        let loadTime = Date.now();
        onValue(ref(db, 'live_events/flower_rain/timestamp'), (snapshot) => {
            const val = snapshot.val();
            // Only trigger if the event is NEW (happened after the page loaded)
            if (val && val > loadTime) {
                if (window.triggerFlowerRain) window.triggerFlowerRain();
            }
        });
    
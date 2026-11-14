
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
        import { getDatabase, ref, push, onValue, onDisconnect, set, serverTimestamp, get, remove, update, runTransaction, onChildAdded, onChildChanged, query, orderByKey, orderByChild, limitToLast } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js';
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

        onValue(ref(db, '.info/connected'), snapshot => {
            if (snapshot.val() && currentUser) {
                onDisconnect(presenceRef).remove().then(updatePresence).catch(() => {});
            }
        });

        // Heartbeat cada 30 segundos
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                updatePresence();
            }
        }, 30000);


        window.addEventListener('beforeunload', () => {
            if (currentUser) remove(presenceRef).catch(() => {});
        });

        let currentSection = "Navegando";
        let userLocation = "Buscando...";
        let currentUser = null;

        fetch('https://get.geojs.io/v1/ip/geo.json').then(r => r.json()).then(d => {
            userLocation = `${d.city || 'Desconocido'}, ${d.country || ''}`;
            updatePresence();
        }).catch(() => userLocation = "Desconocida");

        const updatePresence = () => {
            if (!currentUser) return;
            const payload = {
                uid: currentUser.uid,
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
            set(presenceRef, payload).catch(() => {});
        };
        updatePresence();
        window.yaireUpdatePresence = (sec) => { currentSection = sec; updatePresence(); };

        // --- AUTH ---
        const auth = getAuth(app);
        window.yaireVoiceFirebase = { db, sdk: { ref, push, onValue, onChildAdded, onChildChanged, query, orderByKey, orderByChild, limitToLast, onDisconnect, set, get, remove, update, runTransaction, serverTimestamp }, get user() { return auth.currentUser; } };
        window.dispatchEvent(new Event('yaire-voice-firebase-ready'));
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const authToggle = document.getElementById('auth-toggle');
        const authIcon = document.getElementById('auth-icon');
        const authAvatar = document.getElementById('auth-avatar');

        let currentMiiProfile = null;
        let currentGooglePhotoURL = '';

        // Safe avatar loader that prevents broken image icons and handles Google CDN referrerpolicy
        const setupAvatar = (img, placeholder, url) => {
            if (!img) return;
            if (!url) {
                img.classList.add('hidden');
                img.style.display = 'none';
                if (placeholder) {
                    placeholder.classList.remove('hidden');
                    placeholder.style.display = '';
                }
                return;
            }

            img.referrerPolicy = 'no-referrer';
            img.onload = () => {
                img.classList.remove('hidden');
                img.style.display = '';
                if (placeholder) {
                    placeholder.classList.add('hidden');
                    placeholder.style.display = 'none';
                }
            };
            img.onerror = () => {
                img.classList.add('hidden');
                img.style.display = 'none';
                if (placeholder) {
                    placeholder.classList.remove('hidden');
                    placeholder.style.display = '';
                }
            };
            img.src = url;

            if (img.complete && img.naturalWidth > 0) {
                img.classList.remove('hidden');
                img.style.display = '';
                if (placeholder) {
                    placeholder.classList.add('hidden');
                    placeholder.style.display = 'none';
                }
            }
        };

        const applyActiveAvatarToDOM = () => {
            if (!currentUser) {
                const guestMii = (currentMiiProfile && currentMiiProfile.enabled !== false && currentMiiProfile.avatarUrl)
                    ? currentMiiProfile.avatarUrl
                    : '';
                setupAvatar(authAvatar, authIcon, guestMii);
                const authMenuAvatar = document.getElementById('auth-menu-avatar');
                const authMenuAvatarPh = document.getElementById('auth-menu-avatar-ph');
                setupAvatar(authMenuAvatar, authMenuAvatarPh, guestMii);
                return;
            }
            const activeUrl = (currentMiiProfile && currentMiiProfile.enabled !== false && currentMiiProfile.avatarUrl)
                ? currentMiiProfile.avatarUrl
                : currentGooglePhotoURL;
            window.yaireActiveAvatarURL = activeUrl;
            try {
                Object.defineProperty(currentUser, 'photoURL', {
                    get: () => window.yaireActiveAvatarURL || currentGooglePhotoURL,
                    configurable: true
                });
            } catch (e) {}

            const authMenuAvatar = document.getElementById('auth-menu-avatar');
            const authMenuAvatarPh = document.getElementById('auth-menu-avatar-ph');
            setupAvatar(authAvatar, authIcon, activeUrl);
            setupAvatar(authMenuAvatar, authMenuAvatarPh, activeUrl);
            syncAuthUserToLocalStorage();
        };

        const syncAuthUserToCookie = (data) => {
            try {
                const host = window.location.hostname;
                const isProd = host.endsWith('yaire.site');
                const domainStr = isProd ? '; domain=.yaire.site' : '';
                const secureStr = window.location.protocol === 'https:' ? '; Secure' : '';
                if (data) {
                    const payload = encodeURIComponent(JSON.stringify(data));
                    document.cookie = `yaire_auth_user=${payload}; path=/${domainStr}; max-age=2592000; SameSite=Lax${secureStr}`;
                } else {
                    document.cookie = `yaire_auth_user=; path=/${domainStr}; max-age=0; SameSite=Lax${secureStr}`;
                }
            } catch (e) {}
        };

        const syncAuthUserToLocalStorage = () => {
            if (!currentUser) {
                try { localStorage.removeItem('yaire_auth_user'); } catch (e) {}
                syncAuthUserToCookie(null);
                return;
            }
            const hasActiveMii = !!(currentMiiProfile && currentMiiProfile.enabled !== false && currentMiiProfile.avatarUrl);
            const activeUrl = hasActiveMii ? currentMiiProfile.avatarUrl : (currentGooglePhotoURL || currentUser.photoURL || '');
            const rawName = (currentUser.displayName || currentUser.email || 'Gamer').trim();
            const firstName = rawName.split(' ')[0] || 'Gamer';
            const authPayload = {
                uid: currentUser.uid,
                displayName: rawName,
                firstName: firstName,
                email: currentUser.email || '',
                photoURL: currentGooglePhotoURL || currentUser.photoURL || '',
                activeAvatarURL: activeUrl,
                miiActive: hasActiveMii,
                updatedAt: Date.now()
            };
            try {
                localStorage.setItem('yaire_auth_user', JSON.stringify(authPayload));
            } catch (e) {}
            syncAuthUserToCookie(authPayload);
        };

        window.yaireGetCurrentMiiProfile = () => currentMiiProfile;

        window.yaireSaveMiiProfile = async (profilePayload) => {
            currentMiiProfile = profilePayload;
            try {
                localStorage.setItem('yaire_mii_guest', JSON.stringify(profilePayload));
                if (currentUser && currentUser.uid) {
                    localStorage.setItem('yaire_mii_' + currentUser.uid, JSON.stringify(profilePayload));
                    await set(ref(db, `users/${currentUser.uid}/miiProfile`), profilePayload);
                }
            } catch (e) {
                console.warn('Error guardando miiProfile en Firebase:', e);
            }
            applyActiveAvatarToDOM();
            syncAuthUserToLocalStorage();
            window.dispatchEvent(new Event('yaireAuthChanged'));
            updatePresence();
        };

        let hasInitialAuthRun = false;
        onAuthStateChanged(auth, async (user) => {
            const isFreshLogin = hasInitialAuthRun && !currentUser && !!user;
            currentUser = user;
            window.yaireCurrentUser = user; // Expose globally
            if (!user && window.yaireVoiceChannel?.socket) window.yaireVoiceChannel._leave();
            if (user) {
                onDisconnect(presenceRef).remove().catch(() => {});
                updatePresence();
                currentGooglePhotoURL = user.photoURL || '';
                window.yaireGooglePhotoURL = currentGooglePhotoURL;

                // Load cached Mii immediately for 0ms startup
                try {
                    const cached = localStorage.getItem('yaire_mii_' + user.uid) || localStorage.getItem('yaire_mii_guest');
                    if (cached) currentMiiProfile = JSON.parse(cached);
                } catch (e) {}

                applyActiveAvatarToDOM();
                syncAuthUserToLocalStorage();

                // Sync Mii from Firebase DB
                get(ref(db, `users/${user.uid}/miiProfile`)).then((snap) => {
                    if (snap && snap.exists()) {
                        currentMiiProfile = snap.val();
                        try {
                            localStorage.setItem('yaire_mii_' + user.uid, JSON.stringify(currentMiiProfile));
                        } catch (e) {}
                        applyActiveAvatarToDOM();
                        syncAuthUserToLocalStorage();
                        window.dispatchEvent(new Event('yaireAuthChanged'));
                        updatePresence();
                    } else if (currentMiiProfile) {
                        // Migrate guest Mii to account on first login
                        set(ref(db, `users/${user.uid}/miiProfile`), currentMiiProfile).catch(() => {});
                    }
                }).catch(() => {});

                // Afterglow no longer stores call history. Clear the obsolete node for this account only.
                remove(ref(db, `users/${user.uid}/vc_history`)).catch(() => {});

                if (isFreshLogin) {
                    setTimeout(() => {
                        if (typeof window.show28EPlayToast === 'function') {
                            window.show28EPlayToast({ force: true });
                        }
                    }, 500);
                }

            } else {
                currentMiiProfile = null;
                currentGooglePhotoURL = '';
                window.yaireActiveAvatarURL = '';
                syncAuthUserToLocalStorage();
            }
            hasInitialAuthRun = true;
            window.dispatchEvent(new Event('yaireAuthChanged'));
            if (user) {
                applyActiveAvatarToDOM();

                if (authToggle) authToggle.title = "Cuenta (" + user.displayName + ")";
                const authLabel = document.getElementById('auth-toggle-label');
                if (authLabel) authLabel.textContent = (user.displayName || 'Cuenta').split(' ')[0];

                const authMenu = document.getElementById('auth-menu');
                if (authMenu) authMenu.classList.add('logged-in-view');

                if (authMenuLoggedOut) {
                    authMenuLoggedOut.classList.add('hidden');
                    authMenuLoggedOut.classList.remove('flex');
                }
                if (authMenuLoggedIn) {
                    authMenuLoggedIn.classList.remove('hidden');
                    authMenuLoggedIn.classList.add('flex');
                }
                if (authMenuName) authMenuName.textContent = user.displayName;
                if (authMenuEmail) authMenuEmail.textContent = user.email;

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
                if (authAvatar) {
                    authAvatar.classList.add('hidden');
                    authAvatar.style.display = 'none';
                    authAvatar.src = '';
                }
                if (authIcon) {
                    authIcon.classList.remove('hidden');
                    authIcon.style.display = '';
                }
                if (authToggle) authToggle.title = "Iniciar sesión";
                const authLabel = document.getElementById('auth-toggle-label');
                if (authLabel) authLabel.textContent = "Cuenta";

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

                if (authMenuLoggedIn) {
                    authMenuLoggedIn.classList.add('hidden');
                    authMenuLoggedIn.classList.remove('flex');
                }
                if (authMenuLoggedOut) {
                    authMenuLoggedOut.classList.remove('hidden');
                    authMenuLoggedOut.classList.add('flex');
                }

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
            if (!authMenu) return;
            isAuthMenuOpen = !isAuthMenuOpen;
            if (isAuthMenuOpen) {
                if (window.playEffect) window.playEffect('sounds/slideralto.wav'); else new Audio('sounds/slideralto.wav').play().catch(() => { });
                authMenu.style.display = 'block';
                void authMenu.offsetWidth;
                authMenu.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
                authMenu.classList.add('opacity-100', 'scale-100');
                if (window.__28EGamepad && typeof window.__28EGamepad.onAuthMenuOpened === 'function') {
                    if (window.__28EGamepad.getState && window.__28EGamepad.getState().activeMode) {
                        window.__28EGamepad.onAuthMenuOpened();
                    }
                }
            } else {
                if (window.playEffect) window.playEffect('sounds/sliderbajo.wav'); else new Audio('sounds/sliderbajo.wav').play().catch(() => { });
                authMenu.classList.remove('opacity-100', 'scale-100');
                authMenu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                setTimeout(() => {
                    if (!isAuthMenuOpen) authMenu.style.display = 'none';
                }, 200);
            }
        }

        if (authToggle) {
            authToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleAuthMenu();
                const tm = document.getElementById('theme-menu');
                if (tm && !tm.classList.contains('opacity-0')) {
                    tm.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                    setTimeout(() => { if (tm.classList.contains('opacity-0')) tm.style.display = 'none'; }, 200);
                }
            });
        }

        document.addEventListener('click', (e) => {
            if (isAuthMenuOpen && authToggle && authMenu && !authToggle.contains(e.target) && !authMenu.contains(e.target)) {
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

        window.yaireLoginWithGoogle = async function () {
            try {
                const res = await signInWithPopup(auth, provider);
                return res.user;
            } catch (err) {
                console.error("Error logging in with Google:", err, err.code, err.message);
                const friendlyMsg = getFriendlyAuthError(err);
                if (window.showPremiumAlert) window.showPremiumAlert("No se pudo iniciar sesión", friendlyMsg, "error");
                else alert("Error: " + friendlyMsg);
                throw err;
            }
        };

        window.yaireLogout = async function () {
            try {
                await signOut(auth);
            } catch (err) {
                console.error("Error signing out:", err);
            }
        };

        if (authBtnLogin) {
            authBtnLogin.addEventListener('click', () => {
                window.yaireLoginWithGoogle().then(() => {
                    toggleAuthMenu();
                }).catch(() => {});
            });
        }

        if (authBtnLogout) {
            authBtnLogout.addEventListener('click', () => {
                window.yaireLogout().then(() => {
                    toggleAuthMenu();
                }).catch(() => {});
            });
        }

        const authBtnGotoVc = document.getElementById('auth-btn-goto-vc');
        const authBtnGotoVcOut = document.getElementById('auth-btn-goto-vc-loggedout');
        const handleOpenVc = (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleAuthMenu();
            setTimeout(() => {
                if (window.yaireVoiceChannel && typeof window.yaireVoiceChannel.open === 'function') {
                    window.yaireVoiceChannel.open();
                } else {
                    const fab = document.getElementById('vc-fab');
                    if (fab) fab.click();
                }
            }, 60);
        };
        if (authBtnGotoVc) {
            authBtnGotoVc.addEventListener('click', handleOpenVc);
        }
        if (authBtnGotoVcOut) {
            authBtnGotoVcOut.addEventListener('click', handleOpenVc);
        }

        const authBtnMiiIn = document.getElementById('auth-btn-mii-loggedin');
        const handleOpenMii = (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!currentUser) return;
            if (isAuthMenuOpen) toggleAuthMenu();
            setTimeout(() => {
                if (typeof window.openMiiStudio28E === 'function') {
                    window.openMiiStudio28E();
                }
            }, 60);
        };
        if (authBtnMiiIn) authBtnMiiIn.addEventListener('click', handleOpenMii);

        const gbLoginBtn = document.getElementById('gb-login-btn');
        if (gbLoginBtn) {
            gbLoginBtn.addEventListener('click', () => {
                window.yaireLoginWithGoogle().catch(() => {});
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

        const setSubmitBtnState = (isLoading, isEditing = false) => {
            if (!gbForm) return;
            const submitBtn = gbForm.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            const icon = submitBtn.querySelector('i');
            const span = submitBtn.querySelector('span');

            if (isLoading) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.75';
                submitBtn.style.pointerEvents = 'none';
                submitBtn.style.cursor = 'wait';
                if (icon) {
                    icon.className = 'ph-bold ph-spinner animate-spin';
                }
                if (span) {
                    span.textContent = isEditing ? t('gb_saving', 'Guardando...') : t('gb_publishing', 'Publicando...');
                }
            } else {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '';
                submitBtn.style.pointerEvents = '';
                submitBtn.style.cursor = '';
                if (icon) {
                    icon.className = isEditing ? 'ph-bold ph-check' : 'ph-bold ph-paper-plane-right';
                }
                if (span) {
                    span.textContent = isEditing ? t('gb_save_changes', 'Guardar Cambios') : (dictionary[currentLang]?.gb_btn || 'Publicar Mensaje');
                }
            }
        };

        const resetGbForm = () => {
            gbEditingId = null;
            gbForm.reset();
            setSubmitBtnState(false, false);

            const charCount = document.getElementById('gb-char-count');
            if (charCount) charCount.textContent = '0/250';

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
            if (!currentUser) {
                if (window.showPremiumAlert) window.showPremiumAlert('Inicia sesión', 'Entra con Google para publicar una dedicatoria.', 'info');
                return;
            }
                const name = document.getElementById('gb-name').value.trim();
                const msg = document.getElementById('gb-msg').value.trim();
                if (!name || !msg) return;

                const isEditing = Boolean(gbEditingId);
                setSubmitBtnState(true, isEditing);

                if (isEditing) {
                    // UPDATE EXISTING
                    update(ref(db, 'guestbook/' + gbEditingId), {
                        msg: msg,
                        editedAt: serverTimestamp()
                    }).then(() => {
                        if (window.showPremiumAlert) window.showPremiumAlert(t('gb_updated_title', 'Actualizado'), t('gb_updated_msg', 'Tu mensaje ha sido modificado'), 'success');
                        if (window.AudioManager && typeof window.AudioManager.play === 'function') {
                            window.AudioManager.play('entry.wav', 0.5);
                        }
                        resetGbForm();
                    }).catch(err => {
                        console.error("Error al actualizar dedicatoria:", err);
                        if (window.showPremiumAlert) window.showPremiumAlert('Error', 'No se pudo actualizar el mensaje.', 'error');
                        setSubmitBtnState(false, true);
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
                        if (window.AudioManager && typeof window.AudioManager.play === 'function') {
                            window.AudioManager.play('entry.wav', 0.6);
                        }
                        if (typeof confetti === 'function') {
                            confetti({
                                particleCount: 30,
                                spread: 55,
                                origin: { y: 0.65 },
                                colors: ['#e775a6', '#f43f5e', '#fb7185', '#ffffff'],
                                disableForReducedMotion: true
                            });
                        }
                        resetGbForm();
                    }).catch(err => {
                        console.error("Error al publicar dedicatoria:", err);
                        if (window.showPremiumAlert) window.showPremiumAlert('Error', 'No se pudo publicar tu dedicatoria. Inténtalo de nuevo.', 'error');
                        setSubmitBtnState(false, false);
                    });
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

                const charCount = document.getElementById('gb-char-count');
                if (charCount) charCount.textContent = msgText.length + '/250';

                setSubmitBtnState(false, true);

                // Add cancel button if not exists
                if (!document.getElementById('gb-cancel-edit-btn')) {
                    const cancelBtn = document.createElement('button');
                    cancelBtn.type = 'button';
                    cancelBtn.id = 'gb-cancel-edit-btn';
                    cancelBtn.className = 'w-full text-zinc-400 font-bold hover:text-red-400 transition-colors text-sm py-2 mt-1 cursor-pointer';
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
                    if (window.AudioManager && typeof window.AudioManager.play === 'function') {
                        window.AudioManager.play('flyout.wav', 0.5);
                    }
                }).catch(err => {
                    console.error("Error al borrar dedicatoria:", err);
                    if (window.showPremiumAlert) window.showPremiumAlert('Error', 'No se pudo borrar el mensaje.', 'error');
                });
            }
        };

        const renderEmptyState = () => {
            gbWall.className = "w-full";
            gbWall.innerHTML = `
                <div class="w-full flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-dashed border-white/15 bg-white/[0.015] backdrop-blur-xl relative overflow-hidden" style="min-height: 380px;">
                    <!-- Ambient subtle halo behind icon -->
                    <div style="position: absolute; top: 35%; left: 50%; transform: translate(-50%, -50%); width: 240px; height: 130px; background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(231, 117, 166, 0.25) 0%, transparent 70%); filter: blur(32px); pointer-events: none;"></div>

                    <!-- Frosted Squircle Icon -->
                    <div class="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-3xl text-[#e775a6] shadow-lg shadow-[#e775a6]/15 mb-5 relative z-10">
                        <i class="ph-duotone ph-book-open-text"></i>
                    </div>

                    <!-- Editorial Title -->
                    <h4 class="font-editorial text-2xl sm:text-3xl font-normal text-white tracking-tight relative z-10 leading-snug">
                        El muro está esperando su primera huella
                    </h4>

                    <!-- Thoughtful Subtitle -->
                    <p class="font-sans text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed font-light mt-2 relative z-10">
                        Sé la primera persona en dejarle una dedicatoria o un recuerdo a Yaire. Tu mensaje quedará guardado para siempre.
                    </p>

                    <!-- Micro Action Button / Invitation -->
                    <div class="mt-6 relative z-10">
                        <button type="button" onclick="const input = document.getElementById('gb-msg') || document.getElementById('gb-name'); if(input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }"
                            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold tracking-wide transition-all duration-150 active:scale-95 shadow-sm cursor-pointer">
                            <i class="ph-bold ph-pen-nib text-[#e775a6]"></i>
                            <span>Escribir la primera dedicatoria</span>
                        </button>
                    </div>
                </div>
            `;
        };

        const buildGbCardElement = (m) => {
            const card = document.createElement('div');
            card.dataset.id = m.id;
            card.className = "break-inside-avoid inline-block w-full mb-4 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/25 group relative overflow-hidden gb-card-anim backdrop-blur-xl";
            card.style.background = 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%)';
            card.style.breakInside = 'avoid';
            card.style.webkitColumnBreakInside = 'avoid';

            const dateText = m.timestamp ? new Date(m.timestamp).toLocaleDateString() : t('gb_recent', 'Reciente');
            const safeName = document.createElement('div'); safeName.innerText = m.name || 'Anónimo';
            const safeMsg = document.createElement('div'); safeMsg.innerText = m.msg || '';
            const initial = (safeName.innerText.charAt(0) || '?').toUpperCase();

            // Apple-style translucent initial badges
            const colors = [
                'bg-blue-500/15 text-blue-300 border border-blue-500/25',
                'bg-amber-500/15 text-amber-300 border border-amber-500/25',
                'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
                'bg-rose-500/15 text-rose-300 border border-rose-500/25',
                'bg-purple-500/15 text-purple-300 border border-purple-500/25',
                'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25'
            ];
            const colorClass = colors[safeName.innerText.length % colors.length];

            let safePhoto = '';
            try {
                const url = new URL(m.photoURL);
                if (url.protocol === 'https:') {
                    const img = document.createElement('img');
                    img.src = url.href;
                    safePhoto = img.getAttribute('src').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
                }
            } catch {}
            const avatarHTML = safePhoto
                ? `<img src="${safePhoto}" referrerpolicy="no-referrer" class="w-9 h-9 shrink-0 rounded-full object-cover ring-1 ring-white/15 shadow-sm" alt="" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex';"><div class="w-9 h-9 shrink-0 rounded-full items-center justify-center font-bold text-xs ${colorClass} shadow-sm" style="display:none">${initial}</div>`
                : `<div class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${colorClass} shadow-sm">${initial}</div>`;

            let controlsHTML = '';
            if (window.yaireCurrentUser && m.uid === window.yaireCurrentUser.uid) {
                controlsHTML = `
                    <div class="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                        <button type="button" onclick="window.startEditGbMsg('${m.id}', this.closest('.gb-card-anim').querySelector('.gb-msg-text').innerText)" class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-all text-xs cursor-pointer" title="${t('gb_edit_title', 'Editar mensaje')}">
                            <i class="ph-bold ph-pencil-simple"></i>
                        </button>
                        <button type="button" onclick="window.deleteGbMsg('${m.id}')" class="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-all text-xs cursor-pointer" title="${t('gb_delete_title', 'Borrar mensaje')}">
                            <i class="ph-bold ph-trash"></i>
                        </button>
                    </div>
                `;
            }

            const editedTag = m.editedAt ? `<span class="ml-1.5 text-[9px] font-medium text-zinc-400 lowercase italic gb-edited-tag">${t('gb_edited_tag', '(editado)')}</span>` : '';

            card.innerHTML = `
                <!-- Destello sutil superior de cristal -->
                <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"></div>
                ${controlsHTML}
                <div class="flex items-center gap-3 mb-3.5 relative z-10 pr-12">
                    ${avatarHTML}
                    <div class="flex-1 min-w-0">
                        <h5 class="text-sm font-semibold text-white tracking-tight leading-tight truncate">${safeName.innerHTML}</h5>
                        <span class="text-[10px] text-zinc-400 font-mono tracking-wide mt-0.5 block gb-date-line">${dateText}${editedTag}</span>
                    </div>
                </div>
                <p class="text-zinc-300 text-xs sm:text-[13px] leading-relaxed font-normal relative z-10 gb-msg-text whitespace-pre-wrap">${safeMsg.innerHTML}</p>
            `;
            return card;
        };

        let isInitialGbLoad = true;

        onValue(ref(db, 'guestbook'), (snapshot) => {
            if (!gbWall) return;

            if (!snapshot.exists()) {
                renderEmptyState();
                return;
            }

            if (gbEmpty) gbEmpty.style.display = 'none';
            const data = snapshot.val() || {};
            const msgs = Object.entries(data)
                .map(([id, val]) => ({ id, ...val }))
                .sort((a, b) => (b.timestamp || Date.now()) - (a.timestamp || Date.now()));

            if (msgs.length === 0) {
                renderEmptyState();
                return;
            }

            // Ensure grid layout classes
            if (gbWall.className !== "columns-1 md:columns-2 gap-4") {
                gbWall.className = "columns-1 md:columns-2 gap-4";
            }

            const currentCards = gbWall.querySelectorAll('.gb-card-anim[data-id]');

            // Initial load or transition from empty state: render and stagger once
            if (isInitialGbLoad || currentCards.length === 0) {
                gbWall.innerHTML = '';
                msgs.forEach((m, idx) => {
                    const card = buildGbCardElement(m);
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(16px)';
                    gbWall.appendChild(card);

                    setTimeout(() => {
                        card.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, Math.min(idx * 50, 500));
                });
                isInitialGbLoad = false;
                return;
            }

            // Incremental reconciliation:
            const existingCardsMap = new Map();
            currentCards.forEach(el => existingCardsMap.set(el.dataset.id, el));
            const currentMsgIds = new Set(msgs.map(m => m.id));

            // 1. Remove deleted cards smoothly
            existingCardsMap.forEach((el, id) => {
                if (!currentMsgIds.has(id)) {
                    el.style.transition = 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
                    el.style.opacity = '0';
                    el.style.transform = 'scale(0.92) translateY(-8px)';
                    setTimeout(() => {
                        el.remove();
                        if (gbWall.querySelectorAll('.gb-card-anim[data-id]').length === 0) {
                            renderEmptyState();
                        }
                    }, 300);
                }
            });

            // 2. Insert new cards or update edited cards
            msgs.forEach((m, idx) => {
                const existingCard = existingCardsMap.get(m.id);

                if (!existingCard) {
                    // NEW CARD: Insert with Apple spring animation & subtle celebratory highlight
                    const newCard = buildGbCardElement(m);
                    newCard.style.opacity = '0';
                    newCard.style.transform = 'translateY(-20px) scale(0.96)';
                    newCard.style.filter = 'blur(4px)';
                    newCard.style.borderColor = 'rgba(231, 117, 166, 0.7)';
                    newCard.style.boxShadow = '0 0 25px rgba(231, 117, 166, 0.3), 0 8px 24px -4px rgba(0, 0, 0, 0.5)';

                    const children = Array.from(gbWall.querySelectorAll('.gb-card-anim[data-id]'));
                    if (idx >= children.length) {
                        gbWall.appendChild(newCard);
                    } else {
                        gbWall.insertBefore(newCard, children[idx]);
                    }

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            newCard.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 2s ease, box-shadow 2s ease';
                            newCard.style.opacity = '1';
                            newCard.style.transform = 'translateY(0) scale(1)';
                            newCard.style.filter = 'blur(0px)';

                            setTimeout(() => {
                                newCard.style.borderColor = '';
                                newCard.style.boxShadow = '';
                            }, 2000);
                        });
                    });
                } else {
                    // EXISTING CARD: update if edited
                    const msgEl = existingCard.querySelector('.gb-msg-text');
                    if (msgEl && msgEl.innerText !== m.msg) {
                        msgEl.innerText = m.msg;
                        const dateLine = existingCard.querySelector('.gb-date-line');
                        if (dateLine && !dateLine.querySelector('.gb-edited-tag')) {
                            const tag = document.createElement('span');
                            tag.className = 'ml-1.5 text-[9px] font-medium text-zinc-400 lowercase italic gb-edited-tag';
                            tag.textContent = t('gb_edited_tag', '(editado)');
                            dateLine.appendChild(tag);
                        }

                        existingCard.style.transition = 'border-color 0.4s ease, box-shadow 0.4s ease';
                        existingCard.style.borderColor = 'rgba(231, 117, 166, 0.6)';
                        existingCard.style.boxShadow = '0 0 16px rgba(231, 117, 166, 0.2)';
                        setTimeout(() => {
                            existingCard.style.borderColor = '';
                            existingCard.style.boxShadow = '';
                        }, 1200);
                    }
                }
            });
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

        // --- SINCRONIZACIÓN EN TIEMPO REAL: CONFIGURACIÓN GENERAL (Hero Badge, etc.) ---
        onValue(ref(db, 'config'), (snapshot) => {
            const cfg = snapshot.val();
            if (!cfg) return;
            try {
                localStorage.setItem('yaire_config', JSON.stringify(cfg));
                window.dispatchEvent(new CustomEvent('yaire_config_updated', { detail: cfg }));
            } catch (e) { }

            if (cfg.heroBadge) {
                const badgeTextEl = document.getElementById('hero-badge-text');
                if (badgeTextEl) {
                    badgeTextEl.textContent = cfg.heroBadge;
                }
            }
        });
    
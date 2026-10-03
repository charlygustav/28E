
        (function () {
            try {
                const cfg = JSON.parse(localStorage.getItem('yaire_config') || '{}');

                // 1. Galería de Arte
                if (cfg.gal1) {
                    const img1 = document.querySelector('img[alt="Yaire 1"]');
                    if (img1) img1.src = cfg.gal1;
                }
                if (cfg.gal2) {
                    const img2 = document.querySelector('img[alt="Yaire 2"]');
                    if (img2) img2.src = cfg.gal2;
                }
                if (cfg.gal3) {
                    const img3 = document.querySelector('img[alt="Yaire 3"]');
                    if (img3) img3.src = cfg.gal3;
                }

                // 2. Vocabulario — palabras y frases son manejadas por applyAdminConfigOverrides()
                // (que se llama al final de cada setLanguage para que siempre prevalezca sobre el i18n)

                // 3. El Último Secreto (Vault)
                if (cfg.vaultHint) {
                    const hint = document.querySelector('[data-i18n="secret_hint"]');
                    if (hint) hint.innerHTML = cfg.vaultHint;
                }
                // El hash de la contraseña se sobrescribe reasignando la variable si existe
                if (cfg.vaultHash && typeof VAULT_HASH !== 'undefined') {
                    VAULT_HASH = cfg.vaultHash;
                }
                if (cfg.vaultHash && typeof VAULT_HASH_V2 !== 'undefined') {
                    VAULT_HASH_V2 = cfg.vaultHash;
                }

                // Canciones
                if (cfg.songs && cfg.songs.length > 0 && typeof spotlightTracks !== 'undefined') {
                    spotlightTracks = cfg.songs;
                    window.spotlightTracks = cfg.songs;
                }

                // 4. Hero Badge
                function applyHeroBadgeConfig(cfg) {
                    if (cfg.heroBadge || cfg.heroBadgeLinkText || cfg.heroBadgeEmoji1 || cfg.heroBadgeEmoji2) {
                        // Traducciones base desde Firebase o el propio texto
                        const enTxt = cfg.heroBadge_en && cfg.heroBadge_en.trim() !== '' ? cfg.heroBadge_en : cfg.heroBadge;
                        const ptTxt = cfg.heroBadge_pt && cfg.heroBadge_pt.trim() !== '' ? cfg.heroBadge_pt : cfg.heroBadge;
                        const frTxt = cfg.heroBadge_fr && cfg.heroBadge_fr.trim() !== '' ? cfg.heroBadge_fr : cfg.heroBadge;

                        if (typeof dictionary !== 'undefined') {
                            if (dictionary['es']) dictionary['es'].hero_badge = cfg.heroBadge;
                            if (dictionary['en']) dictionary['en'].hero_badge = enTxt;
                            if (dictionary['pt']) dictionary['pt'].hero_badge = ptTxt;
                            if (dictionary['fr']) dictionary['fr'].hero_badge = frTxt;

                            if (cfg.heroBadgeLinkText) {
                                const linkEn = cfg.heroBadgeLinkText_en || cfg.heroBadgeLinkText;
                                const linkPt = cfg.heroBadgeLinkText_pt || cfg.heroBadgeLinkText;
                                const linkFr = cfg.heroBadgeLinkText_fr || cfg.heroBadgeLinkText;
                                if (dictionary['es']) dictionary['es'].hero_badge_link = cfg.heroBadgeLinkText;
                                if (dictionary['en']) dictionary['en'].hero_badge_link = linkEn;
                                if (dictionary['pt']) dictionary['pt'].hero_badge_link = linkPt;
                                if (dictionary['fr']) dictionary['fr'].hero_badge_link = linkFr;
                            }

                            // Marcar que el admin controla el badge (evita que initHeroCountdown sobreescriba)
                            window.__adminBadgeApplied = true;

                            // DOM Updates for Badge Elements
                            const badgeTextEl = document.getElementById('hero-badge-text');
                            const e1 = document.getElementById('hero-badge-e1');
                            const e2 = document.getElementById('hero-badge-e2');
                            const cDown = document.getElementById('hero-countdown');
                            const dot = document.getElementById('hero-badge-dot');
                            const linkEl = document.getElementById('hero-badge-link');

                            // Texto principal: si vacío, ocultar
                            if (badgeTextEl) {
                                if (!cfg.heroBadge || cfg.heroBadge.trim() === '') {
                                    badgeTextEl.style.display = 'none';
                                } else {
                                    badgeTextEl.style.display = '';
                                }
                            }

                            // Emoji izquierdo: si vacío, ocultar
                            if (e1) {
                                if (!cfg.heroBadgeEmoji1 || cfg.heroBadgeEmoji1.trim() === '') {
                                    e1.style.display = 'none';
                                } else {
                                    e1.textContent = cfg.heroBadgeEmoji1;
                                    e1.style.display = '';
                                }
                            }

                            // Enlace o Emoji derecho
                            if (linkEl && cfg.heroBadgeLinkText && cfg.heroBadgeLinkText.trim() !== '') {
                                linkEl.href = cfg.heroBadgeLinkUrl || '#';
                                linkEl.classList.remove('hidden');
                                if (cDown) cDown.style.display = 'none';
                                if (dot) dot.classList.add('hidden');
                                if (e2) e2.classList.add('hidden');
                            } else if (e2) {
                                if (linkEl) linkEl.classList.add('hidden');
                                if (!cfg.heroBadgeEmoji2 || cfg.heroBadgeEmoji2.trim() === '') {
                                    e2.style.display = 'none';
                                } else {
                                    e2.textContent = cfg.heroBadgeEmoji2;
                                    e2.style.display = '';
                                    e2.classList.remove('hidden');
                                }
                                if (cDown) cDown.style.display = 'none';
                                if (dot) dot.classList.add('hidden');
                            }

                            // Aplicar los cambios de inmediato si la función existe
                            if (typeof setLanguage === 'function' && typeof currentLang !== 'undefined') {
                                setLanguage(currentLang, false);
                            }
                        }

                        // Autocompletar traducciones faltantes (ej: si el panel viejo falló)
                        if (enTxt === cfg.heroBadge) {
                            const translateApi = async (text, lang) => {
                                try {
                                    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
                                    const res = await fetch(url);
                                    const data = await res.json();
                                    return data[0].map(item => item[0]).join('');
                                } catch (e) { return text; }
                            };

                            translateApi(cfg.heroBadge, 'en').then(t => {
                                if (typeof dictionary !== 'undefined' && dictionary['en']) {
                                    dictionary['en'].hero_badge = t;
                                    if (typeof currentLang !== 'undefined' && currentLang === 'en' && typeof setLanguage === 'function') setLanguage('en', false);
                                }
                            });
                            translateApi(cfg.heroBadge, 'pt').then(t => {
                                if (typeof dictionary !== 'undefined' && dictionary['pt']) {
                                    dictionary['pt'].hero_badge = t;
                                    if (typeof currentLang !== 'undefined' && currentLang === 'pt' && typeof setLanguage === 'function') setLanguage('pt', false);
                                }
                            });
                            translateApi(cfg.heroBadge, 'fr').then(t => {
                                if (typeof dictionary !== 'undefined' && dictionary['fr']) {
                                    dictionary['fr'].hero_badge = t;
                                    if (typeof currentLang !== 'undefined' && currentLang === 'fr' && typeof setLanguage === 'function') setLanguage('fr', false);
                                }
                            });
                        }
                    }
                }

                applyHeroBadgeConfig(cfg);

                window.addEventListener('yaire_config_updated', (e) => {
                    if (e.detail) {
                        applyHeroBadgeConfig(e.detail);
                    }
                });

                // 5. Spotlight Tips (Sincronización en vivo y fallback de traducción)
                if (cfg.spotlightTips && typeof spotlightTips !== 'undefined') {
                    if (cfg.spotlightTips.es) spotlightTips.es = cfg.spotlightTips.es;
                    if (cfg.spotlightTips.en) spotlightTips.en = cfg.spotlightTips.en;
                    if (cfg.spotlightTips.pt) spotlightTips.pt = cfg.spotlightTips.pt;
                    if (cfg.spotlightTips.fr) spotlightTips.fr = cfg.spotlightTips.fr;

                    // Autocompletar traducciones faltantes al vuelo si el panel no las generó
                    const tipsEs = cfg.spotlightTips.es;
                    if (tipsEs && tipsEs.length > 0) {
                        const translateApi = async (text, lang) => {
                            try {
                                const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
                                const res = await fetch(url);
                                const data = await res.json();
                                return data[0].map(item => item[0]).join('');
                            } catch (e) { return text; }
                        };

                        // Si EN no existe o es igual a ES (sin traducir)
                        if (!cfg.spotlightTips.en || (cfg.spotlightTips.en[0] === tipsEs[0] && tipsEs[0])) {
                            Promise.all(tipsEs.map(t => translateApi(t, 'en'))).then(arr => spotlightTips.en = arr);
                        }
                        // Si PT no existe o es igual a ES
                        if (!cfg.spotlightTips.pt || (cfg.spotlightTips.pt[0] === tipsEs[0] && tipsEs[0])) {
                            Promise.all(tipsEs.map(t => translateApi(t, 'pt'))).then(arr => spotlightTips.pt = arr);
                        }
                        // Si FR no existe o es igual a ES
                        if (!cfg.spotlightTips.fr || (cfg.spotlightTips.fr[0] === tipsEs[0] && tipsEs[0])) {
                            Promise.all(tipsEs.map(t => translateApi(t, 'fr'))).then(arr => spotlightTips.fr = arr);
                        }
                    }
                }

                // Rastreador de Visitas Globales y Registro de IP
                const trackVisit = () => {
                    // Solo contamos una visita por sesión
                    if (!sessionStorage.getItem('yaire_visited')) {
                        // Incrementar el contador global original (para mantener consistencia)
                        fetch('https://api.counterapi.dev/v1/charlygustav_yaire/visits/up')
                            .then(r => r.json())
                            .then(data => {} )
                            .catch(e => { });

                        // Registrar IP real en Firebase para el Panel
                        fetch('https://api.ipify.org?format=json')
                            .then(r => r.json())
                            .then(data => {
                                const newVisit = {
                                    ip: data.ip,
                                    date: new Date().toISOString(),
                                    loc: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Desconocido',
                                    dev: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
                                };
                                fetch('https://yaire-591ca-default-rtdb.firebaseio.com/ips.json', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(newVisit)
                                });
                                sessionStorage.setItem('yaire_visited', 'true');
                            }).catch(e => {} );
                    }
                };

                if (window.__runWhenIdle) {
                    window.__runWhenIdle(trackVisit, 8000);
                } else {
                    setTimeout(trackVisit, 5000);
                }

            } catch (e) {
                console.error("Admin Panel Error:", e);
            }
        })();
    
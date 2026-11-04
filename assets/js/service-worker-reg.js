(function () {
    // En desarrollo local (Live Server / localhost), desregistrar SW y limpiar cachés para evitar bloqueos
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (regs) {
                for (var r of regs) { r.unregister(); }
            });
        }
        if ('caches' in window) {
            caches.keys().then(function (names) {
                for (var n of names) { caches.delete(n); }
            });
        }
    } else if ('serviceWorker' in navigator) {
        // 1. Registro del Service Worker en producción
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('./sw.js?v=47')
                .then(function (reg) {
                    reg.addEventListener('updatefound', function () {
                        var newWorker = reg.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', function () {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // Nuevo worker instalado
                                }
                            });
                        }
                    });
                })
                .catch(function (err) {
                    console.warn('[PWA] ⚠️ Registro SW fallido:', err);
                });
        });
    }

    // 2. Control de Instalación PWA (Android / Chrome / PC / iOS)
    var deferredPrompt = null;
    var headerInstallBtn = document.getElementById('pwa-header-install-btn');
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isStandalone) {
        if (headerInstallBtn) headerInstallBtn.style.display = 'none';
    } else {
        window.addEventListener('beforeinstallprompt', function (e) {
            e.preventDefault();
            deferredPrompt = e;
            if (headerInstallBtn) headerInstallBtn.style.display = 'flex';
        });

        // En iOS o navegadores que soportan instalación manual
        if (headerInstallBtn) {
            headerInstallBtn.style.display = 'flex';
        }
    }

    window.installPWA = async function () {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            var choice = await deferredPrompt.userChoice;
            deferredPrompt = null;
            if (choice.outcome === 'accepted' && headerInstallBtn) {
                headerInstallBtn.style.display = 'none';
            }
        } else if (isIOS) {
            if (typeof window.showPremiumAlert === 'function') {
                window.showPremiumAlert('Instalar en iPhone / iPad', 'Toca el botón Compartir ⎋ abajo en Safari y selecciona "Añadir a pantalla de inicio" ➕', 'info');
            } else {
                alert('Para instalar en tu iPhone:\n1. Toca el botón Compartir ⎋ en Safari.\n2. Selecciona "Añadir a pantalla de inicio" ➕.');
            }
        } else {
            if (typeof window.showPremiumAlert === 'function') {
                window.showPremiumAlert('Instalación PWA', 'Abre el menú de tu navegador (⋮) y pulsa "Instalar aplicación" o "Añadir a pantalla de inicio" 📲', 'info');
            } else {
                alert('Abre el menú de tu navegador y pulsa "Instalar aplicación" 📲');
            }
        }
    };

    window.addEventListener('appinstalled', function () {
        if (headerInstallBtn) headerInstallBtn.style.display = 'none';
    });
})();

const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Update initDJPanel
const initReplacement = `
            if (window.__fbDb && window.__fbOnValue && window.__fbRef) {
                window.__fbOnValue(window.__fbRef(window.__fbDb, 'radio_state/current'), snap => {
                    djState = snap.val();
                    updateDJUI();
                });
                window.__fbOnValue(window.__fbRef(window.__fbDb, 'radio_state/globalVolume'), snap => {
                    const vol = snap.val();
                    if (vol !== null) {
                        const el = document.getElementById('dj-volume');
                        if(el) el.value = Math.round(vol * 100);
                    }
                });
            } else {
`;
html = html.replace(`
            if (window.__fbDb && window.__fbOnValue && window.__fbRef) {
                window.__fbOnValue(window.__fbRef(window.__fbDb, 'radio_state/current'), snap => {
                    djState = snap.val();
                    updateDJUI();
                });
            } else {
`, initReplacement);

// Update updateDJUI
const updateDJUIReplacement = `
        let djProgressInterval;

        function updateDJUI() {
            if (!djState) return;
            document.getElementById('dj-current-title').textContent = djState.title || 'Sin Título';
            document.getElementById('dj-current-artist').textContent = djState.artist || 'Desconocido';

            const btnPlay = document.getElementById('dj-btn-play');
            const badge = document.getElementById('dj-status-badge');

            if (djState.isPlaying) {
                btnPlay.innerHTML = '<i class="ph-fill ph-pause"></i> Pausar';
                btnPlay.classList.replace('bg-green-500', 'bg-white');
                btnPlay.classList.replace('text-white', 'text-black');
                badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> AL AIRE';
                badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest";
            } else {
                btnPlay.innerHTML = '<i class="ph-fill ph-play"></i> Reanudar';
                btnPlay.classList.replace('bg-white', 'bg-green-500');
                btnPlay.classList.replace('text-black', 'text-white');
                badge.innerHTML = '<i class="ph-bold ph-pause"></i> PAUSADO';
                badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-500/10 text-zinc-400 text-xs font-bold uppercase tracking-widest";
            }

            fetchSpotlightArtwork({title: djState.title, artist: djState.artist}).then(url => {
                const img = document.getElementById('dj-current-art');
                if (img && url) img.src = url;
            });

            // Progress Bar Logic
            if (djProgressInterval) clearInterval(djProgressInterval);
            djProgressInterval = setInterval(() => {
                const elCurr = document.getElementById('dj-time-current');
                const elBar = document.getElementById('dj-progress-bar');
                if (djState.isPlaying && djState.startTime) {
                    const offset = window.serverTimeOffset || 0; // We don't have offset in admin, just use Date.now()
                    const elapsedMs = Date.now() - djState.startTime;
                    if (elapsedMs < 0) return;
                    const secs = Math.floor(elapsedMs / 1000);
                    const m = Math.floor(secs / 60);
                    const s = secs % 60;
                    if(elCurr) elCurr.textContent = \`\${m}:\${s.toString().padStart(2, '0')}\`;
                    
                    // Fake 3-min loop for visual progress if duration unknown
                    const fakeDuration = 180000;
                    const pct = Math.min((elapsedMs % fakeDuration) / fakeDuration * 100, 100);
                    if(elBar) elBar.style.width = pct + '%';
                }
            }, 1000);

            // Listeners Setup
            if (!window.__djListenersSetup && window.__fbDb) {
                window.__djListenersSetup = true;
                window.__fbOnValue(window.__fbRef(window.__fbDb, 'presence'), snap => {
                    const presence = snap.val() || {};
                    const count = Object.keys(presence).length;
                    const badgeEl = document.getElementById('dj-listeners-badge');
                    if (badgeEl) {
                        document.getElementById('dj-listeners-count').textContent = count;
                        badgeEl.classList.remove('hidden');
                    }
                });
            }
        }
`;

html = html.replace(/function updateDJUI\(\) \{[\s\S]*?\}\s*window\.djTogglePlay/, updateDJUIReplacement + "\n\n        window.djTogglePlay");

const extrasReplacement = `
        window.djUpdateVolume = async function(val) {
            if (!window.__fbDb) return;
            const vol = parseInt(val) / 100;
            const { update, ref } = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js');
            update(ref(window.__fbDb, 'radio_state'), { globalVolume: vol }).catch(()=>{});
        };

        window.djPlaySFX = async function(id) {
            if (!window.__fbDb) return;
            const { update, ref, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js');
            update(ref(window.__fbDb, 'radio_state'), { ['sfx_' + id]: serverTimestamp() })
                .then(() => showToast("SFX", "Efecto reproducido globalmente.", 2000))
                .catch(() => showToast("Error", "No tienes permisos.", 2000));
        };

        document.addEventListener('DOMContentLoaded', () => {
`;

html = html.replace(/document\.addEventListener\('DOMContentLoaded', \(\) => \{/, extrasReplacement);

fs.writeFileSync('index.html', html);
console.log('Admin JS patched successfully.');

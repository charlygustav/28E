const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newTabBtn = `
                <button onclick="switchTab('radiodj')"
                    class="nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all text-sm"
                    data-target="radiodj">
                    <i class="ph-bold ph-radio text-lg"></i>
                    <span>Radio DJ</span>
                </button>
`;

const musicBtnTarget = `data-target="music">`;

if (html.includes(musicBtnTarget)) {
    html = html.replace(musicBtnTarget, musicBtnTarget + newTabBtn);
} else {
    console.log("No encontre music btn");
}

const newTabContent = `
            <!-- YAIRE FM DJ TAB -->
            <div id="tab-radiodj" class="tab-content space-y-6">
                <div class="flex items-center gap-3 mb-2">
                    <i class="ph-fill ph-radio text-3xl text-red-500"></i>
                    <div>
                        <h2 class="text-2xl font-black tracking-tight font-sans text-white">Yaire FM (Live DJ)</h2>
                        <p class="text-zinc-400 text-sm mt-1">Controla la estación de radio de la página principal en tiempo real.</p>
                    </div>
                </div>

                <!-- DJ Monitor -->
                <div class="bg-card border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-purple-600 animate-pulse"></div>
                    <div class="flex flex-col md:flex-row items-center gap-6">
                        <img id="dj-current-art" src="../28E Main/tulip.ico" class="w-32 h-32 rounded-xl object-cover shadow-lg border border-white/10" alt="Artwork" onerror="this.src='https://www.yaire.site/tulip.ico?v=3'">
                        <div class="flex-1 text-center md:text-left">
                            <span id="dj-status-badge" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest mb-3">
                                <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> AL AIRE
                            </span>
                            <h3 id="dj-current-title" class="text-3xl font-black text-white mb-1 tracking-tight">Cargando...</h3>
                            <p id="dj-current-artist" class="text-zinc-400 text-lg font-medium">Conectando con Yaire FM...</p>
                            
                            <div class="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                                <button onclick="window.djTogglePlay()" id="dj-btn-play" class="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform">
                                    <i class="ph-fill ph-pause"></i> Pausar Transmisión
                                </button>
                                <button onclick="window.djSkip()" class="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors">
                                    <i class="ph-bold ph-skip-forward"></i> Siguiente Auto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Forzar Canción List -->
                <div class="bg-card border border-border rounded-2xl p-6">
                    <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <i class="ph-bold ph-music-notes"></i> Forzar Canción (Takeover)
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" id="dj-tracks-container">
                        <!-- Llenado dinámicamente -->
                    </div>
                </div>
            </div>
`;

const eventsTabTarget = `<div id="tab-events" class="tab-content space-y-6">`;

if (html.includes(eventsTabTarget)) {
    html = html.replace(eventsTabTarget, newTabContent + eventsTabTarget);
} else {
    console.log("No encontre events tab content");
}

const newScript = `
    <!-- Radio DJ Logic -->
    <script>
        const djTracks = [
            { title: "Bing Bong", artist: "Yailin la Mas Viral", src: "radio/Bing Bong - Yailin la Mas Viral - SpotubeDL.com.mp3" },
            { title: "Brazilera - Remix", artist: "Chimbala", src: "radio/Brazilera - Remix - Chimbala - SpotubeDL.com.mp3" },
            { title: "Como Panas", artist: "Bryant Myers", src: "radio/Como Panas - Bryant Myers - SpotubeDL.com.mp3" },
            { title: "Delincuente", artist: "Tokischa", src: "radio/Delincuente - Tokischa - SpotubeDL.com.mp3" },
            { title: "God is a woman", artist: "Ariana Grande", src: "radio/God is a woman - Ariana Grande - SpotubeDL.com.mp3" },
            { title: "God's Plan", artist: "Drake", src: "radio/God's Plan - Drake - SpotubeDL.com.mp3" },
            { title: "I Like It", artist: "Cardi B", src: "radio/I Like It - Cardi B - SpotubeDL.com.mp3" },
            { title: "Inolvidable", artist: "Ovy On The Drums", src: "radio/Inolvidable - Ovy On The Drums - SpotubeDL.com.mp3" },
            { title: "Oscar Winning Tears.", artist: "RAYE", src: "radio/Oscar Winning Tears. - RAYE - SpotubeDL.com.mp3" },
            { title: "Pasao De Famarcia", artist: "Lil Naay", src: "radio/Pasao De Famarcia - Lil Naay - SpotubeDL.com.mp3" },
            { title: "Thootie", artist: "Ice Spice ft. Tokischa", src: "radio/Thootie (feat. Tokischa) - Ice Spice - SpotubeDL.com.mp3" },
            { title: "Toto Lindo", artist: "Huan62", src: "radio/Toto Lindo - Huan62 - SpotubeDL.com.mp3" }
        ];

        let djState = null;

        function initDJPanel() {
            const container = document.getElementById('dj-tracks-container');
            if(!container) return;
            
            container.innerHTML = djTracks.map((t, i) => \`
                <button onclick="window.djForceTrack(\${i})" class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-red-500/20 hover:border-red-500/50 border border-transparent transition-all text-left group">
                    <div class="w-10 h-10 rounded-lg bg-black/50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <i class="ph-fill ph-play"></i>
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <div class="text-white font-bold text-sm truncate">\${t.title}</div>
                        <div class="text-zinc-400 text-xs truncate">\${t.artist}</div>
                    </div>
                </button>
            \`).join('');

            if (window.__fbDb && window.__fbOnValue && window.__fbRef) {
                window.__fbOnValue(window.__fbRef(window.__fbDb, 'radio_state/current'), snap => {
                    djState = snap.val();
                    updateDJUI();
                });
            } else {
                setTimeout(initDJPanel, 500);
            }
        }

        function updateDJUI() {
            if (!djState) return;
            document.getElementById('dj-current-title').textContent = djState.title || 'Sin Título';
            document.getElementById('dj-current-artist').textContent = djState.artist || 'Desconocido';
            
            const btnPlay = document.getElementById('dj-btn-play');
            const badge = document.getElementById('dj-status-badge');
            
            if (djState.isPlaying) {
                btnPlay.innerHTML = '<i class="ph-fill ph-pause"></i> Pausar Transmisión';
                btnPlay.classList.replace('bg-green-500', 'bg-white');
                btnPlay.classList.replace('text-white', 'text-black');
                badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> AL AIRE';
                badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest mb-3";
            } else {
                btnPlay.innerHTML = '<i class="ph-fill ph-play"></i> Reanudar';
                btnPlay.classList.replace('bg-white', 'bg-green-500');
                btnPlay.classList.replace('text-black', 'text-white');
                badge.innerHTML = '<i class="ph-bold ph-pause"></i> PAUSADO';
                badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-500/10 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-3";
            }
        }

        window.djTogglePlay = async function() {
            if (!djState || !window.__fbDb) return;
            const newIsPlaying = !djState.isPlaying;
            try {
                const { getDatabase, ref, update, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js');
                await update(ref(window.__fbDb, 'radio_state/current'), {
                    isPlaying: newIsPlaying
                });
                showToast("Éxito", newIsPlaying ? "Transmisión reanudada" : "Transmisión pausada", 2000);
            } catch(e) {
                showToast("Error", "No tienes permisos de Admin.", 3000);
            }
        };

        window.djForceTrack = async function(index) {
            if (!window.__fbDb) return;
            const track = djTracks[index];
            try {
                const { getDatabase, ref, set, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js');
                await set(ref(window.__fbDb, 'radio_state/current'), {
                    src: track.src,
                    title: track.title,
                    artist: track.artist,
                    startTime: serverTimestamp(),
                    isPlaying: true,
                    source: 'dj'
                });
                showToast("Éxito", "Forzaste la canción: " + track.title, 3000);
            } catch(e) {
                showToast("Error", "No tienes permisos.", 3000);
            }
        };

        window.djSkip = async function() {
            if (!djState || !window.__fbDb) return;
            let nextIndex = 0;
            const currentIndex = djTracks.findIndex(t => t.src === djState.src);
            if (currentIndex !== -1) {
                nextIndex = (currentIndex + 1) % djTracks.length;
            }
            await window.djForceTrack(nextIndex);
        };

        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initDJPanel, 1000);
        });
    </script>
</body>`;

html = html.replace("</body>", newScript);

fs.writeFileSync('index.html', html);
console.log("Admin Panel modificado.");

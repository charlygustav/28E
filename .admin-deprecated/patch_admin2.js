const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

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

const securityTabTarget = `<div id="tab-security" class="tab-content space-y-8">`;

if (html.includes(securityTabTarget)) {
    html = html.replace(securityTabTarget, newTabContent + "\n            " + securityTabTarget);
    fs.writeFileSync('index.html', html);
    console.log("Tab Content injected successfully.");
} else {
    console.log("Tab Content NOT injected. Target not found.");
}

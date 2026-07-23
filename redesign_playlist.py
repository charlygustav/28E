with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re

# Find the playlist section and replace it with a much better one
playlist_pattern = r'<section id="playlist-aniversario".*?</section>'
new_playlist = '''<section id="playlist-aniversario" class="cv-section py-32 border-t border-zinc-200 dark:border-zinc-800 reveal scroll-mt-20 relative overflow-hidden">
            <!-- Dynamic Background -->
            <div class="absolute inset-0 pointer-events-none">
                <!-- Glowing Orbs -->
                <div class="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent blur-[100px] animate-pulse" style="animation-duration: 4s;"></div>
                <div class="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-green-500/5 via-emerald-500/5 to-transparent blur-[120px] animate-pulse" style="animation-duration: 7s;"></div>
                
                <!-- Floating Musical Notes (Pure CSS) -->
                <div class="absolute top-1/4 left-10 text-4xl text-emerald-500/20 animate-bounce" style="animation-duration: 3s;">?</div>
                <div class="absolute top-1/2 right-12 text-5xl text-teal-500/20 animate-bounce" style="animation-duration: 4.5s; animation-delay: 1s;">?</div>
                <div class="absolute bottom-1/4 left-1/3 text-3xl text-emerald-500/10 animate-bounce" style="animation-duration: 5s; animation-delay: 0.5s;">?</div>
            </div>
            
            <div class="max-w-6xl mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                
                <!-- Left: Info & Text -->
                <div class="w-full lg:w-5/12 text-center lg:text-left">
                    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                        <span class="relative flex h-2 w-2">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        On Air — 182 Días
                    </div>
                    
                    <h2 class="text-5xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-100 to-emerald-400 tracking-tight leading-[1.1]" style="filter: drop-shadow(0 4px 20px rgba(16,185,129,0.2));">Soundtrack de Nuestro <br><span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Medio Año</span></h2>
                    
                    <p class="text-zinc-400 text-lg font-light leading-relaxed mb-8">Porque 182 días de magia necesitaban una banda sonora a la altura. Estas son las canciones que definen tu vibra, nuestra historia y todo lo que nos hace vibrar en la misma frecuencia.</p>
                    
                    <!-- Soundwave Animation -->
                    <div class="flex items-center justify-center lg:justify-start gap-1.5 h-10 mb-8 opacity-70">
                        <div class="w-1.5 bg-emerald-500 rounded-full animate-[soundwave_1s_ease-in-out_infinite_alternate] h-4"></div>
                        <div class="w-1.5 bg-emerald-400 rounded-full animate-[soundwave_1.2s_ease-in-out_infinite_alternate] h-8"></div>
                        <div class="w-1.5 bg-teal-400 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite_alternate] h-5"></div>
                        <div class="w-1.5 bg-emerald-500 rounded-full animate-[soundwave_1.5s_ease-in-out_infinite_alternate] h-10"></div>
                        <div class="w-1.5 bg-teal-500 rounded-full animate-[soundwave_0.9s_ease-in-out_infinite_alternate] h-3"></div>
                        <div class="w-1.5 bg-emerald-400 rounded-full animate-[soundwave_1.1s_ease-in-out_infinite_alternate] h-7"></div>
                        <div class="w-1.5 bg-teal-400 rounded-full animate-[soundwave_1.3s_ease-in-out_infinite_alternate] h-6"></div>
                    </div>
                    
                    <!-- Curator Tag -->
                    <div class="inline-flex items-center gap-4 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-3 shadow-xl">
                        <div class="flex -space-x-3 relative">
                            <div class="w-12 h-12 rounded-full border-2 border-zinc-900 bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center overflow-hidden shadow-lg z-10 text-white text-xl">
                                ??
                            </div>
                            <div class="w-12 h-12 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center shadow-lg relative">
                                <span class="text-sm">????</span>
                            </div>
                        </div>
                        <div class="pr-3 text-left">
                            <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Selección Oficial</p>
                            <p class="text-sm font-bold text-white">Curado para Yaire ??</p>
                        </div>
                    </div>
                </div>
                
                <!-- Right: Spotify Embed & Vinyl -->
                <div class="w-full lg:w-7/12 relative flex justify-center lg:justify-end mt-10 lg:mt-0">
                    
                    <!-- Spinning Vinyl Background -->
                    <div class="absolute top-1/2 right-1/2 translate-x-[20%] -translate-y-1/2 w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full border border-zinc-800 bg-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center animate-[spin_10s_linear_infinite]" style="z-index: 0;">
                        <!-- Vinyl Grooves -->
                        <div class="absolute inset-2 rounded-full border border-zinc-800/50"></div>
                        <div class="absolute inset-6 rounded-full border border-zinc-800/50"></div>
                        <div class="absolute inset-10 rounded-full border border-zinc-800/50"></div>
                        <div class="absolute inset-14 rounded-full border border-zinc-800/50"></div>
                        <div class="absolute inset-20 rounded-full border border-zinc-800/50"></div>
                        <!-- Vinyl Center Label -->
                        <div class="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-[4px] border-zinc-900 flex items-center justify-center relative shadow-inner">
                            <div class="w-4 h-4 rounded-full bg-zinc-900 shadow-inner"></div>
                            <!-- Circular Text -->
                            <svg class="absolute inset-0 w-full h-full animate-[spin_15s_linear_infinite_reverse]" viewBox="0 0 100 100">
                                <path id="curve" d="M 50 15 A 35 35 0 1 1 49.9 15" fill="transparent" />
                                <text class="text-[10px] font-black uppercase tracking-widest" fill="rgba(0,0,0,0.6)">
                                    <textPath href="#curve">28 DE ENERO — SEIS MESES JUNTOS —</textPath>
                                </text>
                            </svg>
                        </div>
                    </div>

                    <!-- Spotify Player Container -->
                    <div class="relative z-10 w-full max-w-[420px] group perspective-[1000px]">
                        <!-- Glow behind player -->
                        <div class="absolute -inset-2 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-[32px] blur-xl opacity-30 group-hover:opacity-50 transition duration-700"></div>
                        
                        <!-- Glass Player Card -->
                        <div class="relative bg-zinc-950/80 backdrop-blur-xl rounded-[28px] p-4 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-transform duration-500 hover:scale-[1.02] hover:-rotate-1">
                            
                            <!-- Glass Reflection -->
                            <div class="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none"></div>

                            <iframe style="border-radius:16px" src="https://open.spotify.com/embed/playlist/34Txo6D9vCnRjezQwo2nh5?utm_source=generator&theme=0" width="100%" height="450" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" class="relative z-10 w-full h-[450px] shadow-lg"></iframe>
                        </div>
                    </div>
                    
                </div>
            </div>
            
            <style>
                @keyframes soundwave {
                    0% { transform: scaleY(0.3); opacity: 0.5; }
                    100% { transform: scaleY(1); opacity: 1; }
                }
            </style>
        </section>'''

html = re.sub(playlist_pattern, new_playlist, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Redesigned playlist section successfully.')

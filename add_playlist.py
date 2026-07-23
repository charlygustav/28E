with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

playlist_html = '''        <!-- --- ?? SOUNDTRACK DE MEDIO AÑO --- -->
        <section id="playlist-aniversario" class="cv-section py-24 border-t border-zinc-200 dark:border-zinc-800 reveal scroll-mt-20 relative overflow-hidden">
            <!-- Ambient Glow -->
            <div class="absolute inset-0 pointer-events-none">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-emerald-500/5 via-transparent to-emerald-500/5 blur-[120px]"></div>
            </div>
            
            <div class="max-w-4xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
                <!-- Info Side -->
                <div class="w-full md:w-1/2 text-center md:text-left">
                    <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Vibra Oficial</span>
                    <h2 class="text-4xl md:text-5xl font-black mb-5 text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 tracking-tight leading-tight">Soundtrack de Nuestro Medio Año</h2>
                    <p class="text-zinc-500 dark:text-zinc-400 text-base md:text-lg font-light leading-relaxed mb-6">Porque 182 días de magia necesitaban una banda sonora a la altura. Estas son las canciones que definen tu vibra, nuestra historia y todo lo que nos hace vibrar en la misma sintonía.</p>
                    
                    <div class="flex items-center justify-center md:justify-start gap-4">
                        <div class="flex -space-x-3">
                            <div class="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                <img src="https://i.scdn.co/image/ab6761610000e5eb461e1bd420ee9576a8daaf76" alt="Yaire" class="w-full h-full object-cover" onerror="this.style.display='none';">
                                <span class="text-xs">????</span>
                            </div>
                            <div class="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-emerald-500 flex items-center justify-center text-white text-lg z-10">
                                ??
                            </div>
                        </div>
                        <span class="text-xs font-bold text-zinc-500 uppercase tracking-widest">Curado por Charles</span>
                    </div>
                </div>
                
                <!-- Spotify Embed Side -->
                <div class="w-full md:w-1/2">
                    <div class="relative group">
                        <!-- Glow behind player -->
                        <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-[30px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div class="relative bg-zinc-900 rounded-3xl p-2 md:p-3 border border-zinc-800 shadow-2xl overflow-hidden">
                            <!-- Decor -->
                            <div class="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <svg class="w-24 h-24 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.6 12.84c.42.24.6.84.361 1.2zM19.08 9.9c-3.96-2.34-10.44-2.58-14.22-1.44-.6.18-1.26-.18-1.44-.78-.18-.6.18-1.26.78-1.44 4.32-1.26 11.52-1.02 16.02 1.62.54.3 1.02.84.72 1.38-.24.54-.78.84-1.86.66z"/></svg>
                            </div>
                            
                            <iframe style="border-radius:24px" src="https://open.spotify.com/embed/playlist/34Txo6D9vCnRjezQwo2nh5?utm_source=generator&theme=0" width="100%" height="352" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" class="relative z-10 w-full h-[352px]"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="estadisticas"'''
html = html.replace('<section id="estadisticas"', playlist_html)

# Add to Menu
menu_html = '''            <div class="mt-2 mb-1">
                <a href="#playlist-aniversario" class="menu-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <span class="menu-link-icon bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">??</span>
                    <span>Soundtrack 6 Meses</span>
                </a>
            </div>

            <!-- Bóveda -->'''
html = html.replace('            <!-- Bóveda -->', menu_html)


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Playlist added.')

const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace the entire <section id="ruleta">
const oldSectionRegex = /<section id="ruleta"[\s\S]*?<\/section>/;

const newSection = `<section id="ruleta" class="py-24 border-t border-zinc-200 dark:border-zinc-800 scroll-mt-20 reveal cv-section relative overflow-hidden">
    <!-- Ambient glowing spheres -->
    <div class="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-tulip-500/20 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <h2 class="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-rose-500 to-orange-400 mb-4 drop-shadow-sm">Ruleta de Citas</h2>
        <p class="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto mb-16 font-medium">Nuestra próxima experiencia a distancia juntos será...</p>
        
        <!-- The Machine Container -->
        <div class="max-w-lg mx-auto relative p-2 rounded-[2.5rem] bg-gradient-to-b from-zinc-300 to-zinc-400 dark:from-zinc-800 dark:to-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <!-- Inner Bezel -->
            <div class="relative bg-zinc-100 dark:bg-zinc-900 rounded-[2.25rem] p-6 shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] border border-zinc-400/50 dark:border-black/50">
                
                <!-- Machine Details (Screws/Lights) -->
                <div class="absolute top-4 left-6 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-[pulse_2s_ease-in-out_infinite]"></div>
                <div class="absolute top-4 right-6 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_#ec4899]"></div>
                
                <!-- The Slot Window -->
                <div class="relative w-full h-32 bg-black rounded-xl overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,1)] border-2 border-zinc-700/50 dark:border-zinc-800 mt-4 mb-8">
                    <!-- Glass reflection -->
                    <div class="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none z-30"></div>
                    
                    <!-- Fading top/bottom gradients to simulate curvature -->
                    <div class="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-20"></div>
                    <div class="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20"></div>
                    
                    <!-- The neon selector line (Target area) -->
                    <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[48px] border-y-2 border-brand-500/80 bg-brand-500/10 pointer-events-none z-10 shadow-[0_0_15px_rgba(236,72,153,0.5),inset_0_0_10px_rgba(236,72,153,0.2)]">
                        <!-- Left/Right indicator arrows -->
                        <div class="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-brand-500 shadow-[0_0_5px_#ec4899]"></div>
                        <div class="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-brand-500 shadow-[0_0_5px_#ec4899]"></div>
                    </div>
                    
                    <!-- Numbers/Text container -->
                    <div id="roulette-slot" class="absolute left-0 right-0 flex flex-col items-center transition-transform" style="transform: translateY(0px); top: 2.5rem;">
                        <!-- JS will populate options here -->
                    </div>
                </div>
                
                <!-- The Lever/Button -->
                <button id="roulette-spin-btn" onclick="spinRoulette()" class="w-full relative group outline-none">
                    <div class="absolute -inset-1 bg-gradient-to-r from-brand-500 via-rose-500 to-orange-500 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-300"></div>
                    <div class="relative px-8 py-4 bg-gradient-to-b from-brand-500 to-rose-600 border-t border-white/20 text-white font-black text-xl rounded-xl shadow-[0_6px_0_#9f1239,0_15px_20px_rgba(0,0,0,0.4)] group-active:shadow-[0_0px_0_#9f1239,0_5px_10px_rgba(0,0,0,0.4)] group-active:translate-y-[6px] transition-all flex items-center justify-center gap-3 tracking-wide uppercase">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V8h2v4zm4 4h-2v-2h2v2zm0-4h-2V8h2v4z"/></svg>
                        Tirar de la Palanca
                    </div>
                </button>
            </div>
        </div>
    </div>
</section>`;
html = html.replace(oldSectionRegex, newSection);


// 2. Fix the JS item height
const oldJs1 = `div.className = 'h-10 flex items-center justify-center text-lg font-bold text-zinc-800 dark:text-white whitespace-nowrap';`;
const newJs1 = `div.className = 'h-[48px] flex items-center justify-center text-lg md:text-xl font-bold text-zinc-100 whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,1)]';`;
html = html.replace(oldJs1, newJs1);

const oldJs2 = `const itemHeight = 40;`;
const newJs2 = `const itemHeight = 48;`;
html = html.replace(oldJs2, newJs2);

fs.writeFileSync('index.html', html);
console.log('Roulette design updated successfully!');

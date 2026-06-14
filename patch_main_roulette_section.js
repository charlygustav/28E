const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Change the menu link from openRoulette() to #ruleta
const oldLinkRegex = /<a href="javascript:void\(0\)" onclick="openRoulette\(\); toggleMenu\(\);" class="menu-link menu-link-item text-zinc-600 dark:text-zinc-400 relative">/g;
html = html.replace(oldLinkRegex, `<a href="#ruleta" onclick="toggleMenu();" class="menu-link menu-link-item text-zinc-600 dark:text-zinc-400 relative">`);

// 2. Remove the modal HTML completely
const modalRegex = /<!-- Roulette Modal -->[\s\S]*?<\/div>\s*<\/div>/g;
html = html.replace(modalRegex, '');

// 3. Inject the Section before <!-- Promesas -->
const promesasTarget = `<!-- Promesas -->`;
const sectionHtml = `<!-- Ruleta de Citas -->
        <section id="ruleta" class="py-24 border-t border-zinc-200 dark:border-zinc-800 scroll-mt-20 reveal">
            <div class="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-tulip-500 mb-4">Ruleta de Citas</h2>
                <p class="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-12">Nuestra próxima experiencia a distancia juntos será...</p>
                
                <div class="max-w-xl mx-auto relative p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl">
                    <!-- Slot Machine Display -->
                    <div class="relative w-full h-24 bg-white dark:bg-black border border-zinc-300 dark:border-white/10 rounded-2xl overflow-hidden shadow-inner mb-8">
                        <!-- Highlight line -->
                        <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-brand-500/10 border-y border-brand-500/20 pointer-events-none z-10"></div>
                        <div class="absolute inset-0 bg-gradient-to-b from-zinc-100 via-transparent to-zinc-100 dark:from-black dark:via-transparent dark:to-black pointer-events-none z-20"></div>
                        <!-- Numbers/Text container -->
                        <div id="roulette-slot" class="absolute left-0 right-0 flex flex-col items-center transition-transform" style="transform: translateY(0px); top: 1.25rem;">
                            <!-- JS will populate options here -->
                        </div>
                    </div>
                    
                    <button id="roulette-spin-btn" onclick="spinRoulette()" class="px-8 py-3 bg-gradient-to-r from-brand-500 to-tulip-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:scale-105 transition-all active:scale-95 text-lg">
                        🎰 Tirar de la Palanca
                    </button>
                </div>
            </div>
        </section>

        <!-- Promesas -->`;
html = html.replace(promesasTarget, sectionHtml);

// 4. Update JS logic (remove window.openRoulette and window.closeRoulette, add initialization on load)
const oldScriptTarget = `        window.openRoulette = function() {
            const modal = document.getElementById('roulette-modal');
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.classList.add('opacity-100');
            }, 10);
            initRouletteSlot();
        };

        window.closeRoulette = function() {
            const modal = document.getElementById('roulette-modal');
            modal.classList.remove('opacity-100');
            modal.classList.add('opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.style.display = '';
            }, 500);
        };`;
html = html.replace(oldScriptTarget, '');

const textWhiteRegex = /text-white whitespace-nowrap/g;
html = html.replace(textWhiteRegex, 'text-zinc-800 dark:text-white whitespace-nowrap');

const initCallRegex = /<\/script>\s*<\/body>/g;
html = html.replace(initCallRegex, `
        document.addEventListener("DOMContentLoaded", () => {
            initRouletteSlot();
        });
    </script>
</body>`);

fs.writeFileSync('index.html', html);
console.log('Roulette migrated to section successfully!');

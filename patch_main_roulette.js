const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Inject Menu Link
const menuLinkTarget = `<span data-i18n="menu_games">Minijuegos</span>
                </a>`;
const menuLinkReplacement = `<span data-i18n="menu_games">Minijuegos</span>
                </a>
                <a href="javascript:void(0)" onclick="openRoulette(); toggleMenu();" class="menu-link menu-link-item text-zinc-600 dark:text-zinc-400 relative">
                    <span class="menu-link-icon bg-red-50 dark:bg-red-900/20 shadow-[0_0_12px_rgba(239,68,68,0.3)]">🎰</span>
                    <span>Ruleta de Citas</span>
                </a>`;
html = html.replace(menuLinkTarget, menuLinkReplacement);

// 2. Inject Modal HTML
const modalTarget = `</body>`;
const modalHTML = `
    <!-- Roulette Modal -->
    <div id="roulette-modal" class="fixed inset-0 z-[100] hidden flex-col items-center justify-center opacity-0 transition-opacity duration-500">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-xl" onclick="closeRoulette()"></div>
        <!-- Modal Content -->
        <div class="relative w-11/12 max-w-md bg-white/10 dark:bg-black/40 backdrop-blur-3xl border border-white/20 rounded-[2rem] shadow-[0_16px_64px_rgba(0,0,0,0.5)] p-8 text-center flex flex-col items-center overflow-hidden">
            <!-- Glow -->
            <div class="absolute -top-32 -left-32 w-64 h-64 bg-brand-500/30 rounded-full blur-[80px] pointer-events-none"></div>
            <div class="absolute -bottom-32 -right-32 w-64 h-64 bg-tulip-500/30 rounded-full blur-[80px] pointer-events-none"></div>
            
            <h2 class="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">Ruleta de Citas</h2>
            <p class="text-zinc-200 text-sm mb-8 font-medium">Nuestra próxima cita virtual será...</p>
            
            <!-- Slot Machine Display -->
            <div class="relative w-full h-24 bg-black/50 border border-white/20 rounded-2xl overflow-hidden shadow-inner mb-8">
                <!-- Highlight line -->
                <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-white/10 border-y border-white/20 pointer-events-none z-10"></div>
                <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none z-20"></div>
                <!-- Numbers/Text container -->
                <div id="roulette-slot" class="absolute left-0 right-0 flex flex-col items-center transition-transform" style="transform: translateY(0px); top: 1.25rem;">
                    <!-- JS will populate options here -->
                </div>
            </div>
            
            <button id="roulette-spin-btn" onclick="spinRoulette()" class="px-8 py-3 bg-gradient-to-r from-brand-500 to-tulip-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)] hover:scale-105 transition-all active:scale-95">
                🎰 Tirar de la Palanca
            </button>
            <button onclick="closeRoulette()" class="mt-5 text-xs font-bold text-zinc-400 hover:text-white transition-colors tracking-widest uppercase">
                Cerrar
            </button>
        </div>
    </div>
</body>`;
html = html.replace(modalTarget, modalHTML);

// 3. Inject JS Logic
const scriptTarget = `        // Listen to presence events from UI`;
const scriptReplacement = `
        // --- ROULETTE LOGIC ---
        const rouletteIdeas = [
            "🍕 Cena Sorpresa (UberEats cruzado)",
            "🍿 Noche de Cine Sincronizada",
            "🎮 Noche Gamer Juntos",
            "✈️ Turismo Virtual por Europa",
            "🎵 Batalla Musical de la Radio",
            "🍷 Cita de Gala en Llamada",
            "🛌 Pijamada en Llamada",
            "❓ Test de Preguntas Profundas",
            "🎨 Noche de Dibujar Juntos",
            "☕ Café Virtual por la Mañana"
        ];
        
        window.openRoulette = function() {
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
        };

        let isSpinningRoulette = false;
        function initRouletteSlot() {
            const slot = document.getElementById('roulette-slot');
            slot.innerHTML = '';
            const longList = [];
            for(let i=0; i<30; i++) {
                longList.push(...rouletteIdeas);
            }
            
            longList.forEach(idea => {
                const div = document.createElement('div');
                div.className = 'h-10 flex items-center justify-center text-lg font-bold text-white whitespace-nowrap';
                div.innerText = idea;
                slot.appendChild(div);
            });
            
            if (!isSpinningRoulette) {
                gsap.set(slot, { y: 0 });
            }
        }

        window.spinRoulette = function() {
            if (isSpinningRoulette) return;
            isSpinningRoulette = true;
            
            const slot = document.getElementById('roulette-slot');
            const itemHeight = 40; 
            const totalItems = rouletteIdeas.length;
            
            const winnerIndex = Math.floor(Math.random() * totalItems);
            const targetItemIndex = (20 * totalItems) + winnerIndex;
            
            const targetY = -(targetItemIndex * itemHeight);
            
            const btn = document.getElementById('roulette-spin-btn');
            btn.innerText = 'Girando...';
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
            
            gsap.to(slot, {
                y: targetY,
                duration: 6,
                ease: "power4.out",
                onComplete: () => {
                    isSpinningRoulette = false;
                    btn.innerText = '🎰 Tirar de la Palanca';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    try {
                        confetti({
                            particleCount: 150,
                            spread: 80,
                            origin: { y: 0.6 },
                            colors: ['#ec4899', '#8b5cf6', '#f43f5e', '#fbbf24'],
                            zIndex: 9999
                        });
                    } catch(e){}
                    
                    try {
                        const audio = new Audio('/api/tts?text=' + encodeURIComponent("Su cita de hoy será: " + rouletteIdeas[winnerIndex]));
                        audio.play().catch(e=>console.log(e));
                    } catch(e){}
                }
            });
        };

        // Listen to presence events from UI`;
html = html.replace(scriptTarget, scriptReplacement);

fs.writeFileSync('index.html', html);
console.log('Roulette injected successfully!');

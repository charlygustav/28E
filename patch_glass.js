const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Menu Panel (Modal Container)
const menuPanelRegex = /<div id="menu-panel"[\s\S]*?class="bg-white\/95[^"]*"/;
const menuPanelReplacement = `<div id="menu-panel"
        class="bg-white/70 dark:bg-zinc-950/40 backdrop-blur-3xl transform-gpu rounded-[2rem] border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_16px_48px_0_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative"`;
html = html.replace(menuPanelRegex, menuPanelReplacement);

// 2. Add Ambient Glow inside menu panel
const headerRegex = /<!-- Header -->/;
const headerReplacement = `<!-- Ambient Crystal Glow -->
        <div class="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-purple-500/10 pointer-events-none" style="z-index:-1;"></div>
        <div class="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] rounded-[2rem] pointer-events-none" style="z-index:-1;"></div>
        <!-- Header -->`;
html = html.replace(headerRegex, headerReplacement);

// 3. Search Bar
const searchRegex = /id="menu-search" type="text" placeholder="Buscar sección\.\.\." autocomplete="off"[\s\S]*?class="w-full pl-9 pr-4 py-2\.5 rounded-xl bg-zinc-100 dark:bg-zinc-800\/80 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200\/50 dark:border-zinc-700\/50 transition-all"/;
const searchReplacement = `id="menu-search" type="text" placeholder="Buscar sección..." autocomplete="off"
                    data-i18n-placeholder="search_placeholder"
                    class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-md text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 border border-white/30 dark:border-white/10 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"`;
html = html.replace(searchRegex, searchReplacement);

// 4. Category Icons (Add Subtle Colored Shadows based on emoji)
// For Esencia (Inicio - Amber)
html = html.replace('class="menu-link-icon bg-amber-50 dark:bg-amber-900/20"', 'class="menu-link-icon bg-amber-50 dark:bg-amber-900/20 shadow-[0_0_12px_rgba(245,158,11,0.3)]"');
// Historia & Tiempo (Blue)
html = html.replace('class="menu-link-icon bg-blue-50 dark:bg-blue-900/20"', 'class="menu-link-icon bg-blue-50 dark:bg-blue-900/20 shadow-[0_0_12px_rgba(59,130,246,0.3)]"');
// Tu Nombre (Yellow)
html = html.replace('class="menu-link-icon bg-yellow-50 dark:bg-yellow-900/20"', 'class="menu-link-icon bg-yellow-50 dark:bg-yellow-900/20 shadow-[0_0_12px_rgba(234,179,8,0.3)]"');
// Tus Flores (Rose)
html = html.replace('class="menu-link-icon bg-rose-50 dark:bg-rose-900/20"', 'class="menu-link-icon bg-rose-50 dark:bg-rose-900/20 shadow-[0_0_12px_rgba(244,63,94,0.3)]"');
// El Misterio (Emerald)
html = html.replace('class="menu-link-icon bg-emerald-50 dark:bg-emerald-900/20"', 'class="menu-link-icon bg-emerald-50 dark:bg-emerald-900/20 shadow-[0_0_12px_rgba(16,185,129,0.3)]"');
// La Distancia (Indigo)
html = html.replace('class="menu-link-icon bg-indigo-50 dark:bg-indigo-900/20"', 'class="menu-link-icon bg-indigo-50 dark:bg-indigo-900/20 shadow-[0_0_12px_rgba(99,102,241,0.3)]"');
// El Pacto (Purple)
html = html.replace('class="menu-link-icon bg-purple-50 dark:bg-purple-900/20"', 'class="menu-link-icon bg-purple-50 dark:bg-purple-900/20 shadow-[0_0_12px_rgba(168,85,247,0.3)]"');
// Su Universo (Fuchsia)
html = html.replace('class="menu-link-icon bg-fuchsia-50 dark:bg-fuchsia-900/20"', 'class="menu-link-icon bg-fuchsia-50 dark:bg-fuchsia-900/20 shadow-[0_0_12px_rgba(217,70,239,0.3)]"');
// Galeria de Arte (Orange)
html = html.replace('class="menu-link-icon bg-orange-50 dark:bg-orange-900/20"', 'class="menu-link-icon bg-orange-50 dark:bg-orange-900/20 shadow-[0_0_12px_rgba(249,115,22,0.3)]"');
// Minijuegos (Violet)
html = html.replace('class="menu-link-icon bg-violet-50 dark:bg-violet-900/20"', 'class="menu-link-icon bg-violet-50 dark:bg-violet-900/20 shadow-[0_0_12px_rgba(139,92,246,0.3)]"');

// 5. Mini Player Bottom Border (Spotlight Compact)
const playerRegex = /id="spotlight-compact"[\s\S]*?class="flex items-center gap-3 px-4 py-3 border-t border-zinc-200\/50 dark:border-zinc-700\/50/;
const playerReplacement = `id="spotlight-compact"
            class="flex items-center gap-3 px-4 py-3 border-t border-white/20 dark:border-white/5`;
html = html.replace(playerRegex, playerReplacement);

// 6. Footer (Idioma) Bottom Border
const footerRegex = /<!-- Footer -->\s*<div class="px-5 py-3 border-t border-zinc-200\/50 dark:border-zinc-700\/50 flex items-center justify-between">/;
const footerReplacement = `<!-- Footer -->
        <div class="px-5 py-3 border-t border-white/20 dark:border-white/5 flex items-center justify-between">`;
html = html.replace(footerRegex, footerReplacement);

fs.writeFileSync('index.html', html);
console.log('Patch complete.');

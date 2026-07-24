const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove translateText function definition 1 (around line 4164)
html = html.replace(/        \/\/ TRANSLATE\s+async function translateText[\s\S]*?return data\.responseData\.translatedText;\s+}/g, '');

// Remove translateText function definition 2 (around line 4308)
html = html.replace(/            \/\/ Funcin para traducir textos automticamente[\s\S]*?return data\[0\]\[0\]\[0\];\s+}\s+catch[^\}]+return text;\s+}\s+};?/g, '');
html = html.replace(/            \/\/ Función para traducir textos automáticamente[\s\S]*?return data\[0\]\[0\]\[0\];\s+}\s+catch[^\}]+return text;\s+}\s+};?/g, '');
// It might have weird characters, so let's just do a simpler replace for translateText calls first:

// Remove all `_en`, `_pt`, `_fr` assignments
html = html.replace(/.*translateText.*\n/g, '');

// Also remove manual assignments like `cfg.heroBadgeLinkText_en = '';`
html = html.replace(/.*_en\s*=\s*['"`].*\n/g, '');
html = html.replace(/.*_pt\s*=\s*['"`].*\n/g, '');
html = html.replace(/.*_fr\s*=\s*['"`].*\n/g, '');

// Remove `cfg.spotlightTips = { es: tipsEs, en: tipsEn, pt: tipsPt, fr: tipsFr };`
html = html.replace(/cfg\.spotlightTips\s*=\s*\{[^\}]+\};/g, 'cfg.spotlightTips = { es: tipsEs };');

fs.writeFileSync('index.html', html);
console.log('Admin panel auto-translation removed.');

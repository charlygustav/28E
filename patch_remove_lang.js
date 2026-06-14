const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove the footer language selector
const footerRegex = /<!-- Footer: Language Selector -->[\s\S]*?<\/div>\s*<\/div>\s*<!-- Spotlight Expanded/g;
html = html.replace(footerRegex, '<!-- Spotlight Expanded');

// 2. Remove the dictionaries from const dictionary = { es: { ... }, en: { ... }, fr: { ... }, pt: { ... } };
// Since we know the exact structure, we can slice it safely or use a regex to remove everything after es: { ... }
// Let's find the start of 'en: {'
const enIndex = html.indexOf('            en: {');
if (enIndex !== -1) {
    // The dictionary object ends at '        };\n' before '        let currentLang = '
    const endDictIndex = html.indexOf('        };\n        let currentLang');
    if (endDictIndex !== -1) {
        // We want to replace from enIndex to endDictIndex with just spaces or empty string, BUT keep the closing brace for 'es: {' if it's there.
        // Wait, 'es' ends with '},\n            en: {'
        // So we can find '},\n            en: {'
        const esEndIndex = html.indexOf('},\n            en: {');
        if (esEndIndex !== -1) {
            html = html.substring(0, esEndIndex) + '}\n' + html.substring(endDictIndex);
        }
    }
}

// 3. Optional: we can just leave currentLang defaults as 'es', and initLanguage() just runs setLanguage('es') but no buttons will attach.
// We can remove the querySelectorAll('.lang-btn') in initLanguage()
html = html.replace("document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', (e) => setLanguage(e.currentTarget.getAttribute('data-lang'), true)));", "");

fs.writeFileSync('index.html', html);
console.log('Language selector and dictionaries removed successfully!');

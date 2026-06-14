const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the end of the `es:` object, which is `    },\n            en: {`
const esEndRegex = /\s*},\s*en: \{/;
const esEndMatch = html.match(esEndRegex);

if (esEndMatch) {
    const startIndex = esEndMatch.index;
    
    // Find where the dictionary ends, which is before `let currentLang = 'es';`
    const endIndexMatch = html.match(/\s*};\s*let currentLang = 'es';/);
    if (endIndexMatch) {
        const endIndex = endIndexMatch.index;
        
        // Slice out the other languages, keeping the closing brace of 'es' and closing the dictionary
        html = html.substring(0, startIndex) + '\n        }\n        };\n\n        let currentLang = \'es\';' + html.substring(endIndex + endIndexMatch[0].length);
        
        fs.writeFileSync('index.html', html);
        console.log('Dictionaries removed completely!');
    } else {
        console.log('End of dictionary not found');
    }
} else {
    console.log('es: end not found');
}

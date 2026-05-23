const fs = require('fs');
const text = fs.readFileSync('index.html', 'utf8');
const r = /<section[^>]*id=(['"])(.*?)\1/g;
const secMap = [
    "hero", "frase-del-dia", "historia", "nombre", "tulipanes", "quiz-girasol",
    "distancia", "comida", "universo", "galeria", "minijuegos", "promesas",
    "guestbook", "colores-yaire", "memorial", "hype", "estadisticas", "top5yaire",
    "enigma-28", "secreto"
];
for (const match of text.matchAll(r)) {
    if (!secMap.includes(match[2])) {
        console.log("Missing from secMap: " + match[2]);
    }
}

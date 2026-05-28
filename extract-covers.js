const NodeID3 = require('node-id3');
const fs = require('fs');

const files = [
  { src: 'sounds/Otis McDonald - O.Sky.mp3', out: 'images/cover_1.png' },
  { src: 'sounds/THIZZY52 - BLOCKKIDS.mp3', out: 'images/cover_2.png' },
  { src: "sounds/Oro Fundido - Oblivion's Mighty Trash - SpotubeDL.com.mp3", out: 'images/cover_3.png' },
  { src: 'sounds/Otis McDonald - CRAZY - Live (SPOTISAVER).mp3', out: 'images/cover_4.png' },
  { src: 'sounds/Huan62 - Toto Lindo.mp3', out: 'images/cover_5.png' }
];

let extracted = 0;
files.forEach((f, i) => {
  const tags = NodeID3.read(f.src);
  if (tags && tags.image && tags.image.imageBuffer) {
    fs.writeFileSync(f.out, tags.image.imageBuffer);
    console.log('Extracted cover for ' + f.src);
    extracted++;
  } else {
    console.log('No cover found for ' + f.src);
  }
});
console.log('Total extracted: ' + extracted);

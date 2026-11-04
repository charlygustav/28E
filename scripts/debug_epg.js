const fs = require('fs');
const html = fs.readFileSync('../tv.html', 'utf8');
const lines = html.split('\n');

console.log('=== selectedEpgChannel ===');
lines.forEach((l, i) => {
  if (l.includes('selectedEpgChannel')) console.log((i+1) + ': ' + l.trim());
});

console.log('\n=== btn-epg HTML ===');
lines.forEach((l, i) => {
  if (l.includes('btn-epg')) console.log((i+1) + ': ' + l.trim());
});

console.log('\n=== renderEPG usages ===');
lines.forEach((l, i) => {
  if (l.includes('renderEPG')) console.log((i+1) + ': ' + l.trim());
});

console.log('\n=== epg-tune ===');
lines.forEach((l, i) => {
  if (l.includes('__tune')) console.log((i+1) + ': ' + l.trim());
});

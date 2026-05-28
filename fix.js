const fs = require('fs');
let html = fs.readFileSync('mantenimiento.html', 'utf8');

const startMarker = '.clean-icon {';
const endMarker = '/* ── Columna izquierda: panel visual ── */';

const startIndex = html.indexOf(startMarker);
const endIndex = html.indexOf(endMarker);

const newCss = `.clean-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  color: var(--tulip-400);
}

html, body {
  width: 100%;
  height: 100%;
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

/* ═══ Layout principal: dos columnas ═══ */
.layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  width: 100vw;
  height: 100dvh;
}

`;

html = html.substring(0, startIndex) + newCss + html.substring(endIndex);
fs.writeFileSync('mantenimiento.html', html);
console.log('Fixed CSS');

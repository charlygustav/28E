const fs = require('fs');
const path = require('path');

const markBase64 = fs.readFileSync(path.join(__dirname, '../assets/logos/28e_mark_white.png')).toString('base64');
const tulipBase64 = fs.readFileSync(path.join(__dirname, '../assets/logos/tulip.png')).toString('base64');

// 1. Canal 01: 28E Uno
// Optimized: Bolder, larger channel wordmark that optically matches the 28E mark
const svgUno = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 236 80" fill="none">
  <!-- Original 28E Mark -->
  <image href="data:image/png;base64,${markBase64}" x="8" y="18" height="44" width="120" preserveAspectRatio="xMidYMid meet"/>
  <!-- Minimalist Divider -->
  <line x1="138" y1="23" x2="138" y2="57" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
  <!-- Apple-Style Wordmark -->
  <text x="152" y="52" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', 'Inter', sans-serif" font-weight="700" font-size="33" fill="#ffffff" letter-spacing="-0.02em">uno</text>
</svg>`;

// 2. Canal 02: 28E Flow
const svgFlow = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 80" fill="none">
  <!-- Original 28E Mark -->
  <image href="data:image/png;base64,${markBase64}" x="8" y="18" height="44" width="120" preserveAspectRatio="xMidYMid meet"/>
  <!-- Minimalist Divider -->
  <line x1="138" y1="23" x2="138" y2="57" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
  <!-- Apple-Style Wordmark -->
  <text x="152" y="52" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', 'Inter', sans-serif" font-weight="700" font-size="33" fill="#ffffff" letter-spacing="-0.02em">flow</text>
</svg>`;

// 3. Canal 03: DCLF TV
const svgDclf = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 356 80" fill="none">
  <!-- Official 3D Island from tulip.ico -->
  <image href="data:image/png;base64,${tulipBase64}" x="6" y="10" height="60" width="60" preserveAspectRatio="xMidYMid meet"/>
  <!-- Original 28E Mark -->
  <image href="data:image/png;base64,${markBase64}" x="76" y="20" height="40" width="109" preserveAspectRatio="xMidYMid meet"/>
  <!-- Minimalist Divider -->
  <line x1="195" y1="23" x2="195" y2="57" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
  <!-- Apple-Style Wordmark -->
  <text x="209" y="51" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', 'Inter', sans-serif" font-weight="700" font-size="28" fill="#ffffff" letter-spacing="0.02em">DCLF</text>
  <text x="286" y="51" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', 'Inter', sans-serif" font-weight="400" font-size="21" fill="rgba(255,255,255,0.7)" letter-spacing="0.06em">TV</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, '../assets/logos/logo_28e_uno.svg'), svgUno, 'utf8');
fs.writeFileSync(path.join(__dirname, '../assets/logos/logo_28e_flow.svg'), svgFlow, 'utf8');
fs.writeFileSync(path.join(__dirname, '../assets/logos/logo_dclf_tv.svg'), svgDclf, 'utf8');

console.log('Successfully written optically balanced SVGs for TV watermark bug.');

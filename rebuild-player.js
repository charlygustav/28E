const fs = require('fs');
let html = fs.readFileSync('mantenimiento.html', 'utf8');

// 1. Replace CSS
const cssStart = html.indexOf('/* ═══════════════════════════════════════════════════\n       MINI PLAYER');
const cssEnd = html.indexOf('/* ═══════════════════════════════════════════════════\n       RESPONSIVE');

const newCss = `/* ═══════════════════════════════════════════════════
       MINI PLAYER
       ═══════════════════════════════════════════════════ */
    .mini-player {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 60;
      width: 320px;
      background: rgba(24, 24, 27, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 1rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      padding: 0.85rem;
      opacity: 0;
      transform: translateY(-16px);
      transition: opacity 0.4s ease, transform 0.4s ease;
    }

    .mini-player.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .mp-main {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 0.75rem;
    }

    .mp-cover {
      width: 44px;
      height: 44px;
      border-radius: 0.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
      transition: background 0.3s ease;
    }

    .mp-cover-icon {
      font-size: 1.3rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      animation: gentleBob 3s ease-in-out infinite;
    }

    @keyframes gentleBob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    .mp-info { flex: 1; min-width: 0; }

    .mp-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    .mp-artist {
      font-size: 0.65rem;
      font-weight: 500;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mp-controls {
      display: flex;
      align-items: center;
      gap: 0.15rem;
      flex-shrink: 0;
    }

    .mp-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.1s ease;
    }

    .mp-btn:hover { background: rgba(255, 255, 255, 0.1); }
    .mp-btn:active { transform: scale(0.92); }

    .mp-btn svg {
      width: 14px;
      height: 14px;
      fill: var(--muted);
      transition: fill 0.15s ease;
    }

    .mp-btn:hover svg { fill: #fff; }

    .mp-btn-play {
      width: 36px;
      height: 36px;
      background: var(--text);
    }

    .mp-btn-play:hover { background: #fff; transform: scale(1.05); }
    .mp-btn-play:active { transform: scale(0.95); }
    .mp-btn-play svg { fill: #000; width: 15px; height: 15px; }
    .mp-btn-play:hover svg { fill: #000; }

    .mp-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .mp-time {
      font-size: 0.55rem;
      font-weight: 600;
      color: #71717a;
      min-width: 28px;
      font-variant-numeric: tabular-nums;
    }

    .mp-time-end { text-align: right; }

    .mp-track {
      flex: 1;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: height 0.15s ease;
    }

    .mp-track:hover { height: 6px; }

    .mp-fill {
      height: 100%;
      width: 0%;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--tulip-500), var(--amber-400));
      transition: width 0.1s linear;
    }

    `;
html = html.substring(0, cssStart) + newCss + html.substring(cssEnd);

// 2. Replace HTML
const htmlStart = html.indexOf('<div class="mini-player" id="mini-player">');
const htmlEnd = html.indexOf('<!-- ════════════════════════════════════════════════\n       SCRIPTS');

const newHtml = `<div class="mini-player" id="mini-player">
    <div class="mp-main">
      <div class="mp-cover" id="mp-cover" style="background: linear-gradient(135deg, #f59e0b, #ef4444);">
        <div class="mp-cover-icon" id="mp-cover-icon">☀️</div>
      </div>
      <div class="mp-info">
        <div class="mp-title" id="mp-title">O.Sky</div>
        <div class="mp-artist" id="mp-artist">Otis McDonald</div>
      </div>
      <div class="mp-controls">
        <button class="mp-btn" id="mp-prev" aria-label="Anterior">
          <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
        </button>
        <button class="mp-btn mp-btn-play" id="mp-play" aria-label="Play">
          <svg id="mp-icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          <svg id="mp-icon-pause" viewBox="0 0 24 24" style="display:none"><path d="M6 19h4V5H6zm8-14v14h4V5z" /></svg>
        </button>
        <button class="mp-btn" id="mp-next" aria-label="Siguiente">
          <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6z" /></svg>
        </button>
      </div>
    </div>
    <div class="mp-progress">
      <span class="mp-time" id="mp-time-now">0:00</span>
      <div class="mp-track" id="mp-track">
        <div class="mp-fill" id="mp-fill"></div>
      </div>
      <span class="mp-time mp-time-end" id="mp-time-end">0:00</span>
    </div>
  </div>

  `;
html = html.substring(0, htmlStart) + newHtml + html.substring(htmlEnd);

// 3. Replace JS variables
html = html.replace(
  "const mpArtist   = document.getElementById('mp-artist');",
  "const mpArtist   = document.getElementById('mp-artist');\\n    const mpCover    = document.getElementById('mp-cover');\\n    const mpCoverIcon= document.getElementById('mp-cover-icon');"
);

// 4. Replace JS playlist
const playlistOld = `const playlist = [
      { src: 'sounds/Otis McDonald - O.Sky.mp3', title: 'O.Sky', artist: 'Otis McDonald' },
      { src: 'sounds/THIZZY52 - BLOCKKIDS.mp3', title: 'BLOCKKIDS', artist: 'THIZZY52' },
      { src: "sounds/Oro Fundido - Oblivion's Mighty Trash - SpotubeDL.com.mp3", title: 'Oro Fundido', artist: "Oblivion's Mighty Trash" },
      { src: 'sounds/Otis McDonald - CRAZY - Live (SPOTISAVER).mp3', title: 'CRAZY (Live)', artist: 'Otis McDonald' },
      { src: 'sounds/Huan62 - Toto Lindo.mp3', title: 'Toto Lindo', artist: 'Huan62' },
    ];`;
const playlistNew = `const playlist = [
      { src: 'sounds/Otis McDonald - O.Sky.mp3', title: 'O.Sky', artist: 'Otis McDonald', icon: '☀️', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
      { src: 'sounds/THIZZY52 - BLOCKKIDS.mp3', title: 'BLOCKKIDS', artist: 'THIZZY52', icon: '🔥', gradient: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' },
      { src: "sounds/Oro Fundido - Oblivion's Mighty Trash - SpotubeDL.com.mp3", title: 'Oro Fundido', artist: "Oblivion's Mighty Trash", icon: '✨', gradient: 'linear-gradient(135deg, #fbbf24, #d97706)' },
      { src: 'sounds/Otis McDonald - CRAZY - Live (SPOTISAVER).mp3', title: 'CRAZY (Live)', artist: 'Otis McDonald', icon: '🎸', gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
      { src: 'sounds/Huan62 - Toto Lindo.mp3', title: 'Toto Lindo', artist: 'Huan62', icon: '🌴', gradient: 'linear-gradient(135deg, #10b981, #06b6d4)' },
    ];`;
html = html.replace(playlistOld, playlistNew);

// 5. Update loadTrack function
const loadTrackOld = `function loadTrack(i, autoplay) {
      const t = playlist[i];
      audio.src = t.src;
      mpTitle.textContent = t.title;
      mpArtist.textContent = t.artist;
      mpTimeNow.textContent = '0:00';
      mpTimeEnd.textContent = '0:00';
      mpFill.style.width = '0%';
      if (autoplay) audio.play().then(() => setPlaying(true)).catch(() => {});
    }`;
const loadTrackNew = `function loadTrack(i, autoplay) {
      const t = playlist[i];
      audio.src = t.src;
      mpTitle.textContent = t.title;
      mpArtist.textContent = t.artist;
      mpCover.style.background = t.gradient;
      mpCoverIcon.textContent = t.icon;
      mpTimeNow.textContent = '0:00';
      mpTimeEnd.textContent = '0:00';
      mpFill.style.width = '0%';
      if (autoplay) audio.play().then(() => setPlaying(true)).catch(() => {});
    }`;
html = html.replace(loadTrackOld, loadTrackNew);

fs.writeFileSync('mantenimiento.html', html);
console.log('Player rebuild complete.');

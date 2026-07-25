const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Reemplazar zenoAudio por fbRadioAudio y declarar variables
html = html.replace(
    "let zenoAudio = new Audio(); // Placeholder until URL is provided",
    `let fbRadioAudio = new Audio();
let radioUnsubscribe = null;
let serverTimeOffset = 0;

function startFirebaseRadio() {
    if (!window.yaireRadioFb) {
        setTimeout(startFirebaseRadio, 100);
        return;
    }
    const { db, ref, onValue } = window.yaireRadioFb;
    
    if (!radioUnsubscribe) {
        onValue(ref(db, '.info/serverTimeOffset'), snap => {
            serverTimeOffset = snap.val() || 0;
        });

        radioUnsubscribe = onValue(ref(db, 'radio_state/current'), snap => {
            const state = snap.val();
            if (!state || spotlightMode !== 'radio') return;

            const expTitle = document.getElementById('spotlight-expanded-title');
            const expArtist = document.getElementById('spotlight-expanded-artist');
            const compactArtist = document.getElementById('spotlight-artist');
            
            if (expTitle) expTitle.textContent = state.title || 'Spotlight Music';
            if (expArtist) expArtist.innerHTML = \`<span class="text-red-500 font-bold tracking-widest uppercase animate-pulse">🔴 EN VIVO: \${state.artist || 'Transmisión'}</span>\`;
            if (compactArtist) compactArtist.innerHTML = \`<span class="text-red-500 font-bold tracking-wider animate-pulse">🔴 \${state.artist || 'EN VIVO'}</span>\`;

            if (state.title && state.artist) {
                fetchSpotlightArtwork({title: state.title, artist: state.artist}).then(url => updateAllArtwork(url || 'tulip.ico?v=3'));
            }

            if (state.isPlaying) {
                if (fbRadioAudio.src !== new URL(state.src, document.baseURI).href) {
                    fbRadioAudio.src = state.src;
                    fbRadioAudio.load();
                }
                
                const now = Date.now() + serverTimeOffset;
                let seekTime = (now - state.startTime) / 1000;
                if (seekTime < 0) seekTime = 0;
                
                if (Math.abs(fbRadioAudio.currentTime - seekTime) > 2) {
                    fbRadioAudio.currentTime = seekTime;
                }

                if (fbRadioAudio.paused && isSpotPlaying) {
                    fbRadioAudio.play().catch(e => console.error("Radio play error:", e));
                }
            } else {
                fbRadioAudio.pause();
            }
        });
    }

    if (!isSpotPlaying) {
        isSpotPlaying = true;
        spotlightUpdateUI();
        if (fbRadioAudio.src) {
            fbRadioAudio.play().catch(e => console.error("Radio play error:", e));
        }
    }
}

function stopFirebaseRadio() {
    isSpotPlaying = false;
    fbRadioAudio.pause();
    spotlightUpdateUI();
    document.title = '28E';
}

fbRadioAudio.addEventListener('ended', () => {
    if (spotlightMode !== 'radio' || !window.yaireRadioFb) return;
    const { db, ref, runTransaction, serverTimestamp } = window.yaireRadioFb;
    const endedSrc = fbRadioAudio.src;

    runTransaction(ref(db, 'radio_state/current'), (currentData) => {
        if (!currentData) return currentData;
        const currentAbsoluteSrc = new URL(currentData.src, document.baseURI).href;
        if (currentAbsoluteSrc !== endedSrc) return; // Alguien más ya avanzó

        let nextIndex = 0;
        const currentIndex = spotlightTracks.findIndex(t => t.src === currentData.src || new URL(t.src, document.baseURI).href === currentData.src);
        if (currentIndex !== -1) {
            nextIndex = (currentIndex + 1) % spotlightTracks.length;
        }

        const nextTrack = spotlightTracks[nextIndex];
        currentData.src = nextTrack.src;
        currentData.title = nextTrack.title;
        currentData.artist = nextTrack.artist;
        currentData.startTime = serverTimestamp();
        currentData.isPlaying = true;
        currentData.source = 'auto';

        return currentData;
    });
});`
);

// 2. Reemplazar zenoAudio logic inside mode switch
html = html.replace("if (mode === 'music' && zenoAudio) zenoAudio.pause();", "if (mode === 'music') stopFirebaseRadio();");
html = html.replace("if (mode === 'radio' && spotAudio) spotAudio.pause();", "if (mode === 'radio' && spotAudio) { spotAudio.pause(); if (isSpotPlaying) startFirebaseRadio(); }");

// 3. Reemplazar zenoAudio logic inside spotlightTogglePlay
const oldToggle = `                    if (spotlightMode === 'radio') {
                        if (isSpotPlaying) {
                            zenoAudio.pause();
                            isSpotPlaying = false;
                            spotlightUpdateUI();
                            document.title = '28E';
                        } else {
                            if (!zenoAudio.src || zenoAudio.src === window.location.href) {
                                // Live Zeno FM Stream
                                zenoAudio.src = 'https://stream.zeno.fm/ox28sopxqt1vv'; 
                                zenoAudio.load();
                            }
                            
                            // Optimistic UI update so the user knows it's loading/playing
                            isSpotPlaying = true;
                            spotlightUpdateUI();
                            
                            zenoAudio.play().catch(err => {
                                console.error('Zeno stream playback failed:', err);
                                isSpotPlaying = false;
                                spotlightUpdateUI();
                                alert('No se pudo conectar a la transmisión en vivo. Asegúrate de que la radio está ENCENDIDA y transmitiendo en Zeno.fm.');
                            });
                        }
                    }`;

const newToggle = `                    if (spotlightMode === 'radio') {
                        if (isSpotPlaying) {
                            stopFirebaseRadio();
                        } else {
                            startFirebaseRadio();
                        }
                    }`;

if (html.includes(oldToggle)) {
    html = html.replace(oldToggle, newToggle);
} else {
    console.error("No se encontro oldToggle.");
    // Usamos regex por si hay problemas de espaciado
    html = html.replace(/if \(spotlightMode === 'radio'\) \{[\s\S]*?alert\('No se pudo conectar.*?\}\);[\s\S]*?\}[\s\S]*?\}/, newToggle);
}

// 4. Update Firebase imports
html = html.replace(
    "import { getDatabase, ref, push, onValue, onDisconnect, set, serverTimestamp, get, remove, update } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js';",
    "import { getDatabase, ref, push, onValue, onDisconnect, set, serverTimestamp, get, remove, update, runTransaction } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js';"
);

// 5. Expose Firebase to window
html = html.replace(
    "const db = getDatabase(app);",
    "const db = getDatabase(app);\n        window.yaireRadioFb = { db, ref, onValue, set, serverTimestamp, runTransaction };"
);

fs.writeFileSync('index.html', html);
console.log("Main modificado correctamente.");

const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const sfxVolReplacement = `
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

        onValue(ref(db, 'radio_state/globalVolume'), snap => {
            const vol = snap.val();
            if (vol !== null) {
                fbRadioAudio.volume = vol;
            }
        });

        ['airhorn', 'applause', 'djdrop'].forEach(sfxId => {
            onValue(ref(db, 'radio_state/sfx_' + sfxId), snap => {
                const ts = snap.val();
                if (ts && (!window['__last_sfx_' + sfxId] || ts > window['__last_sfx_' + sfxId])) {
                    // Only play if we are in radio mode and it's a recent trigger (within 10 seconds)
                    const isNew = !window['__last_sfx_' + sfxId]; // ignore initial load
                    window['__last_sfx_' + sfxId] = ts;
                    
                    if (!isNew && spotlightMode === 'radio' && isSpotPlaying && (Date.now() + serverTimeOffset - ts < 10000)) {
                        const urls = {
                            airhorn: 'https://www.myinstants.com/media/sounds/mlg-airhorn.mp3',
                            applause: 'https://www.myinstants.com/media/sounds/applause-1.mp3',
                            djdrop: 'https://www.myinstants.com/media/sounds/dj-airhorn-sound-effect.mp3'
                        };
                        const a = new Audio(urls[sfxId]);
                        a.volume = fbRadioAudio.volume;
                        a.play().catch(()=>{});
                    }
                }
            });
        });
`;

html = html.replace(/radioUnsubscribe = onValue\(ref\(db, 'radio_state\/current'\)[\s\S]*?\}\);\s*\}\s*if \(\!isSpotPlaying\) \{/, sfxVolReplacement + "\n    }\n\n    if (!isSpotPlaying) {");

fs.writeFileSync('index.html', html);
console.log('Main JS patched successfully.');

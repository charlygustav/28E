const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `
            if (state.isPlaying) {
                if (fbRadioAudio.src !== new URL(state.src, document.baseURI).href) {
                    fbRadioAudio.src = state.src;
                    fbRadioAudio.load();
                    
                    const now = Date.now() + serverTimeOffset;
                    let seekTime = (now - state.startTime) / 1000;
                    
                    if (seekTime < 5) {
                        const announcerText = \`Estás escuchando \${state.title} de \${state.artist}, en Yaire FM.\`;
                        const announcerAudio = new Audio(\`/api/tts?text=\${encodeURIComponent(announcerText)}\`);
                        
                        // We use the Audio object directly to check if API is available
                        setTimeout(() => {
                            announcerAudio.play().then(() => {
                                // Aplicar Ducking
                                const currentGlobal = fbRadioAudio.volume;
                                fbRadioAudio.volume = currentGlobal * 0.2;
                                
                                announcerAudio.onended = () => {
                                    fbRadioAudio.volume = currentGlobal;
                                };
                            }).catch(e => {
                                // Si falla (e.g. no API key o autoplay bloqueado) no hacemos ducking
                                console.warn("TTS Announcer skipped:", e);
                            });
                        }, 500); // Wait half a second before speaking
                    }
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
`;

html = html.replace(/if \(state\.isPlaying\) \{[\s\S]*?fbRadioAudio\.pause\(\);\s*\}/, replacement + "                fbRadioAudio.pause();\n            }");

fs.writeFileSync('index.html', html);
console.log('Main JS patched with TTS successfully.');

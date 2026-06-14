const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target1 = `let radioUnsubscribe = null;`;
const replacement1 = `let currentRadioState = null;
let radioUnsubscribe = null;`;
html = html.replace(target1, replacement1);

const target2 = `        radioUnsubscribe = onValue(ref(db, 'radio_state/current'), snap => {
            const state = snap.val();`;
const replacement2 = `        radioUnsubscribe = onValue(ref(db, 'radio_state/current'), snap => {
            const state = snap.val();
            currentRadioState = state;`;
html = html.replace(target2, replacement2);

const target3 = `    if (!isSpotPlaying) {
        isSpotPlaying = true;
        spotlightUpdateUI();
        if (fbRadioAudio.src) {
            fbRadioAudio.play().catch(e => console.error("Radio play error:", e));
        }
    }`;
const replacement3 = `    if (!isSpotPlaying) {
        isSpotPlaying = true;
        spotlightUpdateUI();
        if (fbRadioAudio.src) {
            // Resync current time when locally resumed
            if (currentRadioState && currentRadioState.isPlaying && currentRadioState.startTime) {
                const now = Date.now() + serverTimeOffset;
                let seekTime = (now - currentRadioState.startTime) / 1000;
                if (seekTime < 0) seekTime = 0;
                fbRadioAudio.currentTime = seekTime;
            }
            fbRadioAudio.play().catch(e => console.error("Radio play error:", e));
        }
    }`;
html = html.replace(target3, replacement3);

fs.writeFileSync('index.html', html);
console.log('Main JS patched with Sync Fix successfully.');

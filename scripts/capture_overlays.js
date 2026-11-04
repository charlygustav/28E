const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function putJson(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'PUT'
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function sendCommand(ws, method, params = {}) {
  return new Promise((resolve) => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  let target;
  try {
    target = await putJson('http://127.0.0.1:9222/json/new?http://127.0.0.1:5500/assets/logos/bumper_cards.html');
  } catch (e) {}

  let chrome = null;
  if (!target || !target.webSocketDebuggerUrl) {
    chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--window-size=1920,1080',
      '--default-background-color=00000000',
      'http://127.0.0.1:5500/assets/logos/bumper_cards.html'
    ]);
    await new Promise(r => setTimeout(r, 2200));
    target = await putJson('http://127.0.0.1:9222/json/new?http://127.0.0.1:5500/assets/logos/bumper_cards.html');
  }

  if (!target || !target.webSocketDebuggerUrl) {
    console.error('Failed to acquire debug target');
    if (chrome) chrome.kill();
    return;
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  await sendCommand(ws, 'Page.enable');
  await sendCommand(ws, 'Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await sendCommand(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });

  for (let ch = 1; ch <= 3; ch++) {
    console.log(`Navigating and capturing transparent overlay for Channel ${ch}...`);
    await sendCommand(ws, 'Page.navigate', { url: `http://127.0.0.1:5500/assets/logos/bumper_cards.html?ch=${ch}` });
    await new Promise(r => setTimeout(r, 1200));

    const snap = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png', fromSurface: true });
    if (snap && snap.data) {
      const buf = Buffer.from(snap.data, 'base64');
      const outPath = path.join(__dirname, '..', 'assets', 'logos', `bumper_overlay_ch${ch}.png`);
      fs.writeFileSync(outPath, buf);
      console.log(`Saved: ${outPath} (${buf.length} bytes)`);
    }
  }

  ws.close();
  chrome.kill();
  console.log('Finished capturing all bumper overlays!');
}

run().catch(err => {
  console.error('Fatal error:', err);
});

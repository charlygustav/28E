const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
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
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--window-size=1280,720',
    'http://127.0.0.1:5500/tv.html?ch=1'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const tabs = await getJson('http://127.0.0.1:9222/json');
  const target = tabs.find(t => t.url && t.url.includes('tv.html'));
  if (!target) {
    console.error('Target tab not found');
    chrome.kill();
    return;
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  ws.addEventListener('message', (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', ...msg.params.args.map(a => a.value || a.description));
    } else if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception);
    }
  });

  await sendCommand(ws, 'Runtime.enable');
  await sendCommand(ws, 'Page.enable');

  async function snap(name, delayMs = 1200) {
    await new Promise(r => setTimeout(r, delayMs));
    const res = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
    if (res && res.data) {
      const buf = Buffer.from(res.data, 'base64');
      const outPath = path.join(__dirname, '..', 'assets', 'logos', name);
      fs.writeFileSync(outPath, buf);
      console.log('Saved:', outPath, '(' + buf.length + ' bytes)');
    }
  }

  async function evalJs(expr) {
    const res = await sendCommand(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true });
    if (res && res.exceptionDetails) {
      console.error('Eval error on:', expr, res.exceptionDetails);
    }
    return res ? res.result : null;
  }

  // Esperar a que pase la animación inicial de carga
  console.log('Waiting for initial load animation to settle...');
  await new Promise(r => setTimeout(r, 4000));
  await evalJs("if (window.gsap) gsap.killTweensOf('*'); document.getElementById('broadcast-gfx-stage').style.display = 'none';");

  // 1. Station ID Canal 1 (28E Uno)
  console.log('Testing Station ID Ch 1...');
  await evalJs("playBumper('station_id', 1);");
  await snap('tv_gfx_station_id_ch1.png', 1100);
  await new Promise(r => setTimeout(r, 2600));

  // 2. Station ID Canal 2 (28E Flow)
  console.log('Testing Station ID Ch 2...');
  await evalJs("playBumper('station_id', 2);");
  await snap('tv_gfx_station_id_ch2.png', 1100);
  await new Promise(r => setTimeout(r, 2600));

  // 3. Station ID Canal 3 (DCLF TV)
  console.log('Testing Station ID Ch 3...');
  await evalJs("playBumper('station_id', 3);");
  await snap('tv_gfx_station_id_ch3.png', 1100);
  await new Promise(r => setTimeout(r, 2600));

  // 4. Cortinilla Ya Volvemos Ch 1
  console.log('Testing Ya Volvemos...');
  await evalJs("playBumper('break_in', 1);");
  await snap('tv_gfx_break_in.png', 1000);
  await new Promise(r => setTimeout(r, 2200));

  // 5. Teaser Ya Viene (Up Next)
  console.log('Testing Up Next Teaser...');
  await evalJs("document.getElementById('broadcast-gfx-stage').style.display = 'none';");
  await evalJs("showUpNextTeaser({ title: 'Blade Runner 2049 (Edición 4K)', desc: 'Cine de Culto · 28E Uno' }, 1);");
  await snap('tv_gfx_upnext_teaser.png', 900);
  await new Promise(r => setTimeout(r, 1000));

  // 6. Studio GFX Preview Dock
  console.log('Testing Studio GFX Dock...');
  await evalJs("document.getElementById('broadcast-gfx-stage').style.display = 'none'; document.getElementById('gfx-upnext-bug').style.display = 'none'; toggleStudioDock(true);");
  await snap('tv_gfx_studio_dock.png', 700);

  ws.close();
  chrome.kill();
  console.log('All tests completed successfully!');
}

run().catch(err => {
  console.error('Fatal error:', err);
});

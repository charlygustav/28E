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
  const logos = [
    { svg: 'logo_28e_uno.svg', out: 'logo_28e_uno_transparent.png', w: 236 * 4, h: 80 * 4 },
    { svg: 'logo_28e_flow.svg', out: 'logo_28e_flow_transparent.png', w: 244 * 4, h: 80 * 4 },
    { svg: 'logo_dclf_tv.svg', out: 'logo_dclf_tv_transparent.png', w: 356 * 4, h: 80 * 4 }
  ];

  // Iniciar servidor local express/http rápido
  const server = http.createServer((req, res) => {
    const svgName = req.url.replace('/', '');
    const svgPath = path.join(__dirname, '..', 'assets', 'logos', svgName);
    if (fs.existsSync(svgPath)) {
      const content = fs.readFileSync(svgPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;display:flex;align-items:center;justify-content:center;height:100vh;">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${content}</div>
      </body></html>`);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise(r => server.listen(9876, r));

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9223',
    '--default-background-color=00000000',
    'http://127.0.0.1:9876/logo_28e_uno.svg'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const tabs = await getJson('http://127.0.0.1:9223/json');
  const target = tabs.find(t => t.url && t.url.includes('9876'));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  await sendCommand(ws, 'Page.enable');
  await sendCommand(ws, 'Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });

  for (const item of logos) {
    console.log('Rendering high-res transparent PNG for:', item.svg);
    await sendCommand(ws, 'Emulation.setDeviceMetricsOverride', {
      width: item.w,
      height: item.h,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sendCommand(ws, 'Page.navigate', { url: `http://127.0.0.1:9876/${item.svg}` });
    await new Promise(r => setTimeout(r, 800));

    const snap = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png', fromSurface: true });
    if (snap && snap.data) {
      const buf = Buffer.from(snap.data, 'base64');
      const outPath = path.join(__dirname, '..', 'assets', 'logos', item.out);
      fs.writeFileSync(outPath, buf);
      console.log('Saved transparent logo:', outPath, '(' + buf.length + ' bytes)');
    }
  }

  ws.close();
  chrome.kill();
  server.close();
  console.log('All transparent logo PNGs exported successfully!');
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

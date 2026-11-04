const { app, BrowserWindow } = require('electron');
const path = require('path');
const cp = require('child_process');
const fs = require('fs');

app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

app.whenReady().then(async () => {
  try {
    const win = new BrowserWindow({
      width: 1920,
      height: 1080,
      useContentSize: true,
      frame: false,
      show: false,
      webPreferences: {
        offscreen: true,
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    win.setContentSize(1920, 1080);
    const htmlFile = path.resolve(__dirname, '..', 'yaire_bedroom_night.html');
    const fileUri = 'file:///' + htmlFile.replace(/\\/g, '/');
    console.log('Loading:', fileUri);
    await win.loadURL(fileUri);

    // Esperar a que WebGL esté listo
    await new Promise(r => setTimeout(r, 2000));

    const fps = 30;
    const durationSeconds = 30; // 30 segundos de bucle fluido
    const totalFrames = Math.round(durationSeconds * fps); // 900 frames
    const outMp4 = path.resolve(__dirname, '..', '16-9_1080p.mp4');

    console.log(`Renderizando fondo Yaire: 1920x1080 @ ${fps}fps (${durationSeconds}s, ${totalFrames} frames) -> ${outMp4}`);

    const ffmpegArgs = [
      '-y',
      '-f', 'rawvideo',
      '-pix_fmt', 'bgra',
      '-s', '1920x1080',
      '-r', String(fps),
      '-i', 'pipe:0',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outMp4
    ];

    const ffmpeg = cp.spawn('ffmpeg', ffmpegArgs, {
      stdio: ['pipe', 'inherit', 'inherit']
    });

    const startTime = Date.now();

    for (let frame = 0; frame < totalFrames; frame++) {
      // Avanzar la simulación 1/30s
      await win.webContents.executeJavaScript('window.__yaire.advance(1/30)');

      const img = await win.webContents.capturePage({ x: 0, y: 0, width: 1920, height: 1080 });
      const raw = img.toBitmap();

      if (!ffmpeg.stdin.write(raw)) {
        await new Promise(r => ffmpeg.stdin.once('drain', r));
      }

      if (frame % 30 === 0 || frame === totalFrames - 1) {
        const pct = ((frame / (totalFrames - 1)) * 100).toFixed(0);
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Progreso: ${pct}% (cuadro ${frame}/${totalFrames}, transcurrido ${elapsedSec}s)`);
      }
    }

    ffmpeg.stdin.end();

    await new Promise((resolve, reject) => {
      ffmpeg.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error('FFmpeg salió con código ' + code));
      });
      ffmpeg.on('error', reject);
    });

    console.log('¡Renderizado completado con éxito!');
    app.quit();
  } catch (err) {
    console.error('Error durante el renderizado:', err);
    app.exit(1);
  }
});

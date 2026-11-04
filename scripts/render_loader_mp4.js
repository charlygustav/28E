const { app, BrowserWindow } = require('electron');
const path = require('path');
const cp = require('child_process');
const fs = require('fs');

app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.commandLine.appendSwitch('high-dpi-support', '1');

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
    const htmlFile = path.resolve(__dirname, '..', 'loader.html');
    const fileUri = 'file:///' + htmlFile.replace(/\\/g, '/');
    console.log('Loading:', fileUri);
    await win.loadURL(fileUri);

    // Give time for Tailwind CDN and fonts to finish rendering
    await new Promise(r => setTimeout(r, 1500));
    await win.webContents.executeJavaScript('document.fonts.ready.then(() => true)');

    // Inject controller
    await win.webContents.executeJavaScript(`
      window.__setupDeterministic = () => {
        // Clear original intervals
        for (let i = 1; i < 10000; i++) clearInterval(i);

        const pb = document.getElementById('loader-progress');
        if (pb) pb.style.transition = 'none';

        document.getAnimations().forEach(a => a.pause());
      };

      window.__seek = (elapsed) => {
        const percentText = document.getElementById('loader-percent');
        const progressBar = document.getElementById('loader-progress');
        const loaderContainer = document.getElementById('loader-container');

        // Progress reached 100% at 10400ms
        const progress = Math.min(100, Math.floor((elapsed / 10400) * 100));

        if (percentText) percentText.innerText = progress + '%';
        if (progressBar) progressBar.style.width = progress + '%';

        if (elapsed >= 11000) {
          document.body.classList.add('all-black');
          if (loaderContainer) loaderContainer.style.display = 'none';
        } else {
          document.body.classList.remove('all-black');
          if (loaderContainer) loaderContainer.style.display = 'flex';
        }

        // Direct animation targets
        const tulip = document.getElementById('loader-tulip');
        if (tulip) {
          const anims = tulip.getAnimations();
          if (anims[0]) {
            anims[0].pause();
            anims[0].currentTime = elapsed % 2500;
          }
        }

        const ping = document.querySelector('.animate-ping');
        if (ping) {
          const anims = ping.getAnimations();
          if (anims[0]) {
            anims[0].pause();
            anims[0].currentTime = elapsed % 1000;
          }
        }
      };

      window.__setupDeterministic();
    `);

    const fps = 60;
    const durationSeconds = 11.5;
    const totalFrames = Math.round(durationSeconds * fps); // 690 frames
    const outMp4 = path.resolve(__dirname, '..', 'loader.mp4');

    console.log(`Starting render: 1920x1080 @ ${fps}fps, ${totalFrames} frames (${durationSeconds}s) -> ${outMp4}`);

    const ffmpegArgs = [
      '-y',
      '-f', 'rawvideo',
      '-pix_fmt', 'bgra',
      '-s', '1920x1080',
      '-r', String(fps),
      '-i', 'pipe:0',
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '14',
      '-pix_fmt', 'yuv420p',
      '-colorspace', 'bt709',
      '-color_primaries', 'bt709',
      '-color_trc', 'bt709',
      '-movflags', '+faststart',
      outMp4
    ];

    const ffmpeg = cp.spawn('ffmpeg', ffmpegArgs, {
      stdio: ['pipe', 'inherit', 'inherit']
    });

    const startTime = Date.now();

    for (let frame = 0; frame < totalFrames; frame++) {
      const elapsed = Math.round((frame / fps) * 1000);
      await win.webContents.executeJavaScript(`window.__seek(${elapsed})`);
      
      const img = await win.webContents.capturePage({ x: 0, y: 0, width: 1920, height: 1080 });
      const raw = img.toBitmap();

      if (!ffmpeg.stdin.write(raw)) {
        await new Promise(r => ffmpeg.stdin.once('drain', r));
      }

      if (frame % 60 === 0 || frame === totalFrames - 1) {
        const pct = ((frame / (totalFrames - 1)) * 100).toFixed(0);
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Progress: ${pct}% (frame ${frame}/${totalFrames}, elapsed ${elapsedSec}s)`);
      }
    }

    ffmpeg.stdin.end();

    await new Promise((resolve, reject) => {
      ffmpeg.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error('FFmpeg exited with code ' + code));
      });
      ffmpeg.on('error', reject);
    });

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`SUCCESS! Render finished in ${totalTime}s.`);
    const stats = fs.statSync(outMp4);
    console.log(`Output: ${outMp4} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

  } catch (err) {
    console.error('Render error:', err);
    process.exit(1);
  } finally {
    app.quit();
  }
});

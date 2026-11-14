'use strict';
// Local web + voice server. Uses real Google/Firebase identity verification.
const path = require('node:path');
const { createRequire } = require('node:module');
const express = createRequire(require.resolve('../signaling-server/package.json'))('express');
const { createVoiceServer } = require('../signaling-server/server');
const { createAuth } = require('../signaling-server/auth');

function createDevServer({ auth = createAuth(), port = 5500 } = {}) {
  const origin = `http://localhost:${port}`;
  const { app, server, io } = createVoiceServer({ auth,
    env: { ...process.env, ALLOWED_ORIGINS: `${origin},http://127.0.0.1:${port}` } });
  app.get('/api/voice-ice', require('../api/voice-ice'));
  app.post('/api/music-search', require('../api/music-search'));
  const root = path.resolve(__dirname, '..');
  app.use('/admin/assets', express.static(path.join(root, 'admin/assets'), { dotfiles: 'deny', index: false }));
  app.use((req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  // Expose public resources only; never serve the repository, credentials or server source.
  for (const folder of ['assets', 'fonts', 'sounds', 'radio', 'images', 'icons', 'gallery', 'lasfotos', 'videos']) {
    app.use('/' + folder, express.static(path.join(root, folder), { dotfiles: 'deny', index: false }));
  }
  const pages = ['index.html', 'dclf.html', 'tv.html', 'wrapped.html', 'maintenance.html',
    'mantenimiento.html', 'radio-stream.html', 'privacy.html'];
  for (const file of [...pages, 'styles.css', 'gsap.min.js', 'manifest.json', 'sw.js',
    'favicon.ico', 'favicon.png', 'tulip.ico', 'dclf_game.ico', 'icon.png', 'config.json']) {
    app.get('/' + file, (req, res) => res.sendFile(path.join(root, file)));
  }
  app.get('/', (req, res) => res.sendFile(path.join(root, 'index.html')));
  app.get(['/admin', '/admin/', '/admin/index.html'], (req, res) => res.sendFile(path.join(root, 'admin/index.html')));
  app.get('/admin/favicon_admin.png', (req, res) => res.sendFile(path.join(root, 'admin/favicon_admin.png')));
  return { app, server, io };
}

if (require.main === module) {
  const port = Number(process.env.PORT || 5500);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Puerto no válido.');
  const { server } = createDevServer({ port });
  server.listen(port, '127.0.0.1', () => {
    console.log(`Prueba local con Google: http://localhost:${port}/?dev=1`);
    console.log(`Panel local: http://localhost:${port}/admin/`);
    console.log('No publica cambios ni despliega reglas. Firebase Auth usa el proyecto existente.');
  });
}
module.exports = { createDevServer };

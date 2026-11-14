const { createAuth } = require('../signaling-server/auth');
function createMusicSearchHandler({ auth = createAuth(), search = query => require('yt-search')(query) } = {}) {
  const recent = new Map();
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Usa POST.' });
    let identity;
    try { identity = await auth.authenticate(/^Bearer (\S+)$/i.exec(req.headers.authorization || '')?.[1], { googleOnly: true }); }
    catch { return res.status(401).json({ error: 'Inicia sesión con Google.' }); }
    const query = req.body?.query;
    if (typeof query !== 'string' || !query.trim() || query.length > 300) return res.status(400).json({ error: 'Búsqueda no válida.' });
    const now = Date.now();
    for (const [uid, value] of recent) if (now - value.start >= 60000) recent.delete(uid);
    const usage = recent.get(identity.uid) || { start: now, count: 0 };
    if (usage.count >= 5 || recent.size >= 1000) return res.status(429).json({ error: 'Espera un minuto antes de buscar más canciones.' });
    usage.count++; recent.set(identity.uid, usage);
    let timer;
    try {
      const result = await Promise.race([search(query.trim() + ' audio'), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Timeout')), 10000); })]);
      const video = result?.videos?.find(video => /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(video.url));
      if (!video) return res.status(404).json({ error: 'No se encontró una versión en YouTube. Prueba con su enlace directo.' });
      return res.status(200).json({ url: video.url, title: String(video.title || query).slice(0, 300), type: 'youtube' });
    } catch { return res.status(502).json({ error: 'No se pudo buscar la canción. Prueba con un enlace directo de YouTube.' }); }
    finally { clearTimeout(timer); }
  };
}
module.exports = createMusicSearchHandler();
module.exports.createMusicSearchHandler = createMusicSearchHandler;

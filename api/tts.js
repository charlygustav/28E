const { createAuth } = require('../signaling-server/auth');

function createTtsHandler({ auth = createAuth(), fetchAudio = fetch, env = process.env } = {}) {
  const usage = new Map();
  let globalWindow = { start: Date.now(), count: 0 };
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Usa POST.' });
    }
    let user;
    try {
      const token = /^Bearer (\S+)$/i.exec(req.headers.authorization || '')?.[1];
      user = await auth.authenticate(token, { googleOnly: true });
    } catch { return res.status(401).json({ error: 'Inicia sesión con Google.' }); }
    const text = req.body?.text;
    if (typeof text !== 'string' || !text.trim() || text.length > 1000) {
      return res.status(400).json({ error: 'El texto debe tener entre 1 y 1000 caracteres.' });
    }
    if (!env.ELEVENLABS_API_KEY) {
      return res.status(503).json({ error: 'El servicio de voz no está configurado.' });
    }
    const now = Date.now();
    for (const [uid, value] of usage) if (now - value.start >= 60000) usage.delete(uid);
    if (now - globalWindow.start >= 60000) globalWindow = { start: now, count: 0 };
    const current = usage.get(user.uid) || { start: now, count: 0 };
    if (current.count >= 3 || globalWindow.count >= 30) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Espera un minuto antes de generar más audio.' });
    }
    current.count++; globalWindow.count++; usage.set(user.uid, current);
    try {
      const response = await fetchAudio('https://api.elevenlabs.io/v1/text-to-speech/IKne3meq5aSn9XLyUdCD/stream', {
        method: 'POST', signal: AbortSignal.timeout(20000),
        headers: { Accept: 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': env.ELEVENLABS_API_KEY },
        body: JSON.stringify({ text: text.trim(), model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
      });
      if (!response.ok) return res.status(502).json({ error: 'No se pudo generar el audio.' });
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.status(200).send(Buffer.from(buffer));
    } catch { return res.status(502).json({ error: 'El servicio de voz no está disponible.' }); }
  };
}

module.exports = createTtsHandler();
module.exports.createTtsHandler = createTtsHandler;

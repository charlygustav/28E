const { createHmac } = require('node:crypto');
const { createAuth } = require('../signaling-server/auth');
function createIceHandler({ auth = createAuth(), env = process.env, now = Date.now } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET') return res.status(405).json({ error: 'Usa GET.' });
    let identity;
    try { identity = await auth.authenticate(/^Bearer (\S+)$/i.exec(req.headers.authorization || '')?.[1], { googleOnly: true }); }
    catch { return res.status(401).json({ error: 'Inicia sesión con Google.' }); }
    const urls = (env.TURN_URLS || '').split(',').map(url => url.trim()).filter(Boolean);
    if (!env.TURN_SHARED_SECRET || !urls.length || urls.some(url => !/^turns?:[a-zA-Z0-9.\-:\[\]]+(\?transport=(udp|tcp))?$/.test(url))) {
      return res.status(503).json({ error: 'El servicio de retransmisión todavía no está configurado.' });
    }
    const expiresAt = Math.floor(now() / 1000) + 3600;
    const username = `${expiresAt}:${identity.uid}`;
    const credential = createHmac('sha1', env.TURN_SHARED_SECRET).update(username).digest('base64');
    return res.status(200).json({ expiresAt, iceServers: [{ urls, username, credential }] });
  };
}
module.exports = createIceHandler();
module.exports.createIceHandler = createIceHandler;

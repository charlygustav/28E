'use strict';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'yaire-591ca';

async function verifyFirebaseToken(token) {
  const { initializeApp, getApps } = require('firebase-admin/app');
  const { getAuth } = require('firebase-admin/auth');
  const app = getApps().find(app => app.name === '28e-auth') ||
    initializeApp({ projectId: PROJECT_ID }, '28e-auth');
  // Signature, issuer, audience and expiry are verified with Google's public keys.
  // No service-account secret is needed for this verification.
  return getAuth(app).verifyIdToken(token);
}

function createAuth({ verifyToken = verifyFirebaseToken, env = process.env } = {}) {
  const list = value => new Set((value || '').split(',').map(x => x.trim()).filter(Boolean));
  const allowedUids = list(env.VOICE_ALLOWED_UIDS);
  const adminUids = list(env.ADMIN_UIDS);
  const adminEmails = list((env.ADMIN_EMAILS || 'theginnomar.x@gmail.com').toLowerCase());

  async function authenticate(token, { googleOnly = false } = {}) {
    if (typeof token !== 'string' || !token || token.length > 8192) throw new Error('Sesión requerida.');
    const claims = await verifyToken(token);
    if (!claims.uid || !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now()) {
      throw new Error('Sesión caducada.');
    }
    if (googleOnly && claims.firebase?.sign_in_provider !== 'google.com') {
      throw new Error('Inicia sesión con Google.');
    }
    if (googleOnly && allowedUids.size && !allowedUids.has(claims.uid)) {
      throw new Error('Cuenta no autorizada.');
    }
    return claims;
  }

  function isAdmin(claims) {
    return adminUids.has(claims.uid) || (claims.email_verified === true &&
      typeof claims.email === 'string' && adminEmails.has(claims.email.toLowerCase()));
  }

  function requireSession({ admin = false, googleOnly = false } = {}) {
    return async (req, res, next) => {
      res.setHeader('Cache-Control', 'no-store');
      try {
        const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
        req.user = await authenticate(match?.[1], { googleOnly });
      } catch {
        return res.status(401).json({ error: 'Inicia sesión de nuevo.' });
      }
      if (admin && !isAdmin(req.user)) return res.status(403).json({ error: 'No autorizado.' });
      return next();
    };
  }

  return { authenticate, isAdmin, requireSession };
}

module.exports = { createAuth };

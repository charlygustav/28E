(function (root) {
  'use strict';
  function text(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }
  function image(value) {
    if (typeof value !== 'string') return '';
    // Mii portraits may be local PNG/WebP data URLs. SVG is deliberately excluded.
    if (/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(value) && value.length < 100000) return value;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? text(url.href) : '';
    } catch { return ''; }
  }
  const helpers = { text, image };
  if (typeof module !== 'undefined' && module.exports) module.exports = helpers;
  else root.yaireSafeHtml = helpers;
})(typeof window !== 'undefined' ? window : globalThis);

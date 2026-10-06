// Vercel Node function. This endpoint stores consent; it never sends email.
const { createHmac, randomBytes, timingSafeEqual } = require('node:crypto');
const config = require('../data/newsletter.json');
const WINDOW = 15 * 60 * 1000;
const SUCCESS = 'Request received. New subscribers join the selected topics. If you have subscribed before, your existing preferences stay unchanged; use a newsletter’s preferences link or contact Saurav to update them.';

function createHandler({ env = process.env, fetcher = fetch, now = Date.now } = {}) {
  // Best-effort, bounded warm-instance limiter; production also needs an edge rule.
  const attempts = new Map();
  const key = () => env.RESEND_API_KEY;
  const enabled = () => Boolean(key() && env.NEWSLETTER_SIGNUP_ENABLED === 'true');
  const sign = value => createHmac('sha256', key()).update(value).digest('base64url');
  function issueToken() {
    const payload = `${now()}.${randomBytes(16).toString('hex')}`;
    return `${payload}.${sign(payload)}`;
  }
  function validToken(token) {
    if (typeof token !== 'string' || token.length > 150) return false;
    const [date, nonce, signature, extra] = token.split('.');
    if (extra || !/^\d{13}$/.test(date) || !/^[a-f0-9]{32}$/.test(nonce || '') || !/^[\w-]{43}$/.test(signature || '')) return false;
    const age = now() - Number(date);
    const expected = sign(`${date}.${nonce}`);
    return age >= 1500 && age <= 60 * 60 * 1000 && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }
  function allowedOrigin(origin) {
    const allowed = new Set(['https://sauravdas.me', 'https://www.sauravdas.me']);
    if (env.VERCEL_URL) allowed.add(`https://${env.VERCEL_URL}`);
    if (!env.VERCEL && env.NODE_ENV !== 'production') {
      allowed.add('http://localhost:8080');
      allowed.add('http://localhost:8081');
    }
    return allowed.has(origin);
  }
  function limited(req) {
    const ip = req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
    const id = sign(`signup-ip:${ip}`);
    for (const [entry, value] of attempts) if (value.until <= now()) attempts.delete(entry);
    if (!attempts.has(id)) {
      if (attempts.size >= 5000) return true;
      attempts.set(id, { count: 0, until: now() + WINDOW });
    }
    return ++attempts.get(id).count > 5;
  }
  async function resend(path, options = {}) {
    return fetcher(`https://api.resend.com${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
  }
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const reply = (status, body) => res.status(status).json(body);
    if (req.method === 'GET') {
      return reply(200, enabled() ? { enabled: true, token: issueToken() } : { enabled: false });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return reply(405, { error: 'Method not allowed.' });
    }
    if (!enabled()) return reply(503, { error: 'Email signup is not open yet. Please use an RSS feed below for now.' });
    if (!allowedOrigin(req.headers.origin)) return reply(403, { error: 'Please subscribe from sauravdas.me.' });
    if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') return reply(415, { error: 'Please submit the signup form.' });
    if (Number(req.headers['content-length'] || 0) > 4096) return reply(413, { error: 'Request too large.' });
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || Array.isArray(body) || JSON.stringify(body).length > 4096) throw new Error();
    } catch (_) { return reply(400, { error: 'Please check the form and try again.' }); }
    if (body.website) return reply(202, { message: SUCCESS });
    if (!validToken(body.token)) return reply(400, { error: 'Your form has expired or was submitted too quickly. Please try again.', refresh: true });
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s<>@]+@[^\s<>@.]+(?:\.[^\s<>@.]+)+$/.test(email)) return reply(400, { error: 'Please enter a valid email address.' });
    const topics = body.topics;
    if (!Array.isArray(topics) || !topics.length || topics.length > config.topics.length || new Set(topics).size !== topics.length || topics.some(topic => !config.topics.some(item => item.slug === topic))) return reply(400, { error: 'Choose at least one of the five topics.' });
    if (body.consent !== true) return reply(400, { error: 'Please agree to receive the selected email updates.' });
    if (limited(req)) {
      res.setHeader('Retry-After', '900');
      return reply(429, { error: 'Too many attempts. Please try again in 15 minutes.' });
    }
    try {
      // Public requests never modify an existing contact or reverse an unsubscribe.
      const existing = await resend(`/contacts/${encodeURIComponent(email)}`);
      if (existing.ok) return reply(202, { message: SUCCESS });
      if (existing.status !== 404) throw new Error('contact_lookup');
      const saved = await resend('/contacts', {
        method: 'POST',
        body: JSON.stringify({
          email,
          segments: [{ id: config.segmentId }],
          topics: config.topics.map(topic => ({ id: topic.id, subscription: topics.includes(topic.slug) ? 'opt_in' : 'opt_out' })),
          properties: { website_consent: JSON.stringify({ at: new Date(now()).toISOString(), version: config.consentVersion, topics, source: 'sauravdas.me/follow' }) }
        })
      });
      if (!saved.ok) throw new Error('contact_create');
      const result = await saved.json();
      if (!result.id) throw new Error('missing_contact');
      return reply(202, { message: SUCCESS });
    } catch (_) {
      // Never log email addresses, credentials, or Resend response bodies.
      return reply(503, { error: 'We could not save your subscription right now. Your form is still here—please try again shortly.' });
    }
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;

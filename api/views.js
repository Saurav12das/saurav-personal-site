import { Redis } from '@upstash/redis';

// Initializes from KV_REST_API_URL/KV_REST_API_TOKEN (Vercel KV)
// or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN (Upstash direct).
const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const raw = (req.query && req.query.slug ? req.query.slug : '').toString().trim().toLowerCase();
  if (!raw || !/^[a-z0-9_\-]{1,80}$/.test(raw)) {
    return res.status(400).json({ error: 'invalid slug' });
  }

  const key = `views:${raw}`;

  try {
    let count;
    if (req.method === 'POST') {
      count = await redis.incr(key);
    } else {
      count = (await redis.get(key)) || 0;
    }
    return res.status(200).json({ slug: raw, count: Number(count) });
  } catch (err) {
    return res.status(500).json({ error: 'kv error' });
  }
}

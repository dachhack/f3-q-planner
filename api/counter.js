import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    if (req.method === 'POST') {
      // Increment the counter
      const count = await kv.incr('beatdown_count');
      return new Response(JSON.stringify({ count }), { status: 200, headers });
    }

    // GET — return current count
    const count = (await kv.get('beatdown_count')) || 0;
    return new Response(JSON.stringify({ count }), { status: 200, headers });
  } catch (err) {
    // KV not configured — return 0 gracefully
    return new Response(JSON.stringify({ count: 0, error: 'KV not configured' }), { status: 200, headers });
  }
}

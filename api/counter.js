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

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return new Response(JSON.stringify({ count: 0 }), { status: 200, headers });
  }

  try {
    if (req.method === 'POST') {
      const res = await fetch(`${kvUrl}/incr/beatdown_count`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const data = await res.json();
      return new Response(JSON.stringify({ count: data.result || 0 }), { status: 200, headers });
    }

    const res = await fetch(`${kvUrl}/get/beatdown_count`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    const data = await res.json();
    return new Response(JSON.stringify({ count: parseInt(data.result) || 0 }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ count: 0 }), { status: 200, headers });
  }
}

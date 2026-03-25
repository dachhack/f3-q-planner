export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path');
  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Only allow known F3 API paths
  const allowed = ['map/location/regions', 'map/location/events-and-locations', 'map/location/members'];
  const basePath = path.split('?')[0];
  if (!allowed.includes(basePath)) {
    return new Response(JSON.stringify({ error: 'Path not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const apiUrl = `https://api.f3nation.com/${path}`;
    const res = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

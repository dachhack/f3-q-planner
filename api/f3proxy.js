export default async function handler(req, res) {
  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // Only allow known F3 API paths
  const allowed = ['map/location/regions', 'map/location/events-and-locations', 'map/location/members'];
  const basePath = path.split('?')[0];
  if (!allowed.includes(basePath)) {
    return res.status(403).json({ error: 'Path not allowed' });
  }

  try {
    const apiUrl = `https://api.f3nation.com/${path}`;
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', 'application/json');
    return res.status(response.status).send(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}

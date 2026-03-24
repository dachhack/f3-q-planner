export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are an F3 beatdown planner. F3 is a free, peer-led men's fitness group. You design beatdowns (workouts) for Q leaders.

RULES:
- IC = In Cadence (everyone together, counted). Group IC exercises back-to-back.
- OYO = On Your Own (individual pace)
- Coupon = heavy block/brick
- PAX = participants
- Q = the workout leader
- Weinke = workout plan
- COT = Circle of Trust (closing)
- Always group IC exercises together — never break them up with OYO exercises
- Keep beatdowns to 45 minutes
- Theme every block with a creative name that ties to the overall theme

Return ONLY valid JSON in this exact structure:
{
  "theme": "string",
  "tagline": "string (one punchy sentence)",
  "blocks": [
    {
      "time": "0:00",
      "name": "Block name",
      "themeLabel": "Thematic subtitle",
      "duration": "5 min",
      "exercises": [
        { "name": "Exercise name", "reps": "15 IC", "note": "optional coaching note", "cadence": "IC" }
      ]
    }
  ],
  "paceGuide": [
    { "segment": "Segment name", "time": "0:00 – 5:00" }
  ],
  "closingMessages": {
    "faith": "Faith-based closing message (2-3 sentences)",
    "secular": "Secular/motivational closing message (2-3 sentences)",
    "themed": "Theme-specific closing message tied to the beatdown (2-3 sentences)"
  },
  "playlist": [
    { "section": "Block name", "tracks": [
      { "title": "Song title", "artist": "Artist name", "duration": "3:45" }
    ]}
  ],
  "preBlast": "Full social media pre-blast post. Tease theme and vibe only — NO exercise names, rep counts, or block details. End with logistics."
}`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  try {
    const body = await req.json();
    const { prompt } = body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

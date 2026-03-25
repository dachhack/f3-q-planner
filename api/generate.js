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
- Theme every block with a creative name that ties to the overall theme
- WARMUP RULES: Keep everyone in the circle. No bear crawls, laps, moseys, Indian runs, or any exercise that moves PAX away from the starting position. Warmup should be stationary stretches and light calisthenics only (e.g. SSH, arm circles, Michael Phelps, weed pickers, imperial walkers, hillbillies, windmills, cherry pickers, etc.)
- FILL THE ENTIRE DURATION with exercises — no rest breaks, no water breaks, no programmed pauses. Every minute should be accounted for with work.
- COT happens AFTER the workout duration is over — do not include it in the timed blocks. It is separate.
- The LAST exercise block must include 2-3 bonus/alternate exercises marked with note "FLEX — drop or add to adjust for time". This gives the Q flexibility to run long or short.
- Pay close attention to the "Workout style" field. SIMPLE means fewer distinct exercises with more reps/rounds of each. HIGH VARIETY means lots of different exercises with minimal repeats. BALANCED is in between.

WORKOUT FORMATS (use when requested):
- 7s / 9s / 11s: Ladder format. Two exercises at opposite ends. Start Exercise A at 1 rep, Exercise B at 6/8/10. Each round, A goes up by 1, B goes down by 1. Run/mosey between stations. Total reps per exercise always equals 7, 9, or 11.
- Dora: Partner workout. One partner works on a cumulative rep count (e.g. 100 merkins, 200 squats, 300 LBCs) while the other runs. Switch when the runner returns. Keep going until all reps are done.
- Four Corners: Set up 4 stations/corners. Different exercise at each. PAX rotate through all 4. Can be timed or rep-based.
- Ring of Fire: PAX form a circle. One at a time does reps while everyone else holds a static position (e.g. plank, Al Gore). Goes around the full circle.
- Indian Run: PAX jog in a line. Last man sprints to the front. Continuous rotation. Can add exercises when reaching the front.
- Partner Work: Pair up. One works, one rests (or runs/does a hold). Trade off.
- Tabata: 20 seconds work, 10 seconds rest, 8 rounds. Can use one exercise or alternate two.
- AMRAP: As Many Rounds As Possible in a set time. List 3-5 exercises, PAX cycle through continuously.
- EMOM: Every Minute On the Minute. Prescribed reps at the top of each minute, rest the remainder.

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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  // GET = F3 API proxy
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const f3path = url.searchParams.get('f3');
    if (!f3path) {
      return new Response(JSON.stringify({ error: 'Missing f3 parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    // Debug mode: try multiple URL patterns to find the right one
    if (f3path === 'debug') {
      const patterns = [
        'https://api.f3nation.com/map/location/regions',
        'https://api.f3nation.com/api/trpc/map.location.regions',
        'https://api.f3nation.com/trpc/map.location.regions',
        'https://api.f3nation.com/map.location.regions',
        'https://api.f3nation.com/api/map/location/regions',
        'https://api.f3nation.com/',
      ];
      const results = [];
      for (const url of patterns) {
        try {
          const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
          const body = await r.text();
          results.push({ url, status: r.status, body: body.substring(0, 200) });
        } catch (e) {
          results.push({ url, error: e.message });
        }
      }
      return new Response(JSON.stringify(results, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    const allowed = ['map/location/regions', 'map/location/events-and-locations', 'map/location/members'];
    const basePath = f3path.split('?')[0];
    if (!allowed.includes(basePath)) {
      return new Response(JSON.stringify({ error: 'Path not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    try {
      const apiUrl = `https://api.f3nation.com/${f3path}`;
      const res = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Origin': 'https://map.f3nation.com',
          'Referer': 'https://map.f3nation.com/'
        }
      });
      const data = await res.text();
      // Debug: wrap with status info so we can see what the F3 API returns
      if (!res.ok) {
        return new Response(JSON.stringify({ error: `F3 API returned ${res.status}`, url: apiUrl, body: data.substring(0, 500) }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      return new Response(data, {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
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
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ type: 'error', error: errText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let lastProgressAt = 0;

    const stream = new ReadableStream({
      async start(controller) {
        const send = (obj) => {
          controller.enqueue(new TextEncoder().encode(JSON.stringify(obj) + '\n'));
        };

        try {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const event = JSON.parse(data);
                if (event.type === 'content_block_delta' && event.delta?.text) {
                  fullText += event.delta.text;
                  // Send progress heartbeat every 500 chars
                  if (fullText.length - lastProgressAt >= 500) {
                    send({ type: 'progress', chars: fullText.length });
                    lastProgressAt = fullText.length;
                  }
                }
              } catch (_) {
                // skip unparseable SSE lines
              }
            }
          }

          send({ type: 'done', text: fullText });
        } catch (err) {
          send({ type: 'error', error: err.message });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

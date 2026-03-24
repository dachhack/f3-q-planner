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
- FILL THE ENTIRE DURATION with exercises — no rest breaks, no water breaks, no programmed pauses. Every minute should be accounted for with work.
- COT happens AFTER the workout duration is over — do not include it in the timed blocks. It is separate.
- The LAST exercise block must include 2-3 bonus/alternate exercises marked with note "FLEX — drop or add to adjust for time". This gives the Q flexibility to run long or short.

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

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
- WARMUP RULES: Keep everyone in the circle. No bear crawls, laps, moseys, Indian runs, or any exercise that moves PAX away from the starting position. Warmup should be STATIONARY stretches and light calisthenics only. Use VARIETY — do NOT default to the same 4-5 warmup exercises every time. Draw from this list and mix it up:
  SSH, Imperial Walkers, Hillbillies, Windmills, Cherry Pickers, Weed Pickers, Michael Phelps, Arm Circles (forward + backward), Good Mornings, Cotton Pickers, Moroccan Night Clubs, Toy Soldiers, Abe Vigoda (slow windmill), Tie Fighters, Chinook, Tennessee Rocking Chair, Water Wheel, Don Quixotes, Seal Claps, Overhead Claps, Willie Mays Hayes, Hug-a-Trees, Tappy Taps, Grass Pickers, High Knees (in place), Gate Swings, Calf Stretches, Quad Stretches, Peter Parkers (in place), Slow Squats, Sun Gods, Bat Wings, Turn and Bounce, Frankensteins (in place)
  Pick 5-8 different warmup exercises per beatdown. Vary them across workouts.
- EQUIPMENT-SPECIFIC EXERCISES: When equipment is specified, USE exercises that require it:
  - Pull-Up Bar: pull-ups, chin-ups, hanging knee raises, Australian rows, muscle-ups, flexed arm hang
  - Stairs / Bleachers: stair runs, bleacher hops, step-ups, calf raises on steps, incline merkins on steps, decline merkins, stair crawls, dips on bench
  - Wall: balls to the wall, wall sit (People's Chair), wall merkins, handstand holds, derkins against wall, wall plank, wall sit + press
  - Coupons / Blocks: coupon curls, coupon press, coupon squats, coupon swings, coupon rows, overhead press, skull crushers, farmer carry, rifle carry, Zamperini
  Do NOT ignore the equipment — if they brought coupons, use them in multiple blocks. If there's a pull-up bar, include pull-up sets.
- MAN YOGA: When requested as warmup, weave yoga poses INTO the warmup block alongside regular warmup exercises (not a separate block). When requested as cooldown, add a yoga stretch block AFTER the last timed exercise block (after the workout duration is up, before COT). Cooldown yoga does NOT count toward the workout duration. Use poses like: Downward Dog, Warrior I/II, Pigeon, Forward Fold, Low Lunge, Child's Pose, Cat-Cow, Cobra, Chair Pose, Tree Pose. Hold 15-30 sec each. Keep it F3 — no incense.
- FILL THE ENTIRE DURATION with exercises — no rest breaks, no water breaks, no programmed pauses, no recovery blocks, no stretch breaks mid-workout. Every minute should be accounted for with work. If PAX need to regroup after running, call an exercise for the six (plank, Al Gore, SSH) until everyone is back. Allow realistic time for each exercise — don't cram too many into a block.
- NO RECOVERY BLOCKS. Never include a "recovery", "rest", or "active recovery" block. Just give exercises more time and keep PAX moving.
- TIMING IS CRITICAL: The block duration MUST realistically match the exercises in it. Use these estimates:
  - IC exercise: ~2 seconds per rep (20 IC ≈ 40 sec)
  - OYO exercise: ~3 seconds per rep (20 OYO ≈ 60 sec)
  - Burpees: ~6 seconds each (10 burpees ≈ 1 min)
  - Running/mosey: ~2 min per quarter mile
  - Burpee mile (10 burpees + run, repeat): ~25-30 min total
  - Dora 100-200-300: ~15-20 min
  - 11s ladder with running: ~12-15 min
  - Ring of Fire with 10+ PAX: ~8-10 min
  - Four Corners: ~2-3 min per corner
  Do NOT label a block "10 min" if the exercises inside it would take 25 min. Add up the time.
- COT happens AFTER the workout duration is over — do not include it in the timed blocks. It is separate.
- The LAST exercise block must include 2-3 bonus/alternate exercises marked with note "FLEX — drop or add to adjust for time". This gives the Q flexibility to run long or short.
- Pay close attention to the "Workout style" field. SIMPLE means fewer distinct exercises with more reps/rounds of each. HIGH VARIETY means lots of different exercises with minimal repeats. BALANCED is in between.

WORKOUT FORMATS (use when requested):
- 7s / 9s / 11s: Ladder format. Two exercises at opposite ends. Start Exercise A at 1 rep, Exercise B at 6/8/10. Each round, A goes up by 1, B goes down by 1. Run/mosey between stations. Total reps per exercise always equals 7, 9, or 11.
- Dora: Partner workout. One partner works on a cumulative rep count while the other runs. Switch when the runner returns. Keep going until all reps are done. IMPORTANT: Keep total Dora reps at 400-500 max for standard difficulty (e.g. 100-200-200, or 100-150-150). Scale down for easy (200-300 total), scale up for brutal (600-800). Do NOT default to 100-200-300 every time — vary the rep scheme.
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
  "preBlast": "Full social media pre-blast post. Tease theme and vibe only — NO exercise names, rep counts, or block details. If coupons/blocks are needed, clearly state to bring them and specify what kind (cinder blocks, kettlebells, sandbags, etc.). End with logistics (AO, time, date, Q name)."
}`;

// F3 Nation API config (oRPC protocol)
const F3_API_BASE = 'https://api.f3nation.com';
const F3_API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': '*/*',
  'Authorization': 'Bearer f3_map_service_account',
  'Client': 'orpc',
  'Origin': 'https://map.f3nation.com',
  'Referer': 'https://map.f3nation.com/'
};
const F3_ALLOWED_PATHS = [
  'v1/map/location/regions',
  'v1/map/location/regionsWithLocation',
  'v1/map/location/events-and-locations',
  'v1/map/location/eventsAndLocations',
  'v1/map/location/location-workout',
  'v1/map/location/locationWorkout',
  'v1/map/location/location-id-to-region-name-lookup',
  'v1/map/location/locationIdToRegionNameLookup'
];

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

  // GET = F3 API proxy (oRPC uses POST under the hood)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const f3path = url.searchParams.get('f3');
    if (!f3path) {
      return new Response(JSON.stringify({ error: 'Missing f3 parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    const basePath = f3path.split('?')[0];
    if (!F3_ALLOWED_PATHS.includes(basePath)) {
      return new Response(JSON.stringify({ error: 'Path not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    try {
      const apiUrl = `${F3_API_BASE}/${f3path}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: F3_API_HEADERS,
        body: '{}'
      });
      const data = await res.text();
      return new Response(data, {
        status: res.status,
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
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
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

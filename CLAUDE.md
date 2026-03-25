# F3 Q Planner — Claude Code Context

## What this is
A web app for F3 Q leaders to generate beatdown plans (workouts), Weinkes, playlists, and pre-blasts using AI. Built with React + Vite on the frontend, Vercel edge functions on the backend proxying the Anthropic API.

---

## F3 Terminology
- **Q** — the workout leader (like a coach/instructor)
- **PAX** — participants
- **Weinke** — the written workout plan / cheat sheet
- **Beatdown** — the workout itself
- **Coupon** — a heavy concrete block used as a weight
- **IC** — In Cadence (everyone does reps together, counted by the Q)
- **OYO** — On Your Own (individual pace)
- **COT** — Circle of Trust (the closing circle after the workout)
- **AO** — Area of Operation (the workout location)
- **Pre-Blast** — social post sent the night before to hype the workout
- **EH** — Encourage / invite someone to come

---

## Core Rules (never break these)

### Workout design
- Always group IC exercises back-to-back — never split them up with OYO exercises
- Beatdown duration is configurable (default 45 minutes)
- Every block gets a themed name tied to the overall beatdown theme
- Warmup always comes first, COT always comes last
- Warmup must be stationary — keep everyone in the circle. No bear crawls, laps, moseys, or movement away from the starting position. Stick to stretches and light calisthenics (SSH, arm circles, Michael Phelps, weed pickers, etc.)

### Pre-Blast
- **Never list exercises, rep counts, or block details in the pre-blast**
- Tease the theme and vibe only
- End with logistics (AO, time, Q name)

### Weinke output
- Must always include 3 closing message options in the COT section:
  1. Faith-based
  2. Secular / motivational
  3. Themed to the beatdown

### Playlist
- Every beatdown package includes a playlist matched to the workout duration
- Sequenced to match the workout arc (warmup → main blocks → finisher)
- Built for men in their 40s & 50s — classic rock, 90s hip-hop, hard-hitting anthems

---

## What the app generates
Given Q info + theme + equipment + terrain, Claude generates:
1. **Weinke** — themed blocks with exercises, IC/OYO labels, pace guide, COT closing messages
2. **Playlist** — 45-min playlist sequenced to the workout, by block
3. **Pre-Blast** — copy-paste social post (theme/vibe only, no exercises)

---

## Project Structure
```
f3-q-planner/
├── api/
│   └── generate.js      ← Vercel edge function — Anthropic API proxy with streaming
├── src/
│   ├── main.jsx         ← React entry point
│   └── App.jsx          ← Full app (styles, form, output, tabs)
├── index.html
├── vite.config.js       ← Proxies /api to localhost:3000 in dev
├── vercel.json          ← Routing config
├── package.json
└── CLAUDE.md            ← This file
```

---

## Architecture

### Frontend (src/App.jsx)
- React with inline CSS-in-JS styles (no Tailwind, no external CSS files)
- Fonts: Bebas Neue (headings), Barlow Condensed (labels), Barlow (body)
- Color palette:
  - `--black: #0A0C10` — page background
  - `--dark: #111418` — dark panels
  - `--panel: #161B22` — card backgrounds
  - `--gold: #C9A84C` — primary accent
  - `--red: #C0392B` — time/reps accent
  - `--steel: #4A7FA5` — secondary accent
- Two-column layout: sidebar (form) + main output area
- Three output tabs: Weinke, Playlist, Pre-Blast

### Backend (api/generate.js)
- Vercel Edge Runtime (`export const config = { runtime: 'edge' }`)
- Streams the Anthropic response back to the browser to avoid timeouts
- Sends newline-delimited JSON:
  - `{ type: 'progress', chars: N }` — heartbeat while generating
  - `{ type: 'done', text: '...' }` — complete JSON string when finished
  - `{ type: 'error', error: '...' }` — if something goes wrong
- API key lives in Vercel env var `ANTHROPIC_API_KEY` — never in the frontend

### Frontend streaming reader (in App.jsx generate function)
- Reads the stream line by line
- On `type: 'done'` — parses the JSON, strips any markdown fences, calls `setResult()`
- On `type: 'error'` — calls `setError()`

---

## JSON schema Claude returns
```json
{
  "theme": "string",
  "tagline": "string",
  "blocks": [
    {
      "time": "0:00",
      "name": "Block name",
      "themeLabel": "Thematic subtitle",
      "duration": "5 min",
      "exercises": [
        { "name": "Exercise", "reps": "15 IC", "note": "coaching note", "cadence": "IC" }
      ]
    }
  ],
  "paceGuide": [{ "segment": "name", "time": "0:00 – 5:00" }],
  "closingMessages": {
    "faith": "...",
    "secular": "...",
    "themed": "..."
  },
  "playlist": [
    { "section": "Block name", "tracks": [
      { "title": "Song", "artist": "Artist", "duration": "3:45" }
    ]}
  ],
  "preBlast": "string"
}
```

---

## Local dev
```bash
npm install
# Add ANTHROPIC_API_KEY to .env.local
npm run dev
```
Vite proxies `/api/*` → `localhost:3000` automatically via `vite.config.js`.

## Deploy
Push to `main` → Vercel auto-deploys. Env var `ANTHROPIC_API_KEY` set in Vercel project settings.

---

## Known issues / things to improve
- No rate limiting — any visitor can trigger API calls
- No download-as-Word-doc yet (was in original roadmap)
- Mobile layout needs polish on the output tabs
- No ability to save/share generated beatdowns

---

## Beatdown examples already built (saved as .docx in project history)
- **No More Mr. Nice Guy** — Block/coupon themed, 7s/9s/11s format
- **Holly-Wood Suffering** — Movie-themed blocks (Die Hard, Rocky, etc.)
- **The Weight** — Men's mental health theme, solo → partner → hill arc

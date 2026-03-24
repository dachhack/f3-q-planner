# 🪖 F3 Q Planner

AI-powered beatdown builder for F3 Q leaders. Enter your AO info, pick a theme and equipment, and get a full Weinke, playlist, pre-blast, and closing messages — instantly.

---

## What it generates

- **Weinke** — Full beatdown plan with themed blocks, IC/OYO labels, pace guide
- **3 Closing Messages** — Faith-based, secular, and themed to the workout
- **45-min Playlist** — Sequenced to the workout arc, built for men in their 40s & 50s
- **Pre-Blast** — Copy-paste social post (theme/vibe only, no exercises listed)

---

## Deploy to Vercel (recommended — free, 5 min)

Vercel hosts the React frontend AND the serverless API proxy that keeps your Anthropic key safe.

### 1. Get an Anthropic API key
Sign up at [console.anthropic.com](https://console.anthropic.com) and create an API key.

### 2. Push this repo to GitHub
```bash
git init
git add .
git commit -m "F3 Q Planner"
gh repo create f3-q-planner --public --push --source=.
```
(Install [GitHub CLI](https://cli.github.com) if you don't have it, or create the repo manually on github.com and push.)

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your `f3-q-planner` GitHub repo
3. Vercel auto-detects Vite — no build settings needed
4. Before deploying, add your environment variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from step 1
5. Click **Deploy**

Your app is live at `https://f3-q-planner.vercel.app` (or your custom domain).

### 4. Share the URL
Send it to any Q in your region. No install, no login — just open and build.

---

## Local development

```bash
npm install
```

Create a `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Run the dev server:
```bash
npm run dev
```

The Vite dev server proxies `/api` calls to the local serverless function automatically.

---

## Project structure

```
f3-q-planner/
├── api/
│   └── generate.js      ← Vercel serverless function (API proxy)
├── src/
│   ├── main.jsx         ← React entry point
│   └── App.jsx          ← Main app component
├── index.html
├── vite.config.js
├── vercel.json          ← Routing config
└── package.json
```

---

## Cost

- **Vercel hosting:** Free (Hobby tier)
- **Anthropic API:** ~$0.01–0.03 per beatdown generated (Claude Sonnet)
- If usage grows, add rate limiting or a login to control costs

---

## F3 — Fitness, Fellowship, Faith
Free. Open to all men. No man left behind.

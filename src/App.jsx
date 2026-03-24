import { useState, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:ital,wght@0,400;0,600;1,400&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black:   #0A0C10;
    --dark:    #111418;
    --panel:   #161B22;
    --border:  #2A3040;
    --gold:    #C9A84C;
    --gold2:   #E8C96A;
    --red:     #C0392B;
    --steel:   #4A7FA5;
    --text:    #E8EAF0;
    --muted:   #8892A4;
    --success: #2ECC71;
  }

  body { background: var(--black); color: var(--text); font-family: 'Barlow', sans-serif; }

  .app {
    min-height: 100vh;
    background: var(--black);
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(42,48,64,0.3) 39px, rgba(42,48,64,0.3) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(42,48,64,0.15) 39px, rgba(42,48,64,0.15) 40px);
  }

  /* ── HEADER ── */
  .header {
    border-bottom: 2px solid var(--gold);
    background: linear-gradient(180deg, #0D1117 0%, var(--black) 100%);
    padding: 28px 40px 24px;
    display: flex;
    align-items: flex-end;
    gap: 24px;
  }
  .header-badge {
    background: var(--gold);
    color: var(--black);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    letter-spacing: 3px;
    padding: 4px 10px;
    margin-bottom: 6px;
  }
  .header h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(36px, 5vw, 60px);
    letter-spacing: 4px;
    color: var(--text);
    line-height: 1;
  }
  .header h1 span { color: var(--gold); }
  .header-sub {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    letter-spacing: 2px;
    color: var(--muted);
    text-transform: uppercase;
    margin-top: 4px;
  }

  /* ── LAYOUT ── */
  .main { display: grid; grid-template-columns: 380px 1fr; min-height: calc(100vh - 100px); }

  /* ── SIDEBAR ── */
  .sidebar {
    background: var(--panel);
    border-right: 1px solid var(--border);
    padding: 32px 28px;
    overflow-y: auto;
  }
  .section-label {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 11px;
    letter-spacing: 4px;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .form-group { margin-bottom: 20px; }
  .form-label {
    display: block;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .form-input, .form-select, .form-textarea {
    width: 100%;
    background: var(--dark);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    padding: 10px 12px;
    outline: none;
    transition: border-color 0.2s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--gold);
  }
  .form-select { appearance: none; cursor: pointer; }
  .form-textarea { resize: vertical; min-height: 80px; }

  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    background: var(--dark);
    border: 1px solid var(--border);
    color: var(--muted);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    letter-spacing: 1px;
    padding: 6px 12px;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.15s;
    user-select: none;
  }
  .chip:hover { border-color: var(--gold); color: var(--gold); }
  .chip.active { background: var(--gold); border-color: var(--gold); color: var(--black); font-weight: 700; }

  .btn-generate {
    width: 100%;
    background: var(--gold);
    color: var(--black);
    border: none;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 4px;
    padding: 16px;
    cursor: pointer;
    margin-top: 8px;
    transition: background 0.2s, transform 0.1s;
    position: relative;
    overflow: hidden;
  }
  .btn-generate:hover { background: var(--gold2); }
  .btn-generate:active { transform: scale(0.98); }
  .btn-generate:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; transform: none; }

  .btn-download {
    background: transparent;
    border: 1px solid var(--steel);
    color: var(--steel);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    letter-spacing: 2px;
    padding: 10px 20px;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-download:hover { background: var(--steel); color: var(--black); }

  /* ── OUTPUT ── */
  .output {
    padding: 32px 40px;
    overflow-y: auto;
  }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 400px;
    gap: 16px;
    opacity: 0.4;
  }
  .empty-icon {
    font-size: 64px;
    line-height: 1;
  }
  .empty-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 6px;
    color: var(--muted);
  }
  .empty-sub {
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 1px;
    text-align: center;
    max-width: 300px;
  }

  /* ── LOADING ── */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 400px;
    gap: 20px;
  }
  .loading-bar-wrap {
    width: 300px;
    height: 3px;
    background: var(--border);
    overflow: hidden;
  }
  .loading-bar {
    height: 100%;
    width: 40%;
    background: var(--gold);
    animation: sweep 1.4s ease-in-out infinite;
  }
  @keyframes sweep {
    0% { transform: translateX(-200%); }
    100% { transform: translateX(400%); }
  }
  .loading-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    letter-spacing: 5px;
    color: var(--gold);
  }
  .loading-sub { font-size: 12px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; }

  /* ── WEINKE PREVIEW ── */
  .weinke-header {
    background: linear-gradient(135deg, #0D1117 0%, #161B22 100%);
    border: 1px solid var(--border);
    border-top: 3px solid var(--gold);
    padding: 24px 32px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .weinke-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 40px;
    letter-spacing: 4px;
    color: var(--gold);
    line-height: 1;
  }
  .weinke-meta {
    display: flex;
    gap: 24px;
    margin-top: 8px;
  }
  .weinke-meta-item { text-align: center; }
  .weinke-meta-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--muted);
    text-transform: uppercase;
  }
  .weinke-meta-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: 1px;
  }

  .output-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  /* ── BLOCKS ── */
  .blocks { display: flex; flex-direction: column; gap: 2px; }

  .block {
    border-left: 3px solid var(--border);
    background: var(--panel);
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .block:hover { border-left-color: var(--gold); }

  .block-header {
    display: grid;
    grid-template-columns: 100px 1fr auto;
    align-items: center;
    gap: 16px;
    padding: 12px 20px;
    background: rgba(255,255,255,0.02);
    border-bottom: 1px solid var(--border);
    cursor: pointer;
  }
  .block-time {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 2px;
    color: var(--red);
  }
  .block-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text);
  }
  .block-theme {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    letter-spacing: 1px;
    color: var(--gold);
    text-transform: uppercase;
  }

  .exercises { padding: 0; }
  .exercise-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    padding: 10px 20px;
    border-bottom: 1px solid rgba(42,48,64,0.5);
    align-items: center;
  }
  .exercise-row:last-child { border-bottom: none; }
  .exercise-row:nth-child(even) { background: rgba(255,255,255,0.015); }
  .exercise-name {
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }
  .exercise-note {
    font-size: 12px;
    color: var(--muted);
    margin-top: 2px;
    font-style: italic;
  }
  .exercise-reps {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    letter-spacing: 1px;
    color: var(--gold);
    white-space: nowrap;
    text-align: right;
  }
  .ic-badge {
    display: inline-block;
    background: rgba(74,127,165,0.2);
    border: 1px solid var(--steel);
    color: var(--steel);
    font-size: 10px;
    letter-spacing: 1px;
    padding: 1px 6px;
    margin-left: 6px;
    vertical-align: middle;
  }
  .oyo-badge {
    display: inline-block;
    background: rgba(192,57,43,0.15);
    border: 1px solid rgba(192,57,43,0.4);
    color: #E67E6A;
    font-size: 10px;
    letter-spacing: 1px;
    padding: 1px 6px;
    margin-left: 6px;
    vertical-align: middle;
  }

  /* ── COT ── */
  .cot-section { margin-top: 24px; }
  .cot-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
  .cot-card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-top: 2px solid var(--border);
    padding: 16px;
    transition: border-color 0.2s;
  }
  .cot-card:nth-child(1) { border-top-color: #6A0DAD; }
  .cot-card:nth-child(2) { border-top-color: var(--steel); }
  .cot-card:nth-child(3) { border-top-color: var(--red); }
  .cot-label {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    letter-spacing: 3px;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .cot-text {
    font-size: 13px;
    color: var(--text);
    line-height: 1.6;
    font-style: italic;
  }

  /* ── PLAYLIST ── */
  .playlist-section { margin-top: 24px; }
  .playlist-grid { display: flex; flex-direction: column; gap: 2px; margin-top: 12px; }
  .playlist-row {
    display: grid;
    grid-template-columns: 32px 1fr 180px 52px;
    gap: 12px;
    align-items: center;
    padding: 10px 16px;
    background: var(--panel);
    border-left: 3px solid transparent;
    transition: all 0.15s;
  }
  .playlist-row:hover { border-left-color: var(--gold); background: rgba(255,255,255,0.02); }
  .playlist-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    color: var(--muted);
    text-align: center;
  }
  .playlist-title { font-weight: 600; font-size: 14px; }
  .playlist-artist { font-size: 13px; color: var(--muted); }
  .playlist-duration {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    color: var(--red);
    text-align: right;
    letter-spacing: 1px;
  }
  .playlist-section-hdr {
    padding: 6px 16px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 12px;
    letter-spacing: 3px;
    color: var(--gold);
    background: rgba(201,168,76,0.06);
    border-left: 3px solid var(--gold);
    margin-top: 8px;
  }

  /* ── PRE-BLAST ── */
  .preblast-section { margin-top: 24px; }
  .preblast-box {
    background: var(--panel);
    border: 1px solid var(--border);
    border-left: 3px solid var(--gold);
    padding: 24px;
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    line-height: 1.8;
    color: var(--text);
    white-space: pre-wrap;
    margin-top: 12px;
    position: relative;
  }
  .copy-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: var(--dark);
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 11px;
    letter-spacing: 1px;
    padding: 4px 10px;
    cursor: pointer;
    font-family: 'Barlow Condensed', sans-serif;
    text-transform: uppercase;
    transition: all 0.2s;
  }
  .copy-btn:hover { border-color: var(--gold); color: var(--gold); }
  .copy-btn.copied { border-color: var(--success); color: var(--success); }

  /* ── TABS ── */
  .tabs { display: flex; gap: 2px; margin-bottom: 24px; border-bottom: 1px solid var(--border); }
  .tab {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 10px 20px;
    cursor: pointer;
    color: var(--muted);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: all 0.15s;
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
  }
  .tab:hover { color: var(--text); }
  .tab.active { color: var(--gold); border-bottom-color: var(--gold); }

  .pace-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .pace-table th {
    background: var(--steel);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 10px 16px;
    text-align: left;
    color: white;
  }
  .pace-table td {
    padding: 10px 16px;
    font-size: 14px;
    border-bottom: 1px solid var(--border);
  }
  .pace-table tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
  .pace-time { font-family: 'Barlow Condensed', sans-serif; color: var(--red); font-weight: 700; letter-spacing: 1px; }
`;

export default function F3QPlanner() {
  const [form, setForm] = useState({
    q: "", ao: "", location: "", date: "", time: "5:15 AM",
    theme: "", equipment: [], terrain: [], duration: "45"
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("weinke");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const equipment = ["Coupons / Blocks", "Bodyweight", "Resistance Bands", "Sandbags"];
  const terrains  = ["Hill", "Open Field", "Parking Lot", "Track", "Flat Only"];
  const themes    = ["Military / Tactical", "Mental Health", "Movies / Pop Culture", "Sports", "Brotherhood", "Surprise Me"];

  const toggleChip = (key, val) =>
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val]
    }));

  const buildPrompt = () => `
Design a themed F3 beatdown with these specs:
- Q: ${form.q || "Q"}
- AO: ${form.ao || "Unnamed AO"}${form.location ? ` at ${form.location}` : ""}
- Date: ${form.date || "TBD"}, Time: ${form.time}
- Duration: ${form.duration} minutes
- Theme direction: ${form.theme || "surprise me — pick something bold and memorable"}
- Equipment: ${form.equipment.length ? form.equipment.join(", ") : "bodyweight only"}
- Terrain: ${form.terrain.length ? form.terrain.join(", ") : "flat"}
- Extra notes: ${form.notes || "none"}

Playlist: Build for men in their 40s & 50s. Mix classic rock, 90s hip-hop, and hard-hitting anthems. Sequence to match the energy arc — warmup through finisher.`;

  const generate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() })
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === 'error') {
              setError(msg.error || "Something went wrong generating the beatdown.");
              setLoading(false);
              return;
            }
            if (msg.type === 'done') {
              const clean = msg.text.replace(/```json|```/g, "").trim();
              const parsed = JSON.parse(clean);
              setResult(parsed);
              setActiveTab("weinke");
            }
          } catch (_) {
            // skip unparseable lines
          }
        }
      }
    } catch (e) {
      setError("Something went wrong generating the beatdown. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyPreBlast = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.preBlast);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allTracks = result?.playlist?.flatMap(s => s.tracks.map(t => ({ ...t, section: s.section }))) || [];

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div>
            <div className="header-badge">F3 NATION</div>
            <h1>Q <span>PLANNER</span></h1>
            <div className="header-sub">Beatdown Builder · Weinke Generator · Pre-Blast Creator</div>
            <div style={{marginTop:6,fontSize:11,color:'#666',fontFamily:'Barlow, sans-serif',letterSpacing:'0.5px'}}>
              v{__APP_VERSION__} · build {__BUILD_TIME__.slice(0, 10)}
            </div>
          </div>
        </div>

        <div className="main">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="section-label">Q Info</div>
            <div className="form-group">
              <label className="form-label">Q Name</label>
              <input className="form-input" placeholder="Your F3 name" value={form.q} onChange={e => setForm(f => ({...f, q: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">AO Name</label>
              <input className="form-input" placeholder="e.g. Badapple" value={form.ao} onChange={e => setForm(f => ({...f, ao: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="e.g. Sweetapple Park" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input className="form-input" placeholder="5:15 AM" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input className="form-input" type="number" min="15" max="90" step="5" value={form.duration} onChange={e => setForm(f => ({...f, duration: e.target.value}))} />
            </div>

            <div className="section-label" style={{marginTop:8}}>Beatdown</div>
            <div className="form-group">
              <label className="form-label">Theme Direction</label>
              <div className="chips">
                {themes.map(t => (
                  <div key={t} className={`chip ${form.theme === t ? "active" : ""}`}
                    onClick={() => setForm(f => ({...f, theme: f.theme === t ? "" : t}))}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Equipment</label>
              <div className="chips">
                {equipment.map(e => (
                  <div key={e} className={`chip ${form.equipment.includes(e) ? "active" : ""}`}
                    onClick={() => toggleChip("equipment", e)}>{e}</div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Terrain</label>
              <div className="chips">
                {terrains.map(t => (
                  <div key={t} className={`chip ${form.terrain.includes(t) ? "active" : ""}`}
                    onClick={() => toggleChip("terrain", t)}>{t}</div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes / Special Requests</label>
              <textarea className="form-textarea" placeholder="e.g. heavy on partner work, avoid burpees, mental health theme..." value={form.notes || ""} onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
            </div>

            <button className="btn-generate" onClick={generate} disabled={loading}>
              {loading ? "GENERATING..." : "⚡ GENERATE BEATDOWN"}
            </button>
          </div>

          {/* Output */}
          <div className="output">
            {!result && !loading && !error && (
              <div className="empty-state">
                <div className="empty-icon">🪖</div>
                <div className="empty-text">No Beatdown Yet</div>
                <div className="empty-sub">Fill in your Q info and hit Generate to build your Weinke</div>
              </div>
            )}

            {loading && (
              <div className="loading">
                <div className="loading-text">BUILDING YOUR BEATDOWN</div>
                <div className="loading-bar-wrap"><div className="loading-bar" /></div>
                <div className="loading-sub">Generating Weinke · Playlist · Pre-Blast</div>
              </div>
            )}

            {error && (
              <div className="loading">
                <div style={{color:"var(--red)",fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:4}}>{error}</div>
              </div>
            )}

            {result && (
              <>
                {/* Weinke Header */}
                <div className="weinke-header">
                  <div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:3,color:"var(--muted)",marginBottom:4}}>F3 WEINKE</div>
                    <div className="weinke-title">🪖 {result.theme}</div>
                    <div style={{fontFamily:"'Barlow',sans-serif",fontSize:14,color:"var(--muted)",marginTop:6,fontStyle:"italic"}}>{result.tagline}</div>
                  </div>
                  <div className="weinke-meta">
                    {[
                      ["Q", form.q || "Q"],
                      ["AO", form.ao || "AO"],
                      ["DATE", form.date || "TBD"],
                      ["TIME", form.time],
                    ].map(([label, value]) => (
                      <div className="weinke-meta-item" key={label}>
                        <div className="weinke-meta-label">{label}</div>
                        <div className="weinke-meta-value">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                  {[["weinke","🪖 Weinke"],["playlist","🎵 Playlist"],["preblast","📣 Pre-Blast"]].map(([id,label]) => (
                    <button key={id} className={`tab ${activeTab===id?"active":""}`} onClick={() => setActiveTab(id)}>{label}</button>
                  ))}
                </div>

                {/* WEINKE TAB */}
                {activeTab === "weinke" && (
                  <>
                    <div className="blocks">
                      {result.blocks?.map((block, i) => (
                        <div className="block" key={i}>
                          <div className="block-header">
                            <div className="block-time">{block.time}</div>
                            <div>
                              <div className="block-name">{block.name}</div>
                              <div className="block-theme">{block.themeLabel} · {block.duration}</div>
                            </div>
                          </div>
                          <div className="exercises">
                            {block.exercises?.map((ex, j) => (
                              <div className="exercise-row" key={j}>
                                <div>
                                  <div className="exercise-name">
                                    {ex.name}
                                    {ex.cadence === "IC" && <span className="ic-badge">IC</span>}
                                    {ex.cadence === "OYO" && <span className="oyo-badge">OYO</span>}
                                  </div>
                                  {ex.note && <div className="exercise-note">{ex.note}</div>}
                                </div>
                                <div className="exercise-reps">{ex.reps}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pace Guide */}
                    <div style={{marginTop:24}}>
                      <div className="section-label">Pace Guide</div>
                      <table className="pace-table">
                        <thead><tr><th>Segment</th><th>Time</th></tr></thead>
                        <tbody>
                          {result.paceGuide?.map((row, i) => (
                            <tr key={i}>
                              <td>{row.segment}</td>
                              <td className="pace-time">{row.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* COT */}
                    <div className="cot-section">
                      <div className="section-label">Closing Message Options</div>
                      <div className="cot-options">
                        <div className="cot-card">
                          <div className="cot-label">✝️ Faith-Based</div>
                          <div className="cot-text">{result.closingMessages?.faith}</div>
                        </div>
                        <div className="cot-card">
                          <div className="cot-label">💪 Secular</div>
                          <div className="cot-text">{result.closingMessages?.secular}</div>
                        </div>
                        <div className="cot-card">
                          <div className="cot-label">🎯 Themed</div>
                          <div className="cot-text">{result.closingMessages?.themed}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* PLAYLIST TAB */}
                {activeTab === "playlist" && (
                  <div className="playlist-section">
                    <div className="section-label">45-Min Playlist · Men in their 40s &amp; 50s</div>
                    <div className="playlist-grid">
                      {result.playlist?.map((section, si) => (
                        <>
                          <div className="playlist-section-hdr" key={`hdr-${si}`}>{section.section}</div>
                          {section.tracks.map((track, ti) => {
                            const globalNum = result.playlist.slice(0,si).reduce((a,s) => a + s.tracks.length, 0) + ti + 1;
                            return (
                              <div className="playlist-row" key={`${si}-${ti}`}>
                                <div className="playlist-num">{globalNum}</div>
                                <div>
                                  <div className="playlist-title">{track.title}</div>
                                  <div className="playlist-artist">{track.artist}</div>
                                </div>
                                <div />
                                <div className="playlist-duration">{track.duration}</div>
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                  </div>
                )}

                {/* PRE-BLAST TAB */}
                {activeTab === "preblast" && (
                  <div className="preblast-section">
                    <div className="section-label">Social Post — Copy &amp; Paste</div>
                    <div className="preblast-box">
                      <button className={`copy-btn ${copied?"copied":""}`} onClick={copyPreBlast}>
                        {copied ? "✓ COPIED" : "COPY"}
                      </button>
                      {result.preBlast}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

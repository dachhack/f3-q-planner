import { useState, useRef, useEffect } from "react";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from "docx";
import { saveAs } from "file-saver";

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
    --muted:   #A8B2C4;
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
  .main { max-width: 900px; margin: 0 auto; padding: 0 20px; }

  /* ── FORM ── */
  .form-panel {
    background: var(--panel);
    border: 1px solid var(--border);
    margin-top: 24px;
    transition: margin 0.3s;
  }
  .form-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    cursor: pointer;
    background: rgba(255,255,255,0.02);
    border: none;
    width: 100%;
    color: var(--text);
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }
  .form-toggle:hover { background: rgba(255,255,255,0.04); }
  .form-toggle-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    letter-spacing: 4px;
    color: var(--gold);
  }
  .form-toggle-summary {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 1px;
  }
  .form-toggle-arrow {
    font-size: 18px;
    color: var(--gold);
    transition: transform 0.3s;
  }
  .form-toggle-arrow.collapsed { transform: rotate(-90deg); }
  .form-body {
    max-height: 2000px;
    overflow: visible;
    transition: max-height 0.4s ease, padding 0.4s ease;
    padding: 24px 28px;
  }
  .form-body.collapsed {
    max-height: 0;
    overflow: hidden;
    padding-top: 0;
    padding-bottom: 0;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 24px;
  }
  .form-grid .full-width { grid-column: 1 / -1; }

  @media (max-width: 600px) {
    .form-grid { grid-template-columns: 1fr; }
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
    font-size: 15px;
    padding: 10px 12px;
    outline: none;
    transition: border-color 0.2s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--gold);
  }
  .form-select { cursor: pointer; }
  .form-input::placeholder, .form-textarea::placeholder { color: #6B7588; }
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
    padding: 24px 0;
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
  .loading-phrase {
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    font-style: italic;
    color: var(--steel);
    letter-spacing: 1px;
    min-height: 20px;
    animation: phraseFade 5s ease-in-out infinite;
  }
  @keyframes phraseFade {
    0% { opacity: 0; transform: translateY(4px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-4px); }
  }

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
  .exercise-link {
    color: var(--text);
    text-decoration: none;
    border-bottom: 1px dotted var(--steel);
    transition: color 0.2s, border-color 0.2s;
  }
  .exercise-link:hover {
    color: var(--steel);
    border-bottom-color: var(--steel);
    border-bottom-style: solid;
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
    grid-template-columns: 32px 1fr 28px 52px;
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
  .playlist-title a { color: inherit; text-decoration: none; border-bottom: 1px dotted rgba(255,255,255,0.2); transition: all 0.15s; }
  .playlist-title a:hover { color: var(--gold); border-bottom-color: var(--gold); }
  .playlist-artist { font-size: 13px; color: var(--muted); }
  .playlist-spotify {
    display: flex; align-items: center; justify-content: center;
  }
  .playlist-spotify a {
    color: var(--muted); transition: color 0.15s; display: flex; align-items: center;
  }
  .playlist-spotify a:hover { color: #1DB954; }
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

  /* ── PAX AUTOCOMPLETE ── */
  .q-autocomplete { position: relative; }
  .q-suggestions {
    position: absolute; top: 100%; left: 0; right: 0; z-index: 100;
    background: var(--dark); border: 1px solid var(--border); border-top: none;
    max-height: 200px; overflow-y: auto;
  }
  .q-suggestion {
    padding: 8px 12px; font-size: 14px; cursor: pointer; transition: background 0.1s;
  }
  .q-suggestion:hover, .q-suggestion.highlighted { background: rgba(201,168,76,0.15); color: var(--gold); }

  /* ── AO MAP ── */
  .ao-map-container {
    margin-top: 16px; border: 1px solid var(--border); border-radius: 4px; overflow: hidden;
  }
  .ao-map { height: 200px; width: 100%; }
  .output-map-wrap {
    width: 280px; height: 140px; border-radius: 4px; overflow: hidden;
    border: 1px solid var(--border); flex-shrink: 0;
  }
  @media (max-width: 600px) {
    .output-map-wrap { width: 120px; height: 120px; }
  }
  .ao-map-label {
    background: var(--dark); padding: 6px 12px;
    font-family: 'Barlow Condensed', sans-serif; font-size: 11px;
    letter-spacing: 2px; color: var(--muted); text-transform: uppercase;
  }

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

  .btn-pdf {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 1px solid var(--steel);
    color: var(--steel);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 8px 18px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-pdf:hover {
    background: var(--steel);
    color: white;
  }
  .weinke-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  @media (max-width: 700px) {
    .cot-options { grid-template-columns: 1fr; }
    .weinke-header { flex-direction: column; gap: 16px; }
    .weinke-meta { flex-wrap: wrap; }
  }

  @media print {
    body { background: white !important; color: #111 !important; }
    .app { background: white !important; background-image: none !important; }
    .header, .form-panel, .tabs, .loading, .empty-state, .btn-pdf, .weinke-actions, .copy-btn { display: none !important; }
    .main { display: block !important; padding: 0 !important; }
    .output { padding: 0 !important; }
    .weinke-header { background: white !important; border-color: #333 !important; }
    .weinke-title { color: #111 !important; }
    .block { background: white !important; border-color: #ccc !important; break-inside: avoid; }
    .block-header { background: #f0f0f0 !important; }
    .block-name, .block-time { color: #111 !important; }
    .exercise-link { color: #111 !important; border-bottom: none !important; }
    .exercise-reps { color: #333 !important; }
    .ic-badge, .oyo-badge { border-color: #666 !important; color: #666 !important; background: transparent !important; }
    .pace-table th { background: #333 !important; }
    .cot-card { background: #f8f8f8 !important; border-color: #ccc !important; }
    .cot-label, .cot-text { color: #111 !important; }
    .section-label { color: #111 !important; }
    .weinke-meta-label, .weinke-meta-value { color: #333 !important; }
    .playlist-section, .preblast-section { display: none !important; }
  }
`;

export default function F3QPlanner() {
  const [form, setForm] = useState({
    q: "", ao: "", region: "", location: "", date: "", time: "5:15 AM",
    theme: "", equipment: [], terrain: [], formats: [], duration: "45", complexity: 3, difficulty: 3
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("weinke");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [exicon, setExicon] = useState([]);
  const [regions, setRegions] = useState([]);
  const [aos, setAos] = useState([]);
  const [loadingPhrase, setLoadingPhrase] = useState("");
  const [pax, setPax] = useState([]);
  const [qSuggestions, setQSuggestions] = useState([]);
  const [qFocused, setQFocused] = useState(false);
  const [qHighlight, setQHighlight] = useState(-1);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const outputMapRef = useRef(null);
  const outputMapInstanceRef = useRef(null);
  const outputMarkerRef = useRef(null);
  const outputRef = useRef(null);

  const LOADING_PHRASES = [
    "Woody is not impressed",
    "Zima can't hear you over the Candlebox",
    "Where are the blue pallets?",
    "Pea Shooter got caught in the innovation center again",
    "Rummaging through Sweep3r's supplies",
    "Questioning every life choice at the start line",
    "Trying to remember if burpees were your idea",
    "Convincing your legs this was voluntary",
    "Pretending that last rep counted",
    "Looking for the PAX who said 'just one more'",
    "Calculating the exact number of merkins you owe",
    "Waiting for the six... still waiting",
    "Consulting the coupon about life decisions",
    "Lying to yourself about enjoying this",
    "Googling 'is 5:15 AM even real'",
    "Loading extra burpees... you're welcome",
    "Shuffling the playlist to maximum suffering",
    "Your FNG name is now 'Why Am I Here'",
    "Reminding you that modified is still a rep",
    "Bear crawling through the algorithm",
    "SSH... the server is holding",
    "Lunging toward a completed workout plan",
    "Mumble chatter detected in the cloud",
    "Finding exercises your knees won't forgive",
    "Adding one more round because Q said so",
    "The coupons aren't going to carry themselves",
    "Somewhere a PAX just fartsacked",
    "Debating whether wall sits count as rest",
    "Your alarm went off 3 hours ago for this",
    "Generating motivation you didn't ask for",
    "Hill repeats? Oh yes, hill repeats",
    "Six-ing up the slowest cloud server",
    "Omaha! Switching to the backup plan",
    "Loading pain tolerance settings",
    "Checking if the AO has enough parking",
    "Stretching the truth about your mile time",
    "Inserting unnecessary bear crawls",
    "The Q just smiled... that's never good",
    "Replacing all exercises with burpees",
    "This seemed like a good idea last night",
    "Calibrating the pain-to-fun ratio",
    "Deploying coupons to the launch point",
    "Thinking about coffeeteria already",
    "Adding exercises that don't exist yet",
    "Your gloom clock says it's go time",
    "Counting reps in Fibonacci sequence",
    "Making sure no PAX is left behind",
    "Warming up the warmup for the warmup",
    "Parsing the difference between 'hard' and 'impossible'",
    "Asking ChatGPT... just kidding, this is Claude",
  ];

  useEffect(() => {
    if (!loading) return;
    const shuffled = [...LOADING_PHRASES].sort(() => Math.random() - 0.5);
    let i = 0;
    setLoadingPhrase(shuffled[0]);
    const interval = setInterval(() => {
      i = (i + 1) % shuffled.length;
      setLoadingPhrase(shuffled[i]);
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  // Load Exicon exercise database + regions/AOs on mount
  useEffect(() => {
    fetch("/exicon.json")
      .then(r => r.json())
      .then(data => setExicon(data))
      .catch(() => {});
    fetch("/api/generate?f3=v1/map/location/regionsWithLocation")
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        // oRPC wraps response in {json: {regionsWithLocation: [...]}}
        const raw = data?.json?.regionsWithLocation || data?.regionsWithLocation || (Array.isArray(data) ? data : []);
        if (!Array.isArray(raw) || raw.length === 0) throw new Error("No regions in response");
        setRegions(raw.sort((a, b) => (a.name || "").localeCompare(b.name || "")));
      })
      .catch(err => {
        console.warn("[F3] Regions API failed:", err.message, "— using static fallback");
        fetch("/regions.json")
          .then(r => r.json())
          .then(data => setRegions(data.sort((a, b) => (a.name || "").localeCompare(b.name || ""))))
          .catch(() => {});
      });
  }, []);

  // Load all AO locations on mount
  const [allAos, setAllAos] = useState([]);
  useEffect(() => {
    fetch("/api/generate?f3=v1/map/location/eventsAndLocations")
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        // oRPC wraps response in {json: [...]}
        const raw = data?.json || (Array.isArray(data) ? data : []);
        if (!Array.isArray(raw)) { console.warn("[F3] AO data not array"); return; }
        // Tuples: [id, name, logoUrl, lat, lon, fullAddress, events[]]
        const normalized = raw.map(d => {
          if (Array.isArray(d)) {
            return { id: d[0], locationName: d[1], lat: d[3], lon: d[4], locationAddress: d[5] };
          }
          return d;
        });
        setAllAos(normalized);
      })
      .catch(err => console.warn("[F3] AO fetch failed:", err.message));
  }, []);

  // Load location-to-region lookup on mount
  const [locToRegion, setLocToRegion] = useState({});
  useEffect(() => {
    fetch("/api/generate?f3=v1/map/location/locationIdToRegionNameLookup")
      .then(r => r.json())
      .then(data => {
        // oRPC wraps: {json: {lookup: {locationId: "regionName", ...}}}
        let lookup = data?.json?.locationIdToRegionNameLookup || data?.json || data || {};
        const keys = Object.keys(lookup);
        if (keys.length === 1 && typeof lookup[keys[0]] === 'object' && !Array.isArray(lookup[keys[0]])) {
          lookup = lookup[keys[0]];
        }
        setLocToRegion(lookup);
      })
      .catch(() => {});
  }, []);

  // Filter AOs when region changes
  useEffect(() => {
    if (!form.region || allAos.length === 0) { setAos([]); return; }
    // Filter AOs using location→region name lookup
    let filtered = allAos;
    if (Object.keys(locToRegion).length > 0) {
      filtered = allAos.filter(a => locToRegion[String(a.id)] === form.region);
      if (filtered.length === 0) {
        // Fuzzy match: strip "F3" prefix, case-insensitive
        const regionLower = form.region.toLowerCase().replace(/^f3\s+/, '');
        filtered = allAos.filter(a => {
          const lookupName = (locToRegion[String(a.id)] || '').toLowerCase().replace(/^f3\s+/, '');
          return lookupName === regionLower;
        });
      }
    }
    if (filtered.length === 0) filtered = allAos; // fallback to all
    const unique = [...new Map(filtered.map(d => [d.locationName || d.name, d])).values()]
      .sort((a, b) => (a.locationName || a.name || "").localeCompare(b.locationName || b.name || ""));
    setAos(unique);
  }, [form.region, regions, allAos, locToRegion]);

  // PAX names — no public API endpoint available yet

  // Q name autocomplete filter
  useEffect(() => {
    if (!form.q || !qFocused || pax.length === 0) { setQSuggestions([]); return; }
    const query = form.q.toLowerCase();
    setQSuggestions(pax.filter(n => n.toLowerCase().includes(query)).slice(0, 10));
  }, [form.q, pax, qFocused]);

  // Map: show AO location
  useEffect(() => {
    const address = form.location;
    const el = mapRef.current;
    if (!address || !el || !window.L) return;
    // Small delay to let the DOM render the map container
    const timer = setTimeout(() => {
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = window.L.map(el, { zoomControl: true, attributionControl: false }).setView([35.2, -80.8], 13);
        window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(mapInstanceRef.current);
      }
      mapInstanceRef.current.invalidateSize();
      const map = mapInstanceRef.current;
      // Check if AO has lat/lng from API data
      const aoObj = aos.find(a => (a.locationName || a.name) === form.ao);
      const lat = aoObj?.lat || aoObj?.latitude;
      const lng = aoObj?.lon || aoObj?.lng || aoObj?.longitude;
      if (lat && lng) {
        placeMarker(map, lat, lng, form.ao, markerRef);      } else {
        // Geocode the address via Nominatim (free, no API key)
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
          .then(r => r.json())
          .then(data => {
            if (data.length > 0) placeMarker(map, parseFloat(data[0].lat), parseFloat(data[0].lon), form.ao, markerRef);
          })
          .catch(() => {});
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [form.location, form.ao, aos]);

  // Cleanup map when location is cleared
  useEffect(() => {
    if (!form.location && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [form.location]);

  const placeMarker = (map, lat, lng, label, mRef) => {
    if (mRef.current) mRef.current.remove();
    map.setView([lat, lng], 15);
    mRef.current = window.L.marker([lat, lng]).addTo(map);
    if (label) mRef.current.bindPopup(`<b>${label}</b>`).openPopup();
  };

  // Output map: show AO location in the generated weinke
  useEffect(() => {
    if (!result || !outputMapRef.current || !window.L) return;
    const aoObj = aos.find(a => (a.locationName || a.name) === form.ao);
    const lat = aoObj?.lat;
    const lng = aoObj?.lon || aoObj?.lng;
    const initMap = (mlat, mlng) => {
      if (!outputMapInstanceRef.current) {
        outputMapInstanceRef.current = window.L.map(outputMapRef.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false }).setView([mlat, mlng], 15);
        window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(outputMapInstanceRef.current);
      }
      outputMapInstanceRef.current.invalidateSize();
      placeMarker(outputMapInstanceRef.current, mlat, mlng, form.ao, outputMarkerRef);
    };
    const timer = setTimeout(() => {
      if (lat && lng) {
        initMap(lat, lng);
      } else if (form.location) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location)}&limit=1`)
          .then(r => r.json())
          .then(data => { if (data.length > 0) initMap(parseFloat(data[0].lat), parseFloat(data[0].lon)); })
          .catch(() => {});
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [result, aos, form.ao, form.location]);

  // Render exercise notes — split numbered lists (e.g. "100 Merkins, 200 Squats") into line items
  const renderNote = (note) => {
    if (!note) return null;
    // Check if note contains a numbered list pattern (e.g. "100 Exercise, 200 Exercise")
    const items = note.split(/,\s*/).filter(Boolean);
    const hasNumberedList = items.length >= 2 && items.every(item => /^\d+\s+/.test(item.trim()));
    if (hasNumberedList) {
      return (
        <div className="exercise-note">
          {items.map((item, i) => (
            <div key={i} style={{paddingLeft:8,borderLeft:'2px solid var(--border)',marginTop: i > 0 ? 3 : 0}}>{item.trim()}</div>
          ))}
        </div>
      );
    }
    // Also handle notes with periods or semicolons as separators
    const parts = note.split(/[.;]\s*/).filter(s => s.trim().length > 0);
    const hasMultiSentence = parts.length >= 3 && parts.every(p => /^\d+\s+/.test(p.trim()));
    if (hasMultiSentence) {
      return (
        <div className="exercise-note">
          {parts.map((item, i) => (
            <div key={i} style={{paddingLeft:8,borderLeft:'2px solid var(--border)',marginTop: i > 0 ? 3 : 0}}>{item.trim()}</div>
          ))}
        </div>
      );
    }
    return <div className="exercise-note">{note}</div>;
  };

  // Workout evaluation
  const evaluateWorkout = (r) => {
    if (!r?.blocks) return null;
    const allExercises = r.blocks.flatMap(b => b.exercises || []);
    const totalExercises = allExercises.length;
    const icCount = allExercises.filter(e => e.cadence === "IC").length;
    const oyoCount = allExercises.filter(e => e.cadence === "OYO").length;
    const uniqueNames = new Set(allExercises.map(e => e.name?.toLowerCase().trim()));
    const uniqueCount = uniqueNames.size;
    const repeatCount = totalExercises - uniqueCount;

    // Muscle group categorization — hybrid: exicon tags + keyword matching
    // Map exicon tags to our display groups
    const tagToGroup = { "Arms": "Arms", "Core": "Core", "Legs": "Legs", "Cardio": "Cardio", "Full Body": "Full Body", "Run": "Cardio", "Mary": "Core", "Coupon": "Coupon Work", "warmup": "Warmup", "Routine": "Full Body", "Music": null };
    // Build exicon name→group lookup
    const exiconGroupMap = {};
    for (const ex of exicon) {
      const name = ex.name.toLowerCase().trim();
      for (const tag of (ex.tags || [])) {
        const group = tagToGroup[tag];
        if (group) { exiconGroupMap[name] = group; break; }
      }
    }
    // Keyword fallback for exercises not in exicon or untagged
    const keywordGroups = {
      "Chest": ["merkin","dry dock","derkin","irkin","mike tyson","chest press","bench press","hand release"],
      "Shoulders": ["overhead press","shoulder","blocktanamo","military press","arnold","lateral raise","front raise","michael phelps","seal clap","scarecrow"],
      "Arms": ["curl","tricep","skull crusher","dip","hammer curl","diamond merkin","kickback"],
      "Back": ["row","superman","reverse fly","lawn mower","pull-up","pull up","pullup","deadlift","good morning","bent over"],
      "Core": ["lbc","freddie","mercury","american hammer","flutter","dolly","rosalita","pickle","big boy","sit-up","situp","j-lo","hello dolly","cockroach","boat","canoe","wwii","heels to heaven","penguin","pretzel","crunch","v-up","leg raise","wiper","russian twist","mason twist"],
      "Plank": ["plank","peter parker","body saw"],
      "Legs": ["squat","lunge","split squat","bonnie blair","bobby hurley","box jump","step-up","step up","sumo","pistol","goblet","monkey humper","wall sit","al gore","people's chair","calf raise","hip thrust","glute bridge","fire hydrant","donkey kick","smurf","chair"],
      "Cardio": ["ssh","side straddle","high knee","butt kick","mountain climber","jumping jack","star jump","run","mosey","sprint","shuffle","karaoke","broad jump","tuck jump","jump rope","seal jack","skater","burner"],
      "Full Body": ["burpee","man maker","thruster","blockee","clean and press","turkish get-up","devil press","cindy","murph"],
      "Coupon Work": ["coupon","block","ruck","sandbag","kettlebell","kb ","farmer","carry","uhaul","drag"]
    };
    const classifyExercise = (name) => {
      const lower = (name || "").toLowerCase().trim();
      // 1. Check exicon tag lookup
      if (exiconGroupMap[lower]) return exiconGroupMap[lower];
      // 2. Check partial exicon matches
      for (const [eName, group] of Object.entries(exiconGroupMap)) {
        if (lower.includes(eName) || eName.includes(lower)) return group;
      }
      // 3. Keyword fallback
      for (const [group, keywords] of Object.entries(keywordGroups)) {
        if (keywords.some(k => lower.includes(k))) return group;
      }
      // 4. Check exicon descriptions for clues
      const exEntry = exicon.find(e => e.name.toLowerCase().trim() === lower);
      if (exEntry?.desc) {
        const desc = exEntry.desc.toLowerCase();
        if (desc.includes("merkin") || desc.includes("push-up") || desc.includes("pushup") || desc.includes("chest")) return "Chest";
        if (desc.includes("plank")) return "Plank";
        if (desc.includes("squat") || desc.includes("lunge") || desc.includes("legs")) return "Legs";
        if (desc.includes("core") || desc.includes("abs") || desc.includes("sit-up") || desc.includes("crunch")) return "Core";
        if (desc.includes("run") || desc.includes("sprint") || desc.includes("cardio") || desc.includes("jump")) return "Cardio";
        if (desc.includes("curl") || desc.includes("press") || desc.includes("arm")) return "Arms";
        if (desc.includes("row") || desc.includes("back") || desc.includes("pull")) return "Back";
      }
      return "Other";
    };
    const groupCounts = {};
    const groupOrder = ["Chest","Shoulders","Arms","Back","Core","Plank","Legs","Cardio","Full Body","Coupon Work","Warmup","Other"];
    for (const g of groupOrder) groupCounts[g] = 0;
    for (const ex of allExercises) {
      const group = classifyExercise(ex.name);
      groupCounts[group] = (groupCounts[group] || 0) + 1;
    }

    // Duration parsing
    const blockDurations = r.blocks.map(b => {
      const match = (b.duration || "").match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const totalMinutes = blockDurations.reduce((a, b) => a + b, 0);

    // Difficulty estimate (1-5) based on rep counts, exercise types, and volume
    const burpeeCount = allExercises.filter(e => (e.name || "").toLowerCase().includes("burpee")).length;
    const hardExercises = allExercises.filter(e => {
      const name = (e.name || "").toLowerCase();
      return ["burpee","man maker","thruster","blockee","devil press","clean and press","bear crawl"].some(h => name.includes(h));
    }).length;
    const avgRep = (() => {
      const reps = allExercises.map(e => { const m = (e.reps || "").match(/(\d+)/); return m ? parseInt(m[1]) : 0; }).filter(r => r > 0);
      return reps.length > 0 ? reps.reduce((a, b) => a + b, 0) / reps.length : 15;
    })();
    const isometricCount = allExercises.filter(e => (e.reps || "").toLowerCase().includes("second") || (e.reps || "").toLowerCase().includes("hold")).length;
    let diffScore = 0;
    if (avgRep <= 12) diffScore += 1;
    else if (avgRep <= 16) diffScore += 2;
    else if (avgRep <= 22) diffScore += 3;
    else if (avgRep <= 28) diffScore += 4;
    else diffScore += 5;
    diffScore += Math.min(2, hardExercises * 0.4);
    diffScore += Math.min(1, burpeeCount * 0.3);
    if (totalExercises > 35) diffScore += 0.5;
    if (isometricCount > 3) diffScore += 0.5;
    const difficulty = Math.min(5, Math.max(1, Math.round(diffScore / 1.5)));

    return {
      totalExercises, icCount, oyoCount, uniqueCount, repeatCount,
      groupCounts, totalMinutes, blockCount: r.blocks.length,
      blockDurations, difficulty,
      varietyRatio: totalExercises > 0 ? Math.round((uniqueCount / totalExercises) * 100) : 0
    };
  };

  const equipment = ["Coupons / Blocks", "Bodyweight", "Resistance Bands", "Sandbags"];
  const terrains  = ["Hill", "Open Field", "Parking Lot", "Track", "Flat Only"];
  const themes    = ["Military / Tactical", "Mental Health", "Movies / Pop Culture", "Sports", "Brotherhood", "Surprise Me"];
  const formats      = ["7s", "9s", "11s", "Dora", "Four Corners", "Ring of Fire", "Indian Run", "Partner Work", "Tabata", "AMRAP", "EMOM"];
  const complexityLabels = {
    1: "Minimal — 3-4 exercises per block, heavy repeats",
    2: "Simple — fewer exercises, more repeats",
    3: "Balanced — moderate variety",
    4: "High Variety — lots of different exercises",
    5: "Max Variety — all different, no repeats"
  };

  const toggleChip = (key, val) =>
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val]
    }));

  const buildPrompt = () => {
    // Pick a relevant subset of exicon exercises to include as context
    const relevantTags = [];
    if (form.equipment.some(e => e.toLowerCase().includes("coupon") || e.toLowerCase().includes("block"))) relevantTags.push("Coupon");
    if (form.equipment.some(e => e.toLowerCase().includes("bodyweight"))) relevantTags.push("Full Body");
    if (form.terrain.some(t => t.toLowerCase().includes("hill"))) relevantTags.push("Run", "Cardio");

    let exercisePool = exicon;
    if (relevantTags.length > 0) {
      const tagged = exicon.filter(e => e.tags.some(t => relevantTags.includes(t)));
      const untagged = exicon.filter(e => e.tags.length === 0);
      exercisePool = [...tagged, ...untagged.slice(0, 50)];
    }
    // Limit to ~150 exercise names to keep prompt reasonable
    const exerciseNames = exercisePool.slice(0, 150).map(e => e.name).join(", ");

    const aoObj = aos.find(a => (a.locationName || a.name) === form.ao);
    const locationStr = aoObj
      ? `${form.ao} at ${aoObj.locationAddress || aoObj.fullAddress || form.location || ""}`.trim()
      : `${form.ao || "Unnamed AO"}${form.location ? ` at ${form.location}` : ""}`;

    return `Design a themed F3 beatdown with these specs:
- Q: ${form.q || "Q"}
- AO: ${locationStr}
- Date: ${form.date || "TBD"}, Time: ${form.time}
- Duration: ${form.duration} minutes
- Theme direction: ${form.theme || "surprise me — pick something bold and memorable"}
- Equipment: ${form.equipment.length ? form.equipment.join(", ") : "bodyweight only"}
- Terrain: ${form.terrain.length ? form.terrain.join(", ") : "flat"}
- Workout formats to include: ${form.formats.length ? form.formats.join(", ") : "Q's choice — pick what fits the theme"}
- Exercise variety (${form.complexity}/5): ${form.complexity <= 1 ? "CRITICAL: MINIMAL variety. Use ONLY 3-4 distinct exercises for the ENTIRE workout. Repeat the same exercises every round/set. Do NOT introduce new exercises in each block — reuse the same ones. Example: Merkins, Squats, LBCs repeated across all blocks." : form.complexity === 2 ? "IMPORTANT: LOW variety. Use only 4-6 distinct exercises total across the whole workout. REPEAT exercises heavily across rounds and blocks. Do NOT use a different exercise for every line — reuse the same core exercises. Favor ladder formats, Doras, and rep-based circuits with the same few movements." : form.complexity === 3 ? "BALANCED — moderate variety, some repeats where it makes sense. Mix of familiar and fresh exercises." : form.complexity === 4 ? "HIGH VARIETY — use many different exercises. Minimize repeats. Each block should feature fresh movements." : "MAX VARIETY — every exercise is different. Zero repeats across the entire beatdown."}
- Difficulty (${form.difficulty}/5): ${form.difficulty <= 1 ? "CRITICAL: EASY workout. Keep ALL reps at 10-12 IC or OYO. NO burpees. NO high-rep sets. Use light exercises (SSH, arm circles, light squats). Include generous transition time. This is for FNGs and recovery days." : form.difficulty === 2 ? "IMPORTANT: MODERATE workout. Keep reps at 15 max. Limit burpees to 1 set max. No sets above 20 reps. Use standard exercises at a comfortable pace. NO death-by or max-effort sets." : form.difficulty === 3 ? "CHALLENGING — reps around 15-20. Include some burpees and compound movements. Good pace but manageable." : form.difficulty === 4 ? "HARD — reps 20-25, minimal rest. Load up on coupons, burpees, and compound movements. PAX should be gassed." : "BRUTAL — reps 25-30+, burpee-heavy, coupon-loaded. Every block punishing. No mercy."}
- Extra notes: ${form.notes || "none"}

Use REAL F3 exercise names from the Exicon when possible. Here are exercises to draw from:
${exerciseNames}

Playlist: Build for men in their 40s & 50s. Mix classic rock, 90s hip-hop, and hard-hitting anthems. Sequence to match the energy arc — warmup through finisher.`;
  };

  const generate = async () => {
    setFormCollapsed(true);
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

  // Build a lookup map from normalized exercise names to exicon entries
  const exiconMap = useRef(new Map());
  useEffect(() => {
    const map = new Map();
    exicon.forEach(ex => {
      map.set(ex.name.toLowerCase().trim(), ex);
    });
    exiconMap.current = map;
  }, [exicon]);

  const getExiconUrl = (exerciseName) => {
    const normalized = exerciseName.toLowerCase().trim();
    const match = exiconMap.current.get(normalized);
    if (match) {
      const slug = match.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `https://f3nation.com/exicon/${slug}`;
    }
    return null;
  };

  const downloadPdf = () => {
    window.print();
  };

  const downloadDocx = async () => {
    if (!result) return;

    const noBorders = {
      top: { style: BorderStyle.NONE, size: 0 },
      bottom: { style: BorderStyle.NONE, size: 0 },
      left: { style: BorderStyle.NONE, size: 0 },
      right: { style: BorderStyle.NONE, size: 0 },
    };

    const sections = [];

    // Title
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "F3 WEINKE", size: 20, color: "888888", font: "Arial" })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `🪖 ${result.theme}`, size: 40, bold: true, font: "Arial" })],
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [new TextRun({ text: result.tagline, italics: true, size: 22, color: "666666", font: "Arial" })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Q: ${form.q || "Q"}  ·  AO: ${form.ao || "AO"}  ·  Date: ${form.date || "TBD"}  ·  Time: ${form.time}`, size: 20, color: "444444", font: "Arial" }),
        ],
        spacing: { after: 300 },
      }),
    );

    // Blocks
    result.blocks?.forEach(block => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${block.time}  `, size: 22, bold: true, color: "C0392B", font: "Arial" }),
            new TextRun({ text: `${block.name}`, size: 26, bold: true, font: "Arial" }),
            new TextRun({ text: `  ·  ${block.themeLabel}  ·  ${block.duration}`, size: 20, color: "666666", font: "Arial" }),
          ],
          spacing: { before: 300, after: 100 },
          shading: { fill: "F0F0F0" },
        }),
      );
      block.exercises?.forEach(ex => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `  ${ex.name}`, size: 21, bold: true, font: "Arial" }),
              new TextRun({ text: ex.cadence ? `  [${ex.cadence}]` : "", size: 18, color: "4A7FA5", font: "Arial" }),
              new TextRun({ text: `    ${ex.reps}`, size: 20, color: "C9A84C", font: "Arial" }),
            ],
            spacing: { after: 40 },
          }),
        );
        if (ex.note) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: `      ${ex.note}`, size: 18, italics: true, color: "888888", font: "Arial" })],
              spacing: { after: 60 },
            }),
          );
        }
      });
    });

    // Pace Guide
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "PACE GUIDE", size: 24, bold: true, font: "Arial" })],
        spacing: { before: 400, after: 150 },
      }),
    );
    if (result.paceGuide?.length) {
      const rows = result.paceGuide.map(row =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.segment, size: 20, font: "Arial" })] })], borders: noBorders, width: { size: 60, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.time, size: 20, bold: true, color: "C0392B", font: "Arial" })] })], borders: noBorders, width: { size: 40, type: WidthType.PERCENTAGE } }),
          ],
        })
      );
      sections.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    }

    // Closing Messages
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "CLOSING MESSAGE OPTIONS", size: 24, bold: true, font: "Arial" })],
        spacing: { before: 400, after: 150 },
      }),
    );
    [["Faith-Based", result.closingMessages?.faith], ["Secular", result.closingMessages?.secular], ["Themed", result.closingMessages?.themed]].forEach(([label, text]) => {
      if (text) {
        sections.push(
          new Paragraph({ children: [new TextRun({ text: `${label}:`, size: 20, bold: true, font: "Arial" })], spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text, size: 20, italics: true, color: "444444", font: "Arial" })], spacing: { after: 100 } }),
        );
      }
    });

    // Playlist
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "PLAYLIST", size: 24, bold: true, font: "Arial" })],
        spacing: { before: 400, after: 150 },
      }),
    );
    result.playlist?.forEach(section => {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: section.section, size: 22, bold: true, color: "4A7FA5", font: "Arial" })],
          spacing: { before: 200, after: 80 },
        }),
      );
      section.tracks.forEach(track => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${track.title}`, size: 20, bold: true, font: "Arial" }),
              new TextRun({ text: ` — ${track.artist}`, size: 20, color: "666666", font: "Arial" }),
              new TextRun({ text: `  (${track.duration})`, size: 18, color: "888888", font: "Arial" }),
            ],
            spacing: { after: 40 },
          }),
        );
      });
    });

    // Pre-Blast
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "PRE-BLAST", size: 24, bold: true, font: "Arial" })],
        spacing: { before: 400, after: 150 },
      }),
      new Paragraph({
        children: [new TextRun({ text: result.preBlast, size: 20, font: "Arial" })],
      }),
    );

    const doc = new Document({
      sections: [{ children: sections }],
    });

    const blob = await Packer.toBlob(doc);
    const filename = `${(result.theme || "beatdown").replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}-weinke.docx`;
    saveAs(blob, filename);
  };

  useEffect(() => {
    if ((result || loading) && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, loading]);

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
          {/* Collapsible Form */}
          <div className="form-panel">
            <button className="form-toggle" onClick={() => setFormCollapsed(c => !c)}>
              <div>
                <div className="form-toggle-title">BEATDOWN SETUP</div>
                {formCollapsed && (form.q || form.ao || form.theme) && (
                  <div className="form-toggle-summary">
                    {[form.q, form.ao, form.region, form.theme, form.duration + " min"].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
              <div className={`form-toggle-arrow ${formCollapsed ? "collapsed" : ""}`}>▼</div>
            </button>
            <div className={`form-body ${formCollapsed ? "collapsed" : ""}`}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Q Name {pax.length > 0 && <span style={{fontSize:10,color:"var(--muted)",fontWeight:400}}>({pax.length} PAX loaded)</span>}</label>
                  <div className="q-autocomplete">
                    <input className="form-input" placeholder={pax.length ? "Start typing your F3 name..." : "Your F3 name"} value={form.q}
                      onChange={e => { setForm(f => ({...f, q: e.target.value})); setQHighlight(-1); }}
                      onFocus={() => setQFocused(true)}
                      onBlur={() => setTimeout(() => setQFocused(false), 150)}
                      onKeyDown={e => {
                        if (e.key === "ArrowDown") { e.preventDefault(); setQHighlight(h => Math.min(h + 1, qSuggestions.length - 1)); }
                        else if (e.key === "ArrowUp") { e.preventDefault(); setQHighlight(h => Math.max(h - 1, 0)); }
                        else if (e.key === "Enter" && qHighlight >= 0) { e.preventDefault(); setForm(f => ({...f, q: qSuggestions[qHighlight]})); setQFocused(false); }
                      }}
                    />
                    {qFocused && qSuggestions.length > 0 && (
                      <div className="q-suggestions">
                        {qSuggestions.map((name, i) => (
                          <div key={name} className={`q-suggestion ${i === qHighlight ? "highlighted" : ""}`}
                            onMouseDown={() => { setForm(f => ({...f, q: name})); setQFocused(false); }}>
                            {name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Region</label>
                  {regions.length > 0 ? (
                    <select className="form-select" value={form.region} onChange={e => setForm(f => ({...f, region: e.target.value, ao: "", location: ""}))}>
                      <option value="">Select a region...</option>
                      {regions.map(r => (
                        <option key={r.name} value={r.name}>{r.name}{r.location ? ` (${r.location})` : ""}</option>
                      ))}
                    </select>
                  ) : (
                    <input className="form-input" placeholder="e.g. F3 Alpha" value={form.region} onChange={e => setForm(f => ({...f, region: e.target.value}))} />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">AO Name</label>
                  {aos.length > 0 ? (
                    <select className="form-select" value={form.ao} onChange={e => {
                      const sel = aos.find(a => (a.locationName || a.name) === e.target.value);
                      setForm(f => ({...f, ao: e.target.value, location: sel?.locationAddress || sel?.fullAddress || ""}));
                    }}>
                      <option value="">Select an AO...</option>
                      {aos.map(a => (
                        <option key={a.id || a.name} value={a.locationName || a.name}>{a.locationName || a.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input className="form-input" placeholder="e.g. Badapple" value={form.ao} onChange={e => setForm(f => ({...f, ao: e.target.value}))} />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" placeholder={form.ao && aos.length ? "Auto-filled from AO" : "e.g. Sweetapple Park"} value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
                </div>
                {form.location && (
                  <div className="form-group full-width">
                    <div className="ao-map-container">
                      <div className="ao-map-label">AO Location</div>
                      <div className="ao-map" ref={mapRef} />
                    </div>
                  </div>
                )}
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

                <div className="form-group full-width">
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
                <div className="form-group full-width">
                  <label className="form-label">Equipment</label>
                  <div className="chips">
                    {equipment.map(e => (
                      <div key={e} className={`chip ${form.equipment.includes(e) ? "active" : ""}`}
                        onClick={() => toggleChip("equipment", e)}>{e}</div>
                    ))}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Terrain</label>
                  <div className="chips">
                    {terrains.map(t => (
                      <div key={t} className={`chip ${form.terrain.includes(t) ? "active" : ""}`}
                        onClick={() => toggleChip("terrain", t)}>{t}</div>
                    ))}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Workout Formats (optional)</label>
                  <div className="chips">
                    {formats.map(f => (
                      <div key={f} className={`chip ${form.formats.includes(f) ? "active" : ""}`}
                        onClick={() => toggleChip("formats", f)}>{f}</div>
                    ))}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Exercise Variety <span style={{color:'var(--gold)',fontWeight:700}}>{form.complexity}</span></label>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:11,color:'var(--muted)',fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,whiteSpace:'nowrap'}}>SIMPLE</span>
                    <div style={{display:'flex',gap:4,flex:1}}>
                      {[1,2,3,4,5].map(n => (
                        <div key={n} onClick={() => setForm(f => ({...f, complexity: n}))}
                          style={{flex:1,height:32,borderRadius:4,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
                            background: n <= form.complexity ? 'var(--gold)' : 'var(--panel)',
                            color: n <= form.complexity ? 'var(--black)' : 'var(--muted)',
                            fontFamily:"'Bebas Neue',sans-serif",fontSize:16,
                            border: `1px solid ${n <= form.complexity ? 'var(--gold)' : 'var(--border)'}`,
                            transition:'all 0.15s'}}>
                          {n}
                        </div>
                      ))}
                    </div>
                    <span style={{fontSize:11,color:'var(--muted)',fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,whiteSpace:'nowrap'}}>MAX</span>
                  </div>
                  <div style={{fontSize:12,color:'var(--muted)',marginTop:6,fontStyle:'italic'}}>{complexityLabels[form.complexity]}</div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Difficulty <span style={{color:'var(--red)',fontWeight:700}}>{form.difficulty}</span></label>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:11,color:'var(--muted)',fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,whiteSpace:'nowrap'}}>EASY</span>
                    <div style={{display:'flex',gap:4,flex:1}}>
                      {[1,2,3,4,5].map(n => (
                        <div key={n} onClick={() => setForm(f => ({...f, difficulty: n}))}
                          style={{flex:1,height:32,borderRadius:4,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
                            background: n <= form.difficulty ? 'var(--red)' : 'var(--panel)',
                            color: n <= form.difficulty ? 'white' : 'var(--muted)',
                            fontFamily:"'Bebas Neue',sans-serif",fontSize:16,
                            border: `1px solid ${n <= form.difficulty ? 'var(--red)' : 'var(--border)'}`,
                            transition:'all 0.15s'}}>
                          {n}
                        </div>
                      ))}
                    </div>
                    <span style={{fontSize:11,color:'var(--muted)',fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,whiteSpace:'nowrap'}}>BRUTAL</span>
                  </div>
                  <div style={{fontSize:12,color:'var(--muted)',marginTop:6,fontStyle:'italic'}}>
                    {({1:"Easy — light reps, low intensity, FNG-friendly",2:"Moderate — standard reps, steady pace",3:"Challenging — higher reps, faster pace",4:"Hard — heavy reps, minimal rest, PAX will feel it",5:"Brutal — max reps, burpee-heavy, coupon-loaded punishment"})[form.difficulty]}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Notes / Special Requests</label>
                  <textarea className="form-textarea" placeholder="e.g. heavy on partner work, avoid burpees, mental health theme..." value={form.notes || ""} onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
                </div>
                <div className="full-width">
                  <button className="btn-generate" onClick={generate} disabled={loading}>
                    {loading ? "GENERATING..." : "GENERATE BEATDOWN"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="output" ref={outputRef}>
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
                <div className="loading-phrase" key={loadingPhrase}>{loadingPhrase}</div>
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

                {/* Actions + Map */}
                <div style={{display:'flex',alignItems:'stretch',gap:16,marginTop:16}}>
                  <div style={{flex:1}}>
                    {form.location && <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase',marginBottom:6}}>📍 {form.location}</div>}
                    <div className="weinke-actions" style={{marginTop:0}}>
                      <button className="btn-pdf" onClick={downloadPdf}>📄 Download PDF</button>
                      <button className="btn-pdf" onClick={downloadDocx}>📝 Download .docx</button>
                    </div>
                  </div>
                  {(form.location || aos.find(a => (a.locationName || a.name) === form.ao)?.lat) && (
                    <div className="output-map-wrap">
                      <div ref={outputMapRef} style={{width:'100%',height:'100%'}} />
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="tabs">
                  {[["weinke","🪖 Weinke"],["eval","📊 Evaluation"],["playlist","🎵 Playlist"],["preblast","📣 Pre-Blast"]].map(([id,label]) => (
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
                            {(() => {
                              // Detect repeating sequences and collapse them
                              const exercises = block.exercises || [];
                              const rendered = [];
                              let i = 0;
                              while (i < exercises.length) {
                                // Try to find a repeating sequence starting at i
                                let bestLen = 0, bestCount = 0;
                                for (let seqLen = 1; seqLen <= Math.floor((exercises.length - i) / 2); seqLen++) {
                                  let count = 1;
                                  while (i + count * seqLen + seqLen <= exercises.length) {
                                    let match = true;
                                    for (let k = 0; k < seqLen; k++) {
                                      if (exercises[i + k].name !== exercises[i + count * seqLen + k].name) { match = false; break; }
                                    }
                                    if (match) count++; else break;
                                  }
                                  if (count > 1 && seqLen * count > bestLen * bestCount) { bestLen = seqLen; bestCount = count; }
                                }
                                if (bestCount > 1) {
                                  // Render the sequence once, then a repeat badge
                                  for (let k = 0; k < bestLen; k++) {
                                    const ex = exercises[i + k];
                                    rendered.push(
                                      <div className="exercise-row" key={`${i}-${k}`}>
                                        <div>
                                          <div className="exercise-name">
                                            {(() => { const url = getExiconUrl(ex.name); return url ? <a href={url} className="exercise-link" target="_blank" rel="noopener noreferrer" title="View in F3 Exicon">{ex.name}</a> : ex.name; })()}
                                            {ex.cadence === "IC" && <span className="ic-badge">IC</span>}
                                            {ex.cadence === "OYO" && <span className="oyo-badge">OYO</span>}
                                          </div>
                                          {renderNote(ex.note)}
                                        </div>
                                        <div className="exercise-reps">{ex.reps}</div>
                                      </div>
                                    );
                                  }
                                  rendered.push(
                                    <div key={`repeat-${i}`} style={{textAlign:'center',padding:'8px 0',fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:3,color:'var(--gold)',background:'rgba(201,168,76,0.06)',borderLeft:'3px solid var(--gold)',margin:'4px 0'}}>
                                      REPEAT x{bestCount}
                                    </div>
                                  );
                                  i += bestLen * bestCount;
                                } else {
                                  const ex = exercises[i];
                                  rendered.push(
                                    <div className="exercise-row" key={i}>
                                      <div>
                                        <div className="exercise-name">
                                          {(() => { const url = getExiconUrl(ex.name); return url ? <a href={url} className="exercise-link" target="_blank" rel="noopener noreferrer" title="View in F3 Exicon">{ex.name}</a> : ex.name; })()}
                                          {ex.cadence === "IC" && <span className="ic-badge">IC</span>}
                                          {ex.cadence === "OYO" && <span className="oyo-badge">OYO</span>}
                                        </div>
                                        {renderNote(ex.note)}
                                      </div>
                                      <div className="exercise-reps">{ex.reps}</div>
                                    </div>
                                  );
                                  i++;
                                }
                              }
                              return rendered;
                            })()}
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
                    <div className="section-label">{form.duration}-Min Playlist</div>
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
                                  <div className="playlist-title"><a href={`https://open.spotify.com/search/${encodeURIComponent(track.title + " " + track.artist)}`} target="_blank" rel="noopener noreferrer">{track.title}</a></div>
                                  <div className="playlist-artist">{track.artist}</div>
                                </div>
                                <div className="playlist-spotify"><a href={`https://open.spotify.com/search/${encodeURIComponent(track.title + " " + track.artist)}`} target="_blank" rel="noopener noreferrer" title="Find on Spotify"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg></a></div>
                                <div className="playlist-duration">{track.duration}</div>
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                  </div>
                )}

                {/* EVALUATION TAB */}
                {activeTab === "eval" && (() => {
                  const ev = evaluateWorkout(result);
                  if (!ev) return <div style={{color:'var(--muted)',padding:24}}>No data to evaluate</div>;
                  const maxGroup = Math.max(...Object.values(ev.groupCounts), 1);
                  return (
                    <div style={{display:'flex',flexDirection:'column',gap:20,marginTop:24}}>
                      {/* Overview Stats */}
                      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                        {[
                          ["Exercises", ev.totalExercises],
                          ["Unique", `${ev.uniqueCount} (${ev.varietyRatio}%)`],
                          ["Blocks", ev.blockCount],
                          ["Duration", `${ev.totalMinutes} min`],
                        ].map(([label, value]) => (
                          <div key={label} style={{background:'var(--panel)',border:'1px solid var(--border)',padding:'14px 12px',textAlign:'center'}}>
                            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:'var(--gold)'}}>{value}</div>
                            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>{label}</div>
                          </div>
                        ))}
                      </div>

                      {/* IC / OYO Balance */}
                      <div>
                        <div className="section-label">Cadence Balance</div>
                        <div style={{display:'flex',height:28,borderRadius:4,overflow:'hidden',marginTop:8}}>
                          {ev.icCount > 0 && <div style={{flex:ev.icCount,background:'var(--steel)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,color:'white'}}>IC {ev.icCount}</div>}
                          {ev.oyoCount > 0 && <div style={{flex:ev.oyoCount,background:'var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,color:'var(--black)'}}>OYO {ev.oyoCount}</div>}
                          {ev.totalExercises - ev.icCount - ev.oyoCount > 0 && <div style={{flex:ev.totalExercises - ev.icCount - ev.oyoCount,background:'var(--panel)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,color:'var(--muted)'}}>OTHER {ev.totalExercises - ev.icCount - ev.oyoCount}</div>}
                        </div>
                      </div>

                      {/* Muscle Group Distribution */}
                      <div>
                        <div className="section-label">Muscle Group Distribution</div>
                        <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
                          {Object.entries(ev.groupCounts).filter(([,v]) => v > 0).sort((a,b) => b[1] - a[1]).map(([group, count]) => (
                            <div key={group} style={{display:'grid',gridTemplateColumns:'120px 1fr 32px',gap:8,alignItems:'center'}}>
                              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,letterSpacing:1,color:'var(--text)'}}>{group}</div>
                              <div style={{height:16,background:'var(--panel)',borderRadius:2,overflow:'hidden'}}>
                                <div style={{width:`${(count/maxGroup)*100}%`,height:'100%',background: ({
                                  'Chest':'var(--steel)','Shoulders':'#5B9BD5','Arms':'#7EB8DA','Back':'#2E86C1',
                                  'Core':'var(--gold)','Plank':'#D4AC0D',
                                  'Legs':'var(--red)',
                                  'Cardio':'var(--success)','Full Body':'#9B59B6',
                                  'Coupon Work':'#E67E22','Warmup':'#95A5A6'
                                })[group] || 'var(--muted)',borderRadius:2,transition:'width 0.3s'}} />
                              </div>
                              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:'var(--muted)',textAlign:'right'}}>{count}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Block Timeline */}
                      <div>
                        <div className="section-label">Block Timeline</div>
                        <div style={{display:'flex',gap:2,marginTop:8,height:40}}>
                          {result.blocks?.map((block, i) => {
                            const dur = ev.blockDurations[i] || 1;
                            return (
                              <div key={i} title={`${block.name} — ${block.duration}`} style={{flex:dur,background:`hsl(${40 + i * 30}, 60%, ${35 + i * 5}%)`,borderRadius:3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,color:'white',overflow:'hidden',whiteSpace:'nowrap',padding:'0 4px',cursor:'default'}}>
                                {block.name?.length > 12 ? block.name.slice(0, 12) + "…" : block.name}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div>
                        <div className="section-label">Estimated Difficulty</div>
                        <div style={{display:'flex',gap:6,marginTop:8}}>
                          {[1,2,3,4,5].map(n => (
                            <div key={n} style={{width:36,height:36,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:18,
                              background: n <= ev.difficulty ? 'var(--red)' : 'var(--panel)',
                              color: n <= ev.difficulty ? 'white' : 'var(--muted)',
                              border: `1px solid ${n <= ev.difficulty ? 'var(--red)' : 'var(--border)'}`}}>
                              {n}
                            </div>
                          ))}
                          <div style={{display:'flex',alignItems:'center',marginLeft:8,fontFamily:"'Barlow',sans-serif",fontSize:13,color:'var(--muted)',fontStyle:'italic'}}>
                            {ev.difficulty <= 2 ? "Light workout — good for FNGs" : ev.difficulty <= 3 ? "Moderate — solid standard beatdown" : ev.difficulty <= 4 ? "Hard — PAX will feel this one" : "Brutal — bring extra water"}
                          </div>
                        </div>
                      </div>

                      {/* Variety */}
                      <div>
                        <div className="section-label">Exercise Variety</div>
                        <div style={{display:'flex',alignItems:'center',gap:12,marginTop:8}}>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:'var(--gold)'}}>{ev.varietyRatio}%</div>
                          <div style={{fontFamily:"'Barlow',sans-serif",fontSize:13,color:'var(--muted)'}}>
                            {ev.uniqueCount} unique exercises out of {ev.totalExercises} total
                            {ev.repeatCount > 0 && ` · ${ev.repeatCount} repeated`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

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

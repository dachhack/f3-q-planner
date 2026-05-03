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
    padding: 28px 20px 24px;
  }
  .header-inner {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    text-align: center;
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
    max-height: 5000px;
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
  .form-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
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
    gap: 8px 16px;
    padding: 10px 20px;
    border-bottom: 1px solid rgba(42,48,64,0.5);
    align-items: start;
  }
  @media (max-width: 600px) {
    .exercise-row {
      grid-template-columns: 1fr;
      gap: 4px;
    }
    .exercise-reps { text-align: left !important; }
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

  /* ── INFO BUTTON + MODAL ── */
  .info-btn {
    position: fixed; bottom: 20px; right: 20px; z-index: 1000;
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--gold); color: var(--black); border: none;
    font-family: 'Bebas Neue', sans-serif; font-size: 20px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4); transition: transform 0.15s;
  }
  .info-btn:hover { transform: scale(1.1); }
  .info-overlay {
    position: fixed; inset: 0; z-index: 2000;
    background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .info-modal {
    background: var(--panel); border: 1px solid var(--border); border-radius: 8px;
    max-width: 420px; width: 100%; padding: 32px; position: relative;
  }
  .info-close {
    position: absolute; top: 12px; right: 16px; background: none; border: none;
    color: var(--muted); font-size: 20px; cursor: pointer;
  }
  .info-close:hover { color: var(--text); }

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
  .tabs { display: flex; gap: 2px; margin-bottom: 24px; border-bottom: 1px solid var(--border); overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .tab {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 10px 14px;
    cursor: pointer;
    color: var(--muted);
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    flex-shrink: 0;
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
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  @media (max-width: 700px) {
    .cot-options { grid-template-columns: 1fr; }
    .weinke-header { flex-direction: column; gap: 16px; }
    .weinke-meta { flex-wrap: wrap; }
    .actions-map-row { flex-direction: column !important; }
    .output-map-wrap { width: 100% !important; height: 160px !important; }
  }

  @media print {
    body { background: white !important; color: #000 !important; font-size: 12px !important; }
    .app { background: white !important; background-image: none !important; }
    .header, .form-panel, .tabs, .loading, .empty-state, .btn-pdf, .weinke-actions, .copy-btn, .info-btn, .output-map-wrap, .actions-map-row { display: none !important; }
    .main { display: block !important; padding: 0 !important; max-width: 100% !important; }
    .output { padding: 0 !important; }
    .weinke-header { background: white !important; border: 2px solid #000 !important; padding: 16px !important; }
    .weinke-title { color: #000 !important; font-size: 24px !important; }
    .weinke-meta-label { color: #555 !important; font-weight: 700 !important; }
    .weinke-meta-value { color: #000 !important; font-weight: 700 !important; }
    .block { background: white !important; border: 1px solid #000 !important; break-inside: avoid; margin-bottom: 8px !important; }
    .block-header { background: #eee !important; }
    .block-name { color: #000 !important; font-weight: 700 !important; }
    .block-time { color: #000 !important; font-weight: 700 !important; }
    .block-theme { color: #333 !important; }
    .exercise-name { color: #000 !important; font-weight: 600 !important; }
    .exercise-link { color: #000 !important; border-bottom: none !important; text-decoration: none !important; }
    .exercise-reps { color: #000 !important; font-weight: 600 !important; }
    .exercise-note { color: #333 !important; }
    .ic-badge, .oyo-badge { border-color: #000 !important; color: #000 !important; background: transparent !important; font-weight: 700 !important; }
    .pace-table th { background: #000 !important; color: white !important; }
    .pace-table td { color: #000 !important; border-bottom: 1px solid #ccc !important; }
    .cot-card { background: #f5f5f5 !important; border: 1px solid #000 !important; }
    .cot-label { color: #000 !important; font-weight: 700 !important; }
    .cot-text { color: #111 !important; }
    .section-label { color: #000 !important; font-weight: 700 !important; }
    .playlist-section, .preblast-section { display: none !important; }
  }
`;

export default function F3QPlanner() {
  const [form, setForm] = useState({
    q: "", ao: "", region: "", location: "", date: "", time: "5:30 AM",
    theme: "", equipment: [], terrain: [], formats: [], duration: "45", complexity: 3, difficulty: 3, pace: 3,
    playlistGenres: [], playlistDeepCuts: false, manYoga: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [weather, setWeather] = useState(null);
  const [beatdownCount, setBeatdownCount] = useState(() => parseInt(localStorage.getItem("f3_beatdown_count") || "0"));
  const [globalCount, setGlobalCount] = useState(0);

  // Fetch global beatdown count on mount
  useEffect(() => {
    fetch("/api/counter").then(r => r.json()).then(d => setGlobalCount(d.count || 0)).catch(() => {});
  }, []);
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
  const [showInfo, setShowInfo] = useState(false);
  // Save/Load
  const [savedBeatdowns, setSavedBeatdowns] = useState(() => {
    try { return JSON.parse(localStorage.getItem("f3_saved_beatdowns") || "[]"); } catch { return []; }
  });
  const [showSaved, setShowSaved] = useState(false);
  // Backblast
  const [bbPax, setBbPax] = useState("");
  const [bbPreRuck, setBbPreRuck] = useState("");
  const [bbExDone, setBbExDone] = useState({});
  const [bbNotes, setBbNotes] = useState("");
  const [bbCopied, setBbCopied] = useState(false);
  const [bbFngCount, setBbFngCount] = useState(0);
  const [bbFngNames, setBbFngNames] = useState("");
  const [bbDownrange, setBbDownrange] = useState("");
  // PAX Roster
  const [paxRoster, setPaxRoster] = useState(() => {
    try { return JSON.parse(localStorage.getItem("f3_pax_roster") || "[]"); } catch { return []; }
  });
  const [bbSelectedPax, setBbSelectedPax] = useState(new Set());
  const [showRosterMgmt, setShowRosterMgmt] = useState(false);
  const [newPaxName, setNewPaxName] = useState("");
  const [rosterCopied, setRosterCopied] = useState(false);

  const savePaxRoster = (roster) => {
    const sorted = [...new Set(roster.map(n => n.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    setPaxRoster(sorted);
    localStorage.setItem("f3_pax_roster", JSON.stringify(sorted));
  };

  // Auto-add names to roster from Q field and backblast PAX entries
  const addToRoster = (names) => {
    const newNames = names.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    if (newNames.length === 0) return;
    const merged = [...new Set([...paxRoster, ...newNames])];
    if (merged.length > paxRoster.length) savePaxRoster(merged);
  };

  // Sync selected PAX to bbPax text
  useEffect(() => {
    if (bbSelectedPax.size > 0) {
      setBbPax([...bbSelectedPax].sort((a, b) => a.localeCompare(b)).join(", "));
    }
  }, [bbSelectedPax]);

  const togglePaxSelection = (name) => {
    setBbSelectedPax(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const shareRoster = () => {
    navigator.clipboard.writeText(paxRoster.join(", "));
    setRosterCopied(true);
    setTimeout(() => setRosterCopied(false), 2000);
  };

  const importRoster = () => {
    const input = prompt("Paste a comma-separated list of F3 names:");
    if (input) addToRoster(input);
  };

  const [isSaved, setIsSaved] = useState(false);

  const saveBeatdown = () => {
    if (!result) return;
    const entry = { id: Date.now(), form: {...form}, result, savedAt: new Date().toISOString() };
    const updated = [entry, ...savedBeatdowns].slice(0, 50);
    setSavedBeatdowns(updated);
    localStorage.setItem("f3_saved_beatdowns", JSON.stringify(updated));
    setIsSaved(true);
  };

  const loadBeatdown = (entry) => {
    setForm(entry.form);
    setResult(entry.result);
    setBbExDone({});
    setBbPax("");
    setBbPreRuck("");
    setBbNotes("");
    setShowSaved(false);
    setActiveTab("weinke");
  };

  const deleteBeatdown = (id) => {
    const updated = savedBeatdowns.filter(b => b.id !== id);
    setSavedBeatdowns(updated);
    localStorage.setItem("f3_saved_beatdowns", JSON.stringify(updated));
  };

  const clearAllBeatdowns = () => {
    if (!confirm("Delete all saved beatdowns? This cannot be undone.")) return;
    setSavedBeatdowns([]);
    localStorage.removeItem("f3_saved_beatdowns");
  };

  const [shareCopied, setShareCopied] = useState(false);
  const shareBeatdown = () => {
    if (!result) return;
    try {
      const shareData = { form: {...form}, result };
      const json = JSON.stringify(shareData);
      const encoded = btoa(unescape(encodeURIComponent(json)));
      const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (e) {
      // If URL is too long, fall back to copying just the weinke text
      const text = `${result.theme}\n${result.tagline}\nAO: ${form.ao} | Q: ${form.q} | ${form.date}\n\n` +
        (result.blocks || []).map(b => `${b.name} (${b.duration})\n` + (b.exercises || []).map(e => `  ${e.name} — ${e.reps}`).join("\n")).join("\n\n");
      navigator.clipboard.writeText(text);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  // Load shared beatdown from URL hash on mount
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith("#share=")) {
        const encoded = hash.slice(7);
        const json = decodeURIComponent(escape(atob(encoded)));
        const data = JSON.parse(json);
        if (data.form) setForm(data.form);
        if (data.result) setResult(data.result);
        window.location.hash = "";
      }
    } catch (e) { /* ignore bad share links */ }
  }, []);

  const generateBackblast = () => {
    if (!result) return "";
    const allEx = result.blocks?.flatMap(b => (b.exercises || []).map(e => ({ ...e, block: b.name }))) || [];
    const doneExercises = allEx.filter((_, i) => bbExDone[i] !== false);
    const paxList = bbPax.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    const preRuckList = bbPreRuck.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    const fngNames = bbFngNames.split(/[,\n]/).map(s => s.trim()).filter(Boolean);

    let bb = `${result.theme} – ${form.date || "N/A"}\n`;
    bb += `AO: ${form.ao || "N/A"}\n`;
    bb += `QiC: ${form.q || "N/A"}\n`;
    bb += `Pax Count: ${paxList.length}\n`;
    bb += `Pax List: ${paxList.join(", ") || "N/A"}\n`;
    bb += `FNG Count: ${bbFngCount}\n`;
    if (fngNames.length > 0) bb += `FNG Names: ${fngNames.join(", ")}\n`;
    bb += `Downrange: ${bbDownrange || ""}\n`;
    if (preRuckList.length > 0) bb += `Pre-Ruck/Run: ${preRuckList.join(", ")}\n`;

    // Warmup block
    const warmupBlock = result.blocks?.find(b => (b.name || "").toLowerCase().includes("warm"));
    if (warmupBlock) {
      bb += `\n`;
      const warmupExercises = (warmupBlock.exercises || []).filter((_, i) => {
        const globalIdx = allEx.findIndex(e => e === warmupBlock.exercises[i] || (e.name === warmupBlock.exercises[i]?.name && e.block === warmupBlock.name));
        return bbExDone[globalIdx] !== false;
      });
      for (const ex of warmupBlock.exercises || []) {
        bb += `${ex.name} ${ex.reps}\n`;
      }
    }

    // The Thang
    bb += `\nThe Thang:\n`;
    let currentBlock = "";
    for (const ex of doneExercises) {
      if (ex.block !== currentBlock && !(ex.block || "").toLowerCase().includes("warm") && !(ex.block || "").toLowerCase().includes("cot")) {
        currentBlock = ex.block;
        bb += `\n${currentBlock}\n`;
      }
      if (!(ex.block || "").toLowerCase().includes("warm") && !(ex.block || "").toLowerCase().includes("cot")) {
        bb += `${ex.name} ${ex.reps}\n`;
      }
    }

    if (bbNotes) bb += `\n${bbNotes}\n`;
    return bb;
  };

  const copyBackblast = () => {
    // Auto-add all PAX + FNG names to roster for future use
    if (bbPax) addToRoster(bbPax);
    if (bbFngNames) addToRoster(bbFngNames);
    navigator.clipboard.writeText(generateBackblast());
    setBbCopied(true);
    setTimeout(() => setBbCopied(false), 2000);
  };

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
    "Googling 'is 5:30 AM even real'",
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
    "Googling 'lightest cinder block'",
    "Monkey Humpers again. This is starting to get weird.",
    "Let's just skip straight to Coffeeteria",
    "Enjoying the awkward silence after Woody says something",
    "Really glad Woody is here to balance out Sweep3r",
    "5 reps plus 5 'c'mon you wimps!' is a Woody set of 10",
    "It might just sound like a fart to you, but it's really Woody saying, 'Help me I'm lonely'",
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

  const placeMarker = (map, lat, lng, label, mRef, zoom = 15) => {
    if (mRef.current) mRef.current.remove();
    map.setView([lat, lng], zoom);
    mRef.current = window.L.marker([lat, lng]).addTo(map);
  };

  // Output map: show AO location in the generated weinke
  useEffect(() => {
    if (!result || !window.L) return;
    const aoObj = aos.find(a => (a.locationName || a.name) === form.ao);
    const lat = aoObj?.lat;
    const lng = aoObj?.lon || aoObj?.lng;
    const initMap = (mlat, mlng) => {
      const el = outputMapRef.current;
      if (!el) return;
      // Destroy old instance if exists (handles re-generation)
      if (outputMapInstanceRef.current) {
        outputMapInstanceRef.current.remove();
        outputMapInstanceRef.current = null;
      }
      outputMapInstanceRef.current = window.L.map(el, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false }).setView([mlat, mlng], 14);
      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(outputMapInstanceRef.current);
      window.L.marker([mlat, mlng]).addTo(outputMapInstanceRef.current);
      // Force size recalculation after render
      setTimeout(() => outputMapInstanceRef.current?.invalidateSize(), 100);
    };
    // Wait for the DOM to render the map container
    const timer = setTimeout(() => {
      if (lat && lng) {
        initMap(lat, lng);
      } else if (form.location) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location)}&limit=1`)
          .then(r => r.json())
          .then(data => { if (data.length > 0) initMap(parseFloat(data[0].lat), parseFloat(data[0].lon)); })
          .catch(() => {});
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [result, aos, form.ao, form.location]);

  // Render exercise notes — split numbered lists and long descriptions
  const renderNote = (note) => {
    if (!note) return null;
    // Extract numbered items from anywhere in the note (e.g. "111 Merkins, 222 Squats, 333 LBCs")
    const numberedItems = note.match(/\d+\s+[A-Z][^,;.]*/g);
    if (numberedItems && numberedItems.length >= 2) {
      // Split into description (non-numbered part) and the numbered list
      const descParts = note.split(/\d+\s+[A-Z]/)[0].trim().replace(/[,;:]\s*$/, '');
      return (
        <div className="exercise-note">
          {descParts && <div style={{marginBottom:4}}>{descParts}</div>}
          {numberedItems.map((item, i) => (
            <div key={i} style={{paddingLeft:8,borderLeft:'2px solid var(--border)',marginTop: i > 0 ? 3 : 0}}>{item.trim()}</div>
          ))}
        </div>
      );
    }
    // Long notes: split on sentence boundaries for readability
    if (note.length > 100) {
      const sentences = note.split(/\.\s+/).filter(s => s.trim().length > 0);
      if (sentences.length >= 2) {
        return (
          <div className="exercise-note">
            {sentences.map((s, i) => <div key={i} style={{marginTop: i > 0 ? 3 : 0}}>{s.trim()}{s.endsWith('.') ? '' : '.'}</div>)}
          </div>
        );
      }
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

    // Muscle group categorization — pre-classify ALL exicon exercises
    // Description keyword patterns (checked against exercise descriptions)
    const descPatterns = {
      "Chest": /\b(merkin|push[-\s]?up|pushup|chest|pec|press.*floor|bench|chest press|coupon press)\b/i,
      "Shoulders": /\b(shoulder|overhead|press(?!.*(chest|floor|bench|coupon))|military|delt|lateral raise|front raise|arnold|blocktanamo)\b/i,
      "Arms": /\b(curl|bicep|tricep|skull crush|dip(?!.*plank)|kickback|hammer curl|arm\b|coupon curl)\b/i,
      "Back": /\b(row|lat |pull[-\s]?up|pullup|superman|reverse fly|lawn mower|deadlift|back(?!\s*pack)|bent.?over|coupon row)\b/i,
      "Core": /\b(core|abs|sit[-\s]?up|situp|crunch|oblique|flutter|lbc|v[-\s]?up|twist|scissor|leg raise|heels|wiper|freddie|mercury|american hammer|dolly|rosalita|pickle|j-lo|cockroach|boat|canoe|wwii|penguin|pretzel|mason)\b/i,
      "Plank": /\b(plank|peter parker(?!.*merkin)|body saw|hover)\b/i,
      "Legs": /\b(squat|lunge|leg(?!.*raise)|calf|calves|step[-\s]?up|box jump|quad|hamstring|glute|hip thrust|bridge|wall sit|al gore|chair|monkey hump|fire hydrant|donkey|pistol|goblet|sumo|split squat|bonnie|bobby hurley|smurf|farmer.*carry|carry|uhaul|ruck|zamperini)\b/i,
      "Cardio": /\b(run|sprint|jog|mosey|ssh|side straddle|jumping jack|high knee|butt kick|mountain climb|burner|shuffle|karaoke|broad jump|tuck jump|jump rope|seal jack|skater|bear crawl|indian run|lap|star jump|drag)\b/i,
      "Full Body": /\b(burpee|man.?maker|thruster|blockee|clean.?and.?press|turkish|devil press|cindy|murph)\b/i,
    };
    // Build a comprehensive lookup: exercise name → group
    const exGroupLookup = {};
    // Map exicon tags to groups — skip "Coupon" tag so coupon exercises get classified by actual muscle group
    const tagToGroup = { "Arms": "Arms", "Core": "Core", "Legs": "Legs", "Cardio": "Cardio", "Full Body": "Full Body", "Run": "Cardio", "Mary": "Core", "warmup": "Warmup", "Routine": "Full Body" };
    for (const ex of exicon) {
      const name = ex.name.toLowerCase().trim();
      // 1. Use tags if available
      let group = null;
      for (const tag of (ex.tags || [])) {
        if (tagToGroup[tag]) { group = tagToGroup[tag]; break; }
      }
      // 2. Check name against keyword patterns
      if (!group) {
        const nameAndDesc = ex.name + " " + (ex.desc || "");
        for (const [g, pattern] of Object.entries(descPatterns)) {
          if (pattern.test(ex.name)) { group = g; break; }
        }
        // 3. Check description against patterns
        if (!group && ex.desc) {
          for (const [g, pattern] of Object.entries(descPatterns)) {
            if (pattern.test(ex.desc)) { group = g; break; }
          }
        }
      }
      if (group) exGroupLookup[name] = group;
    }
    // Classify an exercise from the workout
    const classifyExercise = (exerciseName) => {
      const lower = (exerciseName || "").toLowerCase().trim();
      // 1. Exact exicon match
      if (exGroupLookup[lower]) return exGroupLookup[lower];
      // 2. Partial match — exercise name contains or is contained by an exicon entry
      for (const [eName, group] of Object.entries(exGroupLookup)) {
        if (lower.includes(eName) || eName.includes(lower)) return group;
      }
      // 3. Direct keyword pattern match on the exercise name itself
      for (const [g, pattern] of Object.entries(descPatterns)) {
        if (pattern.test(lower)) return g;
      }
      // 4. Coupon exercises — classify by the movement, not the equipment
      if (/coupon|block/i.test(lower)) {
        if (/press|merkin|push/i.test(lower)) return "Chest";
        if (/curl/i.test(lower)) return "Arms";
        if (/row/i.test(lower)) return "Back";
        if (/squat|lunge|swing/i.test(lower)) return "Legs";
        if (/overhead|shoulder|raise/i.test(lower)) return "Shoulders";
        if (/carry|farmer|ruck|drag/i.test(lower)) return "Legs";
        return "Full Body"; // generic coupon work = full body
      }
      // 5. Common F3 patterns
      if (/hold|static|iso/i.test(lower)) return "Legs";
      if (/stretch|warm|circle|michael phelps|weed pick|cherry pick|windmill|hillbill|imperial/i.test(lower)) return "Warmup";
      if (/partner|setup|mosey|grab|return|recover|switch/i.test(lower)) return "Cardio";
      if (/dora|round|set|circuit/i.test(lower)) return "Full Body";
      return "Other";
    };
    const snarkyOther = [
      "Pain", "Lasting Soreness", "Unsolicited Workout Advice", "Farting",
      "Curling Into Fetal Position", "Mumble Chatter", "Regret",
      "Questioning Life Choices", "Trying Not to Cry", "Mystery Meat",
      "Whatever This Is", "Suffering (General)", "Unidentified Gains",
      "Tantric Lovemaking", "Getting Lost in Your Eyes",
      "Twice the Recommended Prostate Exams", "That's What She Saids",
      "Cuddling", "Drama", "Sucking Air", "Demonstrating Proper Form",
      "Interpretive Dance", "Smoke Break", "Tickets to the Gun Show"
    ];
    const otherLabel = snarkyOther[Math.floor(Math.random() * snarkyOther.length)];
    const groupCounts = {};
    const groupOrder = ["Chest","Shoulders","Arms","Back","Core","Plank","Legs","Cardio","Full Body","Warmup", otherLabel];
    for (const g of groupOrder) groupCounts[g] = 0;
    for (const ex of allExercises) {
      const group = classifyExercise(ex.name);
      groupCounts[group === "Other" ? otherLabel : group] = (groupCounts[group === "Other" ? otherLabel : group] || 0) + 1;
    }

    // Duration estimate — calculate from actual exercises
    // Parse block durations from AI output
    const blockDurations = r.blocks.map(b => {
      const match = (b.duration || "").match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const aiTotalMinutes = blockDurations.reduce((a, b) => a + b, 0);

    // Estimate from exercises: ~30-45 sec per IC exercise, ~45-60 sec per OYO, transitions
    const estimateBlockTime = (block) => {
      let seconds = 0;
      for (const ex of (block.exercises || [])) {
        const repsStr = (ex.reps || "").toLowerCase();
        const nameStr = (ex.name || "").toLowerCase();
        const noteStr = (ex.note || "").toLowerCase();
        const repMatch = repsStr.match(/(\d+)/);
        const reps = repMatch ? parseInt(repMatch[1]) : 10;

        // Check for compound/long exercises first
        if (nameStr.includes("burpee mile") || noteStr.includes("burpee mile")) {
          seconds += 25 * 60; // ~25 min
        } else if (nameStr.includes("dora") || noteStr.includes("dora")) {
          seconds += 18 * 60; // ~18 min
        } else if ((nameStr.includes("11s") || nameStr.includes("7s") || nameStr.includes("9s")) && (noteStr.includes("run") || noteStr.includes("mosey"))) {
          seconds += 14 * 60; // ~14 min
        } else if (nameStr.includes("ring of fire") || noteStr.includes("ring of fire")) {
          seconds += 9 * 60; // ~9 min
        } else if (nameStr.includes("four corner") || noteStr.includes("four corner")) {
          seconds += 10 * 60; // ~10 min
        } else if (repsStr.includes("mile") || noteStr.includes("mile")) {
          seconds += 10 * 60; // ~10 min for a mile
        } else if (repsStr.includes("lap") || noteStr.includes("lap")) {
          seconds += 3 * 60; // ~3 min per lap
        } else if (repsStr.includes("second") || repsStr.includes("sec")) {
          seconds += reps;
        } else if (repsStr.includes("minute") || repsStr.includes("min")) {
          seconds += reps * 60;
        } else if (repsStr.includes("round")) {
          seconds += reps * 90; // ~90 sec per round
        } else if (nameStr.includes("burpee")) {
          seconds += reps * 6 + 5; // burpees are ~6 sec each
        } else if (nameStr.includes("run") || nameStr.includes("mosey") || nameStr.includes("sprint") || nameStr.includes("bear crawl")) {
          seconds += Math.max(reps * 3, 120); // running exercises take at least 2 min
        } else if (repsStr.includes("corner") || repsStr.includes("per corner")) {
          seconds += reps * 60 * 4; // per-corner timing
        } else if (ex.cadence === "IC") {
          seconds += reps * 2 + 5;
        } else {
          seconds += reps * 3 + 5;
        }
        // Transition between exercises (varies by pace)
        const paceTransition = {1: 60, 2: 35, 3: 20, 4: 12, 5: 8};
        seconds += paceTransition[form.pace] || 15;
      }
      return Math.ceil(seconds / 60);
    };

    const estimatedMinutes = r.blocks.reduce((sum, b) => sum + estimateBlockTime(b), 0);
    // Use the higher of AI estimate and exercise estimate, but cap at configured duration
    let totalMinutes = Math.max(aiTotalMinutes, estimatedMinutes);
    // If still seems off, try pace guide
    if (totalMinutes < 15 && r.paceGuide?.length > 0) {
      const lastPace = r.paceGuide[r.paceGuide.length - 1];
      const endMatch = (lastPace?.time || "").match(/(\d+)(?::|\s*–\s*(\d+))/);
      if (endMatch) {
        const endMin = endMatch[2] ? parseInt(endMatch[2]) : parseInt(endMatch[1]);
        if (endMin > totalMinutes) totalMinutes = endMin;
      }
    }
    // Final fallback: use the configured duration
    if (totalMinutes < 15) totalMinutes = parseInt(form.duration) || 45;

    // Difficulty estimate (1-5) — calibrated to match the 1-5 input scale
    const burpeeCount = allExercises.filter(e => (e.name || "").toLowerCase().includes("burpee")).length;
    const hardExercises = allExercises.filter(e => {
      const name = (e.name || "").toLowerCase();
      return ["burpee","man maker","thruster","blockee","devil press","clean and press","bear crawl","broad jump","tuck jump"].some(h => name.includes(h));
    }).length;
    const repsArr = allExercises.map(e => { const m = (e.reps || "").match(/(\d+)/); return m ? parseInt(m[1]) : 0; }).filter(r => r > 0);
    const avgRep = repsArr.length > 0 ? repsArr.reduce((a, b) => a + b, 0) / repsArr.length : 15;
    const maxRep = repsArr.length > 0 ? Math.max(...repsArr) : 15;
    const isometricCount = allExercises.filter(e => (e.reps || "").toLowerCase().includes("second") || (e.reps || "").toLowerCase().includes("hold")).length;
    const hardRatio = totalExercises > 0 ? hardExercises / totalExercises : 0;

    // Score each factor on a 1-5 scale, then average
    let repScore = avgRep <= 12 ? 1 : avgRep <= 15 ? 2 : avgRep <= 20 ? 3 : avgRep <= 25 ? 4 : 5;
    let hardScore = hardRatio <= 0 ? 1 : hardRatio <= 0.05 ? 2 : hardRatio <= 0.1 ? 3 : hardRatio <= 0.2 ? 4 : 5;
    let maxRepScore = maxRep <= 15 ? 1 : maxRep <= 20 ? 2 : maxRep <= 25 ? 3 : maxRep <= 30 ? 4 : 5;
    let volumeScore = totalExercises <= 15 ? 1 : totalExercises <= 20 ? 2 : totalExercises <= 28 ? 3 : totalExercises <= 35 ? 4 : 5;
    // Weighted average: reps matter most, then hard exercises, then peak intensity, then volume
    const difficulty = Math.min(5, Math.max(1, Math.round(
      repScore * 0.4 + hardScore * 0.25 + maxRepScore * 0.2 + volumeScore * 0.15
    )));

    return {
      totalExercises, icCount, oyoCount, uniqueCount, repeatCount,
      groupCounts, totalMinutes, blockCount: r.blocks.length,
      blockDurations, difficulty,
      varietyRatio: totalExercises > 0 ? Math.round((uniqueCount / totalExercises) * 100) : 0
    };
  };

  const equipment = ["Coupons / Blocks", "Bodyweight", "Resistance Bands", "Sandbags", "Pull-Up Bar", "Stairs / Bleachers", "Wall"];
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

    // Also search descriptions for equipment-specific exercises
    const equipKeywords = [];
    if (form.equipment.some(e => e.toLowerCase().includes("pull"))) equipKeywords.push("pull-up", "pull up", "pullup", "chin-up", "chin up", "hanging");
    if (form.equipment.some(e => e.toLowerCase().includes("stair") || e.toLowerCase().includes("bleacher"))) equipKeywords.push("stair", "step-up", "step up", "bleacher", "incline", "decline");
    if (form.equipment.some(e => e.toLowerCase().includes("wall"))) equipKeywords.push("wall", "balls to the wall", "derkin", "handstand");

    let exercisePool = exicon;
    if (relevantTags.length > 0 || equipKeywords.length > 0) {
      const tagged = exicon.filter(e => e.tags.some(t => relevantTags.includes(t)));
      const equipMatched = equipKeywords.length > 0 ? exicon.filter(e => {
        const text = (e.name + " " + (e.desc || "")).toLowerCase();
        return equipKeywords.some(k => text.includes(k));
      }) : [];
      const untagged = exicon.filter(e => e.tags.length === 0);
      exercisePool = [...new Map([...tagged, ...equipMatched, ...untagged.slice(0, 50)].map(e => [e.name, e])).values()];
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
- Pace (${form.pace}/5): ${form.pace <= 1 ? "RECOVERY pace. Include 45-60 second rest between exercises. Long transitions between blocks with stretching. Add 'recover' and 'shake it out' cues. Use fewer exercises per block. These are dudes in their 40s-50s working out before dawn — keep it chill." : form.pace === 2 ? "CASUAL pace. Include 30-45 second rest between exercises. Comfortable transitions. Room for mumble chatter. No rushing — this is the typical F3 beatdown pace where guys are talking smack between sets." : form.pace === 3 ? "STANDARD pace. ~20 second transitions. Keep it moving but PAX can catch their breath. Brief side conversations between exercises. Steady flow." : form.pace === 4 ? "PUSH pace. 10-15 second transitions. Less talking, more working. Q keeps calling exercises before PAX are fully recovered. Noticeably faster than usual." : "ALL OUT pace. 5-10 second transitions. Back-to-back exercises with barely time to breathe. Use AMRAP, Tabata, and EMOM to enforce pace. PAX will complain — that's the point."}
${form.manYoga ? `- Man Yoga (${form.manYoga}): ${form.manYoga === "Warmup" || form.manYoga === "Both" ? "Weave yoga poses INTO the warmup block alongside regular warmup exercises — not a separate block. Mix stretches with calisthenics." : ""} ${form.manYoga === "Cooldown" || form.manYoga === "Both" ? "Add a yoga cooldown block AFTER the last timed exercise block (does NOT count toward workout duration). This goes before COT." : ""} Poses: Downward Dog, Upward Dog, Warrior I, Warrior II, Pigeon Pose, Forward Fold, Low Lunge, Child's Pose, Cat-Cow, Cobra, Chair Pose, Tree Pose. Hold 15-30 sec each.` : ""}
- Extra notes: ${form.notes || "none"}

Use REAL F3 exercise names from the Exicon when possible. Here are exercises to draw from:
${exerciseNames}

Playlist: Build for men in their 40s & 50s. ${form.playlistGenres.length > 0 ? `Focus on these genres: ${form.playlistGenres.join(", ")}.` : "Mix classic rock, 90s hip-hop, and hard-hitting anthems."} ${form.playlistDeepCuts ? "IMPORTANT: DEEP CUTS ONLY. Do NOT use obvious greatest hits or overplayed songs. Pick B-sides, album tracks, lesser-known tracks by well-known artists, or tracks by lesser-known artists in the genre. Surprise the PAX with songs they haven't heard at every workout. No 'Eye of the Tiger', no 'Thunderstruck', no 'Lose Yourself' — go deeper." : "Vary the track selection — avoid defaulting to the same cliche workout songs every time (no Eye of the Tiger, no Thunderstruck unless the theme calls for it). Pick fresh tracks PAX will recognize but haven't heard at every beatdown."} Sequence to match the energy arc — warmup through finisher.`;
  };

  // Fetch weather for AO location + date at beatdown time
  const fetchWeather = async () => {
    const aoObj = aos.find(a => (a.locationName || a.name) === form.ao);
    const lat = aoObj?.lat;
    const lng = aoObj?.lon || aoObj?.lng;
    if (!lat || !lng || !form.date) return null;
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m,relative_humidity_2m&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&start_date=${form.date}&end_date=${form.date}`);
      const data = await res.json();
      if (!data.hourly) return null;
      // Parse start time to find the right hour (e.g. "5:30 AM" → 5)
      const timeStr = (form.time || "5:30 AM").toUpperCase();
      const match = timeStr.match(/(\d+)/);
      let hour = match ? parseInt(match[1]) : 5;
      if (timeStr.includes("PM") && hour !== 12) hour += 12;
      if (timeStr.includes("AM") && hour === 12) hour = 0;
      // Clamp to available hours
      const idx = Math.min(Math.max(hour, 0), (data.hourly.time?.length || 1) - 1);
      const codes = {0:"Clear",1:"Mostly Clear",2:"Partly Cloudy",3:"Overcast",45:"Foggy",48:"Foggy",51:"Light Drizzle",53:"Drizzle",55:"Heavy Drizzle",61:"Light Rain",63:"Rain",65:"Heavy Rain",71:"Light Snow",73:"Snow",75:"Heavy Snow",80:"Rain Showers",81:"Rain Showers",82:"Heavy Showers",95:"Thunderstorm",96:"Thunderstorm + Hail",99:"Thunderstorm + Hail"};
      return {
        temp: Math.round(data.hourly.temperature_2m[idx]),
        feelsLike: Math.round(data.hourly.apparent_temperature[idx]),
        precip: data.hourly.precipitation_probability[idx],
        condition: codes[data.hourly.weathercode[idx]] || "Unknown",
        wind: Math.round(data.hourly.windspeed_10m[idx]),
        humidity: data.hourly.relative_humidity_2m[idx],
        sunrise: data.daily?.sunrise?.[0]?.split("T")[1] || "",
        sunset: data.daily?.sunset?.[0]?.split("T")[1] || "",
        hour: `${hour}:00`,
      };
    } catch { return null; }
  };

  const generate = async () => {
    setFormCollapsed(true);
    setLoading(true);
    setError(null);
    // Auto-add Q name to roster
    if (form.q) addToRoster(form.q);
    setResult(null);
    setIsSaved(false);
    // Fetch weather
    const wx = await fetchWeather();
    setWeather(wx);
    try {
      const prompt = buildPrompt() + (wx ? `\n\nWeather at beatdown time (${form.time}): ${wx.condition}, ${wx.temp}°F (feels like ${wx.feelsLike}°F), wind ${wx.wind} mph, humidity ${wx.humidity}%, ${wx.precip}% chance of rain. Sunrise ${wx.sunrise}. Consider weather when planning — if hot (>85°F) mention hydration, if cold (<40°F) extend warmup, if rainy adjust for wet/slippery conditions.` : "");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
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
              // Increment beatdown counters
              const count = parseInt(localStorage.getItem("f3_beatdown_count") || "0") + 1;
              localStorage.setItem("f3_beatdown_count", String(count));
              setBeatdownCount(count);
              fetch("/api/counter", { method: "POST" }).then(r => r.json()).then(d => setGlobalCount(d.count || 0)).catch(() => {});
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
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: row.segment || "", size: 20, font: "Arial" })] })],
              borders: noBorders,
              width: { size: 5400, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: row.time || "", size: 20, bold: true, color: "C0392B", font: "Arial" })] })],
              borders: noBorders,
              width: { size: 3600, type: WidthType.DXA },
            }),
          ],
        })
      );
      sections.push(new Table({
        rows,
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [5400, 3600],
      }));
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
          <div className="header-inner">
            <div>
              <div className="header-badge">F3 NATION</div>
              <h1>Q <span>PLANNER</span></h1>
              <div className="header-sub">Beatdown Builder · Weinke Generator · Pre-Blast Creator</div>
              <div style={{marginTop:6,fontSize:11,color:'#666',fontFamily:'Barlow, sans-serif',letterSpacing:'0.5px'}}>
                v{__APP_VERSION__} · build {__BUILD_TIME__.slice(0, 10)}
              </div>
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
                    <input className="form-input" placeholder="5:30 AM" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} />
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
                  <label className="form-label">Man Yoga</label>
                  <div className="chips">
                    {["None", "Warmup", "Cooldown", "Both"].map(opt => (
                      <div key={opt} className={`chip ${(form.manYoga || "None") === opt ? "active" : ""}`}
                        onClick={() => setForm(f => ({...f, manYoga: opt === "None" ? "" : opt}))}>{opt}</div>
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
                  <label className="form-label">Pace <span style={{color:'var(--steel)',fontWeight:700}}>{form.pace}</span></label>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:11,color:'var(--muted)',fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,whiteSpace:'nowrap'}}>SLOW</span>
                    <div style={{display:'flex',gap:4,flex:1}}>
                      {[1,2,3,4,5].map(n => (
                        <div key={n} onClick={() => setForm(f => ({...f, pace: n}))}
                          style={{flex:1,height:32,borderRadius:4,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
                            background: n <= form.pace ? 'var(--steel)' : 'var(--panel)',
                            color: n <= form.pace ? 'white' : 'var(--muted)',
                            fontFamily:"'Bebas Neue',sans-serif",fontSize:16,
                            border: `1px solid ${n <= form.pace ? 'var(--steel)' : 'var(--border)'}`,
                            transition:'all 0.15s'}}>
                          {n}
                        </div>
                      ))}
                    </div>
                    <span style={{fontSize:11,color:'var(--muted)',fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,whiteSpace:'nowrap'}}>FAST</span>
                  </div>
                  <div style={{fontSize:12,color:'var(--muted)',marginTop:6,fontStyle:'italic'}}>
                    {({1:"Recovery day — lots of stretching, long rest, nobody's in a hurry",2:"Casual — plenty of mumble chatter time, comfortable transitions, the usual farting",3:"Standard — keep it moving, brief transitions, some side conversations allowed",4:"Push it — less talking more working, quick transitions, Q keeps the pressure on",5:"All gas no brakes — back-to-back exercises, minimal rest, somebody might puke"})[form.pace]}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Playlist Vibe</label>
                  <div className="chips">
                    {["Classic Rock","90s Hip-Hop","Hard Rock / Metal","EDM / Electronic","Country","Pop Anthems","Punk","R&B / Soul","Indie / Alt","Latin / Reggaeton","Movie Soundtracks"].map(g => (
                      <div key={g} className={`chip ${form.playlistGenres.includes(g) ? "active" : ""}`}
                        onClick={() => toggleChip("playlistGenres", g)}>{g}</div>
                    ))}
                  </div>
                  <div style={{marginTop:8,display:'flex',alignItems:'center',gap:10}}>
                    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color: form.playlistDeepCuts ? 'var(--gold)' : 'var(--muted)',fontFamily:"'Barlow',sans-serif"}}>
                      <input type="checkbox" checked={form.playlistDeepCuts} onChange={e => setForm(f => ({...f, playlistDeepCuts: e.target.checked}))}
                        style={{width:16,height:16,accentColor:'var(--gold)',cursor:'pointer'}} />
                      Deep Cuts Mode — skip the obvious hits, find hidden gems and B-sides
                    </label>
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
                  {savedBeatdowns.length > 0 && (
                    <button onClick={() => setShowSaved(s => !s)}
                      style={{width:'100%',marginTop:8,padding:'10px',background:'none',border:'1px solid var(--border)',color:'var(--muted)',cursor:'pointer',fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,letterSpacing:2,textTransform:'uppercase',transition:'all 0.15s'}}>
                      {showSaved ? "HIDE" : `SAVED BEATDOWNS (${savedBeatdowns.length})`}
                    </button>
                  )}
                </div>
                {showSaved && savedBeatdowns.length > 0 && (
                  <div className="full-width" style={{display:'flex',flexDirection:'column',gap:6}}>
                    {savedBeatdowns.map(b => (
                      <div key={b.id} style={{display:'flex',alignItems:'center',gap:8,background:'var(--dark)',border:'1px solid var(--border)',padding:'10px 12px',borderRadius:4}}>
                        <div style={{flex:1,cursor:'pointer'}} onClick={() => loadBeatdown(b)}>
                          <div style={{fontWeight:600,fontSize:14,color:'var(--text)'}}>{b.result?.theme || "Untitled"}</div>
                          <div style={{fontSize:12,color:'var(--muted)'}}>{b.form?.ao || ""} · {b.form?.date || ""} · Q: {b.form?.q || ""}</div>
                        </div>
                        <button onClick={() => deleteBeatdown(b.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16,padding:'4px 8px'}} title="Delete">x</button>
                      </div>
                    ))}
                    <button onClick={clearAllBeatdowns}
                      style={{marginTop:4,padding:'8px',background:'none',border:'1px solid var(--border)',color:'var(--red)',cursor:'pointer',fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:2,textTransform:'uppercase',borderRadius:4,transition:'all 0.15s'}}>
                      CLEAR ALL SAVED
                    </button>
                  </div>
                )}
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
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:3,color:"var(--muted)",marginBottom:4,display:'flex',alignItems:'center',gap:8}}>
                      F3 WEINKE
                      {isSaved
                        ? <span style={{fontSize:10,color:'var(--success)',letterSpacing:1}}>SAVED</span>
                        : <span style={{fontSize:10,color:'var(--red)',letterSpacing:1}}>UNSAVED</span>}
                    </div>
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

                {/* Weather */}
                {weather && (
                  <div style={{display:'flex',gap:16,padding:'10px 16px',background:'var(--dark)',border:'1px solid var(--border)',marginTop:8,borderRadius:4,alignItems:'center',flexWrap:'wrap'}}>
                    <div style={{fontSize:20}}>{weather.condition.includes("Rain") || weather.condition.includes("Drizzle") || weather.condition.includes("Shower") ? "🌧" : weather.condition.includes("Snow") ? "❄️" : weather.condition.includes("Thunder") ? "⛈" : weather.condition.includes("Cloud") || weather.condition.includes("Overcast") ? "☁️" : weather.condition.includes("Fog") ? "🌫" : "☀️"}</div>
                    <div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>At {form.time}</div>
                      <div style={{fontSize:14,color:'var(--text)',fontWeight:600}}>{weather.condition}</div>
                    </div>
                    <div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>Temp</div>
                      <div style={{fontSize:14,color:'var(--text)',fontWeight:600}}>{weather.temp}°F <span style={{fontSize:11,color:'var(--muted)',fontWeight:400}}>feels {weather.feelsLike}°</span></div>
                    </div>
                    <div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>Wind</div>
                      <div style={{fontSize:14,color:'var(--text)',fontWeight:600}}>{weather.wind} mph</div>
                    </div>
                    {weather.precip > 0 && (
                      <div>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>Rain</div>
                        <div style={{fontSize:14,color: weather.precip > 50 ? 'var(--red)' : 'var(--text)',fontWeight:600}}>{weather.precip}%</div>
                      </div>
                    )}
                    <div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>Sunrise</div>
                      <div style={{fontSize:14,color:'var(--gold)',fontWeight:600}}>{weather.sunrise}</div>
                    </div>
                  </div>
                )}

                {/* Actions + Map */}
                <div className="actions-map-row" style={{display:'flex',alignItems:'stretch',gap:16,marginTop:16}}>
                  <div style={{flex:1}}>
                    {form.location && <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase',marginBottom:6}}>📍 {form.location}</div>}
                    <div className="weinke-actions" style={{marginTop:0}}>
                      <button className="btn-pdf" onClick={downloadPdf}>📄 PDF</button>
                      <button className="btn-pdf" onClick={downloadDocx}>📝 .docx</button>
                      <button className="btn-pdf" onClick={saveBeatdown} disabled={isSaved}
                        style={{borderColor: isSaved ? 'var(--success)' : 'var(--border)', color: isSaved ? 'var(--success)' : 'var(--muted)', background: isSaved ? 'rgba(46,204,113,0.1)' : 'transparent'}}>
                        {isSaved ? "✓ Saved" : "💾 Save"}
                      </button>
                      <button className="btn-pdf" onClick={shareBeatdown} style={{borderColor:'var(--steel)',color:'var(--steel)'}}>{shareCopied ? "✓ Link Copied" : "🔗 Share"}</button>
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
                  {[["weinke","🪖 Weinke"],["eval","📊 Evaluation"],["playlist","🎵 Playlist"],["preblast","📣 Pre-Blast"],["backblast","📋 Backblast"]].map(([id,label]) => (
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
                                  'Warmup':'#95A5A6'
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

                {/* BACKBLAST TAB */}
                {activeTab === "backblast" && (
                  <div style={{marginTop:24,display:'flex',flexDirection:'column',gap:20}}>
                    <div className="section-label">Post-Workout Backblast</div>

                    {/* PAX Attendance — roster chips + manual entry */}
                    <div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                        <label style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:2,color:'var(--gold)',textTransform:'uppercase'}}>
                          PAX {bbSelectedPax.size > 0 && `(${bbSelectedPax.size})`}
                        </label>
                        <button onClick={() => setShowRosterMgmt(s => !s)}
                          style={{background:'none',border:'none',color:'var(--steel)',cursor:'pointer',fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>
                          {showRosterMgmt ? "DONE" : `MANAGE ROSTER (${paxRoster.length})`}
                        </button>
                      </div>
                      {/* Roster chips */}
                      {paxRoster.length > 0 && (
                        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
                          {paxRoster.map(name => {
                            const selected = bbSelectedPax.has(name);
                            return (
                              <div key={name} onClick={() => togglePaxSelection(name)}
                                style={{padding:'5px 10px',borderRadius:4,cursor:'pointer',fontSize:13,fontFamily:"'Barlow',sans-serif",
                                  background: selected ? 'var(--gold)' : 'var(--dark)',
                                  color: selected ? 'var(--black)' : 'var(--muted)',
                                  border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
                                  fontWeight: selected ? 600 : 400,
                                  transition:'all 0.1s'}}>
                                {name}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {/* Manual entry for names not in roster */}
                      <div style={{display:'flex',gap:8}}>
                        <input placeholder="Add PAX not in roster..." value={newPaxName}
                          onChange={e => setNewPaxName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter" && newPaxName.trim()) {
                              const names = newPaxName.split(/[,]/).map(s => s.trim()).filter(Boolean);
                              names.forEach(n => { addToRoster(n); setBbSelectedPax(prev => new Set([...prev, n])); });
                              setNewPaxName("");
                            }
                          }}
                          style={{flex:1,background:'var(--dark)',border:'1px solid var(--border)',borderRadius:4,padding:'8px 12px',color:'var(--text)',fontSize:13,fontFamily:"'Barlow',sans-serif"}} />
                        <button onClick={() => {
                          if (newPaxName.trim()) {
                            const names = newPaxName.split(/[,]/).map(s => s.trim()).filter(Boolean);
                            names.forEach(n => { addToRoster(n); setBbSelectedPax(prev => new Set([...prev, n])); });
                            setNewPaxName("");
                          }
                        }} style={{background:'var(--gold)',color:'var(--black)',border:'none',borderRadius:4,padding:'8px 14px',cursor:'pointer',fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:1}}>ADD</button>
                      </div>
                      {/* Roster Management */}
                      {showRosterMgmt && (
                        <div style={{marginTop:12,padding:12,background:'var(--dark)',border:'1px solid var(--border)',borderRadius:4}}>
                          <div style={{display:'flex',gap:8,marginBottom:8}}>
                            <button onClick={shareRoster} style={{flex:1,padding:'6px',background:'none',border:'1px solid var(--steel)',color:'var(--steel)',cursor:'pointer',fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:1,borderRadius:4}}>
                              {rosterCopied ? "COPIED" : "COPY ROSTER"}
                            </button>
                            <button onClick={importRoster} style={{flex:1,padding:'6px',background:'none',border:'1px solid var(--gold)',color:'var(--gold)',cursor:'pointer',fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:1,borderRadius:4}}>
                              IMPORT ROSTER
                            </button>
                            <button onClick={() => { if (confirm("Clear entire PAX roster?")) savePaxRoster([]); }}
                              style={{flex:1,padding:'6px',background:'none',border:'1px solid var(--red)',color:'var(--red)',cursor:'pointer',fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:1,borderRadius:4}}>
                              CLEAR ALL
                            </button>
                          </div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                            {paxRoster.map(name => (
                              <div key={name} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',background:'var(--panel)',border:'1px solid var(--border)',borderRadius:4,fontSize:12,color:'var(--text)'}}>
                                {name}
                                <button onClick={() => savePaxRoster(paxRoster.filter(n => n !== name))}
                                  style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:14,padding:0,lineHeight:1}}>×</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* FNG + Pre-Ruck/Run + Downrange */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                      <div>
                        <label style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:2,color:'var(--gold)',textTransform:'uppercase',display:'block',marginBottom:6}}>FNG Count</label>
                        <input type="number" min="0" value={bbFngCount} onChange={e => setBbFngCount(parseInt(e.target.value) || 0)}
                          style={{width:'100%',background:'var(--dark)',border:'1px solid var(--border)',borderRadius:4,padding:12,color:'var(--text)',fontSize:14,fontFamily:"'Barlow',sans-serif"}} />
                      </div>
                      <div>
                        <label style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:2,color:'var(--gold)',textTransform:'uppercase',display:'block',marginBottom:6}}>FNG Names</label>
                        <input value={bbFngNames} onChange={e => setBbFngNames(e.target.value)} placeholder="e.g. Sparkle, New Guy"
                          style={{width:'100%',background:'var(--dark)',border:'1px solid var(--border)',borderRadius:4,padding:12,color:'var(--text)',fontSize:14,fontFamily:"'Barlow',sans-serif"}} />
                      </div>
                    </div>
                    <div>
                      <label style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:2,color:'var(--gold)',textTransform:'uppercase',display:'block',marginBottom:6}}>Pre-Ruck / Pre-Run Participants</label>
                      <input value={bbPreRuck} onChange={e => setBbPreRuck(e.target.value)} placeholder="e.g. Button, Woody (optional)"
                        style={{width:'100%',background:'var(--dark)',border:'1px solid var(--border)',borderRadius:4,padding:12,color:'var(--text)',fontSize:14,fontFamily:"'Barlow',sans-serif"}} />
                    </div>
                    <div>
                      <label style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:2,color:'var(--gold)',textTransform:'uppercase',display:'block',marginBottom:6}}>Downrange</label>
                      <input value={bbDownrange} onChange={e => setBbDownrange(e.target.value)} placeholder="e.g. Prayers for Woody's M"
                        style={{width:'100%',background:'var(--dark)',border:'1px solid var(--border)',borderRadius:4,padding:12,color:'var(--text)',fontSize:14,fontFamily:"'Barlow',sans-serif"}} />
                    </div>

                    {/* Exercise Checklist */}
                    <div>
                      <label style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:2,color:'var(--gold)',textTransform:'uppercase',display:'block',marginBottom:6}}>Exercises — uncheck what was skipped</label>
                      {result.blocks?.map((block, bi) => (
                        <div key={bi} style={{marginBottom:12}}>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:2,color:'var(--steel)',padding:'6px 0',borderBottom:'1px solid var(--border)'}}>{block.name}</div>
                          {block.exercises?.map((ex, ei) => {
                            const idx = result.blocks.slice(0, bi).reduce((a, b) => a + (b.exercises?.length || 0), 0) + ei;
                            const checked = bbExDone[idx] !== false;
                            return (
                              <label key={idx} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 4px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                                <input type="checkbox" checked={checked} onChange={() => setBbExDone(prev => ({...prev, [idx]: !checked}))}
                                  style={{width:18,height:18,accentColor:'var(--gold)',cursor:'pointer'}} />
                                <span style={{flex:1,fontSize:14,color: checked ? 'var(--text)' : 'var(--muted)',textDecoration: checked ? 'none' : 'line-through'}}>{ex.name}</span>
                                <span style={{fontSize:12,color:'var(--muted)',fontFamily:"'Barlow Condensed',sans-serif"}}>{ex.reps}</span>
                              </label>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    <div>
                      <label style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:2,color:'var(--gold)',textTransform:'uppercase',display:'block',marginBottom:6}}>COT / Notes</label>
                      <textarea style={{width:'100%',minHeight:80,background:'var(--dark)',border:'1px solid var(--border)',borderRadius:4,padding:12,color:'var(--text)',fontSize:14,fontFamily:"'Barlow',sans-serif",resize:'vertical'}}
                        placeholder="Closing message, shout-outs, announcements..."
                        value={bbNotes} onChange={e => setBbNotes(e.target.value)} />
                    </div>

                    {/* Preview + Copy */}
                    <div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                        <label style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:2,color:'var(--gold)',textTransform:'uppercase'}}>Backblast Preview</label>
                        <button onClick={copyBackblast}
                          style={{background: bbCopied ? 'var(--success)' : 'var(--dark)',border:`1px solid ${bbCopied ? 'var(--success)' : 'var(--border)'}`,color: bbCopied ? 'white' : 'var(--muted)',fontSize:11,letterSpacing:1,padding:'4px 12px',cursor:'pointer',fontFamily:"'Barlow Condensed',sans-serif",textTransform:'uppercase',transition:'all 0.2s'}}>
                          {bbCopied ? "COPIED" : "COPY BACKBLAST"}
                        </button>
                      </div>
                      <div style={{background:'var(--dark)',border:'1px solid var(--border)',borderLeft:'3px solid var(--gold)',padding:16,whiteSpace:'pre-wrap',fontSize:13,lineHeight:1.7,color:'var(--text)',fontFamily:"'Barlow',sans-serif",maxHeight:400,overflow:'auto'}}>
                        {generateBackblast()}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Button */}
      <button className="info-btn" onClick={() => setShowInfo(true)} title="About this app">i</button>

      {/* Info Modal */}
      {showInfo && (
        <div className="info-overlay" onClick={() => setShowInfo(false)}>
          <div className="info-modal" onClick={e => e.stopPropagation()}>
            <button className="info-close" onClick={() => setShowInfo(false)}>x</button>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:'var(--gold)',letterSpacing:2,marginBottom:4}}>F3 Q Planner</div>
            <div style={{fontSize:13,color:'var(--muted)',marginBottom:20}}>AI-powered beatdown planner for F3 Q leaders</div>
            <div style={{display:'flex',flexDirection:'column',gap:12,fontSize:14}}>
              <div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>Built by</div>
                <div style={{color:'var(--text)',fontWeight:600}}>Button <span style={{color:'var(--muted)',fontWeight:400}}>— F3 Alpha</span></div>
              </div>
              <div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>Open Source</div>
                <a href="https://github.com/dachhack/f3-q-planner" target="_blank" rel="noopener noreferrer" style={{color:'var(--steel)',textDecoration:'none',borderBottom:'1px dotted var(--steel)'}}>github.com/dachhack/f3-q-planner</a>
              </div>
              <div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>License</div>
                <div style={{color:'var(--text)'}}>MIT — free to use, modify, and share</div>
              </div>
              <div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>Powered by</div>
                <div style={{color:'var(--text)'}}>Claude (Anthropic) + F3 Nation API</div>
              </div>
            </div>
            <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid var(--border)'}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:'var(--gold)',textTransform:'uppercase',marginBottom:8}}>Recent Changes</div>
              <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.8,maxHeight:200,overflowY:'auto'}}>
                {(__CHANGELOG__ || []).map((item, i) => <div key={i}>- {item}</div>)}
              </div>
            </div>
            <div style={{marginTop:16,paddingTop:12,borderTop:'1px solid var(--border)',fontSize:12,color:'var(--muted)',fontStyle:'italic',textAlign:'center'}}>
              Thanks to Buckshot, Tastykake, and the men of F3 Badapple for helping get this silly thing working.
              <div style={{marginTop:8}}>Aye! 🪖</div>
              <div style={{marginTop:10,fontSize:10,color:'#555',letterSpacing:1}}>
                Your Beatdowns: {beatdownCount} · Total Beatdowns Served: {globalCount}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

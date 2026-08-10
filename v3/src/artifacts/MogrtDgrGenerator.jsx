import React, { useState, useRef, useCallback } from "react";
import { Table2, SlidersHorizontal, Zap, Film, Download, Send, Check, Upload, FileDown, RotateCcw } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

/*
  AE MOGRT → DGR Video Generator
  Portfolio demo for an Adobe Forward Deployed Creative Technologist application.
  Editorial brand chrome (cream / ink / oxblood) wrapping a TORCHWERK campaign.
  Mock render against the Firefly Services Dynamic Graphics Render (DGR) schema.
*/

const CSS = `
.mogrt-root, .mogrt-root * { box-sizing: border-box; }
.mogrt-root {
  --paper:#f0e9dc; --paper-lt:#f7f2e9; --ink:#161513; --oxblood:#7d202b;
  --amber:#FFB000; --black:#0E0F12;
  background: var(--paper); color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
  padding: 28px; max-width: 1120px; margin: 0 auto;
  border: 1px solid var(--ink); box-shadow: 8px 8px 0 var(--ink);
}
.mogrt-root .serif { font-family: Georgia, "Times New Roman", serif; }
.eyebrow { font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--oxblood); font-weight: 700; }
.h1 { font-family: Georgia, serif; font-size: 34px; line-height: 1.02; margin: 8px 0 6px; font-weight: 400; }
.sub { font-size: 13px; color: #4a4640; max-width: 640px; line-height: 1.5; }
.rule { border: 0; border-top: 1px solid var(--ink); margin: 22px 0; }
.rule-thin { border: 0; border-top: 1px solid rgba(22,21,19,.18); margin: 0; }

.cols { display: flex; gap: 22px; align-items: flex-start; }
.col-a { flex: 1 1 58%; min-width: 0; }
.col-b { flex: 1 1 42%; min-width: 0; }
@media (max-width: 760px){ .cols{ flex-direction: column; } .mogrt-root{ padding:18px; box-shadow:5px 5px 0 var(--ink);} .h1{font-size:27px;} }

.panel-label { font-size: 10.5px; letter-spacing: .18em; text-transform: uppercase; color: var(--ink); font-weight: 700; display:flex; align-items:center; gap:7px; margin-bottom: 10px; }
.panel-label svg { width: 14px; height: 14px; }

.sheet { width: 100%; border-collapse: collapse; font-size: 12px; }
.sheet th { text-align: left; font-size: 9.5px; letter-spacing: .12em; text-transform: uppercase; color:#6a655d; font-weight:700; padding: 6px 8px; border-bottom: 1px solid var(--ink); }
.upload-row { display:flex; gap:10px; align-items:center; margin: 2px 0 10px; flex-wrap: wrap; }
.up-btn { display:inline-flex; align-items:center; gap:7px; font-size:11px; font-weight:700; letter-spacing:.04em; padding:7px 11px; border:1px solid var(--ink); background: var(--ink); color: var(--paper-lt); cursor:pointer; }
.up-btn:hover { background:#000; }
.up-btn svg { width:13px; height:13px; }
.up-link { display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:700; letter-spacing:.04em; padding:7px 9px; border:1px solid var(--ink); background:transparent; color: var(--ink); cursor:pointer; font-family:inherit; }
.up-link:hover { background: rgba(22,21,19,.06); }
.up-link svg { width:12px; height:12px; }
.up-msg { font-size:11px; padding:7px 10px; margin-bottom:10px; border:1px solid; }
.up-msg.ok { color:#2c4a2c; border-color:#2c4a2c; background: rgba(44,74,44,.06); }
.up-msg.err { color: var(--oxblood); border-color: var(--oxblood); background: rgba(125,32,43,.06); }
.sheet td { padding: 8px; border-bottom: 1px solid rgba(22,21,19,.14); vertical-align: top; }
.sheet tr.on { background: rgba(125,32,43,.05); }
.sheet tr { cursor: pointer; }
.sheet tr:hover td { background: rgba(22,21,19,.04); }
.sku { font-weight: 700; letter-spacing: .02em; }
.chk { width: 14px; height: 14px; border: 1px solid var(--ink); display:inline-flex; align-items:center; justify-content:center; }
.chk.on { background: var(--oxblood); border-color: var(--oxblood); }
.chk svg { width: 11px; height: 11px; color: var(--paper-lt); }

.ctrl-block { margin-bottom: 16px; }
.ctrl-title { font-size: 10.5px; letter-spacing:.14em; text-transform: uppercase; color:#6a655d; font-weight:700; margin-bottom: 7px; }
.opt-row { display: flex; gap: 8px; flex-wrap: wrap; }
.opt { border: 1px solid var(--ink); padding: 7px 11px; font-size: 12px; cursor: pointer; background: transparent; color: var(--ink); font-family: inherit; letter-spacing:.02em; }
.opt small { display:block; font-size: 9px; color:#8a847a; letter-spacing:.08em; margin-top:1px; }
.opt.on { background: var(--ink); color: var(--paper-lt); }
.opt.on small { color: #b8b0a3; }
.opt:hover:not(.on) { background: rgba(22,21,19,.06); }

.math { border: 1px solid var(--ink); background: var(--paper-lt); padding: 14px; margin-top: 4px; }
.math-row { display:flex; justify-content: space-between; align-items:baseline; font-size: 12px; padding: 4px 0; }
.math-row + .math-row { border-top: 1px solid rgba(22,21,19,.12); }
.math-row .k { color:#6a655d; letter-spacing:.04em; }
.math-row .v { font-family: Georgia, serif; font-size: 15px; }
.math-big { display:flex; justify-content: space-between; align-items:baseline; margin-top: 8px; padding-top: 10px; border-top: 1px solid var(--ink); }
.math-big .k { font-size: 10.5px; letter-spacing:.16em; text-transform:uppercase; font-weight:700; }
.math-big .v { font-family: Georgia, serif; font-size: 30px; color: var(--oxblood); line-height:1; }

.run { margin-top: 14px; width: 100%; border: 1px solid var(--ink); background: var(--oxblood); color: var(--paper-lt);
  font-family: Georgia, serif; font-size: 16px; letter-spacing:.02em; padding: 13px; cursor: pointer;
  box-shadow: 5px 5px 0 var(--ink); transition: transform .08s, box-shadow .08s; }
.run:hover:not(:disabled){ transform: translate(-1px,-1px); box-shadow: 6px 6px 0 var(--ink); }
.run:active:not(:disabled){ transform: translate(3px,3px); box-shadow: 2px 2px 0 var(--ink); }
.run:disabled { background: #b7ada0; cursor: default; box-shadow: 5px 5px 0 rgba(22,21,19,.4); }
.run.reset { background: transparent; color: var(--ink); }

/* pipeline */
.pipe { display:flex; align-items:stretch; gap:0; margin: 6px 0 2px; flex-wrap: wrap; }
.node { flex:1 1 0; min-width: 120px; border: 1px solid var(--ink); padding: 10px 11px; background: var(--paper-lt); position:relative; }
.node + .node { border-left: 0; }
@media (max-width:760px){ .node{ flex-basis: 45%; border-left:1px solid var(--ink) !important; margin-top:-1px; } }
.node .n-idx { font-size: 9px; letter-spacing:.14em; color:#9a9184; font-weight:700; }
.node .n-name { font-size: 11.5px; font-weight:700; margin-top:2px; letter-spacing:.01em; }
.node .n-meta { font-size: 9.5px; color:#8a847a; margin-top:2px; }
.node.active { background: var(--ink); }
.node.active .n-idx { color: var(--amber); }
.node.active .n-name, .node.active .n-meta { color: var(--paper-lt); }
.node.done::after { content:""; position:absolute; top:9px; right:10px; width:6px; height:6px; background: var(--oxblood); }
.node.active::after { content:""; position:absolute; top:9px; right:10px; width:6px; height:6px; background: var(--amber); animation: blink .7s steps(2) infinite; }
@keyframes blink { 50% { opacity:.2; } }

.progress { height: 4px; background: rgba(22,21,19,.12); margin-top: 12px; overflow:hidden; }
.progress > span { display:block; height:100%; background: var(--oxblood); transition: width .3s ease; }

/* outputs */
.out-head { display:flex; align-items:baseline; justify-content:space-between; margin-bottom: 14px; }
.out-head h2 { font-family: Georgia, serif; font-weight:400; font-size: 20px; margin:0; }
.out-head .count { font-size: 11px; letter-spacing:.14em; text-transform:uppercase; color:#6a655d; }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; }

.card { border: 1px solid var(--ink); background: var(--paper-lt); box-shadow: 5px 5px 0 var(--ink); animation: pop .35s ease both; }
@keyframes pop { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform:none;} }
.card .c-meta { display:flex; justify-content:space-between; align-items:center; padding: 7px 9px; border-bottom: 1px solid var(--ink); font-size: 9.5px; letter-spacing:.08em; }
.card .c-sku { font-weight:700; }
.card .c-tag { background: var(--ink); color: var(--paper-lt); padding: 1px 5px; letter-spacing:.1em; }
.card .c-foot { display:flex; justify-content:space-between; align-items:center; padding: 7px 9px; font-size: 10px; color:#6a655d; border-top:1px solid rgba(22,21,19,.16); }
.card .c-foot button { border:0; background:none; cursor:pointer; color: var(--oxblood); display:inline-flex; align-items:center; gap:4px; font-size:10px; font-family:inherit; font-weight:700; letter-spacing:.04em; padding:0; }
.card .c-foot svg { width:12px; height:12px; }
.card .c-foot button.json { color:#6a655d; }
.card .c-foot button:disabled { opacity:.38; cursor:default; }
.card .c-foot button:not(:disabled):hover { text-decoration: underline; }

/* poster (composited MOGRT frame) */
.frame { position: relative; overflow: hidden; background: var(--black); color:#fff; }
.frame .scene { position:absolute; inset:0; opacity:.9; }
.frame .glow { position:absolute; left:50%; top:52%; width:150%; height:70%; transform: translate(-50%,-50%);
  background: radial-gradient(ellipse at center, rgba(255,176,0,.28), rgba(255,176,0,0) 62%); pointer-events:none; }
.frame .content { position: absolute; inset:0; display:flex; padding: 9px; z-index:2; }
.frame .wordmark { position:absolute; top:7px; left:9px; font-size:8px; letter-spacing:.34em; font-weight:800; color:#fff; z-index:3; }
.frame .headline { font-weight:800; line-height:.98; letter-spacing:.01em; text-transform:uppercase; text-shadow: 0 1px 8px rgba(0,0,0,.6); }
.frame .price { display:inline-block; background: var(--amber); color:#0E0F12; font-weight:800; padding: 2px 6px; letter-spacing:.02em; }
.frame .cta { display:inline-block; border:1.5px solid var(--amber); color: var(--amber); font-weight:800; padding: 3px 8px; letter-spacing:.08em; text-transform:uppercase; }

/* product glyph */
.bar-housing { background:#15171b; border:1px solid #2a2d33; display:flex; padding:3px; gap:2px; box-shadow: 0 3px 14px rgba(0,0,0,.5); }
.led { flex:1; background: var(--amber); box-shadow: 0 0 7px var(--amber), 0 0 2px #fff inset; animation: led 1.6s ease-in-out infinite; }
@keyframes led { 0%,100%{opacity:.82;} 50%{opacity:1;} }
.pod { width:100%; height:100%; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:5px; }
.pod > i { background:#15171b; border:1px solid #2a2d33; display:flex; align-items:center; justify-content:center; }
.pod > i::before { content:""; width:52%; height:52%; border-radius:50%; background: var(--amber); box-shadow:0 0 8px var(--amber); animation: led 1.6s ease-in-out infinite; }
.h7 { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
.h7 > i { width:70%; aspect-ratio:1; border-radius:50%; background: radial-gradient(circle at 50% 45%, #fff, var(--amber) 30%, #7a5400 70%, #15171b 72%);
  box-shadow: 0 0 20px rgba(255,176,0,.7); animation: led 1.6s ease-in-out infinite; }

.foot-note { font-size: 10.5px; color:#8a847a; margin-top: 16px; line-height:1.5; border-top:1px solid rgba(22,21,19,.18); padding-top:12px; }
.foot-note b { color: var(--ink); }

@media (prefers-reduced-motion: reduce){
  .led, .pod > i::before, .h7 > i, .node.active::after { animation: none !important; }
  .card { animation: none; }
}
`;

const ROWS = [
  { sku: "TW-BAR30", product: "30″ LED Light Bar", vehicle: "Ford F-150", scene: "Desert",  price: "$389", headline: "See Past The Dark",   cta: "Shop the bar",  tint: "linear-gradient(180deg,#3a2a12,#0E0F12 70%)" },
  { sku: "TW-BAR30", product: "30″ LED Light Bar", vehicle: "Ford F-150", scene: "Forest",  price: "$389", headline: "Own The Night",       cta: "Shop the bar",  tint: "linear-gradient(180deg,#11221a,#0E0F12 70%)" },
  { sku: "TW-POD4",  product: "4″ LED Pods (pair)", vehicle: "Jeep Wrangler", scene: "Rock", price: "$149", headline: "Pods That Punch",     cta: "Build your kit", tint: "linear-gradient(180deg,#2a2622,#0E0F12 70%)" },
  { sku: "TW-H7X",   product: "H7 Headlight Kit",  vehicle: "Toyota Tacoma", scene: "Highway", price: "$229", headline: "Factory-Fit, Brighter", cta: "Find your fit", tint: "linear-gradient(180deg,#12202a,#0E0F12 70%)" },
];

const ASPECTS = [
  { key: "16:9", ratio: 16 / 9, dim: "1920×1080" },
  { key: "1:1",  ratio: 1,      dim: "1080×1080" },
  { key: "9:16", ratio: 9 / 16, dim: "1080×1920" },
];

const NODES = [
  { name: "Read spreadsheet", meta: "CSV / XLSX" },
  { name: "Describe API",     meta: "read MOGRT controls" },
  { name: "Map → MOGRT",      meta: "bind data fields" },
  { name: "Render API (DGR)", meta: "≤10 variations / req" },
  { name: "Encode MP4",       meta: "H.264" },
  { name: "Frame.io",         meta: "deliver assets" },
];

const SCENE_TOP = { desert: "#3a2a12", forest: "#11221a", rock: "#2a2622", highway: "#12202a", studio: "#20242a", night: "#0d1524", snow: "#1c2833" };
function sceneTop(scene) { return SCENE_TOP[(scene || "").toLowerCase().trim()] || "#20242a"; }
function tintFor(scene) { return `linear-gradient(180deg, ${sceneTop(scene)}, #0E0F12 70%)`; }

const VIDEO_OK =
  typeof window !== "undefined" &&
  typeof MediaRecorder !== "undefined" &&
  typeof HTMLCanvasElement !== "undefined" &&
  !!HTMLCanvasElement.prototype.captureStream;

const MIME = (() => {
  if (typeof MediaRecorder === "undefined") return { type: "", ext: ".png", label: "PNG" };
  const cands = [
    { type: "video/mp4;codecs=avc1.42E01E", ext: ".mp4", label: "MP4" },
    { type: "video/mp4", ext: ".mp4", label: "MP4" },
    { type: "video/webm;codecs=vp9", ext: ".webm", label: "WEBM" },
    { type: "video/webm", ext: ".webm", label: "WEBM" },
  ];
  const hit = cands.find((c) => { try { return MediaRecorder.isTypeSupported(c.type); } catch { return false; } });
  return hit || { type: "video/webm", ext: ".webm", label: "WEBM" };
})();
const BTN_LABEL = VIDEO_OK ? MIME.label : "PNG";

function dimsFor(aspect) {
  const L = 720;
  return aspect.ratio >= 1
    ? { w: L, h: Math.round(L / aspect.ratio) }
    : { w: Math.round(L * aspect.ratio), h: L };
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function drawGlyph(ctx, sku, r, pulse, s) {
  const AMBER = "#FFB000";
  ctx.save();
  ctx.shadowColor = AMBER; ctx.shadowBlur = s * 0.05 * pulse;
  if (sku === "TW-POD4") {
    const gap = r.w * 0.08, cw = (r.w - gap) / 2, ch = (r.h - gap) / 2;
    for (let i = 0; i < 4; i++) {
      const cx = r.x + (i % 2) * (cw + gap), cy = r.y + Math.floor(i / 2) * (ch + gap);
      ctx.fillStyle = "#15171b"; roundRect(ctx, cx, cy, cw, ch, 3); ctx.fill();
      ctx.fillStyle = AMBER; ctx.globalAlpha = pulse;
      ctx.beginPath(); ctx.arc(cx + cw / 2, cy + ch / 2, Math.min(cw, ch) * 0.26, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
  } else if (sku === "TW-H7X") {
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) * 0.42;
    const rg = ctx.createRadialGradient(cx, cy - rad * 0.1, 0, cx, cy, rad);
    rg.addColorStop(0, "#fff"); rg.addColorStop(0.3, AMBER); rg.addColorStop(0.7, "#7a5400"); rg.addColorStop(0.73, "#15171b");
    ctx.globalAlpha = pulse; ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = "#15171b"; roundRect(ctx, r.x, r.y + r.h * 0.3, r.w, r.h * 0.4, 4); ctx.fill();
    const n = 9, inPad = r.w * 0.03, cg = r.w * 0.012;
    const cw = (r.w - inPad * 2 - cg * (n - 1)) / n, cy = r.y + r.h * 0.38, chh = r.h * 0.24;
    ctx.fillStyle = AMBER; ctx.globalAlpha = pulse;
    for (let i = 0; i < n; i++) ctx.fillRect(r.x + inPad + i * (cw + cg), cy, cw, chh);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
function drawText(ctx, row, r, s, vertical) {
  const AMBER = "#FFB000";
  ctx.save();
  const align = r.align || "left";
  const ax = align === "center" ? r.x + r.w / 2 : r.x;
  ctx.textAlign = align === "center" ? "center" : "left";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = s * 0.02; ctx.shadowOffsetY = s * 0.006;
  const hl = Math.round(s * (vertical ? 0.075 : 0.07));
  ctx.font = `800 ${hl}px Arial`; ctx.fillStyle = "#fff";
  const words = row.headline.toUpperCase().split(" ");
  const lines = []; let line = "";
  words.forEach((w) => {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > r.w && line) { lines.push(line); line = w; } else line = t;
  });
  if (line) lines.push(line);
  let y = r.y;
  lines.forEach((l) => { ctx.fillText(l, ax, y); y += hl * 1.02; });
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  y += s * 0.03;
  const pS = Math.round(s * 0.05); ctx.font = `800 ${pS}px Arial`;
  const pw = ctx.measureText(row.price).width + s * 0.04, ph = pS * 1.4;
  const bx = align === "center" ? ax - pw / 2 : ax;
  ctx.fillStyle = AMBER; ctx.fillRect(bx, y, pw, ph);
  ctx.fillStyle = "#0E0F12"; ctx.textAlign = "left"; ctx.fillText(row.price, bx + s * 0.02, y + ph * 0.18);
  const cS = Math.round(s * 0.035); ctx.font = `800 ${cS}px Arial`;
  const cta = row.cta.toUpperCase(), cw2 = ctx.measureText(cta).width + s * 0.04, chh = cS * 1.7;
  const cx2 = align === "center" ? ax - cw2 / 2 : bx + pw + s * 0.025;
  const cy2 = align === "center" ? y + ph + s * 0.03 : y;
  ctx.strokeStyle = AMBER; ctx.lineWidth = Math.max(1, s * 0.005); ctx.strokeRect(cx2, cy2, cw2, chh);
  ctx.fillStyle = AMBER; ctx.fillText(cta, cx2 + s * 0.02, cy2 + chh * 0.28);
  ctx.restore();
}
function drawPoster(ctx, row, aspect, w, h, tSec) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, sceneTop(row.scene)); g.addColorStop(0.72, "#0E0F12"); g.addColorStop(1, "#0E0F12");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const rg = ctx.createRadialGradient(w / 2, h * 0.52, 0, w / 2, h * 0.52, Math.max(w, h) * 0.55);
  rg.addColorStop(0, "rgba(255,176,0,0.28)"); rg.addColorStop(0.6, "rgba(255,176,0,0)");
  ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
  const s = Math.min(w, h);
  const vertical = aspect.ratio <= 1;
  const pulse = 0.8 + 0.2 * (0.5 + 0.5 * Math.sin(tSec * Math.PI * 2 * 1.1));
  ctx.fillStyle = "#fff"; ctx.font = `800 ${Math.round(s * 0.03)}px Arial`; ctx.textBaseline = "top"; ctx.textAlign = "left";
  ctx.fillText("TORCHWERK", s * 0.05, s * 0.05);
  let glyph, text;
  const pad = s * 0.08;
  if (aspect.ratio >= 1.3) {
    glyph = { x: pad, y: h * 0.28, w: w * 0.42, h: h * 0.44 };
    text = { x: pad + w * 0.46, y: h * 0.34, w: w * 0.5 - pad, h: h * 0.4, align: "left" };
  } else {
    glyph = { x: w * 0.14, y: h * 0.16, w: w * 0.72, h: h * 0.34 };
    text = { x: w * 0.1, y: h * 0.58, w: w * 0.8, h: h * 0.36, align: vertical ? "center" : "left" };
  }
  drawGlyph(ctx, row.sku, glyph, pulse, s);
  drawText(ctx, row, text, s, vertical);
}
function buildRequest(row, aspect, duration, audio) {
  return {
    endpoint: "POST /v3/dynamic-graphics/render",
    template: `torchwerk_master_${aspect.key.replace(":", "x")}.mogrt`,
    outputMedia: { format: "video/mp4", aspectRatio: aspect.key, resolution: aspect.dim, durationSeconds: parseInt(duration, 10) },
    controls: {
      "#PRODUCT": row.product, "#SKU": row.sku, "#HEADLINE": row.headline,
      "#PRICE": row.price, "#CTA": row.cta, "#SCENE": row.scene, "#VEHICLE": row.vehicle,
    },
    audio,
  };
}
function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Spreadsheet schema ───────────────────────────────────────────────
const FIELDS = {
  sku:      { label: "SKU",      req: true,  syn: ["sku", "product code", "part", "part number", "id", "item"] },
  product:  { label: "Product",  req: true,  syn: ["product", "product name", "name", "title", "description"] },
  headline: { label: "Headline", req: true,  syn: ["headline", "headline copy", "copy", "tagline", "message"] },
  price:    { label: "Price",    req: true,  syn: ["price", "cost", "msrp", "amount"] },
  cta:      { label: "CTA",      req: true,  syn: ["cta", "call to action", "button", "action"] },
  vehicle:  { label: "Vehicle",  req: false, syn: ["vehicle", "fitment", "application", "make model", "make/model"] },
  scene:    { label: "Scene",    req: false, syn: ["scene", "background", "environment", "setting", "plate"] },
};
const norm = (h) => String(h || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
function matchHeader(headers, syns) {
  const n = headers.map((h) => ({ raw: h, n: norm(h) }));
  for (const s of syns) { const hit = n.find((h) => h.n === s); if (hit) return hit.raw; }
  for (const s of syns) { const hit = n.find((h) => h.n.includes(s)); if (hit) return hit.raw; }
  return null;
}
function formatPrice(v) {
  const t = String(v ?? "").trim();
  if (!t) return "";
  if (/[£$€]/.test(t)) return t;
  return /^\d/.test(t) ? "$" + t : t;
}
function mapRecords(records) {
  if (!records || !records.length) return { error: "That sheet has no data rows." };
  const headers = Object.keys(records[0]);
  const idx = {};
  Object.entries(FIELDS).forEach(([k, f]) => { const h = matchHeader(headers, f.syn); if (h) idx[k] = h; });
  const missing = Object.entries(FIELDS).filter(([k, f]) => f.req && !idx[k]).map(([, f]) => f.label);
  if (missing.length) return { error: `Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.` };
  const rows = []; let skipped = 0;
  records.forEach((r) => {
    const get = (k) => (idx[k] ? String(r[idx[k]] ?? "").trim() : "");
    const row = {
      sku: get("sku"), product: get("product"), headline: get("headline"),
      price: formatPrice(get("price")), cta: get("cta"),
      vehicle: get("vehicle") || "—", scene: get("scene") || "Studio",
    };
    if (!row.sku || !row.product || !row.headline || !row.price || !row.cta) { skipped++; return; }
    rows.push(row);
  });
  if (!rows.length) return { error: "No rows had all of SKU, Product, Headline, Price and CTA filled in." };
  return { rows, skipped };
}
function templateCsv() {
  const cols = ["SKU", "Product", "Vehicle", "Scene", "Headline", "Price", "CTA"];
  const body = ROWS.map((r) => [r.sku, r.product, r.vehicle, r.scene, r.headline, r.price.replace("$", ""), r.cta]);
  return [cols, ...body].map((row) => row.map((c) => /[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c).join(",")).join("\n");
}

function ProductGlyph({ sku }) {
  if (sku === "TW-POD4") return <div className="pod"><i /><i /><i /><i /></div>;
  if (sku === "TW-H7X") return <div className="h7"><i /></div>;
  return (
    <div className="bar-housing">
      {Array.from({ length: 9 }).map((_, i) => <span key={i} className="led" style={{ animationDelay: `${i * 0.08}s` }} />)}
    </div>
  );
}

function Poster({ row, aspect }) {
  const vertical = aspect.ratio <= 1;
  const hlSize = aspect.ratio >= 1.4 ? 15 : aspect.ratio >= 1 ? 14 : 16;
  const glyphBox = aspect.ratio >= 1.4
    ? { width: "44%", height: "46%" }
    : { width: "76%", height: aspect.ratio < 1 ? "26%" : "40%" };
  return (
    <div className="frame" style={{ aspectRatio: String(aspect.ratio) }}>
      <div className="scene" style={{ background: tintFor(row.scene) }} />
      <div className="glow" />
      <span className="wordmark">TORCHWERK</span>
      <div className="content" style={{ flexDirection: vertical ? "column" : "row", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ ...glyphBox, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ProductGlyph sku={row.sku} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: vertical ? "center" : "flex-start", textAlign: vertical ? "center" : "left", flex: 1, minWidth: 0 }}>
          <div className="headline" style={{ fontSize: hlSize }}>{row.headline}</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: vertical ? "center" : "flex-start" }}>
            <span className="price" style={{ fontSize: 10 }}>{row.price}</span>
            <span className="cta" style={{ fontSize: 8 }}>{row.cta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MogrtDgrGenerator() {
  const [selected, setSelected] = useState(new Set([0, 1, 2, 3]));
  const [aspects, setAspects] = useState({ "16:9": true, "1:1": true, "9:16": false });
  const [duration, setDuration] = useState("10s");
  const [audio, setAudio] = useState("Music bed");
  const [status, setStatus] = useState("idle"); // idle | running | done
  const [activeNode, setActiveNode] = useState(-1);
  const [doneNodes, setDoneNodes] = useState(0);
  const [progress, setProgress] = useState(0);
  const [outputs, setOutputs] = useState([]);
  const [busy, setBusy] = useState(null); // { key, prog }
  const [data, setData] = useState(ROWS);
  const [sheetName, setSheetName] = useState("campaign.sample");
  const [uploadMsg, setUploadMsg] = useState(null); // { ok, text }
  const runId = useRef(0);

  const activeAspects = ASPECTS.filter((a) => aspects[a.key]);
  const rows = data.filter((_, i) => selected.has(i));
  const variations = rows.length * activeAspects.length;
  const requests = Math.max(1, Math.ceil(variations / 10));
  const canRun = variations > 0 && status !== "running";

  const toggleRow = (i) => {
    if (status === "running") return;
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };
  const toggleAspect = (k) => status !== "running" && setAspects((p) => ({ ...p, [k]: !p[k] }));

  const sleep = (ms, id) => new Promise((res) => setTimeout(() => res(id === runId.current), ms));

  const run = useCallback(async () => {
    const id = ++runId.current;
    setStatus("running"); setOutputs([]); setProgress(0); setDoneNodes(0); setActiveNode(0);
    const built = [];
    rows.forEach((r) => activeAspects.forEach((a) => built.push({ row: r, aspect: a })));

    for (let n = 0; n < NODES.length; n++) {
      setActiveNode(n);
      if (!(await sleep(360, id))) return;
      setDoneNodes(n + 1);
      setProgress(Math.round(((n + 1) / NODES.length) * 100));
    }
    setActiveNode(-1);
    // reveal outputs progressively
    for (let k = 0; k < built.length; k++) {
      if (!(await sleep(90, id))) return;
      setOutputs(built.slice(0, k + 1));
    }
    setStatus("done");
  }, [rows, activeAspects]);

  const reset = () => {
    runId.current++;
    setStatus("idle"); setOutputs([]); setProgress(0); setActiveNode(-1); setDoneNodes(0);
  };

  const fileBase = (o) => `TORCHWERK_${o.row.sku}_${o.row.scene}_${o.aspect.key.replace(":", "x")}_${duration}`;

  const downloadPng = (o) => {
    const { w, h } = dimsFor(o.aspect);
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    drawPoster(c.getContext("2d"), o.row, o.aspect, w, h, 0.25);
    c.toBlob((b) => b && saveBlob(b, fileBase(o) + ".png"), "image/png");
  };

  const downloadClip = async (i, o) => {
    if (busy) return;
    if (!VIDEO_OK) { downloadPng(o); return; }
    try {
      setBusy({ key: i, prog: 0 });
      const { w, h } = dimsFor(o.aspect);
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      drawPoster(ctx, o.row, o.aspect, w, h, 0);
      const stream = c.captureStream(30);
      const rec = new MediaRecorder(stream, MIME.type ? { mimeType: MIME.type } : undefined);
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      const durSec = parseInt(duration, 10);
      const start = performance.now();
      await new Promise((res) => {
        rec.onstop = res;
        rec.start();
        const loop = (now) => {
          const el = (now - start) / 1000;
          drawPoster(ctx, o.row, o.aspect, w, h, el);
          setBusy({ key: i, prog: Math.min(1, el / durSec) });
          if (el < durSec) requestAnimationFrame(loop);
          else rec.stop();
        };
        requestAnimationFrame(loop);
      });
      saveBlob(new Blob(chunks, { type: MIME.type || "video/webm" }), fileBase(o) + MIME.ext);
    } catch (e) {
      downloadPng(o);
    } finally {
      setBusy(null);
    }
  };

  const downloadJson = (o) => {
    const body = JSON.stringify(buildRequest(o.row, o.aspect, duration, audio), null, 2);
    saveBlob(new Blob([body], { type: "application/json" }), fileBase(o) + ".dgr.json");
  };

  const applyRows = (result, name) => {
    if (result.error) { setUploadMsg({ ok: false, text: result.error }); return; }
    setData(result.rows);
    setSelected(new Set(result.rows.map((_, i) => i)));
    setSheetName(name);
    setStatus("idle"); setOutputs([]); setProgress(0); setDoneNodes(0); setActiveNode(-1);
    const extra = result.skipped ? ` · ${result.skipped} row${result.skipped > 1 ? "s" : ""} skipped (incomplete)` : "";
    setUploadMsg({ ok: true, text: `Loaded ${result.rows.length} row${result.rows.length > 1 ? "s" : ""} from ${name}${extra}` });
  };

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    try {
      if (ext === "csv" || ext === "tsv") {
        Papa.parse(file, {
          header: true, skipEmptyLines: true,
          complete: (res) => applyRows(mapRecords(res.data), file.name),
          error: () => setUploadMsg({ ok: false, text: "Couldn't read that CSV." }),
        });
      } else if (ext === "xlsx" || ext === "xls") {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const wb = XLSX.read(ev.target.result, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            applyRows(mapRecords(XLSX.utils.sheet_to_json(ws, { defval: "" })), file.name);
          } catch { setUploadMsg({ ok: false, text: "Couldn't read that workbook." }); }
        };
        reader.readAsArrayBuffer(file);
      } else {
        setUploadMsg({ ok: false, text: "Unsupported file — use .csv or .xlsx." });
      }
    } catch { setUploadMsg({ ok: false, text: "Something went wrong reading that file." }); }
  };

  const downloadTemplate = () => saveBlob(new Blob([templateCsv()], { type: "text/csv" }), "torchwerk_campaign_template.csv");

  const resetSample = () => {
    setData(ROWS); setSelected(new Set(ROWS.map((_, i) => i))); setSheetName("campaign.sample");
    setStatus("idle"); setOutputs([]); setProgress(0); setDoneNodes(0); setActiveNode(-1);
    setUploadMsg(null);
  };
  const usingSample = data === ROWS;

  return (
    <>
      <style>{CSS}</style>
      <div className="mogrt-root">
        <div className="eyebrow">Firefly Services · Dynamic Graphics Render</div>
        <h1 className="h1">AE MOGRT → DGR Video Generator</h1>
        <p className="sub">
          One After Effects Motion Graphics template, driven by spreadsheet data. Configure the batch,
          and the pipeline maps each row into the MOGRT and renders campaign-video variations across
          aspect ratios and duration templates — chunked to the DGR API's 10-per-request ceiling.
        </p>

        <hr className="rule" />

        <div className="cols">
          {/* DATA SOURCE */}
          <div className="col-a">
            <div className="panel-label" style={{ justifyContent: "space-between" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><Table2 /> Data source · {sheetName}</span>
            </div>
            <div className="upload-row">
              <label className="up-btn">
                <Upload /> Upload .csv / .xlsx
                <input type="file" accept=".csv,.tsv,.xlsx,.xls" onChange={onFile} style={{ display: "none" }} />
              </label>
              <button className="up-link" onClick={downloadTemplate}><FileDown /> Template</button>
              {!usingSample && <button className="up-link" onClick={resetSample}><RotateCcw /> Sample</button>}
            </div>
            {uploadMsg && (
              <div className={"up-msg " + (uploadMsg.ok ? "ok" : "err")}>{uploadMsg.text}</div>
            )}
            <table className="sheet">
              <thead>
                <tr>
                  <th style={{ width: 24 }}></th>
                  <th>SKU</th><th>Product</th><th>Scene</th><th>Headline</th><th>Price</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => {
                  const on = selected.has(i);
                  return (
                    <tr key={i} className={on ? "on" : ""} onClick={() => toggleRow(i)}>
                      <td><span className={"chk" + (on ? " on" : "")}>{on && <Check />}</span></td>
                      <td className="sku">{r.sku}</td>
                      <td>{r.product}<div style={{ color: "#8a847a", fontSize: 10.5 }}>{r.vehicle}</div></td>
                      <td>{r.scene}</td>
                      <td>{r.headline}</td>
                      <td>{r.price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ fontSize: 10.5, color: "#8a847a", marginTop: 8 }}>
              <b style={{ color: "#161513" }}>Required columns:</b> SKU, Product, Headline, Price, CTA · <b style={{ color: "#161513" }}>optional:</b> Vehicle, Scene. Headers are matched loosely; one row = one creative.
            </div>
          </div>

          {/* CONTROLS */}
          <div className="col-b">
            <div className="panel-label"><SlidersHorizontal /> Template controls</div>

            <div className="ctrl-block">
              <div className="ctrl-title">Aspect ratios · one MOGRT each</div>
              <div className="opt-row">
                {ASPECTS.map((a) => (
                  <button key={a.key} className={"opt" + (aspects[a.key] ? " on" : "")} onClick={() => toggleAspect(a.key)}>
                    {a.key}<small>{a.dim}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="ctrl-block">
              <div className="ctrl-title">Duration template</div>
              <div className="opt-row">
                {["5s", "10s", "15s"].map((d) => (
                  <button key={d} className={"opt" + (duration === d ? " on" : "")} onClick={() => status !== "running" && setDuration(d)}>{d}</button>
                ))}
              </div>
            </div>

            <div className="ctrl-block">
              <div className="ctrl-title">Audio</div>
              <div className="opt-row">
                {["Music bed", "Voiceover", "Silent"].map((d) => (
                  <button key={d} className={"opt" + (audio === d ? " on" : "")} onClick={() => status !== "running" && setAudio(d)}>{d}</button>
                ))}
              </div>
            </div>

            <div className="math">
              <div className="math-row"><span className="k">Rows selected</span><span className="v">{rows.length}</span></div>
              <div className="math-row"><span className="k">Aspect ratios</span><span className="v">{activeAspects.length}</span></div>
              <div className="math-row"><span className="k">Render requests (≤10 ea.)</span><span className="v">{requests}</span></div>
              <div className="math-big"><span className="k">Variations</span><span className="v">{variations}</span></div>
            </div>

            {status === "done"
              ? <button className="run reset" onClick={reset}>Run another batch</button>
              : <button className="run" onClick={run} disabled={!canRun}>
                  {status === "running" ? "Rendering…" : "Render batch"}
                </button>}
          </div>
        </div>

        <hr className="rule" />

        {/* PIPELINE */}
        <div className="panel-label"><Zap /> Pipeline</div>
        <div className="pipe">
          {NODES.map((n, i) => (
            <div key={i} className={"node" + (activeNode === i ? " active" : "") + (i < doneNodes && activeNode !== i ? " done" : "")}>
              <div className="n-idx">0{i + 1}</div>
              <div className="n-name">{n.name}</div>
              <div className="n-meta">{n.meta}</div>
            </div>
          ))}
        </div>
        <div className="progress"><span style={{ width: `${progress}%` }} /></div>

        {/* OUTPUTS */}
        {outputs.length > 0 && (
          <>
            <hr className="rule" />
            <div className="out-head">
              <h2><Film style={{ width: 18, height: 18, verticalAlign: "-3px", marginRight: 6 }} />Rendered variations</h2>
              <span className="count">{outputs.length} MP4 · {requests} DGR request{requests > 1 ? "s" : ""}</span>
            </div>
            <div className="grid">
              {outputs.map((o, i) => (
                <div className="card" key={i}>
                  <div className="c-meta">
                    <span className="c-sku">{o.row.sku} · {o.row.scene}</span>
                    <span className="c-tag">{o.aspect.key}</span>
                  </div>
                  <Poster row={o.row} aspect={o.aspect} />
                  <div className="c-foot">
                    <span>{o.aspect.dim} · {duration}</span>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <button className="json" onClick={() => downloadJson(o)} disabled={!!busy}>{"{ }"} req</button>
                      <button onClick={() => downloadClip(i, o)} disabled={!!busy && busy.key !== i}>
                        {busy && busy.key === i
                          ? <>Rendering {Math.round(busy.prog * 100)}%</>
                          : <><Download />{BTN_LABEL}</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {status === "done" && (
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#161513" }}>
                <span style={{ background: "#7d202b", color: "#f7f2e9", padding: "5px 10px", fontWeight: 700, letterSpacing: ".06em", fontSize: 10.5, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Send style={{ width: 12, height: 12 }} /> DELIVERED
                </span>
                {outputs.length} assets pushed to the TORCHWERK project on Frame.io.
              </div>
            )}
          </>
        )}

        <div className="foot-note">
          <b>How it maps to Firefly Services.</b> The <b>Describe</b> API reads each MOGRT's exposed
          controls; a mapping layer binds spreadsheet columns to those controls; the <b>Dynamic Graphics
          Render</b> API renders MOGRTs (not <b>.aep</b>) at a fixed duration per template, one MOGRT per
          aspect ratio, batched at ≤10 variations per request. Templates are built defensively for long
          copy and odd media shapes. In this demo the downloadable clip is rendered client-side from the
          composited frame — a real {BTN_LABEL} file — while the Firefly Services API calls are mocked
          against the public DGR schema. The <b>req</b> button exports the exact render request body.
        </div>
      </div>
    </>
  );
}

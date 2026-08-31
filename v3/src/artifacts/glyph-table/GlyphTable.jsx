import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

/* ============================================================
   GLYPH TABLE — Type Design & Font Exporter
   Draw freehand or compile stroked outlines → Installable .ttf
   Font units: 1000 upm, y-up, baseline 0, asc 800, desc -200.
   ============================================================ */

const UPM = 1000, ASCENDER = 800, DESCENDER = -200, CAP = 700, XH = 500;
const TOP = 900, BOTTOM = -300;
const VIEW_W = 1000, VIEW_H = TOP - BOTTOM;

const INK = "#F2EFE6", GROUND = "#0E1626", PANEL = "#15223A";
const GUIDE = "#3E7FA6", GUIDE_SOFT = "#24405C", GOLD = "#D8B25F", DIM = "#7F93AC";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const DISPLAY = "'Helvetica Neue', Inter, Arial, sans-serif";

const ROWS = [
  { label: "uppercase", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("") },
  { label: "lowercase", chars: "abcdefghijklmnopqrstuvwxyz".split("") },
  { label: "figures", chars: "0123456789".split("") },
  { label: "punctuation", chars: ".,:;'\"!?-–/()[]&@#$%+=*_".split("") },
  { label: "space", chars: [" "] },
];
const ALL_CHARS = ROWS.flatMap((r) => r.chars);
const DEFAULT_ADV = 560;
const ADV_HINTS = { " ": 300, i: 260, l: 260, I: 300, ".": 260, ",": 260, "'": 220, ":": 260, ";": 260, m: 820, w: 780, M: 820, W: 820 };
const emptyGlyph = (ch) => ({ strokes: [], adv: ADV_HINTS[ch] ?? DEFAULT_ADV });

/* ---------------- storage & environment helpers ---------------- */
let seq = 0;
const pending = new Map();
function call(type, payload = {}) {
  return new Promise((resolve) => {
    const id = ++seq;
    pending.set(id, resolve);
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ pluginMessage: { type, id, ...payload } }, "*");
      }
    } catch {
      resolve({});
    }
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("message", (e) => {
    const m = e.data?.pluginMessage;
    if (!m || !m.id || !pending.has(m.id)) return;
    pending.get(m.id)(m);
    pending.delete(m.id);
  });
}

const storageSave = async (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
  if (typeof window !== "undefined" && window.parent && window.parent !== window) {
    try { call("save", { key, value }); } catch {}
  }
};

const storageLoad = async (key) => {
  try {
    const local = localStorage.getItem(key);
    if (local) return local;
  } catch {}
  if (typeof window !== "undefined" && window.parent && window.parent !== window) {
    try {
      const res = await Promise.race([
        call("load", { key }),
        new Promise((resolve) => setTimeout(() => resolve({ value: null }), 200))
      ]);
      return res?.value ?? null;
    } catch {}
  }
  return null;
};

/* ---------------- geometry: freehand strokes ---------------- */
function distToSeg(p, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1], wx = p[0] - a[0], wy = p[1] - a[1];
  const len2 = vx * vx + vy * vy;
  let t = len2 ? (wx * vx + wy * vy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * vx), p[1] - (a[1] + t * vy));
}

function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  const a = pts[0], b = pts[pts.length - 1];
  for (let i = 1; i < pts.length - 1; i++) {
    const d = distToSeg(pts[i], a, b);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD > eps) {
    const l = simplify(pts.slice(0, idx + 1), eps), r = simplify(pts.slice(idx), eps);
    return l.slice(0, -1).concat(r);
  }
  return [a, b];
}

function strokeDist(pt, stroke) {
  const p = stroke.pts;
  if (p.length === 1) return Math.hypot(pt[0] - p[0][0], pt[1] - p[0][1]);
  let best = Infinity;
  for (let i = 0; i < p.length - 1; i++) best = Math.min(best, distToSeg(pt, p[i], p[i + 1]));
  return best;
}

function pathD(stroke) {
  const p = stroke.pts;
  if (!p.length) return "";
  if (p.length === 1) return `M ${p[0][0]} ${p[0][1]} L ${p[0][0] + 0.01} ${p[0][1]}`;
  return "M " + p.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L ");
}

function orientCW(c) {
  let a = 0;
  for (let i = 0; i < c.length; i++) {
    const p = c[i], q = c[(i + 1) % c.length];
    a += p.x * q.y - p.x * q.y; // standard shoelace formula
  }
  return a > 0 ? c.slice().reverse() : c; // clockwise in y-up space
}

// stroke → filled contours as {x,y,on} point lists (all on-curve)
function strokeToContours(stroke) {
  const r = Math.max(6, stroke.w / 2), pts = stroke.pts, out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 0.6) continue;
    const nx = (-dy / len) * r, ny = (dx / len) * r;
    out.push(orientCW([
      { x: x1 + nx, y: y1 + ny, on: 1 }, { x: x2 + nx, y: y2 + ny, on: 1 },
      { x: x2 - nx, y: y2 - ny, on: 1 }, { x: x1 - nx, y: y1 - ny, on: 1 },
    ]));
  }
  const N = 8;
  for (const [x, y] of pts) {
    const c = [];
    for (let k = 0; k < N; k++) {
      const a = (2 * Math.PI * k) / N;
      c.push({ x: x + r * Math.cos(a), y: y + r * Math.sin(a), on: 1 });
    }
    out.push(orientCW(c));
  }
  return out;
}

/* ---------------- geometry: path data → quad contours ---------------- */
function applyM(m, x, y) {
  return [m[0][0] * x + m[0][1] * y + m[0][2], m[1][0] * x + m[1][1] * y + m[1][2]];
}

function cubicToQuadPts(p0, c1, c2, p3) {
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const ab = lerp(p0, c1, 0.5), bc = lerp(c1, c2, 0.5), cd = lerp(c2, p3, 0.5);
  const abbc = lerp(ab, bc, 0.5), bccd = lerp(bc, cd, 0.5);
  const mid = lerp(abbc, bccd, 0.5);
  const q = (a, b, c, d) => [(3 * b[0] - a[0] + 3 * c[0] - d[0]) / 4, (3 * b[1] - a[1] + 3 * c[1] - d[1]) / 4];
  const q1 = q(p0, ab, abbc, mid), q2 = q(mid, bccd, cd, p3);
  return [
    { x: q1[0], y: q1[1], on: 0 }, { x: mid[0], y: mid[1], on: 1 },
    { x: q2[0], y: q2[1], on: 0 }, { x: p3[0], y: p3[1], on: 1 },
  ];
}

function parseFigmaGeom(geoms, scale) {
  const toFont = (p) => ({ X: p[0] * scale, Y: ASCENDER - p[1] * scale });
  const contours = [];
  for (const g of geoms) {
    const toks = g.data.match(/[MLQCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
    let i = 0, cur = null, start = null, pen = null;
    const num = () => parseFloat(toks[i++]);
    const pt = () => applyM(g.m, num(), num());
    while (i < toks.length) {
      const cmd = toks[i++];
      if (cmd === "M") {
        if (cur && cur.length > 2) contours.push(cur);
        pen = pt(); start = pen;
        const f = toFont(pen);
        cur = [{ x: f.X, y: f.Y, on: 1 }];
      } else if (cmd === "L") {
        pen = pt();
        const f = toFont(pen);
        cur.push({ x: f.X, y: f.Y, on: 1 });
      } else if (cmd === "Q") {
        const c = pt(), e = pt();
        const fc = toFont(c), fe = toFont(e);
        cur.push({ x: fc.X, y: fc.Y, on: 0 }, { x: fe.X, y: fe.Y, on: 1 });
        pen = e;
      } else if (cmd === "C") {
        const c1 = pt(), c2 = pt(), e = pt();
        const quadPts = cubicToQuadPts(pen, c1, c2, e).map((p) =>
          p.on ? { ...toFontPt(p, scale), on: 1 } : { ...toFontPt(p, scale), on: 0 }
        );
        cur.push(...quadPts);
        pen = e;
      } else if (cmd === "Z" || cmd === "z") {
        if (cur && cur.length > 2) {
          const a = cur[0], b = cur[cur.length - 1];
          if (b.on && Math.abs(a.x - b.x) < 0.6 && Math.abs(a.y - b.y) < 0.6) cur.pop();
          contours.push(cur);
        }
        cur = null; pen = start;
      }
    }
    if (cur && cur.length > 2) contours.push(cur);
  }
  return contours;
}

function toFontPt(p, scale) {
  return { x: p.x * scale, y: ASCENDER - p.y * scale };
}

/* ---------------- TTF binary writer ---------------- */
class BW {
  constructor() { this.b = []; }
  u8(v) { this.b.push(v & 255); return this; }
  u16(v) { this.b.push((v >> 8) & 255, v & 255); return this; }
  i16(v) { return this.u16(v < 0 ? v + 65536 : v); }
  u32(v) { this.b.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255); return this; }
  tag(s) { for (let i = 0; i < 4; i++) this.b.push(s.charCodeAt(i) & 255); return this; }
  raw(a) { for (let i = 0; i < a.length; i++) this.b.push(a[i] & 255); return this; }
  pad4() { while (this.b.length % 4) this.b.push(0); return this; }
  done() { return new Uint8Array(this.b); }
}

function checksum(d) {
  let s = 0;
  for (let i = 0; i < d.length; i += 4)
    s = (s + ((((d[i] || 0) << 24) | ((d[i + 1] || 0) << 16) | ((d[i + 2] || 0) << 8) | (d[i + 3] || 0)) >>> 0)) >>> 0;
  return s >>> 0;
}

function buildGlyf(contours) {
  const cs = contours
    .map((c) => c.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y), on: p.on ? 1 : 0 })))
    .filter((c) => c.length > 2);
  if (!cs.length) return { data: new Uint8Array(0), xMin: 0, yMin: 0, xMax: 0, yMax: 0, nPts: 0, nCon: 0 };
  let xMin = 1e9, yMin = 1e9, xMax = -1e9, yMax = -1e9;
  for (const c of cs) for (const p of c) {
    if (p.x < xMin) xMin = p.x; if (p.x > xMax) xMax = p.x;
    if (p.y < yMin) yMin = p.y; if (p.y > yMax) yMax = p.y;
  }
  const w = new BW();
  w.i16(cs.length).i16(xMin).i16(yMin).i16(xMax).i16(yMax);
  let end = -1;
  for (const c of cs) { end += c.length; w.u16(end); }
  w.u16(0);
  const all = [];
  for (const c of cs) for (const p of c) all.push(p);
  for (const p of all) w.u8(p.on ? 0x01 : 0x00);
  let px = 0; for (const p of all) { w.i16(p.x - px); px = p.x; }
  let py = 0; for (const p of all) { w.i16(p.y - py); py = p.y; }
  w.pad4();
  return { data: w.done(), xMin, yMin, xMax, yMax, nPts: all.length, nCon: cs.length };
}

function buildCmap(codes) {
  const segs = [];
  let i = 0;
  while (i < codes.length) {
    let j = i;
    while (j + 1 < codes.length && codes[j + 1] === codes[j] + 1) j++;
    segs.push({ start: codes[i], end: codes[j], delta: (i + 1 - codes[i]) & 0xffff });
    i = j + 1;
  }
  segs.push({ start: 0xffff, end: 0xffff, delta: 1 });
  const n = segs.length;
  let sel = 0; while (1 << (sel + 1) <= n) sel++;
  const sub = new BW();
  sub.u16(4).u16(16 + 8 * n).u16(0).u16(n * 2).u16(2 * (1 << sel)).u16(sel).u16(n * 2 - 2 * (1 << sel));
  for (const s of segs) sub.u16(s.end);
  sub.u16(0);
  for (const s of segs) sub.u16(s.start);
  for (const s of segs) sub.u16(s.delta);
  for (const s of segs) sub.u16(0);
  const t = new BW();
  t.u16(0).u16(2).u16(0).u16(3).u32(20).u16(3).u16(1).u32(20).raw(sub.done());
  return t.done();
}

function buildName(recs) {
  const t = new BW(), entries = [];
  for (const [id, str] of recs) {
    const mac = []; for (let i = 0; i < str.length; i++) mac.push(str.charCodeAt(i) & 255);
    entries.push({ pid: 1, eid: 0, lid: 0, id, bytes: mac });
    const win = []; for (let i = 0; i < str.length; i++) win.push((str.charCodeAt(i) >> 8) & 255, str.charCodeAt(i) & 255);
    entries.push({ pid: 3, eid: 1, lid: 0x409, id, bytes: win });
  }
  entries.sort((a, b) => a.pid - b.pid || a.eid - b.eid || a.lid - b.lid || a.id - b.id);
  t.u16(0).u16(entries.length).u16(6 + 12 * entries.length);
  let off = 0;
  for (const e of entries) { t.u16(e.pid).u16(e.eid).u16(e.lid).u16(e.id).u16(e.bytes.length).u16(off); off += e.bytes.length; }
  for (const e of entries) t.raw(e.bytes);
  t.pad4();
  return t.done();
}

function buildTTF(glyphMap, fontName) {
  const family = (fontName || "Glyph Table").trim() || "Glyph Table";
  const ps = family.replace(/[^A-Za-z0-9]/g, "").slice(0, 60) || "GlyphTable";
  const codes = Object.keys(glyphMap)
    .filter((ch) => ch === " " || (glyphMap[ch] && glyphMap[ch].contours && glyphMap[ch].contours.length))
    .map((ch) => ch.charCodeAt(0))
    .sort((a, b) => a - b);
  if (!codes.length) throw new Error("empty");

  const parts = [{ data: new Uint8Array(0), xMin: 0, yMin: 0, xMax: 0, yMax: 0, nPts: 0, nCon: 0, adv: DEFAULT_ADV }];
  for (const code of codes) {
    const g = glyphMap[String.fromCharCode(code)];
    const built = buildGlyf(g.contours);
    built.adv = Math.max(0, Math.round(g.adv));
    parts.push(built);
  }
  const numGlyphs = parts.length;
  const glyfW = new BW(), locaW = new BW();
  let off = 0;
  for (const p of parts) { locaW.u32(off); glyfW.raw(p.data); off += p.data.length; }
  locaW.u32(off);
  const glyf = glyfW.done(), loca = locaW.done();
  const hmtxW = new BW();
  for (const p of parts) hmtxW.u16(p.adv).i16(p.data.length ? p.xMin : 0);
  hmtxW.pad4();
  const hmtx = hmtxW.done();

  const drawn = parts.filter((p) => p.data.length);
  const agg = (f, sel, fb) => (drawn.length ? drawn.map(sel).reduce(f) : fb);
  const xMin = agg(Math.min, (p) => p.xMin, 0), yMin = agg(Math.min, (p) => p.yMin, DESCENDER);
  const xMax = agg(Math.max, (p) => p.xMax, UPM), yMax = agg(Math.max, (p) => p.yMax, ASCENDER);
  const advMax = parts.reduce((a, p) => Math.max(a, p.adv), 0);
  const avgAdv = Math.round(parts.reduce((a, p) => a + p.adv, 0) / numGlyphs);

  const head = new BW().u32(0x10000).u32(0x10000).u32(0).u32(0x5f0f3cf5).u16(3).u16(UPM)
    .u32(0).u32(3600000000).u32(0).u32(3600000000)
    .i16(xMin).i16(yMin).i16(xMax).i16(yMax).u16(0).u16(8).i16(2).i16(1).i16(0).done();
  const hhea = new BW().u32(0x10000).i16(ASCENDER).i16(DESCENDER).i16(200).u16(advMax)
    .i16(xMin).i16(0).i16(xMax).i16(1).i16(0).i16(0).i16(0).i16(0).i16(0).i16(0).i16(0).u16(numGlyphs).done();
  const maxPts = parts.reduce((a, p) => Math.max(a, p.nPts), 0);
  const maxCon = parts.reduce((a, p) => Math.max(a, p.nCon), 0);
  const maxp = new BW().u32(0x10000).u16(numGlyphs).u16(maxPts).u16(maxCon).u16(0).u16(0)
    .u16(2).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0).done();
  const os2 = new BW().u16(4).i16(avgAdv).u16(400).u16(5).u16(0)
    .i16(650).i16(600).i16(0).i16(75).i16(650).i16(600).i16(0).i16(350).i16(50).i16(300).i16(0)
    .raw([2, 0, 5, 0, 0, 0, 0, 0, 0, 0]).u32(1).u32(0).u32(0).u32(0).tag("NONE")
    .u16(0x40).u16(codes[0]).u16(codes[codes.length - 1])
    .i16(ASCENDER).i16(DESCENDER).i16(200).u16(ASCENDER + 100).u16(-DESCENDER + 100)
    .u32(1).u32(0).i16(XH).i16(CAP).u16(32).u16(32).u16(1).done();
  const post = new BW().u32(0x30000).u32(0).i16(-100).i16(50).u32(0).u32(0).u32(0).u32(0).u32(0).done();
  const cmap = buildCmap(codes);
  const name = buildName([[1, family], [2, "Regular"], [3, ps + ":2026"], [4, family + " Regular"], [5, "Version 1.000"], [6, ps]]);

  const tables = [["OS/2", os2], ["cmap", cmap], ["glyf", glyf], ["head", head], ["hhea", hhea],
    ["hmtx", hmtx], ["loca", loca], ["maxp", maxp], ["name", name], ["post", post]];
  const n = tables.length;
  let es = 0; while (1 << (es + 1) <= n) es++;
  const dir = new BW();
  dir.u32(0x10000).u16(n).u16(16 * (1 << es)).u16(es).u16(n * 16 - 16 * (1 << es));
  let pos = 12 + 16 * n;
  const offs = [];
  for (const [tag, data] of tables) {
    offs.push(pos);
    dir.tag(tag).u32(checksum(data)).u32(pos).u32(data.length);
    pos += data.length + ((4 - (data.length % 4)) % 4);
  }
  const font = new Uint8Array(pos);
  font.set(dir.done(), 0);
  tables.forEach(([, d], i) => font.set(d, offs[i]));
  const headOff = offs[tables.findIndex(([t]) => t === "head")];
  const adj = (0xb1b0afba - checksum(font)) >>> 0;
  font[headOff + 8] = (adj >>> 24) & 255; font[headOff + 9] = (adj >>> 16) & 255;
  font[headOff + 10] = (adj >>> 8) & 255; font[headOff + 11] = adj & 255;
  return font;
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ---------------- preview helpers ---------------- */
function contourToSvg(c) {
  if (!c.length) return "";
  const pts = c[0].on ? c : [...c.slice(1), c[0]];
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  let i = 1;
  while (i < pts.length + 1) {
    const p = pts[i % pts.length];
    if (!p) break;
    if (p.on) { d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`; i++; }
    else {
      const nxt = pts[(i + 1) % pts.length];
      const end = nxt && nxt.on ? nxt : { x: (p.x + pts[(i + 1) % pts.length].x) / 2, y: (p.y + pts[(i + 1) % pts.length].y) / 2 };
      d += ` Q ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
      i += nxt && nxt.on ? 2 : 1;
    }
    if (i > pts.length) break;
  }
  return d + " Z";
}

function contoursToFigmaPath(contours, pxHeight) {
  const s = pxHeight / (ASCENDER - DESCENDER);
  const f = (v) => (v * s).toFixed(2);
  const fy = (y) => ((ASCENDER - y) * s).toFixed(2);
  let d = "";
  for (const c of contours) {
    d += `M ${f(c[0].x)} ${fy(c[0].y)} `;
    for (let i = 1; i < c.length; i++) d += `L ${f(c[i].x)} ${fy(c[i].y)} `;
    d += "Z ";
  }
  return d.trim();
}

function GlyphArt({ glyph, color = INK }) {
  if (!glyph || !glyph.strokes.length) return null;
  return (
    <g>
      {glyph.strokes.map((s, i) => (
        <path key={i} d={pathD(s)} fill="none" stroke={color} strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </g>
  );
}

/* ================= COMPONENT ================= */
export default function GlyphTable() {
  const [tab, setTab] = useState("draw");
  const [fontName, setFontName] = useState("Portfolio Type");
  const [status, setStatus] = useState("");

  /* ---- draw state ---- */
  const [glyphs, setGlyphs] = useState(() => {
    const g = {}; for (const ch of ALL_CHARS) g[ch] = emptyGlyph(ch); return g;
  });
  const [current, setCurrent] = useState("A");
  const [tool, setTool] = useState("draw");
  const [nib, setNib] = useState(52);
  const [ghost, setGhost] = useState(true);
  const [sample, setSample] = useState("PORTFOLIO 2026");
  const [live, setLive] = useState(null);
  const history = useRef([]);
  const svgRef = useRef(null);
  const fileRef = useRef(null);

  /* ---- frames state ---- */
  const [scanned, setScanned] = useState(null);
  const [scanning, setScanning] = useState(false);

  const glyph = glyphs[current] || emptyGlyph(current);
  const drawnCount = useMemo(() => ALL_CHARS.filter((c) => glyphs[c]?.strokes.length).length, [glyphs]);

  // restore + autosave
  useEffect(() => {
    (async () => {
      try {
        const v = await storageLoad("glyphtable:project");
        if (v) {
          const p = JSON.parse(v);
          if (p.glyphs) setGlyphs((g) => ({ ...g, ...p.glyphs }));
          if (p.fontName) setFontName(p.fontName);
          setStatus("Restored your typography workspace");
        }
      } catch { /* first run */ }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      storageSave("glyphtable:project", JSON.stringify({ glyphs, fontName })).catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [glyphs, fontName]);

  const push = useCallback(() => {
    history.current.push(JSON.stringify(glyphs));
    if (history.current.length > 60) history.current.shift();
  }, [glyphs]);

  const undo = useCallback(() => {
    const prev = history.current.pop();
    if (prev) { setGlyphs(JSON.parse(prev)); setStatus("Undone"); }
  }, []);

  const toFont = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return [Math.round(((e.clientX - r.left) / r.width) * VIEW_W), Math.round(TOP - ((e.clientY - r.top) / r.height) * VIEW_H)];
  };

  const onDown = (e) => {
    if (current === " ") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toFont(e);
    if (tool === "erase") {
      push();
      setGlyphs((g) => {
        const strokes = g[current].strokes;
        let bi = -1, bd = Infinity;
        strokes.forEach((s, i) => { const d = strokeDist(p, s) - s.w / 2; if (d < bd) { bd = d; bi = i; } });
        if (bi < 0 || bd > 40) return g;
        return { ...g, [current]: { ...g[current], strokes: strokes.filter((_, i) => i !== bi) } };
      });
      return;
    }
    setLive({ w: nib, pts: [p] });
  };

  const onMove = (e) => {
    if (!live) return;
    const p = toFont(e), last = live.pts[live.pts.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 8) return;
    setLive({ ...live, pts: [...live.pts, p] });
  };

  const onUp = () => {
    if (!live) return;
    push();
    setGlyphs((g) => ({ ...g, [current]: { ...g[current], strokes: [...g[current].strokes, { w: live.w, pts: simplify(live.pts, 7) }] } }));
    setLive(null);
  };

  const clearGlyph = () => { push(); setGlyphs((g) => ({ ...g, [current]: { ...g[current], strokes: [] } })); };
  const setAdv = (v) => setGlyphs((g) => ({ ...g, [current]: { ...g[current], adv: v } }));

  const drawMap = () => {
    const map = {};
    for (const ch of ALL_CHARS) {
      const g = glyphs[ch];
      if (!g) continue;
      const contours = [];
      for (const s of g.strokes) contours.push(...strokeToContours(s));
      map[ch] = { contours, adv: g.adv };
    }
    return map;
  };

  const exportDrawTTF = () => {
    try {
      const data = buildTTF(drawMap(), fontName);
      download(new Blob([data], { type: "font/ttf" }), (fontName.replace(/[^A-Za-z0-9]/g, "") || "GlyphTable") + ".ttf");
      setStatus(`Exported ${drawnCount} glyphs — install the .ttf file to use in Photoshop, Illustrator, InDesign, and web!`);
    } catch (err) {
      setStatus(err.message === "empty" ? "Draw at least one letter before exporting" : "Export failed — check drawn glyphs");
    }
  };

  const exportJSON = () => {
    download(new Blob([JSON.stringify({ fontName, glyphs }, null, 1)], { type: "application/json" }), (fontName || "glyphtable") + ".json");
    setStatus("Saved editable source JSON");
  };

  const importJSON = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const p = JSON.parse(r.result);
        push();
        setGlyphs((g) => ({ ...g, ...p.glyphs }));
        if (p.fontName) setFontName(p.fontName);
        setStatus("Source loaded successfully");
      } catch { setStatus("Invalid Glyph Table source file"); }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  const copySVGOrPlace = () => {
    const contours = [];
    for (const s of glyph.strokes) contours.push(...strokeToContours(s));
    if (!contours.length) { setStatus("Nothing drawn for this character yet"); return; }
    const svgPath = contoursToFigmaPath(contours, 400);
    if (typeof window !== "undefined" && window.parent && window.parent !== window) {
      window.parent.postMessage({ pluginMessage: { type: "insert", char: current, pathData: svgPath } }, "*");
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(svgPath).then(() => {
        setStatus(`Copied glyph '${current}' SVG path vector to clipboard!`);
      }).catch(() => {
        setStatus(`Generated glyph '${current}' vector`);
      });
    } else {
      setStatus(`Glyph '${current}' vector ready`);
    }
  };

  /* ---- frames actions ---- */
  const scan = async () => {
    setScanning(true);
    const res = await call("scan");
    if (!res || !res.frames || !res.frames.length) {
      setScanning(false);
      setStatus("No Figma frames found. In browser mode, use the Draw tab to draw directly and export .ttf!");
      return;
    }
    const out = [];
    for (const f of res.frames) {
      const scale = UPM / f.h;
      const contours = parseFigmaGeom(f.geoms, scale);
      out.push({ char: f.char, name: f.name, contours, adv: Math.round(f.w * scale), empty: contours.length === 0 });
    }
    out.sort((a, b) => a.char.charCodeAt(0) - b.char.charCodeAt(0));
    setScanned(out);
    setScanning(false);
    const withInk = out.filter((o) => !o.empty).length;
    setStatus(out.length ? `Found ${out.length} glyph frames, ${withInk} with artwork` : "No glyph frames found");
  };

  const exportFramesTTF = () => {
    if (!scanned) return;
    const map = {};
    for (const s of scanned) map[s.char] = { contours: s.contours, adv: s.adv };
    if (!map[" "]) map[" "] = { contours: [], adv: 300 };
    try {
      const data = buildTTF(map, fontName);
      download(new Blob([data], { type: "font/ttf" }), (fontName.replace(/[^A-Za-z0-9]/g, "") || "GlyphTable") + ".ttf");
      setStatus("Compiled font from frames — install the .ttf file to use in your apps!");
    } catch (err) {
      setStatus(err.message === "empty" ? "The scanned frames have no artwork yet" : "Export failed");
    }
  };

  const proof = useMemo(() => {
    const items = [];
    let x = 0;
    for (const ch of sample) {
      const g = glyphs[ch];
      if (!g) continue;
      items.push({ ch, g, x });
      x += g.adv;
    }
    return { items, width: Math.max(x, 1) };
  }, [sample, glyphs]);

  const Btn = ({ on, children, style = {}, ...rest }) => (
    <button {...rest} style={{
      font: `600 11px ${MONO}`, letterSpacing: "0.08em", textTransform: "uppercase",
      color: on ? GROUND : INK, background: on ? GOLD : "rgba(255,255,255,0.06)",
      border: `1px solid ${on ? GOLD : GUIDE_SOFT}`, borderRadius: 4, padding: "7px 12px", cursor: "pointer",
      transition: "all 0.15s ease", ...style
    }}>{children}</button>
  );

  const Cell = ({ ch }) => {
    const g = glyphs[ch];
    const drawn = g && g.strokes.length > 0;
    const active = ch === current;
    return (
      <button onClick={() => setCurrent(ch)} title={ch === " " ? "space" : ch} style={{
        width: 38, height: 46, background: active ? "#1D3050" : drawn ? "#131F35" : "transparent",
        border: `1.5px solid ${active ? GOLD : drawn ? GUIDE_SOFT : "#1B2A42"}`, borderRadius: 3,
        cursor: "pointer", padding: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "transform 0.1s ease, border-color 0.15s ease",
      }}>
        {drawn ? (
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={30} height={36}>
            <g transform={`translate(0 ${TOP}) scale(1 -1)`}><GlyphArt glyph={g} color={active ? GOLD : INK} /></g>
          </svg>
        ) : (
          <span style={{ font: `500 12px ${MONO}`, color: active ? GOLD : "#41597A" }}>{ch === " " ? "␣" : ch}</span>
        )}
      </button>
    );
  };

  return (
    <div style={{ background: GROUND, color: INK, minHeight: "100%", padding: "20px 24px", fontFamily: DISPLAY, borderRadius: "0 0 12px 12px" }}>
      {/* Header Info */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14, marginBottom: 18, borderBottom: `1px solid ${GUIDE_SOFT}`, paddingBottom: 16 }}>
        <div>
          <div style={{ font: `600 10px ${MONO}`, letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase", marginBottom: 4, display: "flex", alignItems: "center", gap: "6px" }}>
            <span>✒️</span> TYPE DESIGN STUDIO · WEEK 11 WORKSPACE
          </div>
          <div style={{ font: `800 26px/1.1 ${DISPLAY}`, letterSpacing: "-0.02em", color: "#ffffff" }}>
            Glyph Table
          </div>
          <div style={{ font: `400 13px ${DISPLAY}`, color: DIM, marginTop: 4 }}>
            Draw custom display typography, title logos, and portfolio glyphs — export installable TrueType fonts (.ttf).
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: PANEL, border: `1px solid ${GUIDE_SOFT}`, borderRadius: 4, padding: "4px 8px" }}>
            <span style={{ font: `500 10px ${MONO}`, color: DIM }}>FONT NAME:</span>
            <input 
              value={fontName} 
              onChange={(e) => setFontName(e.target.value)} 
              spellCheck={false} 
              style={{
                font: `600 12px ${MONO}`, color: GOLD, background: "transparent", border: "none",
                outline: "none", width: 140
              }} 
            />
          </div>
          <Btn on={tab === "draw"} onClick={() => setTab("draw")}>Draw Canvas</Btn>
          <Btn on={tab === "frames"} onClick={() => setTab("frames")}>From Frames</Btn>
        </div>
      </div>

      {tab === "draw" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 360px) 1fr", gap: 20, alignItems: "start" }}>
            {/* Editor Canvas */}
            <div style={{ background: PANEL, border: `1px solid ${GUIDE_SOFT}`, borderRadius: 8, padding: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ font: `600 11px ${MONO}`, letterSpacing: "0.15em", color: GOLD }}>
                  GLYPH: {current === " " ? "SPACE" : `"${current}" (U+${current.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")})`}
                </span>
                <span style={{ font: `500 11px ${MONO}`, color: DIM }}>{glyph.strokes.length} stroke{glyph.strokes.length === 1 ? "" : "s"}</span>
              </div>

              {/* Drawing Area */}
              <svg 
                ref={svgRef} 
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} 
                width="100%" 
                height="340"
                style={{ 
                  display: "block", background: "#0B1425", borderRadius: 6, touchAction: "none", 
                  cursor: current === " " ? "not-allowed" : tool === "draw" ? "crosshair" : "cell",
                  border: `1px solid ${GUIDE_SOFT}`, userSelect: "none"
                }}
                onPointerDown={onDown} 
                onPointerMove={onMove} 
                onPointerUp={onUp} 
                onPointerCancel={onUp}
              >
                {ghost && current !== " " && (
                  <text x={18} y={TOP - 40} fontSize={900} fill="#182E47" fontFamily={DISPLAY} fontWeight="600" opacity={0.7}>{current}</text>
                )}
                <g transform={`translate(0 ${TOP}) scale(1 -1)`}>
                  {/* Metric Guides */}
                  {[
                    [ASCENDER, "Ascender 800"],
                    [CAP, "Cap 700"],
                    [XH, "x-Height 500"],
                    [0, "Baseline 0"],
                    [DESCENDER, "Descender -200"]
                  ].map(([y, label]) => (
                    <g key={y}>
                      <line 
                        x1={0} y1={y} x2={VIEW_W} y2={y}
                        stroke={y === 0 ? GUIDE : GUIDE_SOFT} 
                        strokeWidth={y === 0 ? 3 : 1.5}
                        strokeDasharray={y === 0 ? "none" : "8 10"} 
                      />
                    </g>
                  ))}
                  {/* Advance Width Guide */}
                  <line x1={glyph.adv} y1={BOTTOM} x2={glyph.adv} y2={TOP} stroke={GOLD} strokeWidth={2} strokeDasharray="6 8" opacity={0.85} />
                  <GlyphArt glyph={glyph} />
                  {live && <GlyphArt glyph={{ strokes: [live] }} color={GOLD} />}
                </g>
              </svg>

              {/* Tool Buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                <Btn on={tool === "draw"} onClick={() => setTool("draw")}>✏️ Draw</Btn>
                <Btn on={tool === "erase"} onClick={() => setTool("erase")}>🧹 Erase</Btn>
                <Btn onClick={undo}>↩ Undo</Btn>
                <Btn onClick={clearGlyph}>🗑 Clear</Btn>
                <Btn on={ghost} onClick={() => setGhost(!ghost)}>👁 Trace Ghost</Btn>
              </div>

              {/* Sliders */}
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 45px", gap: 8, alignItems: "center", marginTop: 14, background: "rgba(0,0,0,0.2)", padding: "10px 12px", borderRadius: 6 }}>
                <span style={{ font: `600 10px ${MONO}`, color: DIM }}>NIB SIZE</span>
                <input type="range" min={12} max={140} value={nib} onChange={(e) => setNib(+e.target.value)} style={{ accentColor: GOLD }} />
                <span style={{ font: `600 11px ${MONO}`, textAlign: "right", color: INK }}>{nib}px</span>

                <span style={{ font: `600 10px ${MONO}`, color: DIM }}>ADVANCE</span>
                <input type="range" min={120} max={1000} step={10} value={glyph.adv} onChange={(e) => setAdv(+e.target.value)} style={{ accentColor: GOLD }} />
                <span style={{ font: `600 11px ${MONO}`, color: GOLD, textAlign: "right" }}>{glyph.adv}</span>
              </div>

              {/* Actions & Export */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, borderTop: `1px solid ${GUIDE_SOFT}`, paddingTop: 12 }}>
                <Btn on onClick={exportDrawTTF} style={{ flex: "1 1 100%", justifyContent: "center", padding: "10px 14px", fontSize: "12px" }}>
                  💾 Export .ttf Font
                </Btn>
                <Btn onClick={copySVGOrPlace} style={{ flex: 1 }}>📋 Copy Vector Path</Btn>
                <Btn onClick={exportJSON}>Save JSON</Btn>
                <Btn onClick={() => fileRef.current?.click()}>Load JSON</Btn>
                <input ref={fileRef} type="file" accept="application/json" onChange={importJSON} style={{ display: "none" }} />
              </div>
            </div>

            {/* Character Map */}
            <div style={{ background: PANEL, border: `1px solid ${GUIDE_SOFT}`, borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ font: `600 11px ${MONO}`, letterSpacing: "0.15em", color: GOLD, textTransform: "uppercase" }}>CHARACTER GLYPH MAP</span>
                <span style={{ font: `600 11px ${MONO}`, color: drawnCount > 0 ? GOLD : DIM, background: "rgba(216, 178, 95, 0.1)", padding: "2px 8px", borderRadius: 12 }}>
                  {drawnCount} of {ALL_CHARS.length} Drawn
                </span>
              </div>
              <div style={{ maxHeight: 480, overflowY: "auto", paddingRight: 6 }}>
                {ROWS.map((row) => (
                  <div key={row.label} style={{ marginBottom: 14 }}>
                    <div style={{ font: `600 9px ${MONO}`, letterSpacing: "0.18em", color: "#6485AD", marginBottom: 6, textTransform: "uppercase" }}>
                      {row.label}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {row.chars.map((ch) => <Cell key={ch} ch={ch} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Proof Line Tester */}
          <div style={{ background: PANEL, border: `1px solid ${GUIDE_SOFT}`, borderRadius: 8, padding: 16, marginTop: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ font: `600 11px ${MONO}`, letterSpacing: "0.15em", color: GOLD }}>LIVE PROOFING STRING:</span>
              <input 
                value={sample} 
                onChange={(e) => setSample(e.target.value)} 
                style={{
                  font: `600 13px ${MONO}`, color: INK, background: "#0B1425", border: `1px solid ${GUIDE_SOFT}`,
                  borderRadius: 4, padding: "8px 12px", flex: 1, minWidth: 200
                }} 
              />
            </div>
            <div style={{ background: "#0B1425", border: `1px solid ${GUIDE_SOFT}`, borderRadius: 6, padding: "16px 20px", overflowX: "auto" }}>
              <svg 
                viewBox={`0 ${-ASCENDER} ${proof.width} ${ASCENDER - DESCENDER}`} 
                height={80}
                width={Math.max(120, (proof.width / (ASCENDER - DESCENDER)) * 80)} 
                style={{ display: "block" }}
              >
                <g transform="scale(1 -1)">
                  <line x1={0} y1={0} x2={proof.width} y2={0} stroke={GUIDE_SOFT} strokeWidth={2} />
                  {proof.items.map((it, i) => (
                    <g key={i} transform={`translate(${it.x} 0)`}><GlyphArt glyph={it.g} /></g>
                  ))}
                </g>
              </svg>
            </div>
          </div>
        </>
      )}

      {tab === "frames" && (
        <div style={{ background: PANEL, border: `1px solid ${GUIDE_SOFT}`, borderRadius: 8, padding: 20 }}>
          <div style={{ font: `400 13px/1.6 ${DISPLAY}`, color: INK, marginBottom: 14 }}>
            <strong>Figma Pen-Tool Compiler:</strong> Draw letters with the pen tool inside frames named after each character
            (<code>"A"</code>, <code>"a"</code>, <code>"7"</code>, or <code>"space"</code>, <code>"comma"</code>). Frame top is the ascender, frame bottom is the descender, and frame width becomes the letter's advance width.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <Btn on onClick={scan}>{scanning ? "Scanning…" : "Scan Connected Frames"}</Btn>
            {scanned && scanned.some((s) => !s.empty) && <Btn on onClick={exportFramesTTF}>Compile .ttf From Frames</Btn>}
          </div>

          {scanned && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 380, overflowY: "auto" }}>
              {scanned.map((s, i) => (
                <div key={i} title={s.name} style={{
                  width: 70, height: 90, background: "#131F35", border: `1px solid ${s.empty ? "#1B2A42" : GUIDE_SOFT}`,
                  borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                }}>
                  <svg viewBox={`0 ${-ASCENDER} ${Math.max(s.adv, 200)} ${ASCENDER - DESCENDER}`} width={52} height={62}>
                    <g transform="scale(1 -1)">
                      {s.contours.map((c, j) => (
                        <path key={j} d={contourToSvg(c)} fill={INK} fillRule="nonzero" />
                      ))}
                    </g>
                  </svg>
                  <span style={{ font: `600 10px ${MONO}`, color: s.empty ? "#41597A" : GOLD }}>
                    {s.char === " " ? "SP" : s.char}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Bar */}
      <div style={{ font: `500 11px ${MONO}`, color: status ? GOLD : DIM, marginTop: 16, minHeight: 18, display: "flex", alignItems: "center", gap: 6 }}>
        <span>💡</span> {status || "Draw your letters on the canvas, customize nib & advance spacing, then export an installable TrueType (.ttf) font for your portfolio."}
      </div>
    </div>
  );
}

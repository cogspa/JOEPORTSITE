import React, { useEffect, useRef, useState } from "react";
import { topicList } from "../content/week03Topics.js";
import TopicNav from "./TopicNav.jsx";

/* =========================================================================
   BLOCK-OUT STUDY — six-phase digital painting pipeline (React port)
   Pure Canvas 2D, zero dependencies. Deterministic (seeded RNG).
   Phases: shape → value → color → light → form → detail
   Algorithm parameters locked to the HTML version:
   POSW=220, ANALYSIS_W=170, MAX_EDGE=1000, seeds 42 / 1337 / 9001
   ========================================================================= */

const PHASES = [
  "fine the shapes",
  "greyscale block out",
  "local_colors",
  "gradients added",
  "lasso and noisy brush",
  "more detailed brush",
];

const MAX_EDGE = 1000;
const ANALYSIS_W = 170;
const POSW = 220;

/* ---------- tokens: pLAtform design system ---------- */
const T = {
  oxblood: "#8b3a2f",
  paper: "#f5efe1",
  ink: "#241f1a",
  artboard: "#7f7f7f",
  panel: "#6e6e6e",
  line: "#d9cfba",
  faded: "#7a6f5c",
  mono: '"IBM Plex Mono", ui-monospace, monospace',
  serif: '"Newsreader", Georgia, serif',
};

/* ---------- pure helpers (no React) ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const mkCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(v)));
const lighten = (c, t) => [clamp255(c[0] + (255 - c[0]) * t), clamp255(c[1] + (255 - c[1]) * t), clamp255(c[2] + (255 - c[2]) * t)];
const savePNG = (cv, name) => { const a = document.createElement("a"); a.download = name; a.href = cv.toDataURL("image/png"); a.click(); };
const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 20)));

const DIRS = [[-1,-1],[0,-1],[1,-1],[-1,0],null,[1,0],[-1,1],[0,1],[1,1]];
const GLYPH = ["↖","↑","↗","←","·","→","↙","↓","↘"];

export default function BlockOutStudy() {
  /* ---------- UI state ---------- */
  const [shapeK, setShapeK] = useState(6);
  const [light, setLight] = useState([-1, -1]);
  const [hasImage, setHasImage] = useState(false);
  const [running, setRunning] = useState(false);
  const [statuses, setStatuses] = useState(Array(6).fill("queued"));
  const [ready, setReady] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dims, setDims] = useState([0, 0]);

  /* ---------- pipeline state (never in React state) ---------- */
  const S = useRef({ srcCanvas: null, srcData: null, W: 0, H: 0, labels: null, k: 0, clusters: [] });
  const canvasRefs = useRef([...Array(6)].map(() => React.createRef()));
  const fileRef = useRef(null);
  const lightRef = useRef(light);
  const shapeKRef = useRef(shapeK);
  lightRef.current = light;
  shapeKRef.current = shapeK;

  /* ---------- fonts ---------- */
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&display=swap";
    document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, []);

  /* ---------- image loading ---------- */
  function loadFile(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); setImage(img); };
    img.src = url;
  }

  function setImage(img) {
    const st = S.current;
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    st.W = Math.round(img.width * scale);
    st.H = Math.round(img.height * scale);
    st.srcCanvas = mkCanvas(st.W, st.H);
    st.srcCanvas.getContext("2d").drawImage(img, 0, 0, st.W, st.H);
    st.srcData = st.srcCanvas.getContext("2d").getImageData(0, 0, st.W, st.H);
    setDims([st.W, st.H]);
    setHasImage(true);
    setReady(false);
    // auto-run once canvases have resized
    requestAnimationFrame(() => run());
  }

  function demoImage() {
    const w = 760, h = 1000, c = mkCanvas(w, h), x = c.getContext("2d");
    const rnd = mulberry32(7);
    let g = x.createLinearGradient(0, 0, 0, h * 0.62);
    g.addColorStop(0, "#1e63c8"); g.addColorStop(1, "#8fb8e8");
    x.fillStyle = g; x.fillRect(0, 0, w, h * 0.65);
    const spire = (cx, topY, baseY, tw, bw, hue) => {
      x.beginPath();
      x.moveTo(cx - bw / 2, baseY);
      x.bezierCurveTo(cx - bw * 0.45, (topY + baseY) / 2, cx - tw * 0.7, topY + 40, cx - tw / 2, topY);
      x.quadraticCurveTo(cx, topY - 24, cx + tw / 2, topY + 10);
      x.bezierCurveTo(cx + tw * 0.65, (topY + baseY) / 2, cx + bw * 0.5, baseY - 30, cx + bw / 2, baseY);
      x.closePath(); x.fillStyle = hue; x.fill();
      for (let i = 0; i < 900; i++) {
        const px = cx - bw / 2 + rnd() * bw, py = topY + rnd() * (baseY - topY);
        x.fillStyle = `rgba(${(60 + rnd() * 60) | 0},${(30 + rnd() * 40) | 0},${(20 + rnd() * 30) | 0},${0.05 + rnd() * 0.2})`;
        x.fillRect(px, py, 2 + rnd() * 3, 8 + rnd() * 26);
      }
    };
    spire(170, 150, 660, 120, 190, "#9a5636");
    spire(390, 200, 660, 100, 150, "#8a4a2e");
    spire(600, 90, 660, 130, 200, "#a05a38");
    x.beginPath(); x.moveTo(0, 620);
    x.quadraticCurveTo(w * 0.3, 560, w * 0.55, 610);
    x.quadraticCurveTo(w * 0.8, 660, w, 600);
    x.lineTo(w, h * 0.8); x.lineTo(0, h * 0.8); x.closePath();
    x.fillStyle = "#b0713f"; x.fill();
    for (let i = 0; i < 1600; i++) {
      x.fillStyle = `rgba(${(90 + rnd() * 80) | 0},${(50 + rnd() * 50) | 0},${(25 + rnd() * 25) | 0},${0.04 + rnd() * 0.16})`;
      x.fillRect(rnd() * w, 570 + rnd() * 220, 2 + rnd() * 4, 2 + rnd() * 4);
    }
    x.beginPath(); x.moveTo(0, h);
    x.lineTo(0, 780); x.quadraticCurveTo(w * 0.35, 700, w * 0.6, 790);
    x.quadraticCurveTo(w * 0.85, 870, w, 800); x.lineTo(w, h); x.closePath();
    x.fillStyle = "#6f3d22"; x.fill();
    for (let i = 0; i < 1800; i++) {
      x.fillStyle = `rgba(${(50 + rnd() * 70) | 0},${(25 + rnd() * 40) | 0},${(12 + rnd() * 22) | 0},${0.05 + rnd() * 0.2})`;
      x.fillRect(rnd() * w, 700 + rnd() * 300, 2 + rnd() * 5, 2 + rnd() * 5);
    }
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = c.toDataURL();
  }

  /* ---------- segmentation ---------- */
  function segment(k) {
    const st = S.current;
    const aw = ANALYSIS_W, ah = Math.round((st.H * aw) / st.W);
    const small = mkCanvas(aw, ah);
    small.getContext("2d").drawImage(st.srcCanvas, 0, 0, aw, ah);
    const d = small.getContext("2d").getImageData(0, 0, aw, ah).data;
    const n = aw * ah;
    const F = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      F[i * 4] = d[i * 4]; F[i * 4 + 1] = d[i * 4 + 1]; F[i * 4 + 2] = d[i * 4 + 2];
      F[i * 4 + 3] = (((i / aw) | 0) / ah) * POSW;
    }
    const rnd = mulberry32(42);
    const C = new Float32Array(k * 4);
    for (let c = 0; c < k; c++) {
      const y = Math.min(ah - 1, Math.floor(((c + 0.5) / k) * ah));
      const xr = Math.floor(rnd() * aw);
      const i = y * aw + xr;
      C.set(F.subarray(i * 4, i * 4 + 4), c * 4);
    }
    let labels = new Uint8Array(n);
    for (let iter = 0; iter < 14; iter++) {
      const sum = new Float64Array(k * 4), cnt = new Uint32Array(k);
      for (let i = 0; i < n; i++) {
        let best = 0, bd = 1e18;
        for (let c = 0; c < k; c++) {
          const dr = F[i * 4] - C[c * 4], dg = F[i * 4 + 1] - C[c * 4 + 1],
                db = F[i * 4 + 2] - C[c * 4 + 2], dy = F[i * 4 + 3] - C[c * 4 + 3];
          const dist = dr * dr + dg * dg + db * db + dy * dy;
          if (dist < bd) { bd = dist; best = c; }
        }
        labels[i] = best; cnt[best]++;
        for (let j = 0; j < 4; j++) sum[best * 4 + j] += F[i * 4 + j];
      }
      for (let c = 0; c < k; c++) {
        if (!cnt[c]) { const i = Math.floor(rnd() * n); C.set(F.subarray(i * 4, i * 4 + 4), c * 4); continue; }
        for (let j = 0; j < 4; j++) C[c * 4 + j] = sum[c * 4 + j] / cnt[c];
      }
    }
    for (let pass = 0; pass < 2; pass++) {
      const out = new Uint8Array(labels);
      for (let y = 1; y < ah - 1; y++) for (let x = 1; x < aw - 1; x++) {
        const counts = {};
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const l = labels[(y + dy) * aw + (x + dx)];
          counts[l] = (counts[l] || 0) + 1;
        }
        let best = labels[y * aw + x], bc = 0;
        for (const key in counts) if (counts[key] > bc) { bc = counts[key]; best = +key; }
        out[y * aw + x] = best;
      }
      labels = out;
    }
    const W = st.W, H = st.H;
    const masks = [];
    for (let c = 0; c < k; c++) {
      const mc = mkCanvas(aw, ah), mx = mc.getContext("2d");
      const id = mx.createImageData(aw, ah);
      for (let i = 0; i < n; i++) { const v = labels[i] === c ? 255 : 0; id.data[i * 4] = v; id.data[i * 4 + 3] = 255; }
      mx.putImageData(id, 0, 0);
      const big = mkCanvas(W, H), bx = big.getContext("2d");
      bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = "high";
      bx.drawImage(mc, 0, 0, W, H);
      const bd = bx.getImageData(0, 0, W, H).data;
      const arr = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) arr[i] = bd[i * 4];
      masks.push(arr);
    }
    const full = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      let best = 0, bv = -1;
      for (let c = 0; c < k; c++) if (masks[c][i] > bv) { bv = masks[c][i]; best = c; }
      full[i] = best;
    }
    st.labels = full; st.k = k;

    const src = st.srcData.data;
    const stats = [];
    for (let c = 0; c < k; c++) stats.push({ r: 0, g: 0, b: 0, y: 0, x: 0, count: 0, minX: W, minY: H, maxX: 0, maxY: 0 });
    for (let i = 0; i < W * H; i++) {
      const c = full[i], s2 = stats[c], px = i % W, py = (i / W) | 0;
      s2.r += src[i * 4]; s2.g += src[i * 4 + 1]; s2.b += src[i * 4 + 2];
      s2.x += px; s2.y += py; s2.count++;
      if (px < s2.minX) s2.minX = px; if (px > s2.maxX) s2.maxX = px;
      if (py < s2.minY) s2.minY = py; if (py > s2.maxY) s2.maxY = py;
    }
    st.clusters = stats.map((s2, c) => ({
      id: c,
      meanColor: s2.count ? [s2.r / s2.count, s2.g / s2.count, s2.b / s2.count] : [128, 128, 128],
      meanY: s2.count ? s2.y / s2.count : 0,
      cx: s2.count ? s2.x / s2.count : 0,
      cy: s2.count ? s2.y / s2.count : 0,
      count: s2.count,
      bbox: [s2.minX, s2.minY, s2.maxX, s2.maxY],
    }));
    const order = [...st.clusters].sort((a, b) => a.meanY - b.meanY);
    order.forEach((cl, rank) => {
      cl.depthRank = rank;
      const t = order.length > 1 ? rank / (order.length - 1) : 0;
      cl.gray = Math.round(246 - t * 216);
      const [r, g, b] = cl.meanColor;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const f = lum > 1 ? 1 + 0.55 * ((cl.gray - lum) / lum) : 1;
      cl.tint = [clamp255(r * f), clamp255(g * f), clamp255(b * f)];
    });
  }

  /* ---------- shared raster helpers ---------- */
  function boundaryMap() {
    const st = S.current, { labels } = st, W = st.W, H = st.H;
    const b = new Uint8Array(W * H);
    for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
      const i = y * W + x;
      if (labels[i] !== labels[i + 1] || labels[i] !== labels[i + W]) b[i] = 1;
    }
    return b;
  }

  function distToBoundary() {
    const st = S.current, W = st.W, H = st.H, b = boundaryMap();
    const D = new Float32Array(W * H).fill(1e7);
    for (let i = 0; i < W * H; i++) if (b[i]) D[i] = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (x > 0) D[i] = Math.min(D[i], D[i - 1] + 1);
      if (y > 0) D[i] = Math.min(D[i], D[i - W] + 1);
      if (x > 0 && y > 0) D[i] = Math.min(D[i], D[i - W - 1] + 1.4);
      if (x < W - 1 && y > 0) D[i] = Math.min(D[i], D[i - W + 1] + 1.4);
    }
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      if (x < W - 1) D[i] = Math.min(D[i], D[i + 1] + 1);
      if (y < H - 1) D[i] = Math.min(D[i], D[i + W] + 1);
      if (x < W - 1 && y < H - 1) D[i] = Math.min(D[i], D[i + W + 1] + 1.4);
      if (x > 0 && y < H - 1) D[i] = Math.min(D[i], D[i + W - 1] + 1.4);
    }
    return D;
  }

  function fillFlat(ctx, colorFor) {
    const st = S.current, W = st.W, H = st.H, L = st.labels;
    const id = ctx.createImageData(W, H), d = id.data;
    const lut = st.clusters.map(colorFor);
    for (let i = 0; i < W * H; i++) {
      const c = lut[L[i]];
      d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255;
    }
    ctx.putImageData(id, 0, 0);
  }

  /* ---------- the six phases ---------- */
  function phase1(cv) {
    const st = S.current, ctx = cv.getContext("2d");
    ctx.drawImage(st.srcCanvas, 0, 0);
    const W = st.W, H = st.H, b = boundaryMap();
    const id = ctx.getImageData(0, 0, W, H), d = id.data;
    const paint = (i) => { d[i * 4] = 226; d[i * 4 + 1] = 28; d[i * 4 + 2] = 34; d[i * 4 + 3] = 255; };
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (!b[y * W + x]) continue;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) paint((y + dy) * W + (x + dx));
    }
    ctx.putImageData(id, 0, 0);
    const order = [...st.clusters].sort((a, b2) => a.depthRank - b2.depthRank);
    const tag = (cl, label) => {
      const r = Math.max(20, st.W * 0.035);
      ctx.beginPath(); ctx.arc(cl.cx, cl.cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(20,20,20,0.85)"; ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `600 ${Math.round(r * 0.72)}px ${T.mono}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(label, cl.cx, cl.cy + 1);
    };
    tag(order[0], "BG");
    tag(order[order.length - 1], "FG");
    if (order.length > 2) tag(order[Math.floor(order.length / 2)], "MG");
  }

  function phase2(cv) { fillFlat(cv.getContext("2d"), (cl) => [cl.gray, cl.gray, cl.gray]); }
  function phase3(cv) { fillFlat(cv.getContext("2d"), (cl) => cl.tint); }

  function phase4(cv) {
    const st = S.current, ctx = cv.getContext("2d");
    ctx.drawImage(canvasRefs.current[2].current, 0, 0);
    const W = st.W, H = st.H, L = st.labels;
    const [lx, ly] = lightRef.current;
    const len = Math.hypot(lx, ly) || 1, ux = lx / len, uy = ly / len;
    const proj = st.clusters.map((cl) => {
      const [x0, y0, x1, y1] = cl.bbox;
      const corners = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([px, py]) => px * -ux + py * -uy);
      return { min: Math.min(...corners), max: Math.max(...corners), tint: lighten(cl.tint, 0.5) };
    });
    const id = ctx.getImageData(0, 0, W, H), d = id.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, p = proj[L[i]];
      const range = p.max - p.min || 1;
      const t = (x * -ux + y * -uy - p.min) / range;
      const a = Math.min(0.85, 0.85 * Math.pow(Math.max(0, 1 - t / 0.8), 1.5));
      if (a <= 0.003) continue;
      d[i * 4] = clamp255(d[i * 4] * (1 - a) + p.tint[0] * a);
      d[i * 4 + 1] = clamp255(d[i * 4 + 1] * (1 - a) + p.tint[1] * a);
      d[i * 4 + 2] = clamp255(d[i * 4 + 2] * (1 - a) + p.tint[2] * a);
    }
    ctx.putImageData(id, 0, 0);
  }

  function phase5(cv) {
    const st = S.current, ctx = cv.getContext("2d");
    ctx.drawImage(canvasRefs.current[3].current, 0, 0);
    const W = st.W, H = st.H, L = st.labels, src = st.srcData.data;
    const D = distToBoundary();
    const band = Math.max(8, Math.round(Math.min(W, H) * 0.03));
    const rnd = mulberry32(1337);
    const dabs = Math.round(W * H * 0.045);
    const id = ctx.getImageData(0, 0, W, H), d = id.data;
    for (let n = 0; n < dabs; n++) {
      const x = (rnd() * W) | 0, y = (rnd() * H) | 0, i = y * W + x;
      const nearEdge = D[i] < band;
      if (!nearEdge && rnd() > 0.12) continue;
      const cl = st.clusters[L[i]];
      const mix = nearEdge ? 0.55 : 0.3;
      const a = nearEdge ? 0.25 + rnd() * 0.35 : 0.08 + rnd() * 0.15;
      const jit = (rnd() - 0.5) * 44;
      const cr = clamp255(cl.tint[0] * (1 - mix) + src[i * 4] * mix + jit);
      const cg = clamp255(cl.tint[1] * (1 - mix) + src[i * 4 + 1] * mix + jit);
      const cb = clamp255(cl.tint[2] * (1 - mix) + src[i * 4 + 2] * mix + jit);
      const sz = 1 + ((rnd() * 3) | 0);
      for (let dy = 0; dy < sz; dy++) for (let dx = 0; dx < sz; dx++) {
        const px = x + dx, py = y + dy;
        if (px >= W || py >= H) continue;
        const j = py * W + px;
        if (L[j] !== L[i]) continue;
        d[j * 4] = clamp255(d[j * 4] * (1 - a) + cr * a);
        d[j * 4 + 1] = clamp255(d[j * 4 + 1] * (1 - a) + cg * a);
        d[j * 4 + 2] = clamp255(d[j * 4 + 2] * (1 - a) + cb * a);
      }
    }
    ctx.putImageData(id, 0, 0);
  }

  function phase6(cv) {
    const st = S.current, ctx = cv.getContext("2d");
    ctx.drawImage(canvasRefs.current[4].current, 0, 0);
    const blur = mkCanvas(st.W, st.H), bx = blur.getContext("2d");
    if (typeof bx.filter === "string") {
      bx.filter = `blur(${Math.max(2, st.W * 0.004)}px)`;
      bx.drawImage(st.srcCanvas, 0, 0);
    } else {
      const q = mkCanvas(Math.max(1, st.W >> 2), Math.max(1, st.H >> 2));
      q.getContext("2d").drawImage(st.srcCanvas, 0, 0, q.width, q.height);
      bx.imageSmoothingEnabled = true;
      bx.drawImage(q, 0, 0, st.W, st.H);
    }
    ctx.globalAlpha = 0.35; ctx.globalCompositeOperation = "soft-light";
    ctx.drawImage(blur, 0, 0);
    ctx.globalAlpha = 0.22; ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(blur, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    const W = st.W, H = st.H, L = st.labels, src = st.srcData.data;
    const rnd = mulberry32(9001);
    const id = ctx.getImageData(0, 0, W, H), d = id.data;
    const dabs = Math.round(W * H * 0.02);
    for (let n = 0; n < dabs; n++) {
      const x = (rnd() * W) | 0, y = (rnd() * H) | 0, i = y * W + x;
      const a = 0.15 + rnd() * 0.25, jit = (rnd() - 0.5) * 30;
      const cr = clamp255(src[i * 4] + jit), cg = clamp255(src[i * 4 + 1] + jit), cb = clamp255(src[i * 4 + 2] + jit);
      const sz = 1 + ((rnd() * 2) | 0);
      for (let dy = 0; dy < sz; dy++) for (let dx = 0; dx < sz; dx++) {
        const px = x + dx, py = y + dy;
        if (px >= W || py >= H) continue;
        const j = py * W + px;
        if (L[j] !== L[i]) continue;
        d[j * 4] = clamp255(d[j * 4] * (1 - a) + cr * a);
        d[j * 4 + 1] = clamp255(d[j * 4 + 1] * (1 - a) + cg * a);
        d[j * 4 + 2] = clamp255(d[j * 4 + 2] * (1 - a) + cb * a);
      }
    }
    ctx.putImageData(id, 0, 0);
  }

  /* ---------- run ---------- */
  const runningRef = useRef(false);
  async function run() {
    const st = S.current;
    if (runningRef.current || !st.srcData) return;
    runningRef.current = true;
    setRunning(true); setReady(false);
    setStatuses(Array(6).fill("queued"));
    await frame();

    // size the visible canvases
    canvasRefs.current.forEach((r) => {
      if (r.current) { r.current.width = st.W; r.current.height = st.H; }
    });
    segment(shapeKRef.current);

    const fns = [phase1, phase2, phase3, phase4, phase5, phase6];
    for (let i = 0; i < 6; i++) {
      setStatuses((s) => s.map((v, j) => (j === i ? "painting…" : v)));
      await frame();
      fns[i](canvasRefs.current[i].current);
      setStatuses((s) => s.map((v, j) => (j === i ? "done" : v)));
      await frame();
    }
    runningRef.current = false;
    setRunning(false); setReady(true);
  }

  /* ---------- exports ---------- */
  function exportFinal() { savePNG(canvasRefs.current[5].current, "blockout-study-final.png"); }
  function exportSheet() {
    const st = S.current;
    const pad = 26, lab = 30, pw = 340;
    const ph = Math.round((pw * st.H) / st.W);
    const W = pad + (pw + pad) * 6, H = pad + lab + ph + pad;
    const c = mkCanvas(W, H), x = c.getContext("2d");
    x.fillStyle = "#7f7f7f"; x.fillRect(0, 0, W, H);
    x.font = `600 14px ${T.mono}`; x.textBaseline = "alphabetic";
    PHASES.forEach((name, i) => {
      const px = pad + (pw + pad) * i;
      x.fillStyle = "#f2f2f2"; x.fillText(`${i + 1} · ${name}`, px, pad + 16);
      x.drawImage(canvasRefs.current[i].current, px, pad + lab, pw, ph);
    });
    savePNG(c, "blockout-study-contact-sheet.png");
  }

  /* ---------- styles ---------- */
  const btn = {
    fontFamily: T.mono, fontSize: 13, cursor: "pointer",
    border: `1.5px solid ${T.ink}`, background: "transparent", color: T.ink,
    padding: "9px 16px",
  };
  const btnPrimary = { ...btn, background: T.oxblood, borderColor: T.oxblood, color: T.paper, fontWeight: 600 };
  const btnDisabled = { opacity: 0.45, cursor: "default" };
  const ctl = {
    padding: "14px 20px", borderRight: `1px solid ${T.line}`,
    display: "flex", flexDirection: "column", gap: 8, justifyContent: "center",
  };
  const ctlLabel = { fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: T.faded };

  return (
    <div style={{ background: T.paper, color: T.ink, fontFamily: T.mono, fontSize: 14, minHeight: "100vh" }}>
      <style>{`
        .bos-btn:hover:not(:disabled){ background:${T.ink}; color:${T.paper}; }
        .bos-btn:focus-visible{ outline:3px solid ${T.oxblood}; outline-offset:2px; }
        .bos-btn-primary:hover:not(:disabled){ background:#6e2d24 !important; border-color:#6e2d24 !important; }
        .bos-dl:hover{ background:#e9e9e9 !important; color:#333 !important; }
        .bos-canvas{ opacity:.25; transition:opacity .4s; }
        .bos-canvas.ready{ opacity:1; }
        @media (prefers-reduced-motion: reduce){ .bos-canvas{ transition:none; } }
        .bos-strip::-webkit-scrollbar{ height:8px; }
        .bos-strip::-webkit-scrollbar-thumb{ background:#5c5c5c; }
      `}</style>

      {/* header */}
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8, padding: "22px 28px 14px", borderBottom: `2px solid ${T.ink}` }}>
        <h1 style={{ fontFamily: T.serif, fontWeight: 700, fontSize: 30, letterSpacing: "-0.01em", margin: 0 }}>
          Block-Out <em style={{ color: T.oxblood }}>Study</em>
        </h1>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: T.oxblood }}>
          six-phase painting pipeline · shape → value → color → light → form → detail
        </div>
      </header>

      {/* controls */}
      <div style={{ display: "flex", flexWrap: "wrap", borderBottom: `1px solid ${T.line}` }}>
        <div style={ctl}>
          <span style={ctlLabel}>Source image</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="bos-btn" style={btn} onClick={() => fileRef.current && fileRef.current.click()}>Load image…</button>
            <button className="bos-btn" style={btn} onClick={demoImage}>Use demo buttes</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => e.target.files[0] && loadFile(e.target.files[0])} />
          </div>
        </div>
        <div style={ctl}>
          <span style={ctlLabel}>Major shapes (4–10)</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="range" min={4} max={10} value={shapeK} style={{ accentColor: T.oxblood, width: 150 }}
              onChange={(e) => setShapeK(+e.target.value)} />
            <output style={{ fontWeight: 600, minWidth: "2ch", textAlign: "center" }}>{shapeK}</output>
          </div>
        </div>
        <div style={ctl}>
          <span style={ctlLabel}>Light direction</span>
          <div role="radiogroup" aria-label="Light direction" style={{ display: "grid", gridTemplateColumns: "repeat(3,26px)", gridTemplateRows: "repeat(3,26px)", gap: 2 }}>
            {DIRS.map((d, i) => d === null ? (
              <span key={i} aria-hidden="true" style={{ border: `1px dashed ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: T.faded }}>·</span>
            ) : (
              <button key={i} className="bos-btn" role="radio" aria-checked={light[0] === d[0] && light[1] === d[1]}
                aria-label={"light from " + GLYPH[i]}
                style={{ ...btn, padding: 0, fontSize: 12, borderWidth: 1, lineHeight: 1,
                  ...(light[0] === d[0] && light[1] === d[1] ? { background: T.oxblood, borderColor: T.oxblood, color: T.paper } : {}) }}
                onClick={() => setLight(d)}>{GLYPH[i]}</button>
            ))}
          </div>
        </div>
        <div style={{ ...ctl, borderRight: "none", marginLeft: "auto" }}>
          <span style={ctlLabel}>Run</span>
          <button className="bos-btn bos-btn-primary" style={{ ...btnPrimary, ...((running || !hasImage) ? btnDisabled : {}) }}
            disabled={running || !hasImage} onClick={run}>Run the study</button>
        </div>
      </div>

      {/* artboard */}
      <div style={{ background: T.artboard, padding: "26px 28px 30px", minHeight: 380 }}>
        {!hasImage && (
          <div
            style={{ border: `2px dashed ${dragOver ? T.paper : "#cfcfcf"}`, background: dragOver ? "rgba(255,255,255,.06)" : "transparent",
              color: "#e9e9e9", textAlign: "center", padding: "60px 20px", fontSize: 13, cursor: "pointer", marginBottom: 22 }}
            onClick={() => fileRef.current && fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}>
            <strong style={{ color: "#fff" }}>Drop an image here</strong> — or load one above.<br />
            The study finds 4–10 major shapes (FG / MG / BG), then paints through all six phases.
          </div>
        )}
        <div className="bos-strip" style={{ display: hasImage ? "flex" : "none", gap: 26, overflowX: "auto", paddingBottom: 8 }}>
          {PHASES.map((name, i) => (
            <div key={name} style={{ flex: "0 0 auto", width: "min(260px, 72vw)" }}>
              <div style={{ fontSize: 11, color: "#f2f2f2", marginBottom: 6, display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>{i + 1} · {name}</span>
                <span style={{ color: statuses[i] === "done" ? "#a8e0a2" : "#c9c9c9" }}>{statuses[i]}</span>
              </div>
              <canvas ref={canvasRefs.current[i]} className={"bos-canvas" + (statuses[i] === "done" ? " ready" : "")}
                width={dims[0] || 300} height={dims[1] || 400}
                style={{ display: "block", width: "100%", height: "auto", background: T.panel, boxShadow: "0 2px 10px rgba(0,0,0,.35)" }} />
              <button className="bos-btn bos-dl" style={{ ...btn, marginTop: 6, fontSize: 10, padding: "4px 8px", borderColor: "#e9e9e9", color: "#e9e9e9" }}
                disabled={statuses[i] !== "done"}
                onClick={() => savePNG(canvasRefs.current[i].current, `phase-${i + 1}-${name.replace(/\s+/g, "_")}.png`)}>
                download phase
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* exports */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", padding: "16px 28px", borderTop: `2px solid ${T.ink}` }}>
        <button className="bos-btn" style={{ ...btn, ...(ready ? {} : btnDisabled) }} disabled={!ready} onClick={exportFinal}>
          Export final painting (PNG)
        </button>
        <button className="bos-btn" style={{ ...btn, ...(ready ? {} : btnDisabled) }} disabled={!ready} onClick={exportSheet}>
          Export contact sheet — all 6 phases (PNG)
        </button>
        <span style={{ fontSize: 11, color: T.faded, marginLeft: "auto" }}>exports render at working resolution (long edge ≈ 1000 px)</span>
      </div>

      <footer style={{ padding: "10px 28px 26px", fontSize: 11, color: T.faded }}>
        Phase logic: <b style={{ color: T.oxblood }}>1</b> red-line shape find · <b style={{ color: T.oxblood }}>2</b> greyscale block-out, dark FG → light BG · <b style={{ color: T.oxblood }}>3</b> local color tints · <b style={{ color: T.oxblood }}>4</b> light-to-transparent gradients · <b style={{ color: T.oxblood }}>5</b> edge lasso + noise brush · <b style={{ color: T.oxblood }}>6</b> detail blend.
      </footer>
      <TopicNav topicList={topicList} topicKey="block-out-study" weekNum="03" />
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import { topicList } from "../content/week03Topics.js";
import TopicNav from "./TopicNav.jsx";

// ————————————————————————————————————————————————————————————————
// BRUSH FOUNDRY II — pLAtform multimode brush tip generator
// Eight mark families, one parameter framework:
//   SCATTER · SPATTER · BRISTLE · CLUMP · BLOB · CELL · HATCH · FOG
// Every tip renders black-on-white, exports as PNG or Photoshop
// .abr (v1 sampled). The shelf collects up to 10 tips and exports
// them as ONE multi-brush .abr set.
// Design system: oxblood / paper / IBM Plex Mono / Newsreader
// ————————————————————————————————————————————————————————————————

const OXBLOOD = "#8b3a2f";
const PAPER = "#f5efe1";
const INK = "#2a2320";
const LINE = "#d8cfba";

// —— seeded RNG (mulberry32) ——————————————————————————————————————
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// —— value-noise fBm for FOG ——————————————————————————————————————
function makeFbm(rand, gridSize = 65) {
  const octaveGrids = [];
  for (let o = 0; o < 6; o++) {
    const g = new Float32Array(gridSize * gridSize);
    for (let i = 0; i < g.length; i++) g[i] = rand();
    octaveGrids.push(g);
  }
  const smooth = (t) => t * t * (3 - 2 * t);
  const sample = (g, x, y) => {
    const n = gridSize - 1;
    const xi = Math.floor(x) % n;
    const yi = Math.floor(y) % n;
    const xf = smooth(x - Math.floor(x));
    const yf = smooth(y - Math.floor(y));
    const a = g[yi * gridSize + xi];
    const b = g[yi * gridSize + xi + 1];
    const c = g[(yi + 1) * gridSize + xi];
    const d = g[(yi + 1) * gridSize + xi + 1];
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  return (u, v, octaves, baseFreq) => {
    let val = 0, amp = 0.5, freq = baseFreq;
    for (let o = 0; o < octaves; o++) {
      val += amp * sample(octaveGrids[o], u * freq, v * freq);
      amp *= 0.5;
      freq *= 2;
    }
    return val;
  };
}

// —— .abr writer (v1 sampled, raw 8-bit, big-endian) ——————————————
// Same format as Brush Foundry: 255 = paints, 0 = transparent.
// Multi-brush: count in the header, blocks concatenated.
function buildABR(brushes, spacing = 25) {
  let total = 4; // version + count
  for (const b of brushes) total += 2 + 4 + 34 + b.pixels.length;
  const buf = new ArrayBuffer(total);
  const dv = new DataView(buf);
  let o = 0;
  dv.setInt16(o, 1); o += 2;                 // version 1
  dv.setInt16(o, brushes.length); o += 2;    // brush count
  for (const b of brushes) {
    const S = b.size;
    dv.setInt16(o, 2); o += 2;               // type 2 = sampled
    dv.setInt32(o, 34 + b.pixels.length); o += 4;
    dv.setInt32(o, 0); o += 4;               // misc
    dv.setInt16(o, spacing); o += 2;         // spacing %
    dv.setInt8(o, 1); o += 1;                // antialiasing
    dv.setInt16(o, 0); o += 2;               // short bounds
    dv.setInt16(o, 0); o += 2;
    dv.setInt16(o, S); o += 2;
    dv.setInt16(o, S); o += 2;
    dv.setInt32(o, 0); o += 4;               // long bounds
    dv.setInt32(o, 0); o += 4;
    dv.setInt32(o, S); o += 4;
    dv.setInt32(o, S); o += 4;
    dv.setInt16(o, 8); o += 2;               // 8-bit depth
    dv.setInt8(o, 0); o += 1;                // raw
    new Uint8Array(buf, o, b.pixels.length).set(b.pixels);
    o += b.pixels.length;
  }
  return new Blob([buf], { type: "application/octet-stream" });
}

function canvasToCoverage(canvas) {
  const S = canvas.width;
  const img = canvas.getContext("2d").getImageData(0, 0, S, S).data;
  const px = new Uint8Array(S * S);
  for (let i = 0; i < S * S; i++) px[i] = 255 - img[i * 4];
  return px;
}

// —— shared helpers ————————————————————————————————————————————————
function rimAlpha(d, edgeFade) {
  if (edgeFade <= 0) return 1;
  return Math.max(0.03, 1 - Math.pow(d, 6 / Math.max(0.25, edgeFade)) * edgeFade);
}

function softDot(ctx, x, y, size, softness) {
  ctx.beginPath();
  if (softness > 0.05) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(Math.max(0.01, 1 - softness), "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = "#000";
  }
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
}

// ————————————————————————————————————————————————————————————————
// MODE RENDERERS — each takes (ctx, S, p, rand)
// ————————————————————————————————————————————————————————————————

function renderScatter(ctx, S, p, rand) {
  const cx = S / 2, cy = S / 2, R = S / 2;
  for (let i = 0; i < p.dotCount; i++) {
    const t = Math.pow(rand(), 1 / p.densityBias);
    const angle = rand() * Math.PI * 2;
    const r = t * R;
    const x = cx + Math.cos(angle) * r + (rand() - 0.5) * p.jitter * R * 0.5;
    const y = cy + Math.sin(angle) * r + (rand() - 0.5) * p.jitter * R * 0.5;
    const d = Math.min(1, Math.hypot(x - cx, y - cy) / R);
    if (d >= 1) continue;
    const f = Math.pow(d, p.falloffCurve);
    let size = p.centerDot + (p.edgeDot - p.centerDot) * f;
    size *= 1 + (rand() - 0.5) * p.sizeNoise;
    if (size < 0.4) continue;
    ctx.globalAlpha = rimAlpha(d, p.edgeFade);
    softDot(ctx, x, y, size, p.softness);
  }
}

function renderSpatter(ctx, S, p, rand) {
  const cx = S / 2, cy = S / 2, R = S / 2;
  for (let i = 0; i < p.dropCount; i++) {
    // power-law: many tiny, few huge
    const u = Math.max(1e-4, rand());
    let size = p.minDrop * Math.pow(u, -1 / p.burst);
    size = Math.min(size, p.maxDrop);
    const t = Math.sqrt(rand());
    const angle = rand() * Math.PI * 2;
    const r = t * R * 0.96;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    const d = Math.min(1, r / R);
    // elongation grows with distance — droplets streak outward
    const aspect = 1 + p.stretch * d * 3;
    ctx.globalAlpha = rimAlpha(d, p.edgeFade);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, (size / 2) * aspect, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // satellite micro-drops trailing the big ones
    if (p.satellites > 0 && size > p.maxDrop * 0.35) {
      const n = Math.floor(p.satellites * 6);
      for (let s = 0; s < n; s++) {
        const off = size * (0.8 + rand() * 1.6);
        const oy = (rand() - 0.5) * size * 0.8;
        ctx.beginPath();
        ctx.arc(off, oy, Math.max(0.5, size * 0.08 * (0.5 + rand())), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

function renderBristle(ctx, S, p, rand) {
  const margin = S * 0.08;
  const usable = S - margin * 2;
  ctx.lineCap = "round";
  for (let i = 0; i < p.bristles; i++) {
    // skip unloaded bristles — the dry-brush gaps
    if (rand() < p.loadNoise * 0.6) continue;
    const x = margin + (i / (p.bristles - 1)) * usable + (rand() - 0.5) * (usable / p.bristles);
    const len = usable * p.length * (1 - rand() * p.lengthJitter * 0.6);
    const y0 = (S - len) / 2 + (rand() - 0.5) * S * 0.06;
    const drift = (rand() - 0.5) * S * 0.05;
    const w = Math.max(0.6, p.thickness * (0.5 + rand()));
    const alpha = 0.35 + rand() * 0.65 * (1 - p.ragged * 0.5) + (rand() < 0.3 ? 0 : p.ragged * 0.2);
    ctx.globalAlpha = Math.min(1, alpha);
    // taper: draw as segments shrinking toward the tip
    const segs = 10;
    for (let sgi = 0; sgi < segs; sgi++) {
      const u0 = sgi / segs, u1 = (sgi + 1) / segs;
      const taper = 1 - p.taper * u1;
      ctx.lineWidth = Math.max(0.4, w * taper);
      ctx.beginPath();
      ctx.moveTo(x + drift * u0, y0 + len * u0);
      ctx.lineTo(x + drift * u1, y0 + len * u1);
      ctx.strokeStyle = "#000";
      ctx.stroke();
      if (p.ragged > 0 && rand() < p.ragged * 0.25) sgi++; // skip a segment — broken load
    }
  }
}

function renderClump(ctx, S, p, rand) {
  const cx = S / 2, cy = S / 2, R = S / 2;
  for (let c = 0; c < p.clumps; c++) {
    const t = Math.pow(rand(), 1 / p.spreadBias);
    const angle = rand() * Math.PI * 2;
    const ccx = cx + Math.cos(angle) * t * R * 0.82;
    const ccy = cy + Math.sin(angle) * t * R * 0.82;
    const cr = p.clumpRadius * R;
    for (let i = 0; i < p.dotsPerClump; i++) {
      // gaussian-ish scatter inside the clump
      const g = (rand() + rand() + rand()) / 3;
      const a2 = rand() * Math.PI * 2;
      const x = ccx + Math.cos(a2) * g * cr;
      const y = ccy + Math.sin(a2) * g * cr;
      const d = Math.min(1, Math.hypot(x - cx, y - cy) / R);
      if (d >= 1) continue;
      let size = p.dotSize * (1 + (rand() - 0.5) * p.sizeNoise);
      if (size < 0.5) continue;
      ctx.globalAlpha = rimAlpha(d, p.edgeFade) * (0.55 + rand() * 0.45);
      if (p.leafiness > 0.05) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rand() * Math.PI * 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, size / 2, (size / 2) * (1 - p.leafiness * 0.7), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function renderBlob(ctx, S, p, rand) {
  const cx = S / 2, cy = S / 2, R = (S / 2) * p.coreSize;
  // periodic radius: layered sinusoids with random phase/amplitude
  const harmonics = [];
  for (let k = 2; k <= p.detail + 1; k++) {
    harmonics.push({ k, amp: (rand() * p.roughness) / Math.pow(k, 0.8), phase: rand() * Math.PI * 2 });
    harmonics.push({ k: k * 2 + 1, amp: (rand() * p.wobble * 0.4) / k, phase: rand() * Math.PI * 2 });
  }
  const radiusAt = (theta) => {
    let r = 1;
    for (const h of harmonics) r += h.amp * Math.sin(h.k * theta + h.phase);
    return Math.max(0.15, r) * R;
  };
  // fake soft edge: stacked silhouettes, biggest faintest
  const layers = p.softness > 0.05 ? 4 : 1;
  for (let L = layers - 1; L >= 0; L--) {
    const scale = 1 + (L / layers) * p.softness * 0.18;
    ctx.globalAlpha = L === 0 ? 1 : 0.18;
    ctx.beginPath();
    const steps = 240;
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * Math.PI * 2;
      const r = radiusAt(th) * scale;
      const x = cx + Math.cos(th) * r;
      const y = cy + Math.sin(th) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
  // rim speckle — crumbs breaking off the silhouette
  if (p.edgeNoise > 0) {
    const n = Math.floor(p.edgeNoise * 400);
    for (let i = 0; i < n; i++) {
      const th = rand() * Math.PI * 2;
      const r = radiusAt(th) * (0.92 + rand() * 0.22);
      ctx.globalAlpha = 0.5 + rand() * 0.5;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(th) * r, cy + Math.sin(th) * r, 0.6 + rand() * S * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderCell(ctx, S, p, rand) {
  const cx = S / 2, cy = S / 2, R = S / 2;
  const pts = [];
  for (let i = 0; i < p.cells; i++) pts.push({ x: rand() * S, y: rand() * S });
  const img = ctx.getImageData(0, 0, S, S);
  const data = img.data;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const d = Math.hypot(x - cx, y - cy) / R;
      if (d >= 1) continue;
      let f1 = 1e9, f2 = 1e9;
      for (const pt of pts) {
        const dd = (x - pt.x) ** 2 + (y - pt.y) ** 2;
        if (dd < f1) { f2 = f1; f1 = dd; }
        else if (dd < f2) f2 = dd;
      }
      const edge = Math.sqrt(f2) - Math.sqrt(f1); // 0 at cell borders
      const lineMask = Math.max(0, 1 - edge / p.lineWidth);
      let ink = Math.pow(lineMask, 1 + p.contrast * 3) + p.fill * 0.25;
      ink *= rimAlpha(d, p.edgeFade);
      if (ink <= 0.01) continue;
      const i4 = (y * S + x) * 4;
      const v = Math.round(255 * (1 - Math.min(1, ink)));
      if (v < data[i4]) { data[i4] = v; data[i4 + 1] = v; data[i4 + 2] = v; }
    }
  }
  ctx.putImageData(img, 0, 0);
}

function renderHatch(ctx, S, p, rand) {
  const cx = S / 2, cy = S / 2, R = S / 2 - 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.lineCap = "round";
  const pass = (angleDeg, weightScale) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((angleDeg * Math.PI) / 180);
    const span = S * 1.5;
    for (let yy = -span / 2; yy <= span / 2; yy += p.spacing) {
      const w = Math.max(0.4, p.weight * weightScale * (1 + (rand() - 0.5) * p.weightJitter * 1.6));
      ctx.lineWidth = w;
      ctx.globalAlpha = 0.6 + rand() * 0.4;
      ctx.beginPath();
      const segs = 24;
      for (let sgi = 0; sgi <= segs; sgi++) {
        const xx = -span / 2 + (sgi / segs) * span;
        const wobble = Math.sin(xx * 0.02 + yy) * p.wave * p.spacing * 0.5
          + (rand() - 0.5) * p.wave * 2;
        sgi === 0 ? ctx.moveTo(xx, yy + wobble) : ctx.lineTo(xx, yy + wobble);
      }
      ctx.strokeStyle = "#000";
      ctx.stroke();
    }
    ctx.restore();
  };
  pass(p.angle, 1);
  if (p.cross > 0.05) pass(p.angle + 75, p.cross);
  ctx.restore();
  // radial dissolve on top: erase toward rim with white speckle
  if (p.edgeFade > 0) {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 2600 * p.edgeFade; i++) {
      const th = rand() * Math.PI * 2;
      const rr = (0.55 + Math.pow(rand(), 0.5) * 0.45) * R;
      const d = rr / R;
      ctx.globalAlpha = Math.pow(d, 2) * p.edgeFade;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(th) * rr, cy + Math.sin(th) * rr, 1 + rand() * S * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#000";
  }
}

function renderFog(ctx, S, p, rand) {
  const fbm = makeFbm(rand);
  const cx = S / 2, cy = S / 2, R = S / 2;
  const img = ctx.getImageData(0, 0, S, S);
  const data = img.data;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const d = Math.hypot(x - cx, y - cy) / R;
      if (d >= 1) continue;
      let v = fbm(x / S, y / S, Math.round(p.octaves), p.scale);
      v = (v - 0.5) * (1 + p.contrast * 2) + 0.5;      // contrast around mid
      v = Math.min(1, Math.max(0, v)) * p.density;      // overall density
      v *= 1 - Math.pow(d, 2 / Math.max(0.15, p.radialFade)) * p.radialFade;
      if (p.grain > 0) v *= 1 - rand() * p.grain * 0.6;
      if (v <= 0.01) continue;
      const i4 = (y * S + x) * 4;
      const px = Math.round(255 * (1 - v));
      if (px < data[i4]) { data[i4] = px; data[i4 + 1] = px; data[i4 + 2] = px; }
    }
  }
  ctx.putImageData(img, 0, 0);
}

// ————————————————————————————————————————————————————————————————
// MODE REGISTRY — label, renderer, slider config, defaults
// ————————————————————————————————————————————————————————————————
const MODES = {
  SCATTER: {
    blurb: "chunky core radiating to fine grain — noise + texture",
    render: renderScatter,
    defaults: { dotCount: 900, centerDot: 46, edgeDot: 2.5, falloffCurve: 1.4, densityBias: 1.5, jitter: 0.35, sizeNoise: 0.6, softness: 0.15, edgeFade: 0.7 },
    sliders: [
      { key: "dotCount", label: "DOT COUNT", min: 50, max: 4000, step: 10 },
      { key: "centerDot", label: "CENTER DOT Ø", min: 2, max: 120, step: 1, unit: "px" },
      { key: "edgeDot", label: "EDGE DOT Ø", min: 0.5, max: 30, step: 0.5, unit: "px" },
      { key: "falloffCurve", label: "FALLOFF CURVE", min: 0.3, max: 4, step: 0.05, unit: "γ", hint: "γ < 1 stays chunky longer · γ > 1 shrinks fast" },
      { key: "densityBias", label: "DENSITY BIAS", min: 0.4, max: 3, step: 0.05, hint: "< 1 packs the center · > 1 pushes grain to the rim" },
      { key: "jitter", label: "JITTER", min: 0, max: 1, step: 0.01 },
      { key: "sizeNoise", label: "SIZE NOISE", min: 0, max: 1.5, step: 0.01 },
      { key: "softness", label: "DOT SOFTNESS", min: 0, max: 1, step: 0.01 },
      { key: "edgeFade", label: "EDGE DISSOLVE", min: 0, max: 1, step: 0.01 },
    ],
  },
  SPATTER: {
    blurb: "flicked ink — power-law droplets streaking outward",
    render: renderSpatter,
    defaults: { dropCount: 260, maxDrop: 70, minDrop: 2, burst: 2.2, stretch: 0.5, satellites: 0.5, edgeFade: 0.4 },
    sliders: [
      { key: "dropCount", label: "DROP COUNT", min: 20, max: 1200, step: 5 },
      { key: "maxDrop", label: "MAX DROP Ø", min: 10, max: 140, step: 1, unit: "px" },
      { key: "minDrop", label: "MIN DROP Ø", min: 1, max: 10, step: 0.5, unit: "px" },
      { key: "burst", label: "BURST", min: 1.2, max: 4, step: 0.05, unit: "α", hint: "higher α = fewer big drops, more mist" },
      { key: "stretch", label: "STREAK", min: 0, max: 1, step: 0.01, hint: "droplets elongate away from center" },
      { key: "satellites", label: "SATELLITES", min: 0, max: 1, step: 0.01, hint: "micro-drops trailing the big ones" },
      { key: "edgeFade", label: "EDGE DISSOLVE", min: 0, max: 1, step: 0.01 },
    ],
  },
  BRISTLE: {
    blurb: "dry brush — loaded and starved bristles, tapered drag",
    render: renderBristle,
    defaults: { bristles: 80, length: 0.75, lengthJitter: 0.5, thickness: 4, loadNoise: 0.45, taper: 0.6, ragged: 0.5 },
    sliders: [
      { key: "bristles", label: "BRISTLES", min: 10, max: 220, step: 1 },
      { key: "length", label: "LENGTH", min: 0.2, max: 1, step: 0.01 },
      { key: "lengthJitter", label: "LENGTH JITTER", min: 0, max: 1, step: 0.01 },
      { key: "thickness", label: "THICKNESS", min: 1, max: 10, step: 0.5, unit: "px" },
      { key: "loadNoise", label: "PAINT LOAD", min: 0, max: 1, step: 0.01, hint: "higher = more starved gaps in the tuft" },
      { key: "taper", label: "TAPER", min: 0, max: 1, step: 0.01 },
      { key: "ragged", label: "RAGGED", min: 0, max: 1, step: 0.01, hint: "broken segments + alpha flicker" },
    ],
  },
  CLUMP: {
    blurb: "foliage — dots grow in clusters, not even scatter",
    render: renderClump,
    defaults: { clumps: 18, dotsPerClump: 45, clumpRadius: 0.18, dotSize: 14, leafiness: 0.45, sizeNoise: 0.8, spreadBias: 1.2, edgeFade: 0.5 },
    sliders: [
      { key: "clumps", label: "CLUMPS", min: 3, max: 60, step: 1 },
      { key: "dotsPerClump", label: "DOTS / CLUMP", min: 5, max: 140, step: 1 },
      { key: "clumpRadius", label: "CLUMP RADIUS", min: 0.05, max: 0.5, step: 0.01 },
      { key: "dotSize", label: "LEAF Ø", min: 2, max: 44, step: 0.5, unit: "px" },
      { key: "leafiness", label: "LEAFINESS", min: 0, max: 1, step: 0.01, hint: "0 = round dots · 1 = thin rotated leaves" },
      { key: "sizeNoise", label: "SIZE NOISE", min: 0, max: 1.5, step: 0.01 },
      { key: "spreadBias", label: "SPREAD BIAS", min: 0.4, max: 3, step: 0.05, hint: "where clumps land: center vs rim" },
      { key: "edgeFade", label: "EDGE DISSOLVE", min: 0, max: 1, step: 0.01 },
    ],
  },
  BLOB: {
    blurb: "silhouette stamp — rocks, clouds, landmass shapes",
    render: renderBlob,
    defaults: { roughness: 0.45, detail: 6, wobble: 0.4, coreSize: 0.8, edgeNoise: 0.35, softness: 0.2 },
    sliders: [
      { key: "roughness", label: "ROUGHNESS", min: 0, max: 1, step: 0.01, hint: "how far the rim deviates from a circle" },
      { key: "detail", label: "DETAIL", min: 1, max: 12, step: 1, unit: "k", hint: "harmonic count — lumps vs crenellation" },
      { key: "wobble", label: "WOBBLE", min: 0, max: 1, step: 0.01 },
      { key: "coreSize", label: "CORE SIZE", min: 0.3, max: 1, step: 0.01 },
      { key: "edgeNoise", label: "RIM CRUMBS", min: 0, max: 1, step: 0.01, hint: "speckle breaking off the silhouette" },
      { key: "softness", label: "EDGE SOFTNESS", min: 0, max: 1, step: 0.01 },
    ],
  },
  CELL: {
    blurb: "voronoi cracks — dry mud, scales, stone fracture",
    render: renderCell,
    defaults: { cells: 28, lineWidth: 3, fill: 0.15, contrast: 0.5, edgeFade: 0.5 },
    sliders: [
      { key: "cells", label: "CELLS", min: 5, max: 80, step: 1 },
      { key: "lineWidth", label: "CRACK WIDTH", min: 0.5, max: 10, step: 0.25, unit: "px" },
      { key: "fill", label: "CELL FILL", min: 0, max: 1, step: 0.01, hint: "tone inside the plates" },
      { key: "contrast", label: "CRACK CONTRAST", min: 0, max: 1, step: 0.01 },
      { key: "edgeFade", label: "EDGE DISSOLVE", min: 0, max: 1, step: 0.01 },
    ],
  },
  HATCH: {
    blurb: "hand hatching — weighted lines, optional crosshatch",
    render: renderHatch,
    defaults: { spacing: 14, angle: 30, weight: 3, weightJitter: 0.6, cross: 0, wave: 0.4, edgeFade: 0.5 },
    sliders: [
      { key: "spacing", label: "LINE SPACING", min: 4, max: 40, step: 1, unit: "px" },
      { key: "angle", label: "ANGLE", min: 0, max: 180, step: 1, unit: "°" },
      { key: "weight", label: "LINE WEIGHT", min: 0.5, max: 8, step: 0.25, unit: "px" },
      { key: "weightJitter", label: "WEIGHT JITTER", min: 0, max: 1, step: 0.01 },
      { key: "cross", label: "CROSSHATCH", min: 0, max: 1, step: 0.01, hint: "0 = single pass · up = second pass at +75°" },
      { key: "wave", label: "HAND WAVER", min: 0, max: 1, step: 0.01 },
      { key: "edgeFade", label: "EDGE DISSOLVE", min: 0, max: 1, step: 0.01 },
    ],
  },
  FOG: {
    blurb: "fBm turbulence — smoke, cloud interior, atmosphere",
    render: renderFog,
    defaults: { octaves: 5, scale: 4, contrast: 0.6, density: 0.85, radialFade: 0.8, grain: 0.15 },
    sliders: [
      { key: "octaves", label: "OCTAVES", min: 1, max: 6, step: 1 },
      { key: "scale", label: "SCALE", min: 1, max: 10, step: 0.5, hint: "base frequency — billows vs churn" },
      { key: "contrast", label: "CONTRAST", min: 0, max: 1, step: 0.01 },
      { key: "density", label: "DENSITY", min: 0.1, max: 1, step: 0.01 },
      { key: "radialFade", label: "RADIAL FADE", min: 0, max: 1, step: 0.01 },
      { key: "grain", label: "GRAIN", min: 0, max: 1, step: 0.01 },
    ],
  },
};

const MODE_KEYS = Object.keys(MODES);

// —— master tip renderer ———————————————————————————————————————————
function drawTip(canvas, mode, p, tipSize, seed) {
  const ctx = canvas.getContext("2d");
  canvas.width = tipSize;
  canvas.height = tipSize;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, tipSize, tipSize);
  ctx.fillStyle = "#000000";
  const rand = mulberry32(seed);
  MODES[mode].render(ctx, tipSize, p, rand);
  ctx.globalAlpha = 1;
}

// —— stroke preview: stamp the tip along a pressure-tapered path ——
function drawStroke(canvas, tipCanvas) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  const tmp = document.createElement("canvas");
  tmp.width = tipCanvas.width;
  tmp.height = tipCanvas.height;
  const tctx = tmp.getContext("2d");
  tctx.drawImage(tipCanvas, 0, 0);
  const img = tctx.getImageData(0, 0, tmp.width, tmp.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = d[i];
    d[i] = 42; d[i + 1] = 35; d[i + 2] = 32;
    d[i + 3] = 255 - lum;
  }
  tctx.putImageData(img, 0, 0);
  const stamps = 42;
  for (let i = 0; i < stamps; i++) {
    const u = i / (stamps - 1);
    const x = 30 + u * (W - 60);
    const y = H / 2 + Math.sin(u * Math.PI * 2) * H * 0.16;
    const pressure = Math.sin(u * Math.PI);
    const s = 14 + pressure * 60;
    ctx.globalAlpha = 0.28 + pressure * 0.5;
    ctx.drawImage(tmp, x - s / 2, y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
}

// ————————————————————————————————————————————————————————————————
// COMPONENT
// ————————————————————————————————————————————————————————————————
export default function BrushFoundryII() {
  const [mode, setMode] = useState("SCATTER");
  const [tipSize, setTipSize] = useState(512);
  const [seed, setSeed] = useState(1337);
  const [allParams, setAllParams] = useState(() => {
    const init = {};
    for (const k of MODE_KEYS) init[k] = { ...MODES[k].defaults };
    return init;
  });
  const [shelf, setShelf] = useState([]); // {id, thumb, pixels, size, label}

  const tipRef = useRef(null);
  const strokeRef = useRef(null);

  const params = allParams[mode];
  const setParam = (key) => (e) => {
    const v = parseFloat(e.target.value);
    setAllParams((all) => ({ ...all, [mode]: { ...all[mode], [key]: v } }));
  };

  useEffect(() => {
    if (!tipRef.current) return;
    drawTip(tipRef.current, mode, params, tipSize, seed);
    if (strokeRef.current) drawStroke(strokeRef.current, tipRef.current);
  }, [mode, params, tipSize, seed]);

  const reseed = () => setSeed(Math.floor(Math.random() * 99999));

  const exportPNG = useCallback(() => {
    const a = document.createElement("a");
    a.href = tipRef.current.toDataURL("image/png");
    a.download = `foundry_${mode.toLowerCase()}_${tipSize}px_seed${seed}.png`;
    a.click();
  }, [mode, tipSize, seed]);

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const exportABR = useCallback(() => {
    const pixels = canvasToCoverage(tipRef.current);
    downloadBlob(
      buildABR([{ pixels, size: tipSize }]),
      `foundry_${mode.toLowerCase()}_${tipSize}px_seed${seed}.abr`
    );
  }, [mode, tipSize, seed]);

  const addToShelf = useCallback(() => {
    const pixels = canvasToCoverage(tipRef.current);
    const thumbC = document.createElement("canvas");
    thumbC.width = 72; thumbC.height = 72;
    thumbC.getContext("2d").drawImage(tipRef.current, 0, 0, 72, 72);
    const item = {
      id: Date.now() + Math.random(),
      thumb: thumbC.toDataURL("image/png"),
      pixels,
      size: tipSize,
      label: `${mode.slice(0, 4)}·${seed}`,
    };
    setShelf((s) => [...s.slice(-9), item]); // keep last 10
  }, [mode, tipSize, seed]);

  const removeFromShelf = (id) => setShelf((s) => s.filter((b) => b.id !== id));

  const exportSet = useCallback(() => {
    if (!shelf.length) return;
    downloadBlob(
      buildABR(shelf.map((b) => ({ pixels: b.pixels, size: b.size }))),
      `foundry_set_${shelf.length}brushes.abr`
    );
  }, [shelf]);

  const btn = (primary) => ({
    flex: 1,
    background: primary ? OXBLOOD : "transparent",
    border: `1.5px solid ${primary ? OXBLOOD : INK}`,
    color: primary ? PAPER : INK,
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    letterSpacing: "0.12em",
    fontWeight: 600,
    padding: "10px 6px",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAPER,
        color: INK,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap');
        input[type=range] {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 2px; background: ${LINE};
          outline: none; cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: ${OXBLOOD}; border: 2px solid ${PAPER};
          box-shadow: 0 0 0 1px ${OXBLOOD};
        }
        input[type=range]::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: ${OXBLOOD}; border: 2px solid ${PAPER};
          box-shadow: 0 0 0 1px ${OXBLOOD};
        }
        input[type=range]:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px ${OXBLOOD}55;
        }
        @media (max-width: 780px) {
          .bf2-grid { grid-template-columns: 1fr !important; }
          .bf2-controls { border-right: none !important; border-bottom: 1px solid ${LINE}; }
        }
      `}</style>

      {/* ——— header ——— */}
      <header
        style={{
          borderBottom: `2px solid ${OXBLOOD}`,
          padding: "20px 28px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "0.18em", color: OXBLOOD, fontWeight: 600 }}>
            pLAtform · BRUSH SYSTEMS
          </div>
          <h1
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 600,
              margin: "2px 0 0",
              lineHeight: 1.05,
            }}
          >
            Brush Maker II
          </h1>
        </div>
        <div style={{ fontSize: "11px", letterSpacing: "0.06em", opacity: 0.65 }}>
          eight mark families · one parameter space
        </div>
      </header>

      {/* ——— mode tabs ——— */}
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          borderBottom: `1px solid ${LINE}`,
          padding: "0 20px",
        }}
      >
        {MODE_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => setMode(k)}
            aria-pressed={mode === k}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: `3px solid ${mode === k ? OXBLOOD : "transparent"}`,
              color: mode === k ? OXBLOOD : INK,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11.5px",
              letterSpacing: "0.12em",
              fontWeight: 600,
              padding: "12px 12px 10px",
              cursor: "pointer",
              opacity: mode === k ? 1 : 0.65,
            }}
          >
            {k}
          </button>
        ))}
      </nav>

      <div
        className="bf2-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 380px) 1fr",
          alignItems: "start",
        }}
      >
        {/* ——— controls ——— */}
        <div className="bf2-controls" style={{ padding: "20px 28px", borderRight: `1px solid ${LINE}` }}>
          <p
            style={{
              fontFamily: "'Newsreader', serif",
              fontStyle: "italic",
              fontSize: "14.5px",
              margin: "0 0 18px",
              opacity: 0.75,
            }}
          >
            {MODES[mode].blurb}
          </p>

          {/* shared: tip size */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", letterSpacing: "0.12em", marginBottom: "6px" }}>
              <label htmlFor="tipSize" style={{ fontWeight: 600 }}>TIP SIZE</label>
              <span style={{ color: OXBLOOD, fontWeight: 600 }}>{tipSize}<span style={{ opacity: 0.6 }}> px</span></span>
            </div>
            <input id="tipSize" type="range" min={128} max={1024} step={64}
              value={tipSize} onChange={(e) => setTipSize(parseInt(e.target.value, 10))} />
          </div>

          {/* per-mode sliders */}
          {MODES[mode].sliders.map(({ key, label, min, max, step, unit, hint }) => (
            <div key={key} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", letterSpacing: "0.12em", marginBottom: "6px" }}>
                <label htmlFor={key} style={{ fontWeight: 600 }}>{label}</label>
                <span style={{ color: OXBLOOD, fontWeight: 600 }}>
                  {params[key]}{unit && <span style={{ opacity: 0.6 }}> {unit}</span>}
                </span>
              </div>
              <input id={key} type="range" min={min} max={max} step={step}
                value={params[key]} onChange={setParam(key)} />
              {hint && (
                <div style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: "12.5px", opacity: 0.6, marginTop: "3px" }}>
                  {hint}
                </div>
              )}
            </div>
          ))}

          <div style={{ display: "flex", gap: "8px", marginTop: "22px" }}>
            <button onClick={reseed} style={btn(false)}>RESEED · {seed}</button>
            <button onClick={exportPNG} style={btn(false)}>PNG</button>
            <button onClick={exportABR} style={btn(true)}>.ABR</button>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button onClick={addToShelf} style={{ ...btn(false), borderColor: OXBLOOD, color: OXBLOOD }}>
              + ADD TO SET ({shelf.length}/10)
            </button>
          </div>

          <p style={{ fontFamily: "'Newsreader', serif", fontSize: "14px", lineHeight: 1.55, marginTop: "16px", opacity: 0.75 }}>
            The <b>.abr</b> loads straight into the Brushes panel. Collect tips
            across any modes and seeds on the shelf, then export the whole set
            as one multi-brush .abr — a traceable brush kit, every tip named by
            family and seed.
          </p>
        </div>

        {/* ——— previews + shelf ——— */}
        <div style={{ padding: "20px 28px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.14em", fontWeight: 600, marginBottom: "10px" }}>
            TIP · {mode} · {tipSize}×{tipSize} · SEED {seed}
          </div>
          <div style={{ border: `1px solid ${LINE}`, background: "#fff", display: "inline-block", lineHeight: 0, maxWidth: "100%" }}>
            <canvas ref={tipRef} style={{ width: "min(420px, 100%)", height: "auto", display: "block" }} />
          </div>

          <div style={{ fontSize: "11px", letterSpacing: "0.14em", fontWeight: 600, margin: "20px 0 10px" }}>
            STROKE PREVIEW
          </div>
          <div style={{ border: `1px solid ${LINE}`, lineHeight: 0, maxWidth: "100%" }}>
            <canvas ref={strokeRef} width={760} height={190} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* shelf */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              margin: "20px 0 10px",
            }}
          >
            <div style={{ fontSize: "11px", letterSpacing: "0.14em", fontWeight: 600 }}>
              BRUSH SET · {shelf.length}/10
            </div>
            {shelf.length > 0 && (
              <button
                onClick={exportSet}
                style={{
                  background: OXBLOOD, border: `1.5px solid ${OXBLOOD}`, color: PAPER,
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px",
                  letterSpacing: "0.12em", fontWeight: 600, padding: "7px 12px", cursor: "pointer",
                }}
              >
                EXPORT SET .ABR
              </button>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              minHeight: "96px",
              border: `1px dashed ${LINE}`,
              padding: "10px",
              alignItems: "flex-start",
            }}
          >
            {shelf.length === 0 && (
              <span style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: "13.5px", opacity: 0.5, padding: "6px 4px" }}>
                Empty shelf. Dial in a tip, then + Add to Set — mix families and
                seeds into one kit.
              </span>
            )}
            {shelf.map((b) => (
              <div key={b.id} style={{ position: "relative", textAlign: "center" }}>
                <img
                  src={b.thumb}
                  alt={b.label}
                  width={72}
                  height={72}
                  style={{ border: `1px solid ${LINE}`, background: "#fff", display: "block" }}
                />
                <button
                  onClick={() => removeFromShelf(b.id)}
                  aria-label={`Remove ${b.label}`}
                  style={{
                    position: "absolute", top: "-7px", right: "-7px",
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: OXBLOOD, color: PAPER, border: "none",
                    fontSize: "10px", lineHeight: "18px", cursor: "pointer", padding: 0,
                  }}
                >
                  ×
                </button>
                <div style={{ fontSize: "9px", letterSpacing: "0.08em", marginTop: "3px", opacity: 0.7 }}>
                  {b.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TopicNav topicList={topicList} topicKey="brush-foundry-ii" weekNum="03" />
    </div>
  );
}

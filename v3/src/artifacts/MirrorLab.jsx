import { useState, useRef, useEffect, useCallback } from "react";

/* ============================================================
   pLAtform · Mirror Lab
   The universal vertical-symmetry notan painter.
   MANUAL — paint by hand: black/white ink, hard/soft brush,
   size, undo. AUTO — pick a generator and let it run:
     · Walkers  — random strokes, ink → white cutaway
     · Human    — grows a figure skeleton, carves the gaps
     · Alien    — center blob, eyes, horns, N arms/legs,
                  random head-to-body ratio
   Every auto cycle saves itself to the library; manual work
   saves on demand. Each entry exports as PNG or a Photoshop
   .abr brush tip (dark = opaque).
   Design system: oxblood #8b3a2f · paper cream #f5efe1
   IBM Plex Mono · Newsreader
   ============================================================ */

const SIZE = 768;
const CX = SIZE / 2;
const OX = "#8b3a2f";
const CREAM = "#f5efe1";
const INK = "#1a1613";

/* ---------- .abr writer (v2, single sampled brush) ---------- */
function buildABR(mask, w, h, name) {
  const nm = (name || "platform-brush").slice(0, 27);
  const nameLen = nm.length + 1;
  const nameBytes = 4 + nameLen * 2;
  const recSize = 4 + 2 + nameBytes + 1 + 8 + 16 + 2 + 1 + w * h;
  const buf = new ArrayBuffer(2 + 2 + 2 + 4 + recSize);
  const dv = new DataView(buf);
  let o = 0;
  dv.setInt16(o, 2); o += 2;
  dv.setInt16(o, 1); o += 2;
  dv.setInt16(o, 2); o += 2;
  dv.setInt32(o, recSize); o += 4;
  dv.setInt32(o, 0); o += 4;
  dv.setInt16(o, 25); o += 2;
  dv.setInt32(o, nameLen); o += 4;
  for (let i = 0; i < nm.length; i++) { dv.setInt16(o, nm.charCodeAt(i)); o += 2; }
  dv.setInt16(o, 0); o += 2;
  dv.setUint8(o, 0); o += 1;
  dv.setInt16(o, 0); o += 2;
  dv.setInt16(o, 0); o += 2;
  dv.setInt16(o, h); o += 2;
  dv.setInt16(o, w); o += 2;
  dv.setInt32(o, 0); o += 4;
  dv.setInt32(o, 0); o += 4;
  dv.setInt32(o, h); o += 4;
  dv.setInt32(o, w); o += 4;
  dv.setInt16(o, 8); o += 2;
  dv.setUint8(o, 0); o += 1;
  new Uint8Array(buf, o).set(mask);
  return new Blob([buf], { type: "application/octet-stream" });
}

function canvasToMask(ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h).data;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    mask[i] = 255 - Math.round((d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3);
  }
  return mask;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function downloadDataURL(dataURL, filename) {
  const a = document.createElement("a");
  a.href = dataURL; a.download = filename; a.click();
}
const rand = (a, b) => a + Math.random() * (b - a);
const polar = (p, ang, len) => ({ x: p.x + Math.cos(ang) * len, y: p.y + Math.sin(ang) * len });
const pathLen = (list) =>
  list.map((b) => Math.hypot(b.b.x - b.a.x, b.b.y - b.a.y) || 1);

/* ============================================================
   Creature builder — shared by Human and Alien generators.
   Left half + centerline only; the mirrored stamp supplies
   the right side. kind: "human" | "alien".
   ============================================================ */
function buildCreature(cfg, kind) {
  const alien = kind === "alien";
  const jAmt = cfg.variation / 100;
  const J = (v) => v * (1 + rand(-jAmt, jAmt));
  const soft = () =>
    cfg.edge === "mix" ? Math.random() < 0.5 : cfg.edge === "soft";

  const horns = alien ? cfg.horns : 0;
  const eyes = alien ? cfg.eyes : 0;
  const armCount = alien ? cfg.arms : 2;
  const legCount = alien ? cfg.legs : 2;
  const blobSize = alien ? cfg.blobSize : 0;

  const totalH = SIZE * (cfg.height / 100);
  const hornRoom = horns > 0 ? SIZE * 0.06 * (cfg.hornLen / 100) : 0;
  const topY = SIZE * 0.05 + hornRoom + (SIZE * 0.88 - hornRoom - totalH) / 2;
  const u = totalH / 7.5;
  const mass = cfg.mass / 100;
  const limb = cfg.limbLen / 100;
  const spread = (cfg.poseSpread / 100) * 1.1;

  /* head scale: human uses the slider; alien rolls a random ratio */
  const headScale = alien
    ? Math.max(0.35, 1 + rand(-0.5, 1.4) * (cfg.ratioChaos / 100))
    : cfg.headSize / 100;

  const bones = [];
  const B = (a, b, r0, r1) => bones.push({ a, b, r0, r1, soft: soft() });

  /* ----- head + neck ----- */
  const headR = J(u * 0.5) * headScale;
  const headC = { x: CX, y: topY + headR };
  B({ x: CX, y: headC.y - headR * 0.35 }, { x: CX, y: headC.y + headR * 0.35 },
    headR * 0.75, headR * 0.7);
  const neckBase = { x: CX, y: headC.y + headR + u * 0.2 };
  B({ x: CX, y: headC.y + headR * 0.7 }, neckBase, u * 0.17 * mass, u * 0.18 * mass);

  /* ----- horns ----- */
  const hornPairs = Math.floor(horns / 2);
  const hornSpecs = horns % 2 === 1 ? [0] : [];
  for (let i = 1; i <= hornPairs; i++) {
    hornSpecs.push(0.28 + 0.55 * (i / Math.max(hornPairs, 1)));
  }
  for (const off of hornSpecs) {
    const baseAng = -Math.PI / 2 - off;
    const base = polar(headC, baseAng, headR * 0.85);
    const len = J(u * 0.9) * (cfg.hornLen / 100);
    const dir = baseAng + rand(-0.1, 0.15);
    const mid = polar(base, dir, len * 0.55);
    const tip = polar(mid, dir - rand(0, 0.45), len * 0.45);
    B(base, mid, headR * 0.2, headR * 0.11);
    B(mid, tip, headR * 0.11, 2);
  }

  /* ----- torso ----- */
  const shoulderY = neckBase.y + u * 0.12;
  const shoulderHalf = J(u * 0.8) * mass;
  const waist = { x: CX, y: shoulderY + J(u * 1.55) };
  const pelvis = { x: CX, y: waist.y + J(u * 0.7) };
  const chestR = u * 0.58 * mass;
  const waistR = u * 0.33 * mass;
  const hipR = u * 0.48 * mass;
  B({ x: CX, y: shoulderY }, waist, chestR, waistR);
  B(waist, pelvis, waistR, hipR);

  /* ----- arms (pairs stacked down the torso) ----- */
  const armPairs = Math.floor(armCount / 2);
  let topShoulder = null;
  for (let i = 0; i < armPairs; i++) {
    const f = armPairs > 1 ? i / (armPairs - 1) : 0;
    const sy = shoulderY + u * 0.1 + (waist.y - shoulderY - u * 0.2) * f * 0.85;
    const shoulder = { x: CX - shoulderHalf * (1 - f * 0.35), y: sy };
    if (i === 0) topShoulder = shoulder;
    const scale = 1 - f * 0.25;
    const upperLen = J(u * 1.3) * limb * scale;
    const foreLen = J(u * 1.15) * limb * scale;
    const upAng = Math.PI / 2 + rand(0.2, 0.35 + spread) + f * 0.15;
    const elbow = polar(shoulder, upAng, upperLen);
    const foreAng = upAng + rand(-0.9, 0.5) * (0.4 + spread);
    const wrist = polar(elbow, foreAng, foreLen);
    B(shoulder, elbow, u * 0.24 * mass * scale, u * 0.17 * mass * scale);
    B(elbow, wrist, u * 0.17 * mass * scale, u * 0.12 * mass * scale);
    const hand = polar(wrist, foreAng, u * 0.22 * scale);
    B(wrist, hand, u * 0.16 * scale, u * 0.14 * scale);
  }

  /* ----- legs (pairs across the pelvis; 0 = tail base) ----- */
  const legPairs = Math.floor(legCount / 2);
  let firstThighLen = u * 1.7 * limb;
  if (legPairs === 0) {
    B(pelvis, { x: CX, y: pelvis.y + J(u * 0.9) }, hipR, hipR * 0.35);
  }
  for (let i = 0; i < legPairs; i++) {
    const f = legPairs > 1 ? i / (legPairs - 1) : 0;
    const hip = { x: CX - J(u * (0.18 + 0.4 * f)) * mass, y: pelvis.y + f * u * 0.08 };
    const thighLen = J(u * 1.7) * limb;
    if (i === 0) firstThighLen = thighLen;
    const shinLen = J(u * 1.5) * limb;
    const thighAng = Math.PI / 2 + rand(0.05, 0.12 + spread * 0.5) + f * spread * 0.5;
    const knee = polar(hip, thighAng, thighLen);
    const shinAng = Math.PI / 2 + (thighAng - Math.PI / 2) * 0.4 + rand(-0.15, 0.15);
    const ankle = polar(knee, shinAng, shinLen);
    B(hip, knee, u * 0.3 * mass, u * 0.19 * mass);
    B(knee, ankle, u * 0.19 * mass, u * 0.13 * mass);
    B(ankle, { x: ankle.x - u * 0.45, y: ankle.y + u * 0.06 }, u * 0.14, u * 0.12);
  }

  /* ----- white cutaway: eyes first, then structural cuts ----- */
  const cuts = [];
  if (eyes > 0) {
    const eyeBaseR = headR * 0.14 * (cfg.eyeSize / 100);
    const eyePairs = Math.floor(eyes / 2);
    const eyeY = headC.y - headR * 0.05;
    const addEye = (x, y, r) =>
      cuts.push({
        a: { x, y: y - r * 0.25 }, b: { x, y: y + r * 0.25 },
        r0: r * 0.9, r1: r * 0.9, soft: false,
      });
    if (eyes % 2 === 1) addEye(CX, eyeY + rand(-1, 1) * headR * 0.06, eyeBaseR * rand(0.9, 1.25));
    for (let i = 1; i <= eyePairs; i++) {
      const xOff = headR * (0.18 + 0.5 * (i / Math.max(eyePairs, 1)));
      const row = i % 2 === 0 ? -headR * 0.16 : 0;
      addEye(CX - xOff, eyeY + row + rand(-1, 1) * headR * 0.04, eyeBaseR * rand(0.75, 1.15));
    }
  }
  const cr = u * 0.16 * (cfg.cutDepth / 100);
  cuts.push({
    a: { x: CX - headR * 0.85, y: headC.y + headR * 0.8 },
    b: { x: CX - u * 0.28, y: neckBase.y + u * 0.05 },
    r0: cr, r1: cr * 0.8, soft: false,
  });
  if (armPairs > 0 && topShoulder) {
    cuts.push({
      a: { x: topShoulder.x + chestR * 0.55, y: topShoulder.y + u * 0.4 },
      b: { x: CX - waistR - cr * 1.2, y: waist.y },
      r0: cr, r1: cr * 1.1, soft: false,
    });
  }
  if (legPairs > 0) {
    cuts.push({
      a: { x: CX, y: pelvis.y + hipR * 0.9 },
      b: { x: CX, y: pelvis.y + firstThighLen * 0.95 },
      r0: cr * 1.1, r1: cr * 0.7, soft: false,
    });
  }

  /* ----- initial central blob (alien only, drawn first) ----- */
  const blobBones = [];
  if (blobSize > 0) {
    const bScale = blobSize / 100;
    const bc = { x: CX, y: (shoulderY + pelvis.y) / 2 };
    const spreadR = u * 1.15 * bScale;
    const lumps = 8 + Math.floor(Math.random() * 8);
    let prev = { x: CX - rand(0, spreadR * 0.3), y: bc.y + rand(-0.4, 0.4) * spreadR };
    for (let i = 0; i < lumps; i++) {
      const ang = rand(0, Math.PI * 2);
      const dist = rand(0.15, 1) * spreadR;
      const next = {
        x: bc.x - Math.abs(Math.cos(ang)) * dist * rand(0.2, 1),
        y: bc.y + Math.sin(ang) * dist * 0.8,
      };
      blobBones.push({
        a: prev, b: next,
        r0: u * rand(0.35, 0.8) * bScale * mass,
        r1: u * rand(0.35, 0.8) * bScale * mass,
        soft: soft(),
      });
      prev = next;
    }
  }

  return { bones: [...blobBones, ...bones], cuts };
}

export default function MirrorLab({ isEmbedded = false }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const rafRef = useRef(null);
  const runState = useRef(null);
  const settingsRef = useRef(null);
  const counter = useRef(1);
  const drawing = useRef(false);
  const lastPt = useRef(null);
  const undoStack = useRef([]);

  const [mode, setMode] = useState("manual");   // manual | auto
  const [gen, setGen] = useState("walkers");    // walkers | human | alien
  const [library, setLibrary] = useState([]);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [cycleInfo, setCycleInfo] = useState({ done: 0, total: 0 });
  const [canUndo, setCanUndo] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  /* manual brush */
  const [mInk, setMInk] = useState("black");
  const [mEdge, setMEdge] = useState("hard");
  const [mSize, setMSize] = useState(48);
  const manualRef = useRef({ ink: "black", edge: "hard", size: 48 });
  useEffect(() => { manualRef.current = { ink: mInk, edge: mEdge, size: mSize }; },
    [mInk, mEdge, mSize]);

  /* auto settings — superset for all three generators */
  const [cfg, setCfg] = useState({
    inkDur: 1.0, cutDur: 0.2, batch: 4, edge: "mix",
    /* walkers */
    walkers: 3, sizeMin: 20, sizeMax: 110, chaos: 45, speed: 700, cutScale: 60,
    /* creature (human + alien) */
    height: 82, headSize: 100, mass: 100, limbLen: 100,
    poseSpread: 45, variation: 20, cutDepth: 100,
    /* alien species */
    blobSize: 100, eyes: 3, eyeSize: 100, horns: 2, hornLen: 100,
    arms: 4, legs: 2, ratioChaos: 60,
  });
  useEffect(() => { settingsRef.current = cfg; }, [cfg]);
  const set = (k) => (e) => setCfg((c) => ({ ...c, [k]: Number(e.target.value) }));

  useEffect(() => {
    const c = canvasRef.current;
    c.width = SIZE; c.height = SIZE;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctxRef.current = ctx;
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ---------- mirrored stamp ---------- */
  const stamp = useCallback((x, y, r, soft, white) => {
    const ctx = ctxRef.current;
    const col = white ? "255,255,255" : "0,0,0";
    const one = (px) => {
      if (soft) {
        const g = ctx.createRadialGradient(px, y, 0, px, y, r);
        g.addColorStop(0, `rgba(${col},0.6)`);
        g.addColorStop(0.6, `rgba(${col},0.28)`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = `rgb(${col})`;
      }
      ctx.beginPath();
      ctx.arc(px, y, r, 0, Math.PI * 2);
      ctx.fill();
    };
    one(x);
    one(SIZE - x);
  }, []);

  const drawRange = useCallback((list, lens, from, to, white) => {
    let acc = 0;
    for (let i = 0; i < list.length; i++) {
      const b = list[i], L = lens[i];
      const s = Math.max(from - acc, 0);
      const e = Math.min(to - acc, L);
      if (e > s) {
        for (let d = s; d <= e; d += 3) {
          const t = d / L;
          const x = b.a.x + (b.b.x - b.a.x) * t + rand(-1.5, 1.5);
          const y = b.a.y + (b.b.y - b.a.y) * t + rand(-1.5, 1.5);
          const r = Math.max(1.5, (b.r0 + (b.r1 - b.r0) * t) * (1 + rand(-0.1, 0.1)));
          stamp(x, y, r, b.soft, white);
        }
      }
      acc += L;
      if (acc > to) break;
    }
  }, [stamp]);

  const clearCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);
  }, []);

  const pushUndo = () => {
    undoStack.current.push(ctxRef.current.getImageData(0, 0, SIZE, SIZE));
    if (undoStack.current.length > 10) undoStack.current.shift();
    setCanUndo(true);
  };
  const undo = () => {
    const prev = undoStack.current.pop();
    if (prev) ctxRef.current.putImageData(prev, 0, 0);
    setCanUndo(undoStack.current.length > 0);
  };

  const saveCanvas = useCallback((prefix) => {
    const c = canvasRef.current;
    const ctx = ctxRef.current;
    const n = String(counter.current).padStart(2, "0");
    counter.current += 1;
    setLibrary((L) => [{
      id: Date.now() + Math.random(),
      name: `${prefix}-${n}`,
      dataURL: c.toDataURL("image/png"),
      mask: canvasToMask(ctx, SIZE, SIZE),
    }, ...L]);
  }, []);

  /* ---------- auto engine ---------- */
  const makeWalkers = (s) =>
    Array.from({ length: s.walkers }, () => ({
      x: rand(SIZE * 0.08, SIZE * 0.46),
      y: rand(SIZE * 0.1, SIZE * 0.9),
      heading: rand(0, Math.PI * 2),
      r: rand(s.sizeMin, s.sizeMax) / 2,
      rTarget: rand(s.sizeMin, s.sizeMax) / 2,
      soft: s.edge === "mix" ? Math.random() < 0.5 : s.edge === "soft",
    }));

  const newCycle = (s, kind) => {
    if (kind === "walkers") {
      return { kind, t: 0, walkers: makeWalkers(s) };
    }
    const fig = buildCreature(s, kind);
    return {
      kind, t: 0, fig,
      boneLens: pathLen(fig.bones),
      cutLens: pathLen(fig.cuts),
      inkDrawn: 0, cutDrawn: 0,
    };
  };

  const startAuto = () => {
    if (running) return;
    const s = settingsRef.current;
    clearCanvas();
    runState.current = { last: performance.now(), cycle: 0, ...newCycle(s, gen) };
    setCycleInfo({ done: 0, total: s.batch });
    setRunning(true);
    setPhase("ink");
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopAuto = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setPhase("idle");
  };

  const tick = (now) => {
    const st = runState.current;
    const s = settingsRef.current;
    if (!st) return;
    const dt = Math.min(0.05, (now - st.last) / 1000);
    st.last = now;
    st.t += dt;
    const inCut = st.t > s.inkDur;
    setPhase(inCut ? "cutaway" : "ink");

    if (st.kind === "walkers") {
      const turn = (s.chaos / 100) * 0.9;
      const dist = s.speed * dt;
      const step = 4;
      for (const w of st.walkers) {
        if (Math.random() < 0.04) w.rTarget = rand(s.sizeMin, s.sizeMax) / 2;
        for (let d = 0; d < dist; d += step) {
          w.heading += rand(-turn, turn);
          w.x += Math.cos(w.heading) * step;
          w.y += Math.sin(w.heading) * step;
          if (w.x < 4) { w.x = 4; w.heading = Math.PI - w.heading; }
          if (w.x > CX - 4) { w.x = CX - 4; w.heading = Math.PI - w.heading; }
          if (w.y < 4) { w.y = 4; w.heading = -w.heading; }
          if (w.y > SIZE - 4) { w.y = SIZE - 4; w.heading = -w.heading; }
          w.r += (w.rTarget - w.r) * 0.05;
          const r = inCut ? Math.max(2, w.r * (s.cutScale / 100)) : w.r;
          stamp(w.x, w.y, r, w.soft, inCut);
        }
      }
    } else {
      const totalInk = st.boneLens.reduce((a, b) => a + b, 0);
      const totalCut = st.cutLens.reduce((a, b) => a + b, 0);
      if (!inCut) {
        const target = Math.min(1, st.t / s.inkDur) * totalInk;
        drawRange(st.fig.bones, st.boneLens, st.inkDrawn, target, false);
        st.inkDrawn = target;
      } else {
        if (st.inkDrawn < totalInk) {
          drawRange(st.fig.bones, st.boneLens, st.inkDrawn, totalInk, false);
          st.inkDrawn = totalInk;
        }
        const ct = Math.min(1, (st.t - s.inkDur) / Math.max(0.01, s.cutDur));
        drawRange(st.fig.cuts, st.cutLens, st.cutDrawn, ct * totalCut, true);
        st.cutDrawn = ct * totalCut;
      }
    }

    if (st.t >= s.inkDur + s.cutDur) {
      saveCanvas(st.kind === "walkers" ? "auto" : st.kind === "human" ? "figure" : "alien");
      st.cycle += 1;
      setCycleInfo({ done: st.cycle, total: s.batch });
      if (st.cycle >= s.batch) { stopAuto(); return; }
      clearCanvas();
      Object.assign(st, newCycle(s, st.kind));
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  /* ---------- manual painting ---------- */
  const toCanvasXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
  };
  const mStamp = (x, y) => {
    const m = manualRef.current;
    stamp(x, y, m.size / 2, m.edge === "soft", m.ink === "white");
  };
  const onPointerDown = (e) => {
    if (running) return;
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    pushUndo();
    drawing.current = true;
    const { x, y } = toCanvasXY(e);
    mStamp(x, y);
    lastPt.current = { x, y };
  };
  const onPointerMove = (e) => {
    if (!drawing.current || running) return;
    const { x, y } = toCanvasXY(e);
    const l = lastPt.current;
    const d = Math.hypot(x - l.x, y - l.y);
    const m = manualRef.current;
    const step = Math.max(1, (m.size / 2) * (m.edge === "soft" ? 0.24 : 0.5));
    for (let t = step; t <= d; t += step) {
      mStamp(l.x + ((x - l.x) * t) / d, l.y + ((y - l.y) * t) / d);
    }
    if (d >= step) lastPt.current = { x, y };
  };
  const onPointerUp = () => { drawing.current = false; };

  const removeItem = (id) => setLibrary((L) => L.filter((i) => i.id !== id));

  /* ---------- styles ---------- */
  const S = {
    root: {
      color: INK,
      fontFamily: "'IBM Plex Mono', monospace",
      boxSizing: "border-box",
      padding: isEmbedded ? "0" : "28px 24px 48px",
      background: isEmbedded ? "transparent" : CREAM,
      minHeight: isEmbedded ? "auto" : "100vh",
    },
    eyebrow: { fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: OX, marginBottom: 6 },
    title: { fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: 34, lineHeight: 1.05, margin: 0 },
    sub: { fontSize: 12, color: "#6b6257", marginTop: 8, maxWidth: 580, lineHeight: 1.6 },
    wrap: { display: "flex", gap: 28, marginTop: 22, flexWrap: "wrap", alignItems: "flex-start" },
    canvasBox: {
      position: "relative", width: "min(440px, 92vw)", aspectRatio: "1/1",
      border: `1.5px solid ${INK}`, background: "#fff",
      boxShadow: "6px 6px 0 rgba(139,58,47,0.18)", touchAction: "none",
    },
    canvas: { width: "100%", height: "100%", display: "block", cursor: "crosshair" },
    guide: {
      position: "absolute", top: 0, bottom: 0, left: "50%", width: 0,
      borderLeft: `1.5px dashed ${OX}`, opacity: 0.55, pointerEvents: "none",
    },
    phaseTag: (p) => ({
      position: "absolute", top: 10, left: 10, fontSize: 10,
      letterSpacing: "0.14em", textTransform: "uppercase",
      padding: "4px 8px", pointerEvents: "none",
      background: p === "ink" ? INK : p === "cutaway" ? "#fff" : "transparent",
      color: p === "ink" ? CREAM : p === "cutaway" ? INK : "transparent",
      border: p === "cutaway" ? `1.5px solid ${INK}` : "1.5px solid transparent",
    }),
    ctrlCol: { width: "min(300px, 92vw)", display: "flex", flexDirection: "column", gap: 12 },
    fieldset: { border: `1.5px solid ${INK}`, padding: "12px 14px 14px" },
    legend: { fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: OX, padding: "0 6px" },
    row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 11, marginTop: 10 },
    lab: { fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6257", flex: "0 0 92px" },
    val: { flex: "0 0 48px", textAlign: "right" },
    range: { flex: 1, minWidth: 0 },
    seg: { display: "inline-flex", border: `1.5px solid ${INK}` },
    segBtn: (active) => ({
      fontFamily: "inherit", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
      padding: "6px 10px", cursor: "pointer", border: "none",
      background: active ? INK : "transparent", color: active ? CREAM : INK,
    }),
    tabBtn: (active) => ({
      fontFamily: "inherit", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
      padding: "8px 16px", cursor: "pointer", border: "none",
      background: active ? OX : "transparent", color: active ? CREAM : INK,
    }),
    btnPrime: {
      fontFamily: "inherit", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
      padding: "12px 16px", cursor: "pointer", border: `1.5px solid ${OX}`,
      background: OX, color: CREAM, width: "100%",
    },
    btn: {
      fontFamily: "inherit", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
      padding: "8px 12px", cursor: "pointer", border: `1.5px solid ${INK}`,
      background: "transparent", color: INK,
    },
    lib: { flex: "1 1 300px", minWidth: 280 },
    libHead: {
      fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: OX,
      borderBottom: `1.5px solid ${INK}`, paddingBottom: 8, marginBottom: 14,
      display: "flex", justifyContent: "space-between",
    },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 14 },
    card: { border: `1.5px solid ${INK}`, background: "#fff" },
    thumb: { width: "100%", aspectRatio: "1/1", display: "block", cursor: "pointer" },
    cardBar: { display: "flex", borderTop: `1.5px solid ${INK}` },
    cardBtn: {
      flex: 1, fontFamily: "inherit", fontSize: 10, padding: "6px 0", cursor: "pointer",
      border: "none", background: "transparent", color: INK, letterSpacing: "0.06em",
    },
    empty: { fontSize: 12, color: "#6b6257", lineHeight: 1.6, border: "1.5px dashed rgba(26,22,19,0.35)", padding: "22px 18px" },
  };

  const slider = (label, key, min, max, step, fmt = (v) => v, extra = {}) => (
    <div style={S.row}>
      <span style={S.lab}>{label}</span>
      <input style={S.range} type="range" min={min} max={max} step={step}
        value={cfg[key]} onChange={set(key)} disabled={running} {...extra} />
      <span style={S.val}>{fmt(cfg[key])}</span>
    </div>
  );

  const edgeSeg = (
    <div style={{ ...S.row, justifyContent: "flex-start" }}>
      <span style={S.lab}>Edge</span>
      <div style={S.seg} role="group" aria-label="Brush edge">
        {["hard", "soft", "mix"].map((e) => (
          <button key={e} style={S.segBtn(cfg.edge === e)}
            onClick={() => !running && setCfg((c) => ({ ...c, edge: e }))}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );

  const loadItem = (item) => {
    if (running) return;
    pushUndo();
    const img = new Image();
    img.onload = () => {
      clearCanvas();
      ctxRef.current.drawImage(img, 0, 0, SIZE, SIZE);
    };
    img.src = item.dataURL;
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap');
        input[type=range]{accent-color:${OX};}
        button:focus-visible{outline:2px solid ${OX};outline-offset:2px;}
      `}</style>

      {!isEmbedded && (
        <>
          <div style={S.eyebrow}>pLAtform · brush lab</div>
          <h1 style={S.title}>Mirror Lab</h1>
          <p style={S.sub}>
            One symmetry canvas, two ways to work it. <strong>Manual</strong>: paint
            both halves at once in black or white, hard or soft. <strong>Auto</strong>:
            pick a generator — random walkers, a human figure, or a full alien with
            blob, eyes, horns, and extra limbs — and let each ink-then-cutaway cycle
            file itself in the library. Everything exports as PNG or a
            Photoshop <code>.abr</code> tip.
          </p>
        </>
      )}

      <div style={S.wrap}>
        {/* ------- canvas ------- */}
        <div>
          <div style={S.canvasBox}>
            <canvas
              ref={canvasRef} style={S.canvas}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove}
              onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
            />
            {showGuide && <div style={S.guide} />}
            <div style={S.phaseTag(phase)}>
              {phase === "ink" ? "ink · black" : phase === "cutaway" ? "cutaway · white" : "·"}
            </div>
          </div>
          <p style={{ ...S.sub, marginTop: 10, maxWidth: 440 }}>
            {running
              ? `Generating ${cycleInfo.done + 1} of ${cycleInfo.total}…`
              : mode === "manual"
                ? "Painting by hand — every mark mirrors across the axis."
                : "Canvas is live for hand retouching between runs."}
          </p>
        </div>

        {/* ------- control column ------- */}
        <div style={S.ctrlCol}>
          {/* mode switch */}
          <div style={{ ...S.seg, alignSelf: "stretch" }} role="group" aria-label="Mode">
            <button style={{ ...S.tabBtn(mode === "manual"), flex: 1 }}
              onClick={() => { if (!running) setMode("manual"); }}>
              Manual
            </button>
            <button style={{ ...S.tabBtn(mode === "auto"), flex: 1 }}
              onClick={() => setMode("auto")}>
              Auto
            </button>
          </div>

          {mode === "manual" ? (
            <>
              <fieldset style={S.fieldset}>
                <legend style={S.legend}>Brush</legend>
                <div style={{ ...S.row, justifyContent: "flex-start" }}>
                  <span style={S.lab}>Ink</span>
                  <div style={S.seg} role="group" aria-label="Ink">
                    <button style={S.segBtn(mInk === "black")} onClick={() => setMInk("black")}>Black</button>
                    <button style={S.segBtn(mInk === "white")} onClick={() => setMInk("white")}>White</button>
                  </div>
                </div>
                <div style={{ ...S.row, justifyContent: "flex-start" }}>
                  <span style={S.lab}>Edge</span>
                  <div style={S.seg} role="group" aria-label="Edge">
                    <button style={S.segBtn(mEdge === "hard")} onClick={() => setMEdge("hard")}>Hard</button>
                    <button style={S.segBtn(mEdge === "soft")} onClick={() => setMEdge("soft")}>Soft</button>
                  </div>
                </div>
                <div style={S.row}>
                  <span style={S.lab}>Size</span>
                  <input style={S.range} type="range" min="6" max="200" value={mSize}
                    onChange={(e) => setMSize(Number(e.target.value))} aria-label="Brush size" />
                  <span style={S.val}>{mSize}px</span>
                </div>
              </fieldset>
              <button style={S.btnPrime} onClick={() => saveCanvas("mirror")}>
                Save to library
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ ...S.btn, flex: 1 }} onClick={undo} disabled={!canUndo}>Undo</button>
                <button style={{ ...S.btn, flex: 1 }} onClick={() => { pushUndo(); clearCanvas(); }}>Clear</button>
                <button style={{ ...S.btn, flex: 1 }} onClick={() => setShowGuide((g) => !g)}>
                  {showGuide ? "Hide axis" : "Axis"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* generator switch */}
              <div style={{ ...S.seg, alignSelf: "stretch" }} role="group" aria-label="Generator">
                {[["walkers", "Regular"], ["human", "Human"], ["alien", "Alien"]].map(([k, label]) => (
                  <button key={k} style={{ ...S.segBtn(gen === k), flex: 1, padding: "8px 0" }}
                    onClick={() => { if (!running) setGen(k); }}>
                    {label}
                  </button>
                ))}
              </div>

              <fieldset style={S.fieldset}>
                <legend style={S.legend}>Cycle</legend>
                {slider("Ink phase", "inkDur", 0.3, 3, 0.1, (v) => `${v.toFixed(1)}s`)}
                {slider("Cutaway", "cutDur", 0.05, 1, 0.05, (v) => `${v.toFixed(2)}s`)}
                {slider("Batch", "batch", 1, 12, 1, (v) => `×${v}`)}
                {edgeSeg}
              </fieldset>

              {gen === "walkers" && (
                <fieldset style={S.fieldset}>
                  <legend style={S.legend}>Marks</legend>
                  {slider("Walkers", "walkers", 1, 6, 1)}
                  {slider("Size min", "sizeMin", 6, 160, 2, (v) => `${v}px`)}
                  {slider("Size max", "sizeMax", 10, 220, 2, (v) => `${v}px`)}
                  {slider("Chaos", "chaos", 0, 100, 1)}
                  {slider("Speed", "speed", 100, 2000, 50)}
                  {slider("Cut size", "cutScale", 20, 120, 5, (v) => `${v}%`)}
                </fieldset>
              )}

              {gen === "human" && (
                <fieldset style={S.fieldset}>
                  <legend style={S.legend}>Anatomy</legend>
                  {slider("Height", "height", 50, 95, 1, (v) => `${v}%`)}
                  {slider("Head size", "headSize", 50, 220, 5, (v) => `${v}%`)}
                  {slider("Mass", "mass", 50, 200, 5, (v) => `${v}%`)}
                  {slider("Limb length", "limbLen", 50, 180, 5, (v) => `${v}%`)}
                  {slider("Pose spread", "poseSpread", 0, 100, 1)}
                  {slider("Variation", "variation", 0, 50, 1)}
                  {slider("Cut depth", "cutDepth", 40, 200, 5, (v) => `${v}%`)}
                </fieldset>
              )}

              {gen === "alien" && (
                <>
                  <fieldset style={S.fieldset}>
                    <legend style={S.legend}>Species</legend>
                    {slider("Blob", "blobSize", 0, 200, 5, (v) => (v === 0 ? "off" : `${v}%`))}
                    {slider("Eyes", "eyes", 0, 9, 1)}
                    {slider("Eye size", "eyeSize", 50, 220, 5, (v) => `${v}%`)}
                    {slider("Horns", "horns", 0, 6, 1)}
                    {slider("Horn length", "hornLen", 40, 220, 5, (v) => `${v}%`)}
                    {slider("Arms", "arms", 0, 8, 2)}
                    {slider("Legs", "legs", 0, 8, 2, (v) => (v === 0 ? "tail" : v))}
                    {slider("Ratio chaos", "ratioChaos", 0, 100, 1)}
                  </fieldset>
                  <fieldset style={S.fieldset}>
                    <legend style={S.legend}>Body</legend>
                    {slider("Height", "height", 50, 95, 1, (v) => `${v}%`)}
                    {slider("Mass", "mass", 50, 200, 5, (v) => `${v}%`)}
                    {slider("Limb length", "limbLen", 50, 180, 5, (v) => `${v}%`)}
                    {slider("Pose spread", "poseSpread", 0, 100, 1)}
                    {slider("Variation", "variation", 0, 50, 1)}
                    {slider("Cut depth", "cutDepth", 40, 200, 5, (v) => `${v}%`)}
                  </fieldset>
                </>
              )}

              {!running ? (
                <button style={S.btnPrime} onClick={startAuto}>
                  Run auto-paint ({(cfg.inkDur + cfg.cutDur).toFixed(1)}s × {cfg.batch})
                </button>
              ) : (
                <button style={{ ...S.btnPrime, background: "transparent", color: OX }} onClick={stopAuto}>
                  Stop
                </button>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ ...S.btn, flex: 1 }} onClick={() => { pushUndo(); clearCanvas(); }} disabled={running}>
                  Clear
                </button>
                <button style={{ ...S.btn, flex: 1 }} onClick={() => saveCanvas("mirror")} disabled={running}>
                  Save current
                </button>
              </div>
            </>
          )}
        </div>

        {/* ------- library ------- */}
        <div style={S.lib}>
          <div style={S.libHead}>
            <span>Library</span>
            <span>{library.length} saved</span>
          </div>
          {library.length === 0 ? (
            <div style={S.empty}>
              Nothing saved yet. Paint by hand and “Save to library,” or switch
              to Auto and run a batch — every finished cycle files itself here.
              Click any thumbnail to load it back onto the canvas.
            </div>
          ) : (
            <div style={S.grid}>
              {library.map((item) => (
                <div key={item.id} style={S.card}>
                  <img src={item.dataURL} alt={item.name} style={S.thumb}
                    title="Load back onto the canvas" onClick={() => loadItem(item)} />
                  <div style={{ padding: "6px 8px", fontSize: 10, letterSpacing: "0.08em" }}>{item.name}</div>
                  <div style={S.cardBar}>
                    <button style={S.cardBtn}
                      onClick={() => downloadDataURL(item.dataURL, `${item.name}.png`)}>PNG</button>
                    <button
                      style={{ ...S.cardBtn, borderLeft: `1.5px solid ${INK}`, borderRight: `1.5px solid ${INK}` }}
                      onClick={() => downloadBlob(buildABR(item.mask, SIZE, SIZE, item.name), `${item.name}.abr`)}>
                      .ABR
                    </button>
                    <button style={{ ...S.cardBtn, color: OX }} onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

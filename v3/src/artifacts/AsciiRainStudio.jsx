import React, { useRef, useEffect, useState, useCallback } from "react";

/**
 * AsciiRainStudio (v3)
 * Image / video / live camera → ASCII rain, with a typed message riding the
 * drop heads. Multilingual glyph sets, three render modes (mono tint, full
 * color, posterized), adjustable character size, and a hideable UI (H key).
 */

const RAMPS = {
  fine: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  classic: " .:-=+*#%@",
  blocks: " ░▒▓█",
  binary: " 01",
  braille: " ⠁⠃⠇⠏⠟⠿⡿⣿",
  katakana: " ･ｨｩｰｲｸｺｿﾁﾃﾆﾉﾊﾎﾑﾒﾗﾘｱｳｴｵｶｷｹｻｼｽｾﾀﾂﾅﾇﾈﾋﾌﾍﾏﾐﾓﾔﾕﾖﾙﾚﾛﾜﾝ",
  kanji: " 丶一二十上正玉田国面棚龍鬱",
  cyrillic: " ·гтлпсивнкячмжшщфзыдБВДЖМШЩФЮЯ",
  greek: " ·ιτγλνξζπφθδσωμΓΛΞΠΦΨΩΘ",
  symbols: " ·∙◦∘○◇◈□▢▣◉●■◆★✦✸❖",
  hazard: " ·-+=xX#▚▓█",
};

const CHAR_ASPECT = 0.58; // glyph width / glyph height
const BUCKETS = 12;

const COLOR = {
  ink: "#08182B",
  field: "#0E2942",
  paper: "#F2F7FA",
};

const SYMBOL_POOL = [
  "✶", "✸", "✹", "❖", "◉", "●", "▲", "◆", "◇", "Ω", "Σ", "Φ", "Ψ", "Ж", "Ш",
  "∞", "※", "☾", "✚", "⚠", "@", "#", "&", "%", "龍", "鬱", "愛", "夢", "火",
  "水", "風", "空", "0", "1", "X",
];

const BLEND_MODES = [
  ["difference", "DIFF"], ["exclusion", "EXCL"], ["screen", "SCRN"],
  ["overlay", "OVER"], ["lighter", "ADD"], ["multiply", "MULT"],
  ["hard-light", "HARD"],
];

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export default function AsciiRainStudio() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const offRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef({
    ctx: null, analyser: null, data: null, node: null, kind: null,
    micStream: null, levels: { bass: 0, treble: 0, level: 0 },
  });
  const trackNodeRef = useRef(null); // MediaElementSource is once-per-element
  const recRef = useRef({ mr: null, chunks: [], timer: 0 });
  const videoBRef = useRef(null);
  const offBRef = useRef(null);
  const sourceBRef = useRef({ kind: null, el: null, url: null });
  const glitchRef = useRef({ bands: [], next: 0 });
  const symbolRef = useRef({ ch: "✶", t: 0 });
  const loadTargetRef = useRef("a");

  const sourceRef = useRef({ kind: null, el: null, url: null });
  const gridRef = useRef({ cols: 0, rows: 0, lum: null, rgb: null, dirty: true });
  const colStateRef = useRef([]);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const bucketsRef = useRef(null);

  const [charSize, setCharSize] = useState(14);
  const [contrast, setContrast] = useState(1.35);
  const [brightness, setBrightness] = useState(0);
  const [speed, setSpeed] = useState(11);
  const [trail, setTrail] = useState(16);
  const [rampKey, setRampKey] = useState("fine");
  const [invert, setInvert] = useState(false);
  const [mirror, setMirror] = useState(false);
  const [message, setMessage] = useState("YOU ARE THE SIGNAL");
  const [playing, setPlaying] = useState(true);
  const [uiHidden, setUiHidden] = useState(false);
  const [sourceKind, setSourceKind] = useState(null); // null | image | video | camera
  const [dragging, setDragging] = useState(false);
  const [colorMode, setColorMode] = useState("mono"); // mono | color | poster
  const [posterLevels, setPosterLevels] = useState(4);
  const [saturation, setSaturation] = useState(1.25);
  const [tint, setTint] = useState("#BFD8E8");
  const [msgColor, setMsgColor] = useState("#F2A03D");
  const [edge, setEdge] = useState(false);
  const [audioMode, setAudioMode] = useState("off"); // off | mic | track
  const [reactAmt, setReactAmt] = useState(1);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const [bName, setBName] = useState(null);
  const [interfere, setInterfere] = useState(0.55);
  const [symbolOn, setSymbolOn] = useState(false);
  const [blendMode, setBlendMode] = useState("difference");
  const [symbolRate, setSymbolRate] = useState(1.2);
  const [status, setStatus] = useState(
    "Drop an image or video, or start the camera. H hides the controls."
  );

  const paramsRef = useRef({});
  paramsRef.current = {
    charSize, contrast, brightness, speed, trail, rampKey, invert, mirror,
    message, playing, colorMode, posterLevels, saturation, tint, msgColor,
    edge, reactAmt, interfere, symbolOn, blendMode, symbolRate,
  };

  /* ---------- sizing: self-healing, checked every frame ---------- */

  const syncSize = () => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    if (!wrap || !cv) return;
    const w = Math.max(240, wrap.clientWidth);
    const h = Math.max(200, wrap.clientHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const s = sizeRef.current;
    if (s.w === w && s.h === h && s.dpr === dpr) return;
    sizeRef.current = { w, h, dpr };
    cv.width = Math.floor(w * dpr);
    cv.height = Math.floor(h * dpr);
    gridRef.current.cols = 0; // force full grid rebuild + resample
    gridRef.current.dirty = true;
  };

  /* ---------- grid ---------- */

  const rebuildColumns = (nCols, rows, tr) => {
    const cycle = rows + tr + 10;
    colStateRef.current = Array.from({ length: nCols }, () => ({
      phase: Math.random() * cycle,
      mult: 0.55 + Math.random() * 0.9,
      pass: (Math.random() * 97) | 0,
    }));
    bucketsRef.current = Array.from({ length: BUCKETS }, () => ({
      x: [], y: [], c: [], n: 0,
    }));
  };

  const ensureGrid = () => {
    const { w, h } = sizeRef.current;
    const p = paramsRef.current;
    const cellH = Math.max(4, p.charSize);
    const cellW = cellH * CHAR_ASPECT;
    const cols = Math.max(8, Math.floor(w / cellW));
    const rows = Math.max(6, Math.floor(h / cellH));
    const g = gridRef.current;
    if (g.cols !== cols || g.rows !== rows || !g.lum) {
      g.cols = cols;
      g.rows = rows;
      g.lum = new Float32Array(cols * rows);
      g.rgb = new Uint8ClampedArray(cols * rows * 3);
      g.lumB = new Float32Array(cols * rows);
      g.rgbB = new Uint8ClampedArray(cols * rows * 3);
      g.dirty = true;
      g.dirtyB = true;
      rebuildColumns(cols, rows, p.trail);
    }
    return g;
  };

  const sampleSource = (g) => {
    const src = sourceRef.current;
    const p = paramsRef.current;
    const { cols, rows, lum, rgb } = g;

    if (!src.el) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const u = x / cols, v = y / rows;
          const n =
            0.5 +
            0.22 * Math.sin(u * 7.1 + v * 3.3) +
            0.16 * Math.sin(v * 9.4 - u * 2.1) +
            0.12 * Math.sin((u + v) * 13.7);
          const i = y * cols + x;
          const L = Math.max(0, Math.min(1, n * 0.55));
          lum[i] = L;
          rgb[i * 3] = 90 + L * 100;
          rgb[i * 3 + 1] = 140 + L * 80;
          rgb[i * 3 + 2] = 200;
        }
      }
      g.dirty = false;
      return;
    }

    const el = src.el;
    const isVid = src.kind === "video" || src.kind === "camera";
    const sw = isVid ? el.videoWidth : el.naturalWidth;
    const sh = isVid ? el.videoHeight : el.naturalHeight;
    if (!sw || !sh) return;

    if (!offRef.current) offRef.current = document.createElement("canvas");
    const off = offRef.current;
    if (off.width !== cols || off.height !== rows) {
      off.width = cols;
      off.height = rows;
    }
    const octx = off.getContext("2d", { willReadFrequently: true });

    const scale = Math.max(cols / sw, rows / sh); // cover fit
    const dw = sw * scale, dh = sh * scale;
    octx.save();
    if (p.mirror) { octx.translate(cols, 0); octx.scale(-1, 1); }
    octx.drawImage(el, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
    octx.restore();

    const d = octx.getImageData(0, 0, cols, rows).data;
    for (let i = 0; i < cols * rows; i++) {
      const q = i * 4;
      rgb[i * 3] = d[q];
      rgb[i * 3 + 1] = d[q + 1];
      rgb[i * 3 + 2] = d[q + 2];
      lum[i] = (0.2126 * d[q] + 0.7152 * d[q + 1] + 0.0722 * d[q + 2]) / 255;
    }

    // Edge mode: Sobel on the tone grid — contours get the dense glyphs.
    if (p.edge) {
      const base = Float32Array.from(lum);
      for (let y = 0; y < rows; y++) {
        const ym = Math.max(0, y - 1) * cols, yc = y * cols, yp = Math.min(rows - 1, y + 1) * cols;
        for (let x = 0; x < cols; x++) {
          const xm = Math.max(0, x - 1), xp = Math.min(cols - 1, x + 1);
          const gx =
            (base[yc + xp] - base[yc + xm]) * 2 +
            base[ym + xp] - base[ym + xm] +
            base[yp + xp] - base[yp + xm];
          const gy =
            (base[yp + x] - base[ym + x]) * 2 +
            base[yp + xm] - base[ym + xm] +
            base[yp + xp] - base[ym + xp];
          let m = Math.sqrt(gx * gx + gy * gy) * 1.6;
          if (m > 1) m = 1;
          lum[yc + x] = m * 0.85 + base[yc + x] * 0.15;
        }
      }
    }
    g.dirty = false;
  };

  useEffect(() => { gridRef.current.cols = 0; }, [charSize, trail]);
  useEffect(() => { gridRef.current.dirty = true; }, [mirror, edge]);

  const sampleB = (g) => {
    const src = sourceBRef.current;
    const el = src.el;
    if (!el) return;
    const { cols, rows, lumB, rgbB } = g;
    const isVid = src.kind === "video";
    const sw = isVid ? el.videoWidth : el.naturalWidth;
    const sh = isVid ? el.videoHeight : el.naturalHeight;
    if (!sw || !sh) return;

    if (!offBRef.current) offBRef.current = document.createElement("canvas");
    const off = offBRef.current;
    if (off.width !== cols || off.height !== rows) {
      off.width = cols;
      off.height = rows;
    }
    const octx = off.getContext("2d", { willReadFrequently: true });
    const scale = Math.max(cols / sw, rows / sh);
    octx.drawImage(el, (cols - sw * scale) / 2, (rows - sh * scale) / 2, sw * scale, sh * scale);
    const d = octx.getImageData(0, 0, cols, rows).data;
    for (let i = 0; i < cols * rows; i++) {
      const q = i * 4;
      rgbB[i * 3] = d[q];
      rgbB[i * 3 + 1] = d[q + 1];
      rgbB[i * 3 + 2] = d[q + 2];
      lumB[i] = (0.2126 * d[q] + 0.7152 * d[q + 1] + 0.0722 * d[q + 2]) / 255;
    }
    g.dirtyB = false;
  };

  /* ---------- keyboard ---------- */

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === "h" || e.key === "H") setUiHidden((v) => !v);
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- render loop ---------- */

  useEffect(() => {
    const step = (t) => {
      rafRef.current = requestAnimationFrame(step);
      const dt = lastRef.current ? Math.min(0.05, (t - lastRef.current) / 1000) : 0.016;
      lastRef.current = t;
      draw(dt, t / 1000);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = (dt, time) => {
    const cv = canvasRef.current;
    if (!cv) return;
    syncSize();
    const p = paramsRef.current;
    const g = ensureGrid();
    const src = sourceRef.current;

    const isLiveVid = (src.kind === "video" || src.kind === "camera") && src.el && !src.el.paused;
    if (isLiveVid) g.dirty = true;
    if (g.dirty) sampleSource(g);

    const srcB = sourceBRef.current;
    if (srcB.kind === "video" && srcB.el && !srcB.el.paused) g.dirtyB = true;
    if (g.dirtyB && srcB.el) sampleB(g);

    const cs = colStateRef.current;
    const buckets = bucketsRef.current;
    if (!g.lum || !buckets) return;

    const ctx = cv.getContext("2d");
    const { w, h, dpr } = sizeRef.current;
    const { cols, rows, lum, rgb } = g;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = COLOR.ink;
    ctx.fillRect(0, 0, w, h);

    const cellH = Math.max(4, p.charSize);
    const cellW = cellH * CHAR_ASPECT;
    const offX = (w - cellW * cols) / 2;
    const offY = (h - cellH * rows) / 2;

    const ramp = RAMPS[p.rampKey] || RAMPS.classic;
    const rn = ramp.length - 1;

    // Audio levels (smoothed): bass → fall speed, treble → trail, level → glyph swell
    const au = audioRef.current;
    if (au.analyser) {
      au.analyser.getByteFrequencyData(au.data);
      const n = au.data.length;
      const bassN = 8, trebStart = (n * 2 / 3) | 0;
      let bass = 0, treb = 0, all = 0;
      for (let i = 0; i < n; i++) {
        const v = au.data[i] / 255;
        all += v;
        if (i < bassN) bass += v;
        if (i >= trebStart) treb += v;
      }
      const L = au.levels;
      L.bass += (bass / bassN - L.bass) * 0.3;
      L.treble += (treb / (n - trebStart) - L.treble) * 0.3;
      L.level += (all / n - L.level) * 0.3;
    }
    const aBass = au.levels.bass * p.reactAmt;
    const aTreb = au.levels.treble * p.reactAmt;
    const aLvl = au.levels.level * p.reactAmt;

    const trailEff = p.trail * (1 + aTreb * 1.2);
    const cycle = rows + p.trail * (1 + 1.2 * p.reactAmt) + 10;

    // Interference: random bands where source B tears through source A.
    const bHere = !!srcB.el && p.interfere > 0 && p.playing;
    let rowShift = null;
    if (bHere) {
      const G = glitchRef.current;
      for (let i = G.bands.length - 1; i >= 0; i--) {
        if ((G.bands[i].life -= dt) <= 0) G.bands.splice(i, 1);
      }
      G.next -= dt * (1 + aBass * 2); // bass makes it tear more often
      if (G.next <= 0) {
        G.next = 0.06 + Math.random() * Math.max(0.15, 1.9 - p.interfere * 1.7);
        const bursts = 1 + ((Math.random() * 3 * p.interfere) | 0);
        for (let i = 0; i < bursts; i++) {
          G.bands.push({
            y0: (Math.random() * rows) | 0,
            h: 1 + ((Math.random() * rows * 0.28 * p.interfere) | 0),
            life: 0.05 + Math.random() * 0.4,
            shift: ((Math.random() - 0.5) * cols * 0.25) | 0,
          });
        }
        if (Math.random() < p.interfere * 0.1) {
          // occasional full-frame flash of B
          G.bands.push({ y0: 0, h: rows, life: 0.05 + Math.random() * 0.09, shift: 0 });
        }
      }
      if (G.bands.length) {
        rowShift = new Float32Array(rows).fill(-9999);
        for (const band of G.bands) {
          const yEnd = Math.min(rows, band.y0 + band.h);
          for (let y = band.y0; y < yEnd; y++) rowShift[y] = band.shift;
        }
      }
    }
    const lumB = g.lumB, rgbB = g.rgbB;

    if (p.playing) {
      for (let c = 0; c < cols; c++) {
        const s = cs[c];
        if (!s) continue;
        s.phase += p.speed * (1 + aBass * 2.2) * s.mult * dt;
        if (s.phase >= cycle) { s.phase -= cycle; s.pass++; }
      }
    }

    const msg = p.message ? p.message + "   " : "";
    const heads = [];
    for (let b = 0; b < BUCKETS; b++) buckets[b].n = 0;

    const useColor = p.colorMode !== "mono";
    const tintRgb = hexToRgb(p.tint);
    const tintStr = `${tintRgb[0]}, ${tintRgb[1]}, ${tintRgb[2]}`;
    const sat = p.saturation;
    const lv = Math.max(2, p.posterLevels);
    const poster = p.colorMode === "poster";

    ctx.font = `500 ${cellH * (0.94 + aLvl * 0.18)}px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let c = 0; c < cols; c++) {
      const s = cs[c];
      if (!s) continue;
      const head = s.phase - p.trail * 0.35;
      const px = offX + c * cellW + cellW / 2;

      for (let y = 0; y < rows; y++) {
        let idx = y * cols + c;
        let srcLum = lum, srcRgb = rgb;
        if (rowShift && rowShift[y] > -9000) {
          const xs = ((((c + rowShift[y]) | 0) % cols) + cols) % cols;
          idx = y * cols + xs;
          srcLum = lumB;
          srcRgb = rgbB;
        }
        let L = srcLum[idx];
        if (p.invert) L = 1 - L;
        L = (L - 0.5) * p.contrast + 0.5 + p.brightness;

        const d = head - y;
        let glow = 0;
        if (d >= -0.6 && d <= trailEff) glow = 1 - Math.max(0, d) / trailEff;

        let a = L * 0.82 + glow * glow * 0.85;
        if (a <= 0.045) continue;
        if (a > 1) a = 1;

        const flick = ((c * 31 + y * 17 + ((time * 6 + s.pass) | 0)) % 7) / 7 - 0.5;
        let mix = L + glow * 0.4 + flick * 0.045;
        if (mix < 0) mix = 0; else if (mix > 1) mix = 1;
        const ch = ramp[Math.round(mix * rn)];
        if (ch === " ") continue;

        const py = offY + y * cellH;

        if (glow > 0.94) {
          heads.push([px, py, c, s.pass]);
          continue;
        }

        if (useColor) {
          // Saturate, normalize toward full value, optionally posterize.
          const gray = srcLum[idx] * 255;
          let r = gray + (srcRgb[idx * 3] - gray) * sat;
          let gr = gray + (srcRgb[idx * 3 + 1] - gray) * sat;
          let b = gray + (srcRgb[idx * 3 + 2] - gray) * sat;
          const mx = Math.max(r, gr, b, 1);
          const boost = (140 + 115 * a) / mx;
          r *= boost; gr *= boost; b *= boost;
          if (poster) {
            const st = 255 / (lv - 1);
            r = Math.round(r / st) * st;
            gr = Math.round(gr / st) * st;
            b = Math.round(b / st) * st;
            a = Math.round(a * (lv - 1)) / (lv - 1);
            if (a <= 0) continue;
          }
          ctx.fillStyle = `rgba(${r | 0}, ${gr | 0}, ${b | 0}, ${a.toFixed(2)})`;
          ctx.fillText(ch, px, py);
        } else {
          let bi = Math.round(a * (BUCKETS - 1));
          if (bi < 0) bi = 0;
          const bk = buckets[bi];
          bk.x[bk.n] = px; bk.y[bk.n] = py; bk.c[bk.n] = ch; bk.n++;
        }
      }
    }

    if (!useColor) {
      for (let b = 0; b < BUCKETS; b++) {
        const bk = buckets[b];
        if (!bk.n) continue;
        ctx.fillStyle = `rgba(${tintStr}, ${((b + 1) / BUCKETS).toFixed(3)})`;
        for (let i = 0; i < bk.n; i++) ctx.fillText(bk.c[i], bk.x[i], bk.y[i]);
      }
    }

    for (let i = 0; i < heads.length; i++) {
      const [px, py, c, pass] = heads[i];
      if (msg) {
        const ch = msg[(c + pass) % msg.length];
        if (ch !== " ") {
          ctx.fillStyle = p.msgColor;
          ctx.fillText(ch, px, py);
          continue;
        }
      }
      ctx.fillStyle = COLOR.paper;
      ctx.fillText(ramp[rn], px, py);
    }

    // Giant center symbol, composited over everything with a blend mode.
    if (p.symbolOn) {
      const S = symbolRef.current;
      if (p.playing) S.t -= dt;
      if (S.t <= 0) {
        S.t = Math.max(0.12, p.symbolRate * (0.6 + Math.random() * 0.8));
        S.ch = SYMBOL_POOL[(Math.random() * SYMBOL_POOL.length) | 0];
      }
      ctx.save();
      ctx.globalCompositeOperation = p.blendMode;
      const sSize = Math.min(w, h) * (0.78 + aLvl * 0.22);
      ctx.font = `700 ${sSize}px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(S.ch, w / 2, h / 2);
      ctx.restore();
    }
  };

  /* ---------- sources: file, paste, camera ---------- */

  const clearSource = () => {
    const src = sourceRef.current;
    const vid = videoRef.current;
    if (audioRef.current.kind === "track") stopAudio();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (vid) {
      vid.pause();
      vid.srcObject = null;
      vid.removeAttribute("src");
      vid.load();
    }
    if (src.url) URL.revokeObjectURL(src.url);
    sourceRef.current = { kind: null, el: null, url: null };
  };

  /* ---------- audio reactivity ---------- */

  const stopAudio = () => {
    const a = audioRef.current;
    if (a.micStream) a.micStream.getTracks().forEach((t) => t.stop());
    if (a.node) { try { a.node.disconnect(); } catch {} }
    a.analyser = null; a.node = null; a.kind = null; a.micStream = null;
    a.levels = { bass: 0, treble: 0, level: 0 };
    const vid = videoRef.current;
    if (vid && sourceRef.current.kind === "video") vid.muted = true;
    setAudioMode("off");
  };

  const startAudio = async (mode) => {
    stopAudio();
    if (mode === "off") return;
    const a = audioRef.current;
    try {
      if (!a.ctx) a.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (a.ctx.state === "suspended") await a.ctx.resume();
      const analyser = a.ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      a.data = new Uint8Array(analyser.frequencyBinCount);

      if (mode === "mic") {
        if (!navigator.mediaDevices?.getUserMedia) {
          setStatus("No mic API in this context — run the file locally for audio.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        a.micStream = stream;
        a.node = a.ctx.createMediaStreamSource(stream);
        a.node.connect(analyser);
        setStatus("Mic is live — the rain reacts to sound.");
      } else {
        const vid = videoRef.current;
        if (sourceRef.current.kind !== "video") {
          setStatus("TRACK needs a loaded video with a soundtrack. Load one, then choose TRACK.");
          return;
        }
        if (!trackNodeRef.current) trackNodeRef.current = a.ctx.createMediaElementSource(vid);
        a.node = trackNodeRef.current;
        const gain = a.ctx.createGain();
        gain.gain.value = 0; // analyse the soundtrack without playing it aloud
        a.node.connect(analyser);
        a.node.connect(gain);
        gain.connect(a.ctx.destination);
        vid.muted = false; // the tap needs an unmuted element; the zero-gain keeps it silent
        setStatus("Reacting to the video's own soundtrack (kept silent).");
      }
      a.analyser = analyser;
      a.kind = mode;
      setAudioMode(mode);
    } catch (err) {
      setStatus(err?.name === "NotAllowedError"
        ? "Mic permission denied — or this frame blocks it. Run the file locally for audio."
        : `Audio failed: ${err?.name || "unknown error"}.`);
    }
  };

  /* ---------- recording ---------- */

  const toggleRecord = () => {
    const cv = canvasRef.current;
    const R = recRef.current;
    if (recording) { R.mr?.stop(); return; }
    if (!cv) return;
    if (!window.MediaRecorder || !cv.captureStream) {
      setStatus("Recording isn't supported in this browser.");
      return;
    }
    const stream = cv.captureStream(30);
    const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
      .find((m) => MediaRecorder.isTypeSupported(m)) || "";
    const mr = new MediaRecorder(
      stream,
      mime ? { mimeType: mime, videoBitsPerSecond: 8000000 } : undefined
    );
    R.chunks = [];
    mr.ondataavailable = (e) => { if (e.data.size) R.chunks.push(e.data); };
    mr.onstop = () => {
      clearInterval(R.timer);
      setRecording(false);
      const blob = new Blob(R.chunks, { type: "video/webm" });
      const a = document.createElement("a");
      a.download = "ascii-rain.webm";
      a.href = URL.createObjectURL(blob);
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setStatus(`Saved ascii-rain.webm — ${(blob.size / 1048576).toFixed(1)} MB`);
    };
    mr.start(250);
    R.mr = mr;
    setRecording(true);
    setRecSecs(0);
    R.timer = setInterval(() => setRecSecs((s) => s + 1), 1000);
    setStatus("Recording the canvas… hit Stop when you're done.");
  };

  const loadFile = useCallback((file, slot = "a") => {
    if (!file) return;
    const toB = slot === "b";

    if (file.type.startsWith("video/")) {
      if (toB) clearB(); else { clearSource(); setMirror(false); }
      const url = URL.createObjectURL(file);
      const vid = toB ? videoBRef.current : videoRef.current;
      vid.src = url;
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      vid.onloadeddata = () => {
        if (toB) {
          sourceBRef.current = { kind: "video", el: vid, url };
          setBName(file.name);
          gridRef.current.dirtyB = true;
          vid.play().catch(() => {});
          setStatus(`Interference source: ${file.name}`);
        } else {
          sourceRef.current = { kind: "video", el: vid, url };
          setSourceKind("video");
          gridRef.current.dirty = true;
          vid.play().catch(() => {});
          setStatus(
            `${file.name} — ${vid.videoWidth}×${vid.videoHeight}, ${vid.duration.toFixed(1)}s, looping`
          );
        }
      };
      vid.onerror = () => setStatus("Couldn't decode that video. MP4 or WebM works best.");
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          if (toB) {
            clearB();
            sourceBRef.current = { kind: "image", el: img, url: null };
            setBName(file.name);
            gridRef.current.dirtyB = true;
            setStatus(`Interference source: ${file.name}`);
          } else {
            clearSource();
            setMirror(false);
            sourceRef.current = { kind: "image", el: img, url: null };
            setSourceKind("image");
            gridRef.current.dirty = true;
            setStatus(`${file.name} — ${img.naturalWidth}×${img.naturalHeight}`);
          }
        };
        img.onerror = () => setStatus("Couldn't decode that image. Try another file.");
        img.src = reader.result;
      };
      reader.onerror = () => setStatus("Couldn't read that file. Try another one.");
      reader.readAsDataURL(file);
      return;
    }

    setStatus("That file isn't an image or a video.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearB = () => {
    const src = sourceBRef.current;
    const vid = videoBRef.current;
    if (vid) {
      vid.pause();
      vid.removeAttribute("src");
      vid.load();
    }
    if (src.url) URL.revokeObjectURL(src.url);
    sourceBRef.current = { kind: null, el: null, url: null };
    glitchRef.current.bands = [];
    setBName(null);
  };

  const startCamera = async () => {
    if (sourceRef.current.kind === "camera") {
      clearSource();
      setSourceKind(null);
      setStatus("Camera stopped.");
      return;
    }
    try {
      clearSource();
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("No camera API here — this context is sandboxed or not HTTPS. Run the file locally (Vite) or on CodeSandbox.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const vid = videoRef.current;
      vid.srcObject = stream;
      vid.muted = true;
      vid.playsInline = true;
      await vid.play();
      sourceRef.current = { kind: "camera", el: vid, url: null };
      setSourceKind("camera");
      setMirror(true);
      setPlaying(true);
      gridRef.current.dirty = true;
      setStatus("Live camera. MIRROR is on — toggle it under Picture.");
    } catch (err) {
      const reasons = {
        NotAllowedError: "Camera permission denied. If there was no prompt, this frame blocks camera access — run the file locally or on CodeSandbox.",
        NotFoundError: "No camera found on this device.",
        NotReadableError: "Camera is busy — another app (Zoom, OBS?) is holding it.",
        OverconstrainedError: "Camera doesn't support the requested resolution.",
        SecurityError: "Camera blocked by this page's security policy — run the file locally or on CodeSandbox.",
      };
      setStatus(reasons[err?.name] || `Camera failed: ${err?.name || "unknown error"}.`);
    }
  };

  useEffect(() => {
    const onPaste = (e) => {
      const items = e.clipboardData?.items || [];
      for (const it of items) {
        if (it.type.startsWith("image/")) { loadFile(it.getAsFile()); break; }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [loadFile]);

  useEffect(() => () => {
    clearSource();
    clearB();
    stopAudio();
    if (recRef.current.mr?.state === "recording") recRef.current.mr.stop();
    clearInterval(recRef.current.timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- transport ---------- */

  const togglePlay = () => {
    setPlaying((v) => {
      const next = !v;
      const src = sourceRef.current;
      if ((src.kind === "video" || src.kind === "camera") && src.el) {
        if (next) src.el.play().catch(() => {});
        else src.el.pause();
      }
      const sB = sourceBRef.current;
      if (sB.kind === "video" && sB.el) {
        if (next) sB.el.play().catch(() => {});
        else sB.el.pause();
      }
      return next;
    });
  };

  const savePng = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const a = document.createElement("a");
    a.download = "ascii-rain-frame.png";
    a.href = cv.toDataURL("image/png");
    a.click();
    setStatus("Saved the current frame as ascii-rain-frame.png");
  };

  /* ---------- ui ---------- */

  const Slider = ({ label, value, min, max, step, onChange, display }) => (
    <label className="ars-ctl">
      <span className="ars-ctl-row">
        <span>{label}</span>
        <b>{display ?? value}</b>
      </span>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );

  const useColorUI = colorMode !== "mono";

  return (
    <div className={`ars-root${uiHidden ? " is-clean" : ""}`}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');

.ars-root{
  --ink:${COLOR.ink}; --field:${COLOR.field}; --pale:#BFD8E8;
  --paper:${COLOR.paper}; --safe:#F2A03D;
  font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  background:var(--ink); color:var(--pale);
  min-height:100vh; padding:20px; box-sizing:border-box;
  display:flex; flex-direction:column; gap:16px;
}
.ars-root.is-clean{padding:0; gap:0;}
.ars-head{display:flex; align-items:baseline; gap:14px; flex-wrap:wrap;
  border-bottom:1px solid rgba(191,216,232,.16); padding-bottom:12px;}
.ars-title{font-weight:700; font-size:15px; letter-spacing:.42em; color:var(--paper); margin:0;}
.ars-sub{font-size:11px; letter-spacing:.14em; color:rgba(191,216,232,.5); margin:0;}
.ars-body{display:flex; gap:18px; align-items:stretch; flex:1 1 auto; min-height:0;}
.ars-stage{flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:10px;}
.ars-canvas-wrap{position:relative; flex:1 1 auto; min-height:340px;
  background:var(--field); border:1px solid rgba(191,216,232,.18); overflow:hidden;}
.is-clean .ars-canvas-wrap{border:none; min-height:100vh;}
.ars-canvas-wrap.is-drag{border-color:var(--safe); box-shadow:inset 0 0 0 1px var(--safe);}
.ars-canvas-wrap canvas{position:absolute; inset:0; width:100%; height:100%; display:block;}
.ars-hint{position:absolute; left:0; right:0; bottom:14px; text-align:center;
  font-size:11px; letter-spacing:.16em; color:rgba(242,247,250,.55); pointer-events:none;}
.ars-status{font-size:11px; letter-spacing:.08em; color:rgba(191,216,232,.55);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
.ars-panel{flex:0 0 268px; display:flex; flex-direction:column; gap:14px; overflow-y:auto;}
.ars-group{border:1px solid rgba(191,216,232,.16); padding:12px;}
.ars-legend{font-size:10px; letter-spacing:.24em; color:rgba(191,216,232,.45);
  text-transform:uppercase; margin:0 0 10px;}
.ars-ctl{display:block; margin-bottom:12px;}
.ars-ctl:last-child{margin-bottom:0;}
.ars-ctl-row{display:flex; justify-content:space-between; font-size:11px;
  letter-spacing:.1em; margin-bottom:5px;}
.ars-ctl-row b{color:var(--paper); font-weight:500;}
.ars-root input[type=range]{width:100%; height:2px; -webkit-appearance:none; appearance:none;
  background:rgba(191,216,232,.28); outline:none;}
.ars-root input[type=range]::-webkit-slider-thumb{-webkit-appearance:none; width:11px; height:11px;
  border-radius:50%; background:var(--paper); cursor:pointer;}
.ars-root input[type=range]::-moz-range-thumb{width:11px; height:11px; border:0;
  border-radius:50%; background:var(--paper); cursor:pointer;}
.ars-root input[type=range]:focus-visible{outline:2px solid var(--safe); outline-offset:4px;}
.ars-msg{width:100%; box-sizing:border-box; background:rgba(8,24,43,.7);
  border:1px solid rgba(242,160,61,.45); color:var(--safe); padding:9px 10px;
  font-family:inherit; font-size:13px; letter-spacing:.1em;}
.ars-msg:focus{outline:none; border-color:var(--safe); box-shadow:0 0 0 1px var(--safe);}
.ars-note{font-size:10px; letter-spacing:.06em; color:rgba(191,216,232,.45);
  margin:7px 0 0; line-height:1.5;}
.ars-btns{display:flex; flex-wrap:wrap; gap:8px;}
.ars-btn{flex:1 1 calc(50% - 4px); background:transparent; color:var(--pale);
  border:1px solid rgba(191,216,232,.3); padding:9px 6px; font-family:inherit;
  font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; cursor:pointer;
  transition:background .15s,color .15s,border-color .15s;}
.ars-btn:hover{background:rgba(191,216,232,.1); color:var(--paper);}
.ars-btn:focus-visible{outline:2px solid var(--safe); outline-offset:2px;}
.ars-btn.is-key{border-color:var(--safe); color:var(--safe);}
.ars-btn.is-key:hover{background:rgba(242,160,61,.14);}
.ars-btn.is-live{border-color:#E86A5C; color:#E86A5C;}
.ars-chips{display:flex; flex-wrap:wrap; gap:6px;}
.ars-chip{background:transparent; border:1px solid rgba(191,216,232,.25);
  color:rgba(191,216,232,.7); padding:5px 9px; font-family:inherit; font-size:10.5px;
  letter-spacing:.1em; cursor:pointer;}
.ars-chip:hover{color:var(--paper); border-color:rgba(191,216,232,.55);}
.ars-chip[aria-pressed="true"]{background:var(--pale); color:var(--ink); border-color:var(--pale);}
.ars-chip:focus-visible{outline:2px solid var(--safe); outline-offset:2px;}
.ars-swatches{display:flex; gap:14px; margin-top:10px;}
.ars-swatch{display:flex; flex-direction:column; gap:5px; font-size:10px;
  letter-spacing:.14em; color:rgba(191,216,232,.55); text-transform:uppercase;}
.ars-swatch input[type=color]{width:44px; height:28px; padding:0; border:1px solid rgba(191,216,232,.3);
  background:transparent; cursor:pointer;}
.ars-restore{position:fixed; top:14px; right:14px; z-index:10;
  background:rgba(8,24,43,.72); color:var(--pale); border:1px solid rgba(191,216,232,.35);
  padding:8px 12px; font-family:inherit; font-size:10.5px; letter-spacing:.14em;
  text-transform:uppercase; cursor:pointer; opacity:.25; transition:opacity .2s;}
.ars-restore:hover, .ars-restore:focus-visible{opacity:1;}
.ars-restore:focus-visible{outline:2px solid var(--safe); outline-offset:2px;}
@media (max-width:900px){
  .ars-body{flex-direction:column;}
  .ars-panel{flex:1 1 auto; overflow:visible;}
  .ars-canvas-wrap{min-height:46vh;}
  .ars-title{letter-spacing:.3em;}
}
@media (prefers-reduced-motion:reduce){
  .ars-root *{transition:none !important;}
}
      `}</style>

      <video ref={videoRef} style={{ display: "none" }} crossOrigin="anonymous" />
      <video ref={videoBRef} style={{ display: "none" }} crossOrigin="anonymous" />

      {uiHidden && (
        <button className="ars-restore" onClick={() => setUiHidden(false)} aria-label="Show controls">
          Show UI · H
        </button>
      )}

      {!uiHidden && (
        <header className="ars-head">
          <h1 className="ars-title">ASCII RAIN</h1>
          <p className="ars-sub">image / video / camera → falling characters → your message in the drops</p>
        </header>
      )}

      <div className="ars-body">
        <div className="ars-stage">
          <div
            ref={wrapRef}
            className={`ars-canvas-wrap${dragging ? " is-drag" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              loadFile(e.dataTransfer.files?.[0]);
            }}
          >
            <canvas ref={canvasRef} />
            {!sourceKind && !uiHidden && (
              <p className="ars-hint">DROP AN IMAGE OR VIDEO — OR START THE CAMERA</p>
            )}
          </div>
          {!uiHidden && <p className="ars-status">{status}</p>}
        </div>

        {!uiHidden && (
          <aside className="ars-panel">
            <div className="ars-group">
              <p className="ars-legend">Message</p>
              <input
                className="ars-msg"
                type="text"
                value={message}
                maxLength={120}
                placeholder="type something"
                onChange={(e) => setMessage(e.target.value)}
                aria-label="Message carried by the falling characters"
              />
            </div>

            <div className="ars-group">
              <p className="ars-legend">Color</p>
              <div className="ars-chips">
                {["mono", "color", "poster"].map((m) => (
                  <button key={m} className="ars-chip" aria-pressed={colorMode === m}
                    onClick={() => setColorMode(m)}>{m.toUpperCase()}</button>
                ))}
              </div>
              {colorMode === "poster" && (
                <div style={{ marginTop: 12 }}>
                  <Slider label="LEVELS" value={posterLevels} min={2} max={8} step={1}
                    onChange={(v) => setPosterLevels(Math.round(v))} display={`${posterLevels}`} />
                </div>
              )}
              {useColorUI && (
                <div style={{ marginTop: 12 }}>
                  <Slider label="SATURATION" value={saturation} min={0} max={2.5} step={0.05}
                    onChange={setSaturation} display={saturation.toFixed(2)} />
                </div>
              )}
              <div className="ars-swatches">
                {!useColorUI && (
                  <label className="ars-swatch">
                    Tint
                    <input type="color" value={tint}
                      onChange={(e) => setTint(e.target.value)} />
                  </label>
                )}
                <label className="ars-swatch">
                  Message
                  <input type="color" value={msgColor}
                    onChange={(e) => setMsgColor(e.target.value)} />
                </label>
              </div>
            </div>

            <div className="ars-group">
              <p className="ars-legend">Characters</p>
              <Slider label="SIZE" value={charSize} min={6} max={44} step={1}
                onChange={(v) => setCharSize(Math.round(v))} display={`${charSize}px`} />
              <div className="ars-chips">
                {Object.keys(RAMPS).map((k) => (
                  <button key={k} className="ars-chip" aria-pressed={rampKey === k}
                    onClick={() => setRampKey(k)}>{k.toUpperCase()}</button>
                ))}
              </div>
            </div>

            <div className="ars-group">
              <p className="ars-legend">Picture</p>
              <Slider label="CONTRAST" value={contrast} min={0.4} max={3} step={0.05}
                onChange={setContrast} display={contrast.toFixed(2)} />
              <Slider label="EXPOSURE" value={brightness} min={-0.45} max={0.45} step={0.01}
                onChange={setBrightness} display={brightness.toFixed(2)} />
              <div className="ars-chips">
                <button className="ars-chip" aria-pressed={invert}
                  onClick={() => setInvert((v) => !v)}>INVERT</button>
                <button className="ars-chip" aria-pressed={mirror}
                  onClick={() => setMirror((v) => !v)}>MIRROR</button>
                <button className="ars-chip" aria-pressed={edge}
                  onClick={() => setEdge((v) => !v)}>EDGE</button>
              </div>
            </div>

            <div className="ars-group">
              <p className="ars-legend">Rain</p>
              <Slider label="FALL SPEED" value={speed} min={0} max={40} step={0.5}
                onChange={setSpeed} display={speed.toFixed(1)} />
              <Slider label="TRAIL" value={trail} min={3} max={44} step={1}
                onChange={(v) => setTrail(Math.round(v))} display={`${trail}`} />
            </div>

            <div className="ars-group">
              <p className="ars-legend">Audio react</p>
              <div className="ars-chips">
                {["off", "mic", "track"].map((m) => (
                  <button key={m} className="ars-chip" aria-pressed={audioMode === m}
                    onClick={() => startAudio(m)}>{m.toUpperCase()}</button>
                ))}
              </div>
              {audioMode !== "off" && (
                <div style={{ marginTop: 12 }}>
                  <Slider label="REACT" value={reactAmt} min={0} max={2} step={0.05}
                    onChange={setReactAmt} display={reactAmt.toFixed(2)} />
                </div>
              )}
              <p className="ars-note">
                Bass pushes fall speed, highs stretch the trails, overall level
                swells the glyphs. TRACK listens to a loaded video's soundtrack.
              </p>
            </div>

            <div className="ars-group">
              <p className="ars-legend">Interference</p>
              <div className="ars-chips">
                <button className="ars-chip"
                  onClick={() => { loadTargetRef.current = "b"; fileRef.current?.click(); }}>
                  LOAD B
                </button>
                {bName && (
                  <button className="ars-chip" onClick={clearB}>CLEAR</button>
                )}
              </div>
              {bName && (
                <div style={{ marginTop: 12 }}>
                  <Slider label="AMOUNT" value={interfere} min={0} max={1} step={0.05}
                    onChange={setInterfere} display={interfere.toFixed(2)} />
                </div>
              )}
              <p className="ars-note">
                {bName
                  ? `B: ${bName} — tears through the main picture in random bands. Bass hits make it worse.`
                  : "Load a second image or video. It randomly tears through the main picture in glitch bands."}
              </p>
            </div>

            <div className="ars-group">
              <p className="ars-legend">Symbol</p>
              <div className="ars-chips">
                <button className="ars-chip" aria-pressed={symbolOn}
                  onClick={() => setSymbolOn((v) => !v)}>ON</button>
                {BLEND_MODES.map(([mode, label]) => (
                  <button key={mode} className="ars-chip" aria-pressed={blendMode === mode}
                    onClick={() => { setBlendMode(mode); setSymbolOn(true); }}>
                    {label}
                  </button>
                ))}
              </div>
              {symbolOn && (
                <div style={{ marginTop: 12 }}>
                  <Slider label="SWAP RATE" value={symbolRate} min={0.2} max={5} step={0.1}
                    onChange={setSymbolRate} display={`${symbolRate.toFixed(1)}s`} />
                </div>
              )}
              <p className="ars-note">
                A giant random glyph sits over the frame, composited with the
                chosen blend mode, swapping on the rate you set.
              </p>
            </div>

            <div className="ars-btns">
              <button className="ars-btn is-key"
                onClick={() => { loadTargetRef.current = "a"; fileRef.current?.click(); }}>
                Load media
              </button>
              <button
                className={`ars-btn${sourceKind === "camera" ? " is-live" : ""}`}
                onClick={startCamera}
              >
                {sourceKind === "camera" ? "Stop camera" : "Camera"}
              </button>
              <button
                className={`ars-btn${recording ? " is-live" : ""}`}
                onClick={toggleRecord}
              >
                {recording ? `Stop ● ${recSecs}s` : "Record"}
              </button>
              <button className="ars-btn" onClick={togglePlay}>
                {playing ? "Freeze" : "Play"}
              </button>
              <button className="ars-btn" onClick={() => setUiHidden(true)}>
                Hide UI · H
              </button>
              <button className="ars-btn" onClick={savePng}>Save PNG</button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const t = loadTargetRef.current;
                  loadTargetRef.current = "a";
                  loadFile(e.target.files?.[0], t);
                  e.target.value = "";
                }}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

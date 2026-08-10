import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { topicList } from "../content/week03Topics.js";
import TopicNav from "./TopicNav.jsx";

/* ============================================================
   BRUSH FOUNDRY — pLAtform tool
   Draw marks, blur them, export as Photoshop .abr (v1 sampled)
   Dark pixels = brush tip. Shelf keeps the last 10 brushes.
   ============================================================ */

const SIZE = 256; // internal canvas resolution (brush pixels)

const OXBLOOD = "#8b3a2f";
const PAPER = "#f5efe1";
const INK = "#2a2320";

// black + 8 greys + white
const PALETTE = Array.from({ length: 10 }, (_, i) => {
  const v = Math.round((255 * i) / 9);
  return { v, css: `rgb(${v},${v},${v})` };
});

/* ---------- .abr writer (version 1, sampled, raw 8-bit) ---------- */
function buildABR(brushes) {
  // brushes: [{ w, h, mask: Uint8Array }]  mask 255 = paints
  let total = 4;
  const bodySizes = brushes.map((b) => {
    const s = 4 + 2 + 1 + 8 + 16 + 2 + 1 + b.w * b.h;
    total += 2 + 4 + s;
    return s;
  });
  const buf = new ArrayBuffer(total);
  const dv = new DataView(buf);
  let o = 0;
  dv.setInt16(o, 1); o += 2;                 // version 1
  dv.setInt16(o, brushes.length); o += 2;    // brush count
  brushes.forEach((b, i) => {
    dv.setInt16(o, 2); o += 2;               // type: sampled
    dv.setInt32(o, bodySizes[i]); o += 4;    // block size
    dv.setInt32(o, 0); o += 4;               // misc
    dv.setInt16(o, 25); o += 2;              // spacing %
    dv.setInt8(o, 0); o += 1;                // antialiasing
    dv.setInt16(o, 0); o += 2;               // bounds top
    dv.setInt16(o, 0); o += 2;               // bounds left
    dv.setInt16(o, b.h); o += 2;             // bounds bottom
    dv.setInt16(o, b.w); o += 2;             // bounds right
    dv.setInt32(o, 0); o += 4;               // long bounds
    dv.setInt32(o, 0); o += 4;
    dv.setInt32(o, b.h); o += 4;
    dv.setInt32(o, b.w); o += 4;
    dv.setInt16(o, 8); o += 2;               // depth
    dv.setInt8(o, 0); o += 1;                // compression: raw
    new Uint8Array(buf, o, b.w * b.h).set(b.mask);
    o += b.w * b.h;
  });
  return buf;
}

function downloadABR(brushes, filename) {
  const blob = new Blob([buildABR(brushes)], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* Extract trimmed brush mask from canvas. Dark = paints (like PS Define Brush). */
function extractMask(canvas) {
  const ctx = canvas.getContext("2d");
  const img = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const full = new Uint8Array(SIZE * SIZE);
  let minX = SIZE, minY = SIZE, maxX = -1, maxY = -1;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const m = 255 - img[(y * SIZE + x) * 4]; // invert: black canvas → opaque brush
      full[y * SIZE + x] = m;
      if (m > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null; // empty canvas
  const pad = 2;
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(SIZE - 1, maxX + pad); maxY = Math.min(SIZE - 1, maxY + pad);
  const w = maxX - minX + 1, h = maxY - minY + 1;
  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      mask[y * w + x] = full[(y + minY) * SIZE + (x + minX)];
  return { w, h, mask };
}

/* Local box blur with radial falloff, applied under the cursor */
function blurAt(ctx, cx, cy, radius, strength) {
  const r = radius;
  const x0 = Math.max(0, Math.floor(cx - r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const x1 = Math.min(SIZE, Math.ceil(cx + r));
  const y1 = Math.min(SIZE, Math.ceil(cy + r));
  const w = x1 - x0, h = y1 - y0;
  if (w < 3 || h < 3) return;

  const img = ctx.getImageData(x0, y0, w, h);
  const src = img.data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) gray[i] = src[i * 4];

  // two passes of a separable box blur, kernel radius 2
  const k = 2;
  let a = gray, b = new Float32Array(w * h);
  for (let pass = 0; pass < 2; pass++) {
    // horizontal
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let s = 0, n = 0;
        for (let d = -k; d <= k; d++) {
          const xx = x + d;
          if (xx >= 0 && xx < w) { s += a[y * w + xx]; n++; }
        }
        b[y * w + x] = s / n;
      }
    }
    // vertical
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let s = 0, n = 0;
        for (let d = -k; d <= k; d++) {
          const yy = y + d;
          if (yy >= 0 && yy < h) { s += b[yy * w + x]; n++; }
        }
        a[y * w + x] = s / n;
      }
    }
  }

  // blend blurred grey back with radial falloff from cursor
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + x0 - cx, dy = y + y0 - cy;
      const d = Math.sqrt(dx * dx + dy * dy) / r;
      if (d >= 1) continue;
      const t = (1 - d * d) * strength;
      const i = (y * w + x) * 4;
      const v = src[i] * (1 - t) + a[y * w + x] * t;
      src[i] = src[i + 1] = src[i + 2] = v;
      src[i + 3] = 255;
    }
  }
  ctx.putImageData(img, x0, y0);
}

export default function BrushFoundry() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPt = useRef(null);
  const [tool, setTool] = useState("draw"); // 'draw' | 'blur'
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState(18);
  const [shelf, setShelf] = useState([]); // [{id, thumb, w, h, mask}]
  const idRef = useRef(1);

  // init white canvas
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    document.title = "Week 03 · Brush Maker — Ryman Curriculum";
  }, []);

  const toCanvasXY = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
  }, []);

  const stamp = useCallback((ctx, x, y) => {
    ctx.fillStyle = PALETTE[colorIdx].css;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }, [colorIdx, size]);

  const applyAt = useCallback((x, y) => {
    const ctx = canvasRef.current.getContext("2d");
    if (tool === "draw") {
      const last = lastPt.current;
      if (last) {
        const dx = x - last.x, dy = y - last.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const step = Math.max(1, size * 0.2);
        for (let d = 0; d <= dist; d += step) {
          stamp(ctx, last.x + (dx * d) / dist || x, last.y + (dy * d) / dist || y);
        }
      } else {
        stamp(ctx, x, y);
      }
    } else {
      blurAt(ctx, x, y, Math.max(12, size * 1.2), 0.85);
    }
    lastPt.current = { x, y };
  }, [tool, size, stamp]);

  const onPointerDown = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    lastPt.current = null;
    const { x, y } = toCanvasXY(e);
    applyAt(x, y);
  };
  const onPointerMove = (e) => {
    if (!drawing.current) return;
    const { x, y } = toCanvasXY(e);
    applyAt(x, y);
  };
  const onPointerUp = () => {
    drawing.current = false;
    lastPt.current = null;
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);
  };

  const [notice, setNotice] = useState("");
  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2200);
  };

  const saveBrush = () => {
    const brush = extractMask(canvasRef.current);
    if (!brush) { flash("Canvas is empty — make a mark first."); return; }
    const thumb = canvasRef.current.toDataURL("image/png");
    const entry = { id: idRef.current++, thumb, ...brush };
    setShelf((s) => [entry, ...s].slice(0, 10));
    flash(`Brush ${entry.id} saved to shelf (${brush.w}×${brush.h}px tip).`);
  };

  const downloadOne = (b) => downloadABR([b], `brush-${String(b.id).padStart(2, "0")}.abr`);
  const downloadAll = () => {
    if (!shelf.length) { flash("Shelf is empty."); return; }
    downloadABR([...shelf].reverse(), "brush-foundry-set.abr");
  };

  return (
    <div style={{
      minHeight: "100vh", background: PAPER, color: INK,
      fontFamily: "'IBM Plex Mono', monospace", padding: "28px 20px 48px",
      boxSizing: "border-box",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap');
        .bf-btn { font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.04em;
          border:1.5px solid ${INK}; background:transparent; color:${INK}; padding:8px 14px;
          cursor:pointer; text-transform:uppercase; transition:background .12s,color .12s; }
        .bf-btn:hover { background:${INK}; color:${PAPER}; }
        .bf-btn:focus-visible { outline:2px solid ${OXBLOOD}; outline-offset:2px; }
        .bf-btn.active { background:${OXBLOOD}; border-color:${OXBLOOD}; color:${PAPER}; }
        .bf-swatch { width:26px; height:26px; border:1.5px solid ${INK}; cursor:pointer; padding:0; }
        .bf-swatch.sel { outline:3px solid ${OXBLOOD}; outline-offset:1.5px; }
        .bf-slot { position:relative; border:1.5px solid ${INK}; background:#fff; aspect-ratio:1;
          overflow:hidden; }
        .bf-slot.empty { background:repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(42,35,32,.07) 6px,rgba(42,35,32,.07) 7px); }
        .bf-slot img { width:100%; height:100%; object-fit:cover; display:block; }
        .bf-dl { position:absolute; inset:auto 0 0 0; background:${OXBLOOD}; color:${PAPER};
          font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.06em; border:0;
          padding:5px 0; cursor:pointer; opacity:0; transition:opacity .12s; text-transform:uppercase; }
        .bf-slot:hover .bf-dl, .bf-dl:focus-visible { opacity:1; }
        input[type=range] { accent-color:${OXBLOOD}; }
        @media (prefers-reduced-motion: reduce) { .bf-btn,.bf-dl { transition:none; } }
      `}</style>

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <Link to="/week/03" style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "11px",
          color: OXBLOOD,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: "20px"
        }}>
          ← Back to Week 03
        </Link>

        {/* header */}
        <header style={{ borderBottom: `2px solid ${INK}`, paddingBottom: 14, marginBottom: 26 }}>
          <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: OXBLOOD, marginBottom: 6 }}>
            pLAtform · tool 
          </div>
          <h1 style={{
            fontFamily: "'Newsreader', serif", fontWeight: 600, fontSize: "clamp(28px,5vw,40px)",
            margin: 0, lineHeight: 1.05,
          }}>
            Brush Maker
          </h1>
          <p style={{ margin: "10px 0 0", fontSize: 12.5, lineHeight: 1.6, maxWidth: 560, color: "#544a44" }}>
            Scribble a mark, soften it with the blur tool, and save it. Dark pixels become
            the brush tip — exactly like Photoshop's <em>Define Brush Preset</em>. Download any
            shelf brush as a <strong>.abr</strong> and load it via Brushes panel → Import Brushes.
          </p>
        </header>

        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* ---- left: canvas + controls ---- */}
          <div style={{ flex: "0 0 auto" }}>
            {/* tools */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button className={`bf-btn ${tool === "draw" ? "active" : ""}`} onClick={() => setTool("draw")}>
                ✎ Draw
              </button>
              <button className={`bf-btn ${tool === "blur" ? "active" : ""}`} onClick={() => setTool("blur")}>
                ◌ Blur
              </button>
              <button className="bf-btn" onClick={clearCanvas} style={{ marginLeft: "auto" }}>
                Clear
              </button>
            </div>

            <canvas
              ref={canvasRef}
              width={SIZE}
              height={SIZE}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                width: "min(340px, 88vw)", height: "min(340px, 88vw)",
                border: `2px solid ${INK}`, background: "#fff",
                touchAction: "none", cursor: "crosshair", display: "block",
                boxShadow: "5px 5px 0 rgba(139,58,47,.25)",
              }}
            />

            {/* palette */}
            <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
              {PALETTE.map((c, i) => (
                <button
                  key={i}
                  className={`bf-swatch ${i === colorIdx ? "sel" : ""}`}
                  style={{ background: c.css }}
                  onClick={() => { setColorIdx(i); setTool("draw"); }}
                  aria-label={`Grey value ${c.v}`}
                  title={`Value ${c.v}`}
                />
              ))}
            </div>

            {/* size */}
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, fontSize: 12 }}>
              Size
              <input
                type="range" min="2" max="64" value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ width: 34, textAlign: "right" }}>{size}px</span>
            </label>

            <button
              className="bf-btn"
              onClick={saveBrush}
              style={{ marginTop: 14, width: "100%", background: OXBLOOD, borderColor: OXBLOOD, color: PAPER, fontWeight: 600 }}
            >
              ↓ Save brush to shelf
            </button>

            <div style={{ minHeight: 20, fontSize: 11.5, marginTop: 8, color: OXBLOOD }} aria-live="polite">
              {notice}
            </div>
          </div>

          {/* ---- right: shelf ---- */}
          <div style={{ flex: "1 1 280px", minWidth: 260 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontWeight: 400, fontSize: 20, margin: 0 }}>
                The shelf <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontStyle: "normal", fontSize: 11, color: "#544a44" }}>— last 10</span>
              </h2>
              <button className="bf-btn" onClick={downloadAll} style={{ fontSize: 10.5, padding: "5px 10px" }}>
                Download set
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 10 }}>
              {shelf.map((b) => (
                <div key={b.id} className="bf-slot">
                  <img src={b.thumb} alt={`Brush ${b.id}`} />
                  <button className="bf-dl" onClick={() => downloadOne(b)}>.abr ↓</button>
                  <span style={{
                    position: "absolute", top: 3, left: 5, fontSize: 10,
                    color: OXBLOOD, fontWeight: 600, textShadow: "0 0 3px #fff",
                  }}>
                    {String(b.id).padStart(2, "0")}
                  </span>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 10 - shelf.length) }).map((_, i) => (
                <div key={`e${i}`} className="bf-slot empty" aria-hidden="true" />
              ))}
            </div>

            <p style={{ fontSize: 11, lineHeight: 1.7, color: "#544a44", marginTop: 16, borderTop: `1px solid rgba(42,35,32,.25)`, paddingTop: 12 }}>
              Hover a thumbnail to download that brush alone, or grab the whole shelf as one
              .abr set. Tips are auto-trimmed to their bounding box, exported at 8-bit with
              25% spacing. In Photoshop, adjust spacing, scattering, and transfer in Brush
              Settings after import.
            </p>
          </div>
          <TopicNav topicList={topicList} topicKey="brush-maker" weekNum="03" />
        </div>
      </div>
    </div>
  );
}

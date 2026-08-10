import React, { useState, useRef, useCallback, useEffect } from "react";
import { topicList } from "../content/week03Topics.js";
import TopicNav from "./TopicNav.jsx";

/* ============================================================
   GRADIENT MARQUEE — sample a linear gradient from an image
   Drag a box over the image; the drag direction is the gradient
   axis. Pixels in the box are projected onto that axis, averaged
   into a color ramp, reduced to stops, and exported as a
   Photoshop-native .grd file (v5 ActionDescriptor format).
   pLAtform design system: oxblood / paper / Plex Mono / Newsreader
   ============================================================ */

const OX = "#8b3a2f";
const PAPER = "#f5efe1";
const INK = "#2a2018";
const LINE = "#d8cdb8";

/* ---------------- GRD v5 binary writer ---------------- */
/* Format: "8BGR" + uint16 version(5) + uint32 16 + ActionDescriptor.
   Verified against the re-lab / selapa.net reverse-engineered spec:
   root(null){ GrdL: [ Objc(Grdn){ Grad: Objc(Grdn){ Nm, GrdF=CstS,
   Intr, Clrs:[Clrt{Clr:RGBC{Rd,Grn,Bl}, Type=UsrS, Lctn 0-4096,
   Mdpn}], Trns:[TrnS{Opct #Prc, Lctn, Mdpn}] } } ] }             */
function makeGrdWriter() {
  const bytes = [];
  const ascii = (s) => { for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i) & 0xff); };
  const u16 = (v) => bytes.push((v >> 8) & 0xff, v & 0xff);
  const u32 = (v) => bytes.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
  const f64 = (v) => { const b = new ArrayBuffer(8); new DataView(b).setFloat64(0, v, false); bytes.push(...new Uint8Array(b)); };
  const ustr = (s) => { u32(s.length + 1); for (let i = 0; i < s.length; i++) u16(s.charCodeAt(i)); u16(0); };
  const key = (k) => { u32(0); ascii((k + "    ").slice(0, 4)); };
  return { bytes, ascii, u16, u32, f64, ustr, key };
}

function writeDescBody(w, name, classId, items) {
  w.ustr(name); w.key(classId); w.u32(items.length);
  for (const [k, fn] of items) { w.key(k); fn(w); }
}
const G = {
  objc: (name, cid, items) => (w) => { w.ascii("Objc"); writeDescBody(w, name, cid, items); },
  list: (fns) => (w) => { w.ascii("VlLs"); w.u32(fns.length); fns.forEach((f) => f(w)); },
  doub: (v) => (w) => { w.ascii("doub"); w.f64(v); },
  untf: (u, v) => (w) => { w.ascii("UntF"); w.ascii(u); w.f64(v); },
  text: (s) => (w) => { w.ascii("TEXT"); w.ustr(s); },
  enum_: (t, v) => (w) => { w.ascii("enum"); w.key(t); w.key(v); },
  long: (v) => (w) => { w.ascii("long"); w.u32(v); },
};

function buildGrd(gradients) {
  const w = makeGrdWriter();
  w.ascii("8BGR"); w.u16(5); w.u32(16);
  writeDescBody(w, "", "null", [
    ["GrdL", G.list(gradients.map((g) =>
      G.objc("Gradient", "Grdn", [
        ["Grad", G.objc("Gradient", "Grdn", [
          ["Nm  ", G.text(g.name || "Gradient")],
          ["GrdF", G.enum_("GrdF", "CstS")],
          ["Intr", G.doub(4096)],
          ["Clrs", G.list(g.stops.map((s) =>
            G.objc("", "Clrt", [
              ["Clr ", G.objc("", "RGBC", [
                ["Rd  ", G.doub(s.r)],
                ["Grn ", G.doub(s.g)],
                ["Bl  ", G.doub(s.b)],
              ])],
              ["Type", G.enum_("Clry", "UsrS")],
              ["Lctn", G.long(Math.round(s.t * 4096))],
              ["Mdpn", G.long(50)],
            ])
          ))],
          ["Trns", G.list([0, 4096].map((loc) =>
            G.objc("", "TrnS", [
              ["Opct", G.untf("#Prc", 100)],
              ["Lctn", G.long(loc)],
              ["Mdpn", G.long(50)],
            ])
          ))],
        ])],
      ])
    ))],
  ]);
  return Uint8Array.from(w.bytes);
}

/* ---------------- sampling + stop reduction ---------------- */
const BINS = 96;

// Project every pixel inside the marquee onto the drag axis; average per bin.
function sampleRamp(ctx, p0, p1) {
  const x0 = Math.min(p0.x, p1.x), y0 = Math.min(p0.y, p1.y);
  const wpx = Math.max(1, Math.abs(p1.x - p0.x)), hpx = Math.max(1, Math.abs(p1.y - p0.y));
  const vx = p1.x - p0.x, vy = p1.y - p0.y;
  const len2 = vx * vx + vy * vy || 1;
  const img = ctx.getImageData(Math.round(x0), Math.round(y0), Math.round(wpx), Math.round(hpx));
  const { data, width, height } = img;
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 250000)));
  const acc = Array.from({ length: BINS }, () => [0, 0, 0, 0]);
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const px = x0 + x - p0.x, py = y0 + y - p0.y;
      let t = (px * vx + py * vy) / len2;
      t = Math.max(0, Math.min(1, t));
      const bin = Math.min(BINS - 1, Math.floor(t * BINS));
      const i = (y * width + x) * 4;
      acc[bin][0] += data[i]; acc[bin][1] += data[i + 1]; acc[bin][2] += data[i + 2]; acc[bin][3]++;
    }
  }
  const ramp = [];
  for (let b = 0; b < BINS; b++) {
    if (acc[b][3] > 0) ramp[b] = { r: acc[b][0] / acc[b][3], g: acc[b][1] / acc[b][3], b: acc[b][2] / acc[b][3] };
    else ramp[b] = null;
  }
  // fill empty bins from neighbors
  let last = null;
  for (let b = 0; b < BINS; b++) { if (ramp[b]) last = ramp[b]; else if (last) ramp[b] = { ...last }; }
  last = null;
  for (let b = BINS - 1; b >= 0; b--) { if (ramp[b]) last = ramp[b]; else if (last) ramp[b] = { ...last }; }
  return ramp.every((r) => r) ? ramp : null;
}

const dist2 = (a, b) => {
  const dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
  return 0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db; // luma-weighted
};

// Greedy max-error insertion: start with endpoints, add the sample
// that deviates most from the current piecewise-linear gradient.
function reduceToStops(ramp, maxStops) {
  const n = ramp.length;
  const idxs = [0, n - 1];
  const interpAt = (i) => {
    const lo = Math.max(...idxs.filter((x) => x <= i));
    const hi = Math.min(...idxs.filter((x) => x >= i));
    if (hi === lo) return ramp[lo];
    const t = (i - lo) / (hi - lo);
    return {
      r: ramp[lo].r + (ramp[hi].r - ramp[lo].r) * t,
      g: ramp[lo].g + (ramp[hi].g - ramp[lo].g) * t,
      b: ramp[lo].b + (ramp[hi].b - ramp[lo].b) * t,
    };
  };
  while (idxs.length < maxStops) {
    let worst = -1, worstErr = 0;
    for (let i = 1; i < n - 1; i++) {
      if (idxs.includes(i)) continue;
      const e = dist2(ramp[i], interpAt(i));
      if (e > worstErr) { worstErr = e; worst = i; }
    }
    if (worst < 0 || worstErr < 9) break; // ~3 luma-weighted levels: close enough
    idxs.push(worst); idxs.sort((a, b) => a - b);
  }
  return idxs.map((i) => ({
    t: i / (n - 1),
    r: Math.round(ramp[i].r), g: Math.round(ramp[i].g), b: Math.round(ramp[i].b),
  }));
}

const hex = (s) => "#" + [s.r, s.g, s.b].map((v) => v.toString(16).padStart(2, "0")).join("");
const cssGradient = (stops, angle = 90) =>
  `linear-gradient(${Math.round(angle)}deg, ${stops.map((s) => `${hex(s)} ${(s.t * 100).toFixed(1)}%`).join(", ")})`;

/* ---------------- component ---------------- */
export default function GradientMarquee() {
  const [imgSrc, setImgSrc] = useState(null);
  const [rect, setRect] = useState(null);          // display-space marquee {x0,y0,x1,y1}
  const [ramp, setRamp] = useState(null);
  const [stops, setStops] = useState(null);
  const [maxStops, setMaxStops] = useState(5);
  const [angle, setAngle] = useState(90);
  const [name, setName] = useState("Sampled Gradient 01");
  const [set, setSet] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [flash, setFlash] = useState("");

  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);   // hidden sampling canvas at natural res
  const startRef = useRef(null);
  const lastDragRef = useRef(null);

  const loadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImgSrc(url); setRect(null); setRamp(null); setStops(null); setSet([]);
  };

  useEffect(() => {
    const onPaste = (e) => {
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
      if (item) loadFile(item.getAsFile());
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const onImgLoad = () => {
    const img = imgRef.current;
    const c = canvasRef.current;
    const scale = Math.min(1, 2048 / Math.max(img.naturalWidth, img.naturalHeight));
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext("2d", { willReadFrequently: true }).drawImage(img, 0, 0, c.width, c.height);
  };

  const toLocal = (e) => {
    const r = imgRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(r.width, e.clientX - r.left)),
      y: Math.max(0, Math.min(r.height, e.clientY - r.top)),
    };
  };

  const resample = useCallback((drag, nStops) => {
    const img = imgRef.current, c = canvasRef.current;
    if (!img || !c || !drag) return;
    const sx = c.width / img.getBoundingClientRect().width;
    const sy = c.height / img.getBoundingClientRect().height;
    const p0 = { x: drag.x0 * sx, y: drag.y0 * sy };
    const p1 = { x: drag.x1 * sx, y: drag.y1 * sy };
    if (Math.abs(p1.x - p0.x) < 3 && Math.abs(p1.y - p0.y) < 3) return;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const newRamp = sampleRamp(ctx, p0, p1);
    if (!newRamp) return;
    setRamp(newRamp);
    setStops(reduceToStops(newRamp, nStops));
    setAngle(((Math.atan2(drag.y1 - drag.y0, drag.x1 - drag.x0) * 180) / Math.PI + 90 + 360) % 360);
  }, []);

  const onPointerDown = (e) => {
    if (!imgSrc) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = toLocal(e);
    startRef.current = p;
    setRect({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
    setDragging(true);
  };
  const onPointerMove = (e) => {
    if (!dragging || !startRef.current) return;
    const p = toLocal(e);
    setRect({ x0: startRef.current.x, y0: startRef.current.y, x1: p.x, y1: p.y });
  };
  const onPointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    const p = toLocal(e);
    const drag = { x0: startRef.current.x, y0: startRef.current.y, x1: p.x, y1: p.y };
    lastDragRef.current = drag;
    resample(drag, maxStops);
  };

  const onStopSlider = (v) => {
    setMaxStops(v);
    if (ramp) setStops(reduceToStops(ramp, v));
  };

  const addToSet = () => {
    if (!stops) return;
    setSet((s) => [...s, { name, stops }]);
    const n = set.length + 2;
    setName(`Sampled Gradient ${String(n).padStart(2, "0")}`);
    ping("Added to set");
  };

  const download = (grads) => {
    const data = buildGrd(grads);
    const blob = new Blob([data], { type: "application/octet-stream" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (grads.length === 1 ? grads[0].name.replace(/\s+/g, "-") : "gradient-set") + ".grd";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    ping(".grd saved — Photoshop: Gradients panel ▸ ☰ ▸ Import Gradients");
  };

  const copyCss = () => {
    if (!stops) return;
    navigator.clipboard?.writeText(`background: ${cssGradient(stops, angle)};`);
    ping("CSS copied");
  };

  const ping = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 3200); };

  const mq = rect && {
    left: Math.min(rect.x0, rect.x1), top: Math.min(rect.y0, rect.y1),
    width: Math.abs(rect.x1 - rect.x0), height: Math.abs(rect.y1 - rect.y0),
  };

  const mono = "'IBM Plex Mono', ui-monospace, monospace";
  const serif = "'Newsreader', Georgia, serif";
  const btn = (primary) => ({
    fontFamily: mono, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
    padding: "9px 14px", cursor: "pointer", border: `1px solid ${OX}`,
    background: primary ? OX : "transparent", color: primary ? PAPER : OX,
  });

  return (
    <div style={{ minHeight: "100vh", background: PAPER, color: INK, fontFamily: mono }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap');
        input[type=range]{ accent-color:${OX}; }
        *{ box-sizing:border-box; }
      `}</style>

      {/* header */}
      <div style={{ borderBottom: `2px solid ${INK}`, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", color: OX }}>pLAtform · COLOR TOOLS</div>
          <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, lineHeight: 1.1 }}>Gradient Marquee</div>
        </div>
        <div style={{ fontSize: 11, color: "#7a6d5a", maxWidth: 340, textAlign: "right" }}>
          drag a box across the image — drag direction sets the gradient axis
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(300px,1fr)", gap: 0 }}>
        {/* left: image + marquee */}
        <div style={{ padding: 24, borderRight: `1px solid ${LINE}` }}>
          {!imgSrc ? (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                height: 380, border: `1.5px dashed ${OX}`, cursor: "pointer", gap: 10, textAlign: "center", padding: 20,
              }}
            >
              <div style={{ fontFamily: serif, fontSize: 22, fontStyle: "italic" }}>Drop an image here</div>
              <div style={{ fontSize: 11, color: "#7a6d5a" }}>click to browse · or paste from clipboard</div>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => loadFile(e.target.files[0])} />
            </label>
          ) : (
            <div
              ref={wrapRef}
              style={{ position: "relative", display: "inline-block", cursor: "crosshair", touchAction: "none", maxWidth: "100%" }}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
            >
              <img ref={imgRef} src={imgSrc} onLoad={onImgLoad} alt="source"
                   style={{ display: "block", maxWidth: "100%", maxHeight: "70vh", userSelect: "none" }} draggable={false} />
              {mq && (
                <>
                  <div style={{
                    position: "absolute", left: mq.left, top: mq.top, width: mq.width, height: mq.height,
                    border: `1.5px solid ${PAPER}`, outline: `1.5px dashed ${OX}`, background: "rgba(139,58,47,0.08)",
                    pointerEvents: "none",
                  }} />
                  {/* axis line */}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                    <line x1={rect.x0} y1={rect.y0} x2={rect.x1} y2={rect.y1} stroke={OX} strokeWidth="1.5" strokeDasharray="4 3" />
                    <circle cx={rect.x0} cy={rect.y0} r="4" fill={PAPER} stroke={OX} strokeWidth="1.5" />
                    <circle cx={rect.x1} cy={rect.y1} r="4" fill={OX} stroke={PAPER} strokeWidth="1.5" />
                  </svg>
                </>
              )}
            </div>
          )}
          {imgSrc && (
            <div style={{ marginTop: 10, fontSize: 11, color: "#7a6d5a", display: "flex", gap: 16 }}>
              <span>○ start → ● end defines the axis</span>
              <label style={{ color: OX, cursor: "pointer", textDecoration: "underline" }}>
                replace image
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => loadFile(e.target.files[0])} />
              </label>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        {/* right: gradient + export */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", color: OX, marginBottom: 8 }}>SAMPLED GRADIENT</div>
            {stops ? (
              <>
                <div style={{ height: 56, border: `1px solid ${INK}`, background: cssGradient(stops, 90) }} />
                {/* stop markers */}
                <div style={{ position: "relative", height: 26, marginTop: 2 }}>
                  {stops.map((s, i) => (
                    <div key={i} title={hex(s)} style={{
                      position: "absolute", left: `calc(${s.t * 100}% - 6px)`, top: 0,
                      width: 12, height: 12, background: hex(s), border: `1.5px solid ${INK}`,
                    }} />
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 10.5 }}>
                  {stops.map((s, i) => (
                    <span key={i} style={{ border: `1px solid ${LINE}`, padding: "2px 6px", background: "#fff" }}>
                      {hex(s)} · {(s.t * 100).toFixed(0)}%
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: 56, border: `1px dashed ${LINE}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#a99a82" }}>
                drag a marquee to sample
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: 11, display: "flex", justifyContent: "space-between" }}>
              <span>STOPS</span><span style={{ color: OX }}>{stops ? stops.length : "—"} / {maxStops} max</span>
            </label>
            <input type="range" min="2" max="12" value={maxStops} onChange={(e) => onStopSlider(+e.target.value)} style={{ width: "100%" }} />
            <div style={{ fontSize: 10, color: "#7a6d5a" }}>
              stops are placed where the sampled ramp bends most · angle {Math.round(angle)}°
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, letterSpacing: "0.14em", color: OX }}>GRADIENT NAME</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
                   style={{ width: "100%", marginTop: 6, padding: "9px 10px", fontFamily: mono, fontSize: 13,
                            border: `1px solid ${INK}`, background: "#fff", color: INK }} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button style={btn(true)} disabled={!stops} onClick={() => stops && download([{ name, stops }])}>Save .grd</button>
            <button style={btn(false)} disabled={!stops} onClick={addToSet}>Add to set</button>
            <button style={btn(false)} disabled={!stops} onClick={copyCss}>Copy CSS</button>
          </div>

          {set.length > 0 && (
            <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", color: OX, marginBottom: 8 }}>
                SET · {set.length} GRADIENT{set.length > 1 ? "S" : ""}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {set.map((g, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 20, border: `1px solid ${INK}`, background: cssGradient(g.stops, 90) }} />
                    <span style={{ fontSize: 10.5, width: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
                    <button onClick={() => setSet((s) => s.filter((_, j) => j !== i))}
                            style={{ ...btn(false), padding: "3px 7px", fontSize: 10 }}>×</button>
                  </div>
                ))}
              </div>
              <button style={{ ...btn(true), marginTop: 10, width: "100%" }} onClick={() => download(set)}>
                Save set as one .grd
              </button>
            </div>
          )}

          <div style={{ fontSize: 10.5, color: "#7a6d5a", fontFamily: serif, fontStyle: "italic", lineHeight: 1.5 }}>
            In Photoshop: Window ▸ Gradients, panel menu ▸ Import Gradients…, pick the .grd.
            Works in the classic Gradients preset panel (2020+).
          </div>

          {flash && (
            <div style={{ background: OX, color: PAPER, padding: "8px 12px", fontSize: 11 }}>{flash}</div>
          )}
        </div>
      </div>
      <TopicNav topicList={topicList} topicKey="gradient-marquee" weekNum="03" />
    </div>
  );
}

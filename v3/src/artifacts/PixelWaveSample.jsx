import { useState, useRef, useEffect, useCallback } from "react";

/**
 * PixelWaveSample
 * -----------------------------------------------------------------------------
 * Renders a paragraph with an inline, clickable bold phrase. Clicking it opens
 * an 800 x 450 oscilloscope-style popup that decomposes a single pixel into its
 * three component light-waves (R / G / B) and their superposition (the composite
 * wave that actually reaches a sensor). The three channel amplitudes ARE the
 * samples the pixel stores.
 *
 * Drop-in: <PixelWaveSample /> — fully self-contained, inline-styled, no deps
 * beyond React. Customize copy via props if you want.
 */

const CHANNELS = [
  { key: "r", label: "R", color: "#ff5a52", cycles: 2.0 }, // longest wavelength → slowest
  { key: "g", label: "G", color: "#46d97a", cycles: 2.6 },
  { key: "b", label: "B", color: "#4a9fff", cycles: 3.1 }, // shortest wavelength → fastest
];

const toHex = ({ r, g, b }) =>
  "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

const fromHex = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

function WaveScope({ rgb }) {
  const canvasRef = useRef(null);
  const rgbRef = useRef(rgb);
  const [components, setComponents] = useState(true);
  const [running, setRunning] = useState(true);
  const compRef = useRef(true);
  const runRef = useRef(true);

  useEffect(() => { rgbRef.current = rgb; }, [rgb]);
  useEffect(() => { compRef.current = components; }, [components]);
  useEffect(() => { runRef.current = running; }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf;
    let phase = 0;
    let last = performance.now();

    const sync = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      return { w, h };
    };

    const draw = () => {
      const { w, h } = sync();
      const cur = rgbRef.current;
      const midY = h / 2;
      const compAmp = h * 0.13; // peak amplitude of a fully-on channel

      ctx.clearRect(0, 0, w, h);

      // --- grid ---------------------------------------------------------
      ctx.strokeStyle = "#171b21";
      ctx.lineWidth = 1;
      for (let gx = 0; gx <= w; gx += w / 10) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (let gy = 0; gy <= h; gy += h / 6) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }
      ctx.strokeStyle = "#2a313a";
      ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke();

      const step = 2;

      // --- component waves ---------------------------------------------
      if (compRef.current) {
        for (const ch of CHANNELS) {
          const a = (cur[ch.key] / 255) * compAmp;
          ctx.strokeStyle = ch.color;
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          for (let x = 0; x <= w; x += step) {
            const y = midY - a * Math.sin((x / w) * ch.cycles * Math.PI * 2 + phase);
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // --- composite (superposition of the three) ----------------------
      ctx.strokeStyle = "#f2ede2";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(242,237,226,0.35)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let x = 0; x <= w; x += step) {
        let sum = 0;
        for (const ch of CHANNELS) {
          const a = (cur[ch.key] / 255) * compAmp;
          sum += a * Math.sin((x / w) * ch.cycles * Math.PI * 2 + phase);
        }
        const y = midY - sum;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- sample markers: each channel amplitude = its stored sample ---
      const markX = 8;
      for (const ch of CHANNELS) {
        const a = (cur[ch.key] / 255) * compAmp;
        const y = midY - a;
        ctx.fillStyle = ch.color;
        ctx.beginPath();
        ctx.arc(markX, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = ch.color;
        ctx.globalAlpha = 0.35;
        ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(markX, y); ctx.lineTo(w, y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      if (!reduce && runRef.current) {
        const now = performance.now();
        phase -= ((now - last) / 1000) * 1.6; // scroll left
        last = now;
      } else {
        last = performance.now();
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 8 }}>
      <canvas
        ref={canvasRef}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          background: "#0b0d10",
          borderRadius: 4,
          display: "block",
        }}
      />
      <div style={{ display: "flex", gap: 8, fontFamily: "var(--pw-mono)", fontSize: 11 }}>
        <button onClick={() => setComponents((v) => !v)} style={chipStyle(components)}>
          components
        </button>
        <button onClick={() => setRunning((v) => !v)} style={chipStyle(running)}>
          {running ? "running" : "frozen"}
        </button>
        <span style={{ marginLeft: "auto", color: "#6b7480", alignSelf: "center" }}>
          composite = R + G + B superposition
        </span>
      </div>
    </div>
  );
}

const chipStyle = (active) => ({
  fontFamily: "var(--pw-mono)",
  fontSize: 11,
  letterSpacing: "0.04em",
  padding: "4px 10px",
  borderRadius: 3,
  cursor: "pointer",
  border: `1px solid ${active ? "#c2452f" : "#2a313a"}`,
  background: active ? "rgba(194,69,47,0.14)" : "transparent",
  color: active ? "#f2ede2" : "#6b7480",
});

function Popup({ onClose }) {
  const [rgb, setRgb] = useState({ r: 232, g: 88, b: 52 });
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current && closeRef.current.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setCh = (k, v) => setRgb((p) => ({ ...p, [k]: Math.max(0, Math.min(255, +v)) }));

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(5,6,8,0.72)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        ["--pw-mono"]: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pixel wave sample"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 800, height: 450, maxWidth: "95vw", maxHeight: "90vh",
          background: "#101317",
          border: "1px solid #232a32",
          borderRadius: 8,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          color: "#e8e4da",
          fontFamily: "var(--pw-mono)",
        }}
      >
        {/* title bar */}
        <div style={{
          height: 44, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 14px", borderBottom: "1px solid #1c2127",
        }}>
          <span style={{ fontSize: 12, letterSpacing: "0.18em", color: "#9aa3ad" }}>
            PIXEL <span style={{ color: "#3a424c" }}>·</span> WAVE&nbsp;SAMPLE
          </span>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 26, height: 26, borderRadius: 3, cursor: "pointer",
              background: "transparent", color: "#9aa3ad",
              border: "1px solid #2a313a", fontSize: 14, lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* body */}
        <div style={{ flex: 1, display: "flex", minHeight: 0, padding: 14, gap: 14 }}>
          {/* rail */}
          <div style={{ width: 210, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 4, flexShrink: 0,
                background: toHex(rgb), border: "1px solid #2a313a",
                boxShadow: `0 0 22px ${toHex(rgb)}55`,
              }} />
              <div style={{ minWidth: 0 }}>
                <input
                  type="color"
                  value={toHex(rgb)}
                  onChange={(e) => setRgb(fromHex(e.target.value))}
                  aria-label="Pick pixel color"
                  style={{ width: 36, height: 24, background: "none", border: "none", padding: 0, cursor: "pointer" }}
                />
                <div style={{ fontSize: 13, letterSpacing: "0.06em", marginTop: 4 }}>{toHex(rgb)}</div>
                <div style={{ fontSize: 10, color: "#6b7480" }}>
                  {rgb.r}, {rgb.g}, {rgb.b}
                </div>
              </div>
            </div>

            {CHANNELS.map((ch) => (
              <label key={ch.key} style={{ display: "block" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 11, color: ch.color, marginBottom: 3, letterSpacing: "0.05em",
                }}>
                  <span>{ch.label}</span>
                  <span style={{ color: "#9aa3ad" }}>{rgb[ch.key]}</span>
                </div>
                <input
                  type="range" min={0} max={255} value={rgb[ch.key]}
                  onChange={(e) => setCh(ch.key, e.target.value)}
                  style={{ width: "100%", accentColor: ch.color, cursor: "pointer" }}
                />
              </label>
            ))}

            <p style={{
              margin: 0, marginTop: "auto", fontSize: 10.5, lineHeight: 1.5,
              color: "#6b7480",
            }}>
              Each channel is the <span style={{ color: "#9aa3ad" }}>amplitude sample</span> of
              a light-wave. The pixel stores three numbers; together they reconstruct
              the composite trace. Frequencies follow real wavelength order — blue runs fastest.
            </p>
          </div>

          <WaveScope rgb={rgb} />
        </div>
      </div>
    </div>
  );
}

export default function PixelWaveSample() {
  const [rgb, setRgb] = useState({ r: 102, g: 51, b: 153 });
  const setCh = (k, v) => setRgb((p) => ({ ...p, [k]: Math.max(0, Math.min(255, +v)) }));

  return (
    <div
      style={{
        background: "#101317",
        border: "1px solid #232a32",
        borderRadius: 8,
        overflow: "hidden",
        color: "#e8e4da",
        fontFamily: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      }}
    >
      {/* title bar */}
      <div style={{
        height: 40, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 14px", borderBottom: "1px solid #1c2127",
      }}>
        <span style={{ fontSize: 11, letterSpacing: "0.18em", color: "#9aa3ad" }}>
          PIXEL <span style={{ color: "#3a424c" }}>·</span> WAVE&nbsp;SAMPLE
        </span>
      </div>

      {/* body */}
      <div style={{ display: "flex", minHeight: 0, padding: 14, gap: 14, flexWrap: "wrap" }}>
        {/* rail */}
        <div style={{ width: 210, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 4, flexShrink: 0,
              background: toHex(rgb), border: "1px solid #2a313a",
              boxShadow: `0 0 22px ${toHex(rgb)}55`,
            }} />
            <div style={{ minWidth: 0 }}>
              <input
                type="color"
                value={toHex(rgb)}
                onChange={(e) => setRgb(fromHex(e.target.value))}
                aria-label="Pick pixel color"
                style={{ width: 36, height: 24, background: "none", border: "none", padding: 0, cursor: "pointer" }}
              />
              <div style={{ fontSize: 13, letterSpacing: "0.06em", marginTop: 4 }}>{toHex(rgb)}</div>
              <div style={{ fontSize: 10, color: "#6b7480" }}>
                {rgb.r}, {rgb.g}, {rgb.b}
              </div>
            </div>
          </div>

          {CHANNELS.map((ch) => (
            <label key={ch.key} style={{ display: "block" }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 11, color: ch.color, marginBottom: 3, letterSpacing: "0.05em",
              }}>
                <span>{ch.label}</span>
                <span style={{ color: "#9aa3ad" }}>{rgb[ch.key]}</span>
              </div>
              <input
                type="range" min={0} max={255} value={rgb[ch.key]}
                onChange={(e) => setCh(ch.key, e.target.value)}
                style={{ width: "100%", accentColor: ch.color, cursor: "pointer" }}
              />
            </label>
          ))}

          <p style={{
            margin: 0, marginTop: "auto", fontSize: 10.5, lineHeight: 1.5,
            color: "#6b7480",
          }}>
            Each channel is the <span style={{ color: "#9aa3ad" }}>amplitude sample</span> of
            a light-wave. The pixel stores three numbers; together they reconstruct
            the composite trace.
          </p>
        </div>

        <WaveScope rgb={rgb} />
      </div>
    </div>
  );
}

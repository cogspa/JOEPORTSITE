import { useState, useEffect, useRef, useCallback } from "react";
import { topicList } from "../content/week03Topics.js";
import TopicNav from "./TopicNav.jsx";

/* ============================================================
   pLAtform · Color & Light
   Lesson: Threshold — Notan Studies in Photoshop
   - Live Threshold Lab: the Photoshop Threshold dialog rebuilt
     in-browser (real histogram, live 2-value preview)
   - 3-value mode: a second threshold for black / gray / white
   - The procedural workflow: Smart Object + Image > Adjustments
     > Threshold  →  becomes a re-editable Smart Filter
   - Three routes compared: destructive / Smart Filter /
     adjustment layer
   ============================================================ */

const INK = "#1a1512";
const OXBLOOD = "#8b3a2f";
const PAPER = "#f5efe1";
const PAPER_DARK = "#ece3cf";
const PS_BG = "#2b2b2b";
const PS_PANEL = "#383838";

/* Study image (golden hour — strong natural silhouettes) */
const STUDY_IMG = "data:image/jpeg;base64,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";

/* ---------- Threshold Lab ---------- */

function ThresholdLab() {
  const canvasRef = useRef(null);
  const histRef = useRef(null);
  const srcRef = useRef(null); // { data: Uint8ClampedArray lum, w, h, imgData }
  const [threshold, setThreshold] = useState(128);
  const [threshold2, setThreshold2] = useState(190);
  const [mode, setMode] = useState("2"); // "2" | "3"
  const [showOriginal, setShowOriginal] = useState(false);
  const [histogram, setHistogram] = useState(null);

  /* Load image once, precompute luminance + histogram */
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d");
      octx.drawImage(img, 0, 0);
      const imgData = octx.getImageData(0, 0, w, h);
      const d = imgData.data;
      const lum = new Uint8ClampedArray(w * h);
      const hist = new Array(256).fill(0);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const y = Math.round(
          0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
        );
        lum[p] = y;
        hist[y]++;
      }
      srcRef.current = { lum, w, h, original: imgData };
      setHistogram(hist);
    };
    img.src = STUDY_IMG;
  }, []);

  /* Render thresholded image */
  const render = useCallback(() => {
    const src = srcRef.current;
    const canvas = canvasRef.current;
    if (!src || !canvas) return;
    const { lum, w, h, original } = src;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    if (showOriginal) {
      ctx.putImageData(original, 0, 0);
      return;
    }

    const out = ctx.createImageData(w, h);
    const o = out.data;
    const t1 = Math.min(threshold, threshold2);
    const t2 = Math.max(threshold, threshold2);
    for (let p = 0, i = 0; p < lum.length; p++, i += 4) {
      let v;
      if (mode === "2") {
        v = lum[p] < threshold ? 0 : 255;
      } else {
        v = lum[p] < t1 ? 0 : lum[p] < t2 ? 128 : 255;
      }
      o[i] = o[i + 1] = o[i + 2] = v;
      o[i + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  }, [threshold, threshold2, mode, showOriginal]);

  useEffect(() => {
    render();
  }, [render, histogram]);

  /* Draw histogram (Photoshop-dialog style) */
  useEffect(() => {
    const canvas = histRef.current;
    if (!canvas || !histogram) return;
    const W = 256;
    const H = 80;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#464646";
    ctx.fillRect(0, 0, W, H);
    const max = Math.max(...histogram);
    ctx.fillStyle = "#d8d8d8";
    for (let x = 0; x < 256; x++) {
      const bar = Math.round((histogram[x] / max) * (H - 4));
      if (bar > 0) ctx.fillRect(x, H - bar, 1, bar);
    }
    /* threshold marker(s) */
    ctx.fillStyle = OXBLOOD;
    ctx.fillRect(threshold, 0, 2, H);
    if (mode === "3") {
      ctx.fillStyle = "#c98a45";
      ctx.fillRect(threshold2, 0, 2, H);
    }
  }, [histogram, threshold, threshold2, mode]);

  return (
    <div
      style={{
        background: PS_BG,
        border: `1px solid ${INK}`,
        borderRadius: 3,
        padding: 18,
        display: "grid",
        gridTemplateColumns: "minmax(220px, 300px) 1fr",
        gap: 18,
      }}
    >
      {/* Dialog side */}
      <div
        style={{
          background: PS_PANEL,
          borderRadius: 3,
          padding: "14px 16px",
          alignSelf: "start",
          boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
        }}
      >
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.06em",
            textAlign: "center",
            color: "#e8e8e8",
            margin: "0 0 12px",
            borderBottom: "1px solid #4a4a4a",
            paddingBottom: 10,
          }}
        >
          Threshold
        </p>

        <p style={labLabelStyle}>
          Threshold Level: <span style={{ color: "#fff" }}>{threshold}</span>
        </p>
        <canvas
          ref={histRef}
          style={{ width: "100%", display: "block", borderRadius: 2 }}
        />
        <input
          type="range"
          min={1}
          max={255}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          style={{ width: "100%", accentColor: OXBLOOD, marginTop: 8 }}
          aria-label="Threshold level"
        />

        {mode === "3" && (
          <>
            <p style={{ ...labLabelStyle, marginTop: 14 }}>
              Second Level:{" "}
              <span style={{ color: "#fff" }}>{threshold2}</span>
            </p>
            <input
              type="range"
              min={1}
              max={255}
              value={threshold2}
              onChange={(e) => setThreshold2(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#c98a45" }}
              aria-label="Second threshold level (3-value mode)"
            />
          </>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button
            onClick={() => setMode((m) => (m === "2" ? "3" : "2"))}
            style={psButtonStyle}
          >
            {mode === "2" ? "→ 3-value notan" : "→ 2-value notan"}
          </button>
          <button
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onMouseLeave={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
            style={psButtonStyle}
          >
            hold: original
          </button>
          <button onClick={() => setThreshold(128)} style={psButtonStyle}>
            reset 128
          </button>
        </div>

        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            lineHeight: 1.6,
            color: "#9a9a9a",
            marginTop: 14,
            marginBottom: 0,
          }}
        >
          Every pixel below the level turns black; every pixel at or above it
          turns white. The histogram shows where your image's tones live —
          drag the marker through a valley to find a stable shape break.
        </p>
      </div>

      {/* Preview side */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            maxHeight: 460,
            objectFit: "contain",
            display: "block",
            background: "#1e1e1e",
            borderRadius: 2,
            flex: 1,
          }}
        />
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#9a9a9a",
            margin: "10px 0 0",
          }}
        >
          live preview — golden hour study ·{" "}
          {mode === "2" ? "2 values" : "3 values"}
        </p>
      </div>
    </div>
  );
}

const labLabelStyle = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  color: "#c8c8c8",
  margin: "0 0 6px",
};

const psButtonStyle = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10.5,
  letterSpacing: "0.04em",
  background: "#4a4a4a",
  color: "#e8e8e8",
  border: "1px solid #5a5a5a",
  borderRadius: 3,
  padding: "6px 12px",
  cursor: "pointer",
};

/* ---------- route comparison data ---------- */

const ROUTES = [
  {
    name: "Image > Adjustments > Threshold",
    sub: "on a regular pixel layer",
    verdict: "Destructive",
    verdictColor: "#a83232",
    body: "The pixels are permanently converted to black and white the moment you hit OK. Fine for a quick throwaway check, but you can't revisit the level later — undo is your only exit. Avoid this for studies you intend to iterate on.",
  },
  {
    name: "Image > Adjustments > Threshold",
    sub: "on a Smart Object",
    verdict: "Procedural — the workflow",
    verdictColor: "#3d7a3d",
    body: "Same menu, completely different behavior. Because the layer is a Smart Object, the adjustment lands as a Smart Filter attached below the layer. Double-click the word 'Threshold' in the Layers panel any time to reopen the dialog and drag the level — the original pixels are never touched. You also get a built-in filter mask for free.",
  },
  {
    name: "Threshold adjustment layer",
    sub: "Layer > New Adjustment Layer",
    verdict: "Also non-destructive",
    verdictColor: "#8a6a2f",
    body: "Lives as its own layer and affects everything below it (or one layer, if clipped). Great when you want a single threshold governing a multi-layer comp. The Smart Filter route wins when the threshold should belong to one image — it travels with the layer if you move, duplicate, or transform it.",
  },
];

const STEPS = [
  {
    step: "Right-click the layer → Convert to Smart Object",
    detail:
      "This wraps the pixels in a protective container. The thumbnail gets a small badge in its corner — that's your confirmation.",
  },
  {
    step: "Image > Adjustments > Threshold…",
    detail:
      "Yes, the 'destructive' menu — on a Smart Object it isn't. Set a starting level near 128 and hit OK.",
  },
  {
    step: "Find 'Smart Filters → Threshold' under the layer",
    detail:
      "The adjustment is now an entry in the Layers panel, not baked pixels. The white thumbnail next to it is a filter mask.",
  },
  {
    step: "Double-click 'Threshold' to re-edit, forever",
    detail:
      "Scrub the level live and watch shapes merge and split. Duplicate the Smart Object to compare three levels side by side — this is the core notan exercise.",
  },
];

/* ---------- shared styles ---------- */

const noteHeadStyle = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: INK,
  margin: "0 0 8px",
};

const noteBodyStyle = {
  fontFamily: "'Newsreader', serif",
  fontSize: 16,
  lineHeight: 1.55,
  color: INK,
  marginTop: 0,
  marginBottom: 20,
};

const h2Style = {
  fontFamily: "'Newsreader', serif",
  fontWeight: 500,
  fontSize: 30,
  margin: "0 0 16px",
  color: INK,
};

/* ---------- root ---------- */

export default function ThresholdNotanLesson() {
  return (
    <div style={{ background: PAPER, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible, input:focus-visible { outline: 2px solid ${OXBLOOD}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
        @media (max-width: 700px) {
          .lab-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 96px" }}>
        {/* Header */}
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: OXBLOOD,
            margin: "0 0 12px",
          }}
        >
          pLAtform · Color &amp; Light · Lesson
        </p>
        <h1
          style={{
            fontFamily: "'Newsreader', serif",
            fontWeight: 500,
            fontSize: "clamp(38px, 7vw, 60px)",
            lineHeight: 1.05,
            margin: "0 0 20px",
            color: INK,
          }}
        >
          Threshold: Notan in One Slider
        </h1>
        <p
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: 19,
            lineHeight: 1.6,
            maxWidth: 680,
            color: INK,
            margin: "0 0 40px",
          }}
        >
          <em>Notan</em> (濃淡) is the Japanese design concept of dark–light
          balance: an image reduced to pure shape, no rendering, no gradients.
          Photoshop's Threshold command is a notan machine — it forces every
          pixel to choose a side. Below, the actual dialog rebuilt so you can
          feel what the slider does before you touch it in Photoshop.
        </p>

        {/* Interactive lab */}
        <ThresholdLab />
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            lineHeight: 1.7,
            color: OXBLOOD,
            margin: "14px 0 56px",
            maxWidth: 680,
          }}
        >
          Try it: drag until the composition still reads with the fewest
          shapes. If the image falls apart at every level, the photo has weak
          value structure — that's the diagnosis notan exists to give you.
        </p>

        {/* Why threshold for notan */}
        <section style={{ borderTop: `2px solid ${INK}`, padding: "40px 0 48px" }}>
          <h2 style={h2Style}>Why Threshold, not squinting</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            <p style={{ ...noteBodyStyle, marginBottom: 0 }}>
              Squinting compresses values, but your brain still cheats — it
              knows where the subject is and fills detail back in. Threshold
              can't cheat. It applies one rule to every pixel:{" "}
              <strong>below the level → black, at or above → white</strong>.
              What survives is the true shape design of the image. If the
              silhouette reads at threshold, it will read at any level of
              finish.
            </p>
            <p style={{ ...noteBodyStyle, marginBottom: 0 }}>
              The histogram in the dialog is not decoration. Peaks are where
              your tones cluster; valleys are stable places to cut. A level set
              in a valley barely changes as you nudge it — a level set on a
              peak makes shapes boil. Reading the histogram this way is the
              same skill you'll use later in Levels and Curves.
            </p>
          </div>
        </section>

        {/* The procedural workflow */}
        <section style={{ borderTop: `2px solid ${INK}`, padding: "40px 0 48px" }}>
          <h2 style={h2Style}>The procedural setup: Smart Object first</h2>
          <p style={{ ...noteBodyStyle, maxWidth: 680 }}>
            Here is the trick that makes Threshold a study tool instead of a
            one-shot filter. <strong>Convert the layer to a Smart Object
            before touching the menu.</strong> Then use{" "}
            <em>Image → Adjustments → Threshold</em> — the same command that
            would normally destroy your pixels now attaches itself as a{" "}
            <strong>Smart Filter</strong>: fully procedural, re-editable
            forever, with its own mask.
          </p>

          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 12,
              maxWidth: 720,
            }}
          >
            {STEPS.map((s, i) => (
              <li
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr",
                  gap: 14,
                  background: PAPER_DARK,
                  border: `1px solid ${INK}`,
                  borderRadius: 2,
                  padding: "14px 16px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 22,
                    color: OXBLOOD,
                    lineHeight: 1,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 13,
                      display: "block",
                      color: INK,
                      marginBottom: 4,
                    }}
                  >
                    {s.step}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Newsreader', serif",
                      fontSize: 15.5,
                      lineHeight: 1.5,
                      color: INK,
                    }}
                  >
                    {s.detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Three routes compared */}
        <section style={{ borderTop: `2px solid ${INK}`, padding: "40px 0 48px" }}>
          <h2 style={h2Style}>Same command, three behaviors</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {ROUTES.map((r) => (
              <div
                key={r.name + r.sub}
                style={{
                  border: `1px solid ${INK}`,
                  borderRadius: 2,
                  padding: "18px 18px 20px",
                  background:
                    r.verdictColor === "#3d7a3d" ? PAPER_DARK : "transparent",
                }}
              >
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12.5,
                    color: INK,
                    margin: "0 0 2px",
                  }}
                >
                  {r.name}
                </p>
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10.5,
                    color: "#6b6257",
                    margin: "0 0 12px",
                  }}
                >
                  {r.sub}
                </p>
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: r.verdictColor,
                    margin: "0 0 10px",
                  }}
                >
                  ● {r.verdict}
                </p>
                <p style={{ ...noteBodyStyle, fontSize: 15, marginBottom: 0 }}>
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Exercise */}
        <section style={{ borderTop: `2px solid ${INK}`, paddingTop: 40 }}>
          <h2 style={h2Style}>Exercise: three-level notan sheet</h2>
          <p style={{ ...noteBodyStyle, maxWidth: 680 }}>
            Pick any photo with a clear subject. Convert to Smart Object, apply
            Threshold as above, then duplicate the layer twice. Set the three
            copies to a low, middle, and high level (try ~80 / 128 / 180) and
            arrange them side by side on one canvas. One of the three will hold
            together better than the others — that level is telling you where
            the image's real value break lives. Screenshot the sheet and bring
            it to critique.
          </p>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              lineHeight: 1.7,
              color: OXBLOOD,
              margin: 0,
              maxWidth: 680,
            }}
          >
            Bonus: paint on the Smart Filter's mask with a soft black brush to
            exempt one region from the threshold — a fast way to test
            "silhouette everywhere except the focal area."
          </p>
        </section>
        <TopicNav topicList={topicList} topicKey="threshold-notan" weekNum="03" />
      </div>
    </div>
  );
}

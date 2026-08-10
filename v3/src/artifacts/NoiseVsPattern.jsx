import React, { useEffect, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import TopicNav from "./TopicNav.jsx";
import { topicList } from "../content/week02Topics.js";

/**
 * NoiseVsPattern.jsx
 * pLAtform curriculum reader — "Noise vs. Pattern, Procedural vs. Non-procedural"
 * Adapted from PCC DMA 12.
 *
 * Design system: oxblood #8b3a2f, yellowed paper #f5efe1,
 * IBM Plex Mono (labels/data), Newsreader (display + body).
 *
 * The "random pattern" plate is generated procedurally (BSP subdivision) so the
 * figure embodies the lesson: a procedural method producing a structured pattern.
 */

const C = {
  paper: "#f5efe1",
  ink: "#2b2622",
  inkSoft: "#5a5048",
  oxblood: "#8b3a2f",
  rule: "#d8cfba",
  plateBg: "#0d0e0c",
};

// Bright palette for the generative plate
const SWATCH = [
  "#8fc63d", "#3bbf6e", "#f2c200", "#f08c1e",
  "#e8483d", "#d23f8e", "#3aa0d6", "#2f5fd6",
  "#6ad0c8", "#b6e02a", "#f25c54", "#9b5de5",
];

// ---- deterministic PRNG (mulberry32) so plates are reproducible per seed ----
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

// ---- integer hash -> value noise -> fractal Brownian motion ----------------
function hash2(ix, iy, seed) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 0x9e3779b1)) | 0;
  h = (h ^ (h >>> 13)) | 0;
  h = Math.imul(h, 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296; // [0,1)
}
const fade = (t) => t * t * (3 - 2 * t); // smoothstep
function valueNoise(x, y, seed) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = fade(x - x0), fy = fade(y - y0);
  const v00 = hash2(x0, y0, seed), v10 = hash2(x0 + 1, y0, seed);
  const v01 = hash2(x0, y0 + 1, seed), v11 = hash2(x0 + 1, y0 + 1, seed);
  const a = v00 + (v10 - v00) * fx;
  const b = v01 + (v11 - v01) * fx;
  return a + (b - a) * fy;
}
function fbm(x, y, octaves, seed) {
  let amp = 0.5, freq = 1, sum = 0, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(x * freq, y * freq, seed + o * 1013);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

function drawNoise(canvas, { seed, coherent, scale, octaves }) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const display = canvas.clientWidth;
  canvas.width = display * dpr;
  canvas.height = display * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0); // draw in device px, then we scale the buffer

  // Render at an internal resolution; coherent noise is smoothed on upscale,
  // raw noise is kept crisp so the grain stays sharp.
  const res = coherent ? 200 : 260;
  const buf = ctx.createImageData(res, res);
  const data = buf.data;
  const rng = mulberry32(seed);

  for (let py = 0; py < res; py++) {
    for (let px = 0; px < res; px++) {
      let v;
      if (coherent) {
        v = fbm((px / res) * scale, (py / res) * scale, octaves, seed);
        v = Math.max(0, Math.min(1, (v - 0.5) * 1.35 + 0.5)); // gentle contrast
      } else {
        v = rng(); // raw white noise: independent per pixel
      }
      const g = (v * 255) | 0;
      const i = (py * res + px) * 4;
      data[i] = g; data[i + 1] = g; data[i + 2] = g; data[i + 3] = 255;
    }
  }

  // blit the small buffer onto an offscreen canvas, then scale to fill
  const off = document.createElement("canvas");
  off.width = res; off.height = res;
  off.getContext("2d").putImageData(buf, 0, 0);
  ctx.imageSmoothingEnabled = coherent;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
}

function drawPlate(canvas, seed) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const size = canvas.clientWidth;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const rng = mulberry32(seed);
  ctx.fillStyle = C.plateBg;
  ctx.fillRect(0, 0, size, size);

  // Recursive binary space partition -> leaf cells
  const leaves = [];
  const MIN = size * 0.07;
  function split(x, y, w, h, depth) {
    const canSplit = (w > MIN * 2 || h > MIN * 2) && depth < 7;
    // bias toward continuing to split larger cells
    const stop = depth > 1 && rng() < 0.18;
    if (!canSplit || stop) {
      leaves.push({ x, y, w, h });
      return;
    }
    const horizontal = w === h ? rng() < 0.5 : w > h;
    const t = 0.32 + rng() * 0.36; // split ratio
    if (horizontal) {
      const wl = w * t;
      split(x, y, wl, h, depth + 1);
      split(x + wl, y, w - wl, h, depth + 1);
    } else {
      const ht = h * t;
      split(x, y, w, ht, depth + 1);
      split(x, y + ht, w, h - ht, depth + 1);
    }
  }
  split(0, 0, size, size, 0);

  // Fill each leaf with nested colored blocks (noise of color within the pattern)
  for (const cell of leaves) {
    const pad = 1.5;
    let { x, y, w, h } = cell;
    x += pad; y += pad; w -= pad * 2; h -= pad * 2;
    if (w <= 0 || h <= 0) continue;

    // ~18% of cells stay dark for breathing room
    if (rng() < 0.18) continue;

    const layers = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < layers; i++) {
      const inset = i === 0 ? 0 : (Math.min(w, h) * 0.16) * i;
      const rx = x + inset;
      const ry = y + inset;
      const rw = w - inset * 2;
      const rh = h - inset * 2;
      if (rw < 2 || rh < 2) break;
      const col = SWATCH[Math.floor(rng() * SWATCH.length)];
      ctx.fillStyle = col;
      ctx.fillRect(rx, ry, rw, rh);
      // thin dark gutter between layers
      ctx.strokeStyle = C.plateBg;
      ctx.lineWidth = 1.25;
      ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);
    }
  }
}

function Plate() {
  const ref = useRef(null);
  const seedRef = useRef(0x51ed);

  const render = useCallback(() => {
    if (ref.current) drawPlate(ref.current, seedRef.current);
  }, []);

  useEffect(() => {
    render();
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [render]);

  const regenerate = () => {
    seedRef.current = (Math.random() * 0xffffffff) >>> 0;
    render();
  };

  return (
    <figure style={S.figure}>
      <div style={S.plateFrame}>
        <canvas ref={ref} style={S.canvas} aria-label="Procedurally generated random pattern" />
      </div>
      <figcaption style={S.caption}>
        <span style={S.captionLabel}>random pattern</span>
        <button onClick={regenerate} style={S.regen} aria-label="Regenerate pattern">
          ↻ regenerate
        </button>
      </figcaption>
    </figure>
  );
}

function NoiseField() {
  const ref = useRef(null);
  const [coherent, setCoherent] = useState(true);
  const [scale, setScale] = useState(6);
  const [octaves, setOctaves] = useState(4);
  const seedRef = useRef(0x1d0f);

  const render = useCallback(() => {
    if (ref.current)
      drawNoise(ref.current, { seed: seedRef.current, coherent, scale, octaves });
  }, [coherent, scale, octaves]);

  useEffect(() => {
    render();
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [render]);

  const regenerate = () => {
    seedRef.current = (Math.random() * 0xffffffff) >>> 0;
    render();
  };

  return (
    <figure style={S.figure}>
      <div style={S.plateFrame}>
        <canvas ref={ref} style={S.canvas} aria-label="Procedurally generated noise field" />
      </div>

      <div style={S.controls}>
        <div style={S.toggle} role="group" aria-label="Noise type">
          <button
            onClick={() => setCoherent(false)}
            style={{ ...S.toggleBtn, ...(!coherent ? S.toggleOn : null) }}
          >
            random
          </button>
          <button
            onClick={() => setCoherent(true)}
            style={{ ...S.toggleBtn, ...(coherent ? S.toggleOn : null) }}
          >
            coherent
          </button>
        </div>

        <div style={{ ...S.sliders, opacity: coherent ? 1 : 0.32 }}>
          <label style={S.sliderRow}>
            <span style={S.sliderLabel}>scale</span>
            <input
              type="range" min="2" max="18" step="1" value={scale}
              disabled={!coherent}
              onChange={(e) => setScale(+e.target.value)}
              style={S.slider}
            />
            <span style={S.sliderVal}>{scale}</span>
          </label>
          <label style={S.sliderRow}>
            <span style={S.sliderLabel}>detail</span>
            <input
              type="range" min="1" max="6" step="1" value={octaves}
              disabled={!coherent}
              onChange={(e) => setOctaves(+e.target.value)}
              style={S.slider}
            />
            <span style={S.sliderVal}>{octaves}</span>
          </label>
        </div>
      </div>

      <figcaption style={S.caption}>
        <span style={S.captionLabel}>
          {coherent ? "coherent noise — fBm value noise" : "random noise — white noise"}
        </span>
        <button onClick={regenerate} style={S.regen} aria-label="Reseed noise">
          ↻ reseed
        </button>
      </figcaption>
    </figure>
  );
}

// ---- small presentational helpers ----
const Section = ({ label, children }) => (
  <section style={S.section}>
    <h2 style={S.h2}>{label}</h2>
    {children}
  </section>
);

const Bullets = ({ items }) => (
  <ul style={S.ul}>
    {items.map((t, i) => (
      <li key={i} style={S.li}>
        <span style={S.bullet}>•</span>
        <span>{t}</span>
      </li>
    ))}
  </ul>
);

export default function NoiseVsPattern() {
  useEffect(() => {
    document.title = "Noise vs. Pattern, Procedural vs. Non-procedural — Ryman Curriculum";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={S.root}>
      <style>{FONT_CSS}</style>
      <div style={S.grain} aria-hidden="true" />

      <article style={S.page}>
        <header style={S.header}>
          <Link to="/week/02" style={S.backButton}>
            ← Back to Week 02
          </Link>
          <h1 style={S.title}>Noise vs. Pattern, Procedural vs. Non-procedural</h1>
          <p style={S.eyebrow}>
            Adapted from PCC DMA 12: Noise vs. Pattern, Procedural vs. Non-procedural · The Art of Noise
          </p>
        </header>

        <Section label="Noise vs. Pattern">
          <p style={S.p}>
            Noise can be the building block of a pattern, but you can generate patterns manually
            without noise. The key to making a successful pattern is that a pattern is generally
            predictable. I say "generally" since patterns can exhibit some sense of randomness, and
            often the predictability can be assumed but not proven.
          </p>
          <p style={S.p}>
            Noise and pattern describe the <em>visual result</em> you see. Procedural and
            non-procedural describe the <em>method</em> used to create that result. These ideas are
            connected, but they are not opposites.
          </p>

          <Plate />
        </Section>

        <Section label="Noise vs. Pattern Differences">
          <p style={S.p}>Below are some fundamental differences between noise and patterns.</p>
          <Bullets
            items={[
              "Noise is random",
              "Patterns are predictable",
              "You can generate noise procedurally",
              "Patterns can be procedural and non-procedural",
              "Noise can be hand-painted, scratched, or scattered by hand",
            ]}
          />
        </Section>

        <Section label="Noise">
          <p style={S.p}>
            Noise is irregular visual information, associated with randomness, variation, and
            unpredictability. It does not repeat in an easily predictable way, and it is useful for
            adding texture and natural-looking imperfections — clouds, dirt, stone, skin, rust,
            water, wood grain, or film grain.
          </p>
          <Bullets
            items={[
              "Does not repeat in an easily predictable way",
              "Adds variation, texture, and natural-looking imperfection",
              "Can make digital artwork feel organic, imperfect, or less computer-generated",
              "May be completely random, or have a controlled sense of randomness",
              "Procedural example: Perlin noise for terrain or clouds",
              "Non-procedural example: hand-painted splatter, scratches, or grunge",
            ]}
          />
          <NoiseField />
        </Section>

        <Section label="Pattern">
          <p style={S.p}>
            A pattern is a visual system with some degree of order, repetition, or predictability.
            It need not be perfectly regular — a pattern can contain variation or randomness as long
            as an underlying structure is still visible.
          </p>
          <Bullets
            items={[
              "May repeat through shape, color, spacing, direction, scale, rhythm, or visual rules",
              "Does not need to be perfectly regular",
              "Can contain variation, as long as structure remains visible",
              "Creates a sense of rhythm, order, construction, or intentional design",
              "Procedural example: a tiled checkerboard, brick generator, or scattered leaves",
              "Non-procedural example: hand-drawn stripes, painted textiles, arranged shapes",
            ]}
          />

          <h3 style={S.h3}>The Relationship between Patterns and Programming</h3>
          <p style={S.p}>
            Many different types of patterns exist, such as dress patterns and process patterns.
          </p>
          <p style={S.p}>
            An example of a pattern-making machine that inspired computer programming is the <strong>Jacquard Loom</strong>.
          </p>
          <p style={S.p}>
            Developed by Joseph Jacquard and demonstrated in 1801, the Jacquard Loom is an attachment for the fabric looms used at the time. The Jacquard Loom used punch cards instructing the loom on how to weave intricate textile patterns.
          </p>
          <p style={S.p}>
            The Jacquard Loom is considered the predecessor to the modern computer. It uses a binary system to store information that can be read by the loom and replicated multiple times. Binary is a means of keeping information by using indicators that have two settings. Without a binary system, digital art would not be possible, and digital art is essentially a pattern of 1s and 0s.
          </p>

          <h3 style={S.h3}>Cellular Patterns</h3>
          <p style={S.p}>
            Cellular patterns are common in nature; they also can be developed using recursive noise algorithms. Photoshop can generate these patterns as well, which are also known as reaction-diffusion patterns. Digital artists can create this pattern using the high pass filter and then applying the threshold (from the image menu) to develop the "reaction." A gaussian blur can generate diffusion, and repeating these steps over and over again creates cellular patterns.
          </p>
          
          <figure style={S.figure}>
            <div style={S.plateFrame}>
              <img src="/pattern/celluar.png" alt="cellular patterns" style={{ display: "block", width: "100%", height: "auto" }} />
            </div>
            <figcaption style={S.caption}>
              <span style={S.captionLabel}>cellular patterns</span>
            </figcaption>
          </figure>

          <h3 style={S.h3}>Voronoi Patterns</h3>
          <p style={S.p}>
            Voronoi diagrams are named after Georgy Voronoy, a Russian mathematician born in 1868.
          </p>
          <p style={S.p}>
            In the simplest case, a Voronoi Diagram is represented by many points called seeds. There is a corresponding region for each seed, called a Voronoi cell, defined by plane points of neighboring cells.
          </p>
          <p style={S.p}>
            The Voronoi pattern has practical and theoretical applications in many fields, mainly science, technology, and digital art.
          </p>
          <p style={S.p}>
            Voronoi patterns in digital art can be used for general visual effects, such as breaking glass, or to simulate materials, such as cracked earth. Voronoi patterns can be generated in Photoshop with a combination of the noise and crystallize filters.
          </p>

          <figure style={S.figure}>
            <div style={S.plateFrame}>
              <img src="/pattern/voronoi.png" alt="voronoi patterns" style={{ display: "block", width: "100%", height: "auto" }} />
            </div>
            <figcaption style={S.caption}>
              <span style={S.captionLabel}>voronoi patterns</span>
            </figcaption>
          </figure>
        </Section>

        <Section label="Noise and Pattern Together">
          <p style={S.p}>
            Noise and pattern often work together. A pattern provides the overall structure; noise
            adds variation inside that structure. A brick wall is a pattern because the bricks repeat
            in an organized layout — noise then varies the color, roughness, cracks, weathering, and
            size of each individual brick.
          </p>
          <Bullets
            items={[
              "The pattern creates the repeating structure",
              "The noise creates variation and imperfection",
            ]}
          />
          <p style={S.p}>This combination helps an image feel both organized and natural.</p>
        </Section>

        <Section label="Procedural">
          <p style={S.p}>
            Procedural methods use rules, algorithms, settings, or computer-generated systems to
            create visual results. The computer creates output based on adjustable parameters, and
            those methods can generate both noise and patterns.
          </p>
          <Bullets
            items={[
              "Procedural noise: clouds, terrain, grain, or surface roughness",
              "Procedural patterns: tiles, bricks, scales, grass, leaves, dots, geometric forms",
              "Useful for speed, complexity, variation, and generating versions quickly",
              "Lets an artist control a system without making every detail by hand",
            ]}
          />
        </Section>

        <Section label="Non-procedural">
          <p style={S.p}>
            Non-procedural methods are created directly by the artist — painting, drawing,
            sculpting, arranging shapes, copying elements, or editing details by hand. Manual methods
            can create both noise and patterns.
          </p>
          <Bullets
            items={[
              "Hand-painted scratches, splatter, and irregular brush marks create noise",
              "Hand-drawn stripes, repeated symbols, or arranged objects create patterns",
              "Gives direct control over placement, style, texture, and individual decisions",
              "Useful when a design needs a specific look or intentional imperfections",
            ]}
          />
        </Section>

        <Section label="How the Ideas Combine">
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Visual Result</th>
                  <th style={S.th}>Method Used</th>
                  <th style={S.th}>Example</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Noise", "Procedural", "Perlin noise for clouds, terrain, or rough surface detail"],
                  ["Noise", "Non-procedural", "Hand-painted grunge, brush splatter, scratches, irregular marks"],
                  ["Pattern", "Procedural", "A tiled checkerboard, brick generator, or scattered leaves"],
                  ["Pattern", "Non-procedural", "Hand-drawn stripes, a painted textile, or arranged shapes"],
                ].map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ ...S.td, ...(j < 2 ? S.tdMono : null) }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section label="Main Idea">
          <p style={S.p}>
            Noise and pattern describe what the visual result looks like. Noise is mainly about
            irregularity, randomness, and variation; pattern is mainly about order, repetition, and
            predictability. Procedural and non-procedural describe how that result is made —
            generated through rules and settings, or created directly by hand.
          </p>
          <p style={S.p}>
            The important point: procedural does not automatically mean noise, and manual does not
            automatically mean pattern. A procedural system can create a highly organized pattern,
            while a hand-painted image can contain a great deal of random noise. In practice, artists
            combine all four — patterns for structure, noise for variation, procedural tools for
            speed, and manual work for artistic control.
          </p>
        </Section>

        <TopicNav topicList={topicList} topicKey="procedural-vs-non-procedural" weekNum="02" />
      </article>
    </div>
  );
}

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&display=swap');
`;

const SERIF = "'Newsreader', Georgia, 'Times New Roman', serif";
const MONO = "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace";

const S = {
  root: {
    position: "relative",
    minHeight: "100vh",
    background: C.paper,
    color: C.ink,
    fontFamily: SERIF,
    padding: "0",
  },
  backButton: {
    fontFamily: MONO,
    fontSize: "11px",
    color: C.oxblood,
    cursor: "pointer",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    textDecoration: "none",
    display: "inline-block",
    marginBottom: "16px",
  },
  // subtle vertical grain strip on the left edge
  grain: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 64,
    height: "100%",
    pointerEvents: "none",
    opacity: 0.5,
    backgroundColor: C.paper,
    backgroundImage:
      "radial-gradient(rgba(43,38,34,0.22) 0.6px, transparent 0.7px)",
    backgroundSize: "5px 5px",
    maskImage: "linear-gradient(to right, #000 55%, transparent)",
    WebkitMaskImage: "linear-gradient(to right, #000 55%, transparent)",
  },
  page: {
    position: "relative",
    maxWidth: 640,
    margin: "0 auto",
    padding: "56px 28px 72px",
    boxSizing: "border-box",
  },
  header: { marginBottom: 40 },
  title: {
    fontFamily: SERIF,
    fontStyle: "italic",
    fontWeight: 500,
    color: C.oxblood,
    fontSize: "clamp(28px, 5vw, 40px)",
    lineHeight: 1.08,
    letterSpacing: "-0.01em",
    margin: "0 0 14px",
  },
  eyebrow: {
    fontFamily: MONO,
    fontSize: 10.5,
    letterSpacing: "0.13em",
    textTransform: "uppercase",
    color: C.inkSoft,
    margin: 0,
    lineHeight: 1.6,
  },
  section: { marginTop: 38 },
  h2: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: C.ink,
    margin: "0 0 16px",
    paddingBottom: 8,
    borderBottom: `1px solid ${C.rule}`,
  },
  h3: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: C.oxblood,
    margin: "32px 0 12px",
  },
  p: {
    fontFamily: SERIF,
    fontSize: 17,
    lineHeight: 1.62,
    color: C.ink,
    margin: "0 0 16px",
  },
  ul: { listStyle: "none", margin: "0 0 16px", padding: 0 },
  li: {
    display: "flex",
    gap: 12,
    fontFamily: SERIF,
    fontSize: 16.5,
    lineHeight: 1.5,
    color: C.ink,
    marginBottom: 8,
  },
  bullet: { color: C.oxblood, flex: "0 0 auto", lineHeight: 1.5 },

  // figure / generative plate
  figure: { margin: "28px 0 8px" },
  plateFrame: {
    background: C.plateBg,
    padding: 10,
    border: `1px solid ${C.rule}`,
    boxShadow: "0 1px 0 rgba(43,38,34,0.06)",
  },
  canvas: { display: "block", width: "100%", aspectRatio: "1 / 1" },
  caption: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 10,
  },
  captionLabel: {
    fontFamily: MONO,
    fontStyle: "italic",
    fontSize: 11,
    letterSpacing: "0.06em",
    color: C.inkSoft,
  },
  regen: {
    fontFamily: MONO,
    fontSize: 10.5,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: C.oxblood,
    background: "transparent",
    border: `1px solid ${C.oxblood}`,
    borderRadius: 0,
    padding: "4px 10px",
    cursor: "pointer",
  },

  // noise controls
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginTop: 10,
  },
  toggle: { display: "inline-flex", border: `1px solid ${C.oxblood}` },
  toggleBtn: {
    fontFamily: MONO,
    fontSize: 10.5,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: C.oxblood,
    background: "transparent",
    border: "none",
    padding: "5px 12px",
    cursor: "pointer",
  },
  toggleOn: { background: C.oxblood, color: C.paper },
  sliders: { display: "flex", flexWrap: "wrap", gap: 18, transition: "opacity .15s" },
  sliderRow: { display: "inline-flex", alignItems: "center", gap: 8 },
  sliderLabel: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.inkSoft,
  },
  slider: { width: 84, accentColor: C.oxblood, cursor: "pointer" },
  sliderVal: {
    fontFamily: MONO,
    fontSize: 11,
    color: C.ink,
    width: 14,
    textAlign: "right",
  },

  // table
  tableWrap: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: SERIF,
    fontSize: 15,
  },
  th: {
    fontFamily: MONO,
    fontSize: 10.5,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.inkSoft,
    textAlign: "left",
    padding: "0 12px 8px 0",
    borderBottom: `1.5px solid ${C.ink}`,
  },
  td: {
    padding: "10px 12px 10px 0",
    borderBottom: `1px solid ${C.rule}`,
    verticalAlign: "top",
    color: C.ink,
    lineHeight: 1.4,
  },
  tdMono: {
    fontFamily: MONO,
    fontSize: 12.5,
    color: C.oxblood,
    whiteSpace: "nowrap",
  },

  footer: {
    marginTop: 48,
    paddingTop: 16,
    borderTop: `1px solid ${C.rule}`,
  },
  footMono: {
    fontFamily: MONO,
    fontSize: 10.5,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: C.inkSoft,
  },
};

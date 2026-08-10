import React, { useState } from "react";
import { Link } from "react-router-dom";
import TopicNav from "./TopicNav.jsx";
import { topicList } from "../content/week02Topics.js";

/**
 * NoiseLesson — "Generating Noise in Photoshop"
 * A self-contained lesson card for the Ryman / pLAtform curriculum.
 */

const DEFAULT_ASSETS = {
  addNoiseMenu: "/noise/add-noise-menu.png",          // Filter > Noise menu
  emboss: "/noise/standard-noise-emboss.png",         // Add Noise dialog + bumpy result
  filterGalleryMenu: "/noise/filter-gallery-menu.png",// Filter > Filter Gallery menu (spare)
  filterGalleryPanel: "/noise/filter-gallery-panel.png",
  grain: "/noise/grain-confetti.png",
  pointillize: "/noise/pointillize.png",
};

const SECTIONS = [
  {
    id: "standard",
    label: "01",
    title: "Standard Noise",
    blurb:
      "Noise is the raw material behind a huge range of textures and surface effects. Start here.",
    techniques: [
      {
        name: "Add Noise",
        path: ["Filter", "Noise", "Add Noise"],
        body:
          "The baseline generator. Sprinkle random pixels across an image to break up flat color and seed a texture.",
        asset: "addNoiseMenu",
        alt: "Photoshop Filter > Noise > Add Noise menu",
      },
      {
        name: "Emboss for bumpy texture",
        path: ["Filter", "Stylize", "Emboss"],
        body:
          "Run Emboss over an Add Noise layer to push the grain into raised relief — an instant rough, bumpy surface.",
        asset: "emboss",
        alt: "Embossed noise creating a bumpy surface texture",
      },
    ],
  },
  {
    id: "gallery",
    label: "02",
    title: "The Filter Gallery",
    blurb:
      "More noise varieties live inside the Filter Gallery, where you can stack and preview filters together.",
    techniques: [
      {
        name: "Open the Filter Gallery",
        path: ["Filter", "Filter Gallery"],
        body:
          "Browse Artistic, Brush Strokes, Sketch and Texture groups in one preview window — and layer several at once.",
        asset: "filterGalleryPanel",
        alt: "Photoshop Filter Gallery panel with filter thumbnails",
      },
    ],
  },
  {
    id: "other",
    label: "03",
    title: "Other Types of Noise",
    blurb:
      "Same idea, different grain. Pick the one whose shape matches the surface you're after.",
    techniques: [
      {
        name: "Confetti & faded noise",
        path: ["Filter Gallery", "Texture", "Grain"],
        body:
          "A soft, speckled grain that reads like scattered confetti.",
        goodFor: ["Fuzzy fabrics", "Ceramic & light stone finishes"],
        asset: "grain",
        alt: "Colorful confetti-style grain noise",
      },
      {
        name: "Pointillism noise",
        path: ["Filter", "Pixelate", "Pointillize"],
        body:
          "Clusters pixels into rounded dots over a background color. Useful for stony, pebbled patterns.",
        asset: "pointillize",
        alt: "Pointillize filter dialog and rounded-dot result",
      },
      {
        name: "Big chunky noise",
        path: ["Filter", "Pixelate", "Crystallize"],
        body:
          "Like Pointillize but with hard, faceted edges — great for a cobblestone effect.",
        alt: "Crystallize cobblestone texture",
      },
    ],
  },
];

function Breadcrumb({ path }) {
  return (
    <div className="nz-path" role="text" aria-label={path.join(" then ")}>
      {path.map((seg, i) => {
        const last = i === path.length - 1;
        return (
          <span key={i} className="nz-path-row">
            <span className={last ? "nz-seg nz-seg-cmd" : "nz-seg"}>{seg}</span>
            {!last && <span className="nz-chev" aria-hidden="true">▸</span>}
          </span>
        );
      })}
    </div>
  );
}

function Figure({ src, alt }) {
  const [broken, setBroken] = useState(false);
  if (!src) return null;
  if (broken) {
    return (
      <div className="nz-fig nz-fig-empty" role="img" aria-label={alt}>
        <span className="nz-fig-label">{alt}</span>
      </div>
    );
  }
  return (
    <figure className="nz-fig">
      <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
    </figure>
  );
}

function Technique({ t, assets }) {
  return (
    <article className="nz-tech">
      <div className="nz-tech-text">
        <Breadcrumb path={t.path} />
        <h4 className="nz-tech-name">{t.name}</h4>
        <p className="nz-tech-body">{t.body}</p>
        {t.goodFor && (
          <div className="nz-tags">
            <span className="nz-tags-label">Great for</span>
            <ul className="nz-tags-list">
              {t.goodFor.map((g) => (
                <li key={g} className="nz-tag">{g}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Figure src={t.asset ? assets[t.asset] : null} alt={t.alt} />
    </article>
  );
}

export default function NoiseLesson({ assets: assetOverrides = {} }) {
  const assets = { ...DEFAULT_ASSETS, ...assetOverrides };

  return (
    <section className="nz-root" aria-labelledby="nz-title">
      <style>{CSS}</style>

      <header className="nz-head">
        <Link to="/week/02" className="nz-back-btn" style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--oxblood)',
          cursor: 'pointer',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: '16px',
        }}>
          ← Back to Week 02
        </Link>
        <br />
        <span className="nz-eyebrow">Texture · Photoshop</span>
        <h2 id="nz-title" className="nz-title">Generating Noise in Photoshop</h2>
        <p className="nz-lede">
          Procedural grain is one of the fastest ways to add believable surface
          to a flat shape. These are the core generators, written as the exact
          menu path you'll click to reach each one.
        </p>
      </header>

      {SECTIONS.map((s) => (
        <div key={s.id} className="nz-section">
          <div className="nz-section-head">
            <span className="nz-section-num">{s.label}</span>
            <div>
              <h3 className="nz-section-title">{s.title}</h3>
              <p className="nz-section-blurb">{s.blurb}</p>
            </div>
          </div>
          <div className="nz-tech-list">
            {s.techniques.map((t) => (
              <Technique key={t.name} t={t} assets={assets} />
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: '40px' }}>
        <TopicNav topicList={topicList} topicKey="generating-noise-in-photoshop" weekNum="02" />
      </div>
    </section>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap');

.nz-root {
  --ink: #2b2622;
  --paper: #f5efe1;
  --oxblood: #8b3a2f;
  --oxblood-soft: rgba(139, 58, 47, 0.10);
  --rule: rgba(43, 38, 34, 0.16);
  --mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  --serif: 'Newsreader', Georgia, 'Times New Roman', serif;

  background: var(--paper);
  color: var(--ink);
  font-family: var(--serif);
  max-width: 860px;
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 3rem);
  line-height: 1.55;
  box-sizing: border-box;
}
.nz-root *, .nz-root *::before, .nz-root *::after { box-sizing: border-box; }

.nz-head { border-bottom: 2px solid var(--ink); padding-bottom: 1.5rem; margin-bottom: 2.5rem; }
.nz-eyebrow {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--oxblood);
}
.nz-title {
  font-family: var(--serif);
  font-weight: 600;
  font-size: clamp(1.9rem, 5vw, 3rem);
  line-height: 1.05;
  margin: 0.5rem 0 0.75rem;
  letter-spacing: -0.01em;
}
.nz-lede { font-size: 1.08rem; max-width: 60ch; margin: 0; color: rgba(43,38,34,0.85); }

.nz-section { margin-bottom: 3rem; }
.nz-section-head { display: flex; gap: 1rem; align-items: baseline; margin-bottom: 1.5rem; }
.nz-section-num {
  font-family: var(--mono);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--oxblood);
  border: 1px solid var(--oxblood);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  flex: none;
}
.nz-section-title { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.2rem; }
.nz-section-blurb { margin: 0; color: rgba(43,38,34,0.78); max-width: 56ch; }

.nz-tech-list { display: flex; flex-direction: column; gap: 1.25rem; }
.nz-tech {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  background: #fbf7ec;
  border: 1px solid var(--rule);
  border-left: 3px solid var(--oxblood);
  border-radius: 4px;
  padding: 1.4rem 1.5rem;
}
@media (min-width: 620px) {
  .nz-tech { grid-template-columns: 1fr 240px; align-items: start; }
}
.nz-tech-name { font-size: 1.2rem; font-weight: 600; margin: 0.6rem 0 0.4rem; }
.nz-tech-body { margin: 0; color: rgba(43,38,34,0.85); }

.nz-path { display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem 0.35rem; font-family: var(--mono); font-size: 0.78rem; }
.nz-path-row { display: inline-flex; align-items: center; gap: 0.35rem; }
.nz-seg {
  background: var(--oxblood-soft);
  color: var(--ink);
  padding: 0.12rem 0.45rem;
  border-radius: 3px;
  white-space: nowrap;
}
.nz-seg-cmd { background: var(--oxblood); color: var(--paper); font-weight: 500; }
.nz-chev { color: var(--oxblood); font-size: 0.7rem; }

.nz-tags { margin-top: 0.9rem; }
.nz-tags-label {
  display: block;
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--oxblood);
  margin-bottom: 0.4rem;
}
.nz-tags-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.4rem; }
.nz-tag {
  font-family: var(--mono);
  font-size: 0.78rem;
  border: 1px solid var(--rule);
  border-radius: 999px;
  padding: 0.15rem 0.7rem;
  background: var(--paper);
}

.nz-fig { margin: 0; border: 1px solid var(--rule); border-radius: 3px; overflow: hidden; background: var(--paper); }
.nz-fig img { display: block; width: 100%; height: auto; }
.nz-fig-empty {
  min-height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-style: dashed;
  border-color: var(--oxblood);
  background: var(--oxblood-soft);
  padding: 1rem;
}
.nz-fig-label { font-family: var(--mono); font-size: 0.72rem; color: var(--oxblood); }

.nz-tech:focus-within { outline: 2px solid var(--oxblood); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .nz-root *, .nz-root *::before, .nz-root *::after { transition: none !important; animation: none !important; }
}
`;

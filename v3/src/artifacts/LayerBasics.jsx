import React from "react";
import { topicList } from "../content/week03Topics.js";
import TopicNav from "./TopicNav.jsx";

/**
 * LayerBasics.jsx
 * pLAtform curriculum reader — "Layer Basics"
 * Adapted from PCC Canvas: Organizing Layers → Adjustment Layers → Smart Objects.
 *
 * Design system: oxblood #8b3a2f, yellowed paper #f5efe1,
 * IBM Plex Mono (labels / shortcuts / captions), Newsreader (display + body).
 *
 * Self-contained: scoped inline styles, no Tailwind. Images import from
 * ./assets so it drops into a Vite project as-is. If your global styles
 * already load Newsreader + IBM Plex Mono, delete the @import in <style>.
 */

const layersPanel = "/assets_layer_basics/layers_panel.png";
const layerFromBackground = "/assets_layer_basics/layer_from_background.png";
const newLayerIcon = "/assets_layer_basics/new_layer_icon.png";
const adjustmentIcon = "/assets_layer_basics/adjustment_layers_icon.png";
const adjustmentMenu = "/assets_layer_basics/adjustment_layers.png";

/* ------------------------------------------------------------------ */
/* Design tokens — pLAtform                                            */
/* ------------------------------------------------------------------ */
const T = {
  paper: "#f5efe1",
  paperEdge: "#ece2cd",
  oxblood: "#8b3a2f",
  oxbloodSoft: "#b5654a",
  ink: "#241c17",
  muted: "#6f6151",
  rule: "#d8cdb5",
  panel: "#2b2b2b", // Photoshop dark chrome, for specimen mats
  panelEdge: "#161616",
  serif: '"Newsreader", Georgia, serif',
  mono: '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace',
};

/* ------------------------------------------------------------------ */
/* Small primitives                                                    */
/* ------------------------------------------------------------------ */

/** Keyboard shortcut rendered as keycaps: <Keys mac="⇧⌥⌘N" pc="Shift+Alt+Ctrl+N" /> */
function Keys({ keys }) {
  return (
    <span className="lb-keys">
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="lb-keys-plus">+</span>}
          <kbd className="lb-key">{k}</kbd>
        </React.Fragment>
      ))}
    </span>
  );
}

/** Mac / PC shortcut pair on one row. */
function ShortcutRow({ label, mac, pc }) {
  return (
    <div className="lb-shortcut-row">
      <span className="lb-shortcut-label">{label}</span>
      <span className="lb-shortcut-pair">
        <span className="lb-os">MAC</span>
        <Keys keys={mac} />
      </span>
      <span className="lb-shortcut-pair">
        <span className="lb-os">PC</span>
        <Keys keys={pc} />
      </span>
    </div>
  );
}

/** Specimen plate: dark-matted screenshot with a typed caption strip. */
function Plate({ src, alt, caption, maxWidth = 420 }) {
  return (
    <figure className="lb-plate" style={{ maxWidth }}>
      <div className="lb-plate-mat">
        <img src={src} alt={alt} loading="lazy" />
      </div>
      <figcaption className="lb-plate-caption">
        <span className="lb-plate-tick">▪</span> {caption}
      </figcaption>
    </figure>
  );
}

/** Section header with running index + rule. */
function SectionHead({ index, kicker, title }) {
  return (
    <header className="lb-section-head">
      <div className="lb-section-meta">
        <span className="lb-section-index">{index}</span>
        <span className="lb-section-kicker">{kicker}</span>
      </div>
      <h2 className="lb-section-title">{title}</h2>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function LayerBasics() {
  return (
    <article className="lb-root">
      <style>{css}</style>

      {/* ---------------- Masthead ---------------- */}
      <header className="lb-masthead">
        <div className="lb-masthead-row">
          <span className="lb-chip">pLAtform</span>
          <span className="lb-chip lb-chip-quiet">Photoshop Foundations</span>
        </div>
        <h1 className="lb-title">Layer Basics</h1>
        <p className="lb-deck">
          Everything in a Photoshop document lives on a layer. This reader
          covers the three ideas you will use in every file you ever touch:
          keeping layers organized, adjusting an image without harming it,
          and wrapping content in Smart Objects so nothing is destroyed.
        </p>
        <nav className="lb-toc" aria-label="Lesson contents">
          <a href="#organizing">01 · Organizing Layers</a>
          <a href="#adjustment">02 · Adjustment Layers</a>
          <a href="#smart-objects">03 · Smart Objects</a>
        </nav>
      </header>

      {/* ================================================================
          01 · ORGANIZING LAYERS
      ================================================================ */}
      <section id="organizing" className="lb-section">
        <SectionHead
          index="01"
          kicker="Organizing Photoshop layers"
          title="Organizing Layers"
        />

        <div className="lb-split">
          <div className="lb-split-text">
            <h3 className="lb-sub">The Layers Panel</h3>
            <p>
              You work with layers in the Layers panel. The keyboard shortcut for the layers panel is <Keys keys={["F7"]} />.
            </p>

            <h3 className="lb-sub">The Background Layer</h3>
            <p>
              In Photoshop, a new image has a single layer called a background layer. The background layer is part of every Photoshop document by default. You can paint and draw on that layer, but you cannot erase or delete the pixels on the background layer. If you want to delete or erase pixels on the background layer you can rt. click on the background layer and select "layer from background".
            </p>
            <Plate
              src={layerFromBackground}
              alt="Right-click menu on the Background layer showing Layer from Background"
              caption="fig. 1b — layer from background"
              maxWidth={480}
            />

            <h3 className="lb-sub">How many layers can you have?</h3>
            <p>
              The number of additional layers, layer effects, and layer sets you can add to an image is limited only by your computer’s memory.
            </p>
          </div>

          <Plate
            src={layersPanel}
            alt="The Photoshop Layers panel showing layers"
            caption="fig. 1a — layers panel"
            maxWidth={320}
          />
        </div>

        <h3 className="lb-sub">How to create new layers</h3>
        <div className="lb-split lb-split-tight">
          <div className="lb-split-text">
            <p>
              To create a new layer click on the small box with a plus sign icon in the lower-right corner of the layers panel as seen below.
            </p>
            <p style={{ marginTop: 12 }}>
              You can also use the keyboard shortcut to create a new layer:
            </p>
            <div className="lb-shortcut-card">
              <ShortcutRow
                label="New layer"
                mac={["shift", "option", "command", "N"]}
                pc={["shift", "alt", "control", "N"]}
              />
            </div>
          </div>
          <Plate
            src={newLayerIcon}
            alt="The new layer icon — a box with a plus sign at the bottom of the Layers panel"
            caption="fig. 1c — new layer icon"
            maxWidth={200}
          />
        </div>

        <h3 className="lb-sub">Layer Groups</h3>
        <p>
          Layer groups help you organize and manage layers. You can use groups to arrange your layers logically and reduce clutter in the Layers panel. You can nest groups within other groups. You can also use groups to apply attributes and masks to multiple layers simultaneously.
        </p>
        <p>
          To create a layer group shift select two or more layers and use the shortcut:
        </p>
        <div className="lb-shortcut-card" style={{ marginBottom: 16 }}>
          <ShortcutRow
            label="Group layers"
            mac={["command", "G"]}
            pc={["control", "G"]}
          />
        </div>
        <p>
          You can also click on the folder icon in the layers panel, which can be found at the bottom of the layers panel. This will create a group in the layers panel and you can drag and drop layers into that group.
        </p>
      </section>

      {/* ================================================================
          02 · ADJUSTMENT LAYERS
      ================================================================ */}
      <section id="adjustment" className="lb-section">
        <SectionHead
          index="02"
          kicker="Non-destructive color & tone"
          title="Adjustment Layers"
        />

        <div className="lb-split">
          <div className="lb-split-text">
            <p>
              Sometimes layers don't contain any apparent content. An{" "}
              <strong>adjustment layer</strong> holds color or tonal
              adjustments that affect the layers <em>below</em> it. Rather
              than editing image pixels directly, you edit the adjustment
              layer — and the underlying pixels stay unchanged.
            </p>
            <p>
              Open the adjustment menu by clicking the{" "}
              <strong>black-and-white circle icon</strong> at the bottom of
              the Layers panel.
            </p>
            <Plate
              src={adjustmentIcon}
              alt="The adjustment layer icon — a half black, half white circle"
              caption="fig. 2a — the adjustment-layer button"
              maxWidth={140}
            />
            <p>
              Clicking it opens a pop-up menu of options — Levels, Curves,
              Hue/Saturation, Gradient Map, and more. Choosing one creates an
              adjustment layer that affects every layer beneath it.
            </p>
          </div>

          <Plate
            src={adjustmentMenu}
            alt="The adjustment layer pop-up menu listing options from Solid Color to Selective Color"
            caption="fig. 2b — the adjustment menu"
            maxWidth={300}
          />
        </div>
      </section>

      {/* ================================================================
          03 · SMART OBJECTS
      ================================================================ */}
      <section id="smart-objects" className="lb-section">
        <SectionHead
          index="03"
          kicker="Containers for content"
          title="Smart Objects"
        />

        <p>
          A <strong>Smart Object</strong> is a special type of layer that
          contains one or more layers of content. You can transform a Smart
          Object — scale, skew, or reshape it — without directly editing
          image pixels.
        </p>

        {/* Diagram: a smart object as a container */}
        <figure className="lb-diagram" aria-hidden="true">
          <svg viewBox="0 0 560 180" role="img">
            <title>A Smart Object wraps layers of content</title>
            {/* container */}
            <rect x="20" y="20" width="300" height="140" rx="6"
              fill="none" stroke={T.oxblood} strokeWidth="2" strokeDasharray="6 5" />
            <text x="34" y="44" fontFamily={T.mono} fontSize="12" fill={T.oxblood}>
              SMART OBJECT
            </text>
            {/* inner layers */}
            {[0, 1, 2].map((i) => (
              <rect key={i} x={44 + i * 10} y={64 + i * 26} width="220" height="20"
                rx="3" fill={T.paperEdge} stroke={T.muted} strokeWidth="1" />
            ))}
            <text x="56" y="78" fontFamily={T.mono} fontSize="10" fill={T.ink}>layer</text>
            <text x="66" y="104" fontFamily={T.mono} fontSize="10" fill={T.ink}>layer</text>
            <text x="76" y="130" fontFamily={T.mono} fontSize="10" fill={T.ink}>layer</text>
            {/* arrow */}
            <line x1="332" y1="90" x2="396" y2="90" stroke={T.muted} strokeWidth="1.5" />
            <polygon points="396,84 408,90 396,96" fill={T.muted} />
            <text x="336" y="78" fontFamily={T.mono} fontSize="10" fill={T.muted}>
              transform
            </text>
            {/* result */}
            <g transform="translate(470 90) rotate(-8)">
              <rect x="-52" y="-40" width="104" height="80" rx="4"
                fill="none" stroke={T.ink} strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" fontFamily={T.mono}
                fontSize="9" fill={T.ink}>
                pixels intact
              </text>
            </g>
          </svg>
          <figcaption className="lb-plate-caption">
            <span className="lb-plate-tick">▪</span> fig. 3 — scale, skew, or
            reshape the container; the source pixels are never touched
          </figcaption>
        </figure>

        <h3 className="lb-sub">Editing Smart Object layers</h3>
        <p>
          You can edit the Smart Object as a separate image even after
          placing it in a Photoshop document — double-click its thumbnail,
          edit the contents, save, and the placed instance updates.
        </p>

        <h3 className="lb-sub">Smart Filters</h3>
        <p>
          Smart Objects can also carry <strong>smart filter</strong> effects,
          which let you apply filters non-destructively — so you can tweak or
          remove the filter effect later.
        </p>
      </section>

      {/* ---------------- Footer recap ---------------- */}
      <footer className="lb-footer">
        <div className="lb-footer-grid">
          <div>
            <span className="lb-footer-num">01</span>
            <p>
              <strong>Organize.</strong> F7 opens the panel; groups keep it
              readable; the Background layer unlocks via{" "}
              <span className="lb-menu">Layer from Background</span>.
            </p>
          </div>
          <div>
            <span className="lb-footer-num">02</span>
            <p>
              <strong>Adjust.</strong> Adjustment layers change tone and color
              for everything below them — the pixels never change.
            </p>
          </div>
          <div>
            <span className="lb-footer-num">03</span>
            <p>
              <strong>Protect.</strong> Smart Objects wrap content so
              transforms and filters stay editable and reversible.
            </p>
          </div>
        </div>
        <p className="lb-colophon">pLAtform · Photoshop Foundations · Layer Basics</p>
      </footer>
      <TopicNav topicList={topicList} topicKey="layer-basics" weekNum="03" />
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Scoped styles                                                       */
/* ------------------------------------------------------------------ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,700;1,6..72,400&display=swap');

.lb-root {
  background: ${T.paper};
  color: ${T.ink};
  font-family: ${T.serif};
  font-size: 18px;
  line-height: 1.6;
  max-width: 880px;
  margin: 0 auto;
  padding: 48px 32px 64px;
}
.lb-root p { margin: 0 0 1em; max-width: 62ch; }
.lb-root strong { font-weight: 700; }
.lb-root a { color: ${T.oxblood}; }

/* ---- masthead ---- */
.lb-masthead { border-bottom: 3px solid ${T.oxblood}; padding-bottom: 28px; margin-bottom: 44px; }
.lb-masthead-row { display: flex; gap: 8px; margin-bottom: 18px; }
.lb-chip {
  font-family: ${T.mono}; font-size: 11px; letter-spacing: 0.08em;
  text-transform: uppercase; background: ${T.oxblood}; color: ${T.paper};
  padding: 3px 10px; border-radius: 2px;
}
.lb-chip-quiet { background: transparent; color: ${T.oxblood}; border: 1px solid ${T.oxblood}; }
.lb-title {
  font-family: ${T.serif}; font-weight: 700; font-size: clamp(40px, 7vw, 64px);
  line-height: 1.02; margin: 0 0 14px; letter-spacing: -0.01em;
}
.lb-deck { font-size: 20px; color: ${T.muted}; font-style: italic; }
.lb-toc { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 18px; }
.lb-toc a {
  font-family: ${T.mono}; font-size: 12px; text-decoration: none;
  color: ${T.oxblood}; border-bottom: 1px dotted ${T.oxbloodSoft}; padding-bottom: 2px;
}
.lb-toc a:hover, .lb-toc a:focus-visible { border-bottom-style: solid; }

/* ---- sections ---- */
.lb-section { margin-bottom: 64px; }
.lb-section-head { margin-bottom: 22px; }
.lb-section-meta { display: flex; align-items: baseline; gap: 12px; border-bottom: 1px solid ${T.rule}; padding-bottom: 6px; margin-bottom: 10px; }
.lb-section-index { font-family: ${T.mono}; font-weight: 600; font-size: 14px; color: ${T.oxblood}; }
.lb-section-kicker {
  font-family: ${T.mono}; font-size: 11px; letter-spacing: 0.14em;
  text-transform: uppercase; color: ${T.muted};
}
.lb-section-title { font-family: ${T.serif}; font-weight: 700; font-size: 34px; margin: 0; }
.lb-sub { font-family: ${T.serif}; font-weight: 700; font-size: 21px; margin: 1.4em 0 0.4em; }

/* ---- split layout ---- */
.lb-split { display: grid; grid-template-columns: 1fr auto; gap: 28px; align-items: start; }
.lb-split-tight { gap: 20px; }
@media (max-width: 700px) { .lb-split { grid-template-columns: 1fr; } }

/* ---- specimen plates ---- */
.lb-plate { margin: 16px 0 24px; }
.lb-plate-mat {
  background: ${T.panel}; border: 1px solid ${T.panelEdge};
  padding: 10px; border-radius: 3px;
  box-shadow: 3px 3px 0 ${T.paperEdge};
}
.lb-plate-mat img { display: block; width: 100%; height: auto; }
.lb-plate-caption {
  font-family: ${T.mono}; font-size: 11.5px; color: ${T.muted};
  margin-top: 8px; letter-spacing: 0.02em;
}
.lb-plate-tick { color: ${T.oxblood}; }

/* ---- menu path ---- */
.lb-menu {
  font-family: ${T.mono}; font-size: 0.82em; background: ${T.paperEdge};
  border: 1px solid ${T.rule}; padding: 1px 6px; border-radius: 2px; white-space: nowrap;
}

/* ---- shortcuts ---- */
.lb-shortcut-card {
  border: 1px solid ${T.rule}; border-left: 3px solid ${T.oxblood};
  background: rgba(255,255,255,0.35); padding: 12px 16px; margin: 10px 0 18px;
}
.lb-shortcut-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 22px; }
.lb-shortcut-label {
  font-family: ${T.mono}; font-size: 11px; letter-spacing: 0.12em;
  text-transform: uppercase; color: ${T.oxblood}; min-width: 92px;
}
.lb-shortcut-pair { display: inline-flex; align-items: center; gap: 8px; }
.lb-os { font-family: ${T.mono}; font-size: 10px; color: ${T.muted}; letter-spacing: 0.1em; }
.lb-keys { display: inline-flex; align-items: center; gap: 4px; }
.lb-keys-plus { font-family: ${T.mono}; font-size: 11px; color: ${T.muted}; }
.lb-key {
  font-family: ${T.mono}; font-size: 11.5px; color: ${T.ink};
  background: ${T.paper}; border: 1px solid ${T.muted};
  border-bottom-width: 2px; border-radius: 3px; padding: 2px 7px; white-space: nowrap;
}

/* ---- diagram ---- */
.lb-diagram { margin: 20px 0 26px; }
.lb-diagram svg { width: 100%; max-width: 560px; height: auto; display: block; }

/* ---- footer ---- */
.lb-footer { border-top: 3px solid ${T.oxblood}; padding-top: 26px; }
.lb-footer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
@media (max-width: 700px) { .lb-footer-grid { grid-template-columns: 1fr; } }
.lb-footer-grid p { font-size: 15.5px; margin: 6px 0 0; }
.lb-footer-num { font-family: ${T.mono}; font-weight: 600; font-size: 13px; color: ${T.oxblood}; }
.lb-colophon {
  font-family: ${T.mono}; font-size: 11px; color: ${T.muted};
  letter-spacing: 0.1em; text-transform: uppercase; margin-top: 30px;
}
`;

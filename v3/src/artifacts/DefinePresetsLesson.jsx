import React from "react";
import { Link } from "react-router-dom";
import TopicNav from "./TopicNav.jsx";
import { topicList } from "../content/week02Topics.js";

const defineMenu = "/presets/define-menu.png";
const patternsPanel = "/presets/patterns-panel.png";
const landscapeBrushes = "/presets/landscape-brushes.png";
const skyPalettes = "/presets/sky-palettes.png";

/* ----------------------------------------------------------------------- */
/* Design tokens — pLAtform                                                */
/* ----------------------------------------------------------------------- */
const T = {
  paper: "#f5efe1", // yellowed paper
  paperEdge: "#ece2cd",
  oxblood: "#8b3a2f",
  oxbloodSoft: "#b5654a",
  ink: "#241c17", // warm near-black
  muted: "#6f6151",
  rule: "#d8cdb5",
  panel: "#2b2b2b", // Photoshop dark chrome
  panelEdge: "#161616",
  serif: '"Newsreader", Georgia, serif',
  mono: '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace',
};

/* ----------------------------------------------------------------------- */
/* Specimen plate — a framed screenshot with a typed caption strip         */
/* ----------------------------------------------------------------------- */
function Plate({ src, alt, code, caption }) {
  return (
    <figure className="dpl-plate">
      <div className="dpl-plate__mat">
        <img className="dpl-plate__img" src={src} alt={alt} loading="lazy" />
      </div>
      <figcaption className="dpl-plate__cap">
        <span className="dpl-plate__code">{code}</span>
        <span className="dpl-plate__text">{caption}</span>
      </figcaption>
    </figure>
  );
}

/* ----------------------------------------------------------------------- */
/* Technique block                                                         */
/* ----------------------------------------------------------------------- */
function Technique({ num, kicker, title, children }) {
  return (
    <section className="dpl-tech">
      <div className="dpl-tech__rail">
        <span className="dpl-tech__num">{num}</span>
        <span className="dpl-tech__kicker">{kicker}</span>
      </div>
      <div className="dpl-tech__body">
        <h2 className="dpl-tech__title">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Steps({ items }) {
  return (
    <ol className="dpl-steps">
      {items.map((s, i) => (
        <li key={i} className="dpl-steps__item">
          <span dangerouslySetInnerHTML={{ __html: s }} />
        </li>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------------------------- */
/* Lesson                                                                  */
/* ----------------------------------------------------------------------- */
export default function DefinePresetsLesson() {
  return (
    <div className="dpl-root">
      <style>{CSS}</style>

      <article className="dpl-page">
        {/* Header --------------------------------------------------------- */}
        <header className="dpl-head">
          <Link to="/week/02" className="dpl-back-btn" style={{
            fontFamily: T.mono,
            fontSize: '11px',
            color: T.oxblood,
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
          <p className="dpl-eyebrow">pLAtform · Photoshop Foundations</p>
          <h1 className="dpl-h1">
            Define &amp; Save: <em>building your reusable toolkit</em>
          </h1>
          <p className="dpl-lede">
            Everything you make in a painting can become a tool you keep. A clump
            of leaves becomes a brush. A patch of bark becomes a tile. A sky you
            mixed at golden hour becomes a named palette you reach for again.
            This is how a concept artist turns one-off marks into a personal
            library — the same discipline behind the specimen panels below.
          </p>
        </header>

        {/* The Define menu ------------------------------------------------ */}
        <Technique
          num="01"
          kicker="Edit menu"
          title="The three Define commands"
        >
          <p className="dpl-p">
            All of this starts in one place. With pixels selected or a shape
            active, open <span className="dpl-kbd">Edit</span> and look for the
            three <em>Define</em> commands. Each one freezes whatever you’ve
            selected into a preset you can use anywhere. <em>Define Custom
            Shape</em> greys out unless a vector path is selected — a quick tell
            for whether you’re working in pixels or vectors.
          </p>
          <Plate
            src={defineMenu}
            alt="Photoshop Edit menu showing Define Brush Preset, Define Pattern, and a greyed-out Define Custom Shape."
            code="PLATE 01 · edit ▸ define…"
            caption="Define Brush Preset, Define Pattern, and Define Custom Shape — the menu where reusable tools are born."
          />
        </Technique>

        {/* Define Brush --------------------------------------------------- */}
        <Technique
          num="02"
          kicker="Define Brush Preset"
          title="Turn marks into a brush tip"
        >
          <p className="dpl-p">
            A brush tip is a grayscale stamp: <strong>black is full opacity,
            white is transparent.</strong> Paint or stamp a shape on a white
            background, marquee around it, then run the command. The captured tip
            lands at the bottom of the Brushes panel, where you can tune spacing,
            scatter, and angle jitter to make foliage, grass, and texture stamps
            that feel hand-built rather than cloned.
          </p>
          <Steps
            items={[
              "Paint your mark in black on a clean white layer.",
              "<code>Select ▸ All</code> or marquee the mark tightly.",
              "<code>Edit ▸ Define Brush Preset…</code> and name it.",
              "Open Brush Settings → set <em>Spacing</em>, <em>Shape Dynamics</em>, and <em>Scattering</em>.",
              "Drag related brushes into a named group folder to keep them together.",
            ]}
          />
          <Plate
            src={landscapeBrushes}
            alt="A Photoshop brush group named Landscape_Painting containing five custom brushes numbered 471, 155, 136, 174, and 519."
            code="PLATE 02 · group: landscape_painting"
            caption="Five defined tips grouped under Landscape_Painting — foliage (471), grass blades, and a splatter (519). Grouping is how a kit stays findable."
          />
        </Technique>

        {/* Define Pattern ------------------------------------------------- */}
        <Technique
          num="03"
          kicker="Define Pattern"
          title="Turn a tile into a fill"
        >
          <p className="dpl-p">
            A pattern is a tile that repeats seamlessly. Select a rectangular
            region — no feather — and run <em>Define Pattern</em>. Apply it with{" "}
            <span className="dpl-kbd">Edit ▸ Fill ▸ Pattern</span>, the Pattern
            Stamp tool, or a non-destructive Pattern fill layer. For concept
            work, patterns are scenery shortcuts: distant trees, ground cover,
            water ripples. Organize them into folders so the panel reads like a
            material shelf.
          </p>
          <Plate
            src={patternsPanel}
            alt="The Photoshop Patterns panel with groups named Trees, Grass, and Water, and three pattern swatches: blue stripes, blue trees, and dark red dots."
            code="PLATE 03 · patterns panel"
            caption="Groups for Trees, Grass, and Water keep tiles sorted by use. The footer icons make a new group, define a new pattern, and delete the selection."
          />
        </Technique>

        {/* Save Swatch galleries ----------------------------------------- */}
        <Technique
          num="04"
          kicker="Swatches"
          title="Save swatch galleries"
        >
          <p className="dpl-p">
            Color is a tool too. Once you mix a set of values that work — a sky
            at a specific hour — drop each one into the Swatches panel, name it,
            and gather the set into a group. A named gallery removes the guesswork
            from a repaint: instead of re-mixing, you load the mood. Naming is the
            real work here; <code>Golden Hour Sky 3</code> tells you far more than
            a nameless chip ever will.
          </p>
          <Plate
            src={skyPalettes}
            alt="A Photoshop swatch group named sky_palettes containing named color sets: Golden Hour Sky, Late Sunset Sky, Day Sky, and Morning Day, each numbered 1 through 6."
            code="PLATE 04 · group: sky_palettes"
            caption="One gallery, four moods: Golden Hour, Late Sunset, Day Sky, and Morning Day. Named swatches turn a mixing session into a reusable lighting preset."
          />
        </Technique>

        {/* Save & share -------------------------------------------------- */}
        <section className="dpl-export">
          <h2 className="dpl-export__title">Save the library, take it anywhere</h2>
          <p className="dpl-p">
            Defining a preset only stores it in the current app session — to keep
            it, export the group. Each preset type has its own file, and the
            Preset Manager lets you export a selected set as one bundle to hand to
            a classmate or move between your Mac and your workstation.
          </p>
          <div className="dpl-grid">
            <ExportCard ext=".abr" label="Brushes" note="Right-click a brush group ▸ Export Selected Brushes." />
            <ExportCard ext=".pat" label="Patterns" note="Patterns panel menu ▸ Export Selected Patterns." />
            <ExportCard ext=".aco" label="Swatches" note="Swatches panel menu ▸ Export Selected Swatches." />
            <ExportCard ext="CC" label="Libraries" note="Drag any preset into a Creative Cloud Library to sync." />
          </div>
          <p className="dpl-foot">
            Rule of thumb — <em>if you made it twice, define it; if you defined
            it, name it; if you named it, save the group.</em>
          </p>
        </section>
        <div style={{ marginTop: '40px' }}>
          <TopicNav topicList={topicList} topicKey="define-presets" weekNum="02" />
        </div>
      </article>
    </div>
  );
}

function ExportCard({ ext, label, note }) {
  return (
    <div className="dpl-card">
      <span className="dpl-card__ext">{ext}</span>
      <span className="dpl-card__label">{label}</span>
      <span className="dpl-card__note">{note}</span>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Styles                                                                  */
/* ----------------------------------------------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opt@0,400;0,500;1,400;1,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.dpl-root { --ox:${T.oxblood}; --ink:${T.ink}; --paper:${T.paper};
  background:${T.paper}; color:${T.ink}; font-family:${T.serif};
  -webkit-font-smoothing:antialiased; line-height:1.5; }
.dpl-root *{ box-sizing:border-box; }

.dpl-page{ max-width:760px; margin:0 auto; padding:56px 28px 80px; }

/* header */
.dpl-eyebrow{ font-family:${T.mono}; font-size:12px; letter-spacing:.16em;
  text-transform:uppercase; color:${T.oxblood}; margin:0 0 18px; }
.dpl-h1{ font-family:${T.serif}; font-weight:500; font-size:clamp(30px,5vw,46px);
  line-height:1.08; letter-spacing:-.01em; margin:0 0 20px; }
.dpl-h1 em{ font-style:italic; color:${T.oxblood}; }
.dpl-lede{ font-size:18px; max-width:60ch; color:${T.ink}; margin:0 0 8px;
  border-left:2px solid ${T.rule}; padding-left:18px; }

/* technique */
.dpl-tech{ display:grid; grid-template-columns:120px 1fr; gap:28px;
  margin-top:54px; padding-top:30px; border-top:1px solid ${T.rule}; }
.dpl-tech__rail{ position:sticky; top:20px; align-self:start; }
.dpl-tech__num{ display:block; font-family:${T.mono}; font-weight:600;
  font-size:13px; color:${T.oxblood}; letter-spacing:.1em; }
.dpl-tech__kicker{ display:block; font-family:${T.mono}; font-size:11px;
  letter-spacing:.14em; text-transform:uppercase; color:${T.muted};
  margin-top:6px; }
.dpl-tech__title{ font-family:${T.serif}; font-weight:500; font-size:26px;
  line-height:1.12; margin:0 0 14px; }
.dpl-p{ font-size:17px; max-width:62ch; margin:0 0 18px; }
.dpl-p strong{ font-weight:600; }
.dpl-p code, .dpl-steps code, .dpl-foot code{ font-family:${T.mono}; font-size:.86em;
  background:${T.paperEdge}; padding:1px 5px; border-radius:3px; }
.dpl-kbd{ font-family:${T.mono}; font-size:.86em; background:${T.ink}; color:${T.paper};
  padding:1px 6px; border-radius:3px; white-space:nowrap; }

/* steps */
.dpl-steps{ counter-reset:step; list-style:none; margin:0 0 22px; padding:0; }
.dpl-steps__item{ counter-increment:step; position:relative; padding-left:34px;
  margin:0 0 10px; font-size:15.5px; max-width:60ch; }
.dpl-steps__item::before{ content:counter(step); position:absolute; left:0; top:1px;
  width:22px; height:22px; display:grid; place-items:center; font-family:${T.mono};
  font-size:11px; font-weight:600; color:${T.paper}; background:${T.oxblood};
  border-radius:50%; }

/* specimen plate */
.dpl-plate{ margin:24px 0 6px; }
.dpl-plate__mat{ background:${T.panel}; border:1px solid ${T.panelEdge};
  border-radius:8px; padding:18px; display:flex; justify-content:center;
  box-shadow:0 1px 0 #fff inset, 0 8px 24px -16px rgba(0,0,0,.5); }
.dpl-plate__img{ max-width:100%; height:auto; display:block; border-radius:3px;
  image-rendering:auto; }
.dpl-plate__cap{ display:flex; gap:12px; align-items:baseline; margin-top:12px;
  border-left:2px solid ${T.oxblood}; padding-left:12px; }
.dpl-plate__code{ font-family:${T.mono}; font-size:10.5px; letter-spacing:.12em;
  text-transform:uppercase; color:${T.oxblood}; white-space:nowrap; flex:none;
  padding-top:2px; }
.dpl-plate__text{ font-size:14px; color:${T.muted}; font-style:italic; }

/* export */
.dpl-export{ margin-top:56px; padding-top:30px; border-top:2px solid ${T.oxblood}; }
.dpl-export__title{ font-family:${T.serif}; font-weight:500; font-size:24px;
  margin:0 0 14px; }
.dpl-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:12px;
  margin:22px 0 26px; }
.dpl-card{ background:${T.paperEdge}; border:1px solid ${T.rule}; border-radius:8px;
  padding:14px; display:flex; flex-direction:column; gap:6px; }
.dpl-card__ext{ font-family:${T.mono}; font-weight:600; font-size:13px;
  color:${T.oxblood}; }
.dpl-card__label{ font-family:${T.serif}; font-size:16px; font-weight:500; }
.dpl-card__note{ font-family:${T.mono}; font-size:11px; line-height:1.45;
  color:${T.muted}; }
.dpl-foot{ font-size:16px; max-width:60ch; }
.dpl-foot em{ color:${T.oxblood}; font-style:italic; }

/* responsive */
@media (max-width:640px){
  .dpl-page{ padding:40px 20px 64px; }
  .dpl-tech{ grid-template-columns:1fr; gap:14px; }
  .dpl-tech__rail{ position:static; display:flex; gap:14px; align-items:baseline; }
  .dpl-tech__kicker{ margin-top:0; }
  .dpl-grid{ grid-template-columns:repeat(2,1fr); }
}
@media (prefers-reduced-motion:no-preference){
  .dpl-card{ transition:transform .15s ease, border-color .15s ease; }
  .dpl-card:hover{ transform:translateY(-2px); border-color:${T.oxbloodSoft}; }
}
`;

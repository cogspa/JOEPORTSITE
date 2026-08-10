// SphereMaterialStudies.jsx
// pLAtform · Cinematic Lighting — Diffuse & Specular on a Sphere + Brush Hardness Materials
// Drop the four PNGs into src/assets/lighting/ (paths below) or adjust imports.

import shadingComponents from "../assets/lighting/sphere-shading-components.png";
import materialsRendered from "../assets/lighting/sphere-materials-rendered.png";
import renderVsPaint from "../assets/lighting/sphere-studies-render-vs-paint.png";
import brushHardness from "../assets/lighting/brush-hardness-materials.png";
import { topicList } from "../content/week03Topics.js";
import TopicNav from "./TopicNav.jsx";

// ── pLAtform design tokens ────────────────────────────────────────────────
const T = {
  oxblood: "#8b3a2f",
  paper: "#f5efe1",
  ink: "#2a2420",
  inkSoft: "#5a4f47",
  line: "#d9cfba",
  cardBg: "#fbf7ec",
  mono: "'IBM Plex Mono', monospace",
  serif: "'Newsreader', Georgia, serif",
};

const s = {
  section: {
    background: T.paper,
    color: T.ink,
    fontFamily: T.serif,
    padding: "3rem 1.5rem 4rem",
    maxWidth: 980,
    margin: "0 auto",
  },
  eyebrow: {
    fontFamily: T.mono,
    fontSize: 12,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: T.oxblood,
    marginBottom: "0.75rem",
  },
  h2: {
    fontFamily: T.serif,
    fontWeight: 500,
    fontSize: "clamp(1.75rem, 3.5vw, 2.4rem)",
    lineHeight: 1.15,
    margin: "0 0 1rem",
  },
  h3: {
    fontFamily: T.mono,
    fontSize: 14,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: T.oxblood,
    margin: "0 0 0.6rem",
  },
  prose: {
    fontSize: "1.06rem",
    lineHeight: 1.65,
    maxWidth: "62ch",
    color: T.ink,
  },
  figure: {
    margin: "2rem 0",
    border: `1px solid ${T.line}`,
    background: "#fff",
    padding: "1rem",
  },
  img: { width: "100%", height: "auto", display: "block" },
  caption: {
    fontFamily: T.mono,
    fontSize: 12,
    lineHeight: 1.5,
    color: T.inkSoft,
    marginTop: "0.75rem",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem",
    margin: "1.5rem 0 2.5rem",
  },
  card: {
    background: T.cardBg,
    border: `1px solid ${T.line}`,
    borderTop: `3px solid ${T.oxblood}`,
    padding: "1.1rem 1.2rem 1.3rem",
  },
  cardTitle: {
    fontFamily: T.mono,
    fontSize: 13,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    margin: "0 0 0.5rem",
    color: T.ink,
  },
  spec: {
    fontFamily: T.mono,
    fontSize: 12,
    color: T.oxblood,
    display: "block",
    marginBottom: "0.6rem",
  },
  cardBody: { fontSize: "0.98rem", lineHeight: 1.55, color: T.inkSoft, margin: 0 },
  callout: {
    borderLeft: `3px solid ${T.oxblood}`,
    background: T.cardBg,
    padding: "1rem 1.25rem",
    margin: "2rem 0",
    fontSize: "1.02rem",
    lineHeight: 1.6,
    fontStyle: "italic",
    maxWidth: "68ch",
  },
};

export default function SphereMaterialStudies() {
  return (
    <section style={s.section}>
      <div style={s.eyebrow}>Cinematic Lighting · Sphere Studies</div>
      <h2 style={s.h2}>One sphere, one light — three materials</h2>

      <p style={s.prose}>
        Every material you will ever paint is a mix of the same three shading
        components. Before touching a film still, prove it to yourself on a
        sphere: same form, same light direction, and the only thing that changes
        is how the surface splits the light between diffuse and specular.
      </p>

      {/* ── The anatomy ── */}
      <figure style={s.figure}>
        <img
          src={shadingComponents}
          alt="Gray sphere on black labeled with specular highlight, diffuse falloff, and ambient light regions"
          style={s.img}
        />
        <figcaption style={s.caption}>
          FIG 01 — The anatomy of a lit sphere. Specular: the sharp hot spot
          aimed back at your eye. Diffuse: the soft falloff wrapping the form.
          Ambient: the low bounce light keeping the shadow side alive.
        </figcaption>
      </figure>

      {/* ── The three-material lineup ── */}
      <figure style={s.figure}>
        <img
          src={materialsRendered}
          alt="Three rendered spheres: plastic with a small hot specular, matte clay with pure diffuse falloff, and chrome-glass with mirror reflections"
          style={s.img}
        />
        <figcaption style={s.caption}>
          FIG 02 — Same sphere, three surfaces. Left: plastic — smooth diffuse
          body plus one small point specular. Center: clay — pure diffuse, no
          specular at all. Right: chrome/glass — almost no diffuse; the surface
          is nothing but specular reflection of the environment.
        </figcaption>
      </figure>

      <p style={s.prose}>
        Read the lineup left to right as a specular dial. Turn specular off
        entirely and you get matte clay — the form reads only through diffuse
        falloff. Add one tiny, hard, near-white dot and the same sphere becomes
        plastic. Crank specular until it dominates and the diffuse body
        disappears: chrome doesn't have "its own" shading — it borrows the
        entire scene as reflections, sky on top, ground plane below.
      </p>

      {/* ── Brush hardness is the material dial ── */}
      <h3 style={{ ...s.h3, marginTop: "3rem" }}>
        Brush hardness is your material dial
      </h3>
      <p style={s.prose}>
        In Photoshop, one slider does most of this work. Brush hardness controls
        the sharpness of the stroke's edge — and edge quality is exactly what
        separates diffuse from specular. A soft brush (0% hardness) lays down
        the smooth gradations of diffuse reflection. A hard brush (100%) builds
        crisp, matte, chalky strokes — and it's also the only brush that can
        drop a convincing specular hit. The trick is knowing when to switch.
      </p>

      <figure style={s.figure}>
        <img
          src={brushHardness}
          alt="Annotated study sheet: clay spheres painted with 100% hardness, plastic with 0% hardness plus a hard point specular, and chrome painted with a hard edge brush at low opacities"
          style={s.img}
        />
        <figcaption style={s.caption}>
          FIG 03 — Study sheet. Clay: hardness 100%, strokes stay visible and
          matte. Plastic: hardness 0% for the diffuse body, then one hard point
          specular. Metals: hard-edge brush, low opacities, highlights and darks
          punched in at 100%.
        </figcaption>
      </figure>

      <div style={s.grid3}>
        <div style={s.card}>
          <p style={s.cardTitle}>Clay / Matte</p>
          <span style={s.spec}>hardness 100% · low opacity · no specular</span>
          <p style={s.cardBody}>
            Build the diffuse falloff with a hard brush at low opacity, letting
            strokes stack and stay slightly visible. The crisp stroke edges read
            as a rough, light-scattering surface. Do not add a highlight — the
            moment you do, it stops being clay.
          </p>
        </div>
        <div style={s.card}>
          <p style={s.cardTitle}>Plastic</p>
          <span style={s.spec}>hardness 0% body · hardness 100% specular</span>
          <p style={s.cardBody}>
            Paint the body with a soft brush — smooth, buttery falloff from lit
            side to core shadow, blending with the eyedropper between mid-tones.
            Then switch to a small hard brush and place one near-white point
            specular. Small, sharp, almost pure white. That single dot is the
            plastic.
          </p>
        </div>
        <div style={s.card}>
          <p style={s.cardTitle}>Chrome / Metal</p>
          <span style={s.spec}>hardness 100% · low opacities · sharp shapes</span>
          <p style={s.cardBody}>
            Forget falloff — paint reflections. Hard-edge brush, working at low
            opacities, blocking in the environment as shapes: bright sky above,
            dark horizon band, ground bounce below. Punch the brightest
            highlights and darkest darks in at 100% opacity. Sharp contrast is
            what makes it read as metal.
          </p>
        </div>
      </div>

      <div style={s.callout}>
        The rule of thumb: hard brush builds matte — soft brush builds diffuse —
        and the specular highlight always comes back in with the hard brush.
        Hardness isn't a comfort setting; it's a material decision.
      </div>

      {/* ── Render vs. paint ── */}
      <h3 style={s.h3}>Render vs. paint</h3>
      <p style={s.prose}>
        Here's the exercise: the top row is the CG render, the bottom row is the
        same three materials painted by hand using only the brush-hardness
        recipe above. The painted versions are looser — and that's fine. What
        matters is that each sphere still reads instantly as its material,
        because the diffuse/specular split is correct even when the strokes are
        rough.
      </p>

      <figure style={s.figure}>
        <img
          src={renderVsPaint}
          alt="Six spheres in two rows: rendered plastic, clay, and chrome on top; hand-painted versions of the same three materials below"
          style={s.img}
        />
        <figcaption style={s.caption}>
          FIG 04 — Top: rendered reference. Bottom: painted studies. Squint —
          if the material still reads with your eyes half closed, the value
          structure is doing its job.
        </figcaption>
      </figure>

      <p style={s.prose}>
        Do this study before your environment compositions this week. Three
        spheres, one light, twenty minutes each. Once you can dial a material
        with nothing but brush hardness and a value plan, every surface in a
        film still becomes a solvable problem.
      </p>
      <TopicNav topicList={topicList} topicKey="sphere-material-studies" weekNum="03" />
    </section>
  );
}

import React, { useState, useEffect, useCallback, useRef } from "react";
import { topicList } from "../content/week03Topics.js";
import TopicNav from "./TopicNav.jsx";

// ─────────────────────────────────────────────────────────────────────────────
//  ValueStudiesCarousel
//  A plate-by-plate viewer for value / chiaroscuro studies.
//  Public-domain imagery via publicdomainreview.org
// ─────────────────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    caption: "Goya, What a Golden Beak!, 1799",
    meta: "Francisco Goya · etching & aquatint · Los Caprichos, plate 53",
    alt: "Goya etching of an owl on a lectern above grotesque listening figures",
    src: "/value_studies/01-goya.jpg"
  },
  {
    caption: "Henrique Alvim Corrêa’s Illustration for The War of the Worlds, 1906",
    meta: "Henrique Alvim Corrêa · ink illustration",
    alt: "Martian tripods firing heat-rays over a village at night",
    src: "/value_studies/02-war-of-the-worlds.jpg"
  },
  {
    caption: "Odilon Redon, The Eye like a Strange Balloon Mounts toward Infinity, 1882",
    meta: "Odilon Redon · lithograph · L’Œil, comme un ballon bizarre se dirige vers l’infini",
    alt: "A giant eyeball as a hot-air balloon rising over a dark landscape",
    src: "/value_studies/03-redon-eye.jpg"
  },
  {
    caption: "Mr. Phelan, from “Physical Training for Businessmen”, 1971",
    meta: "photographer unknown · gelatin silver print",
    alt: "Multiple-exposure photo of a gymnast appearing to have many arms",
    src: "/value_studies/04-phelan.jpg"
  },
  {
    caption: "A “skirmish car” with armed white men driving through a Tulsa neighborhood, June 1, 1921",
    meta: "photographer unknown · the Tulsa Race Massacre",
    alt: "Armed men crowded into an open touring car on a Tulsa street",
    src: "/value_studies/05-tulsa.jpg"
  },
  {
    caption: "Julia Margaret Cameron’s photograph of Marianne North in Mrs Cameron’s house in Ceylon, 1877",
    meta: "Julia Margaret Cameron · albumen print",
    alt: "A woman painting at an easel in a sunlit veranda, a figure watching",
    src: "/value_studies/06-cameron.jpg"
  }
];

const T = {
  paper:   "#f5efe1",
  ink:     "#2a2420",
  oxblood: "#8b3a2f",
  mat:     "#14110e",
  muted:   "#8c8273",
  line:    "#ddd1bb",
  faint:   "#ece3d0",
};

const TAGS = [
  "Noir Film",
  "Black & White TV",
  "Black & White Optical Art",
  "Minimalistic Graphic Design",
];

export default function ValueStudiesCarousel() {
  const [i, setI] = useState(0);
  const [loaded, setLoaded] = useState(() => SLIDES.map(() => false));
  const reduce = useRef(false);
  const live = useRef(null);
  const n = SLIDES.length;

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }, []);

  const go = useCallback((next) => {
    setI((c) => (next + n) % n);
  }, [n]);

  const prev = useCallback(() => go(i - 1), [go, i]);
  const next = useCallback(() => go(i + 1), [go, i]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const markLoaded = (idx) =>
    setLoaded((l) => { if (l[idx]) return l; const c = l.slice(); c[idx] = true; return c; });

  const cur = SLIDES[i];

  return (
    <div style={{
      background: T.paper,
      color: T.ink,
      fontFamily: "'Newsreader', Georgia, 'Times New Roman', serif",
      width: "100%",
      minHeight: "100%",
      boxSizing: "border-box",
      padding: "clamp(18px, 4vw, 44px)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .vs-btn:focus-visible { outline: 2px solid ${T.oxblood}; outline-offset: 3px; }
        .vs-swatch:focus-visible { outline: 2px solid ${T.oxblood}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .vs-fade { transition: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <header style={{ marginBottom: "clamp(16px, 3vw, 28px)" }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
            fontSize: 11.5, letterSpacing: "0.22em", textTransform: "uppercase",
            color: T.oxblood, display: "flex", justifyContent: "space-between",
            alignItems: "baseline", gap: 16, borderBottom: `1px solid ${T.line}`,
            paddingBottom: 10,
          }}>
            <span>Value Studies</span>
            <span style={{ color: T.muted }}>publicdomainreview.org</span>
          </div>

          <h1 style={{
            fontSize: "clamp(24px, 4.6vw, 40px)", fontWeight: 500, lineHeight: 1.08,
            margin: "18px 0 10px", letterSpacing: "-0.01em",
          }}>
            The Emotive Power of <span style={{ fontStyle: "italic", color: T.oxblood }}>Value</span>
          </h1>

          <p style={{
            fontSize: "clamp(14.5px, 1.7vw, 16.5px)", lineHeight: 1.55,
            color: "#4a423a", maxWidth: 640, margin: "0 0 14px",
          }}>
            A range of photographs and illustrations showing how tonal value alone
            carries feeling. Images from the past can be powerful inspiration for
            digital art today — look also to:
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TAGS.map((t) => (
              <span key={t} style={{
                fontFamily: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
                fontSize: 11, letterSpacing: "0.04em", color: "#5a5046",
                border: `1px solid ${T.line}`, borderRadius: 2,
                padding: "5px 9px", background: T.faint,
              }}>{t}</span>
            ))}
          </div>
        </header>

        {/* ── Stage ──────────────────────────────────────────── */}
        <div style={{ position: "relative" }}>
          <div style={{
            position: "relative", background: T.mat,
            borderRadius: 3, overflow: "hidden",
            boxShadow: "0 1px 0 rgba(255,255,255,.4), 0 18px 40px -22px rgba(20,17,14,.6)",
            aspectRatio: "16 / 11", width: "100%",
          }}>
            {/* inner vignette */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3,
              boxShadow: "inset 0 0 120px 24px rgba(0,0,0,.55)",
            }} />
            {SLIDES.map((s, idx) => (
              <img
                key={idx}
                className="vs-fade"
                src={s.src}
                alt={s.alt}
                onLoad={() => markLoaded(idx)}
                style={{
                  position: "absolute", inset: 0, margin: "auto",
                  maxWidth: "100%", maxHeight: "100%",
                  width: "auto", height: "auto",
                  objectFit: "contain",
                  opacity: idx === i ? 1 : 0,
                  transition: reduce.current ? "none" : "opacity .5s ease",
                  zIndex: idx === i ? 2 : 1,
                }}
              />
            ))}

            {/* plate number */}
            <div style={{
              position: "absolute", top: 12, right: 14, zIndex: 4,
              fontFamily: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
              fontSize: 12, letterSpacing: "0.14em", color: "rgba(245,239,225,.82)",
              textShadow: "0 1px 4px rgba(0,0,0,.6)",
            }}>
              {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </div>
          </div>

          {/* arrows */}
          <button className="vs-btn" onClick={prev} aria-label="Previous plate"
            style={arrowStyle("left")}>‹</button>
          <button className="vs-btn" onClick={next} aria-label="Next plate"
            style={arrowStyle("right")}>›</button>
        </div>

        {/* ── Caption ────────────────────────────────────────── */}
        <div aria-live="polite" ref={live} style={{
          marginTop: 18, minHeight: 70,
        }}>
          <p style={{
            fontSize: "clamp(16px, 2.1vw, 20px)", fontStyle: "italic",
            lineHeight: 1.35, margin: "0 0 6px", letterSpacing: "-0.005em",
          }}>
            {cur.caption}
          </p>
          <p style={{
            fontFamily: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
            fontSize: 12, color: T.muted, letterSpacing: "0.02em", margin: 0,
          }}>
            {cur.meta}
          </p>
        </div>

        {/* ── Tonal step indicator ───────────────────────────── */}
        <div role="tablist" aria-label="Select plate" style={{
          display: "flex", gap: 6, marginTop: 20, alignItems: "stretch",
        }}>
          {SLIDES.map((s, idx) => {
            const active = idx === i;
            // step from light → dark across the strip; the theme is value itself
            const shade = Math.round(232 - (idx / (n - 1)) * 196); // 232 → 36
            const bg = `rgb(${shade},${shade - 6},${shade - 14})`;
            return (
              <button
                key={idx}
                className="vs-swatch"
                role="tab"
                aria-selected={active}
                aria-label={`Plate ${idx + 1}: ${s.caption}`}
                onClick={() => setI(idx)}
                style={{
                  flex: 1, height: 30, padding: 0, cursor: "pointer",
                  border: active ? `1.5px solid ${T.oxblood}` : `1px solid ${T.line}`,
                  background: bg, borderRadius: 2,
                  position: "relative",
                  transform: active ? "translateY(-2px)" : "none",
                  transition: "transform .18s ease, border-color .18s ease",
                }}
              >
                {active && (
                  <span style={{
                    position: "absolute", left: 0, right: 0, bottom: -7,
                    height: 2, background: T.oxblood,
                  }} />
                )}
              </button>
            );
          })}
        </div>
        <TopicNav topicList={topicList} topicKey="value-studies" weekNum="03" />
      </div>
    </div>
  );
}

function arrowStyle(side) {
  return {
    position: "absolute", top: "50%", [side]: 10, transform: "translateY(-50%)",
    zIndex: 5, width: 42, height: 42, borderRadius: "50%",
    border: "1px solid rgba(245,239,225,.35)",
    background: "rgba(20,17,14,.55)", color: "#f5efe1",
    fontSize: 24, lineHeight: 1, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(2px)",
    paddingBottom: 3,
  };
}

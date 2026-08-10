import { useState } from "react";

/* ── pLAtform design system ─────────────────────────────
   oxblood #8b3a2f · paper cream #f5efe1
   IBM Plex Mono (utility) · Newsreader (display)        */

const OX = "#8b3a2f";
const CREAM = "#f5efe1";
const INK = "#2b201c";

const ROLES = ["Sky", "Light", "Mid", "Shadow", "Ground", "Accent"];

const TRIADS = [
  { id: "01", title: "Seasonal", arc: "Summer → Fall → Winter", note: "Temperature migrates cool-warm-cold while value range widens toward winter.", phases: [
    ["Summer", ["#6FB7E0","#FFF3C4","#7BA05B","#2F5D3A","#C9A66B","#E86A5E"]],
    ["Fall",   ["#C9D6DF","#F2C14E","#C46D3B","#5C3A2E","#8A6A45","#A23B3B"]],
    ["Winter", ["#B8C7D9","#F4F6F8","#8FA3B8","#3D4A5C","#DDE4EA","#6B4F8A"]] ]},
  { id: "02", title: "Time of Day", arc: "Dawn → Midday → Night", note: "One location, three key lights: rose rim light, white noon sun, warm window glow against blue dark.", phases: [
    ["Dawn",   ["#F4A988","#FFE3B8","#B78BA8","#5A4B7C","#7C6A8E","#FF8C6B"]],
    ["Midday", ["#4FA3E0","#FFFDF2","#79B26B","#35634A","#B99B6B","#F2D34D"]],
    ["Night",  ["#0F1B33","#C9D8F0","#2E4568","#060B18","#1C2A44","#F2B33D"]] ]},
  { id: "03", title: "Genre Shift", arc: "Fantasy → Modern → Sci-Fi", note: "Saturation tells the genre: lush jewel tones, desaturated concrete, then neon against near-black.", phases: [
    ["Fantasy", ["#A8D8C8","#F7E6A2","#5E9B7A","#2E4A3F","#8A6F4D","#C05299"]],
    ["Modern",  ["#AEB8BF","#E8E4DC","#7E8A92","#3A4148","#9B9284","#D9531E"]],
    ["Sci-Fi",  ["#1B2440","#7FE7F0","#3B4B7A","#0B0F1F","#56617F","#C13BFF"]] ]},
  { id: "04", title: "Weather Cycle", arc: "Calm → Storm → Aftermath", note: "Value compression study: the storm collapses to a narrow grey band with one electric accent.", phases: [
    ["Calm",      ["#BEE0EE","#FFF6DC","#9AC49A","#56705B","#C7B18C","#F0C987"]],
    ["Storm",     ["#4A5568","#C6CFDB","#5E6B7E","#232A36","#4E4A45","#9FE0E8"]],
    ["Aftermath", ["#D9CFC4","#F5E8C8","#8AA08C","#4C5B52","#6E5F4E","#E8A25E"]] ]},
  { id: "05", title: "Civilization", arc: "Wilderness → Settlement → Ruins", note: "The accent narrates: wildflower pink, a painted door, then ivy reclaiming the stone.", phases: [
    ["Wilderness", ["#A9CDE0","#F3EBC8","#4F7C52","#24402B","#6C5B3F","#C86B85"]],
    ["Settlement", ["#D8C9A8","#F7D98B","#B0713F","#5A3B28","#A08A5F","#4F7CAC"]],
    ["Ruins",      ["#B3B8B5","#E4E0D2","#7E837C","#3B403C","#9A8F76","#6FA06B"]] ]},
  { id: "06", title: "Corruption Arc", arc: "Pure → Corrupted → Cleansed", note: "Cleansed is not a copy of pure — paler and scarred. Worlds carry their history.", phases: [
    ["Pure",      ["#CFE8F5","#FFFBEA","#8CC1A4","#4C7A66","#D8CBA8","#F5D76E"]],
    ["Corrupted", ["#3A2B45","#B08FD9","#5E3B63","#1A1122","#4A3A3F","#A4E052"]],
    ["Cleansed",  ["#E8F1EE","#FDF6E0","#A9C9B4","#5F7A70","#C4BBA4","#E2836E"]] ]},
  { id: "07", title: "Elevation", arc: "Underground → Surface → Sky Realm", note: "Three light logics: torchlight in a void, open daylight, high-key atmospheric bounce.", phases: [
    ["Underground", ["#14100F","#E8A54B","#4E3F35","#060404","#2E2620","#4FC1B0"]],
    ["Surface",     ["#8FC1DE","#F6E9BE","#77A05E","#3C5B3E","#A5895F","#D96C4F"]],
    ["Sky Realm",   ["#DCEBF7","#FFF8E8","#A7C4E2","#6E86AB","#C9D8EA","#F2B950"]] ]},
  { id: "08", title: "Mythic Ages", arc: "Age of Gods → Heroes → Man", note: "Slow desaturation across deep time: gilded violet, bronze and banner red, humble grey-blue.", phases: [
    ["Age of Gods",   ["#F0D9A6","#FFEFC2","#C99A4B","#5E4A8C","#9C7FB5","#E4572E"]],
    ["Age of Heroes", ["#9FB6C9","#EBD9A8","#7A6A52","#3A3A44","#6E7B62","#B33939"]],
    ["Age of Man",    ["#C4C8CC","#E9E4D8","#8C8478","#45423C","#A39A88","#4A78A6"]] ]},
  { id: "09", title: "Ecology", arc: "Bloom → Decay → Regrowth", note: "Chroma as vitality: full saturation, earthen collapse, then acid-green shoots from dark soil.", phases: [
    ["Bloom",    ["#BFE3EA","#FFF2CC","#6FBF73","#2F7048","#9DBB7A","#F26CA7"]],
    ["Decay",    ["#A89F8D","#D9C79A","#7C6A48","#3E362A","#59503C","#C77E3E"]],
    ["Regrowth", ["#CFE0D8","#F2EFC9","#8FBF88","#4E6E52","#7A6350","#B7E065"]] ]},
  { id: "10", title: "Light Source", arc: "Sunlight → Firelight → Bioluminescence", note: "Same world, three illuminants — doubles as a color-temperature lesson.", phases: [
    ["Sunlight",        ["#7FBFE8","#FFF6D6","#83A868","#3F6148","#C0A277","#F0B840"]],
    ["Firelight",       ["#241A1E","#FFB347","#A14E2C","#120B0E","#59332A","#FFE08A"]],
    ["Bioluminescence", ["#0B1626","#5FE8D2","#1E3A4C","#04080F","#16283A","#B455E8"]] ]},
];

/* ── client-side ASE writer (ASEF v1.0, RGB, normal swatches) ── */
function buildASE(triad) {
  const bytes = [];
  const u16 = (v) => bytes.push((v >> 8) & 255, v & 255);
  const u32 = (v) => bytes.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255);
  const f32 = (v) => { const b = new Uint8Array(new Float32Array([v]).buffer); bytes.push(b[3], b[2], b[1], b[0]); };
  const str = (s) => { u16(s.length + 1); for (const c of s) u16(c.charCodeAt(0)); u16(0); };
  const measure = (s) => 2 + (s.length + 1) * 2;

  bytes.push(65, 83, 69, 70); u16(1); u16(0);
  const blocks = triad.phases.length * (2 + ROLES.length);
  u32(blocks);

  triad.phases.forEach(([pname, hexes]) => {
    u16(0xc001); u32(measure(pname)); str(pname);
    hexes.forEach((hex, i) => {
      const name = `${String(i + 1).padStart(2, "0")} ${ROLES[i]} ${hex.toUpperCase()}`;
      u16(0x0001); u32(measure(name) + 4 + 12 + 2); str(name);
      bytes.push(82, 71, 66, 32); // "RGB "
      [1, 3, 5].forEach((p) => f32(parseInt(hex.slice(p, p + 2), 16) / 255));
      u16(2);
    });
    u16(0xc002); u32(0);
  });
  return new Uint8Array(bytes);
}

function downloadASE(triad) {
  const blob = new Blob([buildASE(triad)], { type: "application/octet-stream" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${triad.id}-${triad.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ase`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const isDark = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
};

function Swatch({ hex, role, onCopy, copied }) {
  return (
    <button
      onClick={() => onCopy(hex)}
      title={`${role} — click to copy ${hex}`}
      style={{
        flex: 1, minWidth: 0, height: 92, background: hex, border: "none",
        cursor: "pointer", position: "relative", padding: 0,
        outlineOffset: -3, transition: "transform 120ms ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
    >
      <span style={{
        position: "absolute", left: 6, bottom: 5, fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9.5, letterSpacing: "0.04em",
        color: isDark(hex) ? "rgba(245,239,225,0.92)" : "rgba(43,32,28,0.85)",
      }}>
        {copied ? "copied" : hex.toUpperCase()}
      </span>
      <span style={{
        position: "absolute", left: 6, top: 5, fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em",
        color: isDark(hex) ? "rgba(245,239,225,0.6)" : "rgba(43,32,28,0.55)",
      }}>
        {role}
      </span>
    </button>
  );
}

export default function TriadPalettes() {
  const [copied, setCopied] = useState(null);
  const [open, setOpen] = useState(null);

  const copy = (hex) => {
    navigator.clipboard?.writeText(hex.toUpperCase());
    setCopied(hex);
    setTimeout(() => setCopied(null), 900);
  };

  return (
    <div style={{ background: CREAM, minHeight: "100vh", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible { outline: 2px solid ${OX}; }
      `}</style>

      {/* header */}
      <header style={{ borderBottom: `3px solid ${OX}`, padding: "36px 28px 22px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: OX }}>
          pLAtform · digital painting · assignment 03
        </div>
        <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 600, fontSize: "clamp(34px, 5vw, 54px)", margin: "10px 0 6px", lineHeight: 1.02 }}>
          Three Phases, One World
        </h1>
        <p style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 18, margin: 0, maxWidth: 640, color: "#5a4a42" }}>
          Ten palette triads for the landscape composition series. Each phase carries six roles —
          click any chip to copy its hex, or export the triad as a Photoshop-ready .ase file.
        </p>
        <div style={{ display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a6a60" }}>
          {ROLES.map((r, i) => (
            <span key={r}>{String(i + 1).padStart(2, "0")} {r}</span>
          ))}
        </div>
      </header>

      {/* triads */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 28px 80px" }}>
        {TRIADS.map((t) => (
          <section key={t.id} style={{ marginBottom: 42 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 4 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: OX }}>{t.id}</span>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 600, fontSize: 27, margin: 0 }}>{t.title}</h2>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#7a6a60" }}>{t.arc}</span>
              <span style={{ flex: 1 }} />
              <button
                onClick={() => downloadASE(t)}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.08em",
                  background: "transparent", color: OX, border: `1.5px solid ${OX}`,
                  padding: "5px 12px", cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = OX; e.currentTarget.style.color = CREAM; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = OX; }}
              >
                ↓ .ase
              </button>
              <button
                onClick={() => setOpen(open === t.id ? null : t.id)}
                aria-expanded={open === t.id}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                  background: "transparent", color: "#7a6a60", border: "1.5px solid #cbbfa8",
                  padding: "5px 12px", cursor: "pointer",
                }}
              >
                {open === t.id ? "hide note" : "note"}
              </button>
            </div>

            {open === t.id && (
              <p style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 16, color: "#5a4a42", margin: "6px 0 12px", maxWidth: 620 }}>
                {t.note}
              </p>
            )}

            {t.phases.map(([pname, hexes]) => (
              <div key={pname} style={{ display: "flex", alignItems: "stretch", marginTop: 10, border: "1.5px solid #d9cdb4", background: "#fbf7ec" }}>
                <div style={{
                  width: 118, flexShrink: 0, display: "flex", alignItems: "center",
                  padding: "0 10px", fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11, letterSpacing: "0.06em", borderRight: "1.5px solid #d9cdb4",
                }}>
                  {pname}
                </div>
                <div style={{ display: "flex", flex: 1 }}>
                  {hexes.map((hex, i) => (
                    <Swatch key={hex + i} hex={hex} role={ROLES[i]} onCopy={copy} copied={copied === hex} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        <footer style={{ borderTop: `3px solid ${OX}`, paddingTop: 14, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a6a60" }}>
          load .ase in photoshop: window → swatches → import swatches · 11"×17" @ 300 dpi
        </footer>
      </main>
    </div>
  );
}

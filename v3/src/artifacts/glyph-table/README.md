# Glyph Table — Figma Plugin

Draw an alphabet, export an installable `.ttf`. Two workflows in one plugin:

**Draw tab** — freehand canvas inside the plugin with proper type metrics
(ascender / cap / x-height / baseline / descender), adjustable nib and
per-glyph advance width, live proof line, undo, autosave to Figma's
clientStorage, and a "Place in Figma" button that drops any glyph onto the
canvas as a vector node. Exports TTF plus an editable JSON source file.

**From frames tab** — the Figma-native compiler. Draw each letter with the
pen tool inside a frame named after its character (`A`, `a`, `7`, or
aliases: `space`, `period`, `comma`, `colon`, `semicolon`, `slash`,
`quote`, `dquote`, `hyphen`, `question`, `exclaim`). Hit **Scan this page**,
review the previews, **Compile .ttf**. Curves come through as true
quadratic béziers — no faceting. **Generate template frames** lays out 62
ready frames with locked metric guides.

## Install (development)

1. Figma → Plugins → Development → **Import plugin from manifest…**
2. Pick `manifest.json` in this folder. Done — `code.js` and `ui.html`
   are prebuilt, no build step needed.

## Frame conventions (compiler)

- Frame **top edge = ascender (800)**, **bottom edge = descender (−200)**;
  the baseline sits 80% down the frame. Template frames are 300×500 px.
- Frame **width = advance width** (spacing). Widen the frame to add
  letter spacing.
- **Locked layers are ignored** — that's how the template's guide lines
  stay out of the font.
- Both fill geometry and stroke geometry are collected, so pen-tool
  strokes work without flattening.
- Counters (the holes in o, e, a…) rely on opposite winding. Figma's
  boolean subtract or drawing the inner shape in the opposite direction
  both work; if a counter fills in, reverse the inner path or use
  Subtract.

## Rebuild the UI (optional)

```
npm install
node build.mjs
```

Source lives in `src/ui.jsx`. The main thread (`code.js`) is plain JS,
no build required.

## Metrics baked into the exporter

1000 units/em · ascender 800 · descender −200 · cap 700 · x-height 500.
Change the constants at the top of `src/ui.jsx` and rebuild to alter them.

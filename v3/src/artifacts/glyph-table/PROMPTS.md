# IDE-Ready Prompts

Paste into Claude Code / Cursor from the project root. Each is scoped to
this codebase's actual structure.

## Add kerning pairs
"In src/ui.jsx, add a kerning editor to the Draw tab: a pair input (e.g.
'AV') and a value slider that stores pairs in the glyphs state as a
`kerning` map. Extend buildTTF to emit a `kern` table (format 0) from
that map, and apply kerning offsets in the proof-line layout. Rebuild
with node build.mjs."

## OTF/WOFF2 export
"Add a WOFF2 export option next to Export .ttf in src/ui.jsx. Bundle the
wawoff2 wasm encoder via esbuild (update build.mjs to inline the wasm as
base64), feed it the Uint8Array from buildTTF, and download as .woff2."

## Selection-scoped scan
"In code.js, extend scanPage so that when figma.currentPage.selection is
non-empty, only selected frames (and their descendants) are scanned.
Update the From-frames tab copy in src/ui.jsx to say 'Scan selection'
when a selection exists — the UI can ask via a new 'selection-state'
message on tab open."

## Diacritics row
"In src/ui.jsx, add a ROWS entry for Latin-1 accented characters
(áéíóúàèìòùäëïöüñç and uppercase forms), and extend NAME_ALIASES in
code.js so frames can be named 'aacute', 'ntilde', etc. Verify cmap
segments still build correctly for the non-contiguous codepoints."

## Variable nib pressure
"In src/ui.jsx, capture e.pressure in onMove and store per-point widths
in each stroke. Update strokeToContours to build a variable-width
envelope (per-segment radius from the two endpoint pressures) instead of
a constant-radius outline, and update GlyphArt to preview it with a
filled path rather than a stroked polyline."

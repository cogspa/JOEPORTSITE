# IDE-Ready Prompt — COGSPA Timeline

Paste into Claude Code / Cursor from inside this folder to extend the site.

---

You are working on `index.html`, a single-file interactive timeline of the COGSPA story (see README.md). Design system: ice `#E6F1F2` background, ink `#0B0B0C`, magenta `#C13B87` = "Idea" strand, orange `#F04E23` = "Ops" strand, Archivo (wght/wdth variable) display + body, Space Mono utility. Signature elements: fixed year HUD bound to `data-year` attributes via IntersectionObserver, and a full-bleed dark nebula interlude at `#era-name`. Respect `prefers-reduced-motion` for anything you add.

Conventions:
- Events are `<article class="entry" data-year="YYYY">` inside `.entries`; add class `ops` for the orange strand. `.when` holds the date + strand tag, `h3` the headline, `a.ref` pill links for sources, `figure.artifact` for scanned/embedded artifacts (paper card, hard shadow).
- Eras are `<section class="era" id="era-...">` with a matching link in `nav.eras`.
- No frameworks, no build step; keep everything in index.html + /assets.

Possible next tasks (pick one or take direction from me):
1. Add a strand filter: toggle buttons in the era nav that dim non-matching `.entry` cards (Idea / Ops / All), persisting choice in a JS variable only.
2. Add lightbox behavior to `figure.artifact` images (click to view full-size overlay, Esc/click to close, focus-trapped, reduced-motion safe).
3. Add a horizontal mini-map: a thin fixed bar at top showing era segments proportional to year spans, with a progress cursor synced to scroll.
4. Add deep-linkable entries: give each `.entry` an id and a small `#` anchor button that copies the URL.

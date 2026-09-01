# COGSPA — A 35-Year Timeline of Cognitive Space

Interactive single-page timeline of the COGSPA story (1984 → 2026), built from Joe Micallef's essay.

## Stack
Vanilla HTML/CSS/JS. No build step, no dependencies beyond Google Fonts (Archivo + Space Mono).

## Structure
```
index.html                     # the whole site
assets/
  cogspa-nebula.png            # hero wordmark + naming-interlude background
  midland-reporter-telegram-1991.png   # 1991 AP article scan (artifact figure)
```

## Deploy
- **Netlify:** drag the folder onto app.netlify.com/drop — done.
- **Anywhere else:** it's static; serve the folder.

## Features
- Fixed "YOU ARE IN <year>" HUD (Space Mono, blend-difference so it reads on white and dark) driven by IntersectionObserver over `data-year` attributes
- White portfolio-style page (jmicallefport.com look) with black utility bars, red JOE MICALLEF chip, and a sticky Artifact-Playground-style colored era ledger for navigation; full-bleed dark nebula interlude at the naming moment
- Two color-coded strands as card chips: magenta = Cognitive Space (idea), orange = Operations; entries styled as playground cards (rounded, bordered, soft shadow, black ▷ link buttons)
- Era ledger with scroll-active underline; cross-links between the 1984 Last Starfighter entry and the 2008 Ken Dozier entry
- Collapsible "The term in the literature, 1975–1992" citation panel (8 sightings, ending on Nilan's 1992 VR paper)
- Reference-anchor link pills (Adobe, Pixar, IEEE, USC, Springer)
- Scroll-reveal entries; `prefers-reduced-motion` fully respected; visible keyboard focus

## Editing
- Add an event: copy any `<article class="entry">` block, set `data-year`, add class `ops` for the orange strand (omit for magenta).
- Add an era: copy a `<section class="era">` and add a link to `nav.eras`.
- Colors/typography: everything derives from the `:root` custom properties.

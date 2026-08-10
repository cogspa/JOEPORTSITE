// ──────────────────────────────────────────────────────────────────
//  WEEK 04 TOPICS DATA SOURCE
//  Adapted from PCC DMA 12 corpus + new framing.
// ──────────────────────────────────────────────────────────────────

export const TOPIC_DETAILS = {
  'designing-for-platforms': {
    title: 'Designing for Social, Web, and Print',
    pccSources: ['Resolution and Quality', 'Common File Formats', 'Additive and Subtractive Color'],
    sourceNote: 'PCC teaches the underlying mechanics (RGB vs CMYK, DPI, file formats); the deliverable-focused framing is new for this class.',
    sections: [
      {
        heading: 'The three destinations',
        body: `Every digital artwork has at least one destination. Most professional work has three: print, web, and social. Each destination has different rules — resolution, color space, file format, aspect ratio — and an artwork that ignores those rules will look broken when it lands.

The same image that prints beautifully on a 24×36" gallery poster will look fuzzy on a phone screen if you don't resize it for web. The same image that pops on an iPhone will print muddy if you don't convert the color space.

Designing for screen-based media means designing the artwork once, then preparing it three times — once for each destination.`,
      },
      {
        heading: 'Resolution — pixels vs inches',
        body: `Resolution is the degree of detail in an image, measured in pixels per inch (PPI). Higher resolution = more pixels per inch = better print quality.

The rule:
• Web and social: 72 PPI is standard. Browsers and apps don't display higher densities, so anything above 72 wastes file size.
• Print: 200–300 PPI minimum. Anything lower will look pixelated when ink hits paper.

A monitor displays images at roughly 72 PPI. To find the on-screen display size of an image, divide horizontal and vertical pixels by 72. A 2272 × 1704 photo displays at roughly 31.6 × 23.7 inches on screen — but on paper at 300 PPI, that same photo prints at 7.6 × 5.7 inches.

This is why the same file behaves so differently in different contexts. Pixels are constant; the inches change based on output density.`,
      },
      {
        heading: 'Color space — RGB vs CMYK',
        body: `Additive color (RGB) is the color system for screens. Red, green, blue light wavelengths combine to produce white. When designing for web, video, or social — you're working in RGB. Objects that emit light (screens, light bulbs, the sun) use additive color.

Subtractive color (CMYK) is the color system for print. Cyan, magenta, yellow, and black inks absorb wavelengths from the light hitting the paper. When all three combine, you get black (the "K" stands for "key"). When designing for print, you're working in CMYK.

The practical consequence: vivid neon colors that look brilliant on screen often print muddy or muted because CMYK inks can't reproduce the full RGB color space. Test print colors before committing to them in a print-destined design.

In Photoshop, switch between modes via Image > Mode > RGB Color / CMYK Color. Convert to CMYK only when you're ready to deliver to print — never as your working space, because every conversion clips color data.`,
      },
      {
        heading: 'Format and aspect ratio per platform',
        body: `Instagram feed post: 1080 × 1080 (square) or 1080 × 1350 (portrait 4:5)
Instagram story: 1080 × 1920 (vertical 9:16)
Twitter / X post: 1200 × 675 (landscape 16:9)
Facebook post: 1200 × 630
LinkedIn post: 1200 × 627
Standard web header: 1920 × 1080
Print poster (small): 11 × 17 inches at 300 DPI = 3300 × 5100 px
Print poster (large): 24 × 36 inches at 300 DPI = 7200 × 10800 px

The aspect ratios don't just change file dimensions — they change composition. A landscape image cropped to a square loses the edges. A square cropped to a story loses the sides. Designing for multiple platforms means planning the composition so the focal point survives every crop.`,
      },
      {
        heading: 'File formats — what to deliver in',
        body: `Working formats (what you save while building):
• PSD — Photoshop's native format. Keeps layers, vectors, masks intact. Always save in this.
• AI — Illustrator's native. Same logic for vector work.
• TIFF — raster with optional layers. Common in print pipelines.

Delivery formats:
• PNG — lossless, supports transparency. Use for: web graphics, social posts with text, logos.
• JPEG — lossy compression, no transparency, smaller files. Use for: photographs on web, social posts that need fast loading.
• GIF — limited to 256 colors. Use for: animated short loops only.
• SVG — vector format. Use for: logos, icons, anything that needs to scale to billboard size from a 12 KB file.
• PDF — preserves vectors and layers. Use for: print delivery, portfolios, anything a client needs to print.

The mistake to avoid: delivering JPEGs of work that has transparency. Transparency becomes white in JPEG, ruining the design.`,
      },
    ],
  },

  'cropping-and-framing': {
    title: 'Cropping & Framing',
    pccSources: ['Principles of Design', 'Principles of Design-2', 'Balance', 'Examples of Emotive Power of Value'],
    sourceNote: 'PCC teaches composition principles broadly; cropping as a specific decision-making tool is new framing here.',
    sections: [
      {
        heading: 'Cropping is a composition decision, not a sizing decision',
        body: `A crop isn't just choosing what fits in the frame. It's choosing what the image is about.

When you crop tight on a face, the image becomes about emotion. When you crop wide on the same person against an environment, the image becomes about context. Same source photo, two completely different statements.

Designing for multiple formats means making this choice deliberately three or four times for the same artwork — each crop deciding which version of the story that platform tells.`,
      },
      {
        heading: 'The principles of design that drive crop choices',
        body: `Cropping decisions are governed by the same design principles that govern any composition:

• Balance — the visual weight of elements distributed across the frame
• Contrast — areas of light against dark, busy against quiet
• Emphasis — what the eye lands on first
• Movement — the implied path the eye travels through the frame
• Pattern and rhythm — repetition that holds the image together
• Unity and variety — how separate parts feel like one image
• Direction — where the energy of the frame points

When you crop, you're choosing how to deliver each of these. A tight crop emphasizes one focal point; a wide crop allows multiple. A symmetric crop produces balance; an asymmetric one produces tension.

These are guidelines, not rigid rules. They're rooted in physiological, social, and cultural influences. They tell you why a crop feels right or wrong, but the decision is still yours.`,
      },
      {
        heading: 'Balance through cropping',
        body: `Balance is the visual weight relationship between elements in a composition. It creates the feeling that the image is stable, that it "feels right." Imbalance creates discomfort — sometimes intentional, often not.

Three types of balance to choose from:

• Symmetric — equal visual weight on both sides of a center axis. Calm, formal, monumental. Crop tight on architectural details, faces front-on, or mirrored scenes.

• Asymmetric — different elements balance through contrast of size, value, or position. A small bright object can balance a large dark one. More dynamic, more cinematic, more common in screen-based composition.

• Radial — elements distributed around a central point. Useful for square social formats — the eye finds the center and circulates outward.

For social media (square or portrait crops), asymmetric balance reads as more contemporary and stops the scroll. Symmetric crops can feel static on small screens.`,
      },
      {
        heading: 'Rule-of-thirds and where to place the subject',
        body: `Divide the frame into nine equal parts with two horizontal lines and two vertical lines. The four points where these lines intersect are the "strong" points — where placing your subject creates more dynamic compositions than dead center.

The horizon line in landscape work typically falls on the lower third (when the sky is the subject) or the upper third (when the ground is). Putting it dead center splits the image into two equal halves and usually weakens it.

For portraits, place the subject's eye on an upper-third intersection. The composition reads as intentional rather than centered.

The rule of thirds is a starting point — masters break it deliberately for effect. But knowing the default lets you know when you're breaking it.`,
      },
      {
        heading: 'The cropping workflow in Photoshop',
        body: `1. Duplicate the working file. Always crop a copy, never the master. Master file stays at full resolution with all layers.

2. Crop tool (C). Set the aspect ratio in the top options bar — "1:1 (Square)" for Instagram feed, "4:5" for Instagram portrait, "9:16" for stories, "16:9" for landscape video and Twitter.

3. CRITICAL: Uncheck "Delete Cropped Pixels" in the options bar. This preserves the cropped-out pixels in case you need to re-crop later. With Delete Cropped Pixels checked, the cropped pixels are gone forever.

4. Drag the crop box. Use the rule-of-thirds grid that appears inside the box to position the focal point.

5. Press Enter to commit. The image is now cropped, but the original pixels still exist if Delete Cropped Pixels was off.

6. Save as a new file with a descriptive name: artwork_v1_instagram_square.psd, artwork_v1_twitter_landscape.psd.`,
      },
      {
        heading: 'Designing for the crop in advance',
        body: `If you know your artwork is going to multiple platforms, plan the composition to survive every crop.

The "safe zone" approach: identify a rectangle in the center of your composition where the most important elements (focal point, key text, brand mark) live. Make sure this rectangle is small enough to fit inside even the most aggressive crop you'll need (usually 1:1 square from a 16:9 landscape).

Everything outside the safe zone is "atmospheric" — texture, supporting detail, environmental context. Those elements will get cropped on tighter formats, but the core message survives.

This is how a single artwork becomes a campaign that runs across print poster, web banner, and Instagram feed without redesigning from scratch each time.`,
      },
    ],
  },

  'scalable-artwork': {
    title: 'Scalable Artwork',
    pccSources: ['Vectors vs Pixels', 'Beziers', 'Resolution and Quality', 'Resolution Revisted'],
    sections: [
      {
        heading: 'Vector vs raster — the fundamental distinction',
        body: `Two kinds of digital images:

Raster (pixel-based) — a grid of colored pixels. Resolution-dependent. Scale up too far, you see the pixels. Photoshop, Procreate, GIMP work primarily in raster.

Vector — mathematical curves and shapes defined by anchor points and equations. Resolution-independent. Scale up to billboard size, the math redraws the lines perfectly sharp. Illustrator, Figma, Inkscape work primarily in vector.

For scalable artwork — anything that needs to live at multiple sizes from app icon to billboard — vector is the foundation. Logos, icons, type-driven designs, geometric illustrations should all be built in vector first.`,
      },
      {
        heading: 'When to use vector, when to use raster',
        body: `Use vector for:
• Logos and brand marks
• Icons and UI elements
• Geometric or hard-edged illustrations
• Typography in design layouts
• Anything that needs to scale across multiple sizes
• Anything that needs precision and sharp edges

Use raster for:
• Photographs and photo-collage
• Painted illustrations
• Texture-rich digital paintings
• Anything with soft edges, gradients, or organic blending
• Final delivery exports (every vector eventually gets exported to a raster format like PNG for web or social)

Many professional projects combine both: a vector logo placed over a raster photograph, both delivered as a single PNG.`,
      },
      {
        heading: 'Bezier curves — the math behind vector',
        body: `Vector graphics are built from Bezier curves, named after Pierre Bézier (1910–1999), the French engineer at Renault who developed the math behind early CAD systems in the 1960s. Bezier curves are also called parametric curves because they're defined by mathematical parameters that can be adjusted via control points.

When you adjust a vector's anchor points in Illustrator or Figma, you're modifying the parameters of a Bezier equation. The curve recalculates and redraws at any scale.

Beziers have practical advantages:
• Easy to compute
• Maintain shape even when control points are reduced
• Easy to rotate, translate, and transform
• Scale infinitely without quality loss

Pierre Bezier's UNISURF CAD-CAM system was used at Renault from 1933 to 1975. The Citroën DS 19 — introduced at the 1955 Paris Motor Show — was designed using a CAD system with Bezier curves, and received 743 orders within the first 15 minutes of the show because of its distinctive flowing forms. Vector math has been shaping how things look in the world for seventy years.

Adobe's PostScript language, which drove the desktop publishing revolution, also runs on Bezier curves. That's why type at any size stays sharp on a PostScript printer.`,
      },
      {
        heading: 'Vector tools in Photoshop',
        body: `Photoshop is mostly raster, but it includes vector tools. Use them when an element needs to scale or stay sharp:

• Pen Tool (P) — draws paths point by point
• Shape Tool (U) — creates rectangles, ellipses, polygons, custom shapes as vectors
• Type Tool (T) — type is vector by default in Photoshop
• Vector masks — sharper-edged alternatives to raster layer masks

For each vector tool, the top options bar lets you choose: Shape (vector shape layer), Path (vector path only, no fill), or Pixels (rasterized output).

If you save a Photoshop document as .psd or .pdf, the vector information stays intact. If you save as .jpg or .png, everything rasterizes at the file's current resolution.`,
      },
      {
        heading: 'Rasterizing — the one-way door',
        body: `Rasterizing is the process of converting vector information into pixels. Right-click on a vector layer in Photoshop and choose "Rasterize Layer" — and that vector is now permanently pixels at the current document resolution.

This is a one-way conversion. You can't un-rasterize. The vector math is gone.

Rasterize only when:
• You need to apply a raster-only filter (most Photoshop filters)
• You need to paint into the layer with brushes
• You're finalizing for export to a fixed-resolution format

Don't rasterize:
• While the design is still being iterated
• If the element might need to scale later
• If you're going to deliver the file as PDF, AI, or SVG

The professional habit: keep everything vector for as long as possible. Rasterize at the very end, just before final export.`,
      },
      {
        heading: 'Exporting vector for scalable web delivery',
        body: `SVG (Scalable Vector Graphics) is the web's native vector format. An SVG logo file can be a few kilobytes and still scale crisply from favicon size to billboard size.

Export from Illustrator or Figma as SVG for any logo or icon destined for web. The browser renders it at whatever size the CSS asks for, with no quality loss.

For print delivery, export as PDF — preserves vectors, embeds fonts, opens in any pro-print workflow.

For social media, export as PNG at the platform's recommended pixel size. Yes, you're rasterizing for export — but the source file stays vector, so you can re-export at any size for any future platform without redrawing.`,
      },
    ],
  },

  'exporting-multiple-formats': {
    title: 'Exporting for Multiple Formats',
    pccSources: ['Common File Formats'],
    sections: [
      {
        heading: 'The export step is part of the design',
        body: `The most common mistake in cross-platform design: spending six hours building an artwork and twenty seconds exporting it. The export step decides how the work actually lands. Sloppy exports kill good design.

Plan the export at the start of the project, not the end. Knowing your destinations changes the canvas size, color space, layer organization, and whether you build in vector or raster.`,
      },
      {
        heading: 'Working formats — what you build in',
        body: `These formats preserve everything — layers, vectors, masks, smart objects, editability. Save in these while you work:

• PSD (Photoshop) — the standard for pixel-based work. Layers, vectors, adjustment layers, and masks all intact. Maximum size 30,000 × 30,000 pixels.

• PSB (Photoshop Large Document) — for files larger than 30,000 px on a side. Maximum 300,000 × 300,000 px. Can be exported to TIFF for software compatibility.

• AI (Illustrator) — Illustrator's native format. Vector-first, with raster support.

• PDF — maintains vector layers. Use when sharing a working file with someone who doesn't have Photoshop or Illustrator. Both Photoshop and Illustrator can save layered PDFs.

• TIFF — raster format that supports layers and vectors. Common in print pipelines.

Always save in a working format first. Always.`,
      },
      {
        heading: 'Web delivery formats',
        body: `JPEG — lossy compression, smaller files. Images lose detail with this format because compression algorithms throw away data that's "less visually important." Use for:
• Photographs on websites
• Social media photos
• Any image where transparency isn't needed and file size matters

JPEG settings to know: quality 60–80 hits the sweet spot of file size vs visible quality. Above 90 the file gets large without much visible improvement. Below 50 compression artifacts start showing.

PNG — lossless, supports transparency. Use for:
• Logos and brand marks on websites
• Icons
• Social media posts where transparency or sharp edges matter
• Anything with text that needs to stay readable

GIF — early web format limited to 256 colors. Supports animation. Use for:
• Short looping animations
• Memes with simple color palettes
• Almost nothing else in 2026 — for animation, video formats or animated PNG (APNG) are better quality

SVG — vector for the web. Use for:
• Logos
• Icons
• Anything that needs to scale crisply on retina displays without serving multiple file sizes`,
      },
      {
        heading: 'Print delivery formats',
        body: `For print, the rules are different. Color space is CMYK. Resolution is 300 DPI minimum. File formats need to preserve everything for the printer to process.

PDF (print-ready) — the universal print delivery format. Preserves vectors, embeds fonts, supports CMYK, includes bleed and crop marks. Export from Illustrator or InDesign using "PDF/X-1a" or "PDF/X-4" preset.

TIFF — for raster-heavy print work. Photographers and illustrators often deliver in TIFF because it preserves layers and supports CMYK.

EPS — older but still used by some print houses. A PostScript format primarily composed of vectors.

Don't deliver to print as JPEG. Don't deliver to print as PNG. Both work technically, but neither supports the color and metadata that pro print needs.`,
      },
      {
        heading: "Photoshop's Export As workflow",
        body: `For modern multi-format export from Photoshop:

File > Export > Export As (Cmd/Ctrl + Shift + Alt + W)

The dialog lets you:
• Choose format (PNG, JPEG, GIF, SVG)
• Set scale (1x, 2x, 3x — for high-density displays)
• Set quality (for JPEG)
• Preview file size before exporting

For social media batch exports: File > Export > Save for Web (Legacy) is still useful for fine-tuning JPEG and PNG settings.

For PDF: File > Save As > Photoshop PDF.

For SVG: Photoshop's SVG export is limited. Build SVGs in Illustrator instead — it's the right tool.`,
      },
      {
        heading: 'A delivery checklist for every project',
        body: `Before sending final files to a client, social platform, or print house:

✓ Right resolution for the destination (72 PPI web/social, 300 PPI print)
✓ Right color space (RGB for screen, CMYK for print)
✓ Right aspect ratio for the platform
✓ Right file format (PNG/JPEG/PDF/SVG)
✓ Filename is descriptive (project_v3_instagram_square.png — not Untitled-12.png)
✓ Working file is saved as PSD/AI before the export
✓ Layers are organized and labeled in the working file
✓ Transparency works correctly (or is intentionally absent)
✓ Text is readable at the smallest size the image will appear

The checklist takes two minutes. Skipping it costs hours.`,
      },
    ],
  },

  'illustrator-intro': {
    title: 'Adobe Illustrator — Introduction',
    pccSources: ['Vectors vs Pixels', 'Beziers', 'Shapes and Symbols', 'Boolean Operations', 'Video: Intro to the Pen Tool'],
    sections: [
      {
        heading: 'When to reach for Illustrator',
        body: `Illustrator is the right tool whenever the work needs to scale, stay sharp, or be edited as math instead of pixels:

• Logos and brand identity
• Icons
• Type-driven posters and layouts
• Geometric illustrations
• Diagrams, charts, and infographics
• Anything destined for both print and digital at multiple sizes

For painterly work, photo-based collage, or anything with soft organic edges, stay in Photoshop. The two apps are designed to complement each other, not compete.`,
      },
      {
        heading: 'The interface in five panels',
        body: `Five panels do most of the work in Illustrator:

• Tools panel (left side) — selection, drawing, and editing tools
• Control bar (top, contextual) — options change based on what's selected
• Color and Swatches panels — for fills and strokes
• Layers panel — same logic as Photoshop, but with sublayers for each object
• Properties panel — context-sensitive shortcuts to most-used controls

Cmd/Ctrl + Shift + D toggles the document background between transparent and white. F or Cmd/Ctrl + Shift + F toggles between Normal mode and Presentation mode. Tab hides all panels for a clean canvas.`,
      },
      {
        heading: 'The Pen tool — the heart of Illustrator',
        body: `The Pen tool (P) is how you draw custom shapes in Illustrator. It works in Photoshop and Figma the same way.

Click once: creates an anchor point with a straight segment from the previous point.
Click and drag: creates an anchor point with a curve. The drag direction and length determine the curve's shape.
Click on an existing point: removes it.
Hold Option/Alt while dragging a handle: breaks the symmetry of a Bezier curve handle, useful for tight transitions.

The Pen tool has a learning curve. Most beginners hate it for a week, then can't work without it. Practice tracing existing shapes — letters, leaves, simple logos — to build muscle memory.

To close a path, click back on the starting anchor point. To leave a path open (for a line rather than a shape), press Escape or switch tools.`,
      },
      {
        heading: 'Shapes, symbols, and the shape tools',
        body: `Illustrator has predefined shape tools — Rectangle (M), Ellipse (L), Polygon, Star — and each can be configured before drawing.

Beyond basic shapes, you can build a personal library by collecting interesting shapes from photographs and converting them to vectors via Image Trace. Save them as Symbols (Window > Symbols), and you can place them across multiple documents from one source.

The Symbol logic: edit the master symbol, and every instance of it across the document updates. Same principle as Smart Objects in Photoshop.

Photoshop has predefined shapes in the Shape Panel and Shape Tool, available as Path (vector pen paths), Shape (vector shape layers), or Pixels. Same logic, different interface — and Photoshop's vector capabilities are weaker than Illustrator's. For real vector work, use Illustrator.`,
      },
      {
        heading: 'Boolean operations — combining shapes',
        body: `Boolean operations are how you combine simple shapes into complex ones. The term "boolean" comes from computer programming, where values are either "true" or "false." Illustrator and Figma use boolean values like "and," "or," and "not" to describe how shapes combine.

Found in the Pathfinder panel:

• Union — the combined area of all shapes
• Subtract — top shape removed from bottom shape
• Intersect — only the overlapping area remains
• Difference — outer areas remain, intersection is removed

Build complex icons by starting with simple shapes and combining them. A coffee cup icon = rectangle (body) + ellipse (saucer) + path (handle) + subtract (steam holes). Five clicks, infinite scale.

In Photoshop, the equivalent works through selection shortcuts:
• Shift + selection — adds to the current selection (union)
• Option/Alt + selection — subtracts from the current selection
• Shift + Option/Alt + selection — intersect the two selections`,
      },
      {
        heading: 'Image Trace — turning raster into vector',
        body: `Illustrator's Image Trace converts photographs and sketches into editable vector artwork.

Workflow:
1. Place a raster image (File > Place) or paste it in (Cmd/Ctrl + V).
2. Select the image with the Selection tool (V).
3. In the Control bar, click "Image Trace" — Illustrator processes the image into vectors.
4. Click "Expand" — converts the trace into editable vector paths.

The "Line Art" preset works well for high-contrast sketches and silhouettes. The "Color" presets handle photographs (with varying quality).

After expanding, the result is fully editable vector artwork — you can pull individual paths, recolor them, scale them, combine them with Boolean operations. This is the bridge between sketchbook drawings and production-ready vector graphics.

If you don't have Illustrator, Figma has a similar plugin called Image Tracer (https://www.figma.com/community/plugin/735707089415755407/Image-tracer).`,
      },
    ],
  },

  'indesign-intro': {
    title: 'Adobe InDesign — Portfolio Basics',
    pccSources: [],
    sourceNote: 'InDesign is not covered in the PCC corpus. This content is written for this class.',
    sections: [
      {
        heading: 'What InDesign is for',
        body: `InDesign is Adobe's layout app — built for multi-page documents, typography-heavy work, and print production. Photoshop is for painting and image editing. Illustrator is for vector illustration. InDesign is for putting it all together on a page.

For creative professionals, InDesign is where the portfolio lives. It's where a magazine spread, a print catalog, a book interior, or a presentation deck gets built. If the deliverable is more than three pages, InDesign is probably the right tool.`,
      },
      {
        heading: 'When to use InDesign vs Photoshop vs Illustrator',
        body: `Use Photoshop for:
• Photo editing
• Painting
• Texture work
• Single-image compositions

Use Illustrator for:
• Logos and icons
• Vector illustrations
• Single-page posters or flyers
• Anything that needs to scale infinitely

Use InDesign for:
• Multi-page documents (portfolios, books, magazines)
• Documents with running text and multiple images placed across pages
• Print production with bleed, crop marks, and color separations
• Documents that need consistent type styling and layout grids across pages

A portfolio PDF combining your paintings, logos, and writing samples should be built in InDesign — not Photoshop. Photoshop will choke; InDesign was built for it.`,
      },
      {
        heading: 'The InDesign mental model — frames and content',
        body: `Everything in InDesign lives inside a frame. There are two kinds:

• Text frames — hold text
• Graphic frames — hold images (linked, not embedded by default)

You draw frames first, then fill them with content. This is different from Photoshop and Illustrator, where you can drop content directly onto the canvas.

The advantage: layout stays stable when you replace content. Swap one image for another, the frame stays put. Swap one block of text for another, the styling stays consistent. This is why magazines look polished — the frames are the structure, the content fills them.`,
      },
      {
        heading: 'Setting up a portfolio document',
        body: `Basic setup for a digital portfolio PDF:

1. File > New Document.
2. Intent: Print (for high-DPI portfolio PDF) or Web (for screen-only viewing).
3. Page size: Letter (US) or A4, or custom — 11 × 8.5" landscape works well for screen portfolios.
4. Pages: start with 8–12. You can add more.
5. Facing Pages: ON for traditional book-like spreads, OFF for single-page screen viewing.
6. Margins: 0.5" all around for portfolio work.
7. Bleed: 0.125" if going to print, 0 if screen-only.

Click OK. You now have a multi-page document ready for layout.`,
      },
      {
        heading: 'Master pages — consistent structure across spreads',
        body: `Master pages (called "Parent Pages" in newer InDesign versions) define elements that repeat across every page — page numbers, headers, footers, grid structure.

Set them up once on the Master, and every page that uses that Master inherits the structure. Change the Master later, every page updates.

For a portfolio:
• Master A — title pages and section dividers (no page numbers)
• Master B — image-heavy spreads (small page numbers, no headers)
• Master C — case study pages with captions (page numbers, project title header)

Building masters before placing content keeps the portfolio consistent without manual repetition.`,
      },
      {
        heading: "Placing images — link, don't embed",
        body: `When you place an image in InDesign (File > Place, or Cmd/Ctrl + D), the image is linked by default — InDesign references the file on disk rather than copying it into the document.

This keeps file sizes small and lets you edit the source image in Photoshop and see the changes update in InDesign automatically.

The catch: if you move or delete the source image, InDesign loses the link. When exporting to PDF or sending the InDesign file, use File > Package — it copies all linked images and fonts into one folder so nothing breaks.

For portfolio PDFs, always Package before delivering. It's the difference between a clean handoff and a broken file.`,
      },
      {
        heading: 'Exporting a portfolio PDF',
        body: `File > Export > Adobe PDF.

For digital portfolio (email, web download):
• Preset: "Smallest File Size"
• Compression: aggressive (it's for screen viewing)
• Color: RGB
• Include hyperlinks and bookmarks if your portfolio uses them

For print portfolio (sending to a printer):
• Preset: "PDF/X-1a" or "PDF/X-4"
• Compression: minimal (preserve quality)
• Color: CMYK
• Include bleed and crop marks
• Convert all type to outlines if delivering to a printer who might not have your fonts

A well-built InDesign file exports to PDF in seconds. The hours go into the layout decisions — the typography, the spacing, the visual rhythm. That's where the portfolio either sings or falls flat.`,
      },
    ],
  },
};

export const topicList = [
  { key: 'designing-for-platforms', label: 'Designing for social, web, and print', isNew: true },
  { key: 'cropping-and-framing', label: 'Cropping & framing', isNew: true },
  { key: 'scalable-artwork', label: 'Scalable artwork', isNew: false },
  { key: 'exporting-multiple-formats', label: 'Exporting for multiple formats', isNew: false },
];

export const readingsList = [
  { key: 'illustrator-intro', label: 'Tools: Adobe Illustrator — intro (vectors, Pen tool, Boolean operations, Image Trace)', isNew: false },
  { key: 'indesign-intro', label: 'Tools: Adobe InDesign — portfolio basics (frames, masters, multi-page layout)', isNew: true },
];

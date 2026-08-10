// ──────────────────────────────────────────────────────────────────
//  WEEK 02 TOPICS DATA SOURCE
//  Extracted from PCC DMA 12 corpus.
// ──────────────────────────────────────────────────────────────────

export const TOPIC_DETAILS = {
  'brush-engine-deep-dive': {
    title: 'Brush Basics',
    pccSources: ['Painting In Photoshop', 'Brush Hardness and Size'],
    sections: [
      {
        heading: 'The brush as primary tool',
        body: `The Brush tool in Adobe Photoshop, and similar programs, is the tool used most often for digital painting and modifying masks.

The Brush tool produces soft-edged lines that Photoshop renders smoother through a process called anti-aliasing. The software substitutes partially-filled pixels along the edges of lines to produce the illusion of gradual fading. Our eyes merge the transparent pixels together, so the line looks smooth rather than hard-edged.`,
      },
      {
        heading: 'Hardness',
        body: `Brush hardness controls the falloff at the edge of a stroke.

A hard brush leaves a sharp line. A soft brush creates a smooth transition from opaque to transparent. The hardness setting is found in the Brush Palette.

For media simulation: hard brush = ink, pen, hard-edge oil knife. Soft brush = airbrush, atmospheric haze, soft graphite, gouache wash.`,
      },
      {
        heading: 'Size, opacity, flow',
        body: `Size is the diameter of the brush in pixels.

Opacity is the maximum coverage a single stroke can build to. At 50% opacity, no matter how many times you go over the same area in one stroke, you won't exceed 50% paint density.

Flow is how fast paint deposits as you move. Low flow + high opacity = build-up painting, where repeated strokes accumulate. This is the closest digital equivalent to oil or gouache.

Key combination for media work: opacity 100%, flow 15–25%, hardness 0–30%.`,
      },
      {
        heading: 'Bracket-key workflow',
        body: `Memorize these — they're the difference between a fluid painting session and one interrupted by menu-diving:

[ → decrease brush size
] → increase brush size
Shift + [ → decrease brush hardness (softer edge)
Shift + ] → increase brush hardness (sharper edge)

These four keys, combined with B (brush), E (eraser), and X (swap foreground/background colors), cover 90% of a painting session.`,
      },
      {
        heading: 'Anti-aliasing is structural, not cosmetic',
        body: `Although jagged edges are most apparent in diagonal lines, Photoshop applies anti-aliasing to brush stroke edges even in horizontal and vertical lines. The fuzzier the brush, the more semi-filled pixels used to produce the effect.

This is why a "hard" brush in Photoshop still has a 1-pixel anti-aliased edge — pure aliased painting (no anti-aliasing) is a different mode entirely, used mainly for 8-bit pixel art.`,
      },
    ],
  },

  'custom-brush-creation': {
    title: 'Custom Brush Creation',
    pccSources: ['Defining Brushes'],
    sections: [
      {
        heading: 'Why build your own brushes',
        body: `A quick way to build up shapes is to create brushes and then quickly paint those shapes onto the canvas. Custom brushes let you carry physical-media texture into a digital painting — bristle marks, paper grain, palette-knife strokes, charcoal scatter.

Once you have a personal brush library, every painting after that gets faster and more visually distinct.`,
      },
      {
        heading: 'The capture-to-preset workflow',
        body: `1. Capture or source a wide photograph with strong texture. Wider is better — you want detail.
2. Open it in Photoshop.
3. Convert to black and white: Image > Adjustments > Black and White (Cmd/Ctrl + Option + Shift + B).
4. Push contrast with Levels (Cmd/Ctrl + L) — drag the dark triangle right, the light triangle left.
5. Define a clean rectangular selection with the Marquee tool (M).
6. Edit > Define Brush Preset.
7. Name it consistently: pigment_01_bristle, surface_03_canvas, atmos_02_splatter.`,
      },
      {
        heading: 'White is transparent',
        body: `This is the single most important thing to remember about Photoshop brushes: the white parts of your source image become transparent in the brush. Black parts become the painted area.

That's why Levels work matters — you're not adjusting contrast for aesthetics, you're deciding which pixels of your source paint and which disappear.`,
      },
      {
        heading: 'Build sets, not one-offs',
        body: `Start to make multiple brushes in many categories. Build up your brush library. Categories can include:

- Surface — paper grain, canvas weave, plaster, stone
- Atmospheric — splatters, drips, mist, dust, particulate, foliage: trees, bushes, branches, leaves, and more

Just try to build up as many categories as possible.`,
      },
      {
        heading: 'Export your library',
        body: `Edit > Presets > Export/Import Presets. Save the .abr file somewhere durable — Dropbox, GitHub, a thumb drive. Brush libraries are professional capital. Don't trust them to one machine.`,
      },
    ],
  },

  'what-is-noise': {
    title: 'The Art of Noise',
    pccSources: ['The Art of Noise'],
    sections: [
      {
        heading: 'What is noise?',
        body: `In the audio world, noise is a sound, especially loud or unpleasant, that causes disturbance.`,
        imageUrl: '/visual-noise.png',
        imageCaption: 'audio noise',
      },
      {
        heading: 'Visual Noise',
        body: `In digital art, noise is a group of pixels with randomized values or colors.

William J. Mitchell states in his book, "The Reconfigured Eye," "...there are few things that look more utterly chaotic than an array of randomly colored pixels."`,
        imageUrl: '/audio-noise.png',
        imageCaption: 'visual noise',
      },
      {
        heading: 'Signal-to-Noise Ratio',
        body: `In information theory, the signal-to-noise ratio is the amount of desired information versus undesired information.

**Historical Reference:** The concept of Signal-to-Noise Ratio (SNR) has its roots in electrical engineering and was later adopted in information theory by Claude Shannon. His work laid the foundations for modern digital communication and computing.`,
      },
      {
        heading: 'Why is Noise Important?',
        body: `• **Noise can add authenticity:** In photography, film grain, a type of visual noise, is often appreciated for adding a vintage or authentic feel to the images.
• **Noise is also often the first step in generating procedural designs:**
  • **Historical Reference:** The use of Perlin Noise, developed by Ken Perlin in the 1980s, has been fundamental in computer graphics and procedural design, aiding in creating natural-looking textures and forms.
• **But too much noise can be a distraction.**`,
      },
    ],
  },

  'procedural-vs-non-procedural': {
    title: 'Noise vs. Pattern, Procedural vs. Non-procedural',
    pccSources: ['Noise vs. Pattern, Procedural vs. Non-procedural', 'The Art of Noise'],
    sections: [
      {
        heading: 'Noise vs. Pattern',
        body: `Noise can be the building block of a pattern, but you can generate patterns manually without noise. The key to making a successful pattern is that a pattern is generally predictable. I say "generally" since patterns can exhibit some sense of randomness, and often the predictability can be assumed but not proven.`,
        imageUrl: '/random-pattern.png',
        imageCaption: 'random pattern',
      },
      {
        heading: 'Noise vs. Pattern Differences',
        body: `Below are some fundamental differences between noise and patterns.

• Noise is random
• Patterns are predictable
• You can generate noise procedurally
• Patterns can be procedural and non-procedural
• You can use noise to create textures
• Noise can make digital art seem more natural
• Patterns can make digital feel constructed and artificial`,
      },
      {
        heading: 'Procedural vs. Non-Procedural',
        body: `• Procedural methods use algorithms to generate designs, textures, and art.
• The counter to procedural design are manual techniques
• Procedural methods rely more on the computer to randomly generate effects rather than painting those effects manually.`,
      },
    ],
  },

  'blend-modes-for-texture': {
    title: 'Texture Overlays via Blend Modes',
    pccSources: ['What are Blend Modes', 'The Special "8" Blend Modes', 'Keyboard Shortcuts for Blend Modes'],
    sections: [
      {
        heading: 'What blend modes are',
        body: `Blend modes are a way to do "pixel math" — combining the colors of one layer with the layers below it using different mathematical operations.

Blend modes are found in the Layers panel dropdown and in the Brush tool's control panel. Combining layers using blend modes is also known as compositing.

Compositing is the fundamental means to combine computer graphics with filmed images in visual effects. Live-action shooting for compositing is variously called "chroma key," "blue screen," or "green screen."

Blend modes are parametric — they're non-destructive. You can always revisit and readjust them without damaging the original pixels.`,
      },
      {
        heading: 'Multiply — for darkening and grain',
        body: `Multiply takes the colors of the top layer and multiplies them against the layer below. White becomes invisible; black stays black; everything in between darkens what's underneath.

Use it for:
- Pencil and charcoal layers over a toned ground
- Shadow passes
- Paper grain on a watercolor painting (the paper texture darkens the painted area)
- Ink and line work over a colored base`,
      },
      {
        heading: 'Screen — the inverse of Multiply',
        body: `Screen is Multiply's opposite. Black becomes invisible; white stays white; everything in between lightens what's underneath.

Use it for:
- Light shafts, god rays, atmospheric haze
- Specular highlights painted on a black layer
- Star fields, fireflies, lens flares
- Mist and fog overlays`,
      },
      {
        heading: 'Overlay and Soft Light — for surface texture',
        body: `Overlay combines Multiply (in dark areas) and Screen (in light areas) into one blend mode. Result: it darkens the darks and lightens the lights, preserving the midtones.

Soft Light is a gentler version of the same idea.

These two are workhorses for laying texture across a finished painting. Put a paper-grain photograph on Overlay at 30% opacity over a watercolor and the painting suddenly has tooth. Put canvas weave on Soft Light over an oil simulation and the brushstrokes pick up a subtle physical surface.`,
      },
      {
        heading: 'The Special 8',
        body: `Eight blend modes behave differently when you adjust the Fill slider versus the Opacity slider: Color Burn, Linear Burn, Color Dodge, Linear Dodge (Add), Vivid Light, Linear Light, Hard Mix, and Difference.

With every other blend mode, 40% Opacity looks the same as 40% Fill. With the Special 8, they look different. Hard Mix at full Opacity usually looks broken, but at 30% Fill it produces a clean stylized posterization. Color Dodge with reduced Fill is the cleanest way to paint glowing highlights.

This is the kind of knowledge that separates a beginner stack of blend modes from a confident one. Drop fill on the Special 8 and a whole second tier of effects opens up.`,
      },
      {
        heading: 'Keyboard shortcuts',
        body: `Shift + Alt/Option + [letter] cycles through blend modes. The letters you'll actually use:

- M — Multiply
- S — Screen
- O — Overlay
- F — Soft Light
- D — Color Dodge (Special 8)
- B — Color Burn (Special 8)
- N — Normal (reset)

Press Shift + Alt + Plus / Minus to cycle through the full list one at a time. Useful when you don't know which mode you want — flip through them in real time.`,
      },
    ],
  },

  'canvas-simulation': {
    title: 'Canvas Simulation Techniques',
    pccSources: ['Perlin/Fractal Noise', 'Cellular/Worley Noise', 'Generating Noise In Photoshop', 'Cloud Experiments', 'Clouds'],
    sections: [
      {
        heading: 'Simulating physical surfaces',
        body: `Every physical medium has a surface it sits on — paper, canvas, board, plaster. The grain of that surface shapes how the medium reads. A watercolor on cold-press paper looks fundamentally different from a watercolor on hot-press, because the tooth catches the pigment differently.

To simulate physical media digitally, you have to simulate the surface first. That's almost always procedural — noise functions are how computers generate organic, semi-random surface texture.`,
      },
      {
        heading: 'Perlin / cloud noise — for paper and skin',
        body: `Perlin noise was developed by Ken Perlin in 1983 to combat the "machine-like" appearance of early computer graphics. Perlin received an Academy Award for Technical Achievement in 1997 for the algorithm.

Perlin noise produces cloud-like, soft gradient noise — perfect for simulating paper texture, atmospheric haze, the underlying tone variation of skin, or any surface that's organic but not coarse.

In Photoshop: Filter > Render > Clouds generates Perlin noise. Filter > Render > Difference Clouds generates fractal noise (Perlin layered into itself), useful for more turbulent surfaces — rough plaster, marble veining, stormy skies.

Tip: clouds work on an empty layer and will replace whatever is on it. Apply to a new transparent layer, then composite into the painting using a blend mode (usually Overlay or Soft Light at low opacity).`,
      },
      {
        heading: 'Worley / cellular noise — for tooth and grain',
        body: `In 1996, Steven Worley developed a computational noise function now called Worley noise (also: cellular noise, Voronoi noise).

Where Perlin produces smooth clouds, Worley produces cells — irregular bounded regions that look like stone, dried mud, snake skin, water caustics, or the tooth of textured paper.

In Photoshop, you can approximate Worley using Filter > Pixelate > Crystallize, or by combining noise and the Stained Glass filter. For more controlled cellular patterns, the High Pass + Threshold + Gaussian Blur loop (covered in the Extra Credit: Turing Patterns assignment) produces reaction-diffusion patterns reminiscent of Worley.`,
      },
      {
        heading: 'Building a paper surface',
        body: `Recipe for cold-press watercolor paper:

1. New layer, fill with 50% gray.
2. Filter > Noise > Add Noise — 8%, Gaussian, Monochromatic.
3. Filter > Blur > Motion Blur — 0°, distance 4 px.
4. Filter > Render > Difference Clouds (lightly).
5. Levels (Cmd/Ctrl + L) — pull the dark triangle in slightly.
6. Set the layer to Overlay at 25–40% opacity over your watercolor painting.

The watercolor now reads as sitting on textured paper instead of floating on glass.`,
      },
      {
        heading: 'Building canvas weave',
        body: `Recipe for canvas:

1. New layer, fill with white.
2. Filter > Sketch > Halftone Pattern — Pattern Type: Line, Size 1, Contrast 5. (Or Filter Gallery > Sketch > Halftone Pattern in modern Photoshop.)
3. Rotate 45°.
4. Filter > Blur > Gaussian Blur — 0.5 px.
5. Duplicate the layer, rotate 90°.
6. Merge the two — you now have a woven crosshatch.
7. Set to Soft Light at 30% opacity over an oil painting.

Brushwork now picks up canvas tooth, especially in transparent or impasto areas.`,
      },
    ],
  },

  'cracked-earth-texture': {
    title: 'Cracked Earth, Stone & Plaster',
    pccSources: ['Cracked Earth Texture', 'Organic Surface Weathering'],
    sections: [
      {
        heading: 'Cracked earth, stone, plaster',
        body: `For coarser, more dramatic surfaces — stone walls, dried earth, weathered plaster — combine noise with threshold passes. The Cracked Earth video tutorial in the PCC corpus walks through this technique end-to-end:

1. Start with Difference Clouds.
2. Add Gaussian noise.
3. Threshold to break the noise into solid black/white shapes.
4. Apply Filter > Stylize > Find Edges.
5. Blur slightly.
6. Use the result as a Multiply or Overlay layer at 40–60% opacity.

The result reads as carved, eroded, or scarred — useful for sci-fi environments, fantasy stonework, or any aged surface.`,
      },
    ],
  },

  'color-palette-extraction': {
    title: 'Color Palette Extraction & ASE Swatch Maker',
    pccSources: ['Color Libraries', 'ASE Swatch Formats', 'Value and Gamut Systems'],
    sections: [
      {
        heading: 'The Importance of Building Color Libraries',
        body: `Digital artists must build their own libraries of color rather than relying on default color pickers or random selection. A cohesive color palette acts as the visual backbone of a project, creating structural unity across characters, props, and environments.

By intentionally gathering colors from photographic references, film stills, or master paintings, you establish a curated gamut. This ensures your color choices carry specific intent, mood, and style, rather than feeling disjointed or arbitrary. A personal color library is just as valuable to a digital painter as a custom brush library.`,
      },
      {
        heading: 'The Adobe Swatch Exchange (.ASE) Format',
        body: `The .ASE (Adobe Swatch Exchange) file format is an industry standard for sharing color libraries across various graphics programs (including Photoshop, Illustrator, and InDesign).

ASE files encode color data—primarily in RGB, CMYK, or Grayscale color spaces—as binary data blocks, grouping swatches into named folders. By exporting palettes as .ASE files, you can seamlessly load your curated color harmonies directly into your software's Swatches palette, ensuring absolute color consistency across your working files.`,
      },
      {
        heading: 'Efficiency: Small Palettes for Big Lighting',
        body: `A common beginner mistake is using too many colors. In reality, a small number of swatches (typically 3 to 5 colors) is all you need to define spatial depth and atmospheric light.

By limiting your palette, you force yourself to establish clear lighting relationships:
• **Key Light Swatch:** defines the color of the primary light source.
• **Shadow Swatch:** defines the ambient fill and local color in shadow.
• **Transition/Haze Swatch:** defines the atmospheric perspective (objects becoming cooler and lower contrast as they recede into the distance).

This tight color range creates a strong color script, unifying the composition and selling the illusion of a single, cohesive light source wrapping around the forms.`,
      },
      {
        heading: 'ASE Swatch Maker Interactive Tool',
        body: `Use the ASE Swatch Maker tool below to extract color palettes directly from reference images. You can drop or paste any image, choose auto-extraction via the median-cut algorithm, or use the eyedropper to select exact pixel values, then export your palette directly as an Adobe .ase file.`,
      },
    ],
  },
};

export const topicList = [
  { key: 'brush-engine-deep-dive', label: 'Brush Basics — hardness, size, opacity, flow, and the bracket-key workflow', isNew: true },
  { key: 'custom-brush-creation', label: 'Custom brush creation — capturing source photography, contrast prep with Levels, Edit > Define Brush Preset', isNew: true },
  { key: 'what-is-noise', label: 'What is Noise?', isNew: true },
  { key: 'generating-noise-in-photoshop', label: 'Generating Noise in Photoshop', isNew: true },
  { key: 'procedural-vs-non-procedural', label: 'What is Pattern? and Noise vs. Pattern, Procedural vs. Non-procedural — texture theory', isNew: true },
  { key: 'blend-modes-for-texture', label: 'Texture overlays via blend modes — Multiply, Overlay, Soft Light, and the Special 8', isNew: true },
  { key: 'define-presets', label: 'Define & Save: Photoshop custom brush, pattern, and swatch presets', isNew: true },
  { key: 'color-palette-extraction', label: 'Color palette extraction — building color libraries, the ASE format, and ASE Swatch Maker tool', isNew: true },
];

export const readingsList = [
  { key: 'external-book-of-shaders', label: 'Cellular Noise (The Book of Shaders) — https://thebookofshaders.com/12/', isNew: true, external: 'https://thebookofshaders.com/12/' },
  { key: 'canvas-simulation', label: 'Perlin/Fractal Noise and Cellular/Worley Noise — algorithmic surface generation', isNew: true },
  { key: 'cracked-earth-texture', label: 'Cracked Earth Texture (video walkthrough) — canvas simulation demo', isNew: true },
];

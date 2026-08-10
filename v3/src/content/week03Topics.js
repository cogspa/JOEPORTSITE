// ──────────────────────────────────────────────────────────────────
//  WEEK 03 TOPICS DATA SOURCE
//  Extracted from PCC DMA 12 corpus + cinematic framing.
// ──────────────────────────────────────────────────────────────────

export const TOPIC_DETAILS = {
  'glazing-vs-digital-layering': {
    title: 'Glazing vs. Digital Layering',
    pccSources: ['Non-destructive Editing', 'Layer Basics', 'Organizing Layers'],
    sourceNote: 'PCC teaches layer mechanics; the glazing analogy is new framing for this class.',
    sections: [
      {
        heading: 'What glazing is in traditional painting',
        body: `Glazing is the oil painter's technique of applying thin, transparent layers of pigment over a fully dried underpainting. Each glaze modifies the color and value of everything below it without obliterating it. A Rembrandt face is often forty glazes deep — that's where the inner luminosity comes from. Light passes through each transparent layer, bounces off the ground, and travels back out through every layer it passed through on the way in.

You can't get that quality of light from a single opaque pass. The depth comes from the stacking.`,
      },
      {
        heading: 'Why this matters for digital work',
        body: `Photoshop layers are literally the digital equivalent. Layers in Photoshop are like sheets of acetate stacked on top of each other. Transparent areas of a layer can be seen through the layers below.

A glaze in oil = a layer with low opacity (or a blend mode like Multiply, Overlay, Color) in Photoshop. The difference is that digital glazes dry instantly, can be edited forever, and don't yellow over time.`,
      },
      {
        heading: 'Non-destructive editing as the digital glaze',
        body: `Adjustment Layers hold color or tonal adjustments that affect the layers below them — without editing the underlying pixels directly. This is the most direct analog to glazing. A Hue/Saturation adjustment layer at 30% opacity over a midtone pass is the digital equivalent of a thin warm glaze over a cool underpainting.

Smart Objects extend this further: you can scale, skew, or reshape a Smart Object without directly editing image pixels, and apply Smart Filters that remain editable after the fact. Think of it as a glaze you can adjust the thickness of months later.`,
      },
      {
        heading: 'A digital glazing workflow',
        body: `1. Block in the painting in flat values — your underpainting.
2. Above it, add an adjustment layer or low-opacity color layer set to Color blend mode. This warms or cools the whole image.
3. Above that, add another at low opacity for a secondary color cast.
4. Add a Curves adjustment layer to lift shadows or deepen highlights.
5. Group all of these as your "Grade Stack."

Each layer is a glaze. Each is editable. Each contributes a small amount. The cumulative effect is depth that no single pass could produce.`,
      },
      {
        heading: 'Organize like an oil painter would',
        body: `Group layers by purpose, not order of creation. The number of layers, layer effects, and groups you can add is limited only by your computer's memory — but discipline matters more than capacity.

Recommended group structure:
- UNDERPAINTING (base values, blocked color)
- MIDTONES (clipped color glazes)
- HIGHLIGHTS & SPECULARS
- ATMOSPHERE (haze, god rays, dust)
- GRADE (final color pass — curves, color balance, gradient maps)

F7 opens the Layers panel. Cmd/Ctrl + G groups selected layers.`,
      },
    ],
  },


  'cinematic-lighting': {
    title: 'Cinematic Lighting',
    pccSources: ['Shading Models', 'Specular vs. Diffuse', 'Ambient Light', 'Value Studies Using A Sphere', 'Value Is Emotive'],
    sourceNote: 'PCC teaches CG shading models and the emotional weight of value; the cinematic framing draws those together for screen work.',
    sections: [
      {
        heading: 'The three shading components',
        body: `In computer graphics, a shading model describes how surfaces respond to light. Three main characteristics define CG lighting — and the same three define cinematic lighting:

- Ambient — the general scene light filling shadows
- Diffuse — the soft falloff of light across a surface
- Specular — the bright highlight where light reflects directly to the viewer

Understanding the differences between these three is how you recreate any real-world material in digital art. It's also how you reverse-engineer the lighting in any film still.`,
      },
      {
        heading: 'Ambient light — the floor of the scene',
        body: `Ambient light is the general light level present in the whole set. It's the light bouncing off everything to fill in shadows that no direct light reaches.

In digital painting: lower the values in shadow areas to indicate ambient light, except where light can't reach at all. Use gray values at low opacity to suggest where ambient light bounces.

The darkest part of any shadow is where ambient light can't reach — cracks, crevices, the area directly beneath an object. This area is called ambient occlusion. Paint it darker than the general shadow. It's the single most overlooked move in beginner digital painting and the fastest way to add weight to objects.`,
      },
      {
        heading: 'Diffuse — the soft body of light',
        body: `Diffuse light is what determines the general color of a material when light hits it. Unlike specular reflection, diffuse reflection scatters light in many directions from a rough surface rather than at a single sharp angle.

If you make an object with a non-absorbing powder (plaster), fibers (paper), or polycrystalline material (white marble), light reflects evenly and diffusely. Most common materials exhibit both specular and diffuse reflection.

Objects that don't emit light are primarily visible because of diffuse reflection. Diffuse scattered light creates the object's image in the observer's eye.

For painting: diffuse is your soft-brush territory. Paint it with low-hardness brushes, blend transitions smoothly with the eyedropper sampling between mid-tones.`,
      },
      {
        heading: 'Specular — the cinematic punch',
        body: `Specular highlights are the bright spots that appear on shiny objects when illuminated. They're crucial to 3D graphics and digital painting because they provide a visual cue for an object's shape and its relationship to light sources in the scene.

Snell's Law: light striking a specular surface reflects at an angle that mirrors the incident angle relative to the surface's normal. This makes the viewing angle critical — move the camera, and the specular highlight moves too.

Paint specular hits on reflective objects using a hard-edge brush with no falloff. White or near-white. Tiny relative to the object. This is what gives metal its metallic quality, eyes their wetness, fabric its sheen.

Most beginner digital paintings fail because specular highlights are too big, too soft, and too colored. They should be small, sharp, and almost pure white.`,
      },
      {
        heading: 'Cinematic lighting setups',
        body: `Cinema borrows from theater and photography. The standard setup is three-point lighting:

- Key light — the main light source. Brightest, defines the form. Usually offset 30–45° from the camera.
- Fill light — softer, opposite side of the key. Lifts shadows without competing with the key. Often a complementary temperature to the key.
- Rim/back light — separates subject from background. Behind the subject, creates a bright edge.

For dramatic scenes: high key-to-fill ratio (10:1 or higher) = chiaroscuro, noir, horror. Low key-to-fill ratio (2:1) = even, commercial, romantic.

For atmospheric scenes: weak key, strong ambient, single rim. Reads as twilight, fog, dream.

The single most reliable cinematic move: warm key, cool fill. Or invert: cool key (moonlight), warm fill (firelight, distant window). Color temperature contrast is what makes cinematic lighting read as cinematic.`,
      },
      {
        heading: 'Value does the emotional work',
        body: `Value refers to the lightness or darkness of a color. Colors are recognized, but values are what have the most impact.

Dramatic contrasts — bright lights meeting deep shadows — create tension, drama, suspense. Subtle transitions — gentle gradations from light to dark — evoke calmness, serenity, melancholy. A horror film uses stark contrasts to unsettle. A romantic film uses softer, muted values for a dreamy ambiance.

For your environment compositions this week: decide the emotion first, then design the value structure to deliver it. The lighting setup is just the mechanism. The value distribution is the message.`,
      },
      {
        heading: 'Interactive Lesson: Painting Four Skies',
        body: `Apply these shading and temperature concepts by studying the gradients and color palettes of four cinematic sky conditions. Check the values in grayscale and download Adobe Swatch Exchange (.ase) libraries.`,
      },
    ],
  },

  'atmospheric-perspective': {
    title: 'Atmospheric Perspective',
    pccSources: ['God Rays', 'Cloud Experiments', 'Clouds', 'Color Gets the Credit, Value Does the Work'],
    sourceNote: 'PCC teaches the technique recipes (god rays, clouds, value compression). The term "atmospheric perspective" is new framing.',
    sections: [
      {
        heading: 'What atmospheric perspective is',
        body: `Atmospheric perspective is how distance in a scene is communicated through changes in value, saturation, and contrast — not just through scale and overlap.

Look at any landscape: the foreground has full contrast, full saturation, sharp detail. The middle ground has slightly less contrast and slightly muted color. The far background is washed toward the color of the air itself — typically blue-gray, but warm in sunset, white in fog, brown in dust.

This isn't artistic license. It's physics. There's miles of air between your eye and a distant mountain, and that air scatters short-wavelength light (blue) and absorbs long-wavelength light (red). So distant objects shift cool, lose contrast, and lose saturation.`,
      },
      {
        heading: 'The three moves of atmospheric perspective',
        body: `For any plane farther from the camera, do all three:

1. Reduce contrast — the difference between the darkest and lightest values on that plane gets smaller. Mountains in the distance have no true blacks and no true whites.

2. Reduce saturation — pull color toward gray. Distant greens become gray-green; distant reds become rusty.

3. Shift toward the ambient hue — usually a cool blue-gray for clear daylight, warm orange for haze or sunset, white for fog.

The amount of all three increases with distance. Background plane = heavy treatment. Midground = moderate. Foreground = none.

This is the single most reliable way to create depth in a digital painting that doesn't have a literal vanishing-point perspective.`,
      },
      {
        heading: 'God rays — making the air visible',
        body: `God rays are volumetric light shafts that make atmospheric particles visible. They're the most dramatic atmospheric effect you can paint, and the easiest way to give a scene cinematic weight.

The PCC technique:

1. Create a new layer, name it "light rays."
2. Set foreground/background to default black/white (D).
3. Filter > Render > Clouds.
4. Image > Adjustments > Threshold — this posterizes the clouds into solid black/white shapes.
5. Filter > Blur > Radial Blur — Amount 84, Method: Zoom, Quality: Good. In the Blur Center box, position the zoom origin where your light source is in the painting.
6. Set the layer blend mode to Soft Light (or Screen for more intensity).
7. Reduce opacity to 70–80%.
8. Add a layer mask. With a soft black brush, paint out rays where they shouldn't appear (behind trees, low in the scene).

The result is light streaming through atmosphere — exactly what you see in a forest at dawn or through a cathedral window.`,
      },
      {
        heading: 'Clouds, fog, haze',
        body: `Filter > Render > Clouds generates Perlin noise in your foreground/background colors. It's the foundation for almost every atmospheric effect.

For fog or haze: render clouds on an empty layer, set to Screen blend mode at low opacity. Mask out where the fog shouldn't appear. Push it heavier toward the background plane to reinforce atmospheric perspective.

For moving mist: render clouds, then use Motion Blur (Filter > Blur > Motion Blur) at a low angle to streak the cloud horizontally. Reads as drifting fog.

For storm sky: difference clouds (Filter > Render > Difference Clouds) generate fractal noise — more turbulent than regular clouds. Levels (Cmd/Ctrl + L) can push them to dramatic contrast.`,
      },
      {
        heading: 'Value compression is everything',
        body: `The most important atmospheric move is value compression on distant planes.

Foreground value range: 0 (black) to 255 (white) — full range.
Midground value range: maybe 40 to 220.
Background value range: maybe 80 to 180.

Compress further as you go deeper. The eye reads this as distance instantly, even before noticing the color shifts.

Use Levels (Cmd/Ctrl + L) on each plane group to compress: pull the white output slider down and the black output slider up. You're literally squeezing the dynamic range, which is what atmosphere does to light traveling through it.`,
      },
    ],
  },

  'masking-and-selections': {
    title: 'Masking & Selections',
    pccSources: ['Layer Masks', 'Alpha Channels', 'Shortcuts Used for Masking Images'],
    sections: [
      {
        heading: 'Masks are non-destructive selections',
        body: `A layer mask hides or reveals parts of a layer without deleting any pixels. White areas of the mask reveal the layer. Black areas hide it. Gray areas partially reveal it.

Why this matters: erasing is destructive. Masking is reversible. You can paint the mask back to white and the pixels come back. For any compositing or photo work, mask — never erase.

To add a mask: with a layer selected, click the rectangle-with-circle icon at the bottom of the Layers panel. Click on the mask thumbnail (not the layer thumbnail) to paint on the mask.`,
        videoUrl: 'https://youtu.be/YpvfbA97Qvc?si=RubXLFxN9-gySqiy',
        videoCaption: 'Video: Selections and Masking in Photoshop',
      },
      {
        heading: 'Why a mask is called an alpha channel',
        body: `Each pixel in a graphics image contains color data and transparency data. A 32-bit graphics system contains three 8-bit channels for red, green, blue (RGB) and one 8-bit channel for alpha. The alpha channel specifies how colors merge when one pixel is overlaid on another.

Alvy Ray Smith introduced the alpha channel concept in the late 1970s. Thomas Porter and Tom Duff articulated it formally in a 1984 paper.

In a mask: 0 = fully transparent, 255 = fully opaque. The same logic as the alpha channel, applied to a single layer.`,
      },
      {
        heading: 'Selection tools for photo compositing',
        body: `For cinematic location work where you're combining photographic elements, use at least three different selection methods:

- Magic Wand / Quick Selection (W) — for flat-color edges. Click a sky to select it, click again with Shift to add. Set tolerance around 32; lower for precision, higher for forgiveness.

- Pen Tool (P) — for hard manufactured edges. Architecture, vehicles, industrial objects. Slow but precise. Convert the path to a selection (Cmd/Ctrl + Enter), then apply as a mask.

- Select and Mask (in newer Photoshop versions, formerly "Refine Edge") — for hair, fur, foliage, anything with soft or complex edges. Use the Refine Edge brush in this dialog.

- Channels — for the hardest cases like hair against a busy background. Find the channel with the most contrast, duplicate it, push Levels to extreme, refine with painting, load as selection.`,
      },
      {
        heading: 'Essential masking shortcuts',
        body: `W — Quick Selection / Magic Wand
M — Marquee (rectangular and elliptical)
P — Pen Tool
A — Direct Selection (for refining path points)
Q — Quick Mask mode toggle (paint a selection, then press Q again to convert to selection)

Cmd/Ctrl + I — Invert (mask or selection)
Cmd/Ctrl + D — Deselect
Shift + Cmd/Ctrl + I — Invert selection
Cmd/Ctrl + click on layer thumbnail — load layer's transparency as a selection

X — swap foreground/background (useful when painting on a mask: white reveals, black hides, X to toggle quickly)
D — reset foreground/background to default black/white
Alt/Option + click mask thumbnail — view the mask itself in isolation
\\ (backslash) — toggle quick mask overlay view`,
      },
    ],
  },

  'realistic-lighting-adjustments': {
    title: 'Realistic Lighting Adjustments',
    pccSources: ['Histograms and Levels', 'How To Use Levels', 'Where do you find Levels in the UI?', 'Value and Contrast'],
    sections: [
      {
        heading: 'Levels: Why Use Them',
        body: `With the Levels adjustment, you can explore and correct an image's tonal value range by adjusting the intensity levels of shadows, mid-tones, and highlights. You can access levels in Photoshop using cmd (mac)/control (PC) + L .  This shortcut applies to photopea.com. Watch the video tutorial below for a visual guide.

You can use levels to:
- Increase contrast in an image for more dynamic effects.
- Mask out the subject of an image, duplicate the subject layers, and apply levels to the background to make the subject stand out more.
- Use levels on your masks to darken or lighten a mask.
- Use levels on your graffiti assignment. Push the levels to the left or right. What parts of the images begin to stand out more? Do you see "things" appearing in the image that you didn't think of initially?`,
        imageUrl: '/Screen Shot 2021-09-22 at 5.13.00 AM.png',
        imageCaption: 'the levels dialog in photoshop',
        videoUrl: 'https://youtu.be/rcEoCyTJEb8?si=k19kedhLuc6cFYtC',
        videoCaption: 'Video: Tutorial on Levels and Histograms in Photoshop',
      },
      {
        heading: 'Reading a histogram',
        body: `When you press Cmd/Ctrl + L, Photoshop displays the Levels dialog with a histogram — a jagged mountain-range graph showing the distribution of values in your image.

The horizontal axis runs from pure black (left edge) through shadows, midtones, highlights, to pure white (right edge). The vertical height at each point shows how many pixels in the image have that value.

A well-exposed image: the histogram spans edge to edge without major gaps, with a nice arch through the midtones. Doesn't spill up either side.

A flat, foggy image: the histogram bunches in the middle, doesn't reach the edges.

A high-contrast image: the histogram has data at both edges, possibly with a gap in the middle.

Reading histograms tells you what kind of correction is needed before you make a single move.`,
      },
      {
        heading: 'Sliders for level adjustment',
        body: `Using levels sliders (the “triangles”), you can influence three tonal areas of an image: the shadows, mid-tones, and highlights. By moving the sliders (or using black point or white point eyedropper), you can define better black or white points in an image. The gray-eyedropper is used to determine areas of color and images.

- Black point slider (left triangle) — sets the value that becomes pure black. Move right to push more pixels to black, increasing shadow depth.
- Midtone slider (middle triangle, gamma) — lightens or darkens the midtones without affecting the black and white points. Move left to lighten the image overall; move right to darken.
- White point slider (right triangle) — sets the value that becomes pure white. Move left to push more pixels to white, blowing out highlights.`,
        imageUrl: '/Screen Shot 2021-09-22 at 4.54.49 AM.png',
        imageCaption: 'level sliders',
      },
      {
        heading: 'Left Lightens, Right Darkens',
        body: `You can make an image more vivid by altering the white and black points and moving the mid-tone slider to the left to lighten the idea or to the right to darken it.`,
        imageUrl: '/Screen Shot 2021-09-22 at 5.47.22 AM.png',
        imageCaption: 'lighten left, darken right',
      },
      {
        heading: 'Where Levels lives in Photoshop',
        body: `Two main places, with different consequences:

1. Image > Adjustments > Levels (Cmd/Ctrl + L) — this permanently affects the layer you're on. Use only when you're certain about the change and don't need to revisit it.

2. Layers panel > New Adjustment Layer > Levels — this creates a Levels Adjustment Layer above your image, affecting all layers below it non-destructively. You can turn its visibility off (eye icon) to compare, double-click it to re-edit, or delete it to remove the effect entirely.

For cinematic lighting work, always use the adjustment layer approach. You'll want to iterate, and you'll want the option to remove or modify the correction later in the process.

There's also an Adjustments panel (Window > Adjustments) — a third way to access the same adjustment layers via icon buttons.`,
      },
      {
        heading: 'Curves — when Levels isn\'t enough',
        body: `Curves (Cmd/Ctrl + M) does everything Levels does, plus more. The Curves dialog shows a diagonal line from bottom-left (shadows) to top-right (highlights). You can add points anywhere on this line and drag them.

For cinematic lighting:
- An S-curve (point in shadows pulled down, point in highlights pulled up) increases contrast
- A reverse-S (highlights pulled down, shadows pulled up) decreases contrast — useful for atmospheric compression
- Pulling the bottom-left point up off the corner lifts the blacks, creating a filmic, washed-out look favored in modern cinema

Both Levels and Curves can be applied per-channel (R, G, B). Push the red channel's shadow point up to get warm shadows. Push the blue channel's highlight point up to get cool highlights. This is professional color grading in two moves.`,
      },
      {
        heading: 'Value contrast as a creative choice',
        body: `Value contrast is the relationship between areas of dark and light. A consistent gray can appear to change value depending on the values around it. When two grays read as the same value, that's low contrast — the image goes flat.

For cinematic work, value contrast is a creative tool, not a technical default. High contrast = drama, danger, focus. Low contrast = atmosphere, mood, dream.

Choose based on what the image is about, then use Levels and Curves to deliver that choice.`,
      },
    ],
  },
};

export const topicList = [
  { key: 'masking-and-selections', label: 'Review: Masking and Selections', isNew: false },
  { key: 'realistic-lighting-adjustments', label: 'Workflow breakdown: Non-destructive light adjustments and layer stack safety', isNew: false },
  { key: 'brush-maker', label: 'Tool: Brush Maker', isNew: true },
  { key: 'threshold-notan', label: 'Tool: Threshold Notan', isNew: true },
  { key: 'notan-light-lab', label: 'Tool: Notan Light Lab', isNew: true },
  { key: 'layer-basics', label: 'Layer Basics: Selection masking, non-destructive adjustment layers, and layer organization', isNew: false },
  { key: 'glazing-vs-digital-layering', label: 'Traditional glazing vs. digital layering and transparency', isNew: false },
  { key: 'sphere-material-studies', label: 'Lesson: Diffuse & Specular on a Sphere', isNew: true },
  { key: 'value-studies', label: 'Emotive Power of Value', isNew: true },
  { key: 'cinematic-lighting', label: 'Cinematic lighting, atmospheric perspective, & selection masking compositing', isNew: false },
  { key: 'sky-color', label: 'Lesson: Painting Four Skies', isNew: true },
  { key: 'block-out-process', label: 'Lesson: The Block-Out Method', isNew: true },
  { key: 'block-out-study', label: 'Lesson: Block-Out Study', isNew: true },
  { key: 'gradient-marquee', label: 'Tool: Gradient Marquee', isNew: true },
  { key: 'brush-foundry-ii', label: 'Tool: Brush Maker II', isNew: true },
];

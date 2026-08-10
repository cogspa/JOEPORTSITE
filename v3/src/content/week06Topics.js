// ─── Content adapted from Ryman Curriculum + PCC DMA 10 Integrated Campaigns ───
export const TOPIC_DETAILS = {
  'book-covers-and-key-art': {
    title: 'Book Covers & Key Art (Margins, Columns, & Layout Specs)',
    pccSources: ['Page Layouts and Master Pages', 'Specifying Page Layout Specs in InDesign', 'Creating an InDesign Document'],
    sections: [
      {
        heading: 'Translating Painting to Product Layouts',
        body: `A commercial painting is rarely presented in isolation. In the professional world of publishing and entertainment art, an illustration is just one piece of a larger mechanical layout. Whether it is a book cover, a film's theatrical key art, or an editorial magazine spread, the illustrator must understand how their artwork integrates with typography, technical printer folds, and layout grids.

In Adobe InDesign, the default workspace is engineered around document geometry. Unlike Photoshop's canvas or Illustrator's artboards, InDesign uses a structural layout grid defined by margins, columns, bleeds, and slugs. Margins establish a "live area" for crucial text elements so they don't get trimmed off or fall too close to the binding. Column grids establish visual pathways that guide the reader's eye, aligning headlines and block paragraphs with the structural weight of the illustration.`,
      },
      {
        heading: 'Specifying Layout Specs & The Bleed Zone',
        body: `When setting up a document for print—such as a book cover or brand brochure—there are crucial layout specifications you must define:
1. **Trim Size**: The final physical dimensions of the finished product after printing and cutting (e.g., a standard trade paperback at 6" × 9" or a movie poster at 27" × 40").
2. **Margin Guides**: An inward safety offset (minimum 0.375", recommended 0.5") that defines the boundary for essential text and logos. No critical visual communication should exceed this margin.
3. **Bleed Area**: A mandatory 0.125" (3mm) outward expansion beyond the trim line. Because mechanical paper cutters have a small margin of error (drift), any background painting, texture, or color must stretch into the bleed zone. If your illustration stops exactly at the trim line, even a half-millimeter shift in cutting will result in an ugly white paper sliver at the page edge.
4. **The Gutter**: The blank space between columns or across facing pages in a spread, allowing page folds and bindings to take up space without swallowing characters or focal points.`,
      },
      {
        heading: 'The Power of Master Pages',
        body: `When working on a multi-page commercial project—like a 6-panel brand booklet, a multi-page editorial article, or a corporate brochure—consistency is paramount. This is where **Master Pages** (now known as Parent Pages) in InDesign become an essential production tool.

A Master Page acts as a global template for your document. Any element placed on a Master Page—such as grid alignments, background textures, folio page numbers, or corporate logo headers—will automatically render on all document pages to which that master is applied. 

If an art director requests that a logo be moved 10 pixels to the left across a 24-page catalog, a designer who manually positioned the logo would have to edit 24 pages. A professional using Master Pages changes it once on the master, and InDesign instantly updates all 24 pages. This guarantees perfect structural layout alignment across the entire visual campaign.`,
      },
      {
        heading: 'Adding High-Resolution Content via Linking',
        body: `One of the most important concepts to master in desktop publishing is InDesign's linking architecture. Unlike Photoshop, where images are embedded directly into the file (creating massive file sizes), InDesign keeps document files extremely lightweight by *linking* to external high-resolution graphic files (like PSDs, TIFs, or AI vectors).

InDesign displays a low-resolution proxy preview of your illustration on the screen to preserve computer memory and ensure fast performance while you design type treatments. When you export the final document to a print-ready PDF, InDesign reads the path link and grabs the original, high-resolution pixel data to compose the final layout.

**Critical Link Rules:**
• Never rename, delete, or move your illustration files after placing them in InDesign. Doing so breaks the link, resulting in a pixelated, low-resolution final print.
• Use the **Links Palette** to monitor status. A red exclamation mark (!) indicates a missing link, while a yellow warning triangle indicates the link is modified and needs to be updated.
• When delivering your project to a client, always use InDesign's **Package** feature (File > Package). This automatically crawls your document and gathers all fonts, linked illustrations, and color profiles into a single, organized folder for delivery.`,
      },
    ],
  },
  'integrated-ad-campaigns': {
    title: 'Integrated Ad Campaigns (Typographic Resonance & Multi-Format Layout)',
    pccSources: ['Integrated Ad Campaigns', 'Art Boards', 'Making Type Resonate', 'The Swiss Style'],
    sections: [
      {
        heading: 'What is an Integrated Campaign?',
        body: `An integrated campaign is a multi-format promotional push where a single concept or narrative is adapted across multiple platforms simultaneously. In the commercial art industry, a client will rarely hire you for a single illustration. Instead, they will commission a master visual identity that must translate seamlessly across print, web, social media, and out-of-home advertising (like billboard displays).

The challenge of an integrated campaign is keeping the visual communication unified while altering the layout geometry. A landscape illustration designed for a 16:9 cinematic banner does not fit on a vertical Instagram story (9:16) or a square postcard (1:1). The illustrator must compose their artwork strategically so that it can be cropped, framed, and repositioned without losing its narrative focus or visual balance.`,
      },
      {
        heading: 'Typography in Commercial Layout: Hierarchy & Style',
        body: `An integrated campaign succeeds when typography and imagery work in absolute harmony. The primary rule of commercial layout is establishing a clear **Visual Hierarchy**:
1. **Headline (Level 1)**: The largest, most stylistically dominant type. Its job is to capture attention immediately, working in tandem with the primary focal point of your illustration.
2. **Subhead (Level 2)**: Medium-sized type that provides immediate context or secondary information.
3. **Body Copy (Level 3)**: Small, highly readable text that details the campaign's message.

Illustrators must choose typefaces that resonate with the mood of their artwork:
• **Serif Fonts (e.g., Garamond, Bodoni)**: Project heritage, elegance, authority, and literary value. Excellent for book covers or high-end cinematic key art.
• **Sans-Serif Fonts (e.g., Helvetica, Futura)**: Convey modernism, cleanliness, neutrality, and industrial speed. They are the backbone of the **Swiss Style (International Typographic Style)**, which advocates for invisible design, geometric grids, and absolute functional clarity.
• **Readability Metrics**: The human brain recognizes words holistically by their overall shape rather than letter-by-letter. In layout design, the top halves and right sides of letterforms carry the most visual recognition data. Ensure your type is placed over high-contrast, uncluttered backgrounds (or use vector plates) to guarantee instantaneous readability.`,
      },
      {
        heading: 'Designing Across Multiple Artboards',
        body: `To coordinate an integrated campaign, modern tools like Adobe Illustrator and Figma use **Artboards** (or Frames) to allow designers to work on multiple layouts side-by-side within a single document window.

For the final project, you will set up a master document containing three distinct artboards:
• **Artboard 1 (Print Poster)**: Vertical aspect ratio (e.g., 11" × 17"). Focuses on long-range impact, bold typography, and maximum illustration detail.
• **Artboard 2 (Digital Banner)**: Horizontal cinematic aspect ratio (e.g., 1920 × 1080 px). Optimizes negative space to allow headlines to sit next to the focal illustration instead of over it.
• **Artboard 3 (Social Postcard)**: Square aspect ratio (e.g., 1080 × 1080 px). Requires extremely compact visual framing, where the illustration and typography are condensed for rapid, thumb-stopping mobile scrolling.

Working with multiple artboards side-by-side lets you check visual consistency in real-time. If you change a font size, adjust a color harmony, or move an illustration element on one artboard, you can immediately apply the adjustment across the other two to ensure a perfectly cohesive campaign.`,
      },
    ],
  },
  'asset-management-cc-libraries': {
    title: 'Asset Management & Creative Cloud Libraries',
    pccSources: ['Creative Cloud Libraries', 'Intro to Color Systems', 'Additive Vs. Subtractive Color'],
    sections: [
      {
        heading: 'Asset Management: The Illustrator-to-InDesign Pipeline',
        body: `In professional studio pipelines, efficiency is just as important as creativity. A single integrated campaign might feature dozens of individual files. Managing these assets manually—manually copying and pasting vector logos, duplicating hex color codes, and searching for raw image files—is a recipe for costly mistakes and version-control nightmares.

Professional visual designers solve this through centralized **Asset Management**. By keeping vector brand assets (like client logo marks, icons, and badges) separate from raw raster illustrations, you ensure that high-fidelity assets remain fully scalable, clean, and easily editable. If a vector logo needs to change from dark red to white, it should be updated in a single central repository and instantly sync across all active layouts.`,
      },
      {
        heading: 'Unifying Campaigns with Creative Cloud Libraries',
        body: `**Creative Cloud Libraries** are the industry standard for cross-application asset sharing. A library is a persistent cloud panel that floats across Photoshop, Illustrator, InDesign, and Premiere, allowing you to drag-and-drop assets to store them globally.

When developing a commercial campaign, you should curate a dedicated Library containing:
• **Vector Assets**: Your brand logo, typographic badges, and icon vectors.
• **Color Swatches**: The campaign's precise color palette tokens, stored as global swatches.
• **Character Styles**: Preset font families, line heights, and weights for headlines and body text.
• **Graphics**: Layered smart objects of your main digital illustrations.

When you drag an asset from your CC Library into an InDesign layout or Photoshop canvas, it remains dynamically linked to the library. If you edit the logo in Illustrator, every instance of that logo across all your PSDs and InDesign pages will update automatically. This ensures absolute consistency across a distributed creative workflow.`,
      },
      {
        heading: 'Unifying Color Systems: Additive vs. Subtractive Color',
        body: `A major pitfall in asset management is failing to coordinate color systems between digital screens and physical print.
• **Additive Color (RGB)**: Built on light (Red, Green, Blue). Used by digital screens (monitors, phones). Stacking all three colors at full intensity yields pure white. RGB has an extremely wide color gamut, meaning it can display vibrant, glowing, saturated neon hues.
• **Subtractive Color (CMYK)**: Built on ink (Cyan, Magenta, Yellow, Key Black). Used by physical printing presses. Stacking these inks subtracts light; combining them at full intensity yields a muddy dark brown (which is why a dedicated Black ink "K" is added). CMYK has a much narrower color gamut than RGB.

If you design a glowing, neon-green illustration in RGB and send it directly to a commercial CMYK printer without color management, the final print will look dull, muddy, and desaturated. Professional illustrators use their asset library to convert and check color profiles (using InDesign's View > Proof Colors option) early in the design phase to ensure their illustrations translate seamlessly from glowing pixels to printed inks.`,
      },
    ],
  },
  'the-commercial-brief': {
    title: 'The Commercial Brief & Creative Campaign Pitching',
    pccSources: ['Run Down of the Design Brief', 'Developing Logos with Shape Combining Tools', 'Semiotics'],
    sections: [
      {
        heading: 'Decoding the Creative Design Brief',
        body: `In the commercial art market, a painting does not begin with personal inspiration. It begins with a **Creative Brief**. A creative brief is a foundational document prepared by an art director or client that outlines the strategic goals, technical boundaries, and audience expectations for a project.

A standard creative brief contains:
• **Project Overview & Objectives**: Why this campaign is being created and what problem it needs to solve.
• **Target Audience**: Who the design needs to speak to (demographics, values, aesthetic tastes).
• **Core Message & Key Takeaway**: The single most important idea the viewer must walk away with.
• **Deliverables & Specifications**: Precise dimensions, aspect ratios, file formats, and file naming conventions.
• **Brand Guidelines**: Mandatory colors, required logos, and tone of voice (e.g., "gritty and dark" vs "clean and corporate").
• **Timeline & Budget**: Milestone checkpoints, critique dates, and final shipping deadlines.

An illustrator's first job is not to draw, but to analyze the brief. You must decode the keywords, identify the technical boundaries, and ensure your conceptual thumbnails directly answer the client's problem.`,
      },
      {
        heading: 'The Semiotics of Corporate Messaging',
        body: `To create an impactful campaign, illustrators must apply the science of **Semiotics**—the study of signs and symbols:
• **The Signifier**: The physical form of the communication (the lines, typefaces, colors, and layout structure you design).
• **The Signified**: The mental concept or emotional response triggered in the viewer's mind.

When designing the visual identity for a client, every shape carries enculturated meaning:
• **Geometric Shapes (Circles, Squares)**: Circles signify unity, community, and infinity; squares signify stability, trust, organization, and strength.
• **Organic Shapes (Fluid Lines, Hand-drawn Vectors)**: Signify freedom, creativity, growth, and natural origins.
• **Combining Type and Image**: The typography must act as a visual signifier that reinforces the illustration. A corporate tech client's campaign should couple clean, geometric sans-serif type with highly structured vector shapes. A dark fantasy publication should couple historical blackletter or highly bracketed humanist serifs with texture-heavy, painterly brushes. Fusing these elements correctly builds brand equity and creates a lasting signified impression on the audience.`,
      },
      {
        heading: 'Pitching Your Campaign to the Art Director',
        body: `Even the most brilliant digital illustration will fail if you cannot pitch it effectively. In commercial agencies, illustrators must present their work in a clean, professional format called a **Pitch Deck** or **Brand Booklet**.

When presenting your integrated campaign, you must outline your creative decisions:
1. **The Core Concept**: Explain the narrative hook of your illustration and why it fits the project's goals.
2. **Typography Rationale**: Explain why your typeface classifications (serif, sans-serif, slab) align with the client's identity.
3. **Color Story**: Present your curated swatches and justify how they establish the psychological tone of the campaign.
4. **Resiliency Test**: Demonstrate how your illustration remains readable and visually impactful when scaled down to a small social media thumbnail or scaled up to a massive vertical print poster.

By framing your art within a professional structure, you transition from a simple technician who draws pictures into a valuable creative partner who drives business results.`,
      },
    ],
  },
  'commercial-campaign-assignment': {
    title: 'Assignment Brief: The "Your World" Integrated Campaign',
    pccSources: ['Final Project: "Your World" Integrated Campaign', 'Final Project "Your World" Template.ai', 'Assignment 5: Fictitious Fast Food Logo'],
    sections: [
      {
        heading: 'Assignment Overview',
        body: `For this assignment, you will step into the role of a professional commercial illustrator tasked with delivering a high-fidelity **Integrated Ad Campaign** for a fictional client project. The project is titled **"The 'Your World' Campaign."**

You will combine all the skills you have developed throughout the term—digital painting, custom brush creation, non-destructive adjustment masking, typography pairing, and multiple-format composition—into a unified package of commercial assets.

Your challenge is to take one of your digital illustrations (such as your Week 3 Landscape Compositions, your Week 5 Character Sheet, or a new piece) and package it with cohesive typography and vector branding across three distinct artboards to form a single, synchronized visual campaign.`,
      },
      {
        heading: 'The Creative Design Brief',
        body: `**Client**: *Fictitious Cinematic or Publishing Release* (e.g., a movie launch, a novel release, an indie game campaign, or a premium brand identity).
**Core Concept**: Package a high-fidelity digital illustration into a commercial campaign that feels consistent, premium, and unified.
**Visual Theme**: The campaign must showcase "Resonance" where the typeface, color system, and illustration style all reinforce a single mood or message.

**Technical Specifications (Three Required Deliverables):**
1.  **Deliverable 1 — The Print Campaign Poster (Vertical)**:
    *   Dimensions: 11" × 17" at 200 DPI (or 2200 × 3400 pixels).
    *   Focus: Vertical composition, dominant Level 1 headline, secondary subheads, and full illustration detail. Must include margins (0.5" offset) and a bleed zone (0.125" offset).
2.  **Deliverable 2 — The Digital Screen Banner (Horizontal)**:
    *   Dimensions: 1920 × 1080 pixels (16:9 cinematic aspect ratio).
    *   Focus: Layout horizontal composition. The illustration must occupy one side (e.g., left or right) while the typography sits in clean, high-contrast negative space on the opposite side.
3.  **Deliverable 3 — The Social Postcard / Mobile Ad (Square)**:
    *   Dimensions: 1080 × 1080 pixels (1:1 aspect ratio).
    *   Focus: Compact visual communication. Bold, highly readable Level 1 type paired with a tightly cropped, high-impact detail of your illustration designed for instant mobile recognition.`,
      },
      {
        heading: 'Step-by-Step Production Workflow',
        body: `Follow these professional steps to construct your campaign package:

**Step 1 — Concept & Assets Setup:**
• Select the digital illustration that will act as the master graphic.
• Set up your master folder. Create a subfolder named \`assets\` to store your high-resolution PSD files and vector brand logos separately.

**Step 2 — Curate the Creative Library:**
• Open Adobe Illustrator, Figma, or Photoshop. Create a dedicated project library.
• Select a curated color system (3–5 swatches). Specify the RGB values for screen display, and check the CMYK color proof equivalents to ensure they remain vibrant when printed.
• Select your font pairing: one dominant typeface for the headline (e.g., a modern sans-serif like Futura for tech, or a bracketed humanist serif like Jenson for fantasy/history) and one neutral, highly readable sans-serif for the body copy (like Helvetica).

**Step 3 — Establish the Layouts (The Multi-Artboard Setup):**
• In Illustrator, Figma, or Photoshop, create a new document with three artboards matching the technical specifications (11" × 17", 1920 × 1080, and 1080 × 1080).
• Set up margin guides (0.5" inward safety offset) on all three artboards to keep your typography protected.

**Step 4 — Position & Composition Adjustment:**
• Place your master digital illustration onto all three artboards.
• Adjust the composition for each shape:
  * *Poster*: Scale and center the artwork, letting it fill the canvas while leaving vertical space at the top or bottom for the primary title.
  * *Banner*: Shift the artwork to one half of the screen. Use a soft gradient layer mask to blend the edge of your painting into a solid background color, creating a seamless negative space for the text columns.
  * *Social*: Zoom in on the most detailed, emotionally expressive part of your illustration (e.g., a character's face, or a glowing atmospheric emitter in your location) to serve as a high-contrast focal point that fills the square.

**Step 5 — Apply Typographic Hierarchy:**
• Add your headlines, subheads, and body copy using your CC Library character styles.
• Align text box grids to ensure perfectly clean margins.
• Ensure typography sits on high-contrast plates or background values so it reads effortlessly from across the room.`,
      },
      {
        heading: 'Submission & Delivery Package Guidelines',
        body: `To secure full points, you must compile a clean production package. Name all files consistently to demonstrate agency-grade professionalism.

**Required Submission Package:**
✓  **One Combined Campaign Presentation PNG**: A single horizontal sheet (3840 × 1080 px or similar) displaying all three layouts (Poster, Banner, Social) side-by-side on a dark charcoal grid background to showcase campaign consistency.
✓  **Three Individual Asset PNGs**: The full-resolution, exported layouts.
    *   \`yourname_w06_yourworld_poster.png\`
    *   \`yourname_w06_yourworld_banner.png\`
    *   \`yourname_w06_yourworld_social.png\`
✓  **A 100-word Brand Narrative**: A text write-up explaining:
    1.  The fictional brand or release your campaign represents.
    2.  Your typography pairing choices (e.g., serif vs. sans-serif) and how they resonate.
    3.  How you adapted the composition across horizontal, vertical, and square geometric constraints.

**Grading Rubric:**
• **Visual Cohesion (30 Points)**: Do all three deliverables feel like they belong to the same campaign? Are color palettes, logo marks, and typographic choices perfectly synchronized?
• **Composition & Scaling Resiliency (30 Points)**: How well is the illustration cropped and framed across the vertical, horizontal, and square layouts? Does each crop maximize narrative impact?
• **Typographic Hierarchy & Readability (25 Points)**: Is the hierarchy clear? Does the headline command Level 1 attention? Is text perfectly legible on all backgrounds?
• **Technical Setup & Delivery (15 Points)**: Are margins and bleeds respected? Are the files exported at correct dimensions? Are filenames formatted exactly as requested?`,
      },
    ],
  },
};

export const topicList = [
  { key: 'book-covers-and-key-art', label: 'Book covers & key art page layouts (margins, columns, grids in InDesign)', isNew: true },
  { key: 'integrated-ad-campaigns', label: 'Integrated ad campaigns (combining typography, graphic layout, & illustration)', isNew: true },
  { key: 'asset-management-cc-libraries', label: 'Asset management & CC Libraries (collaborative libraries & master page templates)', isNew: true },
  { key: 'the-commercial-brief', label: 'The commercial brief (visual hierarchy, type & image pairing, campaign pitching)', isNew: true },
];

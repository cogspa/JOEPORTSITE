import React, { useState, useEffect } from "react";
import { X, Play, Code, Check, Filter, Link as LinkIcon, Share2, Download, ExternalLink } from "lucide-react";

// Native React imports for all 18 Artifact Components
import BrushFoundryII from "../artifacts/BrushFoundryII.jsx";
import BlockOutProcess from "../artifacts/BlockOutProcess.jsx";
import BlockOutStudy from "../artifacts/BlockOutStudy.jsx";
import NotanLightLab2 from "../artifacts/NotanLightLab2.jsx";
import ProceduralWearLesson from "../artifacts/ProceduralWearLesson.jsx";
import TriadPalettes from "../artifacts/TriadPalettes.jsx";
import SkyColorLesson from "../artifacts/SkyColorLesson.jsx";
import SphereMaterialStudies from "../artifacts/SphereMaterialStudies.jsx";
import ThresholdNotanLesson from "../artifacts/ThresholdNotanLesson.jsx";
import NoiseLesson from "../artifacts/NoiseLesson.jsx";
import NoiseVsPattern from "../artifacts/NoiseVsPattern.jsx";
import LayerBasics from "../artifacts/LayerBasics.jsx";
import GradientMarquee from "../artifacts/GradientMarquee.jsx";
import PixelWaveSample from "../artifacts/PixelWaveSample.jsx";
import BrushMaker from "../artifacts/brush-maker.jsx";
import ValueStudiesCarousel from "../artifacts/ValueStudiesCarousel.jsx";
import MogrtDgrGenerator from "../artifacts/MogrtDgrGenerator.jsx";
import MirrorLab from "../artifacts/MirrorLab.jsx";
import AsciiRainStudio from "../artifacts/AsciiRainStudio.jsx";
import ChromeGooMirror from "../artifacts/ChromeGooMirror.jsx";

// Native Raw Source Code Imports via Vite (?raw)
import brushFoundrySource from "../artifacts/BrushFoundryII.jsx?raw";
import blockOutProcessSource from "../artifacts/BlockOutProcess.jsx?raw";
import blockOutStudySource from "../artifacts/BlockOutStudy.jsx?raw";
import notanLightLab2Source from "../artifacts/NotanLightLab2.jsx?raw";
import proceduralWearSource from "../artifacts/ProceduralWearLesson.jsx?raw";
import triadPalettesSource from "../artifacts/TriadPalettes.jsx?raw";
import skyColorSource from "../artifacts/SkyColorLesson.jsx?raw";
import sphereMaterialSource from "../artifacts/SphereMaterialStudies.jsx?raw";
import thresholdNotanSource from "../artifacts/ThresholdNotanLesson.jsx?raw";
import noiseLessonSource from "../artifacts/NoiseLesson.jsx?raw";
import noiseVsPatternSource from "../artifacts/NoiseVsPattern.jsx?raw";
import layerBasicsSource from "../artifacts/LayerBasics.jsx?raw";
import gradientMarqueeSource from "../artifacts/GradientMarquee.jsx?raw";
import pixelWaveSource from "../artifacts/PixelWaveSample.jsx?raw";
import brushMakerSource from "../artifacts/brush-maker.jsx?raw";
import valueStudiesSource from "../artifacts/ValueStudiesCarousel.jsx?raw";
import mogrtDgrSource from "../artifacts/MogrtDgrGenerator.jsx?raw";
import mirrorLabSource from "../artifacts/MirrorLab.jsx?raw";
import asciiRainStudioSource from "../artifacts/AsciiRainStudio.jsx?raw";
import chromeGooMirrorSource from "../artifacts/ChromeGooMirror.jsx?raw";

const ARTIFACT_ITEMS = [
  {
    id: "brush-foundry",
    title: "Brush Foundry II",
    filename: "BrushFoundryII.jsx",
    category: "brush",
    categoryLabel: "Brush Systems",
    desc: "Multimode brush tip generator for pLAtform. Supports Scatter, Spatter, Bristle, Clump, Blob, Cell, Hatch & Fog mark families with PNG & Photoshop .ABR multi-brush set export.",
    Component: BrushFoundryII,
    source: brushFoundrySource,
  },
  {
    id: "blockout-process",
    title: "BlockOut Process Lab",
    filename: "BlockOutProcess.jsx",
    category: "3d",
    categoryLabel: "3D & Lighting",
    desc: "Interactive 3D & composition blockout workspace designed for fast visual asset prototyping, volumetric massing, and stage lighting breakdown.",
    Component: BlockOutProcess,
    source: blockOutProcessSource,
  },
  {
    id: "blockout-study",
    title: "BlockOut Study Analyzer",
    filename: "BlockOutStudy.jsx",
    category: "3d",
    categoryLabel: "3D & Lighting",
    desc: "Spatial composition and focal depth blockout analyzer for evaluating geometric contrast, silhouette legibility, and focal hierarchy.",
    Component: BlockOutStudy,
    source: blockOutStudySource,
  },
  {
    id: "notan-light-lab",
    title: "Notan Light Lab 2",
    filename: "NotanLightLab2.jsx",
    category: "color",
    categoryLabel: "Color & Notan",
    desc: "Three.js 3D lighting, shadow, and 2-value / 3-value Notan contrast study lab with dynamic camera controls and shader thresholding.",
    Component: NotanLightLab2,
    source: notanLightLab2Source,
  },
  {
    id: "procedural-wear",
    title: "Procedural Wear Engine",
    filename: "ProceduralWearLesson.jsx",
    category: "procedural",
    categoryLabel: "Procedural Engines",
    desc: "Real-time procedural edge wear, surface weathering, distress map synthesis, and material oxidation simulator.",
    Component: ProceduralWearLesson,
    source: proceduralWearSource,
  },
  {
    id: "triad-palettes",
    title: "Triad Palettes Generator",
    filename: "TriadPalettes.jsx",
    category: "color",
    categoryLabel: "Color & Notan",
    desc: "Color theory triad palette generator with contrast ratio verification and one-click Photoshop .ASE swatch file export.",
    Component: TriadPalettes,
    source: triadPalettesSource,
  },
  {
    id: "sky-color-lesson",
    title: "Sky & Atmosphere Color Lab",
    filename: "SkyColorLesson.jsx",
    category: "color",
    categoryLabel: "Color & Notan",
    desc: "Procedural atmospheric sky color, twilight gradient, and Rayleigh/Mie light scattering simulator for digital matte painting.",
    Component: SkyColorLesson,
    source: skyColorSource,
  },
  {
    id: "sphere-material",
    title: "Sphere Material Studies",
    filename: "SphereMaterialStudies.jsx",
    category: "3d",
    categoryLabel: "3D & Lighting",
    desc: "3D sphere material, specular roughness, diffuse falloff, and multi-light source shading component analyzer.",
    Component: SphereMaterialStudies,
    source: sphereMaterialSource,
  },
  {
    id: "threshold-notan",
    title: "Threshold Notan Analyzer",
    filename: "ThresholdNotanLesson.jsx",
    category: "color",
    categoryLabel: "Color & Notan",
    desc: "Dynamic image thresholding, value structure Notan analyzer, and graphic shape simplification tool.",
    Component: ThresholdNotanLesson,
    source: thresholdNotanSource,
  },
  {
    id: "noise-lesson",
    title: "Noise & Grain Generator",
    filename: "NoiseLesson.jsx",
    category: "procedural",
    categoryLabel: "Procedural Engines",
    desc: "Real-time procedural noise, grain frequency, octave blending, and high-frequency texture map generator.",
    Component: NoiseLesson,
    source: noiseLessonSource,
  },
  {
    id: "noise-vs-pattern",
    title: "Noise vs Pattern Generator",
    filename: "NoiseVsPattern.jsx",
    category: "procedural",
    categoryLabel: "Procedural Engines",
    desc: "Comparative procedural noise vs grid pattern synthesis tool for analyzing organic entropy vs geometric repetition.",
    Component: NoiseVsPattern,
    source: noiseVsPatternSource,
  },
  {
    id: "gradient-marquee",
    title: "Gradient Marquee Engine",
    filename: "GradientMarquee.jsx",
    category: "ux",
    categoryLabel: "UX & Motion",
    desc: "Animated CSS/Canvas gradient marquee and dynamic motion banner builder for creative web interfaces.",
    Component: GradientMarquee,
    source: gradientMarqueeSource,
  },
  {
    id: "pixel-wave",
    title: "Pixel Wave Audio Visualizer",
    filename: "PixelWaveSample.jsx",
    category: "procedural",
    categoryLabel: "Procedural Engines",
    desc: "Real-time audio waveform and pixel wave visualizer featuring dynamic amplitude frequency response.",
    Component: PixelWaveSample,
    source: pixelWaveSource,
  },
  {
    id: "brush-maker",
    title: "Custom Brush Stamp Creator",
    filename: "brush-maker.jsx",
    category: "brush",
    categoryLabel: "Brush Systems",
    desc: "Interactive canvas brush stamp creator, pressure dynamics tester, and custom mark stroke simulator.",
    Component: BrushMaker,
    source: brushMakerSource,
  },
  {
    id: "mogrt-dgr-generator",
    title: "AE MOGRT → DGR Video Generator",
    filename: "MogrtDgrGenerator.jsx",
    category: "procedural",
    categoryLabel: "Procedural Engines",
    desc: "Batch MOGRT video render automation demo mapped against Adobe Firefly Services Dynamic Graphics Render (DGR) API schema.",
    Component: MogrtDgrGenerator,
    source: mogrtDgrSource,
  },
  {
    id: "mirror-lab",
    title: "Mirror Lab Notan Painter",
    filename: "MirrorLab.jsx",
    category: "brush",
    categoryLabel: "Brush Systems",
    desc: "Universal vertical-symmetry Notan painter and auto silhouette generator with PNG & Photoshop .ABR brush tip export.",
    Component: MirrorLab,
    source: mirrorLabSource,
  },
];

const UNSHIPPED_ITEMS = [
  {
    id: "ascii-rain-studio",
    title: "ASCII Rain Studio",
    filename: "AsciiRainStudio.jsx",
    category: "unshipped",
    categoryLabel: "Experimental & Unreleased",
    desc: "Real-time ASCII rain matrix generator supporting image, video, live webcam feeds, multilingual glyph sets, and audio reactivity.",
    Component: AsciiRainStudio,
    source: asciiRainStudioSource,
    badge: "LAB EXPERIMENT",
  },
  {
    id: "chrome-goo-mirror",
    title: "Chrome Goo Mirror",
    filename: "ChromeGooMirror.jsx",
    category: "unshipped",
    categoryLabel: "Experimental & Unreleased",
    desc: "Interactive hand-tracking WebGL fluid engine and MediaPipe gesture controller prompts.",
    Component: ChromeGooMirror,
    source: chromeGooMirrorSource,
    badge: "UNRELEASED LAB",
  },
];

const OTHER_TOOLS = [
  {
    category: "blender",
    categoryLabel: "Blender · Plugin",
    title: "Lip Sync Panel",
    filename: "lipsync_panel.py",
    desc: "One-button Rhubarb-driven lip sync baked onto 8 procedural viseme shape keys. Lives in the N-panel; installed via the Blender 5.1 startup folder.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/lipsync-panel",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/96d2c0fb-b6f6-4dd6-b4d4-561c2b262015"
  },
  {
    category: "blender",
    categoryLabel: "Blender · Plugin",
    title: "Mondrian Remix — Blender",
    filename: "mondrian_remix addon",
    desc: "Grid cells as real textured planes with Z-stagger parallax and VSE dialog remix. Seed-compatible with the Figma, Photoshop, and web editions.",
    primaryHref: "tools/mondrian-remix-blender/mondrian_remix_blender_addon.zip",
    primaryLabel: "Download",
    ghostHref: "https://claude.ai/chat/6848ea19-1f3a-48ec-a26f-25d3fe161f6b"
  },
  {
    category: "blender",
    categoryLabel: "Blender · Script",
    title: "Turntable Rig",
    filename: "turntable_rig.py",
    desc: "Idempotent pivot + camera rig from selection bounds. Full version adds timeline, rotation keyframes, and linear interpolation (steps 1–13).",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/turntable-rig",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/8027b8da-6b5c-4f9b-8425-7d5ecf0c1b80"
  },
  {
    category: "blender",
    categoryLabel: "Blender · Script",
    title: "Character Shot Cameras",
    filename: "character_shot_cameras.py",
    desc: "Auto-places 4 cinematography cameras (85 / 35 / 50 / 70mm) from a character's bounding box, with FACING orientation param and a batch render function.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/character-shot-cameras",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/73282038-5fa4-4116-9cf5-adb83e230d16"
  },
  {
    category: "blender",
    categoryLabel: "Blender · Script",
    title: "Render Watcher",
    filename: "render_watcher.py",
    desc: "Dropbox-watched headless render farm: drop a .blend from the Mac and the RTX 5090 box renders all four camera sequences back, with status and logs in Dropbox.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/render-watcher",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/73282038-5fa4-4116-9cf5-adb83e230d16"
  },
  {
    category: "blender",
    categoryLabel: "Blender · Script",
    title: "Ground Crack Automation",
    filename: "crack_setup.py",
    desc: "Cell Fracture + sun + shadow catcher + Cycles GPU / multilayer EXR scene setup — later explored as a WebGL experience with adjustable parameters.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/ground-crack",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/ff9a4cef-3133-4f39-aa78-faf272fc7ee3"
  },
  {
    category: "blender",
    categoryLabel: "Blender · Script",
    title: "Batch FBX Exporter",
    filename: "creature FBX batch export",
    desc: "Isolated 29 creatures by vertex threshold, deleted 1,538 noise meshes, and exported Unreal-ready FBXs with correct forward/up axes.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/batch-fbx-exporter",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/96d2c0fb-b6f6-4dd6-b4d4-561c2b262015"
  },
  {
    category: "blender",
    categoryLabel: "Blender · Script",
    title: "GLTF Bake + Export",
    filename: "bake_and_export.py",
    desc: "Bakes procedural materials to image textures for Blender → Houdini transfer. Includes the emissive → base-color wiring fix.",
    primaryHref: "tools/gltf-bake-export/export_gltf_separate_houdini.py",
    primaryLabel: "Download",
    ghostHref: "https://claude.ai/chat/d56f52ff-1c93-4e76-9ec8-bdaa3d00ed43"
  },
  {
    category: "blender",
    categoryLabel: "Blender · Script",
    title: "Camera Orbit Rig",
    filename: "MCP session",
    desc: "Empty pivot + Track To constraint, 360° over 120 frames. Includes the Blender 5.1 layered-Action API workaround.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/camera-orbit-rig",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/ccb1b72c-55da-4ad8-b19b-9b872ee86836"
  },
  {
    category: "blender",
    categoryLabel: "Blender · Script",
    title: "Center + Mirror",
    filename: "MCP session",
    desc: "Origin-to-bounds, zeroed world location, global-Y mirror via bmesh matrix transform with face-winding reversal and normal recalculation.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/center-mirror",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/02232bcf-19aa-4991-982d-0c0bedfcd06d"
  },
  {
    category: "photoshop",
    categoryLabel: "Photoshop · Plugin",
    title: "Brush Grabber",
    filename: "brush-grabber (UXP)",
    desc: "Floating 2×2 grid of 4 favorite brushes for one-click switching while painting. Event-based brush capture via notification listeners.",
    primaryHref: "tools/brush-grabber/brush-grabber-plugin.zip",
    primaryLabel: "Download",
    ghostHref: "https://claude.ai/chat/7c6274c0-87d0-4445-887c-c80ccc919214"
  },
  {
    category: "photoshop",
    categoryLabel: "Photoshop · Plugin",
    title: "Color Grabber",
    filename: "color-grabber (UXP)",
    desc: "Floating 3×3 swatch grid; one click sets the foreground color — no eyedropper trips while painting.",
    primaryHref: "tools/color-grabber/color-grabber-plugin.zip",
    primaryLabel: "Download",
    ghostHref: "https://claude.ai/chat/7c6274c0-87d0-4445-887c-c80ccc919214"
  },
  {
    category: "photoshop",
    categoryLabel: "Photoshop · Plugin",
    title: "Scratch Pad",
    filename: "scratch-pad.zip",
    desc: "Always-on-top pad for test strokes: pressure/speed taper, dark-mid-light ground toggle, 12-level undo, and scratch-layer buttons for real-brush testing.",
    primaryHref: "tools/scratch-pad/scratch-pad.zip",
    primaryLabel: "Download",
    ghostHref: "https://claude.ai/chat/a9a4c8ee-ab94-42b2-929a-fd460fee8bb5"
  },
  {
    category: "photoshop",
    categoryLabel: "Photoshop · Plugin",
    title: "Brush Scope",
    filename: "brush-scope-1.0.0.zip",
    desc: "Live brush-tip footprint at scale plus hardness, flow, and pen-pressure indicators. FIT / 1:1 and LIVE / HOLD toggles, pixel ruler, raw debug view.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/brush-scope",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/2c64d1b2-3431-42e7-955d-506f10fff007"
  },
  {
    category: "photoshop",
    categoryLabel: "Photoshop · Plugin",
    title: "Symmetry Painter + Brush Library",
    filename: "symmetry-painter (UXP)",
    desc: "Symmetrical painting widget turned UXP panel: define library art as a brush preset, place as a layer, export PNG or .abr via file pickers.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/symmetry-painter",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/708e1434-130a-4988-ba7b-28df25387f33"
  },
  {
    category: "photoshop",
    categoryLabel: "Photoshop · Plugin",
    title: "Mondrian Remix — Photoshop",
    filename: "mondrian_remix_photoshop_plugin.zip",
    desc: "Seeded layouts as masked layer groups in a 1080×1920 doc — the poster / print-comp edition of the family.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/mondrian-remix-photoshop",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/6848ea19-1f3a-48ec-a26f-25d3fe161f6b"
  },
  {
    category: "figma",
    categoryLabel: "Figma · Plugin",
    title: "Slug",
    filename: "slug plugin",
    desc: "Frames any selection with a print-style slug metadata strip (name, date, author, notes); logs every application with CSV export and click-to-locate.",
    primaryHref: "tools/slug/slug-figma-plugin.zip",
    primaryLabel: "Download",
    ghostHref: "https://claude.ai/chat/f14e02d1-6f71-48d5-8791-b1589b4037de"
  },
  {
    category: "figma",
    categoryLabel: "Figma · Plugin",
    title: "Glyph Table",
    filename: "glyph-table-figma-plugin.zip",
    desc: "Two workflows in one: draw-in-panel canvas, and a pen-tool-frames → installable TTF compiler with real quadratic curves (no faceting).",
    primaryHref: "tools/glyph-table/glyph-table.jsx",
    primaryLabel: "Download",
    ghostHref: "https://claude.ai/chat/5d134897-34d8-4ef0-827e-f164c2d23f45"
  },
  {
    category: "figma",
    categoryLabel: "Figma · Plugin",
    title: "Card Dealer",
    filename: "card-dealer-figma-plugin.zip",
    desc: "Deals Discover-style LA event cards as native auto-layout frames — same seeded deck as the React carousel, fully editable after dealing.",
    primaryHref: "tools/card-dealer/card-dealer-figma-plugin.zip",
    primaryLabel: "Download",
    ghostHref: "https://claude.ai/chat/693dbddc-546d-41d8-9270-89e57f399a55"
  },
  {
    category: "figma",
    categoryLabel: "Figma · Plugin",
    title: "Card Dealer Live",
    filename: "card-dealer-live-figma-plugin.zip",
    desc: "Self-contained edition fetching live events (Ticketmaster, SeatGeek, JSON-LD, Claude) from inside Figma, with clientStorage-held API keys.",
    primaryHref: "tools/card-dealer-live/card-dealer-live-figma-plugin.zip",
    primaryLabel: "Download",
    ghostHref: "https://claude.ai/chat/693dbddc-546d-41d8-9270-89e57f399a55"
  },
  {
    category: "figma",
    categoryLabel: "Figma · Plugin",
    title: "Specimen — Design System Generator",
    filename: "specimen plugin",
    desc: "Silhouette contact sheet → variable collections (light/dark modes), icon components, size-variant sets, auto-layout UX components, and preview boards.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/specimen",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/f33cc6f2-b94d-4c3f-81ad-22c461c0ef99"
  },
  {
    category: "figma",
    categoryLabel: "Figma · Plugin",
    title: "Mondrian Remix — Figma",
    filename: "mondrian_remix_figma_plugin.zip",
    desc: "Layouts placed as editable frames with sampled image-fill cells, or the rendered moving remix as a video fill.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/mondrian-remix-figma",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/6848ea19-1f3a-48ec-a26f-25d3fe161f6b"
  },
  {
    category: "figma",
    categoryLabel: "Figma · Plugin",
    title: "Persona Generator",
    filename: "persona plugin + Next.js app",
    desc: "Lightweight Figma side of the Next.js + Claude API persona tool — pulls generated personas into design files, with a full template-customization editor.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/persona-generator",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/4ca2d4d0-ee31-4dfb-8565-2860c497aeef"
  },
  {
    category: "web",
    categoryLabel: "Web · Tool",
    title: "Mondrian Remix — Web",
    filename: "React + ffmpeg original",
    desc: "The ffmpeg Python original and the browser tool — the seed-parity anchor: one mulberry32 seed reproduces the identical composition in all four hosts.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/mondrian-remix-web",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/6848ea19-1f3a-48ec-a26f-25d3fe161f6b"
  },
  {
    category: "python",
    categoryLabel: "Python · Script",
    title: "Batch Organizer",
    filename: "batch_organizer.py",
    desc: "Splits folders into alphanumeric batches of 20 with zero-padded subfolders and a --dry-run preview.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/batch-organizer",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/735a4ca2-70d5-4196-8b0c-fe6801969914"
  },
  {
    category: "python",
    categoryLabel: "Python · Script",
    title: "Contact Sheet",
    filename: "contact_sheet.py",
    desc: "One Pillow contact sheet per subfolder — 10 columns across, zero margins, named after its source folder.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/contact-sheet",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/735a4ca2-70d5-4196-8b0c-fe6801969914"
  },
  {
    category: "python",
    categoryLabel: "Python · Script",
    title: "YouTube Transcript Pipeline",
    filename: "youtube_transcript_pipeline.py",
    desc: "yt-dlp search + transcript retrieval + SQLite FTS5 full-text index, seeded with automotive installation topics for All AI Automotive.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/youtube-transcripts",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/0ab6f738-7229-40cc-bf2e-4edbc272dd3c"
  },
  {
    category: "python",
    categoryLabel: "Python · Script",
    title: "MPA PDF Downloader",
    filename: "download_mpa_pdfs.py",
    desc: "Downloads all 82 PDFs from the MPA printables page with skip-on-rerun logic and polite request delays.",
    primaryHref: "tools/mpa-pdf-downloader/download_mpa_pdfs.py",
    primaryLabel: "Download",
    ghostHref: "https://claude.ai/chat/de10d28a-dce3-4514-8e9e-87e953703ece"
  },
  {
    category: "python",
    categoryLabel: "Python · Pipeline",
    title: "marble2isaac Batch Driver",
    filename: "marble2isaac/batch.py",
    desc: "Resumable two-machine world farm (Mac fetch / RTX assemble) with JSON ledger, HTML QA contact sheet, and the isaac_assemble.py stage.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/marble2isaac",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/b55ee426-6fe0-4d2e-9389-e04df422ed75"
  },
  {
    category: "python",
    categoryLabel: "Python · Script",
    title: "Discord Server Creator",
    filename: "create_discord_server.py",
    desc: "Zero-dependency guild creation: builds the server, generates a one-use invite, waits for you to join, then grants your ID an admin role.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/discord-server-creator",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/02232bcf-19aa-4991-982d-0c0bedfcd06d"
  },
  {
    category: "python",
    categoryLabel: "JavaScript · Script",
    title: "Canvas Module Extractor",
    filename: "browser console · Canvas REST API",
    desc: "Console script exporting Canvas module content to Markdown with pagination — one of the recurring PCC course utilities.",
    primaryHref: "https://github.com/cogspa/joem-tools/tree/main/tools/canvas-module-extractor",
    primaryLabel: "View Folder",
    ghostHref: "https://claude.ai/chat/cec22be1-d68b-4f89-871d-f9cc52c6d16f"
  }
];

const ALL_TOOLS = [...ARTIFACT_ITEMS, ...UNSHIPPED_ITEMS];

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Artifact Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-xl font-mono text-sm">
          <h4 className="font-bold text-base mb-2">Component Execution Notice</h4>
          <p className="mb-4">{this.state.error?.toString()}</p>
          <p className="text-xs text-neutral-600">
            Switch to the <strong>.jsx Source Code</strong> tab to view complete implementation code.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const CATEGORY_COLORS = {
  react: {
    bg: "bg-[#56A1B2]",
    text: "text-[#1D6372]",
    border: "border-[#56A1B2]",
    hoverBg: "hover:bg-[#468E9E]",
    cardBg: "bg-[#F0F8FA]",
    lightBg: "bg-[#E1F3F6]",
    lightBorder: "border-[#BEE4EC]",
    ledgerColor: "#56A1B2"
  },
  blender: {
    bg: "bg-[#FF5500]",
    text: "text-[#C93800]",
    border: "border-[#FF5500]",
    hoverBg: "hover:bg-[#E04B00]",
    cardBg: "bg-[#FFF7F4]",
    lightBg: "bg-[#FFEBE3]",
    lightBorder: "border-[#FFCCB8]",
    ledgerColor: "#FF5500"
  },
  photoshop: {
    bg: "bg-[#D87093]",
    text: "text-[#9E355D]",
    border: "border-[#D87093]",
    hoverBg: "hover:bg-[#C2587E]",
    cardBg: "bg-[#FDF4F8]",
    lightBg: "bg-[#FCE4EF]",
    lightBorder: "border-[#F6C2DA]",
    ledgerColor: "#D87093"
  },
  figma: {
    bg: "bg-[#F5CE38]",
    text: "text-[#8A6A00]",
    border: "border-[#F5CE38]",
    hoverBg: "hover:bg-[#E0B820]",
    cardBg: "bg-[#FEFCF0]",
    lightBg: "bg-[#FEF7D1]",
    lightBorder: "border-[#FDEAA2]",
    ledgerColor: "#F5CE38"
  },
  web: {
    bg: "bg-[#EDE8DD]",
    text: "text-[#68604F]",
    border: "border-[#D5CDC0]",
    hoverBg: "hover:bg-[#DFD9CD]",
    cardBg: "bg-[#FAF8F5]",
    lightBg: "bg-[#F0EBE2]",
    lightBorder: "border-[#DDD5C7]",
    ledgerColor: "#EDE8DD"
  },
  python: {
    bg: "bg-[#8B8474]",
    text: "text-[#524E43]",
    border: "border-[#8B8474]",
    hoverBg: "hover:bg-[#787162]",
    cardBg: "bg-[#F7F6F3]",
    lightBg: "bg-[#EAE7E1]",
    lightBorder: "border-[#D3CEC5]",
    ledgerColor: "#8B8474"
  }
};

export default function ArtifactPlayground() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeLedgerFilter, setActiveLedgerFilter] = useState("all");
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [activeTab, setActiveTab] = useState("runner"); // "runner" | "source"
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [formData, setFormData] = useState({
    toolType: "Plug-in",
    integration: "",
    notes: "",
    name: "",
    email: ""
  });
  const [formStatus, setFormStatus] = useState("idle"); // "idle" | "submitting" | "success" | "error"

  const encodeFormData = (data) => {
    return Object.keys(data)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormStatus("submitting");

    // In local development, simulate successful submission
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      setTimeout(() => {
        setFormStatus("success");
        setFormData({
          toolType: "Plug-in",
          integration: "",
          notes: "",
          name: "",
          email: ""
        });
      }, 700);
      return;
    }

    fetch("/__forms.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeFormData({ "form-name": "custom-tool-requests", ...formData })
    })
      .then((response) => {
        if (response.ok || response.status === 200 || response.status === 303) {
          setFormStatus("success");
          setFormData({
            toolType: "Plug-in",
            integration: "",
            notes: "",
            name: "",
            email: ""
          });
        } else {
          setFormStatus("error");
        }
      })
      .catch((error) => {
        console.error("Netlify form submission error:", error);
        setFormStatus("error");
      });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.replace("#", "");
    const targetId = params.get("tool") || params.get("artifact") || params.get("id") || hash;

    if (targetId) {
      const cleanTarget = targetId.toLowerCase();
      const match = ALL_TOOLS.find(
        (item) =>
          item.id.toLowerCase() === cleanTarget ||
          item.filename.toLowerCase() === cleanTarget ||
          item.filename.toLowerCase().replace(".jsx", "") === cleanTarget ||
          item.id.toLowerCase().replace(/-/g, "") === cleanTarget.replace(/-/g, "")
      );
      if (match) {
        setActiveArtifact(match);
        setActiveTab("runner");
      }
    }
  }, []);

  const openArtifact = (art, tab = "runner") => {
    setActiveArtifact(art);
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tool", art.id);
    window.history.replaceState({}, "", url.toString());
  };

  const closeArtifact = () => {
    setActiveArtifact(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("tool");
    url.searchParams.delete("artifact");
    url.searchParams.delete("id");
    window.history.replaceState({}, "", url.pathname);
  };

  const handleShareLink = (art = activeArtifact) => {
    if (!art) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?tool=${art.id}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const filteredArtifacts =
    selectedCategory === "all"
      ? ARTIFACT_ITEMS
      : ARTIFACT_ITEMS.filter((item) => item.category === selectedCategory);

  const handleCopyCode = () => {
    if (activeArtifact?.source) {
      navigator.clipboard.writeText(activeArtifact.source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reactCount = ARTIFACT_ITEMS.length + UNSHIPPED_ITEMS.length;
  const blenderCount = OTHER_TOOLS.filter((t) => t.category === "blender").length;
  const photoshopCount = OTHER_TOOLS.filter((t) => t.category === "photoshop").length;
  const figmaCount = OTHER_TOOLS.filter((t) => t.category === "figma").length;
  const webCount = OTHER_TOOLS.filter((t) => t.category === "web").length;
  const pythonCount = OTHER_TOOLS.filter((t) => t.category === "python").length;
  const totalCount = reactCount + blenderCount + photoshopCount + figmaCount + webCount + pythonCount;

  const ledgerCategories = [
    { id: "react", name: "React (JSX/JS)", count: reactCount },
    { id: "blender", name: "Blender", count: blenderCount },
    { id: "photoshop", name: "Photoshop", count: photoshopCount },
    { id: "figma", name: "Figma", count: figmaCount },
    { id: "web", name: "Web", count: webCount },
    { id: "python", name: "Python", count: pythonCount },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased">
      {/* Top Header */}
      <header className="border-b border-black bg-white/95 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              <a
                href="https://jmicallefport.com"
                className="bg-black text-white hover:bg-neutral-800 px-2.5 py-1 rounded text-[11px] font-sans font-bold inline-flex items-center gap-1 transition"
              >
                ← Back to jmicallefport.com
              </a>
              <span className="text-neutral-400">•</span>
              <span>pLAtform Shipped React Artifacts</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight mt-1 flex items-center gap-2.5">
              <img
                src="/COGSPA.png"
                alt="COGSPA Logo"
                className="h-7 md:h-8 w-auto object-contain"
              />
              <span>Artifact Playground</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Tool Dropdown Selector */}
            <select
              value={activeArtifact?.id || ""}
              onChange={(e) => {
                const found = ALL_TOOLS.find((item) => item.id === e.target.value);
                if (found) openArtifact(found, "runner");
              }}
              className="bg-black text-white text-xs font-mono font-semibold px-3.5 py-2 rounded-lg border border-black hover:bg-neutral-800 transition cursor-pointer outline-none shadow-sm"
            >
              <option value="" disabled>
                ⚡ Jump to Tool ({ALL_TOOLS.length}) ▾
              </option>
              {["brush", "3d", "color", "procedural", "ux"].map((catKey) => {
                const catItems = ARTIFACT_ITEMS.filter((i) => i.category === catKey);
                const catLabel = catItems[0]?.categoryLabel || catKey.toUpperCase();
                return (
                  <optgroup key={catKey} label={`── ${catLabel} ──`} className="bg-neutral-900 text-neutral-300 font-sans">
                    {catItems.map((item) => (
                      <option key={item.id} value={item.id} className="bg-neutral-900 text-white font-mono">
                        {item.title} ({item.filename})
                      </option>
                    ))}
                  </optgroup>
                );
              })}
              <optgroup label="── UNRELEASED / EXPERIMENTAL ──" className="bg-neutral-900 text-amber-400 font-sans">
                {UNSHIPPED_ITEMS.map((item) => (
                  <option key={item.id} value={item.id} className="bg-neutral-900 text-amber-200 font-mono">
                    🧪 {item.title} ({item.filename})
                  </option>
                ))}
              </optgroup>
            </select>

            <div className="text-xs font-mono text-neutral-500 hidden sm:block">
              {ALL_TOOLS.length} Tools
            </div>
          </div>
        </div>
      </header>

      {/* Ledger Bar */}
      <div className="bg-black text-white border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 py-3 border-b border-neutral-900 flex-wrap text-xs font-mono">
            <span className="bg-[#CE2018] text-white px-2 py-0.5 font-bold uppercase tracking-wider">
              Joe Micallef
            </span>
            <span className="text-neutral-400">· CLAUDE-BUILT PLUGINS &amp; SCRIPTS</span>
            {activeLedgerFilter !== "all" && (
              <button
                onClick={() => setActiveLedgerFilter("all")}
                className="bg-neutral-800 text-white hover:bg-neutral-700 px-2 py-0.5 rounded font-sans transition text-[10px]"
              >
                Show All Platforms
              </button>
            )}
            <span className="ml-auto text-neutral-400 font-bold">{totalCount} Tools</span>
          </div>

          <div className="flex w-full h-16 border-b border-neutral-900 overflow-hidden font-mono text-left">
            {ledgerCategories.map((cat) => {
              const colorObj = CATEGORY_COLORS[cat.id];
              const isPressed = activeLedgerFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveLedgerFilter(isPressed ? "all" : cat.id)}
                  style={{
                    flexGrow: cat.count,
                    backgroundColor: isPressed ? "transparent" : colorObj.ledgerColor,
                    color: isPressed ? "#fff" : (cat.id === "figma" || cat.id === "web" ? "#000" : "#fff"),
                    border: isPressed ? `2px dashed ${colorObj.ledgerColor}` : "none",
                    margin: isPressed ? "3px" : "0px",
                    borderRadius: isPressed ? "6px" : "0px",
                  }}
                  className="flex flex-col justify-center px-4 py-2 transition-all hover:opacity-90 relative cursor-pointer"
                >
                  <span className="text-lg font-bold leading-none">{cat.count}</span>
                  <span className="text-[9.5px] uppercase tracking-wider font-extrabold mt-1 opacity-90 truncate max-w-full">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-lg text-neutral-700 max-w-4xl mb-8 leading-relaxed">
          Interactive showcase of {totalCount} React tools, procedural generators, 3D shading labs, color engines, plugins, and helper scripts. Click any segment on the colored ledger bar above to filter by platform.
        </p>

        {/* 1. REACT SECTION */}
        {(activeLedgerFilter === "all" || activeLedgerFilter === "react") && (
          <section className="mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1D6372] mb-1">
                  <span>🔷 SHIPPED REACT (JSX/JS) ARTIFACTS</span>
                </div>
                <h2 className="text-2xl font-extrabold uppercase tracking-tight">
                  React (JSX/JS) Tools
                </h2>
                <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
                  Interactive production components, custom canvas shaders, and animation suites built natively in React.
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-[#1D6372] bg-[#E1F3F6] border border-[#BEE4EC] px-3 py-1.5 rounded-lg self-start md:self-auto">
                {ARTIFACT_ITEMS.length} Shipped Tool{ARTIFACT_ITEMS.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Category Filter Tabs & Dropdown Row for React Tools */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: `ALL ARTIFACTS (${ARTIFACT_ITEMS.length})` },
                  { id: "brush", label: "BRUSH SYSTEMS" },
                  { id: "3d", label: "3D & LIGHTING" },
                  { id: "color", label: "COLOR & NOTAN" },
                  { id: "procedural", label: "PROCEDURAL ENGINES" },
                  { id: "ux", label: "UX & MOTION" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full font-mono text-xs font-semibold transition-all border ${selectedCategory === cat.id
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-neutral-300 hover:border-black"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shipped React Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtifacts.map((art) => (
                <div
                  key={art.id}
                  className="border border-neutral-300 border-t-4 border-[#56A1B2] rounded-xl p-6 flex flex-col justify-between hover:border-black hover:shadow-xl transition-all bg-[#F0F8FA] relative overflow-hidden"
                >
                  <div>
                    <div className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border text-[#1D6372] bg-[#E1F3F6] border-[#BEE4EC] inline-block mb-3">
                      React · {art.categoryLabel}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{art.title}</h3>
                    <span className="font-mono text-xs text-neutral-400 block mb-3">
                      {art.filename}
                    </span>
                    <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                      {art.desc}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-neutral-100">
                    <button
                      onClick={() => openArtifact(art, "runner")}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white font-semibold text-xs rounded-lg hover:bg-neutral-800 transition"
                    >
                      <Play className="w-3.5 h-3.5" /> Explore Tool
                    </button>
                    <button
                      onClick={() => openArtifact(art, "source")}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-100 text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 border border-neutral-300 transition"
                    >
                      <Code className="w-3.5 h-3.5" /> Source
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. NON-SHIPPED LAB PROTOYPES */}
        {(activeLedgerFilter === "all" || activeLedgerFilter === "react") && (
          <section className="mb-16 pt-12 border-t-2 border-dashed border-neutral-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1D6372] mb-1">
                  <span>🧪 LAB EXPERIMENTS &amp; PROTOTYPES</span>
                </div>
                <h2 className="text-2xl font-extrabold uppercase tracking-tight">
                  Non-Shipped Tools
                </h2>
                <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
                  Experimental creative coding tools, interactive canvas shaders, and unreleased R&amp;D prototypes exploring generative media in React.
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-[#1D6372] bg-[#E1F3F6] border border-[#BEE4EC] px-3 py-1.5 rounded-lg self-start md:self-auto">
                {UNSHIPPED_ITEMS.length} Unreleased Tool{UNSHIPPED_ITEMS.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {UNSHIPPED_ITEMS.map((art) => (
                <div
                  key={art.id}
                  className="border-2 border-dashed border-neutral-300 border-t-4 border-[#56A1B2] rounded-xl p-6 flex flex-col justify-between hover:border-black hover:shadow-xl transition-all bg-[#F0F8FA]/70 relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 bg-[#E1F3F6] text-[#1D6372] border border-[#BEE4EC] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {art.badge || "EXPERIMENTAL"}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border text-[#1D6372] bg-[#E1F3F6] border-[#BEE4EC] inline-block mb-3">
                      React · Experimental
                    </div>
                    <h3 className="text-xl font-bold mb-1 pr-16">{art.title}</h3>
                    <span className="font-mono text-xs text-neutral-400 block mb-3">
                      {art.filename}
                    </span>
                    <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                      {art.desc}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-neutral-200">
                    <button
                      onClick={() => openArtifact(art, "runner")}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white font-semibold text-xs rounded-lg hover:bg-neutral-800 transition"
                    >
                      <Play className="w-3.5 h-3.5" /> Launch Tool
                    </button>
                    <button
                      onClick={() => openArtifact(art, "source")}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-100 border border-neutral-300 transition"
                    >
                      <Code className="w-3.5 h-3.5" /> Source
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. OTHER COMPANION SCRIPTS & PLUGINS */}
        {activeLedgerFilter !== "react" && (
          <section className="mt-16 pt-12 border-t-2 border-dashed border-neutral-300">
            {(() => {
              const displayTools = activeLedgerFilter === "all"
                ? OTHER_TOOLS
                : OTHER_TOOLS.filter((t) => t.category === activeLedgerFilter);

              if (displayTools.length === 0) return null;

              const activeCatObj = CATEGORY_COLORS[activeLedgerFilter] || {
                text: "text-[#1D6372]",
                lightBg: "bg-[#E1F3F6]",
                lightBorder: "border-[#BEE4EC]"
              };

              return (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <div className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider ${activeCatObj.text} mb-1`}>
                        <span>📁 COMPANION PLUGINS, PIPELINES &amp; SCRIPTS</span>
                      </div>
                      <h2 className="text-2xl font-extrabold uppercase tracking-tight">
                        {activeLedgerFilter === "all" ? "Other Artifacts/Scripts/Plugins" : `${activeLedgerFilter.charAt(0).toUpperCase() + activeLedgerFilter.slice(1)} Tools`}
                      </h2>
                      <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
                        A catalog of installable add-ons, panel plugins, and automated utility pipelines built across Blender, Photoshop, Figma, and Python.
                      </p>
                    </div>
                    <span className={`font-mono text-xs font-semibold px-3 py-1.5 rounded-lg self-start md:self-auto ${activeCatObj.text} ${activeCatObj.lightBg} border ${activeCatObj.lightBorder}`}>
                      {displayTools.length} Tool{displayTools.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayTools.map((tool, idx) => {
                      const colorObj = CATEGORY_COLORS[tool.category] || CATEGORY_COLORS.react;
                      return (
                        <div
                          key={idx}
                          className={`border border-neutral-300 border-t-4 ${colorObj.border} rounded-xl p-6 flex flex-col justify-between hover:border-black hover:shadow-xl transition-all ${colorObj.cardBg} relative overflow-hidden`}
                        >
                          <div>
                            <div className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${colorObj.text} ${colorObj.lightBg} ${colorObj.lightBorder} inline-block mb-3`}>
                              {tool.categoryLabel}
                            </div>
                            <h3 className="text-xl font-bold mb-1 pr-4">{tool.title}</h3>
                            <span className="font-mono text-xs text-neutral-400 block mb-3">
                              {tool.filename}
                            </span>
                            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                              {tool.desc}
                            </p>
                          </div>

                          <div className="flex gap-2 pt-4 border-t border-neutral-100">
                            {tool.primaryHref && (
                              tool.primaryLabel === "View Folder" ? (
                                <a
                                  href="#custom-tool-requests-section"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById("custom-tool-requests-section")?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white font-semibold text-xs rounded-lg hover:bg-neutral-800 transition text-center"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Contact Joe for more info
                                </a>
                              ) : (
                                <a
                                  href={tool.primaryHref.startsWith("http") ? tool.primaryHref : `https://github.com/cogspa/joem-tools/blob/main/${tool.primaryHref}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white font-semibold text-xs rounded-lg hover:bg-neutral-800 transition text-center"
                                >
                                  {tool.primaryLabel === "Download" ? (
                                    <Download className="w-3.5 h-3.5" />
                                  ) : (
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  )}
                                  {tool.primaryLabel || "View Folder"}
                                </a>
                              )
                            )}
                            {tool.ghostHref && (
                              <a
                                href={tool.ghostHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="For Joe's Reference Only"
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-100 text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 border border-neutral-300 transition text-center"
                              >
                                <Code className="w-3.5 h-3.5" /> Chat
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </section>
        )}
        {/* Custom Tool Requests Section */}
        <section id="custom-tool-requests-section" className="mt-20 pt-16 border-t-2 border-dashed border-neutral-300">
          <div className="max-w-2xl mx-auto bg-neutral-50 border-2 border-black rounded-2xl p-8 md:p-10 shadow-lg">
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-black text-white uppercase tracking-wider mb-3">
                ✉️ Request Custom Build
              </span>
              <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black">
                Custom Tool Requests
              </h2>
              <p className="text-sm font-semibold text-neutral-700 mt-2">
                Please Fill out the following for Custom Tool Requests:
              </p>
            </div>

            {formStatus === "success" ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-8 text-center">
                <div className="flex justify-center mb-3">
                  <img
                    src="/COGSPA.png"
                    alt="COGSPA Logo"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold">Request Submitted Successfully!</h3>
                <p className="text-sm mt-2 text-emerald-700">
                  Your custom tool request has been captured in Netlify. Joe will be notified at jmicalle@gmail.com.
                </p>
                <button
                  onClick={() => setFormStatus("idle")}
                  className="mt-6 px-4 py-2.5 bg-black text-white hover:bg-neutral-800 font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  Send Another Request
                </button>
              </div>
            ) : (
              <form
                name="custom-tool-requests"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleContactSubmit}
                className="space-y-6"
              >
                {/* Netlify hidden input for SPA form detection */}
                <input type="hidden" name="form-name" value="custom-tool-requests" />

                {formStatus === "error" && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-xs font-mono">
                    ⚠️ Submission failed. Please verify your connection or try again.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="toolType" className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-2">
                      Tool Type Needed
                    </label>
                    <select
                      id="toolType"
                      name="toolType"
                      value={formData.toolType}
                      onChange={(e) => setFormData({ ...formData, toolType: e.target.value })}
                      className="w-full bg-white border-2 border-neutral-300 rounded-lg px-3 py-2 text-sm text-black focus:border-black outline-none transition"
                      required
                    >
                      <option value="Plug-in">Plug-in</option>
                      <option value="Script">Script</option>
                      <option value="React component">React component</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="integration" className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-2">
                      Software Integration
                    </label>
                    <input
                      type="text"
                      id="integration"
                      name="integration"
                      placeholder="e.g. Blender, Photoshop, Figma, Web"
                      value={formData.integration}
                      onChange={(e) => setFormData({ ...formData, integration: e.target.value })}
                      className="w-full bg-white border-2 border-neutral-300 rounded-lg px-3 py-2 text-sm text-black focus:border-black outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-2">
                    Notes Section
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    placeholder="Detail the specifications and functionality for the custom tool request..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white border-2 border-neutral-300 rounded-lg px-3 py-2 text-sm text-black focus:border-black outline-none transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border-2 border-neutral-300 rounded-lg px-3 py-2 text-sm text-black focus:border-black outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="yourname@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border-2 border-neutral-300 rounded-lg px-3 py-2 text-sm text-black focus:border-black outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-400 text-sm font-bold uppercase tracking-wider rounded-lg transition shadow-md cursor-pointer disabled:cursor-not-allowed"
                  >
                    {formStatus === "submitting" ? "Sending Request..." : "Send Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Modal Runner / Source Inspector */}
      {activeArtifact && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl border border-black flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
              <div>
                <h2 className="text-lg font-bold">{activeArtifact.title}</h2>
                <span className="font-mono text-xs opacity-70">
                  {activeArtifact.filename}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleShareLink(activeArtifact)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-neutral-400 hover:text-white transition flex items-center gap-1.5"
                  title="Copy direct URL to send to someone"
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" /> Direct Link Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" /> Share Direct Link
                    </>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("runner")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${activeTab === "runner"
                    ? "bg-white text-black border-white font-semibold"
                    : "bg-transparent text-white border-neutral-700 hover:border-neutral-500"
                    }`}
                >
                  ⚡ Live React Tool
                </button>
                <button
                  onClick={() => setActiveTab("source")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${activeTab === "source"
                    ? "bg-white text-black border-white font-semibold"
                    : "bg-transparent text-white border-neutral-700 hover:border-neutral-500"
                    }`}
                >
                  📄 .jsx Source Code
                </button>
                <button
                  onClick={closeArtifact}
                  className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition ml-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto bg-neutral-50 relative">
              {activeTab === "runner" ? (
                <div className="p-6 h-full overflow-auto text-black">
                  <ErrorBoundary key={activeArtifact.id}>
                    {React.createElement(activeArtifact.Component)}
                  </ErrorBoundary>
                </div>
              ) : (
                <div className="h-full bg-neutral-900 text-neutral-200 font-mono text-xs p-6 overflow-auto relative">
                  <button
                    onClick={handleCopyCode}
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Code className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                  <pre className="whitespace-pre wrap leading-relaxed">
                    {activeArtifact.source}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

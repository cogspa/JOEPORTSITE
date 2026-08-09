import React, { useState, useEffect } from "react";
import { X, Play, Code, Check, Filter, Link as LinkIcon, Share2 } from "lucide-react";

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

export default function ArtifactPlayground() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [activeTab, setActiveTab] = useState("runner"); // "runner" | "source"
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

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
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight mt-1">
              Artifact Playground
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-lg text-neutral-700 max-w-4xl mb-8 leading-relaxed">
          Interactive showcase of {ARTIFACT_ITEMS.length} React tools, procedural generators, 3D shading labs, color engines, and creative coding systems shipped for <strong>pLAtform</strong>. Click <strong>Explore Tool</strong> or use the dropdown to run any artifact live in full React context.
        </p>

        {/* Category Filter Tabs & Dropdown Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-4 border-b border-neutral-200">
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
                className={`px-4 py-2 rounded-full font-mono text-xs font-semibold transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-neutral-300 hover:border-black"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Secondary Dropdown Nav */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-neutral-500 uppercase">Select Artifact:</span>
            <select
              value={activeArtifact?.id || ""}
              onChange={(e) => {
                const found = ALL_TOOLS.find((item) => item.id === e.target.value);
                if (found) openArtifact(found, "runner");
              }}
              className="bg-white text-black text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-black transition cursor-pointer outline-none"
            >
              <option value="" disabled>
                Select from {ALL_TOOLS.length} Tools... ▾
              </option>
              {["brush", "3d", "color", "procedural", "ux"].map((catKey) => {
                const catItems = ARTIFACT_ITEMS.filter((i) => i.category === catKey);
                const catLabel = catItems[0]?.categoryLabel || catKey.toUpperCase();
                return (
                  <optgroup key={catKey} label={`── ${catLabel} ──`}>
                    {catItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
              <optgroup label="── UNRELEASED / EXPERIMENTAL ──">
                {UNSHIPPED_ITEMS.map((item) => (
                  <option key={item.id} value={item.id}>
                    🧪 {item.title}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Shipped Artifact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtifacts.map((art) => (
            <div
              key={art.id}
              className="border border-neutral-300 rounded-xl p-6 flex flex-col justify-between hover:border-black hover:shadow-xl transition-all bg-white"
            >
              <div>
                <div className="text-xs font-mono uppercase font-semibold text-neutral-500 mb-2">
                  {art.categoryLabel}
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

        {/* Non-Shipped Tools / Experimental Section */}
        <section className="mt-16 pt-12 border-t-2 border-dashed border-neutral-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-700 mb-1">
                <span>🧪 LAB EXPERIMENTS &amp; PROTOTYPES</span>
              </div>
              <h2 className="text-2xl font-extrabold uppercase tracking-tight">
                Non-Shipped Tools
              </h2>
              <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
                Experimental creative coding tools, interactive canvas shaders, and unreleased R&amp;D prototypes exploring generative media.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg self-start md:self-auto">
              {UNSHIPPED_ITEMS.length} Unreleased Tool{UNSHIPPED_ITEMS.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {UNSHIPPED_ITEMS.map((art) => (
              <div
                key={art.id}
                className="border-2 border-dashed border-neutral-300 rounded-xl p-6 flex flex-col justify-between hover:border-black hover:shadow-xl transition-all bg-neutral-50/70 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {art.badge || "EXPERIMENTAL"}
                </div>
                <div>
                  <div className="text-xs font-mono uppercase font-semibold text-neutral-500 mb-2">
                    {art.categoryLabel}
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
                    activeTab === "runner"
                      ? "bg-white text-black border-white font-semibold"
                      : "bg-transparent text-white border-neutral-700 hover:border-neutral-500"
                  }`}
                >
                  ⚡ Live React Tool
                </button>
                <button
                  onClick={() => setActiveTab("source")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
                    activeTab === "source"
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

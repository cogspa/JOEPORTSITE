import React, { useState, useEffect, useRef } from "react";
import { Play, Code, Clipboard, Check, Sparkles, Layers, Video, Move, Globe } from "lucide-react";

export default function ChromeGooMirror() {
  const [activeTab, setActiveTab] = useState("record");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const PROMPTS = {
    record: {
      title: "Record Performance",
      icon: Video,
      desc: "Capture WebGL canvas renders directly to high-quality video formats.",
      instructions: `Add recording to App.jsx: a Record button in the panel that captures
canvasRef via canvas.captureStream(60) into a MediaRecorder
(video/webm;codecs=vp9, fall back to vp8), shows elapsed time while
recording, and on stop downloads the file as chrome-goo-<timestamp>.webm.
Don't touch the render loop; keep the button styled like the existing
.small-btn class.`
    },
    gold: {
      title: "Gold Goo Variant",
      icon: Sparkles,
      desc: "Implement a dark liquid gold shader variant lerped dynamically via uniform inputs.",
      instructions: `In src/gooEngine.js COMP_FRAG, add a uniform float uGold (0-1) that
lerps the goo between the current cool black chrome and a dark liquid
gold: chrome tint toward vec3(0.62, 0.45, 0.18), specular toward
vec3(1.0, 0.85, 0.55), and warm up the crest-glow color. Wire it to a
"Gold" slider in App.jsx and pass it through engine.render params.`
    },
    gesture: {
      title: "Open-Palm Shockwave",
      icon: Move,
      desc: "Detect dynamic hand gestures to generate radial splat ring shockwaves.",
      instructions: `In src/tracking.js, detect an open-palm "push": all five fingertips
extended (tip further from wrist than PIP joints) AND palm z decreasing
fast (moving toward camera). When triggered, emit a ring of 8 splat
points around the palm's reflected position with strength 0.3 and
a 500ms cooldown per hand. Keep the existing pinch splash.`
    },
    floaters: {
      title: "Surface Floating Objects",
      icon: Layers,
      desc: "A lightweight 2D floating physics system sampling ripple heights dynamically.",
      instructions: `Add a floaters system: 6 small chrome spheres (drawn as radial-gradient
sprites in a 2D overlay canvas positioned above the WebGL canvas) that
sit on the waterline, bob with the ripple height sampled via
gl.readPixels of a 1px row once per frame (or estimate from injection
points), and get pushed sideways by nearby splats. Keep it under 60
lines and don't slow the main loop.`
    },
    deploy: {
      title: "Production Deploy",
      icon: Globe,
      desc: "Netlify hosting pipeline with optimized CORS / COEP policies for MediaPipe CDNs.",
      instructions: `Add a netlify.toml for this Vite app (build command "npm run build",
publish "dist") and confirm the MediaPipe CDN URLs work from a
production HTTPS origin. Note anything needing a CORS or COEP header.`
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Interactive liquid chrome simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const points = [];
    const numPoints = 12;
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: (width / (numPoints - 1)) * i,
        y: height / 2,
        targetY: height / 2,
        vy: 0,
        r: 30 + Math.random() * 20
      });
    }

    let mouse = { x: 0, y: 0, active: false };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);

    const draw = (t) => {
      ctx.fillStyle = "#0d1b2a";
      ctx.fillRect(0, 0, width, height);

      // Ripple math
      points.forEach((p, idx) => {
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const force = (100 - dist) * 0.15;
            p.targetY = height / 2 + (dy > 0 ? force : -force);
          } else {
            p.targetY = height / 2 + Math.sin(t * 0.003 + idx) * 20;
          }
        } else {
          p.targetY = height / 2 + Math.sin(t * 0.002 + idx) * 15;
        }

        p.vy += (p.targetY - p.y) * 0.1;
        p.vy *= 0.85;
        p.y += p.vy;
      });

      // Draw liquid chrome shape
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(width, points[points.length - 1].y);
      ctx.lineTo(width, height);
      ctx.closePath();

      // Shiny gradient styling
      const grad = ctx.createLinearGradient(0, height / 3, 0, height);
      grad.addColorStop(0, "#00b4d8");
      grad.addColorStop(0.3, "#0077b6");
      grad.addColorStop(0.7, "#03045e");
      grad.addColorStop(1, "#02021c");
      ctx.fillStyle = grad;
      ctx.fill();

      // Specular highlights
      ctx.beginPath();
      ctx.moveTo(0, points[0].y - 2);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y - 2, xc, yc - 2);
      }
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 4;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[550px] bg-[#020914] text-white rounded-2xl overflow-hidden font-sans border border-neutral-800 shadow-2xl">
      {/* Simulation/Interactive Column */}
      <div className="flex-1 relative flex flex-col justify-between p-8 border-b lg:border-b-0 lg:border-r border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase border border-cyan-500/30">
              UNRELEASED LAB
            </span>
            <span className="text-neutral-500 text-xs font-mono">v3.0.0-alpha</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Chrome Goo Mirror
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
            Interactive hand-tracking WebGL fluid simulation. Uses MediaPipe hands tracking to interact with liquid chrome structures.
          </p>
        </div>

        {/* Dynamic Wave Simulation */}
        <div className="my-8 h-48 w-full rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-950 relative">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 font-mono text-[10px] text-cyan-400/80 bg-black/60 px-2 py-1 rounded border border-neutral-800">
            WebGL Liquid Engine: Active (2D Mock)
          </div>
        </div>

        <div className="text-xs text-neutral-500 font-mono">
          Interactive mouse gestures emulate MediaPipe palm tracking splats.
        </div>
      </div>

      {/* Prompts/Documentation Column */}
      <div className="w-full lg:w-[480px] bg-[#040f20] p-8 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-4">
            IDE Prompts & Tasks
          </h3>
          
          {/* Tabs Grid */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {Object.keys(PROMPTS).map((key) => {
              const TabIcon = PROMPTS[key].icon;
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition ${
                    isActive
                      ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-950/40"
                      : "bg-[#091b35] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                  }`}
                  title={PROMPTS[key].title}
                >
                  <TabIcon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Active Tab Details */}
          <div className="bg-[#020a17] border border-neutral-800/80 rounded-xl p-5 mb-6">
            <h4 className="text-lg font-bold text-white mb-1">
              {PROMPTS[activeTab].title}
            </h4>
            <p className="text-xs text-neutral-400 mb-4">
              {PROMPTS[activeTab].desc}
            </p>

            {/* Instruction Code Block */}
            <div className="relative">
              <pre className="text-xs text-cyan-300/90 font-mono bg-black/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap border border-neutral-850 leading-relaxed max-h-64 overflow-y-auto">
                <code>{PROMPTS[activeTab].instructions}</code>
              </pre>
              <button
                onClick={() => handleCopy(PROMPTS[activeTab].instructions)}
                className="absolute top-2 right-2 p-1.5 bg-neutral-900/80 text-neutral-400 hover:text-white rounded border border-neutral-800 transition"
                title="Copy Prompt"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Clipboard className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 font-mono flex items-center justify-between border-t border-neutral-850 pt-4">
          <span>Target: cursor / claude code</span>
          <span>5 prompts configured</span>
        </div>
      </div>
    </div>
  );
}

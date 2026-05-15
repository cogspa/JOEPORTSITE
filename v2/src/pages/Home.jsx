import React from "react";
import HeroVideo from "../components/site/HeroVideo";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-ink">
      <HeroVideo />
      
      {/* Giant Menu Section */}
      <section className="py-24 px-6 bg-cream text-ink">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="hidden lg:block lg:col-span-3"></div>
          <div className="lg:col-span-9 flex flex-col gap-2 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
            <a href="#demo-reel" className="hover:opacity-60 transition-opacity">REEL</a>
            <div>
              <a href="#design" className="hover:opacity-60 transition-opacity">DESIGN (PRINT)</a> /{" "}
              <Link to="/print-gallery" className="text-[var(--c-green)] hover:opacity-60 transition-opacity">PRINT GALLERY</Link>
            </div>
            <a href="#case-studies" className="hover:opacity-60 transition-opacity">CASE STUDIES</a>
            <a href="#vibe-coding" className="hover:opacity-60 transition-opacity">VIBE CODING GALLERY</a>
            <Link to="/videography" className="hover:opacity-60 transition-opacity">VIDEOGRAPHY</Link>
            <a href="/animation.html" className="hover:opacity-60 transition-opacity">2D/HYBRID/STOP-MOTION ANIMATION</a>
            
            <div className="mt-8 flex flex-col gap-4 text-lg md:text-xl font-medium tracking-normal">
              <a href="https://monsterrig.blogspot.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Zbrush Character Models
              </a>
              <a href="https://jmicallefprofport.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Joe Micallef Educator Portfolio - Classes & Curriculum
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Reel Text */}
      <section id="demo-reel" className="py-24 px-6 bg-ink text-cream">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-none">
              DEMO<br />REEL
            </h2>
            <div className="text-lg text-cream/80 max-w-sm mb-6">
              This reel features selected work samples that highlight my experience in animation, VFX, and compositing using:
              <ul className="list-disc ml-6 mt-4 flex flex-col gap-1 text-cream/70">
                <li>Maya</li>
                <li>Houdini</li>
                <li>Blender</li>
                <li>After Effects</li>
                <li>Nuke</li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="aspect-video bg-ink-2">
              <video src="/video/JoeMicallefDemoReel.mp4" autoPlay loop muted playsInline controls className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Design Gallery Preview */}
      <section id="design" className="py-24 bg-cream text-ink overflow-hidden border-t border-ink/10">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none">
            DESIGN GALLERY
          </h2>
          <p className="text-lg max-w-md text-ink/80">
            Samples of various print projects from my time spent as a Graphic Designer
          </p>
        </div>
        <div className="w-full overflow-hidden gallery-track-container pause-on-hover py-8">
          <div className="flex w-max animate-scroll-left">
            {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((num, i) => (
              <img key={i} src={`/port_art/A${num}.png`} alt={`Gallery Preview ${num}`} className="h-[400px] w-auto mx-4 object-cover mix-blend-multiply" loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="py-24 px-6 bg-ink text-cream">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 leading-none">
            CASE<br />STUDIES
          </h2>
          <div className="aspect-video bg-ink-2 w-full max-w-5xl">
            <video src="/video/JoeMIcallef_PartSmart_CaseStudy.mp4#t=0.001" preload="metadata" playsInline controls className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Vibe Coding Gallery */}
      <section id="vibe-coding" className="py-24 px-6 bg-cream text-ink">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-none">
            VIBE CODING<br />GALLERY
          </h2>
          <div className="max-w-3xl text-lg text-ink/80 flex flex-col gap-4 mb-16">
            <p>This gallery highlights a collection of AI-assisted web, design, and creative technology projects built through rapid prototyping, iterative development, and hands-on experimentation. These projects were created using a mix of AI coding tools, modern web frameworks, 3D workflows, and generative media platforms to move quickly from concept to functional prototype.</p>
            <p className="text-sm">The work includes interactive web experiences, AI-driven galleries, educational tools, world-model research prototypes, Blender scripting, presentation systems, and experimental creative platforms. Many of these projects were developed through a “vibe coding” process — using tools like ChatGPT, Claude, Gemini, Cursor, Windsurf, Antigravity, Lovable, Firebase, Netlify, React, JavaScript, HTML/CSS, Three.js, Blender, Python, Figma, Midjourney, Higgsfield, Kling, Meshy.ai, and other AI production tools to explore ideas, build interfaces, solve technical problems, and rapidly iterate toward polished outcomes.</p>
            <p className="text-sm">My GitHub activity reflects this momentum, with 300+ yearly contributions and multiple public repositories connected to creative coding, AI workflows, teaching, animation, design systems, and emerging world-model research. This page represents how I use AI not simply to generate code, but to extend my creative direction, production experience, and technical imagination into working software.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              { title: "Muybridge Machine", url: "https://www.muybridgemachine.com/", img: "muybridge_machine.png" },
              { title: "Cogspa Curios", url: "https://cogspacurios.com/", img: "cogspcurios.png" },
              { title: "Worldbuilder Workshop", url: "https://worldbuilderworkshop.com/", img: "worldbuilderworkshop.png" },
              { title: "Unpromptable Gallery", url: "https://unpromptable-gallery.netlify.app/", img: "unpromptable-gallery.png" },
              { title: "World Model Research", url: "https://worldmodelresearch.com/", img: "worldmodelresearch.png" },
              { title: "GIF Dither Lab", url: "https://gif-dither-lab.netlify.app/", img: "gif-dither-lab.png" },
              { title: "Volvo Driver", url: "https://volvo-driver.netlify.app/", img: "volvo-driver.png" },
              { title: "Anomaly X", url: "https://anomalyx.netlify.app/", img: "anomalyx.png" },
              { title: "Node Path AI", url: "https://nodepath.ai/", img: "nodepath.png" },
              { title: "All AI Automotive", url: "https://all-ai-automotive.netlify.app/", img: "all-ai-automotive.png" },
            ].map((proj, i) => (
              <a key={i} href={proj.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-3">
                <h3 className="font-medium text-xl group-hover:text-primary transition-colors">{proj.title}</h3>
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-ink/5">
                  <img src={`/webthumbs/${proj.img}`} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

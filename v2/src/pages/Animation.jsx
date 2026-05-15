import React from "react";

const ANIMATIONS = [
  {
    title: "Mind Wiggles",
    src: "https://www.youtube.com/embed/XguKsssIP_k?si=AepvcoWRKySpMvt9",
    description: (
      <>
        <p className="mb-4">A wacky, whimsical journey following a "stream of consciousness".</p>
        <p>Hand drawn and painted, traditional cell animation shot on an Oxberry camera by Joe Micallef. With a musical score by Austin Wintory.</p>
      </>
    )
  },
  {
    title: "The Interlopers",
    src: "https://www.youtube.com/embed/g59mluClY8k?si=iAIIQZJtYCFfRJC6",
    description: (
      <p>Scary stop motion animation based on the classic short story by Saki.<br/>Animated, designed and directed by Joe Micallef and Jan Pfenninger.</p>
    )
  },
  {
    title: "Tully Explains Emotion",
    src: "https://www.youtube.com/embed/KAaDj3NkBdc?si=bD35mfEGrwY1By31",
    description: (
      <>
        <p className="mb-4">An animated sequence I created for Brian Keithley's film "Tully and Elsa". The animatronic Tully was created by Nacho Diaz at Plan 9 FX.</p>
        <p>It may look like flash, but this is entirely hand-drawn and scanned into After Effects. The spaceship at the beginning was modeled in Maya and rendered as vector graphics. The space scene was and various effects were created in Maya as well.</p>
      </>
    )
  },
  {
    title: "Urban Relations of the Lower Phylums",
    src: "https://www.youtube.com/embed/IjNRoiMx14w?si=4ObL_wW9cCF99ZxQ",
    description: (
      <p>A hybrid, experimental short, combining hand-drawn walk cycles and textures in Maya and composited in After Effects.</p>
    )
  }
];

export default function Animation() {
  return (
    <div className="min-h-screen bg-ink text-cream pt-32 pb-24 flex flex-col">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-primary">
          2D/HYBRID/STOP-MOTION ANIMATION
        </h1>
        <p className="text-xl md:text-2xl font-light text-cream/70 max-w-4xl mb-24 leading-relaxed">
          Some early examples of my hand drawn, hybrid and stop-motion animation. I still enjoy hand-drawn animation, and to this day teach a 2D animation night class at Pasadena City College. Currently I'm using Blender Grease Pencil and Moho for 2D projects.
        </p>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {ANIMATIONS.map((anim, i) => (
            <div key={i} className="flex flex-col">
              <h4 className="text-2xl md:text-3xl font-medium mb-6">{anim.title}</h4>
              <div className="w-full aspect-video bg-ink-2 rounded-lg overflow-hidden mb-6">
                <iframe 
                  src={anim.src} 
                  className="w-full h-full border-none" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen 
                />
              </div>
              <div className="text-lg font-light text-cream/80 leading-relaxed">
                {anim.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

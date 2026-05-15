import React from "react";

const IMAGES = [
  "/port_art/A1.png",
  "/port_art/A2.png",
  "/port_art/A3.png",
  "/port_art/A4.png",
  "/port_art/A5.png",
  "/port_art/A6.png",
];

export default function PrintGallery() {
  return (
    <div className="min-h-screen bg-cream text-ink pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-[var(--c-green)]">
          PRINT GALLERY
        </h1>
        <p className="text-xl md:text-2xl font-light text-ink/70 max-w-2xl">
          A collection of print layouts, typography, and visual design crafted for physical mediums.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {IMAGES.map((src, i) => (
            <div key={i} className="aspect-[3/4] overflow-hidden bg-ink/5 group relative shadow-lg">
              <img
                src={src}
                alt={`Print artwork ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-ink/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-cream font-mono tracking-widest text-sm border border-cream/30 px-4 py-2">
                  VIEW PROJECT
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

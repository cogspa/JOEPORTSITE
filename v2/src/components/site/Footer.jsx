import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-ink-2 text-cream py-12 px-6 border-t border-cream/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">JOE MICALLEF</h3>
          <p className="text-cream/60 max-w-md">
            Crafting digital experiences, animation, and visual effects with precision.
          </p>
        </div>
        <div className="flex gap-6">
          <a href="https://github.com/cogspa" className="hover:text-primary transition-colors">GitHub</a>
          <a href="https://linkedin.com" className="hover:text-primary transition-colors">LinkedIn</a>
          <a href="mailto:jmicalle@gmail.com" className="hover:text-primary transition-colors">Email</a>
        </div>
      </div>
    </footer>
  );
}

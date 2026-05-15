import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Main Menu - Blended only when scrolled */}
      <nav className={`fixed top-0 left-0 w-full z-50 flex items-start justify-between px-6 py-4 text-white pointer-events-none transition-all duration-300 ${isScrolled ? "mix-blend-difference" : ""}`}>
        <Link to="/" className="text-xl font-bold tracking-tight pointer-events-auto" onClick={() => setIsOpen(false)}>
          JOE MICALLEF
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex flex-col items-end gap-1.5 pointer-events-auto">
          <div className="flex flex-wrap justify-end items-center gap-x-6 gap-y-2 text-[12px] font-medium tracking-wide">
            <a href="/#demo-reel" className="hover:text-primary transition-colors">REEL</a>
            
            <span className="flex items-center gap-1">
              <a href="/#design" className="hover:text-primary transition-colors">DESIGN (PRINT)</a> / 
              <Link to="/print-gallery" className="hover:text-[var(--c-green)] transition-colors">PRINT GALLERY</Link>
            </span>

            <a href="/#case-studies" className="hover:text-primary transition-colors">CASE STUDIES</a>
            <a href="/#vibe-coding" className="hover:text-primary transition-colors">VIBE CODING GALLERY</a>
            <Link to="/videography" className="hover:text-primary transition-colors">VIDEOGRAPHY</Link>
            <Link to="/animation" className="hover:text-primary transition-colors">2D/HYBRID/STOP-MOTION ANIMATION</Link>
            <a href="mailto:jmicalle@gmail.com" className="hover:text-primary transition-colors">CONTACT</a>
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden pointer-events-auto text-white p-1 relative z-[110]"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? (
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 14h20M4 7h20M4 21h20"/>
            </svg>
          )}
        </button>
      </nav>

      {/* Desktop Secondary Menu - Not Blended */}
      <div className="hidden md:flex fixed top-0 left-0 w-full z-40 flex-col items-end px-6 py-4 pointer-events-none">
        <div className="mt-[24px] flex flex-wrap justify-end items-center gap-x-6 text-[11px] font-medium tracking-wide text-[#8B0000] pointer-events-auto">
          <a href="https://monsterrig.blogspot.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">Zbrush Character Models</a>
          <a href="https://jmicallefprofport.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">Joe Micallef Educator Portfolio - Classes & Curriculum</a>
        </div>
      </div>

      {/* Mobile Fullscreen Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden bg-transparent mix-blend-difference text-white px-6 pt-24 pb-4 flex flex-col overflow-y-auto">

          <div className="flex flex-col items-center justify-center gap-4 text-lg font-medium tracking-wide pb-12 w-full text-center">
            <a href="/#demo-reel" className="bg-yellow-400/[.79] w-full max-w-[280px] py-3 rounded hover:bg-yellow-400/90 transition-colors" onClick={() => setIsOpen(false)}>REEL</a>
            <a href="/#design" className="bg-yellow-400/[.79] w-full max-w-[280px] py-3 rounded hover:bg-yellow-400/90 transition-colors" onClick={() => setIsOpen(false)}>DESIGN (PRINT)</a>
            <Link to="/print-gallery" className="bg-yellow-400/[.79] w-full max-w-[280px] py-3 rounded text-[var(--c-green)] hover:bg-yellow-400/90 transition-colors" onClick={() => setIsOpen(false)}>PRINT GALLERY</Link>
            <a href="/#case-studies" className="bg-yellow-400/[.79] w-full max-w-[280px] py-3 rounded hover:bg-yellow-400/90 transition-colors" onClick={() => setIsOpen(false)}>CASE STUDIES</a>
            <a href="/#vibe-coding" className="bg-yellow-400/[.79] w-full max-w-[280px] py-3 rounded hover:bg-yellow-400/90 transition-colors" onClick={() => setIsOpen(false)}>VIBE CODING GALLERY</a>
            <Link to="/videography" className="bg-yellow-400/[.79] w-full max-w-[280px] py-3 rounded hover:bg-yellow-400/90 transition-colors" onClick={() => setIsOpen(false)}>VIDEOGRAPHY</Link>
            <Link to="/animation" className="bg-yellow-400/[.79] w-full max-w-[280px] py-3 rounded hover:bg-yellow-400/90 transition-colors" onClick={() => setIsOpen(false)}>2D/HYBRID/STOP-MOTION ANIMATION</Link>
            <a href="mailto:jmicalle@gmail.com" className="bg-yellow-400/[.79] w-full max-w-[280px] py-3 rounded hover:bg-yellow-400/90 transition-colors" onClick={() => setIsOpen(false)}>CONTACT</a>
            
            <div className="h-px bg-white/30 my-4 w-1/4" />
            
            {/* Using white so it perfectly inverts against the transparent background */}
            <a href="https://monsterrig.blogspot.com/" target="_blank" rel="noopener noreferrer" className="bg-yellow-400/[.79] w-full max-w-[280px] py-3 rounded hover:bg-yellow-400/90 transition-opacity text-sm" onClick={() => setIsOpen(false)}>
              Zbrush Character Models
            </a>
            <a href="https://jmicallefprofport.com/" target="_blank" rel="noopener noreferrer" className="bg-yellow-400/[.79] w-full max-w-[280px] py-3 rounded hover:bg-yellow-400/90 transition-opacity text-sm" onClick={() => setIsOpen(false)}>
              Joe Micallef Educator Portfolio
            </a>
          </div>
        </div>
      )}
    </>
  );
}

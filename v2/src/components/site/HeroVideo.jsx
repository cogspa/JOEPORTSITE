import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function HeroVideo() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !videoRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrolled = -rect.top;
      const totalScroll = rect.height - window.innerHeight;
      
      let p = Math.max(0, Math.min(1, scrolled / totalScroll));
      setProgress(p);

      if (videoRef.current.duration) {
        // Scrub video based on scroll, starting at 1.8 seconds
        videoRef.current.currentTime = 1.8 + p * (videoRef.current.duration - 1.8);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Initialize video to 1.8 seconds
    if (videoRef.current) {
      videoRef.current.currentTime = 1.8;
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="hero-wrap">
      <div className="hero-sticky">
        <video
          ref={videoRef}
          className="hero-video"
          src="/video/JoeMicallefDemoReel.mp4"
          muted
          playsInline
          preload="auto"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Hero Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-cream px-4 text-center">
          <div className="flex justify-between items-start w-full max-w-7xl px-6 absolute top-12 md:top-24" style={{ opacity: 1 - progress * 2 }}>
            <img src="/images/joe_logo.png" alt="Joe Logo" className="w-24 md:w-48 aspect-square object-cover rounded-full" />
            <img src="/images/COGSPA.png" alt="COGSPA Logo" className="w-16 md:w-32 aspect-square object-cover rounded-full" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 transition-transform duration-500 uppercase mt-24"
              style={{ transform: `translateY(${progress * -50}px)`, opacity: 1 - progress * 2 }}>
            UX • VFX • ANIMATION<br/>
            DESIGN / CODE
          </h1>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
             style={{ opacity: 1 - progress * 3 }}>
          <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-cream/30 overflow-hidden">
            <div className="w-full h-full bg-cream animate-[scroll-down_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}

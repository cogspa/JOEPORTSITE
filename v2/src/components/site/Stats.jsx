import React, { useEffect, useRef, useState } from "react";

const STATS = [
  { n: 1207, suffix: "+", label: "creative teams across the studio network" },
  { n: 47, suffix: "", label: "studios on the annual operating plan" },
  { n: 3.4, suffix: "×", label: "faster review cycle than the average tool" },
  { n: 18200, suffix: "", label: "briefs shipped through COGSPA last quarter" },
];

function Counter({ value, suffix }) {
  const [shown, setShown] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(value);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const start = performance.now();
            const dur = 1600;
            const tick = (now) => {
              const t = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - t, 3);
              setShown(value * eased);
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [value]);

  const isFloat = value % 1 !== 0;
  const display = isFloat ? shown.toFixed(1) : Math.round(shown).toLocaleString();
  return (
    <span ref={ref} className="font-display tabular-nums">
      {display}{suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative glow-bg grain">
      {/* Stats grid with animated counters */}
    </section>
  );
}

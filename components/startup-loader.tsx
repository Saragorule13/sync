"use client";

import { useEffect, useState } from "react";

export default function StartupLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hideLoader = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(hideLoader);
  }, []);

  return (
    <div
      aria-label="Loading"
      aria-hidden={!visible}
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black transition-opacity duration-500 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,230,140,0.06),transparent_25%)]" />
      <div className="relative flex items-center gap-1 font-mono text-2xl font-medium tracking-[0.2em] text-white/80" aria-label="Loading animation">
        {["s", "y", "n", "c"].map((letter, index) => (
          <span key={`${letter}-${index}`} className="sync-loader-letter" style={{ animationDelay: `${index * 120}ms` }}>
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}

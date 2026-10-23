export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,230,140,0.06),transparent_25%)]" />
      <div className="relative flex items-center gap-1 font-mono text-2xl font-medium tracking-[0.2em] text-white/80" aria-label="Loading animation">
        {["s", "y", "n", "c"].map((letter, index) => (
          <span key={`${letter}-${index}`} className="sync-loader-letter" style={{ animationDelay: `${index * 120}ms` }}>
            {letter}
          </span>
        ))}
      </div>
    </main>
  );
}

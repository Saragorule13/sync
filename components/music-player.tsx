"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Heart,
  GripVertical,
  ListMusic,
  Maximize2,
  Mic2,
  Minimize2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from "lucide-react";
import type { Track } from "@/components/session-room";

const lyrics = [
  "It’s getting late, I’m wide awake",
  "The city lights are moving slow",
  "We keep the radio on",
  "And let the night take over",
  "Stay here a little longer",
  "There’s nowhere else to go",
];

const trackThemes: Record<string, { accent: string; glow: string; base: string; secondary: string }> = {
  "1": { accent: "#f0e68c", glow: "rgba(240,230,140,0.13)", base: "#29251b", secondary: "#6e5aa7" },
  "2": { accent: "#ff9d76", glow: "rgba(255,157,118,0.14)", base: "#321d1a", secondary: "#287d80" },
  "3": { accent: "#a6e3a1", glow: "rgba(166,227,161,0.13)", base: "#192b26", secondary: "#5576b5" },
  "4": { accent: "#ffb870", glow: "rgba(255,184,112,0.14)", base: "#3a211c", secondary: "#c26b92" },
  "5": { accent: "#ff8f8f", glow: "rgba(255,143,143,0.14)", base: "#351b25", secondary: "#7450a6" },
  "6": { accent: "#a9b8ff", glow: "rgba(169,184,255,0.14)", base: "#1c2140", secondary: "#5aa5a0" },
};

const searchableTracks: Track[] = [
  { id: "1", title: "Midnight City", artist: "M83", source: "spotify", duration: "4:03" },
  { id: "2", title: "Tadow", artist: "Masego & FKJ", source: "youtube", duration: "5:03" },
  { id: "3", title: "Borderline", artist: "Tame Impala", source: "apple", duration: "3:58" },
  { id: "4", title: "Sunset Lover", artist: "Petit Biscuit", source: "spotify", duration: "3:58" },
  { id: "5", title: "Electric Feel", artist: "MGMT", source: "youtube", duration: "3:49" },
  { id: "6", title: "A Moment Apart", artist: "ODESZA", source: "apple", duration: "3:54" },
];

export default function MusicPlayer({
  queue,
  sessionKey,
  onBack,
  onQueueChange,
  isHost,
}: {
  queue: Track[];
  sessionKey: string;
  onBack: () => void;
  onQueueChange: (queue: Track[]) => void;
  isHost: boolean;
}) {
  const [currentTrack, setCurrentTrack] = useState(queue[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(28);
  const [lyricsFullscreen, setLyricsFullscreen] = useState(false);
  const [queueEditorOpen, setQueueEditorOpen] = useState(false);
  const [queueQuery, setQueueQuery] = useState("");
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"player" | "lyrics" | "queue">("player");
  const theme = trackThemes[currentTrack.id] ?? trackThemes["1"];
  const activeLyricIndex = Math.min(lyrics.length - 1, Math.floor((progress / 100) * lyrics.length));
  const lyricRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  const searchResults = searchableTracks.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(queueQuery.trim().toLowerCase()));

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => setProgress((current) => (current >= 100 ? 0 : current + 0.35)), 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    lyricRefs.current[activeLyricIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeLyricIndex]);

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setProgress(0);
    setIsPlaying(true);
  };

  const addToQueue = (track: Track) => {
    if (queue.some((queuedTrack) => queuedTrack.id === track.id)) return;
    onQueueChange([...queue, track]);
  };

  const removeFromQueue = (track: Track) => {
    const nextQueue = queue.filter((queuedTrack) => queuedTrack.id !== track.id);
    onQueueChange(nextQueue);
    if (currentTrack.id === track.id && nextQueue[0]) selectTrack(nextQueue[0]);
  };

  const reorderQueue = (targetTrackId: string) => {
    if (!draggedTrackId || draggedTrackId === targetTrackId) return;
    const fromIndex = queue.findIndex((track) => track.id === draggedTrackId);
    const toIndex = queue.findIndex((track) => track.id === targetTrackId);
    if (fromIndex < 0 || toIndex < 0) return;
    const nextQueue = [...queue];
    const [movedTrack] = nextQueue.splice(fromIndex, 1);
    nextQueue.splice(toIndex, 0, movedTrack);
    onQueueChange(nextQueue);
    setDraggedTrackId(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090b] px-5 py-5 font-[family-name:var(--font-poppins)] text-[#f5f5f7] transition-colors duration-700 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute -left-40 top-[-20rem] size-[38rem] rounded-full blur-3xl transition-colors duration-700" style={{ backgroundColor: theme.glow }} />
      <div className="pointer-events-none absolute -right-40 bottom-[-20rem] size-[38rem] rounded-full blur-3xl transition-colors duration-700" style={{ backgroundColor: theme.glow }} />
      <header className="relative mx-auto flex w-full max-w-[1500px] items-center justify-between border-b border-white/[0.08] pb-5">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"><ChevronLeft className="size-4" />Back to room</button>
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 backdrop-blur-xl"><span className="size-1.5 rounded-full bg-[#a6e3a1] shadow-[0_0_10px_#a6e3a1]" /><span className="text-xs text-white/50">Syncing live</span><span className="border-l border-white/15 pl-3 font-mono text-[11px] tracking-[0.2em] text-white/70">{sessionKey}</span></div>
      </header>

      <div className="relative mx-auto grid w-full max-w-[1500px] gap-5 py-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className={`${mobileTab === "player" ? "block" : "hidden md:block"} rounded-[2rem] border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-8`}>
          <div className="flex items-center justify-between"><div><p className="text-xs font-medium tracking-[0.24em] text-white/40 uppercase">Now playing</p><p className="mt-2 text-sm text-white/60">Shared with everyone in the room</p></div><button type="button" className="flex size-9 items-center justify-center rounded-full border border-white/10 text-white/45 transition-colors hover:bg-white/10 hover:text-white" aria-label="More player options"><MoreHorizontal className="size-5" /></button></div>
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-[minmax(260px,0.75fr)_minmax(0,1fr)]">
            <div className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#17151b] shadow-[0_24px_60px_rgba(0,0,0,0.4)] transition-all duration-700" style={{ background: `radial-gradient(circle at 30% 20%, ${theme.accent}, transparent 28%), radial-gradient(circle at 80% 70%, ${theme.secondary}, transparent 35%), linear-gradient(135deg, ${theme.base}, #111117 60%, #08080a)` }}><div className="absolute inset-0 opacity-30 mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.5)_0.7px,transparent_0.7px)] [background-size:5px_5px]" /><div className="absolute inset-x-0 bottom-0 p-6"><p className="text-[10px] font-medium tracking-[0.3em] text-white/60 uppercase">Sync sessions vol. 01</p><p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Midnight<br />frequency</p></div></div>
            <div className="min-w-0"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{currentTrack.title}</p><p className="mt-2 truncate text-base text-white/45">{currentTrack.artist}</p></div><button type="button" className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/45 transition-colors hover:border-[#f0e68c]/40 hover:text-[#f0e68c]" aria-label="Like track"><Heart className="size-4" /></button></div>
              <div className="mt-10"><input type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} aria-label="Track progress" className="h-1 w-full cursor-pointer" style={{ accentColor: theme.accent }} /><div className="mt-2 flex justify-between font-mono text-[10px] text-white/35"><span>{`${Math.floor((progress / 100) * 238 / 60)}:${String(Math.floor((progress / 100) * 238) % 60).padStart(2, "0")}`}</span><span>{currentTrack.duration}</span></div></div>
              <div className="mt-7 flex items-center justify-center gap-7"><button type="button" className="text-white/55 transition-colors hover:text-white" aria-label="Previous track"><SkipBack className="size-5 fill-current" /></button><button type="button" onClick={() => setIsPlaying((playing) => !playing)} className="flex size-14 items-center justify-center rounded-full text-[#151923] transition-transform duration-300 hover:scale-105" style={{ backgroundColor: theme.accent, boxShadow: `0 8px 28px ${theme.glow}` }} aria-label={isPlaying ? "Pause track" : "Play track"}>{isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}</button><button type="button" className="text-white/55 transition-colors hover:text-white" aria-label="Next track"><SkipForward className="size-5 fill-current" /></button></div>
              <div className="mt-8 flex items-center justify-center gap-4 text-white/35"><Volume2 className="size-4" /><div className="h-1 w-24 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-white/50" /></div><Maximize2 className="size-4" /></div>
              <div className="mt-8 border-t border-white/[0.08] pt-5"><div className="flex items-center justify-between text-[10px] font-medium tracking-[0.2em] text-white/35 uppercase"><span>Live waveform</span><span>{isPlaying ? "Playing" : "Paused"}</span></div><div className="mt-3 flex h-8 items-center justify-between gap-1 overflow-hidden">{Array.from({ length: 30 }, (_, index) => <span key={index} className="player-wave-bar flex-1 rounded-full" style={{ height: `${22 + ((index * 17) % 62)}%`, backgroundColor: theme.accent, animationDelay: `${index * 45}ms`, animationPlayState: isPlaying ? "running" : "paused" }} />)}</div></div>
            </div>
          </div>
        </section>

        <div className={`${mobileTab === "player" ? "hidden md:grid" : "grid"} gap-5 md:grid-cols-2 xl:grid-cols-1`}>
          <section className={`${mobileTab === "lyrics" ? "block" : "hidden md:block"} ${lyricsFullscreen ? "fixed inset-4 z-50 flex flex-col bg-[#111114]/95 p-6 shadow-2xl backdrop-blur-3xl sm:inset-8 sm:p-10" : "rounded-[2rem] border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.2)] backdrop-blur-2xl sm:p-7"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Mic2 className="size-4 text-white/60" /><h2 className="text-sm font-medium">Lyrics</h2></div>
              <div className="flex items-center gap-3"><span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[10px] text-white/40">Live</span><button type="button" onClick={() => setLyricsFullscreen((fullscreen) => !fullscreen)} className="flex size-8 items-center justify-center rounded-full border border-white/10 text-white/45 transition-colors hover:bg-white/10 hover:text-white" aria-label={lyricsFullscreen ? "Exit fullscreen lyrics" : "Open fullscreen lyrics"}>{lyricsFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</button></div>
            </div>
            <div className={`mt-6 space-y-5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${lyricsFullscreen ? "flex-1 py-8 sm:max-w-3xl sm:py-16" : "max-h-60"}`}>
              {lyrics.map((line, index) => { const isActive = index === activeLyricIndex; const distance = Math.abs(index - activeLyricIndex); return <p key={line} ref={(element) => { lyricRefs.current[index] = element; }} aria-current={isActive ? "true" : undefined} className={`origin-left leading-tight transition-all duration-500 ${isActive ? "scale-[1.03] text-2xl font-semibold tracking-[-0.03em] sm:text-4xl" : distance === 1 ? "text-lg font-medium tracking-[-0.02em] text-white/45 sm:text-xl" : "text-lg font-medium tracking-[-0.02em] text-white/20 sm:text-xl"}`} style={isActive ? { color: theme.accent } : undefined}>{line}</p>; })}
            </div>
          </section>
          <section className={`${mobileTab === "queue" ? "block" : "hidden md:block"} rounded-[2rem] border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.2)] backdrop-blur-2xl sm:p-7`}>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><ListMusic className="size-4 text-white/60" /><h2 className="text-sm font-medium">Queue</h2></div><div className="flex items-center gap-3"><span className="text-xs text-white/35">{queue.length} songs</span>{isHost && <button type="button" onClick={() => setQueueEditorOpen((open) => !open)} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/55 transition-colors hover:bg-white/10 hover:text-white">{queueEditorOpen ? "Done" : "Edit queue"}</button>}</div></div>
            {isHost && queueEditorOpen && <div className="mt-4"><div className="relative"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/35" /><input value={queueQuery} onChange={(event) => setQueueQuery(event.target.value)} placeholder="Search songs to add" aria-label="Search songs to add" className="w-full rounded-xl border border-white/[0.09] bg-black/20 py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/25 focus:border-white/30" /></div><div className="mt-2 max-h-36 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{searchResults.map((track) => { const alreadyQueued = queue.some((queuedTrack) => queuedTrack.id === track.id); return <div key={track.id} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/[0.05]"><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{track.title}</p><p className="truncate text-[10px] text-white/35">{track.artist}</p></div><button type="button" onClick={() => addToQueue(track)} disabled={alreadyQueued} className="flex size-6 items-center justify-center rounded-full border border-white/10 text-white/50 hover:bg-white/10 disabled:opacity-20" aria-label={`Add ${track.title} to queue`}><Plus className="size-3" /></button></div>; })}</div></div>}
            <div className="mt-5 space-y-1">{queue.map((track, index) => <div key={track.id} draggable={isHost && queueEditorOpen} onDragStart={() => setDraggedTrackId(track.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorderQueue(track.id)} onDragEnd={() => setDraggedTrackId(null)} className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${currentTrack.id === track.id ? "bg-white/[0.1]" : "hover:bg-white/[0.05]"} ${draggedTrackId === track.id ? "opacity-40" : ""}`}><button type="button" onClick={() => selectTrack(track)} className="flex min-w-0 flex-1 items-center gap-3 text-left">{isHost && queueEditorOpen && <GripVertical className="size-3.5 shrink-0 cursor-grab text-white/25 active:cursor-grabbing" />}<span className="w-4 text-center font-mono text-[10px] text-white/30">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{track.title}</span><span className="mt-1 block truncate text-xs text-white/35">{track.artist}</span></span></button><span className="font-mono text-[10px] text-white/30">{track.duration}</span>{isHost && queueEditorOpen && <button type="button" onClick={() => removeFromQueue(track)} className="flex size-6 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white" aria-label={`Remove ${track.title} from queue`}><X className="size-3.5" /></button>}</div>)}</div>
          </section>
        </div>
      </div>
      <nav className="fixed inset-x-4 bottom-4 z-40 grid grid-cols-3 rounded-2xl border border-white/10 bg-[#161619]/90 p-1.5 shadow-2xl backdrop-blur-2xl md:hidden" aria-label="Player sections">
        {(["player", "lyrics", "queue"] as const).map((tab) => (
          <button key={tab} type="button" onClick={() => setMobileTab(tab)} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium capitalize transition-colors ${mobileTab === tab ? "bg-white/10 text-white" : "text-white/40"}`}>
            {tab === "player" ? <Play className="size-4 fill-current" /> : tab === "lyrics" ? <Mic2 className="size-4" /> : <ListMusic className="size-4" />}
            {tab}
          </button>
        ))}
      </nav>
      {mobileTab !== "player" && (
        <div className="fixed inset-x-4 bottom-[5.4rem] z-40 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1a1a1e]/95 p-2.5 shadow-2xl backdrop-blur-2xl md:hidden">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold text-[#151923]" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})` }}>
            {currentTrack.title.slice(0, 1)}
          </div>
          <button type="button" onClick={() => setMobileTab("player")} className="min-w-0 flex-1 text-left">
            <p className="truncate text-xs font-medium text-white">{currentTrack.title}</p>
            <p className="mt-0.5 truncate text-[10px] text-white/40">{currentTrack.artist}</p>
          </button>
          <button type="button" onClick={() => setIsPlaying((playing) => !playing)} className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#151923]" style={{ backgroundColor: theme.accent }} aria-label={isPlaying ? "Pause track" : "Play track"}>
            {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
          </button>
        </div>
      )}
    </main>
  );
}

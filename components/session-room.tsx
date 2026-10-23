"use client";

import { useMemo, useState } from "react";
import {
  Apple,
  ChevronLeft,
  ListMusic,
  Music2,
  Play,
  Plus,
  Search,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import MusicPlayer from "@/components/music-player";

type Source = "spotify" | "youtube" | "apple";

export type Track = {
  id: string;
  title: string;
  artist: string;
  source: Source;
  duration: string;
};

const catalog: Track[] = [
  { id: "1", title: "Midnight City", artist: "M83", source: "spotify", duration: "4:03" },
  { id: "2", title: "Tadow", artist: "Masego & FKJ", source: "youtube", duration: "5:03" },
  { id: "3", title: "Borderline", artist: "Tame Impala", source: "apple", duration: "3:58" },
  { id: "4", title: "Sunset Lover", artist: "Petit Biscuit", source: "spotify", duration: "3:58" },
  { id: "5", title: "Electric Feel", artist: "MGMT", source: "youtube", duration: "3:49" },
  { id: "6", title: "A Moment Apart", artist: "ODESZA", source: "apple", duration: "3:54" },
];

const sourceDetails: Record<Source, { label: string; description: string; icon: typeof Music2 }> = {
  spotify: { label: "Spotify", description: "Import a Spotify playlist", icon: Music2 },
  youtube: { label: "YouTube Music", description: "Import from YouTube Music", icon: Video },
  apple: { label: "Apple Music", description: "Import an Apple Music playlist", icon: Apple },
};

const sourceColor: Record<Source, string> = {
  spotify: "#a6e3a1",
  youtube: "#ff8f8f",
  apple: "#f0e68c",
};

export default function SessionRoom({
  isHost,
  sessionKey,
  onLeave,
}: {
  isHost: boolean;
  sessionKey: string;
  onLeave: () => void;
}) {
  const [activeSource, setActiveSource] = useState<Source>("spotify");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [query, setQuery] = useState("");
  const [queue, setQueue] = useState<Track[]>([catalog[0], catalog[3]]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [activities, setActivities] = useState([
    { id: "1", text: "Alex joined the room", time: "just now" },
    { id: "2", text: "You created the session", time: "1m ago" },
  ]);

  const participants = isHost
    ? [
        { name: "You", role: "Host", initials: "YO", active: true },
        { name: "Alex", role: "Listener", initials: "AL", active: true },
        { name: "Maya", role: "Listener", initials: "MA", active: true },
      ]
    : [
        { name: "Alex", role: "Host", initials: "AL", active: true },
        { name: "You", role: "Listener", initials: "YO", active: true },
      ];

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return catalog.slice(0, 4);
    return catalog.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(normalized));
  }, [query]);

  const addToQueue = (track: Track) => {
    if (queue.some((queuedTrack) => queuedTrack.id === track.id)) return;
    setQueue((currentQueue) => [...currentQueue, track]);
    setActivities((current) => [{ id: Date.now().toString(), text: `You added ${track.title}`, time: "just now" }, ...current].slice(0, 4));
  };

  const importPlaylist = () => {
    if (!playlistUrl.trim()) return;
    setQueue((currentQueue) => [
      ...currentQueue,
      ...catalog.filter((track) => track.source === activeSource && !currentQueue.some((item) => item.id === track.id)),
    ]);
    setImportMessage(`${sourceDetails[activeSource].label} playlist ready to sync.`);
    setPlaylistUrl("");
    setActivities((current) => [{ id: Date.now().toString(), text: `You imported a ${sourceDetails[activeSource].label} playlist`, time: "just now" }, ...current].slice(0, 4));
  };

  if (sessionStarted && isHost) {
    return <MusicPlayer queue={queue} sessionKey={sessionKey} isHost={isHost} onQueueChange={setQueue} onBack={() => setSessionStarted(false)} />;
  }

  return (
    <main className="min-h-screen bg-[#0b0b0d] px-5 py-6 font-[family-name:var(--font-poppins)] text-[#f5f5f7] sm:px-10 lg:px-16">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,230,140,0.08),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.045),transparent_28%)]" />
      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between border-b border-white/[0.08] pb-5">
        <button type="button" onClick={onLeave} className="group flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white">
          <ChevronLeft className="size-4" />
          Leave room
        </button>
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <span className="size-2 rounded-full bg-[#a6e3a1] shadow-[0_0_12px_#a6e3a1]" />
          <span className="text-xs text-white/55">Session</span>
          <span className="border-l border-white/15 pl-3 font-mono text-xs tracking-[0.22em] text-white">{sessionKey}</span>
        </div>
      </header>

      <div className="relative mx-auto grid w-full max-w-7xl gap-5 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[1.75rem] border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.22em] text-white/45 uppercase">{isHost ? "Host controls" : "Listening room"}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Build the queue together.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                {isHost ? "Import a playlist or add individual tracks for everyone in the session." : "Suggest tracks and follow along with the shared queue."}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-3 py-2 text-xs text-white/50">
              <span className="size-1.5 rounded-full bg-[#a6e3a1] shadow-[0_0_10px_#a6e3a1]" />
              {participants.length} participants
            </div>
          </div>

          {isHost ? (
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <div>
                <p className="text-sm font-medium">{sessionStarted ? "Your session is live" : "Ready when you are"}</p>
                <p className="mt-1 text-xs text-white/40">
                  {sessionStarted ? "Everyone can now listen together." : "Start when your queue is ready."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSessionStarted(true)}
                disabled={sessionStarted || queue.length === 0}
                className="flex items-center gap-2 rounded-xl bg-[#f0e68c] px-5 py-3 text-sm font-semibold text-[#151923] transition-all hover:bg-[#f5eca8] hover:shadow-[0_8px_24px_rgba(240,230,140,0.16)] disabled:cursor-default disabled:bg-[#a6e3a1] disabled:opacity-100"
              >
                <Play className="size-4 fill-current" />
                {sessionStarted ? "Session started" : "Start session"}
              </button>
            </div>
          ) : (
            <div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-white/55">
              <span className={`size-2 rounded-full ${sessionStarted ? "bg-[#a6e3a1] shadow-[0_0_12px_#a6e3a1]" : "animate-pulse bg-[#f0e68c]"}`} />
              {sessionStarted ? "The host has started the session." : "Waiting for the host to start the session."}
            </div>
          )}

          {isHost && (
            <div className="mt-8">
              <div className="grid gap-3 sm:grid-cols-3">
                {(Object.keys(sourceDetails) as Source[]).map((source) => {
                  const detail = sourceDetails[source];
                  const Icon = detail.icon;
                  const selected = source === activeSource;
                  return (
                    <button
                      key={source}
                      type="button"
                      onClick={() => { setActiveSource(source); setImportMessage(""); }}
                      className={`rounded-2xl border p-4 text-left transition-all ${selected ? "border-white/20 bg-white/[0.1] shadow-[0_12px_32px_rgba(0,0,0,0.15)]" : "border-white/[0.08] bg-black/15 hover:border-white/15 hover:bg-white/[0.06]"}`}
                    >
                      <Icon className="size-5" style={{ color: sourceColor[source] }} />
                      <p className="mt-4 text-sm font-medium">{detail.label}</p>
                      <p className="mt-1 text-xs text-white/45">{detail.description}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <ListMusic className="size-4 text-white/60" />
                  Import a playlist from {sourceDetails[activeSource].label}
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={playlistUrl}
                    onChange={(event) => setPlaylistUrl(event.target.value)}
                    placeholder="Paste playlist link"
                    aria-label="Playlist link"
                    className="min-w-0 flex-1 rounded-xl border border-white/[0.09] bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30"
                  />
                  <button type="button" onClick={importPlaylist} className="rounded-xl bg-[#f0e68c] px-5 py-3 text-sm font-semibold text-[#151923] transition-all hover:bg-[#f5eca8] hover:shadow-[0_8px_24px_rgba(240,230,140,0.16)]">
                    Import playlist
                  </button>
                </div>
                {importMessage && <p className="mt-3 text-xs text-[#a6e3a1]">{importMessage}</p>}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-white/[0.08] pt-7">
            <div className="flex items-center gap-2 text-sm font-medium text-white/85">
              <Sparkles className="size-4 text-white/60" />
              Search and add songs
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by song or artist"
                aria-label="Search songs"
                className="w-full rounded-xl border border-white/[0.09] bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30"
              />
            </div>
            <div className="mt-3 divide-y divide-white/[0.08]">
              {results.map((track) => (
                <div key={track.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{track.title}</p>
                    <p className="mt-1 truncate text-xs text-white/45">{track.artist} · {track.duration}</p>
                  </div>
                  <button type="button" onClick={() => addToQueue(track)} disabled={queue.some((item) => item.id === track.id)} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-white/55 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-default disabled:opacity-25" aria-label={`Add ${track.title} to queue`}>
                    <Plus className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded-[1.75rem] border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.22em] text-white/45 uppercase">Up next</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Shared queue</h2>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/55">{queue.length} tracks</span>
          </div>
          <div className="mt-7 space-y-2">
            {queue.map((track, index) => (
              <div key={track.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/15 p-3 transition-colors hover:bg-white/[0.05]">
                <span className="w-5 text-center font-mono text-xs text-white/30">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{track.title}</p>
                  <p className="mt-1 truncate text-xs text-white/40">{track.artist}</p>
                </div>
                <span className="font-mono text-[11px] text-white/35">{track.duration}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-white/[0.08] pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="size-4 text-white/60" />
                Participants
              </div>
              <span className="text-xs text-white/40">{participants.length} here</span>
            </div>
            <div className="mt-4 space-y-2">
              {participants.map((participant) => (
                <div key={participant.name} className="flex items-center gap-3 rounded-xl bg-black/15 px-3 py-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white/70">
                    {participant.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{participant.name}</p>
                    <p className="text-[11px] text-white/35">{participant.role}</p>
                  </div>
                  <span className={`size-1.5 rounded-full ${participant.active ? "bg-[#a6e3a1]" : "bg-white/20"}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 border-t border-white/[0.08] pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-white/60" />
                Room activity
              </div>
              <span className="text-xs text-white/35">Live preview</span>
            </div>
            <div className="mt-4 space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#f0e68c] shadow-[0_0_8px_#f0e68c]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-5 text-white/60">{activity.text}</p>
                    <p className="mt-0.5 text-[10px] text-white/30">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-7 rounded-2xl border border-dashed border-white/[0.1] p-4 text-center text-xs leading-5 text-white/40">
            Everyone in the room sees queue changes in real time once the session backend is connected.
          </div>
        </aside>
      </div>
    </main>
  );
}

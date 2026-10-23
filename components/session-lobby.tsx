"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SessionRoom from "@/components/session-room";
import { DitherShader } from "@/components/ui/dither-shader";

type Mode = "create" | "join";

const createKey = () => Math.floor(100000 + Math.random() * 900000).toString();

function SignalLock({ code, isGenerating }: { code: string; isGenerating: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="relative size-[min(88vw,42rem)]">
        <div className="signal-ring absolute inset-[20%] rounded-full border border-[#f0e68c]/10" />
        <div className="signal-ring signal-ring-delay absolute inset-[12%] rounded-full border border-[#f0e68c]/10" />
        <div className="signal-ring signal-ring-slow absolute inset-0 rounded-full border border-white/[0.045]" />
        <div className="absolute inset-[28%] rounded-full bg-[#f0e68c]/[0.04] blur-3xl" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-[10px] font-medium tracking-[0.35em] text-white/35 uppercase">
            <span className={`size-1.5 rounded-full ${isGenerating ? "animate-pulse bg-[#f0e68c]" : "bg-[#a6e3a1] shadow-[0_0_12px_#a6e3a1]"}`} />
            {isGenerating ? "Locking signal" : "Room signal"}
          </div>
          <div className="mt-7 flex gap-1.5 sm:gap-2">
            {code.split("").map((character, index) => (
              <div key={`${character}-${index}`} className="signal-digit flex size-10 items-center justify-center rounded-xl border border-white/[0.13] bg-white/[0.07] font-mono text-xl font-medium text-white shadow-[0_8px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:size-14 sm:rounded-2xl sm:text-2xl" style={{ animationDelay: `${index * 100}ms` }}>
                {character}
              </div>
            ))}
          </div>
          <div className="mt-8 flex h-7 items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => <span key={index} className="signal-bar w-1 rounded-full bg-[#f0e68c]/75" style={{ height: `${18 + ((index * 19) % 70)}%`, animationDelay: `${index * 55}ms` }} />)}
          </div>
          <p className="mt-5 text-xs text-white/35">{isGenerating ? "Finding a clear frequency" : "Share this signal with your crew"}</p>
        </div>
      </div>
    </div>
  );
}

export default function SessionLobby({ initialMode = "create" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [sessionKey, setSessionKey] = useState("------");
  const [isGenerating, setIsGenerating] = useState(initialMode === "create");
  const [joinKey, setJoinKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (mode !== "create") return;

    const scramble = setInterval(() => setSessionKey(createKey()), 55);
    const settle = setTimeout(() => {
      clearInterval(scramble);
      setSessionKey(createKey());
      setIsGenerating(false);
    }, 780);

    return () => {
      clearInterval(scramble);
      clearTimeout(settle);
    };
  }, [mode]);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setCopied(false);
    setIsGenerating(nextMode === "create");
  };

  if (entered) {
    return (
      <SessionRoom
        isHost={mode === "create"}
        sessionKey={mode === "create" ? sessionKey : joinKey}
        onLeave={() => setEntered(false)}
      />
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-6 font-[family-name:var(--font-poppins)] text-white">
      <DitherShader
        videoSrc="/bg1.mp4"
        gridSize={3}
        ditherMode="bayer"
        colorMode="duotone"
        primaryColor="#f0e68c"
        secondaryColor="#08090d"
        backgroundColor="#08090d"
        processingScale={0.35}
        cropScale={1.08}
        threshold={0.54}
        className="absolute inset-0 z-0 opacity-25"
      />
      <SignalLock code={mode === "create" ? sessionKey : joinKey || "------"} isGenerating={mode === "create" && isGenerating} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.72)_96%)]" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black via-black/75 to-transparent" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7">
        <Link href="/" className="font-mono text-sm font-bold tracking-[0.35em] text-[#f0e68c] uppercase transition-opacity hover:opacity-70">
          Sync
        </Link>
        <div className="flex rounded-full border border-white/[0.09] bg-black/45 p-1 shadow-2xl backdrop-blur-2xl">
          {(["create", "join"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => switchMode(option)}
              className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition-colors sm:px-6 sm:text-sm ${
                mode === option
                  ? "bg-white text-[#151923] shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {option} session
            </button>
          ))}
        </div>
      </header>

      <section className="absolute inset-0 z-10 flex flex-col items-center justify-between px-4 pb-7 pt-28 sm:pb-10">
        {mode === "create" ? (
          <>
            <div className="pointer-events-none -translate-y-14 text-center sm:-translate-y-20">
              <div className="flex items-center justify-center gap-2 text-[10px] font-medium tracking-[0.35em] text-white/40 uppercase">
                <span className="size-1.5 rounded-full bg-[#f0e68c] shadow-[0_0_10px_#f0e68c]" />
                Create a listening room
              </div>
              <h1 className="mx-auto mt-5 max-w-[540px] text-3xl font-semibold leading-[1.08] tracking-[-0.05em] text-white/90 sm:text-5xl">
                Your room is ready to sound better together.
              </h1>
              <p className="mx-auto mt-6 max-w-[360px] text-sm leading-6 text-white/45">
                Invite your people with the code below, then build the soundtrack together.
              </p>
            </div>
            <div className="w-full max-w-2xl rounded-[1.75rem] border border-white/[0.12] bg-black/50 p-5 text-left shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${isGenerating ? "animate-pulse bg-[#f0e68c]" : "bg-[#a6e3a1] shadow-[0_0_12px_#a6e3a1]"}`} />
                    <p className="text-[10px] font-medium tracking-[0.28em] text-white/45 uppercase">
                      {isGenerating ? "Generating access code" : "Room access code"}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-white/50">Share it with your friends to join the room.</p>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                  <button type="button" disabled={isGenerating} onClick={async () => { await navigator.clipboard?.writeText(sessionKey); setCopied(true); }} className="rounded-xl border border-white/[0.12] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/[0.14] disabled:cursor-wait disabled:opacity-40">
                    {copied ? "Code copied" : "Copy code"}
                  </button>
                  <button type="button" disabled={isGenerating} onClick={() => setEntered(true)} className="rounded-xl bg-[#f0e68c] px-5 py-3 text-sm font-semibold text-[#151923] shadow-lg transition-all hover:bg-[#f5eca8] hover:shadow-[0_8px_24px_rgba(240,230,140,0.16)] disabled:cursor-wait disabled:opacity-50">
                    Enter session
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="pointer-events-none -translate-y-14 text-center sm:-translate-y-20">
              <div className="flex items-center justify-center gap-2 text-[10px] font-medium tracking-[0.35em] text-white/40 uppercase">
                <span className="size-1.5 rounded-full bg-[#a6e3a1] shadow-[0_0_10px_#a6e3a1]" />
                Join a listening room
              </div>
              <h1 className="mx-auto mt-5 max-w-[540px] text-3xl font-semibold leading-[1.08] tracking-[-0.05em] text-white/90 sm:text-5xl">
                Tune into your crew.
              </h1>
              <p className="mx-auto mt-6 max-w-[360px] text-sm leading-6 text-white/45">
                Enter the room signal shared by your host and start listening together.
              </p>
            </div>
            <div className="pointer-events-auto w-full max-w-2xl rounded-[1.75rem] border border-white/[0.12] bg-black/50 p-5 text-left shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${joinKey.length === 6 ? "bg-[#a6e3a1] shadow-[0_0_12px_#a6e3a1]" : "bg-white/25"}`} />
                    <p className="text-[10px] font-medium tracking-[0.28em] text-white/45 uppercase">Room access code</p>
                  </div>
                  <input
                    value={joinKey}
                    onChange={(event) => setJoinKey(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6 digits"
                    aria-label="Six-digit session code"
                    className="mt-3 w-full max-w-[250px] border-b border-white/20 bg-transparent py-2 font-mono text-2xl tracking-[0.28em] text-white outline-none transition-colors placeholder:text-sm placeholder:tracking-normal placeholder:text-white/25 focus:border-[#f0e68c]"
                  />
                </div>
                <button type="button" disabled={joinKey.length !== 6} onClick={() => setEntered(true)} className="rounded-xl bg-[#f0e68c] px-5 py-3 text-sm font-semibold text-[#151923] shadow-lg transition-all hover:bg-[#f5eca8] hover:shadow-[0_8px_24px_rgba(240,230,140,0.16)] disabled:cursor-not-allowed disabled:opacity-40">
                  Join session
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

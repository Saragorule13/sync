"use client";

import { memo, useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const ROWS = 6;
const COLS = 22;
const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";

const FlapCell = memo(function FlapCell({ value, delay }: { value: string; delay: number }) {
  const character = CHARS.includes(value.toUpperCase()) ? value.toUpperCase() : " ";
  const displayCharacter = character === " " ? "\u00a0" : character;

  return (
    <div className="relative aspect-[3/5] overflow-hidden rounded-[2px] border border-white/[0.035] bg-[#050505] text-white shadow-[0_1px_0_rgba(255,255,255,0.025)_inset,0_8px_18px_rgba(0,0,0,0.35)] [perspective:600px]">
      <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden border-b border-black bg-[#080808]">
        <span className="absolute inset-x-0 top-0 flex h-[200%] items-center justify-center font-mono text-[clamp(0.5rem,2.45vw,1.65rem)] font-semibold leading-none tracking-tight text-white">
          {displayCharacter}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[#050505]">
        <span className="absolute inset-x-0 bottom-0 flex h-[200%] items-center justify-center font-mono text-[clamp(0.5rem,2.45vw,1.65rem)] font-semibold leading-none tracking-tight text-white">
          {displayCharacter}
        </span>
      </div>
      <motion.div
        key={character}
        initial={{ rotateX: -90 }}
        animate={{ rotateX: 0 }}
        transition={{ delay, duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "bottom" }}
        className="absolute inset-x-0 top-0 z-10 flex h-1/2 items-center justify-center overflow-hidden border-b border-black bg-[#0b0b0b] backface-hidden"
      >
        <span className="absolute inset-x-0 top-0 flex h-[200%] items-center justify-center font-mono text-[clamp(0.5rem,2.45vw,1.65rem)] font-semibold leading-none tracking-tight text-white">
          {displayCharacter}
        </span>
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px bg-black" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px -translate-y-px bg-white/[0.06]" />
    </div>
  );
});

export interface TextFlippingBoardProps {
  text?: string;
  rows?: string[];
  className?: string;
}

export function TextFlippingBoard({ text = "", rows, className }: TextFlippingBoardProps) {
  const board = useMemo(() => {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));
    const lines = (rows ?? text.split("\n")).slice(0, ROWS);
    const rowOffset = Math.max(0, Math.floor((ROWS - lines.length) / 2));

    lines.forEach((line, lineIndex) => {
      const content = line.slice(0, COLS);
      const columnOffset = Math.max(0, Math.floor((COLS - content.length) / 2));
      [...content].forEach((character, characterIndex) => {
        if (columnOffset + characterIndex < COLS) {
          grid[rowOffset + lineIndex][columnOffset + characterIndex] = character;
        }
      });
    });

    return grid;
  }, [rows, text]);

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-3xl rounded-none bg-black p-2 shadow-none",
        className,
      )}
      aria-label={text || "Text flipping board"}
    >
      <div
        className="grid gap-px sm:gap-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {board.map((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <FlapCell
              key={`${rowIndex}-${columnIndex}`}
              value={value}
              delay={columnIndex * 0.003 + rowIndex * 0.002}
            />
          )),
        )}
      </div>
    </div>
  );
}

export default TextFlippingBoard;

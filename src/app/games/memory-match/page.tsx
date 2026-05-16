"use client";
import { recordGameScore } from "@/lib/local-progress";
import { toBase } from "@/lib/convert";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Card = { id: number; group: number; label: string; sub: string };

function buildDeck(): Card[] {
  const numbers = [5, 10, 12, 21, 31, 42];
  const cards: Card[] = [];
  numbers.forEach((n, g) => {
    cards.push({ id: g * 3 + 0, group: g, label: toBase(n, 2), sub: "binary" });
    cards.push({ id: g * 3 + 1, group: g, label: `${n}`, sub: "decimal" });
    cards.push({ id: g * 3 + 2, group: g, label: toBase(n, 16), sub: "hex" });
  });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MemoryMatch() {
  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [saved, setSaved] = useState(false);
  const [lastMismatch, setLastMismatch] = useState<number[]>([]);

  const allMatched = matched.size === cards.length;
  const score = useMemo(() => Math.max(0, 600 - moves * 10), [moves]);

  useEffect(() => {
    if (allMatched && !saved) {
      recordGameScore({
        mode: "MEMORY_MATCH",
        score,
        streakMax: 0,
        meta: { moves },
      });
      setSaved(true);
    }
  }, [allMatched, score, moves, saved]);

  function click(id: number) {
    if (matched.has(id) || flipped.includes(id)) return;
    if (flipped.length === 3) return;
    const next = [...flipped, id];
    setFlipped(next);

    if (next.length === 3) {
      setMoves((m) => m + 1);
      const groups = next.map((cid) => cards.find((c) => c.id === cid)!.group);
      const allEqual = groups.every((g) => g === groups[0]);
      setTimeout(() => {
        if (allEqual) {
          const m = new Set(matched);
          next.forEach((cid) => m.add(cid));
          setMatched(m);
        } else {
          setLastMismatch(next);
          setTimeout(() => setLastMismatch([]), 400);
        }
        setFlipped([]);
      }, 700);
    }
  }

  function reset() {
    setCards(buildDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setSaved(false);
  }

  const subLabelClasses: Record<string, string> = {
    binary: "text-[var(--mint-dark)]",
    decimal: "text-[var(--sky-dark)]",
    hex: "text-[var(--lilac-dark)]",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <span className="chip chip-lilac">🧠 Memory Match</span>
        <h1 className="text-2xl md:text-3xl font-display font-black mt-3">
          Find the trios
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Flip 3 cards. Match all three forms (binary, decimal, hex) of the same number.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="chip chip-sky !py-2">Moves: {moves}</span>
        <span className="chip chip-gold !py-2">Score: {score}</span>
        <button className="btn-secondary ml-auto !px-3 !py-2 !text-xs" onClick={reset}>
          Reset
        </button>
      </div>

      <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {cards.map((c) => {
            const isUp = flipped.includes(c.id) || matched.has(c.id);
            const isMatched = matched.has(c.id);
            const isMismatch = lastMismatch.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => click(c.id)}
                className={`relative aspect-[3/4] ${isMismatch ? "animate-shake" : ""}`}
                aria-label="memory card"
              >
                <motion.div
                  animate={{ rotateY: isUp ? 0 : 180 }}
                  transition={{ duration: 0.4 }}
                  className={`absolute inset-0 grid place-items-center rounded-2xl bg-white border-2 ${
                    isMatched
                      ? "border-[var(--mint)] shadow-press-mint"
                      : "border-[var(--border)] shadow-card"
                  }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="text-center">
                    <div className="font-mono text-lg font-extrabold text-[var(--text)]">
                      {c.label}
                    </div>
                    <div
                      className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${
                        subLabelClasses[c.sub] ?? "text-[var(--text-muted)]"
                      }`}
                    >
                      {c.sub}
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ rotateY: isUp ? -180 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 rounded-2xl grid place-items-center text-3xl text-white font-display font-black"
                  style={{
                    backfaceVisibility: "hidden",
                    background:
                      "linear-gradient(135deg, var(--mint) 0%, var(--mint-dark) 100%)",
                    boxShadow: "0 4px 0 var(--mint-dark)",
                  }}
                >
                  ?
                </motion.div>
              </button>
            );
          })}
        </div>
      </div>

      {allMatched && (
        <div className="card text-center">
          <div className="text-5xl mb-2">🎉</div>
          <div className="text-lg font-bold">
            All matched! Score: <b className="text-[var(--mint-dark)]">{score}</b>
          </div>
          {saved && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Saved to your profile.
            </p>
          )}
          <button className="btn-primary mt-4" onClick={reset}>
            Play again
          </button>
        </div>
      )}
    </div>
  );
}

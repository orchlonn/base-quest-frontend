"use client";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { toBase } from "@/lib/convert";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Card = { id: number; group: number; label: string; sub: string };

function buildDeck(): Card[] {
  // 6 groups of 3 equivalent values (binary, decimal, hex) → 18 cards
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
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [saved, setSaved] = useState(false);

  const allMatched = matched.size === cards.length;
  const score = useMemo(() => Math.max(0, 600 - moves * 10), [moves]);

  useEffect(() => {
    if (allMatched && !saved) {
      api("/game/score", {
        method: "POST",
        body: JSON.stringify({ mode: "MEMORY_MATCH", score, streakMax: 0, meta: { moves } }),
      })
        .then(() => setSaved(true))
        .catch(console.error);
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

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Memory Match</h1>
        <div className="flex gap-2">
          <span className="chip">Moves: {moves}</span>
          <span className="chip">Score: {score}</span>
          <button className="ghost-btn !px-3 !py-2 text-sm" onClick={reset}>Reset</button>
        </div>
      </div>
      <p className="opacity-75 text-sm">Flip 3 cards. Match all three forms (binary, decimal, hex) of the same number.</p>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
        {cards.map((c) => {
          const isUp = flipped.includes(c.id) || matched.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => click(c.id)}
              className="relative aspect-[3/4]"
              aria-label="memory card"
            >
              <motion.div
                animate={{ rotateY: isUp ? 0 : 180 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 grid place-items-center rounded-xl border border-white/15 bg-white/5"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="text-center">
                  <div className="font-mono text-lg">{c.label}</div>
                  <div className="text-xs opacity-70">{c.sub}</div>
                </div>
              </motion.div>
              <motion.div
                animate={{ rotateY: isUp ? -180 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 rounded-xl border border-white/15 bg-gradient-to-br from-violet-500/40 to-cyan-500/30 grid place-items-center text-2xl font-display"
                style={{ backfaceVisibility: "hidden" }}
              >
                ?
              </motion.div>
            </button>
          );
        })}
      </div>

      {allMatched && (
        <div className="glass p-4 text-center mt-4">
          <div className="text-lg">All matched! Score: <b>{score}</b></div>
          {saved && <p className="mt-1 text-xs opacity-70">Saved to your profile.</p>}
          <button className="neon-btn mt-3" onClick={reset}>Play again</button>
        </div>
      )}
    </div>
  );
}

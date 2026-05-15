"use client";
import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

const MODES = [
  {
    href: "/games/conversion-challenge",
    title: "Conversion Challenge",
    body: "Timed rounds of decimal ↔ binary ↔ hex with streak bonuses and difficulty levels.",
  },
  {
    href: "/games/tower-defense",
    title: "Tower Defense",
    body: "Enemies advance — solve conversions fast to defend your base.",
  },
  {
    href: "/games/memory-match",
    title: "Memory Match",
    body: "Match equivalent values across binary, decimal, and hex.",
  },
  {
    href: "/games/speed-quiz",
    title: "Speed Quiz Arena",
    body: "60 seconds, multiple choice, scores scale with speed.",
  },
];

export default function GamesHub() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const [locked, setLocked] = useState<boolean | null>(null);
  useEffect(() => {
    api<{ summary: { preTestScore: number | null } }>("/student/progress")
      .then((p) => setLocked(p.summary.preTestScore == null))
      .catch(() => setLocked(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-display font-bold">Game Modes</h1>
      <p className="opacity-75 mt-1">Pick a mode and start earning XP.</p>

      {locked && (
        <div className="glass p-4 mt-4 text-sm">
          You haven&apos;t finished the pre-test yet.{" "}
          <Link className="underline text-cyan-300" href="/pre-test">Take it now</Link> to unlock the full experience.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        {MODES.map((m) => (
          <Link key={m.href} href={m.href} className="glass p-5 hover:shadow-glow transition">
            <h3 className="font-display font-semibold text-lg">{m.title}</h3>
            <p className="text-sm opacity-80 mt-1">{m.body}</p>
            <div className="mt-3 text-sm text-cyan-300">Play →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

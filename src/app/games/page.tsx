"use client";
import Link from "next/link";
import { useProgress } from "@/store/profile";
import { hasTakenPreTest } from "@/lib/local-progress";

type Accent = "mint" | "coral" | "lilac" | "sky";

const MODES: Array<{
  href: string;
  title: string;
  body: string;
  icon: string;
  accent: Accent;
}> = [
  {
    href: "/games/conversion-challenge",
    title: "Conversion Challenge",
    body: "Timed rounds of decimal ↔ binary ↔ hex with streak bonuses and difficulty levels.",
    icon: "⚡",
    accent: "mint",
  },
  {
    href: "/games/tower-defense",
    title: "Tower Defense",
    body: "Enemies advance — solve conversions fast to defend your base.",
    icon: "🏰",
    accent: "coral",
  },
  {
    href: "/games/memory-match",
    title: "Memory Match",
    body: "Match equivalent values across binary, decimal, and hex.",
    icon: "🧠",
    accent: "lilac",
  },
  {
    href: "/games/speed-quiz",
    title: "Speed Quiz Arena",
    body: "60 seconds, multiple choice, scores scale with speed.",
    icon: "🎯",
    accent: "sky",
  },
];

const ACCENT_BG: Record<Accent, string> = {
  mint: "bg-[var(--mint)]",
  coral: "bg-[var(--coral)]",
  lilac: "bg-[var(--lilac)]",
  sky: "bg-[var(--sky)]",
};

const ACCENT_CTA: Record<Accent, string> = {
  mint: "text-[var(--mint-dark)]",
  coral: "text-[var(--coral-dark)]",
  lilac: "text-[var(--lilac-dark)]",
  sky: "text-[var(--sky-dark)]",
};

export default function GamesHub() {
  const progress = useProgress();
  const locked = !hasTakenPreTest(progress);

  return (
    <div className="space-y-8">
      <header>
        <span className="chip chip-coral">Games</span>
        <h1 className="section-title mt-3">Pick a game mode</h1>
        <p className="section-sub mt-1">Earn XP, build streaks, level up.</p>
      </header>

      {locked && (
        <div className="rounded-2xl bg-[var(--coral-soft)] border border-[var(--coral)] p-4 flex flex-wrap items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div className="flex-1">
            <div className="font-bold text-[var(--coral-dark)]">
              Finish the pre-test first
            </div>
            <div className="text-base text-[var(--coral-dark)]/80">
              It unlocks the full game experience.
            </div>
          </div>
          <Link className="btn-primary" href="/pre-test">
            Take it now
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {MODES.map((m) => (
          <Link key={m.href} href={m.href} className="tile block group">
            <div className={`tile-accent ${ACCENT_BG[m.accent]}`} />
            <div className="flex items-start gap-4">
              <div
                className={`shrink-0 h-14 w-14 rounded-2xl ${ACCENT_BG[m.accent]} text-white grid place-items-center text-2xl shadow-card`}
              >
                {m.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-display font-extrabold text-lg">{m.title}</h3>
                <p className="text-base text-[var(--text-muted)] mt-1">{m.body}</p>
                <div
                  className={`mt-3 text-base font-bold ${ACCENT_CTA[m.accent]} group-hover:underline`}
                >
                  Play →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

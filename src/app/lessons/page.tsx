"use client";
import Link from "next/link";
import { LESSONS } from "@/lib/data";

type Accent = "mint" | "sky" | "coral" | "lilac" | "gold";

const TOPIC_THEME: Record<string, { accent: Accent; glyph: string }> = {
  BINARY: { accent: "mint", glyph: "10₂" },
  DECIMAL: { accent: "sky", glyph: "10₁₀" },
  OCTAL: { accent: "coral", glyph: "10₈" },
  HEX: { accent: "lilac", glyph: "F₁₆" },
  HEXADECIMAL: { accent: "lilac", glyph: "F₁₆" },
  CONVERSION: { accent: "gold", glyph: "↔" },
};

const ACCENT_BG: Record<Accent, string> = {
  mint: "bg-[var(--mint)]",
  sky: "bg-[var(--sky)]",
  coral: "bg-[var(--coral)]",
  lilac: "bg-[var(--lilac)]",
  gold: "bg-[var(--gold)]",
};

const ACCENT_SOFT: Record<Accent, string> = {
  mint: "bg-[var(--mint-soft)] text-[var(--mint-dark)]",
  sky: "bg-[var(--sky-soft)] text-[var(--sky-dark)]",
  coral: "bg-[var(--coral-soft)] text-[var(--coral-dark)]",
  lilac: "bg-[var(--lilac-soft)] text-[var(--lilac-dark)]",
  gold: "bg-[var(--gold-soft)] text-[var(--gold-dark)]",
};

const ACCENT_CTA: Record<Accent, string> = {
  mint: "text-[var(--mint-dark)]",
  sky: "text-[var(--sky-dark)]",
  coral: "text-[var(--coral-dark)]",
  lilac: "text-[var(--lilac-dark)]",
  gold: "text-[var(--gold-dark)]",
};

export default function LessonsPage() {
  return (
    <div className="space-y-8">
      <header>
        <span className="chip chip-mint">Lessons</span>
        <h1 className="section-title mt-3">Learn the bases</h1>
        <p className="section-sub mt-1">
          Step-by-step explanations of binary, decimal, octal, and hex.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {LESSONS.map((l) => {
          const theme = TOPIC_THEME[l.topic.toUpperCase()] ?? {
            accent: "mint" as Accent,
            glyph: "•",
          };
          return (
            <Link
              key={l.id}
              href={`/lessons/${l.slug}`}
              className="tile block group"
            >
              <div className={`tile-accent ${ACCENT_BG[theme.accent]}`} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className={`chip ${ACCENT_SOFT[theme.accent]} border-transparent`}>
                    {l.topic}
                  </span>
                  <h3 className="mt-3 font-display font-extrabold text-xl">
                    {l.title}
                  </h3>
                  <p className="mt-2 text-base text-[var(--text-muted)]">
                    {l.description}
                  </p>
                  <div
                    className={`mt-4 text-base font-bold ${ACCENT_CTA[theme.accent]} group-hover:underline`}
                  >
                    Open lesson →
                  </div>
                </div>
                <div
                  className={`shrink-0 h-16 w-16 rounded-2xl ${ACCENT_BG[theme.accent]} text-white grid place-items-center font-mono font-extrabold text-lg shadow-card`}
                >
                  {theme.glyph}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-6 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h3 className="font-display font-extrabold text-lg">Done learning?</h3>
          <p className="text-base text-[var(--text-muted)]">
            Try a game mode, or take the post-test to measure improvement.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/games" className="btn-secondary">
            Game modes
          </Link>
          <Link href="/post-test" className="btn-coral">
            Take post-test
          </Link>
        </div>
      </div>
    </div>
  );
}

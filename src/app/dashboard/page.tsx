"use client";
import { RequireAuth } from "@/components/RequireAuth";
import { XPBar } from "@/components/XPBar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type Profile = {
  username: string;
  xp: number;
  level: number;
  streakDays: number;
  rankCode: string;
  xpRange: { current: number; next: number; level: number };
  achievements: { code: string; title: string; iconKey: string; description: string }[];
};

const RANK_TITLES: Record<string, string> = {
  BEGINNER_BIT: "Beginner Bit",
  BINARY_EXPLORER: "Binary Explorer",
  HEX_HERO: "Hex Hero",
  CONVERSION_WIZARD: "Conversion Wizard",
};

type Tile = {
  href: string;
  title: string;
  body: string;
  cta: string;
  icon: string;
  accent: "mint" | "coral" | "gold" | "sky" | "lilac";
};

const ACCENT_BAR: Record<Tile["accent"], string> = {
  mint: "bg-[var(--mint)]",
  coral: "bg-[var(--coral)]",
  gold: "bg-[var(--gold)]",
  sky: "bg-[var(--sky)]",
  lilac: "bg-[var(--lilac)]",
};

const ACCENT_CTA: Record<Tile["accent"], string> = {
  mint: "text-[var(--mint-dark)]",
  coral: "text-[var(--coral-dark)]",
  gold: "text-[var(--gold-dark)]",
  sky: "text-[var(--sky-dark)]",
  lilac: "text-[var(--lilac-dark)]",
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasPreTest, setHasPreTest] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const [p, progress] = await Promise.all([
        api<Profile>("/student/profile"),
        api<{ summary: { preTestScore: number | null } }>("/student/progress"),
      ]);
      setProfile(p);
      setHasPreTest(progress.summary.preTestScore != null);
    })().catch(console.error);
  }, []);

  if (!profile) {
    return (
      <div className="card animate-pulse">
        <p className="text-[var(--text-muted)]">Loading your profile…</p>
      </div>
    );
  }

  const tiles: Tile[] = [
    {
      href: hasPreTest ? "/lessons" : "/pre-test",
      title: hasPreTest ? "Continue learning" : "Start the pre-test",
      body: hasPreTest
        ? "Pick up where you left off — open the lessons."
        : "Take the pre-test to unlock the full game.",
      cta: hasPreTest ? "Open lessons" : "Take pre-test",
      icon: "📚",
      accent: "mint",
    },
    {
      href: "/games",
      title: "Play a game mode",
      body: "Conversion Challenge, Tower Defense, Memory Match, Speed Quiz.",
      cta: "Browse games",
      icon: "🎮",
      accent: "coral",
    },
    {
      href: "/how-to-play",
      title: "How to play",
      body: "Rules, scoring, XP, streaks, and badges.",
      cta: "Read guide",
      icon: "📖",
      accent: "sky",
    },
    {
      href: "/results",
      title: "My results",
      body: "Pre-test vs. post-test, improvement, weak topics.",
      cta: "See progress",
      icon: "📊",
      accent: "lilac",
    },
    {
      href: "/post-test",
      title: "Take the post-test",
      body: "Show how much you've grown.",
      cta: "Start post-test",
      icon: "🎯",
      accent: "coral",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex flex-col md:flex-row md:items-center gap-6"
      >
        <div className="flex-1">
          <div className="text-sm text-[var(--text-muted)] font-bold">Welcome back,</div>
          <h1 className="text-3xl md:text-4xl font-display font-black mt-1">
            @{profile.username}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip chip-lilac">
              🎖️ {RANK_TITLES[profile.rankCode] ?? profile.rankCode}
            </span>
            <span className="chip chip-coral">
              🔥 {profile.streakDays} day streak
            </span>
          </div>
        </div>
        <div className="w-full md:w-80">
          <XPBar
            xp={profile.xp}
            current={profile.xpRange.current}
            next={profile.xpRange.next}
            level={profile.level}
          />
        </div>
      </motion.div>

      <section>
        <h2 className="section-title">Pick your next step</h2>
        <div className="grid gap-4 md:grid-cols-3 mt-4">
          {tiles.map((t, i) => (
            <motion.div
              key={t.href + t.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link href={t.href} className="tile block group">
                <div className={`tile-accent ${ACCENT_BAR[t.accent]}`} />
                <div className="text-3xl">{t.icon}</div>
                <h3 className="mt-3 font-display font-extrabold text-lg">{t.title}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{t.body}</p>
                <div
                  className={`mt-4 text-sm font-bold ${ACCENT_CTA[t.accent]} group-hover:underline`}
                >
                  {t.cta} →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="font-display text-xl font-extrabold mb-4">Badges</h2>
        {profile.achievements.length === 0 ? (
          <div className="rounded-xl bg-[var(--surface-2)] border border-dashed border-[var(--border)] px-4 py-6 text-center">
            <div className="text-3xl mb-2">🎖️</div>
            <p className="text-sm text-[var(--text-muted)]">
              No badges yet. Play a game to earn your first!
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {profile.achievements.map((a) => (
              <div
                key={a.code}
                className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[var(--gold)] text-white text-lg">
                    🏅
                  </span>
                  <div className="text-sm font-bold">{a.title}</div>
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-2">
                  {a.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

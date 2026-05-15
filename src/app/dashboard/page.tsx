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

  if (!profile) return <p className="opacity-70">Loading your profile…</p>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 flex flex-col md:flex-row md:items-center gap-5"
      >
        <div className="flex-1">
          <div className="text-sm opacity-70">Welcome back,</div>
          <h1 className="text-3xl font-display font-bold">@{profile.username}</h1>
          <div className="mt-1 chip">Rank: {RANK_TITLES[profile.rankCode] ?? profile.rankCode}</div>
        </div>
        <div className="w-full md:w-80">
          <XPBar
            xp={profile.xp}
            current={profile.xpRange.current}
            next={profile.xpRange.next}
            level={profile.level}
          />
          <div className="mt-2 text-xs opacity-70">
            🔥 {profile.streakDays} day streak
          </div>
        </div>
      </motion.div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card
          href={hasPreTest ? "/lessons" : "/pre-test"}
          title={hasPreTest ? "Continue learning" : "Start the pre-test"}
          body={
            hasPreTest
              ? "Pick up where you left off — open the lessons."
              : "Take the pre-test to unlock the full game."
          }
          cta={hasPreTest ? "Open lessons" : "Take pre-test"}
        />
        <Card
          href="/games"
          title="Play a game mode"
          body="Conversion Challenge, Tower Defense, Memory Match, Speed Quiz."
          cta="Browse games"
        />
        <Card href="/leaderboard" title="Leaderboard" body="See where you stand." cta="View ranks" />
        <Card href="/how-to-play" title="How to play" body="Rules, scoring, XP, streaks, badges." cta="Read guide" />
        <Card href="/results" title="My results" body="Pre-test vs. post-test, improvement, weak topics." cta="See progress" />
        <Card href="/post-test" title="Take the post-test" body="Show how much you've grown." cta="Start post-test" />
      </section>

      <section className="glass p-6">
        <h2 className="font-display text-xl font-bold mb-3">Badges</h2>
        {profile.achievements.length === 0 ? (
          <p className="opacity-70 text-sm">No badges yet. Play a game to earn your first!</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {profile.achievements.map((a) => (
              <div key={a.code} className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="text-xs opacity-75">{a.description}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Card({ href, title, body, cta }: { href: string; title: string; body: string; cta: string }) {
  return (
    <Link href={href} className="glass p-5 hover:shadow-glow transition">
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm opacity-80">{body}</p>
      <div className="mt-4 text-sm text-cyan-300">{cta} →</div>
    </Link>
  );
}

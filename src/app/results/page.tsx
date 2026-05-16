"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LESSONS } from "@/lib/data";
import { useProgress } from "@/store/profile";
import type { PostTestResult } from "@/lib/local-progress";

const MODE_LABELS: Record<string, { label: string; chip: string }> = {
  CONVERSION_CHALLENGE: { label: "Conversion Challenge", chip: "chip-mint" },
  TOWER_DEFENSE: { label: "Tower Defense", chip: "chip-coral" },
  MEMORY_MATCH: { label: "Memory Match", chip: "chip-lilac" },
  SPEED_QUIZ: { label: "Speed Quiz", chip: "chip-sky" },
};

export default function ResultsPage() {
  const progress = useProgress();
  const [postFeedback, setPostFeedback] = useState<PostTestResult | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem("bq_posttest_result");
    if (cached) {
      try {
        setPostFeedback(JSON.parse(cached));
      } catch {}
    }
  }, []);

  const summary = useMemo(() => {
    const pre = progress.quizAttempts.find((a) => a.kind === "PRE_TEST");
    const post = progress.quizAttempts.find((a) => a.kind === "POST_TEST");
    const improvement =
      pre && post
        ? Math.round(((post.score - pre.score) / Math.max(pre.score, 1)) * 100)
        : null;
    return {
      preTestScore: pre?.score ?? null,
      postTestScore: post?.score ?? null,
      improvementPct: improvement,
    };
  }, [progress.quizAttempts]);

  const lessonsByTitle = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of LESSONS) map.set(l.id, l.title);
    return map;
  }, []);

  const pre = summary.preTestScore;
  const post = summary.postTestScore;
  const improve = summary.improvementPct;
  const improveGood = improve != null && improve >= 0;

  return (
    <div className="space-y-8">
      <header>
        <span className="chip chip-lilac">📊 Your progress</span>
        <h1 className="section-title mt-3">Results & growth</h1>
        <p className="section-sub mt-1">
          See how far you&apos;ve come since the pre-test.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Pre-test score"
          value={pre != null ? `${pre}%` : "—"}
          accent="sky"
        />
        <Stat
          label="Post-test score"
          value={post != null ? `${post}%` : "—"}
          accent="mint"
        />
        <Stat
          label="Improvement"
          value={
            improve != null ? `${improve > 0 ? "+" : ""}${improve}%` : "—"
          }
          accent={improveGood ? "mint" : "coral"}
          arrow={improve == null ? undefined : improveGood ? "up" : "down"}
        />
      </section>

      {postFeedback?.feedback && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💬</span>
            <h2 className="font-display text-xl font-extrabold">
              Personalized feedback
            </h2>
          </div>
          <p className="text-sm leading-relaxed">{postFeedback.feedback}</p>
          {postFeedback.strongestTopic && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Strongest:
              </span>
              <span className="chip chip-mint">
                {postFeedback.strongestTopic}
              </span>
              {postFeedback.weakestTopic && (
                <>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] ml-2">
                    Weakest:
                  </span>
                  <span className="chip chip-coral">
                    {postFeedback.weakestTopic}
                  </span>
                </>
              )}
            </div>
          )}
        </motion.section>
      )}

      <section className="card">
        <h2 className="font-display text-xl font-extrabold mb-4">
          Recent game scores
        </h2>
        {progress.gameScores.length === 0 ? (
          <div className="rounded-xl bg-[var(--surface-2)] border border-dashed border-[var(--border)] px-4 py-6 text-center">
            <div className="text-3xl mb-2">🎮</div>
            <p className="text-sm text-[var(--text-muted)]">
              No games yet. Play one in the Games hub!
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {progress.gameScores.slice(0, 10).map((g) => {
              const meta = MODE_LABELS[g.mode] ?? {
                label: g.mode,
                chip: "chip",
              };
              return (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2.5"
                >
                  <span className={`chip ${meta.chip}`}>{meta.label}</span>
                  <span className="text-sm font-mono">
                    <b>{g.score}</b>{" "}
                    <span className="text-[var(--text-muted)]">·</span>{" "}
                    <span className="text-[var(--mint-dark)] font-bold">
                      +{g.xpEarned} XP
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="font-display text-xl font-extrabold mb-4">
          Lesson progress
        </h2>
        {progress.lessonProgress.length === 0 ? (
          <div className="rounded-xl bg-[var(--surface-2)] border border-dashed border-[var(--border)] px-4 py-6 text-center">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-sm text-[var(--text-muted)]">
              No lessons completed yet.
            </p>
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 text-sm">
            {progress.lessonProgress.map((l) => (
              <li
                key={l.lessonId}
                className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2.5"
              >
                <div className="font-bold">
                  {lessonsByTitle.get(l.lessonId) ?? l.slug}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  {l.completed ? "✓ Completed" : `${l.percent}%`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex gap-2 flex-wrap">
        <Link className="btn-secondary" href="/lessons">
          Review lessons
        </Link>
        <Link className="btn-primary" href="/games">
          Play more games
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  arrow,
}: {
  label: string;
  value: string;
  accent: "mint" | "sky" | "coral";
  arrow?: "up" | "down";
}) {
  const colorMap: Record<typeof accent, { bar: string; text: string }> = {
    mint: { bar: "bg-[var(--mint)]", text: "text-[var(--mint-dark)]" },
    sky: { bar: "bg-[var(--sky)]", text: "text-[var(--sky-dark)]" },
    coral: { bar: "bg-[var(--coral)]", text: "text-[var(--coral-dark)]" },
  };
  const c = colorMap[accent];
  return (
    <div className="tile relative">
      <div className={`tile-accent ${c.bar}`} />
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </div>
      <div className={`mt-2 text-4xl font-display font-black ${c.text}`}>
        {arrow && (
          <span className="mr-1">{arrow === "up" ? "↑" : "↓"}</span>
        )}
        {value}
      </div>
    </div>
  );
}

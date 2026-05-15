"use client";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Progress = {
  lessons: any[];
  quizAttempts: any[];
  gameScores: any[];
  events: any[];
  summary: { preTestScore: number | null; postTestScore: number | null; improvementPct: number | null };
};

export default function ResultsPage() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const [data, setData] = useState<Progress | null>(null);
  const [postFeedback, setPostFeedback] = useState<any | null>(null);

  useEffect(() => {
    api<Progress>("/student/progress").then(setData).catch(console.error);
    const cached = sessionStorage.getItem("bq_posttest_result");
    if (cached) setPostFeedback(JSON.parse(cached));
  }, []);

  if (!data) return <p className="opacity-70">Loading your results…</p>;

  const pre = data.summary.preTestScore;
  const post = data.summary.postTestScore;
  const improve = data.summary.improvementPct;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Your Results & Progress</h1>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Pre-test score" value={pre != null ? `${pre}%` : "—"} />
        <Stat label="Post-test score" value={post != null ? `${post}%` : "—"} />
        <Stat
          label="Improvement"
          value={improve != null ? `${improve > 0 ? "+" : ""}${improve}%` : "—"}
          accent={improve != null && improve >= 0 ? "good" : "bad"}
        />
      </section>

      {postFeedback?.feedback && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6"
        >
          <h2 className="font-display text-lg font-bold">Personalized feedback</h2>
          <p className="mt-2 text-sm">{postFeedback.feedback}</p>
          {postFeedback.strongestTopic && (
            <p className="mt-3 text-sm">
              <span className="opacity-70">Strongest:</span>{" "}
              <span className="chip">{postFeedback.strongestTopic}</span>
              {postFeedback.weakestTopic && (
                <>
                  <span className="opacity-70 ml-3">Weakest:</span>{" "}
                  <span className="chip">{postFeedback.weakestTopic}</span>
                </>
              )}
            </p>
          )}
        </motion.section>
      )}

      <section className="glass p-6">
        <h2 className="font-display text-lg font-bold mb-3">Recent game scores</h2>
        {data.gameScores.length === 0 ? (
          <p className="opacity-70 text-sm">No games yet. Play one in the Games hub!</p>
        ) : (
          <ul className="space-y-1 text-sm font-mono">
            {data.gameScores.slice(0, 10).map((g, i) => (
              <li key={i} className="flex justify-between">
                <span>{g.mode}</span>
                <span>score {g.score} · +{g.xpEarned} XP</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass p-6">
        <h2 className="font-display text-lg font-bold mb-3">Lesson progress</h2>
        {data.lessons.length === 0 ? (
          <p className="opacity-70 text-sm">No lessons completed yet.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 text-sm">
            {data.lessons.map((l, i) => (
              <li key={i} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                <div className="font-semibold">{l.lesson?.title ?? l.lessonId}</div>
                <div className="opacity-70">{l.completed ? "Completed" : `${l.percent}%`}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex gap-2">
        <Link className="ghost-btn" href="/lessons">Review lessons</Link>
        <Link className="neon-btn" href="/games">Play more games</Link>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "good" | "bad" }) {
  const color =
    accent === "good"
      ? "from-emerald-400 to-cyan-400"
      : accent === "bad"
      ? "from-rose-400 to-fuchsia-400"
      : "from-cyan-400 to-violet-400";
  return (
    <div className="glass p-5">
      <div className="text-xs opacity-70">{label}</div>
      <div className={`mt-1 text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r ${color}`}>
        {value}
      </div>
    </div>
  );
}

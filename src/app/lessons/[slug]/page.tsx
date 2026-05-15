"use client";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { fromBase, toBase } from "@/lib/convert";
import Link from "next/link";

type Lesson = { id: string; title: string; content: string; topic: string };

export default function LessonDetailPage() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const { slug } = useParams<{ slug: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [percent, setPercent] = useState(0);
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    api<Lesson>(`/lessons/${slug}`, { auth: false }).then(setLesson).catch(console.error);
  }, [slug]);

  if (!lesson) return <p className="opacity-70">Loading lesson…</p>;

  async function markComplete() {
    if (!lesson) return;
    await api("/lessons/progress", {
      method: "POST",
      body: JSON.stringify({ lessonId: lesson.id, completed: true, percent: 100 }),
    });
    setPercent(100);
    setMarked(true);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="chip">{lesson.topic}</div>
      <h1 className="text-3xl font-display font-bold">{lesson.title}</h1>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-400"
        />
      </div>

      <article className="glass p-6 whitespace-pre-wrap font-mono leading-relaxed">
        {lesson.content}
      </article>

      <InteractivePractice />

      <div className="flex justify-between">
        <Link className="ghost-btn" href="/lessons">All lessons</Link>
        <button className="neon-btn" onClick={markComplete} disabled={marked}>
          {marked ? "Marked complete ✓" : "Mark as complete"}
        </button>
      </div>
    </div>
  );
}

function InteractivePractice() {
  const [n, setN] = useState(13);
  const [guess, setGuess] = useState("");
  const correct = guess === toBase(n, 2);

  return (
    <section className="glass p-6">
      <h2 className="font-display text-lg font-bold">Try it</h2>
      <p className="text-sm opacity-80 mt-1">
        Convert <span className="font-mono text-cyan-300">{n}</span> (decimal) into binary.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          className="input font-mono"
          placeholder="binary…"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
        />
        <button
          className="ghost-btn"
          onClick={() => {
            setN(Math.floor(Math.random() * 250) + 1);
            setGuess("");
          }}
        >
          New number
        </button>
      </div>
      {guess && (
        <p className={`mt-2 text-sm ${correct ? "text-emerald-300" : "text-rose-300"}`}>
          {correct ? `Correct! ${n} = ${toBase(n, 2)} in binary.` : "Not quite — keep trying."}
        </p>
      )}
      <p className="mt-3 text-xs opacity-60">
        Helpers: parses {fromBase("1010", 2)} from binary "1010". Reload for a new digit.
      </p>
    </section>
  );
}

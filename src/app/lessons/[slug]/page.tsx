"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toBase } from "@/lib/convert";
import Link from "next/link";
import { getLessonBySlug } from "@/lib/data";
import { markLessonComplete } from "@/lib/local-progress";

export default function LessonDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const lesson = getLessonBySlug(slug);
  const [percent, setPercent] = useState(0);
  const [marked, setMarked] = useState(false);

  if (!lesson) {
    return (
      <div className="card text-[var(--text-muted)]">
        Lesson not found.{" "}
        <Link href="/lessons" className="font-bold text-[var(--mint-dark)] hover:underline">
          Back to lessons
        </Link>
      </div>
    );
  }

  function complete() {
    if (!lesson) return;
    markLessonComplete({ id: lesson.id, slug: lesson.slug });
    setPercent(100);
    setMarked(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div>
          <span className="chip chip-sky">{lesson.topic}</span>
          <h1 className="text-3xl md:text-4xl font-display font-black mt-3">
            {lesson.title}
          </h1>
        </div>

        <div
          className="h-3 rounded-full overflow-hidden border-2 bg-white"
          style={{ borderColor: "var(--border)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            className="h-full"
            style={{ background: "var(--mint)" }}
          />
        </div>

        <article className="card whitespace-pre-wrap font-mono leading-relaxed text-[15px]">
          {lesson.content}
        </article>

        <div className="flex justify-between gap-3 flex-wrap">
          <Link className="btn-secondary" href="/lessons">
            ← All lessons
          </Link>
          <button className="btn-primary" onClick={complete} disabled={marked}>
            {marked ? "Marked complete ✓" : "Mark as complete"}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <InteractivePractice />
      </aside>
    </div>
  );
}

function InteractivePractice() {
  const [n, setN] = useState(13);
  const [guess, setGuess] = useState("");
  const correct = guess === toBase(n, 2);
  const attempted = guess.length > 0;

  return (
    <section className="card relative">
      <div className="tile-accent bg-[var(--mint)]" />
      <div className="flex items-center gap-2">
        <span className="text-2xl">🧪</span>
        <h2 className="font-display text-lg font-extrabold">Try it</h2>
      </div>
      <p className="text-sm text-[var(--text-muted)] mt-2">
        Convert{" "}
        <span className="font-mono font-bold text-[var(--text)]">{n}</span>{" "}
        (decimal) into binary.
      </p>
      <div className="mt-3 space-y-2">
        <input
          className="input font-mono"
          placeholder="binary…"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
        />
        <button
          className="btn-secondary w-full"
          onClick={() => {
            setN(Math.floor(Math.random() * 250) + 1);
            setGuess("");
          }}
        >
          🎲 New number
        </button>
      </div>
      {attempted && (
        <div
          className={`mt-3 rounded-xl px-3 py-2 text-sm font-bold ${
            correct
              ? "bg-[var(--mint-soft)] text-[var(--mint-dark)]"
              : "bg-[var(--coral-soft)] text-[var(--coral-dark)]"
          }`}
        >
          {correct
            ? `Correct! ${n} = ${toBase(n, 2)} in binary.`
            : "Not quite — keep trying."}
        </div>
      )}
    </section>
  );
}

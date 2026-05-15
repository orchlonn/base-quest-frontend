"use client";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lesson = { id: string; slug: string; title: string; topic: string; description: string; order: number };

export default function LessonsPage() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  useEffect(() => {
    api<Lesson[]>("/lessons", { auth: false }).then(setLessons).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-display font-bold">Learning Lessons</h1>
      <p className="opacity-75 mt-1">Step-by-step explanations of binary, decimal, octal, and hex.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {lessons?.map((l) => (
          <Link key={l.id} href={`/lessons/${l.slug}`} className="glass p-5 hover:shadow-glow transition">
            <div className="chip mb-2">{l.topic}</div>
            <h3 className="font-display font-semibold text-lg">{l.title}</h3>
            <p className="text-sm opacity-80 mt-1">{l.description}</p>
            <div className="mt-3 text-sm text-cyan-300">Open lesson →</div>
          </Link>
        ))}
        {!lessons && <p className="opacity-70">Loading lessons…</p>}
      </div>

      <div className="mt-8 glass p-5 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h3 className="font-display font-semibold">Done learning?</h3>
          <p className="text-sm opacity-80">Try a game mode, or take the post-test to measure improvement.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/games" className="ghost-btn">Game modes</Link>
          <Link href="/post-test" className="neon-btn">Post-test</Link>
        </div>
      </div>
    </div>
  );
}

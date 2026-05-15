"use client";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { generateProblem, toBase } from "@/lib/convert";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const TIME = 60;

type MCQ = { prompt: string; answer: string; choices: string[]; createdAt: number };

function makeMCQ(): MCQ {
  const p = generateProblem("MEDIUM");
  const choices = new Set<string>([p.answer]);
  while (choices.size < 4) {
    // Add a plausible distractor
    const ans = parseInt(p.answer, p.type === "DEC_TO_BIN" || p.type === "HEX_TO_BIN" ? 2 : p.type === "DEC_TO_HEX" ? 16 : 10);
    const delta = Math.floor(Math.random() * 8) - 4 || 1;
    const distractor = isNaN(ans)
      ? Math.floor(Math.random() * 255).toString()
      : (Math.max(0, ans + delta)).toString(p.type === "DEC_TO_BIN" || p.type === "HEX_TO_BIN" ? 2 : p.type === "DEC_TO_HEX" ? 16 : 10).toUpperCase();
    choices.add(distractor);
  }
  const shuffled = [...choices].sort(() => Math.random() - 0.5);
  return { prompt: p.prompt, answer: p.answer, choices: shuffled, createdAt: Date.now() };
}

export default function SpeedQuiz() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(TIME);
  const [q, setQ] = useState<MCQ | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, time]);

  useEffect(() => {
    if (!running && score > 0 && !saved && time <= 0) {
      api("/game/score", {
        method: "POST",
        body: JSON.stringify({ mode: "SPEED_QUIZ", score, streakMax: maxStreak }),
      })
        .then(() => setSaved(true))
        .catch(console.error);
    }
  }, [running, score, maxStreak, time, saved]);

  function start() {
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTime(TIME);
    setQ(makeMCQ());
    setSaved(false);
    setRunning(true);
  }

  function pick(choice: string) {
    if (!q || !running) return;
    const ok = choice === q.answer;
    if (ok) {
      const elapsedMs = Date.now() - q.createdAt;
      const speedBonus = Math.max(0, 8 - Math.floor(elapsedMs / 500)); // up to +8 for fast answers
      const streakBonus = Math.min(streak, 6);
      setScore((s) => s + 10 + speedBonus + streakBonus);
      const ns = streak + 1;
      setStreak(ns);
      setMaxStreak((m) => Math.max(m, ns));
      setFlash("good");
    } else {
      setStreak(0);
      setFlash("bad");
    }
    setQ(makeMCQ());
    setTimeout(() => setFlash(null), 200);
  }

  return (
    <div className="mx-auto max-w-xl space-y-3">
      <h1 className="text-2xl font-display font-bold">Speed Quiz Arena</h1>
      <p className="opacity-75 text-sm">{TIME} seconds. Pick the right answer fast for speed bonuses.</p>

      <div className="flex gap-2 items-center">
        <span className="chip">⏱ {time}s</span>
        <span className="chip">Score: {score}</span>
        <span className="chip">🔥 {streak}</span>
      </div>

      <div className="glass p-6 min-h-[220px] relative">
        {!running ? (
          <div className="text-center">
            <div className="opacity-80">
              {score === 0 ? "Tap Start when you're ready." : `Time! Final score: ${score} · Best streak ${maxStreak}`}
            </div>
            <button className="neon-btn mt-4" onClick={start}>
              {score === 0 ? "Start" : "Play again"}
            </button>
            {saved && <p className="mt-2 text-xs opacity-70">Saved to your profile.</p>}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {q && (
              <motion.div
                key={q.prompt + q.createdAt}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="text-xs uppercase tracking-wider opacity-70">Conversion</div>
                <div className="text-xl font-mono mt-2">{q.prompt}</div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {q.choices.map((c) => (
                    <button
                      key={c}
                      onClick={() => pick(c)}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-lg hover:border-cyan-300"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        {flash && (
          <div
            className={`absolute inset-0 pointer-events-none rounded-2xl ${
              flash === "good" ? "ring-2 ring-emerald-300/60" : "ring-2 ring-rose-400/60"
            }`}
          />
        )}
      </div>
    </div>
  );
}

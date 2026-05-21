"use client";
import { recordGameScore } from "@/lib/local-progress";
import { generateProblem } from "@/lib/convert";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const TIME = 60;

type MCQ = { prompt: string; answer: string; choices: string[]; createdAt: number };

function makeMCQ(): MCQ {
  const p = generateProblem("MEDIUM");
  const choices = new Set<string>([p.answer]);
  while (choices.size < 4) {
    const ans = parseInt(p.answer, p.targetBase);
    const delta = Math.floor(Math.random() * 8) - 4 || 1;
    const distractor = isNaN(ans)
      ? Math.floor(Math.random() * 255).toString()
      : Math.max(0, ans + delta)
          .toString(p.targetBase)
          .toUpperCase();
    choices.add(distractor);
  }
  const shuffled = [...choices].sort(() => Math.random() - 0.5);
  return {
    prompt: p.prompt,
    answer: p.answer,
    choices: shuffled,
    createdAt: Date.now(),
  };
}

export default function SpeedQuiz() {
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
      recordGameScore({
        mode: "SPEED_QUIZ",
        score,
        streakMax: maxStreak,
      });
      setSaved(true);
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
      const speedBonus = Math.max(0, 8 - Math.floor(elapsedMs / 500));
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

  const timeLow = time <= 10;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <header>
        <span className="chip chip-sky">🎯 Speed Quiz Arena</span>
        <h1 className="text-2xl md:text-3xl font-display font-black mt-3">
          Quick fingers
        </h1>
        <p className="text-base text-[var(--text-muted)] mt-1">
          {TIME} seconds. Pick fast for speed bonuses.
        </p>
      </header>

      <div className="flex gap-2">
        <span className={`chip flex-1 justify-center !py-2 ${timeLow ? "chip-coral" : "chip-sky"}`}>
          ⏱ {time}s
        </span>
        <span className="chip chip-gold flex-1 justify-center !py-2">
          ⭐ {score}
        </span>
        <span className="chip chip-coral flex-1 justify-center !py-2">
          🔥 {streak}
        </span>
      </div>

      <div className="card min-h-[260px] relative">
        {!running ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">{score === 0 ? "🎮" : "🏁"}</div>
            <div className="text-lg font-bold">
              {score === 0
                ? "Tap Start when you're ready."
                : `Time! Final score: ${score}`}
            </div>
            {score > 0 && (
              <div className="text-base text-[var(--text-muted)] mt-1">
                Best streak: {maxStreak}
              </div>
            )}
            <button className="btn-sky mt-5" onClick={start}>
              {score === 0 ? "Start" : "Play again"}
            </button>
            {saved && (
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Saved to your profile.
              </p>
            )}
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
                <div className="text-sm uppercase tracking-wider font-bold text-[var(--text-muted)]">
                  Conversion
                </div>
                <div className="text-2xl md:text-3xl font-mono font-extrabold mt-2 break-words">
                  {q.prompt}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-5">
                  {q.choices.map((c) => (
                    <button
                      key={c}
                      onClick={() => pick(c)}
                      className="mc-option font-mono text-lg !text-center"
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
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`absolute inset-0 pointer-events-none rounded-2xl ${
              flash === "good"
                ? "ring-4 ring-[var(--mint)]"
                : "ring-4 ring-[var(--coral)]"
            }`}
          />
        )}
      </div>
    </div>
  );
}

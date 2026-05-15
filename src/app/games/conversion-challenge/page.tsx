"use client";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { generateProblem } from "@/lib/convert";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
const TIME_PER_ROUND = 60;

export default function ConversionChallenge() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [running, setRunning] = useState(false);
  const [problem, setProblem] = useState(() => generateProblem("EASY"));
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [time, setTime] = useState(TIME_PER_ROUND);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (running) inputRef.current?.focus();
  }, [running, problem]);

  useEffect(() => {
    if (!running && score > 0 && !saved) {
      api("/game/score", {
        method: "POST",
        body: JSON.stringify({
          mode: "CONVERSION_CHALLENGE",
          score,
          streakMax: maxStreak,
          meta: { difficulty },
        }),
      })
        .then(() => setSaved(true))
        .catch(console.error);
    }
  }, [running, score, maxStreak, difficulty, saved]);

  function start() {
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTime(TIME_PER_ROUND);
    setProblem(generateProblem(difficulty));
    setGuess("");
    setFeedback(null);
    setSaved(false);
    setRunning(true);
  }

  function submit() {
    if (!running) return;
    const ok = guess.trim().toUpperCase() === problem.answer.toUpperCase();
    if (ok) {
      const bonus = Math.min(streak, 10);
      setScore((s) => s + 10 + bonus);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));
      setFeedback("correct");
    } else {
      setStreak(0);
      setFeedback("wrong");
    }
    setGuess("");
    setProblem(generateProblem(difficulty));
    setTimeout(() => setFeedback(null), 350);
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-display font-bold">Conversion Challenge</h1>
      <p className="opacity-75 text-sm">
        Solve as many as you can in {TIME_PER_ROUND}s. Streaks add bonus points; one wrong answer breaks the streak.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm opacity-70">Difficulty:</span>
        {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
          <button
            key={d}
            disabled={running}
            onClick={() => setDifficulty(d)}
            className={`chip ${difficulty === d ? "border-cyan-300 bg-cyan-300/10" : ""}`}
          >
            {d}
          </button>
        ))}
        <span className="ml-auto chip">⏱ {time}s</span>
        <span className="chip">Score: {score}</span>
        <span className="chip">🔥 {streak}</span>
      </div>

      <div className="glass p-6 min-h-[180px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {running ? (
            <motion.div
              key={problem.prompt + Math.random()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="text-xs uppercase tracking-wider opacity-70">{problem.type.replace(/_/g, " ")}</div>
              <div className="text-2xl font-mono mt-2">{problem.prompt}</div>
              <div className="mt-4 flex gap-2">
                <input
                  ref={inputRef}
                  className="input font-mono"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Your answer"
                />
                <button className="neon-btn" onClick={submit}>Submit</button>
              </div>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-3 inline-block rounded-full px-3 py-1 text-sm ${
                    feedback === "correct" ? "bg-emerald-400/20 text-emerald-200" : "bg-rose-400/20 text-rose-200"
                  }`}
                >
                  {feedback === "correct" ? "✓ Correct!" : "✗ Try again"}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
              <div className="text-lg opacity-80">
                {score === 0 ? "Ready when you are." : `Final score: ${score} · Best streak ${maxStreak}`}
              </div>
              <button className="neon-btn mt-4" onClick={start}>
                {score === 0 ? "Start" : "Play again"}
              </button>
              {saved && <p className="mt-2 text-xs opacity-70">Saved to your profile.</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

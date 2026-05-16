"use client";
import { recordGameScore } from "@/lib/local-progress";
import { generateProblem } from "@/lib/convert";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
const TIME_PER_ROUND = 60;

export default function ConversionChallenge() {
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
      recordGameScore({
        mode: "CONVERSION_CHALLENGE",
        score,
        streakMax: maxStreak,
        meta: { difficulty },
      });
      setSaved(true);
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

  const timeLow = time <= 10;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <header>
        <span className="chip chip-mint">⚡ Conversion Challenge</span>
        <h1 className="text-2xl md:text-3xl font-display font-black mt-3">
          Race the clock
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Solve as many as you can in {TIME_PER_ROUND}s. Streaks add bonus points.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Difficulty:
        </span>
        {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
          <button
            key={d}
            disabled={running}
            onClick={() => setDifficulty(d)}
            className={`chip ${
              difficulty === d ? "chip-mint" : ""
            } disabled:opacity-60`}
          >
            {d}
          </button>
        ))}
      </div>

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

      <div className="card min-h-[220px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {running ? (
            <motion.div
              key={problem.prompt + Math.random()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">
                {problem.type.replace(/_/g, " ")}
              </div>
              <div className="text-3xl font-mono font-extrabold mt-2 break-words">
                {problem.prompt}
              </div>
              <div className="mt-5 flex gap-2">
                <input
                  ref={inputRef}
                  className="input font-mono text-lg"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Your answer"
                />
                <button className="btn-primary" onClick={submit}>
                  Submit
                </button>
              </div>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-4 inline-block rounded-full px-3 py-1.5 text-sm font-bold ${
                    feedback === "correct"
                      ? "bg-[var(--mint-soft)] text-[var(--mint-dark)]"
                      : "bg-[var(--coral-soft)] text-[var(--coral-dark)]"
                  }`}
                >
                  {feedback === "correct" ? "✓ Correct!" : "✗ Try again"}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-2">{score === 0 ? "🎮" : "🏁"}</div>
              <div className="text-lg font-bold">
                {score === 0
                  ? "Ready when you are."
                  : `Final score: ${score}`}
              </div>
              {score > 0 && (
                <div className="text-sm text-[var(--text-muted)] mt-1">
                  Best streak: {maxStreak}
                </div>
              )}
              <button className="btn-primary mt-5" onClick={start}>
                {score === 0 ? "Start" : "Play again"}
              </button>
              {saved && (
                <p className="mt-3 text-xs text-[var(--text-muted)]">
                  Saved to your profile.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

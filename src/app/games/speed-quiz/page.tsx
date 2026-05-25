"use client";
import { recordGameScore } from "@/lib/local-progress";
import {
  generateProblem,
  hintForType,
  explainConversion,
  type ConvType,
  type ExplainLine,
} from "@/lib/convert";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const TIME = 60;

type MCQ = {
  type: ConvType;
  prompt: string;
  display: string;
  answer: string;
  choices: string[];
  createdAt: number;
};

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
    type: p.type,
    prompt: p.prompt,
    display: p.display,
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
  const [hintVisible, setHintVisible] = useState(false);
  const [explanation, setExplanation] = useState<{
    lines: ExplainLine[];
    wasCorrect: boolean;
    answer: string;
  } | null>(null);

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
    setHintVisible(false);
    setExplanation(null);
    setFlash(null);
    setRunning(true);
  }

  function pick(choice: string) {
    if (!q || !running) return;
    const ok = choice === q.answer;

    // Build explanation from current question before advancing
    const lines = explainConversion(q.type, q.display, q.answer);
    setExplanation({ lines, wasCorrect: ok, answer: q.answer });

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
    setHintVisible(false);
    setTimeout(() => setFlash(null), 200);
    // Explanation shows for 2.5s then fades
    setTimeout(() => setExplanation(null), 2500);
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
          {TIME} seconds. Pick fast for speed bonuses. See a hint if you get stuck.
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

                {/* Hint button */}
                <div className="mt-3">
                  <button
                    className={`btn-secondary !text-sm !py-1.5 !px-3 ${hintVisible ? "!bg-[var(--gold-soft)] !border-[var(--gold)]" : ""}`}
                    onClick={() => setHintVisible((v) => !v)}
                  >
                    💡 {hintVisible ? "Hide hint" : "Show hint"}
                  </button>
                </div>

                {/* Hint panel */}
                <AnimatePresence>
                  {hintVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-2 rounded-xl border border-[var(--gold)] bg-[var(--gold-soft)] p-3"
                    >
                      <p className="text-xs font-extrabold text-[var(--gold-dark)] mb-2">
                        💡 How to approach this:
                      </p>
                      <ol className="space-y-1.5">
                        {hintForType(q.type).map((hint, i) => (
                          <li key={i} className="flex gap-2 text-xs">
                            <span className="shrink-0 h-4 w-4 rounded-full bg-[var(--gold)] text-[#3d2800] flex items-center justify-center text-[10px] font-black">
                              {i + 1}
                            </span>
                            <span className="text-[var(--text-muted)] leading-relaxed">{hint}</span>
                          </li>
                        ))}
                      </ol>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Answer choices */}
                <div className="grid grid-cols-2 gap-3 mt-4">
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

                {/* Explanation panel — shows after picking, auto-fades */}
                <AnimatePresence>
                  {explanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-4 rounded-xl border p-3 space-y-1 ${
                        explanation.wasCorrect
                          ? "bg-[var(--mint-soft)] border-[#c7e9a2]"
                          : "bg-[var(--coral-soft)] border-[#ffc4c4]"
                      }`}
                    >
                      <p className={`text-xs font-extrabold mb-1.5 ${explanation.wasCorrect ? "text-[var(--mint-dark)]" : "text-[var(--coral-dark)]"}`}>
                        {explanation.wasCorrect
                          ? "Correct! Here is how it works:"
                          : `Answer: ${explanation.answer} — here is the process:`}
                      </p>
                      {explanation.lines.slice(0, 6).map((line, i) => {
                        if (line.label) {
                          return (
                            <p key={i} className={`text-[10px] font-extrabold uppercase tracking-wide pt-0.5 ${explanation.wasCorrect ? "text-[var(--mint-dark)]" : "text-[var(--coral-dark)]"}`}>
                              {line.text}
                            </p>
                          );
                        }
                        return (
                          <div
                            key={i}
                            className={`text-xs font-mono rounded px-1.5 py-0.5 ${
                              line.highlight
                                ? explanation.wasCorrect
                                  ? "bg-white/70 text-[var(--mint-dark)] font-black"
                                  : "bg-white/70 text-[var(--coral-dark)] font-black"
                                : "bg-white/40 text-[var(--text-muted)]"
                            }`}
                          >
                            {line.text}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
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

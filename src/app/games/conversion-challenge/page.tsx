"use client";
import { recordGameScore } from "@/lib/local-progress";
import { generateProblem } from "@/lib/convert";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type Problem = ReturnType<typeof generateProblem>;
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
  const [answerCount, setAnswerCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [totalAnswerMs, setTotalAnswerMs] = useState(0);
  const [fastestAnswerMs, setFastestAnswerMs] = useState<number | null>(null);
  const [elapsedRoundSeconds, setElapsedRoundSeconds] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [lastAnswer, setLastAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const roundStartedAt = useRef<number | null>(null);
  const problemStartedAt = useRef(Date.now());

  const accuracy = answerCount > 0 ? Math.round((correctCount / answerCount) * 100) : 0;
  const averageAnswerSeconds =
    answerCount > 0 ? Number((totalAnswerMs / answerCount / 1000).toFixed(1)) : 0;
  const fastestAnswerSeconds =
    fastestAnswerMs == null ? null : Number((fastestAnswerMs / 1000).toFixed(1));

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      const started = roundStartedAt.current;
      setElapsedRoundSeconds(
        started ? Math.round((Date.now() - started) / 1000) : TIME_PER_ROUND
      );
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
    if (!running && answerCount > 0 && !saved) {
      recordGameScore({
        mode: "CONVERSION_CHALLENGE",
        score,
        streakMax: maxStreak,
        meta: {
          difficulty,
          attempts: answerCount,
          correctCount,
          wrongCount,
          accuracy,
          averageAnswerSeconds,
          fastestAnswerSeconds,
          totalRoundSeconds: elapsedRoundSeconds,
        },
      });
      setSaved(true);
    }
  }, [
    running,
    score,
    maxStreak,
    difficulty,
    answerCount,
    correctCount,
    wrongCount,
    accuracy,
    averageAnswerSeconds,
    fastestAnswerSeconds,
    elapsedRoundSeconds,
    saved,
  ]);

  function start() {
    const now = Date.now();
    roundStartedAt.current = now;
    problemStartedAt.current = now;
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTime(TIME_PER_ROUND);
    setAnswerCount(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTotalAnswerMs(0);
    setFastestAnswerMs(null);
    setElapsedRoundSeconds(0);
    setProblem(generateProblem(difficulty));
    setGuess("");
    setFeedback(null);
    setLastAnswer("");
    setSaved(false);
    setRunning(true);
  }

  function submit() {
    if (!running) return;
    const submitted = guess.trim();
    if (!submitted) return;
    const now = Date.now();
    const answerMs = Math.max(0, now - problemStartedAt.current);
    const ok = guess.trim().toUpperCase() === problem.answer.toUpperCase();
    setAnswerCount((n) => n + 1);
    setTotalAnswerMs((ms) => ms + answerMs);
    setFastestAnswerMs((ms) => (ms == null ? answerMs : Math.min(ms, answerMs)));
    setLastAnswer(problem.answer);
    if (ok) {
      setCorrectCount((n) => n + 1);
      const bonus = Math.min(streak, 10);
      setScore((s) => s + 10 + bonus);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));
      setFeedback("correct");
    } else {
      setWrongCount((n) => n + 1);
      setStreak(0);
      setFeedback("wrong");
    }
    setGuess("");
    setProblem(generateProblem(difficulty));
    problemStartedAt.current = Date.now();
    setTimeout(() => setFeedback(null), 350);
  }

  const timeLow = time <= 10;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <span className="chip chip-mint">⚡ Conversion Challenge</span>
        <h1 className="text-2xl md:text-3xl font-display font-black mt-3">
          Race the clock
        </h1>
        <p className="text-base text-[var(--text-muted)] mt-1 max-w-2xl">
          Solve as many as you can in {TIME_PER_ROUND}s. Every prompt says exactly
          what to convert, and the round tracks accuracy plus average response time.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="font-display text-xl font-extrabold">General rule</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <RuleStep label="Read" body="Find the source base in the prompt." tone="sky" />
            <RuleStep label="Bridge" body="Use place values, repeated division, or bit groups." tone="gold" />
            <RuleStep label="Rewrite" body="Answer only in the target base." tone="mint" />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
          <div className="text-sm font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
            Difficulty
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
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
        </div>
      </section>

      <div className="grid gap-2 sm:grid-cols-5">
        <span className={`chip justify-center !py-2 ${timeLow ? "chip-coral" : "chip-sky"}`}>
          Time {time}s
        </span>
        <span className="chip chip-gold justify-center !py-2">Score {score}</span>
        <span className="chip chip-coral justify-center !py-2">Streak {streak}</span>
        <span className="chip chip-mint justify-center !py-2">Accuracy {accuracy}%</span>
        <span className="chip justify-center !py-2">Avg {averageAnswerSeconds}s</span>
      </div>

      <div className="card min-h-[220px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {running ? (
            <motion.div
              key={problem.prompt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="text-sm uppercase tracking-wider font-bold text-[var(--text-muted)]">
                {problem.type.replace(/_/g, " ")}
              </div>
              <div className="text-3xl font-mono font-extrabold mt-2 break-words">
                {problem.prompt}
              </div>
              <ProblemVisual problem={problem} />
              <p className="mt-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-4 py-3 text-base text-[var(--text-muted)]">
                <strong className="text-[var(--text)]">Rule:</strong> {problem.rule}
              </p>
              <div className="mt-5 flex gap-2">
                <input
                  ref={inputRef}
                  className="input font-mono text-lg"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Your answer"
                />
                <button className="btn-primary" onClick={submit} disabled={!guess.trim()}>
                  Submit
                </button>
              </div>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-4 inline-block rounded-full px-3 py-1.5 text-base font-bold ${
                    feedback === "correct"
                      ? "bg-[var(--mint-soft)] text-[var(--mint-dark)]"
                      : "bg-[var(--coral-soft)] text-[var(--coral-dark)]"
                  }`}
                >
                  {feedback === "correct" ? "Correct!" : `Answer: ${lastAnswer}`}
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
              {answerCount > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                  <FinalMetric label="Correct" value={`${correctCount}/${answerCount}`} />
                  <FinalMetric label="Accuracy" value={`${accuracy}%`} />
                  <FinalMetric label="Avg time" value={`${averageAnswerSeconds}s`} />
                  <FinalMetric label="Best streak" value={`${maxStreak}`} />
                </div>
              )}
              <button className="btn-primary mt-5" onClick={start}>
                {score === 0 ? "Start" : "Play again"}
              </button>
              {saved && (
                <p className="mt-3 text-sm text-[var(--text-muted)]">
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

function RuleStep({
  label,
  body,
  tone,
}: {
  label: string;
  body: string;
  tone: "sky" | "gold" | "mint";
}) {
  const toneClass = {
    sky: "chip-sky",
    gold: "chip-gold",
    mint: "chip-mint",
  }[tone];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <span className={`chip ${toneClass}`}>{label}</span>
      <p className="mt-2 text-base leading-snug text-[var(--text-muted)]">{body}</p>
    </div>
  );
}

function ProblemVisual({ problem }: { problem: Problem }) {
  return (
    <div className="mt-5 grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr]">
      <BaseTile label={problem.sourceLabel} value={problem.display} tone="sky" />
      <div className="hidden sm:grid place-items-center px-2 font-display text-2xl font-black text-[var(--text-muted)]">
        to
      </div>
      <BaseTile label={problem.targetLabel} value="?" tone="mint" />
    </div>
  );
}

function BaseTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "sky" | "mint";
}) {
  const toneClass = tone === "sky" ? "bg-[var(--sky-soft)]" : "bg-[var(--mint-soft)]";
  const textClass = tone === "sky" ? "text-[var(--sky-dark)]" : "text-[var(--mint-dark)]";

  return (
    <div className={`rounded-2xl border border-[var(--border)] ${toneClass} p-4`}>
      <div className={`text-sm font-extrabold uppercase tracking-wide ${textClass}`}>
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-black break-words">{value}</div>
    </div>
  );
}

function FinalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
      <div className="text-sm font-bold text-[var(--text-muted)]">{label}</div>
      <div className="font-display text-xl font-black">{value}</div>
    </div>
  );
}

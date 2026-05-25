"use client";
import { recordGameScore } from "@/lib/local-progress";
import {
  generateProblem,
  hintForType,
  explainConversion,
  type GameDifficulty,
  type ExplainLine,
  type ConvType,
} from "@/lib/convert";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Progressive difficulty tiers shown to the user
type Tier = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

type Problem = ReturnType<typeof generateProblem>;

const TIME_PER_ROUND = 60;

// After this many cumulative correct answers, auto-advance tier
const ADVANCE_AT: Partial<Record<Tier, number>> = {
  BEGINNER: 5,
  INTERMEDIATE: 10,
};

const TIER_LABEL: Record<Tier, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const TIER_DESCRIPTION: Record<Tier, string> = {
  BEGINNER: "Binary ↔ Decimal · numbers 1–15",
  INTERMEDIATE: "Adds Hex ↔ Decimal and Binary ↔ Hex · numbers 1–255",
  ADVANCED: "All 12 conversion types · numbers 1–4095",
};

// Derive which tier to show next given current tier and correct count
function nextTier(current: Tier, correctCount: number): Tier {
  const threshold = ADVANCE_AT[current];
  if (threshold == null) return current; // already ADVANCED
  if (correctCount >= threshold) {
    return current === "BEGINNER" ? "INTERMEDIATE" : "ADVANCED";
  }
  return current;
}

export default function ConversionChallenge() {
  const [baseTier, setBaseTier] = useState<Tier>("BEGINNER");
  const [progressTier, setProgressTier] = useState<Tier>("BEGINNER");
  const [running, setRunning] = useState(false);
  const [problem, setProblem] = useState<Problem>(() => generateProblem("BEGINNER"));
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

  const [hintVisible, setHintVisible] = useState(false);
  const [explanation, setExplanation] = useState<{
    lines: ExplainLine[];
    wasCorrect: boolean;
    answer: string;
  } | null>(null);
  const [leveledUp, setLeveledUp] = useState<Tier | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [saved, setSaved] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const roundStartedAt = useRef<number | null>(null);
  const problemStartedAt = useRef(Date.now());

  const accuracy = answerCount > 0 ? Math.round((correctCount / answerCount) * 100) : 0;
  const averageAnswerSeconds =
    answerCount > 0 ? Number((totalAnswerMs / answerCount / 1000).toFixed(1)) : 0;
  const fastestAnswerSeconds =
    fastestAnswerMs == null ? null : Number((fastestAnswerMs / 1000).toFixed(1));

  // Countdown timer
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

  // Keep input focused
  useEffect(() => {
    if (running) inputRef.current?.focus();
  }, [running, problem]);

  // Save score when round ends
  useEffect(() => {
    if (!running && answerCount > 0 && !saved) {
      recordGameScore({
        mode: "CONVERSION_CHALLENGE",
        score,
        streakMax: maxStreak,
        meta: {
          difficulty: progressTier,
          baseDifficulty: baseTier,
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
    running, score, maxStreak, baseTier, progressTier, answerCount, correctCount,
    wrongCount, accuracy, averageAnswerSeconds, fastestAnswerSeconds,
    elapsedRoundSeconds, saved,
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
    setProgressTier(baseTier);
    setProblem(generateProblem(baseTier));
    setGuess("");
    setHintVisible(false);
    setExplanation(null);
    setFeedback(null);
    setLeveledUp(null);
    setSaved(false);
    setRunning(true);
  }

  function submit() {
    if (!running) return;
    const submitted = guess.trim();
    if (!submitted) return;

    const now = Date.now();
    const answerMs = Math.max(0, now - problemStartedAt.current);
    const ok = submitted.toUpperCase() === problem.answer.toUpperCase();

    // Build explanation immediately from the current problem
    const explainLines = explainConversion(problem.type, problem.display, problem.answer);
    setExplanation({ lines: explainLines, wasCorrect: ok, answer: problem.answer });

    setAnswerCount((n) => n + 1);
    setTotalAnswerMs((ms) => ms + answerMs);
    setFastestAnswerMs((ms) => (ms == null ? answerMs : Math.min(ms, answerMs)));

    // Brief feedback flash
    setFeedback(ok ? "correct" : "wrong");
    setTimeout(() => setFeedback(null), 800);

    let currentTier = progressTier;

    if (ok) {
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      setScore((s) => s + 10 + Math.min(streak, 10));
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));

      // Check progressive difficulty advance
      const advanced = nextTier(progressTier, newCorrect);
      if (advanced !== progressTier) {
        currentTier = advanced;
        setProgressTier(advanced);
        setLeveledUp(advanced);
        setTimeout(() => setLeveledUp(null), 3000);
      }
    } else {
      setWrongCount((n) => n + 1);
      setStreak(0);
    }

    setGuess("");
    setHintVisible(false);
    setProblem(generateProblem(currentTier));
    problemStartedAt.current = Date.now();
  }

  const timeLow = time <= 10;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Level-up toast */}
      <AnimatePresence>
        {leveledUp && <LevelUpToast tier={leveledUp} />}
      </AnimatePresence>

      {/* Header */}
      <header>
        <span className="chip chip-mint">⚡ Conversion Challenge</span>
        <h1 className="text-2xl md:text-3xl font-display font-black mt-3">
          Race the clock
        </h1>
        <p className="text-base text-[var(--text-muted)] mt-1 max-w-2xl">
          Solve as many conversions as you can in {TIME_PER_ROUND} seconds.
          The challenge starts simple and gets harder as you improve.
        </p>
      </header>

      {/* How-to rule section */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="font-display text-xl font-extrabold">How to solve any conversion</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <RuleStep label="1. Read" body="Identify the source base and the target base from the prompt." tone="sky" />
          <RuleStep label="2. Bridge" body="Use place values, repeated division, or bit groups depending on the bases." tone="gold" />
          <RuleStep label="3. Rewrite" body="Write your answer using only the symbols of the target base." tone="mint" />
        </div>
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-3">
            Worked example — Convert 13 (decimal) to binary
          </div>
          <div className="grid gap-1.5 font-mono text-sm">
            {[
              { step: "13 ÷ 2 = 6", rem: "1" },
              { step: "6  ÷ 2 = 3", rem: "0" },
              { step: "3  ÷ 2 = 1", rem: "1" },
              { step: "1  ÷ 2 = 0", rem: "1" },
            ].map(({ step, rem }, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-white border border-[var(--border)] px-3 py-1.5"
              >
                <span>{step}</span>
                <span className={`chip !py-0.5 !px-2 text-xs ${rem === "1" ? "chip-mint" : ""}`}>
                  R {rem}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Read remainders <strong>bottom to top</strong> → answer is{" "}
            <span className="font-mono font-black text-[var(--text)]">1101</span>
          </p>
        </div>
      </section>

      {/* Difficulty / tier selector */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
        <div className="text-sm font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-1">
          Starting difficulty
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          The challenge auto-advances to harder problems as you answer correctly.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as Tier[]).map((tier) => (
            <button
              key={tier}
              disabled={running}
              onClick={() => setBaseTier(tier)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                baseTier === tier
                  ? "border-[var(--mint)] bg-[var(--mint-soft)]"
                  : "border-[var(--border)] bg-white hover:bg-[var(--surface-2)]"
              }`}
            >
              <div className={`font-extrabold text-sm ${baseTier === tier ? "text-[var(--mint-dark)]" : "text-[var(--text)]"}`}>
                {TIER_LABEL[tier]}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug">
                {TIER_DESCRIPTION[tier]}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Live stats bar */}
      <div className="grid gap-2 grid-cols-3 sm:grid-cols-6">
        <span className={`chip justify-center !py-2 !text-sm col-span-1 ${timeLow ? "chip-coral" : "chip-sky"}`}>
          ⏱ {time}s
        </span>
        <span className="chip chip-gold justify-center !py-2 !text-sm">Score {score}</span>
        <span className="chip chip-coral justify-center !py-2 !text-sm">Streak {streak}</span>
        <span className="chip chip-mint justify-center !py-2 !text-sm">Accuracy {accuracy}%</span>
        <span className="chip justify-center !py-2 !text-sm">Avg {averageAnswerSeconds}s</span>
        <span className={`chip justify-center !py-2 !text-sm ${
          progressTier === "BEGINNER"
            ? "chip-sky"
            : progressTier === "INTERMEDIATE"
            ? "chip-gold"
            : "chip-coral"
        }`}>
          {TIER_LABEL[progressTier]}
        </span>
      </div>

      {/* Problem area */}
      <div className="card min-h-[260px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {running ? (
            <motion.div
              key={problem.prompt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Brief feedback flash */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    key={feedback}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute top-3 right-3 rounded-full px-3 py-1 text-sm font-black ${
                      feedback === "correct"
                        ? "bg-[var(--mint)] text-[#173006]"
                        : "bg-[var(--coral)] text-white"
                    }`}
                  >
                    {feedback === "correct" ? "Correct!" : "Wrong!"}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">
                {problem.type.replace(/_/g, " ")}
              </div>
              <div className="text-3xl font-mono font-extrabold mt-2 break-words">
                {problem.prompt}
              </div>

              <ProblemVisual problem={problem} />

              {/* Input row with hint button */}
              <div className="mt-5 flex gap-2">
                <input
                  ref={inputRef}
                  className="input font-mono text-lg"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Your answer…"
                />
                <button
                  className="btn-primary shrink-0"
                  onClick={submit}
                  disabled={!guess.trim()}
                >
                  Submit
                </button>
                <button
                  className={`btn-secondary shrink-0 ${hintVisible ? "!bg-[var(--gold-soft)] !border-[var(--gold)]" : ""}`}
                  onClick={() => setHintVisible((v) => !v)}
                  title="Show hint"
                >
                  💡 Hint
                </button>
              </div>

              {/* Hint panel */}
              <AnimatePresence>
                {hintVisible && <HintPanel type={problem.type} onClose={() => setHintVisible(false)} />}
              </AnimatePresence>

              {/* Explanation panel (persists until next submit) */}
              <AnimatePresence>
                {explanation && (
                  <ExplanationPanel
                    key={explanation.answer + String(explanation.wasCorrect)}
                    lines={explanation.lines}
                    wasCorrect={explanation.wasCorrect}
                    answer={explanation.answer}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-2">{score === 0 ? "🎮" : "🏁"}</div>
              <div className="text-xl font-display font-black">
                {score === 0 ? "Ready when you are." : `Final score: ${score}`}
              </div>
              {answerCount > 0 && (
                <>
                  <div className="mt-4 grid gap-2 sm:grid-cols-4">
                    <FinalMetric label="Correct" value={`${correctCount}/${answerCount}`} />
                    <FinalMetric label="Accuracy" value={`${accuracy}%`} />
                    <FinalMetric label="Avg time" value={`${averageAnswerSeconds}s`} />
                    <FinalMetric label="Best streak" value={`${maxStreak}`} />
                  </div>
                  {fastestAnswerSeconds != null && (
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      Fastest answer: <strong>{fastestAnswerSeconds}s</strong>
                    </p>
                  )}
                  {progressTier !== baseTier && (
                    <p className="mt-2 text-sm font-bold text-[var(--mint-dark)]">
                      Advanced from {TIER_LABEL[baseTier]} → {TIER_LABEL[progressTier]} during this round!
                    </p>
                  )}
                </>
              )}
              <button className="btn-primary mt-6" onClick={start}>
                {score === 0 ? "Start 60-second round" : "Play again"}
              </button>
              {saved && (
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  Score saved to your profile.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RuleStep({
  label,
  body,
  tone,
}: {
  label: string;
  body: string;
  tone: "sky" | "gold" | "mint";
}) {
  const toneClass = { sky: "chip-sky", gold: "chip-gold", mint: "chip-mint" }[tone];
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
        →
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
  const bg = tone === "sky" ? "bg-[var(--sky-soft)]" : "bg-[var(--mint-soft)]";
  const text = tone === "sky" ? "text-[var(--sky-dark)]" : "text-[var(--mint-dark)]";
  return (
    <div className={`rounded-2xl border border-[var(--border)] ${bg} p-4`}>
      <div className={`text-xs font-extrabold uppercase tracking-wide ${text}`}>{label}</div>
      <div className="mt-2 font-mono text-2xl font-black break-words">{value}</div>
    </div>
  );
}

function HintPanel({ type, onClose }: { type: ConvType; onClose: () => void }) {
  const hints = hintForType(type);
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="mt-3 rounded-xl border border-[var(--gold)] bg-[var(--gold-soft)] overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="chip chip-gold text-xs">💡 Hint</span>
            <p className="text-sm font-bold text-[var(--gold-dark)] mt-1">
              How to approach this conversion:
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-sm font-bold text-[var(--gold-dark)] hover:opacity-70 mt-1"
          >
            ✕
          </button>
        </div>
        <ol className="space-y-2">
          {hints.map((hint, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <span className="shrink-0 h-5 w-5 rounded-full bg-[var(--gold)] text-[#3d2800] flex items-center justify-center text-xs font-black">
                {i + 1}
              </span>
              <span className="text-[var(--text-muted)] leading-relaxed">{hint}</span>
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}

function ExplanationPanel({
  lines,
  wasCorrect,
  answer,
}: {
  lines: ExplainLine[];
  wasCorrect: boolean;
  answer: string;
}) {
  const green = wasCorrect;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`mt-4 rounded-xl border p-4 space-y-1.5 ${
        green
          ? "bg-[var(--mint-soft)] border-[#c7e9a2]"
          : "bg-[var(--coral-soft)] border-[#ffc4c4]"
      }`}
    >
      <p className={`text-sm font-extrabold mb-2 ${green ? "text-[var(--mint-dark)]" : "text-[var(--coral-dark)]"}`}>
        {green
          ? "Correct! Here is how this conversion works:"
          : `Not quite — the answer is ${answer}. Here is the step-by-step process:`}
      </p>
      {lines.map((line, i) => {
        if (line.label) {
          return (
            <p key={i} className={`text-xs font-extrabold uppercase tracking-wide pt-1 ${green ? "text-[var(--mint-dark)]" : "text-[var(--coral-dark)]"}`}>
              {line.text}
            </p>
          );
        }
        if (line.highlight) {
          return (
            <div
              key={i}
              className={`rounded-lg px-2 py-1 font-mono font-black text-sm ${
                green
                  ? "bg-white/70 text-[var(--mint-dark)]"
                  : "bg-white/70 text-[var(--coral-dark)]"
              }`}
            >
              {line.text}
            </div>
          );
        }
        return (
          <div
            key={i}
            className={`text-sm ${line.code ? "font-mono bg-white/40 rounded px-2 py-0.5" : ""} text-[var(--text-muted)]`}
          >
            {line.text}
          </div>
        );
      })}
    </motion.div>
  );
}

function LevelUpToast({ tier }: { tier: Tier }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-[var(--gold)] px-6 py-4 shadow-2xl text-center pointer-events-none"
    >
      <div className="text-xl font-black text-[#3d2800]">Level Up!</div>
      <div className="text-sm font-bold text-[#3d2800] mt-0.5">
        Now on {TIER_LABEL[tier]} problems
      </div>
      <div className="text-xs text-[#5c3a00] mt-1">{TIER_DESCRIPTION[tier]}</div>
    </motion.div>
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

"use client";
import { type ExplainLine } from "@/lib/convert";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Base = 2 | 8 | 16;

type PlaceValueQ = {
  numberStr: string;
  base: Base;
  highlightIdx: number;
  digitChar: string;
  digitVal: number;
  position: number;
  placeValue: number;
  contribution: number;
};

const BASE_LABEL: Record<Base, string> = { 2: "binary", 8: "octal", 16: "hexadecimal" };
const BASE_CHIP: Record<Base, string> = { 2: "chip-sky", 8: "chip-coral", 16: "chip-lilac" };
const BASE_DARK: Record<Base, string> = {
  2: "text-[var(--sky-dark)]",
  8: "text-[var(--coral-dark)]",
  16: "text-[var(--lilac-dark)]",
};

function makeQ(): PlaceValueQ {
  const bases: Base[] = [2, 8, 16];
  const base = bases[Math.floor(Math.random() * bases.length)];
  const maxN = base === 2 ? 255 : base === 8 ? 511 : 255;
  const n = Math.floor(Math.random() * maxN) + 1;
  const numberStr = n.toString(base).toUpperCase();
  const highlightIdx = Math.floor(Math.random() * numberStr.length);
  const digitChar = numberStr[highlightIdx];
  const position = numberStr.length - 1 - highlightIdx;
  const placeValue = Math.pow(base, position);
  const digitVal = parseInt(digitChar, base);
  const contribution = digitVal * placeValue;
  return { numberStr, base, highlightIdx, digitChar, digitVal, position, placeValue, contribution };
}

function buildExplanation(q: PlaceValueQ): ExplainLine[] {
  const chars = q.numberStr.split("").reverse();
  return chars.map((c, i) => {
    const dv = parseInt(c, q.base);
    const pv = Math.pow(q.base, i);
    const prod = dv * pv;
    const isHighlighted = i === q.position;
    const cDisplay = q.base === 16 && dv >= 10 ? `${c}(=${dv})` : c;
    return {
      text: `${cDisplay} × ${q.base}^${i} = ${cDisplay} × ${pv} = ${prod}${isHighlighted ? "  ← highlighted digit" : ""}`,
      code: true,
      highlight: isHighlighted,
    };
  });
}

export default function PlaceValueTrainer() {
  const [q, setQ] = useState<PlaceValueQ>(makeQ);
  const [guess, setGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [explanation, setExplanation] = useState<ExplainLine[] | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  function submit() {
    const val = parseInt(guess.trim(), 10);
    if (isNaN(val)) return;
    const ok = val === q.contribution;
    setWasCorrect(ok);
    setSubmitted(true);
    setTotal((t) => t + 1);
    if (ok) setCorrect((c) => c + 1);
    setExplanation(buildExplanation(q));
    setHintVisible(false);
  }

  function next() {
    setQ(makeQ());
    setGuess("");
    setSubmitted(false);
    setHintVisible(false);
    setExplanation(null);
    setWasCorrect(null);
  }

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const hints = [
    `Find the highlighted digit's position from the right — here it is position ${q.position} (counting from 0 on the right).`,
    `Calculate the place value: ${q.base}^${q.position} = ${q.placeValue}.`,
    `Multiply: the digit "${q.digitChar}" has decimal value ${q.digitVal}. So ${q.digitVal} × ${q.placeValue} = the answer.`,
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <span className="chip chip-sky">📍 Place Value Trainer</span>
        <h1 className="text-2xl md:text-3xl font-display font-black mt-3">
          What is this digit worth?
        </h1>
        <p className="text-base text-[var(--text-muted)] mt-1 max-w-2xl">
          A single digit is highlighted in a number. Calculate its decimal contribution — how much that one digit adds to the overall value.
        </p>
      </header>

      {/* Stats */}
      <div className="flex gap-2">
        <span className="chip chip-mint !py-2">Correct {correct}/{total}</span>
        <span className="chip chip-gold !py-2">Accuracy {accuracy}%</span>
      </div>

      <div className="card space-y-5">
        {/* Number display */}
        <div>
          <div className={`text-xs font-extrabold uppercase tracking-wide mb-3 ${BASE_DARK[q.base]}`}>
            {BASE_LABEL[q.base]} number
          </div>
          <div className="flex gap-2 flex-wrap items-end">
            {q.numberStr.split("").map((ch, i) => {
              const isHigh = i === q.highlightIdx;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  {isHigh && (
                    <div className="text-[10px] font-black text-[var(--gold-dark)] animate-bounce">▼</div>
                  )}
                  <div
                    className={`rounded-xl border-2 px-4 py-3 font-mono text-3xl font-black transition-all ${
                      isHigh
                        ? "border-[var(--gold)] bg-[var(--gold-soft)] text-[#3d2800] shadow-lg scale-110"
                        : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] opacity-60"
                    }`}
                  >
                    {ch}
                  </div>
                  {isHigh && (
                    <div className="text-[9px] font-bold text-[var(--text-muted)]">
                      {q.base}<sup>{q.position}</sup>={q.placeValue}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-base text-[var(--text-muted)]">
            The highlighted <span className="font-mono font-black text-[var(--text)]">{q.digitChar}</span> sits in the{" "}
            <strong>{q.base}<sup>{q.position}</sup> = {q.placeValue}</strong> place.
            {" "}What decimal value does it contribute?
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <input
            className="input font-mono text-lg"
            placeholder="Enter a whole decimal number…"
            value={guess}
            disabled={submitted}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !submitted && submit()}
          />
          <div className="flex gap-2">
            {!submitted ? (
              <>
                <button
                  className="btn-primary flex-1"
                  onClick={submit}
                  disabled={!guess.trim()}
                >
                  Check
                </button>
                <button
                  className={`btn-secondary shrink-0 ${hintVisible ? "!bg-[var(--gold-soft)] !border-[var(--gold)]" : ""}`}
                  onClick={() => setHintVisible((v) => !v)}
                >
                  💡 Hint
                </button>
              </>
            ) : (
              <button className="btn-primary flex-1" onClick={next}>
                Next question →
              </button>
            )}
          </div>
        </div>

        {/* Hint panel */}
        <AnimatePresence>
          {hintVisible && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-xl border border-[var(--gold)] bg-[var(--gold-soft)] p-4"
            >
              <p className="text-xs font-extrabold text-[var(--gold-dark)] mb-3">💡 How to find a digit's contribution:</p>
              <ol className="space-y-2">
                {hints.map((h, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-[var(--gold)] text-[#3d2800] flex items-center justify-center text-xs font-black">
                      {i + 1}
                    </span>
                    <span className="text-[var(--text-muted)] leading-relaxed">{h}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explanation panel */}
        <AnimatePresence>
          {explanation && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-xl border p-4 space-y-1.5 ${
                wasCorrect
                  ? "bg-[var(--mint-soft)] border-[#c7e9a2]"
                  : "bg-[var(--coral-soft)] border-[#ffc4c4]"
              }`}
            >
              <p className={`text-sm font-extrabold mb-2 ${wasCorrect ? "text-[var(--mint-dark)]" : "text-[var(--coral-dark)]"}`}>
                {wasCorrect
                  ? `Correct! "${q.digitChar}" in the ${q.placeValue}s place contributes ${q.contribution}.`
                  : `Not quite — the answer is ${q.contribution}. Here is the full breakdown:`}
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-2">
                Full place value breakdown (right to left):
              </p>
              {explanation.map((line, i) => (
                <div
                  key={i}
                  className={`text-xs font-mono rounded px-2 py-1 ${
                    line.highlight
                      ? wasCorrect
                        ? "bg-white/70 text-[var(--mint-dark)] font-black"
                        : "bg-white/70 text-[var(--coral-dark)] font-black"
                      : "bg-white/40 text-[var(--text-muted)]"
                  }`}
                >
                  {line.text}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

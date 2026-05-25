"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toBase, hintForType, explainConversion, type ExplainLine } from "@/lib/convert";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getLessonBySlug, LESSONS } from "@/lib/data";

export default function LessonDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const lesson = getLessonBySlug(slug);
  const currentIdx = LESSONS.findIndex((l) => l.slug === slug);
  const prevLesson = currentIdx > 0 ? LESSONS[currentIdx - 1] : null;
  const nextLesson = currentIdx < LESSONS.length - 1 ? LESSONS[currentIdx + 1] : null;

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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div>
          <span className="chip chip-sky">{lesson.topic}</span>
          <h1 className="text-3xl md:text-4xl font-display font-black mt-3">
            {lesson.title}
          </h1>
        </div>

        <article className="card">
          <LessonArticle content={lesson.content} />
        </article>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="btn-secondary" href="/lessons">
            ← All lessons
          </Link>
          <div className="flex gap-2 flex-wrap">
            {prevLesson && (
              <Link className="btn-secondary" href={`/lessons/${prevLesson.slug}`}>
                ← {prevLesson.title}
              </Link>
            )}
            {nextLesson && (
              <Link className="btn-primary" href={`/lessons/${nextLesson.slug}`}>
                {nextLesson.title} →
              </Link>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <LessonVisual topic={lesson.topic} slug={lesson.slug} />
        <InteractivePractice />
      </aside>
    </div>
  );
}

function LessonArticle({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("# ")) {
      nodes.push(
        <h2 key={i} className="font-display text-2xl font-black">
          {line.slice(2)}
        </h2>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={i} className="pt-4 font-display text-xl font-extrabold">
          {line.slice(3)}
        </h3>
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      i--;
      nodes.push(
        <ul key={i} className="list-disc space-y-2 pl-6 text-base leading-7">
          {items.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      i--;
      nodes.push(
        <ol key={i} className="list-decimal space-y-2 pl-6 text-base leading-7">
          {items.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    nodes.push(
      <p key={i} className="text-base leading-7 text-[var(--text-muted)]">
        {renderInline(line)}
      </p>
    );
  }

  return <div className="space-y-4">{nodes}</div>;
}

function renderInline(text: string) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${i}`}
          className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-mono font-bold text-[var(--text)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${i}`} className="font-extrabold text-[var(--text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// ─── Lesson Visuals ──────────────────────────────────────────────────────────

function LessonVisual({ topic, slug }: { topic: string; slug: string }) {
  if (slug === "binary-basics") {
    return (
      <>
        <VisualShell title="Binary place values" chip="1011 = 11" tone="sky">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { place: "8", digit: "1", active: true },
              { place: "4", digit: "0", active: false },
              { place: "2", digit: "1", active: true },
              { place: "1", digit: "1", active: true },
            ].map(({ place, digit, active }) => (
              <div
                key={place}
                className={`rounded-xl p-3 ${
                  active
                    ? "bg-[var(--sky-soft)] border border-[#bde3fa]"
                    : "bg-[var(--surface-2)] border border-[var(--border)] opacity-50"
                }`}
              >
                <div className="text-xs font-bold text-[var(--sky-dark)]">2^{Math.log2(parseInt(place))}</div>
                <div className="text-sm font-bold text-[var(--text-muted)]">{place}</div>
                <div className="mt-1 font-mono text-2xl font-black">{digit}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-[var(--sky-soft)] border border-[#bde3fa] px-3 py-2 text-sm font-bold text-[var(--sky-dark)]">
            8 + 0 + 2 + 1 = <span className="text-[var(--text)] font-black">11</span>
          </div>
        </VisualShell>

        <VisualShell title="Division ladder (13 → binary)" chip="= 1101" tone="mint">
          <div className="space-y-1 font-mono text-sm">
            {[
              { dividend: "13", quotient: "6", rem: "1" },
              { dividend: "6",  quotient: "3", rem: "0" },
              { dividend: "3",  quotient: "1", rem: "1" },
              { dividend: "1",  quotient: "0", rem: "1" },
            ].map(({ dividend, quotient, rem }, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] border border-[var(--border)] px-3 py-1.5"
              >
                <span className="font-bold">{dividend} ÷ 2 = {quotient}</span>
                <span
                  className={`chip ${rem === "1" ? "chip-mint" : ""} !py-0.5 !px-2 text-xs`}
                >
                  R {rem}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)] text-right">
            Read remainders ↑ bottom to top
          </p>
        </VisualShell>
      </>
    );
  }

  if (slug === "hex-fundamentals") {
    return (
      <>
        <VisualShell title="Hex digit reference" chip="0–F" tone="lilac">
          <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
            {[
              ["0","0000"],["1","0001"],["2","0010"],["3","0011"],
              ["4","0100"],["5","0101"],["6","0110"],["7","0111"],
              ["8","1000"],["9","1001"],["A","1010"],["B","1011"],
              ["C","1100"],["D","1101"],["E","1110"],["F","1111"],
            ].map(([hex, bin]) => (
              <div key={hex} className="rounded-lg bg-[var(--lilac-soft)] border border-[#e2c6ff] p-1.5">
                <div className="font-black text-[var(--lilac-dark)] text-sm">{hex}</div>
                <div className="text-[9px] text-[var(--text-muted)] leading-none mt-0.5">{bin}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Each hex digit = exactly 4 binary bits
          </p>
        </VisualShell>

        <VisualShell title="Hex ↔ binary groups" chip="2F" tone="lilac">
          <div className="grid gap-2">
            <BitMap from="2" to="0010" tone="lilac" dec="2" />
            <BitMap from="F" to="1111" tone="lilac" dec="15" />
          </div>
          <div className="mt-3 rounded-xl bg-[var(--lilac-soft)] border border-[#e2c6ff] px-3 py-2 text-sm font-bold text-[var(--lilac-dark)]">
            2F hex = <span className="font-mono">00101111</span> binary = 47 decimal
          </div>
        </VisualShell>
      </>
    );
  }

  if (slug === "octal-overview") {
    return (
      <>
        <VisualShell title="Octal ↔ 3-bit groups" chip="52 = 42" tone="coral">
          <div className="grid gap-2">
            <BitMap from="5" to="101" tone="coral" dec="5" />
            <BitMap from="2" to="010" tone="coral" dec="2" />
          </div>
          <div className="mt-3 rounded-xl bg-[var(--coral-soft)] border border-[#ffc4c4] px-3 py-2 text-sm font-bold text-[var(--coral-dark)]">
            52 octal = <span className="font-mono">101010</span> binary = 42 decimal
          </div>
        </VisualShell>

        <VisualShell title="Octal digit reference" chip="0–7" tone="coral">
          <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
            {[
              ["0","000"],["1","001"],["2","010"],["3","011"],
              ["4","100"],["5","101"],["6","110"],["7","111"],
            ].map(([oct, bin]) => (
              <div key={oct} className="rounded-lg bg-[var(--coral-soft)] border border-[#ffc4c4] p-1.5">
                <div className="font-black text-[var(--coral-dark)] text-sm">{oct}</div>
                <div className="text-[9px] text-[var(--text-muted)] leading-none mt-0.5">{bin}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Each octal digit = exactly 3 binary bits
          </p>
        </VisualShell>
      </>
    );
  }

  if (slug === "conversion-mastery") {
    return (
      <>
        <VisualShell title="Universal bridge" chip="any → decimal → any" tone="gold">
          <div className="space-y-2">
            <RouteStep label="1. Source base" sub="Read your starting number" tone="sky" />
            <div className="flex justify-center text-[var(--text-muted)] font-black text-lg">↓</div>
            <RouteStep label="2. Convert to decimal" sub="Use place-value multiplication" tone="gold" />
            <div className="flex justify-center text-[var(--text-muted)] font-black text-lg">↓</div>
            <RouteStep label="3. Convert to target" sub="Use repeated division" tone="mint" />
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            When no direct shortcut exists, decimal is the reliable bridge.
          </p>
        </VisualShell>

        <VisualShell title="Shortcut guide" chip="quick ref" tone="sky">
          <div className="space-y-2 text-sm">
            {[
              { route: "Binary ↔ Hex", method: "Groups of 4 bits", color: "chip-lilac" },
              { route: "Binary ↔ Octal", method: "Groups of 3 bits", color: "chip-coral" },
              { route: "Any ↔ Decimal", method: "Place values / division", color: "chip-sky" },
              { route: "Octal ↔ Hex", method: "Bridge through decimal", color: "chip-gold" },
            ].map(({ route, method, color }) => (
              <div key={route} className="flex items-start justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                <span className="font-bold">{route}</span>
                <span className={`chip ${color} shrink-0 !text-xs`}>{method}</span>
              </div>
            ))}
          </div>
        </VisualShell>
      </>
    );
  }

  if (slug === "intro-number-systems") {
    return (
      <>
        <VisualShell title="42 in all four bases" chip="same value, different symbols" tone="sky">
          <div className="grid grid-cols-2 gap-2">
            {([
              { base: "10", label: "Decimal",     value: "42",     bg: "bg-[var(--mint-soft)]",  text: "text-[var(--mint-dark)]" },
              { base: "2",  label: "Binary",      value: "101010", bg: "bg-[var(--sky-soft)]",   text: "text-[var(--sky-dark)]" },
              { base: "16", label: "Hexadecimal", value: "2A",     bg: "bg-[var(--lilac-soft)]", text: "text-[var(--lilac-dark)]" },
              { base: "8",  label: "Octal",       value: "52",     bg: "bg-[var(--coral-soft)]", text: "text-[var(--coral-dark)]" },
            ] as const).map(({ base, label, value, bg, text }) => (
              <div key={base} className={`rounded-xl ${bg} p-3 text-center`}>
                <div className={`text-xs font-extrabold uppercase tracking-wide ${text}`}>{label}</div>
                <div className="mt-1 font-mono text-xl font-black">{value}</div>
                <div className={`text-[10px] ${text} opacity-70`}>base {base}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            All four represent the same quantity — forty-two.
          </p>
        </VisualShell>

        <VisualShell title="Place value structure" chip="positional" tone="mint">
          <div className="space-y-2 text-sm">
            {[
              { base: "Base 2",  label: "Binary",  places: "…8, 4, 2, 1" },
              { base: "Base 8",  label: "Octal",   places: "…512, 64, 8, 1" },
              { base: "Base 10", label: "Decimal", places: "…1000, 100, 10, 1" },
              { base: "Base 16", label: "Hex",     places: "…4096, 256, 16, 1" },
            ].map(({ base, label, places }) => (
              <div key={base} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 gap-2">
                <span className="font-bold shrink-0">{label}</span>
                <span className="font-mono text-xs text-[var(--text-muted)]">{places}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Each position is worth (base) × the position to its right.
          </p>
        </VisualShell>
      </>
    );
  }

  return (
    <VisualShell title="Place-value pattern" chip={topic} tone="sky">
      <div className="grid grid-cols-4 gap-2 text-center">
        {["base³", "base²", "base¹", "base⁰"].map((place) => (
          <div key={place} className="rounded-xl bg-[var(--sky-soft)] p-3">
            <div className="font-mono text-sm font-black text-[var(--sky-dark)]">
              {place}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-base text-[var(--text-muted)]">
        Every base uses the same place-value structure.
      </p>
    </VisualShell>
  );
}

// ─── Visual sub-components ───────────────────────────────────────────────────

function VisualShell({
  title,
  chip,
  tone,
  children,
}: {
  title: string;
  chip: string;
  tone: "sky" | "mint" | "lilac" | "coral" | "gold";
  children: React.ReactNode;
}) {
  const accentBg = {
    sky: "bg-[var(--sky)]",
    mint: "bg-[var(--mint)]",
    lilac: "bg-[var(--lilac)]",
    coral: "bg-[var(--coral)]",
    gold: "bg-[var(--gold)]",
  }[tone];

  const chipClass = {
    sky: "chip-sky",
    mint: "chip-mint",
    lilac: "chip-lilac",
    coral: "chip-coral",
    gold: "chip-gold",
  }[tone];

  return (
    <section className="card relative overflow-hidden">
      <div className={`tile-accent ${accentBg}`} />
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-extrabold">{title}</h2>
        <span className={`chip ${chipClass} font-mono text-xs`}>{chip}</span>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BitMap({
  from,
  to,
  tone,
  dec,
}: {
  from: string;
  to: string;
  tone: "lilac" | "coral";
  dec: string;
}) {
  const chip = tone === "lilac" ? "chip-lilac" : "chip-coral";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
      <span className={`chip ${chip} font-mono`}>{from}</span>
      <span className="text-xs font-black text-[var(--text-muted)]">({dec})</span>
      <span className="text-xs font-black text-[var(--text-muted)]">→</span>
      <span className="font-mono text-base font-black">{to}</span>
    </div>
  );
}

function RouteStep({
  label,
  sub,
  tone,
}: {
  label: string;
  sub: string;
  tone: "sky" | "gold" | "mint" | "coral";
}) {
  const bg = {
    sky: "bg-[var(--sky-soft)] border-[#bde3fa]",
    gold: "bg-[var(--gold-soft)] border-[#ffe28a]",
    mint: "bg-[var(--mint-soft)] border-[#c7e9a2]",
    coral: "bg-[var(--coral-soft)] border-[#ffc4c4]",
  }[tone];
  const text = {
    sky: "text-[var(--sky-dark)]",
    gold: "text-[var(--gold-dark)]",
    mint: "text-[var(--mint-dark)]",
    coral: "text-[var(--coral-dark)]",
  }[tone];

  return (
    <div className={`rounded-xl border px-4 py-3 ${bg}`}>
      <div className={`font-display font-extrabold text-sm ${text}`}>{label}</div>
      <div className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</div>
    </div>
  );
}

// ─── Interactive Practice ────────────────────────────────────────────────────

function InteractivePractice() {
  const [n, setN] = useState(13);
  const [guess, setGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  const correctAnswer = toBase(n, 2);
  const isCorrect = guess.trim() === correctAnswer;

  // Explanation is computed once per submit, based on the number at submit time
  const [explanation, setExplanation] = useState<{
    lines: ExplainLine[];
    wasCorrect: boolean;
    answer: string;
    number: number;
  } | null>(null);

  function handleSubmit() {
    if (!guess.trim()) return;
    const lines = explainConversion("DEC_TO_BIN", String(n), correctAnswer);
    setExplanation({ lines, wasCorrect: isCorrect, answer: correctAnswer, number: n });
    setSubmitted(true);
    setHintVisible(false);
  }

  function newNumber() {
    setN(Math.floor(Math.random() * 250) + 1);
    setGuess("");
    setSubmitted(false);
    setExplanation(null);
    setHintVisible(false);
  }

  const hints = hintForType("DEC_TO_BIN");

  return (
    <section className="card relative">
      <div className="tile-accent bg-[var(--mint)]" />
      <div className="flex items-center gap-2">
        <span className="text-2xl">🧪</span>
        <h2 className="font-display text-lg font-extrabold">Try it</h2>
      </div>
      <p className="text-base text-[var(--text-muted)] mt-2">
        Convert{" "}
        <span className="font-mono font-black text-[var(--text)] text-lg">{n}</span>{" "}
        (decimal) into binary.
      </p>

      <div className="mt-3 space-y-2">
        <input
          className="input font-mono text-lg"
          placeholder="Enter binary…"
          value={guess}
          onChange={(e) => { setGuess(e.target.value); if (submitted) setSubmitted(false); }}
          onKeyDown={(e) => e.key === "Enter" && !submitted && handleSubmit()}
        />
        <div className="flex gap-2">
          <button
            className="btn-primary flex-1"
            onClick={handleSubmit}
            disabled={!guess.trim() || submitted}
          >
            Check answer
          </button>
          <button
            className={`btn-secondary shrink-0 ${hintVisible ? "!bg-[var(--gold-soft)] !border-[var(--gold)]" : ""}`}
            onClick={() => setHintVisible((v) => !v)}
          >
            💡 Hint
          </button>
        </div>
        <button className="btn-secondary w-full" onClick={newNumber}>
          🎲 New number
        </button>
      </div>

      {/* Hint panel */}
      <AnimatePresence>
        {hintVisible && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 rounded-xl border border-[var(--gold)] bg-[var(--gold-soft)] p-3"
          >
            <p className="text-xs font-extrabold text-[var(--gold-dark)] mb-2">
              💡 How to convert decimal to binary:
            </p>
            <ol className="space-y-1.5">
              {hints.map((hint, i) => (
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

      {/* Feedback + explanation */}
      <AnimatePresence>
        {explanation && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 rounded-xl border p-3 space-y-1.5 ${
              explanation.wasCorrect
                ? "bg-[var(--mint-soft)] border-[#c7e9a2]"
                : "bg-[var(--coral-soft)] border-[#ffc4c4]"
            }`}
          >
            <p className={`text-sm font-extrabold ${explanation.wasCorrect ? "text-[var(--mint-dark)]" : "text-[var(--coral-dark)]"}`}>
              {explanation.wasCorrect
                ? `Correct! ${explanation.number} in binary is ${explanation.answer}.`
                : `Not quite. The answer is ${explanation.answer}. Here is the process:`}
            </p>
            {explanation.lines.map((line, i) => {
              if (line.highlight) {
                return (
                  <div
                    key={i}
                    className={`font-mono font-black text-xs rounded px-2 py-1 ${
                      explanation.wasCorrect
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
                  className={`text-xs ${line.code ? "font-mono bg-white/40 rounded px-1.5 py-0.5" : ""} text-[var(--text-muted)]`}
                >
                  {line.text}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

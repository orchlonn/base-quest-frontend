"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { BASE_LABELS, fromBase as parseBase, toBase as formatBase, type Base } from "@/lib/convert";

const features = [
  {
    title: "Pre-test → Post-test",
    body: "Measure how much you grew with side-by-side scores.",
    color: "mint",
    icon: "📈",
  },
  {
    title: "4 Game Modes",
    body: "From tower defense to memory match — learn by playing.",
    color: "coral",
    icon: "🎮",
  },
  {
    title: "XP, Levels, Badges",
    body: "Climb from Beginner Bit to Conversion Wizard.",
    color: "gold",
    icon: "🏆",
  },
] as const;

type PreviewRow = { label: string; value: string; fromBase: Base; chip: string };

const previewRows: PreviewRow[] = [
  { label: "42 decimal", value: "42", fromBase: 10, chip: "chip-mint" },
  { label: "FF hex", value: "FF", fromBase: 16, chip: "chip-lilac" },
  { label: "1010 binary", value: "1010", fromBase: 2, chip: "chip-sky" },
  { label: "52 octal", value: "52", fromBase: 8, chip: "chip-coral" },
];

const baseOrder: Base[] = [2, 10, 16, 8];

const BASE_DISPLAY: Record<Base, { label: string; bg: string; text: string; border: string }> = {
  2:  { label: "Binary",      bg: "bg-[var(--sky-soft)]",   text: "text-[var(--sky-dark)]",   border: "border-[#bde3fa]" },
  10: { label: "Decimal",     bg: "bg-[var(--mint-soft)]",  text: "text-[var(--mint-dark)]",  border: "border-[#c7e9a2]" },
  16: { label: "Hexadecimal", bg: "bg-[var(--lilac-soft)]", text: "text-[var(--lilac-dark)]", border: "border-[#e2c6ff]" },
  8:  { label: "Octal",       bg: "bg-[var(--coral-soft)]", text: "text-[var(--coral-dark)]", border: "border-[#ffc4c4]" },
};

const colorMap: Record<string, { bar: string; chip: string }> = {
  mint:  { bar: "bg-[var(--mint)]",  chip: "chip-mint" },
  coral: { bar: "bg-[var(--coral)]", chip: "chip-coral" },
  gold:  { bar: "bg-[var(--gold)]",  chip: "chip-gold" },
  lilac: { bar: "bg-[var(--lilac)]", chip: "chip-lilac" },
  sky:   { bar: "bg-[var(--sky)]",   chip: "chip-sky" },
};

export default function Landing() {
  return (
    <div className="space-y-20">
      <section className="grid gap-10 md:grid-cols-2 md:items-center pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-display font-black leading-[1.05] tracking-tight">
            Master{" "}
            <span className="text-[var(--mint)]">binary</span>,{" "}
            <span className="text-[var(--coral)]">hex</span> &amp;{" "}
            <span className="text-[var(--lilac)]">octal</span>{" "}
            by playing.
          </h1>
          <p className="mt-5 text-lg text-[var(--text-muted)] max-w-md">
            BaseQuest turns dry conversion drills into a friendly quest.
            Pre-test, learn, play four arcade-style game modes, then prove
            your growth.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/pre-test" className="btn-primary">
              Start with the pre-test
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Go to dashboard
            </Link>
          </div>
          <p className="mt-4 text-base text-[var(--text-muted)]">
            No accounts. Your progress is saved on this device.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card relative"
        >
          <LiveConversionPanel />
        </motion.div>
      </section>

      <section>
        <h2 className="section-title text-center">Why BaseQuest?</h2>
        <p className="section-sub text-center mt-2">Everything you need to actually enjoy number systems.</p>
        <div className="grid gap-4 md:grid-cols-3 mt-8">
          {features.map((f, i) => {
            const c = colorMap[f.color];
            return (
              <motion.div
                key={f.title}
                className="tile"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className={`tile-accent ${c.bar}`} />
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-3 font-display font-extrabold text-lg">{f.title}</h3>
                <p className="mt-1 text-base text-[var(--text-muted)]">{f.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-[var(--surface-2)] border border-[var(--border)] p-10 text-center">
        <div className="text-5xl mb-3">🚀</div>
        <h2 className="text-2xl md:text-3xl font-display font-black">
          Ready to level up?
        </h2>
        <p className="mt-2 text-[var(--text-muted)]">
          Take the pre-test and the games unlock.
        </p>
        <div className="mt-6">
          <Link href="/pre-test" className="btn-primary">
            Start the pre-test
          </Link>
        </div>
      </section>
    </div>
  );
}

function LiveConversionPanel() {
  const [value, setValue] = useState("42");
  const [inputBase, setInputBase] = useState<Base>(10);

  const allConversions = useMemo<Record<Base, string> | null>(() => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const decimal = parseBase(trimmed, inputBase);
    if (decimal === null) return null;
    return {
      2: formatBase(decimal, 2),
      8: formatBase(decimal, 8),
      10: formatBase(decimal, 10),
      16: formatBase(decimal, 16),
    };
  }, [value, inputBase]);

  return (
    <>
      <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-[var(--mint)] via-[var(--sky)] to-[var(--coral)]" />

      <div className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
        Live conversion
      </div>
      <p className="text-base text-[var(--text)]">
        Enter a number and choose its base — see it in{" "}
        <strong className="font-extrabold">all four number systems</strong> at once.
      </p>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <label className="grid gap-1 text-sm font-bold text-[var(--text-muted)]">
            Number to convert
            <input
              className="input font-mono text-lg"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 42, 1010, or FF"
            />
          </label>
          <label className="grid gap-1 text-sm font-bold text-[var(--text-muted)]">
            It is written in
            <select
              className="input text-base font-bold"
              value={inputBase}
              onChange={(e) => setInputBase(Number(e.target.value) as Base)}
            >
              {baseOrder.map((base) => (
                <option key={base} value={base}>
                  {BASE_LABELS[base]} (base {base})
                </option>
              ))}
            </select>
          </label>
        </div>

        {allConversions !== null ? (
          <div className="grid grid-cols-2 gap-2">
            {baseOrder.map((base) => {
              const d = BASE_DISPLAY[base];
              const isInput = base === inputBase;
              return (
                <div
                  key={base}
                  className={`rounded-2xl border p-3 ${d.bg} ${d.border} ${
                    isInput ? "ring-2 ring-[var(--text)]/20 ring-offset-1" : ""
                  }`}
                >
                  <div className={`text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${d.text}`}>
                    {d.label}
                    {isInput && (
                      <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-bold">
                        input
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-xl font-black break-all leading-tight">
                    {allConversions[base]}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--coral)] bg-[var(--coral-soft)] p-3">
            <p className="text-base font-bold text-[var(--coral-dark)]">
              Invalid {BASE_LABELS[inputBase]} input — check your digits.
            </p>
            <p className="mt-1 text-sm text-[var(--coral-dark)]/80">
              {inputBase === 2 && "Binary only uses 0 and 1."}
              {inputBase === 8 && "Octal only uses digits 0 through 7."}
              {inputBase === 10 && "Decimal only uses digits 0 through 9."}
              {inputBase === 16 && "Hex uses digits 0–9 and letters A–F."}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-muted)]">Try an example:</span>
          {previewRows.map((row) => (
            <button
              key={`${row.value}-${row.fromBase}`}
              className={`chip ${row.chip} cursor-pointer`}
              onClick={() => {
                setValue(row.value);
                setInputBase(row.fromBase);
              }}
            >
              {row.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

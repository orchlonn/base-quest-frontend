"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { BASE_LABELS, convertBase, type Base } from "@/lib/convert";

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

const previewRows = [
  { value: "11010110", fromBase: 2, toBase: 16, chip: "chip-sky" },
  { value: "42", fromBase: 10, toBase: 2, chip: "chip-coral" },
  { value: "FF", fromBase: 16, toBase: 10, chip: "chip-mint" },
  { value: "17", fromBase: 8, toBase: 16, chip: "chip-gold" },
] as const;

const baseOptions: Base[] = [10, 2, 8, 16];

const colorMap: Record<string, { bar: string; chip: string }> = {
  mint: { bar: "bg-[var(--mint)]", chip: "chip-mint" },
  coral: { bar: "bg-[var(--coral)]", chip: "chip-coral" },
  gold: { bar: "bg-[var(--gold)]", chip: "chip-gold" },
  lilac: { bar: "bg-[var(--lilac)]", chip: "chip-lilac" },
  sky: { bar: "bg-[var(--sky)]", chip: "chip-sky" },
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
  const [fromBase, setFromBase] = useState<Base>(10);
  const [toBase, setToBase] = useState<Base>(2);
  const result = useMemo(
    () => convertBase(value, fromBase, toBase),
    [value, fromBase, toBase]
  );
  const cleanedValue = value.trim() || "this value";

  return (
    <>
      <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-[var(--mint)] via-[var(--sky)] to-[var(--coral)]" />
      <div className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        Live conversion
      </div>
      <p className="text-base text-[var(--text-muted)]">
        Convert this value from one base to another.
      </p>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm font-bold text-[var(--text-muted)]">
          Value to convert
          <input
            className="input font-mono text-lg"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Example: 101010"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <BaseSelect
            label="Convert from"
            value={fromBase}
            onChange={setFromBase}
          />
          <BaseSelect label="Convert to" value={toBase} onChange={setToBase} />
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="text-sm font-extrabold text-[var(--text-muted)]">
            Convert {cleanedValue} from {BASE_LABELS[fromBase]} to{" "}
            {BASE_LABELS[toBase]}
          </div>
          <div className="mt-2 font-mono text-3xl font-black break-words">
            {result ?? "Invalid input"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {previewRows.map((row) => {
            const converted = convertBase(row.value, row.fromBase, row.toBase);
            return (
              <button
                key={`${row.value}-${row.fromBase}-${row.toBase}`}
                className={`chip ${row.chip}`}
                onClick={() => {
                  setValue(row.value);
                  setFromBase(row.fromBase);
                  setToBase(row.toBase);
                }}
              >
                {row.value} {BASE_LABELS[row.fromBase]} to {converted ?? "?"}{" "}
                {BASE_LABELS[row.toBase]}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function BaseSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Base;
  onChange: (base: Base) => void;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-[var(--text-muted)]">
      {label}
      <select
        className="input text-base font-bold"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as Base)}
      >
        {baseOptions.map((base) => (
          <option key={base} value={base}>
            {BASE_LABELS[base]} (base {base})
          </option>
        ))}
      </select>
    </label>
  );
}

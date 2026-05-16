"use client";
import Link from "next/link";
import { motion } from "framer-motion";

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
  { from: "11010110", to: "0xD6", chip: "chip-sky" },
  { from: "42", to: "0b101010", chip: "chip-coral" },
  { from: "0xFF", to: "255", chip: "chip-mint" },
  { from: "0o17", to: "0xF", chip: "chip-gold" },
];

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
          <span className="chip chip-mint mb-4">For curious students</span>
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
              Start the quest →
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Go to dashboard
            </Link>
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            No accounts. Your progress is saved on this device.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card relative"
        >
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-[var(--mint)] via-[var(--sky)] to-[var(--coral)]" />
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            live conversions
          </div>
          <div className="grid gap-2 text-sm">
            {previewRows.map((row, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
              >
                <span className={`chip ${row.chip}`}>convert</span>
                <span className="font-mono text-base font-bold text-[var(--text)]">
                  {row.from} <span className="text-[var(--text-muted)]">→</span> {row.to}
                </span>
              </motion.div>
            ))}
          </div>
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
                <p className="mt-1 text-sm text-[var(--text-muted)]">{f.body}</p>
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

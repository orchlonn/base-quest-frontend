"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  { title: "Pre-test → Post-test", body: "Measure how much you grew with side-by-side scores." },
  { title: "4 Game Modes", body: "From tower defense to memory match — learn by playing." },
  { title: "XP, Levels, Badges", body: "Climb from Beginner Bit to Conversion Wizard." },
  { title: "Leaderboards", body: "See where you stand among other students." },
];

export default function Landing() {
  return (
    <div className="space-y-16">
      <section className="grid gap-8 md:grid-cols-2 items-center pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
            Master <span className="text-cyan-300">binary</span>,{" "}
            <span className="text-fuchsia-400">hex</span> &amp;{" "}
            <span className="text-violet-300">octal</span> by playing.
          </h1>
          <p className="mt-5 text-lg opacity-80">
            BaseQuest turns dry conversion drills into a futuristic adventure. Pre-test, learn,
            play four arcade-style game modes, then prove your growth.
          </p>
          <div className="mt-7 flex gap-3">
            <Link href="/register" className="neon-btn">Start the quest</Link>
            <Link href="/login" className="ghost-btn">I already have an account</Link>
          </div>
          <p className="mt-3 text-sm opacity-60">For students. No admins, no clutter — just play.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass p-6 md:p-8"
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { from: "11010110", to: "0xD6", c: "from-cyan-400 to-violet-400" },
              { from: "42", to: "0b101010", c: "from-fuchsia-400 to-pink-400" },
              { from: "0xFF", to: "255", c: "from-emerald-400 to-cyan-400" },
              { from: "0o17", to: "0xF", c: "from-amber-400 to-fuchsia-400" },
            ].map((row, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3 + i * 0.3, repeat: Infinity }}
                className="rounded-xl border border-white/15 bg-black/20 px-4 py-3"
              >
                <div className="text-xs opacity-70">conversion</div>
                <div className={`font-mono text-lg bg-clip-text text-transparent bg-gradient-to-r ${row.c}`}>
                  {row.from} → {row.to}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="glass p-5"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <h3 className="font-display font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm opacity-80">{f.body}</p>
          </motion.div>
        ))}
      </section>

      <section className="glass p-8 text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold">
          Ready to level up?
        </h2>
        <p className="mt-2 opacity-80">Create an account, take the pre-test, and the games unlock.</p>
        <div className="mt-5">
          <Link href="/register" className="neon-btn">Create my account</Link>
        </div>
      </section>
    </div>
  );
}

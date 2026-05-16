"use client";
import { recordGameScore } from "@/lib/local-progress";
import { generateProblem } from "@/lib/convert";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Enemy = {
  id: number;
  problem: ReturnType<typeof generateProblem>;
  progress: number;
  hp: number;
};

export default function TowerDefense() {
  const [running, setRunning] = useState(false);
  const [baseHp, setBaseHp] = useState(100);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [guess, setGuess] = useState("");
  const [flash, setFlash] = useState<"hit" | "miss" | null>(null);
  const [saved, setSaved] = useState(false);
  const nextId = useRef(1);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawn = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => {
      setEnemies((es) => {
        const moved = es.map((e) => ({
          ...e,
          progress: e.progress + 3 + Math.random() * 1.5,
        }));
        const survivors: Enemy[] = [];
        let damage = 0;
        for (const e of moved) {
          if (e.progress >= 100) damage += 15;
          else survivors.push(e);
        }
        if (damage > 0) setBaseHp((h) => Math.max(0, h - damage));
        return survivors;
      });
    }, 600);
    spawn.current = setInterval(() => {
      setEnemies((es) =>
        es.length >= 4
          ? es
          : [
              ...es,
              {
                id: nextId.current++,
                problem: generateProblem("MEDIUM"),
                progress: 0,
                hp: 1,
              },
            ]
      );
    }, 2000);
    return () => {
      if (tick.current) clearInterval(tick.current);
      if (spawn.current) clearInterval(spawn.current);
    };
  }, [running]);

  useEffect(() => {
    if (running && baseHp <= 0) setRunning(false);
  }, [baseHp, running]);

  useEffect(() => {
    if (!running && score > 0 && !saved && baseHp <= 0) {
      recordGameScore({
        mode: "TOWER_DEFENSE",
        score,
        streakMax: maxStreak,
        meta: { baseHpRemaining: baseHp },
      });
      setSaved(true);
    }
  }, [running, score, maxStreak, saved, baseHp]);

  function start() {
    setBaseHp(100);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setEnemies([]);
    setGuess("");
    setSaved(false);
    setRunning(true);
  }

  function submit() {
    if (!running || enemies.length === 0) return;
    const sorted = [...enemies].sort((a, b) => b.progress - a.progress);
    const target = sorted[0];
    const ok = guess.trim().toUpperCase() === target.problem.answer.toUpperCase();
    if (ok) {
      setEnemies((es) => es.filter((e) => e.id !== target.id));
      setScore((s) => s + 20);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));
      setFlash("hit");
    } else {
      setStreak(0);
      setBaseHp((h) => Math.max(0, h - 5));
      setFlash("miss");
    }
    setGuess("");
    setTimeout(() => setFlash(null), 250);
  }

  const target = [...enemies].sort((a, b) => b.progress - a.progress)[0];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <span className="chip chip-coral">🏰 Tower Defense</span>
        <h1 className="text-2xl md:text-3xl font-display font-black mt-3">
          Defend your base
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Type the answer to the closest enemy. Wrong answers cost 5 HP.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="chip chip-coral !py-2 flex-1 justify-center min-w-[120px]">
          ❤️ {baseHp} HP
        </div>
        <div className="chip chip-gold !py-2 flex-1 justify-center min-w-[120px]">
          ⭐ {score}
        </div>
        <div className="chip chip-sky !py-2 flex-1 justify-center min-w-[120px]">
          🔥 {streak}
        </div>
        {!running && (
          <button className="btn-primary" onClick={start}>
            {score === 0 ? "Start" : baseHp <= 0 ? "Play again" : "Resume"}
          </button>
        )}
      </div>

      {/* Base HP bar */}
      <div
        className="h-3 rounded-full overflow-hidden border-2 bg-white"
        style={{ borderColor: "var(--border)" }}
      >
        <motion.div
          className="h-full"
          style={{
            background: baseHp > 50 ? "var(--mint)" : baseHp > 20 ? "var(--gold)" : "var(--coral)",
          }}
          animate={{ width: `${baseHp}%` }}
        />
      </div>

      {/* Battlefield */}
      <div
        className="rounded-2xl border border-[var(--border)] bg-[var(--mint-soft)] relative h-64 overflow-hidden"
        style={{ boxShadow: "0 2px 0 var(--border-strong)" }}
      >
        {/* lane bands */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 bg-white/50" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[var(--border-strong)] opacity-50" />

        {/* Base / castle on the right */}
        <div className="absolute inset-y-0 right-0 w-16 grid place-items-center text-4xl bg-[var(--sky-soft)] border-l-4 border-[var(--sky)]">
          🏰
        </div>

        <AnimatePresence>
          {enemies.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, left: `${Math.min(85, e.progress)}%` }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ ease: "linear", duration: 0.6 }}
              className={`absolute top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 font-mono text-sm font-bold border-2 bg-white ${
                target?.id === e.id
                  ? "border-[var(--coral)] text-[var(--coral-dark)] shadow-press-coral"
                  : "border-[var(--border)] text-[var(--text)] shadow-card"
              }`}
              style={{ left: `${Math.min(85, e.progress)}%` }}
            >
              👾 {e.problem.prompt}
            </motion.div>
          ))}
        </AnimatePresence>

        {flash && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`absolute inset-0 pointer-events-none ${
              flash === "hit" ? "bg-[var(--mint)]/30" : "bg-[var(--coral)]/30"
            }`}
          />
        )}
      </div>

      {/* Targeting input */}
      <div className="card">
        <div className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">
          Target
        </div>
        <div className="font-mono text-xl font-bold mt-1">
          {target ? target.problem.prompt : "—"}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            className="input font-mono"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Answer"
            disabled={!running}
          />
          <button className="btn-coral" onClick={submit} disabled={!running}>
            Fire
          </button>
        </div>
      </div>

      {!running && baseHp <= 0 && (
        <div className="card text-center">
          <div className="text-5xl mb-2">💥</div>
          <div className="text-lg font-bold">Base destroyed!</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">
            Final score: <b className="text-[var(--text)]">{score}</b> · Best streak {maxStreak}
          </div>
          {saved && (
            <p className="mt-2 text-xs text-[var(--text-muted)]">Saved to your profile.</p>
          )}
        </div>
      )}
    </div>
  );
}

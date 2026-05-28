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
  lane: number;
};

const LANES = [13, 36, 59, 82];
const MAX_ENEMIES = LANES.length;

export default function TowerDefense() {
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
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
          progress: e.progress + 1.4 + Math.random() * 0.7,
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
      setEnemies((es) => {
        if (es.length >= MAX_ENEMIES) return es;
        const occupied = new Set(es.map((e) => e.lane));
        const lane = LANES.findIndex((_, index) => !occupied.has(index));
        if (lane === -1) return es;
        return [
          ...es,
          {
            id: nextId.current++,
            problem: generateProblem("MEDIUM"),
            progress: 0,
            hp: 1,
            lane,
          },
        ];
      });
    }, 2600);
    return () => {
      if (tick.current) clearInterval(tick.current);
      if (spawn.current) clearInterval(spawn.current);
    };
  }, [running]);

  useEffect(() => {
    if (running && baseHp <= 0) {
      setRunning(false);
      setGameOver(true);
    }
  }, [baseHp, running]);

  useEffect(() => {
    if (gameOver && score > 0 && !saved) {
      recordGameScore({
        mode: "TOWER_DEFENSE",
        score,
        streakMax: maxStreak,
        meta: { baseHpRemaining: 0 },
      });
      setSaved(true);
    }
  }, [gameOver, score, maxStreak, saved]);

  function start() {
    setBaseHp(100);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setEnemies([]);
    setGuess("");
    setSaved(false);
    setGameOver(false);
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
        <p className="text-base text-[var(--text-muted)] mt-1">
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
        {!running && !gameOver && (
          <button className="btn-primary" onClick={start}>
            {score === 0 ? "Start" : "Resume"}
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
        className="rounded-2xl border border-[var(--border)] bg-[var(--mint-soft)] relative h-80 overflow-hidden"
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
              animate={{
                opacity: 1,
                left: `${Math.min(76, e.progress)}%`,
                top: `${LANES[e.lane]}%`,
              }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ ease: "linear", duration: 0.6 }}
              className={`absolute w-[130px] -translate-y-1/2 rounded-xl px-2.5 py-2 border-2 bg-white ${
                target?.id === e.id
                  ? "border-[var(--coral)] shadow-press-coral"
                  : "border-[var(--border)] shadow-card"
              }`}
              style={{
                left: `${Math.min(76, e.progress)}%`,
                top: `${LANES[e.lane]}%`,
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] leading-none">
                {e.problem.sourceLabel.slice(0, 3)} → {e.problem.targetLabel.slice(0, 3)}
              </div>
              <div className={`font-mono text-sm font-extrabold mt-0.5 truncate ${target?.id === e.id ? "text-[var(--coral-dark)]" : "text-[var(--text)]"}`}>
                👾 {e.problem.display}
              </div>
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

        {/* Game over overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 20 }}
                className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl border-2 border-[var(--coral)]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  className="text-6xl mb-3"
                >
                  💥
                </motion.div>
                <h2 className="font-display text-2xl font-black text-[var(--coral-dark)]">
                  Base Destroyed!
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1 mb-4">
                  The enemies broke through your defenses.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2">
                    <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Score</div>
                    <div className="font-display text-xl font-black">{score}</div>
                  </div>
                  <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2">
                    <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Best Streak</div>
                    <div className="font-display text-xl font-black">{maxStreak}</div>
                  </div>
                </div>

                {saved && (
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    Score saved to your profile.
                  </p>
                )}

                <button className="btn-primary w-full" onClick={start}>
                  Play again
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Targeting input */}
      <div className="card">
        <div className="text-sm uppercase tracking-wider font-bold text-[var(--text-muted)]">
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

    </div>
  );
}

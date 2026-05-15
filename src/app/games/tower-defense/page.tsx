"use client";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { generateProblem } from "@/lib/convert";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Enemy = { id: number; problem: ReturnType<typeof generateProblem>; progress: number; hp: number };

export default function TowerDefense() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
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
        const moved = es.map((e) => ({ ...e, progress: e.progress + 3 + Math.random() * 1.5 }));
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
        es.length >= 4 ? es : [...es, { id: nextId.current++, problem: generateProblem("MEDIUM"), progress: 0, hp: 1 }]
      );
    }, 2000);
    return () => {
      if (tick.current) clearInterval(tick.current);
      if (spawn.current) clearInterval(spawn.current);
    };
  }, [running]);

  useEffect(() => {
    if (running && baseHp <= 0) {
      setRunning(false);
    }
  }, [baseHp, running]);

  useEffect(() => {
    if (!running && score > 0 && !saved && baseHp <= 0) {
      api("/game/score", {
        method: "POST",
        body: JSON.stringify({
          mode: "TOWER_DEFENSE",
          score,
          streakMax: maxStreak,
          meta: { baseHpRemaining: baseHp },
        }),
      })
        .then(() => setSaved(true))
        .catch(console.error);
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
    // Target the nearest-to-base enemy
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
    <div className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-2xl font-display font-bold">Tower Defense Conversion</h1>
      <p className="opacity-75 text-sm">Type the answer to the closest enemy to defend your base.</p>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="chip">Base HP: {baseHp}</span>
        <span className="chip">Score: {score}</span>
        <span className="chip">🔥 {streak}</span>
        <span className="ml-auto">
          {!running ? (
            <button className="neon-btn" onClick={start}>
              {score === 0 ? "Start" : baseHp <= 0 ? "Play again" : "Resume"}
            </button>
          ) : null}
        </span>
      </div>

      <div className="glass p-4 relative h-64 overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-2 bg-cyan-400/60" />
        <div className="absolute inset-y-0 right-2 w-12 grid place-items-center text-xs">🏰</div>

        <AnimatePresence>
          {enemies.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, left: `${Math.min(95, e.progress)}%` }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ ease: "linear", duration: 0.6 }}
              className={`absolute top-1/2 -translate-y-1/2 rounded-lg border px-3 py-2 font-mono text-sm ${
                target?.id === e.id ? "border-fuchsia-300 bg-fuchsia-400/10 shadow-glow-pink" : "border-white/15 bg-white/5"
              }`}
              style={{ left: `${Math.min(95, e.progress)}%` }}
            >
              👾 {e.problem.prompt}
            </motion.div>
          ))}
        </AnimatePresence>

        {flash && (
          <div
            className={`absolute inset-0 pointer-events-none ${
              flash === "hit" ? "bg-emerald-400/10" : "bg-rose-400/10"
            }`}
          />
        )}
      </div>

      <div className="glass p-4">
        <div className="text-xs opacity-70">Target:</div>
        <div className="font-mono">{target ? target.problem.prompt : "—"}</div>
        <div className="mt-2 flex gap-2">
          <input
            className="input font-mono"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Answer"
            disabled={!running}
          />
          <button className="neon-btn" onClick={submit} disabled={!running}>Fire</button>
        </div>
      </div>

      {!running && baseHp <= 0 && (
        <div className="glass p-4 text-center">
          <div className="text-lg">Base destroyed! Final score: <b>{score}</b> · Best streak {maxStreak}</div>
          {saved && <p className="mt-1 text-xs opacity-70">Saved to your profile.</p>}
        </div>
      )}
    </div>
  );
}

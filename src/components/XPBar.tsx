"use client";
import { motion } from "framer-motion";

export function XPBar({
  xp,
  current,
  next,
  level,
}: {
  xp: number;
  current: number;
  next: number;
  level: number;
}) {
  const pct = Math.max(0, Math.min(100, ((xp - current) / Math.max(1, next - current)) * 100));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1 opacity-80">
        <span>Level {level}</span>
        <span>
          {xp} / {next} XP
        </span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden border border-white/15">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-500"
        />
      </div>
    </div>
  );
}

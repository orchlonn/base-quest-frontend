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
  const pct = Math.max(
    0,
    Math.min(100, ((xp - current) / Math.max(1, next - current)) * 100)
  );
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="inline-flex items-center gap-2 text-sm font-extrabold text-[var(--text)]">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full text-white text-xs bg-[var(--gold)]">
            {level}
          </span>
          Level {level}
        </span>
        <span className="text-xs font-bold text-[var(--text-muted)]">
          {xp} / {next} XP
        </span>
      </div>
      <div
        className="h-4 rounded-full overflow-hidden border-2"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(180deg, #76e000 0%, var(--mint) 60%, var(--mint-dark) 100%)",
            boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.1)",
          }}
        />
      </div>
    </div>
  );
}

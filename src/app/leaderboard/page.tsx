"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type Row = {
  rank: number;
  userId: string;
  username: string;
  level: number;
  rankCode: string;
  totalXp: number;
};

const RANK_TITLES: Record<string, string> = {
  BEGINNER_BIT: "Beginner Bit",
  BINARY_EXPLORER: "Binary Explorer",
  HEX_HERO: "Hex Hero",
  CONVERSION_WIZARD: "Conversion Wizard",
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    api<Row[]>("/leaderboard", { auth: false }).then(setRows).catch(console.error);
  }, []);
  return (
    <div>
      <h1 className="text-3xl font-display font-bold">Leaderboard</h1>
      <p className="opacity-75 mt-1">All-time top students by total XP.</p>

      <div className="glass mt-5 overflow-hidden">
        <div className="grid grid-cols-12 text-xs uppercase tracking-wider opacity-70 px-4 py-3 border-b border-white/10">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-4">Rank</div>
          <div className="col-span-2 text-right">XP</div>
        </div>
        {!rows && <p className="p-4 opacity-70">Loading…</p>}
        {rows?.length === 0 && <p className="p-4 opacity-70">No scores yet. Be the first!</p>}
        {rows?.map((r) => (
          <div key={r.userId} className="grid grid-cols-12 items-center px-4 py-3 border-b border-white/5">
            <div className="col-span-1 font-mono">{r.rank}</div>
            <div className="col-span-5">
              <div className="font-semibold">@{r.username}</div>
              <div className="text-xs opacity-70">Level {r.level}</div>
            </div>
            <div className="col-span-4 text-sm">{RANK_TITLES[r.rankCode] ?? r.rankCode}</div>
            <div className="col-span-2 text-right font-mono">{r.totalXp}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

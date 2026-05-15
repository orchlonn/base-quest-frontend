"use client";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function NavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-black/20 border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={user ? "/dashboard" : "/"} className="font-display text-xl font-bold tracking-wide">
          <span className="text-cyan-300">Base</span>
          <span className="text-fuchsia-400">Quest</span>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className="ghost-btn !px-3 !py-2 text-sm">Dashboard</Link>
              <Link href="/lessons" className="ghost-btn !px-3 !py-2 text-sm">Lessons</Link>
              <Link href="/games" className="ghost-btn !px-3 !py-2 text-sm">Games</Link>
              <Link href="/leaderboard" className="ghost-btn !px-3 !py-2 text-sm">Leaderboard</Link>
              <ThemeToggle />
              <button
                className="ghost-btn !px-3 !py-2 text-sm"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="ghost-btn !px-3 !py-2 text-sm">Sign in</Link>
              <Link href="/register" className="neon-btn !px-3 !py-2 text-sm">Start playing</Link>
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

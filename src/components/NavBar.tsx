"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/lessons", label: "Lessons" },
  { href: "/games", label: "Games" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link
          href="/"
          className="font-display text-2xl font-black tracking-tight"
          aria-label="BaseQuest home"
        >
          <span className="text-[var(--mint)]">Base</span>
          <span className="text-[var(--coral)]">Quest</span>
          <span className="text-[var(--gold)]">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-[var(--mint-soft)] text-[var(--mint-dark)]"
                    : "text-[var(--text)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="md:hidden mx-auto max-w-6xl px-4 pb-2 flex gap-1 overflow-x-auto">
        {NAV_LINKS.map((l) => {
          const active =
            pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
                active
                  ? "bg-[var(--mint-soft)] text-[var(--mint-dark)]"
                  : "text-[var(--text)] bg-[var(--surface-2)]"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

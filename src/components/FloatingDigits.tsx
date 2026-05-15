"use client";
import { useEffect, useMemo, useState } from "react";

export function FloatingDigits({ count = 28 }: { count?: number }) {
  // Avoid SSR hydration mismatch: only render after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      key: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 12,
      char: Math.random() > 0.5 ? "1" : "0",
      size: 12 + Math.floor(Math.random() * 10),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, mounted]);

  if (!mounted) return null;

  return (
    <div className="floating-digits" aria-hidden>
      {items.map((it) => (
        <span
          key={it.key}
          style={{
            left: `${it.left}%`,
            animationDelay: `${it.delay}s`,
            animationDuration: `${it.duration}s`,
            fontSize: `${it.size}px`,
          }}
        >
          {it.char}
        </span>
      ))}
    </div>
  );
}
